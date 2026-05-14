import { useState } from 'react';
import type { useDocument } from '../hooks/useDocument';
import { formatNumber } from '../utils/numberFormat';
import { LineRow } from './LineRow';

type Aggregate = 'sum' | 'mean' | 'median' | 'count';

const AGG_LABEL: Record<Aggregate, string> = {
  sum: 'Suma',
  mean: 'Media',
  median: 'Mediana',
  count: 'Cantidad',
};

function aggregateValue(values: number[], kind: Aggregate): number {
  if (kind === 'count') return values.length;
  if (kind === 'sum') return values.reduce((a, b) => a + b, 0);
  if (kind === 'mean') return values.reduce((a, b) => a + b, 0) / values.length;
  // median
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

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
  const [agg, setAgg] = useState<Aggregate>('sum');
  const numericValues: number[] = [];
  for (const r of results) {
    if (r.ok && typeof r.value === 'number' && Number.isFinite(r.value)) {
      numericValues.push(r.value);
    }
  }
  const aggValue = numericValues.length > 0 ? aggregateValue(numericValues, agg) : 0;
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
      {numericValues.length > 0 && (
        <div className="line-row line-total">
          <span className="line-number" aria-hidden="true" />
          <span className="line-total-spacer" />
          <div className="line-total-right">
            <select
              className="line-total-select"
              value={agg}
              onChange={(e) => setAgg(e.target.value as Aggregate)}
              aria-label="Operación de agregado"
            >
              {(Object.keys(AGG_LABEL) as Aggregate[]).map((k) => (
                <option key={k} value={k}>
                  {AGG_LABEL[k]}
                </option>
              ))}
            </select>
            <span className="line-total-value">
              {agg === 'count' ? String(numericValues.length) : formatNumber(aggValue)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
