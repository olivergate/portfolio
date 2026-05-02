# Oliver Kaikane Gate — CV Draft

> Each section below maps to a section in your website builder. Copy section-by-section.

---

## Header

**Name:** Oliver Kaikane Gate
**Location:** Valencia, Spain (remote)
**Phone:** +34 633 861 683
**Email:** oliver.kg2@gmail.com

**Tagline (under name):**
Senior full-stack engineer (React/TypeScript, Python). 7+ years across data platforms and consumer products. Building with LLMs and going deep on agentic systems.

---

## Personal Bio

Curious, restless, and interested in how things work — whether that's a supply chain, a user's mental model, or how an LLM decides to call a tool.

Came to engineering from analytical philosophy nearly 8 years ago, which still shapes how I approach problems: question the framing first, then build. I've shipped across multi-tenant SaaS, data platforms, consumer apps, and most recently sustainability tech, with a track record of going from junior IC to leading a team.

Right now I'm spending most of my time building with LLMs and going deep on agentic systems — what good orchestration looks like, where the security gaps sit, how harnesses should be designed for the next few years of this. Three side projects in flight; daily Claude Code user; gradually building my own agent and telemetry setup.

Outside of all that: food, cooking, travel, books, chess, and running.

---

## Experience Overview

Full-stack engineer with 7+ years shipping production systems for sustainability impact ventures and financial services. Comfortable across the stack with React and TypeScript on the frontend and Python and Node on the backend; deepest in dashboards, data platforms, and multi-tenant SaaS. Progressed from junior IC to leading a team of five, with experience running external consulting engagements end-to-end. Currently building with LLMs across multiple side projects and training in agentic systems, prompt security (OWASP AI Top 10), and agent orchestration. Looking for roles where full-stack depth meets AI-native product thinking.

---

## Work Experience

### Senior Full-Stack Developer — OpenSC
**July 2022 – April 2026**

Sustainability impact venture co-founded by WWF and BCG, providing supply chain traceability for global brands. Standardised messy first-three-miles farm data into EPCIS, then surfaced it through dashboards used by Nespresso, Austral Fisheries, and internal teams to validate ethical sourcing claims and farmer payments.

- Sole frontend engineer on the main analytics dashboard — built and maintained the entire system end-to-end. Plotly Dash for the analytical core; React and Next.js for the consumer-facing experiences.
- Built the traceability and payments validation system used by Nespresso to verify coffee sourcing across Rainforest Alliance and their internal AAA premium-farmer program — including checks that base prices tracked the London robusta price index and that farmer payments matched contracted standards.
- Surfaced supply chain anomalies — infiltration, exfiltration, breaches of farm productivity capacity, coffee from untraced origins — through graph-based analysis powered by Kuzu.
- Worked with Austral Fisheries to validate the legal provenance of toothfish and prawn catches.
- Re-architected supply chain onboarding in Dagster: replaced bespoke per-cluster orchestrations with a YAML-configured, data-contract-driven ingestion layer. Turned onboarding from a custom engineering effort per supply chain into a configuration task.
- Built monitoring for data quality, ingestion accuracy and frequency across all supply chain feeds.
- Earlier scope at OpenSC: an internal Android app (Kotlin), document scanning, internal tooling, API design, and orchestration in Airflow.
- **Technologies:** React, Next.js, TypeScript, Python, Plotly Dash, Dagster, Kuzu (graph DB), Kotlin, AWS, Kubernetes, Postgres, Ethereum, Airflow.

### Associate Full-Stack Developer — Redington
**February 2019 – June 2022**

UK investment consultancy. Built and led the frontend on a multi-tenant research platform used by several thousand consultants across 7+ tenants to track investments and maintain observability across portfolios. Joined as a junior; promoted to leading a frontend team within two years as the company scaled from 10 engineers to 8 teams.

- Owned frontend architectural decisions on a React and TypeScript dashboard handling sensitive multi-tenant data, where cross-tenant leakage would have been existential to the business.
- Led a team of 5 engineers focused on frontend feature delivery; consistently the highest-performing team on UI work.
- Co-led architectural decisions across the frontend codebase and implemented a significant portion of the dynamically configurable dashboard system.
- Drove introduction of E2E testing with Cypress, improving deployment confidence and reducing release-time human error.
- Beyond engineering: chaired the Bristol charity committee. Ran a pro-bono engagement with LifeCycle — a charity left dry by multiple high-cost agencies — running a one-day discovery workshop and orchestrating the migration of their database and supporting infrastructure onto Airtable. Successfully pushed for an expansion of company-sponsored charity days and helped colleagues find opportunities.
- **Technologies:** React, TypeScript, MUI, Cypress, Jest, AWS, .NET (C#), PostgreSQL.

---

## Education

### BA Philosophy 2:1 — Leeds University
**September 2014 – June 2017**

- Specialised in Philosophy of Technology
- Developed the critical thinking, rhetoric, and ability to sit with difficult and ambiguous problems that still shapes how I approach engineering today

---

## Skills

### Primary Stack
React, Next.js, TypeScript, Node.js, Python, PostgreSQL, AWS

### AI / LLM (currently focused)
- Daily user of Claude Code and Cursor for the last 3+ months
- Building 3 production-leaning side projects with LLMs (see Projects)
- Developing a custom Claude Code setup with agents, skills, and telemetry
- Maintaining a learnings catalogue via a session retrospective workflow
- Currently training in: OWASP AI Top 10, prompt injection and jailbreaks, agent orchestration patterns, harness design for agentic systems

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
- Agile delivery

---

## Projects

### Language Learning App
Next.js, Supabase. Personal project exploring LLM-driven language acquisition.

### Habit-Forming App
Flutter (Dart). Cross-platform mobile, focused on behaviour change loops.

### Movement-Focused Consumer App
React Native. Consumer-facing project around physical movement.

### Personal Claude Code Setup
Custom agents, skills, and telemetry layer over Claude CLI. Retrospective-driven learning catalogue captured after every working session.

---

## Avocations

- Food, cooking, and the conversations around both
- Travelling
- Reading
- Chess
- Running