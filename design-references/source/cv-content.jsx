// CV content — reads CSS vars top-to-bottom

function Section({ id, num, title, children }) {
  return (
    <section
      id={id}
      className="cv-section"
      style={{ marginTop: "var(--gap-section)" }}
      data-screen-label={`${num} ${title}`}
    >
      <header
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          alignItems: "baseline",
          gap: "1rem",
          marginBottom: "var(--gap-block)",
          paddingBottom: "0.85rem",
          borderBottom: "var(--rule-weight) solid var(--rule)",
        }}
        data-reveal
      >
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--size-meta)",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {num}
        </span>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--size-h2)",
            fontWeight: "var(--weight-h2)",
            letterSpacing: "var(--tracking-h2)",
            textTransform: "var(--case-h2)",
            lineHeight: 1.05,
            color: "var(--fg)",
            margin: 0,
            textWrap: "balance",
          }}
        >
          {title}
        </h2>
      </header>
      {children}
    </section>
  );
}

function Header() {
  return (
    <header
      className="cv-header"
      style={{
        paddingTop: "clamp(0.5rem, 2vw, 1.5rem)",
        paddingBottom: "var(--gap-block)",
        borderBottom: "var(--rule-weight) solid var(--rule)",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--muted)",
          marginBottom: "0.85rem",
          display: "flex",
          gap: "0.75rem 1.25rem",
          flexWrap: "wrap",
        }}
        data-reveal
      >
        <span>CV / 2026</span>
        <span aria-hidden="true">—</span>
        <span>{CV.location}</span>
        <span aria-hidden="true">—</span>
        <span>Available for senior IC roles</span>
      </div>

      <h1
        data-reveal-display
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: "var(--weight-display)",
          fontSize: "var(--size-h1)",
          letterSpacing: "var(--tracking-h1)",
          lineHeight: 0.95,
          color: "var(--fg)",
          textTransform: "var(--case-display)",
          textWrap: "balance",
          margin: 0,
        }}
      >
        {CV.name}
      </h1>

      <p
        data-reveal
        style={{
          marginTop: "1.25rem",
          fontFamily: "var(--font-body)",
          fontSize: "var(--size-tagline)",
          lineHeight: "var(--line)",
          color: "var(--fg)",
          maxWidth: "60ch",
          textWrap: "pretty",
          fontStyle: "var(--tagline-style, normal)",
        }}
      >
        {CV.tagline}
      </p>

      {/* Contact row */}
      <div
        data-reveal
        style={{
          marginTop: "1.5rem",
          display: "flex",
          gap: "0.5rem 2rem",
          flexWrap: "wrap",
          fontFamily: "var(--font-mono)",
          fontSize: "var(--size-meta)",
          letterSpacing: "0.06em",
          color: "var(--fg)",
        }}
      >
        <span>
          <span style={{ color: "var(--muted)" }}>email </span>
          {CV.email}
        </span>
        <span>
          <span style={{ color: "var(--muted)" }}>tel </span>
          {CV.phone}
        </span>
      </div>
    </header>
  );
}

function Bio() {
  return (
    <Section id="bio" num="01" title="Personal">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--gap-item)",
          maxWidth: "68ch",
        }}
      >
        {CV.bio.map((p, i) => (
          <p
            key={i}
            data-reveal
            style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              textWrap: "pretty",
              fontStyle: i === 0 ? "var(--lede-style, normal)" : "normal",
              fontWeight: i === 0 ? "var(--lede-weight, 400)" : "var(--weight-body)",
            }}
          >
            {p}
          </p>
        ))}
      </div>
    </Section>
  );
}

function Overview() {
  return (
    <Section id="overview" num="02" title="Experience overview">
      <p
        data-reveal
        style={{
          fontSize: "var(--size-body)",
          lineHeight: "var(--line)",
          color: "var(--fg)",
          maxWidth: "72ch",
          textWrap: "pretty",
        }}
      >
        {CV.overview}
      </p>
    </Section>
  );
}

function BulletMarker() {
  return (
    <span
      aria-hidden="true"
      className="bullet-marker"
      style={{
        position: "absolute",
        left: 0,
        top: "calc(var(--line) * 0.5em)",
        transform: "translateY(-50%)",
        width: "var(--bullet-marker-w, 0.55rem)",
        height: "var(--bullet-marker-h, 1px)",
        background: "var(--bullet-marker-color, var(--fg))",
        borderRadius: "var(--bullet-marker-radius, 0)",
      }}
    />
  );
}

function Bullets({ bullets }) {
  return (
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
      {bullets.map((b, i) => (
        <li
          key={i}
          className="bullet-row"
          data-idx={i}
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
          {b}
        </li>
      ))}
    </ul>
  );
}

function MoreIndicator({ hidden, onPeek, peeking }) {
  if (hidden <= 0) return null;
  return (
    <button
      type="button"
      onClick={onPeek}
      style={{
        marginTop: "var(--gap-item)",
        marginLeft: "1.4rem",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--muted)",
        background: "transparent",
        border: "1px dashed var(--card-border)",
        padding: "0.4rem 0.7rem",
        cursor: "pointer",
        borderRadius: "var(--radius-chip)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--fg)"; e.currentTarget.style.borderColor = "var(--fg)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "var(--card-border)"; }}
    >
      {peeking ? `– hide ${hidden}` : `+ ${hidden} more — peek`}
    </button>
  );
}

function Role({ entry, idx }) {
  const [peeking, setPeeking] = React.useState(false);

  // Apply peek class to hidden bullets within this role
  React.useEffect(() => {
    const el = document.getElementById(`role-${idx}`);
    if (!el) return;
    const hiddenItems = el.querySelectorAll("li.bullet-row.is-hidden");
    hiddenItems.forEach((it) => {
      if (peeking) it.classList.add("is-peek");
      else it.classList.remove("is-peek");
    });
    // Also temporarily un-hide if peeking
    if (peeking) {
      el.querySelectorAll("li.bullet-row").forEach((it, i) => {
        if (i >= 0) it.classList.remove("is-hidden");
      });
    }
  }, [peeking, idx, entry._capChangeKey]);

  return (
    <article
      id={`role-${idx}`}
      data-reveal
      style={{
        marginTop: idx === 0 ? 0 : "var(--gap-block)",
        paddingTop: idx === 0 ? 0 : "var(--gap-block)",
        borderTop: idx === 0 ? "none" : "var(--rule-weight) dashed var(--card-border)",
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
            letterSpacing: "var(--tracking-h3, -0.005em)",
            textTransform: "var(--case-h3)",
            color: "var(--fg)",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {entry.role}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {entry.org}</span>
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
          {entry.period}
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
        {entry.blurb}
      </p>

      <Bullets bullets={entry.bullets} />

      <MoreIndicator
        hidden={entry._hiddenCount || 0}
        peeking={peeking}
        onPeek={() => setPeeking((p) => !p)}
      />

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
        <span style={{ color: "var(--fg)", marginRight: "0.5rem", textTransform: "uppercase", letterSpacing: "0.2em" }}>Stack /</span>
        {entry.tech}
      </div>
    </article>
  );
}

function Experience({ hiddenCounts, capKey }) {
  return (
    <Section id="experience" num="03" title="Experience">
      <div className="cv-roles">
        {CV.experience.map((e, i) => (
          <Role
            key={i}
            idx={i}
            entry={{ ...e, _hiddenCount: hiddenCounts[i] || 0, _capChangeKey: capKey }}
          />
        ))}
      </div>
    </Section>
  );
}

function Education() {
  const e = CV.education;
  return (
    <Section id="education" num="04" title="Education">
      <div data-reveal style={{
        display: "flex", flexWrap: "wrap", alignItems: "baseline",
        justifyContent: "space-between", gap: "0.4rem 1.5rem", marginBottom: "var(--gap-item)",
      }}>
        <h3 style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--size-h3)",
          fontWeight: "var(--weight-h3)",
          color: "var(--fg)", margin: 0,
          textTransform: "var(--case-h3)",
        }}>
          {e.degree}
          <span style={{ color: "var(--muted)", fontWeight: 400 }}> — {e.school}</span>
        </h3>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--size-meta)",
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: "var(--muted)", fontVariantNumeric: "tabular-nums",
        }}>
          {e.period}
        </span>
      </div>
      <ul style={{
        listStyle: "none", margin: 0, padding: 0,
        display: "flex", flexDirection: "column", gap: "var(--gap-item)",
      }}>
        {e.notes.map((n, i) => (
          <li key={i} data-reveal style={{
            fontSize: "var(--size-body)",
            lineHeight: "var(--line)",
            color: "var(--fg)",
            paddingLeft: "1.4rem",
            position: "relative",
            maxWidth: "72ch",
          }}>
            <BulletMarker />
            {n}
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SkillsBlock({ block }) {
  // Determine display style based on polish via CSS vars: chips at brutalist, inline · text at refined.
  return (
    <div data-reveal style={{
      paddingTop: "var(--gap-item)",
      paddingBottom: "var(--gap-item)",
      borderTop: "var(--rule-weight) solid var(--card-border)",
    }}>
      <h4 style={{
        fontFamily: "var(--font-mono)",
        fontSize: "var(--size-meta)",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "var(--muted)",
        margin: 0,
        marginBottom: "0.6rem",
        fontWeight: 500,
      }}>
        {block.title}
      </h4>
      {block.asList ? (
        <ul style={{
          listStyle: "none", margin: 0, padding: 0,
          display: "flex", flexDirection: "column", gap: "0.45rem",
        }}>
          {block.items.map((it, i) => (
            <li key={i} style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              paddingLeft: "1.1rem",
              position: "relative",
            }}>
              <span style={{
                position: "absolute", left: 0,
                top: "calc(var(--line) * 0.5em)",
                width: "var(--bullet-marker-w, 0.5rem)",
                height: "var(--bullet-marker-h, 1px)",
                background: "var(--bullet-marker-color, var(--fg))",
                transform: "translateY(-50%)",
              }} />
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <div className="skill-items" style={{
          display: "flex", flexWrap: "wrap",
          gap: "var(--skill-gap, 0.4rem 0.6rem)",
          alignItems: "baseline",
        }}>
          {block.items.map((it, i) => (
            <span key={i} className="skill-chip" style={{
              fontFamily: "var(--skill-font, var(--font-mono))",
              fontSize: "var(--skill-size, var(--size-meta))",
              padding: "var(--skill-pad, 0.3rem 0.55rem)",
              border: "var(--skill-border, 1px solid var(--card-border))",
              borderRadius: "var(--radius-chip)",
              color: "var(--fg)",
              background: "var(--chip-bg, transparent)",
              textTransform: "var(--skill-case, none)",
              letterSpacing: "var(--skill-tracking, 0.04em)",
            }}>
              {it}
              {/* Inline separator (visible at refined polish via CSS) */}
              <span aria-hidden="true" className="skill-sep" style={{
                display: "var(--skill-sep-display, none)",
                marginLeft: "0.5rem",
                color: "var(--muted)",
              }}>·</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function Skills() {
  return (
    <Section id="skills" num="05" title="Skills">
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(var(--col-count), minmax(0, 1fr))",
        gap: "var(--gap-block) clamp(2rem, 4vw, 3.5rem)",
      }}>
        {CV.skills.map((b, i) => <SkillsBlock key={i} block={b} />)}
      </div>
    </Section>
  );
}

function Projects() {
  return (
    <Section id="projects" num="06" title="Projects">
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(var(--proj-cols), minmax(0, 1fr))",
        gap: "var(--gap-block)",
      }}>
        {CV.projects.map((p, i) => (
          <article key={i} data-reveal className="cv-card" style={{
            background: "var(--card-bg)",
            border: "var(--card-border-width) solid var(--card-border)",
            borderRadius: "var(--radius)",
            padding: "var(--pad-card)",
            boxShadow: "var(--shadow)",
            display: "flex", flexDirection: "column", gap: "0.5rem",
          }}>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--size-meta)",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "var(--muted)",
              fontVariantNumeric: "tabular-nums",
            }}>
              {String(i + 1).padStart(2, "0")} / project
            </div>
            <h3 style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--size-h3)",
              fontWeight: "var(--weight-h3)",
              color: "var(--fg)",
              margin: 0, lineHeight: 1.2,
              textTransform: "var(--case-h3)",
            }}>
              {p.title}
            </h3>
            <div style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--size-meta)",
              color: "var(--muted)",
              letterSpacing: "0.04em",
            }}>
              {p.stack}
            </div>
            <p style={{
              fontSize: "var(--size-body)",
              lineHeight: "var(--line)",
              color: "var(--fg)",
              textWrap: "pretty",
              margin: 0,
            }}>
              {p.desc}
            </p>
          </article>
        ))}
      </div>
    </Section>
  );
}

function Avocations() {
  return (
    <Section id="avocations" num="07" title="Outside work">
      <ul style={{
        listStyle: "none", margin: 0, padding: 0,
        display: "flex", flexWrap: "wrap", gap: "0.6rem 0.8rem",
      }}>
        {CV.avocations.map((a, i) => (
          <li key={i} data-reveal style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--size-h3)",
            fontWeight: "var(--weight-h3)",
            color: "var(--fg)",
            padding: "0.4rem 0.9rem",
            border: "var(--rule-weight) solid var(--rule)",
            borderRadius: "var(--radius-chip)",
            textTransform: "var(--case-h3)",
            fontStyle: "var(--avocation-style, normal)",
          }}>
            {a}
          </li>
        ))}
      </ul>
    </Section>
  );
}

// Manifesto band — adapts its style based on the surrounding polish so it
// persists across all looks rather than vanishing outside brutalist.
// `style` prop accepts: 'auto' | 'inverse' | 'pullquote' | 'rule' | 'off'
function InverseBand({ style: variant = "auto", text = "Question the framing first. Then build.", polish = 0.5 }) {
  if (variant === "off") return null;

  let mode = variant;
  if (variant === "auto") {
    if (polish < 0.32) mode = "inverse";
    else if (polish < 0.7) mode = "rule";
    else mode = "pullquote";
  }

  if (mode === "inverse") {
    return (
      <div
        data-reveal
        style={{
          marginTop: "var(--gap-section)",
          background: "var(--inverse-bg)",
          color: "var(--inverse-fg)",
          padding: "clamp(2rem, 4vw, 3rem) clamp(1.5rem, 3vw, 2.5rem)",
          marginLeft: "calc(-1 * clamp(1rem, 3vw, 2.5rem))",
          marginRight: "calc(-1 * clamp(1rem, 3vw, 2.5rem))",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: "var(--size-meta)",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(244,240,232,0.5)",
          }}>Manifesto / 00</span>
          <p style={{
            fontFamily: "var(--font-display)",
            fontSize: "calc(var(--size-h2) * 1.1)",
            fontWeight: 700, letterSpacing: "-0.015em", lineHeight: 1.05,
            textTransform: "uppercase", margin: 0, maxWidth: "26ch", textWrap: "balance",
          }}>{text}</p>
        </div>
      </div>
    );
  }

  if (mode === "rule") {
    // Quiet centered statement between hairline rules — works in any polish
    return (
      <div data-reveal style={{
        marginTop: "var(--gap-section)",
        paddingTop: "var(--gap-block)", paddingBottom: "var(--gap-block)",
        borderTop: "var(--rule-weight) solid var(--rule)",
        borderBottom: "var(--rule-weight) solid var(--rule)",
        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem",
      }}>
        <span style={{
          fontFamily: "var(--font-mono)", fontSize: "var(--size-meta)",
          letterSpacing: "0.24em", textTransform: "uppercase",
          color: "var(--muted)",
        }}>Manifesto / 00</span>
        <p style={{
          fontFamily: "var(--font-display)",
          fontSize: "calc(var(--size-h2) * 0.95)",
          fontWeight: "var(--weight-h2)",
          letterSpacing: "var(--tracking-h2)",
          lineHeight: 1.1, margin: 0, maxWidth: "30ch",
          textWrap: "balance", color: "var(--fg)",
        }}>{text}</p>
      </div>
    );
  }

  // pullquote (refined)
  return (
    <figure data-reveal style={{
      marginTop: "var(--gap-section)",
      marginLeft: 0, marginRight: 0,
      paddingLeft: "clamp(1rem, 3vw, 2.5rem)",
      borderLeft: "2px solid var(--accent)",
      display: "flex", flexDirection: "column", gap: "0.6rem",
    }}>
      <span style={{
        fontFamily: "var(--font-mono)", fontSize: "var(--size-meta)",
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "var(--muted)",
      }}>— Manifesto</span>
      <blockquote style={{
        margin: 0,
        fontFamily: "var(--font-display)",
        fontSize: "calc(var(--size-h2) * 1.05)",
        fontWeight: 400, fontStyle: "italic",
        letterSpacing: "-0.01em", lineHeight: 1.15,
        maxWidth: "28ch", textWrap: "balance", color: "var(--fg)",
      }}>“{text}”</blockquote>
    </figure>
  );
}

function CVFooter() {
  return (
    <footer style={{
      marginTop: "var(--gap-section)",
      paddingTop: "var(--gap-block)",
      paddingBottom: "var(--gap-section)",
      borderTop: "var(--rule-weight) solid var(--rule)",
      display: "flex", flexWrap: "wrap", gap: "0.75rem 2rem",
      justifyContent: "space-between",
      fontFamily: "var(--font-mono)", fontSize: "var(--size-meta)",
      letterSpacing: "0.18em", textTransform: "uppercase",
      color: "var(--muted)",
    }}>
      <span>© {CV.name}</span>
      <span>last revised — May 2026</span>
      <span>4 axes · ∞ settings</span>
    </footer>
  );
}

Object.assign(window, {
  Header, Bio, Overview, Experience, Education,
  Skills, Projects, Avocations, InverseBand, CVFooter,
});
