import { expect, test } from "@playwright/test";

// Phase 4 — locks the /lab contract end-to-end:
// - Page header renders with the italic-rust "with LLMs" accent
// - Featured demo is mounted with the live badge + sample pills + transcript
// - Clicking a sample populates the transcript
// - Clicking Run retro shows the 4-step pipeline, then the structured output
//   (route handler is intercepted with a deterministic fallback payload so
//   the test never depends on a live Anthropic call)
// - Three secondary cards render with their gradients and link out

test.describe("/lab — Claude Code retro demo + side projects", () => {
  test("page renders with hero, featured demo, three secondary cards", async ({ page }) => {
    await page.goto("/lab");
    await expect(page.locator(".lab-hero h2")).toContainText("Things I'm building");
    await expect(page.locator(".lab-hero h2 em")).toContainText("with LLMs");
    await expect(page.locator(".lab-demo-shell h2")).toBeVisible();
    await expect(page.locator(".lab-live-badge")).toBeVisible();
    const cards = page.locator(".lab-card");
    await expect(cards).toHaveCount(3);
  });

  test("clicking a sample pill populates the transcript editor", async ({ page }) => {
    await page.goto("/lab");
    const debugPill = page.locator(".lab-sample-pill", { hasText: "Debugging deploy issue" });
    await debugPill.click();
    await expect(debugPill).toHaveAttribute("aria-pressed", "true");
    const ta = page.locator(".lab-transcript");
    const text = (await ta.inputValue()) ?? "";
    expect(text).toContain("ECONNREFUSED");
  });

  test("running a retro shows the loading pipeline, then the output", async ({ page }) => {
    // Intercept /api/retro with a canned fallback payload so the test is
    // deterministic without an Anthropic key.
    await page.route("**/api/retro", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          cached: false,
          retro: {
            wentWell: ["Mock: triaged the diff before the logs."],
            slowed: ["Mock: I didn't write the env-var contract test first."],
            learnings: [
              {
                title: "Mock: Env-var renames need a sweep",
                body: "Mock: PR diffs miss string references; grep before merge.",
              },
            ],
            additions: [],
          },
        }),
      });
    });

    await page.goto("/lab");
    await page.locator(".lab-run-btn").click();

    // Pipeline appears.
    await expect(page.locator(".lab-pipeline")).toBeVisible();

    // Output appears once timer + fetch settle (pipeline runs ~2s).
    await expect(page.locator(".lab-retro")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".lab-retro h3")).toContainText("Reading:");
    await expect(page.locator(".lab-retro-bullets li").first()).toContainText("Mock:");
  });

  test("ratelimit-blocked path renders fallback with paused caption", async ({ page }) => {
    await page.route("**/api/retro", async (route) => {
      await route.fulfill({
        status: 429,
        contentType: "application/json",
        body: JSON.stringify({
          ok: false,
          stage: "ratelimit-blocked",
          detail: "test",
          fallback: {
            sampleId: "debug",
            retro: {
              wentWell: ["Canned: triaged the diff before the logs."],
              slowed: ["Canned: no env-var contract test."],
              learnings: [{ title: "Canned learning", body: "Body text." }],
              additions: [],
            },
          },
        }),
      });
    });

    await page.goto("/lab");
    await page.locator(".lab-run-btn").click();
    await expect(page.locator(".lab-retro")).toBeVisible({ timeout: 5000 });
    await expect(page.locator(".lab-retro-caption")).toContainText("API call paused");
  });
});
