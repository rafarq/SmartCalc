import type { useDocument } from '../hooks/useDocument';
import { LineRow } from './LineRow';

type EditorProps = Omit<
  ReturnType<typeof useDocument>,
  'lineValues' | 'replaceDocument' | 'setTitle'
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
  appendRefToFocused,
}: EditorProps) {
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
            onResultClick={() => appendRefToFocused(line.id)}
          />
        );
      })}
    </div>
  );
}
