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
