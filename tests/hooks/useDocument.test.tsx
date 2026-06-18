import { beforeEach, describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocument } from '../../src/hooks/useDocument';

describe('useDocument', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exposes a document with one empty line initially', () => {
    const { result } = renderHook(() => useDocument());
    expect(result.current.doc.lines).toHaveLength(1);
  });

  it('updates a line', () => {
    const { result } = renderHook(() => useDocument());
    const id = result.current.doc.lines[0].id;
    act(() => result.current.setLineText(id, '1 + 1'));
    expect(result.current.doc.lines[0].text).toBe('1 + 1');
  });

  it('inserts a new line under the active line and moves lower lines down', () => {
    const { result } = renderHook(() => useDocument());
    const firstId = result.current.doc.lines[0].id;

    act(() => result.current.setLineText(firstId, 'arriba'));
    act(() => result.current.insertLineAfter(firstId));

    const secondId = result.current.doc.lines[1].id;
    act(() => result.current.setLineText(secondId, 'abajo'));
    act(() => result.current.insertLineAfter(firstId));

    expect(result.current.doc.lines.map((line) => line.text)).toEqual(['arriba', '', 'abajo']);
    expect(result.current.focusedLineId).toBe(result.current.doc.lines[1].id);
  });

  it('splits the active line at the cursor and moves text after the cursor down', () => {
    const { result } = renderHook(() => useDocument());
    const firstId = result.current.doc.lines[0].id;

    act(() => result.current.setLineText(firstId, '12 + 34'));
    act(() => result.current.insertLineAfter(firstId, 5, '12 + 34'));

    expect(result.current.doc.lines.map((line) => line.text)).toEqual(['12 + ', '34']);
    expect(result.current.focusedLineId).toBe(result.current.doc.lines[1].id);
    expect(result.current.focusedCursorOffset).toBe(0);
  });

  it('merges the active line into the previous one from the start cursor', () => {
    const { result } = renderHook(() => useDocument());
    const firstId = result.current.doc.lines[0].id;

    act(() => result.current.setLineText(firstId, '12 + '));
    act(() => result.current.insertLineAfter(firstId));

    const secondId = result.current.doc.lines[1].id;
    act(() => result.current.setLineText(secondId, '34'));
    act(() => result.current.mergeLineIntoPrevious(secondId, '34'));

    expect(result.current.doc.lines.map((line) => line.text)).toEqual(['12 + 34']);
    expect(result.current.focusedLineId).toBe(firstId);
    expect(result.current.focusedCursorOffset).toBe('12 + '.length);
  });
});
