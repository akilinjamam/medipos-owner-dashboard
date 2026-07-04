import { useCallback, useState } from 'react';

export type SortDir = 'asc' | 'desc';

export interface TableSort<C extends string> {
  /** Active sort column, or undefined for the server's default order. */
  sortBy?: C;
  /** Direction — undefined when no column is active (so it's omitted from queries). */
  sortDir?: SortDir;
  /** Cycle a column: none → asc → desc → none. */
  toggle: (column: C) => void;
}

/**
 * Tri-state column sort for server-sorted tables. Clicking a column cycles
 * asc → desc → back to the server default. Feed `sortBy`/`sortDir` straight into
 * the list query; they're `undefined` when no column is selected.
 */
export function useTableSort<C extends string>(): TableSort<C> {
  const [sortBy, setSortBy] = useState<C | undefined>(undefined);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const toggle = useCallback(
    (column: C) => {
      if (sortBy !== column) {
        // New column → ascending.
        setSortBy(column);
        setSortDir('asc');
      } else if (sortDir === 'asc') {
        // Same column, asc → desc.
        setSortDir('desc');
      } else {
        // Same column, desc → clear back to the server default.
        setSortBy(undefined);
        setSortDir('asc');
      }
    },
    [sortBy, sortDir],
  );

  return { sortBy, sortDir: sortBy ? sortDir : undefined, toggle };
}
