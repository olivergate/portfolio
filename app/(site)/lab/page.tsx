import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "Lab",
  description: "Things being built with LLMs — featured Claude Code retrospective demo.",
};

export default function LabPage() {
  return (
    <main>
      <SectionHeader number="LB-01" title="Building with LLMs" meta="Phase 4" />
      <p style={{ maxWidth: "62ch", color: "var(--fg)" }}>
        A featured Claude Code retrospective demo plus three secondary cards. Coming in Phase 4.
      </p>
    </main>
  );
}
