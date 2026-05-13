import { describe, it, expect } from 'vitest';
import { tryPercentages } from '../../src/engine/percentages';

describe('porcentajes naturales', () => {
  it('50 + 10% de impuestos = 55', () =>
    expect(tryPercentages('50 + 10% de impuestos')?.value).toBe(55));
  it('120 - 30% de descuento = 84', () =>
    expect(tryPercentages('120 - 30% de descuento')?.value).toBe(84));
  it('20% de 300 = 60', () => expect(tryPercentages('20% de 300')?.value).toBe(60));
  it('50 es qué % de 200 = 25', () =>
    expect(tryPercentages('50 es qué % de 200')?.value).toBe(25));
  it('devuelve null si no aplica', () => expect(tryPercentages('2 + 2')).toBeNull());
});

describe('regla de tres', () => {
  it('si 3 kg son 6€, 5 kg son ? → 10', () =>
    expect(tryPercentages('si 3 kg son 6€, 5 kg son ?')?.value).toBeCloseTo(10));
  it('si 100 km son 5h, 250 km son ? → 12.5', () =>
    expect(tryPercentages('si 100 km son 5h, 250 km son ?')?.value).toBeCloseTo(12.5));
  it('si 1 m son 200 cm, 2.5 m son ? → 500', () =>
    expect(tryPercentages('si 1 m son 200 cm, 2.5 m son ?')?.value).toBeCloseTo(500));
});
