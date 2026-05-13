const ABBREV_RE = /(\d+(?:\.\d+)?)(k|M)\b(?!\w)/g;

export function preprocess(line: string): string {
  return line.replace(ABBREV_RE, (_, num: string, suf: string) => {
    const mult = suf === 'k' ? 1000 : 1_000_000;
    return `(${num} * ${mult})`;
  });
}
