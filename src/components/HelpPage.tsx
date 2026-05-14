import { useEffect } from 'react';
import { CloseIcon } from './icons';

type Props = { onClose: () => void };

type Example = { input: string; result: string };

type AliasRow = { english: string; spanish?: string; description: string };

type AliasGroup = { heading: string; rows: AliasRow[] };

type Section = {
  title: string;
  description?: string;
  examples?: Example[];
  useCases?: Example[];
  notes?: string[];
  aliasGroups?: AliasGroup[];
};

const SECTIONS: Section[] = [
  {
    title: 'Atajos de teclado',
    notes: [
      'Enter — inserta una nueva línea debajo y mueve el cursor a ella.',
      '↑ / ↓ — salta a la línea anterior o siguiente, manteniendo el cursor al final del texto de destino.',
      'Backspace en línea vacía — elimina la línea y vuelve al final de la anterior.',
      'Click en cualquier punto de una fila — enfoca esa línea directamente, sin tener que recorrer todas las anteriores.',
      'Esc (con la ayuda abierta) — cierra esta página.',
    ],
  },
  {
    title: 'Operaciones básicas',
    description: 'Escribe los cálculos como en una calculadora estándar.',
    examples: [
      { input: '2 + 3', result: '5' },
      { input: '25 - 5', result: '20' },
      { input: '9 * 9', result: '81' },
      { input: '20 / 5', result: '4' },
      { input: '2 ^ 10', result: '1024' },
      { input: '10 % 3', result: '1' },
    ],
    useCases: [
      { input: '100 * 1.21', result: '121' },
      { input: '50 - 50 * 0.15', result: '42,5' },
      { input: '120 / 4', result: '30' },
    ],
    notes: ['^ = potencia · % = módulo (resto de la división).'],
  },
  {
    title: 'Funciones matemáticas',
    description: 'Disponibles con nombre en inglés o español. Cualquiera de los dos funciona.',
    examples: [
      { input: 'sqrt(16)   ·   raiz(16)', result: '4' },
      { input: 'abs(-7)', result: '7' },
      { input: 'round(2.5)   ·   redondear(2.5)', result: '3' },
      { input: 'ceil(2.1)   ·   techo(2.1)', result: '3' },
      { input: 'floor(2.9)   ·   suelo(2.9)', result: '2' },
      { input: 'sign(-3)   ·   signo(-3)', result: '-1' },
    ],
    useCases: [
      { input: 'sqrt(3^2 + 4^2)', result: '5' },
      { input: 'abs(120 - 145)', result: '25' },
      { input: 'round(19.99 * 1.21)', result: '24' },
    ],
  },
  {
    title: 'Trigonometría',
    description: 'Funciones trigonométricas en grados (no radianes). Inglés y español equivalentes.',
    examples: [
      { input: 'sin(90)   ·   seno(90)', result: '1' },
      { input: 'cos(180)   ·   coseno(180)', result: '-1' },
      { input: 'tan(45)   ·   tangente(45)', result: '1' },
      { input: 'asin(1)   ·   arcoseno(1)', result: '90' },
      { input: 'acos(0)   ·   arcocoseno(0)', result: '90' },
      { input: 'atan(1)   ·   arcotangente(1)', result: '45' },
    ],
    useCases: [
      { input: '50 * tan(30)', result: '28,87' },
      { input: '10 * sin(45)', result: '7,07' },
      { input: 'atan(5 / 12)', result: '22,62' },
    ],
    notes: [
      'Altura de un objeto a 50 m con ángulo 30° → 50 · tan(30).',
      'Ángulo de una rampa que sube 5 m en 12 m → atan(5 / 12).',
    ],
  },
  {
    title: 'Logaritmos y exponencial',
    description: 'log usa base 10 por defecto. Pasa una segunda base como segundo argumento.',
    examples: [
      { input: 'log(100)', result: '2' },
      { input: 'log(1000)', result: '3' },
      { input: 'log(8, 2)', result: '3' },
      { input: 'ln(e)', result: '1' },
      { input: 'exp(1)', result: '2,718282' },
    ],
    useCases: [
      { input: '-log(0.0001)', result: '4' },
      { input: '10 * log(1000)', result: '30' },
      { input: '1000 * exp(0.05 * 10)', result: '1.648,72' },
    ],
    notes: [
      'ln = logaritmo natural (base e) · exp(x) = e^x.',
      'pH de una concentración 1e-4 mol/L → -log(0.0001).',
      'Decibelios de una potencia relativa de 1000 → 10 · log(1000).',
      'Interés compuesto continuo (1.000 € al 5 % durante 10 años) → 1000 · exp(0.05 · 10).',
    ],
  },
  {
    title: 'Estadística',
    description: 'Acepta cualquier número de argumentos separados por comas.',
    examples: [
      { input: 'min(1, 2, 3)', result: '1' },
      { input: 'max(1, 2, 3)', result: '3' },
      { input: 'mean(2, 4, 6)   ·   media(2, 4, 6)', result: '4' },
      { input: 'median(1, 5, 3)   ·   mediana(1, 5, 3)', result: '3' },
      { input: 'std(2, 4, 4, 4, 5, 5, 7, 9)', result: '2,14' },
    ],
    useCases: [
      { input: 'mean(7, 8.5, 9, 6.5)', result: '7,75' },
      { input: 'max(120, 145, 98, 132) - min(120, 145, 98, 132)', result: '47' },
      { input: 'median(1200, 1500, 1350, 4800, 1450)', result: '1.450' },
    ],
    notes: [
      'Nota media de un trimestre → mean(7, 8.5, 9, 6.5).',
      'Rango de temperaturas semanales → max(...) - min(...).',
      'Salario representativo cuando hay valores atípicos → median en lugar de mean.',
    ],
  },
  {
    title: 'Constantes',
    examples: [
      { input: 'pi', result: '3,141593' },
      { input: 'e', result: '2,718282' },
      { input: 'tau', result: '6,283185' },
    ],
    useCases: [
      { input: 'pi * 5^2', result: '78,54' },
      { input: '2 * pi * 5', result: '31,42' },
      { input: '(4 / 3) * pi * 5^3', result: '523,6' },
    ],
    notes: [
      'Área de un círculo de radio 5 → pi · 5².',
      'Longitud de la circunferencia → 2 · pi · r.',
      'Volumen de una esfera → (4/3) · pi · r³.',
    ],
  },
  {
    title: 'Abreviaturas numéricas',
    description: 'Sufijos k (miles) y M (millones) pegados a un número.',
    examples: [
      { input: '100k', result: '100.000' },
      { input: '2.5M', result: '2.500.000' },
      { input: '3M + 100k', result: '3.100.000' },
    ],
    useCases: [
      { input: '12 * 3.5k', result: '42.000' },
      { input: '1.2M / 12', result: '100.000' },
      { input: '250k * 0.03', result: '7.500' },
    ],
    notes: [
      'Solo se reemplazan cuando son sufijos numéricos: km a millas sigue siendo una conversión de unidades, no 1000 m.',
      'Ingresos anuales con sueldo de 3.500 €/mes → 12 · 3.5k.',
      'Cuota mensual de un préstamo de 1,2 M repartido en 12 meses → 1.2M / 12.',
    ],
  },
  {
    title: 'Variables',
    description:
      'Asigna un valor a un nombre con = y úsalo en líneas posteriores. La variable se recuerda mientras la hoja esté abierta.',
    examples: [
      { input: 'coche = 4', result: '4' },
      { input: 'coche', result: '4' },
      { input: 'coche * 10', result: '40' },
    ],
    useCases: [
      { input: 'precio = 1200', result: '1.200' },
      { input: 'iva = 0.21', result: '0,21' },
      { input: 'precio + precio * iva', result: '1.452' },
    ],
    notes: [
      'El nombre puede empezar por letra (incluidas á, é, í, ó, ú, ü, ñ) o "_" y seguir con letras, números o guiones bajos.',
      'Las variables conocidas se resaltan con un pill verde para distinguirlas de las palabras sueltas (los pills azules son referencias a líneas). El resaltado es solo visual: puedes seguir escribiendo, borrar y mover el cursor dentro de la variable como en texto normal.',
      'Una nueva asignación con el mismo nombre sobrescribe el valor previo.',
      'Si la expresión a la derecha da error, la variable conserva su valor anterior.',
    ],
  },
  {
    title: 'Porcentajes y regla de tres',
    description: 'Frases en español natural que SmartCalc reconoce sin necesidad de operadores.',
    examples: [
      { input: '50 + 10% de impuestos', result: '55' },
      { input: '120 - 30% de descuento', result: '84' },
      { input: '20% de 300', result: '60' },
      { input: '50 es qué % de 200', result: '25' },
      { input: 'si 3 es 6, cuánto es 5', result: '10' },
      { input: 'si 3 kg son 6€, 5 kg son ?', result: '10' },
    ],
    useCases: [
      { input: '90 + 21% de IVA', result: '108,9' },
      { input: '1500 - 15% de descuento', result: '1.275' },
      { input: 'si 100 es 5, cuánto es 250', result: '12,5' },
      { input: 'si 100 km son 5h, 250 km son ?', result: '12,5' },
    ],
    notes: [
      'El texto tras "de" es libre: 10% de propina, 21% de IVA, 30% de descuento… SmartCalc ignora la etiqueta.',
      'Regla de tres — dos formas equivalentes: «si A (es/son) B, cuánto (es/son) C» o «si A (es/son) B, C (es/son) ?». Acepta es/son indistintamente y la coma es opcional.',
      'Las unidades junto a los números son decorativas (€, kg, h, manzanas…): solo se usan los valores numéricos.',
    ],
  },
  {
    title: 'Conversión de unidades',
    description:
      'Sintaxis "valor unidad a unidad". Reconoce nombres en español (singular/plural, mayúsculas/minúsculas) y los traduce internamente al sistema de unidades de mathjs.',
    examples: [
      { input: '5 km a millas', result: '3,11 millas' },
      { input: '100 celsius a fahrenheit', result: '212 fahrenheit' },
      { input: '1 hora a min', result: '60 min' },
      { input: '1 kWh a J', result: '3.600.000 J' },
      { input: '1 m2 a cm2', result: '10.000 cm2' },
      { input: '1 litro a ml', result: '1.000 ml' },
    ],
    useCases: [
      { input: '36 km/h a m/s', result: '10 m/s' },
      { input: '2 horas a minutos', result: '120 minutos' },
      { input: '70 kg a lb', result: '154,32 lb' },
      { input: '500 ml a litros', result: '0,5 litros' },
    ],
    notes: [
      'Categorías soportadas: longitud (m, km, cm, mm, pulgada(s), pie(s), yarda(s), milla(s)), masa (kg, g, mg, lb, oz, tonelada(s)), tiempo (s, min, hora(s), día(s), semana(s), mes(es), año(s)), temperatura (celsius, fahrenheit, kelvin), área (m2, km2, cm2, ft2, acre(s), hectárea(s)), volumen (m3, cm3, litro(s), ml, cl, dl, galón(es), taza(s)), velocidad (m/s, km/h, mph, nudo(s)) y energía (J, kJ, cal, kcal, Wh, kWh, MWh).',
      'El resultado conserva la etiqueta de la unidad de destino tal y como la escribas: "60 min" si pediste "min", "60 minutos" si pediste "minutos".',
      'La conexión es estricta: "5 burbujas a millas" no produce resultado (unidad desconocida).',
    ],
  },
  {
    title: 'Cálculo inverso',
    description:
      'Para cuando conoces el resultado y quieres averiguar el valor original que lo produce.',
    examples: [
      { input: '20 es el 10% de qué', result: '200' },
      { input: '90 tiene un 20% de descuento en qué', result: '112,5' },
      { input: '150 tiene un 15% de aumento en qué', result: '130,43' },
    ],
    useCases: [
      { input: '80 tiene un 20% de descuento en qué', result: '100' },
      { input: '121 tiene un 21% de aumento en qué', result: '100' },
      { input: '12 es el 4% de qué', result: '300' },
    ],
    notes: [
      'Útil para deshacer rebajas: 80 € es el precio rebajado, ¿cuál era el original? → 80 tiene un 20% de descuento en qué.',
      'Útil para deshacer un IVA o recargo: 121 € incluye un 21% de IVA, ¿cuál era la base? → 121 tiene un 21% de aumento en qué.',
      'Útil para extraer la base de una comisión: 12 € es el 4% de la venta total, ¿cuánto se vendió? → 12 es el 4% de qué.',
    ],
  },
  {
    title: 'Glosario de funciones (español ↔ inglés)',
    description:
      'Todas las funciones aceptan su nombre en inglés. Las marcadas también admiten su alias en español. Las que solo aparecen en inglés todavía no tienen alias traducido.',
    aliasGroups: [
      {
        heading: 'Aritméticas',
        rows: [
          { english: 'sqrt(x)', spanish: 'raiz(x)', description: 'Raíz cuadrada' },
          { english: 'abs(x)', description: 'Valor absoluto' },
          { english: 'round(x)', spanish: 'redondear(x)', description: 'Redondeo al entero más cercano' },
          { english: 'ceil(x)', spanish: 'techo(x)', description: 'Redondeo hacia arriba' },
          { english: 'floor(x)', spanish: 'suelo(x)', description: 'Redondeo hacia abajo' },
          { english: 'sign(x)', spanish: 'signo(x)', description: 'Signo: -1, 0 o 1' },
        ],
      },
      {
        heading: 'Trigonometría (grados)',
        rows: [
          { english: 'sin(x)', spanish: 'seno(x)', description: 'Seno' },
          { english: 'cos(x)', spanish: 'coseno(x)', description: 'Coseno' },
          { english: 'tan(x)', spanish: 'tangente(x)', description: 'Tangente' },
          { english: 'asin(x)', spanish: 'arcoseno(x)', description: 'Arcoseno' },
          { english: 'acos(x)', spanish: 'arcocoseno(x)', description: 'Arcocoseno' },
          { english: 'atan(x)', spanish: 'arcotangente(x)', description: 'Arcotangente' },
        ],
      },
      {
        heading: 'Logaritmos y exponencial',
        rows: [
          { english: 'log(x)', description: 'Logaritmo base 10' },
          { english: 'log(x, b)', description: 'Logaritmo en base b' },
          { english: 'ln(x)', description: 'Logaritmo natural (base e)' },
          { english: 'exp(x)', description: 'Exponencial: e^x' },
        ],
      },
      {
        heading: 'Estadística',
        rows: [
          { english: 'min(...)', description: 'Mínimo de los argumentos' },
          { english: 'max(...)', description: 'Máximo de los argumentos' },
          { english: 'mean(...)', spanish: 'media(...)', description: 'Media aritmética' },
          { english: 'median(...)', spanish: 'mediana(...)', description: 'Mediana' },
          { english: 'std(...)', description: 'Desviación típica (muestral)' },
        ],
      },
      {
        heading: 'Constantes',
        rows: [
          { english: 'pi', description: '3,141592…' },
          { english: 'e', description: '2,718281…' },
          { english: 'tau', description: '2π — 6,283185…' },
        ],
      },
    ],
  },
  {
    title: 'Copiar resultado de una línea',
    description:
      'Al pasar el ratón por encima de una línea con resultado aparece un icono de copia junto al valor. Pulsa para copiar el número formateado al portapapeles.',
    notes: [
      'El icono se queda verde con una marca de verificación durante unos instantes para confirmar que se ha copiado.',
      'Se copia exactamente el texto del resultado tal y como aparece en pantalla (con separadores de miles y decimales en formato español).',
      'No pierdes el foco de la línea donde estás escribiendo: el botón se puede pulsar desde cualquier línea sin perder el cursor.',
      'Si el navegador deniega el permiso del portapapeles, la acción no produce error visible (solo no se copia).',
    ],
  },
  {
    title: 'Referencias entre líneas',
    description:
      'Haz click sobre el resultado de cualquier línea (a la derecha) para insertarlo como referencia en la línea donde tienes el cursor. La referencia se muestra como un chip azul con el valor actual.',
    examples: [
      { input: '2000 + 3', result: '2003' },
      { input: '[2003] × 2', result: '4006' },
    ],
    notes: [
      'El chip [valor] es una referencia viva: si cambias la línea origen, el chip y el resultado se actualizan automáticamente.',
      'No puedes referenciar la misma línea desde sí misma.',
      'El chip se borra con Backspace como una sola unidad.',
    ],
  },
  {
    title: 'Resumen de la hoja',
    description:
      'Bajo la última línea aparece automáticamente un resumen alineado a la derecha. El desplegable permite elegir la operación a aplicar sobre todos los resultados numéricos válidos del documento.',
    notes: [
      'Suma — total acumulado de todos los resultados.',
      'Media — media aritmética (suma dividida entre el número de líneas con resultado).',
      'Mediana — valor central tras ordenar los resultados; con cantidad par, promedio de los dos del medio.',
      'Cantidad — número de líneas que han producido un resultado numérico.',
      'Solo se cuentan líneas que producen un número finito: cálculos, porcentajes, conversiones, asignaciones de variables… Las líneas vacías o con error se ignoran.',
      'Si no hay ninguna línea con resultado numérico, el resumen no aparece.',
    ],
  },
  {
    title: 'Documento y guardado',
    description: 'Tu trabajo se guarda solo y puedes exportarlo o reabrirlo cuando quieras.',
    notes: [
      'Autoguardado — cada cambio se guarda automáticamente en el navegador. Recarga la página y verás tu hoja intacta.',
      'Título de la hoja — click sobre el título centrado en la cabecera para renombrar (Enter guarda, Esc cancela).',
      'Guardar (icono ↓) — descarga la hoja como archivo .syscalc con el nombre del título.',
      'Cargar (icono carpeta) — abre un archivo .syscalc previamente guardado, sustituyendo la hoja actual.',
      'Limpiar (icono papelera) — borra todas las líneas y el título, dejando la hoja en blanco para empezar de cero. Pide confirmación si hay contenido.',
    ],
  },
];

export function HelpPage({ onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="help-page" role="dialog" aria-modal="true" aria-labelledby="help-title">
      <header className="help-header">
        <h1 id="help-title" className="help-title">Ayuda · SmartCalc</h1>
        <button className="help-close" onClick={onClose} aria-label="Cerrar ayuda">
          <CloseIcon size={20} />
        </button>
      </header>
      <div className="help-content">
        {SECTIONS.map((sec) => (
          <section key={sec.title} className="help-section">
            <h2 className="help-section-title">{sec.title}</h2>
            {sec.description && <p className="help-section-desc">{sec.description}</p>}
            {sec.examples && (
              <div className="help-examples">
                {sec.examples.map((ex, i) => (
                  <div key={i} className="help-example">
                    <code className="help-input">{ex.input}</code>
                    <span className="help-arrow">=</span>
                    <code className="help-result">{ex.result}</code>
                  </div>
                ))}
              </div>
            )}
            {sec.useCases && (
              <>
                <h3 className="help-subsection-title">Ejemplos en contexto</h3>
                <div className="help-examples">
                  {sec.useCases.map((ex, i) => (
                    <div key={i} className="help-example">
                      <code className="help-input">{ex.input}</code>
                      <span className="help-arrow">=</span>
                      <code className="help-result">{ex.result}</code>
                    </div>
                  ))}
                </div>
              </>
            )}
            {sec.aliasGroups &&
              sec.aliasGroups.map((group) => (
                <div key={group.heading} className="help-alias-group">
                  <h3 className="help-subsection-title">{group.heading}</h3>
                  <table className="help-alias-table">
                    <thead>
                      <tr>
                        <th>Inglés</th>
                        <th>Español</th>
                        <th>Descripción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.rows.map((row) => (
                        <tr key={row.english}>
                          <td><code className="help-alias-name">{row.english}</code></td>
                          <td>
                            {row.spanish ? (
                              <code className="help-alias-name">{row.spanish}</code>
                            ) : (
                              <span className="help-alias-missing">—</span>
                            )}
                          </td>
                          <td>{row.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            {sec.notes && (
              <ul className="help-notes">
                {sec.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        <footer className="help-footer">
          Pulsa <kbd>Esc</kbd> o el botón de cerrar para volver a la calculadora.
        </footer>
      </div>
    </div>
  );
}
