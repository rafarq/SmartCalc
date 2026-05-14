// 52 capitales de provincia y ciudades autónomas → código ISO de comunidad autónoma
// usado por date-holidays para resolver festivos.
export const REGION_MAP: Record<string, string> = {
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
