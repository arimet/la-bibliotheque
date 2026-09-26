// CORBENIC PAGE 8 · LE CORTÈGE. One idea: the Grail procession still going round the great hall,
// with no one alive in it.
// The hall's arcade across the back, a red curtain drawn over the last bay on the right. Out of it
// comes the procession, right to left: a youth in white carrying the lance that bleeds, two women
// with candelabra, a third holding the covered cup. All grey-faced, all dead. It goes behind the
// column on the left and comes out of the curtain again. On the left, in front of that column, the
// knight waiting for the cup to pass.
// What moves: the procession, walking; the candle flames they carry; the blood running down the lance.
import { type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, paintMotif, type Figure } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { masked, page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 540, ROT = 0.7, H = hand(ROT), INK = H.ink;
const STONE = "#8f8a78", STONE2 = "#77725f", CURT = "#6a1a14", DAIS = "#6b5f4a";
const B = border(ROT, [0, 44]);
const FLOOR = 740, WALK = 730; // the far line the procession walks on
const FROM: P = [800, 500];

// ---------------------------------------------------------------- the hall
const WALL: P[] = [[44, 40], [1556, 40], [1556, FLOOR], [44, FLOOR]];
const COLS = [420, 700, 980, 1260], CW = 44, CAP = 300;
const arch = (xa: number, xb: number, yc: number): P[] => { const cx = (xa + xb) / 2, R = (xb - xa) / 2; return Array.from({ length: 15 }, (_, i) => { const a = Math.PI - (i / 14) * Math.PI; return [cx + Math.cos(a) * R, yc - Math.sin(a) * R * 0.8] as P; }); };
const BAYS = [[44, COLS[0] - CW / 2], ...COLS.slice(0, -1).map((x, i) => [x + CW / 2, COLS[i + 1] - CW / 2]), [COLS[3] + CW / 2, 1556]].map(([a, b]) => ({ a, b }));
const bay = (b: { a: number; b: number }): P[] => [...arch(b.a, b.b, CAP), [b.b, FLOOR], [b.a, FLOOR]];
const COLUMN = (x: number): P[] => [[x - CW / 2, FLOOR + 30], [x - CW / 2, CAP + 16], [x - CW / 2 - 10, CAP], [x + CW / 2 + 10, CAP], [x + CW / 2, CAP + 16], [x + CW / 2, FLOOR + 30]];
const COLUMNS = COLS.map(COLUMN);
const CURTAIN: P[] = [[COLS[3] + CW / 2, CAP - 60], [1556, CAP - 60], [1556, FLOOR], [COLS[3] + CW / 2 + 30, FLOOR], [COLS[3] + CW / 2 + 10, 500]];
const CURTAIN_FOLDS: P[][] = [1330, 1390, 1450, 1510].map((x, i) => [[x, CAP - 50], [x - 10 - i * 4, 500], [x - 4, FLOOR - 6]]);
const FLOOR_P: P[] = [[44, 870], [44, FLOOR], [1556, FLOOR], [1556, 870]];
const TILES: P[][] = [];
for (let x = 44; x < 1556; x += 64) TILES.push([[x, FLOOR], [x, 870]]);
for (const y of [780, 826]) TILES.push([[44, y], [1556, y]]);

// ---------------------------------------------------------------- the procession
// x from the curtain (1330) past the first column (380) and on, out of sight, then round again: one
// lap per loop. The four walk close together, the youth first; the hall is empty between laps
const SPAN = { from: 1330, to: 380 }, D = (SPAN.from - SPAN.to) * 1.75; // the last part of each lap is out of sight
const BEARERS = [
  { off: 0.3, h: 380, make: (x: number, bob: number) => figure({ x, g: WALK + bob, h: 380, f: -1, robe: "tunic", head: "bare", cloth: "#e6e0d0", cloth2: "#c8c2b0", hair: "#3a2a1a", ink: INK, dead: true, lite: true, near: [1.6, 2.6], far: [1.3, 2.4] }) },
  { off: 0.2, h: 360, make: (x: number, bob: number) => figure({ x, g: WALK + bob, h: 360, f: -1, robe: "long", head: "veil", cloth: "#4a5a7a", cloth2: "#d8d0bc", ink: INK, dead: true, lite: true, near: [1.4, 2.4], far: [0.2, 0.4] }) },
  { off: 0.1, h: 360, make: (x: number, bob: number) => figure({ x, g: WALK + bob, h: 360, f: -1, robe: "long", head: "veil", cloth: "#5a3a5a", cloth2: "#d8d0bc", ink: INK, dead: true, lite: true, near: [1.4, 2.4], far: [0.2, 0.4] }) },
  { off: 0, h: 370, make: (x: number, bob: number) => figure({ x, g: WALK + bob, h: 370, f: -1, robe: "long", head: "veil", cloth: "#7a2a22", cloth2: "#e6dfcc", ink: INK, dead: true, lite: true, near: [1.25, 1.65], far: [1.2, 1.7] }) },
];
const placeAt = (t: number, off: number) => { const u = ((t / LOOP) + off) % 1; return { x: SPAN.from - u * D, bob: Math.abs(Math.sin(u * Math.PI * 28)) * -6 }; };
// what each one carries, from where their hands are
const lance = (F: Figure) => { const [hx, hy] = F.hands.near; return { shaft: [[hx + 30, hy + 80], [hx - 20, hy - 190]] as P[], tip: [hx - 20, hy - 190] as P }; };
const candelabrum = (F: Figure) => { const [hx, hy] = F.hands.near; return { stem: [[hx, hy + 10], [hx, hy - 70]] as P[], arms: [[hx - 26, hy - 60], [hx - 26, hy - 76], [hx, hy - 70], [hx + 26, hy - 76], [hx + 26, hy - 60]] as P[], lights: [[hx - 26, hy - 78], [hx, hy - 86], [hx + 26, hy - 78]] as P[] }; };
const cup = (F: Figure): P[] => { const [x, y] = [(F.hands.near[0] + F.hands.far[0]) / 2, (F.hands.near[1] + F.hands.far[1]) / 2 - 6]; return [[x - 24, y + 6], [x - 5, y - 2], [x - 5, y - 22], [x - 28, y - 34], [x - 30, y - 56], [x - 20, y - 70], [x, y - 78], [x + 20, y - 70], [x + 30, y - 56], [x + 28, y - 34], [x + 5, y - 22], [x + 5, y - 2], [x + 24, y + 6]]; };

// the knight, left of the column, waiting
const KNIGHT = figure({ x: 210, g: 850, h: 500, f: 1, robe: "armor", head: "coif", cloth: "#d0c8b4", ink: INK, near: [0.6, 1.1], far: [0.2, 0.4] });
const CROSS: P[][] = [[[202, 492], [218, 492], [218, 616], [202, 616]], [[164, 534], [256, 534], [256, 550], [164, 550]]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 3000, ink: INK, ph: 6, from: FROM });
const holes = BAYS.map(bay);
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: FLOOR }, 56);
const fore = [...COLUMNS, CURTAIN, ...KNIGHT.m.parts];
const scene: Omit<Stroke, "at">[] = [
  ...BAYS.map((b) => st(arch(b.a, b.b, CAP), 1.7, 0.9, INK, fore)), ...COLUMNS.map((q) => edge(q, 1.6, KNIGHT.m.parts)),
  ...[120, 190].map((y) => st([[44, y], [1556, y]], 0.9, 0.4, INK, holes)),
  edge(CURTAIN, 1.5), ...CURTAIN_FOLDS.map((l) => st(l, 1.2, 0.6)),
  st([[44, FLOOR], [1556, FLOOR]], 1.5, 0.9, INK, fore), ...TILES.map((l) => st(l, 0.9, 0.45, INK, fore)),
  ...knight.strokes,
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.32, mix(H.a, INK, 0.3), [...holes, ...fore])), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 2.6, 0.4, H.gold, [...holes, ...fore]))]; // on the spandrels only
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  flat(WALL, STONE, 0, [28, 58], 500), ...holes.map((q, i) => flat(q, mix(H.c, "#000000", 0.25), 1, [30, 60], 501 + i)),
  flat(FLOOR_P, DAIS, 1, [30, 60], 510), ...COLUMNS.map((q, i) => flat(q, mix(STONE, "#ffffff", 0.18), 2, [32, 62], 511 + i)),
  flat(CURTAIN, CURT, 3, [34, 64], 520),
  ...knight.washes, ...CROSS.map((q, i) => flat(q, "#7a1a14", 7, [46, 76], 530 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const flame = (x: number, y: number, TT: number, k: number): P[] => { const h = 14 + 2 * Math.sin(TT * 9 + k), l = 1.6 * Math.sin(TT * 13 + k); return [[x - 3.5, y], [x - 4, y - h * 0.4], [x + l, y - h], [x + 4, y - h * 0.4], [x + 3.5, y]]; };
// they walk behind the colonnade, come out of the curtain, and go out of sight past the first column
const OCCLUDE = [...COLUMNS, CURTAIN, [[-900, -50], [COLS[0] + CW / 2, -50], [COLS[0] + CW / 2, 950], [-900, 950]] as P[]];
export const c08 = page({
  id: "c08", title: "Le Cortège", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [50, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    BEARERS.forEach((b, i) => {
      const { x, bob } = placeAt(t, b.off), F = b.make(x, bob);
      paintMotif(g, F.m, { ink: INK, seed: 5000 + i * 200, reveal, hide: OCCLUDE });
      g.group("plain", () => masked(g, OCCLUDE, () => {
        if (i === 0) { // the lance, and the blood running down it from the point
          const L = lance(F), [a, tip] = [L.shaft[0], L.tip], run = ((t % 90) / 90);
          g.pen(L.shaft, { w: 4, color: "#6b4a2a", seed: 90, wobble: 0.1, boil: 0, opacity: reveal, retrace: false });
          g.fill([[tip[0] - 7, tip[1] + 10], [tip[0], tip[1] - 26], [tip[0] + 7, tip[1] + 10]], "#b9bcc0", reveal);
          const drop: P = [tip[0] + (a[0] - tip[0]) * run * 0.8, tip[1] + 12 + (a[1] - tip[1]) * run * 0.8];
          g.pen([[tip[0] + 1, tip[1] + 10], drop], { w: 2.2, color: "#9a1a12", seed: 91, wobble: 0.1, boil: 0, opacity: 0.9 * reveal, retrace: false });
          g.fill(blob(drop[0], drop[1] + 3, 3, 4.5, 92, 0.05, 8), "#9a1a12", reveal);
          g.fill(blob(tip[0], tip[1] + 12, 2.5 + 1.5 * Math.sin(TT * 8), 3 + Math.sin(TT * 8), 93, 0.05, 8), "#b81f16", reveal);
        } else if (i < 3) { // a candelabrum and its three flames
          const C = candelabrum(F);
          g.pen(C.stem, { w: 3, color: "#8d6d3a", seed: 94 + i, wobble: 0.1, boil: 0, opacity: reveal, retrace: false });
          g.pen(C.arms, { w: 2.4, color: "#8d6d3a", seed: 96 + i, wobble: 0.1, boil: 0, opacity: reveal, retrace: false });
          C.lights.forEach(([lx, ly], k) => { g.fill(flame(lx, ly, TT * 6, k + i), "#f2a93a", reveal); g.fill(flame(lx, ly - 1, TT * 6, k + i).map(([px, py]) => [lx + (px - lx) * 0.5, ly + (py - ly) * 0.55] as P), "#fff0c0", reveal); });
          g.glow(C.lights[1][0], C.lights[1][1] - 6, 50, "#ffcf6a", 0.18 * reveal);
        } else { // the covered cup
          const c = cup(F); g.fill(c, H.gold, reveal); g.pen(dense([...c, c[0]], 8), { w: 1.3, color: INK, seed: 99, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false, progress: reveal });
          glint(g, [c], t * 2, LOOP, ROT * 0.5);
        }
      }));
    });
    if (reveal < 1) return;
    borderGlint(g, t, LOOP, ROT);
  },
});
