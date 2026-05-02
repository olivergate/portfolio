import { About } from "@/components/cv/About";
import { Avocations } from "@/components/cv/Avocations";
import { Education } from "@/components/cv/Education";
import { Experience } from "@/components/cv/Experience";
import { Header } from "@/components/cv/Header";
import { Projects } from "@/components/cv/Projects";
import { Skills } from "@/components/cv/Skills";
import { getCV } from "@/lib/content";

export default function HomePage() {
  const cv = getCV();
  return (
    <main>
      <Header header={cv.header} />
      <About about={cv.about} />
      <Experience overview={cv.experienceOverview} roles={cv.roles} />
      <Education education={cv.education} />
      <Skills skills={cv.skills} />
      <Projects projects={cv.projects} />
      <Avocations avocations={cv.avocations} />
    </main>
  );
}
