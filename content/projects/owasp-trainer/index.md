---
slug: owasp-trainer
status: published
---

I wanted a way to practise fixing security bugs. In each lab you get a small broken function. Read the lesson, take the quiz, then edit the code. The tests check that the attack fails and the normal case still works.

<figure>
<img src="/projects/owasp-trainer/overview-november.png" alt="OWASP Trainer overview with web and LLM security modules" />
<figcaption>The live trainer in November 2026.</figcaption>
</figure>

<figure>
<img src="/projects/owasp-trainer/lab.png" alt="The Broken Access Control code lab: a vulnerable getDocument function in an editor with a brief about the IDOR and a Run exploit tests button" />
<figcaption>A lab: patch the IDOR in <code>getDocument</code>, then run real attack inputs against it.</figcaption>
</figure>

The exploits are real, not described. JavaScript labs run your patched code in a sandboxed Web Worker against payloads like `' OR '1'='1`, `alg:none` tokens, and enumerable ids; Python labs run in Pyodide against an in-memory SQLite database. The LLM track simulates the pipeline, prompt construction, output handling, tool dispatch, retrieval, so you patch the exact seam where a 2025 LLM risk lives, with no API key and no real model.

It's a working demo, not a screenshot: **[try it](https://owasp-tester.vercel.app)**. Progress saves locally by default; an optional email sign-in syncs it across devices (see Technology). Nothing you write in a lab ever leaves your browser.
