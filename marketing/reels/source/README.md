# Thrift.mn reels — source

`reel.html` draws the three reels (`?reel=intro`, `?reel=how`, `?reel=collection`) in the site's colors and fonts. Edit text, timing, or photos there.

To re-render (from this folder, outside the main app):

```bash
npm init -y && npm i playwright@1.49.1 ffmpeg-static@5.2.0
npx playwright install --only-shell chromium
node render.mjs intro ../thrift-reel-1-intro.mp4
```

Output: 1080×1920, 30 fps, H.264 — ready for Instagram Reels. No audio; add music in the Instagram app.

`garments.js` draws the product illustrations (hoodie, coat, cardigan, jeans, boots…) and `assets.mjs` renders them into `public/demo/`, plus the logo files in `marketing/logo/` and the site icons in `src/app/`. The reel pages expect a copy of `public/demo` next to `reel.html` (`cp -R ../../../public/demo ./demo`).

## Promo (laptop + phone)

`capture.mjs` screenshots the site at desktop and phone size into `shots/` (set `BASE=http://localhost:3000` to capture a local build). `promo.html` animates those screens inside device mockups. Render it over HTTP:

```bash
python3 -m http.server 8765 --bind 127.0.0.1 &
PAGE=http://127.0.0.1:8765/promo.html node render.mjs promo ../thrift-promo-phone-and-computer.mp4
```
