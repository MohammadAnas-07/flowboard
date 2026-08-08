# Flowboard

A task and project board built for the AbleSpace Full Stack Developer (Fresher) technical assessment. Create projects, add tasks with a status and priority, drag them across a Kanban board or work from a list view, break tasks into subtasks, comment on them, and filter the list/board by status or priority.

## Live demo

- App: https://flowboard-zeta-eight.vercel.app
- API: https://flowboard-api-9074.onrender.com (health check at `/health`)

Click "Continue as Guest" on the login page. There's no real account system: guest login always resolves to the same shared demo user, so profile edits on the Settings page are local to your browser session and don't persist. Google login is a disabled stub, not wired up (see architecture.md's Known Deviations for why).

## Tech stack

Frontend is Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. State is plain React (`useState`/`useEffect`) plus `fetch`, no Redux or React Query. Board drag-and-drop uses `@dnd-kit`, dropdowns and menus use Radix UI, dates use `date-fns` and `react-day-picker`. Light/dark mode and an independent accent-color setting both run through `next-themes` plus a small custom provider, persisted to `localStorage`.

Backend is NestJS 11, TypeScript, Prisma 6 as the ORM, PostgreSQL as the database. Auth is a JWT in an `httpOnly` cookie, checked by a global guard on every route except the ones explicitly marked `@Public()`. Every write goes through a `class-validator` DTO before it reaches Prisma.

Frontend deploys to Vercel, backend to Render (via `render.yaml`), database is Neon's serverless Postgres. `architecture.md` has the reasoning behind each of those choices, plus the full data model and API reference.

## Setup

You need Node.js and a Postgres database (Neon's free tier works fine, or run Postgres locally).

Backend:

```bash
cd backend
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, CORS_ORIGIN
npm install             # also runs `prisma generate` via postinstall
npm run prisma:migrate  # applies the migrations in prisma/migrations
npm run prisma:seed     # seeds the five default labels
npm run start:dev       # http://localhost:4000
```

Frontend, in a separate terminal:

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL, defaults to http://localhost:4000
npm install
npm run dev   # http://localhost:3000
```

Open `http://localhost:3000` and click "Continue as Guest."

## Folder structure

Real tree of the tracked repo, `node_modules`/build output excluded:

```
├── backend
│   ├── prisma
│   │   ├── migrations
│   │   │   ├── 20260808051618_init_schema
│   │   │   │   └── migration.sql
│   │   │   ├── 20260808060434_add_subtask_assignees
│   │   │   │   └── migration.sql
│   │   │   ├── 20260808090709_add_task_activity_and_resource_url
│   │   │   │   └── migration.sql
│   │   │   └── migration_lock.toml
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src
│   │   ├── auth
│   │   │   ├── decorators
│   │   │   │   └── current-user.decorator.ts
│   │   │   ├── guards
│   │   │   │   └── auth.guard.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.types.ts
│   │   ├── comments
│   │   │   ├── dto
│   │   │   │   └── create-comment.dto.ts
│   │   │   ├── comments.controller.ts
│   │   │   ├── comments.module.ts
│   │   │   └── comments.service.ts
│   │   ├── common
│   │   │   └── decorators
│   │   │       └── public.decorator.ts
│   │   ├── labels
│   │   │   ├── dto
│   │   │   │   ├── create-label.dto.ts
│   │   │   │   └── update-label.dto.ts
│   │   │   ├── labels.controller.ts
│   │   │   ├── labels.module.ts
│   │   │   └── labels.service.ts
│   │   ├── prisma
│   │   │   ├── prisma.module.ts
│   │   │   └── prisma.service.ts
│   │   ├── projects
│   │   │   ├── dto
│   │   │   │   ├── create-project.dto.ts
│   │   │   │   └── update-project.dto.ts
│   │   │   ├── projects.controller.ts
│   │   │   ├── projects.module.ts
│   │   │   └── projects.service.ts
│   │   ├── subtasks
│   │   │   ├── dto
│   │   │   │   ├── create-subtask.dto.ts
│   │   │   │   └── update-subtask.dto.ts
│   │   │   ├── subtasks.controller.ts
│   │   │   ├── subtasks.module.ts
│   │   │   └── subtasks.service.ts
│   │   ├── tasks
│   │   │   ├── dto
│   │   │   │   ├── create-task.dto.ts
│   │   │   │   ├── move-task-status.dto.ts
│   │   │   │   ├── query-task.dto.ts
│   │   │   │   └── update-task.dto.ts
│   │   │   ├── tasks.controller.ts
│   │   │   ├── tasks.module.ts
│   │   │   └── tasks.service.ts
│   │   ├── app.controller.spec.ts
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts
│   ├── test
│   │   ├── app.e2e-spec.ts
│   │   └── jest-e2e.json
│   └── (config: .env.example, package.json, tsconfig*.json, nest-cli.json, eslint.config.mjs, .prettierrc)
├── frontend
│   ├── public
│   │   └── (svg icons)
│   ├── src
│   │   ├── app
│   │   │   ├── (app)                      # main authenticated shell: sidebar + these routes
│   │   │   │   ├── projects
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── tasks
│   │   │   │   │   ├── [taskId]/page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx             # auth gate + Sidebar
│   │   │   ├── (settings)
│   │   │   │   └── settings/page.tsx      # own nav, no main sidebar (see below)
│   │   │   ├── login/page.tsx
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx                 # root layout, theme init scripts
│   │   │   └── page.tsx
│   │   ├── components
│   │   │   ├── layout                     # sidebar, theming, user menu
│   │   │   ├── settings                   # settings page view
│   │   │   ├── shared                     # data table, dropdowns, used by more than one feature
│   │   │   ├── tasks                      # board, list, task detail pieces
│   │   │   └── ui                         # avatar, badge
│   │   ├── lib
│   │   │   ├── api.ts                     # client-side fetch wrappers
│   │   │   ├── auth-server.ts             # server-side auth check
│   │   │   ├── constants.ts
│   │   │   ├── theme.ts
│   │   │   └── types.ts                   # mirrors backend/prisma/schema.prisma
│   │   └── proxy.ts                       # Next 16's middleware, redirect-only auth check
│   └── (config: .env.example, package.json, tsconfig.json, next.config.ts, eslint.config.mjs, postcss.config.mjs)
├── architecture.md
├── README.md
└── render.yaml
```

`backend/src` is organized by feature module (`tasks`, `projects`, `subtasks`, `comments`, `labels`, `auth`), each with its own controller, service, and DTOs, the structure `nest generate` produces. `frontend/src/app` uses two route groups: `(app)` is the authenticated shell with the main sidebar, `(settings)` is the standalone settings page, split out so it can have its own "Back to app" nav instead of inheriting the main one. `frontend/src/components/shared` holds the pieces reused across features (the data table backs the task list, project list, and subtasks table; the dropdown primitives back the Fields filter, label picker, and status/priority pickers), rather than each feature building its own copy.

See [architecture.md](architecture.md) for the data model, the full API reference, and the deviations from the original Figma design.
