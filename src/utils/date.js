import {
  endOfDay,
  format,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
} from 'date-fns';

export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = typeof value === 'string' ? parseISO(value.replace(' ', 'T')) : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value, fallback = 'No due date') {
  const date = parseDate(value);
  return date ? format(date, 'dd MMM yyyy, HH:mm') : fallback;
}

export function formatDateInput(value) {
  const date = parseDate(value);
  return date ? format(date, "yyyy-MM-dd'T'HH:mm") : '';
}

export function toApiDeadline(value) {
  const date = parseDate(value);
  return date ? date.toISOString().slice(0, 19).replace('T', ' ') : null;
}

export function isTodayDate(value) {
  const date = parseDate(value);
  return date ? isSameDay(date, new Date()) : false;
}

export function isOverdue(value, completed = false) {
  const date = parseDate(value);
  return Boolean(date && !completed && isBefore(date, new Date()));
}

export function isWithinToday(value) {
  const date = parseDate(value);
  if (!date) return false;
  return isAfter(date, startOfDay(new Date())) && isBefore(date, endOfDay(new Date()));
}
