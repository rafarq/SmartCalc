import { describe, it, expect } from 'vitest';
import { createEmptyDocument, addLine, updateLine } from '../../src/state/document';

describe('document model', () => {
  it('creates an empty document with one empty line', () => {
    const doc = createEmptyDocument();
    expect(doc.lines).toHaveLength(1);
    expect(doc.lines[0].text).toBe('');
  });

  it('adds a new line after the given index', () => {
    const doc = createEmptyDocument();
    const updated = addLine(doc, 0);
    expect(updated.lines).toHaveLength(2);
  });

  it('updates the text of a line by id', () => {
    const doc = createEmptyDocument();
    const id = doc.lines[0].id;
    const updated = updateLine(doc, id, '2 + 2');
    expect(updated.lines[0].text).toBe('2 + 2');
  });
});
