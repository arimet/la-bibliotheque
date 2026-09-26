// LES GRANDS BOIS PAGE 11 · L'ÉCHANGE. One idea: in spring a little boy sits at the end of the
// meadow by the first trees, and a doe comes out of the wood to look at him, and comes no closer.
// Coloured pencil, spring. The same meadow edge as on the first page: Grandmother's house far off
// on the left, the edge of the Grands Bois on the right, fresh green, a tree in blossom, flowers in
// the grass. Tom, a few months older, no scarf, sits in the grass hugging his knees and looking at
// the wood; at its edge, among the trunks, the doe stands and looks back at him.
// What moves: the doe's ear flicking, the grass in the breeze, a butterfly.
import { rng, turn, type P } from "./core";
import { beast } from "./beasts";
import { dense, figure, type Motif } from "./figures";
import { blob, bounds } from "./gallery";
import { fromMotif, live, pencilLive, sketch, tint, type Layer_, type Shape } from "./pencil";

const LOOP = 180;
type Line = { pts: P[]; w: number; color: string; alpha: number };

// ---------------------------------------------------------------- helpers
// a tree of the wood's edge, as on the first page
const tree = (x: number, g: number, h: number, seed: number, cols: string[]): Shape[] => {
  const q = rng(seed), trunk: P[] = [[x - h * 0.05, g], [x - h * 0.035, g - h * 0.5], [x - h * 0.02, g - h * 0.7], [x + h * 0.02, g - h * 0.7], [x + h * 0.035, g - h * 0.5], [x + h * 0.05, g]];
  const crowns = [0, 1, 2, 3].map((i) => blob(x + (q() - 0.5) * h * 0.35, g - h * (0.62 + q() * 0.3), h * (0.2 + q() * 0.1), h * (0.16 + q() * 0.08), seed + i, 0.25, 14));
  return [{ pts: trunk, layers: tint(trunk, "#6a5646", { angle: 1.4, gap: 5 }) }, ...crowns.map((c, i) => ({ pts: c, layers: tint(c, cols[i % cols.length], { seed: seed + i, gap: 5, dark: 0.3 }) }))];
};
// legs bent at hip and knee (degrees; + folds the lower leg back, - brings the thigh forward), set down on g
const bend = (m: Motif, x: number, g: number, h: number, f: 1 | -1, hipDeg: number, kneeDeg: number): Motif & { dy: number } => {
  const Hp: P = [x, g - 0.42 * h], K: P = [x, g - 0.2 * h];
  const map = (p: P): P => { let q = p; if (p[1] > K[1]) q = turn([q], K[0], K[1], kneeDeg * f)[0]; if (p[1] > Hp[1]) q = turn([q], Hp[0], Hp[1], hipDeg * f)[0]; return q; };
  const closed = (q: P[]) => dense([...q, q[0]], 5).slice(0, -1).map(map);
  const fills = m.fills.map((fl) => ({ ...fl, pts: closed(fl.pts) })), low = Math.max(...fills.flatMap((fl) => fl.pts.map((p) => p[1]))), dy = g - low;
  const down = (q: P[]) => q.map(([a, b]) => [a, b + dy] as P);
  return { fills: fills.map((fl) => ({ ...fl, pts: down(fl.pts) })), lines: [], parts: m.parts.map((q) => down(closed(q))), dy };
};

// ---------------------------------------------------------------- the land in spring
const HORIZON = 470;
const SKY: P[] = [[0, 0], [1600, 0], [1600, HORIZON + 40], [0, HORIZON + 40]];
const CLOUDS: P[][] = [blob(300, 120, 150, 40, 5, 0.2, 16), blob(620, 200, 110, 30, 6, 0.2, 14), blob(180, 260, 90, 24, 7, 0.2, 12)];
const HILLS: P[] = [[0, 430], [260, 386], [520, 420], [760, 370], [1000, 404], [1200, 370], [1600, 400], [1600, 520], [0, 520]];
const MEADOW: P[] = [[0, 520], [300, 506], [700, 520], [1100, 530], [1600, 560], [1600, 900], [0, 900]];
const NEAR: P[] = [[0, 800], [500, 786], [1000, 806], [1600, 790], [1600, 900], [0, 900]];
const SPRING = ["#8ab04a", "#6a9a3a", "#b0c860", "#5a8a3a", "#9ac05a"];
const TREES: Shape[] = [];
{
  const r = rng(12);
  const at = [[900, 560, 400], [990, 600, 470], [1100, 580, 520], [1210, 620, 560], [1340, 600, 600], [1470, 640, 640], [1580, 610, 620], [1260, 560, 380], [1400, 560, 360]].sort((a, b) => a[1] - b[1]);
  at.forEach(([x, g, h], i) => TREES.push(...tree(x + (r() - 0.5) * 20, g, h, 300 + i * 7, x === 900 ? ["#f0d0d8", "#f4e4e8", "#e8b8c8"] : SPRING.slice(i % 3).concat(SPRING))));
}
const WOOD_DARK: P[] = [[860, 560], [1600, 600], [1600, 280], [860, 320]];
// Grandmother's house, far off to the left, washing out on the line
const HX = 60, HG = 560, HW = 170;
const HOUSE: P[] = [[HX, HG], [HX, HG - 80], [HX + HW, HG - 80], [HX + HW, HG]], ROOF: P[] = [[HX - 12, HG - 74], [HX + HW / 2, HG - 144], [HX + HW + 12, HG - 74]], DOOR: P[] = [[HX + 60, HG], [HX + 60, HG - 40], [HX + 86, HG - 40], [HX + 86, HG]], WIN: P[] = [[HX + 116, HG - 58], [HX + 144, HG - 58], [HX + 144, HG - 30], [HX + 116, HG - 30]], CHIMNEY: P[] = [[HX + 124, HG - 110], [HX + 140, HG - 110], [HX + 140, HG - 136], [HX + 124, HG - 136]];

// ---------------------------------------------------------------- Tom, sitting in the grass, hugging his knees
const TX = 680, TG = 742, TH = 330;
const TOM = bend(figure({ x: TX, g: TG, h: TH, f: 1, robe: "tunic", head: "bare", cloth: "#6a8ab0", cloth2: "#5a4a3a", hair: "#7a5230", ink: "#000", near: [0.35, 1.45], far: [0.3, 1.35] }).m, TX, TG, TH, 1, -125, 125);
const TS = (u: number, v: number): P => [TX + u * TH, TG - v * TH + TOM.dy];
const tomFace: Line[] = [
  { pts: [TS(0.028, 0.93), TS(0.048, 0.932)], w: 2.6, color: "#2a1a14", alpha: 0.95 },
  { pts: [TS(0.064, 0.925), TS(0.074, 0.901), TS(0.062, 0.898)], w: 1.6, color: "#6a4a3a", alpha: 0.8 },
  { pts: [TS(0.036, 0.875), TS(0.05, 0.874)], w: 1.4, color: "#8a4a3a", alpha: 0.7 },
];

// ---------------------------------------------------------------- the doe, at the edge of the wood
const DOE = beast({ kind: "deer", x: 1150, g: 640, h: 150, f: -1, look: 0.2 });
const doeShapes = fromMotif(DOE);
const NEAR_EAR = doeShapes.splice(doeShapes.length - 3, 1)[0]; // it flicks; the rest stands still
const EAR_BASE: P = [(NEAR_EAR.pts[0][0] + NEAR_EAR.pts[2][0]) / 2, (NEAR_EAR.pts[0][1] + NEAR_EAR.pts[2][1]) / 2];

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: SKY, layers: [{ color: "#a8c8e0", angle: 0.2, gap: 6, w: 2.4, alpha: 0.6 }, { color: "#8ab0d8", angle: -0.3, gap: 8, w: 2, alpha: 0.4, keep: (_x, y) => y < 240 }, { color: "#e8e8c0", angle: 0.05, gap: 8, w: 2, alpha: 0.4, keep: (_x, y) => y > 330 }], outline: false },
  ...CLOUDS.map((c) => ({ pts: c, layers: [{ color: "#e0e8f0", angle: 0.3, gap: 8, w: 1.6, alpha: 0.35, keep: (_x: number, y: number) => y > bounds(c).y0 + (bounds(c).y1 - bounds(c).y0) * 0.6 }] as Layer_[], outline: { color: "#a0b0c8", w: 1.2, alpha: 0.5 } })),
  { pts: HILLS, layers: tint(HILLS, "#8aa89a", { angle: 0.3, gap: 7, dark: 0.3 }), outline: { color: "#5a7a6a" } },
  { pts: WOOD_DARK, layers: [{ color: "#3a4a2a", angle: 1.2, gap: 4, w: 2.4, alpha: 0.75 }, { color: "#5a6a3a", angle: -0.4, gap: 6, w: 2, alpha: 0.5 }], outline: false },
  { pts: MEADOW, layers: [{ color: "#9ac04a", angle: 1.35, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#5a8a3a", angle: 1.1, gap: 8, w: 2, alpha: 0.45, keep: (_x, y) => y > 640 }, { color: "#d8d870", angle: -0.6, gap: 10, w: 1.8, alpha: 0.3 }], outline: false },
  { pts: CHIMNEY, layers: tint(CHIMNEY, "#9a5a3a", { gap: 3 }) }, { pts: HOUSE, layers: tint(HOUSE, "#e6d4b0", { gap: 6 }) }, { pts: ROOF, layers: tint(ROOF, "#8a3a2a", { angle: 0.6, gap: 4 }) },
  { pts: DOOR, layers: tint(DOOR, "#5a3a22", { gap: 3 }) }, { pts: WIN, layers: [{ color: "#f2c14a", angle: 0.8, gap: 3.5, w: 2, alpha: 0.6 }] },
  ...TREES,
  ...doeShapes, { pts: NEAR_EAR.pts, layers: [], outline: false },
  ...fromMotif(TOM).map((s) => ({ ...s, layers: s.layers.map((L) => ({ ...L, gap: L.gap * 0.8 })) })),
  { pts: NEAR, layers: [{ color: "#7aa03a", angle: 1.4, gap: 4, w: 2.4, alpha: 0.75 }, { color: "#4a6a2a", angle: 1.2, gap: 7, w: 2, alpha: 0.55 }], outline: false },
];
const FLOWER_COLS = ["#f4f0e8", "#f2d04a", "#e8a0b8", "#8aa8e0", "#f4f0e8"];
const flowers: Line[] = Array.from({ length: 200 }, (_, i): Line[] => {
  const q = rng(500 + i), x = q() * 1600, y = 545 + q() ** 0.8 * 350, s = 2 + ((y - 540) / 350) * 6, c = FLOWER_COLS[Math.floor(q() * FLOWER_COLS.length)];
  if (Math.abs(x - TX - 40) < 120 && y > 560 && y < 760) return [];
  const petals: Line[] = [{ pts: [[x - s, y], [x + s, y + 0.4]], w: s * 0.9, color: c, alpha: 0.95 }, { pts: [[x, y - s * 0.8], [x + 0.3, y + s * 0.8]], w: s * 0.9, color: c, alpha: 0.95 }];
  return c === "#f4f0e8" ? [...petals, { pts: [[x - 0.8, y], [x + 0.8, y]] as P[], w: s * 0.7, color: "#e8b020", alpha: 1 }] : petals;
}).flat();
const WASHING: Line[] = [{ pts: [[HX + 190, HG - 60], [HX + 250, HG - 52], [HX + 310, HG - 58]], w: 1, color: "#4a3a30", alpha: 0.8 }, { pts: [[HX + 190, HG + 4], [HX + 190, HG - 62]], w: 2.4, color: "#6a4a30", alpha: 0.9 }, { pts: [[HX + 310, HG + 6], [HX + 310, HG - 60]], w: 2.4, color: "#6a4a30", alpha: 0.9 }];

// ---------------------------------------------------------------- what moves
const BLADES = Array.from({ length: 70 }, (_, i) => { const q = rng(700 + i); return { x: q() * 1600, y: 800 + q() * 95, h: 16 + q() * 26, ph: q(), c: q() < 0.5 ? "#4a6a2a" : "#8ab04a" }; });

export const f11 = sketch({
  // the flowers go on last, over the grass; the rest with the contours
  id: "f11", title: "L'Échange", loop: LOOP, shapes, lines: [...[...WASHING, ...tomFace].map((l, i) => ({ ...l, seed: 900 + i, at: [20 + i * 0.5, 26 + i * 0.5] as [number, number] })), ...flowers.map((l, i) => ({ ...l, seed: 1000 + i, at: [96 + (i % 20) * 0.3, 99 + (i % 20) * 0.3] as [number, number] }))],
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    live(g, () => {
      // the grass in the breeze, gusts running along it from the left
      BLADES.forEach((b, i) => { const lean = (6 + 5 * Math.sin(TT * 2 - b.x * 0.006)) * (0.6 + b.ph * 0.6); g.pen([[b.x, b.y], [b.x + lean * 0.4, b.y - b.h * 0.5], [b.x + lean, b.y - b.h]], { w: 1.7, color: b.c, seed: 100 + i, wobble: 0.3, boil: 0, taper: 1, opacity: 0.85 * reveal, retrace: false }); });
      // the doe's ear: a flick, then still, then a double flick
      const fk = (p: number, a: number, b: number) => (p > a && p < b ? Math.sin(((p - a) / (b - a)) * Math.PI) : 0);
      const deg = -28 * fk(T, 0.2, 0.26) - 22 * fk(T, 0.62, 0.66) - 22 * fk(T, 0.7, 0.74);
      pencilLive(g, turn(NEAR_EAR.pts, EAR_BASE[0], EAR_BASE[1], deg), NEAR_EAR.layers[0].color, { angle: 0.9, gap: 3, seed: 40, alpha: 0.85 * reveal, outline: (NEAR_EAR.outline || { color: "#4a3222" }).color });
      // a butterfly wandering over the flowers between them
      const bx = 910 + 140 * Math.sin(TT) + 30 * Math.sin(TT * 3), by = 610 + 50 * Math.sin(TT * 2) + 15 * Math.cos(TT * 5), flap = Math.abs(Math.sin(TT * 24)), dir = Math.cos(TT) > 0 ? 1 : -1;
      [1, -1].forEach((s, i) => pencilLive(g, [[bx, by], [bx + dir * s * 5 + 20 * s * flap, by - 20], [bx + dir * s * 4 + 24 * s * flap, by - 4], [bx + 14 * s * flap, by + 12]], "#f2d04a", { gap: 2, seed: 50 + i, alpha: 0.95 * reveal, outline: "#8a6a20" }));
      g.pen([[bx, by - 7], [bx, by + 8]], { w: 2.6, color: "#3a2a20", seed: 55, wobble: 0.1, boil: 0, taper: 0, opacity: 0.9 * reveal, retrace: false });
    });
  },
});
