import { expect, type Page } from "@playwright/test";

export function uniqueEmail(prefix: string) {
  return `e2e-${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}@example.com`;
}

export const PASSWORD = "E2e-test-password-1";

export async function signUp(page: Page, email: string, firstName: string, lastName: string) {
  await page.goto("/auth");
  await page.getByTestId("signup-tab").click();
  await page.getByTestId("signup-firstname-input").fill(firstName);
  await page.getByTestId("signup-lastname-input").fill(lastName);
  await page.getByTestId("signup-email-input").fill(email);
  await page.getByTestId("signup-password-input").fill(PASSWORD);
  // Turnstile test key auto-passes; give the widget a moment to issue a token.
  await expect(page.getByTestId("signup-submit-button")).toBeEnabled({ timeout: 15_000 });
  await page.getByTestId("signup-submit-button").click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 30_000 });
}

export async function onboardAs(page: Page, role: "client" | "developer") {
  await page.waitForURL(/\/onboarding/, { timeout: 30_000 });
  await page.getByTestId(`onboarding-role-${role}-radio`).click();
  if (role === "developer") {
    await page.getByTestId("onboarding-headline-input").fill("Full-stack developer (e2e)");
    await page.getByTestId("onboarding-skills-input").locator("input").fill("React");
    await page.keyboard.press("Enter");
  }
  await page.getByTestId("onboarding-submit-button").click();
  await page.waitForURL(role === "client" ? /\/client\/projects/ : /\/developer\/browse/, { timeout: 30_000 });
}

export async function signOut(page: Page) {
  await page.context().clearCookies();
  await page.goto("/auth");
}
