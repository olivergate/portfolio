---
slug: teacherhub
status: published
---

My Spanish teacher and I kept lessons in a Google Doc. It worked until we needed to find an old mistake, a word or the homework that went with it. I built TeacherHub to keep those things together.

I made a notepad for the lesson and a place for the student to do the work afterwards. The app takes the notes, suggests homework and checks the exercises before it hands them back.

<figure>
<img src="/projects/teacherhub/teacher-dashboard.png" alt="TeacherHub teacher dashboard showing the lesson schedule and review queue" />
<figcaption>The teacher dashboard in the original build.</figcaption>
</figure>

The tests found homework where the wrong sentence was the same as the correction. They found summaries that dropped every word the teacher had noted. I also found that the grader was failing decent summaries of busy lessons. I lowered that threshold and kept a separate failure for missing content.

The [evaluation notes](/projects/teacherhub/evals) show what failed and how I changed the scoring.
