export type Formula = {
  template: string; // ej: 'area.circulo.radio.'
  args: number; // cantidad de valores numéricos esperados
  compute: (values: number[]) => number;
  resultExp: 1 | 2 | 3; // 1 = lineal (perímetro), 2 = área, 3 = volumen
  description?: string;
};

export const GEOMETRY_CATALOG: Formula[] = [
  // ÁREA
  { template: 'area.circulo.radio.', args: 1, compute: ([r]) => Math.PI * r * r, resultExp: 2, description: 'Círculo (radio)' },
  { template: 'area.circulo.diametro.', args: 1, compute: ([d]) => Math.PI * (d / 2) ** 2, resultExp: 2, description: 'Círculo (diámetro)' },
  { template: 'area.cuadrado.lado.', args: 1, compute: ([l]) => l * l, resultExp: 2, description: 'Cuadrado (lado)' },
  { template: 'area.rectangulo.lados.', args: 2, compute: ([a, b]) => a * b, resultExp: 2, description: 'Rectángulo (lados)' },
  { template: 'area.triangulo.base_altura.', args: 2, compute: ([b, h]) => (b * h) / 2, resultExp: 2, description: 'Triángulo (base, altura)' },
  { template: 'area.triangulo_equilatero.lado.', args: 1, compute: ([l]) => (Math.sqrt(3) / 4) * l * l, resultExp: 2, description: 'Triángulo equilátero (lado)' },
  { template: 'area.rombo.diagonales.', args: 2, compute: ([D, d]) => (D * d) / 2, resultExp: 2, description: 'Rombo (diagonales)' },
  { template: 'area.trapecio.bases_altura.', args: 3, compute: ([B, b, h]) => ((B + b) * h) / 2, resultExp: 2, description: 'Trapecio (B, b, altura)' },
  { template: 'area.elipse.semiejes.', args: 2, compute: ([a, b]) => Math.PI * a * b, resultExp: 2, description: 'Elipse (semiejes)' },
  // PERÍMETRO
  { template: 'perimetro.cuadrado.lado.', args: 1, compute: ([l]) => 4 * l, resultExp: 1, description: 'Cuadrado (lado)' },
  { template: 'perimetro.rectangulo.lados.', args: 2, compute: ([a, b]) => 2 * (a + b), resultExp: 1, description: 'Rectángulo (lados)' },
  { template: 'perimetro.circulo.radio.', args: 1, compute: ([r]) => 2 * Math.PI * r, resultExp: 1, description: 'Círculo (radio)' },
  { template: 'perimetro.circulo.diametro.', args: 1, compute: ([d]) => Math.PI * d, resultExp: 1, description: 'Círculo (diámetro)' },
  { template: 'perimetro.triangulo_equilatero.lado.', args: 1, compute: ([l]) => 3 * l, resultExp: 1, description: 'Triángulo equilátero (lado)' },
  // VOLUMEN
  { template: 'volumen.cubo.lado.', args: 1, compute: ([l]) => l ** 3, resultExp: 3, description: 'Cubo (lado)' },
  { template: 'volumen.esfera.radio.', args: 1, compute: ([r]) => (4 / 3) * Math.PI * r ** 3, resultExp: 3, description: 'Esfera (radio)' },
  { template: 'volumen.cilindro.radio_altura.', args: 2, compute: ([r, h]) => Math.PI * r * r * h, resultExp: 3, description: 'Cilindro (radio, altura)' },
  { template: 'volumen.cono.radio_altura.', args: 2, compute: ([r, h]) => (Math.PI * r * r * h) / 3, resultExp: 3, description: 'Cono (radio, altura)' },
  { template: 'volumen.prisma_rectangular.lados.', args: 3, compute: ([a, b, c]) => a * b * c, resultExp: 3, description: 'Prisma rectangular (a, b, c)' },
];

const UNIT_GROUP = '(?:mm|cm|m|km|in|ft|yd)';
const VALUE_RE = new RegExp(`(-?\\d+(?:\\.\\d+)?)\\s*(${UNIT_GROUP})?`, 'g');

const SUPER: Record<1 | 2 | 3, string> = { 1: '', 2: '²', 3: '³' };

export type GeometryResult = { value: number; unit: string };

export function tryGeometry(line: string): GeometryResult | null {
  const trimmed = line.trim();
  // Buscamos la fórmula cuya plantilla coincide; las plantillas terminan en '.'.
  const formula = GEOMETRY_CATALOG.find((f) => trimmed.startsWith(f.template));
  if (!formula) return null;
  const rest = trimmed.slice(formula.template.length).trim();
  if (!rest) return null;

  const matches = [...rest.matchAll(VALUE_RE)];
  if (matches.length !== formula.args) return null;
  if (matches.some((m) => !Number.isFinite(parseFloat(m[1])))) return null;

  const values = matches.map((m) => parseFloat(m[1]));
  const unit = matches.find((m) => m[2])?.[2] ?? 'm';
  const value = formula.compute(values);
  return { value, unit: `${unit}${SUPER[formula.resultExp]}` };
}
