import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "JD adapter",
  description:
    "Paste a job description, get a chip grid of hits, stretches, and honest gaps — coming in Phase 3.",
};

export default function JDPage() {
  return (
    <main>
      <SectionHeader number="JD-01" title="JD adapter" meta="Phase 3" />
      <p style={{ maxWidth: "62ch", color: "var(--fg)" }}>
        Paste a job description, get a chip grid of hits, stretches, and honest gaps. Coming in
        Phase 3.
      </p>
    </main>
  );
}
