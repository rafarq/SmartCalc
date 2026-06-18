import { describe, it, expect } from 'vitest';
import {
  tokenize,
  renderTokensToHTML,
  expandRefs,
  getCursorTextOffset,
  placeCursorAtTextOffset,
} from '../../src/utils/refs';

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

describe('getCursorTextOffset', () => {
  it('returns the cursor offset in plain text', () => {
    const el = document.createElement('div');
    el.textContent = 'abcdef';
    document.body.appendChild(el);

    const range = document.createRange();
    range.setStart(el.firstChild as Text, 3);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    expect(getCursorTextOffset(el)).toBe(3);
    document.body.removeChild(el);
  });

  it('counts reference chips as their serialized token', () => {
    const el = document.createElement('div');
    el.innerHTML = renderTokensToHTML('@{abc} + 1', { abc: '2003' });
    document.body.appendChild(el);

    const textAfterChip = el.childNodes[1] as Text;
    const range = document.createRange();
    range.setStart(textAfterChip, 2);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    expect(getCursorTextOffset(el)).toBe('@{abc}'.length + 2);
    document.body.removeChild(el);
  });
});

describe('placeCursorAtTextOffset', () => {
  it('places the cursor at the requested plain-text offset', () => {
    const el = document.createElement('div');
    el.textContent = 'abcdef';
    document.body.appendChild(el);

    placeCursorAtTextOffset(el, 2);

    expect(getCursorTextOffset(el)).toBe(2);
    document.body.removeChild(el);
  });

  it('places the cursor after serialized reference chips', () => {
    const el = document.createElement('div');
    el.innerHTML = renderTokensToHTML('@{abc} + 1', { abc: '2003' });
    document.body.appendChild(el);

    placeCursorAtTextOffset(el, '@{abc}'.length + 2);

    expect(getCursorTextOffset(el)).toBe('@{abc}'.length + 2);
    document.body.removeChild(el);
  });
});
