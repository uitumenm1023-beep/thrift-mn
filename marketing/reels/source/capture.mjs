// Captures the live site (desktop + phone) for the promo video.
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const BASE = process.env.BASE || "https://thrift-mn.vercel.app";
const OUT = new URL("./shots/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });
const PRODUCT = "/products/00000000-0000-4000-8000-000000003001";

const browser = await chromium.launch();
const meta = {};

/** Load a page, trigger lazy images, hide "Демо" labels (ads shouldn't say demo). */
async function open(ctx, path) {
  const page = await ctx.newPage();
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll("nextjs-portal").forEach((n) => n.remove()); // dev-only badge
    // Hide demo badges / notes.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const n of nodes) {
      const t = n.textContent ?? "";
      if (t.trim() === "Демо") n.parentElement.style.display = "none";
      else if (t.includes(" · Демо")) n.textContent = t.replace(" · Демо", "");
      else if (/\(демо\)/i.test(t)) n.parentElement.style.display = "none";
    }
    // Stop the ticker and entrance animations so frames are stable.
    const st = document.createElement("style");
    st.textContent = "*{animation-play-state:paused!important;transition:none!important}";
    document.head.appendChild(st);
  });
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(600);
  return page;
}

// ---------- Desktop ----------
const desk = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
for (const [name, path] of [["desk-home", "/"], ["desk-products", "/products"], ["desk-shops", "/shops"], ["desk-shop", "/shops/00000000-0000-4000-8000-000000002001"]]) {
  const p = await open(desk, path);
  await p.screenshot({ path: `${OUT}${name}.png`, fullPage: true });
  meta[name] = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
  await p.close();
}

// ---------- Phone ----------
const phone = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
for (const [name, path] of [["mob-home", "/"], ["mob-products", "/products"], ["mob-shops", "/shops"]]) {
  const p = await open(phone, path);
  await p.screenshot({ path: `${OUT}${name}.png`, fullPage: true });
  meta[name] = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
  await p.close();
}
// Product page + where the contact buttons are.
{
  const p = await open(phone, PRODUCT);
  await p.screenshot({ path: `${OUT}mob-product.png`, fullPage: true });
  meta["mob-product"] = await p.evaluate(() => {
    const a = [...document.querySelectorAll("a")].find((x) => x.textContent.includes("Instagram-аар"));
    const tel = [...document.querySelectorAll("a")].find((x) => x.textContent.includes("Утсаар"));
    const r1 = a.getBoundingClientRect(), r2 = tel.getBoundingClientRect();
    return { w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight,
      contact: { top: r1.top + scrollY, bottom: r2.bottom + scrollY, left: r1.left, right: r1.right } };
  });
  await p.close();
}
// Filter drawer open (viewport only).
{
  const p = await open(phone, "/products");
  // Un-freeze animations so the drawer can slide in, then open it.
  await p.evaluate(() => document.querySelectorAll("style").forEach((st) => st.textContent.includes("animation-play-state:paused") && st.remove()));
  const btn = p.getByRole("button", { name: /Шүүлтүүр/ }).first();
  await btn.click();
  await p.waitForTimeout(1200);
  await p.screenshot({ path: `${OUT}mob-filters.png` });
  meta["mob-filters"] = { w: 390, h: 844 };
  await p.close();
}

writeFileSync(`${OUT}meta.json`, JSON.stringify(meta, null, 2));
await browser.close();
console.log("✓ captured", Object.keys(meta).join(", "));
