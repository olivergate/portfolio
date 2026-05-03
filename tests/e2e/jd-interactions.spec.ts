import { expect, test } from "@playwright/test";

// Locks the core /jd interaction contract:
// - Pre-baked sample JDs render chips instantly (no API call)
// - Clicking a Hit chip scrolls to + pulses the cited bullet
// - Clicking a Miss chip expands the candid framing inline
// - Editorial summary uses the locked phrasing (never a percentage) — ADR-0018
// - Bullet reorder is opt-in and reorders cited bullets to the top — ADR-0019

test.describe("JD adapter — sample JD interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/jd");
    await page.waitForFunction(
      () => document.querySelector('button.chip[aria-label*="Hit:"]') !== null,
    );
  });

  test("editorial summary uses locked phrasing, never a percentage (ADR-0018)", async ({
    page,
  }) => {
    const summary = page.locator("h3", {
      hasText: "Reading the JD as written, this CV lands",
    });
    await expect(summary).toBeVisible();
    const text = (await summary.textContent()) ?? "";
    expect(text).toMatch(/lands \d+ hits?, \d+ stretch(es)?, and \d+ honest gaps?\./);
    expect(text).not.toMatch(/%/);
    expect(text).not.toMatch(/\d+\/\d+/);

    const honestyKicker = page.getByText(
      /Conservative matching — when uncertain, defaults to stretch over hit/i,
    );
    await expect(honestyKicker).toBeVisible();
  });

  test("clicking a Hit chip scrolls to and pulses the cited bullet", async ({ page }) => {
    const beforeY = await page.evaluate(() => window.scrollY);
    expect(beforeY).toBe(0);

    // F3.5: assert the RIGHT bullet pulses, not just any bullet. The default
    // Sustainability sample's r1 chip's first cite is `role:opensc-sole-frontend`
    // (see content/sample-jds.json) — the JD adapter scrolls/pulses that bullet
    // on click. A regression where any bullet pulsed (or the wrong one did)
    // would otherwise pass.
    const firstHit = page.locator('button.chip[aria-label^="Hit:"]').first();
    await firstHit.click();

    await page.waitForFunction(() => window.scrollY > 100);
    const pulsing = page.locator(".bullet-pulse").first();
    await expect(pulsing).toBeVisible();
    await expect(pulsing).toHaveAttribute("data-bullet-id", "opensc-sole-frontend");
  });

  test("clicking a Miss chip expands an italic Fraunces framing inline", async ({ page }) => {
    const missChip = page.locator('button.chip[aria-label^="Honest gap:"]').first();
    await missChip.click();
    const italic = missChip.locator('div[style*="italic"]');
    await expect(italic).toBeVisible();
    const text = (await italic.textContent()) ?? "";
    expect(text.length).toBeGreaterThan(20);
  });

  test("reorder is off by default; toggling on moves cited bullets to top", async ({ page }) => {
    const sw = page.locator(".jd-switch");
    await expect(sw).toHaveAttribute("aria-checked", "false");

    const bulletsBefore = await page
      .locator('article[id^="role-opensc"] [data-bullet-id]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-bullet-id")));

    await sw.click();
    await expect(sw).toHaveAttribute("aria-checked", "true");
    await page.waitForTimeout(600);

    const bulletsAfter = await page
      .locator('article[id^="role-opensc"] [data-bullet-id]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-bullet-id")));

    expect(bulletsAfter).not.toEqual(bulletsBefore);
    // The set is the same — only the order changed (no add/remove).
    expect(new Set(bulletsAfter)).toEqual(new Set(bulletsBefore));
  });

  test("stretch slider strict snap re-colors chips (Sustainability r10 → Miss)", async ({
    page,
  }) => {
    // Default = balanced → 7 hits, 4 stretches, 1 miss.
    let counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 7, stretches: 4, misses: 1 });

    await page.getByRole("button", { name: /strict/i }).click();
    await page.waitForTimeout(300);

    // Strict → r10 ("On-chain provenance / Ethereum") drops to Miss.
    counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 7, stretches: 3, misses: 2 });

    await page.getByRole("button", { name: /generous/i }).click();
    await page.waitForTimeout(300);
    // Generous → all four base-Stretches (r8, r9, r10, r12) become Hit; r11 stays Miss → Stretch.
    counts = await chipCounts(page);
    expect(counts.hits).toBeGreaterThanOrEqual(11);
    expect(counts.misses).toBe(0);
  });

  test("switching sample pill updates chip count and resets reorder", async ({ page }) => {
    // Turn reorder on first.
    await page.locator(".jd-switch").click();
    await expect(page.locator('.jd-switch[aria-checked="true"]')).toBeVisible();

    await page.locator("button.jd-pill", { hasText: /AI startup/i }).click();
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("button.chip")).length === 10,
    );
    const counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 4, stretches: 3, misses: 3 });
    await expect(page.locator('.jd-switch[aria-checked="false"]')).toBeVisible();
  });

  test("privacy disclosure copy is honest (no false 'private to your browser')", async ({
    page,
  }) => {
    const copy = page.getByText(/sent to a server route to score against the CV/i);
    await expect(copy).toBeVisible();
    const tooHonest = page.getByText(/private to your browser; nothing is sent anywhere/i);
    await expect(tooHonest).toHaveCount(0);
  });
});

async function chipCounts(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    hits: document.querySelectorAll('button.chip[aria-label^="Hit:"]').length,
    stretches: document.querySelectorAll('button.chip[aria-label^="Stretch:"]').length,
    misses: document.querySelectorAll('button.chip[aria-label^="Honest gap:"]').length,
  }));
}
