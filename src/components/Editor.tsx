import { useEffect, useRef, useState } from 'react';
import type { useDocument } from '../hooks/useDocument';
import type { Result } from '../engine';
import { formatNumber, formatNumberCompact } from '../utils/numberFormat';
import { useIsMobile } from '../hooks/useIsMobile';
import { LineRow } from './LineRow';
import { CheckIcon, CopyIcon } from './icons';
import { getSelectionAcrossLines, type MultiLineTextSelection } from '../utils/refs';

type DomPoint = {
  node: Node;
  offset: number;
  lineInput: HTMLElement;
};

type CaretDocument = Document & {
  caretPositionFromPoint?: (
    x: number,
    y: number,
  ) => { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?: (x: number, y: number) => Range | null;
};

function edgePoint(lineInput: HTMLElement, atEnd: boolean): DomPoint {
  const range = document.createRange();
  range.selectNodeContents(lineInput);
  range.collapse(!atEnd);
  return { node: range.startContainer, offset: range.startOffset, lineInput };
}

function pointInLine(lineInput: HTMLElement, clientX: number, clientY: number): DomPoint {
  const caretDocument = document as CaretDocument;
  const position = caretDocument.caretPositionFromPoint?.(clientX, clientY);
  if (position && lineInput.contains(position.offsetNode)) {
    return { node: position.offsetNode, offset: position.offset, lineInput };
  }

  const caretRange = caretDocument.caretRangeFromPoint?.(clientX, clientY);
  if (caretRange && lineInput.contains(caretRange.startContainer)) {
    return {
      node: caretRange.startContainer,
      offset: caretRange.startOffset,
      lineInput,
    };
  }

  const bounds = lineInput.getBoundingClientRect();
  return edgePoint(lineInput, clientX >= bounds.left + bounds.width / 2);
}

function lineInputAtPoint(editor: HTMLElement, clientX: number, clientY: number): HTMLElement | null {
  const hit = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
  const direct = hit?.closest<HTMLElement>('.line-input[data-line-id]');
  if (direct && editor.contains(direct)) return direct;

  const rowInput = hit
    ?.closest<HTMLElement>('.line-row')
    ?.querySelector<HTMLElement>('.line-input[data-line-id]');
  if (rowInput && editor.contains(rowInput)) return rowInput;

  const inputs = Array.from(
    editor.querySelectorAll<HTMLElement>('.line-input[data-line-id]'),
  );
  return (
    inputs.sort((a, b) => {
      const aRect = a.getBoundingClientRect();
      const bRect = b.getBoundingClientRect();
      const aDistance = Math.abs(clientY - (aRect.top + aRect.height / 2));
      const bDistance = Math.abs(clientY - (bRect.top + bRect.height / 2));
      return aDistance - bDistance;
    })[0] ?? null
  );
}

function rangeBetween(anchor: DomPoint, focus: DomPoint): Range {
  const candidate = document.createRange();
  candidate.setStart(anchor.node, anchor.offset);
  candidate.setEnd(focus.node, focus.offset);

  const samePoint = anchor.node === focus.node && anchor.offset === focus.offset;
  const range = document.createRange();
  if (candidate.collapsed && !samePoint) {
    range.setStart(focus.node, focus.offset);
    range.setEnd(anchor.node, anchor.offset);
  } else {
    range.setStart(anchor.node, anchor.offset);
    range.setEnd(focus.node, focus.offset);
  }

  return range;
}

function applySelectionRange(range: Range): void {
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

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

function displayResult(r: Result, decimals: number, compact: boolean): string {
  if (!r.ok) return '—';
  if (typeof r.value === 'number' && Number.isFinite(r.value)) {
    const fmt = compact ? formatNumberCompact : formatNumber;
    return fmt(r.value, decimals) + (r.unit ? ` ${r.unit}` : '');
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
  | 'lineValues'
  | 'replaceDocument'
  | 'clearDocument'
  | 'setTitle'
  | 'undo'
  | 'redo'
  | 'canUndo'
  | 'canRedo'
>;

export function Editor({
  doc,
  results,
  formattedById,
  varNames,
  focusedLineId,
  focusedCursorOffset,
  setLineText,
  insertLineAfter,
  insertLineAtEnd,
  removeLine,
  mergeLineIntoPrevious,
  deleteSelectionAcrossLines,
  focusLine,
  focusPrevLine,
  focusNextLine,
  appendRefToFocused,
}: EditorProps) {
  const [agg, setAgg] = useState<Aggregate>('sum');
  const [totalCopied, setTotalCopied] = useState(false);
  const [decimals, setDecimals] = useState<number>(() => loadDecimals());
  const editorRef = useRef<HTMLDivElement>(null);
  const dragAnchorRef = useRef<(DomPoint & { crossedLine: boolean }) | null>(null);
  const desiredRangeRef = useRef<Range | null>(null);
  const multiLineSelectionRef = useRef<MultiLineTextSelection | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    try {
      localStorage.setItem(DECIMALS_KEY, String(decimals));
    } catch {
      /* ignorar */
    }
  }, [decimals]);

  useEffect(() => {
    const handleMultiLineDelete = (event: KeyboardEvent) => {
      if (event.key !== 'Backspace' && event.key !== 'Delete') return;
      const editor = editorRef.current;
      if (!editor) return;
      const selection = getSelectionAcrossLines(editor) ?? multiLineSelectionRef.current;
      if (!selection) return;

      event.preventDefault();
      event.stopPropagation();
      desiredRangeRef.current = null;
      multiLineSelectionRef.current = null;
      deleteSelectionAcrossLines(
        selection.startLineId,
        selection.startOffset,
        selection.endLineId,
        selection.endOffset,
      );
    };

    window.addEventListener('keydown', handleMultiLineDelete, true);
    return () => window.removeEventListener('keydown', handleMultiLineDelete, true);
  }, [deleteSelectionAcrossLines]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const anchor = dragAnchorRef.current;
      const editor = editorRef.current;
      if (!anchor || !editor || (event.buttons & 1) === 0) return;

      const lineInput = lineInputAtPoint(editor, event.clientX, event.clientY);
      if (!lineInput) return;
      if (lineInput !== anchor.lineInput) anchor.crossedLine = true;
      if (!anchor.crossedLine) return;

      event.preventDefault();
      const desiredRange = rangeBetween(
        anchor,
        pointInLine(lineInput, event.clientX, event.clientY),
      );
      desiredRangeRef.current = desiredRange;
      applySelectionRange(desiredRange);
      multiLineSelectionRef.current = getSelectionAcrossLines(editor);

      // La selección nativa de cada contentEditable se actualiza como acción por
      // defecto después del mousemove y puede volver a colapsar nuestro rango.
      // Lo restauramos en el siguiente frame, cuando esa acción ya ha terminado.
      window.requestAnimationFrame(() => {
        if (desiredRangeRef.current === desiredRange) {
          applySelectionRange(desiredRange);
        }
      });
    };

    const finishDrag = () => {
      dragAnchorRef.current = null;
      const desiredRange = desiredRangeRef.current;
      if (desiredRange) {
        window.requestAnimationFrame(() => {
          if (desiredRangeRef.current === desiredRange) {
            applySelectionRange(desiredRange);
          }
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { capture: true, passive: false });
    window.addEventListener('mouseup', finishDrag, true);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove, true);
      window.removeEventListener('mouseup', finishDrag, true);
    };
  }, []);

  const numericValues: number[] = [];
  for (const r of results) {
    if (r.ok && typeof r.value === 'number' && Number.isFinite(r.value)) {
      numericValues.push(r.value);
    }
  }
  const aggValue = numericValues.length > 0 ? aggregateValue(numericValues, agg) : 0;
  const aggFormatter = isMobile ? formatNumberCompact : formatNumber;
  const aggDisplay =
    agg === 'count' ? String(numericValues.length) : aggFormatter(aggValue, decimals);

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
    <div
      ref={editorRef}
      className="editor"
      onMouseDownCapture={(event) => {
        if (event.button !== 0) return;
        const target = event.target as HTMLElement;
        const lineInput = target.closest<HTMLElement>('.line-input[data-line-id]');
        if (!lineInput) {
          dragAnchorRef.current = null;
          desiredRangeRef.current = null;
          multiLineSelectionRef.current = null;
          return;
        }
        desiredRangeRef.current = null;
        multiLineSelectionRef.current = null;
        dragAnchorRef.current = {
          ...pointInLine(lineInput, event.clientX, event.clientY),
          crossedLine: false,
        };
      }}
    >
      <div className="editor-toolbar editor-toolbar-top">
        <span className="editor-toolbar-label">Decimales</span>
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
      </div>
      {doc.lines.map((line, i) => {
        const r = results[i];
        const text = displayResult(r, decimals, isMobile);
        const hasValue = r.ok && r.formatted !== '';
        const resultError = !r.ok ? r.error : undefined;
        return (
          <LineRow
            key={line.id}
            lineId={line.id}
            lineNumber={i + 1}
            value={line.text}
            result={text}
            resultError={resultError}
            lineValues={formattedById}
            varNames={varNames}
            autoFocus={line.id === focusedLineId}
            autoFocusCursorOffset={
              line.id === focusedLineId && focusedCursorOffset !== null
                ? focusedCursorOffset
                : undefined
            }
            resultClickable={hasValue && line.id !== focusedLineId}
            onChange={(t) => setLineText(line.id, t)}
            onEnter={(cursorOffset, currentText) =>
              insertLineAfter(line.id, cursorOffset, currentText)
            }
            onShiftEnter={() => insertLineAtEnd()}
            onBackspaceEmpty={() => removeLine(line.id)}
            onBackspaceAtStart={(currentText) => mergeLineIntoPrevious(line.id, currentText)}
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
          </div>
        </div>
      )}
    </div>
  );
}
