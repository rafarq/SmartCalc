import { useCallback, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';

type Theme = 'light' | 'dark';
const STORAGE_KEY = 'smartcalc.theme';

function readCurrent(): Theme {
  if (typeof document === 'undefined') return 'light';
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => readCurrent());

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* localStorage no disponible */
    }
  }, [theme]);

  // Click X/Y opcional: si se pasa un evento de ratón, usamos su posición como
  // origen de la transición. Si no, partimos del centro de la pantalla.
  const toggle = useCallback((evt?: { clientX: number; clientY: number }) => {
    const next: Theme = readCurrent() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', evt ? `${evt.clientX}px` : '50vw');
    root.style.setProperty('--reveal-y', evt ? `${evt.clientY}px` : '50vh');
    // Dirección de la transición: a-light usa el efecto ripple
    // (overshoot + pulso de brillo); a-dark mantiene el circular reveal clásico.
    root.dataset.transition = next === 'light' ? 'to-light' : 'to-dark';

    const cleanup = () => delete root.dataset.transition;

    type ViewTransition = { finished?: Promise<void> };
    type WithViewTransition = Document & {
      startViewTransition?: (cb: () => void) => ViewTransition;
    };
    const doc = document as WithViewTransition;
    if (typeof doc.startViewTransition === 'function') {
      const t = doc.startViewTransition(() => {
        flushSync(() => setThemeState(next));
      });
      t?.finished?.then(cleanup, cleanup);
    } else {
      setThemeState(next);
      cleanup();
    }
  }, []);

  return { theme, toggle };
}
