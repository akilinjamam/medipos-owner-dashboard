import { api } from './api';
import type {
  AdminTenantListItem,
  AdminUpgradeRequest,
  DataResponse,
  ListTenantsParams,
  ListUpgradeRequestsParams,
  LoginResponse,
  MaintenanceState,
  Paginated,
  Payment,
  PlatformStats,
  RecordPaymentBody,
  Tenant,
  TenantDetail,
  UpdateSubscriptionBody,
} from '@/types/api';

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<LoginResponse, { email: string; password: string }>({
      query: (body) => ({ url: '/admin/login', method: 'POST', body }),
      transformResponse: (res: DataResponse<LoginResponse>) => res.data,
    }),

    platformStats: build.query<PlatformStats, void>({
      query: () => '/admin/stats',
      transformResponse: (res: DataResponse<PlatformStats>) => res.data,
      providesTags: ['Stats'],
    }),

    listTenants: build.query<Paginated<AdminTenantListItem>, ListTenantsParams>({
      query: (params) => ({ url: '/admin/tenants', params }),
      providesTags: ['Tenants'],
    }),

    getTenant: build.query<TenantDetail, string>({
      query: (id) => `/admin/tenants/${id}`,
      transformResponse: (res: DataResponse<TenantDetail>) => res.data,
      providesTags: (_res, _err, id) => [{ type: 'Tenant' as const, id }],
    }),

    updateSubscription: build.mutation<Tenant, { id: string; body: UpdateSubscriptionBody }>({
      query: ({ id, body }) => ({
        url: `/admin/tenants/${id}/subscription`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (res: DataResponse<Tenant>) => res.data,
      invalidatesTags: (_res, _err, { id }) => ['Tenants', 'Stats', { type: 'Tenant' as const, id }],
    }),

    recordPayment: build.mutation<
      { tenant: Tenant; payment: Payment },
      { id: string; body: RecordPaymentBody }
    >({
      query: ({ id, body }) => ({
        url: `/admin/tenants/${id}/payments`,
        method: 'POST',
        body,
      }),
      transformResponse: (res: DataResponse<{ tenant: Tenant; payment: Payment }>) => res.data,
      invalidatesTags: (_res, _err, { id }) => ['Tenants', 'Stats', { type: 'Tenant' as const, id }],
    }),

    listUpgradeRequests: build.query<Paginated<AdminUpgradeRequest>, ListUpgradeRequestsParams>({
      query: (params) => ({ url: '/admin/upgrade-requests', params }),
      providesTags: ['UpgradeRequests'],
    }),

    approveUpgradeRequest: build.mutation<
      { request: AdminUpgradeRequest; tenant: Tenant },
      { id: string; tenantId: string }
    >({
      query: ({ id }) => ({ url: `/admin/upgrade-requests/${id}/approve`, method: 'POST' }),
      transformResponse: (res: DataResponse<{ request: AdminUpgradeRequest; tenant: Tenant }>) =>
        res.data,
      invalidatesTags: (_res, _err, { tenantId }) => [
        'UpgradeRequests',
        'Tenants',
        'Stats',
        { type: 'Tenant' as const, id: tenantId },
      ],
    }),

    rejectUpgradeRequest: build.mutation<AdminUpgradeRequest, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/admin/upgrade-requests/${id}/reject`,
        method: 'POST',
        body: reason ? { reason } : {},
      }),
      transformResponse: (res: DataResponse<AdminUpgradeRequest>) => res.data,
      invalidatesTags: ['UpgradeRequests'],
    }),

    maintenance: build.query<MaintenanceState, void>({
      query: () => '/admin/settings/maintenance',
      transformResponse: (res: DataResponse<MaintenanceState>) => res.data,
      providesTags: ['Maintenance'],
    }),

    setMaintenance: build.mutation<MaintenanceState, MaintenanceState>({
      query: (body) => ({ url: '/admin/settings/maintenance', method: 'PATCH', body }),
      transformResponse: (res: DataResponse<MaintenanceState>) => res.data,
      invalidatesTags: ['Maintenance'],
    }),
  }),
});

export const {
  useLoginMutation,
  usePlatformStatsQuery,
  useListTenantsQuery,
  useGetTenantQuery,
  useUpdateSubscriptionMutation,
  useRecordPaymentMutation,
  useListUpgradeRequestsQuery,
  useApproveUpgradeRequestMutation,
  useRejectUpgradeRequestMutation,
  useMaintenanceQuery,
  useSetMaintenanceMutation,
} = adminApi;
