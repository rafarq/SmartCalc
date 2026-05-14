import { getDaysInMonth } from 'date-fns';

const MESES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
};

const UNIT_SECONDS: Record<string, number> = {
  segundos: 1, segundo: 1, s: 1, seg: 1,
  minutos: 60, minuto: 60, min: 60,
  horas: 3600, hora: 3600, h: 3600,
  días: 86400, dias: 86400, día: 86400, dia: 86400,
  semanas: 604800, semana: 604800,
};

const WORD = '[a-záéíóúüñ]+';
const RE_TIME_A_EN_B = new RegExp(`^(\\d+(?:\\.\\d+)?)\\s+(${WORD})\\s+(?:en|a)\\s+(${WORD})$`, 'i');
const RE_TIME_INVERTIDO = new RegExp(`^(${WORD})\\s+en\\s+(\\d+(?:\\.\\d+)?)\\s+(${WORD})$`, 'i');
const RE_DAYS_IN_MONTH = new RegExp(`^d[ií]as\\s+en\\s+(${WORD})(?:\\s+de\\s+(\\d{4}))?$`, 'i');

export type NaturalConversion = { value: number; unit: string };

export function tryNaturalConversion(line: string): NaturalConversion | null {
  const t = line.trim();

  let m = t.match(RE_DAYS_IN_MONTH);
  if (m) {
    const monthIdx = MESES[m[1].toLowerCase()];
    if (monthIdx === undefined) return null;
    const year = m[2] ? parseInt(m[2], 10) : new Date().getFullYear();
    return { value: getDaysInMonth(new Date(year, monthIdx, 1)), unit: 'días' };
  }

  m = t.match(RE_TIME_A_EN_B);
  if (m) {
    const value = parseFloat(m[1]);
    const fromSec = UNIT_SECONDS[m[2].toLowerCase()];
    const toSec = UNIT_SECONDS[m[3].toLowerCase()];
    if (fromSec && toSec) return { value: (value * fromSec) / toSec, unit: m[3] };
  }

  m = t.match(RE_TIME_INVERTIDO);
  if (m) {
    const fromSec = UNIT_SECONDS[m[1].toLowerCase()];
    const value = parseFloat(m[2]);
    const toSec = UNIT_SECONDS[m[3].toLowerCase()];
    if (fromSec && toSec) return { value: (value * toSec) / fromSec, unit: m[1] };
  }

  return null;
}
