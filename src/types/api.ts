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
  reason?: string;
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

export interface PlatformStats {
  tenantsByStatus: Partial<Record<SubscriptionStatus, number>>;
  tenantsByPlan: Partial<Record<Plan, number>>;
  totalTenants: number;
  mrr: number;
  signupsByMonth: { month: string; count: number }[];
  revenueByMonth: { month: string; total: number; count: number }[];
}
