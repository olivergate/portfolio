# Oliver Kaikane Gate — CV Draft

> Each section below maps to a section in your website builder. Copy section-by-section.

---

## Header

**Name:** Oliver Kaikane Gate
**Location:** Valencia, Spain (remote)
**Phone:** +34 633 861 683
**Email:** oliver.kg2@gmail.com

**Tagline (under name):**
Senior full-stack engineer (React/TypeScript, Python). Seven years shipping production. Building with LLMs daily; going deep on agent harness design and prompt security.

---

## Personal Bio

Restless, and curious about how things work.

Came to engineering from Philosophy of Technology seven years ago. That training taught me to question the framing of a problem before answering it. Junior IC to leading a five-person frontend team along the way.

Right now I'm running a custom Claude Code harness — subagents I dispatch, a retro workflow that builds a learnings catalogue — plus three side projects. Most of my reading is on agent orchestration and prompt security. That's the work I want next.

Outside of all that: food, cooking, travel, books, chess, and running.

---

## Experience Overview

Seven years shipping production code. React/TypeScript on the frontend, Python and Node on the backend. Three years at Redington (multi-tenant fintech SaaS; led a five-person frontend team), then four years at OpenSC as sole engineer on the supply-chain analytics dashboard. Now mostly on LLMs: TeacherHub (language-learning platform with an LLM-as-judge eval suite over its homework-generation pipeline), a Flutter habit app driven by LLM check-ins, and a custom Claude Code harness.

---

## Work Experience

### Senior Full-Stack Developer — OpenSC
**July 2022 – April 2026**

Sustainability impact venture co-founded by WWF and BCG, providing supply chain traceability for global brands. Standardised messy first-three-miles farm data into EPCIS, then surfaced it through dashboards used by Nespresso, Austral Fisheries, and internal teams to validate ethical sourcing claims and farmer payments.

- Sole engineer on the main analytics dashboard — built and maintained the whole thing. Plotly Dash for the analytical core, React and Next.js for the consumer-facing pages.
- Built the traceability and payments validation system used by Nespresso to verify coffee sourcing across Rainforest Alliance and their internal AAA premium-farmer program — including checks that base prices tracked the London robusta price index and that farmer payments matched contracted standards.
- Designed and built graph-based anomaly detection on Kuzu: modelled supply-chain relationships so infiltration, exfiltration, capacity breaches, and untraced-origin coffee became queryable patterns rather than per-supply-chain spot checks.
- Worked with Austral Fisheries to validate the legal provenance of toothfish and prawn catches.
- Replaced bespoke per-cluster orchestrations in Dagster with a YAML-configured, data-contract-driven ingestion layer. New supply chains can be added by config now. Invalid data fails at the boundary rather than corrupting downstream tables.
- Built a data-entry flow that made it hard to put bad data in: input checks, guardrails, and reviews at the point of capture. Plus monitoring for ingestion accuracy and frequency across all supply chain feeds.
- **Technologies:** React, Next.js, TypeScript, Python, Plotly Dash, Dagster, Kuzu (graph DB), Kotlin, AWS, Kubernetes, Postgres, Ethereum, Airflow.

### Associate Full-Stack Developer — Redington
**February 2019 – June 2022**

UK investment consultancy. Built and led the frontend on a multi-tenant research platform used by several thousand consultants across 7 tenants to track investments and maintain observability across portfolios. Joined as a junior; promoted to leading a frontend team within two years as the company scaled from 10 engineers to 8 teams.

- Co-led frontend architectural decisions on a React and TypeScript multi-tenant dashboard. Sensitive financial data; tenant isolation was the design constraint everything else worked around.
- Led a team of 5 engineers focused on frontend feature delivery; consistently the highest-performing team on UI work.
- Built much of the dynamically configurable dashboard system that the platform ran on.
- Introduced Cypress E2E testing across the platform, which raised deployment confidence and cut release-time human error.
- Chaired the Bristol charity committee. Took on LifeCycle pro-bono — a charity left dry by multiple high-cost agencies. One-day discovery workshop, then migrated their database and supporting infrastructure onto Airtable. Pushed for more company-sponsored charity days and helped colleagues find their own.
- **Technologies:** React, TypeScript, MUI, Cypress, Jest, AWS, .NET (C#), PostgreSQL.

---

## Education

### BA Philosophy 2:1 — Leeds University
**September 2014 – June 2017**

- Specialised in Philosophy of Technology
- Rhetoric and structured argument. The habit of restating a question before answering it.

---

## Skills

### Primary Stack
React, Next.js, TypeScript, Node.js, Python, PostgreSQL, AWS

### AI / LLM (currently focused)
- Custom Claude Code harness — hand-built subagents, a session-retrospective workflow that classifies observations against a personal ontology, and a telemetry layer over the CLI
- LLM-as-judge eval suite for TeacherHub's homework-generation pipeline: 25 CEFR-graded scenarios, 5-dimension rubric (CEFR alignment, instruction adherence, linguistic accuracy, pedagogical value, structural validity), cost-gated runner, plus a sprint-cadence human review with a calibration rule that revises the judge prompt when human-vs-judge delta exceeds 1 point
- Two LLM-driven side projects in flight; a third built with LLM tooling (see Projects)
- Claude Code and Cursor as daily drivers across paid and side-project work
- Deepening: OWASP LLM Top 10, prompt injection and jailbreak patterns, agent orchestration, MCP servers

### Frontend
React, Next.js, TypeScript, Cypress, Jest, MUI, Chakra, TailwindCSS, Ant Design, Mantine, Redux, React Query, React Hook Form, Kotlin (Android)

### Backend
Python (FastAPI, Dagster, pandas, Plotly Dash), Node.js, C# / .NET, Kotlin (Spring Boot), PostgreSQL, MartenDB, Kuzu (graph DB), Airflow

### Infrastructure & DevOps
AWS (S3, EKS, EC2, SNS, SQS, Lambda, IAM, RDS, CloudWatch), Terraform, some Azure, Vercel, Supabase, GitHub Actions, Octopus Deploy / TeamCity, CircleCI

### Leadership
- Led a 5-person frontend team at Redington
- Completed external senior-IC / principal-engineer leadership training
- Ran external consulting engagement (LifeCycle) end-to-end

---

## Projects

### Personal Claude Code Harness
Claude CLI, custom subagents and skills, SQLite telemetry. Custom harness on top of the Claude Code CLI: subagents I dispatch by task type, plus a session-retrospective workflow that builds a learnings catalogue against an ontology I maintain. Telemetry tracks token spend and tool usage. The retro generator on /lab is a public slice.

### This Portfolio Site
Next.js 16, TypeScript strict, Tailwind v4, Anthropic API. Five-page CV-as-portfolio. Live UX-style sliders that retheme the page, a JD matcher tuned to surface honest gaps over generous matches, an OWASP LLM Top 10 prompt-safety game, 31 public ADRs documenting every decision and reversal. Anthropic API server-side only; cost ceiling enforced at the route handler.

### TeacherHub
Next.js 14, Mantine, Supabase (Postgres + RLS), Vercel, OpenAI GPT-4, Whisper, DeepL. Language-learning platform built solo. Video lessons with speaker-diarised transcripts, CEFR-aligned homework generation from a multi-stage LLM pipeline (plan → generate → verify), content library, multi-tenant teacher isolation. The homework generator runs through a Layer-2 LLM-as-judge eval suite — 25 CEFR-graded scenarios, 5-dimension rubric — plus a Layer-3 human-review log with a calibration rule that revises the judge prompt when human and judge scores diverge. Pre-POC; current users are me and my Spanish teacher.

### Habit-Forming App
Flutter (Dart). Cross-platform mobile. LLM-driven morning and bedtime check-ins set each day's tasks and reminders.

### Daily Movement App
React Native. Do one movement a day, share it. Loose alpha — an attempt at virality, also a way to learn React Native.

---

## Avocations

- Food and cooking
- Travelling
- Reading
- Chess
- Running