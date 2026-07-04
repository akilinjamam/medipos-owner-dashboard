import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Banknote, Building2, HeartPulse, Hourglass } from 'lucide-react';
import { usePlatformStatsQuery } from '@/services/adminApi';
import { formatMoney } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverviewPage() {
  const { data, isLoading } = usePlatformStatsQuery();

  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    );
  }

  const active = data.tenantsByStatus.active ?? 0;
  const trialing = data.tenantsByStatus.trialing ?? 0;
  const atRisk = (data.tenantsByStatus.past_due ?? 0) + (data.tenantsByStatus.canceled ?? 0);

  const cards = [
    { label: 'Total tenants', value: String(data.totalTenants), icon: Building2 },
    { label: 'Active / trialing', value: `${active} / ${trialing}`, icon: HeartPulse },
    { label: 'Past due + canceled', value: String(atRisk), icon: Hourglass },
    { label: 'MRR (active plans)', value: formatMoney(data.mrr), icon: Banknote },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Platform health at a glance. Revenue comes from gateway-validated payments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value}</p>
              </div>
              <Icon className="h-8 w-8 text-muted-foreground/50" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Signups by month</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.signupsByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={12} tickLine={false} width={32} />
                <Tooltip />
                <Bar dataKey="count" name="Signups" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue by month (BDT)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} />
                <YAxis fontSize={12} tickLine={false} width={48} />
                <Tooltip formatter={(v) => formatMoney(Number(v))} />
                <Bar dataKey="total" name="Revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tenants by plan</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-6 text-sm">
          {(['silver', 'gold', 'platinum'] as const).map((plan) => (
            <div key={plan}>
              <p className="capitalize text-muted-foreground">{plan}</p>
              <p className="text-xl font-semibold">{data.tenantsByPlan[plan] ?? 0}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
