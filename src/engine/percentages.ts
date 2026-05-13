export type LocalResult = { value: number } | null;

const RE_ADD_PCT = /^(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)\s*%(?:\s+de\s+\w+)?$/i;
const RE_PCT_OF = /^(\d+(?:\.\d+)?)\s*%\s+de\s+(-?\d+(?:\.\d+)?)$/i;
const RE_WHAT_PCT = /^(-?\d+(?:\.\d+)?)\s+es\s+qu[eé]\s*%\s+de\s+(-?\d+(?:\.\d+)?)$/i;

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
  return null;
}
