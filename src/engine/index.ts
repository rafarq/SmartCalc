import { create, all, type MathJsInstance } from 'mathjs';
import { formatNumber } from '../utils/numberFormat';
import { expandRefs } from '../utils/refs';
import { preprocess } from './preprocess';
import { tryPercentages } from './percentages';
import { tryAssignment } from './variables';
import { tryInverse } from './inverse';
import { tryUnitConversion } from './units';
import { tryNaturalConversion } from './naturalConversions';
import { tryDateExpression } from './dates';
import { tryGeometry } from './geometry';
import { PROFILES } from './profiles';

export type EvalContext = {
  vars: Record<string, number>;
  prev: Array<{ value: unknown; formatted: string }>;
  lineValues?: Record<string, number>;
};

export type Result =
  | { ok: true; value: unknown; formatted: string; unit?: string }
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

// Línea que empieza por un operador binario: si la línea anterior dio un
// número, prepende su valor de forma transparente ("+50" tras 100 → 150).
const IMPLICIT_OP_RE = /^([+\-*/^%])\s*(.+)$/;

export function evaluate(line: string, ctx: EvalContext): Result {
  const trimmed = line.trim();
  if (!trimmed) return { ok: true, value: null, formatted: '' };
  const lastPrev = ctx.prev[ctx.prev.length - 1];
  if (lastPrev && typeof lastPrev.value === 'number' && Number.isFinite(lastPrev.value)) {
    const im = trimmed.match(IMPLICIT_OP_RE);
    if (im) {
      return evaluate(`(${lastPrev.value}) ${im[1]} ${im[2]}`, ctx);
    }
  }
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
  const inv = tryInverse(expr);
  if (inv) return { ok: true, value: inv.value, formatted: formatNumber(inv.value) };
  const uc = tryUnitConversion(expr);
  if (uc)
    return {
      ok: true,
      value: uc.value,
      unit: uc.unit,
      formatted: `${formatNumber(uc.value)} ${uc.unit}`,
    };
  const nc = tryNaturalConversion(expr);
  if (nc)
    return {
      ok: true,
      value: nc.value,
      unit: nc.unit,
      formatted: `${formatNumber(nc.value)} ${nc.unit}`,
    };
  const de = tryDateExpression(expr);
  if (de) return { ok: true, value: de.value, unit: de.unit, formatted: de.formatted };
  const g = tryGeometry(expr);
  if (g)
    return {
      ok: true,
      value: g.value,
      unit: g.unit,
      formatted: `${formatNumber(g.value)} ${g.unit}`,
    };
  try {
    // Los perfiles geométricos (IPN100, HEA150, …) se inyectan como variables
    // de scope. Acceso a propiedades vía `IPN100.h`, `HEA150.p`, etc. Las
    // variables del usuario tienen prioridad sobre los perfiles.
    const value = math.evaluate(expr, { ...PROFILES, ...ctx.vars });
    return { ok: true, value, formatted: formatNumber(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
