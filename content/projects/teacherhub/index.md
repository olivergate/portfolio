---
slug: teacherhub
status: draft
---

Language-learning platform built solo to help me get my head around Spanish. Two active users right now: my Spanish teacher and me. Video lessons with speaker-diarised transcripts, CEFR-aligned homework generation from a multi-stage LLM pipeline (plan → generate → verify), and a content library.

The homework generator runs through a Layer 2 LLM-as-judge eval suite: 25 CEFR-graded scenarios, a 5-dimension rubric, plus a Layer 3 human-review log with a calibration rule that revises the judge prompt when human and judge scores diverge.

> TODO: expand. Sections to consider: the eval suite in detail, the speaker-diarisation pipeline, what didn't work, lessons learned. Each can become a sub-page if it grows large enough.
