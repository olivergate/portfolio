---
slug: teacherhub/features
status: published
---

## Lessons with a live notepad

Video lessons run on Daily.co with a notepad alongside for capturing topics, errors, and vocabulary in the moment. When the lesson ends, an AI synthesis pass converts the raw notes into a structured summary: errors mapped to skills, vocabulary categorised, homework suggested. The teacher reviews and edits before anything reaches the student.

## Homework generation that checks its own work

Homework is generated from the student's actual context (recent errors, current CEFR level, what the teacher flagged) through a plan, generate, verify pipeline. The verify stage includes conjugation checks, because language models are confidently wrong about Spanish verb forms more often than you'd hope.

## An ability graph, not a grade

Each student has a skill tree with per-skill confidence scores. Lesson events feed it: an error in the subjunctive nudges that skill down, a clean run of homework nudges it up. It gives the teacher a live answer to "what should we work on next?"

## Vocabulary that comes from real lessons

Words captured during lessons land in a spaced-repetition game with streaks and a holiday mode.

<figure>
<img src="/projects/teacherhub/vocab-game.png" alt="Vocabulary practice screen showing 198 words in review, 31 due today, accuracy of 55 percent, and a start session button" />
<figcaption>The vocabulary game: spaced repetition over words captured in real lessons.</figcaption>
</figure>

## Works on a phone, works offline

The student experience is a PWA wrapped with Capacitor for iOS and Android. Homework and vocabulary are offline-first via IndexedDB, so a student can finish an exercise on the metro and sync later.

<figure>
<img src="/projects/teacherhub/student-mobile.png" alt="Mobile student home screen with a translate box and shortcuts to lessons, homework, grammar games, and vocabulary practice" />
<figcaption>The mobile student home screen.</figcaption>
</figure>
