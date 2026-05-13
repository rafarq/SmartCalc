import type { DocumentModel } from './document';

const KEY = 'smartcalc:doc';

export function saveLocal(doc: DocumentModel): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(doc));
  } catch {
    // localStorage puede no estar disponible (modo privado en Safari, cuotas, etc.)
  }
}

export function loadLocal(): DocumentModel | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isValidDocument(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function exportSyscalc(doc: DocumentModel): void {
  const now = new Date();
  const yyyymmdd = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
    now.getDate(),
  ).padStart(2, '0')}`;
  const name = `SmartCalc-${yyyymmdd}.syscalc`;
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
  if (!isValidDocument(parsed)) {
    throw new Error('Archivo .syscalc inválido (estructura no reconocida)');
  }
  return parsed;
}

function isValidDocument(x: unknown): x is DocumentModel {
  if (!x || typeof x !== 'object') return false;
  const obj = x as { lines?: unknown };
  if (!Array.isArray(obj.lines)) return false;
  return obj.lines.every(
    (l) =>
      typeof l === 'object' &&
      l !== null &&
      typeof (l as { id?: unknown }).id === 'string' &&
      typeof (l as { text?: unknown }).text === 'string',
  );
}
