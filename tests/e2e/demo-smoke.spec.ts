import { expect, test } from "@playwright/test";

test("demo flow renders decision and download actions", async ({ page }) => {
  let statusChecks = 0;

  await page.route("**/api/engine/requests", async (route) => {
    if (route.request().method() === "POST") {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "req_smoke_001", status: "submitted" }),
      });
      return;
    }

    await route.fallback();
  });

  await page.route("**/api/engine/requests/req_smoke_001", async (route) => {
    statusChecks += 1;
    const status = statusChecks > 1 ? "completed" : "running";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "req_smoke_001", status }),
    });
  });

  await page.route("**/api/engine/requests/req_smoke_001/result", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "req_smoke_001",
        decision: "approved",
        reasons: ["Eligibility and merit thresholds passed."],
        computed_fields: {
          final_score: 92.4,
          priority_group: "financial_support",
        },
      }),
    });
  });

  await page.goto("/demo");
  await expect(
    page.getByRole("heading", { name: "Eligibility evaluation", exact: true }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Run evaluation" }).click();
  await expect(page).toHaveURL(/\/demo\/req_smoke_001/);

  await expect(page.getByRole("heading", { name: "Decision result" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByText("approved")).toBeVisible();
  await expect(page.getByRole("link", { name: "Download JSON" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download CSV" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Download PDF" })).toBeVisible();
});
