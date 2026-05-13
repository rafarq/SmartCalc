import { describe, it, expect } from 'vitest';
import { preprocess } from '../../src/engine/preprocess';

describe('preprocess: abreviaturas', () => {
  it('3M → 3000000', () => expect(preprocess('3M')).toBe('(3 * 1000000)'));
  it('100k → 100000', () => expect(preprocess('100k')).toBe('(100 * 1000)'));
  it('2.5M → 2500000', () => expect(preprocess('2.5M')).toBe('(2.5 * 1000000)'));
  it('3M + 100k', () => expect(preprocess('3M + 100k')).toBe('(3 * 1000000) + (100 * 1000)'));
  it('no toca k dentro de identificador', () =>
    expect(preprocess('km a millas')).toBe('km a millas'));
});
