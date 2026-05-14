import Holidays from 'date-holidays';
import { REGION_MAP } from './regionMap';

export type Scope = 'national' | 'regional' | 'local';

export type DayHoliday = {
  date: string; // 'YYYY-MM-DD'
  name: string;
  scope: Scope;
};

// Capitales con subdivisión propia en date-holidays para festivos locales.
// Hoy por hoy, en España solo Barcelona está cubierta a nivel ciudad por la lib.
const CITY_SUBDIVISION: Record<string, string> = {
  barcelona: 'B',
};

function toIsoDate(rawDate: string): string {
  // date-holidays devuelve "YYYY-MM-DD HH:mm:ss"; nos quedamos con la fecha.
  return rawDate.slice(0, 10);
}

function isPublic(h: { type?: string }): boolean {
  return !h.type || h.type === 'public' || h.type === 'bank';
}

export type CityHolidaysResult = {
  city: string;
  ccaa: string;
  year: number;
  holidays: DayHoliday[];
  hasLocal: boolean;
};

export function getCityHolidays(city: string, year: number): CityHolidaysResult | null {
  const key = city.trim().toLowerCase();
  const ccaa = REGION_MAP[key];
  if (!ccaa) return null;

  const nat = new Holidays('ES').getHolidays(year).filter(isPublic);
  const reg = new Holidays('ES', ccaa).getHolidays(year).filter(isPublic);

  const subdiv = CITY_SUBDIVISION[key];
  const loc = subdiv ? new Holidays('ES', ccaa, subdiv).getHolidays(year).filter(isPublic) : reg;

  const natDates = new Set(nat.map((h) => toIsoDate(h.date)));
  const regDates = new Set(reg.map((h) => toIsoDate(h.date)));

  // Indexamos por fecha para poder distinguir el ámbito.
  const byDate = new Map<string, DayHoliday>();
  for (const h of nat) {
    const d = toIsoDate(h.date);
    byDate.set(d, { date: d, name: h.name, scope: 'national' });
  }
  for (const h of reg) {
    const d = toIsoDate(h.date);
    if (natDates.has(d)) continue; // ya marcado como nacional
    byDate.set(d, { date: d, name: h.name, scope: 'regional' });
  }
  for (const h of loc) {
    const d = toIsoDate(h.date);
    if (natDates.has(d) || regDates.has(d)) continue;
    byDate.set(d, { date: d, name: h.name, scope: 'local' });
  }

  const holidays = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  return { city, ccaa, year, holidays, hasLocal: !!subdiv };
}

// Devuelve las claves canónicas (con acentos cuando existan) para el selector.
// REGION_MAP tiene tanto "málaga" como "malaga" para tolerancia; en el desplegable
// solo queremos una entrada por ciudad.
export function cityList(): string[] {
  const keys = Object.keys(REGION_MAP);
  const strip = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const groups = new Map<string, string[]>();
  for (const k of keys) {
    const base = strip(k);
    const list = groups.get(base) ?? [];
    list.push(k);
    groups.set(base, list);
  }
  const canonical: string[] = [];
  for (const variants of groups.values()) {
    // Preferimos la variante con acentos (la que difiere de strip(k) === k).
    const withAccent = variants.find((v) => strip(v) !== v);
    canonical.push(withAccent ?? variants[0]);
  }
  return canonical.sort((a, b) => a.localeCompare(b, 'es'));
}
