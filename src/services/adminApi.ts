import { api } from './api';
import type {
  AdminTenantListItem,
  DataResponse,
  ListTenantsParams,
  LoginResponse,
  Paginated,
  PlatformStats,
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
  }),
});

export const {
  useLoginMutation,
  usePlatformStatsQuery,
  useListTenantsQuery,
  useGetTenantQuery,
  useUpdateSubscriptionMutation,
} = adminApi;
