// LES GRANDS BOIS PAGE 5 · LA RIVIÈRE. One idea: at nightfall a grey heron carries the child over
// the river on its back, towards a bank with a fox's den under a beech and, further on, a lit cabin.
// Coloured pencil, night falling: violet going to Prussian blue, a moon low over the trees. The river
// across the page, stones standing out of it; mid-stream the heron, knee-deep, the child astride its
// back holding on at the base of its neck. On the far bank, pebbles; on the right a big beech, a dark
// den between its roots; along the water on the left a small cabin with one window lit.
// What moves: ripples round the heron's legs, the moon's reflection breaking and mending, the heron's
// head, the reeds.
import { oval, rng, sample, turn, tube, type Gfx, type P } from "./core";
import { figure, type Figure } from "./figures";
import { blob, mix } from "./gallery";
import { fromMotif, live, prehatch, shadeSide, sketch, tint, type Hatched, type Shape } from "./pencil";

const LOOP = 180;

// ---------------------------------------------------------------- helpers
const tree = (x: number, g: number, h: number, seed: number, cols: string[]): Shape[] => {
  const q = rng(seed), trunk: P[] = [[x - h * 0.05, g], [x - h * 0.035, g - h * 0.5], [x - h * 0.02, g - h * 0.7], [x + h * 0.02, g - h * 0.7], [x + h * 0.035, g - h * 0.5], [x + h * 0.05, g]];
  const crowns = [0, 1, 2, 3].map((i) => blob(x + (q() - 0.5) * h * 0.35, g - h * (0.62 + q() * 0.3), h * (0.2 + q() * 0.1), h * (0.16 + q() * 0.08), seed + i, 0.25, 14));
  return [{ pts: trunk, layers: night(trunk, "#2a2636", { angle: 1.4 }) }, ...crowns.map((c, i) => ({ pts: c, layers: night(c, cols[i % cols.length], { angle: 0.9 + i * 0.2 }), outline: { color: "#1e1a2a" } }))];
};
const replayTurned = (g: Gfx, h: Hatched, c: P, deg: number, alpha: number) => h.strokes.forEach((m) => g.pen(turn(m.pts, c[0], c[1], deg), { w: m.w, color: m.color, seed: m.seed, wobble: 0.5, boil: 0, taper: 1, opacity: m.alpha * alpha, retrace: false }));
// night colouring: the pencil all over, a darker one crossing it all over, the darkest on the shade side
const night = (pts: P[], color: string, o: { angle?: number; gap?: number } = {}): Shape["layers"] => { const a = o.angle ?? 1.0, gp = o.gap ?? 4.5; return [{ color, angle: a, gap: gp, w: 2.2, alpha: 0.8 }, { color: mix(color, "#141428", 0.35), angle: a - 1.2, gap: gp * 1.2, w: 2, alpha: 0.6 }, { color: mix(color, "#0e0e1e", 0.55), angle: a + 0.6, gap: gp * 1.5, w: 1.8, alpha: 0.55, keep: shadeSide(pts, 0.05) }]; };
const headOf = (F: Figure, h: number, f: 1 | -1, hair: string) => {
  const [cx, cy] = F.head, rx = 0.056 * h, ry = 0.07 * h, S = (u: number, v: number): P => [cx + f * u * rx, cy + v * ry];
  const cap: P[] = [...Array.from({ length: 12 }, (_, i) => { const a = -1.05 - (i / 11) * 2.9; return S(Math.cos(a) * 1.14, Math.sin(a) * 1.12); }), S(-0.45, 0.4), S(-0.15, -0.1), S(0.2, -0.45), S(0.45, -0.7)];
  const w = Math.max(1.2, h / 200);
  return {
    shapes: [{ pts: cap, layers: tint(cap, hair, { gap: 3.5 }), outline: { color: mix(hair, "#1a1410", 0.5) } }] as Shape[],
    lines: [
      { pts: [S(0.38, -0.02), S(0.52, 0.0)], w: Math.max(2.5, h / 90), color: "#2a1a12", alpha: 0.95 },
      { pts: [S(0.93, -0.05), S(1.14, 0.2), S(0.95, 0.3)], w: w * 1.2, color: "#9a6a50", alpha: 0.9 },
      { pts: [S(0.5, 0.58), S(0.8, 0.52)], w, color: "#9a4a3a", alpha: 0.85 },
    ],
  };
};
const pen = (g: Gfx, pts: P[], w: number, color: string, seed: number, opacity: number) => g.pen(pts, { w, color, seed, wobble: 0.4, boil: 0, taper: 1, opacity, retrace: false });

// ---------------------------------------------------------------- the night, the far bank
const SKY: P[] = [[0, 0], [1600, 0], [1600, 470], [0, 470]];
const MOON_C: P = [470, 120], MOON = oval(MOON_C[0], MOON_C[1], 46, 46, 20);
const r = rng(55);
const NIGHT = ["#2a3450", "#3a3458", "#2a3a3a", "#4a3a5a"];
const TREES: Shape[] = [];
for (let i = 0; i < 16; i++) { const x = -30 + i * 108 + (r() - 0.5) * 40; if (x > 1150 && x < 1400) continue; TREES.push(...tree(x, 440 + (i % 2) * 6, 190 + r() * 70, 300 + i * 7, NIGHT.slice(i % 2).concat(NIGHT))); }
const FAR_BANK: P[] = [[0, 440], [400, 432], [800, 440], [1200, 430], [1600, 436], [1600, 512], [1200, 506], [800, 516], [400, 508], [0, 514]];
const PEBBLES = Array.from({ length: 60 }, (_, i) => { const q = rng(400 + i), x = q() * 1600, y = 470 + q() * 40, s = 5 + q() * 6; return blob(x, y, s * 1.4, s * 0.8, 410 + i, 0.2, 8); });
// the beech: smooth and grey, its roots over the den
const BEECH_T: P[] = [[1255, 470], [1268, 380], [1272, 200], [1262, -20], [1352, -20], [1346, 200], [1352, 380], [1372, 470]];
const BEECH_CROWN = [[1180, 40, 170, 90], [1400, 60, 170, 100], [1290, -10, 200, 80], [1480, 150, 120, 70]].map(([x, y, rx, ry], i) => blob(x, y, rx, ry, 500 + i, 0.3, 14));
const DEN = blob(1312, 478, 46, 26, 520, 0.15, 12);
const B_ROOTS = [tube([[1262, 440], [1236, 470], [1210, 492]], 16, 5), tube([[1360, 440], [1392, 470], [1420, 494]], 16, 5), tube([[1296, 452], [1284, 480], [1280, 498]], 9, 4)];
// the cabin along the water, one window lit
const CABIN: P[] = [[250, 450], [250, 398], [352, 398], [352, 450]], CAB_ROOF: P[] = [[238, 402], [301, 360], [364, 402]], CAB_WIN: P[] = [[316, 412], [338, 412], [338, 432], [316, 432]], CAB_DOOR: P[] = [[268, 450], [268, 414], [288, 414], [288, 450]];
const LOGS = [410, 420, 430, 440].map((y) => ({ pts: [[252, y], [350, y]] as P[], w: 1.2, color: "#3a2a22", alpha: 0.7 }));

// ---------------------------------------------------------------- the river and the heron wading in it
const WATERLINE = 745;
// the moon's road on the water: left bare, in broken bands
const inGlade = (x: number, y: number) => { const d = (y - 515) / 280; return d > 0 && Math.abs(x - MOON_C[0] - 10 * Math.sin(y * 0.09)) < 16 + 46 * d && Math.sin(y * 0.55 + Math.sin(x * 0.07) * 1.5) > -0.2; };
const RIVER_FAR: P[] = [[0, 510], [400, 504], [800, 514], [1200, 502], [1600, 508], [1600, WATERLINE + 2], [0, WATERLINE + 2]];
const RIVER_NEAR: P[] = [[0, WATERLINE - 2], [1600, WATERLINE - 2], [1600, 830], [1200, 818], [800, 836], [400, 820], [0, 832]];
const NEAR_BANK: P[] = [[0, 826], [400, 814], [800, 830], [1200, 812], [1600, 822], [1600, 900], [0, 900]];
const STONES = [[180, 600, 44, 20], [520, 560, 30, 14], [1080, 620, 50, 22], [1460, 580, 40, 18], [340, 770, 60, 26], [1300, 760, 56, 24]].map(([x, y, rx, ry], i) => blob(x, y, rx, ry, 600 + i, 0.2, 12).map(([px, py]) => [px, Math.min(py, y + ry * 0.35)] as P));
const HX = 800, HH = 500, HG = WATERLINE + 0.2 * HH; // knee-deep: the heels just out of the water
const hS = (u: number, v: number): P => [HX + u * HH, HG - v * HH];
// the grey heron wading: legs a little apart, the near one forward, each bent back at the heel; the body an egg
// tilted down to the tail, the wing folded over it, dark flight feathers at the back; the neck in an S, a dagger of a bill
const HBODY = sample([hS(0.19, 0.7), hS(0.15, 0.76), hS(0.05, 0.785), hS(-0.08, 0.768), hS(-0.2, 0.715), hS(-0.3, 0.645), hS(-0.34, 0.615), hS(-0.26, 0.6), hS(-0.1, 0.572), hS(0.05, 0.566), hS(0.15, 0.61)], true, 4);
const HWING = sample([hS(0.13, 0.748), hS(0.04, 0.776), hS(-0.1, 0.757), hS(-0.22, 0.702), hS(-0.3, 0.646), hS(-0.22, 0.632), hS(-0.08, 0.658), hS(0.06, 0.692)], true, 4);
const HPRIM = sample([hS(-0.13, 0.69), hS(-0.24, 0.668), hS(-0.37, 0.61), hS(-0.395, 0.593), hS(-0.3, 0.618), hS(-0.17, 0.656)], true, 3);
const HNECK = tube([hS(0.13, 0.72), hS(0.215, 0.785), hS(0.215, 0.865), hS(0.158, 0.925), hS(0.165, 0.975), hS(0.19, 1.0)], 0.036 * HH, 0.019 * HH);
// a leg: the shank down and back from the body to the heel, the foot-bone down and forward to the foot in the mud
const LEGS: [P, P, P][] = [[hS(-0.035, 0.58), hS(-0.095, 0.35), hS(-0.045, 0)], [hS(0.03, 0.58), hS(-0.03, 0.34), hS(0.08, 0)]];
const LEG_X = LEGS.map(([, k, f]) => f[0] + (k[0] - f[0]) * ((HG - WATERLINE) / (HG - k[1]))); // where each leg comes out of the water
const HLEGS = LEGS.flatMap(([hip, heel, foot]) => [tube([hip, heel], 0.016 * HH, 0.009 * HH, false), oval(heel[0], heel[1], 0.012 * HH, 0.014 * HH, 10), tube([heel, foot], 0.009 * HH, 0.008 * HH)]);
const HHEAD = oval(...hS(0.215, 1.03), 0.048 * HH, 0.034 * HH, 14), HBILL: P[] = [hS(0.25, 1.045), hS(0.45, 1.015), hS(0.25, 1.015)];
const NECK_TOP = hS(0.19, 0.99), HEYE = hS(0.232, 1.037);
const HERON_BODY: Shape[] = [
  ...HLEGS.map((q, i) => ({ pts: q, layers: tint(q, i < 3 ? "#6a5e3e" : "#8a7a4a", { angle: 1.5, gap: 3 }), outline: { color: "#3a3222" } })),
  { pts: HBODY, layers: [...tint(HBODY, "#a8aeb6", { angle: 0.5, gap: 4.5 }), { color: "#5a6070", angle: -0.2, gap: 6, w: 1.8, alpha: 0.5, keep: (_x, y) => y > hS(0, 0.62)[1] }], outline: { color: "#3a3e48" } },
  { pts: HWING, layers: tint(HWING, "#6a707c", { angle: 0.3, gap: 4 }), outline: { color: "#2a2e38" } },
  { pts: HPRIM, layers: night(HPRIM, "#2a2e3a", { angle: 0.4, gap: 3.5 }), outline: { color: "#141420" } },
  { pts: HNECK, layers: [{ color: "#d0d4da", angle: 0.3, gap: 4.5, w: 2, alpha: 0.7 }, { color: "#8a909a", angle: -0.9, gap: 6, w: 1.8, alpha: 0.5, keep: shadeSide(HNECK, 0.05) }], outline: { color: "#4a4e58" } },
];
const HERON_HEAD: Shape[] = [
  { pts: HHEAD, layers: [{ color: "#eceef0", angle: 0.3, gap: 2.5, w: 1.8, alpha: 0.9 }, { color: "#f6f6f4", angle: -0.6, gap: 3.5, w: 1.6, alpha: 0.7 }], outline: { color: "#4a4e58" } },
  { pts: HBILL, layers: [{ color: "#e0b040", angle: 0.1, gap: 2.5, w: 1.8, alpha: 0.95 }, { color: "#8a6420", angle: -0.2, gap: 3, w: 1.6, alpha: 0.6, keep: (_x, y) => y > HBILL[0][1] - 4 }], outline: { color: "#6a4a18" } },
];
const HERON_LINES = [
  { pts: [hS(0.2, 0.975), hS(0.182, 0.93), hS(0.236, 0.87), hS(0.24, 0.8), hS(0.2, 0.735)], w: 2, color: "#2a2e38", alpha: 0.7 },       // the streak down the front of the neck
  ...[0, 1, 2, 3].map((k) => ({ pts: [hS(0.13 + k * 0.018, 0.64 + k * 0.012), hS(0.12 + k * 0.02, 0.575 + k * 0.008)], w: 1.6, color: "#c8ccd2", alpha: 0.8 })), // the plumes at the breast
  { pts: [hS(0.1, 0.735), hS(-0.05, 0.74), hS(-0.2, 0.69)], w: 1.4, color: "#4a505c", alpha: 0.6 },                                   // the wing coverts' edge
  ...[0, 1, 2].map((k) => ({ pts: [hS(-0.2 - k * 0.05, 0.672 - k * 0.02), hS(-0.3 - k * 0.03, 0.622 - k * 0.008)], w: 1.3, color: "#6a7080", alpha: 0.6 })), // the flight feathers' edges
];
// the child astride, sitting down into the plumage, the near leg along the flank, hands on the base of the neck
const KH = 220, SEAT = hS(-0.04, 0.75), KID = figure({ x: SEAT[0], g: SEAT[1] + 0.45 * KH, h: KH, f: 1, lean: 0.08, robe: "saddle", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.5, 1.1], far: [0.45, 1.05] });
const FACE = headOf(KID, KH, 1, "#5a3a22");
// the wet on the legs where they come out of the water
const WET = LEG_X.map((x) => ({ pts: [[x - 7, WATERLINE - 1], [x + 7, WATERLINE + 1]] as P[], w: 2, color: "#c8d0e0", alpha: 0.8 }));

// ---------------------------------------------------------------- reeds on our bank
const REEDS = Array.from({ length: 34 }, (_, i) => { const q = rng(700 + i), x = (i < 20 ? q() * 520 : 1120 + q() * 480), h = 120 + q() * 170, lean = (q() - 0.5) * 30; return { x, y: 880 + q() * 20, h, lean, col: q() < 0.5 ? "#3a4a3a" : "#5a5a3a", head: q() < 0.4, ph: q() * 6.28 }; });
const STATIC_REEDS = REEDS.filter((_, i) => i % 3);
const LIVE_REEDS = REEDS.filter((_, i) => !(i % 3));
const reedPts = (d: (typeof REEDS)[number], sway: number): P[] => [[d.x, d.y], [d.x + d.lean * 0.4 + sway * 0.3, d.y - d.h * 0.5], [d.x + d.lean + sway, d.y - d.h]];

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: SKY, layers: [{ color: "#1e2a4a", angle: 0.25, gap: 4.5, w: 2.4, alpha: 0.75, keep: (x, y) => y < 330 && Math.hypot(x - MOON_C[0], y - MOON_C[1]) > 70 }, { color: "#1e2a4a", angle: 1.3, gap: 6, w: 2.2, alpha: 0.55, keep: (x, y) => y < 200 && Math.hypot(x - MOON_C[0], y - MOON_C[1]) > 90 }, { color: "#5a4a7a", angle: -0.35, gap: 5.5, w: 2.2, alpha: 0.6, keep: (x, y) => Math.hypot(x - MOON_C[0], y - MOON_C[1]) > 60 }, { color: "#8a6a9a", angle: 0.05, gap: 8, w: 2, alpha: 0.45, keep: (_x, y) => y > 250 }, { color: "#2a2a4a", angle: 1.1, gap: 7, w: 2, alpha: 0.5, keep: (_x, y) => y < 160 }], outline: false },
  { pts: MOON, layers: [{ color: "#f2e6b8", angle: 0.6, gap: 4, w: 1.8, alpha: 0.6 }, { color: "#c8c0a0", angle: -0.7, gap: 6, w: 1.6, alpha: 0.4, keep: (x) => x > MOON_C[0] + 16 }], outline: { color: "#c8b88a", alpha: 0.6 } },
  ...TREES,
  ...BEECH_CROWN.map((c, i) => ({ pts: c, layers: night(c, ["#3a3a52", "#2e3a40", "#443a52", "#2a3448"][i], { angle: 0.8 + i * 0.3 }), outline: { color: "#1e1a2a" } })),
  { pts: FAR_BANK, layers: night(FAR_BANK, "#4a4a60", { angle: 0.2 }), outline: false },
  ...PEBBLES.map((p, i) => ({ pts: p, layers: [{ color: i % 3 ? "#8a8a98" : "#a09aa8", angle: 0.8 + i, gap: 3, w: 1.6, alpha: 0.8 }], outline: { color: "#3a3a4a", w: 1 } })),
  { pts: BEECH_T, layers: [...tint(BEECH_T, "#7a7a8c", { angle: 1.5, gap: 4.5 }), { color: "#2a2a42", angle: 1.55, gap: 5, w: 1.8, alpha: 0.6, keep: (x) => x > 1310 }, { color: "#3a3a52", angle: 0.2, gap: 14, w: 1.6, alpha: 0.5 }], outline: { color: "#3a3a4a" } },
  { pts: DEN, layers: [{ color: "#140e14", angle: 0.7, gap: 3, w: 2.4, alpha: 0.95 }, { color: "#1e1a2a", angle: -0.6, gap: 3.5, w: 2.2, alpha: 0.9 }], outline: { color: "#0e0a0e" } },
  ...B_ROOTS.map((q) => ({ pts: q, layers: tint(q, "#7a7a88", { angle: 1.1, gap: 4 }), outline: { color: "#3a3a4a" } })),
  { pts: CAB_ROOF, layers: tint(CAB_ROOF, "#3a2a2e", { angle: 0.6, gap: 4 }) }, { pts: CABIN, layers: tint(CABIN, "#5a4a44", { gap: 4.5 }) },
  { pts: CAB_DOOR, layers: tint(CAB_DOOR, "#2a1e1a", { gap: 3 }) }, { pts: CAB_WIN, layers: [{ color: "#f2c14a", angle: 0.8, gap: 3, w: 2.2, alpha: 0.95 }, { color: "#e89a3a", angle: -0.6, gap: 5, w: 1.8, alpha: 0.6 }], outline: { color: "#8a5a2a" } },
  { pts: RIVER_FAR, layers: [{ color: "#2a3a5a", angle: 0.03, gap: 4.5, w: 2.2, alpha: 0.75, keep: (x, y) => !inGlade(x, y) }, { color: "#4a4a7a", angle: -0.08, gap: 7, w: 2, alpha: 0.5, keep: (x, y) => !inGlade(x, y) }, { color: "#1e2a4a", angle: 0.1, gap: 8, w: 2, alpha: 0.5, keep: (x, y) => y > 600 && !inGlade(x, y) }, { color: "#e8dca8", angle: 0.02, gap: 5, w: 2, alpha: 0.6, keep: inGlade }], outline: false },
  ...STONES.slice(0, 4).map((q, i) => ({ pts: q, layers: tint(q, "#6a6a7a", { seed: i, gap: 4 }), outline: { color: "#2a2a3a" } })),
  ...HERON_BODY, ...fromMotif(KID.m), ...FACE.shapes,
  { pts: RIVER_NEAR, layers: [{ color: "#2a3a5a", angle: 0.03, gap: 4.5, w: 2.2, alpha: 0.75, keep: (x, y) => !inGlade(x, y) }, { color: "#1e2a4a", angle: -0.08, gap: 6, w: 2, alpha: 0.6, keep: (x, y) => !inGlade(x, y) }, { color: "#4a4a7a", angle: 0.12, gap: 9, w: 1.8, alpha: 0.4 }, { color: "#e8dca8", angle: 0.02, gap: 5, w: 2, alpha: 0.6, keep: inGlade }], outline: false },
  ...STONES.slice(4).map((q, i) => ({ pts: q, layers: tint(q, "#5a5a6a", { seed: i + 4, gap: 4 }), outline: { color: "#2a2a3a" } })),
  { pts: NEAR_BANK, layers: night(NEAR_BANK, "#2a3a2e", { angle: 1.3, gap: 4 }), outline: false },
];
const lines = [
  ...LOGS, ...FACE.lines, ...WET, ...HERON_LINES,
  ...STATIC_REEDS.flatMap((d) => [{ pts: reedPts(d, 0), w: 2.2, color: d.col, alpha: 0.85 }, ...(d.head ? [{ pts: [reedPts(d, 0)[2], [d.x + d.lean * 1.04, d.y - d.h - 26]] as P[], w: 6, color: "#4a3426", alpha: 0.9 }] : [])]),
];

// ---------------------------------------------------------------- what moves
const HEAD = prehatch(HERON_HEAD);
HEAD.strokes.push({ pts: [[HEYE[0] - 2, HEYE[1] + 2], [HEYE[0] + 2, HEYE[1] + 2]], w: 4, color: "#1a1410", alpha: 0.95, seed: 7001 }, { pts: [[HEYE[0] - 1, HEYE[1] + 1], [HEYE[0], HEYE[1] + 1]], w: 1.6, color: "#f2d060", alpha: 0.9, seed: 7002 });
const PLUME: P[] = [hS(0.2, 1.05), hS(0.12, 1.06), hS(0.04, 1.045)], BROW: P[] = [hS(0.238, 1.046), hS(0.215, 1.056), hS(0.19, 1.052)]; // the black over the eye, going back into the crest
const SPARK = Array.from({ length: 18 }, (_, i) => { const q = rng(900 + i); return { y: 522 + i * 16 + q() * 6, ph: q() * 6.28 }; });
export const f05 = sketch({
  id: "f05", title: "La Rivière", loop: LOOP, shapes, lines,
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    live(g, () => {
      // the heron's head: turning slowly round toward us and back
      const deg = -9 + 9 * Math.tanh(2.5 * Math.sin(TT)) / Math.tanh(2.5);
      replayTurned(g, HEAD, NECK_TOP, deg, reveal);
      pen(g, turn(PLUME, NECK_TOP[0], NECK_TOP[1], deg), 2.6, "#1a1a22", 90, 0.9 * reveal);
      pen(g, turn(BROW, NECK_TOP[0], NECK_TOP[1], deg), 4.5, "#1a1a22", 91, 0.9 * reveal);
      // the moon on the water: short bright strokes that break and mend
      SPARK.forEach((s, i) => { const k = 0.5 + 0.5 * Math.sin(TT * 2 + s.ph), d = (s.y - 515) / 280, w = (14 + 40 * d) * (0.4 + 0.5 * k), x = MOON_C[0] + 10 * Math.sin(s.y * 0.09) + Math.sin(TT + s.ph) * 14 * d; pen(g, [[x - w, s.y], [x + w, s.y + 0.5]], 2.6, i % 2 ? "#2a3a5a" : "#fff4c8", 100 + i, (0.4 + 0.5 * k) * reveal); });
      // rings going out round the heron's legs, two at a time
      [0, 1].forEach((leg) => [0, 0.5].forEach((off, k) => { const p = (t / LOOP * 3 + off + leg * 0.25) % 1, x = LEG_X[leg], rx = 10 + p * 60, ry = 3 + p * 12, a = (1 - p) * 0.8; pen(g, sample([[x - rx, WATERLINE], [x, WATERLINE + ry], [x + rx, WATERLINE]], false, 6), 2.4, "#b8c4e0", 120 + leg * 4 + k, a * reveal); }));
      // the reeds in the night air
      LIVE_REEDS.forEach((d, i) => { const sway = Math.sin(TT * 2 + d.ph) * 6, pts = reedPts(d, sway); pen(g, pts, 2.2, d.col, 200 + i, 0.85 * reveal); if (d.head) pen(g, [pts[2], [d.x + d.lean * 1.04 + sway * 1.1, d.y - d.h - 26]], 6, "#4a3426", 230 + i, 0.9 * reveal); });
    });
  },
});
