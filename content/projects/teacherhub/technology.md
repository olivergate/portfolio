---
slug: teacherhub/technology
status: published
---

A pnpm monorepo: a Next.js 15 app (App Router), shared packages for types, UI, and database access, and Supabase migrations in `infra/`.

## Stack, with reasons

- **Next.js 15 + Mantine 8.** One UI system, no Tailwind, by decision (ADR-0004). Mixing component systems is how design drift starts.
- **Supabase (Postgres, Auth, Storage), cloud-only.** No local Docker for day-to-day work (ADR-0003). 101 SQL migrations, schema-first.
- **Row-level security with materialised auth columns.** The enrollments table stores `teacher_auth_uid` and `student_auth_uid` directly, which removed a class of recursive RLS policies. The fix is written up in the repo.
- **TanStack Query + Zod.** All server state goes through typed query/mutation wrappers; all external input is validated at the boundary by schemas in a shared types package.
- **Daily.co** for video, **Dexie (IndexedDB)** for offline-first homework, **Capacitor 8** for the native iOS/Android wrap.

## The AI layer

- **OpenAI GPT-4o** for homework generation and lesson synthesis, **GPT-4o-mini** for classification jobs (document analysis, error tagging, word analysis). Temperature is tuned per task: 0.1 for classification, 0.7 for generation.
- **DeepL** for translation, plus an out-of-process **spaCy** service for tokenisation and lemmatisation, because POS tagging is not a job for a chat model.
- Every pipeline output is schema-validated before it touches the database, and usage is tracked for cost monitoring.

## Conventions that held up

API routes follow CQRS naming (queries and commands live in separate trees), raw `fetch` is banned in the client, and a pre-commit hook lints any doc the commit touches.
