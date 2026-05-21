export type LocalResult = { value: number } | null;

// Acepta tanto un literal numérico (3, -3.14) como uno entre paréntesis
// como los que produce expandRefs para las referencias entre líneas
// («@{abc}» → «(1234)»). Cualquiera de las dos formas vale en un lateral
// de la frase «X es qué % de Y», «X + N% de algo», la regla de tres, etc.
const N = String.raw`-?\d+(?:\.\d+)?`;
const NUM = String.raw`(?:\(\s*${N}\s*\)|${N})`;

function num(s: string): number {
  return parseFloat(s.replace(/[()\s]/g, ''));
}

const RE_ADD_PCT = new RegExp(
  String.raw`^(${NUM})\s*([+-])\s*(${NUM})\s*%(?:\s+de\s+\w+)?$`,
  'i',
);
const RE_PCT_OF = new RegExp(String.raw`^(${NUM})\s*%\s+de\s+(${NUM})$`, 'i');
const RE_WHAT_PCT = new RegExp(
  String.raw`^(${NUM})\s+es\s+qu[eé]\s*%\s+de\s+(${NUM})$`,
  'i',
);

// Regla de tres con "?" al final: "si A [unit] (es|son) B [unit], C [unit] (es|son) ?"
const RE_RULE_3_Q = new RegExp(
  String.raw`^si\s+(${NUM})(?:\s+[^\s,?]+)?\s+(?:es|son)\s+(${NUM})(?:\s*[^\s,?]+)?[\s,]+(${NUM})(?:\s+[^\s,?]+)?\s+(?:es|son)\s+\?$`,
  'i',
);

// Regla de tres con "cuánto" al inicio del segundo miembro:
// "si A [unit] (es|son) B [unit], cuánto (es|son) C [unit]"
const RE_RULE_3_HM = new RegExp(
  String.raw`^si\s+(${NUM})(?:\s+[^\s,?]+)?\s+(?:es|son)\s+(${NUM})(?:\s*[^\s,?]+)?[\s,]+cu[aá]nto\s+(?:es|son)\s+(${NUM})(?:\s*[^\s,?]+)?\s*\??$`,
  'i',
);

export function tryPercentages(line: string): LocalResult {
  const t = line.trim();
  const a = t.match(RE_ADD_PCT);
  if (a) {
    const base = num(a[1]);
    const sign = a[2] === '+' ? 1 : -1;
    const pct = num(a[3]);
    return { value: base + sign * base * (pct / 100) };
  }
  const b = t.match(RE_PCT_OF);
  if (b) return { value: (num(b[1]) / 100) * num(b[2]) };
  const c = t.match(RE_WHAT_PCT);
  if (c) return { value: (num(c[1]) / num(c[2])) * 100 };
  const d = t.match(RE_RULE_3_Q) ?? t.match(RE_RULE_3_HM);
  if (d) {
    const [a3, b3, c3] = [num(d[1]), num(d[2]), num(d[3])];
    return { value: (b3 / a3) * c3 };
  }
  return null;
}
