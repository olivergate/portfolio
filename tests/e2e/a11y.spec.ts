import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const SAMPLES = [
  { hash: "", label: "default" },
  { hash: "#d=0&p=0&h=1&m=0", label: "brutalist+dramatic+sparse+static" },
  { hash: "#d=1&p=1&h=0&m=1", label: "refined+flat+dense+kinetic" },
  { hash: "#d=0&p=1&h=1&m=1", label: "refined+dramatic+sparse+kinetic" },
  { hash: "#d=1&p=0&h=0&m=0", label: "brutalist+flat+dense+static" },
];

test.describe("axe a11y at representative slider positions", () => {
  for (const sample of SAMPLES) {
    test(`no violations — ${sample.label}`, async ({ page }) => {
      await page.goto(`/${sample.hash}`);
      await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
      // Kinetic mode reveals fire on IntersectionObserver with up to 600ms
      // stagger plus a 580ms fade-in transition. Wait long enough that all
      // visible reveals have fully resolved before axe samples colors —
      // otherwise it sees mid-fade opacity values and computes false-positive
      // contrast failures.
      await page.waitForTimeout(1600);

      // Scope axe to the CV surface — the slider deck is hardcoded dark and
      // not part of the WCAG AA check for the page content. The deck's own
      // a11y is verified by its keyboard/touch surface (the invisible <input
      // type=range>), not by contrast against itself.
      const results = await new AxeBuilder({ page }).include(".cv-surface").analyze();

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
});
