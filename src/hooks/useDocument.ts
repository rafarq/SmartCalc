import { useCallback, useMemo, useRef, useState } from 'react';
import { evaluate, type Result } from '../engine';
import { createEmptyDocument, addLine, updateLine, type DocumentModel } from '../state/document';

export function useDocument() {
  const [doc, setDoc] = useState<DocumentModel>(() => createEmptyDocument());
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
  const focusedLineIdRef = useRef<string | null>(null);
  focusedLineIdRef.current = focusedLineId;

  const { results, lineValues, formattedById } = useMemo(() => {
    const prev: Array<{ value: unknown; formatted: string }> = [];
    const vars: Record<string, number> = {};
    const lv: Record<string, number> = {};
    const fmt: Record<string, string> = {};

    const out: Result[] = doc.lines.map((line) => {
      const r = evaluate(line.text, { vars, prev, lineValues: lv });
      if (r.ok && r.value !== null) {
        prev.push({ value: r.value, formatted: r.formatted });
        if (typeof r.value === 'number') {
          lv[line.id] = r.value;
          fmt[line.id] = r.formatted;
        }
      } else {
        prev.push({ value: null, formatted: '' });
      }
      return r;
    });

    return { results: out, lineValues: lv, formattedById: fmt };
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

  const focusLine = useCallback((id: string) => {
    setFocusedLineId(id);
  }, []);

  // Inserta una referencia (@{targetId}) al final del texto de la línea actualmente enfocada.
  const appendRefToFocused = useCallback((targetId: string) => {
    const focusedId = focusedLineIdRef.current;
    if (!focusedId || focusedId === targetId) return; // evita auto-referencia
    setDoc((d) => {
      const line = d.lines.find((l) => l.id === focusedId);
      if (!line) return d;
      const sep = line.text.length > 0 && !line.text.endsWith(' ') ? ' ' : '';
      const newText = `${line.text}${sep}@{${targetId}} `;
      return updateLine(d, focusedId, newText);
    });
  }, []);

  return {
    doc,
    results,
    lineValues,
    formattedById,
    focusedLineId,
    setLineText,
    insertLineAfter,
    focusLine,
    appendRefToFocused,
  };
}
