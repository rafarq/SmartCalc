import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ctx = { vars: {}, prev: [] };
const ev = (s: string): number => {
  const r = evaluate(s, ctx);
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('trigonometría (grados)', () => {
  it('sin(0) = 0', () => expect(ev('sin(0)')).toBeCloseTo(0));
  it('sin(90) = 1', () => expect(ev('sin(90)')).toBeCloseTo(1));
  it('cos(0) = 1', () => expect(ev('cos(0)')).toBeCloseTo(1));
  it('cos(180) = -1', () => expect(ev('cos(180)')).toBeCloseTo(-1));
  it('tan(45) = 1', () => expect(ev('tan(45)')).toBeCloseTo(1));
  it('asin(1) = 90', () => expect(ev('asin(1)')).toBeCloseTo(90));
  it('acos(0) = 90', () => expect(ev('acos(0)')).toBeCloseTo(90));
  it('atan(1) = 45', () => expect(ev('atan(1)')).toBeCloseTo(45));
});
