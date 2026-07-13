import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  addLine,
  splitLine,
  mergeLineWithPrevious,
  deleteTextRange,
  updateLine,
  setTitle,
  DEFAULT_TITLE,
} from '../../src/state/document';

describe('document model', () => {
  it('creates an empty document with one empty line and default title', () => {
    const doc = createEmptyDocument();
    expect(doc.lines).toHaveLength(1);
    expect(doc.lines[0].text).toBe('');
    expect(doc.title).toBe(DEFAULT_TITLE);
  });

  it('setTitle updates the title', () => {
    const doc = createEmptyDocument();
    const updated = setTitle(doc, 'Mi hoja');
    expect(updated.title).toBe('Mi hoja');
    expect(updated.lines).toEqual(doc.lines);
  });

  it('adds a new line after the given index', () => {
    const doc = createEmptyDocument();
    const { doc: updated, newId } = addLine(doc, 0);
    expect(updated.lines).toHaveLength(2);
    expect(updated.lines[1].id).toBe(newId);
  });

  it('splits a line at the cursor offset and moves the rest down', () => {
    const doc = createEmptyDocument();
    const id = doc.lines[0].id;
    const withText = updateLine(doc, id, '12 + 34');
    const split = splitLine(withText, id, 5);

    expect(split).not.toBeNull();
    expect(split?.doc.lines.map((line) => line.text)).toEqual(['12 + ', '34']);
    expect(split?.doc.lines[1].id).toBe(split?.newId);
  });

  it('merges a line into the previous one and returns the join cursor offset', () => {
    const doc = createEmptyDocument();
    const firstId = doc.lines[0].id;
    const withFirst = updateLine(doc, firstId, '12 + ');
    const { doc: withSecond } = addLine(withFirst, 0);
    const secondId = withSecond.lines[1].id;
    const withText = updateLine(withSecond, secondId, '34');
    const merged = mergeLineWithPrevious(withText, secondId);

    expect(merged).not.toBeNull();
    expect(merged?.doc.lines.map((line) => line.text)).toEqual(['12 + 34']);
    expect(merged?.focusId).toBe(firstId);
    expect(merged?.cursorOffset).toBe('12 + '.length);
  });

  it('updates the text of a line by id', () => {
    const doc = createEmptyDocument();
    const id = doc.lines[0].id;
    const updated = updateLine(doc, id, '2 + 2');
    expect(updated.lines[0].text).toBe('2 + 2');
  });

  it('deletes a partial selection spanning several lines', () => {
    const doc = createEmptyDocument();
    const firstId = doc.lines[0].id;
    const first = updateLine(doc, firstId, 'abcde');
    const { doc: second, newId: secondId } = addLine(first, 0);
    const withSecond = updateLine(second, secondId, '12345');
    const { doc: third, newId: thirdId } = addLine(withSecond, 1);
    const complete = updateLine(third, thirdId, 'XYZ');

    const updated = deleteTextRange(complete, firstId, 2, thirdId, 1);

    expect(updated.lines.map((line) => line.text)).toEqual(['abYZ']);
    expect(updated.lines[0].id).toBe(firstId);
  });

  it('deletes complete selected lines but keeps one editable line', () => {
    const doc = createEmptyDocument();
    const firstId = doc.lines[0].id;
    const first = updateLine(doc, firstId, 'uno');
    const { doc: second, newId: secondId } = addLine(first, 0);
    const complete = updateLine(second, secondId, 'dos');

    const updated = deleteTextRange(complete, firstId, 0, secondId, 3);

    expect(updated.lines.map((line) => line.text)).toEqual(['']);
  });
});
