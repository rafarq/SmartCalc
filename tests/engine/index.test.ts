import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

describe('evaluate', () => {
  it('returns empty result for empty line', () => {
    expect(evaluate('', { vars: {}, prev: [] })).toEqual({
      ok: true,
      value: null,
      formatted: '',
    });
  });

  it('returns error result for nonsense', () => {
    const r = evaluate('asdf', { vars: {}, prev: [] });
    expect(r.ok).toBe(false);
  });
});

describe('evaluate basics', () => {
  const ctx = { vars: {}, prev: [] };
  it.each([
    ['1 + 1', 2],
    ['25 - 5', 20],
    ['9 * 9', 81],
    ['20 / 5', 4],
    ['2 ^ 10', 1024],
    ['10 % 3', 1],
  ])('%s = %i', (input, expected) => {
    const r = evaluate(input as string, ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(expected);
  });

  it('knows pi, e, tau', () => {
    expect((evaluate('pi', ctx) as { ok: true; value: number }).value).toBeCloseTo(Math.PI);
    expect((evaluate('e', ctx) as { ok: true; value: number }).value).toBeCloseTo(Math.E);
    expect((evaluate('tau', ctx) as { ok: true; value: number }).value).toBeCloseTo(2 * Math.PI);
  });
});

describe('evaluate — operador implícito', () => {
  it('+50 después de 100 → 150', () => {
    const ctx = { vars: {}, prev: [{ value: 100, formatted: '100' }] };
    const r = evaluate('+50', ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(150);
  });

  it('*2 después de 7 → 14', () => {
    const ctx = { vars: {}, prev: [{ value: 7, formatted: '7' }] };
    const r = evaluate('*2', ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(14);
  });

  it('/ 4 después de 100 → 25 (con espacio)', () => {
    const ctx = { vars: {}, prev: [{ value: 100, formatted: '100' }] };
    const r = evaluate('/ 4', ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(25);
  });

  it('-5 después de 100 es un literal negativo', () => {
    const ctx = { vars: {}, prev: [{ value: 100, formatted: '100' }] };
    const r = evaluate('-5', ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-5);
  });

  it('- 5 después de 100 es un literal negativo', () => {
    const ctx = { vars: {}, prev: [{ value: 100, formatted: '100' }] };
    const r = evaluate('- 5', ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-5);
  });

  it('prev no numérico (fecha) → -5 es literal', () => {
    const ctx = { vars: {}, prev: [{ value: new Date(), formatted: '13/05/2026' }] };
    const r = evaluate('-5', ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(-5);
  });
});

describe('evaluate with references', () => {
  it('substitutes @{id} with the line value', () => {
    const r = evaluate('@{abc} * 2', {
      vars: {},
      prev: [],
      lineValues: { abc: 2003 },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(4006);
  });

  it('unknown ref evaluates as 0', () => {
    const r = evaluate('@{missing} + 5', { vars: {}, prev: [], lineValues: {} });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(5);
  });

  it('"@{a} es qué % de @{b}" funciona con referencias', () => {
    const r = evaluate('@{a} es qué % de @{b}', {
      vars: {},
      prev: [],
      lineValues: { a: 50, b: 200 },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(25);
  });

  it('"@{a} + @{b}% de iva" funciona con referencias', () => {
    const r = evaluate('@{a} + @{b}% de iva', {
      vars: {},
      prev: [],
      lineValues: { a: 100, b: 21 },
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(121);
  });
});
