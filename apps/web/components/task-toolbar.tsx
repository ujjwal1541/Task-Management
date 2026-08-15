'use client';

import { useRef, useState } from 'react';
import { Check, Filter, LayoutGrid, List, Plus, Search, Table2 } from 'lucide-react';
import { Button, Input, MenuItem, Popover } from './ui';
import { PRIORITIES, STATUSES, type Priority, type Status } from '@/lib/types';
import { priorityLabel } from './badges';
import { cn } from '@/lib/utils';

export type FieldKey = 'priority' | 'members' | 'dueDate' | 'labels' | 'status' | 'reporter';

export const FIELDS: { key: FieldKey; label: string }[] = [
  { key: 'priority', label: 'Priority' },
  { key: 'members', label: 'Members' },
  { key: 'dueDate', label: 'Due Date' },
  { key: 'labels', label: 'Labels' },
  { key: 'status', label: 'Status' },
  { key: 'reporter', label: 'Reporter' },
];

export interface Filters {
  status?: Status;
  priority?: Priority;
}

export function TaskToolbar({
  title,
  view,
  onViewChange,
  search,
  onSearch,
  fields,
  onFieldsChange,
  filters,
  onFiltersChange,
  onAdd,
  addLabel = 'Add Task',
  showViewSwitch = true,
}: {
  title: string;
  view?: 'list' | 'board';
  onViewChange?: (view: 'list' | 'board') => void;
  search: string;
  onSearch: (value: string) => void;
  fields: Record<FieldKey, boolean>;
  onFieldsChange: (fields: Record<FieldKey, boolean>) => void;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onAdd: () => void;
  addLabel?: string;
  showViewSwitch?: boolean;
}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [fieldsOpen, setFieldsOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const fieldsAnchorRef = useRef<HTMLDivElement>(null);
  const filterAnchorRef = useRef<HTMLDivElement>(null);
  const activeFilters = Object.values(filters).filter(Boolean).length;

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
      <h1 className="mr-auto text-lg font-semibold tracking-tight">{title}</h1>

      {searchOpen ? (
        <div className="relative order-last w-full sm:order-none sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={search}
            placeholder="Search…"
            onChange={(e) => onSearch(e.target.value)}
            onBlur={() => !search && setSearchOpen(false)}
            className="pl-8"
          />
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setSearchOpen(true)} aria-label="Search">
          <Search className="h-4 w-4" />
        </Button>
      )}

      <div ref={fieldsAnchorRef}>
        <Button variant="outline" size="sm" onClick={() => setFieldsOpen((v) => !v)}>
          <Table2 className="h-4 w-4" /> <span className="hidden sm:inline">Fields</span>
        </Button>
        <Popover
          open={fieldsOpen}
          onClose={() => setFieldsOpen(false)}
          anchorRef={fieldsAnchorRef}
          align="right"
          className="min-w-[240px]"
        >
          {showViewSwitch && onViewChange && (
            <div className="mb-1.5 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1">
              {(['list', 'board'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => onViewChange(v)}
                  className={cn(
                    'flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] capitalize',
                    view === v ? 'bg-card shadow-card font-medium' : 'text-muted-foreground',
                  )}
                >
                  {v === 'list' ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />} {v}
                </button>
              ))}
            </div>
          )}
          {FIELDS.map((field) => (
            <button
              key={field.key}
              onClick={() => onFieldsChange({ ...fields, [field.key]: !fields[field.key] })}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-[13px] hover:bg-muted"
            >
              {field.label}
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-[5px] border',
                  fields[field.key] ? 'border-accent bg-accent text-accent-foreground' : 'bg-muted',
                )}
              >
                {fields[field.key] && <Check className="h-3 w-3" />}
              </span>
            </button>
          ))}
        </Popover>
      </div>

      <div ref={filterAnchorRef}>
        <Button variant="outline" size="sm" onClick={() => setFilterOpen((v) => !v)} aria-label="Filter">
          <Filter className="h-4 w-4" />
          {activeFilters > 0 && <span className="text-[11px]">{activeFilters}</span>}
        </Button>
        <Popover open={filterOpen} onClose={() => setFilterOpen(false)} anchorRef={filterAnchorRef} align="right">
          <p className="px-2.5 pb-1 pt-1 text-[11px] text-muted-foreground">Status</p>
          {STATUSES.map((status) => (
            <MenuItem
              key={status}
              onClick={() => onFiltersChange({ ...filters, status: filters.status === status ? undefined : status })}
            >
              {status}
              {filters.status === status && <Check className="ml-auto h-4 w-4" />}
            </MenuItem>
          ))}
          <p className="px-2.5 pb-1 pt-2 text-[11px] text-muted-foreground">Priority</p>
          {PRIORITIES.map((priority) => (
            <MenuItem
              key={priority}
              onClick={() =>
                onFiltersChange({ ...filters, priority: filters.priority === priority ? undefined : priority })
              }
            >
              {priorityLabel(priority)}
              {filters.priority === priority && <Check className="ml-auto h-4 w-4" />}
            </MenuItem>
          ))}
        </Popover>
      </div>

      <Button size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" /> <span className="hidden sm:inline">{addLabel}</span>
      </Button>
    </div>
  );
}