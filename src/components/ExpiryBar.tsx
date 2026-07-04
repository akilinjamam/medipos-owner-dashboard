const DAY_MS = 86_400_000;
/** Fill window = one monthly billing cycle (server's `nextMonthlyExpiry`). */
const CYCLE_DAYS = 30;
/** At or below this many days left the bar turns amber. */
const WARN_DAYS = 7;

/**
 * Thin subscription-time-remaining bar. Width of the fill is proportional to
 * the days left until `expiresAt` (full = a whole 30-day cycle ahead):
 * emerald when healthy, amber at ≤7 days, red empty track when expired.
 * `ExpiryLegend` below explains the colors — keep the two in sync.
 */
export function ExpiryBar({ expiresAt }: { expiresAt?: string }) {
  if (!expiresAt) return null;

  const daysLeft = (new Date(expiresAt).getTime() - Date.now()) / DAY_MS;
  const expired = daysLeft <= 0;
  const pct = Math.min(100, Math.max(0, (daysLeft / CYCLE_DAYS) * 100));

  const title = expired
    ? `Expired ${Math.max(1, Math.floor(-daysLeft))} day(s) ago`
    : `${Math.ceil(daysLeft)} day(s) left`;

  return (
    <div
      className={expired ? 'h-0.5 w-full bg-red-500/30' : 'h-0.5 w-full bg-muted'}
      title={title}
    >
      {!expired && (
        <div
          className={daysLeft <= WARN_DAYS ? 'h-full bg-amber-500' : 'h-full bg-emerald-500'}
          style={{ width: `${pct}%` }}
        />
      )}
    </div>
  );
}

/** Color key for the expiry bars — shown top-right above the tenants table. */
export function ExpiryLegend() {
  const items = [
    { className: 'bg-emerald-500', label: `${WARN_DAYS + 1}+ days left` },
    { className: 'bg-amber-500', label: `≤${WARN_DAYS} days left` },
    { className: 'bg-red-500/40', label: 'Expired' },
  ];
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
      {items.map(({ className, label }) => (
        <span key={label} className="flex items-center gap-1.5">
          <span className={`h-1 w-5 rounded-full ${className}`} />
          {label}
        </span>
      ))}
    </div>
  );
}
