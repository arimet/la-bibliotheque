import { fractal, rng, type Ctx, type Env, type P } from "./core";
import { brush, checkOps, css, fromHsl, mixC, schedule, staged, toHsl, type Mark, type Op, type RGB } from "./brokenColourKit";
import { clamp, inside } from "./gallery";
import { BROKEN_ROOM } from "./libraryRooms";
import { W, H, EYE as EYE_Y } from "./longroom";
import {
  BOOKS, BANDS, EDGE, FLAME, HOLES, LA, LAMP, LS, SPINE, chim, plateEdges, TOP, along, bp, boardLight, brassI, faces, grain, inBox, inChimney, labelBox, lerp2, onBook, plateBox,
  pool, quad, rule, setPlate, shadowK, sheen, shift, titleLines, uvOf, type Book, type Face,
  A0, A1, ARCH, ARY, BUSTS, CORN0, CORN1, FASC, LOW, OH, OW, RAIL, RH, RING_HOLE, RP, RW, VAULT_SEEN, ladderSide, ladderX, m, marbleI, marbleOf, mOf, ms, ovAt, radial,
  rLit, seen, toward, zoneAt, type Bust, type Zone,
  FH, FP, FW, WINDOW, WX, WY0, WY1, fms, fOf, glow, PAD, TABLE_KEEP, TW, LAST, cardsOf, cut, libraryFilm, type Art, type Look,
} from "./libraryScene";

// THE LONG ROOM · broken colour, after anidoodle's broken-colour hero (the harbour at sunrise).
// The same room, the same cards and the same journey as the oil (libraryScene), painted in dabs.
//
// MEDIUM, physically: oil straight from the tube on a lead-white primed linen, in one sitting. A
//   flat hog brush loaded and put down ONCE: it lands blunt, pushes a ridge up along one side and
//   drags thin where it lifts. Colours are not mixed into the colour of the thing: two or three
//   unmixed colours lie side by side and the eye mixes them. The linen shows in the gaps.
// MARKS: short separate opaque dabs, their colour SAMPLED from an analytic colour field per card,
//   then broken (hue +-0.03, value +-0.07, saturation up). Directions follow the planes: the
//   stacks, the pilasters and the busts upright; the floor long and flat along its boards; the
//   gallery's runs (soffits, fascia, rail, cornice) along their rays to the vanishing point; the
//   vault and its rib along the curve; the table along its grain; each board across its width.
// EDGE: no outlines. A form ends where its dabs stop: the busts and the ladder are dabs laid on a
//   card of their own with nothing round them. The tooled title is the one exception, a thin
//   groove of ultramarine and rose under the gilt, because it has to be read.
// ORDER (the hero's): (1) a thin warm imprimatura scrubbed over the white, (2) placement in thinned
//   ultramarine, (3) the masses in big dabs whose colour is the average of a wide neighbourhood,
//   (4) broken dabs over everything, visited along a smooth order field so the painting advances in
//   an irregular front, (5) the forms restated along themselves (books on the shelves, pilasters,
//   the rib, the balusters, the busts' lights, the plates, the gilt, the flame), (6) complementary
//   accents by rule, (7) the last sparkles (the window along the floor, the gilt, the brass).
// PALETTE (high key): lead white, cadmium orange and red, chrome yellow, rose madder, cobalt
//   violet, ultramarine, viridian. No black: the darkest dark is ultramarine + rose madder.
// LIGHT: the same as the oil's, turned into temperature: the far window and the tall side windows
//   break into cream, orange and pink; what turns from them goes cobalt violet, with orange dropped
//   into it; oak and leather are modelled warm to cool, not light to dark. The lamp's pool is chrome
//   yellow on the oak.
// THE BOOKS stay their colours: Dust Creek tan, Corbenic oxblood, Canicule mustard, Les Grands Bois
//   bottle green, each from its warm light side to its cool shadow side; the titles in dabs of chrome
//   yellow and cream; the plates set in as in the oil.

// ---------------------------------------------------------------- palette
const WHITE: RGB = [248, 243, 230], CREAM: RGB = [250, 228, 186], YELLOW: RGB = [244, 198, 70], ORANGE: RGB = [236, 136, 60], RED: RGB = [208, 70, 56];
const ROSE: RGB = [220, 114, 138], VIOLET: RGB = [146, 112, 184], ULTRA: RGB = [72, 84, 172], VIRID: RGB = [50, 138, 114], DEEP: RGB = [74, 54, 116];   // DEEP: ultramarine + rose, the darkest there is
const LILAC = mixC(VIOLET, WHITE, 0.45), GROUND: RGB = [240, 234, 222], U: RGB = [96, 104, 168];
const ACC_WARM: RGB[] = [[238, 138, 82], [242, 170, 128], [228, 112, 92]];     // orange and rose, into violet shadow
const ACC_COOL: RGB[] = [[150, 128, 204], [172, 150, 214], [128, 120, 190]];    // violet and lilac, into warm light
const ramp = (stops: RGB[], t: number): RGB => { const f = clamp(t) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)); return mixC(stops[i], stops[i + 1], f - i); };
const OAK: RGB[] = [[132, 98, 164], [196, 108, 120], [232, 142, 72], [246, 204, 136]];       // oak by temperature: violet turned away, rose, orange, cream full in the light
const BRASS: RGB[] = [[142, 106, 152], [220, 128, 56], [242, 186, 60], [252, 226, 140]];
const SKIN: Record<string, RGB[]> = {                                                           // each book from its cool shadow side to its warm light side
  "dust-creek": [[164, 108, 128], [212, 142, 90], [244, 194, 126]],
  corbenic: [[108, 52, 100], [186, 58, 64], [230, 100, 78]],
  canicule: [[166, 124, 118], [222, 170, 52], [248, 214, 100]],
  "grands-bois": [[40, 84, 112], [46, 124, 100], [100, 170, 124]],
};
const SPINES: RGB[] = [RED, ORANGE, ROSE, VIRID, ULTRA, YELLOW, VIOLET, [226, 150, 110], [120, 150, 190], [200, 86, 110]];   // the books on the shelves, straight from the tube

// ---------------------------------------------------------------- turning a field into dabs
// A card's field: at a point of the card, the colour of the motif, the dab's direction and size,
// the region's place in the order (k), and whether the broken pass leaves it to the mass (solid)
type Here = { c: RGB; ang: number; size: number; k: number; solid?: boolean };
type Field = (x: number, y: number) => Here | null;
type Box = [number, number, number, number];
const broken = (c: RGB, r: () => number, hj = 0.03, lj = 0.07, sat: [number, number] = [0.95, 1.25]): RGB => { const [h, s, l] = toHsl(c); return fromHsl([h + (r() - 0.5) * 2 * hj, Math.min(1, s * (sat[0] + r() * (sat[1] - sat[0]))), Math.max(0.3, Math.min(0.97, l + (r() - 0.5) * 2 * lj))]); };
const mk = (x: number, y: number, ang: number, L: number, w: number, rgb: RGB, seed: number, bend = 0, alpha = 0.95, kind: 0 | 1 | 2 = 0): Mark => ({ a: [x - (Math.cos(ang) * L) / 2, y - (Math.sin(ang) * L) / 2], b: [x + (Math.cos(ang) * L) / 2, y + (Math.sin(ang) * L) / 2], bend, w, rgb, alpha, seed, kind });
const pick = (cs: RGB[], r: () => number) => cs[Math.floor(r() * cs.length)];
const warmOf = (c: RGB) => c[0] > c[2] + 20;
// grid points, jittered, visited along a smooth order field that wanders patch by patch the way a hand moves round a canvas
type Pt = { x: number; y: number; h: Here; key: number };
const sweep = (b: Box, step: number, seed: number, patch: number, field: Field): Pt[] => {
  const r = rng(seed), out: Pt[] = [];
  for (let y = b[1]; y < b[3]; y += step) for (let x = b[0]; x < b[2]; x += step) {
    const px = x + (r() - 0.5) * step * 1.3, py = y + (r() - 0.5) * step * 1.3, j = r(), h = field(px, py); if (!h) continue;
    out.push({ x: px, y: py, h, key: h.k * 1e6 + py + fractal(seed + 2, px, py, 1 / patch, 1 / patch, 2) * patch * 1.4 + j * patch * 0.25 });
  }
  return out.sort((a, c) => a.key - c.key);
};
// (3) the masses: big dabs, colour the average of a wide neighbourhood, little breaking yet
const masses = (pts: Pt[], field: Field, L: number, w: number, seed: number): Mark[] => {
  const r = rng(seed);
  return pts.map(({ x, y, h }, i) => {
    let a: RGB = [0, 0, 0], n = 0;
    for (const [dx, dy] of [[0, 0], [-L / 2, 0], [L / 2, 0], [0, -L / 3], [0, L / 3]]) { const q = field(x + dx, y + dy); if (q && q.k === h.k) { a = [a[0] + q.c[0], a[1] + q.c[1], a[2] + q.c[2]]; n++; } }
    return mk(x, y, h.ang + (r() - 0.5) * 0.2, L * h.size * (0.8 + r() * 0.4), w * Math.max(0.6, h.size) * (0.8 + r() * 0.4), broken([a[0] / n, a[1] / n, a[2] / n], r, 0.01, 0.025, [0.9, 1.05]), seed * 7 + i, (r() - 0.5) * w * 0.3, 0.92);
  });
};
// (4) broken colour: small dabs everywhere, hue and value broken; now and then a complementary dab by rule
const brokens = (pts: Pt[], L: number, w: number, seed: number): Mark[] => {
  const r = rng(seed), out: Mark[] = [];
  pts.forEach(({ x, y, h }, i) => {
    if (h.solid || r() < 0.1) return;                                             // the mass breathes between dabs
    let c = broken(h.c, r); const [, , l] = toHsl(h.c);
    if (r() < 0.02) c = warmOf(h.c) ? (l > 0.55 ? pick(ACC_COOL, r) : c) : l < 0.66 ? pick(ACC_WARM, r) : c;
    out.push(mk(x, y, h.ang + (r() - 0.5) * 0.3, L * h.size * (0.6 + r() * 0.7), w * Math.max(0.55, h.size) * (0.7 + r() * 0.5), c, seed * 7 + i, (r() - 0.5) * w * 0.5));
  });
  return out;
};
// (6) accents by rule: orange and rose into the violet shadow, violet and lilac into the warm light
const accents = (b: Box, field: Field, n: number, L: number, w: number, seed: number): Mark[] => {
  const r = rng(seed), out: Mark[] = [];
  for (let k = 0; k < n * 40 && out.length < n; k++) {
    const x = b[0] + r() * (b[2] - b[0]), y = b[1] + r() * (b[3] - b[1]), h = field(x, y); if (!h) continue;
    const [, , l] = toHsl(h.c), c = !warmOf(h.c) && l < 0.64 ? pick(ACC_WARM, r) : warmOf(h.c) && l > 0.62 && r() < 0.6 ? pick(ACC_COOL, r) : null; if (!c) continue;
    out.push(mk(x, y, h.ang, L * (0.6 + r() * 0.6), w, c, seed * 7 + out.length));
  }
  return out;
};
// a form restated along itself: dabs laid end to end down a polyline, each about 2.6 widths long
const dabs = (pts: P[], w: number, col: (p: P) => RGB, seed: number, len = 2.6, alpha = 0.95): Mark[] => {
  const r = rng(seed), out: Mark[] = [];
  for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / (w * len)));
    for (let k = 0; k < n; k++) { const p0 = lerp2(a, b, k / n), p1 = lerp2(a, b, Math.min(1.05, (k + 1.2) / n)); out.push({ a: p0, b: p1, bend: (r() - 0.5) * w * 0.4, w: w * (0.85 + r() * 0.3), rgb: broken(col(lerp2(p0, p1, 0.5)), r, 0.02, 0.04, [0.95, 1.15]), alpha, seed: seed * 50 + out.length, kind: 0 }); } }
  return out;
};
// (2) placement: one pull of the rigger in thinned ultramarine along each line
const plan = (pts: P[], w: number, seed: number, alpha = 0.5): Mark[] => pts.slice(1).map((p, i) => ({ a: pts[i], b: p, bend: 0, w, rgb: U, alpha, seed: seed + i, kind: 1 }));
// (1) the imprimatura: thin warm rose-ochre scrubbed with a big brush, back and forth, the white breathing through
const scrub = (b: Box, gap: number, seed: number): Mark[] => {
  const r = rng(seed), out: Mark[] = [];
  for (let y = b[1] + gap / 2, i = 0; y < b[3]; y += gap, i++) { const ya = y + (r() - 0.5) * gap * 0.4, yb = y + (r() - 0.5) * gap * 0.4, x0 = b[0] - 40 + r() * 60, x1 = b[2] + 40 - r() * 60, back = i % 2 === 1;
    out.push({ a: back ? [x1, yb] : [x0, ya], b: back ? [x0, ya] : [x1, yb], bend: (r() - 0.5) * gap * 0.5, w: gap * (1.3 + r() * 0.4), rgb: r() < 0.5 ? [220, 176, 150] : [206, 168, 164], alpha: 0.55, seed: seed + i, kind: 2 }); }
  return out;
};

// ---------------------------------------------------------------- a card that paints itself
// An item is a dab, or a drawing of its own (a plate) given its progress, in the card's own coordinates
type Item = Mark | ((c: Ctx, env: Env, p: number) => void);
type Pass = { items: Item[]; f0: number; f1: number; dur: number };
// the passes' windows in the arrival's 88 frames: each abuts the next, as in the hero
const TL = { scrub: [1, 12, 6], plan: [11, 20, 4], mass: [19, 44, 4], brk: [43, 70, 3], det: [69, 80, 3], acc: [79, 84, 2], last: [83, LAST, 2] } as const;
const passes = (by: Partial<Record<keyof typeof TL, Item[]>>): Pass[] => (Object.keys(TL) as (keyof typeof TL)[]).map((k) => ({ items: by[k] ?? [], f0: TL[k][0], f1: TL[k][1], dur: TL[k][2] }));
const up = (u: number) => u * u * (3 - 2 * u) * 0.35 + u * 0.65;   // a hand settling into the rhythm
const moved = (o: Mark, [dx, dy]: P): Mark => ({ ...o, a: [o.a[0] + dx, o.a[1] + dy], b: [o.b[0] + dx, o.b[1] + dy] });
// `off` moves the card's own coordinates onto its canvas; `primed`: the lead-white ground, or nothing (a card of dabs alone)
const card = (id: string, w: number, h: number, off: P, build: () => Pass[], primed: boolean, finish: (c: Ctx, env: Env) => void = () => {}): Art => {
  let ops: Op[] | undefined;
  const list = () => (ops ??= checkOps(build().flatMap((p) => { const t = schedule(p.items.length, p.f0, p.f1, p.dur, up); return p.items.map((it, i): Op => {
    if (typeof it !== "function") { const mv = moved(it, off); return { ...t[i], draw: (c, env, pr) => brush(c, env, mv, pr) }; }
    return { ...t[i], draw: (c, env, pr) => { c.setTransform(env.scale, 0, 0, env.scale, off[0] * env.scale, off[1] * env.scale); c.globalAlpha = 1; c.globalCompositeOperation = "source-over"; it(c, env, pr); } };
  }); }), LAST));
  const ground = (c: Ctx, env: Env) => { if (!primed) return; c.fillStyle = `rgb(${GROUND.join(",")})`; c.fillRect(0, 0, Math.round(env.W * env.scale), Math.round(env.H * env.scale)); };
  return { run: staged(`libraryBroken:${id}`, list, ground, finish), end: LAST, w, h };
};

// ---------------------------------------------------------------- a bay of the Long Room
// The same portal as the oil's, in ring px (RP px per metre); the field follows the ray from the eye
// through each point (zoneAt) and gives that surface its colour by temperature
const ORDER_OF: Record<Zone, number> = { vault: 0, cornice: 1, usoffit: 1, upilaster: 1, upper: 2, balustrade: 2, fascia: 2, soffit: 2, lower: 3, pilaster: 3, alcove: 4, floor: 4 };
const oak = (t: number) => ramp(OAK, t);
// along the barrel's hoops: the arch's tangent where the point's own hoop passes (the vault is seen at t ~ 1.12)
const hoop = (mx: number, my: number) => { const a = Math.atan2(((my - EYE_Y) / 1.12 + EYE_Y - CORN1) / ARY, mx / 1.12 / A1); return Math.atan2(-ARY * Math.cos(a), -A1 * Math.sin(a)); };
const aisle = (mx: number) => Math.exp(-((mx / 0.9) ** 2));   // the far window along the polished aisle
const ringHere: Field = (x, y) => {
  const [mx, my] = mOf(x, y); if (!seen(mx, my)) return null;
  const z = zoneAt(mx, my); if (!z) return null;
  const ax = Math.abs(mx), t = clamp((rLit(mx, my) - 0.7) / 0.44), k = ORDER_OF[z], vert = -Math.PI / 2, rad = radial(x, y);
  switch (z) {
    case "floor": return { c: mixC(oak(0.3 + 0.35 * t), mixC(CREAM, ROSE, 0.25), 0.65 * aisle(mx)), ang: rad, size: 1.3, k };
    case "alcove": return { c: mixC(DEEP, VIOLET, 0.45 + 0.25 * t), ang: rad, size: 1.1, k };
    case "lower": return { c: mixC(VIOLET, DEEP, 0.3 - 0.2 * t), ang: vert, size: 1, k, solid: true };
    case "upper": return { c: mixC(VIOLET, ROSE, 0.15 + 0.25 * t), ang: vert, size: 1, k, solid: true };
    case "pilaster": return { c: ax < 2.2 ? oak(0.6 + 0.35 * t) : oak(0.18 + 0.25 * t), ang: vert, size: 0.9, k };
    case "soffit": case "usoffit": return { c: mixC(mixC(VIOLET, ULTRA, 0.3), ORANGE, 0.3 * clamp(1 - (ax - A0) / 1.6)), ang: rad, size: 1, k };
    case "fascia": return { c: oak(0.5 + 0.35 * t), ang: rad, size: 1, k };
    case "balustrade": return { c: mixC(VIOLET, ROSE, 0.2 + 0.2 * t), ang: rad, size: 0.8, k };
    case "upilaster": return { c: oak(0.4 + 0.4 * t), ang: vert, size: 0.9, k };
    case "cornice": return { c: oak(0.55 + 0.35 * t), ang: rad, size: 1, k };
    case "vault": return inside(VAULT_SEEN, x, y) ? { c: mixC(mixC(VIOLET, ROSE, 0.35), mixC(ROSE, CREAM, 0.55), clamp(0.8 * (1 - ax / 2.3) + 0.2 * t)), ang: hoop(mx, my), size: 1, k } : null;
  }
};
const RBOX: Box = [0, 0, RW, RH];
const ringPasses = (): Pass[] => {
  const pts = (step: number, seed: number) => sweep(RBOX, step, seed, RW * 0.16, ringHere), r = rng(2200);
  // placement: the aisle's edges, the arch, the storeys, the runs set off toward the eye
  const placing = [plan(ms(ARCH), 4, 2010, 0.55), ...[-1, 1].flatMap((s, i) => [plan(ms([[s * A0, 0], [s * A0, LOW]]), 3.4, 2020 + i * 4), plan(ms([[s * A1, RAIL], [s * A1, CORN1]]), 3.4, 2030 + i * 4), plan([m(...toward([s * A0, LOW], 1)), m(...toward([s * A0, LOW], 1.6))], 3, 2040 + i * 4, 0.4), plan([m(...toward([s * A0, 0], 1)), m(...toward([s * A0, 0], 2.2))], 3, 2050 + i * 4, 0.4)])].flat();
  // (5) the books on the shelves, one upright dab each from its head down, barely touching; a gilt fleck on some
  const books: Mark[] = [], gilt: Mark[] = [];
  const row = (s: number, y0: number, y1: number, x0: number, x1: number, sh: number) => {
    for (let x = x0; x < x1;) {
      const w = 0.035 + r() * 0.045, X = s * (x + w / 2), top = y1 - r() * 0.1; x += w; if (r() < 0.05) continue;
      if (!seen(X, (y0 + top) / 2)) continue;
      const c = broken(mixC(pick(SPINES, r), VIOLET, clamp(sh - (rLit(X, y0) - 0.9) * 0.9)), r, 0.02, 0.06), a = m(X + (r() - 0.5) * 0.01, top), b = m(X, y0 + 0.02);
      books.push({ a, b, bend: (r() - 0.5) * 2, w: w * RP * 0.9, rgb: c, alpha: 0.96, seed: 30000 + books.length, kind: 0 });
      if (r() < 0.16) gilt.push(mk(...m(X, top - 0.05), 0, w * RP * 0.6, 2.6, r() < 0.6 ? YELLOW : CREAM, 38000 + gilt.length));
    }
  };
  [-1, 1].forEach((s) => {
    for (let i = 0; i < 10; i++) row(s, 0.24 + i * 0.366, 0.24 + i * 0.366 + 0.33, 2.58, 4.7, 0.34);
    for (let i = 0; i < 11; i++) { const y0 = FASC + 0.1 + i * 0.37, x1 = Math.min(4.7, (A0 * (y0 + 0.2 - EYE_Y)) / (RAIL - EYE_Y) + 0.2); if (x1 > 2.75) row(s, y0, y0 + 0.33, 2.72, x1, 0.12); }
  });
  const both = (f: (s: number) => Mark[]) => [...f(-1), ...f(1)], lit = (x: number, y: number, v: number) => oak(v + 0.35 * clamp((rLit(x, y) - 0.7) / 0.44));
  // the shelves' lips under the books, the pilasters and their capitals, the upper pilasters
  const frame = both((s) => [
    ...Array.from({ length: 11 }, (_, i) => dabs(ms([[s * 2.56, 0.215 + i * 0.366], [s * 5.4, 0.22 + i * 0.366]]), 7, ([x, y]) => mixC(lit(...mOf(x, y), 0.2), VIOLET, 0.3), 2400 + i + (s > 0 ? 20 : 0), 3.4)).flat(),
    ...Array.from({ length: 11 }, (_, i) => dabs(ms([[s * 2.7, FASC + 0.08 + i * 0.37], [s * 5.4, FASC + 0.08 + i * 0.37]]), 7, ([x, y]) => mixC(lit(...mOf(x, y), 0.3), VIOLET, 0.2), 2440 + i + (s > 0 ? 20 : 0), 3.4)).flat(),
    ...[2.28, 2.45].flatMap((x, k) => dabs(ms([[s * x, 0.05], [s * x, LOW - 0.05]]), 0.09 * RP, () => lit(s * x, 2, 0.2), 2500 + k + (s > 0 ? 10 : 0))),
    ...dabs(ms([[s * 2.14, 0.08], [s * 2.14, LOW - 0.08]]), 0.08 * RP, () => lit(s * 2.1, 2, 0.55), 2503 + (s > 0 ? 10 : 0)),
    ...dabs(ms([[s * A0, 3.84], [s * 2.62, 3.84]]), 0.12 * RP, () => lit(s * 2.3, 3.8, 0.55), 2504 + (s > 0 ? 10 : 0)),
    ...dabs(ms([[s * A0, 0.1], [s * 2.62, 0.1]]), 0.16 * RP, () => lit(s * 2.3, 0.1, 0.15), 2505 + (s > 0 ? 10 : 0)),
    ...[2.42, 2.6].flatMap((x, k) => dabs(ms([[s * x, 5.3], [s * x, CORN0 - 0.05]]), 0.09 * RP, () => lit(s * x, 7, 0.35), 2506 + k + (s > 0 ? 10 : 0))),
    ...dabs(ms([[s * A1, CORN0 - 0.2], [s * 2.74, CORN0 - 0.2]]), 0.1 * RP, () => lit(s * 2.4, 8.4, 0.55), 2508 + (s > 0 ? 10 : 0)),
  ]);
  // the runs down the nave restated along their rays: the rail and the fascia's lit edges, the cornice's, and violet under the gallery and at the stacks' feet
  const runOf = (p: P, t0: number, t1: number, w: number, col: RGB, seed: number) => dabs([t0, (t0 + t1) / 2, t1].map((t) => m(...toward(p, t))), w, () => col, seed, 3.2);
  const runs = both((s) => [
    ...runOf([s * A0, RAIL], 1, 1.9, 5, mixC(CREAM, ORANGE, 0.2), 3200 + (s > 0 ? 20 : 0)), ...runOf([s * A0, RAIL - 0.06], 1, 1.9, 6, oak(0.55), 3210 + (s > 0 ? 20 : 0)),
    ...runOf([s * A0, FASC + 0.04], 1, 1.9, 5, oak(0.45), 3220 + (s > 0 ? 20 : 0)), ...runOf([s * A0, FASC], 1, 1.9, 4, mixC(CREAM, ROSE, 0.2), 3240 + (s > 0 ? 20 : 0)),
    ...runOf([s * A1, CORN0], 1, 1.4, 4, mixC(CREAM, ORANGE, 0.25), 3280 + (s > 0 ? 20 : 0)),
    ...runOf([s * A0, LOW - 0.02], 1, 1.9, 5, mixC(DEEP, VIOLET, 0.45), 3400 + (s > 0 ? 20 : 0)), ...runOf([s * A0, 0.01], 1, 2.5, 6, mixC(VIOLET, ULTRA, 0.3), 3440 + (s > 0 ? 20 : 0)),
    // the balusters, closing up as they go away down the nave
    ...Array.from({ length: 9 }, (_, i) => { const t = 1.03 + i * 0.1 * (1 + i * 0.03); return dabs([m(...toward([s * A0, FASC + 0.08], t)), m(...toward([s * A0, RAIL - 0.06], t))], Math.max(3, 0.045 * t * RP), () => oak(0.5 + 0.15 * (s > 0 ? 1 : 0)), 2880 + i + (s > 0 ? 30 : 0), 2.4); }).flat(),
  ]);
  // the rib: rows of dabs round the arch at the ring's plane, its soffit lit on the crown; the vault's joints violet across it
  const arcAt = (t: number) => ms(ARCH.map((p) => toward(p, t)));
  const rib = [...[1.006, 1.02, 1.034].flatMap((t, k) => dabs(arcAt(t), 0.1 * RP, ([x]) => mixC(oak(0.62 - k * 0.12), CREAM, k ? 0 : 0.3 * Math.exp(-(((x - RW / 2) / 300) ** 2))), 3060 + k, 2.4)),
    ...[1.11, 1.22].flatMap((t, k) => dabs(arcAt(t), 3.2, () => mixC(VIOLET, ULTRA, 0.3), 3020 + k, 4, 0.8))];
  // the boards' joints along the aisle, in thin violet, and the threshold where one bay's floor meets the next
  const boards = [...Array.from({ length: 15 }, (_, i) => { const x0 = (i - 7) * 0.3; return plan([m(...toward([x0, 0], 1)), m(...toward([x0, 0], 2)), m(...toward([x0, 0], 3.4))], 2.2, 3140 + i * 3, 0.4).map((o) => ({ ...o, rgb: mixC(VIOLET, ULTRA, 0.4) })); }).flat(),
    ...dabs(ms([[-A0 - 0.1, -0.014], [A0 + 0.1, -0.014]]), 5, () => mixC(VIOLET, DEEP, 0.4), 3160)];
  // (7) the far window along the polished aisle: horizontal bars of cream, yellow and pink, widening toward us; gilt on the books
  const shine: Mark[] = [], sr = rng(3500);
  for (let k = 0, got = 0; k < 8000 && got < 150; k++) { const mx = (sr() - 0.5) * 1.8, my = -sr() * 2, a = aisle(mx) ** 2; if (sr() > a || zoneAt(mx, my) !== "floor" || !seen(mx, my)) continue; got++; const [x, y] = m(mx, my), near = clamp(-my / 2); shine.push(mk(x, y, (sr() - 0.5) * 0.06, (14 + sr() * 26) * (0.7 + near), 4 + 3 * near, pick([CREAM, WHITE, [250, 214, 120], [246, 182, 170]], sr), 36000 + got, 0, 0.93)); }
  const all = sweep(RBOX, 28, 2100, RW * 0.2, ringHere);
  return passes({
    scrub: scrub(RBOX, 110, 2000), plan: placing,
    mass: masses(all, ringHere, 72, 42, 21), brk: brokens(pts(14, 2150), 30, 9, 22),
    det: [...frame, ...books, ...runs, ...rib, ...boards], acc: accents(RBOX, ringHere, 380, 26, 8, 23), last: [...shine, ...gilt],
  });
};

// the busts and the ladder: dabs alone on their overlay cards, in the ring's px (the card moves them to the overlay's corner)
const MARBLE: RGB[] = [[126, 106, 186], [178, 150, 206], [236, 206, 200], [252, 238, 200]];   // violet turned away, lilac, pink, cream and a little chrome yellow full in the light
const marbleCol = (b: Bust, mx: number, my: number) => { const I = marbleI(b, mx, my); return mixC(ramp(MARBLE, clamp((I - 0.18) * 1.5)), ORANGE, 0.28 * clamp(1 - I * 2.2) * (my < 1.95 ? 1 : 0.5)); };   // the oak's warm light thrown back into the shadow side
const bustPasses = (v: number, side: number) => (): Pass[] => {
  const b = BUSTS[v][side > 0 ? 1 : 0], sv = 8000 + v * 1000 + (side > 0 ? 500 : 0), r = rng(sv), M = marbleOf(b), ladder = ladderSide(v) === side, [lx0, lx1] = ladderX(v);
  const inM = (mx: number, my: number) => M.some((p) => inside(p, mx, my)), pedOf = (mx: number, my: number) => b.ped.findIndex((p) => inside(p, mx, my));
  const here: Field = (x, y) => {
    const [mx, my] = mOf(x, y);
    if (inM(mx, my)) { const hd = my > 1.9; return { c: marbleCol(b, mx, my), ang: hd ? -Math.PI / 2 + 0.2 * b.f : 0.1 * b.f, size: hd ? 0.5 : 0.8, k: 1 }; }
    const p = pedOf(mx, my); if (p < 0) return null;
    return { c: oak(p === 1 ? 0.25 + 0.4 * clamp(0.5 - (mx - b.x) * 2.4) : 0.45 + 0.25 * clamp(0.5 - (mx - b.x) * 2)), ang: p === 1 ? -Math.PI / 2 : 0, size: 0.8, k: 0 };
  };
  const [cx] = m(b.x, 1.4), bx: Box = [cx - 0.4 * RP, m(0, 2.4)[1], cx + 0.4 * RP, m(0, -0.05)[1]];
  // the ladder: its rails upright, lit on the window side, the rungs across
  const lad: Mark[] = !ladder ? [] : [...[lx0, lx1].flatMap((f, k) => dabs(ms([[f(0), 0.02], [f(1.98), 1.98], [f(3.96), 3.96]]), 0.05 * RP, ([x, y]) => oak(0.5 + 0.3 * clamp((rLit(...mOf(x, y)) - 0.7) / 0.44)), sv + 10 + k, 3)),
    ...Array.from({ length: 12 }, (_, i) => { const y = 0.3 + i * 0.3; return dabs(ms([[lx0(y), y], [lx1(y), y + 0.012]]), 0.034 * RP, () => oak(0.55), sv + 20 + i, 2.2); }).flat(),
    ...[lx0, lx1].flatMap((f, k) => dabs(ms([[f(0.1) - ladderSide(v) * 0.022, 0.1], [f(3.9) - ladderSide(v) * 0.022, 3.9]]), 3, () => mixC(CREAM, ORANGE, 0.3), sv + 40 + k, 3.4))];
  // the marble's lights and its accents: cream and yellow on the lit side, the eyes' sockets, the nose's shadow, the mouth, under the jaw, in violet
  const f = b.f, hd = (x: number, y: number, dx: number, dy: number, w: number, c: RGB, seed: number) => dabs(ms([[x, y], [x + dx, y + dy]]), w, () => c, seed, 1.6);
  const lights = [...hd(b.hx - 0.035, b.hy + 0.065, 0.03, 0.01, 5, WHITE, sv + 310), ...hd(b.hx + f * 0.045, b.hy + 0.01, f * 0.012, -0.045, 3, CREAM, sv + 311), ...hd(b.hx - 0.055, b.hy - 0.02, 0.012, -0.035, 4, [252, 236, 190], sv + 312), ...hd(b.x - 0.24, 1.69, 0.12, 0.03, 6, WHITE, sv + 313), ...hd(b.x - 0.2, 1.36, 0.3, 0, 4, mixC(CREAM, ORANGE, 0.3), sv + 314), ...hd(b.x - 0.17, 0.25, 0, 0.95, 3.4, mixC(CREAM, ORANGE, 0.35), sv + 315)];
  const dark = mixC(VIOLET, ROSE, 0.25), accs = [...hd(b.hx - 0.012, b.hy + 0.018, 0.026, -0.006, 5, dark, sv + 320), ...hd(b.hx + f * 0.052, b.hy + 0.016, f * 0.022, -0.004, 4.4, dark, sv + 321), ...hd(b.hx + f * 0.03, b.hy - 0.048, f * 0.03, -0.002, 3, dark, sv + 322), ...hd(b.hx + f * 0.018, b.hy - 0.078, f * 0.032, 0.002, 2.4, ROSE, sv + 323),
    ...(b.head === "sage" ? [] : hd(b.hx - 0.06, b.hy - 0.128, 0.12, 0, 4, VIOLET, sv + 324)), ...hd(b.hx + 0.055, 1.91, -0.005, -0.07, 6, VIOLET, sv + 325), ...hd(b.x - 0.09, 1.45, 0.18, 0, 5, VIOLET, sv + 326), ...hd(b.x - 0.3, 0.02, 0.6, 0, 6, DEEP, sv + 327), ...hd(b.x + 0.08, 1.58, 0.14, 0.06, 5, ORANGE, sv + 328)];
  // the hair in short touches every which way
  const curls: Mark[] = []; [...b.back, ...b.front].forEach((hp) => { for (let k = 0; k < 40; k++) { const [x0, y0] = hp[Math.floor(r() * hp.length)], [cx2, cy2] = hp.reduce((a, p) => [a[0] + p[0] / hp.length, a[1] + p[1] / hp.length], [0, 0]), t = r() * 0.9, mx = cx2 + (x0 - cx2) * t, my = cy2 + (y0 - cy2) * t; if (!inside(hp, mx, my)) continue; const [x, y] = m(mx, my); curls.push(mk(x, y, r() * 6.28, 6, 3.4, broken(marbleCol(b, mx, my), r, 0.03, 0.1), sv * 10 + curls.length)); } });
  // the masses laid close, so no ring shows between the dabs: the form ends where they stop
  const pts = (step: number, seed: number) => sweep(bx, step, seed, 60, here);
  return passes({ mass: masses(pts(7, sv + 1), here, 18, 11, sv + 2), brk: brokens(pts(6, sv + 3), 14, 5, sv + 4), det: [...lad, ...curls, ...lights], acc: [...accents(bx, here, 30, 8, 3, sv + 5), ...accs] });
};

// ---------------------------------------------------------------- the far window
// The west end, 1:1 in the end view: the glass cream, white and chrome yellow laid every which way,
// orange and pink breaking its edge into the wall's glow; the wall violet going rose and orange into
// the light; the floor carrying the window toward us in flat bars
const farHere: Field = (x, y) => {
  const [mx, my] = fOf(x, y), g = glow(mx, my);
  if (inside(WINDOW, mx, my)) return { c: mixC(mixC(CREAM, WHITE, clamp(0.3 + 0.6 * g)), YELLOW, 0.25 * (1 - g)), ang: (fractal(4001, x, y, 0.05, 0.05, 1) - 0.5) * 4, size: 0.7, k: 0 };
  if (my < 0) return { c: mixC(mixC(ROSE, VIOLET, 0.35), mixC(CREAM, YELLOW, 0.3), clamp(g * 1.4 * Math.exp(-((mx / 1.1) ** 2)))), ang: (fractal(4002, x, y, 0.05, 0.05, 1) - 0.5) * 0.08, size: 1.2, k: 2 };
  return { c: mixC(mixC(LILAC, ROSE, 0.3), mixC(ORANGE, CREAM, 0.55), clamp(g * 1.1)), ang: -Math.PI / 2 + (fractal(4003, x, y, 0.05, 0.05, 1) - 0.5) * 0.3, size: 1, k: 1 };
};
const FBOX: Box = [0, 0, FW, FH];
const farPasses = (): Pass[] => {
  const r = rng(4700), edge: Mark[] = [], core: Mark[] = [];
  // the glass's edge broken out into the wall: orange and pink dabs astride it, never a clean line
  for (let i = 0; i < WINDOW.length; i++) { const a = WINDOW[i], b = WINDOW[(i + 1) % WINDOW.length], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.12)); for (let k = 0; k < n; k++) { const p = lerp2(a, b, (k + r()) / n), [x, y] = fms([p])[0]; edge.push(mk(x + (r() - 0.5) * 5, y + (r() - 0.5) * 5, Math.atan2(-(b[1] - a[1]), b[0] - a[0]) + (r() - 0.5) * 0.9, 7 + r() * 6, 3 + r() * 2, pick([ORANGE, [246, 160, 150], [250, 184, 110], ROSE], r), 47000 + edge.length)); } }
  for (let k = 0; k < 70; k++) { const x = (r() - 0.5) * 1.4, y = 4.2 + r() * 4.2; if (!inside(WINDOW, x, y) || glow(x, y) < 0.5) continue; const [px, py] = fms([[x, y]])[0]; core.push(mk(px, py, (r() - 0.5) * 3, 5 + r() * 5, 3 + r() * 2, pick([WHITE, [255, 246, 214], [252, 226, 150]], r), 48000 + core.length)); }
  const mull = (pts: P[], w: number, seed: number) => dabs(fms(pts), w, () => mixC(LILAC, VIOLET, 0.4), seed, 3);
  const bays = [-1, 1].flatMap((s, i) => [...dabs(fms([[s * 2.05, 0], [s * 2.05, 8.4]]), 0.2 * FP, () => mixC(ROSE, LILAC, 0.5), 4300 + i, 2.4), ...dabs(fms([[s * 1.62, 0], [s * 1.62, 8.2]]), 0.14 * FP, () => mixC(CREAM, ROSE, 0.35), 4302 + i, 2.4), ...dabs(fms([[s * 1.9, 1.3], [s * 1.9, 2.1]]), 0.12 * FP, () => WHITE, 4304 + i, 1.6), ...dabs(fms([[s * 2.2, 4.3], [s * 1.5, 4.3]]), 0.1 * FP, () => mixC(ORANGE, CREAM, 0.4), 4306 + i, 2.4)]);
  const refl: Mark[] = []; for (let k = 0, got = 0; k < 3000 && got < 90; k++) { const x = (r() - 0.5) * 2.6, y = -r() * 1.4; if (r() > Math.exp(-((x / 1) ** 2))) continue; got++; const [px, py] = fms([[x, y]])[0]; refl.push(mk(px, py, (r() - 0.5) * 0.05, 6 + r() * 10, 2.4 + r() * 1.6, pick([CREAM, WHITE, [250, 210, 120], [246, 178, 160]], r), 49000 + got)); }
  return passes({
    scrub: scrub(FBOX, 44, 4000), plan: [...plan(fms(WINDOW.concat([WINDOW[0]])), 2, 4010), ...plan(fms([[-3.5, 0], [3.5, 0]]), 2, 4030)],
    mass: masses(sweep(FBOX, 13, 4100, 90, farHere), farHere, 26, 12, 41), brk: brokens(sweep(FBOX, 6, 4200, 70, farHere), 12, 4.4, 42),
    det: [...bays, ...[-0.42, 0.42].flatMap((x, i) => mull([[x, WY0], [x, WY1 + 1.1]], 2.4, 4400 + i)), ...[4.4, 6.4, WY1].flatMap((y, i) => mull([[-WX, y], [WX, y]], 2.2, 4410 + i)), ...edge],
    acc: accents(FBOX, farHere, 60, 8, 3, 43), last: [...core, ...refl],
  });
};

// ---------------------------------------------------------------- the reading table
// In the table's frame px (the card adds PAD). The oak by temperature: chrome yellow and orange in
// the lamp's pool, cream and pink where the high windows lie along the polish, rose going violet
// to the right and toward us; the books' cast shadows cobalt violet
const FACES = BOOKS.map(faces);
const oakT = (x: number, y: number) => clamp(0.34 - 0.2 * (x / W) + 0.06 * clamp((y - 200) / 300) - 0.12 * clamp((y - 560) / 280) + 0.5 * pool(x, y) + (fractal(9, x, y, 0.03, 0.002, 2) - 0.5) * 0.14);
const oakCol = (x: number, y: number): RGB => { let c = mixC(oak(oakT(x, y)), YELLOW, 0.3 * pool(x, y)); c = mixC(c, mixC(CREAM, ROSE, 0.3), 0.6 * sheen(x, y)); return mixC(c, mixC(VIOLET, ULTRA, 0.2), 0.8 * clamp((1 - shadowK(x, y)) / 0.6)); };
const skin = (b: Book, t: number) => ramp(SKIN[b.id], t);
const leather = (b: Book, u: number, v: number, x: number, y: number) => mixC(skin(b, clamp(((boardLight(u, v) + 0.2 * pool(x, y) + (fractal(20 + b.seed, x, y, 0.045, 0.045, 2) - 0.5) * 0.09) * b.light - 0.28) / 0.46)), YELLOW, 0.1 * pool(x, y));
const PAGE = (lit: number) => mixC(mixC(LILAC, CREAM, lit), WHITE, 0.2 * lit);
const faceCol = (b: Book, f: Face, x: number, y: number): RGB => {
  const [p0, , , p3] = f.pts, ex = p3[0] - p0[0], ey = p3[1] - p0[1], h = clamp(((x - p0[0]) * ex + (y - p0[1]) * ey) / (ex * ex + ey * ey));
  if (f.kind === "spine") return skin(b, 0.55 - 0.45 * h);
  return h < 0.16 || h > 0.84 ? skin(b, 0.2) : PAGE((f.kind === "tail" ? 0.75 : 0.35) - 0.3 * h);
};
const bookHere = (i: number, x: number, y: number): Here | null => {
  const b = BOOKS[i], [u, v] = uvOf(b, x, y);
  if (u >= 0 && u <= 1 && v >= 0 && v <= 1) {
    if (inBox(u, v, plateBox(b), -0.004)) return null;
    const lab = inBox(u, v, labelBox(b));
    return { c: lab ? skin(b, 0.12 + 0.12 * boardLight(u, v)) : leather(b, u, v, x, y), ang: along(b)(x, y), size: lab ? 0.6 : 1, k: 1 };
  }
  for (const f of FACES[i]) if (inside(f.pts, x, y)) return { c: faceCol(b, f, x, y), ang: Math.atan2(f.pts[1][1] - f.pts[0][1], f.pts[1][0] - f.pts[0][0]), size: 0.8, k: 1 };
  return null;
};
const bookAt = (x: number, y: number) => { for (let i = 0; i < BOOKS.length; i++) if (inside(HOLES[i], x, y)) return i; return -1; };
// the chimney shows the room through the glass, the flame's own light only close round it; the brass warm on the window side, violet turned away
const lampHere = (x: number, y: number): Here => (inChimney(x, y) ? { c: mixC(mixC(LILAC, ROSE, 0.4), [255, 236, 180], Math.exp(-((x - FLAME[0]) ** 2 + ((y - FLAME[1]) * 0.8) ** 2) / 500)), ang: -Math.PI / 2, size: 1, k: 2 } : { c: ramp(BRASS, brassI(x, y) * 0.95 + 0.05), ang: -Math.PI / 2, size: 1, k: 2 });
// the oak (top, lip and the dark front) and the lamp; the books have a field of their own, painted finer
const tableHere: Field = (x, y) => {
  if (inside(LAMP, x, y) || bookAt(x, y) >= 0) return null;
  if (inside(TOP, x, y)) return { c: oakCol(x, y), ang: grain(x, y), size: 1, k: 0 };
  if (inside(EDGE, x, y)) { const h = clamp((y - EDGE[0][1]) / (EDGE[3][1] - EDGE[0][1])), s = clamp((x - EDGE[0][0]) / (EDGE[1][0] - EDGE[0][0])); return { c: h < 0.4 ? mixC(oak(0.72 - 0.3 * s), CREAM, 0.2) : mixC(oak(0.3 - 0.2 * s), VIOLET, 0.3), ang: 0.01, size: 1, k: 0 }; }
  if (y > 826) return { c: mixC(DEEP, VIOLET, 0.35 + 0.15 * clamp(1 - x / W)), ang: 0.01, size: 1.3, k: 0 };
  return null;
};
const booksHere: Field = (x, y) => { const i = bookAt(x, y); return i < 0 ? null : bookHere(i, x, y); };
const lampField: Field = (x, y) => (inside(LAMP, x, y) ? lampHere(x, y) : null);
const LBOX: Box = (() => { const xs = LAMP.map((p) => p[0]), ys = LAMP.map((p) => p[1]); return [Math.min(...xs) - 3, Math.min(...ys) - 3, Math.max(...xs) + 3, Math.max(...ys) + 3]; })();
const TBOX: Box = [-PAD, 150, W + PAD, H + 20];
const tablePasses = (): Pass[] => {
  const bxs = BOOKS.map((b) => { const q = HOLES[BOOKS.indexOf(b)], xs = q.map((p) => p[0]), ys = q.map((p) => p[1]); return [Math.min(...xs) - 4, Math.min(...ys) - 4, Math.max(...xs) + 4, Math.max(...ys) + 4] as Box; });
  const bookPts = (step: number, seed: number) => bxs.flatMap((bx, i) => sweep(bx, step, seed + i, 60, booksHere));
  const placing = [...plan([TOP[0], TOP[1], TOP[2], TOP[3]], 3, 40), ...plan([EDGE[0], EDGE[1]], 3, 44), ...plan(LAMP.slice(0, 17), 2.4, 46), ...plan(LAMP.slice(17), 2.4, 64, 0.45),
    ...BOOKS.flatMap((b, i) => plan([...quad(b, ...plateBox(b)), quad(b, ...plateBox(b))[0]], 2, 105 + i * 10, 0.4))];
  // (5) the books restated: the bands and the joint on the round back, the plate set into its sunk frame, the leather dragged over its edges, the gilt
  const det: Item[] = [];
  BOOKS.forEach((b, i) => {
    const r = rng(500 + i), bx = plateBox(b), q = quad(b, ...bx), sk = (t: number) => () => skin(b, t);
    BANDS.forEach((v, k) => det.push(...dabs([bp(b, 0.015, v + 0.011), bp(b, SPINE * 0.95, v + 0.011)], 2.4, sk(0.1), 810 + i * 20 + k, 2), ...dabs([bp(b, 0.015, v), bp(b, SPINE * 0.95, v)], 3.4, () => mixC(skin(b, 0.9), CREAM, 0.25), 800 + i * 20 + k, 2)));
    det.push(...dabs([bp(b, SPINE * 1.1, 0.01), bp(b, SPINE * 1.1, 0.5), bp(b, SPINE * 1.1, 0.99)], 2.2, sk(0.05), 830 + i, 3));
    det.push((c, env, p) => setPlate(c, env, b, p, css(mixC(skin(b, 0.1), VIOLET, 0.3)), () => {}));
    plateEdges(b).forEach(([a, c, o]) => { for (let k = 0; k < 8; k++) { if (r() < 0.5) continue; const t = (k + 0.2 + r() * 0.6) / 8, mm = lerp2(a, c, t), d: P = [(c[0] - a[0]) * 0.06, (c[1] - a[1]) * 0.06], p0 = bp(b, mm[0] - d[0] + o[0], mm[1] - d[1] + o[1]), p1 = bp(b, mm[0] + d[0] + o[0], mm[1] + d[1] + o[1]), [u, v] = uvOf(b, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2);
      det.push({ a: p0, b: p1, bend: 0, w: 5, rgb: broken(leather(b, u, v, p0[0], p0[1]), r, 0.02, 0.05), alpha: 0.95, seed: 520 + i * 40 + k, kind: 0 }); } });
    const dk = mixC(DEEP, VIOLET, 0.2), lt = mixC(CREAM, skin(b, 1), 0.3);
    det.push(...dabs([q[0], q[1]], 3.2, () => dk, 540 + i * 4, 3), ...dabs([q[3], q[0]], 3.2, () => dk, 541 + i * 4, 3), ...dabs([q[1], q[2]], 1.8, () => lt, 542 + i * 4, 3), ...dabs([q[2], q[3]], 1.8, () => lt, 543 + i * 4, 3));
    // the gilt: the plate's rule, the board's fillet, the label's rule, and the title, dabs of chrome yellow and cream in a tooled groove of ultramarine and rose
    const pad = 0.022, lines = [...rule(b, [bx[0] - pad, bx[1] - (pad * b.w) / b.d, bx[2] + pad, bx[3] + (pad * b.w) / b.d]), ...rule(b, [SPINE + 0.045, 0.032, 0.968, 0.968]), ...rule(b, labelBox(b))];
    const titles = titleLines(b), tw = Math.max(2.2, titles[0].cap * 1175 * 0.1), letters = titles.flatMap((t) => t.pts.map((pl) => onBook(b, pl))), gold = (k: number) => () => (k % 3 === 1 ? CREAM : k % 3 === 2 ? [250, 218, 110] as RGB : YELLOW);
    det.push(...letters.flatMap((l, k) => dabs(shift(l, 0.6, 0.7), tw + 1.2, () => DEEP, 650 + i * 100 + k, 2, 0.85)));
    det.push(...lines.flatMap((l, k) => dabs(l, 1.8, gold(k), 700 + i * 100 + k, 3.4)), ...letters.flatMap((l, k) => dabs(l, tw, gold(k), 750 + i * 100 + k, 1.7)));
  });
  // the lamp: the flame's cream core laid every which way, chrome yellow and orange round it; the chimney's lit edge; glints on the brass
  const [fx, fy] = FLAME, fr = rng(1000), flame: Mark[] = [];
  for (let k = 0; k < 14; k++) { const a = fr() * 6.28, q = fr() * 6; flame.push(mk(fx + Math.cos(a) * q * 0.7, fy - 3 + Math.sin(a) * q * 1.6, -Math.PI / 2 + (fr() - 0.5) * 1.2, 5 + fr() * 5, 2.6 + fr() * 1.6, pick(k < 5 ? [[255, 250, 232], [255, 240, 196]] : [YELLOW, ORANGE, [252, 214, 120]], fr), 1000 + k)); }
  const lampDet = [...dabs(chim(155 * LS, 205 * LS, -0.72), 2.4, () => WHITE, 1001, 3), ...dabs(chim(158 * LS, 180 * LS, 0.72), 2, () => ORANGE, 1002, 3), ...flame];
  const glints = [dabs([LA(-17, 122), LA(-19, 113), LA(-15, 103)], 4.4, () => [255, 246, 214], 1010, 1.6), dabs([LA(-30, 9), LA(-12, 13)], 3.6, () => CREAM, 1011, 2), dabs([LA(-3.5, 34), LA(-3.5, 72)], 2.4, () => [252, 226, 150], 1012, 3), dabs([LA(-9, 139), LA(6, 139)], 3, () => WHITE, 1013, 2)].flat();
  // where each book presses on the oak and the lamp's foot, ultramarine and rose
  const off = (ms: Mark[]) => ms.filter((o) => { const [x, y] = lerp2(o.a, o.b, 0.5); return !HOLES.some((h) => inside(h, x, y)); });   // only where the oak is, not over the book
  const contact = [...BOOKS.flatMap((b, i) => { const tl = faces(b)[0].pts; return [...dabs(shift([tl[3], tl[2]], 0, 1.5), 4, () => DEEP, 1100 + i, 3), ...off(dabs([bp(b, 1, 1, 0), bp(b, 1, 0, 0)], 5, () => mixC(DEEP, VIOLET, 0.3), 1110 + i, 3))]; }), ...dabs([LA(-40, -4), LA(0, -7), LA(42, -5)], 4, () => mixC(DEEP, VIOLET, 0.4), 1120, 3)];
  // the high windows along the polish: short flat bars of cream and pink; the lamp's pool in chrome yellow; glints on the gilt
  const sr = rng(1200), sheenBars: Mark[] = [];
  for (let k = 0, got = 0; k < 6000 && got < 70; k++) { const x = 300 + sr() * 1000, y = 200 + sr() * 140; if (sr() > sheen(x, y) + 0.4 * pool(x, y) || !inside(TOP, x, y) || bookAt(x, y) >= 0 || inside(LAMP, x, y) || shadowK(x, y) < 1) continue; got++; sheenBars.push(mk(x, y, grain(x, y) + Math.PI / 2 + (sr() - 0.5) * 0.1, 8 + sr() * 14, 2.6 + sr() * 1.6, sheen(x, y) > pool(x, y) ? pick([CREAM, WHITE, [246, 190, 190]], sr) : pick([[252, 220, 110], [255, 238, 170]], sr), 1200 + got)); }
  const gl = rng(900), gtw = (b: Book) => Math.max(2.2, titleLines(b)[0].cap * 1175 * 0.1), glints2: Mark[] = [];
  BOOKS.forEach((b, i) => titleLines(b).flatMap((t) => t.pts.map((pl) => onBook(b, pl))).forEach((l, k) => { if (gl() < 0.82) return; const j = Math.floor((l.length - 1) / 2), a = l[j], c = l[j + 1], t = 0.25 + gl() * 0.3, p0 = lerp2(a, c, t), p1 = lerp2(a, c, t + 0.3); glints2.push({ a: p0, b: p1, bend: 0, w: gtw(b) * 0.8, rgb: [255, 250, 226], alpha: 0.95, seed: 950 + i * 50 + k, kind: 0 }); }));
  const oakPts = sweep(TBOX, 26, 110, 300, tableHere);
  return passes({
    scrub: scrub(TBOX, 64, 10), plan: placing,
    mass: [...masses(oakPts, tableHere, 64, 28, 11), ...masses(bookPts(9, 140), booksHere, 20, 10, 12), ...masses(sweep(LBOX, 5, 160, 30, lampField), lampField, 14, 7, 17)],
    brk: [...brokens(sweep(TBOX, 11, 210, 240, tableHere), 26, 8, 13), ...brokens(bookPts(4.6, 250), 10, 3.6, 14), ...brokens(sweep(LBOX, 3, 260, 30, lampField), 9, 3, 18)],
    det: [...lampDet, ...det], acc: [...accents(TBOX, tableHere, 260, 20, 6, 15), ...accents([-PAD, 150, W + PAD, H], booksHere, 40, 7, 2.6, 16), ...contact], last: [...sheenBars, ...glints, ...glints2],
  });
};

// ---------------------------------------------------------------- the cards and the room
const ART: Record<string, Art> = {
  far: card("far", FW, FH, [0, 0], farPasses, true),
  ring: card("ring", RW, RH, [0, 0], ringPasses, true, (c, env) => cut(c, env, null, RING_HOLE)),
  ...Object.fromEntries([0, 1].flatMap((v) => [-1, 1].map((s) => { const id = `busts${"AB"[v]}${s > 0 ? "R" : "L"}`; const [ox, oy] = ovAt(s); return [id, card(id, OW, OH, [-ox, -oy], bustPasses(v, s), false)]; }))),
  table: card("table", TW, H, [PAD, 0], tablePasses, true, (c, env) => cut(c, env, TABLE_KEEP)),
};
const BROKEN: Look = { ...BROKEN_ROOM, title: "La Bibliothèque · la galerie, couleur brisée", art: ART };
export const libraryBroken = libraryFilm(BROKEN);
export const libraryBrokenCards = cardsOf(BROKEN);   // each card on its own, finished: { w, h, paint(env) }
