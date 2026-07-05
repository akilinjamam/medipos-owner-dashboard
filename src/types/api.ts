/**
 * Shapes returned by medipos-server's /api/v1/admin module — keep in sync with
 * `medipos-server/src/modules/admin/*` (and the serialization plugin: docs
 * arrive with a string `id`, never `_id`).
 */
export interface DataResponse<T> {
  data: T;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export type Plan = 'silver' | 'gold' | 'platinum';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

/** Monthly list prices in BDT — mirrors the server's `subscription.config.ts`. */
export const PLAN_PRICES: Record<Plan, number> = {
  silver: 1000,
  gold: 2500,
  platinum: 5000,
};

export interface LoginResponse {
  accessToken: string;
  email: string;
}

export interface AdminTenantListItem {
  id: string;
  name: string;
  code?: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string;
  branchLimit: number;
  userLimit: number;
  userCount: number;
  branchCount: number;
  totalPaid: number;
  lastPaymentAt?: string;
  createdAt: string;
}

export interface ListTenantsParams {
  page: number;
  limit: number;
  search?: string;
  plan?: Plan;
  status?: SubscriptionStatus;
  sortBy?: TenantSortColumn;
  sortDir?: 'asc' | 'desc';
}

/** Mirrors the server's zod `sortBy` allow-list — don't add columns it rejects. */
export type TenantSortColumn =
  | 'name'
  | 'plan'
  | 'subscriptionStatus'
  | 'subscriptionExpiresAt'
  | 'createdAt';

export interface Tenant {
  id: string;
  name: string;
  code?: string;
  plan: Plan;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string;
  branchLimit: number;
  userLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  tranId: string;
  valId?: string;
  plan?: Plan;
  amount?: number;
  status: 'valid' | 'rejected';
  /** Absent on rows written before the field existed — treat as 'gateway'. */
  source?: 'gateway' | 'manual';
  reason?: string;
  note?: string;
  createdAt: string;
}

export interface TenantDetail {
  tenant: Tenant;
  owner: { name: string; phone: string; email?: string } | null;
  userCount: number;
  branchCount: number;
  payments: Payment[];
}

export interface UpdateSubscriptionBody {
  plan?: Plan;
  status?: SubscriptionStatus;
  expiresAt?: string;
}

/** POST /admin/tenants/:id/payments — record a manual payment + activate. */
export interface RecordPaymentBody {
  plan: Plan;
  amount?: number;
  reference?: string;
  note?: string;
}

export type UpgradeRequestStatus = 'pending' | 'approved' | 'rejected';

/** GET /admin/upgrade-requests — tenant-submitted TrxIDs awaiting verification. */
export interface AdminUpgradeRequest {
  id: string;
  tenantId: string;
  tenantName?: string;
  tenantCode?: string;
  plan: Plan;
  amount: number;
  method: 'bkash' | 'nagad';
  trxId: string;
  status: UpgradeRequestStatus;
  note?: string;
  createdAt: string;
}

export interface ListUpgradeRequestsParams {
  page: number;
  limit: number;
  status?: UpgradeRequestStatus;
}

export interface PlatformStats {
  tenantsByStatus: Partial<Record<SubscriptionStatus, number>>;
  tenantsByPlan: Partial<Record<Plan, number>>;
  totalTenants: number;
  mrr: number;
  signupsByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; total: number; count: number }[];
}
