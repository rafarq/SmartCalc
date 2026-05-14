import Holidays from 'date-holidays';
import { addDays, differenceInCalendarDays, eachDayOfInterval, getDay } from 'date-fns';
import { getLocalHolidays } from './localHolidays';

export { REGION_MAP } from './regionMap';

const cache = new Map<string, Holidays>();

function getInstance(region?: string): Holidays {
  const key = region ?? 'ES';
  let h = cache.get(key);
  if (!h) {
    h = region ? new Holidays('ES', region) : new Holidays('ES');
    cache.set(key, h);
  }
  return h;
}

// Resolución: el "region" que pasa el motor puede ser un código CCAA (MD, CT…)
// o el nombre de una capital ("madrid"). Si es nombre de capital aplicamos
// además los festivos locales de nuestro JSON.
function isCustomLocalHoliday(date: Date, cityKey?: string): boolean {
  if (!cityKey) return false;
  const list = getLocalHolidays(cityKey);
  if (list.length === 0) return false;
  return list.some((l) => l.month === date.getMonth() && l.day === date.getDate());
}

export function isWorkingDay(date: Date, region?: string, cityKey?: string): boolean {
  const dow = getDay(date);
  if (dow === 0 || dow === 6) return false;
  const info = getInstance(region).isHoliday(date);
  if (info && Array.isArray(info) && info.some((h) => h.type === 'public')) return false;
  if (isCustomLocalHoliday(date, cityKey)) return false;
  return true;
}

export function addWorkingDays(date: Date, n: number, region?: string, cityKey?: string): Date {
  if (n === 0) return date;
  const step = n > 0 ? 1 : -1;
  let remaining = Math.abs(n);
  let cur = date;
  while (remaining > 0) {
    cur = addDays(cur, step);
    if (isWorkingDay(cur, region, cityKey)) remaining--;
  }
  return cur;
}

export function workingDaysBetween(a: Date, b: Date, region?: string, cityKey?: string): number {
  const diff = differenceInCalendarDays(b, a);
  if (diff < 0) return -workingDaysBetween(b, a, region, cityKey);
  if (diff === 0) return 0;
  const days = eachDayOfInterval({ start: a, end: addDays(b, -1) });
  return days.filter((d) => isWorkingDay(d, region, cityKey)).length;
}
