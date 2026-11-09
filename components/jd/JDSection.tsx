import { SectionHeader } from "@/components/cv/SectionHeader";
import { JDAdapter } from "@/components/jd/JDAdapter";
import type { SampleJD } from "@/lib/jd-schemas";

type Props = {
  samples: SampleJD[];
};

export function JDSection({ samples }: Props) {
  return (
    <>
      <SectionHeader number="JD-01" title="Score this CV against a job" />
      <p
        style={{
          maxWidth: "68ch",
          marginBottom: "1.5rem",
          textWrap: "pretty",
          color: "var(--fg-soft)",
        }}
      >
        Paste a job description or pick a sample. Click a hit to see the work that backs it up. The
        slider gives you a stricter or more generous reading. A gap stays a gap.
      </p>

      <JDAdapter samples={samples} />
    </>
  );
}
