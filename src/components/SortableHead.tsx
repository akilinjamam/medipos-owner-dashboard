import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { TableHead } from '@/components/ui/table';
import type { TableSort } from '@/hooks/useTableSort';
import { cn } from '@/lib/utils';

/** Tri-state sortable column header — pairs with `useTableSort`. */
export function SortableHead<C extends string>({
  column,
  sort,
  children,
  className,
}: {
  column: C;
  sort: TableSort<C>;
  children: ReactNode;
  className?: string;
}) {
  const active = sort.sortBy === column;
  const Icon = !active ? ArrowUpDown : sort.sortDir === 'desc' ? ArrowDown : ArrowUp;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => sort.toggle(column)}
        className="inline-flex items-center gap-1 hover:text-foreground"
      >
        {children}
        <Icon className={cn('h-3.5 w-3.5', active ? 'opacity-100' : 'opacity-40')} />
      </button>
    </TableHead>
  );
}
