import { SectionHeader } from "@/components/cv/SectionHeader";
import { JDAdapter } from "@/components/jd/JDAdapter";
import type { SampleJD } from "@/lib/jd-schemas";
import type { CV } from "@/lib/schemas";

type Props = {
  cv: CV;
  samples: SampleJD[];
};

export function JDSection({ cv, samples }: Props) {
  return (
    <>
      <SectionHeader number="JD-01" title="Score this CV against a job" meta="experimental" />
      <p
        style={{
          maxWidth: "68ch",
          marginBottom: "1.5rem",
          textWrap: "pretty",
          color: "var(--fg-soft)",
        }}
      >
        Paste a JD. The page will highlight which requirements I&rsquo;d land cleanly, where
        I&rsquo;d stretch, and where I&rsquo;d be honest about a gap. The slider tunes the matching
        threshold &mdash; if you&rsquo;re reading conservatively, drag it left.
      </p>

      <JDAdapter cv={cv} samples={samples} />
    </>
  );
}
