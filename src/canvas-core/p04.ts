// PAGE 4 · LA CHUTE. One idea: the night sky over Dust Creek is split by something that does
// not belong on this paper. Focal subject: a long blue streak slicing the stars and plunging
// behind the mesa, where a blue glow beats like a heart between the rocks. One light: that glow
// behind the mesa. It rims the caprock, the rocks and the town's rooftops in blue; everything
// facing us is in night shade. The saloon lamps have just gone out, its windows are dark.
// The blue things (streak, glow, rims, the dust out of the Callahan mine) are drawn in the
// cyanotype hand: white-blue line, screen glow. The rest is the sepia book, at night.
// What moves: the heartbeat glow (two quick beats, a rest), the streak's afterglow running
// along its length, the stars, glittering dust breathed out of the mine, the windmill.
import { Gfx, oval, rng, type Env, type Layer, type Medium, type P } from "./core";
import { letter, width } from "./drafting";
import { blob, clamp, fillShape, inside, mix, smooth } from "./gallery";
import { SEPIA, masked, page, perspective, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { ink: INK, paper: PAPER, dark: DARK, shade: SHADE, dusk: DUSK, umber: UMBER } = SEPIA;
const NIGHT = "#1b2140"; // blue-black the night washes lean toward, never reach
const SKY_V = mix(DUSK, SHADE, 0.55), SKY_D = mix(SHADE, NIGHT, 0.5), SKY_Z = mix(DARK, NIGHT, 0.45);
const LAND = mix(UMBER, SHADE, 0.55), LAND_D = mix(DARK, SHADE, 0.35), ROCK = mix(DARK, SHADE, 0.32);
// the alien hand
const B_LINE = "#dff3ff", B_MID = "#9cc3f0", B_GLOW = "#6fb6ff";
const STAR = "#fff6e2";

// ---------------------------------------------------------------- the land
const HZ = 642; // horizon
const { G, U, wallQuad } = perspective([900, HZ]);
// the mesa, flat caprock with a few rocks standing on it; the glow is behind the tallest ones
const MESA_TOP: P[] = [[600, 644], [640, 630], [672, 604], [700, 564], [722, 516], [740, 470], [752, 434], [764, 419], [800, 413], [860, 410], [930, 407], [975, 405], [984, 390], [993, 374], [1003, 369], [1011, 381], [1017, 399],
  [1034, 401], [1045, 385], [1056, 354], [1066, 347], [1075, 361], [1082, 390], [1090, 403], [1118, 399], [1127, 382], [1138, 377], [1146, 399], [1180, 405], [1230, 411], [1258, 421], [1272, 447], [1290, 491], [1318, 537], [1352, 577], [1396, 613], [1452, 644]];
const MESA: P[] = [...MESA_TOP, [1452, 660], [600, 660]];
const HEART: P = [1036, 436]; // where the thing came down, hidden behind the rocks
// the mine at the foot of the mesa
const MINE = { x0: 712, x1: 776, y0: 598, y1: 652 };
const MOUTH: P = [744, 630];

// ---------------------------------------------------------------- the edge of town
// false fronts on the left side of the street's end, seen down the frontage toward the mesa
const LX = -700;
const front = (z0: number, z1: number, h: number, step: number) => {
  const a = z0 + (z1 - z0) * 0.14, b = z1 - (z1 - z0) * 0.14;
  const top = [U(LX, z0, h - step), U(LX, a, h - step), U(LX, a, h), U(LX, b, h), U(LX, b, h - step), U(LX, z1, h - step)];
  return { top, wall: [G(LX, z0), ...top, G(LX, z1)], far: [top[5], G(LX, z1)] as P[], base: [G(LX, z0), G(LX, z1)] as P[] };
};
const saloon = front(0.72, 1.55, 600, 80), store = front(1.62, 2.2, 470, 60), shed = front(2.28, 2.9, 300, 0);
const FRONTS = [saloon.wall, store.wall, shed.wall];
const porchRoof = [U(LX, 0.72, 262), U(LX + 110, 0.72, 236), U(LX + 110, 1.55, 236), U(LX, 1.55, 262)];
const salWin = [[0.84, 0.98], [1.1, 1.22], [1.33, 1.43]].map(([a, b]) => wallQuad(LX, a, b, 290, 410));
const salDoor = wallQuad(LX, 1.0, 1.16, 0, 215), storeWin = [wallQuad(LX, 1.74, 1.86, 180, 330), wallQuad(LX, 1.98, 2.08, 180, 330)];
// the windmill at the end of the street, close, against the sky
const MILL = { hub: [1318, 238] as P, r: 84, feet: [G(470, 1.25), G(590, 1.25)] };

// a shape edge by edge, so its corners stay corners
const edges = (pts: P[], w: number, seed: number, op = 0.9, closed = true) => pts.slice(0, closed ? pts.length : -1).map((a, i) => st([a, pts[(i + 1) % pts.length]], w * (i % 2 ? 0.8 : 1), seed + i, op, 0.4));
const siding = (z0: number, z1: number, h0: number, h1: number, n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => { const h = h0 + ((h1 - h0) * (i + 0.5)) / n, r = rng(seed + i); return st([U(LX, z0 + (z1 - z0) * r() * 0.1, h), U(LX, z1 - (z1 - z0) * r() * 0.25, h)], 0.8, seed + i, 0.4, 0.4); });

// ---------------------------------------------------------------- the streak
const STREAK = smooth([[-40, 14], [260, 96], [540, 182], [780, 270], [930, 336], [1004, 380], [1040, 414], [1058, 446]], false, 10);
const along = (s: P[], k: number): P => { const i = Math.min(s.length - 2, Math.floor(k * (s.length - 1))), f = k * (s.length - 1) - i; return [s[i][0] + (s[i + 1][0] - s[i][0]) * f, s[i][1] + (s[i + 1][1] - s[i][1]) * f]; };
const normal = (s: P[], k: number): P => { const a = along(s, Math.max(0, k - 0.01)), b = along(s, Math.min(1, k + 0.01)), l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [-(b[1] - a[1]) / l, (b[0] - a[0]) / l]; };
const offset = (k0: number, k1: number, d: (k: number) => number, n = 18): P[] => Array.from({ length: n }, (_, i) => { const k = k0 + ((k1 - k0) * i) / (n - 1), p = along(STREAK, k), m = normal(STREAK, k); return [p[0] + m[0] * d(k), p[1] + m[1] * d(k)] as P; });
// where the streak goes behind the rocks
const ENTRY = (() => { let k = 0; while (k < 1 && !inside(MESA, ...along(STREAK, k))) k += 0.002; return k; })();
const segDist = (x: number, y: number, s: P[]) => s.reduce((m, a, i) => { if (!i) return m; const b = s[i - 1], dx = b[0] - a[0], dy = b[1] - a[1], t = clamp(((x - a[0]) * dx + (y - a[1]) * dy) / (dx * dx + dy * dy)); return Math.min(m, Math.hypot(x - a[0] - t * dx, y - a[1] - t * dy)); }, 1e9);

// ---------------------------------------------------------------- stars: bare paper left in the night washes
// a drift of them (the Milky Way) from the top middle down to the right, a scatter elsewhere
const inFront = (x: number, y: number) => y > HZ - 4 || inside(MESA, x, y) || FRONTS.some((f) => inside(f, x, y)) || Math.hypot(x - MILL.hub[0], y - MILL.hub[1]) < MILL.r + 8;
const STARS = (() => {
  const r = rng(4040), out: { x: number; y: number; s: number }[] = [];
  const ok = (x: number, y: number) => !inFront(x, y) && segDist(x, y, STREAK) > 34 && Math.hypot(x - HEART[0], (y - HEART[1]) * 1.6) > 190 && out.every((o) => Math.hypot(o.x - x, o.y - y) > 14);
  for (let i = 0; out.length < 78 && i < 900; i++) { const k = r(), g = (r() + r() + r() - 1.5) * 90, x = 660 + k * 940 + g * 0.4, y = -10 + k * 400 + g; if (ok(x, y)) out.push({ x, y, s: r() < 0.12 ? 3.4 : 1.8 + r() * 1.1 }); }
  for (let i = 0; out.length < 128 && i < 900; i++) { const x = r() * 1600, y = r() * r() * 600; if (ok(x, y)) out.push({ x, y, s: 1.7 + r() * 1.2 }); }
  return out;
})();
const BRIGHT = [[210, 250], [372, 90], [610, 58], [880, 138], [1188, 96], [1482, 180], [1540, 420], [160, 440], [470, 380], [1370, 470]].filter(([x, y]) => !inFront(x, y) && segDist(x, y, STREAK) > 30) as P[];
const HOLES = [...STARS.map((s, i) => blob(s.x, s.y, s.s, s.s, 4100 + i, 0.2, 7)), ...BRIGHT.map(([x, y], i) => blob(x, y, 4.2, 4.2, 4300 + i, 0.15, 8))];

// ---------------------------------------------------------------- the ground
const SCRUB: [number, number, number][] = [[618, 858, 30], [1062, 872, 40], [1470, 800, 28], [982, 704, 13], [1156, 676, 9], [862, 672, 8], [1386, 692, 15], [1230, 752, 20], [560, 780, 16], [1560, 896, 52], [760, 900, 44]];
const bush = (x: number, y: number, s: number, seed: number) => { const r = rng(seed); return Array.from({ length: 6 }, (_, i) => { const a = -Math.PI / 2 + (i - 2.5) * 0.42 + (r() - 0.5) * 0.3, l = s * (0.7 + r() * 0.5); return st([[x + (r() - 0.5) * s * 0.3, y], [x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 4, y + Math.sin(a) * l * 0.5], [x + Math.cos(a) * l, y + Math.sin(a) * l * 0.8]], Math.max(0.7, s / 22), seed + i, 0.85, 0.5); }); };
const ROCKS: [number, number, number][] = [[700, 820, 14], [1300, 870, 18], [930, 760, 9], [1110, 720, 7], [820, 700, 6], [1500, 700, 10]];
const TRAIL_L: P[] = [[906, 905], [880, 820], [834, 748], [782, 690], [748, 654]], TRAIL_R: P[] = [[1010, 905], [950, 818], [880, 744], [814, 690], [764, 654]];
const TRAIL: P[] = [...TRAIL_L, ...[...TRAIL_R].reverse()];
// pebbles and cracks in the hardpan, sparse far, bigger near
const MARKS = (() => { const r = rng(700); return Array.from({ length: 46 }, (_, i) => { const y = 660 + r() * r() * 240, x = 540 + r() * 1060, l = 4 + (y - 640) * 0.08 * (0.6 + r()); return st([[x, y], [x + l * 0.5, y - 1], [x + l, y + 0.6]], 0.6 + (y - 640) / 260, 710 + i, 0.4 + (y - 640) / 700, 0.4); }).filter((m) => !inside(TRAIL, ...m.pts[0]) && !FRONTS.some((f) => inside(f, ...m.pts[0]))); })();

// ---------------------------------------------------------------- the pen
const MESA_HIDE = [saloon.wall, store.wall, shed.wall];
const strokes: Stroke[] = [
  // 1. the mesa's silhouette and the horizon, the big line first
  ...seq([st(MESA_TOP, 2.2, 1, 0.95, 0.6), st([[1452, 644], [1500, 634], [1560, 632], [1640, 638]], 1.2, 2, 0.7), st([[400, 646], [600, 644]], 1, 3, 0.6)], 0, 16, 0.3, MESA_HIDE),
  // 2. the edge of town: the saloon and its neighbours, their far corners and fronts
  ...seq([...edges(saloon.top, 2.2, 10, 0.9, false), st(saloon.far, 3.2, 11), st(saloon.base, 3.6, 12), ...edges(store.top, 1.8, 26, 0.85, false), st(store.far, 2.6, 14), st(store.base, 2.4, 15, 0.8), st(shed.top, 1.4, 16, 0.8), st(shed.far, 1.8, 17), st(shed.base, 1.6, 18, 0.7),
    st([porchRoof[1], porchRoof[2]], 2.6, 19, 0.95), st([porchRoof[2], porchRoof[3]], 1.6, 20, 0.85),
    ...[0.86, 1.2, 1.52].map((z, i) => st([G(LX + 110, z), U(LX + 110, z, 236)], 3 / z, 21 + i, 0.95, 0.5))], 8, 34),
  // 3. the windmill's tower, two legs splaying to the ground, braces, the platform
  ...seq([st([MILL.feet[0], [MILL.hub[0] - 9, MILL.hub[1] + 22]], 4, 40, 0.95, 0.4), st([MILL.feet[1], [MILL.hub[0] + 9, MILL.hub[1] + 22]], 4, 41, 0.95, 0.4),
    ...[0.25, 0.5, 0.72].map((k, i) => { const y = MILL.feet[0][1] + (MILL.hub[1] + 22 - MILL.feet[0][1]) * k, xl = MILL.feet[0][0] + (MILL.hub[0] - 9 - MILL.feet[0][0]) * k, xr = MILL.feet[1][0] + (MILL.hub[0] + 9 - MILL.feet[1][0]) * k; return st([[xl, y], [xr, y]], 1.6, 42 + i, 0.8, 0.3); }),
    ...[[0, 0.25], [0.25, 0.5], [0.5, 0.72]].map(([a, b], i) => { const at = (k: number, s: 0 | 1): P => [MILL.feet[s][0] + (MILL.hub[0] + (s ? 9 : -9) - MILL.feet[s][0]) * k, MILL.feet[s][1] + (MILL.hub[1] + 22 - MILL.feet[s][1]) * k]; return st([at(a, i % 2 ? 1 : 0), at(b, i % 2 ? 0 : 1)], 1.1, 46 + i, 0.6, 0.3); }),
    st([[MILL.hub[0] - 22, MILL.hub[1] + 24], [MILL.hub[0] + 22, MILL.hub[1] + 24]], 2.2, 49, 0.9, 0.3)], 18, 40),
  // 4. the mesa's build: caprock ledge, joints in the cliff, gullies down the talus
  ...seq([st([[752, 452], [820, 447], [930, 445], [1040, 446], [1150, 444], [1262, 452]], 1.4, 60, 0.6, 0.8),
    st([[744, 470], [800, 464], [900, 468]], 0.8, 61, 0.35), st([[1100, 462], [1200, 460], [1268, 470]], 0.8, 62, 0.35),
    ...[790, 842, 905, 958, 1102, 1164, 1214].map((x, i) => st([[x, 414 + (i % 3)], [x + 2, 432], [x - 1, 450]], 0.9, 63 + i, 0.45, 0.6)),
    ...[[744, 474, 690, 600], [782, 452, 760, 560], [846, 450, 850, 540], [920, 448, 900, 600], [1000, 450, 1020, 560], [1080, 450, 1070, 610], [1150, 448, 1190, 560], [1224, 454, 1290, 590]].map(([a, b, c, d], i) => st([[a, b], [(a + c) / 2 + (i % 2 ? 6 : -6), (b + d) / 2], [c, d]], 0.9, 72 + i, 0.4, 1)),
    ...Array.from({ length: 14 }, (_, i) => { const x = 700 + i * 50 + (i % 3) * 7, y = 560 + (i % 4) * 16; return st([[x, y], [x + 10, y + 20]], 0.7, 82 + i, 0.3, 0.6); }),
  ], 30, 60, 0.35, MESA_HIDE),
  // 5. the Callahan mine: timber posts and cap, the rails running out, the tailings heap
  ...seq([st([[MINE.x0, MINE.y1], [MINE.x0 + 2, MINE.y0 + 2]], 2.4, 100, 0.95, 0.3), st([[MINE.x1, MINE.y1], [MINE.x1 - 2, MINE.y0 + 2]], 2.4, 101, 0.95, 0.3), st([[MINE.x0 - 10, MINE.y0 + 1], [MINE.x1 + 10, MINE.y0 - 1]], 3, 102, 0.95, 0.3),
    st([[MINE.x0 - 20, MINE.y0 - 18], [MINE.x0 - 4, MINE.y0 - 2]], 1, 103, 0.5), st([[MINE.x1 + 4, MINE.y0 - 4], [MINE.x1 + 26, MINE.y0 - 22]], 1, 104, 0.5),
    st([[730, 652], [706, 680], [668, 716]], 1.2, 105, 0.7), st([[756, 652], [738, 682], [708, 718]], 1.2, 106, 0.7),
    ...[0, 1, 2, 3, 4].map((i) => { const k = i / 4.5; return st([[728 - 60 * k, 656 + 58 * k], [760 - 52 * k, 656 + 60 * k]], 0.9, 107 + i, 0.5, 0.3); }),
    st([[772, 651], [790, 636], [812, 628], [836, 640], [852, 652]], 1.4, 112, 0.8, 0.6)], 44, 62),
  // 6. town details: the dark windows, the doors, the siding, the dead lamp under the porch
  ...seq([...salWin.flatMap((q, i) => edges(q, 1.4, 120 + i * 5, 0.85)), ...edges(salDoor, 1.8, 140, 0.9, false), ...storeWin.flatMap((q, i) => edges(q, 1.2, 145 + i * 5, 0.8)),
    st([U(LX, 1.08, 0), U(LX, 1.08, 215)], 1, 156, 0.6),
    ...siding(0.72, 1.55, 425, 590, 4, 160), ...siding(0.72, 1.55, 30, 250, 5, 170), ...siding(1.62, 2.2, 360, 460, 3, 180),
    st([U(LX + 70, 1.28, 248), U(LX + 70, 1.28, 214)], 1, 190, 0.8), st(oval(...U(LX + 70, 1.28, 196), 8, 14, 10), 1.4, 191, 0.9, 0.3), st([U(LX + 70, 1.28, 178), U(LX + 70, 1.28, 176)], 2.6, 192, 0.9),
    // the lamp's last breath of smoke, curling off the wick
    st([U(LX + 70, 1.28, 214), U(LX + 78, 1.28, 250), U(LX + 64, 1.28, 290), U(LX + 76, 1.28, 330)], 0.9, 193, 0.35, 1.2),
  ], 52, 74),
  // 7. the ground: the trail to the mine, scrub, stones
  ...seq([st(TRAIL_L, 1.2, 200, 0.55, 1), st(TRAIL_R, 1.2, 201, 0.55, 1),
    ...SCRUB.flatMap(([x, y, s], i) => bush(x, y, s, 210 + i * 10)),
    ...MARKS, ...ROCKS.map(([x, y, s], i) => st([[x - s, y], [x - s * 0.6, y - s * 0.6], [x + s * 0.3, y - s * 0.7], [x + s, y]], Math.max(0.8, s / 9), 320 + i, 0.8, 0.4))], 60, 82),
  // 8. the pen crosses on the brightest stars, in paper white, once the night is down
  ...seq(BRIGHT.flatMap(([x, y], i) => [{ ...st([[x - 7, y], [x + 7, y]], 0.9, 400 + i * 2, 0.9, 0.2), color: STAR }, { ...st([[x, y - 7], [x, y + 7]], 0.9, 401 + i * 2, 0.9, 0.2), color: STAR }]), 84, 96),
  // 9. last, the thing itself: the streak slices the sky in one long white stroke
  ...seq([
    // body colour first, a broad soft pass of pale blue, then the white core on it
    { ...st(offset(0.1, 1, () => 0, 40), 7, 510, 0.28, 0.3), color: B_GLOW },
    { ...st(offset(0.3, 1, () => 0, 30), 3.4, 511, 0.5, 0.3), color: B_MID },
    { ...st(offset(0, 0.62, () => 0, 30), 1.8, 500, 0.9, 0.3), color: B_LINE },
    { ...st(offset(0.5, 1, () => 0, 24), 3.6, 501, 0.95, 0.3), color: B_LINE },
    { ...st(offset(0.28, 0.97, (k) => -4 - 5 * k, 24), 1.1, 502, 0.8, 0.5), color: B_MID },
    { ...st(offset(0.45, 1, (k) => 4 + 6 * k, 20), 1, 503, 0.75, 0.5), color: B_MID },
    ...[0.08, 0.15, 0.21, 0.3].map((k, i) => ({ ...st(offset(k, k + 0.035, () => (i % 2 ? 3 : -3), 3), 0.9, 504 + i, 0.7, 0.3), color: B_MID })),
  ], 86, 100, 0.25, [MESA]),
  // the darkest accents: the second line under the near base, the far corner again
  ...seq([st([saloon.base[0], saloon.base[1]].map(([x, y]) => [x, y + 3] as P), 4.4, 600, 0.9), st(saloon.far, 3.6, 601, 0.9), st([[MINE.x0 + 4, MINE.y1 + 2], [MINE.x1 - 4, MINE.y1 + 2]], 3, 602, 0.9)], 94, 102),
];

// ---------------------------------------------------------------- the washes
const washes: Wash[] = [
  // the night, laid in coats, each stopping lower toward the glow; none goes where the stars are.
  // (the streak is not lifted out: it is not there yet when the night is painted, it arrives last)
  { pts: [[-40, -40], [1640, -40], [1640, 660], [-40, 660]], color: SKY_V, alpha: 0.55, seed: 700, pool: 0.2, at: [40, 66], from: HEART, hide: HOLES },
  { pts: [[-40, -40], [1640, -40], [1640, 650], [-40, 650]], color: SKY_D, alpha: 0.5, seed: 701, pool: 0.3, at: [44, 70], from: HEART, hide: HOLES },
  { pts: [[-40, -40], [1640, -40], [1640, 60], [1450, 92], [1330, 84], [1180, 140], [1020, 150], [880, 210], [700, 228], [520, 300], [300, 318], [120, 390], [-40, 400]], color: SKY_Z, alpha: 0.42, seed: 702, pool: 0.3, at: [48, 72], from: HEART, hide: HOLES },
  { pts: [[-40, -40], [1640, -40], [1640, -10], [1400, 20], [1250, 10], [1100, 60], [900, 70], [760, 120], [560, 140], [380, 210], [200, 220], [-40, 300]], color: SKY_Z, alpha: 0.32, seed: 703, pool: 0.2, at: [50, 74], from: HEART, hide: HOLES },
  // the ground, darkening toward us; the trail keeps a little of the paper
  { pts: [[-40, 630], [1640, 630], [1640, 940], [-40, 940]], color: LAND, alpha: 0.66, seed: 710, pool: 0.4, at: [50, 76], from: [760, 650], ph: 1 },
  { pts: [[-40, 690], [600, 676], [1100, 684], [1640, 670], [1640, 940], [-40, 940]], color: LAND_D, alpha: 0.58, seed: 711, pool: 0.6, at: [56, 80], from: [760, 650], ph: 1, hide: [TRAIL] },
  // the mesa, in its own shade; the caprock face and the talus a touch different
  { pts: MESA, color: ROCK, alpha: 0.82, seed: 720, pool: 0.5, at: [54, 78], from: HEART, ph: 2 },
  { pts: [[752, 436], [1262, 436], [1266, 456], [748, 458]], color: DARK, alpha: 0.35, seed: 721, pool: 0.3, at: [60, 82], from: HEART, ph: 2 },
  { pts: [[640, 632], [700, 570], [760, 560], [900, 600], [1100, 590], [1300, 560], [1420, 630], [1440, 648], [620, 648]], color: mix(UMBER, DARK, 0.5), alpha: 0.2, seed: 722, pool: 0.6, at: [62, 84], from: HEART, ph: 2 },
  { pts: [[MINE.x0 + 1, MINE.y1], [MINE.x0 + 2, MINE.y0 + 3], [MINE.x1 - 2, MINE.y0 + 3], [MINE.x1 - 1, MINE.y1]], color: DARK, alpha: 0.9, seed: 723, pool: 0.3, at: [70, 88], ph: 3 },
  { pts: [[772, 652], [790, 637], [812, 629], [836, 641], [852, 653]], color: mix(UMBER, SHADE, 0.3), alpha: 0.6, seed: 724, at: [70, 88], ph: 3 },
  // the edge of town, a dark mass against the night
  { pts: saloon.wall, color: DARK, alpha: 0.78, seed: 730, pool: 0.8, at: [60, 86], from: [0, 900], ph: 2 },
  { pts: store.wall, color: mix(DARK, SHADE, 0.3), alpha: 0.72, seed: 731, pool: 0.7, at: [62, 86], from: [400, 900], ph: 2 },
  { pts: shed.wall, color: mix(DARK, SHADE, 0.5), alpha: 0.68, seed: 732, pool: 0.6, at: [64, 86], ph: 2 },
  { pts: porchRoof, color: DARK, alpha: 0.5, seed: 733, at: [70, 90], ph: 3 },
  { pts: [G(LX, 0.7), G(LX + 110, 0.7), G(LX + 110, 1.55), G(LX, 1.55)], color: DARK, alpha: 0.5, seed: 734, pool: 0.8, at: [72, 92], ph: 3 }, // under the porch
  ...[...salWin, salDoor, ...storeWin].map((pts, i) => ({ pts, color: "#1c1210", alpha: 0.72, seed: 740 + i, pool: 0.3, at: [76, 94] as [number, number], ph: 3 })),
  // the near ground in the dark, and the windmill's long faint shadow running at us from the glow
  { pts: [[-40, 820], [500, 840], [1000, 850], [1640, 810], [1640, 940], [-40, 940]], color: DARK, alpha: 0.4, seed: 750, pool: 0.5, at: [78, 94], ph: 3 },
  { pts: [MILL.feet[0], MILL.feet[1], [1450, 910], [1370, 910]], color: DARK, alpha: 0.28, seed: 751, at: [80, 94], ph: 3 },
  // scrub shadows falling toward us, away from the glow
  ...SCRUB.filter(([, , s]) => s > 12).map(([x, y, s], i) => ({ pts: [[x - s * 0.7, y], [x + s * 0.7, y], [x + s * 0.9 + 6, y + s * 0.5], [x - s * 0.5 + 6, y + s * 0.6]] as P[], color: DARK, alpha: 0.4, seed: 760 + i, at: [80, 94] as [number, number], ph: 3 })),
];

// ---------------------------------------------------------------- the saloon's sign, dead with its lamps
// drawn flat, then laid onto the wall in vertical strips (every vertical of the wall stays vertical)
const SIGN = { text: "SALOON", z0: 0.87, z1: 1.44, h0: 425, h1: 510, seed: 890, cap: 0.52 };
const FOCAL = 1000, STRIPS = 220;
const BRUSH: Medium = { nib: 1.35, taper: 0.25, pressure: 0.25, retrace: false, wobble: 0.4, rough: 0.2 };
const BOARD = mix("#e3c38c", "#3b3350", 0.6), BOARD_EDGE = mix("#9a6538", NIGHT, 0.45), PAINT = "#170b07";
const flatSign = (env: Env, reveal: number): Layer => {
  const FW = (SIGN.z1 - SIGN.z0) * FOCAL, FH = SIGN.h1 - SIGN.h0, key = `p04:sign:${env.scale}`, done = env.cache.get(key) as Layer | undefined;
  if (done) return done;
  const k = env.scale * 1.2, L = env.canvas(Math.ceil(FW * k), Math.ceil(FH * k)), g = new Gfx(L.ctx, { ...env, W: FW, H: FH, scale: k }, 0, BRUSH), m = 10;
  const box = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  g.group("plain", () => {
    fillShape(g, box(0, 0, FW, FH), BOARD_EDGE, reveal); fillShape(g, box(m, m, FW - m, FH - m), BOARD, reveal);
    box(0, 0, FW, FH).forEach((a, i, q) => g.pen([a, q[(i + 1) % 4]], { w: 3, color: INK, seed: SIGN.seed + i, wobble: 0.5, boil: 0, opacity: 0.95, retrace: false, progress: reveal }));
    const cap = FH * SIGN.cap, cw = width(SIGN.text, cap, 0), track = Math.max(1, Math.min(6, (FW * 0.84 - cw) / ((cap / 6) * (SIGN.text.length - 1))));
    letter(g, SIGN.text, FW / 2, (FH - cap) / 2, { cap, color: PAINT, seed: SIGN.seed + 40, align: "center", progress: reveal, w: cap * 0.17, track });
  });
  if (reveal >= 1) env.cache.set(key, L);
  return L;
};
const mapSign = (c: CanvasRenderingContext2D, L: Layer) => {
  const sw = L.canvas.width / STRIPS, zAt = (s: number) => SIGN.z0 + s * (SIGN.z1 - SIGN.z0), xs = Array.from({ length: STRIPS + 1 }, (_, i) => U(LX, zAt(i / STRIPS), 0)[0]);
  for (let i = 0; i < STRIPS; i++) { const zm = zAt((i + 0.5) / STRIPS), top = U(LX, zm, SIGN.h1)[1], bot = U(LX, zm, SIGN.h0)[1]; c.drawImage(L.canvas, i * sw, 0, sw + 0.5, L.canvas.height, xs[i], top, xs[i + 1] - xs[i] + 0.4, bot - top); }
};
// once finished, the sign is laid onto the wall a single time, onto a surface of its own
const facadeSign = (g: Gfx, env: Env, reveal: number) => {
  const a = U(LX, SIGN.z0, SIGN.h1), b = U(LX, SIGN.z1, SIGN.h0), y1 = b[1];
  if (reveal < 1) mapSign(g.cur, flatSign(env, reveal));
  else {
    const key = `p04:signwall:${env.scale}`; let M = env.cache.get(key) as Layer | undefined;
    if (!M) { M = env.canvas(Math.ceil((b[0] + 4) * env.scale), Math.ceil((y1 + 4) * env.scale)); M.ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); mapSign(M.ctx, flatSign(env, 1)); env.cache.set(key, M); }
    g.cur.drawImage(M.canvas, 0, 0, M.canvas.width / env.scale, M.canvas.height / env.scale);
  }
  g.touch(0, a[1] - 2, b[0] + 2, y1 + 2);
};

// ---------------------------------------------------------------- what moves
// the heart: two quick beats and a rest, twice a loop
const beat = (t: number) => { const ph = (((t % 90) + 90) % 90) / 90, g = (c: number, w: number) => { const d = Math.min(Math.abs(ph - c), 1 - Math.abs(ph - c)); return Math.exp(-((d / w) ** 2)); }; return clamp(g(0.1, 0.035) + 0.7 * g(0.24, 0.04)); };
// one shape for everything standing in front of the glow (a hide list is even-odd: shapes must not overlap)
const GLOW_MASK: P[][] = [[[-80, 950], ...saloon.top, ...store.top, ...shed.top, ...MESA_TOP.filter(([x]) => x > 662), [1650, 644], [1650, 950]]];
// the rims the glow draws: the caprock and its rocks (strong near the heart), the town's tops and far corners
const RIMS = (() => { const top = MESA_TOP.filter(([x]) => x > 745 && x < 1265), out: { pts: P[]; k: number }[] = []; for (let i = 0; i + 1 < top.length; i += 3) { const seg = top.slice(i, i + 4); if (seg.length > 1) out.push({ pts: seg, k: Math.exp(-(((seg[0][0] - HEART[0]) / 260) ** 2)) }); } return out; })();
const TOWN_RIMS: { pts: P[]; k: number }[] = [{ pts: saloon.top.slice(2, 6), k: 0.55 }, { pts: saloon.far, k: 0.35 }, { pts: store.top.slice(2, 6), k: 0.6 }, { pts: store.far, k: 0.4 }, { pts: shed.top, k: 0.6 }, { pts: [[MILL.hub[0] - 9, MILL.hub[1] + 22], MILL.feet[0]], k: 0.3 }];
const TWINKLE = (() => { const r = rng(4500); return [...BRIGHT.map(([x, y]) => ({ x, y, s: 11 })), ...STARS.filter((s) => s.s > 2.4).slice(0, 18).map((s) => ({ x: s.x, y: s.y, s: 6 }))].map((s, i) => ({ ...s, k: 1 + (i % 3), ph: r() * 6.28 })); })();
const DUST = (() => { const r = rng(4600); return Array.from({ length: 46 }, () => ({ k: r() < 0.6 ? 1 : 2, ph: r(), dx: (r() - 0.62) * 230, dy: -20 - r() * 90, wob: r() * 6.28, tw: 2 + Math.floor(r() * 4), s: 1 + r() * 1.6 })); })();
const sparkle = (x: number, y: number, s: number): P[] => [[x - s, y], [x - s * 0.18, y - s * 0.18], [x, y - s], [x + s * 0.18, y - s * 0.18], [x + s, y], [x + s * 0.18, y + s * 0.18], [x, y + s], [x - s * 0.18, y + s * 0.18]];

export const p04 = page({
  id: "p04", title: "La Chute", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 16, seed: 990, at: 98, box: [480, 700, 1580, 890] },
  animAt: [84, 102],
  anim: (g, t, reveal, env) => {
    const T = (t / LOOP) * Math.PI * 2, b = beat(t) * reveal;
    const pen = (pts: P[], w: number, seed: number, color: string, op: number) => g.pen(pts, { w, color, seed, wobble: 0.5, boil: 0.25, taper: 1, opacity: op, retrace: false, progress: 1 });
    // the dead saloon sign, first, like the rest of the town
    g.group("plain", () => facadeSign(g, env, reveal));
    // the blue light: behind the mesa, beating; along the streak, an afterglow that runs down its length
    g.group("plain", () => masked(g, GLOW_MASK, () => {
      g.glow(HEART[0], HEART[1], 330, B_GLOW, reveal * (0.3 + 0.28 * b));
      g.glow(HEART[0], HEART[1] - 10, 120, B_LINE, reveal * (0.22 + 0.55 * b));
      const e = along(STREAK, ENTRY); g.glow(e[0], e[1], 40, B_LINE, reveal * (0.25 + 0.4 * b));
      for (let i = 0; i < 56; i++) {
        const k = 0.04 + (i / 55) * (ENTRY - 0.04), p = along(STREAK, k), run = 0.5 + 0.5 * Math.cos(T - k * Math.PI * 2), shim = 0.07 * Math.sin(T * 7 + i * 1.9);
        g.glow(p[0], p[1], 16 + 22 * k, B_GLOW, reveal * clamp((0.05 + 0.2 * run) * (0.35 + 0.65 * k) + shim));
      }
    }), { blend: "screen" });
    // the rims, in the alien hand, brightening with each beat
    g.group("plain", () => {
      RIMS.forEach((r, i) => pen(r.pts, 1.6 + 1.4 * r.k, 900 + i, B_LINE, reveal * clamp(0.25 + r.k * (0.45 + 0.35 * b))));
      TOWN_RIMS.forEach((r, i) => pen(r.pts, 1.3, 920 + i, B_LINE, reveal * clamp(r.k * (0.8 + 0.5 * b))));
      // the glass of the dead windows catches it too
      [...salWin, ...storeWin].forEach((q, i) => pen([q[2], [q[2][0] - 2, q[2][1] + 12]], 1, 940 + i, B_MID, reveal * (0.3 + 0.4 * b)));
    });
    // the windmill: eighteen slats turning once a loop, the tail vane into the wind, all in silhouette
    g.group("plain", () => {
      const [hx, hy] = MILL.hub, R = MILL.r;
      fillShape(g, oval(hx, hy, R, R, 28), DARK, 0.22 * reveal);
      g.pen(oval(hx, hy, R, R, 28), { w: 1.8, color: INK, seed: 960, wobble: 0.5, boil: 0, opacity: 0.9 * reveal, retrace: false, closed: true });
      g.pen(oval(hx, hy, R * 0.4, R * 0.4, 16), { w: 1.2, color: INK, seed: 961, wobble: 0.4, boil: 0, opacity: 0.8 * reveal, retrace: false, closed: true });
      for (let i = 0; i < 18; i++) { const a = T + (i * Math.PI * 2) / 18, ca = Math.cos(a), sa = Math.sin(a); pen([[hx + ca * R * 0.4, hy + sa * R * 0.4], [hx + ca * R - sa * 7, hy + sa * R + ca * 7]], 1.5, 962 + i, INK, 0.85 * reveal); }
      pen([[hx + 6, hy + 2], [hx + 120, hy - 2]], 2, 990, INK, 0.9 * reveal);
      fillShape(g, [[hx + 92, hy - 12], [hx + 150, hy - 40], [hx + 154, hy + 26], [hx + 94, hy + 10]], DARK, 0.8 * reveal); pen([[hx + 92, hy - 12], [hx + 150, hy - 40]], 1.4, 993, INK, 0.9 * reveal); pen([[hx + 94, hy + 10], [hx + 154, hy + 26]], 1.4, 994, INK, 0.9 * reveal);
      fillShape(g, blob(hx, hy, 7, 7, 991, 0.1, 8), INK, 0.95 * reveal);
      // the glow catches the slats on the side facing it
      pen([[hx - R * 0.98, hy - R * 0.2], [hx - R * 0.8, hy + R * 0.58]], 1.4, 992, B_MID, reveal * (0.35 + 0.35 * b));
    });
    // stars twinkling, each at a whole number of cycles a loop
    g.group("plain", () => TWINKLE.forEach((s, i) => { const v = Math.max(0, Math.sin(T * s.k + s.ph)) ** 3; if (v > 0.02) fillShape(g, sparkle(s.x, s.y, s.s * (0.6 + 0.5 * v)), STAR, reveal * v * 0.95); }));
    // the mine breathes out a dust that glitters, in time with the heart
    g.group("plain", () => DUST.forEach((d, i) => {
      const a = (((t / LOOP) * d.k + d.ph) % 1 + 1) % 1, life = Math.sin(Math.PI * a), glint = 0.35 + 0.65 * Math.max(0, Math.sin(T * d.tw + i * 2.3)) ** 4;
      const x = MOUTH[0] + d.dx * a + Math.sin(a * 5 + d.wob) * 8, y = MOUTH[1] + d.dy * a * (0.6 + 0.4 * a) + Math.cos(a * 4 + d.wob) * 4, o = reveal * life * glint * (0.6 + 0.4 * b);
      if (o < 0.03) return;
      fillShape(g, sparkle(x, y, d.s * (1.5 + 2.5 * glint)), B_LINE, o);
      if (glint > 0.8) g.glow(x, y, 7, B_GLOW, o * 0.6);
    }), { blend: "screen" });
  },
});
