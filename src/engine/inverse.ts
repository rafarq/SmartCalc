// Acepta literales numéricos o referencias expandidas («(1234)») en ambos
// lados de las frases inversas.
const N = String.raw`-?\d+(?:\.\d+)?`;
const NUM = String.raw`(?:\(\s*${N}\s*\)|${N})`;

function num(s: string): number {
  return parseFloat(s.replace(/[()\s]/g, ''));
}

const RE_IS_PCT_OF = new RegExp(
  String.raw`^(${NUM})\s+es\s+el\s+(${NUM})\s*%\s+de\s+qu[eé]$`,
  'i',
);
const RE_DISCOUNT = new RegExp(
  String.raw`^(${NUM})\s+tiene\s+un\s+(${NUM})\s*%\s+de\s+descuento\s+en\s+qu[eé]$`,
  'i',
);
const RE_INCREASE = new RegExp(
  String.raw`^(${NUM})\s+tiene\s+un\s+(${NUM})\s*%\s+de\s+aumento\s+en\s+qu[eé]$`,
  'i',
);

export function tryInverse(line: string): { value: number } | null {
  const t = line.trim();
  let m;
  if ((m = t.match(RE_IS_PCT_OF))) return { value: (num(m[1]) / num(m[2])) * 100 };
  if ((m = t.match(RE_DISCOUNT))) return { value: num(m[1]) / (1 - num(m[2]) / 100) };
  if ((m = t.match(RE_INCREASE))) return { value: num(m[1]) / (1 + num(m[2]) / 100) };
  return null;
}
