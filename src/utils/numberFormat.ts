export function formatNumber(value: unknown, decimals?: number): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    return new Intl.NumberFormat('es-ES', {
      maximumFractionDigits: decimals ?? 6,
    }).format(value);
  }
  return String(value);
}
