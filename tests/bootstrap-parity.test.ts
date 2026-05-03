import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { BOOTSTRAP_SCRIPT } from "@/lib/bootstrap-script";
import { type StyleState, stateToTokens } from "@/lib/style-tokens";

/**
 * Bootstrap/runtime parity. The inline script in app/layout.tsx applies CSS
 * vars synchronously before hydration; the runtime stateToTokens does the
 * same on every slider move. If they drift on any token, shared URLs will
 * flash on hydration. This suite exercises the same inputs against both
 * implementations and asserts identical output.
 */

function evalBootstrap(state: StyleState): Record<string, string> {
  const recorded: Record<string, string> = {};
  // Sandbox the bootstrap script: stub document.documentElement.style + the
  // localStorage read; let it write into `recorded` via setProperty.
  const sandbox = {
    document: {
      documentElement: {
        style: {
          setProperty(k: string, v: string) {
            recorded[k] = v;
          },
        },
      },
    },
    location: {
      // The bootstrap script bails when pathname !== "/" (the slider deck only
      // applies on the home page); the parity test exercises the apply path,
      // so we pin pathname to "/".
      pathname: "/",
    },
    window: {
      localStorage: {
        getItem(key: string): string | null {
          return key === "olg-cv-style-v1" ? JSON.stringify(state) : null;
        },
      },
    },
    JSON,
    Math,
    parseInt,
    parseFloat,
    isFinite: Number.isFinite,
  };
  vm.runInNewContext(BOOTSTRAP_SCRIPT, sandbox);
  return recorded;
}

const samples: StyleState[] = [
  { density: 0.5, polish: 0.55, hierarchy: 0.55, motion: 0.5 }, // default
  { density: 0, polish: 0, hierarchy: 0, motion: 0 },
  { density: 1, polish: 1, hierarchy: 1, motion: 1 },
  { density: 0.3, polish: 0.7, hierarchy: 0.2, motion: 0.9 },
  { density: 0.78, polish: 0.28, hierarchy: 0.7, motion: 0.4 }, // threshold edges
];

describe("bootstrap script matches runtime stateToTokens", () => {
  for (const state of samples) {
    const label = `${state.density}/${state.polish}/${state.hierarchy}/${state.motion}`;
    it(`emits identical tokens at ${label}`, () => {
      const runtime = stateToTokens(state);
      const bootstrap = evalBootstrap(state);
      // Every key the runtime emits must also be emitted by the bootstrap
      // with the same value. This is the contract that prevents flashes
      // on shared URLs.
      for (const [key, value] of Object.entries(runtime)) {
        expect(bootstrap[key], `bootstrap missing ${key} at ${label}`).toBe(value);
      }
    });
  }
});
