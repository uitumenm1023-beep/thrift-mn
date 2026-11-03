// Garment "3D mockup" illustrations as SVG, in the Thrift.mn palette.
// Each drawing is 800×1000. Symmetric parts are written as a right half
// (from the top centre, clockwise, back to the centre line) and mirrored.

const W = 800, H = 1000, CX = 400;
const OUT = "#262a25";

// ---------- path helpers ----------
const mx = ([x, y]) => [2 * CX - x, y];
const pt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
/** half = [start, seg...]; seg = [p] (line) or [c1, c2, p] (cubic). */
function sym(half) {
  const [start, ...segs] = half;
  let d = `M${pt(start)}`;
  const pts = [start];
  for (const s of segs) {
    d += s.length === 1 ? ` L${pt(s[0])}` : ` C${pt(s[0])} ${pt(s[1])} ${pt(s[2])}`;
    pts.push(s[s.length - 1]);
  }
  for (let i = segs.length - 1; i >= 0; i--) {
    const s = segs[i], from = pts[i];
    d += s.length === 1 ? ` L${pt(mx(from))}` : ` C${pt(mx(s[1]))} ${pt(mx(s[0]))} ${pt(mx(from))}`;
  }
  return d + " Z";
}
const flip = (svg) => `<g transform="translate(${2 * CX} 0) scale(-1 1)">${svg}</g>`;

// ---------- color helpers ----------
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt)));
  return "#" + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(f).map((c) => c.toString(16).padStart(2, "0")).join("");
}

/** Relative luminance 0–1, used to pick light stitching on dark fabric. */
function lum(hex) {
  const n = parseInt(hex.slice(1), 16);
  return (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255;
}
const thread = (c) => (lum(c) < 0.3 ? "#e6e9da" : "#000");
const cord = (c) => (lum(c) < 0.3 ? shade(c, .45) : shade(c, -.25));

let uid = 0, pre = "g";
/** A shaded fabric panel: base fill, soft volume gradients, fine texture, outline. */
function panel(d, color, { stroke = true, sw = 2.2, gloss = 0, texture = .06, edge = .22 } = {}) {
  const id = `${pre}p${uid++}`;
  return `
  <clipPath id="${id}c"><path d="${d}"/></clipPath>
  <path d="${d}" fill="${color}"/>
  <g clip-path="url(#${id}c)">
    <rect width="${W}" height="${H}" fill="url(#vol)" opacity="${edge * 4}"/>
    <rect width="${W}" height="${H}" fill="url(#top)" opacity=".9"/>
    ${gloss ? `<rect width="${W}" height="${H}" fill="url(#gloss)" opacity="${gloss}"/>` : ""}
    <rect width="${W}" height="${H}" filter="url(#fabric)" opacity="${texture}"/>
  </g>
  ${stroke ? `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${sw}" stroke-linejoin="round"/>` : ""}`;
}
const stitch = (d, color = "#000", op = .32) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1.6" stroke-dasharray="5 4" stroke-linecap="round"/>`;
const line = (d, op = .25, w = 1.6, color = OUT) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
/** Vertical rib lines clipped to a shape. */
function ribs(d, step = 7, op = .16, angle = 0) {
  const id = `${pre}r${uid++}`;
  let lines = "";
  for (let x = -200; x < W + 200; x += step) lines += `M${x} -50 L${x + angle} ${H + 50} `;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><path clip-path="url(#${id})" d="${lines}" stroke="#000" stroke-opacity="${op}" stroke-width="1.4"/>`;
}
/** Small woven brand label with the lime mark. */
const label = (x, y, r = 0, s = 1) => `
  <g transform="translate(${x} ${y}) rotate(${r}) scale(${s})">
    <rect x="-24" y="-11" width="48" height="22" rx="2" fill="#151816"/>
    <circle cx="-12" cy="0" r="5" fill="#d8f06a"/><rect x="-3" y="-4" width="20" height="2" fill="#e6e9da" opacity=".8"/><rect x="-3" y="1" width="14" height="2" fill="#e6e9da" opacity=".5"/>
  </g>`;
const chestMark = (x, y, color) => `<g transform="translate(${x} ${y})" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"><path d="M0 -9 V9 M-9 0 H9 M-6.4 -6.4 L6.4 6.4 M6.4 -6.4 L-6.4 6.4"/></g>`;

function defs() {
  return `<defs>
    <linearGradient id="vol" x1="0" x2="1">
      <stop offset="0" stop-color="#000" stop-opacity=".22"/><stop offset=".18" stop-color="#000" stop-opacity="0"/>
      <stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".26"/>
    </linearGradient>
    <radialGradient id="top" cx=".38" cy=".18" r=".85">
      <stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity=".2"/>
    </radialGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="1" y2="1">
      <stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset=".42" stop-color="#fff" stop-opacity=".55"/>
      <stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".25"/><stop offset=".78" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <filter id="fabric" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/>
      <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.4 -.2"/>
    </filter>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
    <radialGradient id="bg" cx=".5" cy=".42" r=".75">
      <stop offset="0" stop-color="#f3f4ee"/><stop offset="1" stop-color="#dfe2d8"/>
    </radialGradient>
  </defs>`;
}
const shadow = (cx, cy, rx, ry = 26, op = .35) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#2a3326" opacity="${op}" filter="url(#soft)"/>`;

// ---------- garments ----------
const G = {};

// Shared top-body pieces (drop-shoulder, boxy)
const BODY = [[400, 262], [[450, 262], [480, 262], [508, 266]], [[545, 274], [572, 287], [592, 304]], [[602, 450], [600, 620], [594, 760]], [[400, 766]]];
const SLEEVE = "M590 304 C646 332 684 420 702 560 C712 636 718 700 716 748 L648 762 C640 650 618 540 596 470 Z";
const CUFF = "M716 746 C722 772 724 792 718 812 C698 822 668 822 646 814 C644 796 646 776 648 760 Z";
const HEM = sym([[400, 760], [[590, 758]], [[592, 786], [590, 804], [584, 824]], [[520, 830], [450, 832], [400, 832]]]);

function topBase(c, { cuffs = true, hem = true, sleeve = SLEEVE, cuff = CUFF } = {}) {
  const sl = panel(sleeve, c) + (cuffs ? panel(cuff, shade(c, -.04)) + ribs(cuff, 6, .14) : "") +
    line("M612 420 C640 500 660 600 668 700", .14, 2);
  return {
    back: flip(sl) + sl,
    body: panel(sym(BODY), c),
    hem: hem ? panel(HEM, shade(c, -.04)) + ribs(HEM, 6, .14) : "",
  };
}

G.hoodie = (c) => {
  const t = topBase(c);
  const hood = sym([[400, 92], [[476, 92], [532, 140], [536, 216]], [[539, 256], [520, 282], [490, 292]], [[400, 304]]]);
  const open = sym([[400, 126], [[452, 126], [482, 162], [484, 216]], [[486, 252], [462, 274], [432, 284]], [[416, 289], [406, 302], [400, 318]]]);
  const pocket = sym([[400, 574], [[456, 574]], [[470, 612], [492, 642], [518, 656]], [[518, 702]], [[400, 702]]]);
  return shadow(400, 860, 300) + t.back + panel(hood, c) + t.body +
    `<path d="${open}" fill="#191c1a"/>` + panel(open, "#1d201d", { texture: .03 }) + (lum(c) < .3 ? line(open, .4, 2, shade(c, .45)) : "") +
    line("M440 288 C452 300 470 296 486 280", .2) +
    panel(pocket, c) + (lum(c) < .3 ? line(pocket, .35, 1.6, shade(c, .5)) : "") + stitch(sym([[400, 584], [[450, 584]], [[464, 618], [484, 646], [508, 662]], [[508, 692]], [[400, 692]]]), thread(c), lum(c) < .3 ? .45 : .32) +
    line("M395 300 C392 360 384 410 372 448", .8, 3, cord(c)) + line("M405 300 C410 350 418 392 430 430", .8, 3, cord(c)) +
    t.hem + stitch("M406 262 C470 270 540 280 586 304", thread(c), .25) +
    chestMark(470, 360, lum(c) < .3 ? shade(c, .4) : shade(c, -.18)) + label(683, 735, -8);
};

G.sweatshirt = (c) => {
  const t = topBase(c);
  const collar = "M332 266 C356 304 444 304 468 266 C470 258 462 252 454 256 C430 284 370 284 346 256 C338 252 330 258 332 266 Z";
  return shadow(400, 860, 300) + t.back + t.body +
    `<path d="M346 256 C370 284 430 284 454 256 C430 268 370 268 346 256 Z" fill="${shade(c, -.35)}"/>` +
    panel(collar, shade(c, -.04)) + ribs(collar, 6, .16) + t.hem +
    line("M470 420 C500 520 505 620 498 720", .1, 2) + chestMark(470, 360, shade(c, -.2)) + label(683, 735, -8);
};

G.tee = (c) => {
  const body = sym([[400, 268], [[440, 270], [468, 264], [490, 260]], [[528, 270], [556, 280], [578, 292]], [[570, 470], [568, 640], [566, 792]], [[480, 798], [430, 800], [400, 800]]]);
  const sl = panel("M576 291 C626 306 664 360 692 440 L620 478 C608 430 592 400 572 380 Z", c);
  const collar = "M346 258 C366 292 434 292 454 258 C456 252 450 248 444 252 C424 276 376 276 356 252 C350 248 344 252 346 258 Z";
  return shadow(400, 830, 260) + flip(sl) + sl + panel(body, c) +
    `<path d="M356 252 C376 276 424 276 444 252 C424 262 376 262 356 252 Z" fill="${shade(c, -.35)}"/>` +
    panel(collar, shade(c, -.04)) + stitch("M236 784 L564 784", "#000", .25) +
    line("M480 360 C500 480 498 600 490 740", .08, 2) + chestMark(462, 350, shade(c, -.2)) + label(560, 760, 0, .8);
};

G.bomber = (c) => {
  const t = topBase(c);
  const collar = "M344 254 C366 286 434 286 456 254 L470 266 C444 306 356 306 330 266 Z";
  const zipper = `<path d="M400 290 V764" stroke="#1c1f1c" stroke-width="7"/><path d="M400 292 V762" stroke="#8a8f84" stroke-width="2.4" stroke-dasharray="2 3"/>` +
    `<rect x="393" y="300" width="14" height="22" rx="3" fill="#9aa094" stroke="${OUT}" stroke-width="1.2"/>`;
  const pocket = (s) => `<path d="M${400 + s * 95} 560 L${400 + s * 140} 520" stroke="${OUT}" stroke-width="2.2" stroke-opacity=".7" stroke-linecap="round"/>`;
  return shadow(400, 860, 300) + t.back + t.body + `<path d="M344 254 C366 286 434 286 456 254 Z" fill="${shade(c, -.4)}"/>` +
    panel(collar, "#2d302b") + ribs(collar, 5, .2) + zipper + pocket(1) + pocket(-1) +
    t.hem.replace(/fill="#[0-9a-f]{6}"/, 'fill="#2d302b"') + stitch("M406 270 C470 276 540 284 586 304", "#000", .2) + label(683, 735, -8);
};

G.coat = (c) => {
  const body = sym([[400, 262], [[450, 262], [480, 262], [508, 266]], [[545, 274], [572, 287], [590, 304]], [[598, 520], [604, 720], [612, 930]], [[520, 938], [460, 940], [400, 940]]]);
  const sleeve = "M588 304 C640 332 672 420 688 560 C698 650 704 730 704 800 L638 812 C632 700 616 560 596 470 Z";
  const sl = panel(sleeve, c) + stitch("M700 760 L640 772");
  const lapel = "M400 470 L430 470 C460 400 488 320 512 268 L478 262 L470 300 L490 312 C470 370 440 430 400 470 Z";
  return shadow(400, 960, 280) + flip(sl) + sl + panel(body, c) + flip(panel(lapel, shade(c, .03))) + panel(lapel, shade(c, .03)) +
    `<path d="M352 266 L400 470 L448 266 C430 274 370 274 352 266 Z" fill="#1d201d"/>` +
    line("M400 470 V936", .4, 2) + [560, 650, 740].map((y) => `<circle cx="372" cy="${y}" r="9" fill="${shade(c, -.35)}"/><circle cx="428" cy="${y}" r="9" fill="${shade(c, -.35)}"/>`).join("") +
    line("M460 690 L540 690", .45, 2.4) + flip(line("M460 690 L540 690", .45, 2.4)) + label(650, 780, -6);
};

G.shirt = (c) => {
  const body = sym([[400, 262], [[440, 262], [470, 262], [496, 264]], [[530, 272], [556, 284], [576, 298]], [[580, 480], [578, 680], [574, 840]], [[520, 860], [460, 872], [400, 872]]]);
  const sleeve = "M574 298 C624 322 656 420 672 560 C680 640 686 700 686 760 L630 770 C624 660 604 540 582 460 Z";
  const cuff = "M686 756 C690 778 690 796 686 816 C668 822 646 822 630 816 C630 800 630 784 630 768 Z";
  const sl = panel(sleeve, c) + panel(cuff, c) + `<circle cx="672" cy="790" r="4" fill="#e9e6dc" stroke="${OUT}" stroke-width="1"/>`;
  const collar = "M400 300 L346 252 L332 282 L380 318 Z";
  return shadow(400, 890, 260) + flip(sl) + sl + panel(body, c) +
    `<path d="M346 252 C370 262 430 262 454 252 L400 300 Z" fill="${shade(c, -.3)}"/>` +
    panel(collar, c) + flip(panel(collar, c)) + line("M386 300 V872 M414 300 V872", .3, 1.6) +
    [360, 450, 540, 630, 720, 810].map((y) => `<circle cx="400" cy="${y}" r="5.5" fill="#efece4" stroke="${OUT}" stroke-width="1.2"/>`).join("") +
    panel("M440 400 H510 V478 L475 492 L440 478 Z", c, { texture: .03 }) + stitch("M440 412 H510", "#000", .25) + label(560, 836, 0, .75);
};

G.cardigan = (c) => {
  const t = topBase(c);
  const vneck = `<path d="M346 262 L400 500 L454 262 C430 272 370 272 346 262 Z" fill="#1d201d"/>`;
  const band = "M346 262 L400 500 L400 766 L388 766 L388 504 L334 268 Z";
  const cables = [460, 520].map((x) => line(`M${x} 330 C${x + 14} 360 ${x - 14} 390 ${x} 420 C${x + 14} 450 ${x - 14} 480 ${x} 510 C${x + 14} 540 ${x - 14} 570 ${x} 600 C${x + 14} 630 ${x - 14} 660 ${x} 690`, .22, 3)).join("");
  return shadow(400, 860, 300) + t.back + t.body + vneck + flip(cables) + cables +
    panel(band, shade(c, -.05)) + flip(panel(band, shade(c, -.05))) + ribs(band, 5, .12) +
    [540, 610, 680, 740].map((y) => `<circle cx="408" cy="${y}" r="7" fill="${shade(c, -.45)}"/>`).join("") + t.hem + label(683, 735, -8);
};

G.pants = (c, { denim = false } = {}) => {
  const legs = sym([[400, 186], [[506, 186]], [[516, 300], [532, 520], [548, 892]], [[500, 898], [450, 898], [416, 896]], [[414, 700], [410, 520], [400, 404]]]);
  const waist = sym([[400, 150], [[508, 148]], [[510, 188]], [[400, 190]]]);
  const st = denim ? "#d59a3b" : "#000";
  const pocket = "M506 200 C478 214 456 238 448 262";
  return shadow(400, 910, 240, 22) + panel(legs, c) + panel(waist, c) +
    line("M400 190 V404", .45, 2) + stitch("M416 196 C416 270 414 320 406 360", st, denim ? .8 : .3) +
    flip(line(pocket, .5, 2)) + line(pocket, .5, 2) + flip(stitch("M500 204 C476 218 458 240 452 262", st, denim ? .8 : .3)) + stitch("M500 204 C476 218 458 240 452 262", st, denim ? .8 : .3) +
    stitch("M404 160 H504", st, denim ? .8 : .3) + flip(stitch("M404 160 H504", st, denim ? .8 : .3)) +
    [330, 470].map((x) => `<rect x="${x - 6}" y="146" width="12" height="46" rx="3" fill="${shade(c, -.06)}" stroke="${OUT}" stroke-width="1.4"/>`).join("") +
    `<circle cx="400" cy="168" r="7" fill="#b9a46a" stroke="${OUT}" stroke-width="1.4"/>` +
    line("M470 420 C480 560 492 700 500 860", .12, 2) + flip(line("M470 420 C480 560 492 700 500 860", .12, 2)) +
    line("M418 860 L548 856", .25, 2) + flip(line("M418 860 L548 856", .25, 2)) + label(480, 228, 0, .7);
};

G.beanie = (c) => {
  const dome = sym([[400, 250], [[480, 250], [560, 330], [566, 520]], [[400, 524]]]);
  const cuff = sym([[400, 500], [[574, 498]], [[582, 560], [584, 610], [580, 660]], [[520, 672], [460, 676], [400, 676]]]);
  return shadow(400, 700, 220, 20) + panel(dome, c) + ribs(dome, 14, .14) + panel(cuff, shade(c, -.05)) + ribs(cuff, 9, .2) +
    `<g transform="translate(400 590)"><rect x="-46" y="-18" width="92" height="36" rx="3" fill="#151816"/><circle cx="-24" cy="0" r="8" fill="#d8f06a"/><rect x="-8" y="-6" width="40" height="3" fill="#e6e9da" opacity=".8"/><rect x="-8" y="3" width="28" height="3" fill="#e6e9da" opacity=".5"/></g>`;
};

G.cap = (c) => {
  const crown = sym([[400, 300], [[490, 300], [560, 360], [572, 520]], [[400, 528]]]);
  const brim = "M218 520 C300 500 500 500 582 520 C600 560 590 600 560 612 C480 596 320 596 240 612 C210 600 200 560 218 520 Z";
  return shadow(400, 640, 230, 20) + panel(crown, c) + line("M400 300 V526", .35, 2) + line("M400 300 C450 340 490 420 500 526", .22, 2) + flip(line("M400 300 C450 340 490 420 500 526", .22, 2)) +
    `<circle cx="400" cy="304" r="9" fill="${shade(c, -.1)}" stroke="${OUT}" stroke-width="1.6"/>` +
    panel(brim, shade(c, -.06)) + stitch("M240 590 C320 576 480 576 560 590") + stitch("M236 576 C320 562 480 562 564 576") +
    `<g transform="translate(450 440)"><circle r="16" fill="#151816"/><circle r="7" fill="#d8f06a"/></g>`;
};

G.tote = (c) => {
  const bag = sym([[400, 380], [[560, 380]], [[590, 820]], [[400, 824]]]);
  const handle = "M330 382 C330 250 470 250 470 382 L452 382 C452 276 348 276 348 382 Z";
  return shadow(400, 840, 230, 22) + panel(handle, shade(c, -.1)) + panel(bag, c) +
    stitch("M226 404 H574") + line("M248 820 C300 700 300 520 260 400", .08, 2) + label(400, 640, 0, 1.2);
};

G.sneaker = (c) => {
  // Low-top, side profile: toe on the left, heel on the right.
  const upper = "M146 600 C134 572 146 540 186 526 C238 510 286 494 322 466 C352 442 382 420 424 410 L486 396 C514 414 548 428 588 426 C618 424 640 410 656 414 C670 470 674 540 668 604 Z";
  const sole = "M126 598 H686 C698 612 698 642 682 656 H148 C128 646 118 618 126 598 Z";
  const toecap = "M146 600 C134 572 146 540 186 526 C220 516 250 506 274 494 C262 530 262 570 272 600 Z";
  const heel = "M600 426 C628 424 644 412 656 414 C670 470 674 540 668 604 L594 604 C606 540 608 480 600 426 Z";
  const laces = [0, 1, 2, 3, 4].map((i) => {
    const x = 330 + i * 30, y = 462 - i * 13;
    return line(`M${x - 14} ${y + 14} L${x + 18} ${y - 8}`, .9, 4.5, "#f4f2ea") + `<circle cx="${x - 16}" cy="${y + 16}" r="3" fill="${shade(c, -.35)}"/><circle cx="${x + 20}" cy="${y - 10}" r="3" fill="${shade(c, -.35)}"/>`;
  }).join("");
  return shadow(410, 672, 300, 18) + panel(upper, c) + panel(toecap, shade(c, -.04)) + panel(heel, shade(c, -.06)) +
    panel("M424 410 C430 380 470 366 500 372 L486 396 Z", shade(c, -.08)) + laces +
    line("M300 520 C380 520 470 470 560 470", .28, 2.4) + stitch("M190 560 C230 548 260 540 284 528") +
    panel(sole, "#f1efe8") + line("M128 626 H690", .28, 1.6) + stitch("M156 590 H650") +
    `<g transform="translate(470 540) rotate(-8)"><path d="M-60 0 C-20 -24 30 -26 70 -12" fill="none" stroke="#3e5a3f" stroke-width="10" stroke-linecap="round"/></g>` + label(628, 470, 0, .7);
};

G.boot = (c) => {
  const boot = "M300 200 H470 C474 300 476 400 486 470 C560 480 640 510 668 570 L674 640 H286 C276 520 290 360 300 200 Z";
  const sole = "M276 636 H684 C694 652 690 676 676 684 H384 L380 716 H300 L292 684 H284 C270 670 268 650 276 636 Z";
  return shadow(470, 720, 240, 18) + panel(boot, c, { gloss: .5 }) +
    panel("M330 230 C350 300 360 380 352 470 L420 470 C426 380 430 300 434 230 Z", "#2c2f2a") + ribs("M330 230 C350 300 360 380 352 470 L420 470 C426 380 430 300 434 230 Z", 6, .25) +
    panel("M300 200 H340 V170 C340 160 350 156 356 166 L364 200 Z", shade(c, -.1)) + panel(sole, "#1f221f") + stitch("M290 626 H670", "#d8c9a5", .5);
};

G.crossbody = (c) => {
  const bag = "M240 500 C240 470 260 450 290 450 H510 C540 450 560 470 560 500 V700 C560 728 540 748 512 748 H288 C260 748 240 728 240 700 Z";
  const flap = "M240 500 C240 470 260 450 290 450 H510 C540 450 560 470 560 500 V600 C500 640 300 640 240 600 Z";
  return shadow(400, 770, 200, 18) + line("M268 470 C220 300 300 160 400 160 C500 160 580 300 532 470", 1, 10, shade(c, -.2)) +
    panel(bag, c, { gloss: .35 }) + panel(flap, shade(c, .04), { gloss: .45 }) + stitch("M256 506 C256 484 270 466 292 466 H508 C530 466 544 484 544 506 V594 C490 624 310 624 256 594 Z", "#000", .3) +
    `<rect x="384" y="600" width="32" height="26" rx="5" fill="#c9b37a" stroke="${OUT}" stroke-width="1.6"/>`;
};

// ---------- scene ----------
let svgCount = 0;
function garmentSVG(kind, color, opts = {}) {
  uid = 0; pre = "g" + (++svgCount) + kind;
  const body = kind === "jeans" ? G.pants(color, { denim: true }) : G[kind](color, opts);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${defs()}
    <rect width="${W}" height="${H}" fill="url(#bg)"/>${body}</svg>`;
}
/** Wide 4:3 scene: garments on hangers along a rail (shop covers). */
const TOPS = { hoodie: 92, sweatshirt: 262, tee: 262, bomber: 262, coat: 262, shirt: 262, cardigan: 262 };
function rackSVG(items) {
  const RW = 1600, RH = 1200, n = items.length, gap = RW / (n + 1), sc = 0.9, railY = 230;
  let groups = "";
  items.forEach(([kind, color], i) => {
    uid = 0; pre = "r" + (++svgCount) + kind;
    const cx = gap * (i + 1), top = TOPS[kind] ?? 262;
    const tx = cx - CX * sc, ty = railY + 70 - top * sc + (kind === "hoodie" ? -40 : 0);
    const hookBottom = ty + top * sc + 4;
    groups += `<path d="M${cx} ${hookBottom} V${railY + 22} C${cx} ${railY - 6} ${cx + 26} ${railY - 6} ${cx + 26} ${railY + 10}" fill="none" stroke="#3a3f37" stroke-width="5" stroke-linecap="round"/>`;
    groups += `<g transform="translate(${tx} ${ty}) scale(${sc})">${G[kind](color)}</g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${RW} ${RH}" width="${RW}" height="${RH}">${defs()}
    <rect width="${RW}" height="${RH}" fill="url(#bg)"/>
    <rect x="0" y="${railY - 6}" width="${RW}" height="12" rx="6" fill="#3a3f37"/>
    ${groups}</svg>`;
}
if (typeof module !== "undefined") module.exports = { garmentSVG, rackSVG };
