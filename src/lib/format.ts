/** BDT money formatting for payment/revenue figures. */
export function formatMoney(amount?: number | null): string {
  if (amount === undefined || amount === null) return '—';
  return `৳${amount.toLocaleString('en-IN')}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
