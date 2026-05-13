import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ctx = { vars: {}, prev: [] };
const ev = (s: string): number => {
  const r = evaluate(s, ctx);
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('alias en español: funciones matemáticas', () => {
  it.each([
    ['raiz(16)', 4],
    ['redondear(2.5)', 3],
    ['techo(2.1)', 3],
    ['suelo(2.9)', 2],
    ['signo(-8)', -1],
  ])('%s = %i', (input, expected) => {
    expect(ev(input)).toBe(expected);
  });
});

describe('alias en español: trigonometría (grados)', () => {
  it('seno(90) = 1', () => expect(ev('seno(90)')).toBeCloseTo(1));
  it('coseno(0) = 1', () => expect(ev('coseno(0)')).toBeCloseTo(1));
  it('tangente(45) = 1', () => expect(ev('tangente(45)')).toBeCloseTo(1));
  it('arcoseno(1) = 90', () => expect(ev('arcoseno(1)')).toBeCloseTo(90));
  it('arcocoseno(0) = 90', () => expect(ev('arcocoseno(0)')).toBeCloseTo(90));
  it('arcotangente(1) = 45', () => expect(ev('arcotangente(1)')).toBeCloseTo(45));
});

describe('alias en español: estadística', () => {
  it('media(2, 4, 6) = 4', () => expect(ev('media(2, 4, 6)')).toBe(4));
  it('mediana(1, 5, 3) = 3', () => expect(ev('mediana(1, 5, 3)')).toBe(3));
});

describe('alias en inglés siguen funcionando', () => {
  it('sqrt(25) = 5', () => expect(ev('sqrt(25)')).toBe(5));
  it('sin(90) = 1', () => expect(ev('sin(90)')).toBeCloseTo(1));
  it('mean(2, 4, 6) = 4', () => expect(ev('mean(2, 4, 6)')).toBe(4));
  it('median(1, 5, 3) = 3', () => expect(ev('median(1, 5, 3)')).toBe(3));
});
