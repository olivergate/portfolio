---
slug: claude-gui/technology
status: published
---

## Process model

Electron 32. The main process hosts an Express + WebSocket server, owns the SQLite graph and all file I/O, and runs the `claude` CLI inside node-pty. The renderer is plain by choice: vanilla JavaScript, xterm.js for the terminal, no framework. For an app whose UI is mostly panels over a terminal, React would be ceremony.

## Data flow

Two watchers (chokidar) feed everything: the JSONL transcript Claude Code writes for every session, and a `.cgui/` directory of YAML files holding arcs, session records, and review comments. Those files plus git history are the canonical data.

The queryable layer is a projection: a better-sqlite3 edge graph with one polymorphic `edges` table (turns, decisions, code changes, commits, reviews) keyed on Claude Code's own UUID namespace. Because it's a projection, the guarantee is blunt: delete the database, rebuild, and you get a byte-identical graph back from git and YAML. That property is enforced by tests, not just claimed.

There are exactly two write-through exceptions where the GUI writes files itself: review comments and the next-turn gate on an arc. Everything else is read-only observation.

## Testing

Vitest suites run against real SQLite fixtures: rebuild idempotence, suppression of the app's own writes, orphan cleanup, tolerance of malformed YAML, plus pure-function suites for transcript shredding and a dual-pass secret scanner that keeps tokens out of stored records. The graph layer alone carries over 80 test cases.

## Background AI

The Anthropic SDK is used for two narrow jobs: a Haiku pass that drafts session decisions during the clear flow, and a headless `claude -p` run that produces the between-session state delta. Both outputs land in front of a human before they're kept.
