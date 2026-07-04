import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

type UnknownError = FetchBaseQueryError | SerializedError;

/** 402 error code emitted by the server's subscription-enforcement middleware. */
export const SUBSCRIPTION_EXPIRED = 'SUBSCRIPTION_EXPIRED';

/**
 * The server's errorHandler envelope: `{ error: { message, code?, details? } }`.
 * Zod validation failures arrive with `details = flatten().fieldErrors`
 * (a `Record<field, string[]>`). The flat `message` fallback covers non-API
 * proxies/gateways that answer with their own shapes.
 */
interface ServerErrorBody {
  error?: {
    message?: string;
    code?: string;
    details?: unknown;
  };
  message?: string;
}

/** Narrow an `unknown` (e.g. a `catch` binding) to an RTK Query error object. */
function asError(error: unknown): UnknownError | null {
  if (error && typeof error === 'object' && ('status' in error || 'message' in error)) {
    return error as UnknownError;
  }
  return null;
}

function bodyOf(error: UnknownError): ServerErrorBody | string | undefined {
  if ('status' in error) return error.data as ServerErrorBody | string | undefined;
  return undefined;
}

/**
 * Extract a human-readable message from an RTK Query error, mapping the server's
 * envelope (`{ error: { message } }`) produced by errorHandler.
 */
export function getErrorMessage(raw: unknown, fallback = 'Something went wrong'): string {
  const error = asError(raw);
  if (!error) return fallback;

  if ('status' in error) {
    if (error.status === 'FETCH_ERROR') return 'Cannot reach the server. Check your connection.';
    const body = bodyOf(error);
    if (typeof body === 'string') return body || fallback;
    if (body?.error?.message) return body.error.message;
    if (body?.message) return body.message;
    return `Request failed (${error.status})`;
  }

  return error.message ?? fallback;
}

/**
 * Numeric HTTP status of an RTK Query error, or `undefined` for transport/
 * serialized errors (FETCH_ERROR, PARSING_ERROR, etc.). Lets callers branch on
 * specific codes (e.g. 503 = gateway not configured).
 */
export function getApiErrorStatus(raw: unknown): number | undefined {
  const error = asError(raw);
  if (error && 'status' in error && typeof error.status === 'number') return error.status;
  return undefined;
}

/** Machine-readable `error.code` from the server envelope (e.g. SUBSCRIPTION_EXPIRED). */
export function getApiErrorCode(raw: unknown): string | undefined {
  const error = asError(raw);
  if (!error || !('status' in error)) return undefined;
  const body = bodyOf(error);
  if (typeof body === 'string' || !body?.error) return undefined;
  return typeof body.error.code === 'string' ? body.error.code : undefined;
}

/**
 * Map a server Zod validation error (`error.details` = zod `flatten().fieldErrors`)
 * to a `{ field: message }` object for react-hook-form `setError`.
 */
export function getFieldErrors(raw: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  const error = asError(raw);
  if (!error || !('status' in error)) return out;
  const body = bodyOf(error);
  if (typeof body === 'string') return out;

  const details = body?.error?.details;
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    for (const [field, messages] of Object.entries(details as Record<string, unknown>)) {
      if (Array.isArray(messages) && typeof messages[0] === 'string' && !(field in out)) {
        out[field] = messages[0];
      }
    }
  }
  return out;
}
