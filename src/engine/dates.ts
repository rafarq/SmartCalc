import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  differenceInDays,
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

const RE_DDMMYYYY = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/;
const RE_DD_DE_MES = /^(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?$/i;
const RE_NEXT_DAY = /^(?:próximo|proximo|siguiente)\s+([a-záéíóú]+)$/i;
const RE_DAY_QUE_VIENE = /^([a-záéíóú]+)\s+que\s+viene$/i;

function normalizeYear(y: number): number {
  if (y < 100) return y + 2000;
  return y;
}

export function parseSpanishDate(input: string, ref: Date = new Date()): Date | null {
  const today = startOfDay(ref);
  const t = input.trim().toLowerCase();

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
const RE_ENTRE = /^d[ií]as\s+entre\s+(.+?)\s+y\s+(.+?)$/i;
const RE_LAB_PLUS = /^(.+?)\s+\+\s+(\d+)\s+d[ií]as?\s+laborables?(?:\s+en\s+([a-záéíóúñ\s-]+))?$/i;
const RE_LAB_ENTRE = /^d[ií]as\s+laborables?\s+entre\s+(.+?)\s+y\s+(.+?)(?:\s+en\s+([a-záéíóúñ\s-]+))?$/i;

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
  const single = parseSpanishDate(t, ref);
  if (single) return { value: single, formatted: formatDate(single) };
  return null;
}
