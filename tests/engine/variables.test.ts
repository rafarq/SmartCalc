import { describe, it, expect } from 'vitest';
import { tryAssignment } from '../../src/engine/variables';
import { evaluate } from '../../src/engine';

describe('parser de asignación', () => {
  it('parsea "precio = 100"', () => {
    expect(tryAssignment('precio = 100')).toEqual({ name: 'precio', expr: '100' });
  });
  it('parsea "iva = 21 * 1.21"', () => {
    expect(tryAssignment('iva = 21 * 1.21')).toEqual({ name: 'iva', expr: '21 * 1.21' });
  });
  it('null si no es asignación', () => {
    expect(tryAssignment('1 + 1')).toBeNull();
  });
  it('null si el nombre no es válido', () => {
    expect(tryAssignment('1 + 1 = 2')).toBeNull();
  });
});

describe('uso de variables en el motor', () => {
  it('asigna y reutiliza coche = 4', () => {
    const vars: Record<string, number> = {};
    const ctx = { vars, prev: [] };
    const r1 = evaluate('coche = 4', ctx);
    expect(r1.ok && r1.value).toBe(4);
    const r2 = evaluate('coche', ctx);
    expect(r2.ok && r2.value).toBe(4);
    const r3 = evaluate('coche * 2', ctx);
    expect(r3.ok && r3.value).toBe(8);
  });
  it('soporta acentos en el nombre', () => {
    const vars: Record<string, number> = {};
    const ctx = { vars, prev: [] };
    evaluate('año = 2025', ctx);
    const r = evaluate('año + 1', ctx);
    expect(r.ok && r.value).toBe(2026);
  });
});
