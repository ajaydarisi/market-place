import { expect, test } from "@playwright/test";

import { onboardAs, signUp, uniqueEmail } from "./helpers";

// Journey 1: sign up -> onboard as client -> post a project.
test("client can sign up, onboard, and post a project", async ({ page }) => {
  const email = uniqueEmail("client");
  await signUp(page, email, "Priya", "Client");
  await onboardAs(page, "client");

  await page.goto("/client/post");
  await page.getByRole("button", { name: "Start Blank" }).click();

  // Step 1: Kickoff details
  await page.getByLabel("Project Title").fill("E2E saree boutique storefront");
  await page.getByLabel("Category").click();
  await page.getByRole("option", { name: "Web & Frontend" }).click();
  await page.getByLabel("Business Goal").fill("Sell sarees online with Instagram checkout");
  await page.getByLabel("Project Overview").fill(
    "Build a storefront with product catalog, cart, checkout, and Instagram integration for a boutique.",
  );
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2: Stack & fit
  await page.getByPlaceholder("React, PostgreSQL, API design...").fill("React");
  await page.keyboard.press("Enter");
  await page.getByPlaceholder("Add technology tags or pick from the catalog below...").fill("nextjs");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3: Timeline & budget
  await page.getByLabel("Min Budget (₹)").fill("70000");
  await page.getByLabel("Max Budget (₹)").fill("90000");
  await page.getByLabel(/Estimated Duration/).fill("6");
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4: Review & publish
  await page.getByPlaceholder("Admin dashboard, analytics module, onboarding flow...").fill("Product catalog");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Post Project" }).click();

  await page.waitForURL(/\/client\/projects/, { timeout: 30_000 });
  await expect(page.getByText("E2E saree boutique storefront").first()).toBeVisible();
});
