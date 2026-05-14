import { create, all, type MathJsInstance } from 'mathjs';

const math: MathJsInstance = create(all, { number: 'number' });

// Diccionario de unidades en español (siempre en minúscula) → expresión mathjs.
const UNIT_MAP: Record<string, string> = {
  // Longitud
  m: 'm', km: 'km', cm: 'cm', mm: 'mm',
  pulgada: 'inch', pulgadas: 'inch',
  pie: 'foot', pies: 'foot',
  yarda: 'yard', yardas: 'yard',
  milla: 'mile', millas: 'mile',
  // Masa
  kg: 'kg', g: 'g', mg: 'mg',
  lb: 'lbm', libra: 'lbm', libras: 'lbm',
  oz: 'oz', onza: 'oz', onzas: 'oz',
  tonelada: 'ton', toneladas: 'ton',
  // Tiempo
  s: 's', seg: 's', segundo: 's', segundos: 's',
  min: 'minute', minuto: 'minute', minutos: 'minute',
  h: 'hour', hora: 'hour', horas: 'hour',
  dia: 'day', día: 'day', dias: 'day', días: 'day',
  semana: 'week', semanas: 'week',
  mes: 'month', meses: 'month',
  año: 'year', años: 'year', anio: 'year', anios: 'year',
  // Temperatura
  celsius: 'degC', '°c': 'degC',
  fahrenheit: 'degF', '°f': 'degF',
  kelvin: 'K', k: 'K',
  // Área
  m2: 'm^2', km2: 'km^2', cm2: 'cm^2', mm2: 'mm^2', ft2: 'ft^2',
  acre: 'acre', acres: 'acre',
  ha: 'hectare',
  hectarea: 'hectare', hectareas: 'hectare',
  'hectárea': 'hectare', 'hectáreas': 'hectare',
  // Volumen
  m3: 'm^3', cm3: 'cm^3', mm3: 'mm^3',
  l: 'litre', litro: 'litre', litros: 'litre',
  ml: 'mL', cl: 'cL', dl: 'dL',
  galon: 'gallon', galones: 'gallon', 'galón': 'gallon',
  taza: 'cup', tazas: 'cup',
  // Velocidad
  'm/s': 'm/s', 'km/h': 'km/h', mph: 'mph',
  nudo: 'knot', nudos: 'knot',
  // Energía
  j: 'J', kj: 'kJ',
  cal: 'cal', kcal: 'kcal',
  wh: 'Wh', kwh: 'kWh', mwh: 'MWh',
};

// Superíndices Unicode → dígito ASCII para reconocer m², m³, cm⁴, km⁵…
const SUPERSCRIPT: Record<string, string> = {
  '⁰': '0',
  '¹': '1',
  '²': '2',
  '³': '3',
  '⁴': '4',
  '⁵': '5',
  '⁶': '6',
  '⁷': '7',
  '⁸': '8',
  '⁹': '9',
};
const SUPERSCRIPT_RE = /[⁰¹²³⁴-⁹]/g;

function normalize(unit: string): string {
  return unit.toLowerCase().replace(SUPERSCRIPT_RE, (c) => SUPERSCRIPT[c] ?? c);
}

// Resuelve un nombre de unidad. Reconoce primero el alias directo del diccionario;
// si no hay coincidencia y termina en dígitos, separa base + exponente y aplica
// el exponente al alias de la base (m4 → m^4, cm5 → cm^5, m/s2 → m/s^2…).
function resolveUnit(raw: string): string | null {
  const n = normalize(raw);
  if (UNIT_MAP[n]) return UNIT_MAP[n];
  const m = n.match(/^(.+?)(\d+)$/);
  if (m) {
    const base = UNIT_MAP[m[1]];
    if (base) return `${base}^${m[2]}`;
  }
  return null;
}

// "<num> <unidad> a <unidad>". El "a" rodeado de espacios evita falsos positivos
// (p. ej. "kpa" no se rompe porque no hay espacio antes ni después).
const RE_CONV = /^(-?\d+(?:\.\d+)?)\s+(\S.*?)\s+a\s+(\S.*?)$/i;

export type UnitConversion = { value: number; unit: string };

export function tryUnitConversion(line: string): UnitConversion | null {
  const m = line.trim().match(RE_CONV);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const from = resolveUnit(m[2]);
  const to = resolveUnit(m[3]);
  if (!from || !to) return null;
  try {
    const converted = math.unit(value, from).toNumber(to);
    if (!Number.isFinite(converted)) return null;
    return { value: converted, unit: m[3] };
  } catch {
    return null;
  }
}
