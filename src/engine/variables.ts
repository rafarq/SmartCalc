const RE_ASSIGN = /^([a-zA-ZáéíóúüñÁÉÍÓÚÜÑ_][\wáéíóúüñÁÉÍÓÚÜÑ]*)\s*=\s*(.+)$/;

export function tryAssignment(line: string): { name: string; expr: string } | null {
  const m = line.trim().match(RE_ASSIGN);
  if (!m) return null;
  return { name: m[1], expr: m[2].trim() };
}
