---
slug: retro-claude
status: published
---

I wanted a record of where I kept getting stuck with Claude Code. At the end of a session I run `/clear-review`. It saves the review as YAML, with a tag for each observation and a reference back to what happened.

In its first five weeks (2026-04-24 to 2026-05-28) it logged 74 session records across my projects. The corpus tracks what went well, where the agent and I corrected each other, which capabilities were missing, and what each session decided and changed. From that evidence, recurring patterns get promoted by hand into rules: a two-rule collaboration direction and three working practices (output verification, fanout provenance, input verification), packaged as a kit that other repos install. This portfolio runs that kit; so does [TeacherHub](/projects/teacherhub).

The interesting design problem is vocabulary. Classification only aggregates if the tag set is closed, but a closed set drifts out of date. Every tag therefore carries a fit confidence, and `forced` or `other` entries are the signal that the ontology needs revising: version 0.2 shipped precisely because the data demanded it.

I also worked on a team version with a web dashboard, an MCP server and a CLI. The solo version still starts with files on disk.
