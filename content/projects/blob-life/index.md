---
slug: blob-life
status: published
---

Habit apps are built for people whose executive function shows up on time. BlobLife is a Flutter habit tracker designed for people with ADHD, which means it externalises structure instead of assuming it: the day is split into four phases (Morning, Work, Cool-down, Life), each habit lives in one, and the app only ever asks about the phase you're in.

At the centre is a blob companion whose mood and energy reflect how things are going, and an emoji habitat that grows through five stages as habits get completed, and gently fades when they don't. Consistency earns XP and coins; coins buy cosmetics; nothing about progress is ever taken away.

<figure>
<img src="/projects/blob-life/home.png" alt="BlobLife design mockup of the morning home screen with a soft check-in prompt and a list of today's intentions such as glass of water and morning stretch" />
<figcaption>Design mockup of the home screen: today's intentions, filtered to the current phase.</figcaption>
</figure>

The AI layer is small and priced like it: type "I want to go to the gym 4 times a week" and a Claude Haiku call via a Supabase Edge Function shapes it into a scheduled habit with tiny ordered steps. Suggestions are rate-limited, cached, and backed by a local catalogue when offline.

Everything else is offline-first by design: Drift (SQLite) on the device, no server sync, the entire phase state machine computed locally. The repo carries 48 ADRs and 78 test files, with Maestro driving end-to-end flows on an emulator.
