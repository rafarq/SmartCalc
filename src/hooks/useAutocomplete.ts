import { useMemo, useState, useCallback, useEffect } from 'react';
import { GEOMETRY_CATALOG } from '../engine/geometry';
import { PROFILES } from '../engine/profiles';

export type Suggestion = {
  // Texto a mostrar en la lista (puede ser parcial, p. ej. solo «h»).
  label: string;
  // Texto que se inserta en la línea (siempre completo, p. ej. «IPN100.h»).
  text: string;
  // Carácter de la línea actual donde empieza la sustitución (para no romper
  // el resto de la expresión).
  replaceFrom: number;
  // Descripción opcional para ayudar a distinguir entradas.
  description?: string;
};

const GEOMETRY_TEMPLATES = GEOMETRY_CATALOG.map((f) => ({
  template: f.template,
  description: f.description,
}));
const GEOMETRY_TRIGGER_RE = /^(area|perimetro|perímetro|volumen)\./i;

// Etiquetas amigables para las propiedades más típicas de los perfiles.
const PROP_DESCRIPTIONS: Record<string, string> = {
  h: 'altura',
  b: 'ancho',
  er: 'espesor del alma',
  e1: 'espesor del ala',
  r1: 'radio de acuerdo',
  h1: 'altura interior',
  u: 'perímetro',
  A: 'área',
  Sx: 'momento estático',
  Ix: 'inercia eje X',
  Wx: 'módulo resistente eje X',
  ix: 'radio de giro X',
  Iy: 'inercia eje Y',
  Wy: 'módulo resistente eje Y',
  iy: 'radio de giro Y',
  It: 'inercia a torsión',
  Ia: 'módulo de alabeo',
  w: 'separación de agujeros',
  a: 'separación de líneas',
  e2: 'distancia al baricentro',
  p: 'peso por metro',
};

// Detecta si al final del input hay `<perfil>.<propiedad parcial>` para
// completar las propiedades del perfil sin pisar el resto de la expresión.
function detectProfileSuffix(
  input: string,
): { profile: string; partial: string; replaceFrom: number } | null {
  const m = input.match(/([A-Za-z][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/);
  if (!m) return null;
  const profile = m[1];
  if (!PROFILES[profile]) return null;
  return {
    profile,
    partial: m[2],
    replaceFrom: input.length - m[0].length,
  };
}

function normalizeGeometryTrigger(s: string): string {
  return s.replace(/^perímetro/i, 'perimetro');
}

function computeSuggestions(input: string): Suggestion[] {
  // 1) Completado de propiedades de perfil al final del input.
  const prof = detectProfileSuffix(input);
  if (prof) {
    const props = Object.keys(PROFILES[prof.profile]);
    return props
      .filter((p) => p.toLowerCase().startsWith(prof.partial.toLowerCase()))
      .map((p) => ({
        label: p,
        text: `${prof.profile}.${p}`,
        replaceFrom: prof.replaceFrom,
        description: PROP_DESCRIPTIONS[p],
      }));
  }
  // 2) Plantillas de geometría (matchea el inicio de la línea).
  const trimmed = input.trimStart();
  if (!GEOMETRY_TRIGGER_RE.test(trimmed)) return [];
  const normalized = normalizeGeometryTrigger(trimmed.toLowerCase());
  return GEOMETRY_TEMPLATES.filter((t) => t.template.startsWith(normalized)).map((t) => ({
    label: t.template,
    text: t.template,
    replaceFrom: 0,
    description: t.description,
  }));
}

export function useAutocomplete(input: string) {
  const [selectedIndex, setIndex] = useState(0);

  const suggestions = useMemo(() => computeSuggestions(input), [input]);

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
