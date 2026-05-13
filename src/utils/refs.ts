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
        out += `<span class="var-chip" data-var="${escapeHtml(word)}" contenteditable="false">${escapeHtml(word)}</span>`;
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
