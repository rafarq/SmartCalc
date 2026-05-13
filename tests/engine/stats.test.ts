import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ev = (s: string) => {
  const r = evaluate(s, { vars: {}, prev: [] });
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('estadística', () => {
  it('min(1, 2, 3) = 1', () => expect(ev('min(1, 2, 3)')).toBe(1));
  it('max(1, 2, 3) = 3', () => expect(ev('max(1, 2, 3)')).toBe(3));
  it('mean(2, 4, 6) = 4', () => expect(ev('mean(2, 4, 6)')).toBe(4));
  it('median(1, 5, 3) = 3', () => expect(ev('median(1, 5, 3)')).toBe(3));
  it('std(2, 4, 4, 4, 5, 5, 7, 9) ≈ 2.138', () =>
    expect(ev('std(2, 4, 4, 4, 5, 5, 7, 9)')).toBeCloseTo(2.138, 2));
});
