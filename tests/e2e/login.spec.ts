import { expect, test } from "@playwright/test";

test("login route exposes an accessible sign-in form", async ({ page }) => {
  await page.goto("/login");

  await expect(
    page.getByRole("heading", { name: "Mixi Config" }),
  ).toBeVisible();
  await expect(page.getByText("Sign in to your account")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  await expect(page.getByText("Don't have an account?")).toBeVisible();
});

test("login shows MFA step when required", async ({ page }) => {
  await page.goto("/login");

  // Fill email and password
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByRole("textbox", { name: "Password" }).fill("password123");

  // Mock API to return requiresMfa
  await page.route("**/auth/login", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ requiresMfa: true }),
    }),
  );

  // Submit form
  await page.getByRole("button", { name: "Sign In" }).click();

  // Should show MFA step
  await expect(page.getByText("Security verification")).toBeVisible();
  await expect(page.getByLabel("MFA Code")).toBeVisible();
  await expect(page.getByRole("button", { name: "Verify code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use another account" })).toBeVisible();

  // Click back to email
  await page.getByRole("button", { name: "Use another account" }).click();
  await expect(page.getByText("Sign in to your account")).toBeVisible();
});