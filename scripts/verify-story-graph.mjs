import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5173/timeline/";
const storyUrl = new URL("?mode=story-graph", baseUrl).href;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(storyUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "物語イベント" }).waitFor();

  const nodes = page.locator(".story-node");
  const edges = page.locator(".story-edge__hit");
  if ((await nodes.count()) !== 11) {
    throw new Error(`Expected 11 story nodes, received ${await nodes.count()}.`);
  }
  if ((await edges.count()) !== 10) {
    throw new Error(`Expected 10 story edges, received ${await edges.count()}.`);
  }

  await nodes.first().click();
  if (!page.url().includes("node=block_")) {
    throw new Error("Node selection was not reflected in the URL.");
  }
  await page.getByText("STORY BLOCK").waitFor();
  await page.goBack();
  await page.waitForFunction(() => !new URL(location.href).searchParams.has("node"));

  await edges.first().click({ force: true });
  if (!page.url().includes("edge=edge_")) {
    throw new Error("Edge selection was not reflected in the URL.");
  }
  await page.getByText("STORY EDGE").waitFor();
  await page.getByRole("button", { name: "詳細を閉じる" }).click();

  const search = page.getByPlaceholder("話、シリーズ、人物");
  await search.fill("おでん");
  if ((await nodes.count()) !== 1) {
    throw new Error("Story search did not reduce the graph to one node.");
  }
  await search.fill("");
  await page.waitForTimeout(100);

  const categoryFilter = page.locator(".story-filters select").nth(0);
  const characterFilter = page.locator(".story-filters select").nth(1);
  await categoryFilter.selectOption("support");
  if ((await nodes.count()) !== 1) {
    throw new Error("Category filter did not reduce the graph to one node.");
  }
  await categoryFilter.selectOption("all");
  await characterFilter.selectOption("saki_hanami");
  if ((await nodes.count()) !== 3) {
    throw new Error("Character filter did not show the three matching nodes.");
  }
  await characterFilter.selectOption("all");
  await page.waitForTimeout(100);

  const stage = page.locator(".story-stage");
  const transformBeforePan = await stage.getAttribute("style");
  const viewportBox = await page.locator(".story-viewport").boundingBox();
  await page.mouse.move(viewportBox.x + 30, viewportBox.y + viewportBox.height - 80);
  await page.mouse.down();
  await page.mouse.move(
    viewportBox.x + 90,
    viewportBox.y + viewportBox.height - 120,
  );
  await page.mouse.up();
  const transformAfterPan = await stage.getAttribute("style");
  if (transformBeforePan === transformAfterPan) {
    throw new Error("Pointer drag did not pan the graph.");
  }

  const zoomOutput = page.getByLabel("拡大率");
  const beforeZoom = await zoomOutput.textContent();
  await page.getByRole("button", { name: "拡大" }).click();
  await page.waitForTimeout(100);
  const afterZoom = await zoomOutput.textContent();
  if (beforeZoom === afterZoom) {
    throw new Error(
      `Zoom control did not change the scale (${beforeZoom} -> ${afterZoom}).`,
    );
  }

  await nodes.first().focus();
  await page.keyboard.press("ArrowDown");
  if (!page.url().includes("node=block_")) {
    throw new Error("Keyboard graph navigation did not select a node.");
  }

  await page.screenshot({
    path: "/tmp/story-graph-desktop.png",
    fullPage: true,
  });

  const selectedUrl = page.url();
  await page.reload({ waitUntil: "networkidle" });
  if (page.url() !== selectedUrl || !(await page.getByText("STORY BLOCK").isVisible())) {
    throw new Error("Direct URL selection did not restore after reload.");
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page.screenshot({
    path: "/tmp/story-graph-mobile.png",
    fullPage: true,
  });

  await page.getByLabel("表示するタイムライン").selectOption("narrative");
  await page.locator(".timeline-frame").waitFor();
  await page.screenshot({
    path: "/tmp/narrative-mobile.png",
    fullPage: true,
  });
  await page.getByLabel("表示するタイムライン").selectOption("story-graph");
  await page.getByRole("heading", { name: "物語イベント" }).waitFor();
  await page.getByLabel("表示するタイムライン").selectOption("realworld");
  await page.getByRole("heading", { name: "学マス情報史" }).waitFor();
  await page.getByLabel("表示するタイムライン").selectOption("story-graph");
  await page.getByRole("heading", { name: "物語イベント" }).waitFor();

  console.log("Story graph browser verification passed.");
} finally {
  await browser.close();
}
