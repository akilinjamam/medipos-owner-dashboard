import { Fragment, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useListTenantsQuery } from '@/services/adminApi';
import { useDebounce } from '@/hooks/useDebounce';
import { useTableSort } from '@/hooks/useTableSort';
import { ExpiryBar, ExpiryLegend } from '@/components/ExpiryBar';
import { SortableHead } from '@/components/SortableHead';
import { Pagination } from '@/components/Pagination';
import { PlanBadge, StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { formatDate, formatMoney } from '@/lib/format';
import type { Plan, SubscriptionStatus, TenantSortColumn } from '@/types/api';

const LIMIT = 20;

export default function TenantsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [status, setStatus] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const sort = useTableSort<TenantSortColumn>();

  const { data, isLoading, isFetching } = useListTenantsQuery({
    page,
    limit: LIMIT,
    search: debouncedSearch || undefined,
    plan: (plan || undefined) as Plan | undefined,
    status: (status || undefined) as SubscriptionStatus | undefined,
    sortBy: sort.sortBy,
    sortDir: sort.sortDir,
  });

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Tenants</h1>
          <p className="text-sm text-muted-foreground">
            Every pharmacy on the platform, with subscription state and usage.
          </p>
        </div>
        <ExpiryLegend />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search name or code…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
          />
        </div>
        <Select
          className="sm:w-40"
          value={plan}
          onChange={(e) => {
            setPlan(e.target.value);
            resetPage();
          }}
        >
          <option value="">All plans</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
          <option value="platinum">Platinum</option>
        </Select>
        <Select
          className="sm:w-40"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past due</option>
          <option value="canceled">Canceled</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table className={isFetching ? 'opacity-60' : undefined}>
                <TableHeader>
                  <TableRow>
                    <SortableHead column="name" sort={sort}>
                      Pharmacy
                    </SortableHead>
                    <SortableHead column="plan" sort={sort}>
                      Plan
                    </SortableHead>
                    <SortableHead column="subscriptionStatus" sort={sort}>
                      Status
                    </SortableHead>
                    <SortableHead column="subscriptionExpiresAt" sort={sort}>
                      Expires
                    </SortableHead>
                    <TableHead className="text-right">Staff</TableHead>
                    <TableHead className="text-right">Branches</TableHead>
                    <TableHead className="text-right">Total paid</TableHead>
                    <SortableHead column="createdAt" sort={sort}>
                      Joined
                    </SortableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                        No tenants match these filters.
                      </TableCell>
                    </TableRow>
                  )}
                  {data?.data.map((t) => (
                    // Each tenant is a pair of rows: the data row, then a thin
                    // full-width expiry bar (a div can't span a <tr> otherwise).
                    <Fragment key={t.id}>
                      <TableRow
                        className="cursor-pointer border-0"
                        onClick={() => navigate(`/tenants/${t.id}`)}
                      >
                        <TableCell>
                          <p className="font-medium">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.code ?? t.id}</p>
                        </TableCell>
                        <TableCell>
                          <PlanBadge plan={t.plan} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={t.subscriptionStatus} />
                        </TableCell>
                        <TableCell>{formatDate(t.subscriptionExpiresAt)}</TableCell>
                        <TableCell className="text-right">
                          {t.userCount}/{t.userLimit}
                        </TableCell>
                        <TableCell className="text-right">
                          {t.branchCount}/{t.branchLimit}
                        </TableCell>
                        <TableCell className="text-right">{formatMoney(t.totalPaid)}</TableCell>
                        <TableCell>{formatDate(t.createdAt)}</TableCell>
                      </TableRow>
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={8} className="p-0">
                          <ExpiryBar expiresAt={t.subscriptionExpiresAt} />
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                page={page}
                limit={LIMIT}
                total={data?.total ?? 0}
                onPageChange={setPage}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
