import { BulletMarker } from "@/components/cv/BulletMarker";
import { SectionHeader } from "@/components/cv/SectionHeader";
import { TonedText } from "@/components/cv/TonedText";
import { ToneToggle } from "@/components/cv/ToneToggle";
import type { CV, CVRole } from "@/lib/schemas";

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

function formatRange(start: string, end: string): string {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

function Role({ role, isFirst }: { role: CVRole; isFirst: boolean }) {
  return (
    <article
      id={`role-${role.id}`}
      data-reveal
      style={{
        marginTop: isFirst ? 0 : "var(--gap-block)",
        paddingTop: isFirst ? 0 : "var(--gap-block)",
        borderTop: isFirst ? "none" : "var(--rule-weight) dashed var(--card-border)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "0.4rem 1.5rem",
          marginBottom: "0.65rem",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--size-h3)",
            fontWeight: "var(--weight-h3)",
            letterSpacing: "-0.005em",
            textTransform: "var(--case-h3)",
            color: "var(--fg)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {role.title}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {role.company}</span>
        </h3>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--muted)",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatRange(role.start, role.end)}
        </span>
      </div>

      <p
        style={{
          fontSize: "var(--size-body)",
          lineHeight: "var(--line)",
          color: "var(--fg)",
          maxWidth: "72ch",
          marginBottom: "var(--gap-item)",
          textWrap: "pretty",
          fontStyle: "var(--blurb-style, normal)",
        }}
      >
        <TonedText value={role.summary} />
      </p>

      <ul
        data-bullets
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-item)",
        }}
      >
        {role.bullets.map((bullet, idx) => (
          <li
            key={bullet.id}
            id={`bullet-${bullet.id}`}
            className="bullet-row"
            data-idx={idx}
            style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              paddingLeft: "1.4rem",
              position: "relative",
              textWrap: "pretty",
              maxWidth: "72ch",
            }}
          >
            <BulletMarker />
            <TonedText value={bullet.text} />
          </li>
        ))}
      </ul>

      <div
        style={{
          marginTop: "calc(var(--gap-item) * 1.2)",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "0.06em",
          color: "var(--muted)",
          paddingLeft: "1.4rem",
        }}
      >
        <span
          style={{
            color: "var(--fg)",
            marginRight: "0.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.2em",
          }}
        >
          Stack /
        </span>
        {role.technologies.join(", ")}
      </div>
    </article>
  );
}

type Props = { roles: CV["roles"]; overview: CV["experienceOverview"] };

export function Experience({ roles, overview }: Props) {
  return (
    <>
      <section id="overview" style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="02" title="Experience overview" />
        <p
          data-reveal
          style={{
            fontSize: "var(--size-body)",
            lineHeight: "var(--line)",
            color: "var(--fg)",
            maxWidth: "72ch",
            textWrap: "pretty",
            margin: 0,
          }}
        >
          {overview}
        </p>
      </section>

      <ToneToggle />

      <section id="experience" style={{ marginTop: "var(--gap-section)" }}>
        <SectionHeader number="04" title="Experience" />
        <div>
          {roles.map((role, i) => (
            <Role key={role.id} role={role} isFirst={i === 0} />
          ))}
        </div>
      </section>
    </>
  );
}
