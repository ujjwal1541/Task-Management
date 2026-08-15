'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { GripVertical, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Avatar, Input, MenuItem, Popover } from './ui';
import { DueChip, LabelChip, PriorityBadge, StatusDot } from './badges';
import { STATUSES, type Status, type Task } from '@/lib/types';
import { cn, formatShortDate, parseLabels } from '@/lib/utils';
import type { FieldKey } from './task-toolbar';

export function TaskBoard({
  tasks,
  fields,
  onCreate,
  onUpdate,
  onDelete,
}: {
  tasks: Task[];
  fields: Record<FieldKey, boolean>;
  onCreate: (title: string, status: Status) => Promise<void>;
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStatus, setOverStatus] = useState<Status | null>(null);

  async function drop(status: Status) {
    setOverStatus(null);
    if (!dragId) return;
    const task = tasks.find((t) => t.id === dragId);
    setDragId(null);
    if (!task || task.status === status) return;
    await onUpdate(task.id, { status });
  }

  return (
    <div className="scrollbar-thin flex gap-4 overflow-x-auto px-4 pb-16 sm:px-6">
      {STATUSES.map((status) => {
        const group = tasks.filter((t) => t.status === status);
        return (
          <section
            key={status}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStatus(status);
            }}
            onDragLeave={() => setOverStatus((s) => (s === status ? null : s))}
            onDrop={() => void drop(status)}
            className={cn(
              'flex w-[290px] shrink-0 flex-col gap-2 rounded-2xl border bg-surface p-2.5 transition-colors',
              overStatus === status && 'border-accent/60 bg-accent/5',
            )}
          >
            <header className="flex items-center gap-1.5 px-1 py-1 text-[13px] font-medium">
              <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
              <StatusDot status={status} />
              {status}
              <span className="text-muted-foreground">{group.length}</span>
            </header>

            {group.map((task) => (
              <article
                key={task.id}
                draggable
                onDragStart={() => setDragId(task.id)}
                onDragEnd={() => setDragId(null)}
                className={cn(
                  'group cursor-grab rounded-xl border bg-card p-3 shadow-card transition-shadow hover:shadow-pop',
                  dragId === task.id && 'opacity-50',
                )}
              >
                <div className="flex items-start gap-2">
                  <Link href={`/tasks/${task.id}`} className="flex-1 text-[13px] font-medium leading-5 hover:underline">
                    {task.title}
                  </Link>
                  <CardMenu task={task} onUpdate={onUpdate} onDelete={onDelete} />
                </div>
                <div className="mt-2.5 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
                    {fields.members && <Avatar name={task.assignee?.name} url={task.assignee?.avatarUrl} size={20} />}
                    {task.assignee?.name ?? 'Unassigned'}
                  </span>
                  {fields.dueDate && task.dueDate && <DueChip>{formatShortDate(task.dueDate)}</DueChip>}
                </div>
                {fields.priority && (
                  <div className="mt-2">
                    <PriorityBadge priority={task.priority} />
                  </div>
                )}
                {fields.labels && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {parseLabels(task.labels).slice(0, 2).map((label) => (
                      <LabelChip key={label}>{label}</LabelChip>
                    ))}
                  </div>
                )}
              </article>
            ))}

            <AddCard status={status} onCreate={onCreate} />
          </section>
        );
      })}
    </div>
  );
}

function CardMenu({
  task,
  onUpdate,
  onDelete,
}: {
  task: Task;
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={anchorRef}>
      <button onClick={() => setOpen((v) => !v)} className="rounded-md p-1 opacity-0 hover:bg-muted group-hover:opacity-100" aria-label="Card actions">
        <MoreHorizontal className="h-4 w-4" />
      </button>
      <Popover open={open} onClose={() => setOpen(false)} anchorRef={anchorRef} align="right">
        <p className="px-2.5 pb-1 text-[11px] text-muted-foreground">Move to</p>
        {STATUSES.filter((s) => s !== task.status).map((status) => (
          <MenuItem
            key={status}
            onClick={async () => {
              setOpen(false);
              await onUpdate(task.id, { status });
            }}
          >
            <StatusDot status={status} /> {status}
          </MenuItem>
        ))}
        <MenuItem className="text-red-500" onClick={async () => { setOpen(false); await onDelete(task.id); }}>
          <Trash2 className="h-4 w-4" /> Delete task
        </MenuItem>
      </Popover>
    </div>
  );
}

function AddCard({ status, onCreate }: { status: Status; onCreate: (title: string, status: Status) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  async function submit() {
    if (!title.trim()) return setOpen(false);
    await onCreate(title.trim(), status);
    setTitle('');
    setOpen(false);
  }

  return open ? (
    <Input
      autoFocus
      value={title}
      placeholder="Task name…"
      onChange={(e) => setTitle(e.target.value)}
      onBlur={submit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') void submit();
        if (e.key === 'Escape') setOpen(false);
      }}
    />
  ) : (
    <button
      onClick={() => setOpen(true)}
      className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] text-muted-foreground hover:bg-muted"
    >
      <Plus className="h-3.5 w-3.5" /> Add Task
    </button>
  );
}