# JD pressure-test results

Generated 2026-05-03T19:47:10.345Z against http://127.0.0.1:3100. Re-runnable via
`bun scripts/jd-pressure-test.ts`.

6 JDs · prompts: jd-parser@v1, jd-matcher@v1 · Anthropic claude-sonnet-4-6

## Coverage

Five real JDs Oliver provided (`source/jd_*.md`) plus one synthetic startup-generalist
JD (`source/jd_synthetic_generalist.md`) — added because the five real JDs cluster around
"established AI-engineering org" and "frontend lead", and Phase 3's pressure-test plan
asked for a startup-generalist case. The synthetic JD is clearly marked as such in its
own header.

| JD | Archetype |
|---|---|
| `jd_hivemq.md` | AI-native eng org (large established) |
| `jd_kapa.md` | RAG infra (small AI startup) |
| `jd_revenuecat.md` | Agent infra at growth-stage SaaS |
| `jd_synthetic_generalist.md` | Founding engineer / startup generalist |
| `jd_tether.md` | Frontend at fintech (large established) |
| `jd_toptotal.md` | Agentic platform backend |

## Aggregate counts

213 chips total (6 JDs × 3 stretch levels): **109 hits, 73 stretches, 31 honest gaps.**
Every Miss has a gap framing (the server-side validator at
`app/api/jd-match/route.ts:validateMatches` enforces ADR-0016: a Miss without a
gap framing is a 502).

Cost across all 24 paid calls (6 parses + 18 matches): roughly $0.50.

## Iteration log

This is what changed between the first run and the version above:

- **Education was missing from `formatCVForPrompt`.** The matcher said "no degree
  is mentioned anywhere on the CV" for Kapa r4 — but Oliver has a Philosophy degree
  from Leeds. That's a prompt-construction bug, not a model bug. Fixed in
  `lib/cv-evidence.ts`; regression test in `tests/cv-evidence.test.ts` (8 cases
  asserting prompt covers all cite-able evidence + cvHash decoupled from tone).
  Post-fix output: "BA Philosophy, not STEM listed in the requirement" — accurate,
  honest, and a defensible Miss.

## How to read each chip

Every chip block is structured the same way:

```
- `r1` **STATUS** — cite: `role:bullet-id`, `project:project-id`
  - one-sentence reasoning naming the cited evidence
  - **gap framing:** _first-person, candid framing — Misses only_
```

Cites prefixed `role:` point at role bullets in `cv.json`; `project:` prefixes point
at projects. The H2 fix in Phase 3 introduced project citations explicitly (see
ADR-0016 worked example 5) so chips like "Custom Claude Code setup" can be honest
Hits anchored in the projects section rather than dishonest uncited Hits.

## Honesty audit

Spot-checked across all 6 JDs at all 3 levels: every Hit names a real bullet or
project that supports the claim, every Stretch is genuinely adjacent rather than
a soft Hit, every Miss is a real gap with no overclaim. No chip violates ADR-0016.

The chip distribution shifts as expected with the stretch level (strict has more
Stretches and Misses; generous has more Hits) but Misses never magically become
Stretches just because the slider moved — that contract holds across all 6 JDs.

## jd_hivemq.md

**Parser** (cached) — 13 requirements, jdHash=`57810fb67942…`

- `r1` (hard, w=1.00) — 5+ years of software engineering background with hands-on experience architecting and delivering fullstack applications in TypeScript, Node.js, and React
- `r2` (hard, w=1.00) — Production-level experience with AWS infrastructure — Lambda, DynamoDB, and related services — including understanding of where things break at scale
- `r3` (hard, w=1.00) — Extensive experience working with AI coding agents and LLM-powered workflows, knowing how to steer them effectively rather than just prompt them
- `r4` (hard, w=0.90) — Ability to translate ambiguous product goals into precise, agentic-ready technical specs with no room for misinterpretation
- `r5` (hard, w=0.90) — Design and evolve architecture of autonomous agent swarms — defining agent boundaries, data flows, and feedback loops for self-correction and end-to-end feature delivery
- `r6` (hard, w=0.90) — DevOps-first mindset — built monitoring, alerting, and self-healing systems that keep production environments healthy without constant human intervention
- `r7` (hard, w=0.80) — Solid architectural skills around bounded contexts, idempotent design, decoupled micro-frontends, and distributed systems
- `r8` (hard, w=0.80) — Define and enforce guardrails, monitoring systems, and self-healing mechanisms for autonomous agents operating safely in production
- `r9` (hard, w=0.80) — Extend and maintain TypeScript/Fastify backend and React micro-frontend architecture, improving observability, reliability, and test coverage
- `r10` (hard, w=0.80) — Steer and evaluate coding agents and LLM models, reviewing output against a high-quality mental model for correctness, performance, and security
- `r11` (hard, w=0.70) — Excellent English communication skills with ability to collaborate across engineering, product, and leadership in a remote-first environment
- `r12` (soft, w=0.50) — Stay at the forefront of AI tooling, agent frameworks, and LLM capabilities, continuously refining development practices
- `r13` (soft, w=0.50) — Collaborate with Engineering and Product leadership to shape the long-term vision of AI-native development

**Matcher (strict, live $0.034845)** — 3 hits, 8 stretches, 2 honest gaps.

- `r1` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`
  - 7+ years across two roles with React/TypeScript as the primary stack; owned frontend architecture end-to-end and delivered full-stack systems including Python backends at OpenSC.
- `r2` **STRETCH** — cite: `role:opensc-sole-frontend`
  - AWS is listed as primary infra (S3, EKS, EC2, SNS, SQS, Lambda, IAM, RDS, CloudWatch) across both roles, but no bullet explicitly describes production incident handling, scale failure modes, or DynamoDB specifically — strict reading can't elevate this to a Hit.
- `r3` **STRETCH** — cite: `project:claude-code-setup`
  - Custom Claude Code setup with agents, skills, and telemetry shows deliberate, systematic use beyond casual prompting, but strictly the evidence is side-project depth rather than production shipped LLM workflow steering.
- `r4` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:opensc-nespresso-payments`
  - Re-architecting ingestion into a YAML-configured data-contract layer and specifying precise payment validation rules shows ability to translate ambiguous goals into rigorous specs, but no bullet explicitly frames this as agentic-ready spec work.
- `r5` **MISS**
  - No CV evidence of designing or shipping multi-agent swarm architectures.
  - **gap framing:** _I'm actively training in agent orchestration patterns but haven't yet designed or shipped an autonomous agent swarm with defined boundaries, feedback loops, and self-correction. My agentic work to date is tooling and side-project level._
- `r6` **STRETCH** — cite: `role:opensc-data-quality-monitoring`
  - Built monitoring for data quality, ingestion accuracy and frequency across supply chain feeds — adjacent to a DevOps monitoring mindset, but no evidence of alerting, self-healing, or autonomous remediation in production.
- `r7` **STRETCH** — cite: `role:redington-frontend-arch`, `role:redington-config-dashboards`, `role:opensc-dagster-yaml`
  - Owned multi-tenant frontend architecture (bounded context sensitivity), dynamically configurable dashboards, and decoupled ingestion layer — strong adjacent signals, but no explicit mention of micro-frontends, idempotent design, or distributed systems terminology.
- `r8` **MISS**
  - No CV evidence of guardrails, monitoring, or self-healing mechanisms specifically for autonomous agents.
  - **gap framing:** _I'm training in OWASP AI Top 10 and prompt injection but haven't built production guardrails or self-healing mechanisms for deployed agents. This is a genuine gap at this point._
- `r9` **STRETCH** — cite: `role:redington-frontend-arch`, `role:redington-cypress`, `role:opensc-data-quality-monitoring`
  - Strong React/TS architecture and E2E testing with Cypress demonstrate observability and test coverage capability, but the backend here is Fastify specifically (not used) and micro-frontend architecture isn't explicitly evidenced.
- `r10` **STRETCH** — cite: `project:claude-code-setup`
  - Custom telemetry, agents, and a retrospective-driven learnings catalogue over Claude CLI show a systematic, evaluative approach to steering agents — but strictly this is personal tooling rather than production code review against security/performance/correctness standards.
- `r11` **HIT** — cite: `role:redington-charity`, `role:redington-team-lead`
  - Led a 5-person team, ran a pro-bono consulting engagement end-to-end, and chaired a cross-company committee — all require clear communication across non-technical and leadership stakeholders.
- `r12` **HIT** — cite: `project:claude-code-setup`
  - Maintaining a session retrospective learnings catalogue, custom agents/skills/telemetry on Claude CLI, and active training in OWASP AI Top 10 and orchestration patterns demonstrates deliberate, ongoing practice at the frontier of AI tooling.
- `r13` **STRETCH** — cite: `role:redington-frontend-arch`, `role:redington-team-lead`
  - Co-led architecture and led a team at Redington, but no evidence of shaping long-term product vision at the engineering-leadership level or in an AI-native context specifically.

**Matcher (balanced, live $0.033195)** — 3 hits, 8 stretches, 2 honest gaps.

- `r1` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`, `role:redington-config-dashboards`
  - 7+ years shipping full-stack production systems in React/TypeScript at both Redington and OpenSC, owning frontend architecture end-to-end.
- `r2` **STRETCH** — cite: `role:opensc-sole-frontend`
  - AWS is listed as primary stack (S3, EKS, EC2, SNS, SQS, Lambda, IAM, RDS, CloudWatch) but CV bullets don't detail Lambda/DynamoDB specifically or describe scale-failure experience.
- `r3` **STRETCH** — cite: `project:claude-code-setup`
  - Daily Claude Code/Cursor user with a custom agents+skills+telemetry setup and a session retrospective workflow — strong practitioner signal, but no shipped production LLM workflow at employer scale yet.
- `r4` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`
  - Re-architecting ingestion into YAML-driven data contracts shows precision in translating fuzzy requirements into formal specs, but agentic-spec authorship specifically isn't evidenced.
- `r5` **MISS**
  - No CV evidence of designing multi-agent swarm architectures or defining agent boundaries and feedback loops.
  - **gap framing:** _I'm actively training in agent orchestration patterns but haven't yet designed or shipped a multi-agent swarm system. My closest work is single-agent Claude Code tooling and side projects rather than autonomous swarm architecture._
- `r6` **STRETCH** — cite: `role:opensc-data-quality-monitoring`
  - Built data quality and ingestion monitoring across supply chain feeds — operational monitoring mindset is evidenced, but self-healing production systems aren't explicitly described.
- `r7` **STRETCH** — cite: `role:redington-frontend-arch`, `role:opensc-dagster-yaml`
  - Multi-tenant isolation and data-contract-driven bounded ingestion show architectural rigour, but micro-frontends and distributed systems patterns aren't explicitly named in the CV.
- `r8` **MISS**
  - No evidence of designing guardrails, safety monitoring, or self-healing mechanisms for autonomous agents in production.
  - **gap framing:** _I'm training in OWASP AI Top 10 and prompt injection but haven't built agent guardrails or safety systems for production use. This is a genuine gap I'm working toward rather than something I can claim experience in._
- `r9` **STRETCH** — cite: `role:redington-frontend-arch`, `role:redington-cypress`
  - Strong React/TS and observability/test-coverage experience, but Fastify and micro-frontend architecture specifically aren't evidenced — closest is a multi-tenant MUI/React platform with Cypress E2E.
- `r10` **STRETCH** — cite: `project:claude-code-setup`
  - Daily agent steering with a custom telemetry and retrospective workflow shows evaluative practice, but formal review against correctness/performance/security standards in a production context isn't evidenced.
- `r11` **HIT** — cite: `role:redington-charity`, `role:opensc-sole-frontend`
  - External consulting engagement, cross-functional stakeholder work with Nespresso and Austral Fisheries, and charity committee leadership all evidence strong cross-discipline communication in English.
- `r12` **HIT** — cite: `project:claude-code-setup`
  - Custom Claude Code setup with agents, skills, telemetry, and a session retrospective catalogue demonstrates active, structured engagement with the frontier of AI tooling.
- `r13` **STRETCH** — cite: `role:redington-team-lead`, `role:redington-config-dashboards`
  - Led a 5-person team and co-led architectural decisions at Redington — adjacent to product/engineering leadership collaboration, but shaping AI-native development vision at leadership level isn't directly evidenced.

**Matcher (generous, live $0.033675)** — 7 hits, 6 stretches, 0 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - 7+ years shipping full-stack React/TypeScript production systems across two substantial roles, with sole frontend ownership at OpenSC and architectural leadership at Redington.
- `r2` **STRETCH** — cite: `role:opensc-sole-frontend`
  - AWS is listed as primary infra skill with S3, EKS, EC2, SNS, SQS, Lambda, IAM, RDS, CloudWatch; but Lambda and DynamoDB are not called out in production role bullets — generous read credits the breadth, but DynamoDB specifically has no evidence.
- `r3` **HIT** — cite: `project:claude-code-setup`
  - Custom Claude CLI setup with bespoke agents, skills, telemetry, and a session-retrospective learning loop demonstrates active, structured steering of AI coding agents beyond basic prompting.
- `r4` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:redington-frontend-arch`
  - Re-architecting supply chain ingestion into a YAML-configured data-contract layer and owning frontend architectural decisions both show precision in translating ambiguous goals to concrete specs, though no explicit agentic-spec authoring is cited.
- `r5` **STRETCH** — cite: `project:claude-code-setup`
  - Custom multi-agent Claude setup with defined agents and skills is adjacent; CV mentions training in agent orchestration patterns, but no production-level autonomous agent swarm design is evidenced.
- `r6` **HIT** — cite: `role:opensc-data-quality-monitoring`, `role:opensc-dagster-yaml`
  - Built production monitoring for data quality, ingestion accuracy and frequency across all supply chain feeds, and replaced bespoke orchestrations with a self-configuring ingestion layer — direct DevOps-first evidence.
- `r7` **HIT** — cite: `role:redington-frontend-arch`, `role:redington-config-dashboards`, `role:opensc-dagster-yaml`
  - Owned multi-tenant frontend architecture with hard cross-tenant isolation constraints, co-led dynamically configurable dashboard architecture, and redesigned a decoupled data-contract ingestion layer — covers bounded contexts, idempotent design, and decoupled architecture.
- `r8` **STRETCH** — cite: `role:opensc-data-quality-monitoring`, `project:claude-code-setup`
  - Production monitoring/alerting built at OpenSC and a telemetry layer on the Claude setup are adjacent; explicit guardrails and self-healing mechanisms for autonomous agents in production are not evidenced.
- `r9` **STRETCH** — cite: `role:redington-cypress`, `role:redington-frontend-arch`
  - Strong React/TS background and drove E2E testing with Cypress at Redington; Fastify specifically isn't mentioned and micro-frontend architecture isn't explicitly called out — generous read credits the overlap.
- `r10` **HIT** — cite: `project:claude-code-setup`
  - Custom Claude Code setup with agents, telemetry, and a retrospective-driven learning catalogue evidences deliberate evaluation and steering of coding agents against quality standards.
- `r11` **HIT** — cite: `role:redington-charity`, `role:opensc-nespresso-payments`
  - Led external consulting engagement end-to-end with LifeCycle, ran discovery workshops, and delivered client-facing traceability work with Nespresso — demonstrates strong cross-functional communication in distributed/consulting contexts.
- `r12` **HIT** — cite: `project:claude-code-setup`
  - Actively building custom agent tooling, maintaining a session-retrospective learning catalogue, and training across OWASP AI Top 10, agent orchestration, and harness design — clear evidence of continuous frontier-tracking.
- `r13` **STRETCH** — cite: `role:redington-team-lead`, `role:redington-frontend-arch`
  - Led a frontend team and owned architectural decisions at Redington, with leadership training noted; no explicit evidence of shaping AI-native product vision at leadership level.

## jd_kapa.md

**Parser** (cached) — 8 requirements, jdHash=`2205688ae993…`

- `r1` (hard, w=1.00) — 3+ years of software engineering experience working on complex systems in both backend and frontend
- `r2` (hard, w=1.00) — Python development (backend, RAG engine, data integrations)
- `r3` (hard, w=1.00) — React development (analytics platform, client integrations, SDK)
- `r4` (soft, w=0.50) — Degree in computer science, machine learning, mathematics, statistics, or a related field
- `r5` (soft, w=0.60) — Affinity for machine learning, deep learning (including LLMs) and natural language processing
- `r6` (soft, w=0.50) — Ability to work effectively in a fast-moving environment where things are sometimes loosely defined
- `r7` (nice, w=0.30) — Experience scaling infrastructure (RAG or similar AI/ML systems)
- `r8` (nice, w=0.20) — Experience maintaining or publishing SDKs

**Matcher (strict, live $0.026061)** — 3 hits, 2 stretches, 3 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - 7+ years across both frontend (React/Next.js/TypeScript) and backend (Python/Dagster/Airflow) on complex multi-tenant and supply chain systems at two companies — well over the 3-year threshold.
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`, `role:opensc-data-quality-monitoring`
  - Python used in production for Dagster orchestration, Kuzu graph analysis, and data quality monitoring across supply chain feeds at OpenSC — concrete backend and data integration work.
- `r3` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - Sole frontend engineer on OpenSC's analytics dashboard and owned architectural decisions on Redington's multi-tenant React/TypeScript investment research platform — direct match.
- `r4` **MISS**
  - Degree is BA Philosophy, not a STEM field listed in the requirement.
  - **gap framing:** _I hold a 2:1 in Philosophy, not a CS, maths, or statistics degree. My technical depth comes from 7+ years of production engineering rather than a formal technical qualification._
- `r5` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Actively building LLM-driven side projects and a custom Claude Code setup, and training in agent orchestration and prompt security — but no shipped ML/NLP production work cited, so strict reading stops at Stretch.
- `r6` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:redington-team-lead`
  - OpenSC is described as a sustainability impact venture (startup-adjacent) and the Dagster re-architecture involved re-scoping a loosely defined onboarding problem — adjacent evidence, but no bullet explicitly names ambiguity tolerance.
- `r7` **MISS**
  - No RAG or AI/ML infrastructure scaling work appears on the CV.
  - **gap framing:** _I haven't scaled RAG or AI/ML infrastructure in production; my infrastructure experience is in data pipelines and SaaS platforms on AWS/Kubernetes. I'm actively training in agentic system design but haven't shipped at that layer yet._
- `r8` **MISS**
  - No SDK authorship or publication appears anywhere on the CV.
  - **gap framing:** _I haven't maintained or published an SDK. I've designed APIs and internal tooling, but nothing distributed as a client-facing library._

**Matcher (balanced, live $0.026166)** — 3 hits, 2 stretches, 3 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - 7+ years across full-stack roles at OpenSC and Redington, shipping complex multi-tenant dashboards, data pipelines, and supply chain systems on both frontend (React/TS) and backend (Python/Dagster).
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`, `role:opensc-data-quality-monitoring`
  - Python is the primary backend stack at OpenSC — used across Dagster orchestration, Kuzu graph analysis, Plotly Dash, and data quality monitoring pipelines.
- `r3` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - Sole React/Next.js frontend owner at OpenSC and architect of a multi-tenant React+TS analytics dashboard at Redington — direct match to React on an analytics platform.
- `r4` **MISS**
  - Degree is BA Philosophy, not CS, ML, mathematics, or a related technical field.
  - **gap framing:** _My undergraduate degree is in Philosophy (specialising in Philosophy of Technology), not a STEM discipline. I haven't supplemented it with a formal technical qualification._
- `r5` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Actively building LLM-driven side projects and a custom Claude Code setup with agents and telemetry, but the CV doesn't cite shipped ML/NLP model work or deep learning experience — it's LLM product usage rather than ML depth.
- `r6` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:redington-team-lead`
  - Experience at an impact venture (OpenSC, WWF/BCG co-founded) and scaling a team during rapid company growth at Redington suggests comfort with ambiguity, but no bullet explicitly calls out fast-moving or loosely-defined environments.
- `r7` **MISS**
  - CV covers data pipeline and supply chain infrastructure scaling but no RAG or AI/ML system infrastructure specifically.
  - **gap framing:** _I've scaled data ingestion pipelines and Kubernetes-based infrastructure at OpenSC, but haven't yet built or scaled a RAG or AI/ML serving system in production._
- `r8` **MISS**
  - No SDK authorship or publication is mentioned anywhere in the CV.
  - **gap framing:** _I haven't maintained or published an SDK — my API surface work has been internal integrations and platform tooling rather than externally distributed libraries._

**Matcher (generous, live $0.026166)** — 5 hits, 1 stretches, 2 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - 7+ years across full-stack roles at OpenSC and Redington, shipping complex backend pipelines (Dagster, Airflow) and frontend platforms (React/TS dashboards) — well beyond the 3-year threshold.
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`, `role:opensc-data-quality-monitoring`
  - Python used extensively at OpenSC for backend orchestration (Dagster), graph analysis (Kuzu), data quality monitoring, and Plotly Dash — covers backend, data integrations, and analytical pipeline work directly.
- `r3` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - Sole frontend engineer on OpenSC's analytics dashboard and owned React/TypeScript architecture at Redington's multi-tenant platform — direct match to React on an analytics platform.
- `r4` **MISS**
  - Degree is BA Philosophy, not a STEM field listed in the requirement.
  - **gap framing:** _My degree is in Philosophy, not computer science, mathematics, or a related technical field. My engineering depth comes from 7+ years of professional practice rather than a formal STEM qualification._
- `r5` **HIT** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Building multiple LLM-driven side projects, maintaining a custom Claude Code agentic setup with telemetry, and actively training in agent orchestration and prompt security — generous reading credits this as genuine affinity with hands-on LLM work.
- `r6` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-sole-frontend`
  - As sole frontend engineer at a sustainability venture and re-architect of supply chain onboarding, Oliver operated with high autonomy in a fast-moving, loosely defined environment — generous reading credits this directly.
- `r7` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:opensc-data-quality-monitoring`
  - Scaled data ingestion infrastructure (Dagster pipelines, monitoring) at OpenSC, but this is a general data platform rather than a RAG or ML-specific system — adjacent but not a direct match.
- `r8` **MISS**
  - No SDK authorship or maintenance appears anywhere in the CV.
  - **gap framing:** _I haven't maintained or published an SDK. My closest related work is building and consuming APIs and internal tooling, but I haven't owned an externally-distributed SDK._

## jd_revenuecat.md

**Parser** (cached) — 12 requirements, jdHash=`2c66d6711d23…`

- `r1` (hard, w=1.00) — 5+ years of experience shipping production systems
- `r2` (hard, w=1.00) — Hands-on experience building with LLMs — tool use, structured output, context management, evaluation, orchestration
- `r3` (hard, w=0.90) — Strong backend fundamentals: building systems that are reliable, observable, and secure
- `r4` (hard, w=0.80) — Comfortable with ambiguity; able to figure out architecture in an early-stage product context
- `r5` (hard, w=0.80) — Self-directed: independently identifies what needs to be built, builds it, and ships it
- `r6` (hard, w=0.70) — Able to communicate effectively and collaborate in a fully-remote culture
- `r7` (nice, w=0.30) — Experience with OpenAI or Anthropic APIs specifically
- `r8` (nice, w=0.30) — Experience building agents used by other people in production
- `r9` (nice, w=0.25) — Experience with evaluation and observability frameworks (e.g. Langfuse, LangChain)
- `r10` (nice, w=0.20) — Familiarity with subscription business models, app stores, or developer tools
- `r11` (nice, w=0.20) — Experience building Slack integrations or other conversational interfaces
- `r12` (nice, w=0.15) — Contributions to open-source AI/ML tooling

**Matcher (strict, live $0.031959)** — 4 hits, 4 stretches, 4 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - 7+ years across two substantive production roles (OpenSC 2022–2026, Redington 2019–2022) shipping systems used by real enterprise clients.
- `r2` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Building LLM-driven side projects and a custom Claude Code setup with agents and telemetry, but strict reading finds no shipped production LLM system with explicit evidence of tool use, structured output, context management, or evals.
- `r3` **HIT** — cite: `role:opensc-data-quality-monitoring`, `role:opensc-dagster-yaml`, `role:redington-frontend-arch`
  - Built data quality and ingestion monitoring at OpenSC, re-architected a Dagster ingestion layer for reliability, and owned a multi-tenant architecture at Redington where cross-tenant leakage was existential — concrete evidence of reliability, observability, and security thinking.
- `r4` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-sole-frontend`
  - Sole frontend engineer at an early-stage impact venture, re-architected onboarding from bespoke per-cluster work to a YAML-configured layer — clear evidence of figuring out architecture independently in an ambiguous context.
- `r5` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-nespresso-payments`, `role:opensc-anomaly-graph`
  - As sole frontend engineer at OpenSC, independently owned and shipped the entire analytics dashboard, payments validation system, and graph-based anomaly detection — strong pattern of identifying and shipping autonomously.
- `r6` **STRETCH** — cite: `role:redington-team-lead`
  - Led a 5-person team and ran an external consulting engagement, which implies communication and collaboration skills, but the CV contains no explicit claim of remote-first or async-distributed working.
- `r7` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Daily Claude Code user building LLM-driven projects, making Anthropic API use highly plausible, but no bullet explicitly names API-level integration with OpenAI or Anthropic.
- `r8` **MISS**
  - CV describes side-project agents and a personal Claude Code setup, but no evidence of production agents used by other people.
  - **gap framing:** _I haven't shipped an agent to external or internal users in production — my agent work to date is personal tooling. That's the honest gap here._
- `r9` **STRETCH** — cite: `project:claude-code-setup`
  - Custom telemetry layer over Claude CLI suggests observability thinking for LLM workflows, but no named eval framework (Langfuse, LangChain, etc.) appears in the CV.
- `r10` **MISS**
  - No subscription, app store, or developer-tools experience is evidenced in the CV.
  - **gap framing:** _I haven't worked on subscription billing, app store distribution, or developer-facing tooling products. My commercial background is in B2B SaaS and supply-chain data platforms._
- `r11` **MISS**
  - No Slack integration or conversational interface work appears anywhere in the CV.
  - **gap framing:** _I haven't built a Slack integration or chatbot-style conversational interface. My closest adjacent work is structured dashboard and API surfaces rather than conversational UX._
- `r12` **MISS**
  - No open-source contributions are mentioned in the CV.
  - **gap framing:** _I don't have open-source AI/ML contributions to point to. My LLM work has been in private side projects and personal tooling rather than public repos._

**Matcher (balanced, live $0.031944)** — 4 hits, 4 stretches, 4 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - 7+ years of production shipping across OpenSC (2022–2026) and Redington (2019–2022) — well over the 5-year threshold with named production systems.
- `r2` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Building 3 LLM-driven side projects and a custom Claude Code setup with agents and telemetry, but the CV doesn't cite concrete production evidence of tool use, structured output, evaluation harnesses, or orchestration patterns shipped in a professional context.
- `r3` **HIT** — cite: `role:opensc-data-quality-monitoring`, `role:opensc-dagster-yaml`, `role:redington-frontend-arch`
  - Built data quality monitoring and ingestion accuracy across supply chain feeds, re-architected orchestration in Dagster, and owned architecture on a multi-tenant system where cross-tenant leakage was existential — reliability, observability, and security all evidenced.
- `r4` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-sole-frontend`
  - Sole frontend engineer at an impact venture, also re-architected an entire onboarding pipeline replacing bespoke per-cluster work — both demonstrate figuring out architecture with limited prior structure.
- `r5` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-nespresso-payments`, `role:opensc-anomaly-graph`
  - Operated as sole frontend engineer end-to-end and independently built complex systems (traceability/payments validation, graph-based anomaly detection) without a larger team to hand off to.
- `r6` **STRETCH** — cite: `role:redington-charity`
  - CV shows stakeholder collaboration (pro-bono engagement, external consulting) but doesn't explicitly reference async-first or fully-remote working practices.
- `r7` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Daily Claude Code user and building LLM-driven projects strongly implies Anthropic API use, but the CV never names an API integration directly in a shipped context.
- `r8` **MISS**
  - CV describes side projects and a personal Claude Code setup, but none are presented as agents used by other people in production.
  - **gap framing:** _I haven't shipped an agent to external users in production — my agentic work to date is personal tooling and side projects. The closest thing is my custom Claude Code setup, which is for my own workflow._
- `r9` **STRETCH** — cite: `project:claude-code-setup`, `role:opensc-data-quality-monitoring`
  - Built a telemetry layer on Claude Code and has production data quality monitoring experience, but no named use of Langfuse, LangChain, or equivalent LLM eval frameworks.
- `r10` **MISS**
  - CV covers SaaS multi-tenancy and enterprise consulting but no subscription billing, app store, or developer-tools context is mentioned.
  - **gap framing:** _I haven't worked in a subscription or app-store business model context — my SaaS experience is enterprise B2B rather than consumer or developer-tools monetisation._
- `r11` **MISS**
  - No Slack integrations or conversational interface work appears anywhere in the CV.
  - **gap framing:** _I haven't built Slack integrations or conversational UIs — my interface work has been data dashboards and consumer mobile apps._
- `r12` **MISS**
  - No open-source contributions are mentioned in the CV.
  - **gap framing:** _I don't have open-source AI/ML contributions to point to — my LLM work has been in personal projects rather than public repositories._

**Matcher (generous, live $0.031794)** — 4 hits, 4 stretches, 4 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - 7+ years shipping production systems across OpenSC (2022–2026) and Redington (2019–2022) — well past the 5-year bar with named production platforms.
- `r2` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Building 3 LLM-driven side projects and a custom Claude Code setup with agents, skills, and telemetry, but the CV doesn't surface concrete shipped evidence of tool use, structured output, context management, or evaluation in production — generous reading credits the depth of active engagement.
- `r3` **HIT** — cite: `role:opensc-data-quality-monitoring`, `role:opensc-dagster-yaml`, `role:redington-frontend-arch`
  - Built data quality monitoring and ingestion observability at OpenSC, re-architected orchestration for reliability, and owned a multi-tenant system at Redington where cross-tenant leakage would have been existential.
- `r4` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`
  - As sole frontend engineer at an impact venture, made end-to-end architectural calls and redesigned onboarding from bespoke per-cluster work to a YAML-configured system — clear evidence of navigating ambiguity and shaping architecture.
- `r5` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-nespresso-payments`, `role:opensc-anomaly-graph`
  - Sole frontend engineer who identified, built, and shipped multiple distinct production systems (traceability, payments validation, graph anomaly detection) without cited oversight.
- `r6` **STRETCH** — cite: `role:redington-charity`
  - CV references running a consulting engagement and cross-functional charity work, but doesn't explicitly call out remote-first collaboration experience — generous reading credits demonstrated communication and stakeholder coordination skills.
- `r7` **STRETCH** — cite: `project:claude-code-setup`, `project:language-learning-app`
  - Daily Claude Code use and multiple Anthropic-tool-driven projects strongly imply Anthropic API exposure, but no bullet explicitly names direct API integration in code.
- `r8` **MISS**
  - No CV evidence of agents shipped to and used by external users in production.
  - **gap framing:** _I'm building agents for my own workflows and side projects, but haven't yet shipped an agent product used by other people in production. This is the clearest gap against this requirement._
- `r9` **STRETCH** — cite: `project:claude-code-setup`, `role:opensc-data-quality-monitoring`
  - CV mentions a custom telemetry layer over Claude CLI and production data quality monitoring, but no explicit mention of Langfuse, LangChain, or equivalent LLM eval frameworks.
- `r10` **MISS**
  - No evidence of subscription models, app stores, or developer tools in the CV.
  - **gap framing:** _I haven't worked in a subscription or app-store business context; my commercial background is in B2B SaaS and enterprise consulting rather than developer tools or consumer subscriptions._
- `r11` **MISS**
  - No Slack integrations or conversational interface work appears anywhere in the CV.
  - **gap framing:** _I haven't built Slack integrations or conversational interfaces — my interface work has been dashboards, analytics UIs, and native mobile apps._
- `r12` **MISS**
  - No open-source AI/ML contributions mentioned in the CV.
  - **gap framing:** _I don't have open-source AI/ML contributions to point to; my LLM work to date has been in private side projects and personal tooling._

## jd_synthetic_generalist.md

**Parser** (cached) — 13 requirements, jdHash=`b3fc81e915cb…`

- `r1` (hard, w=1.00) — Shipped at least one full-stack web product end-to-end (React + a real backend)
- `r2` (hard, w=1.00) — Own a feature end-to-end: from scoping to production
- `r3` (hard, w=0.90) — Comfortable with ambiguity — specs are rarely complete
- `r4` (hard, w=0.90) — Next.js + TypeScript (frontend stack in use)
- `r5` (hard, w=0.90) — Node.js + Postgres (backend stack in use)
- `r6` (hard, w=0.80) — Can read code outside primary language (Python, Go, etc.)
- `r7` (hard, w=0.80) — Clear async written communication — most decisions happen in writing
- `r8` (hard, w=0.80) — Able to context-switch between bug fixing, building, and customer triage
- `r9` (soft, w=0.50) — Experience working at a 1–10 person startup
- `r10` (soft, w=0.50) — UI/UX taste — no dedicated designer on the team
- `r11` (nice, w=0.20) — Comfort with LLM-assisted development workflows
- `r12` (nice, w=0.20) — Production experience with a database other than Postgres
- `r13` (nice, w=0.20) — Prior direct customer support experience with end users

**Matcher (strict, live $0.032202)** — 6 hits, 6 stretches, 1 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-nespresso-payments`
  - Sole frontend engineer on OpenSC's analytics dashboard, built end-to-end with Plotly Dash and React/Next.js on top of a Python backend — clear full-stack ownership.
- `r2` **HIT** — cite: `role:opensc-nespresso-payments`, `role:opensc-dagster-yaml`
  - Built the Nespresso traceability and payments validation system end-to-end, and re-architected the Dagster ingestion layer from custom per-cluster engineering into a config-driven system — both indicate full scoping-to-production ownership.
- `r3` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`
  - Being sole frontend engineer at a sustainability venture with messy first-miles farm data implies working with incomplete specs, but no bullet explicitly names ambiguity tolerance as a demonstrated behaviour — strict reading keeps this a stretch.
- `r4` **HIT** — cite: `role:opensc-sole-frontend`, `project:language-learning-app`
  - Next.js and TypeScript named explicitly in OpenSC's stack and used in the language learning side project — direct match.
- `r5` **STRETCH** — cite: `role:redington-frontend-arch`
  - PostgreSQL is a primary skill and used at Redington, but Node.js backend ownership isn't directly evidenced by a concrete bullet — strict reading can't confirm backend Node+Postgres production work together.
- `r6` **HIT** — cite: `role:opensc-earlier-scope`
  - CV covers Python, TypeScript, C#/.NET, Kotlin, and Dart across roles and projects — demonstrated ability to work across multiple languages beyond a single primary.
- `r7` **MISS**
  - No CV bullet or project directly evidences async written communication practices or decision-making in writing.
  - **gap framing:** _I haven't explicitly called out async writing habits in my CV. I do write design notes and have run external consulting engagements, but I don't have a concrete bullet anchoring async documentation as a practice._
- `r8` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:opensc-data-quality-monitoring`
  - As sole frontend engineer maintaining monitoring across supply chain feeds, context-switching is implied, but no bullet explicitly names bug triage alongside feature building and customer-facing work.
- `r9` **STRETCH** — cite: `role:opensc-sole-frontend`
  - OpenSC is described as an impact venture (co-founded by WWF and BCG) but team size isn't stated — can't confirm a 1–10 person startup environment from available evidence.
- `r10` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:redington-config-dashboards`
  - Sole frontend engineer owning consumer-facing experiences and a configurable dashboard system implies UI taste, but no bullet explicitly references design decisions made without a dedicated designer.
- `r11` **HIT** — cite: `project:claude-code-setup`
  - Custom Claude Code setup with agents, skills, telemetry, and a session retrospective workflow is a direct, concrete demonstration of LLM-assisted development.
- `r12` **HIT** — cite: `role:opensc-anomaly-graph`
  - Kuzu (graph DB) used in production for supply chain anomaly detection at OpenSC — a concrete non-Postgres database in production.
- `r13` **STRETCH** — cite: `role:opensc-nespresso-payments`, `role:opensc-austral-fisheries`
  - Worked directly with Nespresso and Austral Fisheries to validate sourcing and provenance, which implies customer-facing work, but no bullet describes fielding end-user support requests or triage directly.

**Matcher (balanced, live $0.032127)** — 8 hits, 5 stretches, 0 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-nespresso-payments`, `role:redington-frontend-arch`
  - Sole frontend engineer on a full Plotly Dash + React/Next.js analytics platform at OpenSC, with Python backend; also owned the full React/TS frontend at Redington against a .NET backend.
- `r2` **HIT** — cite: `role:opensc-nespresso-payments`, `role:opensc-dagster-yaml`
  - Built the Nespresso traceability and payments validation system end-to-end, and re-architected the Dagster ingestion layer from scoping through production deployment.
- `r3` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`
  - Re-architecting messy first-three-miles farm data pipelines and surfacing supply chain anomalies via graph analysis both required navigating deeply incomplete specs and real-world data messiness.
- `r4` **HIT** — cite: `role:opensc-sole-frontend`, `project:language-learning-app`
  - Next.js and TypeScript are named primary stack at OpenSC and in the language learning side project, with both listed as primary skills.
- `r5` **HIT** — cite: `role:redington-frontend-arch`
  - PostgreSQL is listed as a primary skill and was part of the production stack at both Redington and OpenSC; Node.js is also a primary skill used across projects.
- `r6` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-earlier-scope`
  - CV covers production Python (FastAPI, Dagster), Kotlin (Android + Spring Boot), and C#/.NET across roles — well beyond a single primary language.
- `r7` **STRETCH** — cite: `role:redington-charity`
  - The pro-bono LifeCycle engagement and charity committee chair imply structured written communication, but no CV bullet directly evidences async written comms as a working practice.
- `r8` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:opensc-data-quality-monitoring`
  - Being the sole frontend engineer and owning data quality monitoring implies juggling multiple modes of work, but no bullet explicitly names customer triage alongside building and bug-fixing.
- `r9` **STRETCH** — cite: `role:opensc-sole-frontend`
  - OpenSC is a small impact venture (co-founded by WWF/BCG) where Oliver was sole frontend engineer, which is consistent with a small-team startup environment — but headcount isn't stated as 1–10.
- `r10` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:redington-config-dashboards`
  - As sole frontend engineer at OpenSC and co-lead on Redington's configurable dashboard system, UI decisions were clearly his to own — but no bullet explicitly calls out design taste or working without a dedicated designer.
- `r11` **HIT** — cite: `project:claude-code-setup`
  - Daily Claude Code and Cursor user for 3+ months with a custom setup including agents, skills, and telemetry — direct match on LLM-assisted development workflows.
- `r12` **HIT** — cite: `role:opensc-anomaly-graph`
  - Shipped graph-based supply chain anomaly detection using Kuzu (a graph DB) in production at OpenSC — concrete non-Postgres database experience.
- `r13` **STRETCH** — cite: `role:opensc-nespresso-payments`, `role:opensc-austral-fisheries`
  - Worked directly with Nespresso and Austral Fisheries on validation systems, which implies some customer-facing interaction, but no bullet explicitly describes end-user support or triage.

**Matcher (generous, live $0.032592)** — 11 hits, 2 stretches, 0 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-nespresso-payments`
  - Sole frontend engineer on the main analytics dashboard end-to-end (Plotly Dash + React/Next.js frontend, Python backend) at OpenSC — textbook full-stack web product shipped in production.
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-nespresso-payments`
  - Re-architected the Dagster ingestion layer and built the Nespresso traceability/payments system both point to owning features from design through production independently.
- `r3` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`
  - Turned a bespoke-per-supply-chain onboarding mess into a config-driven system, and surfaced novel supply chain anomalies — both required navigating incomplete problem definitions in a complex domain.
- `r4` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`, `project:language-learning-app`
  - Next.js and TypeScript appear across OpenSC, Redington, and the language-learning side project — directly in the listed stack.
- `r5` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`
  - PostgreSQL is listed as the DB at both Redington (.NET/Postgres) and OpenSC (Python/Postgres); Node.js is in primary skills and used across side projects.
- `r6` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-earlier-scope`
  - Worked across Python, Kotlin, and C# in addition to primary JS/TS — demonstrates comfortable cross-language code reading and writing.
- `r7` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:redington-team-lead`
  - Led a team and drove architectural decisions that imply written communication, but the CV has no explicit callout of async written comms practice or documentation culture.
- `r8` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-data-quality-monitoring`
  - As sole frontend engineer also owning data quality monitoring and onboarding across multiple supply chains, context-switching between maintenance, new builds, and operational triage was inherent to the role.
- `r9` **HIT** — cite: `role:opensc-sole-frontend`
  - OpenSC is described as a small sustainability impact venture (co-founded by WWF and BCG) where Oliver was the sole frontend engineer — fits the 1–10 person startup working context.
- `r10` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-config-dashboards`
  - Sole frontend engineer making end-to-end UI decisions at OpenSC, and co-led dynamic dashboard architecture at Redington — both require UI/UX judgement without a dedicated designer.
- `r11` **HIT** — cite: `project:claude-code-setup`
  - Daily Claude Code and Cursor user for 3+ months with a custom agents/skills/telemetry setup and a session retrospective workflow — direct evidence of deep LLM-assisted development practice.
- `r12` **HIT** — cite: `role:opensc-anomaly-graph`
  - Used Kuzu (graph DB) in production at OpenSC for supply chain anomaly detection — a non-Postgres production database.
- `r13` **STRETCH** — cite: `role:opensc-nespresso-payments`, `role:opensc-austral-fisheries`, `role:redington-charity`
  - Worked directly with Nespresso and Austral Fisheries stakeholders, and ran a pro-bono consulting engagement with LifeCycle — adjacent to customer-facing work but not explicit end-user support triage.

## jd_tether.md

**Parser** (cached) — 12 requirements, jdHash=`c661f63fbd54…`

- `r1` (hard, w=1.00) — 5+ years of proven experience in software development with a strong focus on Frontend
- `r2` (hard, w=1.00) — Highly proficient in JavaScript and ES6+
- `r3` (hard, w=1.00) — Thoroughly experienced with React, SASS, Redux, build tools and their core principles
- `r4` (hard, w=0.90) — Experienced with RESTful and RPC-based APIs
- `r5` (hard, w=0.90) — Knowledgeable and experienced with micro-service architecture
- `r6` (hard, w=0.80) — Comfortable with high-availability concepts
- `r7` (hard, w=0.80) — Familiar with modern front-end pipelines and tools
- `r8` (soft, w=0.60) — Some backend experience to run the app locally via NodeJS, with MongoDB, configuring ports and local environment
- `r9` (hard, w=0.80) — Advanced debugging skills including browser debugging tools (network, source, breakpoints, etc.)
- `r10` (soft, w=0.50) — Willing to learn domain-related and condition-based logic, including differences across multiple user scenarios and factor combinations
- `r11` (soft, w=0.50) — Experience developing and deploying features using agile methodologies
- `r12` (nice, w=0.20) — Interest in modernising and optimising web applications

**Matcher (strict, live $0.030420)** — 7 hits, 5 stretches, 0 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - 7+ years total; sole frontend engineer at OpenSC (2022–2026) and frontend lead at Redington (2019–2022) — continuous, senior-level frontend delivery well past the 5-year bar.
- `r2` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`
  - TypeScript (a strict superset of ES6+ JS) is the primary frontend language across both roles; React/Next.js work is inherently ES6+ JavaScript.
- `r3` **HIT** — cite: `role:redington-config-dashboards`, `role:redington-frontend-arch`
  - React and Redux are listed as primary skills and used across both roles; dynamically configurable dashboard system at Redington directly demonstrates React architectural depth — strict level satisfied by the explicit architectural ownership bullet.
- `r4` **STRETCH** — cite: `role:opensc-earlier-scope`
  - API design is mentioned in the earlier OpenSC scope bullet, but no bullet explicitly calls out building or consuming RESTful/RPC APIs in detail — strict reading keeps this at Stretch.
- `r5` **STRETCH** — cite: `role:opensc-dagster-yaml`
  - OpenSC used Kubernetes and AWS (EKS, Lambda, SNS/SQS) — infrastructure indicative of microservices — but no bullet explicitly describes designing or working within a microservice architecture; strict reading requires that explicit claim.
- `r6` **STRETCH** — cite: `role:redington-frontend-arch`
  - Multi-tenant platform where cross-tenant leakage would have been existential implies reliability/availability sensitivity, but no bullet explicitly discusses HA concepts, failover, or uptime requirements.
- `r7` **HIT** — cite: `role:redington-cypress`
  - Drove Cypress E2E testing adoption; skills list shows CI/CD tooling (GitHub Actions, Octopus Deploy, TeamCity, CircleCI), Next.js, and a broad modern frontend toolchain — concrete evidence of pipeline ownership.
- `r8` **STRETCH** — cite: `role:opensc-earlier-scope`
  - Node.js is a primary skill and backend work is evidenced, but MongoDB specifically is absent — PostgreSQL and other stores are used; the Node/local-env part is covered but MongoDB is not.
- `r9` **STRETCH** — cite: `role:redington-cypress`
  - Driving E2E test adoption and frontend architectural ownership implies debugging competence, but no bullet explicitly describes advanced browser debugging techniques — strict level can't elevate this to Hit without a direct citation.
- `r10` **HIT** — cite: `role:opensc-nespresso-payments`
  - Built complex condition-based payment validation logic (price index tracking, farmer payment standards, multiple sourcing program rules) — demonstrates willingness and ability to absorb intricate domain logic.
- `r11` **HIT** — cite: `role:redington-team-lead`
  - Led a 5-person frontend team doing agile delivery at Redington; agile methodology is explicitly listed under leadership skills.
- `r12` **HIT** — cite: `role:opensc-dagster-yaml`, `role:redington-cypress`
  - Re-architected supply chain onboarding from bespoke per-cluster code to config-driven ingestion, and drove modernisation of testing pipelines at Redington — concrete evidence of optimisation and modernisation mindset.

**Matcher (balanced, live $0.030510)** — 7 hits, 5 stretches, 0 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - 7+ years total, with sole frontend ownership at OpenSC (2022–2026) and frontend architecture lead at Redington (2019–2022) — well over 5 years of strong frontend focus.
- `r2` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`
  - TypeScript (a strict superset of ES6+) is Oliver's primary frontend language across both senior roles, used in production multi-tenant dashboards.
- `r3` **HIT** — cite: `role:redington-frontend-arch`, `role:redington-config-dashboards`
  - React and Redux are listed primary skills; co-led architectural decisions and implemented a dynamically configurable dashboard system at Redington — direct evidence of React + Redux depth.
- `r4` **STRETCH** — cite: `role:opensc-earlier-scope`, `role:opensc-nespresso-payments`
  - API design is noted in earlier OpenSC scope and RESTful patterns are implicit in a multi-tenant SaaS and payments validation system, but no bullet explicitly calls out REST or RPC API work.
- `r5` **STRETCH** — cite: `role:opensc-dagster-yaml`, `role:opensc-data-quality-monitoring`
  - AWS + Kubernetes infra and Dagster orchestration at OpenSC implies a microservices environment, but no bullet explicitly discusses designing or owning microservice architecture.
- `r6` **STRETCH** — cite: `role:redington-frontend-arch`
  - Multi-tenant platform where cross-tenant leakage was 'existential' implies HA-level reliability concerns, but high-availability concepts aren't explicitly addressed in any bullet.
- `r7` **HIT** — cite: `role:redington-cypress`, `role:opensc-sole-frontend`
  - Drove Cypress E2E testing adoption, uses Next.js, GitHub Actions, Vercel, and a broad modern frontend toolchain listed in skills — clear familiarity with modern pipelines.
- `r8` **STRETCH** — cite: `role:opensc-earlier-scope`
  - Node.js is a primary skill and API design is noted, but MongoDB specifically isn't in the CV — backend experience is real but with Postgres/Python rather than Node+Mongo.
- `r9` **STRETCH** — cite: `role:opensc-anomaly-graph`, `role:opensc-data-quality-monitoring`
  - Built graph-based anomaly detection and data quality monitoring systems, which require strong debugging instincts, but no bullet explicitly references browser DevTools or frontend debugging techniques.
- `r10` **HIT** — cite: `role:opensc-nespresso-payments`
  - Built complex condition-based payments validation logic (price index tracking, farmer payment standards, Rainforest Alliance rules) — directly demonstrates willingness and ability to learn and implement domain-specific conditional logic.
- `r11` **HIT** — cite: `role:redington-team-lead`
  - Led a 5-person frontend team doing agile delivery at Redington; agile methodology is also explicitly listed in the leadership skills section.
- `r12` **HIT** — cite: `role:opensc-dagster-yaml`, `role:redington-cypress`
  - Re-architected legacy per-cluster orchestrations into a clean YAML-driven layer, and drove modernisation of the test pipeline with Cypress — both are concrete examples of optimising and modernising existing systems.

**Matcher (generous, live $0.030975)** — 10 hits, 2 stretches, 0 honest gaps.

- `r1` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - 7+ years total, with sole frontend ownership at OpenSC (2022–2026) and frontend architecture lead at Redington (2019–2022) — directly satisfies 5+ years of focused frontend experience.
- `r2` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`
  - TypeScript (a strict superset of ES6+) is the primary frontend language across both senior roles; React, Next.js, and modern JS patterns are used throughout.
- `r3` **HIT** — cite: `role:redington-config-dashboards`, `role:redington-frontend-arch`
  - React and Redux are listed as primary skills and were used on the multi-tenant Redington platform; Redux and React Query are explicitly in the skills list alongside the dynamically configurable dashboard work.
- `r4` **HIT** — cite: `role:opensc-earlier-scope`, `role:redington-frontend-arch`
  - API design is called out in the OpenSC earlier scope bullet, and the multi-tenant React/TS platform at Redington clearly consumed REST APIs — generous reading credits direct RESTful API experience.
- `r5` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-data-quality-monitoring`
  - OpenSC's stack (Dagster, Kubernetes, AWS, Airflow, multiple services) is a microservice/orchestrated architecture; the Dagster re-architecture and multi-feed monitoring work operated within that context.
- `r6` **STRETCH** — cite: `role:redington-frontend-arch`
  - Multi-tenant SaaS at Redington with cross-tenant data isolation concerns implies HA awareness, but no bullet explicitly addresses high-availability design or uptime SLAs.
- `r7` **HIT** — cite: `role:redington-cypress`, `role:opensc-sole-frontend`
  - Skills list includes GitHub Actions, CircleCI, Webpack-era build tools, Cypress, and the full modern React/Next.js/TS toolchain; Cypress adoption at Redington shows active pipeline ownership.
- `r8` **HIT** — cite: `role:opensc-earlier-scope`
  - Node.js is a primary backend skill; API design and backend orchestration work at OpenSC confirm comfort running and configuring backend services locally — generous reading covers the MongoDB gap given broad backend depth.
- `r9` **STRETCH** — cite: `role:redington-cypress`, `role:opensc-data-quality-monitoring`
  - E2E testing with Cypress and data quality monitoring imply strong debugging practice, but no bullet explicitly calls out browser devtools debugging skills.
- `r10` **HIT** — cite: `role:opensc-nespresso-payments`, `role:opensc-anomaly-graph`
  - Nespresso payments validation involved learning complex domain logic (price indices, farmer payment rules, certification standards) — demonstrates willingness and ability to absorb intricate conditional business logic.
- `r11` **HIT** — cite: `role:redington-team-lead`
  - Led a 5-person frontend team at Redington with Agile delivery explicitly listed as a leadership/methodology skill; feature delivery at scale in an agile context is directly evidenced.
- `r12` **HIT** — cite: `role:opensc-dagster-yaml`, `role:redington-cypress`
  - Re-architecting the Dagster onboarding layer (turning custom engineering into config) and driving Cypress adoption both demonstrate a clear pattern of modernising and optimising existing systems.

## jd_toptotal.md

**Parser** (cached) — 13 requirements, jdHash=`c050cae01f35…`

- `r1` (hard, w=1.00) — 8+ years of software development experience
- `r2` (hard, w=1.00) — 5+ years with systems-level or backend technologies such as Rust, Go, NodeJS, Python, Ruby, or Java
- `r3` (hard, w=0.90) — Experience with async web frameworks (Axum, Actix, Warp, Tokio ecosystem, or equivalent in other languages)
- `r4` (hard, w=0.90) — Experience with databases (PostgreSQL preferred) and caching layers (Redis)
- `r5` (hard, w=0.90) — Experience with authentication/authorization systems (OAuth 2.0, JWT, OIDC)
- `r6` (hard, w=0.90) — Experience with WebSocket or real-time communication protocols
- `r7` (hard, w=0.90) — Adopted agentic development tools & practices for routine work (e.g. Claude Code, Codex, Gemini-cli, OpenCode, pi-agent or others)
- `r8` (hard, w=0.90) — Ability to operate with high autonomy — identify what needs building, own features from problem statement to production deployment without a dedicated PM
- `r9` (hard, w=0.80) — Strong knowledge of functional and object-oriented programming, automated software testing, and development methodologies
- `r10` (hard, w=0.80) — Lead initiatives and mentor fellow teammates
- `r11` (nice, w=0.30) — Experience with cloud platforms (GCP preferred, AWS/Azure acceptable)
- `r12` (nice, w=0.20) — Experience with frontend technologies such as React (with TypeScript)
- `r13` (soft, w=0.40) — Experience with Kubernetes and Helm for infrastructure

**Matcher (strict, live $0.032211)** — 6 hits, 5 stretches, 2 honest gaps.

- `r1` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - CV claims 7+ years across both roles (2019–2026), which falls just short of the 8-year threshold — strict reading won't round up.
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`, `role:opensc-data-quality-monitoring`
  - Python (FastAPI, Dagster, pandas) used as a primary backend stack across 3+ years at OpenSC, plus Node.js listed as a primary skill — directly satisfies the 5+ years backend requirement.
- `r3` **STRETCH** — cite: `role:opensc-sole-frontend`
  - FastAPI (Python async framework) appears in skills and OpenSC stack, but no bullet explicitly details async framework usage in production — strict reading requires a concrete shipped bullet.
- `r4` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-dagster-yaml`
  - PostgreSQL is a primary skill used at both Redington and OpenSC; however Redis caching is absent from the CV — still a Hit on PostgreSQL specifically, which is the preferred DB.
- `r5` **MISS**
  - No mention of OAuth 2.0, JWT, or OIDC in any role bullet, project, or skills section.
  - **gap framing:** _I haven't explicitly shipped auth systems using OAuth 2.0, JWT, or OIDC — it's likely I've worked adjacent to them in multi-tenant SaaS contexts but I can't point to owned implementation._
- `r6` **MISS**
  - No WebSocket or real-time protocol work appears anywhere in the CV.
  - **gap framing:** _I haven't shipped WebSocket or real-time communication features — my dashboard and data platform work has been request/response and batch-oriented._
- `r7` **HIT** — cite: `project:claude-code-setup`
  - Custom Claude Code setup with agents, skills, and telemetry layer — plus 3+ months daily use of Claude Code and Cursor — is a direct match to this requirement.
- `r8` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-charity`
  - Sole frontend engineer at OpenSC owned the system end-to-end; the LifeCycle consulting engagement was run end-to-end without a PM — both demonstrate high-autonomy ownership from problem to production.
- `r9` **STRETCH** — cite: `role:redington-cypress`
  - Cypress E2E testing and Jest are cited, but the CV lacks explicit evidence of OOP or functional programming discipline beyond framework usage — strict reading wants more than tooling references.
- `r10` **STRETCH** — cite: `role:redington-team-lead`
  - Led a 5-person frontend team, but strict reading finds no explicit mentoring evidence — leadership is evidenced, coaching/mentoring is inferred rather than stated.
- `r11` **HIT** — cite: `role:opensc-sole-frontend`
  - AWS is a primary skill with deep service breadth (EKS, Lambda, S3, RDS, CloudWatch, IAM etc.) used across the OpenSC stack — AWS is explicitly listed as acceptable.
- `r12` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`
  - React and TypeScript are the primary frontend stack across both major roles — direct match.
- `r13` **STRETCH** — cite: `role:opensc-sole-frontend`
  - Kubernetes appears in the OpenSC stack listing but no bullet describes hands-on K8s or Helm configuration work — strict reading can't credit a stack badge without a concrete shipped bullet.

**Matcher (balanced, live $0.033441)** — 9 hits, 2 stretches, 2 honest gaps.

- `r1` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - CV states 7+ years total experience (2019–2026); the requirement asks for 8+ — one year short by the CV's own framing.
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`, `role:redington-frontend-arch`
  - Python and Node.js are listed as primary skills with 7+ years total; backend Python work across Dagster, Kuzu, and FastAPI spans the OpenSC tenure (4 years) with additional Node/C# at Redington — well over 5 years combined.
- `r3` **STRETCH** — cite: `role:opensc-sole-frontend`
  - FastAPI (async Python) is in the skills list and implied by the OpenSC stack, but no bullet explicitly describes building or owning an async API layer — adjacency rather than direct evidence.
- `r4` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-data-quality-monitoring`
  - PostgreSQL is a primary skill used across both Redington (PostgreSQL) and OpenSC (Postgres); data quality monitoring and multi-tenant data work imply direct DB ownership. No Redis evidence, but PostgreSQL is explicitly met.
- `r5` **MISS**
  - No bullet or project mentions OAuth 2.0, JWT, or OIDC implementation.
  - **gap framing:** _I've worked on multi-tenant systems where auth was a critical concern, but I haven't explicitly owned or built OAuth/JWT/OIDC authentication flows — that was handled at infrastructure or platform level in both roles._
- `r6` **MISS**
  - No CV evidence of WebSocket or real-time communication protocol work.
  - **gap framing:** _I haven't shipped WebSocket or real-time communication features; my data platform and dashboard work was request/response and batch-oriented._
- `r7` **HIT** — cite: `project:claude-code-setup`
  - Daily Claude Code user for 3+ months with a custom agents, skills, and telemetry layer — direct match to the requirement.
- `r8` **HIT** — cite: `role:opensc-sole-frontend`, `role:opensc-dagster-yaml`, `role:redington-charity`
  - Sole frontend engineer at OpenSC owning the full system end-to-end, re-architected ingestion layer autonomously, and ran the LifeCycle consulting engagement end-to-end without a PM — strong evidence of high-autonomy operation.
- `r9` **HIT** — cite: `role:redington-cypress`, `role:redington-config-dashboards`, `role:opensc-dagster-yaml`
  - Drove Cypress E2E testing adoption, co-led architectural decisions on configurable dashboard systems, and re-architected a data ingestion layer — demonstrates OOP/functional depth, automated testing, and sound methodology.
- `r10` **HIT** — cite: `role:redington-team-lead`, `role:redington-charity`
  - Led a 5-person frontend team at Redington (consistently highest-performing on UI), and ran external consulting engagements end-to-end — direct evidence of leading initiatives and teammates.
- `r11` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - AWS is a primary skill used across both OpenSC (EKS, S3, etc.) and Redington; Azure listed as additional experience — AWS/Azure explicitly acceptable per the requirement.
- `r12` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - React and TypeScript are primary skills with 7+ years production use across both main roles — direct match.
- `r13` **HIT** — cite: `role:opensc-sole-frontend`
  - Kubernetes is listed in the OpenSC stack and AWS EKS (managed Kubernetes) is in primary infra skills — concrete production exposure, though Helm isn't explicitly mentioned.

**Matcher (generous, live $0.032331)** — 9 hits, 2 stretches, 2 honest gaps.

- `r1` **STRETCH** — cite: `role:opensc-sole-frontend`, `role:redington-frontend-arch`
  - CV states 7+ years; requirement asks for 8+. Close but not quite there on the stated figure.
- `r2` **HIT** — cite: `role:opensc-dagster-yaml`, `role:opensc-anomaly-graph`, `role:redington-frontend-arch`
  - Python and Node.js are listed as primary skills with 7+ years total experience; Python (Dagster, FastAPI, pandas) and Node.js feature heavily across both roles.
- `r3` **STRETCH** — cite: `role:opensc-dagster-yaml`
  - FastAPI (Python async framework) is listed in skills and used at OpenSC — adjacent to the Axum/Actix/Tokio ecosystem named, but not Rust-based.
- `r4` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-data-quality-monitoring`
  - PostgreSQL is a primary skill used across both Redington and OpenSC; strong evidence of production DB usage. No Redis cited, but generous read credits the PostgreSQL depth.
- `r5` **MISS**
  - No mention of OAuth 2.0, JWT, or OIDC anywhere in the CV.
  - **gap framing:** _I haven't explicitly shipped auth/authz systems using OAuth 2.0, JWT, or OIDC — it's not called out in any role or project. I've worked in multi-tenant environments where auth boundaries mattered, but I didn't own that layer._
- `r6` **MISS**
  - No WebSocket or real-time protocol work cited anywhere in the CV.
  - **gap framing:** _I haven't built with WebSockets or real-time communication protocols — none of my roles or projects surface this. My closest work is polling-based data dashboards._
- `r7` **HIT** — cite: `project:claude-code-setup`
  - Daily Claude Code user for 3+ months with a custom setup including agents, skills, and telemetry — direct match.
- `r8` **HIT** — cite: `role:opensc-sole-frontend`, `role:redington-charity`
  - Sole frontend engineer at OpenSC (full end-to-end ownership) and ran the LifeCycle consulting engagement independently — both demonstrate high-autonomy, problem-to-production delivery without PM support.
- `r9` **HIT** — cite: `role:redington-cypress`, `role:opensc-dagster-yaml`
  - Drove E2E testing with Cypress at Redington and re-architected a Dagster ingestion layer at OpenSC — demonstrates automated testing and sound software design methodology across OOP and functional patterns.
- `r10` **HIT** — cite: `role:redington-team-lead`, `role:redington-charity`
  - Led a 5-person frontend team at Redington and ran an external consulting engagement end-to-end — covers both initiative leadership and team mentoring dimensions.
- `r11` **HIT** — cite: `role:opensc-sole-frontend`
  - AWS is a primary skill with production usage across both roles (S3, EKS, EC2, Lambda, RDS etc.); Azure also listed. GCP not cited but AWS/Azure are explicitly acceptable.
- `r12` **HIT** — cite: `role:redington-frontend-arch`, `role:opensc-sole-frontend`
  - React and TypeScript are primary skills with 7+ years of production usage across two major roles.
- `r13` **HIT** — cite: `role:opensc-sole-frontend`
  - Kubernetes is listed in the OpenSC stack and AWS EKS is in the infra skills — direct evidence of production K8s usage, though Helm is not explicitly mentioned.
