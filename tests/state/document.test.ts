import { describe, it, expect } from 'vitest';
import {
  createEmptyDocument,
  addLine,
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

  it('updates the text of a line by id', () => {
    const doc = createEmptyDocument();
    const id = doc.lines[0].id;
    const updated = updateLine(doc, id, '2 + 2');
    expect(updated.lines[0].text).toBe('2 + 2');
  });
});
