// CORBENIC PAGE 1 · LE VAL STÉRILE. One idea: a knight rides down into a valley where the wheat
// has gone black on the stalk and nobody has cut it.
// Flat manuscript space, in bands: a gold sky tooled with lozenges; the far hills with Corbenic on
// its rock at the end of the valley; the village, doors boarded up, one window lit in the chapel,
// crosses over the cemetery wall; the black wheat both sides of the road; the knight on the left,
// white surcoat and red cross, on a horse in a caparison to match.
// What moves: the near wheat stirring, the chapel window's light, the glint on the gold.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, horse, lay, motif } from "./figures";
import { bounds, mix } from "./gallery";
import { diaper, gilt, glint, hand, hills, house } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0, H = hand(ROT), INK = H.ink;
const STRAW = "#6f5d38", EAR = "#1f1a14", FIELD = "#8a7442", EARTH = "#b9a36b", ROAD = "#e2d2a8";
const B = border(ROT, [0, 44]);
const FROM: P = [420, 600];

// ---------------------------------------------------------------- the bands, back to front
const SKY: P[] = [[44, 40], [1556, 40], [1556, 430], [44, 430]];
const FAR = hills(44, 1556, 360, 7, 50, 11);           // the far side of the valley
const MID = hills(44, 1556, 520, 5, 34, 23);           // the valley floor rising behind the village
const SKY_SEEN: P[] = [[44, 40], [1556, 40], ...FAR.pts.slice(0, -2).reverse()]; // the gold that shows above the hills
// Corbenic on its rock at the valley's end
const ROCK: P[] = [[1290, 400], [1300, 330], [1322, 300], [1360, 290], [1398, 300], [1418, 330], [1430, 400]];
const KEEP = (x: number, w: number, top: number): P[] => [[x - w / 2, 305], [x - w / 2, top], ...[0, 1, 2, 3, 4].flatMap((i) => { const a = x - w / 2 + (i * w) / 4.5; return [[a, top], [a, top - 8], [a + w / 9, top - 8], [a + w / 9, top]] as P[]; }), [x + w / 2, top], [x + w / 2, 305]];
const CASTLE = [KEEP(1332, 34, 248), KEEP(1392, 30, 262), KEEP(1362, 44, 222)];
// the village on the valley floor
const G0 = 612;
const HOUSES = [
  house({ x: 860, g: G0, w: 96, h: 78, roof: 46, wall: "#e4c9ad", roofC: "#a14a30", door: "boarded", win: "dark", ink: INK }),
  house({ x: 968, g: G0 + 6, w: 84, h: 70, roof: 40, wall: "#cdd3cf", roofC: "#6c7f5a", door: "boarded", win: "none", ink: INK }),
  house({ x: 1090, g: G0 - 4, w: 110, h: 118, roof: 70, wall: "#eadcc0", roofC: "#2d4f8e", door: "shut", win: "lit", bell: true, ink: INK }),
  house({ x: 1478, g: G0 + 10, w: 90, h: 74, roof: 44, wall: "#e4c9ad", roofC: "#7d5a3a", door: "boarded", win: "dark", ink: INK }),
];
const WIN_LIT: P = [1090 + 110 * 0.24, G0 - 4 - 118 + 118 * 0.3]; // the chapel's window, for the light that moves
// the cemetery behind its low wall, crosses showing over it
const WALL: P[] = [[1160, G0 + 4], [1160, G0 - 34], [1400, G0 - 30], [1400, G0 + 8]];
const CROSSES: P[][] = [1188, 1236, 1290, 1338, 1380].map((x, i) => { const t = G0 - 70 - (i % 2) * 10; return [[x - 3, G0 - 32], [x - 3, t + 16], [x - 13, t + 16], [x - 13, t + 9], [x - 3, t + 9], [x - 3, t], [x + 3, t], [x + 3, t + 9], [x + 13, t + 9], [x + 13, t + 16], [x + 3, t + 16], [x + 3, G0 - 32]]; });
// the road from the bottom left, winding down to the village
const ROADP: P[] = [[150, 870], [330, 740], [560, 690], [760, 650], [880, 616], [924, 616], [820, 660], [640, 720], [470, 790], [440, 870]];
const FIELDS: P[] = [[44, 870], [44, 600], [700, 590], [1556, 600], [1556, 870]];
// the knight, on the road near the top of the slope
const HORSE = horse({ x: 330, g: 812, h: 196, coat: "#e8dfc9", cloth: "#f0e8d6", hem: H.b, ink: INK });
const KNIGHT = figure({ x: HORSE.saddle[0], g: HORSE.saddle[1] + 0.45 * 270, h: 270, robe: "saddle", head: "coif", cloth: "#f0e8d6", ink: INK, near: [0.55, 1.25], far: [0.4, 1.1], shield: { field: "#f0e8d6", mark: H.b, ord: "cross" } });
const RIDER = motif(HORSE.m, KNIGHT.m);

// ---------------------------------------------------------------- the wheat
const r = rng(77);
const stalk = (x: number, g: number, h: number, lean: number): { stem: P[]; ear: P[] } => ({ stem: [[x, g], [x + lean * 0.4, g - h * 0.55], [x + lean, g - h]], ear: [[x + lean, g - h], [x + lean * 1.15, g - h - 14], [x + lean * 1.3, g - h - 26]] });
// rows of it across the fields, smaller further back; none on the road or where the rider stands
const inRoad = (x: number, y: number) => { const t = (870 - y) / (870 - 616); const cx = 295 + t * (902 - 295) - t * t * 60, hw = 145 * (1 - t) + 22 * t; return Math.abs(x - cx) < hw; };
const riderBox = bounds(RIDER.parts.flat());
const ROWS: { x: number; g: number; h: number; lean: number }[] = [];
for (let y = 640; y <= 860; y += 18) for (let x = 60; x < 1545; x += 24 - (y - 640) / 30) {
  const xx = x + (r() - 0.5) * 10, yy = y + (r() - 0.5) * 6, k = 0.35 + ((y - 640) / 220) * 0.65;
  if (inRoad(xx, yy) || (xx > riderBox.x0 - 10 && xx < riderBox.x1 + 10 && yy < riderBox.y1 + 6 && yy > riderBox.y0 + 120)) continue;
  ROWS.push({ x: xx, g: yy, h: 60 * k + r() * 16 * k, lean: (r() - 0.3) * 10 * k });
}
const MOVE = ROWS.filter((s, i) => i % 5 === 0 && s.g > 800), STILL = ROWS.filter((s) => !MOVE.includes(s)); // a fifth of the nearest wheat moves

// ---------------------------------------------------------------- the pen, in the order a hand draws it
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts, w, seed: sd++, op, wob: 0.5, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st(dense([...pts, pts[0]]), w, 0.9, INK, hide);
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 350 }, 46);
const skyFront = [ROCK, ...CASTLE, FAR.pts];
const village = lay(motif(...HOUSES), { at: [48, 78], seed: 2000, ink: INK, ph: 3, from: FROM });
const rider = lay(RIDER, { at: [40, 72], seed: 3000, ink: INK, ph: 5, from: FROM });
const behindRider = RIDER.parts;
const scene: Omit<Stroke, "at">[] = [
  st(FAR.pts.slice(0, -2), 1.6), ...FAR.ledges.map((l) => st(l, 1.1, 0.6, INK, [ROCK])),
  edge(ROCK, 1.5), ...CASTLE.map((q) => edge(q, 1.3)), st([[1356, 222], [1356, 196]], 1.6), st([[1356, 196], [1372, 202], [1356, 208]], 1.2, 0.9, H.b),
  st(MID.pts.slice(0, -2), 1.5, 0.9, INK, HOUSES.flatMap((h) => h.parts)), ...MID.ledges.map((l) => st(l, 1.1, 0.55, INK, HOUSES.flatMap((h) => h.parts))),
  ...village.strokes,
  edge(WALL, 1.4), ...CROSSES.map((q) => edge(q, 1.2)), ...[1190, 1250, 1310, 1370].map((x) => st([[x, G0 - 30], [x + 26, G0 - 30]], 0.8, 0.5)),
  st(ROADP.slice(0, 5), 1.5, 0.9, INK, behindRider), st(ROADP.slice(5), 1.5, 0.9, INK, behindRider),
  ...rider.strokes,
  ...STILL.flatMap((s) => { const w = stalk(s.x, s.g, s.h, s.lean); return [st(w.stem, 1.1, 0.8, STRAW, behindRider), st(w.ear, 3.4, 0.95, EAR, behindRider)]; }),
];
const diaperStrokes = [...DIA.lines.map((l) => st(l, 1, 0.45, mix(H.gold, INK, 0.45), skyFront)), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 3, 0.6, mix(H.gold, INK, 0.35), skyFront))];
const strokes = [...B.strokes, ...seq(scene, 6, 70), ...seq(diaperStrokes, 60, 84, 0.8)];

// ---------------------------------------------------------------- the colour
const washes: Wash[] = [
  gilt(SKY, ROT, [30, 64], 500, { ph: 0, from: [800, 40] }),
  { pts: FAR.pts, color: EARTH, alpha: 1, seed: 501, at: [34, 66], ph: 1, from: FROM, flat: true },
  { pts: ROCK, color: "#9d9180", alpha: 1, seed: 502, at: [36, 66], ph: 1, from: FROM, flat: true },
  ...CASTLE.map((q, i) => ({ pts: q, color: i === 2 ? "#cdd3cf" : "#b9c0bd", alpha: 1, seed: 503 + i, at: [38, 68] as [number, number], ph: 1, from: FROM, flat: true })),
  { pts: MID.pts, color: mix(EARTH, FIELD, 0.45), alpha: 1, seed: 510, at: [36, 70], ph: 2, from: FROM, flat: true },
  ...village.washes,
  { pts: WALL, color: "#cfc3a6", alpha: 1, seed: 520, at: [48, 78], ph: 3, from: FROM, flat: true },
  ...CROSSES.map((q, i) => ({ pts: q, color: "#8a7a62", alpha: 1, seed: 521 + i, at: [50, 80] as [number, number], ph: 3, from: FROM, flat: true })),
  { pts: FIELDS, color: FIELD, alpha: 1, seed: 530, at: [40, 74], ph: 4, from: FROM, flat: true },
  { pts: ROADP, color: ROAD, alpha: 1, seed: 531, at: [42, 74], ph: 4, from: FROM, flat: true },
  ...rider.washes,
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
export const c01 = page({
  id: "c01", title: "Le Val stérile", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [70, 96],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the near wheat, a gust going through it from left to right
    g.group("plain", () => MOVE.forEach((s, i) => {
      const gust = Math.sin(TT - s.x / 260) * 0.5 + 0.5, lean = s.lean + gust * 7 * (s.h / 70) + Math.sin(TT * 3 + i) * 1.2;
      const w = stalk(s.x, s.g, s.h, lean);
      g.pen(w.stem, { w: 1.1, color: STRAW, seed: 900 + i, wobble: 0.3, boil: 0.2, taper: 1, opacity: 0.8, retrace: false, progress: reveal });
      g.pen(w.ear, { w: 3.4, color: EAR, seed: 1900 + i, wobble: 0.3, boil: 0.2, taper: 1, opacity: 0.95, retrace: false, progress: reveal });
    }));
    // the one lit window: a candle behind it
    const flick = 0.75 + 0.12 * Math.sin(TT * 7) + 0.08 * Math.sin(TT * 17 + 1);
    g.group("plain", () => g.glow(WIN_LIT[0], WIN_LIT[1], 26, "#ffd27a", 0.35 * flick * reveal), { blend: "screen" });
    if (reveal < 1) return;
    glint(g, [SKY_SEEN], t, LOOP, ROT, [ROCK, ...CASTLE]);
    borderGlint(g, t, LOOP, ROT);
  },
});
