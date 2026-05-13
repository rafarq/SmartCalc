export type Line = { id: string; text: string };
export type DocumentModel = { lines: Line[] };

const newId = () => crypto.randomUUID();

export const createEmptyDocument = (): DocumentModel => ({
  lines: [{ id: newId(), text: '' }],
});

export const addLine = (doc: DocumentModel, afterIndex: number): DocumentModel => {
  const lines = [...doc.lines];
  lines.splice(afterIndex + 1, 0, { id: newId(), text: '' });
  return { lines };
};

export const updateLine = (doc: DocumentModel, id: string, text: string): DocumentModel => ({
  lines: doc.lines.map((l) => (l.id === id ? { ...l, text } : l)),
});
