// PAGE 10 · SHERIFF OF TWO WORLDS (ending). One idea: the same empty street as page 1, and now
// somebody stands in it, and something up there answers him.
// Focal subject: a new star over the mesa, shaped like the sheriff's badge (five points, ball
// tips), and the small new sheriff leaning on his porch post, looking up at it.
// One light: that star, low above the end of the street. Contre-jour like page 1: facades in deep
// blue, rooflines and the mesa rimmed white, the grazing light running down the boardwalk and
// throwing faint long shadows toward the reader.
// What moves: the star's rays turning and breathing as it rocks (it waves), the other stars
// twinkling, the windmill turning as on page 1, the lamp in the sheriff's window, and the badge
// on his chest glinting back. The sheriff's door, that banged on page 1, is shut and still.
import { Gfx, oval, rng, type Env, type Layer, type Medium, type P } from "./core";
import { letter, width } from "./drafting";
import { blob, fillShape, inside, mix } from "./gallery";
import { CYAN, G, U, VP, page, seq, st, wallQuad, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { paper: PAPER, ink: INK, deep: DEEP, mid: MID, pale: PALE, glow: GLOW } = CYAN;
const NIGHT = mix(DEEP, "#000000", 0.35); // the darkest blue: near fronts, doorways

const LX = -620, RX = 620; // the street's two frontages (page 1)
const STAR: P = [872, 228];

// ---------------------------------------------------------------- the town, as on page 1
const front = (u: number, z0: number, z1: number, h: number, step = 0) => {
  const top = step ? [U(u, z0, h - step), U(u, z0 + (z1 - z0) * 0.12, h - step), U(u, z0 + (z1 - z0) * 0.12, h), U(u, z1 - (z1 - z0) * 0.12, h), U(u, z1 - (z1 - z0) * 0.12, h - step), U(u, z1, h - step)] : [U(u, z0, h), U(u, z1, h)];
  return { wall: [G(u, z0), ...top, G(u, z1)], top, near: [G(u, z0), top[0]] as P[], far: [top[top.length - 1], G(u, z1)] as P[], base: [G(u, z0), G(u, z1)] as P[] };
};
const siding = (u: number, z0: number, z1: number, h0: number, h1: number, n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => { const h = h0 + ((h1 - h0) * (i + 0.5)) / n, r = rng(seed + i); const a = z0 + (z1 - z0) * r() * 0.15, b = z1 - (z1 - z0) * r() * 0.2; return st([U(u, a, h), U(u, b, h)], 0.7, seed + i, 0.3, 0.4); });
const windowStrokes = (u: number, z0: number, z1: number, h0: number, h1: number, seed: number) => {
  const q = wallQuad(u, z0, z1, h0, h1);
  return [st([q[0], q[1]], 1.2, seed, 0.85), st([q[1], q[2]], 1, seed + 1, 0.7), st([q[3], q[2]], 1.1, seed + 2, 0.8), st([q[0], q[3]], 2.2, seed + 3, 0.95), st([U(u, (z0 + z1) / 2, h0), U(u, (z0 + z1) / 2, h1)], 0.8, seed + 4, 0.7)];
};
const edges = (pts: P[], w: number, seed: number, op = 0.9, closed = true) => pts.slice(0, closed ? pts.length : -1).map((a, i) => st([a, pts[(i + 1) % pts.length]], w * (i % 2 ? 0.8 : 1), seed + i, op, 0.4));
const porch = (u: number, out: number, z0: number, z1: number, h: number, posts: number[], seed: number) => {
  const roof = [U(u, z0, h + 30), U(out, z0, h), U(out, z1, h), U(u, z1, h + 30)];
  return {
    roof,
    strokes: [st([roof[1], roof[2]], 2.4, seed, 0.95), st([roof[0], roof[1]], 1.6, seed + 1, 0.85), st([G(out, z0), G(out, z1)], 2.2, seed + 2, 0.9),
      ...posts.map((z, i) => st([G(out, z), U(out, z, h)], 2.6 / z, seed + 3 + i, 0.95, 0.5))],
    // the star is low and straight down the street: shadows run long, toward the reader
    shadows: posts.map((z, i): P[] => [G(out - 12, z), G(out + 12, z), G(out + 4, Math.max(0.62, z - 1.1)), G(out - 30, Math.max(0.6, z - 1.1))]).map((q, i) => ({ q, seed: seed + 20 + i })),
  };
};

const saloon = front(LX, 1.35, 2.35, 980), store = front(LX, 2.45, 3.3, 780, 90), adobe = front(LX, 3.4, 4.3, 430), barber = front(LX, 4.35, 5, 560);
const sheriff = front(RX, 1.3, 2.1, 840), hotel = front(RX, 2.2, 3.3, 1020), stable = front(RX, 3.4, 4.5, 620, 70);
const salPorch = porch(LX, LX + 100, 1.35, 2.35, 470, [1.42, 1.78, 2.15], 400), sherPorch = porch(RX, RX - 100, 1.3, 2.1, 450, [1.36, 1.7, 2.02], 420);
const hotelBalc = [U(RX, 2.2, 540), U(RX - 90, 2.2, 520), U(RX - 90, 3.3, 520), U(RX, 3.3, 540)];
const livery = front(LX, 0.66, 1.3, 860), bank = front(RX, 0.66, 1.25, 760);
const RAIL = { u: -455, z0: 1.02, z1: 1.28, h: 120 };
const TROUGH = { u0: -500, u1: -440, z0: 1.34, z1: 1.62, h: 70 };
const BARREL = { c: G(575, 1.16), r: 30, h: 88 };
const trough = { top: [U(TROUGH.u0, TROUGH.z0, TROUGH.h), U(TROUGH.u1, TROUGH.z0, TROUGH.h), U(TROUGH.u1, TROUGH.z1, TROUGH.h), U(TROUGH.u0, TROUGH.z1, TROUGH.h)], side: wallQuad(TROUGH.u1, TROUGH.z0, TROUGH.z1, 0, TROUGH.h), end: [G(TROUGH.u0, TROUGH.z0), G(TROUGH.u1, TROUGH.z0), U(TROUGH.u1, TROUGH.z0, TROUGH.h), U(TROUGH.u0, TROUGH.z0, TROUGH.h)] };
const barrel = (() => { const [x, y] = BARREL.c, { r, h } = BARREL; return { body: [[x - r, y - h], [x - r - 3, y - h / 2], [x - r, y], [x, y + 6], [x + r, y], [x + r + 3, y - h / 2], [x + r, y - h]] as P[], top: oval(x, y - h, r, 7, 14) }; })();
const marks = (() => { const r = rng(700); return Array.from({ length: 60 }, (_, i) => { const z = 0.95 + r() * r() * 4, u = -500 + r() * 1000, [x, y] = G(u, z), l = (8 + r() * 12) / z; return st([[x, y], [x + l * 0.5, y - 0.8 / z], [x + l, y + 0.6 / z]], Math.max(0.6, 1.3 / z), 710 + i, 0.25 + 0.15 / z, 0.4); }); })();
const tufts = [[-600, 1.1], [-590, 1.9], [600, 1.5], [595, 2.4], [-600, 2.9], [610, 0.9]].map(([u, z], i) => { const [x, y] = G(u, z), k = 18 / z; return st([[x - k * 0.6, y - k * 0.9], [x - k * 0.2, y], [x, y - k * 1.2], [x + k * 0.2, y], [x + k * 0.7, y - k * 0.8]], 1.1 / z, 760 + i, 0.7, 0.5); });

const MILL = { foot: G(-120, 7), h: 150, r: 38, hub: [0, 0] as P };
MILL.hub = [MILL.foot[0], MILL.foot[1] - MILL.h];
const MESA: P[] = [[700, 468], [712, 440], [728, 412], [760, 402], [880, 398], [912, 410], [930, 440], [946, 468]];
const FLAT: P[] = [[946, 468], [1000, 466]];
const SKY: P[] = [[-120, -240], ...livery.top, ...saloon.top, ...store.top, ...adobe.top, ...barber.top, ...MESA.slice(3), ...FLAT.slice(1),
  ...[bank, sheriff, hotel, stable].reverse().flatMap((b) => [...b.top].reverse()), [1720, -240]];

// ---------------------------------------------------------------- the new sheriff
// Seen from behind on his porch, leaning his left shoulder on the near post, head tipped back to
// the star. Drawn upright around his feet (y up is negative), then leaned toward the post.
const FOOT: P = [1284, G(0, 1.33)[1]];
const lean = ([x, y]: P): P => [FOOT[0] + x + 0.13 * y, FOOT[1] + y];
// his head is turned to the left, into lost profile, chin up: the face is only an edge against the lamp
const FIG_PARTS = {
  rBoot: [[3, 0], [15, 0], [15, -6], [13, -22]] as P[],
  rLeg: [[13, -22], [14, -40], [14, -50]] as P[],
  rCoat: [[14, -50], [24, -52], [22, -75], [20, -96]] as P[],
  rArm: [[20, -96], [23, -99], [34, -120], [30, -142], [25, -152]] as P[],
  rShoulder: [[25, -152], [14, -157], [7, -162]] as P[],
  nape: [[7, -162], [10, -172], [12, -183]] as P[],
  skull: [[12, -183], [4, -191], [-12, -190]] as P[], // under the hat
  face: [[-12, -190], [-15, -187], [-20, -186], [-18, -181], [-20, -177], [-15, -172], [-10, -168], [-8, -165]] as P[],
  lShoulder: [[-8, -165], [-13, -160], [-25, -153]] as P[],
  lArm: [[-24, -152], [-27, -140], [-27, -120], [-25, -100], [-25, -92], [-21, -90]] as P[],
  lCoat: [[-21, -90], [-21, -76], [-23, -52]] as P[],
  lLeg: [[-23, -52], [-14, -50], [-14, -40], [-15, -22], [-15, -6], [-13, -2], [-4, -2]] as P[],
  crotch: [[-4, -2], [-4, -20], [-2, -48], [2, -48], [3, -20], [3, 0]] as P[],
};
const FIG: P[] = Object.values(FIG_PARTS).flatMap((s) => s.slice(0, -1)).map(lean);
// the hat, pushed back: brim tipped up at the front (his left), crown leaning away from his face
const BRIM_TILT = 0.36, brimAt = (s: number, off = 0): P => [-2 + Math.cos(BRIM_TILT) * s + Math.sin(BRIM_TILT) * off, -187 + Math.sin(BRIM_TILT) * s - Math.cos(BRIM_TILT) * off];
const BRIM: P[] = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2; return lean(brimAt(Math.cos(a) * 22, Math.sin(a) * 4)); });
const CROWN: P[] = ([brimAt(-10), brimAt(-9, 13), brimAt(-5, 16), brimAt(0, 13.5), brimAt(5, 15.5), brimAt(9, 12), brimAt(9.5)] as P[]).map(lean);
const fp = (k: keyof typeof FIG_PARTS) => FIG_PARTS[k].map(lean);
// his contour, lit side heavy: [points, width, opacity]
const FIG_LINES: [P[], number, number][] = [
  [CROWN.slice(0, 5), 2, 1], [CROWN.slice(4), 1.2, 0.75], [[...BRIM.slice(8), BRIM[0]], 2, 1], [BRIM.slice(0, 9), 1.1, 0.7], [fp("face"), 1.1, 0.7], [fp("lShoulder"), 2, 1], [[...fp("lArm"), ...fp("lCoat").slice(1)], 2, 0.95],
  [[...fp("rShoulder")].reverse(), 1.2, 0.7], [[...fp("rArm")].reverse(), 1.1, 0.65], [[...fp("rCoat")].reverse(), 1.1, 0.65],
  [fp("lLeg"), 1.3, 0.8], [fp("rLeg"), 1.1, 0.7], [fp("rBoot"), 1.3, 0.8], [fp("crotch"), 0.9, 0.55],
  [[lean([0, -52]), lean([1, -72]), lean([0, -92])], 0.9, 0.45], // the back vent of his duster
];
// the light between his right arm and his side, hand on the hip
const ARM_GAP: P[] = ([[21, -134], [29, -119], [22, -105]] as P[]).map(lean);
const BADGE = lean([-26, -141]); // on his chest, just showing past his left side

// ---------------------------------------------------------------- the pen, in the order a hand draws it
const RIM = { color: GLOW }; // the edges the star catches
const strokes: Stroke[] = [
  // 1. horizon, land forms, the street running to the star
  ...seq([{ ...st(MESA, 2.6, 2, 1), ...RIM }, st(FLAT, 1, 5, 0.6)], 0, 14),
  ...seq([st([G(LX + 100, 1.0), G(LX + 100, 5)], 2.6, 10, 0.75, 0.6), st([G(RX - 100, 1.0), G(RX - 100, 4.5)], 2.6, 11, 0.75, 0.6),
    st([G(-190, 0.95), G(-190, 5), G(-150, 14)], 1.6, 12, 0.45, 1.4), st([G(-120, 0.95), G(-120, 6), G(-100, 14)], 1.2, 13, 0.35, 1.4),
    st([G(110, 0.95), G(110, 5.5), G(90, 14)], 1.4, 14, 0.4, 1.4), st([G(180, 0.95), G(180, 5), G(140, 14)], 1.6, 15, 0.45, 1.4)], 3, 22),
  // 2. the near buildings, big shapes first; their tops and far corners rimmed by the star
  ...seq([{ ...st(livery.top, 2.4, 16, 0.9), ...RIM }, st(livery.far, 3.4, 17), { ...st(bank.top, 2.4, 18, 0.9), ...RIM }, st(bank.far, 3.4, 19),
    st(saloon.near, 3.2, 20, 0.85), { ...st(saloon.top, 2.8, 21, 1), ...RIM }, { ...st(saloon.far, 2.8, 22, 1), ...RIM },
    st(sheriff.near, 3.2, 23, 0.85), { ...st(sheriff.top, 2.8, 24, 1), ...RIM }, { ...st(sheriff.far, 2.8, 25, 1), ...RIM },
    ...salPorch.strokes, ...sherPorch.strokes], 10, 40),
  // 3. the rest of the street, lighter as it goes away, every top catching the light
  ...seq([store, adobe, barber, hotel, stable].flatMap((b, i) => [st(b.near, 2 - i * 0.25, 30 + i * 4, 0.75), { ...st(b.top, 2, 31 + i * 4, 0.95), ...RIM }, { ...st(b.far, 1.8 - i * 0.2, 32 + i * 4, 0.9), ...RIM }]).concat([
    st([hotelBalc[1], hotelBalc[2]], 1.6, 60, 0.85), st([hotelBalc[0], hotelBalc[1]], 1.2, 61, 0.8), st([U(RX - 90, 2.2, 470), U(RX - 90, 3.3, 470)], 1, 62, 0.6),
  ]), 24, 50),
  // the windmill's tower, out on the flat
  ...seq([st([[MILL.foot[0] - 7, MILL.foot[1]], [MILL.hub[0] - 1, MILL.hub[1] + 4]], 1.1, 76, 0.9, 0.3), st([[MILL.foot[0] + 7, MILL.foot[1]], [MILL.hub[0] + 1, MILL.hub[1] + 4]], 1.1, 77, 0.9, 0.3),
    ...[0.3, 0.6].map((k, i) => st([[MILL.foot[0] - 7 * (1 - k), MILL.foot[1] - MILL.h * k], [MILL.foot[0] + 7 * (1 - k), MILL.foot[1] - MILL.h * k]], 0.6, 78 + i, 0.6, 0.2))], 34, 50),
  // 4. details: windows, doors (the sheriff's shut now), siding
  ...seq([
    ...windowStrokes(LX, 1.5, 1.72, 590, 785, 100), ...windowStrokes(LX, 1.95, 2.15, 590, 785, 110),
    ...windowStrokes(RX, 1.45, 1.68, 150, 380, 120), ...windowStrokes(RX, 2.3, 2.5, 640, 860, 130), ...windowStrokes(RX, 2.75, 2.95, 640, 860, 140),
    ...edges([U(LX, 1.62, 0), U(LX, 1.62, 330), U(LX, 1.84, 330), U(LX, 1.84, 0)], 1.8, 150, 0.9, false), st([U(LX, 1.73, 20), U(LX, 1.73, 320)], 1, 152, 0.6), // the saloon, shut for the night
    ...edges([U(RX, 1.78, 0), U(RX, 1.78, 350), U(RX, 1.96, 350), U(RX, 1.96, 0)], 1.8, 151, 0.9, false), // the sheriff's door, shut
    ...edges(wallQuad(RX, 1.8, 1.94, 200, 320), 0.8, 154, 0.55), ...edges(wallQuad(RX, 1.8, 1.94, 30, 170), 0.8, 158, 0.55),
    ...siding(LX, 1.35, 2.35, 500, 960, 9, 200), ...siding(RX, 1.3, 2.1, 470, 820, 7, 220), ...siding(LX, 1.35, 2.35, 40, 440, 6, 240), ...siding(LX, 0.66, 1.3, 60, 820, 10, 260), ...siding(RX, 0.66, 1.25, 60, 720, 9, 280),
  ], 40, 72),
  // the livery's barn door, the bank, the props, the ground
  ...seq([
    ...edges(wallQuad(LX, 0.8, 1.05, 0, 540), 2.8, 600, 0.9, false), st([U(LX, 0.8, 0), U(LX, 1.05, 540)], 1.6, 601, 0.6), st([U(LX, 0.8, 540), U(LX, 1.05, 0)], 1.6, 602, 0.6),
    ...windowStrokes(LX, 1.12, 1.24, 380, 580, 603), ...windowStrokes(RX, 0.84, 1.0, 180, 470, 610),
    ...edges([U(RX, 1.05, 0), U(RX, 1.05, 390), U(RX, 1.18, 390), U(RX, 1.18, 0)], 2.2, 616, 0.9, false),
    st([G(RAIL.u, RAIL.z0), U(RAIL.u, RAIL.z0, RAIL.h)], 3.2, 620, 0.95), st([G(RAIL.u, RAIL.z1), U(RAIL.u, RAIL.z1, RAIL.h)], 2.8, 621, 0.95), { ...st([U(RAIL.u, RAIL.z0 - 0.03, RAIL.h), U(RAIL.u, RAIL.z1 + 0.04, RAIL.h)], 3, 622, 0.95), ...RIM },
    ...edges(trough.end, 2.4, 623, 0.9), ...edges([trough.top[1], trough.top[2], trough.top[3], trough.top[0]], 1.6, 624, 0.85, false), st([trough.side[0], trough.side[3]], 2.4, 625, 0.9),
    st(barrel.body, 2.2, 626, 0.95), { ...st(barrel.top, 1.6, 627, 0.95, 0.3), ...RIM },
    st([[BARREL.c[0] - BARREL.r - 2, BARREL.c[1] - BARREL.h * 0.28], [BARREL.c[0], BARREL.c[1] - BARREL.h * 0.28 + 6], [BARREL.c[0] + BARREL.r + 2, BARREL.c[1] - BARREL.h * 0.28]], 1.4, 628, 0.7, 0.3),
    st([[BARREL.c[0] - BARREL.r - 2, BARREL.c[1] - BARREL.h * 0.72], [BARREL.c[0], BARREL.c[1] - BARREL.h * 0.72 + 6], [BARREL.c[0] + BARREL.r + 2, BARREL.c[1] - BARREL.h * 0.72]], 1.4, 629, 0.7, 0.3),
    ...tufts, ...marks,
  ], 58, 86),
  // porch shadows falling toward the reader, the second searching line under each base
  ...seq([st(livery.base, 4, 298, 0.8), st(bank.base, 4, 299, 0.8), st(saloon.base, 3.4, 300, 0.75), st(sheriff.base, 3.4, 301, 0.75), st(store.base, 2.2, 302, 0.6), st(hotel.base, 2.2, 303, 0.6)], 88, 100),
];

// ---------------------------------------------------------------- the washes
const sky = (y0: number, y1: number, seed: number): P[] => [[-40, y0], [400, y0 + 14], [900, y0 - 6], [1300, y0 + 10], [1640, y0], [1640, y1], [1200, y1 - 8], [800, y1 + 6], [400, y1 - 4], [-40, y1 + 6]].map(([x, y], i) => [x, y + ((seed * 7 + i * 13) % 9) - 4] as P);
const figShadow: P[] = [lean([-14, -2]), lean([15, 0]), G(620, 0.72), G(560, 0.7)];
const washes: Wash[] = [
  // the sky: night deepening upward, pale where the star is
  { pts: sky(-40, 330, 1), color: DEEP, alpha: 0.6, seed: 500, pool: 0.05, at: [46, 74], from: [800, -40], clip: SKY },
  // pale body colour laid round the star in three thin floods, each wet edge left as a tideline
  { pts: blob(STAR[0] - 10, STAR[1] + 70, 520, 280, 502, 0.34, 18, 0.05), color: PALE, alpha: 0.12, seed: 503, pool: 0.05, at: [48, 74], from: STAR, clip: SKY },
  { pts: blob(STAR[0] + 10, STAR[1] + 30, 330, 190, 504, 0.3, 16, -0.08), color: PALE, alpha: 0.14, seed: 505, pool: 0.05, at: [49, 74], from: STAR, clip: SKY },
  { pts: blob(STAR[0], STAR[1] + 8, 180, 120, 513, 0.28, 16, 0.1), color: GLOW, alpha: 0.18, seed: 514, pool: 0.05, at: [50, 74], from: STAR, clip: SKY },
  { pts: blob(860, 408, 330, 50, 506, 0.25, 14), color: PALE, alpha: 0.22, seed: 507, pool: 0.1, at: [52, 76], from: STAR, clip: SKY }, // the glow along the horizon
  { pts: blob(430, 118, 280, 16, 508, 0.35, 14, -0.04), color: MID, alpha: 0.35, seed: 509, pool: 0.6, at: [56, 80], from: STAR, clip: SKY }, // thin clouds, lit underneath
  { pts: blob(1270, 150, 300, 14, 510, 0.35, 14, 0.03), color: MID, alpha: 0.32, seed: 511, pool: 0.6, at: [56, 80], from: STAR, clip: SKY },
  { pts: [...MESA, [946, 474], [700, 474]], color: NIGHT, alpha: 0.72, seed: 512, pool: 0.3, at: [52, 72], from: STAR },
  // the ground: the street pale where the light runs down it, dark toward the reader
  { pts: [G(LX, 0.6), G(LX, 5), [700, 470], [1000, 470], G(RX, 4.5), G(RX, 0.6)], color: PALE, alpha: 0.3, seed: 520, pool: 0.05, at: [58, 86], from: VP, ph: 1 },
  { pts: [G(LX, 0.6), G(LX, 5), [700, 470], [1000, 470], G(RX, 4.5), G(RX, 0.6)], color: DEEP, alpha: 0.2, seed: 521, pool: 1.1, at: [62, 90], from: [800, 940], ph: 1 }, // the pool: darker toward the reader
  // facades in shade, far ones paler in the glow
  { pts: saloon.wall, color: DEEP, alpha: 0.55, seed: 530, pool: 0.7, at: [62, 88], ph: 2 },
  { pts: sheriff.wall, color: DEEP, alpha: 0.55, seed: 531, pool: 0.7, at: [62, 88], ph: 2 },
  { pts: store.wall, color: mix(DEEP, MID, 0.35), alpha: 0.5, seed: 532, at: [64, 88], ph: 2 },
  { pts: hotel.wall, color: mix(DEEP, MID, 0.35), alpha: 0.5, seed: 533, at: [64, 88], ph: 2 },
  { pts: adobe.wall, color: mix(DEEP, MID, 0.6), alpha: 0.45, seed: 534, at: [66, 90], ph: 2 },
  { pts: barber.wall, color: mix(DEEP, MID, 0.6), alpha: 0.45, seed: 535, at: [66, 90], ph: 2 },
  { pts: stable.wall, color: mix(DEEP, MID, 0.6), alpha: 0.45, seed: 536, at: [66, 90], ph: 2 },
  { pts: livery.wall, color: NIGHT, alpha: 0.7, seed: 538, pool: 0.8, at: [60, 86], from: [0, 900], ph: 2 },
  { pts: bank.wall, color: NIGHT, alpha: 0.7, seed: 539, pool: 0.8, at: [60, 86], from: [1600, 900], ph: 2 },
  { pts: salPorch.roof, color: NIGHT, alpha: 0.55, seed: 540, at: [70, 92], ph: 3 }, { pts: sherPorch.roof, color: NIGHT, alpha: 0.55, seed: 541, at: [70, 92], ph: 3 },
  { pts: hotelBalc, color: NIGHT, alpha: 0.45, seed: 542, at: [70, 92], ph: 3 },
  // under the porches, the boardwalk in shade
  { pts: [U(LX, 1.35, 470), U(LX + 100, 1.35, 470), G(LX + 100, 1.35), G(LX + 100, 2.35), U(LX, 2.35, 470)], color: DEEP, alpha: 0.3, seed: 543, pool: 0.8, at: [74, 94], ph: 3 },
  // windows dark, every door shut; only the sheriff's window has a lamp in it
  ...[wallQuad(LX, 1.5, 1.72, 590, 785), wallQuad(LX, 1.95, 2.15, 590, 785), wallQuad(RX, 2.3, 2.5, 640, 860), wallQuad(RX, 2.75, 2.95, 640, 860)].map((pts, i) => ({ pts, color: NIGHT, alpha: 0.7, seed: 550 + i, pool: 0.4, at: [78, 96] as [number, number], ph: 3 })),
  { pts: wallQuad(RX, 1.45, 1.68, 150, 380), color: GLOW, alpha: 0.4, seed: 556, pool: 0.15, at: [80, 96], ph: 3 },
  { pts: wallQuad(LX, 1.62, 1.84, 0, 330), color: NIGHT, alpha: 0.65, seed: 557, pool: 0.4, at: [80, 96], ph: 3 },
  { pts: wallQuad(RX, 1.78, 1.96, 0, 350), color: NIGHT, alpha: 0.55, seed: 558, pool: 0.4, at: [80, 96], ph: 3 },
  { pts: wallQuad(LX, 0.8, 1.05, 0, 540), color: NIGHT, alpha: 0.55, seed: 570, pool: 0.6, at: [80, 96], ph: 3 },
  { pts: wallQuad(LX, 1.12, 1.24, 380, 580), color: NIGHT, alpha: 0.6, seed: 571, at: [80, 96], ph: 3 },
  { pts: wallQuad(RX, 0.84, 1.0, 180, 470), color: NIGHT, alpha: 0.6, seed: 572, at: [80, 96], ph: 3 },
  { pts: wallQuad(RX, 1.05, 1.18, 0, 390), color: NIGHT, alpha: 0.5, seed: 573, at: [80, 96], ph: 3 },
  { pts: trough.end, color: DEEP, alpha: 0.65, seed: 574, at: [76, 94], ph: 3 }, { pts: trough.side, color: DEEP, alpha: 0.55, seed: 575, at: [76, 94], ph: 3 },
  { pts: trough.top, color: PALE, alpha: 0.45, seed: 576, at: [78, 94], ph: 3 }, // the water holds the star's light
  { pts: barrel.body, color: DEEP, alpha: 0.65, seed: 577, pool: 0.8, at: [76, 94], ph: 3 },
  // long faint shadows toward the reader: posts, rail, trough, barrel, him
  ...[...salPorch.shadows, ...sherPorch.shadows].map(({ q, seed }) => ({ pts: q, color: NIGHT, alpha: 0.55, seed, pool: 0.3, at: [84, 98] as [number, number], from: q[0], ph: 3 })),
  { pts: [G(TROUGH.u0, TROUGH.z0), G(TROUGH.u1, TROUGH.z0), G(TROUGH.u1 - 10, TROUGH.z0 - 0.45), G(TROUGH.u0 - 20, TROUGH.z0 - 0.45)], color: NIGHT, alpha: 0.3, seed: 578, at: [84, 98], from: G(-470, 1.34), ph: 3 },
  { pts: [G(RAIL.u - 10, RAIL.z0), G(RAIL.u + 10, RAIL.z0), G(RAIL.u, 0.7), G(RAIL.u - 26, 0.7)], color: NIGHT, alpha: 0.28, seed: 580, at: [84, 98], from: G(RAIL.u, RAIL.z0), ph: 3 },
  { pts: [[BARREL.c[0] - BARREL.r, BARREL.c[1]], [BARREL.c[0] + BARREL.r, BARREL.c[1]], G(600, 0.9), G(530, 0.9)], color: NIGHT, alpha: 0.3, seed: 579, at: [84, 98], from: BARREL.c, ph: 3 },
  { pts: figShadow, color: NIGHT, alpha: 0.6, seed: 581, pool: 0.3, at: [84, 98], from: FOOT, ph: 3 },
];

// ---------------------------------------------------------------- the night
// the other stars, only where there is sky, none crowding the new one
const stars = (() => {
  const r = rng(1200), out: { x: number; y: number; s: number; k: number; ph: number }[] = [];
  while (out.length < 46) {
    const x = r() * 1600, y = r() * r() * 420, s = r() < 0.18 ? 2.6 + r() * 1.4 : 1 + r() * 1.2, k = 1 + Math.floor(r() * 3), ph = r() * 6.28;
    if (inside(SKY, x, y) && Math.hypot(x - STAR[0], (y - STAR[1]) * 1.4) > 230) out.push({ x, y, s, k, ph });
  }
  return out;
})();
// the badge: five points with ball tips, each point cut in two facets like pressed brass
const badge = (cx: number, cy: number, R: number, rot: number) => {
  const r = R * 0.44, pt = (a: number, d: number): P => [cx + Math.sin(a) * d, cy - Math.cos(a) * d];
  const facets: { pts: P[]; lit: boolean }[] = [], balls: P[] = [];
  for (let i = 0; i < 5; i++) {
    const a = rot + (i * Math.PI * 2) / 5, tip = pt(a, R), l = pt(a - Math.PI / 5, r), rr = pt(a + Math.PI / 5, r);
    facets.push({ pts: [[cx, cy], l, tip], lit: true }, { pts: [[cx, cy], tip, rr], lit: false }); balls.push(pt(a, R * 1.08));
  }
  return { facets, balls };
};

// ---------------------------------------------------------------- the sign on the false front
type WallSign = { id: string; text: string; u: number; z0: number; z1: number; h0: number; h1: number; seed: number; cap: number };
const SALOON_SIGN: WallSign = { id: "saloon", text: "SALOON", u: LX, z0: 1.4, z1: 2.3, h0: 855, h1: 972, seed: 890, cap: 0.6 };
const SHERIFF_SIGN: WallSign = { id: "sheriff", text: "SHERIFF", u: RX, z0: 1.33, z1: 2.08, h0: 590, h1: 790, seed: 870, cap: 0.46 };
const FOCAL = 1000, STRIPS = 56;
const BRUSH: Medium = { nib: 1.35, taper: 0.25, pressure: 0.25, retrace: false, wobble: 0.4, rough: 0.2 };
const letterSpread = (text: string, cap: number, span: number) => Math.max(1, Math.min(6, (span - width(text, cap, 0)) / ((cap / 6) * (text.length - 1))));
// night boards: dark wood, white lettering, the way a cyanotype keeps what was painted
const flatSign = (env: Env, sg: WallSign, reveal: number): Layer => {
  const FW = (sg.z1 - sg.z0) * FOCAL, FH = sg.h1 - sg.h0, key = `p10:sign:${sg.id}:${env.scale}`, done = env.cache.get(key) as Layer | undefined;
  if (done) return done;
  const k = env.scale * 1.2, fenv: Env = { ...env, W: FW, H: FH, scale: k }, L = env.canvas(Math.ceil(FW * k), Math.ceil(FH * k)), g = new Gfx(L.ctx, fenv, 0, BRUSH), r = rng(sg.seed), m = 12;
  const pen = (pts: P[], w: number, seed: number, op = 0.9) => g.pen(pts, { w, color: INK, seed, wobble: 0.5, boil: 0, taper: 1, opacity: op, retrace: false, progress: reveal });
  const box = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  g.group("plain", () => {
    fillShape(g, box(0, 0, FW, FH), NIGHT, 0.97 * reveal); fillShape(g, box(m, m, FW - m, FH - m), mix(DEEP, MID, 0.25), 0.97 * reveal);
    pen([[m, FH / 2], [FW - m, FH / 2]], 1.4, sg.seed + 1, 0.25);
    for (let i = 0; i < 12; i++) { const y = m + 6 + r() * (FH - 2 * m - 12), x = m + r() * FW * 0.7, l = 60 + r() * 160; pen([[x, y], [x + l / 2, y + (r() - 0.5) * 3], [Math.min(FW - m, x + l), y]], 1, sg.seed + 2 + i, 0.14); }
    [box(0, 0, FW, FH), box(m, m, FW - m, FH - m)].forEach((q, j) => q.forEach((a, i) => pen([a, q[(i + 1) % 4]], j ? 1.6 : 3.4, sg.seed + 20 + j * 4 + i, j ? 0.6 : 0.95)));
    [[6, 6], [FW - 6, 6], [FW - 6, FH - 6], [6, FH - 6]].forEach(([x, y], i) => fillShape(g, blob(x, y, 3.4, 3.4, sg.seed + 30 + i, 0.1, 6), INK, 0.9 * reveal));
    const cap = FH * sg.cap; letter(g, sg.text, FW / 2, (FH - cap) / 2, { cap, color: GLOW, seed: sg.seed + 40, align: "center", progress: reveal, w: cap * 0.16, track: letterSpread(sg.text, cap, FW * 0.84) });
  });
  if (reveal >= 1) env.cache.set(key, L);
  return L;
};
const facadeSign = (g: Gfx, env: Env, sg: WallSign, reveal: number) => {
  if (reveal <= 0) return;
  const L = flatSign(env, sg, reveal), c = g.cur, right = sg.u > 0, sw = L.canvas.width / STRIPS;
  const zAt = (s: number) => (right ? sg.z1 - s * (sg.z1 - sg.z0) : sg.z0 + s * (sg.z1 - sg.z0));
  const xs = Array.from({ length: STRIPS + 1 }, (_, i) => U(sg.u, zAt(i / STRIPS), 0)[0]);
  for (let i = 0; i < STRIPS; i++) {
    const zm = zAt((i + 0.5) / STRIPS), top = U(sg.u, zm, sg.h1)[1], bot = U(sg.u, zm, sg.h0)[1];
    c.drawImage(L.canvas, i * sw, 0, sw + 0.5, L.canvas.height, xs[i], top, xs[i + 1] - xs[i] + 0.4, bot - top);
  }
  const a = U(sg.u, sg.z0, sg.h1), b = U(sg.u, sg.z1, sg.h0); g.touch(Math.min(a[0], b[0]) - 2, Math.min(a[1], b[1]) - 2, Math.max(a[0], b[0]) + 2, Math.max(U(sg.u, sg.z0, sg.h0)[1], b[1]) + 2);
};

const LAMP = U(RX, 1.6, 250);

export const p10 = page({
  id: "p10", title: "Sherif des deux mondes", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 14, seed: 990, at: 98, box: [60, 700, 1540, 880] },
  animAt: [50, 90],
  anim: (g, t, reveal, env) => {
    const T = (t / LOOP) * Math.PI * 2;
    const pen = (pts: P[], w: number, seed: number, op = 0.9, color = INK, boil = 0.3) => g.pen(pts, { w, color, seed, wobble: 0.6, boil, taper: 1, opacity: op, retrace: false, progress: reveal });
    // the lamp in the sheriff's window, breathing behind him (he is drawn over it, a cut-out)
    g.group("plain", () => g.glow(LAMP[0], LAMP[1], 70, GLOW, reveal * (0.2 + 0.05 * Math.sin(T * 2) + 0.03 * Math.sin(T * 5 + 1))), { blend: "screen" });
    // the other stars: each twinkles a whole number of times per loop
    g.group("plain", () => stars.forEach((s, i) => {
      const a = reveal * (0.55 + 0.45 * Math.sin(T * s.k + s.ph));
      fillShape(g, blob(s.x, s.y, s.s, s.s, 1300 + i, 0.1, 6), GLOW, a);
      if (s.s > 2.5) { const l = s.s * (2.6 + 1.4 * Math.sin(T * s.k + s.ph)); pen([[s.x - l, s.y], [s.x + l, s.y]], 0.6, 1400 + i, a * 0.8, GLOW, 0); pen([[s.x, s.y - l], [s.x, s.y + l]], 0.6, 1450 + i, a * 0.8, GLOW, 0); }
    }));
    // the windmill, turning as it did on page 1
    g.group("plain", () => {
      const [hx, hy] = MILL.hub, R = MILL.r;
      fillShape(g, oval(hx, hy, R, R, 24), NIGHT, 0.45 * reveal);
      pen(oval(hx, hy, R, R, 24), 1.2, 800, 0.9); pen(oval(hx, hy, R * 0.42, R * 0.42, 14), 0.8, 801, 0.75);
      for (let i = 0; i < 18; i++) { const b = T + (i * Math.PI * 2) / 18, ca = Math.cos(b), sa = Math.sin(b); pen([[hx + ca * R * 0.42, hy + sa * R * 0.42], [hx + ca * R - sa * 4, hy + sa * R + ca * 4]], 1, 802 + i, 0.8); }
      pen([[hx + 4, hy], [hx + 58, hy - 2]], 1.4, 830, 0.9); pen([[hx + 46, hy - 14], [hx + 74, hy - 20], [hx + 76, hy + 12], [hx + 48, hy + 8], [hx + 46, hy - 14]], 1.1, 831, 0.85);
      fillShape(g, blob(hx, hy, 4, 4, 832, 0.1, 8), INK, 0.9 * reveal);
    });
    g.group("plain", () => { facadeSign(g, env, SALOON_SIGN, reveal); facadeSign(g, env, SHERIFF_SIGN, reveal); });
    // THE STAR. Its halo breathes; sixteen rays, long and short, turn an eighth of a turn a loop
    // (ray i + 2 is ray i: same length, phase and seed, so the seam is invisible) and pass behind the rooflines.
    const [sx, sy] = STAR, breath = 1 + 0.1 * Math.sin(T * 2), rock = 0.07 * Math.sin(T);
    g.group("plain", () => { g.glow(sx, sy, 240 * breath, PALE, 0.42 * reveal); g.glow(sx, sy, 100 * breath, GLOW, 0.55 * reveal); g.glow(sx, sy, 50, "#ffffff", 0.5 * reveal); }, { blend: "screen" });
    g.group("plain", () => {
      const c = g.cur; c.save(); c.beginPath(); SKY.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.clip();
      for (let i = 0; i < 16; i++) {
        const a = T / 8 + (i * Math.PI * 2) / 16, long = i % 2 === 0, L = (long ? 230 : 120) * breath * (1 + 0.12 * Math.sin(T * 3 + i * Math.PI)) * reveal, r0 = 62;
        pen([[sx + Math.cos(a) * r0, sy + Math.sin(a) * r0], [sx + Math.cos(a) * (r0 + L * 0.5), sy + Math.sin(a) * (r0 + L * 0.5)], [sx + Math.cos(a) * (r0 + L), sy + Math.sin(a) * (r0 + L)]], long ? 2.4 : 1.4, 1500 + (i % 2), long ? 0.55 : 0.4, GLOW, 0);
      }
      c.restore();
    });
    g.group("plain", () => {
      const { facets, balls } = badge(sx, sy, 54, rock);
      facets.forEach((f) => fillShape(g, f.pts, f.lit ? "#ffffff" : "#8fbde8", reveal));
      facets.forEach((f, i) => pen([f.pts[1], f.pts[2]], 1, 1600 + i, 0.8 * reveal, MID, 0)); // the pressed ridge and the outline
      balls.forEach(([x, y], i) => { fillShape(g, oval(x, y, 8.5, 8.5, 12), "#ffffff", reveal); pen(oval(x, y, 8.5, 8.5, 12), 0.8, 1620 + i, 0.6 * reveal, MID, 0); });
      fillShape(g, oval(sx, sy, 9, 9, 12), "#8fbde8", reveal); fillShape(g, oval(sx - 2, sy - 2, 4, 4, 8), "#ffffff", reveal);
    });
    // him: crisp, a cut-out against the lamp, his lit edges drawn heavy. He comes last in the draw.
    const fr = Math.max(0, reveal * 2 - 1);
    if (fr > 0) g.group("plain", () => {
      const c = g.cur; g.mark(FIG, 2); c.globalAlpha = fr; c.fillStyle = NIGHT; c.beginPath();
      [FIG, ARM_GAP].forEach((q) => q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)))); c.fill("evenodd"); c.globalAlpha = 1;
      fillShape(g, BRIM, NIGHT, fr); fillShape(g, CROWN, NIGHT, fr);
      const line = (pts: P[], w: number, seed: number, op: number) => g.pen(pts, { w, color: INK, seed, wobble: 0.6, boil: 0, taper: 1, opacity: op, retrace: false, progress: fr });
      line(ARM_GAP.concat([ARM_GAP[0]]), 0.8, 1020, 0.5);
      FIG_LINES.forEach(([pts, w, op], i) => line(pts, w, 1000 + i, op)); });
    // his badge glints back, answering the star's breath
    const gl = fr * Math.max(0, Math.sin(T * 2)) ** 2, [bx, by] = BADGE;
    g.group("plain", () => { g.glow(bx, by, 7, GLOW, 0.3 * fr + 0.6 * gl); const l = 3 + 9 * gl; pen([[bx - l, by], [bx + l, by]], 0.7, 1030, 0.9 * gl, GLOW, 0); pen([[bx, by - l], [bx, by + l]], 0.7, 1031, 0.9 * gl, GLOW, 0); }, { blend: "screen" });
  },
});
