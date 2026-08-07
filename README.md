# Flowboard

Full-stack task/project board — AbleSpace Full Stack Developer (Fresher) technical assessment.

> This README is a stub. It will be filled in properly (screenshots, full setup, scripts,
> deployed links) as the build progresses. See [architecture.md](architecture.md) for the
> actual source of truth on structure and decisions in the meantime.

## Stack

- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS — [`/frontend`](frontend)
- **Backend:** NestJS, TypeScript — [`/backend`](backend)
- **Database:** PostgreSQL via Prisma ORM

## Local setup (placeholder)

```bash
# Backend
cd backend
cp .env.example .env   # fill in DATABASE_URL etc.
npm install
npm run start:dev

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

TODO: expand with DB provisioning steps, migration commands, and deployed URLs once available.
