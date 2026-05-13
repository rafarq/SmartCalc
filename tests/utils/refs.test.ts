import { describe, it, expect } from 'vitest';
import { tokenize, renderTokensToHTML, expandRefs } from '../../src/utils/refs';

describe('tokenize', () => {
  it('texto plano sin refs', () => {
    expect(tokenize('2 + 2')).toEqual([{ type: 'text', value: '2 + 2' }]);
  });
  it('una ref al inicio', () => {
    expect(tokenize('@{abc} * 2')).toEqual([
      { type: 'ref', id: 'abc' },
      { type: 'text', value: ' * 2' },
    ]);
  });
  it('refs en medio', () => {
    expect(tokenize('a @{x} b @{y} c')).toEqual([
      { type: 'text', value: 'a ' },
      { type: 'ref', id: 'x' },
      { type: 'text', value: ' b ' },
      { type: 'ref', id: 'y' },
      { type: 'text', value: ' c' },
    ]);
  });
});

describe('expandRefs', () => {
  it('sustituye refs por valores entre paréntesis', () => {
    expect(expandRefs('@{a} + 1', { a: 10 })).toBe('(10) + 1');
  });
  it('refs desconocidas se sustituyen por 0', () => {
    expect(expandRefs('@{x}', {})).toBe('0');
  });
});

describe('renderTokensToHTML', () => {
  it('renderiza chips con el valor formateado', () => {
    const html = renderTokensToHTML('@{abc} * 2', { abc: '2003' });
    expect(html).toContain('class="ref-chip"');
    expect(html).toContain('data-ref="abc"');
    expect(html).toContain('>2003<');
    expect(html).toContain(' * 2');
  });
  it('escapa HTML peligroso en el texto', () => {
    const html = renderTokensToHTML('<script>', {});
    expect(html).toBe('&lt;script&gt;');
  });
});
