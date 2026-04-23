import { createBdd } from "playwright-bdd";
import { expect } from "@playwright/test";

/**
 * BDD step definitions for the Weekly Commit Module e2e suite.
 * Cucumber-style Gherkin -> Playwright steps via playwright-bdd.
 */

const { Given, When, Then } = createBdd();

Given("I am on the login page", async ({ page }) => {
  await page.goto("/");
});

Given("I am signed in as {string}", async ({ page }, email: string) => {
  await page.goto("/");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill("password123");
  await page.locator("button[type=submit]").click();
  // Wait until the URL no longer looks like the login route AND a seeded member
  // name appears — either signal alone is racy on networkidle-only waits.
  await expect(page).not.toHaveURL(/\/login/i, { timeout: 15_000 });
  await expect(page.locator("body")).toContainText(/Alice|Bob|Carol|Platform/i, {
    timeout: 15_000,
  });
});

When("I fill in {string} for email", async ({ page }, value: string) => {
  await page.locator("#email").fill(value);
});

When("I fill in {string} for password", async ({ page }, value: string) => {
  await page.locator("#password").fill(value);
});

When("I submit the login form", async ({ page }) => {
  await page.locator("button[type=submit]").click();
});

When("I navigate to the RCDO page", async ({ page }) => {
  await page.goto("/rcdo");
});

Then("I should see the dashboard", async ({ page }) => {
  await expect(page).not.toHaveURL(/\/login/i, { timeout: 10_000 });
  await expect(page.locator("body")).toContainText(/Alice|Bob|Carol|Platform/i, {
    timeout: 15_000,
  });
});

Then("I should see a rally cry in the list", async ({ page }) => {
  await expect(page.locator("body")).toContainText(/Rally|Accelerate|Objective/i, {
    timeout: 10_000,
  });
});
