import { expect, test } from "@playwright/test";
import { makeAxeBuilder } from "./fixtures/axe";

/**
 * Phase 4.5 — axe Playwright matrix.
 *
 * Two sweeps:
 *
 *   1. **CV-surface sweep.** `/` and `/#tone` at five representative slider
 *      positions. Scope axe to `.cv-surface` so the rethemer FAB (hardcoded
 *      dark chrome by design) doesn't contribute false-positive contrast
 *      failures — the FAB's a11y is verified by its keyboard surface.
 *   2. **Route sweep.** Every other route at the default slider state, with
 *      no scoping. `/jd` additionally is exercised across three interaction
 *      states (idle, typed-in, scored, expanded miss) so live regions, chip
 *      semantics, and label wiring are all checked.
 *
 * Tag scope is fixed by `makeAxeBuilder` (WCAG 2.2 AA — see
 * `tests/e2e/fixtures/axe.ts`).
 */

// ─── Sweep 1: CV surface × slider corners ────────────────────────────────

const SAMPLES = [
  { hash: "", label: "default" },
  { hash: "#d=0&p=0&h=1&m=0", label: "brutalist+dramatic+sparse+static" },
  { hash: "#d=1&p=1&h=0&m=1", label: "refined+flat+dense+kinetic" },
  { hash: "#d=0&p=1&h=1&m=1", label: "refined+dramatic+sparse+kinetic" },
  { hash: "#d=1&p=0&h=0&m=0", label: "brutalist+flat+dense+static" },
];

const CV_ROUTES = [
  // After ADR-0028 (single-page consolidation) /tone redirects to /#tone.
  // The page itself is the same; axe still scopes to .cv-surface.
  { path: "/", label: "cv" },
  { path: "/#tone", label: "tone" },
] as const;

for (const route of CV_ROUTES) {
  test.describe(`axe a11y on ${route.label} at representative slider positions`, () => {
    for (const sample of SAMPLES) {
      test(`no violations — ${route.label} | ${sample.label}`, async ({ page }) => {
        await page.goto(`${route.path}${sample.hash}`);
        await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
        // Kinetic mode reveals fire on IntersectionObserver with up to 600ms
        // stagger plus a 580ms fade-in transition. Wait long enough that all
        // visible reveals have fully resolved before axe samples colors —
        // otherwise it sees mid-fade opacity values and computes false-positive
        // contrast failures.
        await page.waitForTimeout(1600);

        const results = await makeAxeBuilder(page).include(".cv-surface").analyze();

        expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
      });
    }
  });
}

// ─── Sweep 2: every other route at default state ─────────────────────────

const OTHER_ROUTES = [
  { path: "/lab", label: "lab" },
  { path: "/blog", label: "blog index" },
  { path: "/jd", label: "jd idle" },
] as const;

for (const route of OTHER_ROUTES) {
  test(`axe a11y — ${route.label} (default state)`, async ({ page }) => {
    await page.goto(route.path);
    // Some routes (e.g. /lab) animate content in; give the page a beat to settle.
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const results = await makeAxeBuilder(page).analyze();

    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

// ─── Sweep 3: /jd interaction states ─────────────────────────────────────
//
// The JD adapter's label wiring, live region, and chip-grid list semantics
// only matter when the visitor actually interacts with the form. Exercise:
//   - idle (no input)            — covered above
//   - typing in the textarea     — fires the label/aria-describedby surface
//   - scored a sample            — chips rendered, summary heading present
//   - expanded a miss chip       — aria-expanded toggled true; disclosure visible

test.describe("axe a11y on /jd across interaction states", () => {
  test("after typing in the textarea", async ({ page }) => {
    await page.goto("/jd");
    await page.waitForLoadState("networkidle");
    const textarea = page.locator(".jd-textarea");
    await textarea.click();
    await textarea.fill(
      "We are hiring a senior engineer with experience in TypeScript, distributed systems, and product thinking. Comfort with ambiguity is essential.",
    );
    await page.waitForTimeout(300);

    const results = await makeAxeBuilder(page).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("after a pre-scored sample loads chips", async ({ page }) => {
    await page.goto("/jd");
    await page.waitForLoadState("networkidle");
    // First sample pill is the default-selected; chips render automatically.
    await page.waitForSelector(".chip", { state: "visible", timeout: 10_000 });
    await page.waitForTimeout(400);

    const results = await makeAxeBuilder(page).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });

  test("after expanding the first miss chip", async ({ page }) => {
    await page.goto("/jd");
    await page.waitForLoadState("networkidle");
    await page.waitForSelector(".chip", { state: "visible", timeout: 10_000 });
    // Miss chips render in the chip grid alongside hits/stretches; find the
    // first chip whose aria-label starts with "Honest gap:" and click to expand.
    const miss = page.locator('button.chip[aria-label^="Honest gap:"]').first();
    if ((await miss.count()) > 0) {
      await miss.click();
      await page.waitForTimeout(200);
    }

    const results = await makeAxeBuilder(page).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
});
