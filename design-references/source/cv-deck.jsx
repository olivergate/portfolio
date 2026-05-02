// Slider deck — instrument design, hardcoded (does NOT retheme).
const { useState, useRef, useEffect } = React;

// One slider — designed object, not a form control.
function Slider({ name, leftLabel, rightLabel, value, onChange, accent, onActiveChange, isActive }) {
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  const pct = value * 100;
  // Pad value to 0.00 fixed-width
  const display = value.toFixed(2);
  const isAnchor = Math.abs(value - 0) < 0.005 || Math.abs(value - 0.5) < 0.005 || Math.abs(value - 1) < 0.005;

  const handleStart = () => { setActive(true); onActiveChange && onActiveChange(true); };
  const handleEnd = () => { setActive(false); onActiveChange && onActiveChange(false); };

  // Major ticks at 0/.25/.5/.75/1; minor at every 0.05
  const minorTicks = Array.from({ length: 21 }, (_, i) => i / 20);

  return (
    <div className={`slider-row ${isActive ? "is-active" : ""}`}>
      {/* Top row: name (large), extreme labels (quiet), numeric readout */}
      <div className="flex items-baseline justify-between mb-3 gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <h3
            className="deck-grotesk"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              letterSpacing: "0.04em",
              lineHeight: 1,
              color: "#f4f1ea",
              margin: 0,
              textTransform: "uppercase",
            }}
          >
            {name}
          </h3>
        </div>
        {/* Numeric readout — instrument display */}
        <div
          className="deck-mono flex items-baseline gap-1.5"
          style={{ minWidth: 78, justifyContent: "flex-end" }}
        >
          <span
            style={{
              fontSize: 9,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(244,241,234,0.4)",
            }}
          >
            VAL
          </span>
          <span
            style={{
              fontSize: "1.05rem",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
              color: isAnchor ? accent : "#f4f1ea",
              letterSpacing: "-0.02em",
              minWidth: "3.2ch",
              display: "inline-block",
              textAlign: "right",
              textShadow: isAnchor ? `0 0 12px ${accent}66` : "none",
            }}
          >
            {display}
          </span>
        </div>
      </div>

      {/* Track surface */}
      <div
        className="relative"
        style={{ height: 64 }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {/* Baseline grid — horizontal divider line */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2"
          style={{
            height: 22,
            background: "rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 2,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.6)",
          }}
        />

        {/* Filled portion — solid color block */}
        <div
          className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
          style={{
            left: 0,
            width: `${pct}%`,
            height: 22,
            background: `linear-gradient(90deg, ${accent}55, ${accent})`,
            borderRadius: "2px 0 0 2px",
            boxShadow: active ? `0 0 18px ${accent}99` : `0 0 8px ${accent}55`,
            transition: active ? "none" : "width 100ms linear, box-shadow 220ms",
          }}
        />

        {/* Tick marks layer */}
        <div className="absolute left-0 right-0 top-0 bottom-0 pointer-events-none">
          {minorTicks.map((t, i) => {
            const major = i % 5 === 0;
            const passed = t <= value + 0.001;
            const left = `${t * 100}%`;
            return (
              <span
                key={i}
                className="absolute"
                style={{
                  left,
                  top: major ? 6 : 12,
                  bottom: major ? 6 : 12,
                  width: 1,
                  background: major
                    ? passed ? "rgba(244,241,234,0.7)" : "rgba(244,241,234,0.3)"
                    : passed ? "rgba(244,241,234,0.35)" : "rgba(244,241,234,0.15)",
                  transform: "translateX(-0.5px)",
                  transition: "background 120ms",
                }}
              />
            );
          })}
        </div>

        {/* Major tick labels under track */}
        <div className="absolute left-0 right-0" style={{ top: "calc(50% + 16px)", pointerEvents: "none" }}>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <span
              key={t}
              className="deck-mono absolute"
              style={{
                left: `${t * 100}%`,
                transform: "translateX(-50%)",
                top: 0,
                fontSize: 8,
                letterSpacing: "0.1em",
                color: "rgba(244,241,234,0.35)",
              }}
            >
              {t.toFixed(2)}
            </span>
          ))}
        </div>

        {/* Range input (invisible) */}
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          onBlur={handleEnd}
          className="raw-range"
          aria-label={name}
        />

        {/* Custom thumb — vertical bar with notch + accent stripe */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${pct}%`,
            top: 4,
            bottom: 4,
            width: 18,
            transform: "translateX(-50%)",
            transition: active ? "none" : "left 100ms linear",
            zIndex: 2,
          }}
        >
          {/* Outer hit-area glow */}
          <div
            className="absolute"
            style={{
              inset: -8,
              borderRadius: 4,
              background: hover || active ? `radial-gradient(closest-side, ${accent}33, transparent 70%)` : "transparent",
              transition: "background 220ms",
            }}
          />
          {/* Bar body */}
          <div
            className="absolute"
            style={{
              inset: 0,
              background: "linear-gradient(180deg, #f8f5ed 0%, #d6d1c5 50%, #b8b3a6 100%)",
              border: "1px solid rgba(0,0,0,0.5)",
              borderRadius: 2,
              boxShadow: active
                ? `0 0 0 2px ${accent}, 0 0 18px ${accent}66, inset 0 1px 0 rgba(255,255,255,0.8)`
                : "inset 0 1px 0 rgba(255,255,255,0.7), 0 4px 10px rgba(0,0,0,0.5)",
            }}
          />
          {/* Center notch */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: "20%",
              bottom: "20%",
              width: 2,
              background: "#1c1b18",
              transform: "translateX(-50%)",
              borderRadius: 1,
            }}
          />
          {/* Accent stripe at top */}
          <div
            className="absolute"
            style={{
              top: -2,
              left: -1,
              right: -1,
              height: 4,
              background: accent,
              borderRadius: 1,
              boxShadow: `0 0 8px ${accent}88`,
            }}
          />
          {/* Small tick lines on bar */}
          <div className="absolute" style={{ left: 3, right: 3, top: "50%", height: 1, background: "rgba(0,0,0,0.4)" }} />
        </div>
      </div>

      {/* Extreme labels — quiet hint text at actual ends */}
      <div
        className="flex justify-between items-center deck-mono mt-1"
        style={{
          fontSize: 9,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "rgba(244,241,234,0.42)",
        }}
      >
        <span>← {leftLabel}</span>
        <span>{rightLabel} →</span>
      </div>
    </div>
  );
}

// Preset name based on state — diagnostic readout on the deck
function getPresetName({ density, polish, hierarchy, motion }) {
  if (polish < 0.22 && hierarchy > 0.7 && density > 0.55) return "EDITORIAL";
  if (polish > 0.72 && hierarchy < 0.32 && density < 0.4 && motion < 0.3) return "QUIET DOCUMENT";
  if (motion > 0.78 && density > 0.7) return "KINETIC";
  if (polish < 0.22 && hierarchy > 0.65) return "FASHION HOUSE";
  if (polish < 0.25) return "BRUTALIST";
  if (polish > 0.78) return "REFINED";
  if (density > 0.78) return "DENSE";
  if (density < 0.22) return "SPARSE";
  if (hierarchy > 0.78) return "DRAMATIC";
  if (Math.abs(density - 0.5) < 0.05 && Math.abs(polish - 0.5) < 0.05 && Math.abs(hierarchy - 0.5) < 0.05) return "RESTING";
  return "BALANCED";
}

function ControlDeck({
  values,
  setValue,
  onReset,
  onShare,
  activeKey,
  setActiveKey,
}) {
  const accents = {
    density:   "#d4ff3a", // chartreuse
    polish:    "#ff7a59", // coral
    hierarchy: "#7ad7ff", // sky
    motion:    "#ffd166", // amber
  };

  const preset = getPresetName(values);

  // active state for dim-others effect
  const deckActiveClass = activeKey ? "deck-active" : "";

  return (
    <div className={`deck-shell ${deckActiveClass}`}>
      {/* Header strip */}
      <div
        className="flex items-center justify-between px-4"
        style={{
          height: 38,
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0))",
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* LED dot */}
          <span
            style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#d4ff3a",
              boxShadow: "0 0 8px #d4ff3a, 0 0 0 1px rgba(0,0,0,0.4)",
              animation: "none",
            }}
          />
          <span
            className="deck-mono"
            style={{
              fontSize: 9, letterSpacing: "0.28em",
              textTransform: "uppercase", color: "rgba(244,241,234,0.55)",
            }}
          >
            CV / RETHEME
          </span>
        </div>
        <div className="deck-mono flex items-baseline gap-2" style={{ fontSize: 9 }}>
          <span style={{ letterSpacing: "0.18em", color: "rgba(244,241,234,0.4)" }}>STATE</span>
          <span style={{
            letterSpacing: "0.12em",
            color: "#d4ff3a",
            fontWeight: 600,
            textShadow: "0 0 10px #d4ff3a55",
          }}>
            {preset}
          </span>
        </div>
      </div>

      {/* Sliders */}
      <div className="px-5 py-5 flex flex-col gap-7">
        <Slider
          name="DENSITY"
          leftLabel="sparse"
          rightLabel="dense"
          value={values.density}
          onChange={(v) => setValue("density", v)}
          accent={accents.density}
          isActive={activeKey === "density"}
          onActiveChange={(a) => setActiveKey(a ? "density" : null)}
        />
        <Slider
          name="POLISH"
          leftLabel="brutalist"
          rightLabel="refined"
          value={values.polish}
          onChange={(v) => setValue("polish", v)}
          accent={accents.polish}
          isActive={activeKey === "polish"}
          onActiveChange={(a) => setActiveKey(a ? "polish" : null)}
        />
        <Slider
          name="HIERARCHY"
          leftLabel="flat"
          rightLabel="dramatic"
          value={values.hierarchy}
          onChange={(v) => setValue("hierarchy", v)}
          accent={accents.hierarchy}
          isActive={activeKey === "hierarchy"}
          onActiveChange={(a) => setActiveKey(a ? "hierarchy" : null)}
        />
        <Slider
          name="MOTION"
          leftLabel="static"
          rightLabel="kinetic"
          value={values.motion}
          onChange={(v) => setValue("motion", v)}
          accent={accents.motion}
          isActive={activeKey === "motion"}
          onActiveChange={(a) => setActiveKey(a ? "motion" : null)}
        />

        {/* Action row */}
        <div
          className="flex items-stretch gap-2 mt-1 pt-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          <button
            onClick={onReset}
            className="deck-mono flex-1 transition-colors"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(244,241,234,0.7)",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 3,
              padding: "0.65rem 0.5rem",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "#f4f1ea"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(244,241,234,0.7)"; }}
          >
            ↺ RESET
          </button>
          <button
            onClick={onShare}
            className="deck-mono flex-[2] transition-all"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#0a0a0a",
              background: "#d4ff3a",
              border: "1px solid #d4ff3a",
              borderRadius: 3,
              padding: "0.65rem 0.75rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 0 16px rgba(212,255,58,0.25)",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#e3ff6b"; e.currentTarget.style.boxShadow = "0 0 24px rgba(212,255,58,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#d4ff3a"; e.currentTarget.style.boxShadow = "0 0 16px rgba(212,255,58,0.25)"; }}
          >
            SHARE THIS LOOK →
          </button>
        </div>
      </div>

      {/* Bottom signature */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(0,0,0,0.25)",
        }}
      >
        <span className="deck-mono" style={{ fontSize: 8, letterSpacing: "0.28em", color: "rgba(244,241,234,0.3)", textTransform: "uppercase" }}>
          oliver.kg2 · instrument v1
        </span>
        <span className="deck-mono" style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(244,241,234,0.3)", textTransform: "uppercase" }}>
          4 axes
        </span>
      </div>
    </div>
  );
}

window.ControlDeck = ControlDeck;
window.getPresetName = getPresetName;
