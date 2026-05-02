import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "Tone",
  description: "Voice and values manifesto — coming in Phase 2.",
};

export default function TonePage() {
  return (
    <main>
      <SectionHeader number="TN-01" title="Tone manifesto" meta="Phase 2" />
      <p style={{ maxWidth: "62ch", color: "var(--fg)" }}>
        14 numbered tenets in two voices side-by-side — formal vs. how Oliver actually thinks.
        Coming in Phase 2.
      </p>
    </main>
  );
}
