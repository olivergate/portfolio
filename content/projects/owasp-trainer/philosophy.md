---
slug: owasp-trainer/philosophy
status: published
---

## A fix you can prove beats a fact you can recall

The decision under everything else: a lab passes only when real exploit tests stop succeeding and the legitimate behaviour still works. That rules out the two cheap escapes, memorising the answer and breaking the function to silence the test. It also sets an authoring contract — the vulnerable starter has to genuinely fail the exploits, the solution has to genuinely pass them — enforced by a script, not by trust.

## The LLM track patches code, not vibes

Most "prompt security" content is advice. Here the LLM labs simulate the pipeline with deterministic stand-in models and tools, and the vulnerability lives in the surrounding code you write: prompt construction, output handling, tool dispatch, retrieval filtering. You fix the seam where OWASP's 2025 LLM risks actually sit, with no API key and no nondeterministic model in the loop, so the test is repeatable.

## Client-side was the security posture, until it wasn't enough

The trainer began fully client-side, and that wasn't laziness, it was the teaching point: a service that executes attack code learners write would be a real RCE surface. When hosting it publicly made cross-device progress worth having, I didn't just bolt on a backend. The "no backend" decision was frozen, so reversing it meant a superseding ADR (0011) that states exactly what changed and, more importantly, what didn't: code execution stays in the browser, and only a progress summary plus a verified email ever reach the server. The decision log shows the reversal rather than hiding it.

## Boring where it should be boring

No router library, no state library, no design framework, no analytics SDK. The complexity budget is spent on the two hard things, the sandboxes and the lab contract, and nowhere else. The sync layer is the smallest seam that does the job: Redis and a cookie, not an auth product and a user table.
