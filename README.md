# Portfolio — Oliver Kaikane Gate

Personal CV site that doubles as a portfolio of AI-native product thinking.
Five pages, each in a different rhetorical mode. Built phased.

- Live: olivergate.com (TBD)
- Stack: Next.js 16 (App Router), TypeScript, Tailwind v4, Biome, Vitest,
  Vercel — see [ADR-0001](./docs/adr/0001-stack.md)
- Package manager: Bun

## Quickstart

```bash
bun install
bun run dev
```

Open <http://localhost:3000>.

## Scripts

| Script                       | What it does                                |
| ---------------------------- | ------------------------------------------- |
| `bun run dev`                | Local dev server                            |
| `bun run build`              | Production build                            |
| `bun run start`              | Run the production build                    |
| `bun run typecheck`          | `tsc --noEmit`                              |
| `bun run lint`               | Biome check                                 |
| `bun run lint:fix`           | Biome check + autofix                       |
| `bun run test`               | Vitest run                                  |
| `bun run test:watch`         | Vitest watch                                |
| `bun run content:validate`   | Zod-validate `content/cv.json`              |

## Where things live

- CV content: [`content/cv.json`](./content/cv.json) (validated by
  [`lib/schemas.ts`](./lib/schemas.ts))
- Design tokens: [`styles/tokens.css`](./styles/tokens.css), ported from
  [`design-references/design-tokens.css`](./design-references/design-tokens.css)
- ADRs: [`docs/adr/`](./docs/adr/)
- Per-phase specs: [`docs/specs/`](./docs/specs/)
- Slash commands: [`.claude/commands/`](./.claude/commands/)
- Pages: `app/(site)/*` — Server Components by default
- Components: `components/{cv,layout,ui}/`

## Workflow

This project is built phased. Each phase has its own spec under
[`docs/specs/`](./docs/specs/) and is intended to fit in one session. Read the
phase spec before starting; track status in
[`docs/specs/README.md`](./docs/specs/README.md).

Project-wide conventions and guardrails live in
[`CLAUDE.md`](./CLAUDE.md).

## Reading order for newcomers

1. [`CLAUDE.md`](./CLAUDE.md) — what this project is and how to work in it
2. [`design-references/README.md`](./design-references/README.md) — the
   visual system, treated as authoritative
3. [`docs/specs/README.md`](./docs/specs/README.md) — phase plan
4. The current phase spec
5. The most recent ADRs in [`docs/adr/`](./docs/adr/)
