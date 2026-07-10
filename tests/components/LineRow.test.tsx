import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { LineRow } from '../../src/components/LineRow';

function ControlledLineRow({
  onChange,
  onBackspaceAtStart,
}: {
  onChange: (value: string) => void;
  onBackspaceAtStart: (value: string) => void;
}) {
  const [value, setValue] = useState('abcdef');

  return (
    <LineRow
      value={value}
      result=""
      lineValues={{}}
      onChange={(nextValue) => {
        onChange(nextValue);
        setValue(nextValue);
      }}
      onEnter={() => {}}
      onBackspaceAtStart={onBackspaceAtStart}
    />
  );
}

describe('LineRow', () => {
  it('renders the value as text content', () => {
    render(
      <LineRow value="2 + 2" result="4" lineValues={{}} onChange={() => {}} onEnter={() => {}} />,
    );
    expect(screen.getByRole('textbox')).toHaveTextContent('2 + 2');
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<LineRow value="" result="" lineValues={{}} onChange={onChange} onEnter={() => {}} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)?.[0];
    expect(last).toContain('a');
  });

  it('renders a chip for @{id} references', () => {
    render(
      <LineRow
        value="@{abc} * 2"
        result="4006"
        lineValues={{ abc: '2003' }}
        onChange={() => {}}
        onEnter={() => {}}
      />,
    );
    const chip = screen.getByText('2003');
    expect(chip).toHaveClass('ref-chip');
    expect(chip).toHaveAttribute('data-ref', 'abc');
  });

  it('calls onEnter with cursor offset and current text', () => {
    const onEnter = vi.fn();
    render(
      <LineRow value="abcdef" result="" lineValues={{}} onChange={() => {}} onEnter={onEnter} />,
    );

    const textbox = screen.getByRole('textbox');
    const range = document.createRange();
    range.setStart(textbox.firstChild as Text, 2);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    fireEvent.keyDown(textbox, { key: 'Enter', code: 'Enter' });

    expect(onEnter).toHaveBeenCalledWith(2, 'abcdef');
  });

  it('places autofocus cursor at the requested offset', () => {
    render(
      <LineRow
        value="abcdef"
        result=""
        lineValues={{}}
        autoFocus
        autoFocusCursorOffset={0}
        onChange={() => {}}
        onEnter={() => {}}
      />,
    );

    expect(document.activeElement).toBe(screen.getByRole('textbox'));
    const sel = window.getSelection();
    expect(sel?.rangeCount).toBe(1);
    expect(sel?.getRangeAt(0).startOffset).toBe(0);
  });

  it('calls onBackspaceAtStart with current text when cursor is at the start', () => {
    const onBackspaceAtStart = vi.fn();
    render(
      <LineRow
        value="abcdef"
        result=""
        lineValues={{}}
        onChange={() => {}}
        onEnter={() => {}}
        onBackspaceAtStart={onBackspaceAtStart}
      />,
    );

    const textbox = screen.getByRole('textbox');
    const range = document.createRange();
    range.setStart(textbox.firstChild as Text, 0);
    range.collapse(true);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    fireEvent.keyDown(textbox, { key: 'Backspace', code: 'Backspace' });

    expect(onBackspaceAtStart).toHaveBeenCalledWith('abcdef');
  });

  it.each([
    ['Backspace', 'Backspace'],
    ['Delete', 'Delete'],
  ])('deletes selected text with %s', (key, code) => {
    const onChange = vi.fn();
    const onBackspaceAtStart = vi.fn();
    render(<ControlledLineRow onChange={onChange} onBackspaceAtStart={onBackspaceAtStart} />);

    const textbox = screen.getByRole('textbox');
    textbox.focus();
    const range = document.createRange();
    range.setStart(textbox.firstChild as Text, 0);
    range.setEnd(textbox.firstChild as Text, 3);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);

    fireEvent.keyDown(textbox, { key, code });

    expect(onChange).toHaveBeenCalledWith('def');
    expect(onBackspaceAtStart).not.toHaveBeenCalled();
    expect(textbox).toHaveTextContent('def');
    expect(sel?.isCollapsed).toBe(true);
  });
});
