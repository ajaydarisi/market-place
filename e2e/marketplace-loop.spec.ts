import { expect, test, type Page } from "@playwright/test";

import { PASSWORD, onboardAs, signOut, signUp, uniqueEmail } from "./helpers";

async function postMinimalProject(page: Page, title: string): Promise<string> {
  await page.goto("/client/post");
  await page.getByRole("button", { name: "Start Blank" }).click();
  await page.getByLabel("Project Title").fill(title);
  await page.getByLabel("Category").click();
  await page.getByRole("option", { name: "Web & Frontend" }).click();
  await page.getByLabel("Business Goal").fill("Ship the storefront and grow online sales");
  await page.getByLabel("Project Overview").fill(
    "Build a storefront with catalog, cart, and checkout. This overview is long enough to validate.",
  );
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByPlaceholder("React, PostgreSQL, API design...").fill("React");
  await page.keyboard.press("Enter");
  await page.getByPlaceholder("Add technology tags or pick from the catalog below...").fill("nextjs");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Min Budget (₹)").fill("50000");
  await page.getByLabel("Max Budget (₹)").fill("80000");
  await page.getByLabel(/Estimated Duration/).fill("4");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByPlaceholder("Admin dashboard, analytics module, onboarding flow...").fill("Storefront");
  await page.keyboard.press("Enter");
  await page.getByRole("button", { name: "Post Project" }).click();
  await page.waitForURL(/\/client\/projects/, { timeout: 30_000 });

  await page.getByText(title).first().click();
  await page.waitForURL(/\/projects\/\d+/, { timeout: 30_000 });
  return page.url();
}

async function signIn(page: Page, email: string) {
  await page.goto("/auth");
  await page.getByTestId("signin-tab").click();
  await page.getByTestId("signin-email-input").fill(email);
  await page.getByTestId("signin-password-input").fill(PASSWORD);
  await expect(page.getByTestId("signin-submit-button")).toBeEnabled({ timeout: 15_000 });
  await page.getByTestId("signin-submit-button").click();
  await page.waitForURL(/\/(dashboard|client|developer)/, { timeout: 30_000 });
}

// Journey 2: the full marketplace loop — post, propose, accept.
test("developer proposes and client accepts", async ({ page }) => {
  const clientEmail = uniqueEmail("client");
  const developerEmail = uniqueEmail("dev");
  const title = `E2E loop project ${Date.now()}`;

  // Client posts a project.
  await signUp(page, clientEmail, "Rohan", "Client");
  await onboardAs(page, "client");
  const projectUrl = await postMinimalProject(page, title);

  // Developer applies.
  await signOut(page);
  await signUp(page, developerEmail, "Meera", "Developer");
  await onboardAs(page, "developer");
  await page.goto(projectUrl);
  await page.getByRole("button", { name: "Apply Now" }).click();
  await page
    .getByPlaceholder("Explain why you're a strong fit, how you'd approach the work, and any delivery assumptions.")
    .fill("I have shipped three similar storefronts and can start this week.");
  await page.getByRole("button", { name: "Submit Proposal" }).click();
  await expect(page.getByRole("button", { name: "Proposal Submitted" })).toBeVisible({ timeout: 30_000 });

  // Client accepts the proposal.
  await signOut(page);
  await signIn(page, clientEmail);
  await page.goto(projectUrl);
  await page.getByRole("button", { name: "Assign" }).first().click();
  await page.getByRole("button", { name: "Confirm Assignment" }).click();
  await expect(page.getByText("accepted").first()).toBeVisible({ timeout: 30_000 });

  // Developer sees the acceptance in the notification bell.
  await signOut(page);
  await signIn(page, developerEmail);
  await page.getByTestId("notification-bell").first().click();
  await expect(page.getByText(/was accepted/).first()).toBeVisible({ timeout: 30_000 });
});
