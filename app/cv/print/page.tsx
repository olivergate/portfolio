import type { CSSProperties } from "react";
import { About } from "@/components/cv/About";
import { Avocations } from "@/components/cv/Avocations";
import { Education } from "@/components/cv/Education";
import { Experience } from "@/components/cv/Experience";
import { Header } from "@/components/cv/Header";
import { ProjectsPrint } from "@/components/cv/ProjectsPrint";
import { Skills } from "@/components/cv/Skills";
import { getCV, getProjects } from "@/lib/content";
import { DEFAULT_STYLE, stateToTokens } from "@/lib/style-tokens";
import "@/styles/cv-print.css";

// SPIKE (2026-06-15): ATS-clean print surface for the downloadable CV PDF.
// Lives OUTSIDE the (site) route group on purpose — no Nav/Footer/FAB/rethemer/
// scrollspy/JD/Tone/Lab. Pinned to DEFAULT_STYLE, single column, no kinetic
// reveals (reveals are gated on .cv-surface[data-kinetic="true"], which we omit).
// See docs/specs/2026-06-04-cv-pdf-distribution.md. Not linked from nav; the
// generation script (scripts/generate-cv-pdf.ts) snapshots it to public/.

export const dynamic = "force-static";

// The PDF source page carries the phone (PDF = yes) but must NOT be crawlable —
// it would defeat the "phone hidden on the public site" decision. Not linked from
// nav; noindex here + Disallow in robots.ts keep it out of search/AI indexes.
export const metadata = {
  title: "CV (print)",
  robots: { index: false, follow: false },
};

// Compact print scale. The CV components are token-driven (inline styles read
// var(--size-h1), var(--gap-section), …), and inline styles outrank class rules,
// so the only way to compress a screen-tuned layout into a ~2-page CV is to
// override the token VALUES here and let them cascade through every component.
// At native screen spacing the same render is 8 pages.
const PRINT_SCALE: Record<string, string> = {
  "--size-h1": "27px",
  "--size-h2": "11.5px",
  "--size-h3": "12px",
  "--size-tagline": "10px",
  "--size-body": "9.5px",
  "--size-meta": "7.8px",
  "--line": "1.33",
  "--gap-section": "8px",
  "--gap-block": "5px",
  "--gap-item": "2px",
  "--pad-card": "8px",
  "--skill-gap": "3px",
  "--skill-pad": "2px 7px",
  "--proj-cols": "1",
};

export default function CvPrintPage() {
  const cv = getCV();
  const projects = getProjects();
  const tokens = { ...stateToTokens(DEFAULT_STYLE), ...PRINT_SCALE } as CSSProperties;
  const links = cv.header.links;

  return (
    <div className="cv-surface cv-print" style={tokens}>
      <Header header={cv.header} variant="print" />

      {/* Funnel + bare-text links in the body top — survive ATS stripping and
          printing; clickable where the viewer allows. */}
      {links ? (
        <p
          style={{
            marginTop: "0.55rem",
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "0.04em",
            color: "var(--fg)",
            lineHeight: 1.5,
          }}
        >
          <a href={links.website} style={{ color: "inherit" }}>
            {links.website.replace(/^https?:\/\//, "")}
          </a>
          {"  ·  "}
          <a href={links.linkedin} style={{ color: "inherit" }}>
            {links.linkedin.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
          {links.github ? (
            <>
              {"  ·  "}
              <a href={links.github} style={{ color: "inherit" }}>
                {links.github.replace(/^https?:\/\//, "")}
              </a>
            </>
          ) : null}
          <br />
          <span style={{ color: "var(--muted)" }}>
            This PDF is the static snapshot. Paste your role at olivergate.com/jd and the live site
            scores itself against it — honestly, gaps included.
          </span>
        </p>
      ) : null}

      <About about={cv.about} />
      <Experience overview={cv.experienceOverview} roles={cv.roles} />
      <Education education={cv.education} />
      <Skills skills={cv.skills} />
      <ProjectsPrint projectSlugs={cv.projectSlugs} allProjects={projects.projects} />
      <Avocations avocations={cv.avocations} />
    </div>
  );
}
