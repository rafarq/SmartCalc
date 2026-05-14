import { describe, it, expect } from 'vitest';
import { formatNumber, formatNumberCompact } from '../../src/utils/numberFormat';

describe('formatNumber', () => {
  it('sin decimales explícitos: hasta 6, sin rellenos', () => {
    expect(formatNumber(12345.5)).toBe('12.345,5');
    expect(formatNumber(7)).toBe('7');
  });
  it('con decimales explícitos: exacto N (min = max)', () => {
    expect(formatNumber(9, 4)).toBe('9,0000');
    expect(formatNumber(78.5398, 2)).toBe('78,54');
  });
  it('infinito y NaN pasan tal cual', () => {
    expect(formatNumber(Infinity)).toBe('Infinity');
    expect(formatNumber(NaN)).toBe('NaN');
  });
});

describe('formatNumberCompact', () => {
  it('valores normales (1e-3 ≤ |x| < 1e5) usan formato normal', () => {
    expect(formatNumberCompact(123.45, 2)).toBe('123,45');
    expect(formatNumberCompact(0, 2)).toBe('0,00');
    expect(formatNumberCompact(0.5, 2)).toBe('0,50');
    expect(formatNumberCompact(99999, 0)).toBe('99.999');
  });
  it('grandes: 100 000 → "100 k"', () => {
    expect(formatNumberCompact(100000, 0)).toBe('100 k');
  });
  it('grandes: 1.234.567 → "1,23 M"', () => {
    expect(formatNumberCompact(1234567, 2)).toBe('1,23 M');
  });
  it('grandes: 2,5 · 10⁹ → "2,5 B"', () => {
    expect(formatNumberCompact(2.5e9, 1)).toBe('2,5 B');
  });
  it('grandes negativos también', () => {
    expect(formatNumberCompact(-1500000, 1)).toBe('-1,5 M');
  });
  it('muy pequeños: 0,000123 → "1,23·10⁻⁴"', () => {
    expect(formatNumberCompact(0.000123, 2)).toBe('1,23·10⁻⁴');
  });
  it('muy pequeños negativos: -1e-5 → "-1·10⁻⁵"', () => {
    expect(formatNumberCompact(-1e-5, 0)).toBe('-1·10⁻⁵');
  });
});
