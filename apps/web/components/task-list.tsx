'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { ChevronDown, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Avatar, Input, MenuItem, Popover } from './ui';
import { LabelChip, PriorityBadge, StatusDot } from './badges';
import { PRIORITIES, STATUSES, type Task, type Status } from '@/lib/types';
import { cn, formatDate, parseLabels } from '@/lib/utils';
import type { FieldKey } from './task-toolbar';

export function TaskList({
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
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6 px-4 pb-16 sm:px-6">
      {STATUSES.map((status) => {
        const group = tasks.filter((t) => t.status === status);
        const isCollapsed = collapsed[status];
        return (
          <section key={status}>
            <button
              onClick={() => setCollapsed((c) => ({ ...c, [status]: !c[status] }))}
              className="mb-2 flex items-center gap-1.5 text-sm font-medium"
            >
              <ChevronDown className={cn('h-4 w-4 transition-transform', isCollapsed && '-rotate-90')} />
              <StatusDot status={status} />
              {status}
              <span className="text-muted-foreground">{group.length}</span>
            </button>
            {!isCollapsed && (
              <div className="overflow-hidden rounded-xl border bg-card">
                <div className="hidden bg-muted/70 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_130px_110px_140px_60px]">
                  <span>Task</span>
                  <span className={cn(!fields.priority && 'invisible')}>Priority</span>
                  <span className={cn(!fields.members && 'invisible')}>Members</span>
                  <span className={cn(!fields.dueDate && 'invisible')}>Due Date</span>
                  <span className="text-right">Actions</span>
                </div>
                {group.length === 0 && (
                  <p className="px-4 py-4 text-[13px] text-muted-foreground">No tasks yet.</p>
                )}
                {group.map((task) => (
                  <TaskRow key={task.id} task={task} fields={fields} onUpdate={onUpdate} onDelete={onDelete} />
                ))}
                <AddTaskRow status={status} onCreate={onCreate} />
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function TaskRow({
  task,
  fields,
  onUpdate,
  onDelete,
}: {
  task: Task;
  fields: Record<FieldKey, boolean>;
  onUpdate: (id: string, patch: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priorityAnchorRef = useRef<HTMLDivElement>(null);
  const menuAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-2 border-t px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_130px_110px_140px_60px]">
      <div className="min-w-0">
        <Link href={`/tasks/${task.id}`} className="block truncate font-medium hover:underline">
          {task.title}
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 md:hidden">
          {fields.priority && <PriorityBadge priority={task.priority} />}
          {fields.dueDate && task.dueDate && (
            <span className="text-[11px] text-muted-foreground">{formatDate(task.dueDate)}</span>
          )}
        </div>
        {fields.labels && parseLabels(task.labels).length > 0 && (
          <div className="mt-1.5 hidden flex-wrap gap-1 md:flex">
            {parseLabels(task.labels).slice(0, 3).map((label) => (
              <LabelChip key={label}>{label}</LabelChip>
            ))}
          </div>
        )}
      </div>

      <div ref={priorityAnchorRef} className={cn('hidden md:block', !fields.priority && 'md:invisible')}>
        <button onClick={() => setPriorityOpen((v) => !v)} className="rounded-md px-1 py-0.5 hover:bg-muted">
          <PriorityBadge priority={task.priority} />
        </button>
        <Popover open={priorityOpen} onClose={() => setPriorityOpen(false)} anchorRef={priorityAnchorRef} align="left">
          <p className="px-2.5 pb-1 text-[11px] text-muted-foreground">Priority</p>
          {PRIORITIES.map((priority) => (
            <MenuItem
              key={priority}
              onClick={async () => {
                setPriorityOpen(false);
                await onUpdate(task.id, { priority });
              }}
            >
              <PriorityBadge priority={priority} />
            </MenuItem>
          ))}
        </Popover>
      </div>

      <div className={cn('hidden md:block', !fields.members && 'md:invisible')}>
        <Avatar name={task.assignee?.name} url={task.assignee?.avatarUrl} size={24} />
      </div>

      <span className={cn('hidden text-[13px] text-muted-foreground md:block', !fields.dueDate && 'md:invisible')}>
        {formatDate(task.dueDate)}
      </span>

      <div ref={menuAnchorRef} className="justify-self-end">
        <button onClick={() => setMenuOpen((v) => !v)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Task actions">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <Popover open={menuOpen} onClose={() => setMenuOpen(false)} anchorRef={menuAnchorRef} align="right">
          <p className="px-2.5 pb-1 text-[11px] text-muted-foreground">Move to</p>
          {STATUSES.filter((s) => s !== task.status).map((status) => (
            <MenuItem
              key={status}
              onClick={async () => {
                setMenuOpen(false);
                await onUpdate(task.id, { status });
              }}
            >
              <StatusDot status={status} /> {status}
            </MenuItem>
          ))}
          <MenuItem
            className="text-red-500"
            onClick={async () => {
              setMenuOpen(false);
              await onDelete(task.id);
            }}
          >
            <Trash2 className="h-4 w-4" /> Delete task
          </MenuItem>
        </Popover>
      </div>
    </div>
  );
}

function AddTaskRow({ status, onCreate }: { status: Status; onCreate: (title: string, status: Status) => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  async function submit() {
    if (!title.trim()) return setOpen(false);
    await onCreate(title.trim(), status);
    setTitle('');
    setOpen(false);
  }

  return (
    <div className="border-t px-3 py-2">
      {open ? (
        <Input
          autoFocus
          value={title}
          placeholder="Task name, press Enter to save"
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
          className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1.5 text-[13px] text-muted-foreground hover:bg-muted"
        >
          <Plus className="h-3.5 w-3.5" /> Add Task
        </button>
      )}
    </div>
  );
}