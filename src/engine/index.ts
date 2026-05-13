import { create, all, type MathJsInstance } from 'mathjs';
import { formatNumber } from '../utils/numberFormat';
import { expandRefs } from '../utils/refs';
import { preprocess } from './preprocess';
import { tryPercentages } from './percentages';
import { tryAssignment } from './variables';

export type EvalContext = {
  vars: Record<string, number>;
  prev: Array<{ value: unknown; formatted: string }>;
  lineValues?: Record<string, number>;
};

export type Result =
  | { ok: true; value: unknown; formatted: string }
  | { ok: false; error: string };

const math: MathJsInstance = create(all, { number: 'number' });
// pi, e, tau ya están en mathjs por defecto.

// Trigonometría en grados (más natural para uso de calculadora).
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;
const sinDeg = (x: number) => Math.sin(toRad(x));
const cosDeg = (x: number) => Math.cos(toRad(x));
const tanDeg = (x: number) => Math.tan(toRad(x));
const asinDeg = (x: number) => toDeg(Math.asin(x));
const acosDeg = (x: number) => toDeg(Math.acos(x));
const atanDeg = (x: number) => toDeg(Math.atan(x));

math.import(
  {
    sin: sinDeg,
    cos: cosDeg,
    tan: tanDeg,
    asin: asinDeg,
    acos: acosDeg,
    atan: atanDeg,
    log: (x: number, base?: number) =>
      base === undefined ? Math.log10(x) : Math.log(x) / Math.log(base),
    ln: (x: number) => Math.log(x),
    exp: (x: number) => Math.exp(x),
  },
  { override: true },
);

// Alias en español para las funciones matemáticas básicas y la trigonometría.
math.import(
  {
    // Aritméticas
    raiz: (x: number) => Math.sqrt(x),
    redondear: (x: number) => Math.round(x),
    techo: (x: number) => Math.ceil(x),
    suelo: (x: number) => Math.floor(x),
    signo: (x: number) => Math.sign(x),
    // Trigonometría (mismas implementaciones en grados)
    seno: sinDeg,
    coseno: cosDeg,
    tangente: tanDeg,
    arcoseno: asinDeg,
    arcocoseno: acosDeg,
    arcotangente: atanDeg,
    // Estadística
    media: math.mean,
    mediana: math.median,
  },
  { override: false },
);

export function evaluate(line: string, ctx: EvalContext): Result {
  const trimmed = line.trim();
  if (!trimmed) return { ok: true, value: null, formatted: '' };
  const assign = tryAssignment(trimmed);
  if (assign) {
    const inner = evaluate(assign.expr, ctx);
    if (!inner.ok) return inner;
    if (typeof inner.value === 'number') ctx.vars[assign.name] = inner.value;
    return { ok: true, value: inner.value, formatted: inner.formatted };
  }
  const expanded = expandRefs(trimmed, ctx.lineValues ?? {});
  const expr = preprocess(expanded);
  const pct = tryPercentages(expr);
  if (pct) return { ok: true, value: pct.value, formatted: formatNumber(pct.value) };
  try {
    const value = math.evaluate(expr, { ...ctx.vars });
    return { ok: true, value, formatted: formatNumber(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
