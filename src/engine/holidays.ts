import Holidays from 'date-holidays';
import { addDays, differenceInCalendarDays, eachDayOfInterval, getDay } from 'date-fns';

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

export function isWorkingDay(date: Date, region?: string): boolean {
  const dow = getDay(date);
  if (dow === 0 || dow === 6) return false;
  const info = getInstance(region).isHoliday(date);
  if (info && Array.isArray(info)) {
    return !info.some((h) => h.type === 'public');
  }
  return true;
}

export function addWorkingDays(date: Date, n: number, region?: string): Date {
  if (n === 0) return date;
  const step = n > 0 ? 1 : -1;
  let remaining = Math.abs(n);
  let cur = date;
  while (remaining > 0) {
    cur = addDays(cur, step);
    if (isWorkingDay(cur, region)) remaining--;
  }
  return cur;
}

export function workingDaysBetween(a: Date, b: Date, region?: string): number {
  const diff = differenceInCalendarDays(b, a);
  if (diff < 0) return -workingDaysBetween(b, a, region);
  if (diff === 0) return 0;
  const days = eachDayOfInterval({ start: a, end: addDays(b, -1) });
  return days.filter((d) => isWorkingDay(d, region)).length;
}
