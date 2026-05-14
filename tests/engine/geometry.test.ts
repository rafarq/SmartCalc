import { describe, it, expect } from 'vitest';
import { tryGeometry, GEOMETRY_CATALOG } from '../../src/engine/geometry';

describe('tryGeometry — área', () => {
  it('area.circulo.radio. 5mm ≈ 78,54 mm²', () => {
    const r = tryGeometry('area.circulo.radio. 5mm');
    expect(r?.value).toBeCloseTo(78.54, 2);
    expect(r?.unit).toBe('mm²');
  });
  it('area.circulo.diametro. 10cm ≈ 78,54 cm²', () => {
    const r = tryGeometry('area.circulo.diametro. 10cm');
    expect(r?.value).toBeCloseTo(78.54, 2);
    expect(r?.unit).toBe('cm²');
  });
  it('area.cuadrado.lado. 4m = 16 m²', () => {
    const r = tryGeometry('area.cuadrado.lado. 4m');
    expect(r?.value).toBe(16);
    expect(r?.unit).toBe('m²');
  });
  it('area.rectangulo.lados. 3m 4m = 12 m²', () => {
    const r = tryGeometry('area.rectangulo.lados. 3m 4m');
    expect(r?.value).toBe(12);
    expect(r?.unit).toBe('m²');
  });
  it('area.triangulo.base_altura. 6 4 = 12 (sin unidad → m²)', () => {
    const r = tryGeometry('area.triangulo.base_altura. 6 4');
    expect(r?.value).toBe(12);
    expect(r?.unit).toBe('m²');
  });
  it('area.trapecio.bases_altura. 10 6 4 = 32', () => {
    const r = tryGeometry('area.trapecio.bases_altura. 10 6 4');
    expect(r?.value).toBe(32);
  });
});

describe('tryGeometry — perímetro', () => {
  it('perimetro.cuadrado.lado. 5m = 20 m', () => {
    const r = tryGeometry('perimetro.cuadrado.lado. 5m');
    expect(r?.value).toBe(20);
    expect(r?.unit).toBe('m');
  });
  it('perimetro.circulo.radio. 3 ≈ 18,85', () => {
    const r = tryGeometry('perimetro.circulo.radio. 3');
    expect(r?.value).toBeCloseTo(18.85, 2);
  });
});

describe('tryGeometry — volumen', () => {
  it('volumen.cubo.lado. 3m = 27 m³', () => {
    const r = tryGeometry('volumen.cubo.lado. 3m');
    expect(r?.value).toBe(27);
    expect(r?.unit).toBe('m³');
  });
  it('volumen.esfera.radio. 5 ≈ 523,6 m³', () => {
    const r = tryGeometry('volumen.esfera.radio. 5');
    expect(r?.value).toBeCloseTo(523.598, 2);
    expect(r?.unit).toBe('m³');
  });
  it('volumen.cilindro.radio_altura. 2 10 ≈ 125,66', () => {
    const r = tryGeometry('volumen.cilindro.radio_altura. 2 10');
    expect(r?.value).toBeCloseTo(125.66, 2);
  });
});

describe('tryGeometry — null cases', () => {
  it('texto no geometría → null', () => {
    expect(tryGeometry('hola mundo')).toBeNull();
  });
  it('falta de argumentos → null', () => {
    expect(tryGeometry('area.cuadrado.lado.')).toBeNull();
  });
  it('argumentos de más → null', () => {
    expect(tryGeometry('area.cuadrado.lado. 4 5')).toBeNull();
  });
});

describe('GEOMETRY_CATALOG', () => {
  it('incluye las plantillas principales', () => {
    const templates = GEOMETRY_CATALOG.map((f) => f.template);
    expect(templates).toContain('area.circulo.diametro.');
    expect(templates).toContain('volumen.esfera.radio.');
    expect(templates).toContain('perimetro.rectangulo.lados.');
  });
});
