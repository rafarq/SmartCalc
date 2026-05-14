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

// "<num> <unidad> a <unidad>". El "a" rodeado de espacios evita falsos positivos
// (p. ej. "kpa" no se rompe porque no hay espacio antes ni después).
const RE_CONV = /^(-?\d+(?:\.\d+)?)\s+(\S.*?)\s+a\s+(\S.*?)$/i;

export type UnitConversion = { value: number; unit: string };

export function tryUnitConversion(line: string): UnitConversion | null {
  const m = line.trim().match(RE_CONV);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const from = UNIT_MAP[m[2].toLowerCase()];
  const to = UNIT_MAP[m[3].toLowerCase()];
  if (!from || !to) return null;
  try {
    const converted = math.unit(value, from).toNumber(to);
    if (!Number.isFinite(converted)) return null;
    return { value: converted, unit: m[3] };
  } catch {
    return null;
  }
}
