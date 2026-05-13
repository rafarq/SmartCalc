import { useEffect, useRef } from 'react';
import { extractText, placeCursorAtEnd, renderTokensToHTML } from '../utils/refs';

type Props = {
  value: string;
  result: string;
  lineNumber?: number;
  lineValues: Record<string, string>;
  autoFocus?: boolean;
  resultClickable?: boolean;
  onChange: (text: string) => void;
  onEnter: () => void;
  onBackspaceEmpty?: () => void;
  onFocus?: () => void;
  onResultClick?: () => void;
};

export function LineRow({
  value,
  result,
  lineNumber,
  lineValues,
  autoFocus,
  resultClickable,
  onChange,
  onEnter,
  onBackspaceEmpty,
  onFocus,
  onResultClick,
}: Props) {
  const inputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    if (extractText(el) === value) {
      // Texto coincide; actualizar el display de los chips si lineValues cambió.
      el.querySelectorAll<HTMLElement>('.ref-chip').forEach((chip) => {
        const id = chip.dataset.ref;
        if (!id) return;
        const display = lineValues[id] ?? '?';
        if (chip.textContent !== display) chip.textContent = display;
      });
      return;
    }
    const isFocused = document.activeElement === el;
    el.innerHTML = renderTokensToHTML(value, lineValues);
    if (isFocused || autoFocus) placeCursorAtEnd(el);
  }, [value, lineValues, autoFocus]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
      placeCursorAtEnd(inputRef.current);
    }
  }, [autoFocus]);

  const handleInput = () => {
    const el = inputRef.current;
    if (!el) return;
    onChange(extractText(el));
  };

  return (
    <div className="line-row">
      {lineNumber !== undefined && <span className="line-number">{lineNumber}</span>}
      <div
        ref={inputRef}
        className="line-input"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        spellCheck={false}
        onInput={handleInput}
        onFocus={onFocus}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter();
            return;
          }
          if (e.key === 'Backspace') {
            const el = inputRef.current;
            if (el && extractText(el) === '' && onBackspaceEmpty) {
              e.preventDefault();
              onBackspaceEmpty();
            }
          }
        }}
      />
      <span
        className={`line-result${resultClickable ? ' clickable' : ''}`}
        role={resultClickable ? 'button' : undefined}
        title={resultClickable ? 'Click para insertar referencia' : undefined}
        onMouseDown={(e) => {
          if (!resultClickable) return;
          e.preventDefault();
          onResultClick?.();
        }}
      >
        {result}
      </span>
    </div>
  );
}
