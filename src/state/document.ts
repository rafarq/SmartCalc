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

export const splitLine = (
  doc: DocumentModel,
  id: string,
  offset: number,
  textOverride?: string,
): { doc: DocumentModel; newId: string } | null => {
  const index = doc.lines.findIndex((line) => line.id === id);
  if (index === -1) return null;

  const source = textOverride ?? doc.lines[index].text;
  const splitAt = Math.max(0, Math.min(offset, source.length));
  const idForNewLine = newId();
  const lines = [...doc.lines];
  lines.splice(
    index,
    1,
    { ...doc.lines[index], text: source.slice(0, splitAt) },
    { id: idForNewLine, text: source.slice(splitAt) },
  );
  return { doc: { ...doc, lines }, newId: idForNewLine };
};

export const mergeLineWithPrevious = (
  doc: DocumentModel,
  id: string,
  textOverride?: string,
): { doc: DocumentModel; focusId: string; cursorOffset: number } | null => {
  const index = doc.lines.findIndex((line) => line.id === id);
  if (index <= 0) return null;

  const previous = doc.lines[index - 1];
  const current = doc.lines[index];
  const currentText = textOverride ?? current.text;
  const cursorOffset = previous.text.length;
  const lines = [...doc.lines];
  lines.splice(index - 1, 2, { ...previous, text: previous.text + currentText });

  return { doc: { ...doc, lines }, focusId: previous.id, cursorOffset };
};

export const updateLine = (doc: DocumentModel, id: string, text: string): DocumentModel => ({
  ...doc,
  lines: doc.lines.map((l) => (l.id === id ? { ...l, text } : l)),
});

export const setTitle = (doc: DocumentModel, title: string): DocumentModel => ({
  ...doc,
  title,
});
