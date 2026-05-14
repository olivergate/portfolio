import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/cv/SectionHeader";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Conformance claim, test methods, known limits, and contact for accessibility issues. Targets WCAG 2.2 AA across every page and every reachable slider state.",
};

const LAST_AUDITED = "2026-05-14";

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
          <span aria-hidden="true">—</span>
          <span>WCAG 2.2 AA</span>
          <span aria-hidden="true">—</span>
          <span>Last audited {LAST_AUDITED}</span>
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
          slider state. The conformance claim is self-assessed — no third-party VPAT, no signed
          audit. It&rsquo;s the bar that&rsquo;s automated in CI, walked manually before each
          release, and listed honestly with its limits below.
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
            <strong>axe-core via Playwright</strong> — tagged at WCAG 2.0/2.1/2.2 levels A and AA,
            run on every route at five representative slider positions plus the JD adapter across
            idle, typed-in, scored, and expanded-miss states.
          </li>
          <li>
            <strong>Contrast snapshot</strong> — a Vitest enumerates the four-slider grid at step
            0.1 (11⁴ = 14,641 combinations) and asserts ≥ 4.5:1 on every load-bearing pair.
            Worst-case ratios snapshot so regressions surface as diffs.
          </li>
          <li>
            <strong>Lighthouse CI</strong> — accessibility score = 100 on <code>/</code>,{" "}
            <code>/jd</code>, <code>/lab</code>, and <code>/accessibility</code> at default slider
            state.
          </li>
          <li>
            <strong>Biome a11y rule group</strong> — recommended set enabled at error level on every{" "}
            <code>.tsx</code> in CI.
          </li>
          <li>
            <strong>Manual walkthrough</strong> — keyboard-only, VoiceOver + Safari, NVDA + Firefox,
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
            <strong>Contrast floor is AA, not AAA.</strong> At every reachable slider state, body
            and accent text hit ≥ 4.5:1 against the background. The site does not promise the AAA
            7:1 floor, because the refined-polish default cream palette can&rsquo;t carry it without
            losing its character. The worst-case ratio across the slider grid is{" "}
            <strong>5.46:1</strong> on muted text.
          </li>
          <li>
            <strong>The rethemer panel is dark by design.</strong> The slider deck pill and panel
            are hardcoded chrome — they don&rsquo;t re-theme with the page, and under Windows High
            Contrast Mode they opt out of system-color substitution to stay visually distinct. The
            interactive controls inside (native <code>&lt;input type=&quot;range&quot;&gt;</code>)
            remain keyboard-operable and labelled.
          </li>
          <li>
            <strong>OS prefs win via cascade only.</strong> When <code>prefers-contrast: more</code>{" "}
            or <code>forced-colors: active</code> are on, the page restyles via CSS — but the slider
            position you chose is preserved. The contrast Vitest guarantees AA is held at every
            slider state, so OS prefs and slider state coexist without forcing a choice.
          </li>
          <li>
            <strong>Self-assessed claim, no VPAT.</strong> No third-party audit has been
            commissioned. If anything below the floor is found, please report — see contact below.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="03" title="Reproduce locally" />
        <p style={{ maxWidth: "68ch", textWrap: "pretty" }}>
          The full automated bar runs as a single command from a checkout of the source:
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
          . Honest gap reports are welcome — that&rsquo;s the same posture the JD adapter takes
          about itself.
        </p>
        <p
          style={{
            maxWidth: "68ch",
            textWrap: "pretty",
            marginTop: "1rem",
            color: "var(--fg-soft)",
          }}
        >
          The full rationale (slider-token strategy, OS-pref handling, screen-reader strategy,
          alternatives considered) lives in{" "}
          <Link href="/decisions" style={{ color: "var(--accent)", textDecoration: "underline" }}>
            ADR-0032 — Accessibility approach
          </Link>{" "}
          when the <code>/decisions</code> page is live; until then it&rsquo;s in the repo at{" "}
          <code>docs/adr/0032-accessibility-approach.md</code>.
        </p>
      </section>
    </div>
  );
}
