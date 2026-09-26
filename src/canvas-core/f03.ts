// LES GRANDS BOIS PAGE 3 · LE TERRIER. One idea: off the path, among ferns taller than the child,
// a badger sitting upright before its burrow holds out a golden acorn, and the child says nothing.
// Coloured pencil, autumn dusk under the trees. On the right a bank, a big trunk on top of it, its
// roots coming down round the dark mouth of a burrow; the badger sits up on its haunches in front,
// one paw out, the acorn in it. On the left the child, arms down, mouth shut, the whistle in hand.
// Fern fronds rise over the child's head on every side.
// What moves: the badger's nose working, the ferns swaying, a glint going over the acorn.
import { oval, rng, sample, tube, type P } from "./core";
import { figure, type Figure } from "./figures";
import { blob, mix } from "./gallery";
import { fromMotif, live, pencilLive, sketch, tint, type Shape } from "./pencil";

const LOOP = 180;

// ---------------------------------------------------------------- helpers
const trunk = (x: number, g: number, w: number, color: string, lean = 0): Shape => {
  const pts: P[] = [[x - w * 0.62, g + 4], [x - w * 0.5, g - 30], [x - w * 0.45 + lean * 0.5, g * 0.45], [x - w * 0.42 + lean, -20], [x + w * 0.42 + lean, -20], [x + w * 0.45 + lean * 0.5, g * 0.45], [x + w * 0.5, g - 30], [x + w * 0.65, g + 4]];
  return { pts, layers: [...tint(pts, color, { angle: 1.45, gap: w > 60 ? 4.5 : 5 }), { color: mix(color, "#1e1a2a", 0.55), angle: 1.52, gap: 7, w: 1.8, alpha: 0.5, keep: (xx) => xx > x + lean * 0.5 + w * 0.12 }], outline: { color: mix(color, "#1e1a2a", 0.5) } };
};
const headOf = (F: Figure, h: number, f: 1 | -1, hair: string) => {
  const [cx, cy] = F.head, rx = 0.056 * h, ry = 0.07 * h, S = (u: number, v: number): P => [cx + f * u * rx, cy + v * ry];
  const cap: P[] = [...Array.from({ length: 12 }, (_, i) => { const a = -1.05 - (i / 11) * 2.9; return S(Math.cos(a) * 1.14, Math.sin(a) * 1.12); }), S(-0.45, 0.4), S(-0.15, -0.1), S(0.2, -0.45), S(0.45, -0.7)];
  const w = Math.max(1.2, h / 200);
  return {
    shapes: [{ pts: cap, layers: tint(cap, hair, { gap: 3.5 }), outline: { color: mix(hair, "#1a1410", 0.5) } }] as Shape[],
    lines: [
      { pts: [S(0.38, -0.02), S(0.52, 0.0)], w: Math.max(2.5, h / 90), color: "#2a1a12", alpha: 0.95 },
      { pts: [S(0.3, -0.3), S(0.6, -0.26)], w, color: mix(hair, "#1a1410", 0.3), alpha: 0.8 },
      { pts: [S(0.93, -0.05), S(1.14, 0.2), S(0.95, 0.3)], w: w * 1.2, color: "#9a6a50", alpha: 0.9 },
      { pts: [S(0.5, 0.58), S(0.8, 0.52)], w, color: "#9a4a3a", alpha: 0.85 },
    ],
  };
};
// the same frond as strokes: a stem and its leaflets, cheap enough to redraw every frame
const frondStrokes = (base: P, len: number, ang: number, bend: number, wid: number) => {
  const n = 26, stem: P[] = [], pinnae: P[][] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, x = base[0] + Math.cos(ang) * len * s + bend * len * s * s * s * -Math.sin(ang) * 0.5, y = base[1] + Math.sin(ang) * len * s + bend * len * s * s * s * Math.cos(ang) * 0.5, a = ang + bend * s * s;
    stem.push([x, y]);
    if (i > 1 && i < n) { const w = wid * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.08)), 0.7); [1, -1].forEach((k) => pinnae.push([[x, y], [x + (-Math.sin(a) * k + Math.cos(a) * 0.5) * w, y + (Math.cos(a) * k + Math.sin(a) * 0.5) * w]])); }
  }
  return { stem, pinnae };
};

// ---------------------------------------------------------------- the wood behind
const BACK: P[] = [[0, 0], [1600, 0], [1600, 700], [0, 700]];
const r = rng(33);
const farTrunks = [90, 250, 400, 520, 660, 800, 930].map((x, i) => trunk(x + (r() - 0.5) * 30, 640 - (i % 2) * 20, 18 + r() * 26, i % 2 ? "#4a3a4e" : "#5a4450"));
const BUSHES = [[80, 640, 200, 70], [380, 650, 220, 60], [700, 640, 200, 70]].map(([x, y, rx, ry], i) => blob(x, y, rx, ry, 60 + i, 0.3, 14));
const GROUND: P[] = [[0, 640], [500, 620], [800, 640], [800, 900], [0, 900]];
// the bank, the big tree on it, its roots coming down round the burrow
const BANK: P[] = [[600, 900], [640, 800], [720, 690], [850, 600], [1000, 540], [1200, 510], [1400, 500], [1600, 500], [1600, 900]];
const MOSS: P[] = [[720, 690], [850, 600], [1000, 540], [1200, 510], [1400, 500], [1600, 500], [1600, 530], [1400, 540], [1200, 550], [1010, 585], [870, 640], [750, 710]];
const OAK = trunk(1335, 548, 230, "#6a5446", 16);
const HOLE: P[] = blob(1150, 730, 100, 70, 31, 0.12, 16).map(([x, y]) => [x, Math.min(y, 772)] as P);
const HOLE_IN: P[] = blob(1160, 742, 66, 40, 32, 0.12, 14);
const ROOT_L = tube([[1225, 530], [1150, 562], [1090, 612], [1058, 684], [1042, 760], [1030, 805]], 40, 11);
const ROOT_R = tube([[1455, 530], [1425, 600], [1352, 652], [1302, 722], [1286, 805]], 46, 13);
const ROOT_S = tube([[1270, 545], [1215, 610], [1200, 668]], 16, 5);
const streaks = [[[1205, 548], [1140, 580], [1088, 632], [1062, 700], [1048, 770]], [[1440, 560], [1400, 616], [1340, 666], [1300, 740]], [[1210, 520], [1180, 540]], [[1470, 520], [1462, 545]]].map((pts, i) => ({ pts: pts as P[], w: 1.4, color: "#3a2a20", alpha: 0.7 }));
const LIP: P[] = [[960, 790], [1060, 772], [1150, 778], [1260, 776], [1300, 806], [1200, 836], [1000, 836]]; // the trodden earth before the hole

// ---------------------------------------------------------------- the badger, sitting up on its behind like a person, the acorn held out
// built here, upright, facing left: in units of its height from its seat
const BX = 1040, BG = 826, BHt = 225, B = (u: number, v: number): P => [BX - u * BHt, BG - v * BHt];
const Bp = (pts: number[][]) => pts.map(([u, v]) => B(u, v));
const BODY = sample(Bp([[-0.3, 0.02], [-0.34, 0.25], [-0.26, 0.5], [-0.12, 0.66], [0.1, 0.68], [0.24, 0.52], [0.3, 0.26], [0.26, 0.02]]), true, 4);
const CHEST = sample(Bp([[0.02, 0.06], [0.14, 0.2], [0.2, 0.42], [0.12, 0.62], [0.04, 0.6], [0.08, 0.4], [-0.02, 0.18]]), true, 3);
const FOOT = sample(Bp([[0.04, 0.0], [0.34, 0.0], [0.36, 0.05], [0.2, 0.08], [0.04, 0.07]]), true, 3);
const FAR_ARM = tube([B(0.1, 0.58), B(0.2, 0.42), B(0.16, 0.34)], 0.05 * BHt, 0.035 * BHt);
const HEAD = sample(Bp([[-0.18, 0.74], [-0.1, 0.86], [0.04, 0.88], [0.22, 0.8], [0.35, 0.73], [0.37, 0.7], [0.2, 0.66], [0.0, 0.64], [-0.14, 0.66]]), true, 4);
const STRIPE = (k: number) => sample(Bp([[-0.1, 0.82 - k * 0.07], [0.05, 0.84 - k * 0.07], [0.2, 0.775 - k * 0.04], [0.33, 0.73 - k * 0.012], [0.33, 0.72 - k * 0.012], [0.2, 0.755 - k * 0.04], [0.05, 0.8 - k * 0.07], [-0.1, 0.785 - k * 0.07]]), true, 3);
const EAR = sample(Bp([[-0.14, 0.82], [-0.12, 0.9], [-0.06, 0.86]]), true, 3);
const SHOULDER = B(0.1, 0.56), PAW = B(0.46, 0.52);
const ARM = tube([SHOULDER, B(0.28, 0.5), PAW], 0.055 * BHt, 0.04 * BHt);
const NOSE_AT = B(0.365, 0.715);
const CLAWS = [0, 1, 2].map((k) => ({ pts: [[PAW[0] - 6, PAW[1] - 4 + k * 5], [PAW[0] - 15, PAW[1] - 2 + k * 6]] as P[], w: 1.6, color: "#e6e2da", alpha: 0.8 }));
const TOES = [0, 1, 2].map((k) => ({ pts: [B(0.34, 0.01 + k * 0.022), B(0.4, 0.0 + k * 0.02)], w: 1.4, color: "#e6e2da", alpha: 0.8 }));
const ACORN_C: P = [PAW[0] - 4, PAW[1] - 28];
const NUT = oval(ACORN_C[0], ACORN_C[1] + 5, 17, 22, 16);
const CUP: P[] = [[ACORN_C[0] - 15, ACORN_C[1] - 4], [ACORN_C[0] - 12, ACORN_C[1] - 14], [ACORN_C[0], ACORN_C[1] - 18], [ACORN_C[0] + 12, ACORN_C[1] - 14], [ACORN_C[0] + 15, ACORN_C[1] - 4], [ACORN_C[0], ACORN_C[1] - 1]];
const STALK = { pts: [[ACORN_C[0] + 1, ACORN_C[1] - 18], [ACORN_C[0] + 4, ACORN_C[1] - 27]] as P[], w: 2.6, color: "#6a4a20", alpha: 0.9 };
const badgerShapes: Shape[] = [
  { pts: FAR_ARM, layers: tint(FAR_ARM, "#2a2624", { gap: 3.5 }), outline: { color: "#1a1614" } },
  { pts: BODY, layers: [...tint(BODY, "#7a766e", { gap: 4 }), { color: "#4a4642", angle: 1.5, gap: 7, w: 1.6, alpha: 0.45, keep: (x) => x > BX - 10 }], outline: { color: "#3a3634" } },
  { pts: CHEST, layers: tint(CHEST, "#2e2a28", { gap: 3.5 }), outline: false },
  { pts: FOOT, layers: tint(FOOT, "#2a2624", { gap: 3 }), outline: { color: "#1a1614" } },
  { pts: EAR, layers: [{ color: "#4a4440", angle: 0.5, gap: 3, w: 1.6, alpha: 0.9 }], outline: { color: "#e6e2da" } },
  { pts: HEAD, layers: [{ color: "#efe9dc", angle: 0.4, gap: 5, w: 1.8, alpha: 0.6 }, { color: "#b8b2a8", angle: -0.8, gap: 7, w: 1.6, alpha: 0.4, keep: (_x, y) => y > B(0, 0.7)[1] }], outline: { color: "#6a6460" } },
  { pts: STRIPE(0), layers: [{ color: "#1e1a18", angle: 0.3, gap: 2.5, w: 1.8, alpha: 0.95 }], outline: false },
  { pts: STRIPE(-1.2), layers: [{ color: "#1e1a18", angle: 0.3, gap: 2.5, w: 1.8, alpha: 0.95 }], outline: false },
  { pts: ARM, layers: tint(ARM, "#2a2624", { gap: 3 }), outline: { color: "#1a1614" } },
];
const BADGER_PARTS = [...badgerShapes.map((s) => s.pts), oval(ACORN_C[0], ACORN_C[1], 22, 30, 12)];
// the grizzle of its coat, and its eye, a wet glint in the black stripe
const fur = Array.from({ length: 30 }, (_, i) => { const q = rng(1300 + i), [x, y] = B(-0.25 + q() * 0.45, 0.1 + q() * 0.5); return { pts: [[x, y], [x + 2 + q() * 4, y + 7 + q() * 6]] as P[], w: 1.3, color: q() < 0.5 ? "#e6e2da" : "#3a3634", alpha: 0.6, hide: [ARM, CHEST, FAR_ARM] }; });
const EYE = { pts: [B(0.16, 0.765), B(0.18, 0.763)], w: 3, color: "#f4efe4", alpha: 0.9 };

// ---------------------------------------------------------------- the child, silent
const KH = 370, KID = figure({ x: 650, g: 880, h: KH, f: 1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.1, 0.15], far: [0.05, 0.12] });
const FACE = headOf(KID, KH, 1, "#5a3a22");
const WHISTLE: P[] = (() => { const [x, y] = KID.hands.near; return [[x - 2, y + 6], [x + 20, y + 10], [x + 22, y + 16], [x - 2, y + 14]]; })();

// ---------------------------------------------------------------- the ferns, taller than the child
type Fr = { base: P; len: number; ang: number; bend: number; wid: number; col: string };
const Fern = (x: number, y: number, len: number, ang: number, bend: number, wid: number, col: string): Fr => ({ base: [x, y], len, ang, bend, wid, col });
const fernLines = (F: Fr, seed: number, hide?: P[][]) => { const { stem, pinnae } = frondStrokes(F.base, F.len, F.ang, F.bend, F.wid); return [{ pts: stem, w: 2.2, color: mix(F.col, "#2a2238", 0.5), alpha: 0.9, hide }, ...pinnae.map((p, j) => ({ pts: p, w: 11 * (1 - (j / pinnae.length) * 0.6), color: (j + seed) % 3 ? F.col : mix(F.col, "#2a2238", 0.3), alpha: 0.85, hide }))]; };
// behind the child, over its head
const FERN_COLS = ["#6f7d3a", "#8a8a3a", "#5a6a2a", "#a8521f", "#6f7d3a", "#c8642a"];
const BACK_FERNS = Array.from({ length: 16 }, (_, i) => { const q = rng(1500 + i), x = -20 + i * 58 + (q() - 0.5) * 30, ang = -1.57 + (q() - 0.5) * 0.9 + (x < 640 ? 0.12 : -0.12) * 0, bend = (ang > -1.57 ? 1 : -1) * (0.4 + q() * 0.4); return Fern(x, 905, (x > 760 ? 380 : 470) + q() * 170, ang, bend, 50 + q() * 16, FERN_COLS[i % FERN_COLS.length]); });
const backFerns = BACK_FERNS.flatMap((F, i) => fernLines(F, i, [...KID.m.parts, ...BADGER_PARTS]));
// the ones in front, that sway: drawn live
const NEAR_FERNS: Fr[] = [Fern(-20, 920, 520, -1.05, 0.9, 70, "#5a6a2a"), Fern(1560, 930, 470, -2.05, -0.8, 66, "#6f7d3a"), Fern(420, 940, 300, -1.2, 0.8, 46, "#8a4a22")];
const litter = Array.from({ length: 70 }, (_, i) => { const q = rng(800 + i), y = 650 + q() * 250, x = q() * 1000, s = 5 + (y - 640) * 0.03, a = q() * 3; return { pts: [[x - Math.cos(a) * s, y - Math.sin(a) * s * 0.5], [x + Math.cos(a) * s, y + Math.sin(a) * s * 0.5]] as P[], w: 2.4 + s * 0.12, color: ["#c8642a", "#d9a441", "#8a5a2a", "#a8452a"][i % 4], alpha: 0.7, hide: [...KID.m.parts, ...BADGER_PARTS] }; });
const rootlets = Array.from({ length: 14 }, (_, i) => { const q = rng(1400 + i), x = 1080 + q() * 170, y = 668 + q() * 20; return { pts: [[x, y], [x + (q() - 0.5) * 20, y + 16 + q() * 20], [x + (q() - 0.5) * 30, y + 30 + q() * 20]] as P[], w: 1.4, color: "#3a2a1e", alpha: 0.8, hide: BADGER_PARTS }; });

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  // the last light low between the trunks, the leaves dark overhead
  { pts: BACK, layers: [{ color: "#e8a45a", angle: 0.2, gap: 6, w: 2.2, alpha: 0.6, keep: (_x, y) => y > 280 }, { color: "#d9707a", angle: -0.3, gap: 7, w: 2, alpha: 0.4, keep: (_x, y) => y > 240 && y < 520 }, { color: "#7a6a8a", angle: 1.3, gap: 5, w: 2.2, alpha: 0.6, keep: (_x, y) => y < 380 }, { color: "#5a3a4a", angle: 0.8, gap: 5, w: 2, alpha: 0.6, keep: (x, y) => y < 200 + 40 * Math.sin(x * 0.01) }], outline: false },
  ...farTrunks,
  ...BUSHES.map((b, i) => ({ pts: b, layers: tint(b, ["#4a4a3a", "#5a3a3a", "#3a4a3a"][i], { gap: 4.5 }), outline: false as const })),
  { pts: GROUND, layers: [{ color: "#8a5a2a", angle: 0.25, gap: 5, w: 2.2, alpha: 0.6 }, { color: "#c8642a", angle: -0.5, gap: 7, w: 2, alpha: 0.45 }, { color: "#4a3a2a", angle: 1.0, gap: 8, w: 1.8, alpha: 0.4 }], outline: false },
  { pts: BANK, layers: [{ color: "#8a6a44", angle: 0.4, gap: 4.5, w: 2.2, alpha: 0.75 }, { color: "#5a4030", angle: -0.6, gap: 6, w: 2, alpha: 0.55 }, { color: "#c8642a", angle: 1.2, gap: 9, w: 1.8, alpha: 0.35 }], outline: { color: "#4a3426" } },
  { pts: MOSS, layers: tint(MOSS, "#6f7d3a", { gap: 4.5 }), outline: false },
  OAK,
  { pts: HOLE, layers: [{ color: "#2a1e1a", angle: 0.7, gap: 3.5, w: 2.4, alpha: 0.9 }, { color: "#3a2a2a", angle: -0.6, gap: 4.5, w: 2.2, alpha: 0.8 }], outline: { color: "#1a1210" } },
  { pts: HOLE_IN, layers: [{ color: "#140e0c", angle: 1.2, gap: 3.5, w: 2.4, alpha: 0.9 }, { color: "#1e1a2a", angle: 0.1, gap: 4, w: 2.2, alpha: 0.8 }], outline: false },
  { pts: ROOT_S, layers: tint(ROOT_S, "#5a4436", { gap: 4 }) },
  { pts: ROOT_L, layers: [...tint(ROOT_L, "#6a5446", { angle: 2.2, gap: 4 }), { color: "#6f7d3a", angle: 0.4, gap: 6, w: 1.8, alpha: 0.5, keep: (x, y) => y < 640 && y < 560 + (x - 1060) * -0.6 + 70 }], outline: { color: "#3a2a20" } },
  { pts: ROOT_R, layers: [...tint(ROOT_R, "#6a5446", { angle: 2.0, gap: 4 }), { color: "#6f7d3a", angle: 0.4, gap: 6, w: 1.8, alpha: 0.5, keep: (_x, y) => y < 610 }], outline: { color: "#3a2a20" } },
  { pts: LIP, layers: [{ color: "#a07850", angle: 0.2, gap: 5, w: 2, alpha: 0.6 }], outline: false },
  ...badgerShapes,
  { pts: NUT, layers: [{ color: "#e0a830", angle: 0.8, gap: 3, w: 1.8, alpha: 0.95, keep: (x, y) => Math.hypot(x - ACORN_C[0] + 5, y - ACORN_C[1] + 2) > 4 }, { color: "#a8701a", angle: -0.5, gap: 3.5, w: 1.6, alpha: 0.7, keep: (x) => x > ACORN_C[0] + 2 }], outline: { color: "#7a5010" } },
  { pts: CUP, layers: [{ color: "#8a6a2a", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.95 }, { color: "#5a4020", angle: -0.9, gap: 3, w: 1.4, alpha: 0.8 }], outline: { color: "#4a3010" } },
  ...fromMotif(KID.m), ...FACE.shapes, { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.9 }] },
];

// ---------------------------------------------------------------- what moves
const NOSE = oval(NOSE_AT[0], NOSE_AT[1], 7, 6, 10);
export const f03 = sketch({
  id: "f03", title: "Le Terrier", loop: LOOP, shapes, lines: [...backFerns, ...streaks, ...litter, ...rootlets, ...fur, ...CLAWS, ...TOES, STALK, EYE, ...FACE.lines],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    live(g, () => {
      // the nose working: little sniffs in bursts, then still
      const burst = Math.max(0, Math.sin(TT * 3)), dy = Math.sin(TT * 24) * 2.2 * burst, dx = Math.cos(TT * 24) * 1.2 * burst;
      pencilLive(g, NOSE.map(([x, y]) => [x + dx, y + dy] as P), "#1e1a18", { gap: 2, seed: 20, alpha: reveal, outline: "#0e0a08" });
      [-1, 1].forEach((k) => g.pen([[NOSE_AT[0] + 4 + dx * 0.5, NOSE_AT[1] + k * 3], [NOSE_AT[0] + 20, NOSE_AT[1] + k * 8 + dy * 0.6]], { w: 1, color: "#e6e2da", seed: 24 + k, wobble: 0.3, boil: 0, taper: 1, opacity: 0.8 * reveal, retrace: false })); // whiskers
      // the glint on the acorn: a star that comes and goes twice in the loop
      const gl = Math.pow(Math.max(0, Math.sin(TT * 2)), 6);
      if (gl > 0.02) { const [x, y] = [ACORN_C[0] - 5, ACORN_C[1] + 1], s = 4 + gl * 10; [[s, 0], [0, s], [s * 0.5, s * 0.5], [-s * 0.5, s * 0.5]].forEach(([u, v], i) => g.pen([[x - u, y - v], [x + u, y + v]], { w: 2 + gl, color: "#fff8e0", seed: 30 + i, wobble: 0.2, boil: 0, taper: 1, opacity: gl * reveal, retrace: false })); }
      // the ferns in front, swaying, each at its own pace
      NEAR_FERNS.forEach((F, i) => {
        const sway = Math.sin(TT * (i + 1) + i * 2) * 0.05, { stem, pinnae } = frondStrokes(F.base, F.len, F.ang + sway, F.bend + sway * 1.5, F.wid);
        g.pen(stem, { w: 2.4, color: mix(F.col, "#2a2238", 0.5), seed: 40 + i, wobble: 0.3, boil: 0, taper: 1, opacity: 0.9 * reveal, retrace: false });
        pinnae.forEach((p, j) => g.pen(p, { w: 12 * (1 - j / pinnae.length * 0.6), color: j % 2 ? F.col : mix(F.col, "#2a2238", 0.3), seed: 50 + i * 40 + j, wobble: 0.3, boil: 0, taper: 1, opacity: 0.85 * reveal, retrace: false }));
      });
    });
  },
});
