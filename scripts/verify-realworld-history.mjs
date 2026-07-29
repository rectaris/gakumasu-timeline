import { chromium } from "playwright";

const [devBase = "http://127.0.0.1:5173/timeline/", productionBase =
  "http://127.0.0.1:4173/timeline/"] = process.argv.slice(2);
const browser = await chromium.launch({ headless: true });

async function verifyDevelopment() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${devBase}?mode=realworld`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "学マス情報史", exact: true }).waitFor();
  const items = page.locator(".realworld-item");
  if ((await items.count()) !== 5) {
    throw new Error(`Development view expected 5 items, got ${await items.count()}.`);
  }
  await page.getByLabel("カテゴリ").selectOption("music");
  if ((await items.count()) !== 1) throw new Error("Category filtering failed.");
  await page.getByRole("button", { name: "条件を解除" }).click();
  await page.getByRole("button", { name: "『学園アイドルマスター』配信開始", exact: false }).click();
  if (!new URL(page.url()).searchParams.get("item")) {
    throw new Error("Item selection was not restored to the URL.");
  }
  await page.getByRole("heading", { name: "『学園アイドルマスター』配信開始" }).waitFor();
  await page.screenshot({ path: "/tmp/realworld-history-desktop.png", fullPage: true });
  await page.close();
}

async function verifyProduction() {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(`${productionBase}?mode=realworld`, { waitUntil: "networkidle" });
  const items = page.locator(".realworld-item");
  if ((await items.count()) !== 1) {
    throw new Error(`Production view expected 1 published item, got ${await items.count()}.`);
  }
  if (await page.getByText("検証用ストーリー公開").count()) {
    throw new Error("Production UI contains unreviewed data.");
  }
  await items.first().click();
  await page.locator(".realworld-detail").waitFor();
  await page.screenshot({ path: "/tmp/realworld-history-mobile.png", fullPage: true });
  await page.close();
}

try {
  await verifyDevelopment();
  await verifyProduction();
  console.log("Real-world history browser verification passed.");
} finally {
  await browser.close();
}
