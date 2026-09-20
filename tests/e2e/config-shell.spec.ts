import { expect, test } from "@playwright/test";

const ACCESS_TOKEN = "eyJhbGciOiJub25lIn0.eyJleHAiOjk5OTk5OTk5OTl9.";

test("config shell shows Mixi branding and navigation items", async ({
  page,
}) => {
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
  if ((page.viewportSize()?.width ?? 0) < 768) {
    await expect(
      page.getByRole("button", { name: "open navigation menu" }),
    ).toBeVisible();
  } else {
    for (const label of [
      "Config Center",
      "Mixi Admin",
      "Dashboard",
      "Services",
      "Environments",
      "Service Configs",
      "Runtime & History",
      "Projects",
    ]) {
      await expect(
        page.getByRole("navigation").getByText(label, { exact: true }).first(),
      ).toBeVisible();
    }
  }
});

test("service form allows changing project and service type", async ({
  page,
}) => {
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

  await page.route("**/auth/users/me", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        profile: { id: "e2e-user", roles: ["SUPERADMIN"] },
      }),
    }),
  );
  await page.route("**/config/projects", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "project-auth", name: "Auth", code: "auth" },
        { id: "project-ecm", name: "ECM", code: "ecm" },
      ]),
    }),
  );
  await page.route("**/config/services", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        {
          id: "service-auth",
          projectId: "project-auth",
          name: "Auth API",
          code: "auth-api",
          type: "backend",
        },
        {
          id: "service-ecm",
          projectId: "project-ecm",
          name: "ECM API",
          code: "ecm-api",
          type: "backend",
        },
      ]),
    }),
  );
  await page.route("**/config/environments", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "environment-production", name: "Production", code: "prod" },
        { id: "environment-staging", name: "Staging", code: "staging" },
      ]),
    }),
  );
  await page.route("**/config/dashboard", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );
  await page.route("**/config/configs/service/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  await page.goto("/config-center");

  const serviceSelector = page.getByTestId("service-selector");
  await serviceSelector.click();
  await page.getByRole("option", { name: "ECM API" }).click();
  await expect(serviceSelector).toContainText("ECM API");

  const environmentSelector = page.getByTestId("environment-selector");
  await environmentSelector.click();
  await page.getByRole("option", { name: "Staging" }).click();
  await expect(environmentSelector).toContainText("Staging");

  if ((page.viewportSize()?.width ?? 0) < 768) return;

  await page
    .getByRole("navigation")
    .getByRole("button", { name: "Services", exact: true })
    .click();
  await page.getByTestId("add-new-button").click();

  const projectSelect = page.locator(
    '[data-testid="entity-project"] select',
  );
  await projectSelect.selectOption("project-ecm");
  await expect(projectSelect).toHaveValue("project-ecm");

  const typeSelect = page.locator('[data-testid="entity-type"] select');
  await typeSelect.selectOption("frontend");
  await expect(typeSelect).toHaveValue("frontend");

  await page.reload();
  await expect(page).toHaveURL(/\/config-center\/service$/);
  await expect(page.getByTestId("entity-section-service")).toBeVisible();
});
