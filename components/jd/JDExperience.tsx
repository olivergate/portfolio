"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { type ChipModel, citedBulletIds } from "@/components/jd/chip-models";
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
  const [y, m] = value.split("-");
  if (!y) return value;
  if (!m) return y;
  const idx = Number(m) - 1;
  const name = MONTH_NAMES[idx];
  return name ? `${name} ${y}` : value;
}

function formatRange(start: string, end: string) {
  return `${formatMonth(start)} – ${formatMonth(end)}`;
}

type RankedBullet = {
  id: string;
  text: string;
  rank: 0 | 1 | 2;
  originalIdx: number;
};

function rankBullets(role: CVRole, hitIds: Set<string>, stretchIds: Set<string>): RankedBullet[] {
  return role.bullets
    .map((b, originalIdx) => {
      const rank: 0 | 1 | 2 = hitIds.has(b.id) ? 0 : stretchIds.has(b.id) ? 1 : 2;
      return { id: b.id, text: b.text.honest, rank, originalIdx };
    })
    .sort((a, b) => a.rank - b.rank || a.originalIdx - b.originalIdx);
}

function originalBullets(role: CVRole): RankedBullet[] {
  return role.bullets.map((b, originalIdx) => ({
    id: b.id,
    text: b.text.honest,
    rank: 2,
    originalIdx,
  }));
}

type RoleProps = {
  role: CVRole;
  ordered: RankedBullet[];
  pulseId: string | null;
  citedBullets: Set<string>;
  showCitedMark: boolean;
};

function Role({ role, ordered, pulseId, citedBullets, showCitedMark }: RoleProps) {
  const itemRefs = useRef<Record<string, HTMLLIElement | null>>({});
  const prevPositions = useRef<Record<string, DOMRect>>({});

  useLayoutEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    for (const [id, el] of Object.entries(itemRefs.current)) {
      if (!el) continue;
      const next = el.getBoundingClientRect();
      const prev = prevPositions.current[id];
      if (prev) {
        const dy = prev.top - next.top;
        if (Math.abs(dy) > 0.5) {
          el.animate([{ transform: `translateY(${dy}px)` }, { transform: "translateY(0)" }], {
            duration: 480,
            easing: "cubic-bezier(.2,.7,.2,1)",
          });
        }
      }
      prevPositions.current[id] = next;
    }
  });

  return (
    <article id={`role-${role.id}`} style={{ marginTop: "var(--gap-block)" }}>
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
            fontSize: "1.25rem",
            fontWeight: 600,
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
            fontSize: "0.78rem",
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
      <p style={{ maxWidth: "72ch", marginBottom: "1rem", textWrap: "pretty" }}>
        {role.summary.honest}
      </p>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
      >
        {ordered.map((b) => {
          const cited = showCitedMark && citedBullets.has(b.id);
          return (
            <li
              key={b.id}
              ref={(el) => {
                itemRefs.current[b.id] = el;
              }}
              data-bullet-id={b.id}
              className={pulseId === b.id ? "bullet-pulse" : ""}
              style={{
                position: "relative",
                maxWidth: "72ch",
                textWrap: "pretty",
                padding: "0.25rem 0.4rem 0.25rem 1.4rem",
                borderLeft: cited ? "2px solid var(--accent)" : "2px solid transparent",
                marginLeft: cited ? "-2px" : "0",
                transition: "border-color 320ms",
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  left: cited ? "0.2rem" : 0,
                  top: "calc(1.6em * 0.5)",
                  width: "0.55rem",
                  height: "1px",
                  background: "var(--fg)",
                  transform: "translateY(-50%)",
                }}
              />
              {b.text}
            </li>
          );
        })}
      </ul>
      <div
        style={{
          marginTop: "1rem",
          paddingLeft: "1.4rem",
          fontFamily: "var(--font-mono)",
          fontSize: "0.78rem",
          letterSpacing: "0.06em",
          color: "var(--muted)",
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

type Props = {
  cv: CV;
  scoredChips: ChipModel[] | null;
  reorder: boolean;
  pulseId: string | null;
};

export function JDExperience({ cv, scoredChips, reorder, pulseId }: Props) {
  const ids = useMemo(() => {
    if (!scoredChips) {
      return {
        hit: new Set<string>(),
        stretch: new Set<string>(),
        hitProject: new Set<string>(),
        stretchProject: new Set<string>(),
      };
    }
    return citedBulletIds(scoredChips);
  }, [scoredChips]);

  const orderedRoles = useMemo(() => {
    if (!scoredChips || !reorder) {
      return cv.roles.map((r) => ({ role: r, ordered: originalBullets(r) }));
    }
    return cv.roles.map((r) => ({ role: r, ordered: rankBullets(r, ids.hit, ids.stretch) }));
  }, [cv, scoredChips, reorder, ids]);

  const citedBulletSet = useMemo(() => {
    const all = new Set<string>();
    for (const id of ids.hit) all.add(id);
    for (const id of ids.stretch) all.add(id);
    return all;
  }, [ids]);

  return (
    <div>
      {orderedRoles.map(({ role, ordered }) => (
        <Role
          key={role.id}
          role={role}
          ordered={ordered}
          pulseId={pulseId}
          citedBullets={citedBulletSet}
          showCitedMark={scoredChips !== null}
        />
      ))}

      <ProjectsSection
        cv={cv}
        hitIds={ids.hitProject}
        stretchIds={ids.stretchProject}
        showMarks={scoredChips !== null}
        pulseId={pulseId}
      />
    </div>
  );
}

function ProjectsSection({
  cv,
  hitIds,
  stretchIds,
  showMarks,
  pulseId,
}: {
  cv: CV;
  hitIds: Set<string>;
  stretchIds: Set<string>;
  showMarks: boolean;
  pulseId: string | null;
}) {
  return (
    <article id="projects-section" style={{ marginTop: "var(--gap-block)" }}>
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "1.25rem",
          fontWeight: 600,
          margin: "0 0 0.85rem",
        }}
      >
        Projects with LLMs
      </h3>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.85rem",
        }}
      >
        {cv.projects.map((p) => {
          const cited = showMarks && (hitIds.has(p.id) || stretchIds.has(p.id));
          return (
            <li
              key={p.id}
              data-project-id={p.id}
              className={pulseId === `project:${p.id}` ? "bullet-pulse" : ""}
              style={{
                position: "relative",
                maxWidth: "72ch",
                textWrap: "pretty",
                padding: "0.25rem 0.4rem 0.25rem 1.4rem",
                borderLeft: cited ? "2px solid var(--accent)" : "2px solid transparent",
                marginLeft: cited ? "-2px" : "0",
                transition: "border-color 320ms",
              }}
            >
              <strong style={{ fontFamily: "var(--font-display)", fontWeight: 600 }}>
                {p.title}
              </strong>{" "}
              <span style={{ color: "var(--muted)" }}>— {p.stack}</span>
              <div style={{ color: "var(--fg-soft)", marginTop: 2 }}>{p.description}</div>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
