import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "Prompt-safety game",
  description: "Playable: extract a secret from a bot, then unlock OWASP LLM Top 10 explainers.",
};

export default function GamePage() {
  return (
    <div>
      <SectionHeader number="L-00" title="Prompt-safety game" meta="Phase 5–6" />
      <p style={{ maxWidth: "62ch", color: "var(--fg)" }}>
        Playable terminal where you try to make a bot leak its secret. Each cleared level unlocks an
        OWASP LLM Top 10 explainer. Coming in Phases 5–6.
      </p>
    </div>
  );
}
