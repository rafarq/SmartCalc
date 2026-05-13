import { useEffect } from 'react';
import { CloseIcon } from './icons';

type Props = { onClose: () => void };

type Example = { input: string; result: string };

type Section = {
  title: string;
  description?: string;
  examples?: Example[];
  notes?: string[];
};

const SECTIONS: Section[] = [
  {
    title: 'Atajos de teclado',
    notes: [
      'Enter — inserta una nueva línea debajo y mueve el cursor a ella.',
      'Backspace en línea vacía — elimina la línea y vuelve al final de la anterior.',
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
  },
  {
    title: 'Constantes',
    examples: [
      { input: 'pi', result: '3,141593' },
      { input: 'e', result: '2,718282' },
      { input: 'tau', result: '6,283185' },
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
    title: 'Documento y guardado',
    description: 'Tu trabajo se guarda solo y puedes exportarlo o reabrirlo cuando quieras.',
    notes: [
      'Autoguardado — cada cambio se guarda automáticamente en el navegador. Recarga la página y verás tu hoja intacta.',
      'Título de la hoja — click sobre el título centrado en la cabecera para renombrar (Enter guarda, Esc cancela).',
      'Guardar (icono ↓) — descarga la hoja como archivo .syscalc con el nombre del título.',
      'Cargar (icono carpeta) — abre un archivo .syscalc previamente guardado, sustituyendo la hoja actual.',
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
