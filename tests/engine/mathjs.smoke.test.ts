import { describe, it, expect } from 'vitest';
import { create, all } from 'mathjs';

describe('mathjs smoke', () => {
  it('evaluates basic arithmetic', () => {
    const math = create(all);
    expect(math.evaluate('2 + 3')).toBe(5);
  });
});
