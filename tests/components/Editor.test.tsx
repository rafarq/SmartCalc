import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Editor } from '../../src/components/Editor';

describe('Editor multi-line selection', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
  });

  it.each(['Backspace', 'Delete'])('handles %s before the individual line editors', (key) => {
    const deleteSelectionAcrossLines = vi.fn();
    const noop = vi.fn();
    const doc = {
      title: 'Prueba',
      lines: [
        { id: 'first', text: 'abc' },
        { id: 'second', text: 'xyz' },
      ],
    };

    const { container } = render(
      <Editor
        doc={doc}
        results={[
          { ok: true, value: null, formatted: '' },
          { ok: true, value: null, formatted: '' },
        ]}
        formattedById={{}}
        varNames={[]}
        focusedLineId={null}
        focusedCursorOffset={null}
        setLineText={noop}
        insertLineAfter={noop}
        insertLineAtEnd={noop}
        removeLine={noop}
        mergeLineIntoPrevious={noop}
        deleteSelectionAcrossLines={deleteSelectionAcrossLines}
        focusLine={noop}
        focusPrevLine={noop}
        focusNextLine={noop}
        appendRefToFocused={noop}
      />,
    );

    const editor = container.querySelector<HTMLElement>('.editor');
    const inputs = screen.getAllByRole('textbox');
    const range = document.createRange();
    range.setStart(inputs[0].firstChild as Text, 1);
    range.setEnd(inputs[1].firstChild as Text, 2);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    fireEvent.keyDown(window, { key });

    expect(editor).not.toBeNull();
    expect(deleteSelectionAcrossLines).toHaveBeenCalledWith('first', 1, 'second', 2);
  });

  it('extends a mouse selection when the pointer crosses into another line', () => {
    const noop = vi.fn();
    const scheduledFrames: FrameRequestCallback[] = [];
    const animationFrame = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        scheduledFrames.push(callback);
        return scheduledFrames.length;
      });
    const doc = {
      title: 'Prueba',
      lines: [
        { id: 'first', text: 'abc' },
        { id: 'second', text: 'xyz' },
      ],
    };

    render(
      <Editor
        doc={doc}
        results={[
          { ok: true, value: null, formatted: '' },
          { ok: true, value: null, formatted: '' },
        ]}
        formattedById={{}}
        varNames={[]}
        focusedLineId={null}
        focusedCursorOffset={null}
        setLineText={noop}
        insertLineAfter={noop}
        insertLineAtEnd={noop}
        removeLine={noop}
        mergeLineIntoPrevious={noop}
        deleteSelectionAcrossLines={noop}
        focusLine={noop}
        focusPrevLine={noop}
        focusNextLine={noop}
        appendRefToFocused={noop}
      />,
    );

    const inputs = screen.getAllByRole('textbox');
    Object.defineProperty(document, 'elementFromPoint', {
      configurable: true,
      value: vi.fn((_x: number, y: number) => (y < 50 ? inputs[0] : inputs[1])),
    });
    Object.defineProperty(document, 'caretPositionFromPoint', {
      configurable: true,
      value: vi.fn((_x: number, y: number) =>
        y < 50
          ? { offsetNode: inputs[0].firstChild as Text, offset: 1 }
          : { offsetNode: inputs[1].firstChild as Text, offset: 2 },
      ),
    });

    fireEvent.mouseDown(inputs[0], { button: 0, clientX: 10, clientY: 10 });
    fireEvent.mouseMove(window, { buttons: 1, clientX: 10, clientY: 60 });

    // Reproduce lo que hacen los contentEditable separados: su acción nativa
    // pisa el rango multilínea y deja solo el cursor en la segunda línea.
    const collapsed = document.createRange();
    collapsed.setStart(inputs[1].firstChild as Text, 2);
    collapsed.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(collapsed);
    scheduledFrames.shift()?.(0);

    const range = window.getSelection()?.getRangeAt(0);
    expect(range?.startContainer).toBe(inputs[0].firstChild);
    expect(range?.startOffset).toBe(1);
    expect(range?.endContainer).toBe(inputs[1].firstChild);
    expect(range?.endOffset).toBe(2);

    fireEvent.mouseUp(window);
    scheduledFrames.shift()?.(0);

    fireEvent.mouseDown(inputs[1], { button: 0, clientX: 10, clientY: 60 });
    fireEvent.mouseMove(window, { buttons: 1, clientX: 10, clientY: 10 });

    const reverseRange = window.getSelection()?.getRangeAt(0);
    expect(reverseRange?.startContainer).toBe(inputs[0].firstChild);
    expect(reverseRange?.startOffset).toBe(1);
    expect(reverseRange?.endContainer).toBe(inputs[1].firstChild);
    expect(reverseRange?.endOffset).toBe(2);

    fireEvent.mouseUp(window);
    scheduledFrames.shift()?.(0);
    Object.defineProperty(document, 'caretPositionFromPoint', {
      configurable: true,
      value: undefined,
    });
    animationFrame.mockRestore();
  });
});
