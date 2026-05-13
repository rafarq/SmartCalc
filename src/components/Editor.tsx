import { useDocument } from '../hooks/useDocument';
import { LineRow } from './LineRow';

export function Editor() {
  const { doc, setLineText, insertLineAfter } = useDocument();
  return (
    <div className="editor">
      {doc.lines.map((line, i) => (
        <LineRow
          key={line.id}
          value={line.text}
          result=""
          onChange={(t) => setLineText(line.id, t)}
          onEnter={() => insertLineAfter(i)}
        />
      ))}
    </div>
  );
}
