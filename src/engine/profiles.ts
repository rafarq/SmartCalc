// Perfiles geométricos de estructura (acero, aluminio…) cargados desde
// Constantes/perfiles.json. Cada perfil se expone como un objeto con sus
// propiedades geométricas (h, b, A, Ix, Wx, p, …) accesibles con notación
// punto desde mathjs: `IPN100.h`, `HEA150.p`, etc.

import perfiles from '../../Constantes/perfiles.json';

type RawProfile = Record<string, string | number>;
type RawFamilies = Record<string, RawProfile[]>;

export type Profile = Record<string, number>;
export type ProfilesMap = Record<string, Profile>;

// Convierte un valor del JSON (número o string) a número. Acepta separador
// decimal con coma («3,9») o punto. Devuelve null para vacíos o no numéricos
// (p. ej. el código «C»/«P» del campo `cm`).
function parseValue(v: string | number): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v !== 'string') return null;
  const trimmed = v.trim();
  if (!trimmed) return null;
  const n = parseFloat(trimmed.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

// Limpia el nombre del perfil para que sea un identificador válido en mathjs:
//   - Quita caracteres invisibles (soft hyphen U+00AD que aparece en «c­6»).
//   - Sustituye «.» por «_» para que «L40.4» → «L40_4».
//   - Conserva el resto (letras, dígitos, guion bajo).
function sanitizeProfileName(name: string): string {
  return name
    .replace(/­/g, '')
    .replace(/\./g, '_');
}

// Convierte una clave de propiedad en un identificador (e.g., «e-r» → «er»).
function sanitizePropName(name: string): string {
  return name.replace(/-/g, '');
}

function buildProfile(raw: RawProfile): Profile {
  const out: Profile = {};
  for (const [key, val] of Object.entries(raw)) {
    if (key === 'Perfil' || key === 'cm') continue;
    const n = parseValue(val);
    if (n === null) continue;
    out[sanitizePropName(key)] = n;
  }
  return out;
}

export function buildProfiles(): ProfilesMap {
  const map: ProfilesMap = {};
  const data = perfiles as RawFamilies;
  for (const fam of Object.values(data)) {
    for (const raw of fam) {
      const name = sanitizeProfileName(String(raw.Perfil));
      if (!name) continue;
      map[name] = buildProfile(raw);
    }
  }
  return map;
}

export const PROFILES: ProfilesMap = buildProfiles();

// Familias presentes (para mostrar en la ayuda y para tests).
export const PROFILE_FAMILIES: string[] = Object.keys(perfiles as object);
