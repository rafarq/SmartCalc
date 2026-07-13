import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { evaluate, type Result } from '../engine';
import {
  createEmptyDocument,
  addLine,
  splitLine,
  mergeLineWithPrevious,
  updateLine,
  deleteTextRange,
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
  const docRef = useRef(doc);
  const undoStackRef = useRef<DocumentModel[]>([]);
  const redoStackRef = useRef<DocumentModel[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [focusedLineId, setFocusedLineId] = useState<string | null>(null);
  const [focusedCursorOffset, setFocusedCursorOffset] = useState<number | null>(null);
  const focusedLineIdRef = useRef<string | null>(null);
  focusedLineIdRef.current = focusedLineId;

  const updateDocument = useCallback(
    (updater: (current: DocumentModel) => DocumentModel) => {
      const current = docRef.current;
      const next = updater(current);
      if (next === current) return;
      undoStackRef.current.push(current);
      redoStackRef.current = [];
      docRef.current = next;
      setCanUndo(true);
      setCanRedo(false);
      setDoc(next);
    },
    [],
  );

  const undo = useCallback(() => {
    const current = docRef.current;
    const previous = undoStackRef.current.pop();
    if (!previous) return;
    redoStackRef.current.push(current);
    docRef.current = previous;
    setCanUndo(undoStackRef.current.length > 0);
    setCanRedo(true);
    if (!previous.lines.some((line) => line.id === focusedLineIdRef.current)) {
      const currentIndex = current.lines.findIndex((line) => line.id === focusedLineIdRef.current);
      const fallbackIndex = Math.min(Math.max(currentIndex, 0), previous.lines.length - 1);
      setFocusedLineId(previous.lines[fallbackIndex].id);
    }
    setDoc(previous);
    setFocusedCursorOffset(null);
  }, []);

  const redo = useCallback(() => {
    const current = docRef.current;
    const next = redoStackRef.current.pop();
    if (!next) return;
    undoStackRef.current.push(current);
    docRef.current = next;
    setCanUndo(true);
    setCanRedo(redoStackRef.current.length > 0);
    if (!next.lines.some((line) => line.id === focusedLineIdRef.current)) {
      const currentIndex = current.lines.findIndex((line) => line.id === focusedLineIdRef.current);
      const fallbackIndex = Math.min(Math.max(currentIndex, 0), next.lines.length - 1);
      setFocusedLineId(next.lines[fallbackIndex].id);
    }
    setDoc(next);
    setFocusedCursorOffset(null);
  }, []);

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
    updateDocument((d) => updateLine(d, id, text));
  }, [updateDocument]);

  const insertLineAfter = useCallback((id: string, cursorOffset?: number, currentText?: string) => {
    updateDocument((d) => {
      if (cursorOffset !== undefined) {
        const split = splitLine(d, id, cursorOffset, currentText);
        if (!split) return d;
        setFocusedLineId(split.newId);
        setFocusedCursorOffset(0);
        return split.doc;
      }

      const index = d.lines.findIndex((line) => line.id === id);
      if (index === -1) return d;
      const { doc: next, newId } = addLine(d, index);
      setFocusedLineId(newId);
      setFocusedCursorOffset(0);
      return next;
    });
  }, [updateDocument]);

  const insertLineAtEnd = useCallback(() => {
    updateDocument((d) => {
      const { doc: next, newId } = addLine(d, d.lines.length - 1);
      setFocusedLineId(newId);
      setFocusedCursorOffset(0);
      return next;
    });
  }, [updateDocument]);

  const removeLine = useCallback((id: string) => {
    updateDocument((d) => {
      if (d.lines.length <= 1) return d;
      const idx = d.lines.findIndex((l) => l.id === id);
      if (idx === -1) return d;
      const newLines = d.lines.filter((l) => l.id !== id);
      const focusTargetId = idx === 0 ? newLines[0].id : d.lines[idx - 1].id;
      setFocusedLineId(focusTargetId);
      setFocusedCursorOffset(null);
      return { ...d, lines: newLines };
    });
  }, [updateDocument]);

  const focusLine = useCallback((id: string) => {
    setFocusedLineId(id);
    setFocusedCursorOffset(null);
  }, []);

  const focusPrevLine = useCallback((id: string) => {
    setDoc((d) => {
      const idx = d.lines.findIndex((l) => l.id === id);
      if (idx > 0) {
        setFocusedLineId(d.lines[idx - 1].id);
        setFocusedCursorOffset(null);
      }
      return d;
    });
  }, []);

  const focusNextLine = useCallback((id: string) => {
    setDoc((d) => {
      const idx = d.lines.findIndex((l) => l.id === id);
      if (idx >= 0 && idx < d.lines.length - 1) {
        setFocusedLineId(d.lines[idx + 1].id);
        setFocusedCursorOffset(null);
      }
      return d;
    });
  }, []);

  const mergeLineIntoPrevious = useCallback((id: string, currentText?: string) => {
    updateDocument((d) => {
      const merged = mergeLineWithPrevious(d, id, currentText);
      if (!merged) return d;
      setFocusedLineId(merged.focusId);
      setFocusedCursorOffset(merged.cursorOffset);
      return merged.doc;
    });
  }, [updateDocument]);

  const deleteSelectionAcrossLines = useCallback(
    (startId: string, startOffset: number, endId: string, endOffset: number) => {
      updateDocument((d) => deleteTextRange(d, startId, startOffset, endId, endOffset));
      setFocusedLineId(startId);
      setFocusedCursorOffset(startOffset);
    },
    [updateDocument],
  );

  const appendRefToFocused = useCallback((targetId: string) => {
    const focusedId = focusedLineIdRef.current;
    if (!focusedId || focusedId === targetId) return;
    updateDocument((d) => {
      const line = d.lines.find((l) => l.id === focusedId);
      if (!line) return d;
      const sep = line.text.length > 0 && !line.text.endsWith(' ') ? ' ' : '';
      const newText = `${line.text}${sep}@{${targetId}} `;
      return updateLine(d, focusedId, newText);
    });
  }, [updateDocument]);

  const replaceDocument = useCallback((next: DocumentModel) => {
    if (!next.lines || next.lines.length === 0) return;
    updateDocument(() => next);
    setFocusedLineId(next.lines[0].id);
    setFocusedCursorOffset(null);
  }, [updateDocument]);

  const clearDocument = useCallback(() => {
    const fresh = createEmptyDocument();
    updateDocument(() => fresh);
    setFocusedLineId(fresh.lines[0].id);
    setFocusedCursorOffset(0);
  }, [updateDocument]);

  const setTitle = useCallback((title: string) => {
    updateDocument((d) => docSetTitle(d, title));
  }, [updateDocument]);

  return {
    doc,
    results,
    lineValues,
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
    replaceDocument,
    clearDocument,
    setTitle,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
