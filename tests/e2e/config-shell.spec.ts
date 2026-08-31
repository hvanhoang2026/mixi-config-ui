import { expect, test } from "@playwright/test";

const ACCESS_TOKEN = "eyJhbGciOiJub25lIn0.eyJleHAiOjk5OTk5OTk5OTl9.";

test("config shell shows Mixi branding and submenu icons", async ({ page }) => {
  await page.addInitScript(
    ({ accessToken }) => {
      window.localStorage.setItem(
        "mixi-config-auth",
        JSON.stringify({
          accessToken,
          refreshToken: "e2e-refresh-token",
          remember: true,
          user: {
            id: "e2e-user",
            email: "admin@mixi.test",
            fullName: "Mixi Admin",
            roles: ["SUPERADMIN"],
          },
        }),
      );
    },
    { accessToken: ACCESS_TOKEN },
  );

  await page.route("**/api/**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });
  await page.goto("/config-center");

  await expect(page.locator('img[src*="mixi-logo.svg"]')).toBeVisible();
  await expect(page.locator(".mixi-config-submenu-label")).toHaveCount(7);
  await expect(
    page.locator(".mixi-config-submenu-label__icon svg"),
  ).toHaveCount(7);
});
