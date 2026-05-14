import { addDays, startOfDay } from 'date-fns';

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
