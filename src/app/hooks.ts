import { useDispatch, useSelector, useStore } from 'react-redux';
import type { AppDispatch, RootState, store } from './store';

/** Typed `useDispatch` — use everywhere instead of the plain hook. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
/** Typed `useSelector`. */
export const useAppSelector = useSelector.withTypes<RootState>();
/** Typed `useStore`. */
export const useAppStore = useStore.withTypes<typeof store>();
