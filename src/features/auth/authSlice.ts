import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Admin session: a single 12h token, no refresh flow (see the server's
 * superAdmin.middleware). Persisted to sessionStorage so a reload within the
 * token's lifetime doesn't force a re-login; expiry simply 401s and logs out.
 */
const STORAGE_KEY = 'medipos-admin-auth';

interface AuthState {
  token: string | null;
  email: string | null;
}

function load(): AuthState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AuthState>;
      if (typeof parsed.token === 'string') {
        return { token: parsed.token, email: parsed.email ?? null };
      }
    }
  } catch {
    // Corrupt/unavailable storage — start signed out.
  }
  return { token: null, email: null };
}

const authSlice = createSlice({
  name: 'auth',
  initialState: load(),
  reducers: {
    loggedIn(state, action: PayloadAction<{ token: string; email: string }>) {
      state.token = action.payload.token;
      state.email = action.payload.email;
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload));
    },
    loggedOut(state) {
      state.token = null;
      state.email = null;
      sessionStorage.removeItem(STORAGE_KEY);
    },
  },
});

export const { loggedIn, loggedOut } = authSlice.actions;
export default authSlice.reducer;
