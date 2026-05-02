// App glue — slider state -> CSS vars + share + toast + reveal-on-scroll
const { useMemo, useEffect, useState, useRef } = React;

const DEFAULTS = { density: 0.5, polish: 0.55, hierarchy: 0.55, motion: 0.5 };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "manifestoStyle": "auto",
  "manifestoText": "Question the framing first. Then build.",
  "manifestoPosition": "after-header",
  "accentHue": 18,
  "deckPosition": "left",
  "showAvocations": true
}/*EDITMODE-END*/;

const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function mix(a, b, t) {
  const ah = a.replace("#", ""), bh = b.replace("#", "");
  const ar = parseInt(ah.slice(0,2),16), ag = parseInt(ah.slice(2,4),16), ab = parseInt(ah.slice(4,6),16);
  const br = parseInt(bh.slice(0,2),16), bg = parseInt(bh.slice(2,4),16), bb = parseInt(bh.slice(4,6),16);
  const r = Math.round(lerp(ar,br,t)), g = Math.round(lerp(ag,bg,t)), bl = Math.round(lerp(ab,bb,t));
  return `#${r.toString(16).padStart(2,"0")}${g.toString(16).padStart(2,"0")}${bl.toString(16).padStart(2,"0")}`;
}

function computeVars({ density, polish, hierarchy, motion }, tweaks = {}) {
  // ---------- POLISH ----------
  // Brutalist: pure white #ffffff / pure black #000000, hairlines OR thick rules.
  // Refined: warm parchment #faf7f2 / ink #1c1915, ample tone separation.
  const isBrutalist = polish < 0.28;
  const isRefined = polish > 0.72;

  const bg  = mix("#ffffff", "#faf7f2", polish);
  const fg  = mix("#000000", "#1c1915", polish);
  const muted = mix("#3a3a3a", "#7a746c", polish);
  const rule = mix("#000000", "#c4b9a8", polish);
  const cardBg = isBrutalist ? "#ffffff" : mix("#ffffff", "#fffdf7", polish);
  const cardBorder = isBrutalist
    ? "rgba(0,0,0,1)"
    : `rgba(28,25,21,${(0.18 - 0.10 * polish).toFixed(3)})`;
  const ruleWeight = isBrutalist ? "2px" : "1px";
  const cardBorderWidth = isBrutalist ? "2px" : "1px";

  // Inverse band — visible only at brutalist
  const inverseBg = isBrutalist ? "#000000" : "#1c1915";
  const inverseFg = isBrutalist ? "#ffffff" : "#f4f0e8";
  const inverseOpacity = polish < 0.30 ? 1 : 0;
  const inverseMaxH = polish < 0.30 ? "400px" : "0";

  // Radius — strict at brutalist, gentle at refined
  const radius = isBrutalist ? "0px" : `${Math.round(lerp(0, 8, polish))}px`;
  const radiusChip = isBrutalist ? "0px" : (polish > 0.65 ? "999px" : "3px");

  // Shadow — none at brutalist, single careful one near refined max
  const shadow = isBrutalist
    ? "none"
    : isRefined
      ? "0 1px 2px rgba(28,25,21,0.04)"
      : "0 1px 2px rgba(0,0,0,0.03)";

  // Type families
  const fontDisplay = isBrutalist
    ? `'Space Grotesk', 'Inter', sans-serif`
    : polish < 0.55
      ? `'Inter', sans-serif`
      : `'Fraunces', Georgia, serif`;
  const fontBody = isBrutalist
    ? `'Inter', system-ui, sans-serif`
    : `'Inter', system-ui, sans-serif`;

  // Case
  const caseDisplay = isBrutalist ? "uppercase" : "none";
  const caseH2 = isBrutalist ? "uppercase" : "none";
  const caseH3 = polish < 0.18 ? "uppercase" : "none";

  // Tracking on display — wider at brutalist max for that fashion-house feel
  const trackingDisplay = isBrutalist
    ? `${lerp(0.02, 0.0, polish / 0.28).toFixed(3)}em`
    : `${lerp(-0.01, -0.025, (polish - 0.28) / 0.72).toFixed(3)}em`;

  // Italic asides — refined only
  const ledeStyle = polish > 0.7 ? "italic" : "normal";
  const ledeWeight = polish > 0.7 ? "400" : "var(--weight-body)";
  const blurbStyle = polish > 0.78 ? "italic" : "normal";
  const taglineStyle = polish > 0.8 ? "italic" : "normal";
  const avocationStyle = polish > 0.8 ? "italic" : "normal";

  // Bullet marker — square at brutalist, dot at refined
  const bulletMarkerW = isBrutalist ? "0.45rem" : (polish > 0.7 ? "5px" : "0.55rem");
  const bulletMarkerH = isBrutalist ? "0.45rem" : (polish > 0.7 ? "5px" : "1px");
  const bulletMarkerRadius = polish > 0.7 ? "999px" : "0";
  const bulletMarkerColor = polish > 0.7 ? "var(--accent)" : "var(--fg)";

  // Skill chip styling
  const skillFont = polish > 0.55 ? `'Inter', sans-serif` : `'JetBrains Mono', ui-monospace, monospace`;
  const skillBorder = isBrutalist ? "1px solid var(--fg)" : "none";
  const skillPad = isBrutalist ? "0.4rem 0.6rem" : "0";
  const skillCase = isBrutalist ? "uppercase" : "none";
  const skillTracking = isBrutalist ? "0.12em" : "0.01em";
  const skillSepDisplay = polish > 0.55 ? "inline" : "none";
  const skillGap = isBrutalist ? "0.4rem 0.4rem" : (polish > 0.55 ? "0.1rem 0.1rem" : "0.4rem 0.5rem");
  const skillSize = isBrutalist ? "var(--size-meta)" : "var(--size-body)";
  const chipBg = "transparent";

  // Tagline / lede look — italic only at refined extreme
  // Already set above

  // Accent hue override
  let accent;
  if (tweaks && typeof tweaks.accentHue === "number") {
    const sat = lerp(20, 55, polish);
    const lit = lerp(28, 42, polish);
    accent = `hsl(${tweaks.accentHue}, ${sat}%, ${lit}%)`;
  } else {
    accent = mix("#000000", "#a04a26", polish);
  }

  // ---------- HIERARCHY ----------
  // H1 uses clamp() driven by hierarchy
  const h1Min = lerp(1.6, 2.6, hierarchy);
  const h1Pref = lerp(2.2, 9, hierarchy);
  const h1Max = lerp(2.6, 7.5, hierarchy);
  const sizeH1 = `clamp(${h1Min.toFixed(2)}rem, ${h1Pref.toFixed(2)}vw, ${h1Max.toFixed(2)}rem)`;

  const sizeH2 = `${lerp(1.2, 2.6, hierarchy).toFixed(2)}rem`;
  const sizeH3 = `${lerp(1.0, 1.35, hierarchy).toFixed(2)}rem`;
  const sizeBody = "1rem";
  const sizeMeta = `${lerp(0.82, 0.74, hierarchy).toFixed(2)}rem`;
  const sizeTagline = `${lerp(1.05, 1.45, hierarchy).toFixed(2)}rem`;

  const trackingH1 = isBrutalist
    ? trackingDisplay
    : `${lerp(-0.005, -0.04, hierarchy).toFixed(3)}em`;
  const trackingH2 = `${lerp(-0.002, -0.02, hierarchy).toFixed(3)}em`;

  const weightDisplay = isBrutalist
    ? Math.round(lerp(700, 800, hierarchy))
    : Math.round(lerp(500, 700, hierarchy));
  const weightH2 = isBrutalist
    ? Math.round(lerp(700, 800, hierarchy))
    : Math.round(lerp(500, 700, hierarchy));
  const weightH3 = Math.round(lerp(500, 600, hierarchy));
  const weightBody = "400";

  // ---------- DENSITY ----------
  const gapSection = `${lerp(7.5, 2.2, density).toFixed(2)}rem`;
  const gapBlock = `${lerp(2.8, 1.0, density).toFixed(2)}rem`;
  const gapItem = `${lerp(1.1, 0.5, density).toFixed(2)}rem`;
  const padCard = `${lerp(2.4, 1.0, density).toFixed(2)}rem`;
  const line = `${lerp(1.7, 1.35, density).toFixed(2)}`;

  let bulletCap;
  if (density < 0.18) bulletCap = 2;
  else if (density < 0.38) bulletCap = 3;
  else if (density < 0.6) bulletCap = 5;
  else if (density < 0.78) bulletCap = 6;
  else bulletCap = 99;

  const colCount = density > 0.55 ? 2 : 1;
  const projCols = density > 0.45 ? 2 : 1;

  // ---------- MOTION ----------
  const motionFast = `${Math.round(lerp(0, 200, motion))}ms`;
  const motionBase = `${Math.round(lerp(0, 360, motion))}ms`;
  const motionSlow = `${Math.round(lerp(0, 580, motion))}ms`;
  const motionDisplay = `${Math.round(lerp(0, 700, motion))}ms`;
  const stagger = `${Math.round(lerp(0, 75, motion))}ms`;

  return {
    "--bg": bg,
    "--fg": fg,
    "--muted": muted,
    "--rule": rule,
    "--rule-weight": ruleWeight,
    "--card-bg": cardBg,
    "--card-border": cardBorder,
    "--card-border-width": cardBorderWidth,
    "--accent": accent,
    "--inverse-bg": inverseBg,
    "--inverse-fg": inverseFg,
    "--inverse-opacity": String(inverseOpacity),
    "--inverse-maxh": inverseMaxH,
    "--radius": radius,
    "--radius-chip": radiusChip,
    "--shadow": shadow,
    "--font-display": fontDisplay,
    "--font-body": fontBody,
    "--case-display": caseDisplay,
    "--case-h2": caseH2,
    "--case-h3": caseH3,
    "--lede-style": ledeStyle,
    "--lede-weight": ledeWeight,
    "--blurb-style": blurbStyle,
    "--tagline-style": taglineStyle,
    "--avocation-style": avocationStyle,
    "--bullet-marker-w": bulletMarkerW,
    "--bullet-marker-h": bulletMarkerH,
    "--bullet-marker-radius": bulletMarkerRadius,
    "--bullet-marker-color": bulletMarkerColor,
    "--skill-font": skillFont,
    "--skill-border": skillBorder,
    "--skill-pad": skillPad,
    "--skill-case": skillCase,
    "--skill-tracking": skillTracking,
    "--skill-sep-display": skillSepDisplay,
    "--skill-gap": skillGap,
    "--skill-size": skillSize,
    "--chip-bg": chipBg,
    "--size-h1": sizeH1,
    "--size-h2": sizeH2,
    "--size-h3": sizeH3,
    "--size-body": sizeBody,
    "--size-meta": sizeMeta,
    "--size-tagline": sizeTagline,
    "--tracking-h1": trackingH1,
    "--tracking-h2": trackingH2,
    "--weight-display": String(weightDisplay),
    "--weight-h2": String(weightH2),
    "--weight-h3": String(weightH3),
    "--weight-body": weightBody,
    "--gap-section": gapSection,
    "--gap-block": gapBlock,
    "--gap-item": gapItem,
    "--pad-card": padCard,
    "--line": line,
    "--col-count": String(colCount),
    "--proj-cols": String(projCols),
    "--bullet-cap": String(bulletCap),
    "--motion-fast": motionFast,
    "--motion-base": motionBase,
    "--motion-slow": motionSlow,
    "--motion-display": motionDisplay,
    "--stagger": stagger,
    "--density": String(density),
    "--polish": String(polish),
    "--hierarchy": String(hierarchy),
    "--motion": String(motion),
  };
}

function applyVars(vars) {
  const root = document.documentElement;
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
}

function applyBulletCap(cap) {
  const lists = document.querySelectorAll("[data-bullets]");
  lists.forEach((list) => {
    list.querySelectorAll("li.bullet-row").forEach((li, i) => {
      if (i >= cap) li.classList.add("is-hidden");
      else li.classList.remove("is-hidden");
      li.classList.remove("is-peek");
    });
  });
}

// Reveal-on-scroll observer (only meaningful when motion > 0.4)
function useRevealObserver(motionVal) {
  useEffect(() => {
    const surface = document.querySelector(".cv-surface");
    if (!surface) return;
    const kinetic = motionVal > 0.4;
    surface.dataset.kinetic = kinetic ? "true" : "false";

    const items = surface.querySelectorAll("[data-reveal], [data-reveal-display]");
    if (!kinetic) {
      items.forEach((it) => it.classList.add("is-revealed"));
      return;
    }

    items.forEach((it) => it.classList.remove("is-revealed"));

    const stagger = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--stagger"), 10) || 60;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        visible.forEach((e, i) => {
          e.target.style.setProperty("--reveal-delay", `${i * stagger}ms`);
          e.target.classList.add("is-revealed");
          obs.unobserve(e.target);
        });
      },
      { rootMargin: "-5% 0px -10% 0px", threshold: 0.05 }
    );
    items.forEach((it) => obs.observe(it));
    return () => obs.disconnect();
  }, [motionVal]);
}

function App() {
  const [values, setValues] = useState(DEFAULTS);
  const [activeKey, setActiveKey] = useState(null);
  const [toast, setToast] = useState(null);
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const setValue = (k, v) => setValues((prev) => ({ ...prev, [k]: v }));

  // Hidden bullet counts per role
  const { hiddenCounts, capKey } = useMemo(() => {
    let cap;
    if (values.density < 0.18) cap = 2;
    else if (values.density < 0.38) cap = 3;
    else if (values.density < 0.6) cap = 5;
    else if (values.density < 0.78) cap = 6;
    else cap = 99;
    return {
      hiddenCounts: CV.experience.map((e) => Math.max(0, e.bullets.length - cap)),
      capKey: cap,
    };
  }, [values.density]);

  // Apply CSS vars
  useEffect(() => {
    const vars = computeVars(values, tweaks);
    applyVars(vars);
    const cap = parseInt(vars["--bullet-cap"], 10);
    applyBulletCap(cap);
    const surface = document.querySelector(".cv-surface");
    if (surface) surface.dataset.brutalist = values.polish < 0.28 ? "true" : "false";
  }, [values, tweaks]);

  // Reveal observer
  useRevealObserver(values.motion);

  // Hash sync (read once)
  useEffect(() => {
    try {
      const m = window.location.hash.match(/look=([^&]+)/);
      if (m) {
        const parsed = JSON.parse(atob(decodeURIComponent(m[1])));
        if (
          typeof parsed.d === "number" && typeof parsed.p === "number" &&
          typeof parsed.h === "number" && typeof parsed.m === "number"
        ) {
          setValues({
            density: clamp(parsed.d, 0, 1),
            polish: clamp(parsed.p, 0, 1),
            hierarchy: clamp(parsed.h, 0, 1),
            motion: clamp(parsed.m, 0, 1),
          });
        }
      }
    } catch (e) {}
  }, []);

  const handleReset = () => setValues(DEFAULTS);

  const handleShare = async () => {
    const payload = {
      d: +values.density.toFixed(3),
      p: +values.polish.toFixed(3),
      h: +values.hierarchy.toFixed(3),
      m: +values.motion.toFixed(3),
    };
    const encoded = btoa(JSON.stringify(payload));
    const url = `${window.location.origin}${window.location.pathname}#look=${encoded}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        setToast("link copied — paste anywhere");
      } else {
        window.location.hash = `look=${encoded}`;
        setToast("URL updated — copy from address bar");
      }
    } catch {
      window.location.hash = `look=${encoded}`;
      setToast("URL updated — copy from address bar");
    }
    setTimeout(() => setToast(null), 2400);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div className="layout" data-deck-pos={tweaks.deckPosition || "left"}>
        {/* Left col — control deck */}
        {tweaks.deckPosition !== "right" && (
          <aside className="deck-col">
            <ControlDeck values={values} setValue={setValue} onReset={handleReset} onShare={handleShare} activeKey={activeKey} setActiveKey={setActiveKey} />
          </aside>
        )}

        {/* CV */}
        <main className="cv-surface" style={{ minWidth: 0 }}>
          <Header />
          {tweaks.manifestoPosition === "after-header" && (
            <InverseBand style={tweaks.manifestoStyle} text={tweaks.manifestoText} polish={values.polish} />
          )}
          <Bio />
          {tweaks.manifestoPosition === "after-bio" && (
            <InverseBand style={tweaks.manifestoStyle} text={tweaks.manifestoText} polish={values.polish} />
          )}
          <Overview />
          <Experience hiddenCounts={hiddenCounts} capKey={capKey} />
          {tweaks.manifestoPosition === "after-experience" && (
            <InverseBand style={tweaks.manifestoStyle} text={tweaks.manifestoText} polish={values.polish} />
          )}
          <Education />
          <Skills />
          <Projects />
          {tweaks.showAvocations && <Avocations />}
          <CVFooter />
        </main>

        {tweaks.deckPosition === "right" && (
          <aside className="deck-col">
            <ControlDeck values={values} setValue={setValue} onReset={handleReset} onShare={handleShare} activeKey={activeKey} setActiveKey={setActiveKey} />
          </aside>
        )}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Manifesto" />
        <TweakSelect
          label="Style"
          value={tweaks.manifestoStyle}
          options={[
            { value: "auto", label: "Auto (matches polish)" },
            { value: "inverse", label: "Inverse block (brutalist)" },
            { value: "rule", label: "Between hairlines" },
            { value: "pullquote", label: "Italic pullquote (refined)" },
            { value: "off", label: "Off" },
          ]}
          onChange={(v) => setTweak("manifestoStyle", v)}
        />
        <TweakSelect
          label="Position"
          value={tweaks.manifestoPosition}
          options={[
            { value: "after-header", label: "After header" },
            { value: "after-bio", label: "After bio" },
            { value: "after-experience", label: "After experience" },
          ]}
          onChange={(v) => setTweak("manifestoPosition", v)}
        />
        <TweakText
          label="Copy"
          value={tweaks.manifestoText}
          onChange={(v) => setTweak("manifestoText", v)}
        />

        <TweakSection label="Identity" />
        <TweakSlider
          label="Accent hue"
          value={tweaks.accentHue}
          min={0} max={360} step={1} unit="°"
          onChange={(v) => setTweak("accentHue", v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Deck position"
          value={tweaks.deckPosition}
          options={[{ value: "left", label: "Left" }, { value: "right", label: "Right" }]}
          onChange={(v) => setTweak("deckPosition", v)}
        />
        <TweakToggle
          label="Show avocations"
          value={tweaks.showAvocations}
          onChange={(v) => setTweak("showAvocations", v)}
        />
      </TweaksPanel>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            left: "50%",
            bottom: 32,
            transform: "translateX(-50%)",
            animation: "toast-in 220ms cubic-bezier(.2,.7,.2,1)",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <div
            className="deck-mono"
            style={{
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#0a0a0a",
              background: "#d4ff3a",
              padding: "0.7rem 1.1rem",
              borderRadius: 999,
              boxShadow: "0 12px 32px -8px rgba(0,0,0,0.4)",
              fontWeight: 700,
            }}
          >
            ✓ {toast}
          </div>
        </div>
      )}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
