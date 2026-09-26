// CORBENIC PAGE 2 · LA CHAPELLE. One idea: inside the only lit house in the village, a monk puts a
// blessed candle into the knight's hand.
// Three pointed arches on four columns, the bays tooled in lapis and gold like a painted chapel:
// on the left the door, barred with the benches piled against it; in the middle frère Blaise,
// hooded, holding the candle out, and the knight reaching for it; on the right the altar in its red
// frontal with a row of lit candles, and over it a painted saint with a gold halo. Tiles underfoot.
// What moves: every candle flame, the light they throw, the glint on the gold.
import { type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, motif } from "./figures";
import { mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0, H = hand(ROT), INK = H.ink;
const STONE = "#d8cbb0", WOOD = "#7a5234", WOOD2 = "#9a6a42", WAX = "#f3ead2", FLOOR = 790;
const B = border(ROT, [0, 44]);
const FROM: P = [800, 520];

// ---------------------------------------------------------------- the architecture
// a pointed arch over a bay from xa to xb, springing at yc and rising `rise` (at least half the span)
const arch = (xa: number, xb: number, yc: number, rise: number, n = 14): P[] => {
  const s = xb - xa, R = (s * s / 4 + rise * rise) / s, cx = xa + R, xm = (xa + xb) / 2, aTop = Math.acos((xm - cx) / R);
  const left = Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI - ((Math.PI - aTop) * i) / n; return [cx + Math.cos(a) * R, yc - Math.sin(a) * R] as P; });
  return [...left, ...left.slice(0, -1).reverse().map(([x, y]) => [2 * xm - x, y] as P)];
};
const COLS = [120, 560, 1040, 1480], CW = 34, CAP = 330, RISE = 250;
const BAYS = COLS.slice(0, -1).map((x, i) => ({ xa: x + CW / 2, xb: COLS[i + 1] - CW / 2 }));
const bayShape = (b: { xa: number; xb: number }): P[] => [...arch(b.xa, b.xb, CAP, RISE), [b.xb, FLOOR], [b.xa, FLOOR]];
const spandrels = (b: { xa: number; xb: number }): P[] => [[b.xa, 40], [b.xb, 40], [b.xb, CAP], ...arch(b.xa, b.xb, CAP, RISE).reverse(), [b.xa, CAP]];
const WALL: P[] = [[44, 40], [1556, 40], [1556, FLOOR], [44, FLOOR]];
const COLUMNS: P[][] = COLS.map((x) => [[x - CW / 2, FLOOR], [x - CW / 2, CAP + 20], [x - CW / 2 - 8, CAP], [x + CW / 2 + 8, CAP], [x + CW / 2, CAP + 20], [x + CW / 2, FLOOR]]);
const TILES: { pts: P[]; c: string }[] = [];
for (let row = 0; row < 2; row++) for (let x = 44, k = 0; x < 1556; x += 44, k++) TILES.push({ pts: [[x, FLOOR + row * 36], [Math.min(1556, x + 44), FLOOR + row * 36], [Math.min(1556, x + 44), FLOOR + (row + 1) * 36], [x, FLOOR + (row + 1) * 36]], c: (k + row) % 2 ? "#a4533a" : "#e3d3b2" });

// the door in the left bay, and the benches piled against it
const DOOR: P[] = [...arch(236, 444, 470, 110, 8), [444, FLOOR], [236, FLOOR]];
const JUDAS: P[] = [[322, 520], [358, 520], [358, 552], [322, 552]];
const bench = (x0: number, y0: number, x1: number, y1: number, t = 14): P[] => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * t, ny = Math.cos(a) * t; return [[x0, y0], [x1, y1], [x1 + nx, y1 + ny], [x0 + nx, y0 + ny]]; };
const BENCHES: P[][] = [bench(190, 700, 500, 760), bench(214, 640, 470, 700), bench(230, 600, 520, 520), bench(260, 780, 470, 780)];
const LEGS: P[][] = [[[222, 716], [232, 716], [226, FLOOR], [216, FLOOR]], [[470, 770], [480, 772], [484, FLOOR], [474, FLOOR]]];

// the altar in the right bay, its frontal, the candles, the painted saint over it
const ALTAR: P[] = [[1100, FLOOR], [1100, 600], [1420, 600], [1420, FLOOR]], TOP: P[] = [[1088, 600], [1088, 584], [1432, 584], [1432, 600]];
const FRONTAL: P[] = [[1116, FLOOR - 8], [1116, 616], [1404, 616], [1404, FLOOR - 8]];
const CANDLES = [1140, 1190, 1236, 1284, 1330, 1380].map((x, i) => ({ x, top: 584 - (i % 3 === 1 ? 92 : i % 2 ? 76 : 64) }));
const candle = (x: number, top: number, w = 7): P[] => [[x - w, 584], [x - w, top], [x + w, top], [x + w, 584]];
const PANEL: P[] = [[1170, 560], [1170, 330], [1260, 272], [1350, 330], [1350, 560]];
const SAINT = figure({ x: 1260, g: 548, h: 230, robe: "long", head: "bare", cloth: H.a, hair: "#6b4a2a", ink: INK, near: [0.35, 1.6], far: [0.1, 0.2] });
const HALO: P[] = Array.from({ length: 18 }, (_, i) => { const a = (i / 18) * Math.PI * 2; return [SAINT.head[0] + Math.cos(a) * 24, SAINT.head[1] - 4 + Math.sin(a) * 24] as P; });

// frère Blaise and the knight
const BLAISE = figure({ x: 910, g: FLOOR, h: 440, f: -1, robe: "long", head: "hood", cloth: "#6b5a44", cloth2: "#5c4c38", ink: INK, near: [1.2, 1.45], far: [0.2, 0.5] });
const KNIGHT = figure({ x: 668, g: FLOOR, h: 470, robe: "armor", head: "coif", cloth: "#f0e8d6", ink: INK, near: [1.05, 1.5], far: [0.2, 0.4] });
const CIERGE = { x: BLAISE.hands.near[0] + 6, base: BLAISE.hands.near[1] + 30, top: BLAISE.hands.near[1] - 44 }; // held upright in his fist
const CIERGE_P: P[] = candle(CIERGE.x, CIERGE.top, 6).map(([x, y]) => [x, y === 584 ? CIERGE.base : y] as P);
// the red cross on the knight's surcoat
const CROSS: P[][] = [[[660, 470], [676, 470], [676, 590], [660, 590]], [[622, 510], [714, 510], [714, 526], [622, 526]]].map((q) => q.map(([x, y]) => [x, y] as P));

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const people = motif(KNIGHT.m, BLAISE.m), front = [...people.parts, CIERGE_P];
const saint = lay(SAINT.m, { at: [44, 70], seed: 4000, ink: INK, ph: 4, from: FROM });
const folk = lay(people, { at: [40, 72], seed: 3000, ink: INK, ph: 6, from: FROM });
// stone courses in the spandrels and on the wall behind the columns
const courses: P[][] = [];
for (let y = 70; y < CAP; y += 34) courses.push([[44, y], [1556, y]]);
const blocks: P[][] = [];
for (let y = 70, k = 0; y < CAP; y += 34, k++) for (let x = 44 + (k % 2) * 40; x < 1556; x += 80) blocks.push([[x, y], [x, y + 34]]);
const bayHoles = BAYS.map(bayShape);
const DIA = BAYS.map((b) => diaper({ x0: b.xa, y0: CAP - RISE, x1: b.xb, y1: FLOOR }, 52));
const behindAltar = [ALTAR, TOP, PANEL, ...CANDLES.map((c) => candle(c.x, c.top))];
const scene: Omit<Stroke, "at">[] = [
  ...COLUMNS.map((q) => edge(q, 1.6)), ...BAYS.map((b) => st(arch(b.xa, b.xb, CAP, RISE), 1.8)),
  ...courses.map((l) => st(l, 0.9, 0.45, INK, [...bayHoles, ...COLUMNS])), ...blocks.map((l) => st(l, 0.8, 0.4, INK, [...bayHoles, ...COLUMNS])),
  edge(DOOR, 1.6, [...BENCHES, ...front]), ...[560, 620, 680, 740].map((y) => st([[236, y], [444, y]], 2.4, 0.8, "#3b2a20", [...BENCHES, JUDAS, ...front])),
  edge(JUDAS, 1.4), st([[334, 520], [334, 552]], 1.6), st([[346, 520], [346, 552]], 1.6), st([[322, 536], [358, 536]], 1.6),
  ...BENCHES.map((q) => edge(q, 1.5, front)), ...LEGS.map((q) => edge(q, 1.3, [...BENCHES, ...front])),
  edge(ALTAR, 1.6), edge(TOP, 1.5), edge(FRONTAL, 1.3), st([[1260, 630], [1260, FLOOR - 20]], 5, 0.9, H.gold), st([[1180, 700], [1340, 700]], 5, 0.9, H.gold),
  ...CANDLES.map((c) => edge(candle(c.x, c.top), 1.1)),
  edge(PANEL, 1.6), ...saint.strokes, edge(HALO, 1.2, SAINT.m.parts),
  ...folk.strokes, edge(CIERGE_P, 1.1),
  ...TILES.map((t) => edge(t.pts, 0.9)),
];
const lattice = DIA.flatMap((d, i) => [
  ...d.lines.map((l) => st(l, 1, 0.5, mix(H.a, INK, 0.5), [spandrels(BAYS[i]), DOOR, ...BENCHES, ...front, ...behindAltar])),
  ...d.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 3.2, 0.9, H.gold, [spandrels(BAYS[i]), DOOR, ...BENCHES, ...front, ...behindAltar])),
]);
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 62, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  flat(WALL, STONE, 0, [30, 60], 500),
  ...bayHoles.map((q, i) => flat(q, H.a, 1, [32, 62], 501 + i)),
  ...COLUMNS.map((q, i) => flat(q, mix(STONE, "#ffffff", 0.3), 2, [34, 64], 510 + i)),
  ...TILES.map((t, i) => flat(t.pts, t.c, 2, [36, 66], 520 + i)),
  flat(DOOR, WOOD, 3, [38, 66], 600), flat(JUDAS, "#2a1c14", 3, [40, 66], 601),
  ...BENCHES.map((q, i) => flat(q, i % 2 ? WOOD2 : mix(WOOD2, WOOD, 0.5), 4, [40, 70], 610 + i)), ...LEGS.map((q, i) => flat(q, WOOD, 3, [40, 70], 620 + i)),
  flat(ALTAR, "#e6dcc4", 3, [38, 68], 630), flat(TOP, "#cfc2a4", 3, [38, 68], 631), flat(FRONTAL, H.b, 3, [40, 70], 632),
  ...CANDLES.map((c, i) => flat(candle(c.x, c.top), WAX, 4, [42, 72], 640 + i)),
  gilt(PANEL, ROT, [40, 70], 650, { ph: 3, from: FROM }), flat(PANEL.map(([x, y]) => [1260 + (x - 1260) * 0.88, 552 + (y - 552) * 0.9] as P), mix(H.c, "#ffffff", 0.25), 3, [42, 70], 651),
  ...saint.washes, gilt(HALO, ROT, [46, 72], 652, { ph: 5, from: FROM }),
  ...folk.washes, flat(CIERGE_P, WAX, 7, [44, 74], 660), ...CROSS.map((q, i) => flat(q, H.b, 7, [46, 76], 661 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const flame = (x: number, y: number, TT: number, k: number, s = 1): P[] => {
  const h = (18 + 3 * Math.sin(TT * 5 + k) + 2 * Math.sin(TT * 13 + k * 2)) * s, lean = 1.5 * Math.sin(TT * 7 + k) * s;
  return [[x - 4 * s, y], [x - 5 * s, y - h * 0.35], [x + lean * 0.5, y - h * 0.75], [x + lean, y - h], [x + 2 + lean * 0.5, y - h * 0.7], [x + 5 * s, y - h * 0.35], [x + 4 * s, y]];
};
const FLAMES = [...CANDLES.map((c) => [c.x, c.top] as P), [CIERGE.x, CIERGE.top] as P];
export const c02 = page({
  id: "c02", title: "La Chapelle", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [68, 94],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    g.group("plain", () => FLAMES.forEach(([x, y], i) => g.glow(x, y - 12, i === FLAMES.length - 1 ? 60 : 44, "#ffcf6a", 0.22 * reveal * (0.85 + 0.15 * Math.sin(TT * 6 + i)))), { blend: "screen" });
    g.group("plain", () => FLAMES.forEach(([x, y], i) => {
      const f = flame(x, y, TT, i * 1.7);
      g.fill(f, "#f2a93a", 0.95 * reveal); g.fill(flame(x, y - 1, TT, i * 1.7, 0.55), "#fff3c8", reveal);
      g.pen([[x, y + 1], [x, y - 5]], { w: 1.2, color: INK, seed: 800 + i, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false, progress: reveal });
    }));
    if (reveal < 1) return;
    glint(g, [PANEL, HALO], t, LOOP, ROT);
    borderGlint(g, t, LOOP, ROT);
  },
});
