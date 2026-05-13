export type Line = { id: string; text: string };
export type DocumentModel = { title: string; lines: Line[] };

export const DEFAULT_TITLE = 'Sin título';

const newId = () => crypto.randomUUID();

export const createEmptyDocument = (): DocumentModel => ({
  title: DEFAULT_TITLE,
  lines: [{ id: newId(), text: '' }],
});

export const addLine = (
  doc: DocumentModel,
  afterIndex: number,
): { doc: DocumentModel; newId: string } => {
  const id = newId();
  const lines = [...doc.lines];
  lines.splice(afterIndex + 1, 0, { id, text: '' });
  return { doc: { ...doc, lines }, newId: id };
};

export const updateLine = (doc: DocumentModel, id: string, text: string): DocumentModel => ({
  ...doc,
  lines: doc.lines.map((l) => (l.id === id ? { ...l, text } : l)),
});

export const setTitle = (doc: DocumentModel, title: string): DocumentModel => ({
  ...doc,
  title,
});
