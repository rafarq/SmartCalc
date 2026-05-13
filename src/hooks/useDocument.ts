import { useCallback, useMemo, useState } from 'react';
import { evaluate, type Result } from '../engine';
import { createEmptyDocument, addLine, updateLine, type DocumentModel } from '../state/document';

export function useDocument() {
  const [doc, setDoc] = useState<DocumentModel>(() => createEmptyDocument());
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);

  const results = useMemo<Result[]>(() => {
    const prev: Array<{ value: unknown; formatted: string }> = [];
    const vars: Record<string, number> = {};
    return doc.lines.map((line) => {
      const r = evaluate(line.text, { vars, prev });
      if (r.ok && r.value !== null) prev.push({ value: r.value, formatted: r.formatted });
      else prev.push({ value: null, formatted: '' });
      return r;
    });
  }, [doc]);

  const setLineText = useCallback((id: string, text: string) => {
    setDoc((d) => updateLine(d, id, text));
  }, []);

  const insertLineAfter = useCallback((index: number) => {
    setDoc((d) => {
      const { doc: next, newId } = addLine(d, index);
      setFocusedLineId(newId);
      return next;
    });
  }, []);

  return { doc, results, focusedLineId, setLineText, insertLineAfter };
}
