import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseSpanishDate, tryDateExpression } from '../../src/engine/dates';

describe('parseSpanishDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 13)); // mié 13 mayo 2026
  });
  afterEach(() => vi.useRealTimers());

  it('hoy', () => expect(parseSpanishDate('hoy')).toEqual(new Date(2026, 4, 13)));
  it('ayer', () => expect(parseSpanishDate('ayer')).toEqual(new Date(2026, 4, 12)));
  it('mañana', () => expect(parseSpanishDate('mañana')).toEqual(new Date(2026, 4, 14)));
  it('manana sin acento', () =>
    expect(parseSpanishDate('manana')).toEqual(new Date(2026, 4, 14)));
  it('23/1/2026', () =>
    expect(parseSpanishDate('23/1/2026')).toEqual(new Date(2026, 0, 23)));
  it('23/1/26 (año corto)', () =>
    expect(parseSpanishDate('23/1/26')).toEqual(new Date(2026, 0, 23)));
  it('23/1 (asume año actual)', () =>
    expect(parseSpanishDate('23/1')).toEqual(new Date(2026, 0, 23)));
  it('10 de febrero', () =>
    expect(parseSpanishDate('10 de febrero')).toEqual(new Date(2026, 1, 10)));
  it('10 de febrero de 2027', () =>
    expect(parseSpanishDate('10 de febrero de 2027')).toEqual(new Date(2027, 1, 10)));
  it('próximo lunes desde miércoles → lunes 18/5', () =>
    expect(parseSpanishDate('próximo lunes')).toEqual(new Date(2026, 4, 18)));
  it('proximo lunes (sin acento)', () =>
    expect(parseSpanishDate('proximo lunes')).toEqual(new Date(2026, 4, 18)));
  it('viernes que viene desde miércoles → viernes 15/5', () =>
    expect(parseSpanishDate('viernes que viene')).toEqual(new Date(2026, 4, 15)));
  it('texto no fecha devuelve null', () =>
    expect(parseSpanishDate('hola mundo')).toBeNull());
});

describe('aritmética de fechas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 13));
  });
  afterEach(() => vi.useRealTimers());

  it('hoy + 3 semanas', () => {
    const r = tryDateExpression('hoy + 3 semanas');
    expect(r?.value).toEqual(new Date(2026, 5, 3));
  });

  it('hace 10 días', () => {
    const r = tryDateExpression('hace 10 días');
    expect(r?.value).toEqual(new Date(2026, 4, 3));
  });

  it('dentro de 1 mes', () => {
    const r = tryDateExpression('dentro de 1 mes');
    expect(r?.value).toEqual(new Date(2026, 5, 13));
  });

  it('23/1/2026 + 5 días = 28/01/2026', () => {
    const r = tryDateExpression('23/1/2026 + 5 días');
    expect(r?.value).toEqual(new Date(2026, 0, 28));
  });

  it('días entre 1/1 y 1/2 = 31', () => {
    const r = tryDateExpression('días entre 1/1 y 1/2');
    expect(r?.value).toBe(31);
  });

  it('fecha sola muestra formateada dd/MM/yyyy', () => {
    const r = tryDateExpression('hoy');
    expect(r?.formatted).toBe('13/05/2026');
  });
});

describe('expresiones laborables', () => {
  it('viernes 15/5/2026 + 1 día laborable → lunes 18/5/2026', () => {
    const r = tryDateExpression('15/5/2026 + 1 día laborable');
    expect(r?.value).toEqual(new Date(2026, 4, 18));
  });

  it('15/5/2026 + 3 días laborables → miércoles 20/5/2026', () => {
    const r = tryDateExpression('15/5/2026 + 3 días laborables');
    expect(r?.value).toEqual(new Date(2026, 4, 20));
  });

  it('días laborables entre 1/1/2026 y 1/2/2026', () => {
    const r = tryDateExpression('días laborables entre 1/1/2026 y 1/2/2026');
    expect(typeof r?.value).toBe('number');
    expect(r?.formatted).toMatch(/d\. laborables$/);
  });
});

describe('diferencias compuestas', () => {
  it('semanas y días entre 1/5/2026 y 15/5/2026 → 2 sem. y 0 d.', () => {
    const r = tryDateExpression('semanas y días entre 1/5/2026 y 15/5/2026');
    expect(r?.formatted).toMatch(/2 sem\./);
  });

  it('semanas y días entre 1/5/2026 y 17/5/2026 → 2 sem. y 2 d.', () => {
    const r = tryDateExpression('semanas y días entre 1/5/2026 y 17/5/2026');
    expect(r?.formatted).toBe('2 sem. y 2 d.');
  });

  it('meses y días entre 3/1/2023 y 4/2/2026 ≈ 37 meses y 1 d.', () => {
    const r = tryDateExpression('meses y días entre 3/1/2023 y 4/2/2026');
    expect(r?.formatted).toMatch(/37 meses/);
  });
});
