const RE_IS_PCT_OF = /^(-?\d+(?:\.\d+)?)\s+es\s+el\s+(\d+(?:\.\d+)?)\s*%\s+de\s+qu[eé]$/i;
const RE_DISCOUNT = /^(-?\d+(?:\.\d+)?)\s+tiene\s+un\s+(\d+(?:\.\d+)?)\s*%\s+de\s+descuento\s+en\s+qu[eé]$/i;
const RE_INCREASE = /^(-?\d+(?:\.\d+)?)\s+tiene\s+un\s+(\d+(?:\.\d+)?)\s*%\s+de\s+aumento\s+en\s+qu[eé]$/i;

export function tryInverse(line: string): { value: number } | null {
  const t = line.trim();
  let m;
  if ((m = t.match(RE_IS_PCT_OF))) return { value: (parseFloat(m[1]) / parseFloat(m[2])) * 100 };
  if ((m = t.match(RE_DISCOUNT)))
    return { value: parseFloat(m[1]) / (1 - parseFloat(m[2]) / 100) };
  if ((m = t.match(RE_INCREASE)))
    return { value: parseFloat(m[1]) / (1 + parseFloat(m[2]) / 100) };
  return null;
}
