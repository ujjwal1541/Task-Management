# AbleSpace Assignment — Pyramid Task Management

Monorepo: **Next.js 14 (App Router) + Tailwind CSS** frontend, **NestJS + Prisma (SQLite)** backend, TypeScript everywhere.

## Run locally (VS Code)

```bash
npm run setup   # installs deps, creates SQLite db, seeds demo data
npm run dev     # api on :4000, web on :3000
```

Open http://localhost:3000 and click **Continue as Guest**.

Useful scripts: `npm run build`, `npm run start`, `npm run lint`.

## Features
- Guest login (JWT), auth-guarded app shell
- Tasks: list view grouped by status + kanban board with drag & drop
- Inline create/rename, status & priority menus, assignee, due date, labels
- Subtasks with completion, comments
- Projects list with priority, lead, due date, task counts
- Search, filters (status/priority), toggleable Fields (Priority, Members, Due Date, Labels, Status, Reporter)
- Theme: light / dark / system + 6 accent colors, persisted in localStorage
- Fully responsive (mobile sidebar drawer, adaptive tables)

## Structure
```
apps/api   NestJS: auth, tasks, projects, users modules; Prisma schema + seed
apps/web   Next.js: app routes, reusable components, lib (api client, types, utils)
docs       Part 2 — product understanding write-up
```

## Notes
- Backend base URL is configurable via `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api`).
- SQLite is used for zero-config portability; swap the Prisma datasource to PostgreSQL if desired.
