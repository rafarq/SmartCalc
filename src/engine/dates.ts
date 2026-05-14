import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInDays,
  differenceInMonths,
  format,
  startOfDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { addWorkingDays, workingDaysBetween, REGION_MAP } from './holidays';

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, setiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const DIAS_SEMANA: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  miércoles: 3, miercoles: 3,
  jueves: 4,
  viernes: 5,
  sábado: 6, sabado: 6,
};

const ORDINALES: Record<string, number> = {
  primer: 1, primero: 1, primera: 1,
  segundo: 2, segunda: 2,
  tercer: 3, tercero: 3, tercera: 3,
  cuarto: 4, cuarta: 4,
  quinto: 5, quinta: 5,
  último: -1, ultimo: -1, última: -1, ultima: -1,
};
const ORDINAL_KEYS = Object.keys(ORDINALES).join('|');

const RE_DDMMYYYY = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/;
const RE_DD_DE_MES = /^(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?$/i;
const RE_NEXT_DAY = /^(?:próximo|proximo|siguiente)\s+([a-záéíóú]+)$/i;
const RE_DAY_QUE_VIENE = /^([a-záéíóú]+)\s+que\s+viene$/i;
const RE_ORDINAL_DAY = new RegExp(
  String.raw`^(${ORDINAL_KEYS})\s+([a-záéíóú]+)\s+de(?:l)?\s+(.+)$`,
  'i',
);

function parseMonthSpec(spec: string, ref: Date): { year: number; month: number } | null {
  const t = spec.trim().toLowerCase();
  const now = ref;
  if (t === 'mes' || t === 'este mes') {
    return { year: now.getFullYear(), month: now.getMonth() };
  }
  if (
    /^(?:mes\s+que\s+viene|próximo\s+mes|proximo\s+mes|mes\s+próximo|mes\s+proximo|siguiente\s+mes)$/.test(t)
  ) {
    const d = addMonths(now, 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  if (/^(?:mes\s+pasado|mes\s+anterior|mes\s+previo)$/.test(t)) {
    const d = addMonths(now, -1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }
  const m = t.match(/^([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?$/);
  if (m) {
    const mo = MESES[m[1]];
    if (mo === undefined) return null;
    return { year: m[2] ? parseInt(m[2], 10) : now.getFullYear(), month: mo };
  }
  return null;
}

function nthDayOfMonth(year: number, month: number, dow: number, n: number): Date | null {
  if (n === -1) {
    const lastDay = new Date(year, month + 1, 0);
    const diff = (lastDay.getDay() - dow + 7) % 7;
    return new Date(year, month, lastDay.getDate() - diff);
  }
  const first = new Date(year, month, 1);
  const diff = (dow - first.getDay() + 7) % 7;
  const day = 1 + diff + (n - 1) * 7;
  const candidate = new Date(year, month, day);
  if (candidate.getMonth() !== month) return null; // p. ej. quinto lunes inexistente
  return candidate;
}

function normalizeYear(y: number): number {
  if (y < 100) return y + 2000;
  return y;
}

export function parseSpanishDate(input: string, ref: Date = new Date()): Date | null {
  const today = startOfDay(ref);
  // Admite artículo opcional al inicio: "el miércoles que viene", "la próxima semana"…
  const t = input.trim().toLowerCase().replace(/^(?:el|la|los|las)\s+/, '');

  if (t === 'hoy') return today;
  if (t === 'ayer') return addDays(today, -1);
  if (t === 'mañana' || t === 'manana') return addDays(today, 1);

  let m;
  if ((m = t.match(RE_DDMMYYYY))) {
    const d = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const y = m[3] ? normalizeYear(parseInt(m[3], 10)) : today.getFullYear();
    return new Date(y, mo, d);
  }
  if ((m = t.match(RE_DD_DE_MES))) {
    const d = parseInt(m[1], 10);
    const mo = MESES[m[2]];
    if (mo === undefined) return null;
    const y = m[3] ? parseInt(m[3], 10) : today.getFullYear();
    return new Date(y, mo, d);
  }
  if ((m = t.match(RE_ORDINAL_DAY))) {
    const n = ORDINALES[m[1]];
    const dow = DIAS_SEMANA[m[2]];
    if (n === undefined || dow === undefined) return null;
    const mspec = parseMonthSpec(m[3], today);
    if (!mspec) return null;
    return nthDayOfMonth(mspec.year, mspec.month, dow, n);
  }
  if ((m = t.match(RE_NEXT_DAY)) || (m = t.match(RE_DAY_QUE_VIENE))) {
    const target = DIAS_SEMANA[m[1]];
    if (target === undefined) return null;
    const diff = ((target - today.getDay() + 7) % 7) || 7;
    return addDays(today, diff);
  }
  return null;
}

const UNIT_RE = String.raw`d[ií]as?|semanas?|mes(?:es)?|años?|anios?`;
const RE_HACE = new RegExp(String.raw`^hace\s+(\d+)\s+(${UNIT_RE})$`, 'i');
const RE_DENTRO = new RegExp(String.raw`^dentro\s+de\s+(\d+)\s+(${UNIT_RE})$`, 'i');
const RE_OP_FECHA = new RegExp(
  String.raw`^(.+?)\s+([+-])\s+(\d+)\s+(${UNIT_RE})$`,
  'i',
);
const RE_ENTRE = /^(?:cu[aá]ntos\s+)?d[ií]as\s+(?:hay\s+)?entre\s+(.+?)\s+y\s+(.+?)$/i;
const RE_LAB_PLUS = /^(.+?)\s+\+\s+(\d+)\s+d[ií]as?\s+laborables?(?:\s+en\s+([a-záéíóúñ\s-]+))?$/i;
const RE_LAB_ENTRE = /^(?:cu[aá]ntos\s+)?d[ií]as\s+laborables?\s+(?:hay\s+)?entre\s+(.+?)\s+y\s+(.+?)(?:\s+en\s+([a-záéíóúñ\s-]+))?$/i;
const RE_SEM_DIAS = /^(?:cu[aá]ntas?\s+)?semanas\s+y\s+d[ií]as\s+(?:hay\s+)?entre\s+(.+?)\s+y\s+(.+?)$/i;
const RE_MES_DIAS = /^(?:cu[aá]ntos\s+)?meses\s+y\s+d[ií]as\s+(?:hay\s+)?entre\s+(.+?)\s+y\s+(.+?)$/i;

function addUnit(date: Date, n: number, unit: string): Date {
  const u = unit.toLowerCase();
  if (u.startsWith('día') || u.startsWith('dia')) return addDays(date, n);
  if (u.startsWith('semana')) return addWeeks(date, n);
  if (u.startsWith('mes')) return addMonths(date, n);
  if (u.startsWith('año') || u.startsWith('anio') || u.startsWith('ano')) return addYears(date, n);
  return date;
}

function formatDate(d: Date): string {
  return format(d, 'dd/MM/yyyy', { locale: es });
}

export type DateExpressionResult = { value: Date | number; formatted: string };

export function tryDateExpression(
  line: string,
  ref: Date = new Date(),
): DateExpressionResult | null {
  const t = line.trim();
  let m;

  if ((m = t.match(RE_HACE))) {
    const n = parseInt(m[1], 10);
    const d = addUnit(startOfDay(ref), -n, m[2]);
    return { value: d, formatted: formatDate(d) };
  }
  if ((m = t.match(RE_DENTRO))) {
    const n = parseInt(m[1], 10);
    const d = addUnit(startOfDay(ref), n, m[2]);
    return { value: d, formatted: formatDate(d) };
  }
  if ((m = t.match(RE_OP_FECHA))) {
    const base = parseSpanishDate(m[1], ref);
    if (!base) return null;
    const sign = m[2] === '+' ? 1 : -1;
    const d = addUnit(base, sign * parseInt(m[3], 10), m[4]);
    return { value: d, formatted: formatDate(d) };
  }
  if ((m = t.match(RE_ENTRE))) {
    const a = parseSpanishDate(m[1], ref);
    const b = parseSpanishDate(m[2], ref);
    if (!a || !b) return null;
    const days = differenceInDays(b, a);
    return { value: days, formatted: `${days} días` };
  }
  if ((m = t.match(RE_LAB_PLUS))) {
    const base = parseSpanishDate(m[1], ref);
    if (!base) return null;
    const region = m[3] ? REGION_MAP[m[3].trim().toLowerCase()] : undefined;
    const d = addWorkingDays(base, parseInt(m[2], 10), region);
    return { value: d, formatted: formatDate(d) };
  }
  if ((m = t.match(RE_LAB_ENTRE))) {
    const a = parseSpanishDate(m[1], ref);
    const b = parseSpanishDate(m[2], ref);
    if (!a || !b) return null;
    const region = m[3] ? REGION_MAP[m[3].trim().toLowerCase()] : undefined;
    const n = workingDaysBetween(a, b, region);
    return { value: n, formatted: `${n} d. laborables` };
  }
  if ((m = t.match(RE_SEM_DIAS))) {
    const a = parseSpanishDate(m[1], ref);
    const b = parseSpanishDate(m[2], ref);
    if (!a || !b) return null;
    const total = differenceInDays(b, a);
    const sign = total < 0 ? -1 : 1;
    const abs = Math.abs(total);
    const weeks = Math.floor(abs / 7);
    const days = abs % 7;
    return {
      value: total,
      formatted: `${sign < 0 ? '-' : ''}${weeks} sem. y ${days} d.`,
    };
  }
  if ((m = t.match(RE_MES_DIAS))) {
    const a = parseSpanishDate(m[1], ref);
    const b = parseSpanishDate(m[2], ref);
    if (!a || !b) return null;
    const months = differenceInMonths(b, a);
    const tail = addMonths(a, months);
    const days = differenceInDays(b, tail);
    return { value: months, formatted: `${months} meses y ${days} d.` };
  }
  const single = parseSpanishDate(t, ref);
  if (single) return { value: single, formatted: formatDate(single) };
  return null;
}
