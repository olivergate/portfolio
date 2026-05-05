import { expect, test } from "@playwright/test";

const AXES = ["density", "polish", "hierarchy", "motion"] as const;
const KEYS = ["d", "p", "h", "m"] as const;

type Corner = { 0: number; 1: number; 2: number; 3: number };

function* corners(): Generator<Corner> {
  for (const a of [0, 1] as const)
    for (const b of [0, 1] as const)
      for (const c of [0, 1] as const)
        for (const d of [0, 1] as const) {
          yield { 0: a, 1: b, 2: c, 3: d };
        }
}

function hashFor(c: Corner): string {
  return `#${KEYS.map((k, i) => `${k}=${c[i as keyof Corner]}`).join("&")}`;
}

function labelFor(c: Corner): string {
  return AXES.map((axis, i) => `${axis}=${c[i as keyof Corner]}`).join("|");
}

const ROUTES = [
  // ADR-0030 retired the live tone toggle, so each route has a single
  // rendering. The corner check still spans the slider hypercube on both /
  // and the in-page #tone block above the manifesto.
  { path: "/", label: "cv" },
  { path: "/#tone", label: "tone" },
] as const;

for (const route of ROUTES) {
  test.describe(`${route.label} (${route.path}) at every corner of the slider hypercube`, () => {
    for (const c of corners()) {
      const label = labelFor(c);
      const slug = `${route.label}-${label.replace(/[^a-z0-9]/gi, "-")}`;

      test(`renders without horizontal overflow — ${route.label} | ${label}`, async ({ page }) => {
        await page.goto(`${route.path}${hashFor(c)}`);
        await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
        await page.waitForTimeout(200);

        const overflow = await page.evaluate(() => {
          const docW = document.documentElement.scrollWidth;
          const winW = document.documentElement.clientWidth;
          return { docW, winW };
        });
        expect(overflow.docW, `horizontal overflow at ${route.label} ${label}`).toBeLessThanOrEqual(
          overflow.winW + 1,
        );

        await page.screenshot({
          path: `tests/e2e/screenshots/corner-${slug}.png`,
          fullPage: true,
        });
      });
    }
  });
}
