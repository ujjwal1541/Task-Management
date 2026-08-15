'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { PRIORITIES, type Project } from '@/lib/types';
import { Avatar, MenuItem, Popover } from '@/components/ui';
import { PriorityBadge } from '@/components/badges';
import { TaskToolbar, type FieldKey, type Filters } from '@/components/task-toolbar';
import { formatDate } from '@/lib/utils';

const FIELDS: Record<FieldKey, boolean> = {
  priority: true,
  members: true,
  dueDate: true,
  labels: false,
  status: false,
  reporter: false,
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fields, setFields] = useState(FIELDS);
  const [filters, setFilters] = useState<Filters>({});

  const load = useCallback(async () => {
    try {
      setProjects(await api.projects());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (filters.priority && p.priority !== filters.priority) return false;
      return true;
    });
  }, [projects, search, filters]);

  return (
    <div>
      <TaskToolbar
        title="Projects"
        search={search}
        onSearch={setSearch}
        fields={fields}
        onFieldsChange={setFields}
        filters={filters}
        onFiltersChange={setFilters}
        showViewSwitch={false}
        addLabel="Add Project"
        onAdd={async () => {
          const project = await api.createProject({ name: 'New project' });
          setProjects((prev) => [...prev, project]);
        }}
      />

      <div className="px-4 pb-16 sm:px-6">
        {loading ? (
          <p className="py-10 text-sm text-muted-foreground">Loading projects…</p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <div className="hidden bg-muted/70 px-4 py-2.5 text-xs font-medium text-muted-foreground md:grid md:grid-cols-[minmax(0,1fr)_120px_130px_110px_140px_60px]">
              <span>Project</span>
              <span>Tasks</span>
              <span>Priority</span>
              <span>Lead</span>
              <span>Due Date</span>
              <span className="text-right">Actions</span>
            </div>
            {visible.map((project) => (
              <Row
                key={project.id}
                project={project}
                fields={fields}
                onUpdate={async (patch) => {
                  const updated = await api.updateProject(project.id, patch);
                  setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, ...updated } : p)));
                }}
                onDelete={async () => {
                  await api.deleteProject(project.id);
                  setProjects((prev) => prev.filter((p) => p.id !== project.id));
                }}
              />
            ))}
            {!visible.length && <p className="px-4 py-6 text-[13px] text-muted-foreground">No projects found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  project,
  fields,
  onUpdate,
  onDelete,
}: {
  project: Project;
  fields: Record<FieldKey, boolean>;
  onUpdate: (patch: Record<string, unknown>) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const priorityBtnRef = useRef<HTMLButtonElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-2 border-t px-4 py-3 text-sm md:grid-cols-[minmax(0,1fr)_120px_130px_110px_140px_60px]">
      <span className="truncate font-medium">{project.name}</span>
      <span className="hidden text-[13px] text-muted-foreground md:block">{project._count?.tasks ?? 0} tasks</span>
      <div className={`relative hidden md:block ${fields.priority ? '' : 'md:invisible'}`}>
        <button ref={priorityBtnRef} onClick={() => setPriorityOpen((v) => !v)} className="rounded-md px-1 py-0.5 hover:bg-muted">
          <PriorityBadge priority={project.priority} />
        </button>
        <Popover open={priorityOpen} onClose={() => setPriorityOpen(false)} anchorRef={priorityBtnRef} align="left">
          {PRIORITIES.map((priority) => (
            <MenuItem key={priority} onClick={async () => { setPriorityOpen(false); await onUpdate({ priority }); }}>
              <PriorityBadge priority={priority} />
            </MenuItem>
          ))}
        </Popover>
      </div>
      <div className={`hidden md:block ${fields.members ? '' : 'md:invisible'}`}>
        <Avatar name={project.lead?.name} url={project.lead?.avatarUrl} size={24} />
      </div>
      <span className={`hidden text-[13px] text-muted-foreground md:block ${fields.dueDate ? '' : 'md:invisible'}`}>
        {formatDate(project.dueDate)}
      </span>
      <div className="relative justify-self-end">
        <button ref={menuBtnRef} onClick={() => setOpen((v) => !v)} className="rounded-md p-1.5 hover:bg-muted" aria-label="Project actions">
          <MoreHorizontal className="h-4 w-4" />
        </button>
        <Popover open={open} onClose={() => setOpen(false)} anchorRef={menuBtnRef}>
          <MenuItem className="text-red-500" onClick={async () => { setOpen(false); await onDelete(); }}>
            <Trash2 className="h-4 w-4" /> Delete project
          </MenuItem>
        </Popover>
      </div>
    </div>
  );
}
