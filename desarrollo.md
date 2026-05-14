# SmartCalc — Plan de Desarrollo

> **Para workers agentes:** Implementar tarea por tarea con `superpowers:subagent-driven-development` o `superpowers:executing-plans`. Cada paso usa checkbox (`- [ ]`) y debe completarse en orden. TDD obligatorio salvo que se indique lo contrario.

**Objetivo:** Construir una web minimalista tipo *Soulver para Mac* en la que el usuario escribe líneas de cálculo en lenguaje natural y obtiene el resultado en una columna lateral. Cubre las 14 secciones de [specs.md](specs.md).

**Arquitectura:** SPA en Vite + React + TypeScript. La UI es un editor de líneas (`Editor`) que muestra entrada a la izquierda y resultados a la derecha (`LineRow`). Un motor de evaluación (`src/engine/`) recibe una línea + contexto (variables, resultados previos) y devuelve `{ value, formatted, error? }`. La evaluación de expresiones matemáticas se apoya en **mathjs**; encima añadimos pre-procesadores y módulos propios para porcentajes naturales, cálculo inverso, fechas españolas, festivos, geometría con autocompletado, referencias y operador implícito. El estado del documento vive en un hook `useDocument` y se persiste en `localStorage` con import/export de archivos `.syscalc` (JSON).

**Tech Stack:**
- Vite + React 18 + TypeScript
- mathjs (evaluación + unidades + constantes)
- date-fns + date-fns-tz (operaciones de fecha)
- Vitest + Testing Library (unit + integración)
- date-holidays o JSON propio para festivos españoles (decidido en Fase 10)
- ESLint + Prettier
- Sin dependencia de UI kit: CSS plano con variables para mantener minimalismo

---

## Estructura de ficheros

```
SmartCalc/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── vitest.config.ts
├── .eslintrc.cjs
├── .prettierrc
├── specs.md
├── desarrollo.md
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── styles/
│   │   ├── global.css
│   │   └── app.css
│   ├── components/
│   │   ├── Header.tsx              # Cabecera con botones Guardar/Cargar
│   │   ├── Editor.tsx              # Contenedor del documento
│   │   ├── LineRow.tsx             # Línea: input + resultado
│   │   ├── Autocomplete.tsx        # Lista de sugerencias geom. (desktop)
│   │   └── GeometryForm.tsx        # Formulario táctil de geometría (móvil)
│   ├── engine/
│   │   ├── index.ts                # evaluate(line, ctx) → Result
│   │   ├── preprocess.ts           # k/M, normalización × ÷, coma decimal
│   │   ├── percentages.ts          # Porcentajes naturales + regla de tres
│   │   ├── inverse.ts              # Cálculo inverso
│   │   ├── units.ts                # mathjs unidades + diccionario español
│   │   ├── naturalConversions.ts   # "X horas en minutos", "días en febrero…"
│   │   ├── dates.ts                # Aritmética y parsing de fechas español
│   │   ├── holidays.ts             # Festivos nacionales/autonómicos/locales
│   │   ├── geometry.ts             # Catálogo de fórmulas area./perimetro.
│   │   ├── variables.ts            # Asignación y lookup
│   │   └── references.ts           # Referencias a resultados previos
│   ├── state/
│   │   ├── document.ts             # Tipos + reducer del documento
│   │   └── storage.ts              # localStorage + .syscalc import/export
│   ├── hooks/
│   │   ├── useDocument.ts          # Hook que orquesta evaluación
│   │   └── useAutocomplete.ts      # Sugerencias geometría
│   └── utils/
│       ├── numberFormat.ts         # Formato es-ES, abreviaturas
│       └── tokens.ts               # Helpers de tokenización
└── tests/
    └── engine/
        ├── preprocess.test.ts
        ├── percentages.test.ts
        ├── inverse.test.ts
        ├── units.test.ts
        ├── naturalConversions.test.ts
        ├── dates.test.ts
        ├── holidays.test.ts
        ├── geometry.test.ts
        ├── variables.test.ts
        └── references.test.ts
```

**Responsabilidades clave:**
- `engine/index.ts` orquesta: recibe línea bruta → `preprocess` → intenta cada módulo especializado en orden (variables → references → geometry → inverse → percentages → naturalConversions → dates → units → mathjs core) → devuelve `Result`.
- Cada módulo expone `tryEvaluate(line, ctx): Result | null`. Si `null`, el orquestador prueba el siguiente.
- `useDocument` re-evalúa todas las líneas en cascada cuando cambia una (porque las referencias y variables pueden depender).

---

## Convenciones del plan

- Cada paso es 2–5 minutos.
- **TDD:** test que falla → implementación mínima → test pasa → commit.
- Commits siguen [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`.
- Comandos asumen `pwd = SmartCalc/`.
- `npm test -- --run` ejecuta vitest en modo single-shot (sin watch).

---

## Fase 0 — Setup del proyecto

### Tarea 0.1: Inicializar Vite + React + TS

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`

- [x] **Paso 1: Crear proyecto Vite en el directorio actual**

```bash
npm create vite@latest . -- --template react-ts
# Si pregunta por sobrescribir, aceptar (solo specs.md y desarrollo.md están)
npm install
```

- [x] **Paso 2: Verificar arranque**

```bash
npm run dev
```

Esperado: servidor en `http://localhost:5173`, página default de Vite carga. Detener con Ctrl+C.

- [x] **Paso 3: Limpiar plantilla**

Reemplazar `src/App.tsx`:

```tsx
export default function App() {
  return <div className="app">SmartCalc</div>;
}
```

Borrar: `src/App.css`, `src/assets/`, contenido de `src/index.css`.

- [x] **Paso 4: Commit**

```bash
git init
git add -A
git commit -m "chore: bootstrap Vite + React + TS"
```

### Tarea 0.2: Configurar Vitest + Testing Library

**Files:**
- Create: `vitest.config.ts`, `tests/setup.ts`
- Modify: `package.json` (scripts)

- [x] **Paso 1: Instalar dependencias de test**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitest/coverage-v8
```

- [x] **Paso 2: Crear `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
});
```

- [x] **Paso 3: Crear `tests/setup.ts`**

```ts
import '@testing-library/jest-dom';
```

- [x] **Paso 4: Añadir scripts en `package.json`**

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "test": "vitest",
  "test:run": "vitest run",
  "test:coverage": "vitest run --coverage"
}
```

- [x] **Paso 5: Test sanity**

Crear `tests/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Ejecutar `npm run test:run`. Esperado: 1 test pasa.

- [x] **Paso 6: Commit**

```bash
git add -A
git commit -m "chore: add Vitest + Testing Library setup"
```

### Tarea 0.3: Instalar mathjs y date-fns

- [x] **Paso 1: Instalar**

```bash
npm install mathjs date-fns date-fns-tz
npm install -D @types/node
```

- [x] **Paso 2: Test de humo de mathjs**

Crear `tests/engine/mathjs.smoke.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { create, all } from 'mathjs';

describe('mathjs smoke', () => {
  it('evaluates basic arithmetic', () => {
    const math = create(all);
    expect(math.evaluate('2 + 3')).toBe(5);
  });
});
```

Ejecutar `npm run test:run`. Esperado: 2 tests pasan.

- [x] **Paso 3: Commit**

```bash
git add -A
git commit -m "chore: add mathjs + date-fns dependencies"
```

### Tarea 0.4: ESLint + Prettier mínimo

- [x] **Paso 1: Instalar**

```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks prettier
```

- [x] **Paso 2: Crear `.prettierrc`**

```json
{ "singleQuote": true, "semi": true, "trailingComma": "all", "printWidth": 100 }
```

- [x] **Paso 3: Crear `.eslintrc.cjs`**

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: ['plugin:@typescript-eslint/recommended'],
  rules: { 'react-hooks/rules-of-hooks': 'error', 'react-hooks/exhaustive-deps': 'warn' },
};
```

- [x] **Paso 4: Commit**

```bash
git add -A
git commit -m "chore: add ESLint and Prettier"
```

---

## Fase 1 — UI base y modelo del documento

### Tarea 1.1: Tipos del documento

**Files:**
- Create: `src/state/document.ts`, `tests/state/document.test.ts`

- [x] **Paso 1: Test que falla**

`tests/state/document.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createEmptyDocument, addLine, updateLine } from '../../src/state/document';

describe('document model', () => {
  it('creates an empty document with one empty line', () => {
    const doc = createEmptyDocument();
    expect(doc.lines).toHaveLength(1);
    expect(doc.lines[0].text).toBe('');
  });

  it('adds a new line after the given index', () => {
    const doc = createEmptyDocument();
    const updated = addLine(doc, 0);
    expect(updated.lines).toHaveLength(2);
  });

  it('updates the text of a line by id', () => {
    const doc = createEmptyDocument();
    const id = doc.lines[0].id;
    const updated = updateLine(doc, id, '2 + 2');
    expect(updated.lines[0].text).toBe('2 + 2');
  });
});
```

`npm run test:run` → falla con módulo no encontrado.

- [x] **Paso 2: Implementación mínima**

`src/state/document.ts`:

```ts
export type Line = { id: string; text: string };
export type DocumentModel = { lines: Line[] };

const newId = () => crypto.randomUUID();

export const createEmptyDocument = (): DocumentModel => ({
  lines: [{ id: newId(), text: '' }],
});

export const addLine = (doc: DocumentModel, afterIndex: number): DocumentModel => {
  const lines = [...doc.lines];
  lines.splice(afterIndex + 1, 0, { id: newId(), text: '' });
  return { lines };
};

export const updateLine = (doc: DocumentModel, id: string, text: string): DocumentModel => ({
  lines: doc.lines.map((l) => (l.id === id ? { ...l, text } : l)),
});
```

- [x] **Paso 3: Verificar**

`npm run test:run` → pasa.

- [x] **Paso 4: Commit**

```bash
git add -A
git commit -m "feat(state): document model with create/add/update"
```

### Tarea 1.2: Hook `useDocument` con estado básico

**Files:**
- Create: `src/hooks/useDocument.ts`, `tests/hooks/useDocument.test.tsx`

- [x] **Paso 1: Test que falla**

`tests/hooks/useDocument.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDocument } from '../../src/hooks/useDocument';

describe('useDocument', () => {
  it('exposes a document with one empty line initially', () => {
    const { result } = renderHook(() => useDocument());
    expect(result.current.doc.lines).toHaveLength(1);
  });

  it('updates a line', () => {
    const { result } = renderHook(() => useDocument());
    const id = result.current.doc.lines[0].id;
    act(() => result.current.setLineText(id, '1 + 1'));
    expect(result.current.doc.lines[0].text).toBe('1 + 1');
  });
});
```

- [x] **Paso 2: Implementación**

`src/hooks/useDocument.ts`:

```ts
import { useCallback, useState } from 'react';
import { createEmptyDocument, addLine, updateLine, type DocumentModel } from '../state/document';

export function useDocument() {
  const [doc, setDoc] = useState<DocumentModel>(() => createEmptyDocument());

  const setLineText = useCallback((id: string, text: string) => {
    setDoc((d) => updateLine(d, id, text));
  }, []);

  const insertLineAfter = useCallback((index: number) => {
    setDoc((d) => addLine(d, index));
  }, []);

  return { doc, setLineText, insertLineAfter };
}
```

- [x] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(hooks): useDocument basic state"
```

### Tarea 1.3: Componente `LineRow`

**Files:**
- Create: `src/components/LineRow.tsx`, `tests/components/LineRow.test.tsx`

- [x] **Paso 1: Test que falla**

`tests/components/LineRow.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineRow } from '../../src/components/LineRow';

describe('LineRow', () => {
  it('renders the input value', () => {
    render(<LineRow value="2 + 2" result="4" onChange={() => {}} onEnter={() => {}} />);
    expect(screen.getByDisplayValue('2 + 2')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<LineRow value="" result="" onChange={onChange} onEnter={() => {}} />);
    await userEvent.type(screen.getByRole('textbox'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
  });
});
```

- [x] **Paso 2: Implementación**

`src/components/LineRow.tsx`:

```tsx
type Props = {
  value: string;
  result: string;
  onChange: (text: string) => void;
  onEnter: () => void;
};

export function LineRow({ value, result, onChange, onEnter }: Props) {
  return (
    <div className="line-row">
      <input
        className="line-input"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onEnter();
          }
        }}
      />
      <span className="line-result">{result}</span>
    </div>
  );
}
```

- [x] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(ui): LineRow component"
```

### Tarea 1.4: Componente `Editor`

**Files:**
- Create: `src/components/Editor.tsx`
- Modify: `src/App.tsx`

- [x] **Paso 1: Implementación**

`src/components/Editor.tsx`:

```tsx
import { useDocument } from '../hooks/useDocument';
import { LineRow } from './LineRow';

export function Editor() {
  const { doc, setLineText, insertLineAfter } = useDocument();
  return (
    <div className="editor">
      {doc.lines.map((line, i) => (
        <LineRow
          key={line.id}
          value={line.text}
          result=""
          onChange={(t) => setLineText(line.id, t)}
          onEnter={() => insertLineAfter(i)}
        />
      ))}
    </div>
  );
}
```

`src/App.tsx`:

```tsx
import { Editor } from './components/Editor';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  return (
    <div className="app">
      <Editor />
    </div>
  );
}
```

- [x] **Paso 2: Estilos básicos**

`src/styles/global.css`:

```css
*, *::before, *::after { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 16px;
  color: #1a1a1a;
  background: #fdfdfd;
}
```

`src/styles/app.css`:

```css
.app { display: flex; flex-direction: column; height: 100%; }
.editor { flex: 1; padding: 24px 40px; overflow-y: auto; }
.line-row { display: grid; grid-template-columns: 1fr 200px; gap: 24px; padding: 4px 0; align-items: baseline; }
.line-input { border: none; outline: none; background: transparent; font: inherit; padding: 4px 0; }
.line-input:focus { background: #f5f5f7; }
.line-result { text-align: right; color: #444; font-variant-numeric: tabular-nums; }
```

- [x] **Paso 3: Verificar visualmente**

`npm run dev`, abrir navegador, escribir en una línea, pulsar Enter → aparece otra línea.

- [x] **Paso 4: Commit**

```bash
git add -A && git commit -m "feat(ui): Editor + base styles"
```

### Tarea 1.5: Componente `Header` (placeholder)

**Files:**
- Create: `src/components/Header.tsx`
- Modify: `src/App.tsx`

- [x] **Paso 1: Implementación**

`src/components/Header.tsx`:

```tsx
type Props = { onSave: () => void; onLoad: () => void };

export function Header({ onSave, onLoad }: Props) {
  return (
    <header className="header">
      <h1 className="header-title">SmartCalc</h1>
      <div className="header-actions">
        <button onClick={onLoad}>Cargar</button>
        <button onClick={onSave}>Guardar</button>
      </div>
    </header>
  );
}
```

Añadir a `app.css`:

```css
.header { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-bottom: 1px solid #e6e6e6; background: #fff; }
.header-title { font-size: 14px; font-weight: 600; margin: 0; color: #555; }
.header-actions button { margin-left: 8px; padding: 4px 12px; border: 1px solid #d0d0d0; background: #fafafa; border-radius: 6px; cursor: pointer; }
```

Modificar `src/App.tsx`:

```tsx
import { Header } from './components/Header';
import { Editor } from './components/Editor';
import './styles/global.css';
import './styles/app.css';

export default function App() {
  return (
    <div className="app">
      <Header onSave={() => {}} onLoad={() => {}} />
      <Editor />
    </div>
  );
}
```

- [x] **Paso 2: Commit**

```bash
git add -A && git commit -m "feat(ui): Header placeholder"
```

---

## Fase 2 — Motor base + Sección 1 (operaciones básicas) + Sección 6 (constantes)

### Tarea 2.1: Tipo `Result` y orquestador vacío

**Files:**
- Create: `src/engine/index.ts`, `tests/engine/index.test.ts`

- [x] **Paso 1: Test**

```ts
import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

describe('evaluate', () => {
  it('returns empty result for empty line', () => {
    expect(evaluate('', { vars: {}, prev: [] })).toEqual({ ok: true, value: null, formatted: '' });
  });

  it('returns error result for nonsense', () => {
    const r = evaluate('asdf', { vars: {}, prev: [] });
    expect(r.ok).toBe(false);
  });
});
```

- [x] **Paso 2: Implementación**

`src/engine/index.ts`:

```ts
export type EvalContext = {
  vars: Record<string, number>;
  prev: Array<{ value: unknown; formatted: string }>;
};

export type Result =
  | { ok: true; value: unknown; formatted: string }
  | { ok: false; error: string };

export function evaluate(line: string, _ctx: EvalContext): Result {
  const trimmed = line.trim();
  if (!trimmed) return { ok: true, value: null, formatted: '' };
  return { ok: false, error: 'No se pudo evaluar' };
}
```

- [x] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): Result type and empty orchestrator"
```

### Tarea 2.2: Conectar mathjs para operaciones básicas y constantes

**Files:**
- Modify: `src/engine/index.ts`
- Modify/extend: `tests/engine/index.test.ts`

- [x] **Paso 1: Tests adicionales**

Añadir a `tests/engine/index.test.ts`:

```ts
describe('evaluate basics', () => {
  const ctx = { vars: {}, prev: [] };
  it.each([
    ['1 + 1', 2],
    ['25 - 5', 20],
    ['9 * 9', 81],
    ['20 / 5', 4],
    ['2 ^ 10', 1024],
    ['10 % 3', 1],
  ])('%s = %i', (input, expected) => {
    const r = evaluate(input, ctx);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(expected);
  });

  it('knows pi, e, tau', () => {
    const ctx = { vars: {}, prev: [] };
    expect((evaluate('pi', ctx) as any).value).toBeCloseTo(Math.PI);
    expect((evaluate('e', ctx) as any).value).toBeCloseTo(Math.E);
    expect((evaluate('tau', ctx) as any).value).toBeCloseTo(2 * Math.PI);
  });
});
```

- [x] **Paso 2: Implementación**

Reescribir `src/engine/index.ts`:

```ts
import { create, all, type MathJsInstance } from 'mathjs';
import { formatNumber } from '../utils/numberFormat';

export type EvalContext = {
  vars: Record<string, number>;
  prev: Array<{ value: unknown; formatted: string }>;
};

export type Result =
  | { ok: true; value: unknown; formatted: string }
  | { ok: false; error: string };

const math: MathJsInstance = create(all, { number: 'number' });
math.import({ tau: 2 * Math.PI }, { override: false });

export function evaluate(line: string, ctx: EvalContext): Result {
  const trimmed = line.trim();
  if (!trimmed) return { ok: true, value: null, formatted: '' };
  try {
    const value = math.evaluate(trimmed, { ...ctx.vars });
    return { ok: true, value, formatted: formatNumber(value) };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
```

- [x] **Paso 3: Crear utilidad de formateo**

`src/utils/numberFormat.ts`:

```ts
export function formatNumber(value: unknown): string {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return String(value);
    return new Intl.NumberFormat('es-ES', { maximumFractionDigits: 6 }).format(value);
  }
  return String(value);
}
```

- [x] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): basic ops and constants via mathjs"
```

### Tarea 2.3: Conectar motor al Editor

**Files:**
- Modify: `src/hooks/useDocument.ts`, `src/components/Editor.tsx`

- [x] **Paso 1: Extender `useDocument`**

```ts
import { useCallback, useMemo, useState } from 'react';
import { evaluate, type Result } from '../engine';
import { createEmptyDocument, addLine, updateLine, type DocumentModel } from '../state/document';

export function useDocument() {
  const [doc, setDoc] = useState<DocumentModel>(() => createEmptyDocument());

  const results = useMemo<Result[]>(() => {
    const prev: Array<{ value: unknown; formatted: string }> = [];
    const vars: Record<string, number> = {};
    return doc.lines.map((line) => {
      const r = evaluate(line.text, { vars, prev });
      if (r.ok && r.value !== null) prev.push({ value: r.value, formatted: r.formatted });
      else prev.push({ value: null, formatted: '' });
      return r;
    });
  }, [doc]);

  const setLineText = useCallback((id: string, text: string) => {
    setDoc((d) => updateLine(d, id, text));
  }, []);

  const insertLineAfter = useCallback((index: number) => {
    setDoc((d) => addLine(d, index));
  }, []);

  return { doc, results, setLineText, insertLineAfter };
}
```

- [x] **Paso 2: Pasar resultados al `LineRow`**

`src/components/Editor.tsx`:

```tsx
import { useDocument } from '../hooks/useDocument';
import { LineRow } from './LineRow';

export function Editor() {
  const { doc, results, setLineText, insertLineAfter } = useDocument();
  return (
    <div className="editor">
      {doc.lines.map((line, i) => {
        const r = results[i];
        const text = r.ok ? r.formatted : '⚠';
        return (
          <LineRow
            key={line.id}
            value={line.text}
            result={text}
            onChange={(t) => setLineText(line.id, t)}
            onEnter={() => insertLineAfter(i)}
          />
        );
      })}
    </div>
  );
}
```

- [x] **Paso 3: Verificar en navegador**

`npm run dev`. Probar: `1 + 1`, `9 * 9`, `pi`. Resultados aparecen a la derecha.

- [x] **Paso 4: Commit**

```bash
git add -A && git commit -m "feat(ui): wire engine results into Editor"
```

---

## Fase 3 — Sección 2 (funciones matemáticas) y Sección 3 (trigonometría)

**Nota:** mathjs ya provee `sqrt`, `abs`, `round`, `ceil`, `floor`, `sign`, `sin`, `cos`, `tan`, `asin`, `acos`, `atan`. Esta fase es principalmente verificación + tabla de tests + configurar grados/radianes.

### Tarea 3.1: Tests de funciones matemáticas básicas

**Files:**
- Create: `tests/engine/math-functions.test.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ctx = { vars: {}, prev: [] };
const ev = (s: string) => evaluate(s, ctx);

describe('funciones matemáticas', () => {
  it.each([
    ['sqrt(16)', 4],
    ['abs(-7)', 7],
    ['round(2.4)', 2],
    ['round(2.5)', 3],
    ['ceil(2.1)', 3],
    ['floor(2.9)', 2],
    ['sign(-3)', -1],
    ['sign(0)', 0],
    ['sign(8)', 1],
  ])('%s = %i', (input, expected) => {
    const r = ev(input);
    if (r.ok) expect(r.value).toBe(expected);
    else throw new Error(r.error);
  });
});
```

- [x] **Paso 2: Ejecutar — deben pasar sin tocar el motor**

```bash
npm run test:run
```

Si alguno falla por defaults de mathjs, ajustar en `src/engine/index.ts`. (Ej. `round(2.5)` — mathjs redondea half-up correctamente).

- [x] **Paso 3: Commit**

```bash
git add -A && git commit -m "test(engine): math functions coverage"
```

### Tarea 3.2: Trigonometría en grados por defecto

mathjs usa radianes por defecto. El usuario espera comportamiento natural: `sin(90) = 1`. Decisión: configurar grados.

**Files:**
- Modify: `src/engine/index.ts`
- Create: `tests/engine/trig.test.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ctx = { vars: {}, prev: [] };
const ev = (s: string) => {
  const r = evaluate(s, ctx);
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('trigonometría (grados)', () => {
  it('sin(0) = 0', () => expect(ev('sin(0)')).toBeCloseTo(0));
  it('sin(90) = 1', () => expect(ev('sin(90)')).toBeCloseTo(1));
  it('cos(0) = 1', () => expect(ev('cos(0)')).toBeCloseTo(1));
  it('cos(180) = -1', () => expect(ev('cos(180)')).toBeCloseTo(-1));
  it('tan(45) = 1', () => expect(ev('tan(45)')).toBeCloseTo(1));
  it('asin(1) = 90', () => expect(ev('asin(1)')).toBeCloseTo(90));
  it('acos(0) = 90', () => expect(ev('acos(0)')).toBeCloseTo(90));
  it('atan(1) = 45', () => expect(ev('atan(1)')).toBeCloseTo(45));
});
```

- [x] **Paso 2: Sobrescribir funciones trig en mathjs**

En `src/engine/index.ts`, tras la creación de `math`:

```ts
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

math.import(
  {
    sin: (x: number) => Math.sin(toRad(x)),
    cos: (x: number) => Math.cos(toRad(x)),
    tan: (x: number) => Math.tan(toRad(x)),
    asin: (x: number) => toDeg(Math.asin(x)),
    acos: (x: number) => toDeg(Math.acos(x)),
    atan: (x: number) => toDeg(Math.atan(x)),
  },
  { override: true },
);
```

- [x] **Paso 3: Verificar**

```bash
npm run test:run
```

Esperado: todos los tests trig pasan.

- [x] **Paso 4: Commit**

```bash
git add -A && git commit -m "feat(engine): trig functions in degrees"
```

---

## Fase 4 — Sección 4 (logaritmos/exponenciales) y Sección 5 (estadística)

### Tarea 4.1: Logaritmos y exponencial

**Files:**
- Create: `tests/engine/log-exp.test.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ev = (s: string) => {
  const r = evaluate(s, { vars: {}, prev: [] });
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('logaritmos y exp', () => {
  it('log(100) = 2 (base 10)', () => expect(ev('log(100)')).toBeCloseTo(2));
  it('log(1000) = 3', () => expect(ev('log(1000)')).toBeCloseTo(3));
  it('ln(e) = 1', () => expect(ev('ln(e)')).toBeCloseTo(1));
  it('log(8, 2) = 3', () => expect(ev('log(8, 2)')).toBeCloseTo(3));
  it('exp(1) = e', () => expect(ev('exp(1)')).toBeCloseTo(Math.E));
});
```

- [x] **Paso 2: Ajustar mathjs**

En mathjs por defecto `log(x)` es ln. Spec dice `log = base 10`. Sobrescribir en `src/engine/index.ts`:

```ts
math.import(
  {
    log: (x: number, base?: number) =>
      base === undefined ? Math.log10(x) : Math.log(x) / Math.log(base),
    ln: (x: number) => Math.log(x),
    exp: (x: number) => Math.exp(x),
  },
  { override: true },
);
```

- [x] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): log base 10, ln, exp"
```

### Tarea 4.2: Estadística

**Files:**
- Create: `tests/engine/stats.test.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/engine';

const ev = (s: string) => {
  const r = evaluate(s, { vars: {}, prev: [] });
  if (!r.ok) throw new Error(r.error);
  return r.value as number;
};

describe('estadística', () => {
  it('min(1, 2, 3) = 1', () => expect(ev('min(1, 2, 3)')).toBe(1));
  it('max(1, 2, 3) = 3', () => expect(ev('max(1, 2, 3)')).toBe(3));
  it('mean(2, 4, 6) = 4', () => expect(ev('mean(2, 4, 6)')).toBe(4));
  it('median(1, 5, 3) = 3', () => expect(ev('median(1, 5, 3)')).toBe(3));
  it('std(2, 4, 4, 4, 5, 5, 7, 9) ≈ 2.138', () =>
    expect(ev('std(2, 4, 4, 4, 5, 5, 7, 9)')).toBeCloseTo(2.138, 2));
});
```

- [x] **Paso 2: Ejecutar (mathjs ya provee min/max/mean/median/std)**

```bash
npm run test:run
```

Si `mean` no existe (mathjs usa `mean` correctamente), aliasarlo. Si fuese necesario, en `engine/index.ts`:

```ts
math.import({ mean: math.mean }, { override: false });
```

- [x] **Paso 3: Commit**

```bash
git add -A && git commit -m "test(engine): stats coverage"
```

---

## Fase 5 — Sección 7: abreviaturas numéricas (k, M)

### Tarea 5.1: Preprocesador de abreviaturas

**Files:**
- Create: `src/engine/preprocess.ts`, `tests/engine/preprocess.test.ts`
- Modify: `src/engine/index.ts`

- [x] **Paso 1: Tests**

`tests/engine/preprocess.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { preprocess } from '../../src/engine/preprocess';

describe('preprocess: abreviaturas', () => {
  it('3M → 3000000', () => expect(preprocess('3M')).toBe('(3 * 1000000)'));
  it('100k → 100000', () => expect(preprocess('100k')).toBe('(100 * 1000)'));
  it('2.5M → 2500000', () => expect(preprocess('2.5M')).toBe('(2.5 * 1000000)'));
  it('3M + 100k', () => expect(preprocess('3M + 100k')).toBe('(3 * 1000000) + (100 * 1000)'));
  it('no toca k dentro de identificador', () =>
    expect(preprocess('km a millas')).toBe('km a millas'));
});
```

- [x] **Paso 2: Implementación**

`src/engine/preprocess.ts`:

```ts
// Reemplaza N k / N M cuando son sufijos numéricos puros (no parte de identificador).
const ABBREV_RE = /(\d+(?:\.\d+)?)(k|M)\b(?!\w)/g;

export function preprocess(line: string): string {
  return line.replace(ABBREV_RE, (_, num: string, suf: string) => {
    const mult = suf === 'k' ? 1000 : 1_000_000;
    return `(${num} * ${mult})`;
  });
}
```

- [x] **Paso 3: Aplicar en orquestador**

En `src/engine/index.ts`, dentro de `evaluate` antes de `math.evaluate`:

```ts
import { preprocess } from './preprocess';
// ...
const expr = preprocess(trimmed);
const value = math.evaluate(expr, { ...ctx.vars });
```

- [x] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): k/M numeric abbreviations"
```

---

## Fase 6 — Sección 8: porcentajes naturales y regla de tres

Esta fase necesita un módulo dedicado porque mathjs no parsea español natural.

### Tarea 6.1: Porcentajes "X + N% de algo" / "X - N% de algo"

**Files:**
- Create: `src/engine/percentages.ts`, `tests/engine/percentages.test.ts`
- Modify: `src/engine/index.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { tryPercentages } from '../../src/engine/percentages';

describe('porcentajes naturales', () => {
  it('50 + 10% de impuestos = 55', () =>
    expect(tryPercentages('50 + 10% de impuestos')?.value).toBe(55));
  it('120 - 30% de descuento = 84', () =>
    expect(tryPercentages('120 - 30% de descuento')?.value).toBe(84));
  it('20% de 300 = 60', () => expect(tryPercentages('20% de 300')?.value).toBe(60));
  it('50 es qué % de 200 = 25', () =>
    expect(tryPercentages('50 es qué % de 200')?.value).toBe(25));
  it('devuelve null si no aplica', () => expect(tryPercentages('2 + 2')).toBeNull());
});
```

- [x] **Paso 2: Implementación**

`src/engine/percentages.ts`:

```ts
export type LocalResult = { value: number } | null;

const RE_ADD_PCT = /^(-?\d+(?:\.\d+)?)\s*([+-])\s*(\d+(?:\.\d+)?)\s*%(?:\s+de\s+\w+)?$/i;
const RE_PCT_OF = /^(\d+(?:\.\d+)?)\s*%\s+de\s+(-?\d+(?:\.\d+)?)$/i;
const RE_WHAT_PCT = /^(-?\d+(?:\.\d+)?)\s+es\s+qu[eé]\s*%\s+de\s+(-?\d+(?:\.\d+)?)$/i;

export function tryPercentages(line: string): LocalResult {
  const a = line.trim().match(RE_ADD_PCT);
  if (a) {
    const base = parseFloat(a[1]);
    const sign = a[2] === '+' ? 1 : -1;
    const pct = parseFloat(a[3]);
    return { value: base + sign * base * (pct / 100) };
  }
  const b = line.trim().match(RE_PCT_OF);
  if (b) return { value: (parseFloat(b[1]) / 100) * parseFloat(b[2]) };
  const c = line.trim().match(RE_WHAT_PCT);
  if (c) return { value: (parseFloat(c[1]) / parseFloat(c[2])) * 100 };
  return null;
}
```

- [x] **Paso 3: Integrar en orquestador**

En `src/engine/index.ts`, antes de mathjs:

```ts
import { tryPercentages } from './percentages';
// ... dentro de evaluate, tras preprocess
const pct = tryPercentages(trimmed);
if (pct) return { ok: true, value: pct.value, formatted: formatNumber(pct.value) };
```

- [x] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): porcentajes naturales"
```

### Tarea 6.2: Regla de tres

**Files:**
- Modify: `src/engine/percentages.ts`, `tests/engine/percentages.test.ts`

- [x] **Paso 1: Tests (añadir al describe)**

```ts
describe('regla de tres', () => {
  it('si 3 kg son 6€, 5 kg son ? → 10', () =>
    expect(tryPercentages('si 3 kg son 6€, 5 kg son ?')?.value).toBeCloseTo(10));
  it('si 100 km son 5h, 250 km son ? → 12.5', () =>
    expect(tryPercentages('si 100 km son 5h, 250 km son ?')?.value).toBeCloseTo(12.5));
  it('si 1 m son 200 cm, 2.5 m son ? → 500', () =>
    expect(tryPercentages('si 1 m son 200 cm, 2.5 m son ?')?.value).toBeCloseTo(500));
});
```

- [x] **Paso 2: Implementación**

Añadir a `percentages.ts`:

```ts
// si A <unit> son B <unit2>, C <unit> son ?
const RE_RULE_3 =
  /^si\s+(-?\d+(?:\.\d+)?)\s*\S*\s+son\s+(-?\d+(?:\.\d+)?)\s*\S*,\s*(-?\d+(?:\.\d+)?)\s*\S*\s+son\s+\?$/i;

// en tryPercentages, antes del return null:
const d = line.trim().match(RE_RULE_3);
if (d) {
  const [a, b, c] = [parseFloat(d[1]), parseFloat(d[2]), parseFloat(d[3])];
  return { value: (b / a) * c };
}
```

- [x] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): regla de tres"
```

> **Nota de formato:** los resultados de regla de tres con unidades (€, h, cm) ahora aparecen sin unidad. Se mejora en Fase 14 (pulido) cuando integremos formato con unidad opcional. Para el MVP basta con el valor numérico.

---

## Fase 7 — Sección 9: cálculo inverso

### Tarea 7.1: Inversos de porcentaje

**Files:**
- Create: `src/engine/inverse.ts`, `tests/engine/inverse.test.ts`
- Modify: `src/engine/index.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { tryInverse } from '../../src/engine/inverse';

describe('cálculo inverso', () => {
  it('20 es el 10% de qué = 200', () =>
    expect(tryInverse('20 es el 10% de qué')?.value).toBeCloseTo(200));
  it('90 tiene un 20% de descuento en qué = 112.5', () =>
    expect(tryInverse('90 tiene un 20% de descuento en qué')?.value).toBeCloseTo(112.5));
  it('150 tiene un 15% de aumento en qué = 130.43', () =>
    expect(tryInverse('150 tiene un 15% de aumento en qué')?.value).toBeCloseTo(130.43, 2));
});
```

- [x] **Paso 2: Implementación**

`src/engine/inverse.ts`:

```ts
const RE_IS_PCT_OF = /^(-?\d+(?:\.\d+)?)\s+es\s+el\s+(\d+(?:\.\d+)?)\s*%\s+de\s+qu[eé]$/i;
const RE_DISCOUNT = /^(-?\d+(?:\.\d+)?)\s+tiene\s+un\s+(\d+(?:\.\d+)?)\s*%\s+de\s+descuento\s+en\s+qu[eé]$/i;
const RE_INCREASE = /^(-?\d+(?:\.\d+)?)\s+tiene\s+un\s+(\d+(?:\.\d+)?)\s*%\s+de\s+aumento\s+en\s+qu[eé]$/i;

export function tryInverse(line: string): { value: number } | null {
  const t = line.trim();
  let m;
  if ((m = t.match(RE_IS_PCT_OF))) return { value: (parseFloat(m[1]) / parseFloat(m[2])) * 100 };
  if ((m = t.match(RE_DISCOUNT)))
    return { value: parseFloat(m[1]) / (1 - parseFloat(m[2]) / 100) };
  if ((m = t.match(RE_INCREASE)))
    return { value: parseFloat(m[1]) / (1 + parseFloat(m[2]) / 100) };
  return null;
}
```

- [x] **Paso 3: Integrar en orquestador (justo después de porcentajes)**

```ts
import { tryInverse } from './inverse';
// ...
const inv = tryInverse(trimmed);
if (inv) return { ok: true, value: inv.value, formatted: formatNumber(inv.value) };
```

- [x] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): cálculo inverso de porcentajes"
```

---

## Fase 8 — Sección 10: conversión de unidades

mathjs soporta unidades nativamente con nombres en inglés. Mapearemos a sintaxis española.

### Tarea 8.1: Diccionario de unidades español→mathjs

**Files:**
- Create: `src/engine/units.ts`, `tests/engine/units.test.ts`
- Modify: `src/engine/index.ts`

- [ ] **Paso 1: Tests (conjunto representativo de cada categoría)**

```ts
import { describe, it, expect } from 'vitest';
import { tryUnitConversion } from '../../src/engine/units';

const ev = (s: string) => tryUnitConversion(s)?.value;

describe('conversión de unidades', () => {
  it('5 km a millas ≈ 3.106', () => expect(ev('5 km a millas')).toBeCloseTo(3.106, 2));
  it('100 celsius a fahrenheit = 212', () => expect(ev('100 celsius a fahrenheit')).toBeCloseTo(212));
  it('1 kg a lb ≈ 2.205', () => expect(ev('1 kg a lb')).toBeCloseTo(2.205, 2));
  it('1 hora a min = 60', () => expect(ev('1 hora a min')).toBe(60));
  it('1 m2 a cm2 = 10000', () => expect(ev('1 m2 a cm2')).toBe(10000));
  it('1 litro a ml = 1000', () => expect(ev('1 litro a ml')).toBe(1000));
  it('1 kWh a J = 3600000', () => expect(ev('1 kWh a J')).toBe(3_600_000));
});
```

- [ ] **Paso 2: Implementación**

`src/engine/units.ts`:

```ts
import { create, all } from 'mathjs';
const math = create(all);

// Mapeo unidades en español → expresión mathjs
const UNIT_MAP: Record<string, string> = {
  // Longitud
  m: 'm', km: 'km', cm: 'cm', mm: 'mm',
  pulgadas: 'inch', pulgada: 'inch',
  pies: 'foot', pie: 'foot',
  yardas: 'yard', yarda: 'yard',
  millas: 'mile', milla: 'mile',
  // Masa
  kg: 'kg', g: 'g', mg: 'mg',
  lb: 'lbm', oz: 'oz', tonelada: 'ton', toneladas: 'ton',
  // Tiempo
  s: 's', segundo: 's', segundos: 's',
  min: 'minute', minuto: 'minute', minutos: 'minute',
  hora: 'hour', horas: 'hour',
  dia: 'day', dias: 'day', día: 'day', días: 'day',
  semana: 'week', semanas: 'week',
  // Temperatura
  celsius: 'degC', fahrenheit: 'degF', kelvin: 'K',
  // Área
  m2: 'm^2', km2: 'km^2', cm2: 'cm^2', ft2: 'ft^2',
  acre: 'acre', acres: 'acre',
  hectarea: 'hectare', hectareas: 'hectare',
  // Volumen
  m3: 'm^3', litro: 'litre', litros: 'litre', ml: 'mL',
  galon: 'gallon', galones: 'gallon', taza: 'cup', tazas: 'cup',
  // Velocidad
  'm/s': 'm/s', 'km/h': 'km/h', mph: 'mph', nudo: 'knot', nudos: 'knot',
  // Energía
  J: 'J', kJ: 'kJ', cal: 'cal', kcal: 'kcal', Wh: 'Wh', kWh: 'kWh',
};

const RE_CONV = /^(-?\d+(?:\.\d+)?)\s+([^\s].*?)\s+a\s+([^\s].*?)$/i;

export function tryUnitConversion(line: string): { value: number; unit: string } | null {
  const m = line.trim().match(RE_CONV);
  if (!m) return null;
  const value = parseFloat(m[1]);
  const from = UNIT_MAP[m[2].toLowerCase()];
  const to = UNIT_MAP[m[3].toLowerCase()];
  if (!from || !to) return null;
  try {
    const converted = math.unit(value, from).toNumber(to);
    return { value: converted, unit: m[3] };
  } catch {
    return null;
  }
}
```

- [ ] **Paso 3: Integrar en orquestador**

```ts
import { tryUnitConversion } from './units';
// ... después de inverse
const uc = tryUnitConversion(trimmed);
if (uc) return { ok: true, value: uc.value, formatted: `${formatNumber(uc.value)} ${uc.unit}` };
```

- [ ] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): conversión de unidades es↔mathjs"
```

---

## Fase 9 — Sección 12: conversiones naturales

Frases tipo "12 horas en minutos", "minutos en 4 días", "100 km a millas" (esta última ya cubierta).

### Tarea 9.1: Conversiones naturales temporales

**Files:**
- Create: `src/engine/naturalConversions.ts`, `tests/engine/naturalConversions.test.ts`
- Modify: `src/engine/index.ts`

- [ ] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { tryNaturalConversion } from '../../src/engine/naturalConversions';

const ev = (s: string) => tryNaturalConversion(s);

describe('conversiones naturales', () => {
  it('12 horas en minutos = 720 minutes', () => {
    const r = ev('12 horas en minutos');
    expect(r?.value).toBe(720);
    expect(r?.unit).toBe('minutos');
  });

  it('minutos en 4 días = 5760', () => {
    const r = ev('minutos en 4 días');
    expect(r?.value).toBe(5760);
  });

  it('días en febrero de 2020 = 29', () => {
    const r = ev('días en febrero de 2020');
    expect(r?.value).toBe(29);
  });

  it('días en febrero de 2021 = 28', () => {
    const r = ev('días en febrero de 2021');
    expect(r?.value).toBe(28);
  });
});
```

- [ ] **Paso 2: Implementación**

`src/engine/naturalConversions.ts`:

```ts
import { getDaysInMonth } from 'date-fns';

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const UNIT_SECONDS: Record<string, number> = {
  segundos: 1, segundo: 1, s: 1,
  minutos: 60, minuto: 60, min: 60,
  horas: 3600, hora: 3600,
  días: 86400, dias: 86400, día: 86400, dia: 86400,
  semanas: 604800, semana: 604800,
};

const RE_TIME_A_EN_B = /^(\d+(?:\.\d+)?)\s+(\w+)\s+(?:en|a)\s+(\w+)$/i;
const RE_TIME_INVERTIDO = /^(\w+)\s+en\s+(\d+(?:\.\d+)?)\s+(\w+)$/i;
const RE_DAYS_IN_MONTH = /^d[ií]as\s+en\s+(\w+)(?:\s+de\s+(\d{4}))?$/i;

export function tryNaturalConversion(
  line: string,
): { value: number; unit: string } | null {
  const t = line.trim();

  let m = t.match(RE_DAYS_IN_MONTH);
  if (m) {
    const monthIdx = MESES[m[1].toLowerCase()];
    if (monthIdx === undefined) return null;
    const year = m[2] ? parseInt(m[2]) : new Date().getFullYear();
    return { value: getDaysInMonth(new Date(year, monthIdx, 1)), unit: 'días' };
  }

  m = t.match(RE_TIME_A_EN_B);
  if (m) {
    const value = parseFloat(m[1]);
    const fromSec = UNIT_SECONDS[m[2].toLowerCase()];
    const toSec = UNIT_SECONDS[m[3].toLowerCase()];
    if (fromSec && toSec) return { value: (value * fromSec) / toSec, unit: m[3] };
  }

  m = t.match(RE_TIME_INVERTIDO);
  if (m) {
    const fromSec = UNIT_SECONDS[m[1].toLowerCase()];
    const value = parseFloat(m[2]);
    const toSec = UNIT_SECONDS[m[3].toLowerCase()];
    if (fromSec && toSec) return { value: (value * toSec) / fromSec, unit: m[1] };
  }

  return null;
}
```

- [ ] **Paso 3: Integrar en orquestador (antes de mathjs, después de units)**

```ts
import { tryNaturalConversion } from './naturalConversions';
// ...
const nc = tryNaturalConversion(trimmed);
if (nc) return { ok: true, value: nc.value, formatted: `${formatNumber(nc.value)} ${nc.unit}` };
```

- [ ] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): conversiones naturales temporales"
```

---

## Fase 10 — Fechas y calendario laboral

Esta es la fase más compleja. Recomendamos elegir librería de festivos antes de empezar.

### Tarea 10.1: Decisión y instalación de librería de festivos

- [ ] **Paso 1: Investigar opciones**

Comparar:
- `date-holidays` (cubre España, incluye festivos autonómicos y algunos locales)
- JSON propio con los 52 festivos locales de capitales de provincia

**Decisión recomendada:** usar `date-holidays` para nacionales + autonómicos, y mantener un JSON local pequeño para los festivos locales de las 52 capitales que no cubra.

- [ ] **Paso 2: Instalar**

```bash
npm install date-holidays
npm install -D @types/date-holidays
```

(Si `@types/date-holidays` no existe, crear `src/types/date-holidays.d.ts` con `declare module 'date-holidays';`.)

- [ ] **Paso 3: Smoke test**

```ts
// tests/engine/holidays.smoke.test.ts
import { describe, it, expect } from 'vitest';
import Holidays from 'date-holidays';

describe('date-holidays smoke', () => {
  it('1 enero 2026 es festivo nacional en ES', () => {
    const hd = new Holidays('ES');
    const isHoliday = hd.isHoliday(new Date(2026, 0, 1));
    expect(isHoliday).toBeTruthy();
  });
});
```

- [ ] **Paso 4: Commit**

```bash
git add -A && git commit -m "chore: add date-holidays dependency"
```

### Tarea 10.2: Parser de fechas españolas

**Files:**
- Create: `src/engine/dates.ts`, `tests/engine/dates.test.ts`

- [ ] **Paso 1: Tests de parsing**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseSpanishDate } from '../../src/engine/dates';

describe('parseSpanishDate', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 13)); // 13 mayo 2026 (miércoles)
  });

  it('hoy', () => expect(parseSpanishDate('hoy')).toEqual(new Date(2026, 4, 13)));
  it('23/1/2026', () => expect(parseSpanishDate('23/1/2026')).toEqual(new Date(2026, 0, 23)));
  it('10 de febrero', () => expect(parseSpanishDate('10 de febrero')).toEqual(new Date(2026, 1, 10)));
  it('próximo lunes', () =>
    expect(parseSpanishDate('próximo lunes')).toEqual(new Date(2026, 4, 18)));
  it('viernes que viene', () =>
    expect(parseSpanishDate('viernes que viene')).toEqual(new Date(2026, 4, 15)));
});
```

- [ ] **Paso 2: Implementación**

`src/engine/dates.ts`:

```ts
import { addDays, startOfDay } from 'date-fns';

const MESES: Record<string, number> = {
  enero: 0, febrero: 1, marzo: 2, abril: 3, mayo: 4, junio: 5,
  julio: 6, agosto: 7, septiembre: 8, octubre: 9, noviembre: 10, diciembre: 11,
};

const DIAS_SEMANA: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miércoles: 3, miercoles: 3,
  jueves: 4, viernes: 5, sábado: 6, sabado: 6,
};

const RE_DDMMYYYY = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/;
const RE_DD_DE_MES = /^(\d{1,2})\s+de\s+(\w+)(?:\s+de\s+(\d{4}))?$/i;
const RE_NEXT_DAY = /^(?:próximo|proximo|siguiente)\s+(\w+)$/i;
const RE_DAY_QUE_VIENE = /^(\w+)\s+que\s+viene$/i;

export function parseSpanishDate(input: string, ref = new Date()): Date | null {
  const today = startOfDay(ref);
  const t = input.trim().toLowerCase();

  if (t === 'hoy') return today;
  if (t === 'ayer') return addDays(today, -1);
  if (t === 'mañana' || t === 'manana') return addDays(today, 1);

  let m;
  if ((m = t.match(RE_DDMMYYYY))) {
    const d = parseInt(m[1]);
    const mo = parseInt(m[2]) - 1;
    const y = m[3] ? normalizeYear(parseInt(m[3])) : today.getFullYear();
    return new Date(y, mo, d);
  }
  if ((m = t.match(RE_DD_DE_MES))) {
    const d = parseInt(m[1]);
    const mo = MESES[m[2]];
    if (mo === undefined) return null;
    const y = m[3] ? parseInt(m[3]) : today.getFullYear();
    return new Date(y, mo, d);
  }
  if ((m = t.match(RE_NEXT_DAY)) || (m = t.match(RE_DAY_QUE_VIENE))) {
    const target = DIAS_SEMANA[m[1]];
    if (target === undefined) return null;
    const diff = ((target - today.getDay() + 7) % 7) || 7;
    return addDays(today, diff);
  }
  return null;
}

function normalizeYear(y: number) {
  if (y < 100) return y + 2000;
  return y;
}
```

- [ ] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): parseSpanishDate"
```

### Tarea 10.3: Aritmética de fechas

**Files:**
- Modify: `src/engine/dates.ts`, `tests/engine/dates.test.ts`
- Modify: `src/engine/index.ts`

- [ ] **Paso 1: Tests**

```ts
describe('aritmética de fechas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 13));
  });

  it('hoy + 3 semanas', () => {
    const r = tryDateExpression('hoy + 3 semanas');
    expect(r?.value).toEqual(new Date(2026, 5, 3));
  });

  it('hace 10 días', () => {
    const r = tryDateExpression('hace 10 días');
    expect(r?.value).toEqual(new Date(2026, 4, 3));
  });

  it('dentro de 1 mes', () => {
    const r = tryDateExpression('dentro de 1 mes');
    expect(r?.value).toEqual(new Date(2026, 5, 13));
  });

  it('23/1/2026 + 5 días = 28/01/2026', () => {
    const r = tryDateExpression('23/1/2026 + 5 días');
    expect(r?.value).toEqual(new Date(2026, 0, 28));
  });

  it('días entre 1/1 y 1/2 = 31', () => {
    const r = tryDateExpression('días entre 1/1 y 1/2');
    expect(r?.value).toBe(31);
  });
});
```

- [ ] **Paso 2: Implementación**

Añadir a `dates.ts`:

```ts
import { addDays as fnsAddDays, addMonths, addYears, addWeeks, differenceInDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

type DateResult = { value: Date | number; formatted: string };

const RE_HACE = /^hace\s+(\d+)\s+(d[ií]as?|semanas?|meses|años?|horas?)$/i;
const RE_DENTRO = /^dentro\s+de\s+(\d+)\s+(d[ií]as?|semanas?|meses|años?)$/i;
const RE_OP_FECHA = /^(.+?)\s+([+-])\s+(\d+)\s+(d[ií]as?|semanas?|meses|años?)$/i;
const RE_ENTRE = /^d[ií]as\s+entre\s+(.+?)\s+y\s+(.+?)$/i;

export function tryDateExpression(
  line: string,
  ref = new Date(),
): DateResult | null {
  const t = line.trim();
  let m;

  if ((m = t.match(RE_HACE))) {
    const n = parseInt(m[1]);
    const date = addUnit(ref, -n, m[2]);
    return { value: date, formatted: formatDate(date) };
  }
  if ((m = t.match(RE_DENTRO))) {
    const n = parseInt(m[1]);
    const date = addUnit(ref, n, m[2]);
    return { value: date, formatted: formatDate(date) };
  }
  if ((m = t.match(RE_OP_FECHA))) {
    const base = parseSpanishDate(m[1], ref);
    if (!base) return null;
    const sign = m[2] === '+' ? 1 : -1;
    const date = addUnit(base, sign * parseInt(m[3]), m[4]);
    return { value: date, formatted: formatDate(date) };
  }
  if ((m = t.match(RE_ENTRE))) {
    const a = parseSpanishDate(m[1], ref);
    const b = parseSpanishDate(m[2], ref);
    if (!a || !b) return null;
    const days = differenceInDays(b, a);
    return { value: days, formatted: `${days} días` };
  }
  // Caso "fecha sola": que devuelva la fecha si se parsea
  const single = parseSpanishDate(t, ref);
  if (single) return { value: single, formatted: formatDate(single) };
  return null;
}

function addUnit(date: Date, n: number, unit: string): Date {
  const u = unit.toLowerCase();
  if (u.startsWith('día') || u.startsWith('dia')) return fnsAddDays(date, n);
  if (u.startsWith('semana')) return addWeeks(date, n);
  if (u.startsWith('mes')) return addMonths(date, n);
  if (u.startsWith('año') || u.startsWith('ano')) return addYears(date, n);
  return date;
}

function formatDate(d: Date): string {
  return format(d, 'dd/MM/yyyy', { locale: es });
}
```

- [ ] **Paso 3: Integrar en orquestador**

En `src/engine/index.ts`, antes de mathjs:

```ts
import { tryDateExpression } from './dates';
// ...
const de = tryDateExpression(trimmed);
if (de) return { ok: true, value: de.value, formatted: de.formatted };
```

- [ ] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): aritmética de fechas"
```

### Tarea 10.4: Días laborables y festivos

**Files:**
- Create: `src/engine/holidays.ts`, `tests/engine/holidays.test.ts`
- Modify: `src/engine/dates.ts`

- [ ] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { isWorkingDay, addWorkingDays, workingDaysBetween } from '../../src/engine/holidays';

describe('días laborables', () => {
  it('sábado no es laborable', () => {
    expect(isWorkingDay(new Date(2026, 4, 16))).toBe(false);
  });
  it('lunes 18/5/2026 es laborable', () => {
    expect(isWorkingDay(new Date(2026, 4, 18))).toBe(true);
  });
  it('1 enero 2026 no es laborable (festivo nacional)', () => {
    expect(isWorkingDay(new Date(2026, 0, 1))).toBe(false);
  });
  it('addWorkingDays salta fines de semana', () => {
    // viernes 15/5 + 1 laborable → lunes 18/5
    const r = addWorkingDays(new Date(2026, 4, 15), 1);
    expect(r).toEqual(new Date(2026, 4, 18));
  });
  it('workingDaysBetween 1/1 a 1/2 ≈ 21 (excluye festivos+findes)', () => {
    const r = workingDaysBetween(new Date(2026, 0, 1), new Date(2026, 1, 1));
    expect(r).toBeGreaterThanOrEqual(20);
    expect(r).toBeLessThanOrEqual(22);
  });
});
```

- [ ] **Paso 2: Implementación**

`src/engine/holidays.ts`:

```ts
import Holidays from 'date-holidays';
import { addDays, differenceInCalendarDays, eachDayOfInterval, getDay } from 'date-fns';

const cache = new Map<string, Holidays>();

function getInstance(region?: string): Holidays {
  const key = region ?? 'ES';
  if (!cache.has(key)) {
    const hd = region ? new Holidays('ES', region) : new Holidays('ES');
    cache.set(key, hd);
  }
  return cache.get(key)!;
}

export function isWorkingDay(date: Date, region?: string): boolean {
  const dow = getDay(date);
  if (dow === 0 || dow === 6) return false;
  const hd = getInstance(region);
  const info = hd.isHoliday(date);
  if (info && Array.isArray(info)) {
    return !info.some((h) => h.type === 'public');
  }
  return true;
}

export function addWorkingDays(date: Date, n: number, region?: string): Date {
  const step = n >= 0 ? 1 : -1;
  let remaining = Math.abs(n);
  let cur = date;
  while (remaining > 0) {
    cur = addDays(cur, step);
    if (isWorkingDay(cur, region)) remaining--;
  }
  return cur;
}

export function workingDaysBetween(a: Date, b: Date, region?: string): number {
  if (differenceInCalendarDays(b, a) < 0) return -workingDaysBetween(b, a, region);
  const days = eachDayOfInterval({ start: a, end: addDays(b, -1) });
  return days.filter((d) => isWorkingDay(d, region)).length;
}
```

- [ ] **Paso 3: Region matching (mapa capital→código autonómico)**

Añadir `REGION_MAP` con las 52 capitales mapeadas a sus códigos ISO autonómicos (`MD` Madrid, `AN` Andalucía, etc.). Para `Málaga` → región `AN` (Andalucía). `date-holidays` cubre festivos nacionales y autonómicos; los locales municipales que falten se documentan como limitación en MVP.

Crear un fichero `src/engine/regionMap.ts` con las 52 capitales de provincia mapeadas a su código autonómico ISO (`AN` Andalucía, `AR` Aragón, `AS` Asturias, `IB` Baleares, `CN` Canarias, `CB` Cantabria, `CL` Castilla y León, `CM` Castilla-La Mancha, `CT` Cataluña, `EX` Extremadura, `GA` Galicia, `RI` La Rioja, `MD` Madrid, `MC` Murcia, `NC` Navarra, `PV` País Vasco, `VC` Comunidad Valenciana, `CE` Ceuta, `ML` Melilla). Lista canónica (capital → ccaa):

```ts
// src/engine/regionMap.ts
export const REGION_MAP: Record<string, string> = {
  // Andalucía
  almería: 'AN', cádiz: 'AN', córdoba: 'AN', granada: 'AN',
  huelva: 'AN', jaén: 'AN', málaga: 'AN', sevilla: 'AN',
  // Aragón
  huesca: 'AR', teruel: 'AR', zaragoza: 'AR',
  // Asturias
  oviedo: 'AS',
  // Baleares
  'palma de mallorca': 'IB', palma: 'IB',
  // Canarias
  'las palmas': 'CN', 'santa cruz de tenerife': 'CN',
  // Cantabria
  santander: 'CB',
  // Castilla y León
  ávila: 'CL', burgos: 'CL', león: 'CL', palencia: 'CL',
  salamanca: 'CL', segovia: 'CL', soria: 'CL', valladolid: 'CL', zamora: 'CL',
  // Castilla-La Mancha
  albacete: 'CM', 'ciudad real': 'CM', cuenca: 'CM', guadalajara: 'CM', toledo: 'CM',
  // Cataluña
  barcelona: 'CT', girona: 'CT', lleida: 'CT', tarragona: 'CT',
  // C. Valenciana
  alicante: 'VC', castellón: 'VC', valencia: 'VC',
  // Extremadura
  badajoz: 'EX', cáceres: 'EX',
  // Galicia
  'a coruña': 'GA', lugo: 'GA', ourense: 'GA', pontevedra: 'GA',
  // La Rioja
  logroño: 'RI',
  // Madrid
  madrid: 'MD',
  // Murcia
  murcia: 'MC',
  // Navarra
  pamplona: 'NC',
  // País Vasco
  bilbao: 'PV', 'donostia': 'PV', 'san sebastián': 'PV', 'vitoria': 'PV', 'vitoria-gasteiz': 'PV',
  // Ciudades autónomas
  ceuta: 'CE', melilla: 'ML',
};
```

Importarlo desde `holidays.ts` en lugar de redefinirlo allí.

> **Limitación conocida del MVP:** `date-holidays` cubre festivos nacionales y autonómicos, pero no todos los locales municipales. Los festivos locales específicos de una ciudad (p. ej. la feria patronal) pueden no estar incluidos y deberían añadirse en una fase posterior con un JSON propio si el usuario los necesita.

- [ ] **Paso 4: Extender `tryDateExpression` con expresiones laborables**

Añadir a `src/engine/dates.ts`:

```ts
import { addWorkingDays, workingDaysBetween, REGION_MAP } from './holidays';

const RE_LAB_PLUS = /^(.+?)\s+\+\s+(\d+)\s+d[ií]as?\s+laborables?(?:\s+en\s+(\w+))?$/i;
const RE_LAB_ENTRE = /^d[ií]as\s+laborables\s+entre\s+(.+?)\s+y\s+(.+?)$/i;

// dentro de tryDateExpression, antes del fallback "fecha sola":
let m;
if ((m = t.match(RE_LAB_PLUS))) {
  const base = parseSpanishDate(m[1], ref);
  if (!base) return null;
  const region = m[3] ? REGION_MAP[m[3].toLowerCase()] : undefined;
  const d = addWorkingDays(base, parseInt(m[2]), region);
  return { value: d, formatted: formatDate(d) };
}
if ((m = t.match(RE_LAB_ENTRE))) {
  const a = parseSpanishDate(m[1], ref);
  const b = parseSpanishDate(m[2], ref);
  if (!a || !b) return null;
  const n = workingDaysBetween(a, b);
  return { value: n, formatted: `${n} d. laborables` };
}
```

- [ ] **Paso 5: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): días laborables y festivos"
```

### Tarea 10.5: Diferencias compuestas (semanas/días, meses/días)

**Files:**
- Modify: `src/engine/dates.ts`, `tests/engine/dates.test.ts`

- [ ] **Paso 1: Tests**

```ts
it('semanas y días entre 1/5/2026 y 15/5/2026 = 2 semanas', () => {
  const r = tryDateExpression('semanas y días entre 1/5/2026 y 15/5/2026');
  expect(r?.formatted).toMatch(/2 semanas/);
});

it('meses y días entre 3/1/23 y 4/2/26', () => {
  const r = tryDateExpression('meses y días entre 3/1/23 y 4/2/26');
  expect(r?.formatted).toMatch(/3 años|37 meses/);
});
```

- [ ] **Paso 2: Implementación**

Añadir a `dates.ts` con `differenceInMonths`, `differenceInYears`. Formatear en partes (`Xa Ym Zd` o `Xs Yd`).

```ts
import { differenceInMonths, differenceInYears } from 'date-fns';

const RE_SEM_DIAS = /^semanas\s+y\s+d[ií]as\s+entre\s+(.+?)\s+y\s+(.+?)$/i;
const RE_MES_DIAS = /^meses\s+y\s+d[ií]as\s+entre\s+(.+?)\s+y\s+(.+?)$/i;

// dentro de tryDateExpression:
if ((m = t.match(RE_SEM_DIAS))) {
  const a = parseSpanishDate(m[1], ref); const b = parseSpanishDate(m[2], ref);
  if (!a || !b) return null;
  const total = differenceInDays(b, a);
  const weeks = Math.floor(total / 7);
  const days = total % 7;
  return { value: total, formatted: `${weeks} semanas y ${days} días` };
}
if ((m = t.match(RE_MES_DIAS))) {
  const a = parseSpanishDate(m[1], ref); const b = parseSpanishDate(m[2], ref);
  if (!a || !b) return null;
  const months = differenceInMonths(b, a);
  const tail = addMonths(a, months);
  const days = differenceInDays(b, tail);
  return { value: months, formatted: `${months} meses y ${days} días` };
}
```

- [ ] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): diferencias compuestas de fecha"
```

---

## Fase 11 — Sección 13: fórmulas geométricas con autocompletado

### Tarea 11.1: Catálogo de fórmulas

**Files:**
- Create: `src/engine/geometry.ts`, `tests/engine/geometry.test.ts`

- [ ] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { tryGeometry, GEOMETRY_CATALOG } from '../../src/engine/geometry';

describe('geometría', () => {
  it('area.circulo.radio. 5mm = 78.54 mm²', () => {
    const r = tryGeometry('area.circulo.radio. 5mm');
    expect(r?.value).toBeCloseTo(78.54, 2);
    expect(r?.unit).toBe('mm²');
  });
  it('area.cuadrado.lado. 4m = 16 m²', () => {
    const r = tryGeometry('area.cuadrado.lado. 4m');
    expect(r?.value).toBe(16);
    expect(r?.unit).toBe('m²');
  });
  it('area.rectangulo.lados. 3m 4m = 12 m²', () => {
    const r = tryGeometry('area.rectangulo.lados. 3m 4m');
    expect(r?.value).toBe(12);
  });
  it('perimetro.cuadrado.lado. 5m = 20 m', () => {
    const r = tryGeometry('perimetro.cuadrado.lado. 5m');
    expect(r?.value).toBe(20);
    expect(r?.unit).toBe('m');
  });
  it('catálogo contiene area.circulo.diametro.', () => {
    expect(GEOMETRY_CATALOG.find((e) => e.template === 'area.circulo.diametro.')).toBeDefined();
  });
});
```

- [ ] **Paso 2: Implementación**

`src/engine/geometry.ts`:

```ts
export type Formula = {
  template: string; // ej: 'area.circulo.radio.'
  args: number; // cantidad de valores numéricos esperados
  compute: (values: number[]) => number;
  resultExp: 1 | 2 | 3; // 1=lineal (perim), 2=area, 3=volumen
};

export const GEOMETRY_CATALOG: Formula[] = [
  { template: 'area.circulo.radio.', args: 1, compute: ([r]) => Math.PI * r * r, resultExp: 2 },
  { template: 'area.circulo.diametro.', args: 1, compute: ([d]) => Math.PI * (d / 2) ** 2, resultExp: 2 },
  { template: 'area.cuadrado.lado.', args: 1, compute: ([l]) => l * l, resultExp: 2 },
  { template: 'area.rectangulo.lados.', args: 2, compute: ([a, b]) => a * b, resultExp: 2 },
  { template: 'area.triangulo.base_altura.', args: 2, compute: ([b, h]) => (b * h) / 2, resultExp: 2 },
  { template: 'perimetro.cuadrado.lado.', args: 1, compute: ([l]) => 4 * l, resultExp: 1 },
  { template: 'perimetro.rectangulo.lados.', args: 2, compute: ([a, b]) => 2 * (a + b), resultExp: 1 },
  { template: 'perimetro.circulo.radio.', args: 1, compute: ([r]) => 2 * Math.PI * r, resultExp: 1 },
  { template: 'perimetro.circulo.diametro.', args: 1, compute: ([d]) => Math.PI * d, resultExp: 1 },
  // Más a añadir: triángulo equilátero, polígonos regulares, etc.
];

const VALUE_RE = /(-?\d+(?:\.\d+)?)\s*(mm|cm|m|km|in|ft)?/g;

export function tryGeometry(
  line: string,
): { value: number; unit: string } | null {
  const trimmed = line.trim();
  const formula = GEOMETRY_CATALOG.find((f) => trimmed.startsWith(f.template));
  if (!formula) return null;
  const rest = trimmed.slice(formula.template.length).trim();
  const matches = [...rest.matchAll(VALUE_RE)];
  if (matches.length !== formula.args) return null;
  const values = matches.map((m) => parseFloat(m[1]));
  const unit = matches[0][2] ?? 'm';
  const value = formula.compute(values);
  const exp = formula.resultExp;
  const unitOut = exp === 1 ? unit : exp === 2 ? `${unit}²` : `${unit}³`;
  return { value, unit: unitOut };
}
```

- [ ] **Paso 3: Integrar en orquestador (antes de mathjs)**

```ts
import { tryGeometry } from './geometry';
// ...
const g = tryGeometry(trimmed);
if (g) return { ok: true, value: g.value, formatted: `${formatNumber(g.value)} ${g.unit}` };
```

- [ ] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): fórmulas geométricas"
```

### Tarea 11.2: Hook `useAutocomplete`

**Files:**
- Create: `src/hooks/useAutocomplete.ts`, `tests/hooks/useAutocomplete.test.tsx`

- [ ] **Paso 1: Tests**

```tsx
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutocomplete } from '../../src/hooks/useAutocomplete';

describe('useAutocomplete', () => {
  it('sin trigger, lista vacía', () => {
    const { result } = renderHook(() => useAutocomplete(''));
    expect(result.current.suggestions).toEqual([]);
  });
  it('"area." muestra fórmulas de área', () => {
    const { result } = renderHook(() => useAutocomplete('area.'));
    expect(result.current.suggestions.length).toBeGreaterThan(0);
    expect(result.current.suggestions[0]).toMatch(/^area\./);
  });
  it('"area.c" filtra a circulo y cuadrado', () => {
    const { result } = renderHook(() => useAutocomplete('area.c'));
    expect(result.current.suggestions.every((s) => s.startsWith('area.c'))).toBe(true);
  });
  it('navega con ↑↓', () => {
    const { result } = renderHook(() => useAutocomplete('area.'));
    act(() => result.current.moveDown());
    expect(result.current.selectedIndex).toBe(1);
    act(() => result.current.moveUp());
    expect(result.current.selectedIndex).toBe(0);
  });
});
```

- [ ] **Paso 2: Implementación**

`src/hooks/useAutocomplete.ts`:

```ts
import { useMemo, useState, useCallback } from 'react';
import { GEOMETRY_CATALOG } from '../engine/geometry';

const ALL = GEOMETRY_CATALOG.map((f) => f.template);

export function useAutocomplete(input: string) {
  const [selectedIndex, setIndex] = useState(0);

  const suggestions = useMemo(() => {
    const trimmed = input.trimStart();
    if (!trimmed.startsWith('area.') && !trimmed.startsWith('perimetro.')) return [];
    return ALL.filter((t) => t.startsWith(trimmed));
  }, [input]);

  const moveDown = useCallback(() => {
    setIndex((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
  }, [suggestions.length]);

  const moveUp = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  return { suggestions, selectedIndex, moveDown, moveUp, reset: () => setIndex(0) };
}
```

- [ ] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(hooks): useAutocomplete para geometría"
```

### Tarea 11.3: Componente `Autocomplete` (desktop) integrado en `LineRow`

**Files:**
- Create: `src/components/Autocomplete.tsx`
- Modify: `src/components/LineRow.tsx`

- [ ] **Paso 1: Componente**

`src/components/Autocomplete.tsx`:

```tsx
type Props = { items: string[]; selectedIndex: number; onPick: (s: string) => void };

export function Autocomplete({ items, selectedIndex, onPick }: Props) {
  if (items.length === 0) return null;
  return (
    <ul className="autocomplete" role="listbox">
      {items.map((s, i) => (
        <li
          key={s}
          role="option"
          aria-selected={i === selectedIndex}
          className={i === selectedIndex ? 'autocomplete-item selected' : 'autocomplete-item'}
          onMouseDown={(e) => {
            e.preventDefault();
            onPick(s);
          }}
        >
          {s}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Paso 2: Integrar en `LineRow`**

Refactor `LineRow` para gestionar autocompletado: usar `useAutocomplete(value)`, capturar `ArrowUp`/`ArrowDown`/`Enter`/`Tab`, y al elegir reemplazar el valor.

```tsx
// LineRow.tsx
import { useAutocomplete } from '../hooks/useAutocomplete';
import { Autocomplete } from './Autocomplete';

export function LineRow({ value, result, onChange, onEnter }: Props) {
  const ac = useAutocomplete(value);
  const pick = (s: string) => {
    onChange(s + ' ');
    ac.reset();
  };
  return (
    <div className="line-row">
      <div className="line-input-wrap">
        <input
          className="line-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (ac.suggestions.length > 0) {
              if (e.key === 'ArrowDown') { e.preventDefault(); ac.moveDown(); return; }
              if (e.key === 'ArrowUp') { e.preventDefault(); ac.moveUp(); return; }
              if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault();
                pick(ac.suggestions[ac.selectedIndex]);
                return;
              }
            }
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onEnter();
            }
          }}
        />
        <Autocomplete items={ac.suggestions} selectedIndex={ac.selectedIndex} onPick={pick} />
      </div>
      <span className="line-result">{result}</span>
    </div>
  );
}
```

CSS:

```css
.line-input-wrap { position: relative; }
.autocomplete { position: absolute; top: 100%; left: 0; right: 0; margin: 0; padding: 4px 0; list-style: none; background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,.08); z-index: 10; }
.autocomplete-item { padding: 4px 12px; cursor: pointer; }
.autocomplete-item.selected { background: #eef4ff; }
```

- [ ] **Paso 3: Verificar visualmente y commit**

```bash
npm run dev
# Escribir "area." en una línea, navegar con ↑↓, Enter selecciona
git add -A && git commit -m "feat(ui): autocompletado de geometría en LineRow"
```

### Tarea 11.4: Formulario móvil para geometría

**Files:**
- Create: `src/components/GeometryForm.tsx`
- Modify: `src/components/LineRow.tsx`

- [ ] **Paso 1: Detectar móvil**

Usar media query: `window.matchMedia('(max-width: 640px)').matches`. Encapsular en `useIsMobile()`.

- [ ] **Paso 2: Componente formulario**

`src/components/GeometryForm.tsx`:

```tsx
type Props = {
  template: string;
  argLabels: string[];
  onCancel: () => void;
  onSubmit: (line: string) => void;
};

export function GeometryForm({ template, argLabels, onCancel, onSubmit }: Props) {
  // Render: select de forma con inputs por arg y botón "Calcular"
  // (Implementación detallada: ver tarea 11.4 paso 3)
  return <div className="geom-form">{/* ... */}</div>;
}
```

- [ ] **Paso 3: Comportamiento en `LineRow`**

Si `isMobile && value.endsWith('.')`, mostrar formulario en lugar de lista. Al submit, reemplazar línea por `template + valores`.

- [ ] **Paso 4: Test mínimo + visual + commit**

```bash
npm run dev
git add -A && git commit -m "feat(ui): formulario táctil de geometría para móvil"
```

---

## Fase 12 — Sección 14: variables, referencias, operador implícito, multilínea

### Tarea 12.1: Asignación de variables

**Files:**
- Create: `src/engine/variables.ts`, `tests/engine/variables.test.ts`
- Modify: `src/engine/index.ts`, `src/hooks/useDocument.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect } from 'vitest';
import { tryAssignment } from '../../src/engine/variables';

describe('asignación de variables', () => {
  it('parsea "precio = 100"', () => {
    expect(tryAssignment('precio = 100')).toEqual({ name: 'precio', expr: '100' });
  });
  it('parsea "iva = 21 * 1.21"', () => {
    expect(tryAssignment('iva = 21 * 1.21')).toEqual({ name: 'iva', expr: '21 * 1.21' });
  });
  it('null si no es asignación', () => {
    expect(tryAssignment('1 + 1')).toBeNull();
  });
  it('null si el nombre no es válido', () => {
    expect(tryAssignment('1 + 1 = 2')).toBeNull();
  });
});
```

- [x] **Paso 2: Implementación**

`src/engine/variables.ts`:

```ts
const RE_ASSIGN = /^([a-zA-ZáéíóúñÑ_][\w]*)\s*=\s*(.+)$/;

export function tryAssignment(line: string): { name: string; expr: string } | null {
  const m = line.trim().match(RE_ASSIGN);
  if (!m) return null;
  return { name: m[1], expr: m[2].trim() };
}
```

- [x] **Paso 3: Integrar**

En `src/engine/index.ts`:

```ts
import { tryAssignment } from './variables';
// ... primer paso después de trim:
const assign = tryAssignment(trimmed);
if (assign) {
  const inner = evaluate(assign.expr, ctx);
  if (!inner.ok) return inner;
  if (typeof inner.value === 'number') ctx.vars[assign.name] = inner.value;
  return { ok: true, value: inner.value, formatted: inner.formatted };
}
```

En `useDocument`, el `ctx.vars` se acumula entre líneas (ya pasa).

- [x] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): asignación de variables"
```

### Tarea 12.2: Referencias clickables a resultados previos

**Files:**
- Create: `src/engine/references.ts`, `tests/engine/references.test.ts`
- Modify: `src/components/LineRow.tsx`, `src/hooks/useDocument.ts`

**Diseño:** una referencia es un token tipo `@L3` que internamente representa "valor de la línea 3". El input del usuario lo verá como un chip visual ("Línea 3 = 42") pero internamente es texto plano. MVP simple: el orquestador sustituye `@LN` por el `formatted` numérico de la línea N antes de evaluar.

- [x] **Paso 1: Tests del orquestador con referencias**

```ts
it('@L1 referencia el resultado anterior', () => {
  const ctx = { vars: {}, prev: [{ value: 10, formatted: '10' }] };
  const r = evaluate('@L1 + 5', ctx);
  expect((r as any).value).toBe(15);
});
```

- [x] **Paso 2: Implementación**

`src/engine/references.ts`:

```ts
const REF_RE = /@L(\d+)/g;

export function expandReferences(
  line: string,
  prev: Array<{ value: unknown; formatted: string }>,
): string {
  return line.replace(REF_RE, (_, idx) => {
    const i = parseInt(idx) - 1;
    const v = prev[i]?.value;
    if (typeof v === 'number') return `(${v})`;
    return '0';
  });
}
```

En `engine/index.ts`, justo después de preprocess:

```ts
import { expandReferences } from './references';
// ...
let expr = preprocess(trimmed);
expr = expandReferences(expr, ctx.prev);
```

- [x] **Paso 3: UI — click en resultado inserta referencia en línea actual**

Eso requiere que `LineRow` sepa qué línea está enfocada en el editor. Refactor:
- `useDocument` mantiene `focusedLineId`.
- `Editor` pasa `onResultClick(lineIndex)` que inserta `@LN ` en la línea enfocada.

```tsx
// Editor.tsx (esencial)
const insertRef = (idx: number) => {
  if (!focusedId) return;
  const ref = `@L${idx + 1} `;
  const line = doc.lines.find((l) => l.id === focusedId);
  if (!line) return;
  setLineText(focusedId, line.text + ref);
};
```

```tsx
// LineRow.tsx: hacer el resultado clickable
<span className="line-result" onClick={onResultClick} role="button">
  {result}
</span>
```

- [x] **Paso 4: Verificar manualmente + commit**

```bash
npm run test:run
npm run dev
# Línea 1: 10
# Línea 2: click en "10" inserta @L1, escribir "+5" → 15
git add -A && git commit -m "feat(engine,ui): referencias a resultados previos"
```

### Tarea 12.3: Operador implícito (línea que empieza por op)

**Files:**
- Modify: `src/engine/index.ts`, `tests/engine/index.test.ts`

- [ ] **Paso 1: Tests**

```ts
it('+50 después de 100 → 150', () => {
  const ctx = { vars: {}, prev: [{ value: 100, formatted: '100' }] };
  const r = evaluate('+50', ctx);
  expect((r as any).value).toBe(150);
});

it('*2 después de 7 → 14', () => {
  const ctx = { vars: {}, prev: [{ value: 7, formatted: '7' }] };
  const r = evaluate('*2', ctx);
  expect((r as any).value).toBe(14);
});
```

- [ ] **Paso 2: Implementación**

En `engine/index.ts`, antes de cualquier otro módulo, después de trim:

```ts
const IMPLICIT_OP_RE = /^([+\-*/^%])\s*(.+)$/;
const lastPrev = ctx.prev[ctx.prev.length - 1];
if (lastPrev && typeof lastPrev.value === 'number') {
  const im = trimmed.match(IMPLICIT_OP_RE);
  if (im) {
    return evaluate(`(${lastPrev.value}) ${im[1]} ${im[2]}`, ctx);
  }
}
```

- [ ] **Paso 3: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(engine): operador implícito"
```

### Tarea 12.4: Shift+Enter para nueva línea al final

**Files:**
- Modify: `src/components/LineRow.tsx`

- [ ] **Paso 1: Comportamiento**

Si `e.shiftKey && e.key === 'Enter'`: insertar línea al final del documento.

Refactor: añadir `onShiftEnter` prop y manejarlo en `Editor` → `insertLineAtEnd()`.

- [ ] **Paso 2: Implementar en `useDocument`**

```ts
const insertLineAtEnd = useCallback(() => {
  setDoc((d) => ({ lines: [...d.lines, { id: crypto.randomUUID(), text: '' }] }));
}, []);
```

- [ ] **Paso 3: Tests + commit**

```bash
git add -A && git commit -m "feat(ui): Shift+Enter inserta línea al final"
```

---

## Fase 13 — Guardar / Cargar (.syscalc) + localStorage

### Tarea 13.1: Autoguardado en localStorage

**Files:**
- Create: `src/state/storage.ts`, `tests/state/storage.test.ts`
- Modify: `src/hooks/useDocument.ts`

- [x] **Paso 1: Tests**

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { saveLocal, loadLocal } from '../../src/state/storage';

beforeEach(() => localStorage.clear());

describe('storage', () => {
  it('roundtrip', () => {
    const doc = { lines: [{ id: '1', text: 'a' }] };
    saveLocal(doc);
    expect(loadLocal()).toEqual(doc);
  });
  it('vacío si no hay nada', () => {
    expect(loadLocal()).toBeNull();
  });
});
```

- [x] **Paso 2: Implementación**

`src/state/storage.ts`:

```ts
import type { DocumentModel } from './document';

const KEY = 'smartcalc:doc';

export function saveLocal(doc: DocumentModel) {
  localStorage.setItem(KEY, JSON.stringify(doc));
}

export function loadLocal(): DocumentModel | null {
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
```

- [x] **Paso 3: Integrar en `useDocument`**

```ts
import { saveLocal, loadLocal } from '../state/storage';

const [doc, setDoc] = useState<DocumentModel>(() => loadLocal() ?? createEmptyDocument());

useEffect(() => { saveLocal(doc); }, [doc]);
```

- [x] **Paso 4: Verificar y commit**

```bash
npm run test:run
git add -A && git commit -m "feat(state): autoguardado en localStorage"
```

### Tarea 13.2: Exportar archivo .syscalc

**Files:**
- Modify: `src/state/storage.ts`, `src/components/Header.tsx`, `src/App.tsx`

- [x] **Paso 1: Función de export**

```ts
// storage.ts
export function exportSyscalc(doc: DocumentModel) {
  const date = new Date();
  const yyyymmdd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const name = `SysCalc-${yyyymmdd}.syscalc`;
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [x] **Paso 2: Conectar al `Header` desde `App`**

```tsx
// App.tsx
const { doc, ... } = useDocument();
// ...
<Header onSave={() => exportSyscalc(doc)} onLoad={...} />
```

- [x] **Paso 3: Commit**

```bash
git add -A && git commit -m "feat: export documento como .syscalc"
```

### Tarea 13.3: Importar archivo .syscalc

**Files:**
- Modify: `src/state/storage.ts`, `src/hooks/useDocument.ts`, `src/components/Header.tsx`

- [x] **Paso 1: Función de import**

```ts
// storage.ts
export function importSyscalc(file: File): Promise<DocumentModel> {
  return file.text().then((t) => JSON.parse(t) as DocumentModel);
}
```

- [x] **Paso 2: Exponer `setDocument` en `useDocument`**

```ts
return { doc, results, setLineText, insertLineAfter, replaceDocument: setDoc };
```

- [x] **Paso 3: Botón Cargar abre `<input type="file" accept=".syscalc">` invisible**

```tsx
// Header.tsx
const fileRef = useRef<HTMLInputElement>(null);
// ...
<input ref={fileRef} type="file" accept=".syscalc,.json" hidden onChange={(e) => {
  const f = e.target.files?.[0];
  if (f) importSyscalc(f).then(onLoad);
}} />
<button onClick={() => fileRef.current?.click()}>Cargar</button>
```

`App.tsx` recibe el doc cargado y llama `replaceDocument(...)`.

- [x] **Paso 4: Verificar manualmente y commit**

```bash
npm run dev
git add -A && git commit -m "feat: importar archivos .syscalc"
```

---

## Fase 14 — Pulido y release

### Tarea 14.1: Diseño minimalista refinado

- [ ] Tipografía: probar `Inter` o `JetBrains Mono` para inputs/resultados; mantener tamaños suaves.
- [ ] Espaciado vertical entre líneas: 6–8px.
- [ ] Color de resultado: `#666` para legibilidad sin ruido.
- [ ] Microanimación: fade-in del resultado (opcional, `transition: opacity 0.12s`).
- [ ] Modo oscuro mínimo con `@media (prefers-color-scheme: dark)`.

```bash
git add -A && git commit -m "style: refinar diseño minimalista"
```

### Tarea 14.2: Responsive móvil

- [ ] En móvil, columna de resultado pasa debajo del input (no a la derecha) o ancho fijo más pequeño.
- [ ] Botones de cabecera táctiles (mínimo 44px de altura).

```bash
git add -A && git commit -m "style: layout responsive"
```

### Tarea 14.3: Manejo de errores en UI

- [ ] Cuando `result.ok = false`, mostrar un sutil "—" gris en lugar de mensaje técnico.
- [ ] Tooltip opcional con el error real al pasar el ratón.

```bash
git add -A && git commit -m "feat(ui): errores discretos en columna de resultados"
```

### Tarea 14.4: Cobertura final y limpieza

- [ ] Ejecutar `npm run test:coverage` y verificar > 80% en `src/engine/`.
- [ ] Borrar archivos `*.smoke.test.ts` si ya están cubiertos por tests específicos.
- [ ] Lanzar `npm run build` para verificar que compila sin errores TS.

```bash
npm run test:coverage
npm run build
git add -A && git commit -m "test: cobertura final + limpieza"
```

### Tarea 14.5: README de uso

- [ ] Crear `README.md` con:
  - Cómo arrancar (`npm install && npm run dev`)
  - Sintaxis principal (ejemplos de cada sección de specs.md)
  - Atajos: Enter (nueva línea abajo), Shift+Enter (al final), click en resultado (insertar referencia)
  - Limitaciones conocidas (festivos locales municipales no exhaustivos)

```bash
git add -A && git commit -m "docs: README inicial"
```

---

## Resumen de fases

| Fase | Cubre del spec | Resultado entregable | Estado |
|------|----------------|----------------------|--------|
| 0 | — | Proyecto Vite + tests + deps | ✅ |
| 1 | UI | Editor de líneas funcional sin lógica | ✅ |
| 2 | §1 + §6 | Operaciones básicas y constantes | ✅ |
| 3 | §2 + §3 | Funciones matemáticas + trigonometría en grados | ✅ |
| 4 | §4 + §5 | Logaritmos, exp, estadística | ✅ |
| 5 | §7 | Abreviaturas k / M | ✅ |
| 6 | §8 | Porcentajes naturales + regla de tres | ✅ |
| 7 | §9 | Cálculo inverso | ✅ |
| 8 | §10 | Conversión de unidades | ⏳ |
| 9 | §12 (parcial) | Conversiones naturales temporales | ⏳ |
| 10 | §12 (fechas) | Fechas y calendario laboral con festivos | ⏳ |
| 11 | §13 | Geometría con autocompletado (desktop+móvil) | ⏳ |
| 12 | §14 | Variables, referencias, operador implícito, multilínea | 🟡 12.1 y 12.2 ✅ · 12.3 y 12.4 ⏳ |
| 13 | §14 (persistencia) | localStorage + .syscalc | ✅ |
| 14 | — | Pulido, responsive, README | ⏳ |

Cada fase deja la aplicación en estado funcional y publicable; las fases posteriores añaden capacidades sin romper las anteriores.
