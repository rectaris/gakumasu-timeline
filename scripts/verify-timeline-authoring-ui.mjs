import assert from "node:assert/strict";
import { chromium } from "playwright";
import { createServer } from "vite";

const requestItem = {
  id: "request-1",
  targetLaneId: "saki_hanami",
  event: {
    id: "submitted_event",
    start: { year: 1, month: 4, day: 1 },
    end: { year: 1, month: 4, day: 1 },
    title: "審査対象イベント",
    detail: "審査対象の詳細",
    occurrenceType: "singleWithinRange",
    participants: ["saki_hanami"],
  },
  status: "submitted",
  version: 1,
  submittedAt: Date.now(),
  updatedAt: Date.now(),
  review: null,
};

function boxesOverlap(first, second) {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

async function newPage(browser, baseUrl, roles, options = {}) {
  const context = await browser.newContext({ viewport: options.viewport });
  const page = await context.newPage();
  const runtimeErrors = [];
  const applicationOrigin = new URL(baseUrl).origin;
  const isApplicationUrl = (value) => {
    if (!value) return true;
    try {
      return new URL(value).origin === applicationOrigin;
    } catch {
      return false;
    }
  };
  page.on("pageerror", (error) => runtimeErrors.push(`page: ${error.message}`));
  page.on("requestfailed", (request) => {
    if (isApplicationUrl(request.url())) {
      runtimeErrors.push(
        `request: ${request.url()} ${request.failure()?.errorText ?? "failed"}`,
      );
    }
  });
  page.on("console", (entry) => {
    const entryUrl = entry.location().url;
    const expectedAuthoringStatus =
      options.meStatus && entryUrl.endsWith("/api/authoring/me");
    const expectedLogoutStatus =
      options.logoutStatus && entryUrl.endsWith("/auth/logout");
    if (
      entry.type() === "error" &&
      isApplicationUrl(entryUrl) &&
      !expectedAuthoringStatus &&
      !expectedLogoutStatus
    ) {
      runtimeErrors.push(`console: ${entry.text()}`);
    }
  });
  let submitted = false;
  let sessionAuthenticated =
    options.sessionAuthenticated ?? (roles.length > 0);
  await page.route("**/auth/session", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ authenticated: sessionAuthenticated }),
    }),
  );
  await page.route("**/auth/logout", (route) => {
    const status = options.logoutStatus ?? 200;
    if (status < 400) sessionAuthenticated = false;
    return route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify({ loggedOut: status < 400 }),
    });
  });
  await page.route("**/api/authoring/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.pathname.endsWith("/me")) {
      const status = options.meStatus ?? 200;
      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(
          status === 200
            ? { authenticated: true, roles }
            : {
                error: {
                  code: status === 401 ? "authentication_required" : "authoring_unavailable",
                  message: "Unavailable",
                },
              },
        ),
      });
      return;
    }
    if (url.searchParams.get("scope") === "mine") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ requests: submitted ? [requestItem] : [] }),
      });
      return;
    }
    if (url.searchParams.get("scope") === "review") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ requests: [requestItem] }),
      });
      return;
    }
    if (request.method() === "POST" && url.pathname.endsWith("/requests")) {
      submitted = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ request: { id: requestItem.id, status: "submitted" } }),
      });
      return;
    }
    if (request.method() === "POST" && url.pathname.endsWith("/decision")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ request: { id: requestItem.id, status: "approved", version: 2 } }),
      });
      return;
    }
    await route.fulfill({ status: 404, body: "{}" });
  });
  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  return {
    context,
    page,
    assertClean: () => assert.deepEqual(runtimeErrors, []),
  };
}

const server = await createServer({
  logLevel: "error",
  server: { host: "127.0.0.1", port: 0 },
});

let browser;
try {
  await server.listen();
  const baseUrl = server.resolvedUrls?.local[0];
  if (!baseUrl) throw new Error("Vite did not expose a local verification URL.");
  browser = await chromium.launch({ headless: true });

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, [], { meStatus: 401 });
    await page.waitForTimeout(100);
    assert.equal(await page.locator("[data-authoring-control]").count(), 0);
    assertClean();
    await context.close();
  }

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, ["contributor"]);
    const launcher = page.getByRole("button", { name: "イベントを投稿" });
    await launcher.waitFor();
    await launcher.click();
    await page.getByLabel("イベントID").fill("ui_test_event");
    await page.getByLabel("タイトル").fill("UI投稿テスト");
    await page.getByRole("textbox", { name: "詳細", exact: true }).fill("投稿済み状態の確認");
    await page.getByRole("button", { name: "審査へ送る" }).click();
    await page.getByText("投稿を受け付けました。公開には審査とGitへの反映が必要です。").waitFor();
    assert.equal(
      await page.locator('[data-request-status="submitted"]').count(),
      1,
    );
    assertClean();
    await context.close();
  }

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, ["reviewer"]);
    await page.getByRole("button", { name: "審査", exact: true }).click();
    await page.getByRole("heading", { name: "審査対象イベント", exact: true }).waitFor();
    await page.getByRole("button", { name: "承認", exact: true }).click();
    await page.getByText("承認済み").waitFor();
    await page.getByText("承認しました。Gitへの反映後に公開されます。").waitFor();
    assertClean();
    await context.close();
  }

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, ["contributor"], {
      logoutStatus: 500,
    });
    await page.getByRole("button", { name: "ログイン済み。アカウントメニューを開く" }).click();
    await page.getByRole("button", { name: "ログアウト", exact: true }).click();
    await page.locator(".account-control__error").getByText(
      "ログアウトできませんでした。もう一度お試しください。",
      { exact: true },
    ).waitFor();
    assert.equal(await page.locator("[data-authoring-control]").count(), 1);
    assertClean();
    await context.close();
  }

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, ["admin"]);
    await page.getByRole("button", { name: "イベントを投稿" }).click();
    await page.getByRole("dialog", { name: "タイムラインへ投稿" }).waitFor();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "ログイン済み。アカウントメニューを開く" }).click();
    await page.getByRole("button", { name: "ログアウト", exact: true }).click();
    await page.getByRole("link", { name: "ログインページへ移動" }).waitFor();
    assert.equal(await page.locator("[data-authoring-control]").count(), 0);
    assert.equal(await page.getByRole("dialog", { name: "タイムラインへ投稿" }).count(), 0);
    assertClean();
    await context.close();
  }

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, [], { meStatus: 503 });
    await page.locator('[data-authoring-state="unavailable"]').waitFor();
    assert.equal(await page.locator("[data-authoring-control]").count(), 0);
    assertClean();
    await context.close();
  }

  {
    const { context, page, assertClean } = await newPage(browser, baseUrl, ["admin"], {
      viewport: { width: 375, height: 812 },
    });
    const contributionLauncher = page.getByRole("button", { name: "イベントを投稿" });
    const reviewLauncher = page.getByRole("button", { name: "審査", exact: true });
    const zoomPanel = page.getByRole("region", { name: "ズーム操作エリア" });
    await Promise.all([
      contributionLauncher.waitFor(),
      reviewLauncher.waitFor(),
      zoomPanel.waitFor(),
    ]);
    const contributionBox = await contributionLauncher.boundingBox();
    const reviewBox = await reviewLauncher.boundingBox();
    const zoomBox = await zoomPanel.boundingBox();
    assert.ok(contributionBox && reviewBox && zoomBox);
    assert.equal(
      boxesOverlap(contributionBox, reviewBox),
      false,
      `authoring launchers overlap: ${JSON.stringify({ contributionBox, reviewBox })}`,
    );
    assert.equal(
      boxesOverlap(contributionBox, zoomBox),
      false,
      `contribution launcher overlaps zoom: ${JSON.stringify({ contributionBox, zoomBox })}`,
    );
    assert.equal(
      boxesOverlap(reviewBox, zoomBox),
      false,
      `review launcher overlaps zoom: ${JSON.stringify({ reviewBox, zoomBox })}`,
    );
    await contributionLauncher.click();
    const box = await page.getByRole("dialog", { name: "タイムラインへ投稿" }).boundingBox();
    assert.ok(box && box.x === 0 && box.width <= 375 && box.height <= 756);
    if (process.env.TIMELINE_AUTHORING_SCREENSHOT) {
      await page.screenshot({
        path: process.env.TIMELINE_AUTHORING_SCREENSHOT,
        fullPage: true,
      });
    }
    await page.keyboard.press("Escape");
    assert.equal(
      await page.getByRole("dialog", { name: "タイムラインへ投稿" }).count(),
      0,
    );
    assertClean();
    await context.close();
  }

  console.log("Timeline authoring UI verification passed for anonymous, contributor, reviewer, logout, failure, and 375x812 states.");
} finally {
  await browser?.close();
  await server.close();
}
