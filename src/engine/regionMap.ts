// Ciudad → código ISO de comunidad autónoma (usado por date-holidays).
// Se construye uniendo:
//   1. La lista manual de las 52 capitales de provincia + ciudades autónomas.
//   2. Los municipios que aparecen en Constantes/municipios.json (la
//      subdivision viene como "ES-XX", extraemos el código).

import municipios from '../../Constantes/municipios.json';

const MANUAL_REGION_MAP: Record<string, string> = {
  // Andalucía
  'almería': 'AN', almeria: 'AN',
  'cádiz': 'AN', cadiz: 'AN',
  'córdoba': 'AN', cordoba: 'AN',
  granada: 'AN',
  huelva: 'AN',
  'jaén': 'AN', jaen: 'AN',
  'málaga': 'AN', malaga: 'AN',
  sevilla: 'AN',
  // Aragón
  huesca: 'AR',
  teruel: 'AR',
  zaragoza: 'AR',
  // Asturias
  oviedo: 'AS',
  // Baleares
  'palma de mallorca': 'IB', palma: 'IB',
  // Canarias
  'las palmas': 'CN', 'las palmas de gran canaria': 'CN',
  'santa cruz de tenerife': 'CN',
  // Cantabria
  santander: 'CB',
  // Castilla y León
  'ávila': 'CL', avila: 'CL',
  burgos: 'CL',
  'león': 'CL', leon: 'CL',
  palencia: 'CL',
  salamanca: 'CL',
  segovia: 'CL',
  soria: 'CL',
  valladolid: 'CL',
  zamora: 'CL',
  // Castilla-La Mancha
  albacete: 'CM',
  'ciudad real': 'CM',
  cuenca: 'CM',
  guadalajara: 'CM',
  toledo: 'CM',
  // Cataluña
  barcelona: 'CT',
  girona: 'CT',
  lleida: 'CT',
  tarragona: 'CT',
  // Comunidad Valenciana
  alicante: 'VC',
  'castellón': 'VC', castellon: 'VC', 'castelló': 'VC', castello: 'VC',
  valencia: 'VC', 'valència': 'VC',
  // Extremadura
  badajoz: 'EX',
  'cáceres': 'EX', caceres: 'EX',
  // Galicia
  'a coruña': 'GA', 'la coruña': 'GA', 'a coruna': 'GA',
  lugo: 'GA',
  ourense: 'GA',
  pontevedra: 'GA',
  // La Rioja
  'logroño': 'RI', logrono: 'RI',
  // Madrid
  madrid: 'MD',
  // Murcia
  murcia: 'MC',
  // Navarra
  pamplona: 'NC',
  // País Vasco
  bilbao: 'PV',
  donostia: 'PV',
  'san sebastián': 'PV', 'san sebastian': 'PV',
  vitoria: 'PV', 'vitoria-gasteiz': 'PV',
  // Ciudades autónomas
  ceuta: 'CE',
  melilla: 'ML',
};

function regionMapFromJson(): Record<string, string> {
  const out: Record<string, string> = {};
  const data = municipios as Record<string, { subdivision: string }>;
  for (const [city, info] of Object.entries(data)) {
    const m = info.subdivision.match(/^ES-(\w+)$/);
    if (m) out[city.toLowerCase()] = m[1];
  }
  return out;
}

export const REGION_MAP: Record<string, string> = {
  ...regionMapFromJson(),
  ...MANUAL_REGION_MAP, // manual gana frente al JSON
};
