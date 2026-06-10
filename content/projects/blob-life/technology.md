---
slug: blob-life/technology
status: published
---

## Stack

Flutter with Dart 3.11, targeting iOS and Android. State is Riverpod 3 with code generation, models are Freezed, routing is go_router, and persistence is Drift over SQLite with a ten-table schema. Around 113 generated files keep the typed plumbing honest.

## Offline-first, properly

The server does two things: Supabase Auth and a pair of Edge Functions. Everything else lives on the device. The whole phase state machine (work timer, budget enforcement, overtime energy decay, cool-down auto-advance, day-boundary rollover) is computed locally, so the app works identically in airplane mode. There is no sync layer to break and no server copy of your habits.

## The AI calls, costed

Two Edge Functions call Claude Haiku: one shapes a typed goal into a scheduled habit with micro-steps, one suggests a hobby for the time and mood you have. Haiku because it's the cheapest tier that returns reliable structured JSON. Cost control is layered: responses are cached with a TTL, habit suggestions are rate-limited to 10 per user per day, and hobby suggestions fall back to a local curated catalogue when offline or over the limit.

## Testing

78 test files cover repositories, providers, models, notification scheduling, and routing, with `clock` injected so time-dependent logic is testable. Gesture-heavy flows (capture bar, smart add, work log) are driven end-to-end by Maestro on an emulator; one manual walkthrough caught seven bugs that unit tests structurally couldn't.

## Notifications

All local, no push: habit reminders, break reminders, the two work-end warnings, the hard stop, and capped overtime nudges. Permission is requested when the first habit is created, not at install.
