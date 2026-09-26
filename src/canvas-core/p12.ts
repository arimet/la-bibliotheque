// PAGE 12 · LE DERNIER DUEL. One idea: you won, and there is nothing left but a hole in the
// ground. The SF is gone; the old sepia world closes back over it, drained and cold.
// Focal subject: the hero, small, seen from behind, leading his horse toward the mesa edge,
// his long shadow running back to the one thing left of the night: Callahan's pale hat in the dust.
// Middle ground: the black crater, a scorched ring of glassy sand, a thread of smoke.
// One light: the dawn, a sliver of sun on the horizon just right of the hero. Everything is
// contre-jour: figures dark, shadows long and cool, all falling toward the reader.
// What moves: the smoke thread rising and curling, ash flakes drifting down, a vulture circling
// high, the hero's duster and the horse's tail and mane in the dawn breeze, the dawn glow breathing.
import { rng, type P } from "./core";
import { blob, clamp, fillShape, inside, lerpP, mix } from "./gallery";
import { page, perspective, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const INK = "#2b1a10", PAPER = "#f3e7cf";
const ASH = "#8e8984", ASH_LT = "#b7b0a6", ASH_DK = "#4a4440", CHAR = "#1d1511", DARK = "#3a2418", UMBER = "#7d5234", OCHRE = "#c99a58";
const ROSE = "#d9a07e", GLOW = "#efc98f", SHADE = "#76707c", HAZE = "#a79ea6", SKY = "#8a8894", GLINT = "#fbf5e6", RIM = "#f8e2b4";

// ---------------------------------------------------------------- the camera, standing on the mesa
const VPX = 800, HOR = 468, K = 900 - HOR;
const { G, U } = perspective([VPX, HOR]);
const SUN: P = [1230, HOR]; // the point on the horizon every shadow runs away from
const toW = ([x, y]: P): [number, number] => { const z = K / (y - HOR); return [(x - VPX) * z, z]; };
// a shadow lying on the ground: from `foot`, `len` depth units toward the reader, half-width hw(t) in ground units
const A = (SUN[0] - VPX) / 1000, NL = Math.hypot(A, 1);
const shadow = (foot: P, len: number, hw: (t: number) => number, t0 = 0, n = 22): P[] => {
  const [u0, z0] = toW(foot), L: P[] = [], R: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = t0 + ((1 - t0) * i) / n, u = u0 - A * 1000 * len * t, z = Math.max(0.42, z0 - len * t), w = hw(t);
    L.push(G(u - w / NL, z + (w * A) / NL / 1000)); R.push(G(u + w / NL, z - (w * A) / NL / 1000));
  }
  return [...L, ...R.reverse()];
};
const prof = (k: [number, number][]) => (t: number) => { for (let i = 1; i < k.length; i++) if (t <= k[i][0]) { const f = (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]); return k[i - 1][1] + (k[i][1] - k[i - 1][1]) * f; } return k[k.length - 1][1]; };
// the screen direction of a cast shadow at a point: straight away from the sun
const away = ([x, y]: P): P => { const dx = x - SUN[0], dy = y - SUN[1] + 6, l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
const hull = (pts: P[]): P[] => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P[] = [], up: P[] = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

// ---------------------------------------------------------------- the land
const EDGE: P[] = [[-20, 522], [140, 519], [300, 523], [470, 518], [640, 521], [820, 517], [1000, 520], [1180, 518], [1360, 522], [1500, 519], [1620, 521]];
const BUTTES: P[][] = [
  [[10, HOR], [26, 452], [40, 441], [238, 438], [252, 447], [284, 454], [312, HOR]],
  [[520, HOR], [531, 454], [546, 447], [570, 447], [582, 458], [592, HOR]],
  [[1336, HOR], [1346, 450], [1356, 432], [1402, 430], [1413, 447], [1430, HOR]],
  [[1452, HOR], [1472, 458], [1540, 455], [1620, 453]],
];
const CAP: P[] = Array.from({ length: 14 }, (_, i) => { const a = 0.34 + (i / 13) * (Math.PI - 0.68); return [SUN[0] + 24 * Math.cos(a), 476 - 24 * Math.sin(a)] as P; }); // the sun's first sliver

// ---------------------------------------------------------------- the crater, laid out on the ground
const CU = -584, CZ = 1.946, R = 520, RH = 92, FOOT = 1.25; // RH: the rim stands this high; FOOT: where the mound meets the ground
const cw = (r: number, a: number, h = 0): P => U(CU + r * Math.cos(a), CZ + (r / 1000) * Math.sin(a), h); // a in (0, pi) is the far side
// the blast did not cut a clean circle: the crest wanders in and out
const crest = (a: number) => 1 + 0.045 * Math.sin(3 * a + 1) + 0.035 * Math.sin(7 * a + 2) + 0.02 * Math.sin(13 * a + 0.5);
const lip = (k: number, h: number, a0: number, a1: number, n: number) => Array.from({ length: n }, (_, i) => { const a = a0 + ((a1 - a0) * i) / (n - 1); return cw(R * k * crest(a), a, h); });
const ring = (r: number, h: number, a0: number, a1: number, n: number) => Array.from({ length: n }, (_, i) => cw(r, a0 + ((a1 - a0) * i) / (n - 1), h));
const BOWL = lip(1, RH, 0, Math.PI * 2, 49).slice(0, -1);
const NEAR_SLOPE = [...lip(1.02, RH - 6, Math.PI, Math.PI * 2, 18), ...lip(FOOT, 0, Math.PI * 2, Math.PI, 18)];
// clods thrown up on the rim, breaking its line
const CLODS: P[][] = [0.35, 0.8, 1.25, 1.9, 2.5, 2.85, 3.5, 4.3, 5.1, 5.8].map((a, i) => { const [x, y] = cw(R * crest(a) * 1.01, a, RH - 2), k = (y - HOR) / 180, r = rng(3000 + i), w = (5 + r() * 8) * k, h = (3 + r() * 5) * k; return [[x - w, y + 1], [x - w * 0.6, y - h * 0.8], [x + (r() - 0.5) * w * 0.4, y - h], [x + w * 0.7, y - h * 0.6], [x + w, y + 1]] as P[]; });
const MOUND = ring(R * FOOT, 0, 0, Math.PI * 2, 41).slice(0, -1);
const scorch = (k: number, seed: number): P[] => { const r = rng(seed); return Array.from({ length: 46 }, (_, i) => { const a = (i / 46) * Math.PI * 2, rr = R * k * crest(a) * (0.86 + 0.26 * r()) * (1 + 0.25 * Math.max(0, Math.sin(a * 7 + seed)) ** 6); return cw(rr, a); }); };
const SMOKE0 = cw(R * 0.25, Math.PI * 0.5, -30);

// ---------------------------------------------------------------- the horse, in profile, walking away to the right
// local units: withers height 100, x from the point of the buttock toward the head, y up
const HX = 875, HY = 592, HK = 1.19, HKX = 1.07;
const hs = ([x, y]: P): P => [HX + x * HKX, HY - y * HK];
const HORSE_L: P[] = [
  [3, 96], [16, 100], [32, 97], [48, 94], [66, 101], [79, 111], [91, 121], [101, 128], [99, 134], [103, 130], [106, 134], [107, 127],
  [112, 121], [118, 111], [124, 101], [130, 92], [132, 88], [129, 83], [121, 84], [113, 90], [106, 98], [103, 103], [101, 94], [102, 84], [106, 74], [102, 62], [97, 56],
  [95, 42], [96, 30], [96, 13], [98, 6], [100, 0], [92, 0], [91, 6], [89, 13], [89, 30], [88, 42], [86, 51],
  [80, 51], [62, 49], [44, 50], [31, 54], [25, 42], [19, 29], [18, 12], [20, 5], [22, 0], [14, 0], [13, 5], [12, 12], [8, 29], [3, 42], [-2, 60], [-1, 77], [1, 88],
];
const HORSE = HORSE_L.map(hs);
const FAR_FRONT = ([[84, 50], [89, 39], [91, 28], [87, 14], [84, 9], [78, 9], [79, 14], [83, 27], [80, 40], [78, 49]] as P[]).map(hs);
const FAR_HIND = ([[36, 51], [33, 40], [30, 28], [31, 10], [34, 0], [27, 0], [25, 9], [23, 28], [26, 42], [28, 52]] as P[]).map(hs);
const BIT = hs([129, 86]);

// ---------------------------------------------------------------- the hero, from behind (drawn in anim: his coat moves)
const F: P = [1120, 580];
const HERO_HIDE = ([[-16, -127], [16, -127], [21, -100], [24, -62], [24, -30], [14, 7], [-14, 7], [-32, -30], [-40, -66], [-30, -88], [-19, -104]] as P[]).map(([x, y]) => [F[0] + x, F[1] + y] as P);

// ---------------------------------------------------------------- Callahan's hat, lying in the dust
const HC: P = [928, 826], HROT = (-4 * Math.PI) / 180;
const hp = ([x, y]: P): P => [HC[0] + x * Math.cos(HROT) - y * Math.sin(HROT), HC[1] + x * Math.sin(HROT) + y * Math.cos(HROT)];
const brimAt = (a: number, dy = 0, k = 1): P => hp([120 * k * Math.cos(a), 30 * k * Math.sin(a) - 13 * Math.cos(a) ** 4 + 2 + dy]);
const BRIM = Array.from({ length: 36 }, (_, i) => brimAt((i / 36) * Math.PI * 2));
const baseAt = (a: number, lift = 0, k = 1): P => hp([-4 + 60 * k * Math.cos(a), -8 - lift + 14 * k * Math.sin(a)]);
const CROWN_TOP: P[] = ([[-64, -8], [-62, -30], [-57, -57], [-46, -68], [-27, -73], [-8, -68], [10, -75], [30, -73], [45, -63], [51, -36], [56, -8]] as P[]).map(hp);
const CROWN = [...CROWN_TOP, ...Array.from({ length: 12 }, (_, i) => baseAt((i / 11) * Math.PI))];
const BAND = [...Array.from({ length: 12 }, (_, i) => baseAt((i / 11) * Math.PI)), ...Array.from({ length: 12 }, (_, i) => baseAt(Math.PI - (i / 11) * Math.PI, 12, 0.98))];
const HAT = hull([...BRIM, ...CROWN]);
const HAT_SHADOW: P[] = [...Array.from({ length: 14 }, (_, i) => brimAt((i / 13) * Math.PI)).map(([x, y]) => [x - 30, y + 26] as P), hp([-170, 70]), hp([-120, 30])];

// ---------------------------------------------------------------- the pen, in the order a hand draws it
const pebbles = (() => {
  const r = rng(1200), out: Omit<Stroke, "at">[] = [], shadows: Omit<Stroke, "at">[] = [];
  const keepOut = [MOUND, HAT, HERO_HIDE, HORSE];
  for (let i = 0; out.length < 44 && i < 400; i++) {
    const x = -20 + r() * 1640, z = 1.02 + r() * r() * 6.6, y = HOR + K / z;
    if (y < 528 || keepOut.some((q) => inside(q, x, y) || inside(q, x, y - 24) || inside(q, x + 20, y))) continue;
    const s = (6 + r() * 15) / Math.sqrt(z), [dx, dy] = away([x, y]), L = s * (1.6 + r() * 1.1);
    out.push(st([[x - s / 2, y], [x - s * 0.2, y - s * 0.45], [x + s * 0.3, y - s * 0.4], [x + s / 2, y]], Math.max(0.6, 1.4 / Math.sqrt(z)), 1210 + i, 0.5 + 0.25 / z, 0.4));
    if (s > 6) shadows.push({ ...st([[x + dx * s * 0.4, y + 1 + dy * s * 0.4], [x + dx * L, y + 1 + dy * L]], s * 0.3, 1400 + i, 0.16, 0.3), color: SHADE });
  }
  return { out, shadows };
})();
const tufts = ([[160, 560], [360, 606], [1320, 590], [1480, 640], [1230, 770], [96, 846], [1440, 862], [640, 566]] as P[]).flatMap(([x, y], i) => {
  const k = (y - HOR) / 100, [dx, dy] = away([x, y]), r = rng(1600 + i);
  return [...Array.from({ length: 7 }, (_, j) => { const a = -2.35 + j * 0.26 + (r() - 0.5) * 0.2, l = (6 + r() * 7) * k, b = (r() - 0.5) * 0.5; return st([[x + (j - 3) * 0.8 * k, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.5], [x + Math.cos(a + b) * l, y + Math.sin(a + b) * l]], Math.max(0.5, 0.42 * k), 1610 + i * 8 + j, 0.7, 0.3); }),
    { ...st([[x, y + 1], [x + dx * 34 * k, y + 1 + dy * 34 * k]], 3 * k, 1690 + i, 0.18, 0.4), color: SHADE }];
});
// crackle: the sand fused to glass and broke as it cooled
const crackle = (() => { const r = rng(1700); return Array.from({ length: 44 }, (_, i) => { const rr = R * (FOOT + 0.02 + r() * r() * 0.8), a = r() * Math.PI * 2; let u = CU + rr * Math.cos(a), z = CZ + (rr / 1000) * Math.sin(a); const pts: P[] = [G(u, z)]; for (let k = 0; k < 3; k++) { const b = r() * Math.PI * 2, l = 26 + r() * 36; u += Math.cos(b) * l; z += (Math.sin(b) * l) / 1000; pts.push(G(u, z)); } return st(pts, Math.max(0.6, 1.4 / z), 1710 + i, 0.5, 0.3); }); })();
const rays = (() => { const r = rng(1800); return Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2 + r() * 0.3, r0 = R * (FOOT + 0.04), r1 = R * (1.6 + r() * 0.6), z = CZ + (r0 / 1000) * Math.sin(a); return st([cw(r0, a), cw((r0 + r1) / 2, a + 0.03), cw(r1, a + 0.05)], 2.4 / z, 1810 + i, 0.5, 0.6); }); })();
// gullies down the near face of the mound, where the rim was thrown up
const gullies = (() => { const r = rng(1850); return [1.1, 1.19, 1.33, 1.41, 1.58, 1.7, 1.84].map((f, i) => { const a = Math.PI * f + (r() - 0.5) * 0.05, c = crest(a), l = 0.07 + r() * 0.12, b = (r() - 0.5) * 0.08; return st([cw(R * c * 1.03, a, RH - 8), cw(R * c * (1.05 + l * 0.5), a + b * 0.5, RH * (0.8 - l * 2)), cw(R * c * (1.05 + l), a + b, RH * (0.7 - l * 4))], 0.7 + r() * 0.8, 1860 + i, 0.4 + r() * 0.2, 0.6); }); })();
const glints = (() => { const r = rng(1900), spots = [1.12, 1.3, 1.52, 1.77]; return Array.from({ length: 16 }, (_, i) => { const onLip = i < 10, a = onLip ? Math.PI * (spots[i % 4] + (r() - 0.5) * 0.05) : Math.PI * (1.05 + r() * 0.9), rr = onLip ? R * crest(a) * (1.0 + r() * 0.03) : R * (FOOT + r() * 0.5), [x, y] = cw(rr, a, onLip ? RH - 3 : 0), l = 1 + r() * 3.5; return { ...st([[x - l, y], [x + l, y - 0.4]], 1.2 + r() * 0.8, 1910 + i, 0.9, 0.2), color: GLINT }; }); })();
// the walk away: boot prints and hoof prints from where Callahan fell to where the hero is now
const prints = (() => {
  const [u0, z0] = toW([1010, 890]), [u1, z1] = toW([F[0] - 4, F[1] + 10]), out: Omit<Stroke, "at">[] = [];
  for (let i = 0; i < 11; i++) {
    const t = (i + 0.5) / 12, s = i % 2 ? 1 : -1, u = u0 + (u1 - u0) * t + s * 30, z = z0 + (z1 - z0) * t, a = G(u, z + 0.03), b = G(u + 4, z - 0.03), w = 7 / z;
    out.push(st([[a[0] - w, a[1]], [b[0] - w * 0.8, b[1]], [b[0] + w * 0.8, b[1] + 0.5]], Math.max(0.7, 2.2 / z), 2000 + i, 0.45, 0.3));
    const h = G(u - 320 - s * 40, z + 0.1), hw = 8 / z;
    if (!inside(HAT, h[0], h[1])) out.push(st([[h[0] - hw, h[1] - hw * 0.2], [h[0], h[1] + hw * 0.35], [h[0] + hw, h[1] - hw * 0.2]], Math.max(0.7, 2.2 / z), 2020 + i, 0.45, 0.3));
  }
  return out;
})();
const ROCKS: P[][] = [[[112, 527], [118, 514], [131, 508], [140, 496], [158, 499], [172, 512], [186, 527]], [[330, 525], [334, 519], [347, 513], [352, 518], [360, 525]], [[652, 522], [656, 509], [664, 505], [674, 512], [688, 522]],
  [[1396, 529], [1402, 514], [1418, 510], [1424, 497], [1446, 494], [1462, 506], [1476, 529]], [[1548, 524], [1551, 516], [1566, 514], [1573, 508], [1582, 524]]];
const EDGE_SEGS: [number, number, number][] = [[0, 4, 2.4], [3, 6, 2], [6, 8, 1.1], [9, 11, 2]]; // the light eats the lip where the sun sits on it

const strokes: Stroke[] = [
  // 1. the lip of the mesa, the horizon, the far buttes, the rocks on the edge
  ...seq([...EDGE_SEGS.map(([a, b, w], i) => st(EDGE.slice(a, b + 1), w, 1 + i, 0.85, 0.7)),
    st([[0, HOR], [520, HOR]], 0.9, 6, 0.45), { ...st([[90, 509], [170, 500], [260, 505], [300, 497], [390, 494], [440, 500]], 0.8, 9, 0.28, 0.8), color: SHADE }, { ...st([[1300, 497], [1360, 503], [1450, 499], [1520, 506], [1600, 503]], 0.7, 5, 0.25, 0.8), color: SHADE }, st([[594, HOR], [1080, HOR]], 0.8, 7, 0.35), st([[1430, HOR], [1452, HOR]], 0.8, 8, 0.4),
    ...BUTTES.map((b, i) => st(b, 1.3 - i * 0.1, 10 + i, 0.6, 0.5)), ...ROCKS.map((q, i) => st(q, 1.8, 20 + i, 0.85, 0.5)),
    ...[[40, 528, 110], [380, 527, 470], [700, 526, 780], [1500, 527, 1540]].map(([x0, y, x1], i) => st([[x0, y], [(x0 + x1) / 2, y + 1.5], [x1, y]], 0.8, 30 + i, 0.4))], 0, 16, 0.35, [HORSE, HERO_HIDE]),
  // 2. the crater: the far rim against the ground beyond, the near lip heavy, the inner step, the foot of the mound
  ...seq([st(lip(1, RH, Math.PI * 1.02, Math.PI * 1.98, 22), 3.4, 40, 0.95), st(lip(1, RH, 0.04, Math.PI * 0.5, 12), 1.8, 41, 0.8), st(lip(1, RH, Math.PI * 0.5, Math.PI * 0.96, 12), 2, 42, 0.85),
    st(lip(1, RH, -0.22, 0.22, 5), 2, 43, 0.8), st(lip(1, RH, Math.PI - 0.22, Math.PI + 0.22, 5), 2.2, 44, 0.85),
    st([cw(R * crest(0.06), 0.06, RH), cw(R * 1.12, 0.03, RH * 0.4), cw(R * FOOT, 0, 0)], 1.4, 46, 0.7), st([cw(R * crest(Math.PI - 0.06), Math.PI - 0.06, RH), cw(R * 1.12, Math.PI - 0.03, RH * 0.4), cw(R * FOOT, Math.PI, 0)], 1.6, 47, 0.75),
    ...[[1.1, 1.3], [1.45, 1.6], [1.72, 1.9]].map(([a0, a1], i) => st(lip(FOOT * (1.02 + i * 0.02), 0, Math.PI * a0, Math.PI * a1, 6), 1, 48 + i, 0.4)),
    ...CLODS.map((q, i) => st(q.slice(0, 4), 1.2, 60 + i, 0.8, 0.5))], 6, 28),
  // the strata of the far wall, caught pale where the dawn skims the glass
  ...seq([[0.9, RH - 24, 0.5], [0.8, RH - 58, 0.42], [0.72, RH - 96, 0.3]].map(([k, h, o], i) => ({ ...st(lip(k, h, 0.35 + i * 0.1, Math.PI - 0.4 - i * 0.08, 12), 1.2 - i * 0.2, 70 + i, o, 0.6), color: "#b3aaa0" })), 90, 100),
  // 3. the hat: brim, crown, crease, pinches, band
  ...seq([
    st(Array.from({ length: 16 }, (_, i) => brimAt(-0.1 + (i / 15) * (Math.PI + 0.2))), 2.8, 200, 0.95), st(Array.from({ length: 9 }, (_, i) => brimAt(0.35 + (i / 8) * (Math.PI - 0.7), 5, 0.98)), 1.2, 201, 0.6),
    st([BRIM[35], BRIM[34], BRIM[33], BRIM[32], BRIM[31], BRIM[30]], 1.6, 202, 0.8), st([BRIM[18], BRIM[19], BRIM[20], BRIM[21], BRIM[22], BRIM[23]], 1.6, 203, 0.8),
    st(CROWN_TOP.slice(0, 6), 2.2, 204, 0.9), st(CROWN_TOP.slice(5), 1.4, 205, 0.7),
    st([hp([-8, -68]), hp([-4, -60]), hp([-2, -52])], 1.2, 206, 0.7), st([hp([-26, -62]), hp([-19, -50])], 0.9, 207, 0.5), st([hp([20, -64]), hp([13, -51])], 0.9, 208, 0.5),
    st(Array.from({ length: 12 }, (_, i) => baseAt((i / 11) * Math.PI)), 1.8, 209, 0.9), st(Array.from({ length: 12 }, (_, i) => baseAt((i / 11) * Math.PI, 12, 0.98)), 1.3, 210, 0.8),
  ], 30, 52, 0.35),
  // the braid on the band, a column of little chevrons
  ...seq(Array.from({ length: 16 }, (_, i) => { const a = 0.18 + (i / 15) * (Math.PI - 0.36), b = baseAt(a, 1.5), t = baseAt(a, 10.5, 0.985), m = lerpP(b, t, 0.5); return [st([[b[0] - 2.4, b[1]], [m[0] + 2.4, m[1]]], 1.1, 220 + i * 2, 0.8, 0.2), st([[m[0] + 2.4, m[1]], [t[0] - 2.4, t[1]]], 1.1, 221 + i * 2, 0.8, 0.2)]; }).flat(), 50, 62, 0.5),
  // 4. the ground: the burn's crackle and rays, stones, dry grass, the prints of the walk away
  ...seq([...gullies, ...rays, ...crackle], 44, 70, 0.5),
  ...seq([...pebbles.out, ...tufts, ...prints], 54, 84, 0.5),
  // 5. last: the long cast shadows of the stones, the hat's edge on the dust, the glass catching the dawn
  ...seq([...pebbles.shadows, st([[HC[0] - 126, HC[1] + 8], [HC[0] - 40, HC[1] + 36], [HC[0] + 70, HC[1] + 30]], 2.6, 303, 0.7)], 84, 98, 0.5),
  ...seq(glints, 92, 101, 0.6),
];

// ---------------------------------------------------------------- the washes, flooding in from the dawn
const band = (y0: number, y1: number, seed: number, amp = 18): P[] => { const r = rng(seed), top = Array.from({ length: 9 }, (_, i) => [-40 + i * 210, y0 + (r() - 0.5) * amp] as P); return [...top, [1640, y1], [1200, y1], [800, y1], [400, y1], [-40, y1]]; };
// shadows: the legs as thin streaks (pen), then the body as a wash from where the legs end
const HERO_LEN = 2.5, HORSE_LEN = 2.6;
const legShadow = (foot: P, len: number, t1: number, w: number, seed: number) => { const [u, z] = toW(foot); return { ...st([foot, G(u - A * 1000 * len * t1 * 0.5, z - len * t1 * 0.5), G(u - A * 1000 * len * t1, z - len * t1)], w, seed, 0.3, 0.4), color: SHADE }; };
const heroShadow = shadow([F[0], F[1] + 2], HERO_LEN, prof([[0.36, 24], [0.46, 44], [0.54, 60], [0.76, 56], [0.8, 26], [0.84, 70], [0.9, 68], [0.93, 30], [1, 12]]), 0.36);
const horseShadow = shadow(hs([56, 0]), HORSE_LEN, prof([[0.26, 50], [0.34, 76], [0.6, 82], [0.7, 50], [0.9, 42], [1, 20]]), 0.26);
const shadowLegs = [
  legShadow([F[0] - 7, F[1] + 3], HERO_LEN, 0.4, 5, 2100), legShadow([F[0] + 7, F[1] - 5], HERO_LEN, 0.42, 5, 2101),
  ...([[16, 0], [30, 0], [96, 0], [82, 9]] as P[]).map((p, i) => legShadow(hs(p), HORSE_LEN, 0.29, 7, 2110 + i)),
];
strokes.push(...seq(shadowLegs, 80, 96, 0.4));
const washes: Wash[] = [
  // the sky: cold ash above, what is left of the storm, a thin rose-ochre dawn low down, bare paper at the sun
  { pts: band(-40, 360, 1), color: SKY, alpha: 0.4, seed: 500, pool: 0.25, at: [40, 66], from: SUN },
  { pts: blob(330, 70, 460, 62, 501, 0.4, 18, -0.05), color: ASH_DK, alpha: 0.32, seed: 502, pool: 0.7, at: [44, 68], from: SUN },
  { pts: blob(860, 26, 330, 44, 503, 0.4, 16, 0.03), color: ASH_DK, alpha: 0.26, seed: 504, pool: 0.7, at: [44, 68], from: SUN },
  { pts: blob(160, 210, 240, 22, 505, 0.35, 14, 0.02), color: ASH, alpha: 0.3, seed: 506, pool: 0.6, at: [46, 70], from: SUN },
  { pts: band(270, 472, 2, 70), color: ROSE, alpha: 0.34, seed: 510, pool: 0.15, at: [42, 66], from: SUN, hide: [blob(SUN[0], 462, 150, 44, 511, 0.2, 16)] },
  { pts: blob(SUN[0] - 60, 448, 760, 80, 512, 0.3, 20), color: GLOW, alpha: 0.32, seed: 513, pool: 0.1, at: [40, 62], from: SUN, hide: [CAP.concat([[SUN[0] - 23, HOR + 1]])] },
  { pts: blob(1010, 352, 300, 7, 514, 0.35, 14, 0.01), color: ROSE, alpha: 0.5, seed: 515, pool: 0.3, at: [50, 72], from: SUN }, // cloud bars lit from below
  { pts: blob(1450, 388, 210, 6, 516, 0.35, 14, -0.02), color: ROSE, alpha: 0.5, seed: 517, pool: 0.3, at: [50, 72], from: SUN },
  { pts: blob(640, 396, 260, 6, 518, 0.35, 14, 0.02), color: ASH, alpha: 0.35, seed: 519, pool: 0.3, at: [52, 74], from: SUN },
  // the distance: buttes against the dawn, the plain far below in haze
  ...BUTTES.map((b, i) => ({ pts: [...b, [b[b.length - 1][0], HOR + 2], [b[0][0], HOR + 2]] as P[], color: mix(SHADE, HAZE, 0.2 + i * 0.1), alpha: 0.5, seed: 520 + i, pool: 0.3, at: [48, 70] as [number, number], from: SUN })),
  { pts: [[-40, HOR], [1640, HOR], ...[...EDGE].reverse().map(([x, y]) => [x, y + 4] as P)], color: HAZE, alpha: 0.34, seed: 530, pool: 0.5, at: [50, 72], from: SUN, hide: [blob(SUN[0], 476, 190, 7, 531, 0.2, 14)] },
  // the top of the mesa: dusty ochre, drained toward ash, the ground in front darker
  { pts: [...EDGE, [1640, 910], [-40, 910]], color: mix(OCHRE, ASH, 0.45), alpha: 0.38, seed: 540, pool: 0.4, at: [54, 80], from: [SUN[0], 520], ph: 1, hide: [blob(SUN[0] - 40, 534, 320, 11, 541, 0.3, 16)] },
  { pts: [[-40, 760], [300, 744], [700, 770], [1100, 748], [1640, 766], [1640, 910], [-40, 910]], color: UMBER, alpha: 0.16, seed: 542, pool: 0.9, at: [58, 84], from: [800, 900], ph: 1 },
  // the burn: ash-grey ring, charred inner ring, the near face of the mound, the black bowl
  { pts: scorch(1.78, 60), color: ASH, alpha: 0.32, seed: 550, pool: 0.4, at: [58, 84], from: cw(0, 0), ph: 2 },
  { pts: scorch(1.5, 61), color: ASH_DK, alpha: 0.42, seed: 551, pool: 0.5, at: [60, 86], from: cw(0, 0), ph: 2 },
  { pts: NEAR_SLOPE, color: CHAR, alpha: 0.28, seed: 552, pool: 0, at: [64, 88], from: cw(0, 0), ph: 2 },
  { pts: [...lip(1.02, RH - 6, Math.PI * 1.03, Math.PI * 1.97, 16), ...lip(1.1, RH * 0.45, Math.PI * 1.95, Math.PI * 1.05, 14)], color: CHAR, alpha: 0.32, seed: 549, pool: 0, at: [68, 90], from: cw(0, 0), ph: 3 }, // the underside of the lip
  { pts: BOWL, color: CHAR, alpha: 0.55, seed: 553, pool: 0.9, at: [64, 90], from: cw(0, 0), ph: 3 },
  { pts: [...lip(0.98, RH, Math.PI * 1.02, Math.PI * 1.98, 16), ...lip(0.86, 0, 0.1, Math.PI - 0.1, 14)], color: "#0e0a08", alpha: 0.62, seed: 554, pool: 0.9, at: [70, 94], from: cw(0, 0), ph: 3 },
  ...CLODS.map((q, i) => ({ pts: q, color: CHAR, alpha: 0.6, seed: 555 + i * 3, at: [70, 94] as [number, number], ph: 3 })),
  // the rocks: dark against the light
  ...ROCKS.map((q, i) => ({ pts: [...q, [q[q.length - 1][0], q[q.length - 1][1] + 2], [q[0][0], q[0][1] + 2]] as P[], color: mix(DARK, SHADE, 0.3), alpha: 0.7, seed: 563 + i, at: [62, 86] as [number, number], from: SUN, ph: 2 })),
  // the hat: pale grey felt, its face to us in shade, the brim nearly bare, a darker braided band
  { pts: BRIM, color: ASH_LT, alpha: 0.3, seed: 570, pool: 0.5, at: [66, 90], from: SUN, ph: 2 },
  { pts: CROWN, color: ASH, alpha: 0.45, seed: 571, pool: 0.6, at: [68, 90], from: SUN, ph: 2 },
  { pts: BAND, color: mix(UMBER, ASH_DK, 0.55), alpha: 0.6, seed: 572, pool: 0.4, at: [74, 94], ph: 3 },
  { pts: [...Array.from({ length: 12 }, (_, i) => brimAt(0.2 + (i / 11) * (Math.PI - 0.4))), ...Array.from({ length: 12 }, (_, i) => brimAt(Math.PI - 0.2 - (i / 11) * (Math.PI - 0.4), 6, 0.98))], color: ASH_DK, alpha: 0.4, seed: 573, at: [74, 94], ph: 3 }, // the brim's edge turned down
  // the long cast shadows, cool, all falling toward the reader
  { pts: HAT_SHADOW, color: SHADE, alpha: 0.42, seed: 580, pool: 0.3, at: [78, 98], from: HC, ph: 3, hide: [HAT] },
  { pts: heroShadow, color: SHADE, alpha: 0.3, seed: 581, pool: 0.2, at: [76, 98], from: F, ph: 3, hide: [HAT] },
  { pts: horseShadow, color: SHADE, alpha: 0.28, seed: 582, pool: 0.2, at: [76, 98], from: hs([50, 0]), ph: 3, hide: [BOWL] },
  ...ROCKS.map((q, i) => { const a = q[0], b = q[q.length - 1], [dx, dy] = away(a), L = 90; return { pts: [a, b, [b[0] + dx * L, b[1] + dy * L], [a[0] + dx * L * 1.1, a[1] + dy * L * 1.1]] as P[], color: SHADE, alpha: 0.3, seed: 590 + i, at: [80, 98] as [number, number], ph: 3 }; }),
];

// ---------------------------------------------------------------- what moves
const ash = (() => { const r = rng(2400); return Array.from({ length: 24 }, () => ({ x: 150 + r() * 1100, y0: -40 + r() * 200, span: 520 + r() * 260, q0: r(), k: 1 + Math.floor(r() * 2), ph: r() * 6.28, s: 2.6 + r() * 2.8 })); })();
const hero = (T: number) => {
  const w1 = Math.sin(T * 2), w2 = Math.sin(T * 3 + 1.3), w3 = Math.sin(T * 5 + 0.4), at = (p: P[]): P[] => p.map(([x, y]) => [F[0] + x, F[1] + y] as P);
  const hem = (x: number, y: number, k: number): P => [x - k * (3 + 2 * w1 + 0.8 * w3), y - k * (1 + w2)];
  return {
    crown: at([[-8, -111], [-7.5, -120], [-4, -125], [0, -123], [4, -125], [7, -120], [8, -111]]),
    brim: at([[-16, -114.5], [-8, -111.5], [0, -110.5], [8, -111.5], [15.5, -114], [9, -114.5], [0, -115], [-9, -114.8]]),
    head: at([[-5, -111], [-6, -107], [-4, -103.5], [4, -103.5], [6, -107], [5, -111]]),
    coat: at([[-6, -104], [-17, -99], [-18, -90], [-16, -84], [-15, -70], [-17, -57], hem(-23, -31, 1.2), hem(-12, -33, 0.7), hem(-2, -37 + w3, 0.4), hem(7, -32, 0.3), [19 - 0.6 * w2, -32], [16, -58], [14, -72], [17, -88], [17, -98], [6, -104]]),
    armL: at([[-17, -99], [-22, -93], [-27, -81], [-33, -72], [-36, -67], [-33, -63.5], [-29, -68], [-22, -79], [-16, -87]]),
    armR: at([[17, -98], [21, -88], [22, -76], [21, -66], [19, -63], [17, -66], [17, -78], [15, -88]]),
    legL: at([[-11, -32], [-11, -16], [-10, -6], [-11, -2], [-10, 3], [-4, 4], [-3, 1], [-5, -6], [-4, -18], [-3, -32]]),
    legR: at([[3, -32], [5, -16], [5.5, -9], [5, -5], [11, -4.5], [11, -8], [10, -12], [10, -22], [11, -32]]),
  };
};
const HL = (a: number, b: number) => HORSE_L.slice(a, b).map(hs);
const SIL = mix(DARK, SHADE, 0.22); // the colour of a figure against the dawn

export const p12 = page({
  id: "p12", title: "Le Dernier Duel", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 14, seed: 2990, at: 96, box: [80, 600, 1520, 880] },
  animAt: [18, 72],
  anim: (g, t, reveal) => {
    const T = (t / LOOP) * Math.PI * 2;
    const pen = (pts: P[], w: number, seed: number, op = 0.9, progress = reveal, color = INK) => g.pen(pts, { w, color, seed, wobble: 0.5, boil: 0.3, taper: 1, opacity: op, retrace: false, progress });
    const penP = clamp(reveal / 0.55), fillA = clamp((reveal - 0.45) / 0.55);
    const sway = 0.6 * Math.sin(T * 2 + 0.5) + 0.4 * Math.sin(T * 3 + 2);
    // the dawn: the sun's sliver lifted to bare paper, its glow breathing
    g.group("plain", () => {
      g.glow(SUN[0], SUN[1] - 4, 120, "#fff1d4", reveal * (0.42 + 0.08 * Math.sin(T) + 0.04 * Math.sin(T * 3 + 2)));
      g.glow(SUN[0] - 60, SUN[1] + 60, 160, "#f6dcb0", reveal * (0.16 + 0.05 * Math.sin(T + 1)));
      fillShape(g, CAP.concat([[SUN[0] - 23, HOR + 0.5]]), "#fffaee", 0.96 * reveal);
    });
    // the smoke thread: a wave climbing it, leaning away on the breeze, curling where it breaks
    g.group("plain", () => {
      const n = 26, pts: P[] = [];
      for (let i = 0; i < n; i++) { const s = i / (n - 1), y = SMOKE0[1] - s * 440, x = SMOKE0[0] - 160 * s * s + (3 + 24 * s) * Math.sin(s * 9 - T * 2) + 6 * s * Math.sin(s * 4 - T * 3 + 1); pts.push([x, y]); }
      fillShape(g, [...pts.map(([x, y], i) => [x - 2 - i * 0.7, y] as P), ...pts.map(([x, y], i) => [x + 2 + i * 0.9, y] as P).reverse()], ASH, 0.16 * reveal);
      const SM = "#5a534e"; pen(pts.slice(0, 11), 2.2, 2500, 0.7, penP, SM); pen(pts.slice(10, 19), 1.6, 2501, 0.5, clamp(penP * 2 - 0.5), SM); pen(pts.slice(18), 1.1, 2502, 0.32, clamp(penP * 3 - 1.8), SM);
      if (reveal < 1) return;
      // a curl breaks off the top twice a loop and drifts away, fading
      for (let j = 0; j < 2; j++) {
        const p = (t / 90 + j * 0.5) % 1, top = pts[n - 1], cx = top[0] - 20 - p * 70, cy = top[1] - 10 - p * 60, r0 = 9 + p * 16;
        const curl = Array.from({ length: 12 }, (_, i) => { const a = i * 0.55 + p * 3 + j * 2, rr = r0 * (1 - i / 16); return [cx + Math.cos(a) * rr * 1.4, cy + Math.sin(a) * rr] as P; });
        pen(curl, 0.9, 2510 + j, 0.32 * Math.sin(Math.PI * p), 1);
      }
    });
    // the vulture, high over the crater, once round a loop, banking as it turns
    g.group("plain", () => {
      const a = T, cx = 520 + Math.cos(a) * 90, cy = 180 + Math.sin(a) * 26, bank = Math.cos(a), sx = 0.75 + 0.25 * Math.abs(Math.sin(a));
      const wing = (d: number): P[] => [[cx, cy], [cx + d * 8 * sx, cy - 3 - bank * d * 1.5], [cx + d * 16 * sx, cy - 4 - bank * d * 3], [cx + d * 22 * sx, cy - 2 - bank * d * 4]];
      pen(wing(-1), 2, 2600, 0.85); pen(wing(1), 2, 2601, 0.85);
      [-1, 1].forEach((d, i) => { const tip = wing(d)[3]; pen([[tip[0] - d * 3, tip[1]], [tip[0] + d * 3, tip[1] + 2]], 0.9, 2602 + i, 0.7); });
      fillShape(g, blob(cx, cy + 1, 3.2, 2, 2605, 0.1, 8), INK, 0.8 * reveal);
    });
    // the horse, a silhouette against the dawn; its tail and mane stirring
    const tailC: P[] = ([[3, 94], [-4, 84], [-9, 70], [-11, 56], [-10, 42]] as P[]).map(([x, y], i) => hs([x - (i / 4) ** 1.4 * (5 + 4 * sway), y + (i / 4) * 2 * sway]));
    const side = (k: number) => tailC.map(([x, y], i) => [x + k * (4.5 - i * 0.6), y] as P);
    g.group("paint", () => { [HORSE, FAR_FRONT, FAR_HIND, [...side(-1), ...side(1).reverse()]].forEach((p) => fillShape(g, p, SIL, fillA)); }, { alpha: 0.88 });
    g.group("plain", () => {
      pen(HL(0, 8), 1.7, 100, 0.85, penP); pen(HL(7, 12), 1.1, 101, 0.8, penP); pen(HL(11, 18), 1.2, 102, 0.7, penP); pen(HL(17, 27), 2.2, 103, 0.9, penP);
      pen(HL(26, 38), 2, 104, 0.9, penP); pen(HL(37, 42), 2.8, 105, 0.95, penP); pen(HL(41, 48), 2, 106, 0.9, penP); pen([...HL(47, 55), hs(HORSE_L[0])], 2.6, 107, 0.95, penP);
      pen(FAR_FRONT, 1.1, 108, 0.6, penP); pen(FAR_HIND, 1.1, 109, 0.6, penP);
      pen([hs([112, 118]), hs([120, 104])], 0.8, 110, 0.45, penP); pen([hs([116, 95]), hs([125, 93]), hs([130, 89])], 0.9, 111, 0.5, penP); // the cheek strap, the noseband
      pen([hs([48, 94]), hs([66, 101]), hs([79, 111])], 1, 112, 0.7 * fillA, 1, RIM); // the dawn along its back
      for (let i = 0; i < 3; i++) { const cl: P[] = ([[3, 94], [-5, 82], [-10, 66], [-12, 50], [-11 + i * 2, 38]] as P[]).map(([x, y], k) => hs([x - (k / 4) ** 1.4 * (5 + 4 * sway) + (i - 1) * 2, y + (k / 4) * 2 * sway])); pen(cl, 1, 2700 + i, 0.75, penP); }
      for (let i = 0; i < 6; i++) { const b = hs(lerpP([70, 105], [100, 129], i / 5)), f = Math.sin(T * 2 + i * 0.7) + 0.5 * Math.sin(T * 5 + i); pen([b, [b[0] - 7 - 2 * f, b[1] - 2 + f]], 1.1, 2710 + i, 0.8, penP); }
      // the rein, slack between his hand and the bit
      const hand: P = [F[0] - 35, F[1] - 66], mid: P = [(hand[0] + BIT[0]) / 2, Math.max(hand[1], BIT[1]) + 10 + 2 * Math.sin(T * 2 + 1)];
      pen([BIT, mid, hand], 1.1, 2720, 0.85, penP);
    });
    // the hero: a dark figure against the dawn, the light eating the edge turned to it
    const h = hero(T), parts = [h.coat, h.armL, h.armR, h.legL, h.legR, h.head, h.crown, h.brim];
    g.group("paint", () => parts.forEach((p) => fillShape(g, p, SIL, fillA)), { alpha: 0.9 });
    g.group("plain", () => {
      const L = (p: P[], a: number, b: number) => p.slice(a, b);
      pen(L(h.coat, 0, 7), 1.6, 2800, 0.9, penP); pen(L(h.coat, 6, 11), 1.3, 2801, 0.85, penP); pen(L(h.armL, 0, 6), 1.5, 2802, 0.9, penP); pen(L(h.armL, 5, 9), 1, 2803, 0.7, penP);
      pen(h.legL, 1.4, 2804, 0.9, penP); pen(h.legR, 1.2, 2805, 0.8, penP); pen(h.crown, 1.3, 2806, 0.9, penP); pen(h.brim.slice(0, 5), 1.3, 2807, 0.9, penP);
      // rim light where the dawn wraps the figure: the right edge of the hat, the shoulder, the coat
      pen([h.crown[4], h.crown[5], h.crown[6]], 1.3, 2810, 0.9 * fillA, 1, RIM); pen([h.coat[14], h.coat[13], h.coat[12], h.coat[11]], 1.5, 2811, 0.9 * fillA, 1, RIM);
      pen([h.armR[0], h.armR[1], h.armR[2]], 1.2, 2812, 0.85 * fillA, 1, RIM); pen([h.brim[3], h.brim[4]], 1.1, 2813, 0.85 * fillA, 1, RIM);
      if (reveal < 1) return;
      // ash, falling out of a clean sky, tumbling as it goes
      ash.forEach((f, i) => {
        const q = (f.q0 + (t / LOOP) * f.k) % 1, y = f.y0 + q * f.span, x = f.x - q * f.span * 0.3 + 10 * Math.sin(q * Math.PI * 2 * 2 + f.ph), tw = Math.cos(q * Math.PI * 2 * 3 + f.ph), s = f.s;
        fillShape(g, [[x - s * tw, y - s * 0.4], [x + s * 0.3, y - s * 0.6], [x + s * tw, y + s * 0.3], [x - s * 0.2, y + s * 0.6]], i % 3 ? ASH_DK : ASH, 0.75 * Math.sin(Math.PI * q));
      });
    });
  },
});
