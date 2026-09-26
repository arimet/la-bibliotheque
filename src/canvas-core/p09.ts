// PAGE 9 · LE FACE-A-FACE. One idea: a held breath before a choice. The wind has just dropped.
// Focal subject: YOU, seen from behind, big in the middle of the plate, right hand hanging over
// the holster. On the left the Callahan gang, a row of silhouettes under their torches, Jeb in
// Hollis's pale hat. On the right the pebble ship in its crater, the hatch open. Between you and
// each side, empty ground. Two drafted sight lines, one to each side, turn it into a diagram of
// a decision. One light: the open hatch, low on the right. It lays a fan of pale light across the
// ground to your feet, rims your right side, and throws every shadow long to the left.
// What moves (small, tense): the torch flames, the hatch light pulsing, dust sinking and slowing
// in the light now the wind is gone, the fingers of your right hand twitching, the duster's hem
// settling.
import { drawShip, shipOutline, type ShipPose } from "./ship";
import { rng, type P } from "./core";
import { blob, fillShape, inside, lerpP } from "./gallery";
import { CYAN, page, perspective, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { paper: PAPER, ink: INK, deep: DEEP, pale: PALE, glow: GLOW } = CYAN;
const NIGHT = "#0a2140"; // the darkest body colour: the hero against the light

const HOR = 575; // the edge of the mesa we stand on: a long, low, ruled horizon
const { G } = perspective([800, HOR]);
const HATCH: P = [1250, 566];

// ---------------------------------------------------------------- the hero, from behind
// Hand-placed, clockwise from the left tip of the brim. Weight on the left leg (straight, under
// the hip), the right knee eased; the right elbow out, the hand hanging just off the gun.
const HERO: P[] = [
  [686, 289], [722, 292], [757, 291], [758, 262], [762, 238], [770, 226], [787, 221], [800, 228], [813, 221], [830, 226], [838, 238], [842, 262], [844, 290], [880, 290], [914, 285],
  [872, 305], [830, 316], [832, 330], [834, 344], [848, 354], [876, 366], [890, 378], [892, 410], [888, 446],
  [882, 500], [877, 548], [882, 610], [894, 700], [910, 792], [880, 798], [856, 801],
  [858, 838], [855, 857], [864, 870], [865, 881], [830, 882], [829, 862], [824, 838], [820, 804], [801, 806], [795, 807], [786, 805],
  [786, 840], [783, 858], [788, 870], [788, 880], [746, 882], [749, 860], [746, 838], [748, 802], [720, 800], [672, 796],
  [678, 740], [690, 670], [701, 636], [698, 612], [696, 592], [694, 540], [694, 480], [698, 420], [706, 388], [724, 366], [752, 354], [766, 344], [768, 330], [768, 316], [728, 306],
];
// the right arm, elbow out, is its own shape: the gap under it shows the ground
const ARM_R: P[] = [[872, 370], [896, 380], [906, 398], [916, 430], [930, 468], [938, 500], [935, 540], [926, 574], [910, 576], [908, 556], [912, 520], [902, 482], [888, 446], [884, 404]];
const HAND_BOX: P[] = [[902, 570], [944, 570], [944, 640], [902, 640]];
// the revolver's butt, turned back toward us, and the top of the holster riding on the right hip
const GRIP: P[] = [[881, 598], [883, 584], [889, 573], [898, 568], [905, 571], [903, 578], [897, 584], [896, 598]];
const HOLSTER: P[] = [[877, 597], [899, 596], [900, 650], [883, 655]];
const GUN: P[] = [...GRIP.slice(0, -1), [900, 598], [900, 650], [883, 655], [877, 597]];
// your right hand, hanging: back of the hand to the light, fingers loosely curled. tw curls them.
const hand = (tw: number): P[] => { const c = (p: P, k: number): P => [p[0] - tw * 2.4 * k, p[1] - tw * 3.2 * k]; return [[910, 576], [927, 575], [933, 590], [934, 604], c([931, 616], 0.6), c([926, 625], 1), [923, 617], c([920, 630], 0.85), [917, 621], c([913, 632], 0.7), [911, 622], c([907, 627], 0.5), [905, 616], [906, 598], [907, 588]]; };
const HERO_HIDE = [HERO, ARM_R, HAND_BOX, GUN];
const hemL: P[] = [[672, 796], [700, 799], [730, 801], [765, 804], [795, 807]];
const hemR: P[] = [[801, 806], [830, 804], [856, 801], [884, 797], [910, 792]];

// ---------------------------------------------------------------- the gang, in silhouette
// A standing man in unit coordinates: feet on 0, hat crown at -1. The arm on the right (screen)
// side changes with what he holds. Heights follow the ground: 2.14 px per px below the horizon.
type Pose = "down" | "torch" | "rifle" | "hip";
const HAT: P[] = [[-0.135, -0.9], [-0.07, -0.912], [-0.066, -0.972], [-0.035, -1], [0, -0.984], [0.035, -1], [0.066, -0.972], [0.07, -0.912], [0.135, -0.9], [0.06, -0.892]];
const ARM: Record<Pose, P[]> = {
  down: [[0.13, -0.785], [0.145, -0.7], [0.152, -0.55], [0.15, -0.47], [0.13, -0.452], [0.134, -0.44]],
  rifle: [[0.13, -0.785], [0.15, -0.7], [0.16, -0.6], [0.12, -0.56], [0.13, -0.44]],
  hip: [[0.13, -0.785], [0.185, -0.7], [0.205, -0.63], [0.15, -0.55], [0.126, -0.52], [0.134, -0.44]],
  torch: [[0.16, -0.814], [0.19, -0.845], [0.19, -0.905], [0.198, -0.94], [0.226, -0.944], [0.232, -0.9], [0.225, -0.83], [0.2, -0.772], [0.138, -0.742], [0.134, -0.6], [0.134, -0.44]],
};
const unitMan = (pose: Pose): P[] => [
  ...HAT, [0.058, -0.868], [0.045, -0.84], [0.035, -0.825], [0.1, -0.81], ...ARM[pose],
  [0.15, -0.3], [0.086, -0.302], [0.085, -0.03], [0.116, 0], [0.036, 0], [0.03, -0.27], [0, -0.292], [-0.03, -0.27], [-0.036, 0], [-0.116, 0], [-0.085, -0.03], [-0.086, -0.302], [-0.15, -0.3],
  [-0.135, -0.44], [-0.13, -0.455], [-0.148, -0.47], [-0.152, -0.55], [-0.145, -0.7], [-0.13, -0.785], [-0.1, -0.81], [-0.035, -0.825], [-0.045, -0.84], [-0.058, -0.868], [-0.06, -0.892],
];
type Man = { x: number; y: number; h: number; pose: Pose; seed: number; boss?: boolean };
const GANG: Man[] = ([
  { x: 58, y: 640, h: 0, pose: "torch", seed: 2000 },
  { x: 142, y: 652, h: 0, pose: "rifle", seed: 2100 },
  { x: 246, y: 644, h: 0, pose: "torch", seed: 2200 },
  { x: 318, y: 660, h: 0, pose: "down", seed: 2300 },
  { x: 452, y: 676, h: 0, pose: "hip", seed: 2400, boss: true },
  { x: 560, y: 650, h: 0, pose: "torch", seed: 2500 },
] as Man[]).map((m) => ({ ...m, h: 2.14 * (m.y - HOR) }));
const at = (m: Man, [u, v]: P): P => [m.x + u * m.h, m.y + v * m.h];
const OUT = GANG.map((m) => unitMan(m.pose).map((p) => at(m, p)));
const TORCHES = GANG.flatMap((m, i) => (m.pose === "torch" ? [{ hand: at(m, [0.212, -0.94]), top: at(m, [0.235, -1.13]), h: m.h, i }] : []));
const CAL = GANG[4], CAL_HAT = HAT.map((p) => at(CAL, p));

// the contour of a silhouette, in short runs: heavy where it faces the hatch, thin and broken
// where it turns away, so light eats nothing and darkness eats the far edge
const contour = (pts: P[], cx: number, seed: number, heavy = 2, every = 4): Omit<Stroke, "at">[] => {
  const out: Omit<Stroke, "at">[] = [];
  for (let i = 0, k = 0; i < pts.length; i += every, k++) {
    const run = [...pts.slice(i, i + every + 1), ...(i + every >= pts.length ? [pts[0]] : [])], mx = run.reduce((s, p) => s + p[0], 0) / run.length;
    const lit = mx > cx + 2;
    if (!lit && k % 3 === 2) continue;
    out.push(st(run, lit ? heavy : heavy * 0.5, seed + k, lit ? 0.95 : 0.55, 0.5));
  }
  return out;
};

// ---------------------------------------------------------------- the ship in its crater
// the ship: the book's one design (ship.ts), nose to the right, sunk to the near lip of its crater
const POSE: ShipPose = { c: [1378, 534], ang: -0.06, len: 210 };
const SHIP = shipOutline(POSE);
const SHIP_DOOR = { u: -0.62, k: 0.3, size: 0.5 }; // lands on HATCH
const RIM_NEAR: P[] = [[1052, 616], [1140, 624], [1260, 628], [1380, 626], [1500, 619], [1600, 610]];
const RIM_FAR: P[] = [[1070, 603], [1110, 594], [1300, 588], [1600, 590]];
const LIP_FRONT: P[] = [...RIM_NEAR, [1640, 900], [1000, 900], [1000, 616]]; // the crater's near lip, in front of the hull
const SHIP_VIS = SHIP.filter(([x, y]) => y < 620 - (x - 1052) * 0.02); // what stands above the near lip
const SHIP_HIDE: P[] = [...SHIP_VIS, [SHIP_VIS[SHIP_VIS.length - 1][0], 640], [SHIP_VIS[0][0], 640]];
// the fan of light the hatch lays on the ground, straight edges from the sill
const FAN: P[] = [[1232, 610], [1266, 612], [1160, 900], [430, 900], [1110, 628]];
const FAN_IN: P[] = [[1238, 612], [1260, 614], [1070, 900], [650, 900], [1160, 630]];

// the far mesa beyond ours, a long flat top behind you, between the two sides
const MESA: P[] = [[590, 575], [616, 566], [642, 551], [660, 536], [674, 526], [700, 521], [900, 517], [1010, 519], [1040, 524], [1062, 535], [1086, 551], [1112, 565], [1140, 575]];

// ---------------------------------------------------------------- scatter, hand-sown then culled
const hidden = (x: number, y: number) => [...HERO_HIDE, ...OUT, SHIP_HIDE].some((q) => inside(q, x, y));
const STARS = (() => { const r = rng(90), out: { p: P; s: number; b: number }[] = []; while (out.length < 150) { const x = r() * 1600, y = Math.pow(r(), 1.6) * 530, sky = x > 600 && x < 1120 ? 512 : HOR - 12; if (y > sky || hidden(x, y) || hidden(x, y - 16)) continue; out.push({ p: [x, y], s: r(), b: r() }); } return out; })();
const stars = STARS.flatMap(({ p: [x, y], s, b }, i) => b > 0.93
  ? [st([[x - 7, y], [x + 7, y]], 0.7, 3000 + i * 3, 0.85, 0.1), st([[x, y - 7], [x, y + 7]], 0.7, 3001 + i * 3, 0.85, 0.1)]
  : [st([[x, y], [x + 0.8 + s, y + 0.4]], 0.6 + s * 1.1, 3000 + i * 3, 0.45 + b * 0.5, 0.1)]);
const pebbles = (() => { const r = rng(700), out: Omit<Stroke, "at">[] = []; for (let i = 0; out.length < 70 && i < 400; i++) { const z = 1.02 + r() * r() * 6, u = -1400 + r() * 2800, [x, y] = G(u, z), l = (10 + r() * 16) / z; if (x < 0 || x > 1600 || hidden(x, y) || inside([...RIM_NEAR, ...[...RIM_FAR].reverse()], x, y)) continue; out.push(st([[x, y], [x + l * 0.5, y - 1 / z], [x + l, y + 0.8 / z]], Math.max(0.5, 1.5 / z), 710 + i, 0.3 + 0.35 / z, 0.4)); } return out; })();

// the two sight lines, dashed like a drafting construction: from your head to Jeb, to the hatch
const EYE: P = [800, 300], CAL_HEAD = at(CAL, [0, -0.93]);
const dashes = (a: P, b: P, seed: number) => Array.from({ length: 30 }, (_, i) => [lerpP(a, b, i / 30), lerpP(a, b, (i + 0.55) / 30)] as P[]).filter(([p, q]) => !HERO_HIDE.some((h) => inside(h, p[0], p[1]) || inside(h, q[0], q[1]))).map((d, i) => st(d, 0.7, seed + i, 0.6, 0.1));
const ring = (c: P, r: number, seed: number) => st(Array.from({ length: 13 }, (_, i) => [c[0] + Math.cos(i * 0.5 - 1) * r, c[1] + Math.sin(i * 0.5 - 1) * r] as P), 0.7, seed, 0.65, 0.2);
const ticks = Array.from({ length: 21 }, (_, i) => [i * 80, HOR] as P).filter(([x, y]) => !hidden(x, y + 4) && !hidden(x, y - 4) && !inside(MESA, x, y - 2)).map(([x, y], i) => st([[x, y - 6], [x, y + 6]], 0.6, 3600 + i, 0.5, 0.1));

// ---------------------------------------------------------------- the pen, in the order a hand draws it
const strokes: Stroke[] = [
  // 1. the ruled horizon and the far mesa, then the big shape of you
  ...seq([st([[-20, HOR], [1620, HOR]], 1, 1, 0.75, 0.15), st(MESA, 1.4, 2, 0.7, 0.5)], 0, 10, 0.3, [...HERO_HIDE, ...OUT, SHIP_HIDE]),
  ...seq([
    st([[686, 289], [722, 292], [757, 291]], 1.4, 10, 0.7), st([[844, 290], [880, 290], [914, 285]], 2.4, 11, 0.95), st([[686, 289], [728, 306], [800, 318], [872, 305], [914, 285]], 1.8, 12, 0.9),
    st([[757, 291], [758, 262], [762, 238], [770, 226], [787, 221], [800, 228]], 1.2, 13, 0.7), st([[800, 228], [813, 221], [830, 226], [838, 238], [842, 262], [844, 290]], 2.2, 14, 0.95),
    st([[834, 344], [848, 354], [876, 366], [896, 380], [906, 398], [916, 430], [930, 468], [938, 500], [935, 540], [926, 574]], 2.6, 15, 0.95),
    st([[888, 446], [882, 500], [877, 548], [882, 610], [894, 700], [910, 792]], 2.6, 16, 0.95),
    st([[752, 354], [724, 366], [706, 388], [698, 420], [694, 480], [694, 540], [696, 592]], 1.2, 17, 0.6), st([[701, 636], [690, 670], [678, 740], [672, 796]], 1.1, 18, 0.55),
    st([[856, 801], [858, 838], [855, 857], [864, 870], [865, 881]], 2.2, 19, 0.9), st([[830, 882], [829, 862], [824, 838], [820, 804]], 1, 20, 0.6),
    st([[786, 805], [786, 840], [783, 858], [788, 870], [788, 880]], 1.4, 21, 0.75), st([[746, 882], [749, 860], [746, 838], [748, 802]], 1, 22, 0.5),
  ], 4, 26),
  // 2. the ship in its crater, the hatch
  ...seq([st(RIM_NEAR, 1.8, 31, 0.85, 0.6), { ...st(RIM_FAR, 1.1, 32, 0.6, 0.5), hide: [SHIP_HIDE] }], 16, 34),
  // 3. the gang, man by man, left to right
  ...seq(GANG.flatMap((m, i) => contour(OUT[i], m.x, m.seed, m.boss ? 2.2 : 1.8)), 24, 50),
  // torch poles and the rifle
  ...seq([...TORCHES.map((t, i) => st([t.hand, t.top], 1.4, 40 + i, 0.9, 0.2)),
    st([at(GANG[1], [-0.14, -0.46]), at(GANG[1], [0.23, -0.86])], 1.5, 45, 0.9, 0.2), st([at(GANG[1], [-0.14, -0.46]), at(GANG[1], [-0.2, -0.43]), at(GANG[1], [-0.17, -0.5])], 1.4, 46, 0.85, 0.2)], 44, 54),
  // Hollis's hat on Callahan's head, laid in pale
  // 4. details on you: yoke, back seam, vent, folds, collar, hat band, hair, gun, boots, spurs
  ...seq([
    st([[758, 282], [800, 285], [842, 281]], 1, 60, 0.7, 0.3), st([[786, 230], [800, 240], [814, 230]], 0.8, 61, 0.55, 0.3),
    st([[766, 344], [800, 350], [834, 344]], 1, 62, 0.6), st([[774, 320], [780, 334], [776, 342]], 0.6, 63, 0.4), st([[826, 320], [821, 336], [826, 343]], 0.6, 64, 0.4),
    st([[732, 376], [800, 386], [870, 374]], 1, 66, 0.55), st([[800, 388], [798, 520], [797, 690]], 0.9, 67, 0.5), st([[797, 690], [798, 806]], 1.6, 68, 0.75),
    st([[716, 396], [716, 480], [717, 560], [716, 592]], 0.8, 69, 0.45), st([[696, 590], [717, 592]], 1, 70, 0.6),
    st([[768, 560], [748, 690], [736, 790]], 0.8, 71, 0.4), st([[834, 564], [852, 690], [864, 796]], 1, 72, 0.5), st([[722, 540], [760, 548]], 0.7, 73, 0.35), st([[878, 546], [846, 552]], 0.9, 74, 0.55),
    st([[900, 482], [912, 520], [908, 556], [910, 576]], 1, 75, 0.7), st([[912, 576], [926, 574]], 1.4, 76, 0.85),
    st([[749, 860], [766, 864], [783, 858]], 0.9, 81, 0.5), st([[829, 862], [844, 864], [855, 857]], 1.1, 82, 0.7), // where the trousers break over the boots
    st([[840, 858], [852, 857]], 1.2, 84, 0.85),
    ...[0, 1, 2, 3].flatMap((k) => [st([[850 + Math.cos(k * 0.8) * 7, 857 + Math.sin(k * 0.8) * 7], [850 - Math.cos(k * 0.8) * 7, 857 - Math.sin(k * 0.8) * 7]], 0.6, 85 + k, 0.8, 0.1)]),
  ], 50, 74),
  // the ship's seams, the crater's lip, cracks run out from it over the ground
  ...seq([
    st([[1052, 616], [990, 640], [930, 662]], 0.8, 93, 0.45, 0.8), st([[1140, 624], [1110, 670], [1080, 720]], 0.8, 94, 0.4, 0.8), st([[1400, 627], [1430, 690], [1470, 760]], 0.9, 95, 0.45, 0.8), st([[1520, 618], [1590, 650]], 0.8, 96, 0.4, 0.8),
    ...[[1010, 628], [1080, 634], [1330, 640], [1450, 636], [1560, 628], [1200, 646]].map(([x, y], i) => st(blob(x, y, 7 + (i % 3) * 3, 3, 97 + i, 0.3, 8), 0.8, 97 + i, 0.6, 0.2)),
  ], 56, 76),
  // 5. the ground, the stars, the construction: ticks along the horizon, the two sight lines
  ...seq([...pebbles, ...stars], 62, 90),
  ...seq([...ticks, ...dashes(EYE, lerpP(EYE, CAL_HEAD, 0.9), 3700), ...dashes(EYE, lerpP(EYE, HATCH, 0.93), 3800), ring(CAL_HEAD, 24, 3900), ring(HATCH, 62, 3901)], 82, 100, 0.2),
  // 6. last: the rim of light, a pale band just inside your right edge, then the edge re-stated
  ...seq([
    st([[846, 358], [872, 369], [890, 382], [900, 400], [910, 432], [923, 470], [931, 502], [928, 540], [921, 570]], 3.4, 124, 0.3, 0.3),
    st([[884, 452], [878, 500], [873, 548], [878, 610], [889, 700], [904, 788]], 3.4, 125, 0.3, 0.3), st([[838, 240], [840, 288]], 2.4, 126, 0.3, 0.2),
  ].map((s) => ({ ...s, color: PALE })), 88, 96),
  ...seq([
    st([[848, 354], [876, 366], [896, 380], [906, 398], [916, 430], [930, 468], [938, 500]], 1, 120, 0.9, 0.3),
    st([[882, 610], [894, 700], [910, 792]], 1, 121, 0.9, 0.3), st([[842, 262], [844, 290]], 0.8, 122, 0.9, 0.2),
  ].map((s) => ({ ...s, color: GLOW })), 92, 101),
];

// ---------------------------------------------------------------- the washes, flooding in
// the kit lays a wash 4% large and 5 px down-right of its shape (the colour missing the line);
// on a figure rimmed by light that would put a dark fringe outside the lit edge, so aim it back
const fit = (pts: P[]): P[] => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2; return pts.map(([x, y]) => [cx + (x - cx) / 1.04 - 5, cy + (y - cy) / 1.04 - 4]); };
const man = (i: number): Wash => ({ pts: fit(OUT[i]), color: NIGHT, alpha: 0.78, seed: 600 + i, pool: 0.4, at: [66 + i * 2, 88 + i * 2], ph: 3 });
const washes: Wash[] = [
  // sky: deep at the zenith, the paper itself left near the horizon, a pale breath over the ship
  // (the night falls away from the hatch: its lower edge slopes down to the left)
  // (a graded wash: several thin layers, each stopping a little higher, and higher toward the ship)
  { pts: [[-40, -40], [1640, -40], [1640, 578], [-40, 578]], color: DEEP, alpha: 0.26, seed: 500, pool: 0, at: [40, 66], from: [0, -40] },
  ...[430, 330, 230, 130].map((y, i): Wash => ({ pts: [[-40, -40], [1640, -40], [1640, y - 150], [1300, y - 110 + i * 9], [900, y - 40], [500, y + 6 - i * 7], [-40, y + 20]], color: DEEP, alpha: 0.12, seed: 501 + i, pool: 0, at: [41 + i, 66 + i], from: [0, -40] })),
  { pts: [...MESA, [590, 580]], color: NIGHT, alpha: 0.3, seed: 504, pool: 0.3, at: [46, 70], from: [860, 518] },
  // the mesa top we stand on, darkening toward us
  { pts: [[-40, HOR], [1640, HOR], [1640, 940], [-40, 940]], color: DEEP, alpha: 0.3, seed: 510, pool: 0.9, at: [48, 78], from: [800, 940], ph: 1 },
  { pts: [[-40, 740], [600, 752], [1640, 730], [1640, 940], [-40, 940]], color: DEEP, alpha: 0.28, seed: 511, pool: 0.6, at: [52, 80], from: [400, 940], ph: 1 },
  { pts: [[1040, 612], [1600, 596], [1640, 634], [1060, 634]], color: DEEP, alpha: 0.35, seed: 512, pool: 0.5, at: [54, 80], ph: 1 }, // the crater's bowl, below the lip
  // the fan of light from the hatch, laid over the ground to your feet
  { pts: FAN, color: PALE, alpha: 0.26, seed: 520, pool: 0.05, at: [56, 86], from: HATCH, ph: 2 },
  { pts: FAN_IN, color: GLOW, alpha: 0.18, seed: 521, pool: 0.05, at: [60, 88], from: HATCH, ph: 2 },
  // the gang, then you, darkest of all against the light
  ...GANG.map((_, i) => man(i)),
  { pts: fit(HERO), color: NIGHT, alpha: 0.86, seed: 640, pool: 0.3, at: [64, 92], from: [800, 880], ph: 3 },
  { pts: fit(ARM_R), color: NIGHT, alpha: 0.8, seed: 642, pool: 0.2, at: [70, 92], from: [900, 400], ph: 3 },
  // shadows thrown long to the left, away from the hatch
  { pts: [[744, 880], [868, 874], [820, 906], [650, 906]], color: NIGHT, alpha: 0.5, seed: 650, pool: 0.3, at: [80, 98], ph: 3 },
  ...GANG.map((m, i): Wash => ({ pts: [[m.x - 0.1 * m.h, m.y], [m.x + 0.1 * m.h, m.y + 2], [m.x - 0.9 * m.h, m.y + 0.07 * m.h], [m.x - 0.95 * m.h, m.y + 0.03 * m.h]], color: NIGHT, alpha: 0.32, seed: 660 + i, pool: 0.2, at: [84, 98], ph: 3 })),
];

// ---------------------------------------------------------------- what moves
const DUST = (() => { const r = rng(950), out: { x: number; y: number; fall: number; drift: number; k: number; o: number; s: number }[] = []; while (out.length < 38) { const y = 430 + r() * 440, x = 560 + r() * 760; if (!inside(FAN, x, y + 80) && r() < 0.7) continue; out.push({ x, y, fall: 24 + r() * 40, drift: 6 + r() * 14, k: 1 + Math.floor(r() * 2), o: r(), s: 0.8 + r() * 1.4 }); } return out; })();
// a twitch is a short bump at a moment in the loop, measured round the loop so the seam is clean
const bump = (t: number, c: number, w: number) => { const d = Math.min(Math.abs(t - c), LOOP - Math.abs(t - c)); return Math.exp(-(d / w) * (d / w)); };

export const p09 = page({
  id: "p09", title: "Le Face-a-face", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 12, seed: 990, at: 99, box: [1160, 700, 1560, 880] },
  animAt: [62, 96],
  anim: (g, t, reveal, env) => {
    const T = (t / LOOP) * Math.PI * 2;
    const pen = (pts: P[], w: number, seed: number, op = 0.9, color = INK) => g.pen(pts, { w, color, seed, wobble: 0.4, boil: 0.25, taper: 1, opacity: op, retrace: false, progress: reveal });
    // the hatch breathing, slow and not quite regular; its light on the ground and on your right side
    const beat = 0.5 + 0.5 * Math.sin(T * 2) + 0.12 * Math.sin(T * 5 + 1);
    drawShip(g, POSE, { reveal, light: HATCH, hatch: { ...SHIP_DOOR, open: Math.min(1, 0.75 + 0.25 * beat) }, hide: [LIP_FRONT], cache: { env, key: "p09" } });
    g.group("plain", () => {
      g.glow(HATCH[0], HATCH[1], 46, GLOW, reveal * (0.7 + 0.2 * beat));
      g.glow(HATCH[0] - 30, HATCH[1] + 30, 200, PALE, reveal * (0.14 + 0.07 * beat));
      g.glow(1000, 760, 260, PALE, reveal * (0.05 + 0.04 * beat));
    }, { blend: "screen" });
    // torch flames: every flame on its own flicker, whole cycles of the loop only
    g.group("plain", () => TORCHES.forEach(({ top, h, i }) => {
      const f = 0.75 + 0.14 * Math.sin(T * (7 + i) + i * 2) + 0.11 * Math.sin(T * (13 + 2 * i) + i);
      g.glow(top[0], top[1] - 6, 0.2 * h * f, PALE, reveal * 0.55 * f);
      g.glow(top[0], top[1] - 4, 0.07 * h, GLOW, reveal * 0.8);
    }), { blend: "screen" });
    g.group("plain", () => TORCHES.forEach(({ top, h, i }) => {
      const s = h / 170, sway = 3 * Math.sin(T * (5 + i) + i) * s, tall = (22 + 5 * Math.sin(T * (9 + i) + 2 * i)) * s;
      const flame: P[] = [[top[0] - 6 * s, top[1] + 2], [top[0] - 7 * s, top[1] - 8 * s], [top[0] + sway * 0.5 - 3 * s, top[1] - tall * 0.6], [top[0] + sway, top[1] - tall], [top[0] + sway * 0.4 + 4 * s, top[1] - tall * 0.55], [top[0] + 7 * s, top[1] - 7 * s], [top[0] + 5 * s, top[1] + 2]];
      fillShape(g, flame, GLOW, 0.9 * reveal);
    }));
    // your right hand, hanging over the gun. The fingers twitch twice, and once more later.
    const tw = bump(t, 34, 4) + 0.8 * bump(t, 44, 4) + 0.9 * bump(t, 128, 5);
    g.group("plain", () => {
      // the holster and the butt of the gun, then the hand beside it
      fillShape(g, HOLSTER, NIGHT, 0.95 * reveal); fillShape(g, GRIP, NIGHT, 0.95 * reveal);
      pen([[899, 597], [900, 650]], 1.6, 704, 0.9, GLOW); pen([[877, 597], [899, 596]], 1.2, 705, 0.8); pen([[883, 655], [877, 597]], 0.7, 706, 0.4);
      pen([[889, 573], [898, 568], [905, 571], [903, 578], [897, 584], [896, 598]], 1.4, 707, 0.95, GLOW); pen([[881, 598], [883, 584], [889, 573]], 0.7, 708, 0.5);
      const hd = hand(tw); fillShape(g, hd, NIGHT, 0.97 * reveal);
      pen(hd.slice(1, 6), 1.5, 710, 0.95, GLOW); pen([hd[6], [922, 610]], 0.6, 711, 0.45); pen([hd[8], [916, 612]], 0.6, 712, 0.4); pen(hd.slice(11, 15), 0.7, 713, 0.45);
      // the duster's hem settling: a slow wave running along it, a hair's breadth
      [hemL, hemR].forEach((hem, j) => {
        const moved = hem.map(([x, y], k) => [x, y + (1.6 * Math.sin(T + x * 0.02 + j) + 0.8 * Math.sin(T * 2 + 1 + x * 0.035)) * (0.4 + 0.6 * Math.abs(k - (j ? 0 : 4)) / 4 + (k === (j ? 0 : 4) ? 0.6 : 0))] as P);
        fillShape(g, [...hem.map(([x, y]) => [x, y - 5] as P), ...[...moved].reverse().map(([x, y]) => [x, y + 1] as P)], NIGHT, 0.8 * reveal);
        pen(moved, j ? 2 : 1.2, 720 + j, j ? 0.9 : 0.6, j ? GLOW : INK);
      });
    });
    // Hollis's pale hat on Callahan's head: the one pale thing in the gang
    g.group("plain", () => fillShape(g, CAL_HAT, PALE, 0.85 * reveal));
    if (reveal < 1) return;
    // dust sinking in the light: each mote falls and slows, drifting on the last of the wind
    g.group("plain", () => DUST.forEach((d, i) => {
      const p = (d.o + (t / LOOP) * d.k) % 1, e = 1 - (1 - p) * (1 - p), a = Math.sin(Math.PI * p);
      const x = d.x + d.drift * (1 - (1 - p) ** 3), y = d.y + d.fall * e;
      fillShape(g, blob(x, y, d.s, d.s, 800 + i, 0.2, 6), GLOW, 0.5 * a);
    }), { blend: "screen" });
  },
});
