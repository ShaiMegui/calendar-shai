import { format, parseISO, addMinutes } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';

export function decodeSlot(slot: string | null, timezone: string, hourType: '12h' | '24h'): string | null {
  if (!slot) return null;

  const date = parseISO(decodeURIComponent(slot));
  const zonedDate = utcToZonedTime(date, timezone);
  
  return format(zonedDate, hourType === '12h' ? 'hh:mm a' : 'HH:mm');
}

export function formatSlot(slot: string, timezone: string, hourType: '12h' | '24h'): string {
  const date = parseISO(slot);
  const zonedDate = utcToZonedTime(date, timezone);
  
  return format(zonedDate, hourType === '12h' ? 'hh:mm a' : 'HH:mm');
}

export function formatSelectedSlot(
  slot: string,
  duration: number,
  timezone: string,
  hourType: '12h' | '24h'
): string {
  const startDate = parseISO(decodeURIComponent(slot));
  const endDate = addMinutes(startDate, duration);
  
  const zonedStartDate = utcToZonedTime(startDate, timezone);
  const zonedEndDate = utcToZonedTime(endDate, timezone);
  
  const timeFormat = hourType === '12h' ? 'hh:mm a' : 'HH:mm';
  const dateFormat = 'EEEE, MMMM d';
  
  return `${format(zonedStartDate, dateFormat)} · ${format(zonedStartDate, timeFormat)} - ${format(zonedEndDate, timeFormat)}`;
}