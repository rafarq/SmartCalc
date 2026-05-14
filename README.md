# SmartCalc

Calculadora de notas inteligente, en español. Cada línea es una expresión y su
resultado aparece a la derecha en tiempo real. Soporta operaciones aritméticas,
funciones matemáticas, porcentajes naturales, conversiones de unidades, fechas y
calendario laboral español, fórmulas geométricas, variables, referencias entre
líneas y mucho más.

## Arrancar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Otros comandos útiles:

```bash
npm run test          # tests en modo watch
npm run test:run      # tests una sola pasada
npm run build         # compila TypeScript y genera el bundle de producción
npm run preview       # sirve la build local
```

## Qué reconoce

| Categoría | Ejemplo | Resultado |
|-----------|---------|-----------|
| Operaciones básicas | `2 + 3 * 4` | `14` |
| Funciones matemáticas | `sqrt(16)`, `raiz(16)` | `4` |
| Trigonometría en grados | `sin(90)`, `seno(90)` | `1` |
| Logaritmos / exp | `log(1000)`, `ln(e)`, `exp(1)` | `3`, `1`, `2,718…` |
| Estadística | `media(2, 4, 6)` | `4` |
| Constantes | `pi`, `e`, `tau` | `3,14…` |
| Abreviaturas | `100k`, `2.5M` | `100.000`, `2.500.000` |
| Variables | `coche = 4`, `coche * 10` | `4`, `40` |
| Operador implícito | `100`, `+50`, `*2` | `100`, `150`, `300` |
| Porcentajes naturales | `50 + 10% de impuestos` | `55` |
| Regla de tres | `si 3 es 6, cuánto es 5` | `10` |
| Cálculo inverso | `121 tiene un 21% de aumento en qué` | `100` |
| Conversión de unidades | `5 km a millas`, `1 m² a cm²` | `3,11 millas`, `10.000 cm²` |
| Conversiones naturales | `12 horas en minutos`, `días en febrero de 2020` | `720`, `29` |
| Fechas y calendario | `hoy + 3 semanas`, `días laborables entre 1/1/2026 y 1/2/2026 en madrid` | `03/06/2026`, `21 d. laborables` |
| Geometría con autocompletado | `area.circulo.radio. 5mm` | `78,54 mm²` |
| Referencias entre líneas | Click sobre un resultado de otra línea | inserta un chip `[valor]` en la línea actual |

La ayuda completa (icono `?` en la cabecera) lleva un índice flotante con todas
las categorías, ejemplos y notas.

## Atajos de teclado

- **Enter** — nueva línea debajo del cursor.
- **Shift + Enter** — nueva línea al final del documento.
- **↑ / ↓** — saltar a la línea anterior / siguiente.
- **Backspace** en línea vacía — borra la línea y vuelve a la anterior.
- **Click** en cualquier punto de una fila — enfoca esa línea.
- Dentro del autocompletado de geometría: **↑/↓** elige, **Enter/Tab** acepta,
  **Esc** cierra.

## Documento

- **Autoguardado en localStorage** — recargas y la hoja sigue ahí.
- **Título editable** en la cabecera (click).
- **Guardar / Cargar** un archivo `.syscalc` (JSON serializado).
- **Limpiar** la hoja para empezar de cero (pide confirmación si hay contenido).
- **Calendario laboral** por capital de provincia, coloreado por ámbito
  (nacional / autonómico / local) con leyenda.
- **Control de decimales** en la cabecera del editor (0–10), persistente.
- **Resumen** al final con suma / media / mediana / cantidad y botón de copiar.

## Limitaciones conocidas

- **Festivos locales municipales**: la cobertura está basada en una lista
  reducida de patronales fijas bien conocidas (San Isidro, Mercè, San Fermín…)
  más lo que aporte `date-holidays`. **No es un calendario oficial**: los
  ayuntamientos cambian sus dos festivos locales cada año. Para uso oficial,
  consulta el BOE y el BOP de tu provincia.
- **Cálculos laborables muy largos** (> 50 años) devuelven vacío para evitar
  bloquear el navegador iterando día a día.
- **Fechas en formato `dd/mm`** requieren año explícito (2 o 4 dígitos): así
  `1/3` se trata como la división `1÷3` y no como una fecha.

## Stack

- **Vite + React 19 + TypeScript**.
- **Vitest** + **Testing Library** para los tests.
- **mathjs** para el motor de cálculo y conversión de unidades.
- **date-fns** y **date-fns/locale/es** para fechas y formateo.
- **date-holidays** para los festivos nacionales y autonómicos de España.
- Sin frameworks de estilos: CSS plano en `src/styles/app.css`.

## Estructura

```
src/
├── App.tsx, main.tsx             # punto de entrada y orquestación
├── components/                   # UI (Editor, LineRow, Header, HelpPage, …)
├── engine/                       # motor de cálculo (módulo por categoría)
│   ├── index.ts                  # orquestador de evaluate()
│   ├── percentages.ts, units.ts, dates.ts, geometry.ts, …
│   ├── holidays.ts, regionMap.ts, localHolidays.ts
│   └── variables.ts, preprocess.ts, inverse.ts, …
├── hooks/                        # useDocument, useAutocomplete, useIsMobile
├── state/                        # document model, storage (localStorage + .syscalc)
├── styles/                       # CSS plano
└── utils/                        # numberFormat, refs (chips)

tests/
├── engine/                       # cobertura por módulo de motor
├── hooks/                        # tests de hooks
└── utils/                        # formato numérico, etc.
```

## Licencia

Privado, sin licencia abierta por defecto.
