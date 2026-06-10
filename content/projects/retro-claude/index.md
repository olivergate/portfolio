---
slug: retro-claude
status: published
---

A human engineering team runs retros; my work with Claude Code deserved the same discipline. retro-claude is the system that provides it: after every working session, a `/clear-review` slash command captures a structured retro into YAML, classified against a closed-set ontology, with evidence citations required for every self-assessment.

In its first five weeks (2026-04-24 to 2026-05-28) it logged 74 session records across my projects. The corpus tracks what went well, where the agent and I corrected each other, which capabilities were missing, and what each session decided and changed. From that evidence, recurring patterns get promoted by hand into rules: a two-rule collaboration direction and three working practices (output verification, fanout provenance, input verification), packaged as a kit that other repos install. This portfolio runs that kit; so does [TeacherHub](/projects/teacherhub).

The interesting design problem is vocabulary. Classification only aggregates if the tag set is closed, but a closed set drifts out of date. Every tag therefore carries a fit confidence, and `forced` or `other` entries are the signal that the ontology needs revising: version 0.2 shipped precisely because the data demanded it.

Around the YAML substrate, a team-mode product is growing: a Next.js dashboard, an MCP server exposing 23 tools, and a CLI, backed by Supabase Postgres with a 19-ADR decision log.
