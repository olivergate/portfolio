import type { Metadata } from "next";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "The accessibility checks I run, what they cover and how to report a problem.",
};

export default function AccessibilityPage() {
  return (
    <div className="cv-surface">
      <header
        style={{
          paddingTop: "clamp(0.5rem, 2vw, 1.5rem)",
          paddingBottom: "var(--gap-block)",
          borderBottom: "var(--rule-weight) solid var(--rule)",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "var(--tracking-meta)",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginBottom: "0.85rem",
            display: "flex",
            gap: "0.75rem 1.25rem",
            flexWrap: "wrap",
          }}
        >
          <span>Accessibility</span>
          <span aria-hidden="true">·</span>
          <span>WCAG 2.2 AA</span>
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-display)",
            fontSize: "var(--size-h1)",
            letterSpacing: "var(--tracking-h1)",
            lineHeight: 0.98,
            color: "var(--fg)",
            textWrap: "balance",
            margin: 0,
          }}
        >
          What this site <em style={{ color: "var(--accent)", fontStyle: "italic" }}>commits to</em>{" "}
          on accessibility
        </h1>
      </header>

      <section
        style={{
          marginTop: "var(--gap-section)",
          maxWidth: "62ch",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p style={{ fontSize: "var(--size-tagline)", textWrap: "pretty" }}>
          This site targets <strong>WCAG 2.2 Level AA</strong> across every page and every reachable
          slider state. The conformance claim is self-assessed: no third-party VPAT, no signed
          audit. The checks below cover parts of that target.
        </p>
      </section>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="01" title="Tested against" />
        <ul
          style={{
            maxWidth: "68ch",
            paddingLeft: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
            textWrap: "pretty",
          }}
        >
          <li>
            <strong>axe-core via Playwright</strong>: tagged at WCAG 2.0/2.1/2.2 levels A and AA,
            run on the CV at representative slider positions and on selected other pages, including
            several states of the job matcher.
          </li>
          <li>
            <strong>Contrast snapshot</strong>: a Vitest enumerates the four-slider grid at step 0.1
            (11⁴ = 14,641 combinations) and asserts ≥ 4.5:1 on every load-bearing pair. Worst-case
            ratios snapshot so regressions surface as diffs.
          </li>
          <li>
            <strong>Biome a11y rule group</strong>: recommended set enabled at error level on every{" "}
            <code>.tsx</code> in CI.
          </li>
          <li>
            <strong>Manual checklist</strong>: keyboard-only, VoiceOver + Safari, NVDA + Firefox,
            400% browser zoom, OS-level reduced motion, OS-level high contrast / forced colors, iOS
            VoiceOver on a real device. Checklist at <code>docs/runbooks/a11y-manual.md</code>.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="02" title="Known limits" />
        <ul
          style={{
            maxWidth: "68ch",
            paddingLeft: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.55rem",
            textWrap: "pretty",
          }}
        >
          <li>
            <strong>Contrast floor is AA, not AAA.</strong> In the automated slider grid, the
            checked body and accent colours reach 4.5:1 against the background. The site does not
            promise the AAA 7:1 floor, because the refined-polish default cream palette can&rsquo;t
            carry it without losing its character. The automated contrast check records the lowest
            ratios it finds.
          </li>
          <li>
            <strong>The rethemer panel is dark by design.</strong> The slider deck pill and panel
            are hardcoded chrome; they don&rsquo;t re-theme with the page, and under Windows High
            Contrast Mode they opt out of system-color substitution to stay visually distinct. The
            interactive controls inside (native <code>&lt;input type=&quot;range&quot;&gt;</code>)
            remain keyboard-operable and labelled.
          </li>
          <li>
            <strong>OS prefs win via cascade only.</strong> When <code>prefers-contrast: more</code>{" "}
            or <code>forced-colors: active</code> are on, the page restyles via CSS, but the slider
            position you chose is preserved. The contrast test samples the slider values. It does
            not cover every browser or operating system combination.
          </li>
          <li>
            <strong>Self-assessed claim, no VPAT.</strong> No third-party audit has been
            commissioned. If anything below the floor is found, please report; see contact below.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="03" title="Reproduce locally" />
        <p style={{ maxWidth: "68ch", textWrap: "pretty" }}>
          Run the automated checks from a checkout of the source.
        </p>
        <pre
          style={{
            marginTop: "1rem",
            padding: "1rem 1.25rem",
            background: "var(--card-bg)",
            border: "1px solid var(--rule)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.85rem",
            overflowX: "auto",
          }}
        >
          <code>{`bun run a11y          # Biome a11y + contrast Vitest + axe Playwright\nbun run a11y:lhci     # Lighthouse CI (separate, needs a running build)`}</code>
        </pre>
      </section>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="04" title="Contact" />
        <p style={{ maxWidth: "68ch", textWrap: "pretty" }}>
          Found something that breaks? Want to flag a barrier?{" "}
          <a
            href="mailto:oliver.kg2@gmail.com?subject=Accessibility%20issue"
            style={{ color: "var(--accent)", textDecoration: "underline" }}
          >
            oliver.kg2@gmail.com
          </a>
          . Honest gap reports are welcome; that&rsquo;s the same posture the JD adapter takes about
          itself.
        </p>
      </section>
    </div>
  );
}
