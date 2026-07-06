import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import { env } from '@/lib/env';
import { loggedOut } from '@/features/auth/authSlice';
import type { RootState } from '@/app/store';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

/**
 * Unlike the tenant dashboard there is no silent-refresh flow — the admin
 * token lives ~12h and has no refresh endpoint. A 401 (expired/invalid) just
 * clears the session, and the router bounces to /login.
 */
const baseQueryWithLogout: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  apiCtx,
  extraOptions,
) => {
  const result = await rawBaseQuery(args, apiCtx, extraOptions);
  const url = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !url.includes('/admin/login')) {
    apiCtx.dispatch(loggedOut());
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithLogout,
  tagTypes: ['Stats', 'Tenants', 'Tenant', 'UpgradeRequests', 'Maintenance'],
  endpoints: () => ({}),
});
