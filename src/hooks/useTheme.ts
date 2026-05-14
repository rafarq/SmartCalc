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
  // origen del circular reveal. Si no, partimos del centro de la pantalla.
  const toggle = useCallback((evt?: { clientX: number; clientY: number }) => {
    const next: Theme = readCurrent() === 'dark' ? 'light' : 'dark';
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', evt ? `${evt.clientX}px` : '50vw');
    root.style.setProperty('--reveal-y', evt ? `${evt.clientY}px` : '50vh');

    type WithViewTransition = Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    const doc = document as WithViewTransition;
    if (typeof doc.startViewTransition === 'function') {
      doc.startViewTransition(() => {
        flushSync(() => setThemeState(next));
      });
    } else {
      setThemeState(next);
    }
  }, []);

  return { theme, toggle };
}
