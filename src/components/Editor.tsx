import { useEffect, useState } from 'react';
import type { useDocument } from '../hooks/useDocument';
import type { Result } from '../engine';
import { formatNumber } from '../utils/numberFormat';
import { LineRow } from './LineRow';
import { CheckIcon, CopyIcon } from './icons';

const DECIMALS_KEY = 'smartcalc.decimals.v1';
const DEFAULT_DECIMALS = 2;
const MAX_DECIMALS = 10;

function loadDecimals(): number {
  try {
    const raw = localStorage.getItem(DECIMALS_KEY);
    if (raw === null) return DEFAULT_DECIMALS;
    const n = parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 0 && n <= MAX_DECIMALS) return n;
  } catch {
    /* localStorage no disponible */
  }
  return DEFAULT_DECIMALS;
}

function displayResult(r: Result, decimals: number): string {
  if (!r.ok) return '⚠';
  if (typeof r.value === 'number' && Number.isFinite(r.value)) {
    return formatNumber(r.value, decimals) + (r.unit ? ` ${r.unit}` : '');
  }
  return r.formatted;
}

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
  const [totalCopied, setTotalCopied] = useState(false);
  const [decimals, setDecimals] = useState<number>(() => loadDecimals());

  useEffect(() => {
    try {
      localStorage.setItem(DECIMALS_KEY, String(decimals));
    } catch {
      /* ignorar */
    }
  }, [decimals]);
  const numericValues: number[] = [];
  for (const r of results) {
    if (r.ok && typeof r.value === 'number' && Number.isFinite(r.value)) {
      numericValues.push(r.value);
    }
  }
  const aggValue = numericValues.length > 0 ? aggregateValue(numericValues, agg) : 0;
  const aggDisplay =
    agg === 'count' ? String(numericValues.length) : formatNumber(aggValue, decimals);

  const handleTotalCopy = async () => {
    try {
      await navigator.clipboard.writeText(aggDisplay);
      setTotalCopied(true);
      window.setTimeout(() => setTotalCopied(false), 1200);
    } catch {
      // silenciamos errores de portapapeles (permisos, navegador antiguo…)
    }
  };
  return (
    <div className="editor">
      {doc.lines.map((line, i) => {
        const r = results[i];
        const text = displayResult(r, decimals);
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
      <div className="line-row line-total">
        <span className="line-number" aria-hidden="true" />
        <span className="line-total-spacer" />
        <div className="line-total-right">
          {numericValues.length > 0 && (
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
          )}
          <div className="decimals-control" role="group" aria-label="Decimales mostrados">
              <button
                type="button"
                className="decimals-btn"
                title="Menos decimales"
                aria-label="Menos decimales"
                onClick={() => setDecimals((d) => Math.max(0, d - 1))}
                disabled={decimals <= 0}
              >
                −
              </button>
              <span
                className="decimals-value"
                title={`Decimales mostrados: ${decimals}`}
                aria-live="polite"
              >
                {decimals}
              </span>
              <button
                type="button"
                className="decimals-btn"
                title="Más decimales"
                aria-label="Más decimales"
                onClick={() => setDecimals((d) => Math.min(MAX_DECIMALS, d + 1))}
                disabled={decimals >= MAX_DECIMALS}
              >
                +
              </button>
            </div>
          {numericValues.length > 0 && (
            <>
              <button
                type="button"
                className={`line-copy-btn${totalCopied ? ' copied' : ''}`}
                title={totalCopied ? 'Copiado' : 'Copiar total'}
                aria-label={totalCopied ? 'Copiado' : 'Copiar total'}
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleTotalCopy}
              >
                {totalCopied ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              </button>
              <span className="line-total-value">{aggDisplay}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
