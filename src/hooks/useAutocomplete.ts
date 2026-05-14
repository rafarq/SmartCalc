import { useMemo, useState, useCallback, useEffect } from 'react';
import { GEOMETRY_CATALOG } from '../engine/geometry';

const ALL = GEOMETRY_CATALOG.map((f) => f.template);
const TRIGGER_RE = /^(area|perimetro|perímetro|volumen)\./i;

function normalizeTrigger(s: string): string {
  // perímetro → perimetro para hacer match con las plantillas que no llevan acento.
  return s.replace(/^perímetro/i, 'perimetro');
}

export function useAutocomplete(input: string) {
  const [selectedIndex, setIndex] = useState(0);

  const suggestions = useMemo(() => {
    const trimmed = input.trimStart();
    if (!TRIGGER_RE.test(trimmed)) return [];
    const normalized = normalizeTrigger(trimmed.toLowerCase());
    return ALL.filter((t) => t.startsWith(normalized));
  }, [input]);

  // Cuando cambia la lista de sugerencias, mantener el índice dentro de rango.
  useEffect(() => {
    if (selectedIndex >= suggestions.length) setIndex(0);
  }, [suggestions.length, selectedIndex]);

  const moveDown = useCallback(() => {
    setIndex((i) => (suggestions.length === 0 ? 0 : (i + 1) % suggestions.length));
  }, [suggestions.length]);

  const moveUp = useCallback(() => {
    setIndex((i) =>
      suggestions.length === 0 ? 0 : (i - 1 + suggestions.length) % suggestions.length,
    );
  }, [suggestions.length]);

  const reset = useCallback(() => setIndex(0), []);

  return { suggestions, selectedIndex, moveDown, moveUp, reset };
}
