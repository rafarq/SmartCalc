import { describe, it, expect } from 'vitest';
import { getCityHolidays, cityList } from '../../src/engine/holidaysList';

describe('getCityHolidays', () => {
  it('Madrid 2026: incluye nacionales y autonómicos, sin locales', () => {
    const r = getCityHolidays('madrid', 2026)!;
    expect(r).not.toBeNull();
    expect(r.ccaa).toBe('MD');
    expect(r.hasLocal).toBe(false);
    expect(r.holidays.some((h) => h.scope === 'national')).toBe(true);
    expect(r.holidays.some((h) => h.scope === 'regional')).toBe(true);
    expect(r.holidays.every((h) => h.scope !== 'local')).toBe(true);
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
