import { useDocument } from '../hooks/useDocument';
import { LineRow } from './LineRow';

export function Editor() {
  const {
    doc,
    results,
    formattedById,
    focusedLineId,
    setLineText,
    insertLineAfter,
    focusLine,
    appendRefToFocused,
  } = useDocument();

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
            autoFocus={line.id === focusedLineId}
            resultClickable={hasValue && line.id !== focusedLineId}
            onChange={(t) => setLineText(line.id, t)}
            onEnter={() => insertLineAfter(i)}
            onFocus={() => focusLine(line.id)}
            onResultClick={() => appendRefToFocused(line.id)}
          />
        );
      })}
    </div>
  );
}
