// Renders the collab poster (post + story).
// node make.mjs --name "Re thrift" --logo rethrift-logo.png --handle @re.thrift8 [--district "Хан-Уул"] [--symbol vs]
import { chromium } from "playwright";
import { pathToFileURL } from "node:url";
import { mkdirSync } from "node:fs";

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith("--") ? [...a, [v.slice(2), all[i + 1]]] : a), []));
const slug = (args.name || "shop").toLowerCase().replace(/[^a-z0-9а-яөү]+/gi, "-").replace(/^-|-$/g, "");
const out = "/Users/munkhdul/Desktop/thrift/marketing/posters/collabs";
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
for (const [v, h] of [["post", 1350], ["story", 1920]]) {
  const page = await browser.newPage({ viewport: { width: 1080, height: h } });
  const params = new URLSearchParams({ v, name: args.name ?? "", logo: args.logo ?? "", handle: args.handle ?? "", district: args.district ?? "", symbol: args.symbol ?? "x" });
  await page.goto(`${pathToFileURL(new URL("./poster.html", import.meta.url).pathname)}?${params}`);
  await page.evaluate(() => window.ready);
  await page.waitForTimeout(300);
  const sym = args.symbol && args.symbol !== "x" ? `${args.symbol}-` : "";
  const file = `${out}/collab-${slug}-${sym}${v}.png`;
  await page.screenshot({ path: file });
  console.log("✓", file);
  await page.close();
}
await browser.close();
