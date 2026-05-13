import { useCallback, useState } from 'react';
import { createEmptyDocument, addLine, updateLine, type DocumentModel } from '../state/document';

export function useDocument() {
  const [doc, setDoc] = useState<DocumentModel>(() => createEmptyDocument());

  const setLineText = useCallback((id: string, text: string) => {
    setDoc((d) => updateLine(d, id, text));
  }, []);

  const insertLineAfter = useCallback((index: number) => {
    setDoc((d) => addLine(d, index));
  }, []);

  return { doc, setLineText, insertLineAfter };
}
