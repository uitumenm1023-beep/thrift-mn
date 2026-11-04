// Screenshots promo.html at given times into one contact sheet.
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { execFileSync } from "node:child_process";
const times = process.argv.slice(2).map(Number);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 540, height: 960 } });
await p.goto("http://127.0.0.1:8765/promo.html");
await p.evaluate(() => window.ready);
const files = [];
for (const [i, t] of times.entries()) { await p.evaluate((t) => window.render(t), t); const f = `fr${i}.png`; await p.screenshot({ path: f }); files.push(f); }
await b.close();
execFileSync(ffmpegPath, ["-v", "error", "-y", ...files.flatMap((f) => ["-i", f]), "-filter_complex", `hstack=${files.length},scale=${270 * files.length}:-1`, "promo-sheet.png"]);
console.log("✓ sheet");
