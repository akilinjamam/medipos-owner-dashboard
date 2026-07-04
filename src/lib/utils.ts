import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn `cn()` — merge conditional class names, de-duplicating Tailwind utilities. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as Bangladeshi Taka. */
export function formatBDT(amount: number | undefined | null): string {
  const value = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 2,
  }).format(value);
}

/** Short, locale-friendly date (e.g. 24 Jun 2026). */
export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/** Whole-number formatter with thousands separators. */
export function formatNumber(value: number | undefined | null): string {
  return new Intl.NumberFormat('en-US').format(value ?? 0);
}
