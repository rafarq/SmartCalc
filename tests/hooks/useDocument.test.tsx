import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocument } from '../../src/hooks/useDocument';

describe('useDocument', () => {
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
});
