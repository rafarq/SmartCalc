import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ev = (s: string) => {
  const r = evaluate(s, { vars: {}, prev: [] });
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('logaritmos y exp', () => {
  it('log(100) = 2 (base 10)', () => expect(ev('log(100)')).toBeCloseTo(2));
  it('log(1000) = 3', () => expect(ev('log(1000)')).toBeCloseTo(3));
  it('ln(e) = 1', () => expect(ev('ln(e)')).toBeCloseTo(1));
  it('log(8, 2) = 3', () => expect(ev('log(8, 2)')).toBeCloseTo(3));
  it('exp(1) = e', () => expect(ev('exp(1)')).toBeCloseTo(Math.E));
});
