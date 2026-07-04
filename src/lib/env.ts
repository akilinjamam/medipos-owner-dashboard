/**
 * Centralised access to build-time env. `VITE_API_URL` is the server origin;
 * the client always talks to its `/api/v1` sub-path (see `services/api.ts`).
 */
const API_ORIGIN = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

export const env = {
  apiOrigin: API_ORIGIN,
  apiBaseUrl: `${API_ORIGIN}/api/v1`,
} as const;
