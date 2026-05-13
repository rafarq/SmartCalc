import { useEffect } from 'react';

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
      'Backspace en línea vacía — borra la línea y vuelve a la anterior.',
      'Click en un resultado — inserta una referencia a esa línea en la línea actual.',
    ],
  },
  {
    title: 'Operaciones básicas',
    description: 'Usa los operadores como en una calculadora estándar.',
    examples: [
      { input: '2 + 3', result: '5' },
      { input: '25 - 5', result: '20' },
      { input: '9 * 9', result: '81' },
      { input: '20 / 5', result: '4' },
      { input: '2 ^ 10', result: '1024' },
      { input: '10 % 3', result: '1' },
    ],
    notes: ['^ = potencia, % = módulo (resto de la división).'],
  },
  {
    title: 'Funciones matemáticas',
    description: 'Disponibles con nombre en inglés o español.',
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
    description: 'Funciones trigonométricas en grados (no radianes). Disponibles en inglés y español.',
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
      'Haz click en cualquier resultado para insertarlo como referencia (chip azul) en la línea donde tienes el cursor. Si la línea origen cambia, la referencia se actualiza automáticamente.',
    examples: [
      { input: '2000 + 3', result: '2003' },
      { input: '[2003] × 2', result: '4006' },
    ],
    notes: ['El chip [valor] representa una referencia viva: cambia con su línea origen.'],
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
          ✕
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
          Pulsa <kbd>Esc</kbd> o el botón ✕ para volver a la calculadora.
        </footer>
      </div>
    </div>
  );
}
