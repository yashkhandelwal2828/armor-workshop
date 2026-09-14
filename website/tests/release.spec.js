import { test, expect } from "@playwright/test";

async function openWorkshop(page) {
  await page.goto("./");
  await expect(page.locator("#loading")).toHaveClass(/hidden/, {
    timeout: 90000,
  });
}
async function openInventory(page) {
  await page.locator('[data-panel="inventory"]').click();
  await page.locator('[data-category="All"]').click();
  await expect(page.locator("#inventory-count")).toHaveText("69 / 69 parts");
}

test("production subfolder: install, paint, persist, mobile actions, and credits", async ({
  page,
}) => {
  const errors = [];
  const broken = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) broken.push(response.url());
  });
  await openWorkshop(page);
  expect(await page.evaluate(() => typeof window.workshop)).toBe("undefined");
  await page.screenshot({ path: "test-results/release-desktop.png" });
  await openInventory(page);
  await page.locator('[data-inventory="arsenal-helmet-0"]').click();
  await expect(page.locator("#inventory-equip")).toBeInViewport();
  await page.locator("#inventory-equip").click();
  await expect(page.locator("#configuration")).toContainText("Extremis");
  await page.locator('[data-panel="paint"]').click();
  await page.locator('[data-finish="stealth"]').click();
  await page.reload();
  await expect(page.locator("#loading")).toHaveClass(/hidden/, {
    timeout: 90000,
  });
  await expect(page.locator("#configuration")).toContainText("Extremis");
  await page.locator('[data-panel="paint"]').click();
  await page.selectOption("#region", "Helmet");
  await expect(page.locator("#red")).toHaveValue("#263644");
  await page.locator("#reset").click();
  await expect(page.locator("#configuration")).toContainText("Mark VII");
  await page.setViewportSize({ width: 390, height: 844 });
  await openInventory(page);
  await page.locator('[data-inventory="delta-reactor"]').click();
  await expect(page.locator("#inventory-equip")).toBeInViewport();
  await page.locator("#inventory-equip").click();
  await expect(page.locator("#status")).toHaveText("Component installed");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({ path: "test-results/release-mobile.png" });
  await page.locator('[data-panel="view"]').click();
  const download = page.waitForEvent("download");
  await page.locator("#capture").click();
  expect((await download).suggestedFilename()).toMatch(/\.png$/);
  await page.goto("credits.html");
  await expect(
    page.getByRole("heading", { name: "Credits & privacy" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Creative Commons Attribution 4.0 International",
    }),
  ).toHaveAttribute("href", "https://creativecommons.org/licenses/by/4.0/");
  expect(errors).toEqual([]);
  expect(broken).toEqual([]);
});

test("malformed storage and interactions during loading remain recoverable", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() =>
    localStorage.setItem("armor-workshop-v1", '{"paint":{},"equippedKits":42}'),
  );
  await page.route("**/models/*.glb", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });
  await page.goto("./");
  await page.locator('[data-panel="inventory"]').click();
  await page.locator('[data-part-type="Arms"]').click();
  await page.locator("#inventory-next").click();
  await expect(page.locator("#loading")).toHaveClass(/hidden/, {
    timeout: 90000,
  });
  expect(errors).toEqual([]);
});

test("animated cancellation and skip work when audio is unavailable", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.addInitScript(() => {
    window.AudioContext = class {
      constructor() {
        throw new Error("Audio unavailable");
      }
    };
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openWorkshop(page);
  await openInventory(page);
  await page.locator('[data-inventory="arsenal-helmet-0"]').click();
  await page.locator("#inventory-equip").click();
  await expect(page.locator("#assembly-hud")).toBeVisible();
  await page.locator("#assembly-cancel").click();
  await expect(page.locator("#assembly-hud")).toBeHidden();
  await expect(page.locator("#configuration")).toContainText("Mark VII");
  await openInventory(page);
  await page.locator('[data-inventory="arsenal-helmet-0"]').click();
  await page.locator("#inventory-equip").click();
  await page.locator("#assembly-skip").click();
  await expect(page.locator("#configuration")).toContainText("Extremis");
  await expect(page.locator("#assembly-hud")).toBeHidden();
  expect(errors).toEqual([]);
});

test("asset failure offers an actionable retry", async ({ page }) => {
  await page.route("**/models/mark-vii-hd.glb", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible({
    timeout: 90000,
  });
  await expect(page.locator(".dock")).toBeHidden();
});

test("blocked WebGL shows a useful fallback", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  await page.goto("./");
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await expect(page.locator("#loading")).toContainText("WebGL 2");
});
