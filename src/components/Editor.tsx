import { useDocument } from '../hooks/useDocument';
import { LineRow } from './LineRow';

export function Editor() {
  const { doc, results, focusedLineId, setLineText, insertLineAfter } = useDocument();
  return (
    <div className="editor">
      {doc.lines.map((line, i) => {
        const r = results[i];
        const text = r.ok ? r.formatted : '⚠';
        return (
          <LineRow
            key={line.id}
            value={line.text}
            result={text}
            autoFocus={line.id === focusedLineId}
            onChange={(t) => setLineText(line.id, t)}
            onEnter={() => insertLineAfter(i)}
          />
        );
      })}
    </div>
  );
}
