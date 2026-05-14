import { describe, it, expect } from 'vitest';
import { getCityHolidays, cityList } from '../../src/engine/holidaysList';

describe('getCityHolidays', () => {
  it('Madrid 2026: incluye nacionales, autonómicos y los locales conocidos', () => {
    const r = getCityHolidays('madrid', 2026)!;
    expect(r).not.toBeNull();
    expect(r.ccaa).toBe('MD');
    expect(r.hasLocal).toBe(true);
    expect(r.holidays.some((h) => h.scope === 'national')).toBe(true);
    expect(r.holidays.some((h) => h.scope === 'regional')).toBe(true);
    const isidro = r.holidays.find((h) => h.date === '2026-05-15');
    expect(isidro?.scope).toBe('local');
    const almudena = r.holidays.find((h) => h.date === '2026-11-09');
    expect(almudena?.scope).toBe('local');
  });
  it('Pamplona 2026: San Fermín 7 jul como local', () => {
    const r = getCityHolidays('pamplona', 2026)!;
    expect(r.hasLocal).toBe(true);
    const fermin = r.holidays.find((h) => h.date === '2026-07-07');
    expect(fermin?.scope).toBe('local');
  });

  it('Barcelona 2026: incluye locales (Mercè)', () => {
    const r = getCityHolidays('barcelona', 2026)!;
    expect(r.ccaa).toBe('CT');
    expect(r.hasLocal).toBe(true);
    const merce = r.holidays.find((h) => h.scope === 'local');
    expect(merce).toBeDefined();
    expect(merce?.date).toBe('2026-09-24');
  });

  it('ciudad inexistente devuelve null', () => {
    expect(getCityHolidays('atlantis', 2026)).toBeNull();
  });
});

describe('cityList', () => {
  it('contiene las capitales canónicas con acentos', () => {
    const list = cityList();
    expect(list).toContain('madrid');
    expect(list).toContain('málaga');
    expect(list).not.toContain('malaga'); // variante sin acento queda fuera
    expect(list.length).toBeGreaterThan(40);
  });
});
