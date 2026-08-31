import { expect, test } from "@playwright/test";

test("login route exposes an accessible sign-in form", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Password" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  await expect(page.getByText("Need an account?")).toHaveCount(0);
});
