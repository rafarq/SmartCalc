import { DEFAULT_TITLE, type DocumentModel } from './document';

const KEY = 'smartcalc:doc';

export function saveLocal(doc: DocumentModel): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(doc));
  } catch {
    // localStorage puede no estar disponible
  }
}

export function loadLocal(): DocumentModel | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return normalizeDocument(parsed);
  } catch {
    return null;
  }
}

export function exportSyscalc(doc: DocumentModel): void {
  const safeTitle = sanitizeFilename(doc.title || DEFAULT_TITLE);
  const name = `${safeTitle}.syscalc`;
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importSyscalc(file: File): Promise<DocumentModel> {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const doc = normalizeDocument(parsed);
  if (!doc) throw new Error('Archivo .syscalc inválido (estructura no reconocida)');
  return doc;
}

function normalizeDocument(x: unknown): DocumentModel | null {
  if (!x || typeof x !== 'object') return null;
  const obj = x as { title?: unknown; lines?: unknown };
  if (!Array.isArray(obj.lines)) return null;
  const validLines = obj.lines.every(
    (l) =>
      typeof l === 'object' &&
      l !== null &&
      typeof (l as { id?: unknown }).id === 'string' &&
      typeof (l as { text?: unknown }).text === 'string',
  );
  if (!validLines) return null;
  const title = typeof obj.title === 'string' && obj.title.trim() ? obj.title : DEFAULT_TITLE;
  return { title, lines: obj.lines as DocumentModel['lines'] };
}

function sanitizeFilename(name: string): string {
  // Sustituye caracteres problemáticos en nombres de archivo en macOS/Windows/Linux.
  return name
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 100) || DEFAULT_TITLE;
}
