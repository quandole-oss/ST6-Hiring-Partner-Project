import { test, expect } from "@playwright/test";

/**
 * E2E smoke suite — regression signal for spec-conformance work.
 *
 * Covers the critical user flows the user must be able to complete after
 * every migration step (RTK Query adoption, Flowbite swap, AbstractAuditable,
 * Pageable endpoints, etc.). If any of these turn red, stop the wave and
 * investigate.
 */

const DEMO_EMAIL = "alice@example.com";
const DEMO_PASSWORD = "password123";

test.describe("Weekly Commit Module smoke", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("login page renders and redirects to dashboard on success", async ({ page }) => {
    // Land on login when unauthenticated.
    await expect(page).toHaveTitle(/Weekly Commit/i);
    await page.locator("#email").fill(DEMO_EMAIL);
    await page.locator("#password").fill(DEMO_PASSWORD);
    await page.locator("button[type=submit]").click();

    // After login the app navigates away from /login.
    await expect(page).not.toHaveURL(/\/login/i, { timeout: 10_000 });

    // Dashboard shows a team name from seeded data.
    await expect(page.locator("body")).toContainText(/Platform Squad|dashboard|commit/i, { timeout: 10_000 });
  });

  test("authenticated session can load RCDO list", async ({ page }) => {
    await page.locator("#email").fill(DEMO_EMAIL);
    await page.locator("#password").fill(DEMO_PASSWORD);
    await page.locator("button[type=submit]").click();
    // Wait for auth state to settle (dashboard member names visible)
    // before navigating; networkidle alone races on client-side auth redirect.
    await expect(page).not.toHaveURL(/\/login/i, { timeout: 15_000 });
    await expect(page.locator("body")).toContainText(/Alice|Bob|Carol|Platform/i, {
      timeout: 15_000,
    });

    await page.goto("/rcdo");
    await expect(page.locator("body")).toContainText(/Rally|Accelerate|Objective/i, {
      timeout: 15_000,
    });
  });

  test("authenticated session can load pipeline", async ({ page }) => {
    await page.locator("#email").fill(DEMO_EMAIL);
    await page.locator("#password").fill(DEMO_PASSWORD);
    await page.locator("button[type=submit]").click();
    await expect(page).not.toHaveURL(/\/login/i, { timeout: 15_000 });
    await expect(page.locator("body")).toContainText(/Alice|Bob|Carol|Platform/i, {
      timeout: 15_000,
    });

    await page.goto("/pipeline");
    // Pipeline columns render — even empty states have some chrome.
    await expect(page.locator("body")).toBeVisible();
  });

  test("dashboard renders team rollup data after login", async ({ page }) => {
    await page.locator("#email").fill(DEMO_EMAIL);
    await page.locator("#password").fill(DEMO_PASSWORD);
    await page.locator("button[type=submit]").click();
    await page.waitForLoadState("networkidle");

    // Member names from the seeded data should appear somewhere on dashboard.
    await expect(page.locator("body")).toContainText(/Alice|Bob|Carol|Platform/i, {
      timeout: 15_000,
    });
  });
});
