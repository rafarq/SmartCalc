import { describe, it, expect } from 'vitest';
import {
  tokenize,
  renderTokensToHTML,
  expandRefs,
  getCursorTextOffset,
  getSelectionTextOffsets,
  placeCursorAtTextOffset,
  getSelectionAcrossLines,
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

describe('getSelectionTextOffsets', () => {
  it('returns the serialized limits of a text selection', () => {
    const el = document.createElement('div');
    el.innerHTML = renderTokensToHTML('a @{abc} xyz', { abc: '2003' });
    document.body.appendChild(el);

    const firstText = el.childNodes[0] as Text;
    const lastText = el.childNodes[2] as Text;
    const range = document.createRange();
    range.setStart(firstText, 1);
    range.setEnd(lastText, 2);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    expect(getSelectionTextOffsets(el)).toEqual({
      start: 1,
      end: 'a @{abc}'.length + 2,
    });
    document.body.removeChild(el);
  });
});

describe('getSelectionAcrossLines', () => {
  it('returns serialized offsets for a selection spanning line inputs', () => {
    const first = document.createElement('div');
    first.className = 'line-input';
    first.dataset.lineId = 'first';
    first.innerHTML = renderTokensToHTML('ab @{ref}', { ref: '10' });
    const second = document.createElement('div');
    second.className = 'line-input';
    second.dataset.lineId = 'second';
    second.textContent = 'xyz';
    document.body.append(first, second);

    const range = document.createRange();
    range.setStart(first.firstChild as Text, 1);
    range.setEnd(second.firstChild as Text, 2);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(getSelectionAcrossLines()).toEqual({
      startLineId: 'first',
      startOffset: 1,
      endLineId: 'second',
      endOffset: 2,
    });
    first.remove();
    second.remove();
  });

  it('detects complete lines when the selection endpoints are outside the inputs', () => {
    const editor = document.createElement('div');
    const firstRow = document.createElement('div');
    const first = document.createElement('div');
    first.className = 'line-input';
    first.dataset.lineId = 'first';
    first.textContent = 'abc';
    firstRow.appendChild(first);
    const secondRow = document.createElement('div');
    const second = document.createElement('div');
    second.className = 'line-input';
    second.dataset.lineId = 'second';
    second.textContent = 'xyz';
    secondRow.appendChild(second);
    editor.append(firstRow, secondRow);
    document.body.appendChild(editor);

    const range = document.createRange();
    range.setStart(editor, 0);
    range.setEnd(editor, 2);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    expect(getSelectionAcrossLines(editor)).toEqual({
      startLineId: 'first',
      startOffset: 0,
      endLineId: 'second',
      endOffset: 3,
    });
    editor.remove();
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
