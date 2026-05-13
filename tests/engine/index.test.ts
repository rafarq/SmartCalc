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
