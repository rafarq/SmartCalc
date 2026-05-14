export type LocalResult = { value: number } | null;

const RE_ADD_PCT = /^(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)\s*%(?:\s+de\s+\w+)?$/i;
const RE_PCT_OF = /^(\d+(?:\.\d+)?)\s*%\s+de\s+(-?\d+(?:\.\d+)?)$/i;
const RE_WHAT_PCT = /^(-?\d+(?:\.\d+)?)\s+es\s+qu[eé]\s*%\s+de\s+(-?\d+(?:\.\d+)?)$/i;
// Regla de tres con "?" al final: "si A [unit] (es|son) B [unit], C [unit] (es|son) ?"
const RE_RULE_3_Q =
  /^si\s+(-?\d+(?:\.\d+)?)(?:\s+[^\s,?]+)?\s+(?:es|son)\s+(-?\d+(?:\.\d+)?)(?:\s*[^\s,?]+)?[\s,]+(-?\d+(?:\.\d+)?)(?:\s+[^\s,?]+)?\s+(?:es|son)\s+\?$/i;

// Regla de tres con "cuánto" al inicio del segundo miembro:
// "si A [unit] (es|son) B [unit], cuánto (es|son) C [unit]"
const RE_RULE_3_HM =
  /^si\s+(-?\d+(?:\.\d+)?)(?:\s+[^\s,?]+)?\s+(?:es|son)\s+(-?\d+(?:\.\d+)?)(?:\s*[^\s,?]+)?[\s,]+cu[aá]nto\s+(?:es|son)\s+(-?\d+(?:\.\d+)?)(?:\s*[^\s,?]+)?\s*\??$/i;

export function tryPercentages(line: string): LocalResult {
  const t = line.trim();
  const a = t.match(RE_ADD_PCT);
  if (a) {
    const base = parseFloat(a[1]);
    const sign = a[2] === '+' ? 1 : -1;
    const pct = parseFloat(a[3]);
    return { value: base + sign * base * (pct / 100) };
  }
  const b = t.match(RE_PCT_OF);
  if (b) return { value: (parseFloat(b[1]) / 100) * parseFloat(b[2]) };
  const c = t.match(RE_WHAT_PCT);
  if (c) return { value: (parseFloat(c[1]) / parseFloat(c[2])) * 100 };
  const d = t.match(RE_RULE_3_Q) ?? t.match(RE_RULE_3_HM);
  if (d) {
    const [a3, b3, c3] = [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3])];
    return { value: (b3 / a3) * c3 };
  }
  return null;
}
