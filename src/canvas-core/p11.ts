// PAGE 11 · LE GRAND DEPART. One idea: the whole world you rode through, laid out below like a
// map, and ahead of you a street made of stars.
// Focal subject: the pebble-smooth ship rising away from us, seen from behind and a little
// below, the column of light still hanging from its belly down to the crater on the mesa.
// Far below: the mesa, Dust Creek as a few tally marks and a windmill, the gang's torches on the
// trail, the curve of the earth pulling away from a ruled horizon.
// One light: the ship's underside and its column. The belly is the palest thing on the plate,
// the crater takes a pool of it, everything else is night; the cliffs face away and stay dark.
// What moves: the ship's hover-bob, the column shimmering with motes climbing it, rings of light
// shed under the belly, stars streaming toward us down the two frontages of the sky street,
// the torches flickering far below.
import { drawShip } from "./ship";
import { rng, type Gfx, type P } from "./core";
import { blob, clamp, fillShape, lerpP } from "./gallery";
import { CYAN, page, perspective, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { paper: PAPER, ink: INK, deep: DEEP, mid: MID, pale: PALE, glow: GLOW } = CYAN;

// ---------------------------------------------------------------- the world below, as geometry
const HZ = 500, CURVE = 6000; // the limb touches the ruled horizon at the centre and falls away
const limb = (x: number) => HZ + ((x - 800) * (x - 800)) / (2 * CURVE);
const { G } = perspective([800, HZ]); // the desert floor, seen from very high up
const LIMB: P[] = Array.from({ length: 18 }, (_, i) => { const x = -40 + i * 100; return [x, limb(x)] as P; });

// the sky street: two frontages of stars converging on a vanishing point above the ship
const VPS: P = [1122, 72];
const STREET: [P, P] = [[-40, 480], [1640, 404]];

// the ship, at rest, heading up the sky street: a long smooth pebble seen from behind and below,
// its rear toward us, its nose toward the vanishing point. `c` is where the hover-bob has it.
const C: P = [830, 300];
const AX: P = (() => { const d = [VPS[0] - C[0], VPS[1] - C[1]], l = Math.hypot(d[0], d[1]); return [d[0] / l, d[1] / l] as P; })();
const NX: P = [-AX[1], AX[0]]; // across the hull, toward its underside
const LEN = 170; // half-length along the axis (foreshortened)
const at = (c: P, along: number, across: number): P => [c[0] + AX[0] * along + NX[0] * across, c[1] + AX[1] * along + NX[1] * across];
const BELLY = (c: P) => at(c, -90, 34); // where the light leaves the hull
const CRATER: P = [792, 756];

// the mesa: its top seen from above, bays and spurs in its rim, the cliff dropping on the near side
const MESA_TOP: P[] = [[598, 768], [622, 748], [690, 734], [742, 727], [768, 718], [800, 716], [836, 724], [900, 728], [948, 742], [970, 760], [950, 774], [900, 784], [872, 782], [840, 796], [760, 800], [700, 794], [648, 786]];
const EDGE: P[] = [...MESA_TOP.slice(9), MESA_TOP[0]]; // the rim on the near side, right to left
const CLIFF = [26, 44, 54, 60, 68, 72, 62, 44, 20];
const FOOT: P[] = EDGE.map(([x, y], i) => [x + (x - 790) * 0.04, y + CLIFF[i]] as P);
const MESA: P[] = [...MESA_TOP.slice(0, 10), ...FOOT]; // the whole mesa, back rim and cliff foot
// the column of light, from the belly down into the crater
const COL_TOP = BELLY(C), COL_W0 = 58, COL_W1 = 44;

// a point k (0..1) of the way along a polyline
const along = (pts: P[], k: number): P => { const n = pts.length - 1, f = clamp(k) * n, j = Math.min(n - 1, Math.floor(f)); return lerpP(pts[j], pts[j + 1], f - j); };

// Dust Creek from the sky: a main street, a few false fronts, the windmill
const TOWN: P = [470, 694];
const fronts = [[-44, 1, 18, 12], [-27, 1, 24, 10], [-9, 1, 15, 12], [9, 1, 20, 13], [30, 1, 13, 10], [-36, -1, 16, 12], [-15, -1, 21, 13], [6, -1, 15, 10], [24, -1, 18, 12]] as const;
const SDIR: P = [0.9, -0.43]; // the town's main street runs off toward the far trail
const frontQuad = ([s, side, h, w]: readonly [number, number, number, number]) => {
  const b: P = [TOWN[0] + SDIR[0] * s - SDIR[1] * side * 9, TOWN[1] + SDIR[1] * s + SDIR[0] * side * 9], e: P = [b[0] + SDIR[0] * w, b[1] + SDIR[1] * w];
  return [b, [b[0], b[1] - h], [e[0], e[1] - h], e] as P[];
};
// the near row stands in front of the far one: the far fronts are not drawn behind it
const NEAR_FRONTS = fronts.filter((f) => f[1] > 0).map(frontQuad);
const townFront = (f: readonly [number, number, number, number], i: number) => {
  const [b, tl, tr, e] = frontQuad(f), hide = f[1] < 0 ? NEAR_FRONTS : undefined;
  return [st([b, tl], 1.1, 300 + i * 3, 0.9, 0.2), st([tl, tr], 1, 301 + i * 3, 0.85, 0.2), st([tr, e], 0.9, 302 + i * 3, 0.8, 0.2)].map((x) => ({ ...x, hide }));
};
const MILL: P = [530, 660];
const TRAIL_S: P[] = [[-30, 872], [110, 832], [250, 792], [360, 752], [446, 710]];
const TRAIL_N: P[] = [[506, 682], [600, 650], [720, 612], [860, 581], [1000, 556], [1120, 539], [1210, 528]];
const SPUR: P[] = [[492, 704], [540, 722], [576, 742], [598, 764], [606, 784]]; // where the gang came up
const TORCHES: P[] = [0.04, 0.13, 0.22, 0.31, 0.4, 0.5, 0.6, 0.7, 0.79, 0.9].map((k, i) => { const p = along(SPUR, k); return [p[0] + ((i * 7) % 5) - 2, p[1] + ((i * 3) % 4) - 3] as P; });
const CREEK: P[] = [[250, 531], [272, 548], [244, 574], [292, 604], [336, 638], [312, 676], [380, 716], [432, 744], [418, 788], [498, 830], [466, 874], [540, 918]];
const bank = (pts: P[], k: number): P[] => pts.map(([x, y]) => [x + ((y - 520) / 380) * k, y + ((y - 520) / 380) * k * 0.4] as P);
// far buttes, flattened by the height we are at
const butte = (x: number, w: number, h: number): P[] => { const y = limb(x) + 12 + h; return [[x - w / 2, y], [x - w / 2 + h * 0.9, y - h], [x + w / 2 - h * 0.7, y - h], [x + w / 2, y]]; };
const BUTTES = [butte(330, 70, 8), butte(560, 40, 5), butte(1180, 96, 9), butte(1420, 46, 6)];
// a second, lower table-land to the right, and its broken rim
const TABLE_TOP: P[] = [[1150, 640], [1210, 630], [1290, 624], [1330, 630], [1360, 626], [1418, 640], [1396, 650], [1330, 656], [1250, 662], [1180, 656]];
const TABLE_EDGE: P[] = [...TABLE_TOP.slice(5), TABLE_TOP[0]];
const TABLE_FOOT: P[] = TABLE_EDGE.map(([x, y], i) => [x, y + [14, 24, 30, 28, 20, 12][i]] as P);
// a dry wash cutting the near desert, branching as it climbs toward the table-land
const ARROYO: P[][] = [[[1610, 724], [1540, 748], [1492, 770], [1440, 792], [1400, 830], [1330, 862], [1300, 910]], [[1492, 770], [1520, 806], [1560, 832], [1600, 866]], [[1440, 792], [1410, 770], [1372, 758], [1330, 752]], [[1400, 830], [1440, 856], [1470, 900]]];


// contour rings round the mesa, broken where a draughtsman lifts the pen
const ring = (cx: number, cy: number, rx: number, ry: number, gaps: [number, number][], seed: number) => gaps.map(([a0, a1], i) => st(Array.from({ length: 12 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / 11; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry] as P; }), 0.8, seed + i, 0.38, 0.3));

// ---------------------------------------------------------------- the pen
// the sky's fixed stars: loose drifts, none behind the ship, none below the limb
const fixed = (() => { const r = rng(410), out: Omit<Stroke, "at">[] = []; for (let i = 0; out.length < 70 && i < 900; i++) {
  const band = r() < 0.55, x = band ? r() * 1600 : r() * 1600, y = band ? 360 - x * 0.18 + (r() - 0.5) * 150 : 20 + r() * 440;
  if (y < 12 || y > limb(x) - 18 || Math.hypot(((x - C[0]) * AX[0] + (y - C[1]) * AX[1]) / 200, ((x - C[0]) * NX[0] + (y - C[1]) * NX[1]) / 115) < 1) continue;
  const big = r() < 0.12, s = big ? 3.2 : 1;
  out.push(big ? st([[x - s, y], [x + s, y]], 1.1, 420 + i, 0.9, 0.1) : st([[x, y], [x + 1.2, y + 0.6]], 0.8 + r() * 0.9, 420 + i, 0.5 + r() * 0.4, 0.1));
  if (big) out.push(st([[x, y - s], [x, y + s]], 1.1, 1420 + i, 0.9, 0.1));
} return out; })();
// scrub and stones on the desert floor: sparse far, bigger near, never on the mesa
const floor = (() => { const r = rng(520), out: Omit<Stroke, "at">[] = []; for (let i = 0; out.length < 60 && i < 600; i++) {
  const z = 1.02 + r() * r() * 9, u = (r() - 0.5) * 3600 * Math.min(1, z / 2), [x, y] = G(u, z);
  if (x < 10 || x > 1590 || y > 895 || y < limb(x) + 8 || (x > 580 && x < 990 && y > 715 && y < 880) || Math.hypot(x - TOWN[0], y - TOWN[1]) < 45) continue;
  const l = (5 + r() * 9) / z; out.push(st([[x, y], [x + l * 0.5, y - 0.5 / z], [x + l, y + 0.4 / z]], Math.max(0.6, 1.2 / z), 530 + i, 0.3 + 0.2 / z, 0.3));
} return out; })();
const dash = (a: P, b: P, n: number, seed: number, w = 0.9, op = 0.45) => Array.from({ length: n }, (_, i) => st([lerpP(a, b, i / n), lerpP(a, b, (i + 0.55) / n)], w, seed + i, op, 0.1));
const ticks = (a: P, b: P, n: number, len: number, seed: number) => Array.from({ length: n + 1 }, (_, i) => { const p = lerpP(a, b, i / n), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), k = i % 2 ? len * 0.55 : len; return st([[p[0] - (dy / l) * k, p[1] + (dx / l) * k], [p[0] + (dy / l) * k, p[1] - (dx / l) * k]], 0.8, seed + i, 0.45, 0.1); });

const flutes = Array.from({ length: 30 }, (_, i) => { const k = (i + 0.3 + ((i * 7) % 5) * 0.09) / 30, a = along(EDGE, k), b = along(FOOT, k), f = [1, 0.6, 0.85, 0.45, 1, 0.7][i % 6], j = ((i * 5) % 7) - 3; return st([[a[0], a[1] + 1], [a[0] + j * 0.4, a[1] + (b[1] - a[1]) * f * 0.5], [a[0] + j * 0.7, a[1] + (b[1] - a[1]) * f - 1]], 0.7 + (i % 3) * 0.35, 360 + i, 0.4 + (i % 4) * 0.1, 0.4); });
const tableFlutes = [0.05, 0.12, 0.2, 0.26, 0.3, 0.38, 0.45, 0.52, 0.6, 0.66, 0.74, 0.78, 0.86, 0.93].map((k, i) => { const a = along(TABLE_EDGE, k), b = along(TABLE_FOOT, k); return st([[a[0], a[1] + 1], [b[0] + ((i % 3) - 1), b[1] - 1]], 0.8, 390 + i, 0.5, 0.3); });
const ejecta = Array.from({ length: 11 }, (_, i) => { const a = -2.9 + (i / 10) * 5.6, r1 = 54 + ((i * 13) % 5) * 5, r2 = r1 + 18 + ((i * 7) % 4) * 9; return st([[CRATER[0] + Math.cos(a) * r1, CRATER[1] + Math.sin(a) * r1 * 0.28], [CRATER[0] + Math.cos(a) * r2, CRATER[1] + Math.sin(a) * r2 * 0.28]], 0.9, 380 + i, 0.6, 0.2); });

const strokes: Stroke[] = [
  // 1. the limb of the earth, the ruled horizon it has already left, the two frontages of the sky
  ...seq([st(LIMB, 2.4, 1, 0.95, 0.5), st([[30, HZ], [1570, HZ]], 0.8, 2, 0.4, 0), st([VPS, STREET[0]], 0.8, 3, 0.3, 0), st([VPS, STREET[1]], 0.8, 4, 0.3, 0)], 0, 16),
  // 2. the mesa, big, then the crater the ship left
  ...seq([st([...MESA_TOP, MESA_TOP[0]], 2.2, 10, 0.95, 0.6), st(FOOT, 1.8, 11, 0.85, 0.6), st([EDGE[0], FOOT[0]], 1.6, 12, 0.8), st([EDGE[EDGE.length - 1], FOOT[FOOT.length - 1]], 1.6, 13, 0.8),
    st(blob(CRATER[0], CRATER[1], 46, 13, 14, 0.12, 14), 1.8, 15, 0.95, 0.3), st([[CRATER[0] - 34, CRATER[1] + 3], [CRATER[0], CRATER[1] + 8], [CRATER[0] + 32, CRATER[1] + 4]], 1, 16, 0.6, 0.3)], 8, 30),
  // 3. the land beyond: the trail, the creek the town is named for, the far buttes, the table-land
  ...seq([st(TRAIL_S, 1.8, 20, 0.85, 0.8), st(TRAIL_N, 1.3, 21, 0.7, 0.8), st(CREEK, 1.4, 22, 0.75, 1),
    ...BUTTES.flatMap((b, i) => [st([b[0], b[1]], 1.1, 30 + i * 3, 0.8, 0.3), st([b[1], b[2]], 1.2, 31 + i * 3, 0.85, 0.3), st([b[2], b[3]], 1, 32 + i * 3, 0.75, 0.3)]),
    st([...TABLE_TOP, TABLE_TOP[0]], 1.5, 45, 0.85, 0.5), st(TABLE_FOOT, 1.1, 46, 0.7, 0.5), ...ARROYO.map((a, i) => st(a, 1.3 - i * 0.2, 47 + i, 0.6, 1))], 18, 44),
  // 4. Dust Creek, no bigger than a thumbnail: the street, its fronts, the windmill; the gang's way up
  ...seq([st([[TOWN[0] - 56, TOWN[1] + 27], [TOWN[0] + 56, TOWN[1] - 27]], 1.2, 50, 0.8, 0.2), ...fronts.flatMap(townFront),
    st([[MILL[0] - 2.5, MILL[1]], [MILL[0] - 0.6, MILL[1] - 22]], 0.9, 60, 0.9, 0.1), st([[MILL[0] + 2.5, MILL[1]], [MILL[0] + 0.6, MILL[1] - 22]], 0.9, 64, 0.9, 0.1), st([[MILL[0] - 2, MILL[1] - 8], [MILL[0] + 2, MILL[1] - 8]], 0.6, 59, 0.7, 0),
    st(blob(MILL[0], MILL[1] - 25, 8, 8, 61, 0.03, 12), 0.9, 62, 0.85, 0.1), ...[0, 0.52, 1.05, 1.57, 2.1, 2.62].map((a, i) => st([[MILL[0] + Math.cos(a) * 8, MILL[1] - 25 + Math.sin(a) * 8], [MILL[0] - Math.cos(a) * 8, MILL[1] - 25 - Math.sin(a) * 8]], 0.6, 66 + i, 0.7, 0)),
    st([[MILL[0] + 2, MILL[1] - 25], [MILL[0] + 16, MILL[1] - 26]], 0.8, 65, 0.8, 0), st([[MILL[0] + 12, MILL[1] - 30], [MILL[0] + 18, MILL[1] - 31], [MILL[0] + 18, MILL[1] - 22], [MILL[0] + 12, MILL[1] - 23]], 0.8, 58, 0.8, 0),
    st(SPUR, 0.9, 63, 0.45, 0.6), ...ejecta, ...flutes, ...tableFlutes], 30, 62),
  // 5. the draughtsman's lines: contours round the mesa, the map's meridians, the plumb line of the
  //    column with its altitude ticks, the ship's heading ruled out to the vanishing point
  ...seq([
    ...[...ring(792, 790, 260, 96, [[-0.2, 1.3], [1.6, 2.9], [3.3, 5.6]], 70), ...ring(792, 796, 360, 118, [[0.1, 1.1], [1.35, 2.5], [2.8, 3.6], [4.2, 5.9]], 80), ...ring(820, 800, 480, 140, [[-0.5, 0.9], [2.2, 2.95]], 90)].map((r) => ({ ...r, hide: [MESA] })),
    ...[-2600, -1300, 1300, 2600].map((u, i) => st([G(u, 1.05), G(u, 3.2), G(u, 11)], 0.7, 100 + i, 0.22, 0.2)),
    st([[COL_TOP[0] + 1, 420], CRATER], 0.8, 110, 0.4, 0), ...ticks([COL_TOP[0] + 1, 440], [CRATER[0] + 0.2, 720], 7, 6, 111),
    ...dash(at(C, LEN + 18, 0), [VPS[0] - AX[0] * 16, VPS[1] - AX[1] * 16], 9, 130),
    st(blob(VPS[0], VPS[1], 9, 9, 150, 0.04, 14), 0.9, 151, 0.6, 0.1), st([[VPS[0] - 18, VPS[1]], [VPS[0] + 18, VPS[1]]], 0.8, 152, 0.6, 0), st([[VPS[0], VPS[1] - 18], [VPS[0], VPS[1] + 18]], 0.8, 153, 0.6, 0),
    ...ticks([30, HZ], [1570, HZ], 22, 5, 160),
  ], 42, 78),
  // 6. the stars that stay put, the scrub, the second bank of the creek
  ...seq([...fixed, st(bank(CREEK, 12).slice(3), 0.9, 23, 0.45, 1), ...floor], 58, 94, 0.6),
  // 7. last dark searching lines: under the cliff foot, inside the crater
  ...seq([st(FOOT.slice(2, -2).map(([x, y]) => [x, y + 3] as P), 2.4, 200, 0.7, 0.8), st([[CRATER[0] - 40, CRATER[1] - 2], [CRATER[0] - 10, CRATER[1] - 10], [CRATER[0] + 30, CRATER[1] - 6]], 1.6, 201, 0.8, 0.3),
    st([TRAIL_S[3], TRAIL_S[4]], 2.2, 202, 0.8, 0.5)], 88, 100),
];

// ---------------------------------------------------------------- the washes
const band = (y0: number, y1: number, seed: number, amp = 20): P[] => { const r = rng(seed); return [[-40, y0], [1640, y0], ...Array.from({ length: 9 }, (_, i) => [1640 - i * 210, y1 + (r() - 0.5) * 2 * amp] as P)]; };
const underLimb = (dy: number, bottom: number): P[] => [...LIMB.map(([x, y]) => [x, y + dy] as P), [1640, bottom], [-40, bottom]];
const overLimb = (h: number): P[] => [...LIMB.map(([x, y]) => [x, y - h] as P), ...[...LIMB].reverse().map(([x, y]) => [x, y + 2] as P)];
const COLUMN: P[] = [[COL_TOP[0] - COL_W0, COL_TOP[1] + 40], [COL_TOP[0] + COL_W0, COL_TOP[1] + 40], [CRATER[0] + COL_W1, CRATER[1]], [CRATER[0] - COL_W1, CRATER[1]]];
const washes: Wash[] = [
  // the night: deepest overhead, thinning to the paper's own blue down at the limb
  { pts: [[-40, -40], [1640, -40], ...LIMB.map(([x, y]) => [x, y - 10] as P).reverse()], color: DEEP, alpha: 0.4, seed: 501, pool: 0, at: [42, 72], from: C },
  { pts: overLimb(22), color: MID, alpha: 0.4, seed: 502, pool: 0, at: [46, 74], from: [800, HZ] }, // the air, lit edge-on
  // the desert: dark, a little paler toward the limb where the air thickens
  { pts: underLimb(0, 940), color: DEEP, alpha: 0.42, seed: 510, pool: 0.5, at: [50, 80], from: CRATER, ph: 1 },
  { pts: underLimb(0, 580).map(([x, y]) => [x, Math.min(y, 590)] as P), color: MID, alpha: 0.35, seed: 511, pool: 0, at: [52, 80], from: CRATER, ph: 1 },
  { pts: band(800, 960, 3, 30).map(([x, y]) => [x, 1760 - y] as P), color: DEEP, alpha: 0.28, seed: 513, pool: 0, at: [54, 82], from: [800, 900], ph: 1 }, // the near desert, deepest under us
  // the pool of light where the column lands, the mesa top taking the most of it
  { pts: blob(CRATER[0], CRATER[1] + 14, 280, 86, 520, 0.08, 18), color: PALE, alpha: 0.14, seed: 521, pool: 0, at: [58, 86], from: CRATER, ph: 2 },
  { pts: MESA_TOP, color: PALE, alpha: 0.32, seed: 522, pool: 0.1, at: [60, 86], from: CRATER, ph: 2 },
  { pts: COLUMN, color: GLOW, alpha: 0.16, seed: 523, pool: 0, at: [62, 90], from: COL_TOP, ph: 2 },
  // darks: the cliffs turned away from the light, the far buttes, the town, the table-land's rim
  { pts: [...EDGE, ...[...FOOT].reverse()], color: DEEP, alpha: 0.6, seed: 530, pool: 0.7, at: [70, 94], from: CRATER, ph: 3 },
  ...BUTTES.map((b, i) => ({ pts: b, color: DEEP, alpha: 0.45, seed: 540 + i, at: [72, 94] as [number, number], ph: 3 })),
  { pts: [...TABLE_EDGE, ...[...TABLE_FOOT].reverse()], color: DEEP, alpha: 0.5, seed: 546, pool: 0.6, at: [74, 94], ph: 3 },
  { pts: blob(TOWN[0] + 6, TOWN[1] - 4, 44, 16, 547, 0.3, 12, -0.45), color: DEEP, alpha: 0.4, seed: 548, at: [76, 96], ph: 3 },
  { pts: blob(CRATER[0], CRATER[1], 42, 11, 549, 0.1, 12), color: GLOW, alpha: 0.7, seed: 550, pool: 0, at: [78, 96], from: CRATER, ph: 3 },
];

// ---------------------------------------------------------------- what moves
const street = (() => { const r = rng(700); return STREET.flatMap((near, side) => Array.from({ length: 17 }, (_, i) => ({ near, off: (i + r() * 0.5) / 17, lat: (r() - 0.5) * 34, b: 0.6 + r() * 0.5, side }))); })();
const motes = (() => { const r = rng(760); return Array.from({ length: 16 }, (_, i) => ({ off: i / 16 + r() * 0.04, x: (r() - 0.5) * 1.6, k: 1 + Math.floor(r() * 2) })); })();
const frac = (v: number) => v - Math.floor(v);
const sparkle = (g: Gfx, x: number, y: number, s: number, a: number) => {
  g.glow(x, y, s * 3.2, GLOW, 0.35 * a);
  fillShape(g, [[x - s * 3, y], [x, y - s * 0.45], [x + s * 3, y], [x, y + s * 0.45]], INK, a);
  fillShape(g, [[x, y - s * 3], [x + s * 0.45, y], [x, y + s * 3], [x - s * 0.45, y]], INK, a);
};

export const p11 = page({
  id: "p11", title: "Le Grand Depart", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 14, seed: 990, at: 98, box: [40, 30, 1560, 430] },
  animAt: [34, 100],
  anim: (g, t, reveal) => {
    const T = (t / LOOP) * Math.PI * 2, rLight = clamp((reveal - 0.35) / 0.65);
    // stars streaming toward us down the two frontages, each once a loop, faded in far and out near
    if (rLight > 0) g.group("plain", () => street.forEach((s) => {
      const q = frac(s.off + t / LOOP), z = 14 - 13 * q, d = 1 / z, dx = s.near[0] - VPS[0], dy = s.near[1] - VPS[1], l = Math.hypot(dx, dy);
      const x = VPS[0] + dx * d + (-dy / l) * s.lat * d, y = VPS[1] + dy * d + (dx / l) * s.lat * d, a = rLight * clamp(q / 0.15) * clamp((1 - q) / 0.1);
      if (a > 0.01) sparkle(g, x, y, s.b * (0.7 + 3.4 * d), a);
    }), { blend: "screen" });
    // the ship, bobbing on the column, drawn opaque over whatever sky is behind it
    const c: P = [C[0] + 1.5 * Math.sin(T + 0.8), C[1] + 5 * Math.sin(T)], belly = BELLY(c);
    drawShip(g, { c, ang: Math.atan2(AX[1], AX[0]), len: LEN }, { reveal, light: belly, hatch: { u: -0.3, k: 0.5, open: 0 } }); // hatch shut: they are aboard
    if (rLight <= 0) return;
    // the column, the belly's glow, the pool in the crater, and rings shed from the belly
    g.group("plain", () => {
      const cx = g.cur, sh = 0.5 + 0.5 * Math.sin(T * 3);
      fillShape(g, [[belly[0] - COL_W0, belly[1] + 6], [belly[0] + COL_W0, belly[1] + 6], [CRATER[0] + COL_W1, CRATER[1]], [CRATER[0] - COL_W1, CRATER[1]]], GLOW, (0.08 + 0.04 * sh) * rLight);
      for (let j = 0; j < 6; j++) {
        const u = -0.75 + j * 0.3; cx.beginPath();
        for (let k = 0; k <= 24; k++) { const f = k / 24, y = lerpP(belly, CRATER, f)[1], hw = COL_W0 + (COL_W1 - COL_W0) * f, x = lerpP(belly, CRATER, f)[0] + hw * u + Math.sin(y * 0.03 - T * (2 + (j % 3)) + j * 1.9) * 7; k ? cx.lineTo(x, y) : cx.moveTo(x, y); }
        cx.strokeStyle = GLOW; cx.lineWidth = 3 + (j % 3) * 3; cx.globalAlpha = rLight * (0.06 + 0.05 * (0.5 + 0.5 * Math.sin(T * (j % 2 ? 4 : 5) + j))); cx.stroke();
      }
      cx.globalAlpha = 1; g.touch(belly[0] - 120, belly[1] - 20, CRATER[0] + 120, CRATER[1] + 20);
      g.glow(belly[0], belly[1] + 10, 120, GLOW, (0.34 + 0.06 * Math.sin(T * 2)) * rLight);
      g.glow(CRATER[0], CRATER[1], 70, GLOW, (0.42 + 0.08 * sh) * rLight);
      for (let i = 0; i < 3; i++) {
        const p = frac(t / 60 + i / 3), q = lerpP(belly, CRATER, 0.12 + 0.2 * p), rx = 70 + 150 * p, ry = rx * (0.1 + 0.16 * p), a = rLight * (1 - p) ** 1.5 * clamp(p * 8) * 0.8;
        cx.beginPath(); cx.ellipse(q[0], q[1], rx, ry, 0, 0, Math.PI * 2); cx.strokeStyle = INK; cx.lineWidth = 2.2 - p; cx.globalAlpha = a; cx.stroke();
      }
      cx.globalAlpha = 1; g.touch(belly[0] - 240, belly[1] + 20, belly[0] + 240, belly[1] + 200);
      // motes climbing the column, one or two trips a loop each
      motes.forEach((m, i) => { const q = frac(m.off + (t / LOOP) * m.k), f = 1 - q, p = lerpP(belly, CRATER, f), hw = COL_W0 + (COL_W1 - COL_W0) * f, a = rLight * clamp(q / 0.1) * clamp((1 - q) / 0.15);
        fillShape(g, blob(p[0] + hw * m.x * 0.5, p[1], 1.6, 1.6, 780 + i, 0.1, 6), INK, 0.8 * a); });
    }, { blend: "screen" });
    // the gang's torches, far below, each flickering to its own two whole-cycle sines
    g.group("plain", () => TORCHES.forEach(([x, y], i) => {
      const f = rLight * clamp(0.55 + 0.25 * Math.sin(T * (5 + (i % 3)) + i * 1.7) + 0.2 * Math.sin(T * (11 + (i % 4)) + i * 0.9));
      g.glow(x, y, 7, GLOW, 0.7 * f); fillShape(g, blob(x, y, 1.4, 1.4, 820 + i, 0.1, 6), INK, f);
    }), { blend: "screen" });
  },
});
