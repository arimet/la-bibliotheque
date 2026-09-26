// LES GRANDS BOIS PAGE 8 · LA CABANE. One idea: a kind old woman serves you soup, and on every nail
// of her walls hangs a child's thing: dozens of them, and Tom's red cap on the one nearest the door.
// Coloured pencil, lamplight. A log hut: the back wall of logs, a small window on the night, the
// door on the right. A lantern hangs over the table. The Lady of the Wood, headscarf, apron, red
// hands, leans over the table and ladles soup into the bowl in front of the child, who sits at the
// end on a bench. Caps, mittens, scarves, a small shoe, each on its nail; the red cap by the door.
// What moves: steam off the soup, the lantern's flame, the ladle tipping.
import { oval, rng, sample, turn, type P } from "./core";
import { dense, figure, overlapping, type Motif } from "./figures";
import { blob, bounds, mix } from "./gallery";
import { fromMotif, live, pencilLive, sketch, tint, type Shape } from "./pencil";

const LOOP = 180;
type Line = { pts: P[]; w: number; color: string; alpha: number };

// ---------------------------------------------------------------- helpers
// legs bent at hip and knee (degrees; + folds the lower leg back, - brings the thigh forward)
const bend = (m: Motif, x: number, g: number, h: number, f: 1 | -1, hipDeg: number, kneeDeg: number): Motif => {
  const Hp: P = [x, g - 0.42 * h], K: P = [x, g - 0.2 * h];
  const map = (p: P): P => { let q = p; if (p[1] > K[1]) q = turn([q], K[0], K[1], kneeDeg * f)[0]; if (p[1] > Hp[1]) q = turn([q], Hp[0], Hp[1], hipDeg * f)[0]; return q; };
  const closed = (q: P[]) => dense([...q, q[0]], 5).slice(0, -1).map(map);
  return { fills: m.fills.map((fl) => ({ ...fl, pts: closed(fl.pts) })), lines: [], parts: m.parts.map(closed) };
};
const LAMP: P = [860, 262]; // the lantern: everything is lit from here
const lit = (k: number) => (x: number, y: number) => Math.hypot((x - LAMP[0]) * 0.8, y - LAMP[1]) > k;

// ---------------------------------------------------------------- the hut
const WALL: P[] = [[0, 0], [1600, 0], [1600, 660], [0, 660]];
const LOGS: P[][] = Array.from({ length: 12 }, (_, i) => { const y = 36 + i * 54, q = rng(20 + i); return [[-20, y + 4], [400, y + (q() - 0.5) * 6], [900, y + (q() - 0.5) * 6], [1620, y + 3], [1620, y + 50], [900, y + 50 + (q() - 0.5) * 5], [400, y + 49], [-20, y + 50]] as P[]; });
const BEAM: P[] = [[0, 0], [1600, 0], [1600, 44], [0, 50]];
const FLOOR: P[] = [[0, 640], [1600, 640], [1600, 900], [0, 900]];
const planks: Line[] = Array.from({ length: 11 }, (_, i) => { const x = -300 + i * 220; return { pts: [[800 + (x - 800) * 0.45, 642], [x, 900]] as P[], w: 1.4, color: "#3a2616", alpha: 0.6 }; });
const WINDOW: P[] = [[120, 190], [270, 190], [270, 340], [120, 340]];
const WIN_FRAME: Line[] = [{ pts: dense([[120, 190], [270, 190], [270, 340], [120, 340], [120, 190]], 8), w: 5, color: "#4a3020", alpha: 0.9 }, { pts: [[195, 190], [195, 340]], w: 4, color: "#4a3020", alpha: 0.9 }, { pts: [[120, 265], [270, 265]], w: 4, color: "#4a3020", alpha: 0.9 }];
const DOOR: P[] = [[1350, 170], [1545, 170], [1545, 650], [1350, 650]];
const doorPlanks: Line[] = [1398, 1446, 1494].map((x) => ({ pts: [[x, 176], [x + 1, 644]] as P[], w: 1.6, color: "#2a1a10", alpha: 0.7 }));
const LATCH: P[] = [[1362, 420], [1410, 420], [1410, 432], [1362, 432]];
// ---------------------------------------------------------------- the table and the bench
const TOP: P[] = [[380, 604], [1010, 604], [1044, 652], [346, 652]];
const APRON: P[] = [[346, 652], [1044, 652], [1044, 684], [346, 684]];
const LEGS: P[][] = [[[366, 684], [390, 684], [388, 886], [370, 886]], [[1004, 684], [1028, 684], [1026, 886], [1008, 886]]];
const BACK_LEGS: P[][] = [[[400, 604], [418, 604], [418, 846], [402, 846]], [[984, 604], [1000, 604], [1000, 846], [986, 846]]];
const BENCH: P[] = [[1060, 742], [1250, 742], [1250, 766], [1060, 766]];
const BENCH_LEGS: P[][] = [[[1072, 766], [1090, 766], [1090, 880], [1074, 880]], [[1222, 766], [1240, 766], [1238, 880], [1222, 880]]];
const POT: P[] = sample([[478, 612], [482, 560], [600, 560], [604, 612], [586, 634], [496, 634]], true, 4);
const POT_RIM: P[] = oval(541, 560, 64, 10, 16);
const SOUP_IN_POT: P[] = oval(541, 561, 56, 7, 14);
const BOWL: P[] = sample([[884, 606], [996, 606], [982, 630], [940, 640], [898, 630]], true, 4);
const SOUP: P[] = oval(940, 607, 54, 7, 14);
const SPOON: Line = { pts: [[966, 634], [922, 628], [912, 626]], w: 3, color: "#8a8a8a", alpha: 0.9 };
// the lantern, on its chain from the beam
const CHAIN: Line = { pts: [[860, 44], [858, 120], [860, 200]], w: 1.6, color: "#2a2a2a", alpha: 0.9 };
const LANTERN: P[] = [[826, 210], [894, 210], [902, 312], [818, 312]];
const GLASS: P[] = [[836, 222], [884, 222], [890, 300], [830, 300]];
const LAN_TOP: P[] = [[818, 212], [860, 186], [902, 212]];
const LAN_BASE: P[] = [[814, 312], [906, 312], [900, 324], [820, 324]];

// ---------------------------------------------------------------- the children's things, each on its nail
type Thing = { shapes: Shape[]; lines: Line[] };
const COLS = ["#4a6aa8", "#6a9a4a", "#c8963a", "#a84a4a", "#5a5a9a", "#d0a860", "#8a4a8a", "#3a8a8a", "#c86a3a", "#e0d4b8", "#7a8a9a"];
const worn = (c: string, k: number) => mix(c, "#9a8a70", k);
const sh = (pts: P[], c: string, gap = 3.2): Shape => ({ pts, layers: tint(pts, c, { gap, seed: Math.round(pts[0][0]) }), outline: { color: mix(c, "#2a2238", 0.55), w: 1.3 } });
const K = 1.35; // the things' size
const cap = (x: number, y: number, c: string): Thing => { const Q = (u: number, v: number): P => [x + u * K, y + v * K]; const dome = sample([Q(-20, 36), Q(-18, 16), Q(-6, 4), Q(6, 4), Q(18, 16), Q(20, 36)], true, 3), band = [Q(-22, 30), Q(22, 30), Q(22, 42), Q(-22, 42)], pom = oval(Q(0, 2)[0], Q(0, 2)[1], 6 * K, 5 * K, 8); return { shapes: [sh(pom, mix(c, "#f0e8d8", 0.3)), sh(dome, c), sh(band, mix(c, "#f0e8d8", 0.4))], lines: [] }; };
const mitten = (x: number, y: number, c: string): Thing => { const Q = (u: number, v: number): P => [x + u * K, y + v * K]; const m = sample([Q(-12, 10), Q(12, 10), Q(14, 40), Q(6, 54), Q(-8, 54), Q(-14, 42)], true, 3), th = sample([Q(12, 22), Q(22, 28), Q(20, 38), Q(12, 36)], true, 3), cuff = [Q(-13, 8), Q(13, 8), Q(13, 17), Q(-13, 17)]; return { shapes: [sh(th, c), sh(m, c), sh(cuff, mix(c, "#f0e8d8", 0.4))], lines: [{ pts: [[x, y], Q(-2, 8)], w: 1.3, color: "#3a2a20", alpha: 0.85 }] }; };
const scarf = (x: number, y: number, c: string, c2: string): Thing => {
  const Q = (u: number, v: number): P => [x + u * K, y + v * K];
  const short = [Q(-13, 0), Q(1, 0), Q(-1, 64), Q(-15, 60)], long = [Q(-1, 0), Q(13, 0), Q(16, 96), Q(2, 100)];
  const stripes = (a: P, b: P, n: number, dy: number): Line[] => Array.from({ length: n }, (_, i) => ({ pts: [[a[0], a[1] + (i + 1) * dy], [b[0], b[1] + (i + 1) * dy + 1]] as P[], w: 3.4, color: c2, alpha: 0.85 }));
  const fringe = (x0: number, y0: number): Line[] => [-5, 0, 5].map((d) => ({ pts: [[x0 + d * K, y0], [x0 + d * K + 1, y0 + 10 * K]] as P[], w: 1.3, color: c, alpha: 0.85 }));
  return { shapes: [sh(short, mix(c, "#2a2238", 0.12)), sh(long, c)], lines: [...stripes(Q(-14, 0), Q(0, 0), 2, 20 * K), ...stripes(Q(0, 0), Q(15, 0), 3, 24 * K), ...fringe(x - 8 * K, y + 61 * K), ...fringe(x + 9 * K, y + 99 * K)] };
};
const shoe = (x: number, y: number, c: string): Thing => { const Q = (u: number, v: number): P => [x + u * K, y + v * K]; const s = sample([Q(-22, 44), Q(-20, 26), Q(-2, 24), Q(12, 32), Q(26, 38), Q(26, 48), Q(-22, 48)], true, 3); return { shapes: [sh(s, c, 3)], lines: [{ pts: [[x, y], Q(-8, 26)], w: 1.4, color: "#3a2a20", alpha: 0.85 }, { pts: [Q(-22, 50), Q(26, 50)], w: 2.6, color: "#2a1a10", alpha: 0.85 }] }; };
const nail = (x: number, y: number): Line => ({ pts: [[x - 2, y], [x + 2, y + 1]], w: 3.4, color: "#1a1410", alpha: 0.95 });
const THINGS: Thing[] = [], NAILS: Line[] = [];
{
  const q = rng(808); let n = 0;
  for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) {
    const x = 60 + col * 106 + (row % 2) * 52 + (q() - 0.5) * 34, y = 84 + row * 118 + (q() - 0.5) * 26;
    if (x > 1280 || (x > 80 && x < 310 && y > 140 && y < 370) || (x > 770 && x < 960 && y < 360)) continue;
    const c = worn(COLS[Math.floor(q() * COLS.length)], 0.1 + q() * 0.3), k = q();
    NAILS.push(nail(x, y));
    THINGS.push(n++ === 17 ? shoe(x, y, "#7a4a2a") : k < 0.36 ? cap(x, y, c) : k < 0.64 ? mitten(x, y, c) : k < 0.9 ? scarf(x, y, c, worn(COLS[Math.floor(q() * COLS.length)], 0.2)) : shoe(x, y, mix(c, "#5a3a22", 0.5)));
  }
}
// Tom's red cap, bright, on the nail nearest the door
const RED_CAP = cap(1306, 262, "#c8322a"); NAILS.push(nail(1306, 262));

// ---------------------------------------------------------------- the Lady of the Wood
const LH = 600, LX = 560, LG = 884;
const LADY = figure({ x: LX, g: LG, h: LH, f: 1, robe: "long", head: "veil", cloth: "#3a3040", cloth2: "#6a4a4a", ink: "#000", near: [0.95, 1.15], far: [0.35, 0.9] });
const LS = (u: number, v: number): P => [LX + u * LH, LG - v * LH];
const APRON_: P[] = sample([LS(-0.01, 0.68), LS(0.05, 0.68), LS(0.06, 0.56), LS(0.1, 0.4), LS(0.0, 0.4), LS(-0.005, 0.56)], true, 3);
const APRON_TIES: Line[] = [{ pts: [LS(-0.005, 0.68), LS(-0.03, 0.76), LS(-0.02, 0.8)], w: 1.6, color: "#8a7a5a", alpha: 0.9 }, { pts: [LS(-0.06, 0.56), LS(0.07, 0.565)], w: 2.4, color: "#8a7a5a", alpha: 0.9 }];
// a figure's colour pressed harder: dark cloth wants the strokes closer
const firm = (sh: Shape[], k: number): Shape[] => sh.map((s) => ({ ...s, layers: s.layers.map((L) => ({ ...L, gap: L.gap * k })) }));
const EYES: P[][] = [oval(LS(0.041, 0.922)[0], LS(0.041, 0.922)[1], 4, 3.4, 8)];
const CHEEK: P[] = oval(LS(0.03, 0.892)[0], LS(0.03, 0.892)[1], 11, 7, 10);
const HANDS: P[][] = [LADY.hands.near, LADY.hands.far].map(([x, y]) => oval(x, y, 0.026 * LH, 0.028 * LH, 10));
const ladyFace: Line[] = [
  { pts: [LS(0.03, 0.93), LS(0.04, 0.925), LS(0.05, 0.93)], w: 2.6, color: "#2a1a14", alpha: 0.95 },
  { pts: [LS(0.03, 0.944), LS(0.052, 0.946)], w: 2.4, color: "#7a7070", alpha: 0.9 }, // grey brows
  { pts: [LS(0.062, 0.93), LS(0.08, 0.898), LS(0.064, 0.892)], w: 2.4, color: "#6a4a3a", alpha: 0.95 },
  { pts: [LS(0.036, 0.88), LS(0.05, 0.872), LS(0.064, 0.88)], w: 2.2, color: "#7a3a30", alpha: 0.85 }, // she smiles
  { pts: [LS(0.02, 0.91), LS(0.026, 0.9), LS(0.024, 0.89)], w: 1.1, color: "#8a6a5a", alpha: 0.7 }, // lines of the face
  { pts: [LS(0.05, 0.915), LS(0.058, 0.906)], w: 1.1, color: "#8a6a5a", alpha: 0.6 },
  { pts: [LS(0.022, 0.87), LS(0.034, 0.862)], w: 1.1, color: "#8a6a5a", alpha: 0.6 },
  { pts: [LS(-0.01, 0.97), LS(0.02, 0.958), LS(0.05, 0.965)], w: 1.4, color: "#c8c0b0", alpha: 0.9 }, // grey hair under the scarf
];
// ---------------------------------------------------------------- the child, sitting at the end of the table
const KH = 470, KX = 1130, KG = 880 - 0.3 * KH + 0.42 * KH; // the hip on the bench
const KID = bend(figure({ x: KX, g: KG, h: KH, f: -1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.9, 1.62], far: [0.7, 1.4] }).m, KX, KG, KH, -1, -90, 90);
const KS = (u: number, v: number): P => [KX - u * KH, KG - v * KH];
const kidFace: Line[] = [
  { pts: [KS(0.03, 0.925), KS(0.046, 0.922)], w: 2.8, color: "#2a1a14", alpha: 0.9 }, // eyes lifted to the wall
  { pts: [KS(0.064, 0.925), KS(0.074, 0.901), KS(0.062, 0.898)], w: 1.5, color: "#6a4a3a", alpha: 0.8 },
  { pts: [KS(0.03, 0.948), KS(0.056, 0.95)], w: 1.4, color: "#3a2618", alpha: 0.7 },
];
const CORD: Line = { pts: [KS(-0.04, 0.83), KS(-0.02, 0.77), KS(0.01, 0.74)], w: 1.1, color: "#6a5a4a", alpha: 0.8 };
const WHISTLE: P[] = [KS(0.0, 0.748), KS(0.018, 0.742), KS(0.02, 0.7), KS(0.004, 0.702)];

// ---------------------------------------------------------------- the page, back to front
const WOOD = "#8a5a32";
const shapes: Shape[] = [
  { pts: WALL, layers: [{ color: "#5a3a22", angle: 1.3, gap: 6, w: 2, alpha: 0.6 }], outline: false },
  ...LOGS.map((p, i) => { const y0 = bounds(p).y0; return { pts: p, layers: [
    { color: mix(WOOD, "#b07038", (i % 3) * 0.2), angle: 0.08, gap: 4.5, w: 2.1, alpha: 0.75 },
    { color: "#e0a050", angle: 0.9, gap: 5, w: 2, alpha: 0.5, keep: (x: number, y: number) => !lit(360)(x, y) && y < y0 + 30 }, // the lamp's light on the round of the log
    { color: "#3e2616", angle: -0.25, gap: 5, w: 1.8, alpha: 0.6, keep: (_x: number, y: number) => y > y0 + 30 },                  // its underside
    { color: "#2a1a18", angle: 1.1, gap: 5, w: 1.8, alpha: 0.6, keep: lit(520) }, { color: "#2a1a24", angle: -0.9, gap: 6, w: 1.8, alpha: 0.5, keep: lit(760) }], outline: { color: "#2a1a10", w: 1.6 } }; }),
  { pts: BEAM, layers: tint(BEAM, "#4a3020", { angle: 0.1, gap: 4 }), outline: { color: "#2a1a10" } },
  { pts: WINDOW, layers: [{ color: "#1e2a4a", angle: 0.4, gap: 4, w: 2.2, alpha: 0.9 }, { color: "#4a3a6a", angle: -0.6, gap: 6, w: 2, alpha: 0.6 }], outline: false },
  { pts: DOOR, layers: [{ color: "#6a4228", angle: 1.5, gap: 4.5, w: 2.2, alpha: 0.8 }, { color: "#2e1e14", angle: 0.6, gap: 6, w: 1.8, alpha: 0.6 }], outline: { color: "#2a1a10", w: 2 } },
  { pts: LATCH, layers: [{ color: "#2a2a2a", angle: 0.2, gap: 3, w: 2, alpha: 0.9 }], outline: false },
  ...THINGS.flatMap((t) => t.shapes), ...RED_CAP.shapes.map((s, i) => ({ ...s, layers: [{ color: i === 2 ? "#a82a22" : "#c8322a", angle: 0.9, gap: 3, w: 2.2, alpha: 0.95 }, { color: "#7a1a14", angle: -0.4, gap: 4.5, w: 1.8, alpha: 0.6, keep: (_x: number, y: number) => y > 290 }] })),
  { pts: FLOOR, layers: [{ color: "#6a4228", angle: 0.08, gap: 5, w: 2.2, alpha: 0.75 }, { color: "#2e1e14", angle: 1.2, gap: 6, w: 1.8, alpha: 0.55, keep: lit(560) }], outline: false },
  ...BACK_LEGS.map((p) => ({ pts: p, layers: tint(p, "#5a3a22", { angle: 1.5, gap: 4 }), outline: { color: "#2a1a10" } })),
  ...firm(fromMotif(LADY.m), 0.65), { pts: CHEEK, layers: [{ color: "#d8806a", angle: 0.5, gap: 3, w: 1.8, alpha: 0.6 }], outline: false }, ...EYES.map((p) => ({ pts: p, layers: [{ color: "#1a1410", angle: 0.3, gap: 2, w: 1.6, alpha: 0.95 }], outline: { color: "#1a1410", w: 1.2 } })), { pts: APRON_, layers: tint(APRON_, "#c8b48a", { gap: 3.6 }), outline: { color: "#7a6a50" } },
  ...HANDS.map((p) => ({ pts: p, layers: [{ color: "#c0584a", angle: 0.9, gap: 3, w: 2, alpha: 0.9 }], outline: { color: "#7a2a20", w: 1.2 } })),
  ...BENCH_LEGS.map((p) => ({ pts: p, layers: tint(p, "#5a3a22", { angle: 1.5, gap: 4 }), outline: { color: "#2a1a10" } })),
  ...firm(fromMotif(KID), 0.8), { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.9 }], outline: { color: "#8a7a60", w: 1 } },
  { pts: BENCH, layers: tint(BENCH, "#7a4a2a", { angle: 0.1, gap: 4 }), outline: { color: "#2a1a10" } },
  { pts: TOP, layers: [{ color: "#a8743f", angle: 0.05, gap: 4.5, w: 2.2, alpha: 0.8 }, { color: "#6a4228", angle: -0.5, gap: 7, w: 1.8, alpha: 0.5 }], outline: { color: "#3a2414" } },
  { pts: APRON, layers: tint(APRON, "#5a3a22", { angle: 0.05, gap: 4 }), outline: { color: "#2a1a10" } },
  ...LEGS.map((p) => ({ pts: p, layers: tint(p, "#5a3a22", { angle: 1.5, gap: 4 }), outline: { color: "#2a1a10" } })),
  { pts: POT, layers: tint(POT, "#3a3a3e", { gap: 3.5 }), outline: { color: "#1a1a1a" } }, { pts: POT_RIM, layers: [{ color: "#2a2a2e", angle: 0.2, gap: 3, w: 1.8, alpha: 0.9 }], outline: { color: "#1a1a1a" } }, { pts: SOUP_IN_POT, layers: [{ color: "#9a8a3a", angle: 0.1, gap: 3, w: 2, alpha: 0.9 }], outline: false },
  { pts: BOWL, layers: tint(BOWL, "#c8b890", { gap: 4 }), outline: { color: "#6a5a40" } }, { pts: SOUP, layers: [{ color: "#a89a40", angle: 0.1, gap: 3, w: 2, alpha: 0.9 }, { color: "#6a7a2a", angle: 1.2, gap: 6, w: 1.6, alpha: 0.6 }], outline: { color: "#6a5a30", w: 1 } },
  { pts: LAN_TOP, layers: tint(LAN_TOP, "#2a2a2a", { gap: 3 }), outline: { color: "#1a1a1a" } },
  { pts: LANTERN, layers: [{ color: "#2a2a2a", angle: 0.3, gap: 3, w: 2, alpha: 0.9 }], outline: { color: "#1a1a1a" } },
  { pts: GLASS, layers: [{ color: "#f2c14a", angle: 0.8, gap: 4, w: 2, alpha: 0.7 }, { color: "#e8903a", angle: -0.5, gap: 6, w: 1.8, alpha: 0.5, keep: (_x, y) => y > 270 }], outline: { color: "#6a4a20", w: 1 } },
  { pts: LAN_BASE, layers: tint(LAN_BASE, "#2a2a2a", { gap: 3 }), outline: { color: "#1a1a1a" } },
];
const lampRays: Line[] = Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2 + 0.2, r0 = 70, r1 = 110 + (i % 3) * 30; return { pts: [[LAMP[0] + Math.cos(a) * r0, LAMP[1] + Math.sin(a) * r0], [LAMP[0] + Math.cos(a) * r1, LAMP[1] + Math.sin(a) * r1]] as P[], w: 1.6, color: "#e8b04a", alpha: 0.35 }; });
const logEnds: Line[] = LOGS.flatMap((p, i) => { const q = rng(60 + i), b = bounds(p); return Array.from({ length: 3 }, () => { const x = q() * 1500, y = b.y0 + 12 + q() * 28; return { pts: [[x, y], [x + 30 + q() * 60, y + (q() - 0.5) * 4]] as P[], w: 1.1, color: "#3a2414", alpha: 0.5 }; }); }); // the grain

// the wall's own strokes (grain, strings, nails) stay behind whatever stands in front of the wall
const FRONT = shapes.slice(shapes.findIndex((q) => q.pts === FLOOR)).map((q) => q.pts);
const behind = (ls: Line[]) => ls.map((l) => { const hide = overlapping(FRONT, bounds(l.pts)); return hide.length ? { ...l, hide } : l; });

// ---------------------------------------------------------------- what moves
const HAND = LADY.hands.near;
const LADLE_BOWL = (a: number): P[] => turn(sample([[HAND[0] + 118, HAND[1] + 52], [HAND[0] + 152, HAND[1] + 52], [HAND[0] + 146, HAND[1] + 70], [HAND[0] + 124, HAND[1] + 70]], true, 3), HAND[0], HAND[1], a);
const STEAM = [[916, 600], [944, 598], [968, 602], [520, 552], [560, 550]].map(([x, y], i) => ({ x, y, ph: i * 0.37, h: i < 3 ? 150 : 110 }));

export const f08 = sketch({
  id: "f08", title: "La Cabane", loop: LOOP, shapes, lines: [...planks, ...behind([...logEnds, ...WIN_FRAME, ...doorPlanks, ...THINGS.flatMap((t) => t.lines), ...NAILS]), ...APRON_TIES, ...ladyFace, ...kidFace, CORD, SPOON, CHAIN, ...lampRays],
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    live(g, () => {
      // the flame, never still
      const fl = 1 + 0.12 * Math.sin(TT * 9) + 0.06 * Math.sin(TT * 23), lean = 3 * Math.sin(TT * 5);
      pencilLive(g, [[LAMP[0] - 8, 292], [LAMP[0] - 6 + lean * 0.5, 292 - 22 * fl], [LAMP[0] + lean, 292 - 42 * fl], [LAMP[0] + 6 + lean * 0.5, 292 - 22 * fl], [LAMP[0] + 8, 292]], "#f8e08a", { angle: 1.4, gap: 2.5, seed: 30, alpha: 0.95 * reveal, outline: "#e87a2a" });
      // the ladle: she tips it over the bowl, twice a loop, and soup runs off it
      const tip = Math.max(0, Math.sin(TT * 2)) ** 2, a = 14 * tip;
      g.pen(turn([HAND, [HAND[0] + 60, HAND[1] + 18], [HAND[0] + 122, HAND[1] + 52]], HAND[0], HAND[1], a), { w: 3.2, color: "#6a6a6a", seed: 40, wobble: 0.3, boil: 0, taper: 1, opacity: 0.9 * reveal, retrace: false });
      pencilLive(g, LADLE_BOWL(a), "#7a7a7a", { angle: 0.3, gap: 3, seed: 41, alpha: 0.9 * reveal, outline: "#3a3a3a" });
      if (tip > 0.3) { const [lx, ly] = turn([[HAND[0] + 152, HAND[1] + 58]], HAND[0], HAND[1], a)[0]; g.pen([[lx, ly], [lx + 2, ly + 14 + 20 * tip]], { w: 3.4, color: "#a89a40", seed: 42, wobble: 0.2, boil: 0, taper: 1, opacity: 0.85 * reveal, retrace: false }); }
      // steam off the bowl and the pot, curling up and thinning out
      STEAM.forEach((s, i) => { for (let k = 0; k < 2; k++) { const p = (T * 2 + s.ph + k * 0.5) % 1, y0 = s.y - p * s.h, pts: P[] = Array.from({ length: 6 }, (_, j) => [s.x + Math.sin(p * 7 + j * 0.9 + i) * (6 + p * 14), y0 - j * 9] as P); g.pen(pts, { w: 2.2, color: "#f4efe4", seed: 50 + i * 3 + k, wobble: 0.3, boil: 0, taper: 1, opacity: Math.sin(p * Math.PI) * 0.75 * reveal, retrace: false }); } });
    });
  },
});
