'use client';

import { BarChart3, CalendarDays, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Priority } from '@/lib/types';

const PRIORITY_STYLE: Record<Priority, { label: string; color: string; bars: number }> = {
  none: { label: 'No Priority', color: 'text-muted-foreground', bars: 1 },
  urgent: { label: 'Urgent', color: 'text-red-500', bars: 4 },
  high: { label: 'High', color: 'text-orange-500', bars: 3 },
  medium: { label: 'Medium', color: 'text-amber-500', bars: 2 },
  low: { label: 'Low', color: 'text-muted-foreground', bars: 1 },
};

export function PriorityBadge({ priority, className }: { priority: Priority; className?: string }) {
  const meta = PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.none;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[13px]', meta.color, className)}>
      <span className="flex h-3 items-end gap-[2px]" aria-hidden>
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={cn('w-[3px] rounded-sm bg-current', bar <= meta.bars ? 'opacity-100' : 'opacity-25')}
            style={{ height: `${bar * 4}px` }}
          />
        ))}
      </span>
      {meta.label}
    </span>
  );
}

export function priorityLabel(priority: Priority) {
  return (PRIORITY_STYLE[priority] ?? PRIORITY_STYLE.none).label;
}

export function LabelChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border px-1.5 py-[3px] text-[11px] text-muted-foreground">
      <Tag className="h-3 w-3" />
      {children}
    </span>
  );
}

export function DueChip({ children, overdue }: { children: React.ReactNode; overdue?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border px-1.5 py-[3px] text-[11px]',
        overdue ? 'border-red-500/30 text-red-500' : 'text-muted-foreground',
      )}
    >
      <CalendarDays className="h-3 w-3" />
      {children}
    </span>
  );
}

export function StatusDot({ status }: { status: string }) {
  const color =
    status === 'Completed' ? 'bg-emerald-500' : status === 'Doing' ? 'bg-blue-500' : status === 'On Hold' ? 'bg-amber-500' : 'bg-muted-foreground';
  return <span className={cn('inline-block h-2 w-2 rounded-full', color)} aria-hidden />;
}

export { BarChart3 };
