import { expect, test } from "@playwright/test";

// Locks the honesty guardrail: the SATIRE chip must be present whenever the
// Absurd voice is showing, and the banner must NOT appear in any other tone.
// See ADR-0013 for the broader pre-written-vs-live-API decision.

test.describe("satire banner appears only when tone is Absurd", () => {
  test("not in DOM when tone is Honest (default)", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
    await page.waitForTimeout(200);

    await expect(page.locator(".satire-banner")).toHaveCount(0);
  });

  test("not in DOM when tone is Pessimistic", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
    await page.waitForTimeout(200);

    await page.getByRole("tab", { name: "Pessimistic" }).click();
    await page.waitForTimeout(400);

    await expect(page.locator(".satire-banner")).toHaveCount(0);
  });

  test("present and visible with SATIRE chip when tone is Absurd", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
    await page.waitForTimeout(200);

    await page.getByRole("tab", { name: "Absurd" }).click();
    await page.waitForTimeout(400);

    const banner = page.locator(".satire-banner");
    await expect(banner).toBeVisible();
    // The SATIRE chip is non-negotiable — locks the honesty guardrail.
    await expect(banner.locator(".satire-banner__chip")).toHaveText("SATIRE");
  });

  test("disappears again after switching back to Honest", async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => document.querySelector(".cv-surface") !== null);
    await page.waitForTimeout(200);

    await page.getByRole("tab", { name: "Absurd" }).click();
    await page.waitForTimeout(400);
    await expect(page.locator(".satire-banner")).toBeVisible();

    await page.getByRole("tab", { name: "Honest" }).click();
    await page.waitForTimeout(400);
    await expect(page.locator(".satire-banner")).toHaveCount(0);
  });
});
