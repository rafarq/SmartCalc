export type Token = { type: 'text'; value: string } | { type: 'ref'; id: string };

const REF_RE = /@\{([^}]+)\}/g;

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  let lastIdx = 0;
  let m: RegExpExecArray | null;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(text))) {
    if (m.index > lastIdx) out.push({ type: 'text', value: text.slice(lastIdx, m.index) });
    out.push({ type: 'ref', id: m[1] });
    lastIdx = REF_RE.lastIndex;
  }
  if (lastIdx < text.length) out.push({ type: 'text', value: text.slice(lastIdx) });
  return out;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const VAR_WORD_CHAR = /[\wáéíóúüñÁÉÍÓÚÜÑ]/;

function renderTextWithVars(seg: string, varSet: Set<string>): string {
  if (varSet.size === 0) return escapeHtml(seg);
  let out = '';
  let i = 0;
  while (i < seg.length) {
    if (VAR_WORD_CHAR.test(seg[i])) {
      let j = i;
      while (j < seg.length && VAR_WORD_CHAR.test(seg[j])) j++;
      const word = seg.slice(i, j);
      if (varSet.has(word)) {
        out += `<span class="var-chip" data-var="${escapeHtml(word)}">${escapeHtml(word)}</span>`;
      } else {
        out += escapeHtml(word);
      }
      i = j;
    } else {
      out += escapeHtml(seg[i]);
      i++;
    }
  }
  return out;
}

export function renderTokensToHTML(
  text: string,
  lineValues: Record<string, string>,
  varNames: string[] = [],
): string {
  const varSet = new Set(varNames);
  return tokenize(text)
    .map((t) => {
      if (t.type === 'text') return renderTextWithVars(t.value, varSet);
      const display = lineValues[t.id] ?? '?';
      return `<span class="ref-chip" data-ref="${escapeHtml(t.id)}" contenteditable="false">${escapeHtml(
        display,
      )}</span>`;
    })
    .join('');
}

export function extractText(el: HTMLElement): string {
  let out = '';
  el.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      out += node.textContent ?? '';
    } else if (node instanceof HTMLElement) {
      const ref = node.dataset.ref;
      if (ref) {
        out += `@{${ref}}`;
      } else if (node.tagName === 'BR') {
        // ignorar saltos de línea: el documento son líneas separadas
      } else {
        out += node.textContent ?? '';
      }
    }
  });
  return out;
}

export function getCursorTextOffset(el: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return extractText(el).length;

  const range = sel.getRangeAt(0);
  if (!el.contains(range.startContainer)) return extractText(el).length;

  const beforeCursor = range.cloneRange();
  beforeCursor.selectNodeContents(el);
  beforeCursor.setEnd(range.startContainer, range.startOffset);

  const container = document.createElement('div');
  container.appendChild(beforeCursor.cloneContents());
  return extractText(container).length;
}

function serializedNodeLength(node: ChildNode): number {
  if (node.nodeType === Node.TEXT_NODE) return (node.textContent ?? '').length;
  if (!(node instanceof HTMLElement)) return 0;

  const ref = node.dataset.ref;
  if (ref) return `@{${ref}}`.length;
  if (node.tagName === 'BR') return 0;

  let length = 0;
  node.childNodes.forEach((child) => {
    length += serializedNodeLength(child);
  });
  return length;
}

function setRangeStartAtTextOffset(range: Range, root: HTMLElement, offset: number): void {
  let remaining = Math.max(0, offset);

  for (const child of Array.from(root.childNodes)) {
    const length = serializedNodeLength(child);
    if (remaining <= length) {
      if (child.nodeType === Node.TEXT_NODE) {
        range.setStart(child, Math.min(remaining, (child.textContent ?? '').length));
        return;
      }

      if (child instanceof HTMLElement) {
        const ref = child.dataset.ref;
        if (ref || child.tagName === 'BR') {
          if (remaining <= 0) range.setStartBefore(child);
          else range.setStartAfter(child);
          return;
        }

        setRangeStartAtTextOffset(range, child, remaining);
        return;
      }

      range.setStartAfter(child);
      return;
    }
    remaining -= length;
  }

  range.selectNodeContents(root);
  range.collapse(false);
}

export function placeCursorAtTextOffset(el: HTMLElement, offset: number): void {
  const range = document.createRange();
  setRangeStartAtTextOffset(range, el, offset);
  range.collapse(true);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export function placeCursorAtEnd(el: HTMLElement): void {
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

export function expandRefs(text: string, lineValues: Record<string, number>): string {
  return text.replace(REF_RE, (_, id: string) => {
    const v = lineValues[id];
    return v !== undefined && Number.isFinite(v) ? `(${v})` : '0';
  });
}
