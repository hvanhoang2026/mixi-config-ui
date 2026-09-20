import { expect, test } from "@playwright/test";

const ACCESS_TOKEN = "eyJhbGciOiJub25lIn0.eyJleHAiOjk5OTk5OTk5OTl9.";

test("debug auth flow", async ({ page }) => {
  const logs: string[] = [];
  page.on("console", (msg) => logs.push(`${msg.type()}: ${msg.text()}`));
  page.on("pageerror", (err) => logs.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) =>
    logs.push(`requestfailed: ${req.url()} ${req.failure()?.errorText}`),
  );
  page.on("response", (res) => {
    if (res.url().includes("w-gateway") || res.url().includes("3100")) {
      logs.push(`response: ${res.status()} ${res.url()}`);
    }
  });

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
      ]),
    }),
  );
  await page.route("**/config/environments", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: "environment-production", name: "Production", code: "prod" },
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
  await page.waitForTimeout(8000);

  // eslint-disable-next-line no-console
  console.log(`FINAL URL: ${page.url()}`);
  // eslint-disable-next-line no-console
  console.log(`SELECTOR COUNT: ${await page.getByTestId("service-selector").count()}`);
  // eslint-disable-next-line no-console
  console.log(`DASHBOARD COUNT: ${await page.getByTestId("dashboard-header").count()}`);
  for (const line of logs) {
    // eslint-disable-next-line no-console
    console.log(line);
  }
  expect(true).toBe(true);
});
