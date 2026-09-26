// PAGE 1 · DUST CREEK AT DUSK. One idea: a town that is waiting for you, and nobody in it.
// Focal subject: the empty main street running to the sun, the sheriff's sign swinging over a
// dark office. One light: a low sun just right of the vanishing point, so the town is
// contre-jour: facades in cool shade, tops rimmed, long shadows running toward the reader.
// The only warm light in town is the saloon door.
// What moves: a tumbleweed crossing the foreground, the sheriff's sign on its chains, the
// windmill, dust on the wind, the saloon lamp breathing.
import { Gfx, oval, rng, type Env, type Layer, type Medium, type P } from "./core";
import { letter, width } from "./drafting";
import { blob, fillShape, mix } from "./gallery";
import { G, INK_M, U, VP, page, seq, st, wallQuad, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const INK = "#2b1a10", PAPER = "#f3e7cf";
const DUSK = "#8d84a8", ROSE = "#dc9a78", GLOW = "#f1c77a", OCHRE = "#c99a58", UMBER = "#7d5234", SHADE = "#6f5a7a", SIENNA = "#a4633c", DARK = "#3a2418", LAMP = "#f2b54a", FAR = "#9d8591";
// shop signs: weathered pine, a darker moulding, lettering in oxblood. Kept pale enough to read against the dusk.
const WOOD = "#e3c38c", WOOD_DARK = "#9a6538", PAINT = "#6a1c12";

const LX = -620, RX = 620; // the street's two frontages
const SUN: P = [968, 438];

// ---------------------------------------------------------------- the town, as geometry
// a false-front building on a frontage: its wall, its roofline, its corners
const front = (u: number, z0: number, z1: number, h: number, step = 0) => {
  const top = step ? [U(u, z0, h - step), U(u, z0 + (z1 - z0) * 0.12, h - step), U(u, z0 + (z1 - z0) * 0.12, h), U(u, z1 - (z1 - z0) * 0.12, h), U(u, z1 - (z1 - z0) * 0.12, h - step), U(u, z1, h - step)] : [U(u, z0, h), U(u, z1, h)];
  return { wall: [G(u, z0), ...top, G(u, z1)], top, near: [G(u, z0), top[0]] as P[], far: [top[top.length - 1], G(u, z1)] as P[], base: [G(u, z0), G(u, z1)] as P[] };
};
// clapboard: courses along the wall, converging on the vanishing point
const siding = (u: number, z0: number, z1: number, h0: number, h1: number, n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => { const h = h0 + ((h1 - h0) * (i + 0.5)) / n, r = rng(seed + i); const a = z0 + (z1 - z0) * r() * 0.15, b = z1 - (z1 - z0) * r() * 0.2; return st([U(u, a, h), U(u, b, h)], 0.7, seed + i, 0.35, 0.4); });
const windowStrokes = (u: number, z0: number, z1: number, h0: number, h1: number, seed: number) => {
  const q = wallQuad(u, z0, z1, h0, h1);
  return [st([q[0], q[1]], 1.2, seed, 0.85), st([q[1], q[2]], 1, seed + 1, 0.7), st([q[3], q[2]], 1.1, seed + 2, 0.8), st([q[0], q[3]], 2.2, seed + 3, 0.95), st([U(u, (z0 + z1) / 2, h0), U(u, (z0 + z1) / 2, h1)], 0.8, seed + 4, 0.7)];
};
// a shape drawn edge by edge, so its corners stay corners (the pen smooths through a vertex)
const edges = (pts: P[], w: number, seed: number, op = 0.9, closed = true) => pts.slice(0, closed ? pts.length : -1).map((a, i) => st([a, pts[(i + 1) % pts.length]], w * (i % 2 ? 0.8 : 1), seed + i, op, 0.4));
// a porch: roof plane out over the boardwalk, posts, and the boardwalk edge
const porch = (u: number, out: number, z0: number, z1: number, h: number, posts: number[], seed: number) => {
  const roof = [U(u, z0, h + 30), U(out, z0, h), U(out, z1, h), U(u, z1, h + 30)];
  return {
    roof,
    strokes: [st([roof[1], roof[2]], 2.4, seed, 0.95), st([roof[0], roof[1]], 1.6, seed + 1, 0.85), st([G(out, z0), G(out, z1)], 2.2, seed + 2, 0.9),
      ...posts.map((z, i) => st([G(out, z), U(out, z, h)], 2.6 / z, seed + 3 + i, 0.95, 0.5))],
    shadows: posts.map((z, i) => { const a = G(out, z), b = G(out - 210, z * 0.62); return st([a, [(a[0] + b[0]) / 2 + 4, (a[1] + b[1]) / 2], b], 3.2 / z, seed + 20 + i, 0.3, 0.6); }),
  };
};

const saloon = front(LX, 1.35, 2.35, 980), store = front(LX, 2.45, 3.3, 780, 90), adobe = front(LX, 3.4, 4.3, 430), barber = front(LX, 4.35, 5, 560);
const sheriff = front(RX, 1.3, 2.1, 840), hotel = front(RX, 2.2, 3.3, 1020), stable = front(RX, 3.4, 4.5, 620, 70);
const salPorch = porch(LX, LX + 100, 1.35, 2.35, 470, [1.42, 1.78, 2.15], 400), sherPorch = porch(RX, RX - 100, 1.3, 2.1, 450, [1.36, 1.7, 2.02], 420);
const hotelBalc = [U(RX, 2.2, 540), U(RX - 90, 2.2, 520), U(RX - 90, 3.3, 520), U(RX, 3.3, 540)];

// the near fronts run off the frame on both sides: dark, they hold the eye in the street
const livery = front(LX, 0.66, 1.3, 860), bank = front(RX, 0.66, 1.25, 760);
// the foreground: a hitching rail and a trough by the saloon, a barrel on the sheriff's porch
const RAIL = { u: -455, z0: 1.02, z1: 1.28, h: 120 };
const TROUGH = { u0: -500, u1: -440, z0: 1.34, z1: 1.62, h: 70 };
const BARREL = { c: G(575, 1.16), r: 30, h: 88 };
const trough = { top: [U(TROUGH.u0, TROUGH.z0, TROUGH.h), U(TROUGH.u1, TROUGH.z0, TROUGH.h), U(TROUGH.u1, TROUGH.z1, TROUGH.h), U(TROUGH.u0, TROUGH.z1, TROUGH.h)], side: wallQuad(TROUGH.u1, TROUGH.z0, TROUGH.z1, 0, TROUGH.h), end: [G(TROUGH.u0, TROUGH.z0), G(TROUGH.u1, TROUGH.z0), U(TROUGH.u1, TROUGH.z0, TROUGH.h), U(TROUGH.u0, TROUGH.z0, TROUGH.h)] };
const barrel = (() => { const [x, y] = BARREL.c, { r, h } = BARREL; return { body: [[x - r, y - h], [x - r - 3, y - h / 2], [x - r, y], [x, y + 6], [x + r, y], [x + r + 3, y - h / 2], [x + r, y - h]] as P[], top: oval(x, y - h, r, 7, 14) }; })();
// ground: pebbles and hoof marks, sparse far, denser and bigger near
const marks = (() => { const r = rng(700); return Array.from({ length: 70 }, (_, i) => { const z = 0.95 + r() * r() * 4, u = -500 + r() * 1000, [x, y] = G(u, z), l = (8 + r() * 12) / z; return st([[x, y], [x + l * 0.5, y - 0.8 / z], [x + l, y + 0.6 / z]], Math.max(0.6, 1.4 / z), 710 + i, 0.4 + 0.2 / z, 0.4); }); })();
const tufts = [[-600, 1.1], [-590, 1.9], [600, 1.5], [595, 2.4], [-600, 2.9], [610, 0.9]].map(([u, z], i) => { const [x, y] = G(u, z), k = 18 / z; return st([[x - k * 0.6, y - k * 0.9], [x - k * 0.2, y], [x, y - k * 1.2], [x + k * 0.2, y], [x + k * 0.7, y - k * 0.8]], 1.1 / z, 760 + i, 0.75, 0.5); });

// the windmill stands out on the flat at the very end of the street, against the mesa
const MILL = { foot: G(-120, 7), h: 150, r: 38, hub: [0, 0] as P };
MILL.hub = [MILL.foot[0], MILL.foot[1] - MILL.h];

// only what shows through the gap at the end of the street is drawn: the rest is behind the town
const MESA: P[] = [[700, 468], [712, 440], [728, 412], [760, 402], [880, 398], [912, 410], [930, 440], [946, 468]];
const FLAT: P[] = [[946, 468], [1000, 466]];
// the sky, cut in around every roofline and down to the mesa in the gap
const SKY: P[] = [[-120, -240], ...livery.top, ...saloon.top, ...store.top, ...adobe.top, ...barber.top, ...MESA.slice(3), ...FLAT.slice(1),
  ...[bank, sheriff, hotel, stable].reverse().flatMap((b) => [...b.top].reverse()), [1720, -240]];

// ---------------------------------------------------------------- the pen, in the order a hand draws it
const strokes: Stroke[] = [
  // 1. horizon, land forms, the street running to the sun
  ...seq([st(MESA, 2, 2, 0.95), st(FLAT, 1, 5, 0.6)], 0, 14),
  ...seq([st([G(LX + 100, 1.0), G(LX + 100, 5)], 2.6, 10, 0.8, 0.6), st([G(RX - 100, 1.0), G(RX - 100, 4.5)], 2.6, 11, 0.8, 0.6),
    st([G(-190, 0.95), G(-190, 5), G(-150, 14)], 1.6, 12, 0.55, 1.4), st([G(-120, 0.95), G(-120, 6), G(-100, 14)], 1.2, 13, 0.45, 1.4),
    st([G(110, 0.95), G(110, 5.5), G(90, 14)], 1.4, 14, 0.5, 1.4), st([G(180, 0.95), G(180, 5), G(140, 14)], 1.6, 15, 0.55, 1.4)], 3, 22),
  // 2. the near buildings, big shapes first: saloon on the left, sheriff on the right
  ...seq([st(livery.top, 2, 16, 0.8), st(livery.far, 3.4, 17), st(bank.top, 2, 18, 0.8), st(bank.far, 3.4, 19), st(saloon.near, 3.4, 20), st(saloon.top, 1.6, 21, 0.75), st(saloon.far, 2.6, 22), st(sheriff.near, 3.4, 23), st(sheriff.top, 1.6, 24, 0.75), st(sheriff.far, 2.6, 25),
    ...salPorch.strokes, ...sherPorch.strokes], 10, 40),
  // 3. the rest of the street, lighter as it goes away
  ...seq([store, adobe, barber, hotel, stable].flatMap((b, i) => [st(b.near, 2.2 - i * 0.25, 30 + i * 4, 0.9), st(b.top, 1.2, 31 + i * 4, 0.7), st(b.far, 1.6 - i * 0.2, 32 + i * 4, 0.8)]).concat([
    st([hotelBalc[1], hotelBalc[2]], 1.6, 60, 0.85), st([hotelBalc[0], hotelBalc[1]], 1.2, 61, 0.8), st([U(RX - 90, 2.2, 470), U(RX - 90, 3.3, 470)], 1, 62, 0.6),
  ]), 24, 50),
  // the windmill's tower, out on the flat
  ...seq([st([[MILL.foot[0] - 7, MILL.foot[1]], [MILL.hub[0] - 1, MILL.hub[1] + 4]], 1, 76, 0.85, 0.3), st([[MILL.foot[0] + 7, MILL.foot[1]], [MILL.hub[0] + 1, MILL.hub[1] + 4]], 1, 77, 0.85, 0.3),
    ...[0.3, 0.6].map((k, i) => st([[MILL.foot[0] - 7 * (1 - k), MILL.foot[1] - MILL.h * k], [MILL.foot[0] + 7 * (1 - k), MILL.foot[1] - MILL.h * k]], 0.6, 78 + i, 0.6, 0.2))], 34, 50),
  // 4. details: windows, doors, the siding on the two near fronts, the wanted poster
  ...seq([
    ...windowStrokes(LX, 1.5, 1.72, 590, 785, 100), ...windowStrokes(LX, 1.95, 2.15, 590, 785, 110),
    ...windowStrokes(RX, 1.45, 1.68, 150, 380, 120), ...windowStrokes(RX, 2.3, 2.5, 640, 860, 130), ...windowStrokes(RX, 2.75, 2.95, 640, 860, 140),
    ...edges([U(LX, 1.62, 0), U(LX, 1.62, 330), U(LX, 1.84, 330), U(LX, 1.84, 0)], 1.8, 150, 0.9, false), // the saloon's doorway
    ...edges([U(RX, 1.78, 0), U(RX, 1.78, 350), U(RX, 1.96, 350), U(RX, 1.96, 0)], 1.8, 151, 0.9, false), // the sheriff's door, ajar
    ...edges(wallQuad(RX, 1.71, 1.76, 190, 290), 0.9, 153, 0.8),
    ...siding(LX, 1.35, 2.35, 500, 960, 9, 200), ...siding(RX, 1.3, 2.1, 470, 820, 7, 220), ...siding(LX, 1.35, 2.35, 40, 440, 6, 240), ...siding(LX, 0.66, 1.3, 60, 820, 10, 260), ...siding(RX, 0.66, 1.25, 60, 720, 9, 280),
  ], 40, 74),
  // the livery's barn door, the bank's window and door, the props, the ground
  ...seq([
    ...edges(wallQuad(LX, 0.8, 1.05, 0, 540), 2.8, 600, 0.9, false), st([U(LX, 0.8, 0), U(LX, 1.05, 540)], 1.6, 601, 0.7), st([U(LX, 0.8, 540), U(LX, 1.05, 0)], 1.6, 602, 0.7),
    ...windowStrokes(LX, 1.12, 1.24, 380, 580, 603), ...windowStrokes(RX, 0.84, 1.0, 180, 470, 610),
    ...edges([U(RX, 1.05, 0), U(RX, 1.05, 390), U(RX, 1.18, 390), U(RX, 1.18, 0)], 2.2, 616, 0.9, false),
    st([G(RAIL.u, RAIL.z0), U(RAIL.u, RAIL.z0, RAIL.h)], 3.2, 620, 0.95), st([G(RAIL.u, RAIL.z1), U(RAIL.u, RAIL.z1, RAIL.h)], 2.8, 621, 0.95), st([U(RAIL.u, RAIL.z0 - 0.03, RAIL.h), U(RAIL.u, RAIL.z1 + 0.04, RAIL.h)], 3, 622, 0.95),
    ...edges(trough.end, 2.4, 623, 0.9), ...edges([trough.top[1], trough.top[2], trough.top[3], trough.top[0]], 1.6, 624, 0.85, false), st([trough.side[0], trough.side[3]], 2.4, 625, 0.9),
    st(barrel.body, 2.2, 626, 0.95), st(barrel.top, 1.4, 627, 0.85, 0.3),
    st([[BARREL.c[0] - BARREL.r - 2, BARREL.c[1] - BARREL.h * 0.28], [BARREL.c[0], BARREL.c[1] - BARREL.h * 0.28 + 6], [BARREL.c[0] + BARREL.r + 2, BARREL.c[1] - BARREL.h * 0.28]], 1.4, 628, 0.8, 0.3),
    st([[BARREL.c[0] - BARREL.r - 2, BARREL.c[1] - BARREL.h * 0.72], [BARREL.c[0], BARREL.c[1] - BARREL.h * 0.72 + 6], [BARREL.c[0] + BARREL.r + 2, BARREL.c[1] - BARREL.h * 0.72]], 1.4, 629, 0.8, 0.3),
    ...tufts, ...marks,
  ], 60, 88),
  // porch shadows falling toward the reader, the second searching line under each base
  ...seq([...salPorch.shadows, ...sherPorch.shadows, st(livery.base, 4, 298, 0.9), st(bank.base, 4, 299, 0.9), st(saloon.base, 3.6, 300, 0.85), st(sheriff.base, 3.6, 301, 0.85), st(store.base, 2.4, 302, 0.7), st(hotel.base, 2.4, 303, 0.7)], 86, 100),
];

// ---------------------------------------------------------------- the washes, flooding in
const sky = (y0: number, y1: number, seed: number): P[] => [[-40, y0], [400, y0 + 14], [900, y0 - 6], [1300, y0 + 10], [1640, y0], [1640, y1], [1200, y1 - 8], [800, y1 + 6], [400, y1 - 4], [-40, y1 + 6]].map(([x, y], i) => [x, y + ((seed * 7 + i * 13) % 9) - 4] as P);
const washes: Wash[] = [
  { pts: sky(-40, 300, 1), color: DUSK, alpha: 0.42, seed: 500, pool: 0.3, at: [48, 76], from: SUN, clip: SKY },
  { pts: sky(160, 440, 2), color: ROSE, alpha: 0.4, seed: 501, pool: 0.2, at: [50, 78], from: SUN, clip: SKY },
  { pts: blob(SUN[0], SUN[1] - 10, 420, 110, 502, 0.25, 18), color: GLOW, alpha: 0.5, seed: 503, pool: 0.1, at: [46, 70], from: SUN, clip: SKY },
  { pts: blob(360, 150, 260, 24, 504, 0.35, 14, -0.04), color: SHADE, alpha: 0.3, seed: 505, pool: 0.6, at: [56, 80], from: SUN, clip: SKY }, // clouds lit from below
  { pts: blob(1250, 210, 300, 20, 506, 0.35, 14, 0.03), color: SHADE, alpha: 0.28, seed: 507, pool: 0.6, at: [56, 80], from: SUN, clip: SKY },
  { pts: [...MESA, [946, 474], [700, 474]], color: "#7b5a6a", alpha: 0.62, seed: 510, pool: 0.4, at: [52, 72], from: SUN },
  // the ground: warm street, the flats beyond the town
  { pts: [G(LX, 0.6), G(LX, 5), [700, 470], [1000, 470], G(RX, 4.5), G(RX, 0.6)], color: OCHRE, alpha: 0.42, seed: 520, pool: 0.5, at: [58, 88], from: VP, ph: 1 },
  { pts: [G(RX, 0.66), G(RX, 4.5), G(RX - 120, 4.5), G(RX - 260, 2.4), G(RX - 200, 1.6), G(RX - 330, 0.66)], color: SHADE, alpha: 0.32, seed: 521, pool: 0.3, at: [72, 94], from: G(RX, 2), ph: 3 }, // the right side's shadow across the street
  // facades in shade, far ones lost in the dusk
  { pts: saloon.wall, color: UMBER, alpha: 0.5, seed: 530, pool: 0.7, at: [62, 88] , ph: 2 },
  { pts: sheriff.wall, color: SIENNA, alpha: 0.5, seed: 531, pool: 0.7, at: [62, 88] , ph: 2 },
  { pts: store.wall, color: mix(UMBER, FAR, 0.3), alpha: 0.45, seed: 532, at: [64, 88] , ph: 2 },
  { pts: hotel.wall, color: mix(SIENNA, FAR, 0.3), alpha: 0.45, seed: 533, at: [64, 88] , ph: 2 },
  { pts: adobe.wall, color: mix(SIENNA, FAR, 0.55), alpha: 0.42, seed: 534, at: [66, 90] , ph: 2 },
  { pts: barber.wall, color: mix(UMBER, FAR, 0.6), alpha: 0.4, seed: 535, at: [66, 90] , ph: 2 },
  { pts: stable.wall, color: mix(UMBER, FAR, 0.55), alpha: 0.42, seed: 536, at: [66, 90] , ph: 2 },
  { pts: livery.wall, color: DARK, alpha: 0.5, seed: 538, pool: 0.8, at: [60, 86], from: [0, 900] , ph: 2 },
  { pts: bank.wall, color: mix(DARK, SIENNA, 0.3), alpha: 0.5, seed: 539, pool: 0.8, at: [60, 86], from: [1600, 900] , ph: 2 },
  { pts: salPorch.roof, color: DARK, alpha: 0.45, seed: 540, at: [70, 92], ph: 3 }, { pts: sherPorch.roof, color: DARK, alpha: 0.45, seed: 541, at: [70, 92], ph: 3 },
  { pts: hotelBalc, color: DARK, alpha: 0.4, seed: 542, at: [70, 92], ph: 3 },
  // under the porches, the boardwalk in deep shade
  { pts: [U(LX, 1.35, 470), U(LX + 100, 1.35, 470), G(LX + 100, 1.35), G(LX + 100, 2.35), U(LX, 2.35, 470)], color: DARK, alpha: 0.28, seed: 543, pool: 0.8, at: [74, 94], ph: 3 },
  { pts: [U(RX, 1.3, 450), U(RX - 100, 1.3, 450), G(RX - 100, 1.3), G(RX - 100, 2.1), U(RX, 2.1, 450)], color: DARK, alpha: 0.3, seed: 544, pool: 0.8, at: [74, 94], ph: 3 },
  // windows dark, the sheriff's door a black gap, the saloon's the one warm light
  ...[wallQuad(LX, 1.5, 1.72, 590, 785), wallQuad(LX, 1.95, 2.15, 590, 785), wallQuad(RX, 1.45, 1.68, 150, 380), wallQuad(RX, 2.3, 2.5, 640, 860), wallQuad(RX, 2.75, 2.95, 640, 860)].map((pts, i) => ({ pts, color: DARK, alpha: 0.62, seed: 550 + i, pool: 0.4, at: [78, 96] as [number, number], ph: 3 })),
  { pts: wallQuad(LX, 0.8, 1.05, 0, 540), color: DARK, alpha: 0.55, seed: 570, pool: 0.6, at: [80, 96], ph: 3 },
  { pts: wallQuad(LX, 1.12, 1.24, 380, 580), color: DARK, alpha: 0.6, seed: 571, at: [80, 96], ph: 3 },
  { pts: wallQuad(RX, 0.84, 1.0, 180, 470), color: DARK, alpha: 0.6, seed: 572, at: [80, 96], ph: 3 },
  { pts: wallQuad(RX, 1.05, 1.18, 0, 390), color: DARK, alpha: 0.5, seed: 573, at: [80, 96], ph: 3 },
  { pts: trough.end, color: UMBER, alpha: 0.6, seed: 574, at: [76, 94], ph: 3 }, { pts: trough.side, color: UMBER, alpha: 0.5, seed: 575, at: [76, 94], ph: 3 },
  { pts: trough.top, color: "#b9b2c8", alpha: 0.5, seed: 576, at: [78, 94], ph: 3 }, // the water holds the sky
  { pts: barrel.body, color: SIENNA, alpha: 0.6, seed: 577, pool: 0.8, at: [76, 94], ph: 3 },
  { pts: [G(TROUGH.u0, TROUGH.z0), G(TROUGH.u1, TROUGH.z0), G(TROUGH.u1 - 150, TROUGH.z0 * 0.7), G(TROUGH.u0 - 150, TROUGH.z0 * 0.72)], color: SHADE, alpha: 0.3, seed: 578, at: [84, 96], ph: 3 },
  { pts: [[BARREL.c[0] - BARREL.r, BARREL.c[1]], [BARREL.c[0] + BARREL.r, BARREL.c[1]], G(575 - 150, 0.9), G(575 - 200, 0.92)], color: SHADE, alpha: 0.3, seed: 579, at: [84, 96], ph: 3 },
  { pts: wallQuad(LX, 1.62, 1.84, 0, 330), color: LAMP, alpha: 0.75, seed: 557, pool: 0.2, at: [80, 96], ph: 3 },
  { pts: wallQuad(RX, 1.71, 1.76, 190, 290), color: "#e8d4a8", alpha: 0.7, seed: 558, at: [82, 96], ph: 3 },
];

// ---------------------------------------------------------------- what moves
const TW = { r: 80 }; // the tumbleweed, in picture pixels at depth 1
const tumbleweed = (() => { const r = rng(900); return Array.from({ length: 11 }, (_, i) => { const a0 = r() * 6.28, rr = TW.r * (0.55 + r() * 0.45); return Array.from({ length: 7 }, (_, k) => { const a = a0 + k * 0.9 + r() * 0.3, q = rr * (0.4 + r() * 0.6); return [Math.cos(a) * q, Math.sin(a) * q] as P; }); }); })();
const dust = (() => { const r = rng(950); return Array.from({ length: 16 }, () => ({ x: r() * 1800, y: 600 + r() * 300, l: 14 + r() * 40, k: 1 + Math.floor(r() * 2) })); })();

// ---------------------------------------------------------------- signs on the false fronts
// A sign is drawn flat (board, grain, nails, lettering), then laid onto its wall in vertical
// strips: every vertical of a street-facing wall stays vertical in this perspective, so a strip
// only needs its own x, top and bottom. Depth runs at a notional focal length of 1000 px.
type WallSign = { id: string; text: string; u: number; z0: number; z1: number; h0: number; h1: number; seed: number; cap: number }; // cap: letter height over board height
const SALOON_SIGN: WallSign = { id: "saloon", text: "SALOON", u: LX, z0: 1.4, z1: 2.3, h0: 855, h1: 972, seed: 890, cap: 0.6 };
const SHERIFF_SIGN: WallSign = { id: "sheriff", text: "SHERIFF", u: RX, z0: 1.33, z1: 2.08, h0: 590, h1: 790, seed: 870, cap: 0.46 };
const FOCAL = 1000, STRIPS = 56;
// a sign-writer's brush: even weight, square ends, none of the pen's blots
const BRUSH: Medium = { nib: 1.35, taper: 0.25, pressure: 0.25, retrace: false, wobble: 0.4, rough: 0.2 };
// the track that stretches a word across `span`: the wall squeezes letters, so they get air
const letterSpread = (text: string, cap: number, span: number) => Math.max(1, Math.min(6, (span - width(text, cap, 0)) / ((cap / 6) * (text.length - 1))));

const flatSign = (env: Env, sg: WallSign, reveal: number): Layer => {
  const FW = (sg.z1 - sg.z0) * FOCAL, FH = sg.h1 - sg.h0, key = `p01:sign:${sg.id}:${env.scale}`, done = env.cache.get(key) as Layer | undefined;
  if (done) return done;
  const k = env.scale * 1.2, fenv: Env = { ...env, W: FW, H: FH, scale: k }, L = env.canvas(Math.ceil(FW * k), Math.ceil(FH * k)), g = new Gfx(L.ctx, fenv, 0, BRUSH), r = rng(sg.seed), m = 12;
  const pen = (pts: P[], w: number, seed: number, op = 0.9) => g.pen(pts, { w, color: INK, seed, wobble: 0.5, boil: 0, taper: 1, opacity: op, retrace: false, progress: reveal });
  const box = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  g.group("plain", () => {
    fillShape(g, box(0, 0, FW, FH), WOOD_DARK, 0.97 * reveal); fillShape(g, box(m, m, FW - m, FH - m), WOOD, 0.97 * reveal);
    pen([[m, FH / 2], [FW - m, FH / 2]], 1.4, sg.seed + 1, 0.3);                                    // the seam between the planks
    for (let i = 0; i < 12; i++) { const y = m + 6 + r() * (FH - 2 * m - 12), x = m + r() * FW * 0.7, l = 60 + r() * 160; pen([[x, y], [x + l / 2, y + (r() - 0.5) * 3], [Math.min(FW - m, x + l), y]], 1, sg.seed + 2 + i, 0.2); }
    [box(0, 0, FW, FH), box(m, m, FW - m, FH - m)].forEach((q, j) => q.forEach((a, i) => pen([a, q[(i + 1) % 4]], j ? 1.6 : 3.4, sg.seed + 20 + j * 4 + i, 0.95)));
    [[6, 6], [FW - 6, 6], [FW - 6, FH - 6], [6, FH - 6]].forEach(([x, y], i) => fillShape(g, blob(x, y, 3.4, 3.4, sg.seed + 30 + i, 0.1, 6), INK, 0.9 * reveal));
    const cap = FH * sg.cap; letter(g, sg.text, FW / 2, (FH - cap) / 2, { cap, color: PAINT, seed: sg.seed + 40, align: "center", progress: reveal, w: cap * 0.16, track: letterSpread(sg.text, cap, FW * 0.84) });
  });
  if (reveal >= 1) env.cache.set(key, L);
  return L;
};
const facadeSign = (g: Gfx, env: Env, sg: WallSign, reveal: number) => {
  if (reveal <= 0) return;
  const L = flatSign(env, sg, reveal), c = g.cur, right = sg.u > 0, sw = L.canvas.width / STRIPS;
  // read left to right: on the left wall that runs near to far, on the right wall far to near
  const zAt = (s: number) => (right ? sg.z1 - s * (sg.z1 - sg.z0) : sg.z0 + s * (sg.z1 - sg.z0));
  const xs = Array.from({ length: STRIPS + 1 }, (_, i) => U(sg.u, zAt(i / STRIPS), 0)[0]);
  for (let i = 0; i < STRIPS; i++) {
    const zm = zAt((i + 0.5) / STRIPS), top = U(sg.u, zm, sg.h1)[1], bot = U(sg.u, zm, sg.h0)[1];
    c.drawImage(L.canvas, i * sw, 0, sw + 0.5, L.canvas.height, xs[i], top, xs[i + 1] - xs[i] + 0.4, bot - top);
  }
  const a = U(sg.u, sg.z0, sg.h1), b = U(sg.u, sg.z1, sg.h0); g.touch(Math.min(a[0], b[0]) - 2, Math.min(a[1], b[1]) - 2, Math.max(a[0], b[0]) + 2, Math.max(U(sg.u, sg.z0, sg.h0)[1], b[1]) + 2);
};

export const p01 = page({
  id: "p01", title: "Dust Creek", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 18, seed: 990, at: 98, box: [60, 520, 1540, 880] },
  animAt: [52, 88],
  anim: (g, t, reveal, env) => {
    const T = (t / LOOP) * Math.PI * 2;
    const pen = (pts: P[], w: number, seed: number, op = 0.9, progress = reveal) => g.pen(pts, { w, color: INK, seed, wobble: 0.6, boil: 0.35, taper: 1, opacity: op, retrace: false, progress });
    // the sun, lifted out of the washes to bare paper, with a warm halo
    g.group("plain", () => { g.glow(SUN[0], SUN[1], 64, "#fff3d2", 0.55 * reveal); fillShape(g, blob(SUN[0], SUN[1], 30, 30, 3, 0.05, 16), "#fff8e6", 0.95 * reveal); });
    // the saloon lamp breathing: two unrelated sines so it never looks like a metronome
    const lamp = U(LX, 1.73, 180); g.group("plain", () => g.glow(lamp[0] + 20, lamp[1], 130, LAMP, reveal * (0.34 + 0.06 * Math.sin(T * 3) + 0.04 * Math.sin(T * 7 + 1))), { blend: "screen" });
    // the windmill: a ring of eighteen blades turning once a loop, the tail vane steady into the wind
    g.group("plain", () => {
      const [hx, hy] = MILL.hub, R = MILL.r;
      fillShape(g, oval(hx, hy, R, R, 24), "#e9d2a8", 0.35 * reveal);
      pen(oval(hx, hy, R, R, 24), 1.2, 800, 0.85); pen(oval(hx, hy, R * 0.42, R * 0.42, 14), 0.8, 801, 0.7);
      for (let i = 0; i < 18; i++) { const b = T + (i * Math.PI * 2) / 18, ca = Math.cos(b), sa = Math.sin(b); pen([[hx + ca * R * 0.42, hy + sa * R * 0.42], [hx + ca * R - sa * 4, hy + sa * R + ca * 4]], 1, 802 + i, 0.75); }
      pen([[hx + 4, hy], [hx + 58, hy - 2]], 1.4, 830, 0.9); pen([[hx + 46, hy - 14], [hx + 74, hy - 20], [hx + 76, hy + 12], [hx + 48, hy + 8], [hx + 46, hy - 14]], 1.1, 831, 0.85);
      fillShape(g, blob(hx, hy, 4, 4, 832, 0.1, 8), INK, 0.9 * reveal);
    });
    // the two shop signs, painted on boards nailed across the false fronts
    g.group("plain", () => { facadeSign(g, env, SALOON_SIGN, reveal); facadeSign(g, env, SHERIFF_SIGN, reveal); });
    // the sheriff's door, never latched: the wind eases it open, then slams it back on the frame
    g.group("plain", () => {
      const p = (t % 90) / 90, open = p < 0.72 ? Math.sin((p / 0.72) * Math.PI * 0.5) : p < 0.8 ? 1 - (p - 0.72) / 0.08 : 0, z = 1.785 + 0.015 + 0.075 * open;
      fillShape(g, [U(RX, 1.785, 4), U(RX, 1.785, 346), U(RX, z, 346), U(RX, z, 4)], DARK, 0.85 * reveal);
      pen([U(RX, z, 6), U(RX, z - 0.004, 344)], 2.8, 860, 0.95);
    });
    if (reveal < 1) return;
    // dust streaks blowing right to left, each crossing a whole number of times per loop
    g.group("plain", () => dust.forEach((d, i) => { const x = 1700 - ((d.x + (t / LOOP) * 1800 * d.k) % 1800), y = d.y + Math.sin(T * d.k + i) * 6; pen([[x, y], [x + d.l * 0.5, y - 1.5], [x + d.l, y + 1]], 0.6, 860 + i, 0.3, 1); }));
    // the tumbleweed rolls down the street at the reader: 150 frames from the far end to under the
    // camera, then 30 frames of nothing. Constant speed in depth, so on screen it rushes the last part.
    const k = t / 150; if (k >= 1) return;
    const z = 9 - k * 8.5, d = 1 / z, u = -60 + Math.sin(k * 5) * 90, [x, gy] = G(u, z), rr = TW.r * d, hop = Math.abs(Math.sin(k * Math.PI * 6)) * 60 * d, y = gy - rr - hop, rot = k * 26;
    g.group("plain", () => {
      fillShape(g, blob(x - 20 * d, gy + 3 * d, rr * 1.1, rr * 0.22, 870, 0.2, 12), SHADE, Math.max(0, 0.32 - hop / (300 * d)));
      tumbleweed.forEach((loop, i) => pen(loop.map(([px, py]) => [x + (px * Math.cos(rot) - py * Math.sin(rot)) * d, y + (px * Math.sin(rot) + py * Math.cos(rot)) * d] as P), Math.max(0.5, 1.6 * d), 880 + i, 0.75, 1));
    });
  },
});
