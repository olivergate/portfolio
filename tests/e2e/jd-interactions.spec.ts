import { expect, test } from "@playwright/test";

// Locks the core JD adapter interaction contract on the consolidated page:
// - Pre-baked sample JDs render chips instantly (no API call)
// - Clicking a Hit chip scrolls to + pulses the canonical CV bullet up-page (ADR-0029)
// - Clicking a Miss chip expands the candid framing inline
// - Editorial summary uses the locked phrasing (never a percentage) — ADR-0018
// - Bullets always render in original (chronological) order — ADR-0027 supersedes ADR-0019

test.describe("JD adapter — sample JD interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/#jd");
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
      /Conservative matching: when uncertain, defaults to stretch over hit/i,
    );
    await expect(honestyKicker).toBeVisible();
  });

  test("clicking a Hit chip scrolls to and pulses the cited bullet", async ({ page }) => {
    // The default Sustainability sample's r1 chip's first cite is
    // role:opensc-sole-frontend (see content/sample-jds.json). After ADR-0029
    // the chip click resolves to the canonical CV bullet — the only place
    // that data-bullet-id now lives.
    const firstHit = page.locator('button.chip[aria-label^="Hit:"]').first();
    await firstHit.click();

    const target = page.locator('[data-bullet-id="opensc-sole-frontend"]').first();
    await expect(target).toBeVisible();
    await expect(target).toHaveClass(/bullet-pulse/);
  });

  test("clicking a Miss chip expands an italic Fraunces framing inline", async ({ page }) => {
    const missChip = page.locator('button.chip[aria-label^="Honest gap:"]').first();
    await missChip.click();
    const italic = missChip.locator('div[style*="italic"]');
    await expect(italic).toBeVisible();
    const text = (await italic.textContent()) ?? "";
    expect(text.length).toBeGreaterThan(20);
  });

  test("bullets render in original (chronological) order — ADR-0027", async ({ page }) => {
    // The reorder toggle was removed. Bullets must always render in the order
    // they appear in cv.json — never re-sorted by hit/stretch/miss.
    const reorderSwitch = page.locator(".jd-switch");
    await expect(reorderSwitch).toHaveCount(0);

    // For role.opensc, the original order in cv.json starts with these IDs:
    const bullets = await page
      .locator('article[id^="role-opensc"] [data-bullet-id]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-bullet-id")));
    expect(bullets[0]).toBe("opensc-sole-frontend");
  });

  test("stretch slider keeps the Miss floor fixed across readings (ADR-0017 / ADR-0042)", async ({
    page,
  }) => {
    // Default = balanced → 7 hits, 4 stretches, 1 honest gap.
    let counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 7, stretches: 4, misses: 1 });

    await page.getByRole("button", { name: /strict/i }).click();
    await page.waitForTimeout(300);

    // Strict tightens only the Hit/Stretch line — it must NEVER harden a
    // Stretch into a Miss. This JD has no strict Hit→Stretch override, so the
    // reading is unchanged; crucially the honest-gap count does not grow.
    counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 7, stretches: 4, misses: 1 });

    await page.getByRole("button", { name: /generous/i }).click();
    await page.waitForTimeout(300);
    // Generous promotes three borderline Stretches to Hit, but the honest gap
    // ("Set hiring bar / formal hiring authority") STAYS a gap — a Miss is
    // never softened into a Stretch by sliding (the floor is fixed, ADR-0017).
    // Misses stays 1, not 0.
    counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 10, stretches: 1, misses: 1 });
  });

  test("switching sample pill updates chip count", async ({ page }) => {
    await page.locator("button.jd-pill", { hasText: /AI startup/i }).click();
    await page.waitForFunction(
      () => Array.from(document.querySelectorAll("button.chip")).length === 10,
    );
    const counts = await chipCounts(page);
    expect(counts).toEqual({ hits: 3, stretches: 4, misses: 3 });
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
