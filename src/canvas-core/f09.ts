// LES GRANDS BOIS PAGE 9 · LE VIEUX CHÊNE. One idea: the animals of the wood, hundreds of them,
// sit in a ring round the Old Oak, and Tom is sitting among its roots with a white tail behind him.
// Coloured pencil, night. A round clearing under the moon; the oak in the middle, huge, every leaf
// caught by the moonlight; all round it the animals sit facing it, row behind row into the dark of
// the trees; in the front row the rabbit with the blue wool at its neck. Among the roots Tom, rust
// ears, a white tail, two cubs by him, his head turned to you. You stand in front, facing the oak.
// What moves: the oak's leaves stirring with no wind, the animals' eyes catching the moon, a
// slow shimmer of moonlight on the grass.
import { oval, rng, sample, tube, turn, type P } from "./core";
import { beast, type Kind } from "./beasts";
import { dense, figure, type Motif } from "./figures";
import { blob, bounds, mix } from "./gallery";
import { fromMotif, live, pencilLive, sketch, tint, type Layer_, type Shape } from "./pencil";

const LOOP = 180;
type Line = { pts: P[]; w: number; color: string; alpha: number };
const NIGHT = "#2a3a6a";
const MOON: P = [250, 130];

// ---------------------------------------------------------------- helpers
// legs bent at hip and knee (degrees; + folds the lower leg back, - brings the thigh forward)
const bend = (m: Motif, x: number, g: number, h: number, f: 1 | -1, hipDeg: number, kneeDeg: number): Motif => {
  const Hp: P = [x, g - 0.42 * h], K: P = [x, g - 0.2 * h];
  const map = (p: P): P => { let q = p; if (p[1] > K[1]) q = turn([q], K[0], K[1], kneeDeg * f)[0]; if (p[1] > Hp[1]) q = turn([q], Hp[0], Hp[1], hipDeg * f)[0]; return q; };
  const closed = (q: P[]) => dense([...q, q[0]], 5).slice(0, -1).map(map);
  return { fills: m.fills.map((fl) => ({ ...fl, pts: closed(fl.pts) })), lines: [], parts: m.parts.map(closed) };
};
// everything under the moon goes a little blue, and the side toward the moon catches its silver
const moonlit = (sh: Shape[], k = 0.35): Shape[] => sh.map((s) => ({ ...s, layers: s.layers.map((L) => ({ ...L, color: mix(L.color, NIGHT, k) })), outline: s.outline ? { ...s.outline, color: mix(s.outline.color, "#141a30", 0.3) } : s.outline }));
const lightSide = (pts: P[]) => { const b = bounds(pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, R = Math.max(b.x1 - b.x0, b.y1 - b.y0); return (x: number, y: number) => (x - cx) * 0.6 + (y - cy) * 0.8 < -0.15 * R; };

// ---------------------------------------------------------------- sky, trees, clearing
const SKY: P[] = [[0, 0], [1600, 0], [1600, 520], [0, 520]];
const STARS: P[][] = (() => { const q = rng(9); return Array.from({ length: 26 }, () => { const x = q() * 1600, y = q() * 300; return oval(x, y, 2.4, 2.4, 6); }).filter((o) => Math.hypot(o[0][0] - MOON[0], o[0][1] - MOON[1]) > 120); })();
const MOON_DISC: P[] = oval(MOON[0], MOON[1], 52, 52, 24);
const WOOD: P[] = (() => { const q = rng(31), top: P[] = []; for (let x = -20; x <= 1620; x += 38) top.push([x, 300 + Math.abs(x - 800) * 0.06 + (q() - 0.5) * 60 - Math.sin(x * 0.02) * 20]); return [...top, [1620, 560], [-20, 560]] as P[]; })();
const CLEARING: P[] = sample([[-20, 470], [300, 452], [800, 446], [1300, 452], [1620, 470], [1620, 900], [-20, 900]], true, 3);
const inRing = (x: number, y: number, k: number) => ((x - 800) / 800) ** 2 + ((y - 690) / 230) ** 2 < k;

// ---------------------------------------------------------------- the oak
const OAK_X = 800, OAK_G = 610;
const TRUNK: P[] = sample([[OAK_X - 150, OAK_G + 8], [OAK_X - 96, OAK_G - 70], [OAK_X - 84, OAK_G - 220], [OAK_X - 120, OAK_G - 330], [OAK_X - 40, OAK_G - 300], [OAK_X + 10, OAK_G - 360], [OAK_X + 60, OAK_G - 300], [OAK_X + 140, OAK_G - 340], [OAK_X + 92, OAK_G - 210], [OAK_X + 100, OAK_G - 70], [OAK_X + 160, OAK_G + 8]], true, 4);
const LIMBS: P[][] = [
  tube([[OAK_X - 90, OAK_G - 300], [OAK_X - 240, OAK_G - 380], [OAK_X - 400, OAK_G - 400], [OAK_X - 520, OAK_G - 360]], 40, 10),
  tube([[OAK_X + 100, OAK_G - 310], [OAK_X + 250, OAK_G - 400], [OAK_X + 420, OAK_G - 420], [OAK_X + 540, OAK_G - 380]], 42, 10),
  tube([[OAK_X - 20, OAK_G - 330], [OAK_X - 60, OAK_G - 460], [OAK_X - 140, OAK_G - 540]], 34, 8),
  tube([[OAK_X + 40, OAK_G - 340], [OAK_X + 110, OAK_G - 470], [OAK_X + 200, OAK_G - 540]], 32, 8),
];
const ROOTS: P[][] = [
  tube([[OAK_X - 110, OAK_G - 10], [OAK_X - 220, OAK_G + 10], [OAK_X - 330, OAK_G + 34]], 26, 5),
  tube([[OAK_X + 120, OAK_G - 10], [OAK_X + 240, OAK_G + 16], [OAK_X + 380, OAK_G + 30]], 28, 5),
  tube([[OAK_X - 40, OAK_G], [OAK_X - 70, OAK_G + 40], [OAK_X - 120, OAK_G + 70]], 22, 4),
  tube([[OAK_X + 60, OAK_G], [OAK_X + 110, OAK_G + 44], [OAK_X + 190, OAK_G + 64]], 24, 4),
];
const CROWN: P[][] = (() => { const q = rng(77), out: P[][] = []; for (let i = 0; i < 18; i++) { const a = q() * Math.PI * 2, r = Math.sqrt(q()), x = OAK_X + Math.cos(a) * r * 500, y = 175 + Math.sin(a) * r * 140; out.push(blob(x, y, 110 + q() * 60, 76 + q() * 40, 400 + i, 0.22, 11)); } return out.sort((a, b) => bounds(b).y0 - bounds(a).y0 + (bounds(a).x0 - bounds(b).x0) * 0); })();
const CROWN_COLS = ["#243c34", "#2e463a", "#1e3430", "#38483e"];
const crownShapes: Shape[] = CROWN.map((c, i) => ({ pts: c, layers: [
  { color: CROWN_COLS[i % 4], angle: 0.9 + (i % 5) * 0.12, gap: 4, w: 2.2, alpha: 0.9 },
  { color: "#141e2a", angle: -0.4, gap: 4.5, w: 1.9, alpha: 0.65, keep: (x, y) => !lightSide(c)(x, y) },
  { color: "#b8c4d0", angle: 1.4, gap: 5, w: 1.8, alpha: 0.5, keep: (x, y) => lightSide(c)(x, y) && (x - OAK_X) * 0.55 + (y - 175) * 1.2 < -40 }, // moonlight on the leaves, on the moon's side
] as Layer_[], outline: { color: "#141e24", w: 1.3, alpha: 0.5 } }));
const barkLines: Line[] = Array.from({ length: 16 }, (_, i) => { const q = rng(600 + i), x = OAK_X - 80 + i * 11 + (q() - 0.5) * 6; return { pts: Array.from({ length: 6 }, (_, k) => [x + Math.sin(k * 1.3 + i) * 5, OAK_G - 20 - k * 50] as P), w: 1.3, color: "#1a1a24", alpha: 0.6 }; });
const leafMarks: Line[] = (() => { const q = rng(88), out: Line[] = []; for (let i = 0; i < 420; i++) { const a = q() * Math.PI * 2, r = Math.sqrt(q()), x = OAK_X + Math.cos(a) * r * 600, y = 170 + Math.sin(a) * r * 190, b = q() * 3, lit = (x - OAK_X) * 0.5 + (y - 170) < -30; out.push({ pts: [[x, y], [x + Math.cos(b) * 7, y + Math.sin(b) * 5]], w: 2, color: lit ? "#d0dae4" : q() < 0.5 ? "#1e2e2a" : "#5a6e5e", alpha: lit ? 0.8 : 0.7 }); } return out; })();

// ---------------------------------------------------------------- the ring of animals
type Sitter = { sh: Shape[]; eyes: P[]; y: number };
const SITTERS: Kind[] = ["rabbit", "fox", "badger", "marten", "rabbit", "fox"];
const KINDS: Kind[] = ["rabbit", "rabbit", "fox", "badger", "marten", "rabbit", "boar", "fox", "badger", "rabbit", "marten", "deer"];
const sitter = (kind: Kind, x: number, g: number, h: number, f: 1 | -1, seed: number): Sitter => {
  const m = beast({ kind, x, g, h, f, sit: kind !== "deer" && kind !== "boar", look: 0.3 });
  // the far ones are only a few shapes each: the biggest parts, one pencil (the page must stay light to build)
  const all = fromMotif(m), area = (q: P[]) => { const b = bounds(q); return (b.x1 - b.x0) * (b.y1 - b.y0); };
  const keepN = h < 45 ? 3 : h < 75 ? 6 : all.length, big = new Set([...all].sort((p, q) => area(q.pts) - area(p.pts)).slice(0, keepN));
  const sh = moonlit(all.filter((s) => big.has(s)).map((s) => (h < 45 ? { ...s, layers: s.layers.slice(0, 1).map((L) => ({ ...L, gap: 3.5 })) } : s)), 0.4);
  // the eye: where the beast's own eye sits on its head
  const rH = ({ fox: 0.3, whitefox: 0.3, badger: 0.36, rabbit: 0.34, deer: 0.3, boar: 0.42, marten: 0.24 } as Record<Kind, number>)[kind] * h * 0.55;
  void seed;
  return { sh, eyes: [[m.head[0] + f * rH * 0.3, m.head[1] - rH * 0.2]], y: g };
};
const RING: Sitter[] = [];
const RX = 770, RY = 230, RC: P = [800, 690]; // the ring: its back behind the oak, its front below the page
{
  const q = rng(515);
  for (let row = 0; row < 2; row++) {
    const rx = RX + row * 90, ry = RY + row * 26;
    for (let a = Math.PI * 0.62; a < Math.PI * 2.38;) {
      const x = RC[0] + Math.cos(a) * rx, y = RC[1] + Math.sin(a) * ry, h = 18 + ((y - 450) / 450) * 110;
      a += (h * (1.2 + q() * 0.3)) / Math.hypot(rx * Math.sin(a), ry * Math.cos(a));
      if (x < -60 || x > 1660 || y > 960 || (Math.abs(x - OAK_X) < 180 && y < 640)) continue;
      const near = Math.hypot(x - 330, y - 850) < 110 + h * 0.5, kinds = h > 60 ? SITTERS : KINDS; // room round the rabbit; big ones sit
      const kind = near ? null : kinds[Math.floor(q() * kinds.length)];
      if (kind) RING.push(sitter(kind, x, y, h, x < 800 ? 1 : -1, row));
    }
  }
}
// far back, into the dark between the trees: rows and rows of them, ears and backs only
const FAR_ROWS: { pts: P[]; eyes: P[] }[] = [0, 1, 2].map((r) => {
  const q = rng(700 + r), y0 = 470 + r * 14, top: P[] = [], eyes: P[] = [];
  for (let x = -10; x <= 1610; x += 16 + q() * 10) {
    const hh = 10 + r * 3 + q() * 6, ear = q() < 0.4;
    top.push([x, y0 - hh * 0.6], [x + 4, y0 - hh], ...(ear ? [[x + 5, y0 - hh - 8], [x + 7, y0 - hh]] as P[] : []), [x + 10, y0 - hh * 0.8]);
    if (q() < 0.6) eyes.push([x + 6, y0 - hh + 3]);
  }
  return { pts: [...top, [1610, y0 + 14], [-10, y0 + 14]], eyes };
});
// hatching a shape costs its box squared times its points: the long rows go on in pieces
const pieces = (pts: P[], n: number): P[][] => { const top = pts.slice(0, -2), yb = pts[pts.length - 1][1], out: P[][] = []; for (let k = 0; k < n; k++) { const x0 = -10 + (k * 1620) / n, x1 = -10 + ((k + 1) * 1620) / n, seg = top.filter(([x]) => x >= x0 && x <= x1); if (seg.length) out.push([...seg, [seg[seg.length - 1][0], yb], [seg[0][0], yb]]); } return out; };

// ---------------------------------------------------------------- the front row: the rabbit with the blue wool
const RABBIT = beast({ kind: "rabbit", x: 330, g: 850, h: 124, f: 1, sit: true, look: 0.3 });
const WOOL: P[] = (() => { const [hx, hy] = RABBIT.head, r = 0.34 * 124 * 0.55; return sample([[hx - r * 1.3, hy + r * 0.7], [hx - r * 0.2, hy + r * 1.05], [hx + r * 0.3, hy + r * 1.2], [hx + r * 0.2, hy + r * 1.55], [hx - r * 0.4, hy + r * 1.4], [hx - r * 1.4, hy + r * 1.05]], true, 3); })();
const WOOL_ENDS: Line[] = (() => { const [hx, hy] = RABBIT.head, r = 0.34 * 124 * 0.55; return [{ pts: [[hx - r * 1.1, hy + r * 1.1], [hx - r * 1.4, hy + r * 1.9], [hx - r * 1.2, hy + r * 2.3]] as P[], w: 3, color: "#4a6aa8", alpha: 0.9 }, { pts: [[hx - r * 1.0, hy + r * 1.15], [hx - r * 0.8, hy + r * 2.0]] as P[], w: 3, color: "#4a6aa8", alpha: 0.9 }]; })();
const FRONT: Sitter[] = [];

// ---------------------------------------------------------------- Tom among the roots, and two cubs
const TH = 250, TX = 990, TG = OAK_G + 36 + 0.22 * TH; // his seat: a root
const TOM = bend(figure({ x: TX, g: TG, h: TH, f: -1, robe: "tunic", head: "bare", cloth: "#6a8ab0", cloth2: "#5a4a3a", hair: "#7a5230", ink: "#000", near: [0.3, 1.2], far: [0.2, 0.9] }).m, TX, TG, TH, -1, -90, 90);
const TS = (u: number, v: number): P => [TX - u * TH, TG - v * TH];
const TOM_EARS: P[][] = [[TS(-0.035, 0.97), TS(-0.1, 1.085), TS(-0.075, 0.93)], [TS(0.0, 0.985), TS(-0.03, 1.125), TS(-0.05, 0.975)]];
// his hair, over the top and the back of his head (he faces left: his back is to the right)
const HAIR: P[] = (() => { const [cx, cy] = TS(0.012, 0.915), r = 0.062 * TH; return [...Array.from({ length: 9 }, (_, i) => { const a = -1.25 - (i / 8) * 2.5; return [cx - Math.cos(a) * r * 1.1, cy + Math.sin(a) * r * 1.12] as P; }), ...Array.from({ length: 7 }, (_, i) => { const a = -3.75 + (i / 6) * 2.5; return [cx - Math.cos(a) * r * 0.8 - 0.012 * TH, cy + Math.sin(a) * r * 0.78 - 0.01 * TH] as P; })]; })();
const TOM_TAIL: P[] = sample([TS(-0.08, 0.46), TS(-0.22, 0.5), TS(-0.38, 0.46), TS(-0.52, 0.3), TS(-0.5, 0.26), TS(-0.36, 0.33), TS(-0.2, 0.37), TS(-0.08, 0.39)], true, 3);
const TAIL_SHADE: P[] = sample([TS(-0.1, 0.4), TS(-0.22, 0.38), TS(-0.36, 0.34), TS(-0.5, 0.265), TS(-0.4, 0.37), TS(-0.24, 0.43), TS(-0.1, 0.43)], true, 3);
const TAIL_BASE = TS(-0.08, 0.42);
const tomFace: Line[] = [
  { pts: [TS(0.028, 0.93), TS(0.048, 0.932)], w: 2.8, color: "#2a1a14", alpha: 0.95 },
  { pts: [TS(0.064, 0.925), TS(0.074, 0.901), TS(0.062, 0.898)], w: 1.4, color: "#6a4a3a", alpha: 0.8 },
];
const CUBS = [sitter("fox", 1110, OAK_G + 78, 62, -1, 7), sitter("fox", 890, OAK_G + 70, 56, 1, 8)];

// ---------------------------------------------------------------- you, in front, facing the oak
const KID = figure({ x: 610, g: 896, h: 340, f: 1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.12, 0.2], far: [0.08, 0.15] });
const BACK_OF_HEAD = blob(KID.head[0] + 6, KID.head[1], 21, 25, 8, 0.1, 14);

// ---------------------------------------------------------------- the page, back to front
const byDepth = (a: Sitter, b: Sitter) => a.y - b.y;
const back = RING.filter((s) => s.y < OAK_G).sort(byDepth), front = [...RING.filter((s) => s.y >= OAK_G), ...FRONT].sort(byDepth);
const shapes: Shape[] = [
  { pts: SKY, layers: [
    { color: "#1e2a4a", angle: 0.25, gap: 4, w: 2.4, alpha: 0.85, keep: (x, y) => Math.hypot(x - MOON[0], y - MOON[1]) > 90 },
    { color: "#4a3a6a", angle: -0.5, gap: 5.5, w: 2, alpha: 0.5, keep: (x, y) => Math.hypot(x - MOON[0], y - MOON[1]) > 60 },
    { color: "#141c34", angle: 1.1, gap: 6, w: 2, alpha: 0.5, keep: (x, y) => Math.hypot(x - MOON[0], y - MOON[1]) > 200 }], outline: false },
  { pts: MOON_DISC, layers: [{ color: "#e8ecf0", angle: 0.4, gap: 6, w: 1.6, alpha: 0.4 }], outline: { color: "#8a94b0", w: 1.2 } },
  ...STARS.map((p) => ({ pts: p, layers: [] as Layer_[], outline: false as const })),
  { pts: WOOD, layers: [{ color: "#141a2e", angle: 1.3, gap: 4, w: 2.4, alpha: 0.9 }, { color: "#2a2a4a", angle: -0.3, gap: 5, w: 2, alpha: 0.6 }], outline: false },
  { pts: CLEARING, layers: [
    { color: "#5a6a7a", angle: 0.2, gap: 5, w: 2.1, alpha: 0.7 },
    { color: "#8a9aaa", angle: -0.45, gap: 7, w: 1.8, alpha: 0.45, keep: (x, y) => inRing(x, y, 1) },          // the moonlit grass inside the ring
    { color: "#1e2a3a", angle: 0.9, gap: 4.5, w: 2.1, alpha: 0.65, keep: (x, y) => !inRing(x, y, 1.1) },          // and the dark outside it
    ], outline: false },
  ...FAR_ROWS.flatMap((r, i) => pieces(r.pts, 8).map((pts) => ({ pts, layers: [{ color: mix("#2a2a3a", "#4a4a5a", i * 0.3), angle: 1.2, gap: 3.5, w: 2, alpha: 0.85 }] as Layer_[], outline: { color: "#10141e", w: 1.2 } }))),
  ...back.flatMap((s) => s.sh),
  ...moonlit(LIMBS.map((p) => ({ pts: p, layers: tint(p, "#4a4238", { angle: 1.1, gap: 4 }), outline: { color: "#1a1814" } })), 0.3),
  ...crownShapes,
  ...moonlit([{ pts: TRUNK, layers: [{ color: "#4a4238", angle: 1.45, gap: 4, w: 2.2, alpha: 0.85 }, { color: "#1a1a24", angle: 0.4, gap: 5, w: 2, alpha: 0.65, keep: (x: number) => x > OAK_X - 30 }, { color: "#c0c8d4", angle: 1.5, gap: 6, w: 1.6, alpha: 0.45, keep: (x: number) => x < OAK_X - 60 }], outline: { color: "#1a1814", w: 2 } }], 0.25),
  ...moonlit(ROOTS.map((p) => ({ pts: p, layers: tint(p, "#4a4238", { angle: 0.3, gap: 4 }), outline: { color: "#1a1814" } })), 0.25),
  ...CUBS[1].sh,
  { pts: TOM_TAIL, layers: [], outline: false }, // its place, kept for the live tail
  ...moonlit(fromMotif(TOM), 0.25), { pts: HAIR, layers: tint(HAIR, mix("#7a5230", NIGHT, 0.2), { gap: 3 }), outline: { color: "#3a2616", w: 1.2 } }, ...TOM_EARS.map((p) => ({ pts: p, layers: [{ color: "#c8642a", angle: 0.4, gap: 2.5, w: 1.8, alpha: 0.95 }], outline: { color: "#6a2a14", w: 1.2 } })),
  ...CUBS[0].sh,
  ...front.flatMap((s) => s.sh),
  ...moonlit(fromMotif(RABBIT), 0.2), { pts: WOOL, layers: [{ color: "#4a6aa8", angle: 0.3, gap: 2.5, w: 2, alpha: 0.95 }], outline: { color: "#2a3a6a", w: 1.2 } },
  ...moonlit(fromMotif(KID.m), 0.3), { pts: BACK_OF_HEAD, layers: tint(BACK_OF_HEAD, mix("#5a3a22", NIGHT, 0.3), { gap: 3.5 }), outline: { color: "#2a1a14" } },
];
const grass: Line[] = Array.from({ length: 90 }, (_, i) => { const q = rng(300 + i), x = q() * 1600, y = 700 + q() * 195, h = 10 + q() * 16; return { pts: [[x, y], [x + (q() - 0.4) * 8, y - h]] as P[], w: 1.5, color: q() < 0.5 ? "#2a3a4a" : "#8a9aaa", alpha: 0.75 }; });

// ---------------------------------------------------------------- what moves
const EYES = [...RING, ...FRONT, ...CUBS].flatMap((s) => s.eyes).concat(FAR_ROWS.flatMap((r) => r.eyes)).map((p, i) => ({ p, ph: rng(900 + i)() }));
const LEAVES = (() => { const q = rng(66); return Array.from({ length: 22 }, () => { const a = -Math.PI * (0.05 + q() * 0.9), x = OAK_X + Math.cos(a) * (430 + q() * 120), y = 175 + Math.sin(a) * (140 + q() * 40); return { x, y, ph: q(), c: q() < 0.5 ? "#b8c4d0" : "#46584a" }; }); })();

export const f09 = sketch({
  id: "f09", title: "Le Vieux Chêne", loop: LOOP, shapes, lines: [...barkLines, ...leafMarks, ...grass, ...tomFace, ...WOOL_ENDS],
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    live(g, () => {
      // the oak's leaves turn on their stalks, though there is no wind
      LEAVES.forEach((l, i) => { const a = Math.sin(TT * 2 + l.ph * 6.28) * 0.9 + 0.4 * Math.sin(TT * 3 + i); pencilLive(g, [[l.x - 8 * Math.cos(a), l.y - 8 * Math.sin(a)], [l.x + 3, l.y - 4], [l.x + 8 * Math.cos(a), l.y + 8 * Math.sin(a)], [l.x - 3, l.y + 4]], l.c, { gap: 2.5, seed: 80 + i, alpha: 0.9 * reveal, outline: "#141e24" }); });
      // eyes catching the moon: each one lights now and then, and goes out
      EYES.forEach((e, i) => { const k = Math.sin(TT * 2 + e.ph * 6.28); if (k < 0.55) return; const a = ((k - 0.55) / 0.45) * reveal, [x, y] = e.p; g.pen([[x - 1.6, y], [x + 1.6, y + 0.4]], { w: 3.2, color: "#eef2f6", seed: 200 + i, wobble: 0.2, boil: 0, taper: 0, opacity: a, retrace: false }); });
      // Tom's white tail sweeps the leaves behind him
      const sw = 8 * Math.sin(TT * 2);
      pencilLive(g, turn(TOM_TAIL, TAIL_BASE[0], TAIL_BASE[1], sw), "#e4e2dc", { angle: 0.5, gap: 4.5, seed: 60, alpha: 0.8 * reveal, outline: "#5a6078" });
      pencilLive(g, turn(TAIL_SHADE, TAIL_BASE[0], TAIL_BASE[1], sw), "#8a94b0", { angle: -0.6, gap: 4.5, seed: 61, alpha: 0.6 * reveal });
      // a slow shimmer of moonlight crossing the grass
      for (let k = 0; k < 5; k++) { const p = (T + k / 5) % 1, x = 120 + p * 1360, y = 700 + 40 * Math.sin(k * 2.1) + 30 * p; g.pen([[x - 40, y], [x, y - 3], [x + 40, y]], { w: 2, color: "#d8e0ea", seed: 300 + k, wobble: 0.3, boil: 0, taper: 1, opacity: 0.45 * Math.sin(p * Math.PI) * reveal, retrace: false }); }
    });
  },
});
