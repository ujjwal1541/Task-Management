'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Status, Task } from '@/lib/types';
import { TaskToolbar, type FieldKey, type Filters } from '@/components/task-toolbar';
import { TaskList } from '@/components/task-list';
import { TaskBoard } from '@/components/task-board';

const DEFAULT_FIELDS: Record<FieldKey, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: true,
  status: true,
  reporter: false,
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'board'>('list');
  const [search, setSearch] = useState('');
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [filters, setFilters] = useState<Filters>({});
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setTasks(await api.tasks());
      setError(null);
    } catch {
      setError('Unable to load tasks. Is the API running on port 4000?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const stored = window.localStorage.getItem('ablespace.tasksView');
    if (stored === 'board' || stored === 'list') setView(stored);
  }, []);

  function changeView(next: 'list' | 'board') {
    setView(next);
    window.localStorage.setItem('ablespace.tasksView', next);
  }

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((task) => {
      if (q && !task.title.toLowerCase().includes(q) && !task.description?.toLowerCase().includes(q)) return false;
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      return true;
    });
  }, [tasks, search, filters]);

  const create = async (title: string, status: Status) => {
    const task = await api.createTask({ title, status });
    setTasks((prev) => [...prev, task]);
  };

  const update = async (id: string, patch: Record<string, unknown>) => {
    const task = await api.updateTask(id, patch);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...task } : t)));
  };

  const remove = async (id: string) => {
    await api.deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div>
      <TaskToolbar
        title="Tasks"
        view={view}
        onViewChange={changeView}
        search={search}
        onSearch={setSearch}
        fields={fields}
        onFieldsChange={setFields}
        filters={filters}
        onFiltersChange={setFilters}
        onAdd={() => void create('New task', filters.status ?? 'To Do')}
      />
      {error && <p className="px-6 pb-4 text-[13px] text-red-500">{error}</p>}
      {loading ? (
        <p className="px-6 py-10 text-sm text-muted-foreground">Loading tasks…</p>
      ) : view === 'list' ? (
        <TaskList tasks={visible} fields={fields} onCreate={create} onUpdate={update} onDelete={remove} />
      ) : (
        <TaskBoard tasks={visible} fields={fields} onCreate={create} onUpdate={update} onDelete={remove} />
      )}
    </div>
  );
}
