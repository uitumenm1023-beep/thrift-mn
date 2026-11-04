import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
const out = "/Users/munkhdul/Desktop/thrift/marketing/posters";
const browser = await chromium.launch();
for (const [v, h] of [["post", 1350], ["story", 1920]]) {
  const page = await browser.newPage({ viewport: { width: 1080, height: h } });
  await page.goto(`${pathToFileURL(new URL("./collab.html", import.meta.url).pathname)}?v=${v}`);
  await page.evaluate(() => window.ready);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/thrift-shops-wanted-${v}.png` });
  await page.close();
}
await browser.close();
console.log("✓ posters");
