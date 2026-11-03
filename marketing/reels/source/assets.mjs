// Renders demo product illustrations, shop covers, logos and site icons.
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { garmentSVG, rackSVG } = require("./garments.js");
const APP = "/Users/munkhdul/Desktop/thrift";
const TMP = new URL("./tmp/", import.meta.url).pathname;
mkdirSync(TMP, { recursive: true });

// slug: [kind, color]
export const PRODUCTS = {
  "hoodie-stone": ["hoodie", "#c9ccc4"],
  "hoodie-forest": ["hoodie", "#2f4a3a"],
  "hoodie-cream": ["hoodie", "#e8e2d2"],
  "hoodie-sage": ["hoodie", "#9aa892"],
  "hoodie-olive": ["hoodie", "#6b7350"],
  "hoodie-charcoal": ["hoodie", "#3d4337"],
  "hoodie-camel": ["hoodie", "#b79b74"],
  "hoodie-black": ["hoodie", "#262a25"],
  "hoodie-lime": ["hoodie", "#cfe36a"],
  "sweatshirt-sage": ["sweatshirt", "#9aa892"],
  "sweatshirt-cream": ["sweatshirt", "#e8e2d2"],
  "tee-cream": ["tee", "#ece8dc"],
  "tee-charcoal": ["tee", "#3d4337"],
  "bomber-olive": ["bomber", "#5f6b47"],
  "bomber-black": ["bomber", "#2b2f2a"],
  "coat-camel": ["coat", "#b79b74"],
  "coat-charcoal": ["coat", "#3d4337"],
  "shirt-stone": ["shirt", "#e4e0d4"],
  "shirt-sage": ["shirt", "#a7b39f"],
  "cardigan-forest": ["cardigan", "#2f4a3a"],
  "cardigan-cream": ["cardigan", "#e8e2d2"],
  "pants-olive": ["pants", "#6b7350"],
  "jeans-indigo": ["jeans", "#50627a"],
  "jeans-light": ["jeans", "#8497ad"],
  "beanie-moss": ["beanie", "#4f6a4a"],
  "beanie-camel": ["beanie", "#b79b74"],
  "cap-charcoal": ["cap", "#3d4337"],
  "tote-canvas": ["tote", "#e3dccb"],
  "crossbody-brown": ["crossbody", "#6e4b33"],
  "sneaker-white": ["sneaker", "#e8e6df"],
  "boot-brown": ["boot", "#3a2b22"],
  "boot-black": ["boot", "#232622"],
};
const SHOPS = {
  "rack-1": [["coat", "#b79b74"], ["hoodie", "#c9ccc4"], ["cardigan", "#2f4a3a"]],
  "rack-2": [["shirt", "#e4e0d4"], ["bomber", "#5f6b47"], ["sweatshirt", "#9aa892"]],
  "rack-3": [["cardigan", "#e8e2d2"], ["coat", "#3d4337"], ["tee", "#ece8dc"]],
  "rack-4": [["sweatshirt", "#e8e2d2"], ["cardigan", "#2f4a3a"], ["coat", "#b79b74"]],
  "rack-5": [["hoodie", "#2f4a3a"], ["bomber", "#2b2f2a"], ["shirt", "#a7b39f"]],
};

const ff = (...args) => execFileSync(ffmpegPath, ["-v", "error", "-y", ...args]);
const toWebp = (png, out, q = 82) => ff("-i", png, "-c:v", "libwebp", "-quality", String(q), out);

const browser = await chromium.launch();

async function shot(html, w, h, file, scale = 1) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: scale });
  await page.setContent(`<!doctype html><style>*{margin:0}svg{display:block;width:${w}px;height:${h}px}</style>${html}`);
  await page.screenshot({ path: file, omitBackground: true });
  await page.close();
}

// Products: 1000×1250
mkdirSync(`${APP}/public/demo/products`, { recursive: true });
for (const [slug, [kind, color]] of Object.entries(PRODUCTS)) {
  const png = `${TMP}${slug}.png`;
  await shot(garmentSVG(kind, color), 800, 1000, png, 1.25);
  toWebp(png, `${APP}/public/demo/products/${slug}.webp`);
}
// Shop covers: 1600×1200
mkdirSync(`${APP}/public/demo/shops`, { recursive: true });
for (const [slug, items] of Object.entries(SHOPS)) {
  const png = `${TMP}${slug}.png`;
  await shot(rackSVG(items), 1600, 1200, png);
  toWebp(png, `${APP}/public/demo/shops/${slug}.webp`);
}

// Logos (HTML with web fonts)
mkdirSync(`${APP}/marketing/logo`, { recursive: true });
const logoUrl = "http://127.0.0.1:8765/logo.html";
async function logo(v, w, h, file, s, transparent = false) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto(`${logoUrl}?v=${v}${s ? `&s=${s}` : ""}`);
  await page.evaluate(() => window.ready);
  await page.screenshot({ path: file, omitBackground: transparent });
  await page.close();
}
await logo("avatar", 1080, 1080, `${APP}/marketing/logo/thrift-ig-profile-1080.png`, 1080);
await logo("wordDark", 1600, 800, `${APP}/marketing/logo/thrift-wordmark-dark.png`);
await logo("wordLight", 1600, 800, `${APP}/marketing/logo/thrift-wordmark-light.png`);
await logo("icon", 512, 512, `${APP}/marketing/logo/thrift-icon-512.png`, 512, true);
// Site icons (Next.js file conventions)
await logo("icon", 512, 512, `${APP}/src/app/icon.png`, 512, true);
await logo("avatar", 180, 180, `${APP}/src/app/apple-icon.png`, 180);

await browser.close();
rmSync(TMP, { recursive: true, force: true });
console.log("✓ assets rendered");
