---
slug: owasp-trainer
status: published
---

Security training that's all slides teaches recognition, not repair. This trainer makes you fix the code. It covers two syllabuses, the OWASP Top 10:2025 for web and the OWASP Top 10 for LLM Applications, and every one of the twenty risks runs the same loop: read a short lesson with a diagram and two real incidents, pass a quiz, then open a code lab and patch a genuinely vulnerable function. Your fix only counts when live exploit tests stop breaking it and the legitimate behaviour still works.

<figure>
<img src="/projects/owasp-trainer/lab.png" alt="The Broken Access Control code lab: a vulnerable getDocument function in an editor with a brief about the IDOR and a Run exploit tests button" />
<figcaption>A lab: patch the IDOR in <code>getDocument</code>, then run real attack inputs against it.</figcaption>
</figure>

The exploits are real, not described. JavaScript labs run your patched code in a sandboxed Web Worker against payloads like `' OR '1'='1`, `alg:none` tokens, and enumerable ids; Python labs run in Pyodide against an in-memory SQLite database. The LLM track simulates the pipeline, prompt construction, output handling, tool dispatch, retrieval, so you patch the exact seam where a 2025 LLM risk lives, with no API key and no real model.

It's a working demo, not a screenshot: **[try it](https://owasp-tester.vercel.app)**. Progress saves locally by default; an optional email sign-in syncs it across devices (see Technology). Nothing you write in a lab ever leaves your browser.
