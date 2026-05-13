export function formatNumber(value: unknown): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(value);
  }
  return String(value);
}
