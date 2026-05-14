/**
 * Axe-core Playwright fixture (Phase 4.5).
 *
 * Centralises the WCAG 2.2 AA tag set so every a11y spec hits the same rules.
 * Tag scope: WCAG 2.0 / 2.1 / 2.2 levels A and AA. We don't pull `wcag2aaa`
 * because Phase 4.5 targets AA as the floor; AAA pulls in rules (e.g.
 * `color-contrast-enhanced`) we don't promise to meet at non-default slider
 * positions.
 *
 * Usage:
 *   import { makeAxeBuilder } from "./fixtures/axe";
 *   const results = await makeAxeBuilder(page).analyze();
 *
 * Add `.include(selector)` per-test to scope to a region; or `.exclude(...)`
 * to drop a known-decorative surface (e.g. the rethemer FAB on `/`, which
 * is verified by its own keyboard tests not by contrast against itself).
 */

import AxeBuilder from "@axe-core/playwright";
import type { Page } from "@playwright/test";

export const WCAG_22_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;

export function makeAxeBuilder(page: Page): AxeBuilder {
  return new AxeBuilder({ page }).withTags([...WCAG_22_AA_TAGS]);
}
