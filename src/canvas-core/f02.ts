// LES GRANDS BOIS PAGE 2 · LE SENTIER. One idea: on the path, silent, Tom's red scarf hangs on a
// bramble, and beside it his small prints and the fox's leave the path together.
// Coloured pencil, autumn dusk inside the wood. The path comes up from the foreground and goes in
// between tall trunks; the ground is all leaves. On the left, at the path's edge, a bramble with the
// scarf caught on it, TOM embroidered in white on the hanging end. The child on the path, reaching.
// The prints, a child's and a fox's, turn off beside the bramble into the undergrowth. No birds.
// What moves: leaves coming down, the scarf's end lifting, a leaf skittering along the path.
import { oval, rng, sample, tube, type P } from "./core";
import { figure, type Figure } from "./figures";
import { blob, inside, mix } from "./gallery";
import { fromMotif, live, pencilLive, shadeSide, sketch, tint, type Shape } from "./pencil";

const LOOP = 180;
const AUTUMN = ["#c8642a", "#d9a441", "#8a5a2a", "#6f7d3a", "#a8452a"];

// ---------------------------------------------------------------- helpers
// a tall trunk seen from inside the wood: it runs out of the top of the page
const trunk = (x: number, g: number, w: number, color: string, lean = 0): Shape => {
  const pts: P[] = [[x - w * 0.62, g + 4], [x - w * 0.5, g - 30], [x - w * 0.45 + lean * 0.5, g * 0.45], [x - w * 0.42 + lean, -20], [x + w * 0.42 + lean, -20], [x + w * 0.45 + lean * 0.5, g * 0.45], [x + w * 0.5, g - 30], [x + w * 0.65, g + 4]];
  return { pts, layers: [...tint(pts, color, { angle: 1.45, gap: w > 60 ? 4.5 : 5 }), { color: mix(color, "#1e1a2a", 0.55), angle: 1.52, gap: 7, w: 1.8, alpha: 0.5, keep: (xx) => xx > x + lean * 0.5 + w * 0.12 }], outline: { color: mix(color, "#1e1a2a", 0.5) } };
};
// a fern frond as strokes: a stem and its leaflets (as on f03)
const frondStrokes = (base: P, len: number, ang: number, bend: number, wid: number) => {
  const n = 22, stem: P[] = [], pinnae: P[][] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, x = base[0] + Math.cos(ang) * len * s + bend * len * s * s * s * -Math.sin(ang) * 0.5, y = base[1] + Math.sin(ang) * len * s + bend * len * s * s * s * Math.cos(ang) * 0.5, a = ang + bend * s * s;
    stem.push([x, y]);
    if (i > 1 && i < n) { const w = wid * Math.pow(Math.sin(Math.PI * Math.min(1, s * 1.08)), 0.7); [1, -1].forEach((k) => pinnae.push([[x, y], [x + (-Math.sin(a) * k + Math.cos(a) * 0.5) * w, y + (Math.cos(a) * k + Math.sin(a) * 0.5) * w]])); }
  }
  return { stem, pinnae };
};
const fern = (x: number, y: number, len: number, ang: number, bend: number, wid: number, col: string, hide?: P[][]) => { const { stem, pinnae } = frondStrokes([x, y], len, ang, bend, wid); return [{ pts: stem, w: 2, color: mix(col, "#2a2238", 0.5), alpha: 0.9, hide }, ...pinnae.map((p, j) => ({ pts: p, w: 9 * (1 - (j / pinnae.length) * 0.6), color: j % 3 ? col : mix(col, "#2a2238", 0.3), alpha: 0.85, hide }))]; };
const leaf = (x: number, y: number, s: number, a: number): P[] => Array.from({ length: 8 }, (_, i) => { const t = (i / 8) * Math.PI * 2, u = Math.cos(t) * s, v = Math.sin(t) * s * 0.45 * (1 + 0.3 * Math.cos(t)); return [x + u * Math.cos(a) - v * Math.sin(a), y + u * Math.sin(a) + v * Math.cos(a)] as P; });

// the kit's face lines don't come through fromMotif: hair over the top and back, an eye, nose, mouth
const headOf = (F: Figure, h: number, f: 1 | -1, hair: string) => {
  const [cx, cy] = F.head, rx = 0.056 * h, ry = 0.07 * h, S = (u: number, v: number): P => [cx + f * u * rx, cy + v * ry];
  const cap: P[] = [...Array.from({ length: 12 }, (_, i) => { const a = -1.05 - (i / 11) * 2.9; return S(Math.cos(a) * 1.14, Math.sin(a) * 1.12); }), S(-0.45, 0.4), S(-0.15, -0.1), S(0.2, -0.45), S(0.45, -0.7)];
  const w = Math.max(1.2, h / 200);
  return {
    shapes: [{ pts: cap, layers: tint(cap, hair, { gap: 3.5 }), outline: { color: mix(hair, "#1a1410", 0.5) } }] as Shape[],
    lines: [
      { pts: [S(0.38, -0.02), S(0.52, 0.0)], w: Math.max(2.5, h / 90), color: "#2a1a12", alpha: 0.95 },                   // the eye
      { pts: [S(0.3, -0.3), S(0.6, -0.26)], w, color: mix(hair, "#1a1410", 0.3), alpha: 0.8 },                             // the brow
      { pts: [S(0.93, -0.05), S(1.14, 0.2), S(0.95, 0.3)], w: w * 1.2, color: "#9a6a50", alpha: 0.9 },                      // the nose
      { pts: [S(0.5, 0.58), S(0.8, 0.52)], w, color: "#9a4a3a", alpha: 0.85 },                                              // the mouth, shut
    ],
  };
};

// ---------------------------------------------------------------- the wood
const SKY: P[] = [[0, 0], [1600, 0], [1600, 560], [0, 560]];
const FAR: P[] = [[0, 330], [300, 300], [600, 320], [820, 290], [1100, 320], [1600, 300], [1600, 560], [0, 560]];
const HOLES = [[250, 90, 70, 40], [620, 60, 90, 45], [830, 200, 120, 60], [1050, 70, 80, 40], [1380, 120, 70, 50], [480, 230, 60, 30], [1180, 250, 70, 30]];
const SKY_HOLES = HOLES.map(([x, y, rx, ry], i) => blob(x, y, rx, ry, 450 + i, 0.6, 18, (i % 3 - 1) * 0.4));
// the holes broken up: leaf clumps over their rims, a few boughs across them
const CLUMPS = SKY_HOLES.flatMap((h, i) => [0.1, 0.3, 0.5, 0.72, 0.9].map((t, j) => { const q = rng(470 + i * 7 + j), [x, y] = h[Math.floor(t * h.length)]; return { pts: blob(x + (q() - 0.5) * 16, y + (q() - 0.5) * 12, 14 + q() * 20, 9 + q() * 10, 480 + i * 7 + j, 0.45, 10, q() * 3), c: ["#8a4a3a", "#5a3a4a", "#a8452a"][(i + j) % 3] }; }));
const BOUGHS = [[[500, 160], [590, 100], [690, 45], [770, 10]], [[690, 270], [780, 222], [880, 190], [970, 120]], [[1290, 190], [1370, 135], [1460, 95]], [[170, 55], [250, 98], [340, 112]], [[1000, 110], [1060, 60], [1130, 40]]].map((c) => tube(c as P[], 6, 2.2));
const CANOPY: P[] = [[0, 0], [1600, 0], [1600, 300], [1400, 330], [1200, 290], [1000, 320], [830, 290], [640, 330], [420, 300], [200, 330], [0, 300]];
const CROWNS = [[120, 300], [330, 320], [560, 300], [740, 320], [930, 305], [1110, 320], [1300, 310], [1500, 320]].map(([x, y], i) => blob(x, y, 110 + (i % 3) * 20, 45 + (i % 2) * 15, 400 + i, 0.3, 14));
const GROUND: P[] = [[0, 540], [400, 530], [800, 520], [1200, 530], [1600, 540], [1600, 900], [0, 900]];
// the path: wide at our feet, narrowing as it winds in between the trunks
const PATH: P[] = [[400, 900], [470, 830], [560, 760], [640, 690], [720, 630], [770, 575], [800, 540], [816, 522], [846, 522], [868, 545], [905, 585], [990, 640], [1080, 710], [1170, 790], [1290, 900]];
const r = rng(22);
const farTrunks = [150, 330, 470, 560, 720, 780, 890, 930, 1080, 1260, 1450].map((x, i) => trunk(x + (r() - 0.5) * 30, 540 - (i % 3) * 6, 10 + r() * 16, i % 2 ? "#4a3a4e" : "#5a4450"));
const midTrunks = [[290, 610, 50], [660, 560, 34], [1010, 575, 40], [1190, 610, 56]].map(([x, g, w], i) => trunk(x, g, w, i % 2 ? "#6a5244" : "#5a4636", (i - 1.5) * 6));
const nearTrunks = [[60, 930, 150], [1480, 930, 170], [1310, 900, 80]].map(([x, g, w], i) => trunk(x, g, w, i === 2 ? "#7a6a5e" : "#5a4636", i ? -10 : 12));

// ---------------------------------------------------------------- the child and the scarf
const KH = 390, KID = figure({ x: 880, g: 885, h: KH, f: -1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [1.3, 1.55], far: [0.12, 0.2] });
const FACE = headOf(KID, KH, -1, "#5a3a22");
const HAND = KID.hands.near;
const WHISTLE: P[] = (() => { const [x, y] = KID.hands.far; return [[x + 2, y + 6], [x - 24, y + 10], [x - 26, y + 17], [x + 2, y + 15]]; })();
// the scarf thrown over an arching bramble cane: the fold on the cane, the short end hanging behind, the long end in front
const TOP: P = [HAND[0] - 85, HAND[1] - 24], SCARF_W = 64, SCARF_L = 190;
const CANE: P[] = [[TOP[0] - 175, TOP[1] + 225], [TOP[0] - 130, TOP[1] + 90], [TOP[0] - 70, TOP[1] + 20], [TOP[0], TOP[1] - 6], [TOP[0] + 75, TOP[1] + 12], [TOP[0] + 128, TOP[1] + 70], [TOP[0] + 158, TOP[1] + 160]];
// a knitted band hanging from `o`: s along it (0 top, 1 tip), u across (-1 left, 1 right); it leans from a0 to a0 + da, `lift` bends it up to the right
const band = (o: P, L: number, W: number, a0: number, da: number) => (s: number, u: number, lift = 0): P => {
  let x = o[0], y = o[1], ang = a0; const n = 16, k = s * n;
  for (let i = 0; i < Math.ceil(k); i++) { const q = i / n; ang = a0 + da * q - lift * q * 1.6; const d = Math.min(1, k - i) * (L / n); x += Math.cos(ang) * d; y += Math.sin(ang) * d; }
  const hw = u * W * 0.5 * (1 - 0.27 * Math.sin(Math.PI * Math.min(1, s * 1.35)) + 0.04 * s) + Math.sin(s * 23 + u * 3) * 2; // gathered under the fold, flat again lower down
  return [x + Math.sin(ang) * hw, y - Math.cos(ang) * hw];
};
const onScarf = band([TOP[0] - 2, TOP[1] + 12], SCARF_L, SCARF_W, 1.92, -0.66), onBack = band([TOP[0] - 16, TOP[1] + 6], 105, 42, 2.25, -0.3);
const S11 = Array.from({ length: 11 }, (_, i) => i / 10);
const outlineOf = (at: (s: number, u: number, lift?: number) => P, lift = 0): P[] => [...S11.map((s) => at(s, -1, lift)), ...S11.slice().reverse().map((s) => at(s, 1, lift))];
const scarfEnd = (lift: number) => outlineOf(onScarf, lift);
const BACK = outlineOf(onBack);
// the band where it lies over the cane, its top catching the light
const FOLD = sample([[TOP[0] - 40, TOP[1] + 20], [TOP[0] - 34, TOP[1] + 2], [TOP[0] - 14, TOP[1] - 10], [TOP[0] + 14, TOP[1] - 11], [TOP[0] + 32, TOP[1] - 2], [TOP[0] + 38, TOP[1] + 16], [TOP[0] + 20, TOP[1] + 22], [TOP[0] - 16, TOP[1] + 23]], true, 3);
// knitting: rows across the band, and a fringe at the end
const rows = (at: (s: number, u: number, lift?: number) => P, lift: number, from: number) => Array.from({ length: 22 }, (_, i) => from + i * 0.044).filter((s) => s < 0.97).map((s) => [at(s, -0.94, lift), at(s + 0.006, 0, lift), at(s, 0.94, lift)]);
const BACK_KNIT = [...rows(onBack, 0, 0.18).map((pts) => ({ pts, w: 1.3, color: "#5a1a14", alpha: 0.5 })), ...[-3, -1.5, 0, 1.5, 3].map((k) => ({ pts: [onBack(1, k / 3.4), onBack(1.12, k / 3.4 + 0.1)], w: 1.8, color: "#8a2418", alpha: 0.9 }))];
// TOM across the end, in scarf coordinates [s, u]: s down, u left to right
const LETTERS: [number, number][][] = [
  [[0.66, -0.84], [0.66, -0.36]], [[0.66, -0.6], [0.85, -0.6]],                                                 // T
  Array.from({ length: 13 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return [0.755 + Math.cos(a) * 0.095, -0.04 + Math.sin(a) * 0.2] as [number, number]; }), // O
  [[0.85, 0.3], [0.66, 0.33], [0.77, 0.53], [0.66, 0.73], [0.85, 0.78]],                                        // M
];

// ---------------------------------------------------------------- the bramble at the path's edge
const BRAMBLE = blob(520, 700, 185, 105, 71, 0.3, 16);
const BRAMBLE2 = blob(390, 730, 120, 70, 72, 0.3, 14);
const FERNS_L = blob(120, 800, 230, 110, 81, 0.35, 16), FERNS_R = blob(1470, 800, 250, 110, 82, 0.35, 16);
const KEEP_CLEAR = [...KID.m.parts, BACK, FOLD, scarfEnd(0.1)];
// the cane the scarf caught on, thick, hooked thorns all along it
const CANE_C = sample(CANE, false, 6), CANE_T = tube(CANE_C, 4.6, 2.6, false);
const caneThorns = CANE_C.filter((_, i) => i % 3 === 1).map((p, j) => { const i = CANE_C.indexOf(p), q = CANE_C[Math.min(CANE_C.length - 1, i + 1)], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, k = j % 2 ? 1 : -1; return { pts: [[p[0] + (dy / l) * k * 2, p[1] - (dx / l) * k * 2], [p[0] + (dy / l) * k * 9 - (dx / l) * 4, p[1] - (dx / l) * k * 9 - (dy / l) * 4]] as P[], w: 2, color: "#3a1624", alpha: 0.9, hide: [...KID.m.parts, FOLD, scarfEnd(0.1)] }; });
const bramble = Array.from({ length: 14 }, (_, i) => { const q = rng(500 + i), x0 = 340 + q() * 380, y0 = 790, h = 90 + q() * 110, d = (i % 2 ? 1 : -1) * (130 + q() * 150); return { pts: [[x0, y0], [x0 + d * 0.3, y0 - h], [x0 + d * 0.8, y0 - h * 0.8], [x0 + d, y0 - h * 0.25]] as P[], w: 2.4, color: i % 3 ? "#6a2a3a" : "#4a3a2a", alpha: 0.85, hide: KEEP_CLEAR }; });
const thorns = bramble.map((b) => b.pts).flatMap((pts) => [0.25, 0.45, 0.65, 0.85].map((t) => { const i = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1))), f = t * (pts.length - 1) - i, x = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * f, y = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * f; return { pts: [[x, y], [x + 4, y - 7]] as P[], w: 1.5, color: "#4a2030", alpha: 0.85, hide: KEEP_CLEAR }; }));
const BRAMBLE_LEAVES = Array.from({ length: 20 }, (_, i) => { const q = rng(600 + i); return leaf(360 + q() * 330, 620 + q() * 150, 14 + q() * 7, q() * 6); });
const BERRIES = Array.from({ length: 9 }, (_, i) => { const q = rng(650 + i); return oval(380 + q() * 300, 640 + q() * 120, 5, 5, 8); });

// ---------------------------------------------------------------- prints: Tom's and the fox's, off the path beside the bramble
const TRAIL: P[] = [[650, 905], [632, 850], [600, 818], [520, 806], [420, 800], [320, 795], [230, 790]];
const along = (pts: P[], t: number): [P, number] => { const segs = pts.slice(1).map((b, i) => Math.hypot(b[0] - pts[i][0], b[1] - pts[i][1])), L = segs.reduce((a, b) => a + b, 0); let d = t * L, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; } const a = pts[i], b = pts[i + 1], k = d / segs[i]; return [[a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], Math.atan2(b[1] - a[1], b[0] - a[0])]; };
// where the two went, the leaves are kicked aside: a strip of bare earth
const SCUFF = tube(TRAIL.map(([x, y]) => [x, y + 4] as P), 24, 8, false);
const prints: { pts: P[]; w: number; color: string; alpha: number }[] = [];
for (let i = 0; i < 15; i++) {
  const t = 0.03 + (i / 14) * 0.9, [p, a] = along(TRAIL, t), sc = 0.7 + 0.3 * ((p[1] - 790) / 115), side = i % 2 ? 1 : -1, nx = -Math.sin(a), ny = Math.cos(a), ca = Math.cos(a), sa = Math.sin(a);
  const c: P = [p[0] + nx * side * 7 * sc, p[1] + ny * side * 5 * sc - 6], L = 8 * sc;
  prints.push({ pts: [[c[0] - ca * L, c[1] - sa * L * 0.6], [c[0] + ca * L, c[1] + sa * L * 0.6]], w: 8 * sc, color: "#3a2418", alpha: 0.85 });
  // the fox's: a pad and two toes, in a single line beside the child's
  const f: P = [p[0] + ca * 14 * sc, p[1] + 12 * sc];
  prints.push({ pts: [[f[0] - 2.5 * sc, f[1]], [f[0] + 2.5 * sc, f[1]]], w: 6 * sc, color: "#2e1e14", alpha: 0.9 });
  [-1, 1].forEach((k) => { const x = f[0] + ca * 7 * sc - sa * k * 3.5 * sc, y = f[1] + sa * 7 * sc * 0.6 + k * 3 * sc; prints.push({ pts: [[x, y], [x + ca * 1.5, y + 0.5]], w: 3.6 * sc, color: "#2e1e14", alpha: 0.9 }); });
}

// ---------------------------------------------------------------- leaves on the ground
const PATH_LEAVES = Array.from({ length: 46 }, (_, i) => { const q = rng(700 + i), y = 560 + q() ** 0.7 * 335, half = 20 + (y - 520) * 1.0, x = 831 + (y - 520) * -0.04 + (q() - 0.5) * 2 * half, s = 5 + (y - 520) * 0.04; return { pts: leaf(x, y, s, q() * 6), c: AUTUMN[i % AUTUMN.length] }; }).filter((l) => l.pts.every(([x, y]) => inside(PATH, x, y)));
const litter = Array.from({ length: 110 }, (_, i) => { const q = rng(800 + i), y = 560 + q() * 340, x = q() * 1600, s = 5 + (y - 540) * 0.03, a = q() * 3; return { pts: [[x - Math.cos(a) * s, y - Math.sin(a) * s * 0.5], [x + Math.cos(a) * s, y + Math.sin(a) * s * 0.5]] as P[], w: 2.4 + s * 0.12, color: AUTUMN[i % AUTUMN.length], alpha: 0.75, hide: [...KID.m.parts, SCUFF] }; });
const bracken = [[1060, 690, 150, -2.0, -0.6], [1100, 694, 170, -1.6, 0.4], [1140, 690, 140, -1.1, 0.7], [1090, 700, 120, -2.5, -0.5], [1150, 700, 120, -0.7, 0.6], [1500, 900, 300, -2.2, -0.6], [1420, 905, 280, -1.7, 0.4], [1560, 900, 260, -1.3, 0.6], [60, 900, 300, -1.0, 0.6], [150, 905, 280, -1.5, -0.4], [240, 900, 240, -1.9, -0.6]].flatMap(([x, y, len, ang, bend], i) => fern(x, y, len, ang, bend, len * 0.14, ["#a8521f", "#c8642a", "#6f7d3a"][i % 3], KID.m.parts));
const fronds = [0, 1].flatMap((k) => Array.from({ length: 16 }, (_, i) => { const q = rng(900 + k * 50 + i), x0 = [-60, 1250][k] + q() * 400, y0 = 900, h = 90 + q() * 90, d = (q() - 0.5) * 120; return { pts: [[x0, y0], [x0 + d * 0.4, y0 - h * 0.7], [x0 + d, y0 - h]] as P[], w: 2, color: q() < 0.5 ? "#4a5a2a" : "#8a4a22", alpha: 0.8 }; }));

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: SKY, layers: [{ color: "#e8a45a", angle: 0.2, gap: 6, w: 2.4, alpha: 0.55, keep: (_x, y) => y > 120 }, { color: "#8a6a9a", angle: -0.25, gap: 6, w: 2, alpha: 0.5, keep: (_x, y) => y < 260 }, { color: "#d9707a", angle: 0.05, gap: 8, w: 2, alpha: 0.35 }], outline: false },
  { pts: CANOPY, layers: [{ color: "#8a4a3a", angle: 0.9, gap: 4.5, w: 2.2, alpha: 0.75 }, { color: "#5a3a4a", angle: -0.35, gap: 6, w: 2, alpha: 0.55 }, { color: "#c8642a", angle: 1.6, gap: 8, w: 2, alpha: 0.45, keep: (x, y) => (x + y * 1.5) % 500 < 260 }], outline: false },
  // the sky through the leaves: orange low, violet high
  ...SKY_HOLES.map((h, i) => ({ pts: h, layers: [{ color: i % 3 === 1 ? "#e8a45a" : "#f2c47a", angle: 0.2, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#a07aa8", angle: -0.4, gap: 7, w: 2, alpha: 0.45, keep: (_x: number, y: number) => y < 110 }], outline: false as const })),
  ...CLUMPS.map((l, i) => ({ pts: l.pts, layers: tint(l.pts, l.c, { seed: i, gap: 4 }), outline: false as const })),
  ...BOUGHS.map((b) => ({ pts: b, layers: [{ color: "#4a3040", angle: 0.6, gap: 2.5, w: 1.8, alpha: 0.9 }], outline: { color: "#3a2432", w: 1.2 } })),
  ...CROWNS.map((c, i) => ({ pts: c, layers: tint(c, ["#a8452a", "#6f7d3a", "#d9a441", "#8a5a2a"][i % 4], { seed: i, gap: 5 }), outline: { color: "#4a3a3a" } })),
  // the far wood, lighter where the path goes in: the last of the day down there
  { pts: FAR, layers: [{ color: "#e8a45a", angle: 0.2, gap: 6, w: 2.2, alpha: 0.6, keep: (_x, y) => y > 400 }, { color: "#d9707a", angle: -0.3, gap: 7, w: 2, alpha: 0.4, keep: (_x, y) => y > 360 && y < 500 }, { color: "#7a6a8a", angle: 1.3, gap: 5, w: 2.2, alpha: 0.6, keep: (x, y) => y < 440 || Math.abs(x - 830) > 420 }, { color: "#4a3a52", angle: -0.3, gap: 6, w: 2, alpha: 0.5, keep: (x, y) => y < 380 || Math.abs(x - 830) > 560 }], outline: false },
  ...farTrunks,
  { pts: GROUND, layers: [{ color: "#c8642a", angle: 0.25, gap: 5, w: 2.2, alpha: 0.65 }, { color: "#d9a441", angle: -0.5, gap: 7, w: 2, alpha: 0.5 }, { color: "#6a3a2a", angle: 1.0, gap: 8, w: 1.8, alpha: 0.4, keep: (_x, y) => y > 680 }], outline: false },
  { pts: PATH, layers: [{ color: "#c9a070", angle: 0.15, gap: 5.5, w: 2.2, alpha: 0.7 }, { color: "#9a6a44", angle: 1.2, gap: 8, w: 1.8, alpha: 0.45 }, { color: "#d9a441", angle: -0.7, gap: 10, w: 1.8, alpha: 0.35 }], outline: { color: "#8a6a4a" } },
  ...midTrunks,
  ...PATH_LEAVES.map((l, i) => ({ pts: l.pts, layers: [{ color: l.c, angle: 0.5 + i, gap: 3, w: 1.8, alpha: 0.9 }], outline: { color: mix(l.c, "#2a2238", 0.5), w: 1.1 } })),
  { pts: SCUFF, layers: [{ color: "#8a6a4a", angle: 0.2, gap: 6, w: 2, alpha: 0.45 }, { color: "#c8642a", angle: 1.1, gap: 9, w: 1.8, alpha: 0.35 }], outline: false },
  { pts: BRAMBLE2, layers: tint(BRAMBLE2, "#4a4a2a", { gap: 4.5 }), outline: false },
  { pts: BRAMBLE, layers: [...tint(BRAMBLE, "#5a3a3a", { gap: 4.5 }), { color: "#6f7d3a", angle: 0.3, gap: 7, w: 2, alpha: 0.5 }], outline: false },
  ...BRAMBLE_LEAVES.map((l, i) => ({ pts: l, layers: [{ color: i % 3 ? "#5a6a2a" : "#8a2a3a", angle: 1 + i, gap: 3, w: 1.8, alpha: 0.9 }], outline: { color: "#2a3018", w: 1.1 } })),
  ...BERRIES.map((b) => ({ pts: b, layers: [{ color: "#2a1a2a", angle: 0.8, gap: 2, w: 1.6, alpha: 0.95 }], outline: false as const })),
  // the scarf's short end, behind the cane, in its shade; the cane over it; the fold over the cane
  { pts: BACK, layers: [{ color: "#9a2a1e", angle: 0.55, gap: 3.5, w: 2.1, alpha: 0.9 }, { color: "#5a1a14", angle: -0.6, gap: 5, w: 1.8, alpha: 0.55, keep: shadeSide(BACK, 0.05) }], outline: { color: "#5a1a14" } },
  { pts: CANE_T, layers: [{ color: "#4a1a2a", angle: 0.4, gap: 2.5, w: 1.8, alpha: 0.95 }, { color: "#7a3a4a", angle: -0.4, gap: 3, w: 1.4, alpha: 0.6 }], outline: { color: "#2a1018", w: 1.6, alpha: 0.9 } },
  { pts: FOLD, layers: [{ color: "#d8452e", angle: 1.5, gap: 3.5, w: 2, alpha: 0.9 }, { color: "#8a2418", angle: 0.2, gap: 5, w: 1.8, alpha: 0.5, keep: (_x, y) => y > TOP[1] + 8 }], outline: { color: "#6a2a1a" } },
  ...nearTrunks,
  { pts: FERNS_L, layers: [...tint(FERNS_L, "#5a6a2a", { gap: 4.5 }), { color: "#8a4a22", angle: 0.4, gap: 8, w: 2, alpha: 0.5 }], outline: false },
  { pts: FERNS_R, layers: [...tint(FERNS_R, "#5a6a2a", { gap: 4.5 }), { color: "#8a4a22", angle: 0.4, gap: 8, w: 2, alpha: 0.5 }], outline: false },
  ...fromMotif(KID.m), ...FACE.shapes, { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.9 }] },
];

// ---------------------------------------------------------------- what moves
const FALLING = (() => { const q = rng(77); return Array.from({ length: 12 }, () => ({ x: 200 + q() * 1200, y0: 60 + q() * 200, drift: 30 + q() * 60, ph: q(), c: AUTUMN[Math.floor(q() * AUTUMN.length)] })); })();
const ease = (x: number) => x * x * (3 - 2 * x);
export const f02 = sketch({
  id: "f02", title: "Le Sentier", loop: LOOP, shapes, lines: [...bramble, ...thorns, ...caneThorns, ...BACK_KNIT, ...litter, ...fronds, ...bracken, ...prints, ...FACE.lines],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, lift = 0.08 + 0.16 * (0.5 - 0.5 * Math.cos(TT)) + 0.04 * Math.sin(TT * 3);
    live(g, () => {
      // the scarf's long end, lifting in a breath of air: knitted rows across it, a fringe, TOM on it in white thread
      const end = scarfEnd(lift);
      pencilLive(g, end, "#c8322a", { angle: 0.02, gap: 3.5, seed: 30, alpha: 0.95 * reveal, outline: "#6a2a1a" });
      pencilLive(g, end.slice(8, 19), "#8a2418", { angle: -0.5, gap: 5, seed: 31, alpha: 0.5 * reveal });
      rows(onScarf, lift, 0.03).forEach((pts, i) => g.pen(pts, { w: 1.3, color: "#7a1e14", seed: 140 + i, wobble: 0.4, boil: 0, taper: 1, opacity: (i % 2 ? 0.45 : 0.7) * reveal, retrace: false }));
      [-0.4, 0.35].forEach((u, i) => g.pen([0.0, 0.2, 0.42].map((s) => onScarf(s, u + 0.12 * Math.sin(s * 5 + i), lift)), { w: 1.8, color: "#6a1a12", seed: 36 + i, wobble: 0.4, boil: 0, taper: 1, opacity: 0.6 * reveal, retrace: false })); // soft folds under the cane
      for (let k = -5; k <= 5; k++) { const a = onScarf(1, k / 5.6, lift), b = onScarf(1.11, k / 5.6 + 0.06 * Math.sin(TT * 2 + k), lift + 0.25 * Math.sin(TT * 2 + k)); g.pen([a, b], { w: 1.8, color: "#a8321f", seed: 40 + k, wobble: 0.3, boil: 0, taper: 1, opacity: 0.9 * reveal, retrace: false }); } // the fringe
      LETTERS.forEach((L, i) => g.pen(L.map(([s, u]) => onScarf(s, u, lift)), { w: 3.2, color: "#fbf7ee", seed: 60 + i, wobble: 0.2, boil: 0, taper: 0.3, opacity: reveal, retrace: false }));
      // leaves coming down between the trunks
      FALLING.forEach((l, i) => { const p = ((t / LOOP) + l.ph) % 1, y = l.y0 + p * 520, x = l.x + Math.sin(p * 9 + i) * 18 - p * l.drift, a = Math.sin(p * 11 + i) * 0.8; pencilLive(g, [[x - 7 * Math.cos(a), y - 7 * Math.sin(a)], [x + 3, y - 4], [x + 7 * Math.cos(a), y + 7 * Math.sin(a)], [x - 3, y + 4]], l.c, { gap: 2.5, seed: 80 + i, alpha: Math.sin(p * Math.PI) * 0.95 * reveal }); });
      // one leaf skittering up the path in little rushes, turning over as it goes
      const p = t / LOOP, run = (Math.floor(p * 4) + ease((p * 4) % 1)) / 4, x = 880 + run * 260, y = 860 - run * 90 - Math.sin(((p * 4) % 1) * Math.PI) * 8, a = run * Math.PI * 5;
      pencilLive(g, leaf(x, y, 12, a), "#d9a441", { gap: 2.5, seed: 95, alpha: Math.min(1, Math.sin(p * Math.PI) * 3) * 0.95 * reveal, outline: "#8a5a2a" });
    });
  },
});
