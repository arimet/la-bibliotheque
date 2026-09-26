// PAGE 7 · LE PILOTE. One idea: the book changes medium because the story has, and the first thing
// drawn in the new hand is a being who cannot speak, pointing home.
// Focal subject: the pilot's two luminous eyes, then the raised hand pointing at one ringed star.
// It is a cyanotype plate: white line on the blue, ruled construction lines, drafted labels.
// One light: the pilot himself, his eyes and the wound under his hand. It rim-lights the rock he
// leans on and pools on the ground around him; everything far from him sinks into the night.
// What moves: the eyes pulse slowly, the wound leaks light between the fingers with each slow
// breath (the shoulder rises with it), motes of pale light drift up off him, stars twinkle, and
// far down the trail the gang's torches flicker.
import { Gfx, rng, type Env, type Layer, type P } from "./core";
import { letter } from "./drafting";
import { blob, clipped, fillShape, hatchRuns, inside } from "./gallery";
import { CYAN, H, INK_M, W, page, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { ink: INK, deep: DEEP, mid: MID, pale: PALE, glow: GLOW } = CYAN;

// ---------------------------------------------------------------- helpers
// a contour offset from a centreline by a hand-set width at each control point; side 1 or -1
const off = (c: P[], w: number[], side: 1 | -1): P[] => c.map((p, i) => {
  const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
  return [p[0] - (dy / l) * w[i] * side, p[1] + (dx / l) * w[i] * side];
});
// where a horizontal line at y crosses a polygon, left to right
const across = (poly: P[], y: number) => poly.flatMap((a, i) => { const b = poly[(i + 1) % poly.length]; return a[1] > y !== b[1] > y ? [a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1])] : []; }).sort((p, q) => p - q);
const rev = (s: P[]) => [...s].reverse();
const lerp2 = (a: P, b: P, k: number): P => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

// ---------------------------------------------------------------- the land
// the boulder he leans on, left foot to right foot
const ROCK: P[] = [[318, 774], [310, 700], [318, 640], [340, 610], [350, 560], [362, 500], [380, 452], [410, 410], [452, 374], [520, 358], [600, 344], [680, 342], [730, 350], [760, 368], [790, 392], [830, 400], [858, 406], [880, 440], [896, 480], [912, 560], [930, 640], [946, 712], [958, 772]];
// a butte behind it on the left: flat caprock, stepped face, its foot hidden by the boulder
const BUTTE_TOP: P[] = [[-40, 236], [40, 226], [120, 221], [196, 228]];
const BUTTE_R: P[] = [[196, 228], [200, 262], [214, 270], [222, 340], [236, 420], [250, 470], [282, 536], [300, 580], [316, 622]];
const BUTTE: P[] = [...BUTTE_TOP, ...BUTTE_R, ...rev(ROCK.slice(0, 3)), [-40, 780]];
const ROCK_E1: P[] = [[410, 410], [436, 470], [448, 548], [440, 640], [450, 720], [454, 772]], ROCK_E2: P[] = [[858, 406], [846, 450], [856, 520], [848, 600], [854, 700], [858, 772]];
const HORIZON = 578;
const LIP: P[] = [[958, 766], [1040, 758], [1120, 754], [1200, 752], [1300, 748], [1420, 744], [1520, 740], [1640, 737]];
const FAR1: P[] = [[936, 566], [990, 560], [1030, 544], [1100, 538], [1136, 550], [1180, 566], [1210, 578]];
const FAR2: P[] = [[1370, 578], [1392, 566], [1424, 559], [1520, 556], [1548, 568], [1566, 578]];
const TRAIL: P[] = [[1500, 582], [1446, 594], [1470, 607], [1420, 620], [1352, 640], [1392, 662], [1300, 690], [1220, 718], [1250, 738], [1180, 752]];
const TORCHES: P[] = [[1452, 598], [1437, 611], [1418, 620], [1398, 626], [1376, 633], [1360, 641]];
const SKY: P[] = [[-40, -60], [1640, -60], [1640, HORIZON], [916, HORIZON], ...rev(ROCK.slice(3, 20)), ...rev(BUTTE_R.slice(0, -1)), ...rev(BUTTE_TOP)];
const PLAIN: P[] = [[916, HORIZON], [1640, HORIZON], ...rev(LIP), [946, 712], [930, 640]];
const GROUND: P[] = [[-40, 780], [318, 774], [958, 772], ...LIP, [1640, 940], [-40, 940]];

// ---------------------------------------------------------------- the pilot
// Seated against the boulder in three-quarter view, turned to the right and toward us. Standing he
// would be some 8.5 heads; the head is long, swept back, without a mouth.
const HEAD_BACK: P[] = [[604, 514], [592, 500], [581, 482], [572, 458], [568, 432], [570, 406], [580, 384], [598, 368], [620, 362], [642, 368], [656, 386], [664, 410], [669, 432], [671, 452]];
const FACE: P[] = [[671, 452], [666, 466], [672, 480], [670, 494], [662, 506], [652, 516], [642, 517], [632, 511]];
const NECK_F: P[] = [[640, 514], [644, 528], [652, 544]], NECK_B: P[] = [[602, 512], [600, 528], [598, 540]];
const EYE_N = { c: [636, 459] as P, w: 16.5, h: 5.6, rot: -0.24 }, EYE_F = { c: [662, 458] as P, w: 7.5, h: 4.8, rot: 0.16 };
// the shoulder that breathes: drawn in `anim`, lifted a little with each breath
const SHOULDER_N: P[] = [[598, 540], [580, 546], [562, 554], [550, 568]];
const SHOULDER_F: P[] = [[652, 544], [672, 546], [688, 554]];
// the far arm, raised: shoulder, elbow, wrist
const RA: P[] = [[690, 562], [700, 530], [710, 496], [730, 436], [740, 378], [746, 324]];
const RA_L = off(RA, [12, 11, 10, 8, 9, 6], -1), RA_R = off(RA, [15, 17, 12, 10.5, 10, 6.5], 1);
const tr = (s: P[], dx: number, dy: number): P[] => s.map(([x, y]) => [x + dx, y + dy]);
const HAND_UP: P[][] = [
  [RA_L[5], ...tr([[747, 288], [752, 274], [757, 269]], -6, 20)],                                        // palm, thumb side
  tr([[757, 269], [762, 244], [768, 222], [772, 207], [776, 204], [779, 208], [776, 228], [772, 250], [771, 266]], -6, 20), // the index, pointing
  [...tr([[771, 266], [781, 268], [787, 276], [786, 286], [778, 292], [768, 296]], -6, 20), RA_R[5]],       // the curled fingers, the heel of the hand
];
const HAND_UP_DETAIL: P[][] = [[[773, 276], [783, 279]], [[772, 284], [781, 288]], [[758, 292], [768, 285], [777, 283]]].map((d) => tr(d as P[], -6, 20));
// the near arm: hanging back to the rock, elbow out, forearm coming forward to the wound
const NU: P[] = [[560, 574], [542, 626], [526, 674]], NF: P[] = [[518, 686], [558, 700], [600, 708]];
const NU_O = off(NU, [13, 10, 9], 1), NU_I = off(NU, [9, 8, 7], -1), NF_B = off(NF, [9, 9, 7], 1), NF_T = off(NF, [9, 8, 6.5], -1);
const ELBOW: P[] = [NU_O[2], [517, 676], [519, 688], NF_B[0]];
// the hand on the wound, long fingers fanned over the flank (drawn in `anim`, over the leak)
const FINGERS: P[][] = [[-0.3, 42], [-0.1, 47], [0.1, 44], [0.3, 35]].map(([a, L], i) => { const k: P = [616 + i * 1.2, 691 + i * 7.6], c = Math.cos(a), s = Math.sin(a); return [k, [k[0] + c * L * 0.36, k[1] + s * L * 0.36], [k[0] + c * L * 0.7, k[1] + s * L * 0.7 + 1.5], [k[0] + c * L, k[1] + s * L + 3.5]] as P[]; });
// the gaps between them, where the light gets out
const SLITS: P[][] = FINGERS.slice(0, 3).map((f, i) => f.map((p, j) => lerp2(p, FINGERS[i + 1][j], 0.5)).slice(0, 4));
const FW = [[3.4, 3.1, 2.6, 1.4], [3.6, 3.3, 2.8, 1.5], [3.4, 3.1, 2.6, 1.4], [3, 2.8, 2.3, 1.2]];
const finger = (f: P[], i: number) => { const a = off(f, FW[i], 1), b = off(f, FW[i], -1), e = f[3], d = [f[3][0] - f[2][0], f[3][1] - f[2][1]], l = Math.hypot(d[0], d[1]); return [...a, [e[0] + (d[0] / l) * 2.5, e[1] + (d[1] / l) * 2.5] as P, ...rev(b)]; };
const HAND_N: P[] = [NF_T[2], [613, 689], [619, 688], [623, 719], [612, 719], NF_B[2]];
const WOUND: P = [640, 704];
// the torso, leaning back on the rock
const TORSO_N: P[] = [[570, 590], [576, 622], [588, 656], [598, 688], [604, 716], [612, 748], [628, 774]];
const TORSO_F: P[] = [[701, 582], [694, 604], [684, 626], [671, 650], [664, 674], [668, 700], [672, 718]];
// the near leg, knee drawn up; the far leg stretched out along the ground, behind it
const THIGH_T: P[] = [[672, 718], [720, 668], [765, 622], [782, 606]], KNEE: P[] = [[782, 606], [792, 612], [795, 624]];
const SHIN_F: P[] = [[795, 624], [801, 662], [808, 705], [815, 745], [820, 762]];
const THIGH_U: P[] = [[628, 776], [666, 754], [706, 718], [742, 674], [764, 636]], CALF: P[] = [[764, 636], [772, 668], [778, 705], [790, 740], [800, 760]];
const FOOT_N: P[] = [[800, 760], [796, 772], [808, 781], [850, 783], [880, 781], [885, 775], [868, 768], [844, 766], [820, 762]];
const FTHIGH_T: P[] = [[692, 727], [730, 731], [770, 733], [812, 732]], FTHIGH_T2: P[] = [[822, 731], [846, 730], [868, 735], [880, 745]];
const FSHIN_T: P[] = [[880, 745], [930, 755], [980, 765], [1018, 768]];
const FTHIGH_U: P[] = [[656, 775], [700, 773], [764, 769]], FCALF: P[] = [[822, 768], [860, 769], [900, 776], [950, 783], [1010, 782]];
const FOOT_F: P[] = [[1010, 782], [1018, 791], [1032, 789], [1058, 771], [1078, 753], [1074, 745], [1062, 748], [1040, 760], [1018, 768]];
// the whole figure as one outline, for masking what is behind him
const PILOT: P[] = [
  [628, 776], [614, 748], [604, 716], ...rev(NF_B), [517, 676], ...rev(NU_O), ...rev(SHOULDER_N), ...rev(NECK_B).slice(1), ...HEAD_BACK.slice(1), ...FACE.slice(1, 6), ...NECK_F, ...SHOULDER_F.slice(1),
  ...RA_L.slice(1), ...HAND_UP[0].slice(1), ...HAND_UP[1].slice(1), ...HAND_UP[2].slice(1, -1), ...rev(RA_R), ...TORSO_F.slice(1), ...THIGH_T.slice(1), ...KNEE.slice(1), [812, 731],
  ...FTHIGH_T2, ...FSHIN_T.slice(1), [1040, 760], [1062, 748], [1074, 745], [1078, 753], [1058, 771], [1032, 789], [1018, 791], ...rev(FCALF).slice(1),
  [820, 768], [885, 775], [880, 781], [850, 783], [808, 781], [796, 772], ...rev(FTHIGH_U),
];
const HIDE_ARM: P[] = [...RA_L, ...HAND_UP[1].slice(0, 5), ...rev(RA_R)]; // the raised arm alone, over the rock's top edge
const HIDE_HAND: P[] = [[588, 694], [612, 684], [662, 674], [672, 700], [660, 734], [620, 726], [588, 716]];
const HIDE_SHIN: P[] = [[762, 630], [796, 616], [824, 764], [798, 766]];
const HIDE_NFOOT: P[] = [[798, 758], [822, 758], [888, 772], [882, 786], [800, 786]];

// ---------------------------------------------------------------- the sky: stars in a drift along a pale band
const STARS = (() => {
  const r = rng(7071), out: { x: number; y: number; m: number }[] = [];
  const clear = (x: number, y: number) => inside(SKY, x, y) && !inside(PILOT, x, y) && y < HORIZON - 12 && !(x > 820 && x < 1060 && y > 88 && y < 140) && !(x > 1170 && x < 1440 && y > 440 && y < 500) && Math.hypot(x - 795, y - 118) > 30;
  for (let i = 0; out.length < 84 && i < 900; i++) {
    const band = r() < 0.62, s = r(), x = band ? 180 + s * 1460 + (r() - 0.5) * 220 : r() * 1600, y = band ? 10 + s * 360 + (r() - 0.5) * 150 : r() * 540;
    if (clear(x, y)) out.push({ x, y, m: r() * r() });
  }
  return out;
})();
const TWINKLE = STARS.filter((s) => s.m > 0.42).slice(0, 14), STILL = STARS.filter((s) => !TWINKLE.includes(s));
const RINGED: P = [795, 118];

// ---------------------------------------------------------------- the pen
const rockStrata = (poly: P[], ys: number[], seed: number, w = 1, op = 0.5, hide?: P[][]) => ys.flatMap((y, i) => {
  const r = rng(seed + i), xs = across(poly, y); if (xs.length < 2) return [];
  const x0 = xs[0] + 10 + r() * 20, x1 = xs[xs.length - 1] - 10 - r() * 24, n = 2 + Math.floor(r() * 3), out: Omit<Stroke, "at">[] = [];
  let a = x0, yy = y;
  for (let k = 0; k < n && a < x1; k++) {
    const b = Math.min(x1, a + ((x1 - x0) / n) * (0.5 + r() * 0.6)), dip = (r() - 0.5) * 7;
    out.push({ ...st([[a, yy], [(a + b) / 2, yy + dip * 0.5 + 1.5], [b, yy + dip]], w * (0.7 + r() * 0.5), seed + i * 5 + k, op * (0.7 + r() * 0.4), 0.9), hide });
    a = b + 16 + r() * 50; yy = y + (r() - 0.5) * 8;
  }
  return out;
});
const HID: P[][] = [PILOT];
// cross-bedding in the sandstone, tilted with the rock's top, in broken runs
const BEDDING = (() => {
  const r = rng(1212), out: Omit<Stroke, "at">[] = [];
  hatchRuns({ x0: 300, y0: 300, x1: 960, y1: 780 }, -0.2, 44, (x, y) => inside(ROCK, x, y) && !inside(PILOT, x, y) && y < 760, 4, 1213).forEach((run) => {
    for (let a = Math.floor(r() * 8); a < run.length - 6; ) { const n = 8 + Math.floor(r() * 30), piece = run.slice(a, Math.min(run.length, a + n)).filter((_, k, q) => k % 5 === 0 || k === q.length - 1); if (piece.length > 1) out.push(st(piece, 0.7 + r() * 0.5, 1300 + out.length, 0.35 + r() * 0.25, 0.9)); a += n + 4 + Math.floor(r() * 16); }
  });
  return out;
})();
// shade on the rock faces turned away from him: diagonal hatching, thinning out as it nears the light
const hatch = (poly: P[], seed: number, minD: number, gap: number) => hatchRuns({ x0: -40, y0: 140, x1: 960, y1: 780 }, -1.05, gap, (x, y) => inside(poly, x, y) && !inside(PILOT, x, y) && Math.hypot(x - 640, y - 560) > minD + ((x * 7 + y * 3) % 40), 4, seed).filter((s) => s.length > 3).map((s, i) => st(s, 0.7, seed + i, 0.3, 0.6));
const PEBBLES = (() => { const r = rng(3131), out: Omit<Stroke, "at">[] = []; for (let i = 0; out.length < 34 && i < 400; i++) { const x = r() * 1600, y = 790 + r() * r() * 110 + r() * 10, s = 1.5 + ((y - 780) / 120) * 6 * (0.5 + r()); if (inside(PILOT, x, y) || (x < 600 && y > 800 && y < 895) || (x > 1400 && y > 700)) continue; out.push(st(blob(x, y, s * 1.4, s * 0.8, 3200 + i, 0.3, 7), 0.8, 3300 + i, 0.6, 0.3)); } return out; })();
const tuft = (x: number, y: number, k: number, seed: number) => { const r = rng(seed); return Array.from({ length: 5 }, (_, i) => { const a = -1.9 + i * 0.28 + (r() - 0.5) * 0.2, l = k * (0.6 + r() * 0.5); return st([[x + (i - 2) * 2, y], [x + Math.cos(a) * l * 0.5, y + Math.sin(a) * l * 0.55], [x + Math.cos(a) * l, y + Math.sin(a) * l]], 0.8, seed + i, 0.7, 0.4); }); };
// the specimen: a spray of desert grass in the corner, pressed flat like a botanical plate
const SPRIG = (() => {
  const out: Omit<Stroke, "at">[] = [], r = rng(5151);
  const stems: [P, P, P][] = [[[1500, 905], [1486, 770], [1452, 654]], [[1508, 905], [1512, 780], [1538, 676]], [[1514, 905], [1540, 800], [1590, 734]]];
  stems.forEach(([a, b, c], i) => {
    out.push(st([a, b, c], 1.6, 5160 + i, 0.95, 0.3));
    for (let k = 0; k < 7; k++) { // spikelets along the top of the stem, alternating sides
      const t = 0.55 + k * 0.065, u = 1 - t, p: P = [u * u * a[0] + 2 * u * t * b[0] + t * t * c[0], u * u * a[1] + 2 * u * t * b[1] + t * t * c[1]], d = k % 2 ? 1 : -1, ang = Math.atan2(c[1] - b[1], c[0] - b[0]) + d * 0.5, l = 14 - k * 1.1;
      const tip: P = [p[0] + Math.cos(ang) * l, p[1] + Math.sin(ang) * l], sd = [-Math.sin(ang) * 2.4, Math.cos(ang) * 2.4];
      out.push(st([p, [p[0] + Math.cos(ang) * l * 0.5 + sd[0], p[1] + Math.sin(ang) * l * 0.5 + sd[1]], tip, [p[0] + Math.cos(ang) * l * 0.5 - sd[0], p[1] + Math.sin(ang) * l * 0.5 - sd[1]], p], 0.9, 5170 + i * 10 + k, 0.85, 0.2));
    }
  });
  [[1496, -1.9, 150], [1504, -1.35, 170], [1510, -1.1, 120], [1492, -2.3, 110], [1518, -0.8, 100]].forEach(([x, a0, l], i) => { const bend = (r() - 0.5) * 0.5 + (a0 < -1.57 ? -0.35 : 0.35); out.push(st([[x, 905], [x + Math.cos(a0) * l * 0.5, 905 + Math.sin(a0) * l * 0.5], [x + Math.cos(a0 + bend) * l, 905 + Math.sin(a0 + bend) * l]], 1.1, 5250 + i, 0.8, 0.3)); });
  return out;
})();
const dashes = (a: P, b: P, n: number, seed: number) => Array.from({ length: n }, (_, i) => { const t0 = i / n, t1 = t0 + 0.55 / n; return st([[a[0] + (b[0] - a[0]) * t0, a[1] + (b[1] - a[1]) * t0], [a[0] + (b[0] - a[0]) * t1, a[1] + (b[1] - a[1]) * t1]], 1, seed + i, 0.8, 0); });
const ring = (c: P, r: number, seed: number) => st(Array.from({ length: 17 }, (_, i) => [c[0] + Math.cos(-1.2 + (i / 16) * 6.1) * r, c[1] + Math.sin(-1.2 + (i / 16) * 6.1) * r] as P), 1, seed, 0.8, 0.3);

const strokes: Stroke[] = [
  // 1. the big shapes: the boulder (open at the top, where his light eats the edge), the butte, the horizon, the lip
  ...seq([...([[0, 2, 2.8], [2, 3, 2.2], [3, 8, 2.6], [8, 10, 1.5], [11, 12, 1.2], [12, 13, 1.8], [13, 14, 1.8], [14, 16, 1.6], [16, 22, 2.6]] as const).map(([a, b, w], i) => st(ROCK.slice(a, b + 1), w, 1 + i * 3, 0.9, 0.6)),
    st(BUTTE_TOP, 2, 5, 0.85), st(BUTTE_R, 2.2, 6, 0.85), st([[916, HORIZON], [1100, HORIZON + 1], [1640, HORIZON - 1]], 1.1, 7, 0.7, 0.3), st(LIP, 2.2, 8, 0.85)], 0, 16, 0.35, [PILOT]),
  // 2. the pilot, big contours: head, neck, torso, the raised arm, the near arm, the legs
  ...seq([st(HEAD_BACK, 2.6, 20, 0.95), st(FACE, 2, 21, 0.95), st(NECK_B, 1.6, 22, 0.9), st(NECK_F, 1.4, 23, 0.85),
    st(SHOULDER_F, 1.6, 24, 0.9), st(RA_L, 2, 25, 0.95), ...HAND_UP.map((h, i) => st(h, 1.4, 26 + i, 0.95, 0.3)), st(rev(RA_R), 2.6, 29, 0.95), st(TORSO_F, 1.8, 30, 0.9)], 12, 34),
  ...seq([st(NU_O, 2.4, 31, 0.9), st(ELBOW, 1.8, 32, 0.9), st(NF_B, 1.8, 33, 0.9), st(NU_I, 1.2, 34, 0.8), st(NF_T, 1.2, 35, 0.8)], 22, 36),
  ...seq([st(TORSO_N, 2.2, 36, 0.9)], 26, 36, 0.35, [HIDE_HAND]),
  ...seq([st(THIGH_T, 2.4, 37, 0.95), st(KNEE, 1.8, 38, 0.9), st(SHIN_F, 2.4, 39, 0.95), st(THIGH_U, 1.6, 40, 0.85), st(CALF, 1.6, 41, 0.85), st(FOOT_N, 1.6, 42, 0.9)], 28, 44),
  ...seq([st(FTHIGH_T, 1.6, 43, 0.85), st(FTHIGH_T2, 1.6, 44, 0.85), st(FSHIN_T, 1.8, 45, 0.9), st(FTHIGH_U, 1.2, 46, 0.7), st(FCALF, 1.4, 47, 0.8), st(FOOT_F, 1.6, 48, 0.9)], 34, 48, 0.35, [HIDE_SHIN, HIDE_NFOOT]),
  // 3. the land's structure: bedding in the sandstone, the far mesas, the trail
  ...seq(BEDDING, 36, 56),
  ...rockStrata(BUTTE, [300, 352, 412, 480, 560, 640, 720], 140, 1.1, 0.55, [ROCK]).map((s, i, a) => ({ ...s, at: [34 + (i / a.length) * 16, 40 + (i / a.length) * 16] as [number, number] })),
  ...seq([st([[-40, 258], [40, 250], [120, 246], [200, 262]], 1, 181, 0.55), st(FAR1, 1.2, 182, 0.7), st(FAR2, 1.1, 183, 0.65), st(TRAIL, 1, 184, 0.55, 1.2),
    st([[1446, 594], [1500, 600]], 0.7, 185, 0.4), st([[1392, 662], [1440, 668]], 0.7, 186, 0.4)], 40, 56),
  // the rock's planes: the edges where its faces turn away from him, then the cracks
  ...seq([st(ROCK_E1, 1.6, 170, 0.8), st(ROCK_E2, 1.6, 171, 0.8), st([[520, 362], [510, 392], [492, 420]], 1.2, 172, 0.7), st([[790, 392], [786, 420], [792, 450]], 1.2, 173, 0.7)], 38, 50, 0.35, [PILOT]),
  ...seq([[[486, 372], [490, 420], [482, 470]], [[872, 440], [866, 500], [880, 560]], [[900, 600], [892, 660], [902, 730]], [[90, 224], [96, 300], [88, 380], [96, 440]], [[160, 228], [166, 320]]].map((c, i) => st(c as P[], 1, 190 + i, 0.55, 0.9)), 50, 64, 0.35, [PILOT]),
  // 4. the pilot's details: facets of the glass, the knee, the joints
  ...seq([
    st([[666, 440], [640, 430], [606, 426], [578, 432]], 0.8, 60, 0.4), st([[651, 466], [650, 490], [651, 512]], 0.8, 62, 0.45), st([[625, 468], [628, 490], [634, 506]], 0.8, 63, 0.4),
    st([[646, 548], [612, 556], [580, 562]], 0.9, 64, 0.55), st([[650, 550], [644, 590], [642, 630], [646, 664]], 0.8, 65, 0.4), st([[588, 602], [614, 614], [648, 604]], 0.8, 66, 0.45), st([[648, 566], [676, 580], [704, 574]], 1, 67, 0.6), st([RA_R[0], [704, 574], [701, 584]], 1.4, 59, 0.8),
    st([[781, 610], [786, 620], [794, 624]], 0.8, 68, 0.55), st([[700, 684], [740, 650], [772, 622]], 0.7, 69, 0.35), st([[866, 737], [872, 748], [868, 762]], 0.8, 70, 0.5), st([[722, 436], [730, 390], [737, 340]], 0.7, 71, 0.4),
    ...HAND_UP_DETAIL.map((d, i) => st(d, 0.8, 72 + i, 0.75, 0.2)),
    // the thickness of the glass: a second faint line just inside the outer contours
    st(off(HEAD_BACK, HEAD_BACK.map(() => 4.5), 1).slice(2, -2), 0.7, 76, 0.35), st(off(RA_R, RA_R.map(() => 4), -1).slice(1, -1), 0.7, 77, 0.35), st(off(THIGH_T, THIGH_T.map(() => 4), 1), 0.7, 78, 0.35), st(off(SHIN_F, SHIN_F.map(() => 4), 1), 0.7, 79, 0.35), st([[536, 624], [548, 580]], 0.7, 75, 0.35),
  ], 50, 72),
  // hatching on the shade side of the rocks, away from him
  ...seq([...hatch(BUTTE, 400, 420, 12), ...hatch(ROCK, 460, 300, 13)], 58, 80),
  // 5. the ground, the grass, the specimen, the stars
  ...seq([st([[-40, 810], [200, 806], [420, 812]], 0.8, 500, 0.4, 1), st([[980, 800], [1200, 795], [1380, 800]], 0.8, 501, 0.4, 1), st([[640, 860], [900, 852], [1180, 858]], 0.8, 502, 0.35, 1),
    ...tuft(330, 776, 34, 510), ...tuft(930, 774, 28, 520), ...tuft(1120, 760, 22, 530), ...tuft(250, 782, 26, 540), ...PEBBLES], 66, 86),
  ...seq(SPRIG, 70, 90),
  ...seq(STILL.map((s, i) => st([[s.x, s.y], [s.x + 0.8, s.y + 0.6]], 0.9 + s.m * 3, 900 + i, 0.55 + s.m * 0.4, 0)), 72, 92, 0.6),
  // 6. the drafting, last: the ruled line from his finger to the star, the ring, the leader to the torches, the title rules
  ...seq([...dashes([773, 214], [790, 144], 4, 950), ring(RINGED, 22, 960), st([[RINGED[0] + 26, RINGED[1] - 4], [830, 110]], 0.8, 961, 0.7, 0),
    st([[1300, 506], [1356, 628]], 0.8, 962, 0.7, 0), st([[1352, 630], [1358, 632]], 2, 963, 0.9, 0),
    st([[44, 874], [560, 874]], 1.4, 964, 0.85, 0.1), st([[44, 882], [560, 882]], 0.6, 965, 0.6, 0.1)], 84, 100),
  // dark accents: the crevices behind him, in the deep blue
  ...seq([st([[548, 372], [560, 420], [552, 470]], 2.2, 980, 0.6), st([[330, 700], [360, 740], [350, 770]], 2.2, 981, 0.6), st([[900, 470], [890, 530]], 2, 982, 0.55), st([[660, 780], [760, 778], [840, 790]], 2.8, 983, 0.55)].map((s) => ({ ...s, color: DEEP })), 94, 101, 0.35, [PILOT]),
];

// ---------------------------------------------------------------- the washes
const washes: Wash[] = [
  // night: deep at the zenith, lifting toward the horizon; a pale band of stars across it
  { pts: [[-40, -40], [1640, -40], [1640, 330], [1400, 300], [1150, 250], [900, 214], [650, 176], [400, 150], [150, 138], [-40, 140]], color: DEEP, alpha: 0.46, seed: 700, pool: 0.1, at: [44, 70], from: [760, 300], clip: SKY },
  { pts: [[-40, -40], [1640, -40], [1640, 110], [1100, 70], [600, 40], [-40, 30]], color: DEEP, alpha: 0.3, seed: 701, pool: 0.1, at: [46, 72], from: [760, 300], clip: SKY },
  { pts: PLAIN, color: DEEP, alpha: 0.32, seed: 703, pool: 0.4, at: [48, 72], from: [1300, 640] },
  { pts: [...FAR1, [1210, 582], [936, 582]], color: DEEP, alpha: 0.4, seed: 704, at: [50, 72] }, { pts: [...FAR2, [1566, 582], [1370, 582]], color: DEEP, alpha: 0.35, seed: 705, at: [50, 72] },
  // the rocks: the butte darkest (farthest from him), the boulder around his outline, the ground
  { pts: BUTTE, color: DEEP, alpha: 0.66, seed: 710, pool: 0.5, at: [52, 80], from: [320, 500], ph: 1, hide: [ROCK] },
  { pts: [...ROCK], color: DEEP, alpha: 0.6, seed: 711, pool: 0.5, at: [54, 82], from: [640, 520], ph: 1, hide: [PILOT] },
  { pts: GROUND, color: DEEP, alpha: 0.42, seed: 712, pool: 0.3, at: [56, 84], from: [700, 780], ph: 1, hide: [PILOT] },
  // his body: smoked glass, the rock dimly through it; pale planes where his own light catches the facets
  { pts: PILOT, color: DEEP, alpha: 0.32, seed: 720, pool: 0.2, at: [62, 86], from: [640, 460], ph: 2 },
  { pts: [[648, 450], [670, 452], [666, 466], [672, 480], [670, 494], [662, 506], [652, 516], [650, 490]], color: PALE, alpha: 0.32, seed: 721, pool: 0, at: [66, 88], from: [640, 460], ph: 2 },
  { pts: [[596, 376], [620, 366], [644, 372], [660, 394], [666, 420], [652, 400], [634, 384], [612, 380]], color: PALE, alpha: 0.5, seed: 719, pool: 0, at: [66, 88], from: [640, 460], ph: 2 },
  { pts: [[612, 556], [648, 548], [676, 560], [670, 610], [646, 630], [606, 610]], color: PALE, alpha: 0.2, seed: 722, pool: 0, at: [68, 90], from: [640, 700], ph: 2 },
  { pts: [RA_L[2], RA_L[3], RA_L[4], RA_L[5], RA[5], RA[4], RA[3], RA[2]], color: PALE, alpha: 0.24, seed: 723, pool: 0, at: [68, 90], from: [640, 460], ph: 2 },
  { pts: [[672, 718], [720, 668], [765, 622], [782, 606], [792, 614], [744, 668], [700, 716]], color: PALE, alpha: 0.26, seed: 724, pool: 0, at: [70, 90], from: [640, 700], ph: 2 },
  { pts: [[610, 650], [640, 660], [664, 650], [666, 700], [600, 700], [596, 668]], color: PALE, alpha: 0.2, seed: 725, pool: 0, at: [70, 92], from: WOUND, ph: 2 },
  { pts: [NF_T[0], NF_T[1], NF_T[2], NF[2], NF[1], NF[0]], color: PALE, alpha: 0.3, seed: 727, pool: 0, at: [70, 92], from: WOUND, ph: 2 },
  { pts: [...SHIN_F, ...rev(off(SHIN_F, SHIN_F.map(() => 12), 1))], color: PALE, alpha: 0.2, seed: 728, pool: 0, at: [72, 92], from: WOUND, ph: 2 },
  { pts: [...FTHIGH_T2, ...FSHIN_T.slice(1), ...rev([...FTHIGH_T2, ...FSHIN_T.slice(1)]).map(([x, y]) => [x, y + 10] as P)], color: PALE, alpha: 0.18, seed: 729, pool: 0, at: [72, 92], from: WOUND, ph: 2 },
  { pts: [[692, 730], [770, 734], [770, 766], [700, 772]], color: DEEP, alpha: 0.3, seed: 726, pool: 0.6, at: [72, 92], from: [760, 760], ph: 3 }, // under the raised knee
  // his light on the rock behind him and the ground around him
  // darks: the shade under the butte's cap, the far side of the boulder, contact shadows
  { pts: [[-40, 238], [40, 228], [120, 223], [196, 230], [200, 262], [120, 246], [40, 250], [-40, 258]], color: DEEP, alpha: 0.5, seed: 740, at: [80, 98], ph: 3 },
  { pts: [...ROCK.slice(0, 8), ...ROCK_E1.slice(1)], color: DEEP, alpha: 0.38, seed: 741, pool: 0.6, at: [80, 98], from: [300, 600], ph: 3 },
  { pts: [...ROCK.slice(16), ...rev(ROCK_E2)], color: DEEP, alpha: 0.34, seed: 743, pool: 0.6, at: [80, 98], from: [950, 600], ph: 3 },
  { pts: [[620, 780], [700, 776], [800, 780], [880, 790], [1030, 796], [880, 798], [700, 790]], color: DEEP, alpha: 0.45, seed: 742, pool: 0.5, at: [84, 100], from: [760, 790], ph: 3, hide: [PILOT] },
];

// ---------------------------------------------------------------- what moves
const MOTES = (() => { const r = rng(8181); return Array.from({ length: 16 }, (_, i) => ({ x: 580 + r() * 140, y: 480 + r() * 250, rise: 220 + r() * 220, k: 1 + (i % 3 === 0 ? 1 : 0), ph: r(), sw: 6 + r() * 12, s: 0.8 + r() })); })();
const almond = (e: { c: P; w: number; h: number; rot: number }, k = 1): P[] => Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2, x = Math.cos(a) * e.w * k, y = Math.sin(a) * e.h * k * (1 - 0.35 * Math.cos(a)) * (a < Math.PI ? 1 : 0.8);
  return [e.c[0] + x * Math.cos(e.rot) - y * Math.sin(e.rot), e.c[1] + x * Math.sin(e.rot) + y * Math.cos(e.rot)] as P;
});
const LABELS: [string, number, number, number, number][] = [["ORIGINE", 836, 94, 30, 1000], ["CALLAHAN", 1180, 462, 30, 1010], ["FIG. 7 - LE PILOTE", 44, 828, 34, 1020]];
const labels = (g: Gfx, env: Env, reveal: number) => {
  const draw = (gg: Gfx) => LABELS.forEach(([t, x, y, cap, seed]) => letter(gg, t, x, y, { cap, seed, color: INK, w: 3.2, progress: reveal, opacity: 0.92 }));
  if (reveal <= 0) return;
  if (reveal < 1) return g.group("plain", () => draw(g));
  const k = `p07:labels:${env.scale}`; let L = env.cache.get(k) as Layer | undefined;
  if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); draw(new Gfx(L.ctx, env, 0, INK_M)); env.cache.set(k, L); }
  const LL = L;
  g.group("plain", () => { g.cur.drawImage(LL.canvas, 0, 0, W, H); g.touch(0, 0, W, H); });
};

export const p07 = page({
  id: "p07", title: "Le Pilote", draw: DRAW, loop: LOOP, paper: CYAN.paper, ink: INK, strokes, washes,
  spatter: { n: 12, seed: 1990, at: 99, box: [80, 790, 1380, 890] },
  animAt: [60, 98],
  anim: (g, t, reveal, env) => {
    const T = (t / LOOP) * Math.PI * 2, breath = 0.5 - 0.5 * Math.cos(T * 2), eyes = 0.5 + 0.5 * Math.sin(T);
    const pen = (pts: P[], w: number, seed: number, op = 0.9, progress = reveal, color = INK) => g.pen(pts, { w, color, seed, wobble: 0.5, boil: 0, taper: 1, opacity: op, retrace: false, progress });
    // his light: on the rock behind him, then the wound, then the eyes
    g.group("plain", () => {
      g.glow(632, 500, 110, MID, reveal * (0.2 + 0.06 * eyes));
      clipped(g, ROCK, () => g.glow(630, 470, 230, MID, reveal * (0.42 + 0.1 * eyes)));
      const c = g.cur; c.save(); c.translate(700, 786); c.scale(1, 0.2); g.glow(0, 0, 230, MID, reveal * (0.5 + 0.12 * breath)); c.restore(); g.touch(250, 690, 1150, 880);
      g.glow(WOUND[0], WOUND[1], 56, PALE, reveal * (0.3 + 0.32 * breath));
      g.glow(640, 458, 70, PALE, reveal * (0.22 + 0.14 * eyes));
    }, { blend: "screen" });
    // the hand pressed on the wound: a dark glass hand, light leaking out between the fingers
    g.group("plain", () => {
      fillShape(g, HAND_N, DEEP, 0.16 * reveal);
      FINGERS.forEach((f, i) => { const s = finger(f, i); fillShape(g, s, DEEP, 0.4 * reveal); pen(s, 0.9, 90 + i, 0.9); });
      pen([NF_T[2], [610, 692], [617, 689]], 1.2, 95, 0.9); pen([NF_B[2], [612, 718], [620, 719]], 1.2, 96, 0.9); pen([[606, 712], [620, 726], [636, 730], [646, 727]], 1.2, 97, 0.85);
    });
    g.group("plain", () => SLITS.forEach((sl, i) => {
      const a = reveal * (0.45 + 0.5 * breath), e = sl[3], d = [sl[3][0] - sl[2][0], sl[3][1] - sl[2][1]], l = Math.hypot(d[0], d[1]), ray = 10 + 14 * breath + i * 3;
      pen(sl, 2.2, 97 + i, a, reveal, GLOW);
      pen([e, [e[0] + (d[0] / l) * ray * 0.5, e[1] + (d[1] / l) * ray * 0.5], [e[0] + (d[0] / l) * ray, e[1] + (d[1] / l) * ray]], 1, 100 + i, a * 0.7, reveal, GLOW);
    }), { blend: "screen" });
    // the eyes: almonds of light, the near one wide, the far one foreshortened at the edge of the face
    g.group("plain", () => { [EYE_N, EYE_F].forEach((e, i) => g.glow(e.c[0], e.c[1], i ? 9 : 14, GLOW, reveal * (0.55 + 0.35 * eyes))); }, { blend: "screen" });
    g.group("plain", () => { [EYE_N, EYE_F].forEach((e) => { fillShape(g, almond(e, 1.25), PALE, reveal * 0.45); fillShape(g, almond(e), "#ffffff", reveal * (0.8 + 0.2 * eyes)); }); });
    // the near shoulder, rising with the breath
    const LIFT = [0, 0.6, 1, 0.5];
    g.group("plain", () => pen(SHOULDER_N.map(([x, y], i) => [x, y - breath * 2.6 * LIFT[i]] as P), 2, 80, 0.95));
    // motes of his light, drifting up off him
    if (reveal >= 1) g.group("plain", () => MOTES.forEach((m, i) => {
      const f = ((t / LOOP) * m.k + m.ph) % 1, a = Math.sin(Math.PI * f) ** 1.5, x = m.x + Math.sin(f * Math.PI * 2 + i) * m.sw, y = m.y - f * m.rise;
      g.glow(x, y, 5 * m.s, PALE, a * 0.5); fillShape(g, blob(x, y, 1.3 * m.s, 1.3 * m.s, 8200 + i, 0.1, 6), GLOW, a * 0.9);
    }), { blend: "screen" });
    // stars twinkling, and the gang's torches far down the trail
    g.group("plain", () => {
      TWINKLE.forEach((s, i) => { const a = reveal * (0.45 + 0.55 * Math.sin(T * (2 + (i % 4)) + i * 1.7) ** 2), l = 3 + s.m * 7; fillShape(g, [[s.x, s.y - l], [s.x + 0.9, s.y - 0.9], [s.x + l, s.y], [s.x + 0.9, s.y + 0.9], [s.x, s.y + l], [s.x - 0.9, s.y + 0.9], [s.x - l, s.y], [s.x - 0.9, s.y - 0.9]], GLOW, a); });
      fillShape(g, [[RINGED[0], RINGED[1] - 11], [RINGED[0] + 1.3, RINGED[1] - 1.3], [RINGED[0] + 11, RINGED[1]], [RINGED[0] + 1.3, RINGED[1] + 1.3], [RINGED[0], RINGED[1] + 11], [RINGED[0] - 1.3, RINGED[1] + 1.3], [RINGED[0] - 11, RINGED[1]], [RINGED[0] - 1.3, RINGED[1] - 1.3]], "#ffffff", reveal * (0.8 + 0.2 * eyes));
      g.glow(RINGED[0], RINGED[1], 12, GLOW, reveal * (0.3 + 0.2 * eyes));
      TORCHES.forEach(([x, y], i) => { const a = reveal * (0.62 + 0.22 * Math.sin(T * 13 + i * 2.1) + 0.14 * Math.sin(T * 29 + i * 4.3)); g.glow(x, y - 2, 7, GLOW, a * 0.7); fillShape(g, blob(x, y - 2, 1.7, 2.2, 8300 + i, 0.1, 6), "#ffffff", a); });
    }, { blend: "screen" });
    labels(g, env, Math.min(1, Math.max(0, (reveal - 0.55) / 0.45))); // the lettering goes in last, with the rules
  },
});

