import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Ban, CalendarPlus, CheckCircle2, CreditCard } from 'lucide-react';
import { useGetTenantQuery, useUpdateSubscriptionMutation } from '@/services/adminApi';
import { getErrorMessage } from '@/lib/apiError';
import { formatDate, formatMoney } from '@/lib/format';
import { ExpiryBar } from '@/components/ExpiryBar';
import { PlanBadge, StatusBadge } from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Plan, UpdateSubscriptionBody } from '@/types/api';

type Action = 'renew' | 'extend' | 'suspend' | 'reactivate' | null;

/** Default renewal expiry — one billing cycle from today, as a date-input value. */
function nextMonthValue(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d.toISOString().slice(0, 10);
}

export default function TenantDetailPage() {
  const { id = '' } = useParams();
  const { data, isLoading } = useGetTenantQuery(id, { skip: !id });
  const [updateSubscription, { isLoading: isSaving }] = useUpdateSubscriptionMutation();

  const [action, setAction] = useState<Action>(null);
  const [plan, setPlan] = useState<Plan>('silver');
  const [expiresAt, setExpiresAt] = useState(nextMonthValue());

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const { tenant, owner, userCount, branchCount, payments } = data;

  const openRenew = () => {
    setPlan(tenant.plan);
    setExpiresAt(nextMonthValue());
    setAction('renew');
  };

  const openExtend = () => {
    setExpiresAt(nextMonthValue());
    setAction('extend');
  };

  const submit = async (body: UpdateSubscriptionBody, success: string) => {
    try {
      await updateSubscription({ id: tenant.id, body }).unwrap();
      toast.success(success);
      setAction(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Update failed'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/tenants">
            <ArrowLeft className="mr-1 h-4 w-4" /> Tenants
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">{tenant.name}</h1>
        <span className="text-sm text-muted-foreground">{tenant.code ?? tenant.id}</span>
        <PlanBadge plan={tenant.plan} />
        <StatusBadge status={tenant.subscriptionStatus} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Expires:</span>{' '}
              {formatDate(tenant.subscriptionExpiresAt)}
            </p>
            <ExpiryBar expiresAt={tenant.subscriptionExpiresAt} />
            <p>
              <span className="text-muted-foreground">Joined:</span> {formatDate(tenant.createdAt)}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={openRenew}>
                <CreditCard className="mr-1 h-4 w-4" /> Set plan / renew
              </Button>
              <Button size="sm" variant="outline" onClick={openExtend}>
                <CalendarPlus className="mr-1 h-4 w-4" /> Extend expiry
              </Button>
              {tenant.subscriptionStatus === 'canceled' ? (
                <Button size="sm" variant="outline" onClick={() => setAction('reactivate')}>
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Reactivate
                </Button>
              ) : (
                <Button size="sm" variant="destructive" onClick={() => setAction('suspend')}>
                  <Ban className="mr-1 h-4 w-4" /> Suspend
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Staff:</span> {userCount} of{' '}
              {tenant.userLimit}
            </p>
            <p>
              <span className="text-muted-foreground">Branches:</span> {branchCount} of{' '}
              {tenant.branchLimit}
            </p>
            <p>
              <span className="text-muted-foreground">Total paid:</span>{' '}
              {formatMoney(payments.filter((p) => p.status === 'valid').reduce((s, p) => s + (p.amount ?? 0), 0))}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Owner</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {owner ? (
              <>
                <p>{owner.name}</p>
                <p className="text-muted-foreground">{owner.phone}</p>
                {owner.email && <p className="text-muted-foreground">{owner.email}</p>}
              </>
            ) : (
              <p className="text-muted-foreground">No active owner account.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                    No gateway payments recorded yet.
                  </TableCell>
                </TableRow>
              )}
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{formatDate(p.createdAt)}</TableCell>
                  <TableCell className="font-mono text-xs">{p.tranId}</TableCell>
                  <TableCell className="capitalize">{p.plan ?? '—'}</TableCell>
                  <TableCell className="text-right">{formatMoney(p.amount)}</TableCell>
                  <TableCell>
                    {p.status === 'valid' ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Valid</span>
                    ) : (
                      <span
                        className="text-red-600 dark:text-red-400"
                        title={p.reason ?? undefined}
                      >
                        Rejected
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Set plan / renew — the manual-billing action: plan + active + new expiry. */}
      <Dialog open={action === 'renew'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogHeader>
          <DialogTitle>Set plan &amp; renew</DialogTitle>
          <DialogDescription>
            Applies the plan, marks the subscription active, and sets a new expiry. Use this after
            receiving a manual payment.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="plan">Plan</Label>
            <Select id="plan" value={plan} onChange={(e) => setPlan(e.target.value as Plan)}>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="renew-expiry">Expires on</Label>
            <Input
              id="renew-expiry"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAction(null)}>
            Cancel
          </Button>
          <Button
            disabled={isSaving || !expiresAt}
            onClick={() =>
              submit({ plan, status: 'active', expiresAt }, `Plan set to ${plan}, active until ${formatDate(expiresAt)}`)
            }
          >
            {isSaving ? 'Saving…' : 'Apply'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={action === 'extend'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogHeader>
          <DialogTitle>Extend expiry</DialogTitle>
          <DialogDescription>
            Moves the expiry date without changing the plan. The subscription is marked active.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="extend-expiry">Expires on</Label>
          <Input
            id="extend-expiry"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAction(null)}>
            Cancel
          </Button>
          <Button
            disabled={isSaving || !expiresAt}
            onClick={() =>
              submit({ status: 'active', expiresAt }, `Subscription extended to ${formatDate(expiresAt)}`)
            }
          >
            {isSaving ? 'Saving…' : 'Extend'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={action === 'suspend'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogHeader>
          <DialogTitle>Suspend {tenant.name}?</DialogTitle>
          <DialogDescription>
            Marks the subscription canceled — the pharmacy's POS and dashboard are blocked until
            reactivated. Their data is untouched.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAction(null)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isSaving}
            onClick={() => submit({ status: 'canceled' }, 'Tenant suspended')}
          >
            {isSaving ? 'Suspending…' : 'Suspend'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={action === 'reactivate'} onOpenChange={(open) => !open && setAction(null)}>
        <DialogHeader>
          <DialogTitle>Reactivate {tenant.name}?</DialogTitle>
          <DialogDescription>
            Marks the subscription active again on the current plan and expiry. Extend the expiry
            too if it has already passed, or access will lapse again overnight.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAction(null)}>
            Cancel
          </Button>
          <Button
            disabled={isSaving}
            onClick={() => submit({ status: 'active' }, 'Tenant reactivated')}
          >
            {isSaving ? 'Saving…' : 'Reactivate'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
