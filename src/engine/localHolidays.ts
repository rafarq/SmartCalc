// Festivos locales (de ciudad) con fecha fija bien conocidos, no cubiertos por
// date-holidays para España (que solo expone subdivisiones para Barcelona y
// las islas canarias). Movible (Corpus, Lunes de Pascua local, Magdalena…)
// quedan fuera para no introducir errores; conviene revisarlos cada año contra
// el BOE / BOP correspondiente.
//
// La clave es la ciudad en minúscula tal como aparece en REGION_MAP.

export type LocalEntry = { month: number; day: number; name: string };

export const LOCAL_HOLIDAYS: Record<string, LocalEntry[]> = {
  // Andalucía
  granada: [{ month: 0, day: 2, name: 'Toma de Granada' }],
  sevilla: [{ month: 4, day: 30, name: 'San Fernando' }],

  // Aragón
  zaragoza: [{ month: 0, day: 29, name: 'San Valero' }],

  // Asturias
  oviedo: [{ month: 8, day: 21, name: 'San Mateo' }],

  // Baleares
  palma: [
    { month: 0, day: 20, name: 'San Sebastián' },
    { month: 11, day: 31, name: "Festa de l'Estendard" },
  ],

  // Canarias
  'las palmas': [{ month: 5, day: 24, name: 'San Juan' }],
  'santa cruz de tenerife': [{ month: 4, day: 3, name: 'Día de la Cruz' }],

  // La Rioja
  logroño: [{ month: 8, day: 21, name: 'San Mateo' }],

  // Madrid
  madrid: [
    { month: 4, day: 15, name: 'San Isidro Labrador' },
    { month: 10, day: 9, name: 'Virgen de la Almudena' },
  ],

  // Navarra
  pamplona: [{ month: 6, day: 7, name: 'San Fermín' }],

  // País Vasco
  bilbao: [{ month: 6, day: 31, name: 'San Ignacio de Loyola' }],
  donostia: [{ month: 0, day: 20, name: 'Tamborrada de San Sebastián' }],
};

// Variantes ortográficas que comparten lista (sin/con acento, etc.).
const ALIASES: Record<string, string> = {
  'palma de mallorca': 'palma',
  logrono: 'logroño',
  'las palmas de gran canaria': 'las palmas',
  'san sebastián': 'donostia',
  'san sebastian': 'donostia',
};

export function getLocalHolidays(cityKey: string): LocalEntry[] {
  const k = cityKey.trim().toLowerCase();
  const canonical = ALIASES[k] ?? k;
  return LOCAL_HOLIDAYS[canonical] ?? [];
}
