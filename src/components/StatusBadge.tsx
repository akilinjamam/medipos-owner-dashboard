import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Plan, SubscriptionStatus } from '@/types/api';

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  trialing: 'border-transparent bg-sky-500/15 text-sky-600 dark:text-sky-400',
  past_due: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  canceled: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
};

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  trialing: 'Trialing',
  past_due: 'Past due',
  canceled: 'Canceled',
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
  return <Badge className={cn(STATUS_STYLES[status])}>{STATUS_LABELS[status]}</Badge>;
}

const PLAN_STYLES: Record<Plan, string> = {
  silver: 'border-transparent bg-slate-500/15 text-slate-600 dark:text-slate-300',
  gold: 'border-transparent bg-yellow-500/15 text-yellow-600 dark:text-yellow-400',
  platinum: 'border-transparent bg-violet-500/15 text-violet-600 dark:text-violet-400',
};

export function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <Badge className={cn('capitalize', PLAN_STYLES[plan])}>{plan}</Badge>
  );
}
