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
