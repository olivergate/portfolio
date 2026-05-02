"use client";

import { Slider } from "@/components/controls/Slider";
import { useStyleContext } from "@/components/controls/style-context";
import { getPresetName } from "@/lib/preset-name";

const ACCENTS = {
  density: "#d4ff3a",
  polish: "#ff7a59",
  hierarchy: "#7ad7ff",
  motion: "#ffd166",
} as const;

export function SliderDeck() {
  const { state, setAxis, reset, share, activeKey, setActiveKey } = useStyleContext();
  const preset = getPresetName(state);
  const deckActiveClass = activeKey ? "deck-active" : "";

  return (
    <div className={`deck-shell ${deckActiveClass}`}>
      <div className="deck-header">
        <div className="deck-header-left">
          <span className="deck-led" />
          <span className="deck-mono deck-header-label">CV / RETHEME</span>
        </div>
        <div className="deck-mono deck-header-state">
          <span className="deck-state-label">STATE</span>
          <span className="deck-state-value">{preset}</span>
        </div>
      </div>

      <div className="deck-sliders">
        <Slider
          name="DENSITY"
          leftLabel="sparse"
          rightLabel="dense"
          value={state.density}
          onChange={(v) => setAxis("density", v)}
          accent={ACCENTS.density}
          isActive={activeKey === "density"}
          onActiveChange={(a) => setActiveKey(a ? "density" : null)}
        />
        <Slider
          name="POLISH"
          leftLabel="brutalist"
          rightLabel="refined"
          value={state.polish}
          onChange={(v) => setAxis("polish", v)}
          accent={ACCENTS.polish}
          isActive={activeKey === "polish"}
          onActiveChange={(a) => setActiveKey(a ? "polish" : null)}
        />
        <Slider
          name="HIERARCHY"
          leftLabel="flat"
          rightLabel="dramatic"
          value={state.hierarchy}
          onChange={(v) => setAxis("hierarchy", v)}
          accent={ACCENTS.hierarchy}
          isActive={activeKey === "hierarchy"}
          onActiveChange={(a) => setActiveKey(a ? "hierarchy" : null)}
        />
        <Slider
          name="MOTION"
          leftLabel="static"
          rightLabel="kinetic"
          value={state.motion}
          onChange={(v) => setAxis("motion", v)}
          accent={ACCENTS.motion}
          isActive={activeKey === "motion"}
          onActiveChange={(a) => setActiveKey(a ? "motion" : null)}
        />

        <div className="deck-actions">
          <button type="button" className="deck-mono deck-button-reset" onClick={reset}>
            ↺ RESET
          </button>
          <button
            type="button"
            className="deck-mono deck-button-share"
            onClick={() => {
              void share();
            }}
          >
            SHARE THIS LOOK →
          </button>
        </div>
      </div>

      <div className="deck-footer">
        <span className="deck-mono deck-footer-left">oliver.kg2 · instrument v1</span>
        <span className="deck-mono deck-footer-right">4 axes</span>
      </div>
    </div>
  );
}
