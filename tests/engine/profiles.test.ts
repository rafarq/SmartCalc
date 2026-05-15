import { describe, it, expect } from 'vitest';
import { PROFILES, PROFILE_FAMILIES, buildProfiles } from '../../src/engine/profiles';
import { evaluate } from '../../src/engine';

describe('PROFILES (lectura del JSON)', () => {
  it('IPN100 tiene h=100 y b=50', () => {
    expect(PROFILES.IPN100).toBeDefined();
    expect(PROFILES.IPN100.h).toBe(100);
    expect(PROFILES.IPN100.b).toBe(50);
  });
  it('IPN100 convierte "8,32" → 8.32 en el campo p', () => {
    expect(PROFILES.IPN100.p).toBeCloseTo(8.32, 2);
  });
  it('IPN80 mapea "e-r" → "er"', () => {
    expect(PROFILES.IPN80.er).toBeCloseTo(3.9, 2);
  });
  it('HEA100 existe', () => {
    expect(PROFILES.HEA100).toBeDefined();
    expect(PROFILES.HEA100.h).toBeTypeOf('number');
  });
  it('Nombres con punto se saneam (L40.4 → L40_4)', () => {
    expect(PROFILES.L40_4).toBeDefined();
  });
  it('Familias incluyen IPN, IPE, HEA, HEB, HEM, UPN, etc.', () => {
    expect(PROFILE_FAMILIES).toEqual(
      expect.arrayContaining(['IPN', 'IPE', 'HEB', 'HEA', 'HEM', 'UPN']),
    );
  });
  it('No mete campos no numéricos (cm)', () => {
    expect(PROFILES.IPN100).not.toHaveProperty('cm');
  });
  it('buildProfiles es determinista', () => {
    expect(buildProfiles().IPN100.h).toBe(100);
  });
});

describe('evaluate con perfiles (acceso punto)', () => {
  it('IPN100.h → 100', () => {
    const r = evaluate('IPN100.h', { vars: {}, prev: [] });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(100);
  });
  it('IPN100.b → 50', () => {
    const r = evaluate('IPN100.b', { vars: {}, prev: [] });
    expect(r.ok && r.value).toBe(50);
  });
  it('HEA100.h se puede multiplicar', () => {
    const r = evaluate('HEA100.h * 2', { vars: {}, prev: [] });
    expect(r.ok).toBe(true);
  });
  it('IPN200.p * 6 calcula peso de 6 m', () => {
    const peso = PROFILES.IPN200.p * 6;
    const r = evaluate('IPN200.p * 6', { vars: {}, prev: [] });
    expect(r.ok && r.value).toBeCloseTo(peso);
  });
});
