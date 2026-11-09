import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "Prompt safety game",
  description: "The prompt safety game is in development. The OWASP Trainer is available now.",
};

export default function GamePage() {
  return (
    <div>
      <SectionHeader number="L-00" title="Prompt safety game" />
      <p style={{ maxWidth: "62ch", color: "var(--fg)" }}>
        I haven't finished this game. You can already try the{" "}
        <a href="https://owasp-tester.vercel.app" className="blog-post-back">
          OWASP Trainer
        </a>
        , which has working labs for prompt injection and other LLM risks.
      </p>
    </div>
  );
}
