// Renders reel.html?reel=<name> frame by frame and pipes PNGs into ffmpeg.
import { chromium } from "playwright";
import ffmpegPath from "ffmpeg-static";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const name = process.argv[2] ?? "intro";
const out = process.argv[3] ?? `thrift-reel-${name}.mp4`;
const FPS = 30;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
// PAGE=http://… renders another page (e.g. the promo, which loads files over HTTP).
await page.goto(process.env.PAGE ?? `${pathToFileURL(new URL("./reel.html", import.meta.url).pathname)}?reel=${name}`);
await page.evaluate(() => window.ready);
const duration = await page.evaluate(() => window.DURATION);
const frames = Math.round(duration * FPS);

const ff = spawn(ffmpegPath, [
  "-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
  "-c:v", "libx264", "-pix_fmt", "yuv420p", "-profile:v", "high", "-crf", "18",
  "-preset", "medium", "-movflags", "+faststart", out,
], { stdio: ["pipe", "ignore", "inherit"] });

for (let f = 0; f < frames; f++) {
  await page.evaluate((t) => window.render(t), f / FPS);
  const png = await page.screenshot({ type: "png" });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
}
ff.stdin.end();
await new Promise((r) => ff.on("close", r));
await browser.close();
console.log(`✓ ${out} (${frames} frames, ${duration}s)`);
