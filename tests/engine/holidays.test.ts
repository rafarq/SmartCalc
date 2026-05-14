import { describe, it, expect } from 'vitest';
import {
  isWorkingDay,
  addWorkingDays,
  workingDaysBetween,
} from '../../src/engine/holidays';

describe('días laborables', () => {
  it('sábado 16/5/2026 no es laborable', () => {
    expect(isWorkingDay(new Date(2026, 4, 16))).toBe(false);
  });
  it('domingo 17/5/2026 no es laborable', () => {
    expect(isWorkingDay(new Date(2026, 4, 17))).toBe(false);
  });
  it('lunes 18/5/2026 es laborable', () => {
    expect(isWorkingDay(new Date(2026, 4, 18))).toBe(true);
  });
  it('1 enero 2026 no es laborable (festivo nacional)', () => {
    expect(isWorkingDay(new Date(2026, 0, 1))).toBe(false);
  });
  it('addWorkingDays salta fines de semana', () => {
    // viernes 15/5 + 1 laborable → lunes 18/5
    const r = addWorkingDays(new Date(2026, 4, 15), 1);
    expect(r).toEqual(new Date(2026, 4, 18));
  });
  it('addWorkingDays(-1) desde lunes 18/5 → viernes 15/5', () => {
    const r = addWorkingDays(new Date(2026, 4, 18), -1);
    expect(r).toEqual(new Date(2026, 4, 15));
  });
  it('workingDaysBetween 1/1/2026 a 1/2/2026 entre 20 y 22', () => {
    const r = workingDaysBetween(new Date(2026, 0, 1), new Date(2026, 1, 1));
    expect(r).toBeGreaterThanOrEqual(20);
    expect(r).toBeLessThanOrEqual(22);
  });
  it('workingDaysBetween cuando b < a devuelve negativo simétrico', () => {
    const a = new Date(2026, 0, 1);
    const b = new Date(2026, 1, 1);
    expect(workingDaysBetween(b, a)).toBe(-workingDaysBetween(a, b));
  });
});
