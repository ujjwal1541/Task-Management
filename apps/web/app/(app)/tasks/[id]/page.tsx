'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check, Plus, Send, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PRIORITIES, STATUSES, type Task, type User } from '@/lib/types';
import { Avatar, Button, Card, Input, MenuItem, Popover, Textarea } from '@/components/ui';
import { LabelChip, PriorityBadge, StatusDot } from '@/components/badges';
import { formatDate, parseLabels } from '@/lib/utils';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [comment, setComment] = useState('');
  const [subtask, setSubtask] = useState('');
  const [statusOpen, setStatusOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setTask(await api.task(id));
    } catch {
      setNotFound(true);
    }
  }, [id]);

  useEffect(() => {
    void load();
    void api.users().then(setUsers).catch(() => setUsers([]));
  }, [load]);

  async function patch(body: Record<string, unknown>) {
    const updated = await api.updateTask(id, body);
    setTask((prev) => (prev ? { ...prev, ...updated } : updated));
  }

  if (notFound) {
    return (
      <div className="px-6 py-16 text-center">
        <h1 className="text-lg font-semibold">Task not found</h1>
        <Link href="/tasks" className="mt-2 inline-block text-[13px] text-accent underline">
          Back to tasks
        </Link>
      </div>
    );
  }

  if (!task) return <p className="px-6 py-10 text-sm text-muted-foreground">Loading task…</p>;

  const labels = parseLabels(task.labels);

  return (
    <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <button onClick={() => router.push('/tasks')} className="rounded-lg p-1.5 hover:bg-muted" aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <span className="text-[13px] text-muted-foreground">Tasks / {task.status}</span>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto text-red-500"
          onClick={async () => {
            await api.deleteTask(task.id);
            router.push('/tasks');
          }}
        >
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="space-y-4">
          <input
            value={task.title}
            onChange={(e) => setTask({ ...task, title: e.target.value })}
            onBlur={(e) => void patch({ title: e.target.value })}
            className="w-full bg-transparent text-2xl font-semibold tracking-tight outline-none"
          />

          <Card className="p-4">
            <h2 className="mb-2 text-[13px] font-medium text-muted-foreground">Description</h2>
            <Textarea
              rows={5}
              value={task.description ?? ''}
              placeholder="Add a more detailed description…"
              onChange={(e) => setTask({ ...task, description: e.target.value })}
              onBlur={(e) => void patch({ description: e.target.value })}
            />
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 text-[13px] font-medium text-muted-foreground">
              Subtasks {task.subtasks?.length ? `(${task.subtasks.filter((s) => s.status === 'Completed').length}/${task.subtasks.length})` : ''}
            </h2>
            <div className="space-y-1">
              {task.subtasks?.map((sub) => (
                <div key={sub.id} className="flex items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-muted">
                  <button
                    onClick={async () => {
                      await api.updateTask(sub.id, { status: sub.status === 'Completed' ? 'To Do' : 'Completed' });
                      await load();
                    }}
                    className={`flex h-4 w-4 items-center justify-center rounded-[5px] border ${
                      sub.status === 'Completed' ? 'border-accent bg-accent text-accent-foreground' : ''
                    }`}
                    aria-label="Toggle subtask"
                  >
                    {sub.status === 'Completed' && <Check className="h-3 w-3" />}
                  </button>
                  <span className={`text-[13px] ${sub.status === 'Completed' ? 'text-muted-foreground line-through' : ''}`}>
                    {sub.title}
                  </span>
                </div>
              ))}
            </div>
            <form
              className="mt-2 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!subtask.trim()) return;
                await api.createTask({ title: subtask.trim(), parentId: task.id } as never);
                setSubtask('');
                await load();
              }}
            >
              <Input value={subtask} onChange={(e) => setSubtask(e.target.value)} placeholder="Add subtask" />
              <Button type="submit" size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </form>
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-[13px] font-medium text-muted-foreground">
              Comments {task.comments?.length ? `(${task.comments.length})` : ''}
            </h2>
            <div className="space-y-3">
              {task.comments?.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <Avatar name={c.author?.name} url={c.author?.avatarUrl} size={28} />
                  <div>
                    <p className="text-[13px] font-medium">
                      {c.author?.name ?? 'Someone'}{' '}
                      <span className="font-normal text-muted-foreground">{formatDate(c.createdAt)}</span>
                    </p>
                    <p className="text-[13px] leading-5">{c.body}</p>
                  </div>
                </div>
              ))}
              {!task.comments?.length && <p className="text-[13px] text-muted-foreground">No comments yet.</p>}
            </div>
            <form
              className="mt-3 flex gap-2"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!comment.trim()) return;
                await api.addComment(task.id, comment.trim());
                setComment('');
                await load();
              }}
            >
              <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Write a comment…" />
              <Button type="submit" size="sm">
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>

        <aside className="space-y-3">
          <Card className="space-y-3 p-4">
            <Field label="Status">
              <div className="relative">
                <button onClick={() => setStatusOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] hover:bg-muted">
                  <StatusDot status={task.status} /> {task.status}
                </button>
                <Popover open={statusOpen} onClose={() => setStatusOpen(false)} className="left-0 right-auto">
                  {STATUSES.map((status) => (
                    <MenuItem key={status} onClick={async () => { setStatusOpen(false); await patch({ status }); }}>
                      <StatusDot status={status} /> {status}
                    </MenuItem>
                  ))}
                </Popover>
              </div>
            </Field>

            <Field label="Priority">
              <div className="relative">
                <button onClick={() => setPriorityOpen((v) => !v)} className="rounded-lg px-2 py-1 hover:bg-muted">
                  <PriorityBadge priority={task.priority} />
                </button>
                <Popover open={priorityOpen} onClose={() => setPriorityOpen(false)} className="left-0 right-auto">
                  {PRIORITIES.map((priority) => (
                    <MenuItem key={priority} onClick={async () => { setPriorityOpen(false); await patch({ priority }); }}>
                      <PriorityBadge priority={priority} />
                    </MenuItem>
                  ))}
                </Popover>
              </div>
            </Field>

            <Field label="Assignee">
              <div className="relative">
                <button onClick={() => setAssigneeOpen((v) => !v)} className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-[13px] hover:bg-muted">
                  <Avatar name={task.assignee?.name} url={task.assignee?.avatarUrl} size={20} />
                  {task.assignee?.name ?? 'Unassigned'}
                </button>
                <Popover open={assigneeOpen} onClose={() => setAssigneeOpen(false)} className="left-0 right-auto">
                  <MenuItem onClick={async () => { setAssigneeOpen(false); await patch({ assigneeId: null }); }}>
                    Unassigned
                  </MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} onClick={async () => { setAssigneeOpen(false); await patch({ assigneeId: u.id }); }}>
                      <Avatar name={u.name} url={u.avatarUrl} size={20} /> {u.name}
                    </MenuItem>
                  ))}
                </Popover>
              </div>
            </Field>

            <Field label="Due Date">
              <input
                type="date"
                value={task.dueDate ? task.dueDate.slice(0, 10) : ''}
                onChange={(e) => void patch({ dueDate: e.target.value || null })}
                className="rounded-lg bg-transparent px-2 py-1 text-[13px] outline-none hover:bg-muted"
              />
            </Field>
          </Card>

          <Card className="p-4">
            <h2 className="mb-2 text-[13px] font-medium text-muted-foreground">Labels</h2>
            <div className="flex flex-wrap gap-1">
              {labels.map((label) => (
                <button
                  key={label}
                  onClick={() => void patch({ labels: labels.filter((l) => l !== label) })}
                  title="Remove label"
                >
                  <LabelChip>{label}</LabelChip>
                </button>
              ))}
              {!labels.length && <p className="text-[13px] text-muted-foreground">No labels</p>}
            </div>
            <Input
              className="mt-2"
              placeholder="Add label + Enter"
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                const value = e.currentTarget.value.trim();
                if (!value) return;
                e.currentTarget.value = '';
                void patch({ labels: [...labels, value] });
              }}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}
