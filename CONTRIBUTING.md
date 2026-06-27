# Contributing to SmartCalc

Gracias por contribuir a SmartCalc.

## Cómo Instalar

Requisitos:

- Node.js 22 o superior recomendado
- npm

Instalación:

```bash
npm install
```

## Cómo Ejecutar

Para desarrollo local:

```bash
npm run dev
```

La aplicación quedará disponible normalmente en `http://localhost:5173`.

## Cómo Pasar los Tests

Comandos principales:

```bash
npm run test
npm run test:run
npm run test:coverage
```

Validaciones recomendadas antes de abrir un Pull Request:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run test -- --run
npm run build
```

## Cómo Enviar Pull Requests

1. Haz un fork del repositorio.
2. Crea una rama desde `main`.
3. Implementa el cambio con el alcance más pequeño posible.
4. Añade o actualiza tests cuando cambie el comportamiento.
5. Ejecuta las validaciones locales antes de enviar el PR.
6. Abre un Pull Request con una descripción clara del problema y la solución.

Recomendaciones:

- Mantén los cambios enfocados y evita mezclar refactors grandes con fixes pequeños.
- Si tocas el motor de cálculo, documenta ejemplos de entrada/salida.
- Si cambias comportamiento visible, actualiza `README.md` o la ayuda si aplica.
