# SmartCalc

SmartCalc es una calculadora de notas en español orientada a trabajar como se piensa y se escribe: una línea por cálculo, resultado inmediato a la derecha y soporte para expresiones naturales, fechas, unidades, variables y referencias entre líneas.

## Qué hace SmartCalc

SmartCalc mezcla el comportamiento de una calculadora y una hoja de trabajo ligera:

- Evalúa operaciones matemáticas en tiempo real, línea a línea.
- Entiende expresiones en español como porcentajes, reglas de tres o cálculos con fechas.
- Permite construir cálculos reutilizables con variables y referencias entre líneas.
- Guarda el documento automáticamente en `localStorage` y permite exportarlo/importarlo como `.syscalc`.

## Capturas de Pantalla

Actualmente el repositorio no incluye capturas funcionales de la interfaz listas para documentación. Esta sección queda preparada para añadirlas cuando exista material definitivo del producto.

Imagen de marca actual:

![SmartCalc](./pwa-logo.png)

Sugerencia para futuras capturas:

- Editor principal con una hoja de ejemplo cargada.
- Vista de ayuda con ejemplos de sintaxis.
- Calendario laboral por ciudad.

## Demo Online

No hay una demo pública desplegada en este momento.

Para probarla localmente:

```bash
npm install
npm run dev
```

Después abre `http://localhost:5173`.

## Instalación

Requisitos:

- Node.js 22 o superior recomendado.
- npm.

Pasos:

```bash
npm install
```

Scripts disponibles:

```bash
npm run dev
npm run build
npm run preview
npm run test
npm run test:run
npm run test:coverage
npm run lint
npm run typecheck
npm run format
npm run format:check
```

## Uso

Cada línea es una expresión independiente y su resultado aparece a la derecha. Puedes encadenar cálculos, definir variables o reutilizar resultados previos.

Ejemplos rápidos:

```txt
2 + 3 * 4
precio = 1200
iva = 0.21
precio + precio * iva
50 + 10% de impuestos
5 km a millas
15/5/2026 + 3 días laborables
area.circulo.radio. 5mm
```

Atajos principales:

- `Enter`: crea una línea debajo.
- `Shift + Enter`: crea una línea al final.
- `↑ / ↓`: navega entre líneas.
- `Backspace` en línea vacía: elimina la línea actual.

## Características

- Operaciones básicas, potencias, módulo y constantes.
- Funciones matemáticas en inglés y español: `sqrt`, `raiz`, `round`, `redondear`, etc.
- Trigonometría en grados.
- Logaritmos, exponenciales y funciones estadísticas.
- Variables persistentes dentro del documento.
- Operador implícito para encadenar cálculos: `100`, `+50`, `*2`.
- Porcentajes naturales, regla de tres y cálculo inverso.
- Conversión de unidades y conversiones naturales de tiempo/meses.
- Cálculos con fechas en español.
- Días laborables y calendario laboral español por ciudad.
- Geometría con autocompletado por plantilla.
- Perfiles estructurales (`IPN`, `IPE`, `HEA`, `HEB`, etc.).
- Referencias entre líneas mediante chips reutilizables.
- Importación y exportación de archivos `.syscalc`.
- Resumen final con suma, media, mediana y cantidad.

## Tecnologías

- Vite
- React
- TypeScript
- mathjs
- date-fns
- date-holidays
- Vitest
- Testing Library
- ESLint
- Prettier

## Estructura del Proyecto

```txt
src/
├── components/   # UI principal: editor, cabecera, ayuda, calendario
├── engine/       # motor de cálculo por dominios
├── hooks/        # estado y comportamiento de UI/documento
├── state/        # modelo de documento + persistencia
├── styles/       # estilos globales y de aplicación
└── utils/        # utilidades de formato y referencias

tests/
├── components/
├── engine/
├── hooks/
├── state/
└── utils/
```

## Cómo Contribuir

1. Haz un fork del repositorio.
2. Crea una rama para tu cambio: `git checkout -b feat/mi-cambio`.
3. Instala dependencias con `npm install`.
4. Ejecuta validaciones antes de abrir PR:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test -- --run
npm run build
```

5. Abre un pull request describiendo el problema, la solución y cualquier impacto funcional.

Criterios recomendados:

- Mantener la sintaxis en español consistente con el motor existente.
- Añadir tests cuando cambie el comportamiento del evaluador.
- No mezclar refactors amplios con cambios funcionales pequeños.

## Roadmap

- Añadir una demo pública desplegada.
- Incorporar capturas reales de la interfaz al README.
- Mejorar cobertura y precisión de festivos locales.
- Ampliar expresiones naturales y autocompletado.
- Añadir más ejemplos `.syscalc` listos para importar.
- Mejorar experiencia móvil y accesibilidad del editor.

## Limitaciones Conocidas

- Los festivos locales son una aproximación; no sustituyen fuentes oficiales.
- Los cálculos laborables de intervalos extremadamente largos se limitan para no bloquear el navegador.
- Las fechas en formato `dd/mm` requieren año explícito para no confundirse con divisiones.

## Licencia

Este proyecto se distribuye bajo la licencia **GNU Affero General Public License v3.0 (AGPLv3)**.
