import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ctx = { vars: {}, prev: [] };
const ev = (s: string) => evaluate(s, ctx);

describe('funciones matemáticas', () => {
  it.each([
    ['sqrt(16)', 4],
    ['abs(-7)', 7],
    ['round(2.4)', 2],
    ['round(2.5)', 3],
    ['ceil(2.1)', 3],
    ['floor(2.9)', 2],
    ['sign(-3)', -1],
    ['sign(0)', 0],
    ['sign(8)', 1],
  ])('%s = %i', (input, expected) => {
    const r = ev(input);
    if (r.ok) expect(r.value).toBe(expected);
    else throw new Error(r.error);
  });
});
