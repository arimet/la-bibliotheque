// LES GRANDS BOIS PAGE 6 · LA NUIT. One idea: lost in the dark, arms out, the child meets two eyes
// at knee height: the white fox, sniffing the air; and far off between the trunks, a small still light.
// Coloured pencil, deep night: Prussian blue, violet, black-green laid thick, one over the other, the
// paper nearly gone. The child on the left, arms stretched out in front, a scratch on the cheek. Before
// it, low down, the white fox sitting, barely there but for its eyes, its nose lifted to smell. Far
// away between the trunks a small yellow light that does not move.
// What moves: the eyes blinking, the fox's nose working, mist drifting low; the far light holds still.
import { oval, rng, sample, type Gfx, type P } from "./core";
import { figure, type Figure } from "./figures";
import { mix } from "./gallery";
import { fromMotif, live, pencilLive, shadeSide, sketch, type Shape } from "./pencil";

const LOOP = 180;

// ---------------------------------------------------------------- helpers
const trunk = (x: number, g: number, w: number, color: string, lean = 0): P[] => [[x - w * 0.62, g + 4], [x - w * 0.5, g - 30], [x - w * 0.45 + lean * 0.5, g * 0.45], [x - w * 0.42 + lean, -20], [x + w * 0.42 + lean, -20], [x + w * 0.45 + lean * 0.5, g * 0.45], [x + w * 0.5, g - 30], [x + w * 0.65, g + 4]];
// night colouring: the pencil all over, a darker one crossing it all over, the darkest on the shade side
const night = (pts: P[], color: string, o: { angle?: number; gap?: number } = {}): Shape["layers"] => { const a = o.angle ?? 1.0, gp = o.gap ?? 4.5; return [{ color, angle: a, gap: gp, w: 2.2, alpha: 0.85 }, { color: mix(color, "#0a0a18", 0.35), angle: a - 1.2, gap: gp * 1.1, w: 2.1, alpha: 0.7 }, { color: mix(color, "#06060e", 0.55), angle: a + 0.6, gap: gp * 1.4, w: 1.9, alpha: 0.6, keep: shadeSide(pts, 0.05) }]; };
// something pale seen in the dark: its own colour thin, the night laid across it
const dim = (pts: P[], color: string, k = 1): Shape["layers"] => [{ color: mix(color, "#3a4060", 0.45), angle: 0.9, gap: 4.5, w: 2, alpha: 0.7 }, { color: "#1e2a4a", angle: -0.4, gap: 5.5 / k, w: 2, alpha: 0.5 * k }, { color: "#141428", angle: 1.6, gap: 7 / k, w: 1.8, alpha: 0.5 * k, keep: shadeSide(pts, -0.1) }];
const headOf = (F: Figure, h: number, f: 1 | -1, hair: string) => {
  const [cx, cy] = F.head, rx = 0.056 * h, ry = 0.07 * h, S = (u: number, v: number): P => [cx + f * u * rx, cy + v * ry];
  const cap: P[] = [...Array.from({ length: 12 }, (_, i) => { const a = -1.05 - (i / 11) * 2.9; return S(Math.cos(a) * 1.14, Math.sin(a) * 1.12); }), S(-0.45, 0.4), S(-0.15, -0.1), S(0.2, -0.45), S(0.45, -0.7)];
  const w = Math.max(1.2, h / 200);
  return {
    shapes: [{ pts: cap, layers: dim(cap, hair, 1.2), outline: { color: "#0e0a10" } }] as Shape[],
    lines: [
      { pts: [S(0.36, -0.04), S(0.54, -0.02)], w: Math.max(3, h / 80), color: "#0e0a0e", alpha: 0.95 },                   // the eye, wide
      { pts: [S(0.93, -0.05), S(1.14, 0.2), S(0.95, 0.3)], w: w * 1.2, color: "#6a4a50", alpha: 0.9 },
      { pts: [S(0.5, 0.6), S(0.74, 0.56)], w, color: "#5a2a3a", alpha: 0.85 },
      // the scratch the branch left on the cheek
      { pts: [S(0.15, 0.18), S(0.42, 0.3), S(0.66, 0.36)], w: 2, color: "#d0302a", alpha: 0.95 }, { pts: [S(0.28, 0.3), S(0.5, 0.4)], w: 1.4, color: "#b82a24", alpha: 0.85 },
    ],
  };
};
const pen = (g: Gfx, pts: P[], w: number, color: string, seed: number, opacity: number) => g.pen(pts, { w, color, seed, wobble: 0.4, boil: 0, taper: 1, opacity, retrace: false });

// ---------------------------------------------------------------- the dark
const DARK: P[] = [[0, 0], [1600, 0], [1600, 900], [0, 900]];
const LIGHT: P = [1215, 492];
const glow = (x: number, y: number) => Math.hypot(x - LIGHT[0], (y - LIGHT[1]) * 1.3) * 1.5;
const GROUND: P[] = [[0, 660], [600, 640], [1200, 650], [1600, 640], [1600, 900], [0, 900]];
const r = rng(66);
const FAR = [980, 1060, 1140, 1290, 1370, 1450, 820, 700].map((x) => trunk(x + (r() - 0.5) * 20, 600 - r() * 20, 14 + r() * 18, "#141828"));
const MID = [[260, 680, 70], [1030, 690, 60], [1500, 700, 90], [1160, 650, 36]].map(([x, g, w], i) => trunk(x, g, w, "#10141e", (i - 1.5) * 8));
const NEAR = [[40, 950, 190], [1580, 960, 170]].map(([x, g, w], i) => trunk(x, g, w, "#0c1014", i ? -14 : 16));
const BRANCH: P[] = [[0, 180], [220, 230], [420, 300], [520, 330], [430, 318], [240, 262], [0, 216]]; // the branch that caught the cheek, low over the way

// ---------------------------------------------------------------- the child, arms out
const KH = 340, KID = figure({ x: 560, g: 862, h: KH, f: 1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [1.5, 1.58], far: [1.38, 1.5] });
const FACE = headOf(KID, KH, 1, "#5a3a22");
// the skin catches a little of the far glow on the side turned to it: a pale cheek and brow, the rest in the night
const lit = (pts: P[]): Shape["layers"] => { const b = pts.reduce((m, p) => Math.max(m, p[0]), -1e9), a = pts.reduce((m, p) => Math.min(m, p[0]), 1e9); return [{ color: "#8a7a80", angle: 0.9, gap: 3.5, w: 2, alpha: 0.8 }, { color: "#e8d0b4", angle: 0.3, gap: 3, w: 2, alpha: 0.85, keep: (x) => x > a + (b - a) * 0.45 }, { color: "#1e2a4a", angle: -0.5, gap: 6, w: 1.8, alpha: 0.45, keep: (x) => x < a + (b - a) * 0.4 }]; };
const kidShapes: Shape[] = fromMotif(KID.m).map((s, i) => ({ ...s, layers: KID.m.fills[i].color === "#ecd0ad" ? lit(s.pts) : dim(s.pts, KID.m.fills[i].color), outline: { color: "#08080e", alpha: 0.8 } }));

// ---------------------------------------------------------------- the white fox, sitting low, its nose up
// drawn here, not from the kit: a long pointed muzzle lifted to smell, big ears, the brush curled round its feet.
// White in the dark: pale pencil laid thick over the dark sheet, a cool shade under it
const FX = 960, FG = 868, FH = 128, F = -1, fS = (u: number, v: number): P => [FX + F * u * FH, FG - v * FH];
const fP = (pts: number[][], per = 4) => sample(pts.map(([u, v]) => fS(u, v)), true, per);
const FOX_HAUNCH = oval(...fS(-0.2, 0.2), 0.22 * FH, 0.2 * FH, 18);
const FOX_BODY = fP([[-0.32, 0.26], [-0.2, 0.52], [-0.08, 0.74], [0.06, 0.78], [0.13, 0.62], [0.13, 0.42], [0.02, 0.3], [-0.1, 0.12]]);
const FOX_LEGS = [[-0.005, 0.05], [0.075, 0.13]].map(([u0, u1]) => fP([[u0, 0.44], [u1, 0.44], [u1 + 0.015, 0.05], [u1 + 0.05, 0.0], [u0 + 0.01, 0.0], [u0 + 0.01, 0.05]], 2)); // far, near
const FOX_HEAD = fP([[-0.1, 0.83], [-0.08, 0.94], [0.0, 0.98], [0.1, 0.97], [0.24, 0.99], [0.36, 1.03], [0.395, 1.02], [0.36, 0.99], [0.22, 0.92], [0.12, 0.83], [0.02, 0.76], [-0.08, 0.76]], 3);
const ear = (u: number, tip: number) => fP([[u - 0.06, 0.92], [u + tip, 1.24], [u + 0.06, 0.96]], 2);
const FOX_EARS = [ear(-0.01, -0.06), ear(-0.1, -0.08)]; // near, far
const EAR_IN = fP([[-0.04, 0.95], [-0.065, 1.16], [0.03, 0.965]], 2);
const FOX_TAIL = fP([[-0.4, 0.24], [-0.43, 0.1], [-0.32, 0.01], [0.0, -0.01], [0.28, 0.02], [0.37, 0.09], [0.3, 0.13], [0.16, 0.11], [0.0, 0.12], [-0.22, 0.15], [-0.33, 0.24]]);
// pale on the dark: thick near-white pencil, a second one crossing it, a cool shade on the underside
const white = (pts: P[]): Shape["layers"] => [{ color: "#f2ece0", angle: 0.9, gap: 2.4, w: 2.3, alpha: 0.95 }, { color: "#fbf6ea", angle: -0.5, gap: 2.8, w: 2.1, alpha: 0.85 }, { color: "#8a96c0", angle: 1.6, gap: 4, w: 1.8, alpha: 0.4, keep: shadeSide(pts, 0.3) }];
const RIM = { color: "#c8cad8", alpha: 0.7 };
const foxShapes: Shape[] = [
  { pts: FOX_EARS[1], layers: [{ color: "#b8bccc", angle: 1.2, gap: 3, w: 2, alpha: 0.9 }], outline: RIM },
  { pts: FOX_LEGS[0], layers: [{ color: "#b8bccc", angle: 1.5, gap: 3, w: 2, alpha: 0.9 }], outline: RIM },
  ...[FOX_HAUNCH, FOX_BODY, FOX_LEGS[1], FOX_HEAD, FOX_EARS[0]].map((q) => ({ pts: q, layers: white(q), outline: RIM })),
  { pts: EAR_IN, layers: [{ color: "#6a6480", angle: 1.4, gap: 3, w: 1.6, alpha: 0.8 }], outline: false as const },
  { pts: FOX_TAIL, layers: white(FOX_TAIL), outline: RIM },
];
const foxParts = foxShapes.map((q) => q.pts);
const FOX_LINES = [
  { pts: [fS(0.37, 1.0), fS(0.26, 0.96), fS(0.17, 0.925)], w: 1.4, color: "#6a7090", alpha: 0.7 },                   // the mouth
  { pts: [fS(0.1, 0.72), fS(0.12, 0.6), fS(0.11, 0.48)], w: 1.4, color: "#9aa0b8", alpha: 0.6 },                       // the ruff at the chest
];
// its eyes: one in profile, the far one just showing past the brow
const EYES: P[] = [fS(0.13, 0.925), fS(0.19, 0.94)];
const NOSE_AT = fS(0.385, 1.02);

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: DARK, layers: [{ color: "#1e2a4a", angle: 0.9, gap: 4, w: 2.4, alpha: 0.85, keep: (x, y) => glow(x, y) > 40 }, { color: "#3a2a4e", angle: -0.4, gap: 4.5, w: 2.2, alpha: 0.7, keep: (x, y) => glow(x, y) > 70 }, { color: "#0e1a16", angle: 1.6, gap: 5, w: 2.2, alpha: 0.7, keep: (x, y) => glow(x, y) > 150 }, { color: "#0a0a14", angle: 0.3, gap: 6, w: 2, alpha: 0.6, keep: (x, y) => glow(x, y) > 260 }, { color: "#6a5a4a", angle: 0.2, gap: 6, w: 1.8, alpha: 0.35, keep: (x, y) => glow(x, y) < 90 }], outline: false },
  ...FAR.map((q) => ({ pts: q, layers: night(q, "#141828", { angle: 1.45, gap: 4 }), outline: false as const })),
  { pts: GROUND, layers: [{ color: "#1a2622", angle: 0.2, gap: 4.5, w: 2.2, alpha: 0.7 }, { color: "#2a2238", angle: -0.9, gap: 6, w: 2, alpha: 0.6 }, { color: "#0e1210", angle: 1.2, gap: 7, w: 2, alpha: 0.5, keep: (_x, y) => y > 760 }], outline: false },
  // the light, far and small: a lamp's flame in a window, and the warm round it
  { pts: oval(LIGHT[0], LIGHT[1], 12, 10, 12), layers: [{ color: "#c88a3a", angle: 0.4, gap: 3, w: 1.6, alpha: 0.5 }], outline: false },
  { pts: oval(LIGHT[0], LIGHT[1], 6, 6, 10), layers: [{ color: "#f2c14a", angle: 0.8, gap: 2, w: 1.8, alpha: 0.95 }, { color: "#ffe08a", angle: -0.8, gap: 2.5, w: 1.6, alpha: 0.9 }], outline: false },
  ...MID.map((q) => ({ pts: q, layers: night(q, "#10141e", { angle: 1.45, gap: 4 }), outline: false as const })),
  { pts: BRANCH, layers: night(BRANCH, "#10141a", { angle: 0.4, gap: 4 }), outline: false },
  ...foxShapes,
  ...kidShapes, ...FACE.shapes,
  ...NEAR.map((q) => ({ pts: q, layers: night(q, "#0c1014", { angle: 1.45, gap: 4 }), outline: false as const })),
];
const twigs = Array.from({ length: 10 }, (_, i) => { const q = rng(1600 + i), t = 0.2 + q() * 0.7, x = t * 480, y = 200 + t * 110; return { pts: [[x, y], [x + 20 + q() * 30, y + (q() - 0.3) * 40], [x + 40 + q() * 40, y + (q() - 0.2) * 60]] as P[], w: 2, color: "#0c1014", alpha: 0.9 }; });
const leaves = Array.from({ length: 60 }, (_, i) => { const q = rng(1700 + i), y = 650 + q() * 250, x = q() * 1600, s = 4 + (y - 640) * 0.025, a = q() * 3; return { pts: [[x - Math.cos(a) * s, y - Math.sin(a) * s * 0.5], [x + Math.cos(a) * s, y + Math.sin(a) * s * 0.5]] as P[], w: 2.2, color: q() < 0.5 ? "#2a2238" : "#2a3226", alpha: 0.8, hide: [...KID.m.parts, ...foxParts] }; });

// ---------------------------------------------------------------- what moves
const NOSE = oval(NOSE_AT[0] + 1, NOSE_AT[1], 3.6, 3, 8);
const MIST = Array.from({ length: 14 }, (_, i) => { const q = rng(1800 + i), len = 160 + q() * 260; return { y: 740 + q() * 150, len, x0: q() * 1600, laps: 1 + Math.floor(q() * 2), ph: q() * 6.28 }; });
// a night this dark is drawn on a grey-blue sheet, the pencils over it: no cream left to glare between strokes
const NIGHT_PAPER = "#2a2e44";
export const f06 = sketch({
  id: "f06", title: "La Nuit", loop: LOOP, paper: NIGHT_PAPER, shapes, lines: [...twigs, ...leaves, ...FACE.lines, ...FOX_LINES],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, p = t / LOOP;
    live(g, () => {
      // mist drifting low: pale breaths going by, round the page once or twice in the loop
      MIST.forEach((m, i) => { const x = ((m.x0 + p * m.laps * (1600 + m.len)) % (1600 + m.len)) - m.len * 0.5, y = m.y + Math.sin(TT + m.ph) * 6; pen(g, [[x - m.len * 0.5, y], [x, y - 4], [x + m.len * 0.5, y + 1]], 10 + (i % 3) * 5, "#5a5e7e", 300 + i, 0.18 * reveal); });
      // the fox's nose: little sniffs, three bursts in the loop
      const burst = Math.max(0, Math.sin(TT * 3)), dy = -Math.abs(Math.sin(TT * 27)) * 2.4 * burst;
      pencilLive(g, NOSE.map(([x, y]) => [x, y + dy] as P), "#1a1418", { gap: 1.5, seed: 20, alpha: reveal, outline: "#0a0808" });
      pen(g, [[NOSE_AT[0] - 1, NOSE_AT[1] - 1 + dy], [NOSE_AT[0] + 1, NOSE_AT[1] - 1.5 + dy]], 1.6, "#8a8e9e", 22, 0.7 * reveal);
      // the eyes: shining, and twice in the loop they shut and open again
      const blink = (u: number) => { const d = Math.min(Math.abs(u - 0.3), Math.abs(u - 0.78)); return d < 0.02 ? 0.15 : 1; };
      const open = blink(p);
      EYES.forEach(([x, y], k) => {
        pen(g, [[x - 4, y], [x + 4, y + 0.5]], 7 * open + 1.5, "#c8d860", 30 + k, 0.35 * reveal);          // the shine round it
        pen(g, [[x - 2.5, y], [x + 2.5, y + 0.3]], 4.5 * open + 1, "#f2f4a0", 32 + k, 0.95 * reveal);      // the eye
      });
    });
  },
});
