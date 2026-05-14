export function formatNumber(value: unknown, decimals?: number): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    // Si se pasa un nº de decimales explícito, lo aplicamos como mínimo y máximo
    // para que 9 con decimales=4 se muestre como "9,0000". Sin argumento,
    // mantenemos el comportamiento clásico: hasta 6 decimales pero sin rellenos.
    const opts =
      decimals === undefined
        ? { maximumFractionDigits: 6 }
        : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
    return new Intl.NumberFormat('es-ES', opts).format(value);
  }
  return String(value);
}
