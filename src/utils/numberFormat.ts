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

const SUPERSCRIPT_DIGITS: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '-': '⁻',
};

function toSuperscript(n: number): string {
  return [...String(n)]
    .map((c) => SUPERSCRIPT_DIGITS[c] ?? c)
    .join('');
}

// Versión compacta para móvil:
//   - |x| >= 100 000  → 1,23 k / 4,5 M / 9 B / …
//   - 0 < |x| < 1e-3  → 1,23·10⁻⁴ (notación científica con superíndice)
//   - resto           → formato normal con `decimals` decimales
export function formatNumberCompact(value: unknown, decimals: number): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return formatNumber(value, decimals);
  const abs = Math.abs(value);

  if (abs > 0 && abs < 1e-3) {
    const exp = Math.floor(Math.log10(abs));
    const mant = value / Math.pow(10, exp);
    const mantStr = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(mant);
    return `${mantStr}·10${toSuperscript(exp)}`;
  }

  if (abs >= 1e5) {
    let divisor = 1;
    let suffix = '';
    if (abs >= 1e15) { divisor = 1e15; suffix = ' P'; }
    else if (abs >= 1e12) { divisor = 1e12; suffix = ' T'; }
    else if (abs >= 1e9) { divisor = 1e9; suffix = ' B'; }
    else if (abs >= 1e6) { divisor = 1e6; suffix = ' M'; }
    else { divisor = 1e3; suffix = ' k'; }
    const n = value / divisor;
    const nStr = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    }).format(n);
    return `${nStr}${suffix}`;
  }

  return formatNumber(value, decimals);
}
