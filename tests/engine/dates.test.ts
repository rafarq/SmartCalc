import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseSpanishDate } from '../../src/engine/dates';

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
