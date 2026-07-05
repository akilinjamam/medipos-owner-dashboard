import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import {
  useApproveUpgradeRequestMutation,
  useListUpgradeRequestsQuery,
  useRejectUpgradeRequestMutation,
} from '@/services/adminApi';
import { getErrorMessage } from '@/lib/apiError';
import { formatDate, formatMoney } from '@/lib/format';
import { PlanBadge } from '@/components/StatusBadge';
import { Pagination } from '@/components/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import type { AdminUpgradeRequest, UpgradeRequestStatus } from '@/types/api';

const LIMIT = 20;

const STATUS_STYLES: Record<UpgradeRequestStatus, string> = {
  pending: 'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400',
  approved: 'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  rejected: 'border-transparent bg-red-500/15 text-red-600 dark:text-red-400',
};

function RequestStatusBadge({ status }: { status: UpgradeRequestStatus }) {
  return <Badge className={cn('capitalize', STATUS_STYLES[status])}>{status}</Badge>;
}

/**
 * Manual-billing queue: tenants who sent money to the personal bKash/Nagad
 * number and submitted a TrxID. Verify the money actually arrived (matching
 * TrxID AND amount), then approve — approval records the Payment and
 * activates the plan in one step.
 */
export default function UpgradeRequestsPage() {
  const [status, setStatus] = useState<UpgradeRequestStatus | ''>('pending');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListUpgradeRequestsQuery({
    page,
    limit: LIMIT,
    ...(status ? { status } : {}),
  });

  const [approve, { isLoading: approving }] = useApproveUpgradeRequestMutation();
  const [reject, { isLoading: rejecting }] = useRejectUpgradeRequestMutation();

  const [toApprove, setToApprove] = useState<AdminUpgradeRequest | null>(null);
  const [toReject, setToReject] = useState<AdminUpgradeRequest | null>(null);
  const [reason, setReason] = useState('');

  const onApprove = async () => {
    if (!toApprove) return;
    try {
      const result = await approve({ id: toApprove.id, tenantId: toApprove.tenantId }).unwrap();
      toast.success(
        `Approved — ${result.tenant.name} is now on ${result.tenant.plan} until ${formatDate(result.tenant.subscriptionExpiresAt)}`,
      );
      setToApprove(null);
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not approve the request'));
    }
  };

  const onReject = async () => {
    if (!toReject) return;
    try {
      await reject({ id: toReject.id, reason: reason.trim() || undefined }).unwrap();
      toast.success('Request rejected');
      setToReject(null);
      setReason('');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Could not reject the request'));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Upgrade requests</h1>
          <p className="text-sm text-muted-foreground">
            Verify the TrxID and amount in your bKash/Nagad statement before approving.
          </p>
        </div>
        <Select
          className="w-40"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as UpgradeRequestStatus | '');
            setPage(1);
          }}
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading || !data ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>TrxID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No {status || ''} upgrade requests.
                      </TableCell>
                    </TableRow>
                  )}
                  {data.data.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{formatDate(r.createdAt)}</TableCell>
                      <TableCell>
                        <Link to={`/tenants/${r.tenantId}`} className="font-medium hover:underline">
                          {r.tenantName ?? r.tenantId}
                        </Link>
                        {r.tenantCode && (
                          <span className="ml-1 text-xs text-muted-foreground">{r.tenantCode}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <PlanBadge plan={r.plan} />
                      </TableCell>
                      <TableCell className="text-right">{formatMoney(r.amount)}</TableCell>
                      <TableCell className="capitalize">{r.method}</TableCell>
                      <TableCell className="font-mono text-xs">{r.trxId}</TableCell>
                      <TableCell>
                        <RequestStatusBadge status={r.status} />
                        {r.status === 'rejected' && r.note && (
                          <span className="ml-1 text-xs text-muted-foreground" title={r.note}>
                            *
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {r.status === 'pending' && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" onClick={() => setToApprove(r)}>
                              <Check className="mr-1 h-4 w-4" /> Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                setReason('');
                                setToReject(r);
                              }}
                            >
                              <X className="mr-1 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination page={page} limit={LIMIT} total={data.total} onPageChange={setPage} />
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!toApprove} onOpenChange={(open) => !open && setToApprove(null)}>
        <DialogHeader>
          <DialogTitle>Approve this upgrade?</DialogTitle>
          <DialogDescription>
            {toApprove && (
              <>
                Confirm you received <strong>{formatMoney(toApprove.amount)}</strong> via{' '}
                <span className="capitalize">{toApprove.method}</span> with TrxID{' '}
                <span className="font-mono">{toApprove.trxId}</span> from{' '}
                {toApprove.tenantName ?? 'this tenant'}. Approving records the payment and
                activates the {toApprove.plan} plan for one month immediately.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setToApprove(null)}>
            Cancel
          </Button>
          <Button disabled={approving} onClick={onApprove}>
            {approving ? 'Approving…' : 'Money received — approve'}
          </Button>
        </DialogFooter>
      </Dialog>

      <Dialog open={!!toReject} onOpenChange={(open) => !open && setToReject(null)}>
        <DialogHeader>
          <DialogTitle>Reject this request?</DialogTitle>
          <DialogDescription>
            The tenant will see the reason on their dashboard and can submit a corrected request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="reject-reason">Reason (optional)</Label>
          <Input
            id="reject-reason"
            placeholder="e.g. TrxID not found / amount mismatch"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setToReject(null)}>
            Cancel
          </Button>
          <Button variant="destructive" disabled={rejecting} onClick={onReject}>
            {rejecting ? 'Rejecting…' : 'Reject'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
