import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evaluate, type Result } from '../engine';
import {
  createEmptyDocument,
  addLine,
  updateLine,
  setTitle as docSetTitle,
  type DocumentModel,
} from '../state/document';
import { loadLocal, saveLocal } from '../state/storage';

function initialDoc(): DocumentModel {
  const loaded = loadLocal();
  if (loaded && loaded.lines.length > 0) return loaded;
  return createEmptyDocument();
}

export function useDocument() {
  const [doc, setDoc] = useState<DocumentModel>(initialDoc);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
  const focusedLineIdRef = useRef<string | null>(null);
  focusedLineIdRef.current = focusedLineId;

  // Autoguardado en localStorage cada vez que cambia el documento.
  useEffect(() => {
    saveLocal(doc);
  }, [doc]);

  const { results, lineValues, formattedById, varNamesRaw } = useMemo(() => {
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

    return { results: out, lineValues: lv, formattedById: fmt, varNamesRaw: Object.keys(vars) };
  }, [doc]);

  const varNamesKey = varNamesRaw.slice().sort().join('|');
  const varNames = useMemo(() => varNamesRaw.slice().sort(), [varNamesKey]);

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

  const removeLine = useCallback((id: string) => {
    setDoc((d) => {
      if (d.lines.length <= 1) return d;
      const idx = d.lines.findIndex((l) => l.id === id);
      if (idx === -1) return d;
      const newLines = d.lines.filter((l) => l.id !== id);
      const focusTargetId = idx === 0 ? newLines[0].id : d.lines[idx - 1].id;
      setFocusedLineId(focusTargetId);
      return { ...d, lines: newLines };
    });
  }, []);

  const focusLine = useCallback((id: string) => {
    setFocusedLineId(id);
  }, []);

  const focusPrevLine = useCallback((id: string) => {
    setDoc((d) => {
      const idx = d.lines.findIndex((l) => l.id === id);
      if (idx > 0) setFocusedLineId(d.lines[idx - 1].id);
      return d;
    });
  }, []);

  const focusNextLine = useCallback((id: string) => {
    setDoc((d) => {
      const idx = d.lines.findIndex((l) => l.id === id);
      if (idx >= 0 && idx < d.lines.length - 1) setFocusedLineId(d.lines[idx + 1].id);
      return d;
    });
  }, []);

  const appendRefToFocused = useCallback((targetId: string) => {
    const focusedId = focusedLineIdRef.current;
    if (!focusedId || focusedId === targetId) return;
    setDoc((d) => {
      const line = d.lines.find((l) => l.id === focusedId);
      if (!line) return d;
      const sep = line.text.length > 0 && !line.text.endsWith(' ') ? ' ' : '';
      const newText = `${line.text}${sep}@{${targetId}} `;
      return updateLine(d, focusedId, newText);
    });
  }, []);

  const replaceDocument = useCallback((next: DocumentModel) => {
    if (!next.lines || next.lines.length === 0) return;
    setDoc(next);
    setFocusedLineId(next.lines[0].id);
  }, []);

  const clearDocument = useCallback(() => {
    const fresh = createEmptyDocument();
    setDoc(fresh);
    setFocusedLineId(fresh.lines[0].id);
  }, []);

  const setTitle = useCallback((title: string) => {
    setDoc((d) => docSetTitle(d, title));
  }, []);

  return {
    doc,
    results,
    lineValues,
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
    replaceDocument,
    clearDocument,
    setTitle,
  };
}
