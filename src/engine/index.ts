import { create, all, type MathJsInstance } from 'mathjs';
import { formatNumber } from '../utils/numberFormat';

export type EvalContext = {
  vars: Record<string, number>;
  prev: Array<{ value: unknown; formatted: string }>;
};

export type Result =
  | { ok: true; value: unknown; formatted: string }
  | { ok: false; error: string };

const math: MathJsInstance = create(all, { number: 'number' });
// pi, e, tau ya están en mathjs por defecto.

export function evaluate(line: string, ctx: EvalContext): Result {
  const trimmed = line.trim();
  if (!trimmed) return { ok: true, value: null, formatted: '' };
  try {
    const value = math.evaluate(trimmed, { ...ctx.vars });
    return { ok: true, value, formatted: formatNumber(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
