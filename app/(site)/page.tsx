import { About } from "@/components/cv/About";
import { Avocations } from "@/components/cv/Avocations";
import { Education } from "@/components/cv/Education";
import { Experience } from "@/components/cv/Experience";
import { Header } from "@/components/cv/Header";
import { Projects } from "@/components/cv/Projects";
import { SatireBanner } from "@/components/cv/SatireBanner";
import { Skills } from "@/components/cv/Skills";
import { ToneProvider } from "@/components/cv/ToneProvider";
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
    <ToneProvider>
      <SatireBanner />
      <main className="cv-surface">
        <section id="cv">
          <Header header={cv.header} />
          <About about={cv.about} />
          <Experience overview={cv.experienceOverview} roles={cv.roles} />
          <Education education={cv.education} />
          <Skills skills={cv.skills} />
          <Projects projects={cv.projects} />
          <Avocations avocations={cv.avocations} />
        </section>

        <section id="tone" style={{ marginTop: "var(--gap-section)" }}>
          <ToneSection tone={tone} />
        </section>

        <section id="lab" style={{ marginTop: "var(--gap-section)" }}>
          <LabSection projects={projects} />
        </section>

        <section id="jd" style={{ marginTop: "var(--gap-section)" }}>
          <JDSection cv={cv} samples={samples} />
        </section>
      </main>
    </ToneProvider>
  );
}
