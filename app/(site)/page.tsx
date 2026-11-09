import { Education } from "@/components/cv/Education";
import { Experience } from "@/components/cv/Experience";
import { Header } from "@/components/cv/Header";
import { Projects } from "@/components/cv/Projects";
import { Skills } from "@/components/cv/Skills";
import { ToneSection } from "@/components/cv/ToneSection";
import { JDSection } from "@/components/jd/JDSection";
import { LabSection } from "@/components/lab/LabSection";
import { getCV, getProjects, getSampleJDs, getTone } from "@/lib/content";

export default function HomePage() {
  const cv = getCV();
  const tone = getTone();
  const samples = getSampleJDs();
  const projects = getProjects();

  return (
    <div className="cv-surface">
      <section id="cv">
        <Header header={cv.header} />
        <Experience roles={cv.roles} />
        <Skills skills={cv.skills} />
        <Projects projectSlugs={cv.projectSlugs} allProjects={projects.projects} />
        <Education education={cv.education} />
      </section>

      {/*
        JD remains a sibling (not nested in #cv) so the spy nav's
        IntersectionObserver can detect it as a distinct intersection
        target | when nested, #cv always wins and the JD label never lights.
        Chip clicks still resolve to the canonical CV bullets up-page via
        data-bullet-id / data-project-id (no duplicate CV | see ADR-0029).
      */}
      <section id="jd" style={{ marginTop: "var(--gap-section)" }}>
        <JDSection samples={samples} />
      </section>

      <section id="tone" style={{ marginTop: "var(--gap-section)" }}>
        <ToneSection tone={tone} />
      </section>

      <section id="lab" style={{ marginTop: "var(--gap-section)" }}>
        <LabSection projects={projects} />
      </section>
    </div>
  );
}
