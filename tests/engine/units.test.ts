import { describe, it, expect } from 'vitest';
import { tryUnitConversion } from '../../src/engine/units';

const ev = (s: string) => tryUnitConversion(s)?.value;

describe('conversión de unidades', () => {
  it('5 km a millas ≈ 3.106', () => expect(ev('5 km a millas')).toBeCloseTo(3.106, 2));
  it('100 celsius a fahrenheit = 212', () =>
    expect(ev('100 celsius a fahrenheit')).toBeCloseTo(212));
  it('1 kg a lb ≈ 2.205', () => expect(ev('1 kg a lb')).toBeCloseTo(2.205, 2));
  it('1 hora a min = 60', () => expect(ev('1 hora a min')).toBe(60));
  it('1 m2 a cm2 = 10000', () => expect(ev('1 m2 a cm2')).toBe(10000));
  it('1 litro a ml = 1000', () => expect(ev('1 litro a ml')).toBeCloseTo(1000));
  it('1 kWh a J = 3600000', () => expect(ev('1 kWh a J')).toBe(3_600_000));
});

describe('conversión de unidades — variantes', () => {
  it('admite mayúsculas y minúsculas en el nombre', () =>
    expect(ev('1 KG a g')).toBe(1000));
  it('admite plurales españoles', () =>
    expect(ev('2 horas a minutos')).toBe(120));
  it('km/h a m/s', () => expect(ev('36 km/h a m/s')).toBeCloseTo(10));
  it('1 ha a m2 = 10 000', () => expect(ev('1 ha a m2')).toBeCloseTo(10000));
  it('10000 m2 a ha = 1', () => expect(ev('10000 m2 a ha')).toBeCloseTo(1));
  it('2.5 hectáreas a m2 = 25 000', () =>
    expect(ev('2.5 hectáreas a m2')).toBeCloseTo(25000));
  it('devuelve null si no es conversión', () =>
    expect(tryUnitConversion('5 + 3')).toBeNull());
  it('devuelve null si una unidad es desconocida', () =>
    expect(tryUnitConversion('5 burbujas a millas')).toBeNull());
});

describe('exponentes en unidades (m2 / m²) y exponentes arbitrarios', () => {
  it('1 m² a cm² = 10 000', () => expect(ev('1 m² a cm²')).toBeCloseTo(10000));
  it('1 m³ a cm³ = 1 000 000', () => expect(ev('1 m³ a cm³')).toBeCloseTo(1_000_000));
  it('1 m³ a litros = 1 000', () => expect(ev('1 m³ a litros')).toBeCloseTo(1000));
  it('1 m⁴ a cm⁴ = 100 000 000 (exponente arbitrario)', () =>
    expect(ev('1 m⁴ a cm⁴')).toBeCloseTo(100_000_000));
  it('mezcla superíndice + dígito ASCII', () =>
    expect(ev('1 m² a cm2')).toBeCloseTo(10000));
  it('1 km² a m² = 1 000 000', () => expect(ev('1 km² a m²')).toBeCloseTo(1_000_000));
});
