// Festivos locales (de ciudad) por capital y municipio relevante. Hay dos
// fuentes que se combinan:
//   1. Lista curada manualmente para las capitales con patronales fijas bien
//      conocidas, con el nombre explícito (San Isidro, San Fermín, etc.).
//   2. Constantes/municipios.json — fechas de 2026 obtenidas del BOE/BOP para
//      ~80 ciudades. Asumimos que se repiten cada año en la misma fecha (es
//      una aproximación: algunas patronales son movibles y conviene revisar
//      contra la fuente oficial). Solo se usa para las ciudades que no tienen
//      entrada manual.
//
// La clave es la ciudad en minúscula. Los acentos/variantes ortográficas se
// resuelven con la tabla ALIASES más abajo.

import municipios from '../../Constantes/municipios.json';

export type LocalEntry = { month: number; day: number; name: string };

// 1) Lista curada con nombres explícitos. Tiene prioridad sobre los datos del
//    JSON cuando una ciudad aparece en ambos.
const CURATED: Record<string, LocalEntry[]> = {
  granada: [{ month: 0, day: 2, name: 'Toma de Granada' }],
  sevilla: [{ month: 4, day: 30, name: 'San Fernando' }],
  zaragoza: [{ month: 0, day: 29, name: 'San Valero' }],
  oviedo: [{ month: 8, day: 21, name: 'San Mateo' }],
  palma: [
    { month: 0, day: 20, name: 'San Sebastián' },
    { month: 11, day: 31, name: "Festa de l'Estendard" },
  ],
  'santa cruz de tenerife': [{ month: 4, day: 3, name: 'Día de la Cruz' }],
  'logroño': [{ month: 8, day: 21, name: 'San Mateo' }],
  madrid: [
    { month: 4, day: 15, name: 'San Isidro Labrador' },
    { month: 10, day: 9, name: 'Virgen de la Almudena' },
  ],
  pamplona: [{ month: 6, day: 7, name: 'San Fermín' }],
  bilbao: [{ month: 6, day: 31, name: 'San Ignacio de Loyola' }],
  donostia: [{ month: 0, day: 20, name: 'Tamborrada de San Sebastián' }],
};

type MunicipioEntry = { subdivision: string; holidays: string[] };
const MUNICIPIOS = municipios as Record<string, MunicipioEntry>;

// 2) A partir del JSON, mes/día. El JSON usa fechas con año, pero asumimos que
//    la combinación mes/día se repite cada año (aproximación documentada).
function fromJson(): Record<string, LocalEntry[]> {
  const out: Record<string, LocalEntry[]> = {};
  for (const [city, info] of Object.entries(MUNICIPIOS)) {
    const key = city.toLowerCase();
    const entries: LocalEntry[] = info.holidays
      .map((iso) => {
        // ISO "YYYY-MM-DD" → mes 0-indexado, día.
        const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
        if (!m) return null;
        return {
          month: parseInt(m[2], 10) - 1,
          day: parseInt(m[3], 10),
          name: 'Festivo local',
        } as LocalEntry;
      })
      .filter((x): x is LocalEntry => x !== null);
    if (entries.length > 0) out[key] = entries;
  }
  return out;
}

// 3) Mezcla: el JSON aporta el grueso de ciudades; las curadas sobrescriben.
export const LOCAL_HOLIDAYS: Record<string, LocalEntry[]> = {
  ...fromJson(),
  ...CURATED,
};

// Variantes ortográficas que comparten lista (sin/con acento, etc.).
const ALIASES: Record<string, string> = {
  'palma de mallorca': 'palma',
  logrono: 'logroño',
  'las palmas de gran canaria': 'las palmas',
  'san sebastián': 'donostia',
  'san sebastian': 'donostia',
  // Alias generados a partir del JSON (variantes sin acento).
  mostoles: 'móstoles',
  leganes: 'leganés',
  almeria: 'almería',
  'alcala de henares': 'alcalá de henares',
  castellon: 'castellón',
  'alcorcon': 'alcorcón',
  'san cristobal de la laguna': 'san Cristóbal de la Laguna',
  'a coruña': 'la coruña',
  'a coruna': 'la coruña',
  cordoba: 'cordoba',
  'córdoba': 'cordoba',
  cadiz: 'cádiz',
  jaen: 'jaén',
  caceres: 'cáceres',
  'torrejon de ardoz': 'torrejón de ardoz',
  mataro: 'mataró',
  leon: 'león',
  'sant cugat del valles': 'sant cugat del vallès',
  gijon: 'gijon',
  'gijón': 'gijon',
  vigo: 'vigo',
};

export function getLocalHolidays(cityKey: string): LocalEntry[] {
  const k = cityKey.trim().toLowerCase();
  const canonical = ALIASES[k] ?? k;
  return LOCAL_HOLIDAYS[canonical] ?? [];
}
