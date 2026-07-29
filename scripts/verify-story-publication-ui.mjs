import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:4173/timeline/";
const storyUrl = new URL("?mode=story-graph", baseUrl).href;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

try {
  await page.goto(storyUrl, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "物語イベント" }).waitFor();
  await page.getByText("物語イベント 公開データ").waitFor();
  await page
    .getByText("公開済みの物語イベントはまだありません")
    .waitFor();

  if ((await page.locator(".story-node").count()) !== 0) {
    throw new Error("Published story view exposed non-published nodes.");
  }
  if (await page.getByText("物語イベント 未レビューパイロット").count()) {
    throw new Error("Published story view exposed the unreviewed pilot label.");
  }
  if (await page.locator(".graph-controls").count()) {
    throw new Error("Empty published story view exposed inactive graph controls.");
  }
  await page.screenshot({
    path: "/tmp/story-published-empty-desktop.png",
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: "networkidle" });
  await page
    .getByText("公開済みの物語イベントはまだありません")
    .waitFor();
  await page.screenshot({
    path: "/tmp/story-published-empty-mobile.png",
    fullPage: true,
  });

  console.log("Published story empty-state browser verification passed.");
} finally {
  await browser.close();
}
