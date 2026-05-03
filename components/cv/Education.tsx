import { BulletMarker } from "@/components/cv/BulletMarker";
import { SectionHeader } from "@/components/cv/SectionHeader";
import type { CV } from "@/lib/schemas";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatMonth(value: string): string {
  const [yearStr, monthStr] = value.split("-");
  if (!yearStr) return value;
  if (!monthStr) return yearStr;
  const monthIndex = Number(monthStr) - 1;
  const monthName = MONTH_NAMES[monthIndex];
  return monthName ? `${monthName} ${yearStr}` : value;
}

type Props = { education: CV["education"] };

export function Education({ education }: Props) {
  return (
    <section id="education" style={{ marginTop: "var(--gap-section)" }}>
      <SectionHeader number="05" title="Education" />
      {education.map((entry) => (
        <article key={entry.id} style={{ marginBottom: "var(--gap-block)" }}>
          <div
            data-reveal
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: "0.4rem 1.5rem",
              marginBottom: "var(--gap-item)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--size-h3)",
                fontWeight: "var(--weight-h3)",
                textTransform: "var(--case-h3)",
                color: "var(--fg)",
                margin: 0,
              }}
            >
              {entry.degree}
              <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {entry.school}</span>
            </h3>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--size-meta)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {formatMonth(entry.start)} – {formatMonth(entry.end)}
            </span>
          </div>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--gap-item)",
            }}
          >
            {entry.notes.map((note, i) => (
              <li
                // biome-ignore lint/suspicious/noArrayIndexKey: notes are static prose, no stable id
                key={i}
                data-reveal
                style={{
                  fontSize: "var(--size-body)",
                  lineHeight: "var(--line)",
                  color: "var(--fg)",
                  paddingLeft: "1.4rem",
                  position: "relative",
                  maxWidth: "72ch",
                }}
              >
                <BulletMarker />
                {note}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </section>
  );
}
