import { expect, test } from "@playwright/test";

// Smoke tests for site-wide nav primitives:
// - Rethemer FAB open/close (click toggle, Escape key, click outside)
// - Blog index renders post cards; post page renders body + back-link
// - Scroll-spy nav active state on /blog routes correctly, and the cross-page
//   `/#cv` jump from /blog lands on the CV section

test.describe("Rethemer FAB — open/close", () => {
  test("click toggle opens panel; Escape closes it; click outside closes it", async ({ page }) => {
    await page.goto("/");
    const toggle = page.locator(".fab-toggle");
    await expect(toggle).toBeVisible();

    // Open by click
    await toggle.click();
    const panel = page.locator(".fab-panel");
    await expect(panel).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0);

    // Re-open and close by clicking outside the FAB root
    await toggle.click();
    await expect(panel).toBeVisible();
    // Click the document body well away from the FAB (top-left corner).
    await page.mouse.click(20, 20);
    await expect(panel).toHaveCount(0);
  });
});

test.describe("Blog — index + post page", () => {
  test("blog index lists at least one card", async ({ page }) => {
    await page.goto("/blog");
    const cards = page.locator(".blog-card");
    await expect(cards.first()).toBeVisible();
    expect(await cards.count()).toBeGreaterThanOrEqual(1);
  });

  test("first post page renders body and back-link returns to /blog", async ({ page }) => {
    await page.goto("/blog");
    const firstLink = page.locator(".blog-card .blog-card-link").first();
    await firstLink.click();

    // Body and back-link should both be present
    await expect(page.locator(".blog-post-body")).toBeVisible();
    const back = page.locator(".blog-post-back");
    await expect(back).toBeVisible();

    await back.click();
    await expect(page).toHaveURL(/\/blog\/?$/);
  });
});

test.describe("Scroll-spy nav — /blog active state + cross-page CV jump", () => {
  test("Blog link is data-active=true on /blog, and clicking CV navigates to /#cv", async ({
    page,
  }) => {
    await page.goto("/blog");

    const blogLink = page.locator('.scrollspy-link[href="/blog"]');
    await expect(blogLink).toHaveAttribute("data-active", "true");

    // Click the CV anchor link — on non-home pages it renders as `/#cv`.
    const cvLink = page.locator('.scrollspy-link[href="/#cv"]');
    await cvLink.click();
    await expect(page).toHaveURL(/\/#cv$/);

    // The CV section should be present on the home page.
    const cvSection = page.locator("#cv");
    await expect(cvSection).toBeVisible();
  });
});
