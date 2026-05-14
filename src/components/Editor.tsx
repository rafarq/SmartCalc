import type { useDocument } from '../hooks/useDocument';
import { formatNumber } from '../utils/numberFormat';
import { LineRow } from './LineRow';

type EditorProps = Omit<
  ReturnType<typeof useDocument>,
  'lineValues' | 'replaceDocument' | 'clearDocument' | 'setTitle'
>;

export function Editor({
  doc,
  results,
  formattedById,
  varNames,
  focusedLineId,
  setLineText,
  insertLineAfter,
  removeLine,
  focusLine,
  focusPrevLine,
  focusNextLine,
  appendRefToFocused,
}: EditorProps) {
  let total = 0;
  let count = 0;
  for (const r of results) {
    if (r.ok && typeof r.value === 'number' && Number.isFinite(r.value)) {
      total += r.value;
      count += 1;
    }
  }
  return (
    <div className="editor">
      {doc.lines.map((line, i) => {
        const r = results[i];
        const text = r.ok ? r.formatted : '⚠';
        const hasValue = r.ok && r.formatted !== '';
        return (
          <LineRow
            key={line.id}
            lineNumber={i + 1}
            value={line.text}
            result={text}
            lineValues={formattedById}
            varNames={varNames}
            autoFocus={line.id === focusedLineId}
            resultClickable={hasValue && line.id !== focusedLineId}
            onChange={(t) => setLineText(line.id, t)}
            onEnter={() => insertLineAfter(i)}
            onBackspaceEmpty={() => removeLine(line.id)}
            onFocus={() => focusLine(line.id)}
            onArrowUp={() => focusPrevLine(line.id)}
            onArrowDown={() => focusNextLine(line.id)}
            onResultClick={() => appendRefToFocused(line.id)}
          />
        );
      })}
      {count > 0 && (
        <div className="line-row line-total" aria-label="Suma de los resultados">
          <span className="line-number" aria-hidden="true" />
          <span className="line-total-label">Total ({count})</span>
          <span className="line-total-value">{formatNumber(total)}</span>
        </div>
      )}
    </div>
  );
}
