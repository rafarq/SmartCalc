import { describe, it, expect } from 'vitest';
import { tryInverse } from '../../src/engine/inverse';

describe('cálculo inverso', () => {
  it('20 es el 10% de qué = 200', () =>
    expect(tryInverse('20 es el 10% de qué')?.value).toBeCloseTo(200));
  it('90 tiene un 20% de descuento en qué = 112.5', () =>
    expect(tryInverse('90 tiene un 20% de descuento en qué')?.value).toBeCloseTo(112.5));
  it('150 tiene un 15% de aumento en qué = 130.43', () =>
    expect(tryInverse('150 tiene un 15% de aumento en qué')?.value).toBeCloseTo(130.43, 2));
  it('null si no aplica', () => expect(tryInverse('20% de 300')).toBeNull());
});

describe('cálculo inverso con referencias entre líneas', () => {
  it('"(20) es el (10)% de qué" = 200', () =>
    expect(tryInverse('(20) es el (10)% de qué')?.value).toBeCloseTo(200));
  it('"(90) tiene un (20)% de descuento en qué" = 112.5', () =>
    expect(tryInverse('(90) tiene un (20)% de descuento en qué')?.value).toBeCloseTo(112.5));
});
