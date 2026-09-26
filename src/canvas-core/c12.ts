// CORBENIC PAGE 12 · LA TABLE RONDE. One idea: the knight in the seat kept for the one who brings
// back the Grail, and the Grail in front of him, and he is one of them now.
// Close in on the Round Table: the board across the bottom, the Siège Périlleux in the middle with its
// tall back, the knight in it, grey, his throat bitten, his hands flat on the board; the cup set in
// front of him. The dead at their places either side, turned toward him. Keu on the right, bowing.
// What moves: the torches; Keu's slow bow; two of the dead swaying; the dull glint on the cup.
import { type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, motif, paintMotif } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 1, H = hand(ROT), INK = H.ink;
const BOARD = "#a8946e", BOARD_EDGE = "#6a5438", WALLC = mix(H.a, "#1a0806", 0.4);
const B = border(ROT, [0, 44]);
const EDGE = 650; // the front edge of the board
const FROM: P = [800, 520];

// ---------------------------------------------------------------- the hall, the board, the seat
const WALL: P[] = [[44, 40], [1556, 40], [1556, 870], [44, 870]];
const TOP: P[] = [[44, 580], [1556, 580], [1556, EDGE], [44, EDGE]];
const FRONT: P[] = [[44, EDGE], [1556, EDGE], [1556, 870], [44, 870]];
const BELOW: P[] = [[-50, 870], [1650, 870], [1650, 960], [-50, 960]]; // nothing of them shows under the board
const SEAT_BACK: P[] = [[690, EDGE], [690, 300], [720, 230], [800, 170], [880, 230], [910, 300], [910, EDGE]];
const SEAT_PANEL: P[] = [[720, EDGE], [720, 316], [742, 262], [800, 216], [858, 262], [880, 316], [880, EDGE]];
// the knight, seated, dead
const KH = 540;
const KNIGHT = figure({ x: 800, g: EDGE + 0.44 * KH, h: KH, f: 1, lean: 0.04, robe: "long", head: "coif", cloth: "#d8d0bc", ink: INK, dead: true, near: [0.7, 1.45], far: [0.55, 1.35] });
const CROSS: P[][] = [[[792, 450], [810, 450], [810, 590], [792, 590]], [[752, 494], [850, 494], [850, 512], [752, 512]]];
const BITE = blob(KNIGHT.head[0] - 26, KNIGHT.head[1] + 58, 18, 12, 90, 0.2, 12);
const STAINS: P[][] = [blob(778, 420, 16, 26, 91, 0.3, 10), blob(820, 612, 20, 12, 92, 0.3, 10)];
const [cx, cy] = [936, 632];
const CUP: P[] = [[cx - 30, cy + 8], [cx - 6, cy], [cx - 6, cy - 26], [cx - 36, cy - 40], [cx - 38, cy - 70], [cx - 24, cy - 88], [cx, cy - 98], [cx + 24, cy - 88], [cx + 38, cy - 70], [cx + 36, cy - 40], [cx + 6, cy - 26], [cx + 6, cy], [cx + 30, cy + 8]];
// the dead either side, turned toward him
const SIDES = [
  { x: 260, f: 1 as const, cloth: "#4a3a4a" }, { x: 470, f: 1 as const, cloth: "#3a4a5a" },
  { x: 1130, f: -1 as const, cloth: "#4a5a3a" }, { x: 1330, f: -1 as const, cloth: "#6a3a2a" },
];
const side = (s: (typeof SIDES)[number], sway = 0) => figure({ x: s.x, g: EDGE + 0.44 * 480, h: 480, f: s.f, lean: 0.06 + sway, robe: "long", head: "coif", cloth: s.cloth, ink: INK, dead: true, lite: true, near: [0.9, 1.5], far: [0.8, 1.4] });
// Keu, bowing at the knight's side
const keu = (bow: number) => figure({ x: 1480, g: 880, h: 520, f: -1, lean: 0.1 + bow * 0.08, robe: "tunic", head: "bare", cloth: "#2e3a2a", cloth2: "#3a2a1e", hair: "#3a2a1a", ink: INK, dead: true, lite: true, near: [0.35 + bow * 0.3, 0.9], far: [0.1, 0.3] });
const TORCHES: P[] = [[300, 200], [1300, 200]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const STILL = [SIDES[0], SIDES[3]], SWAY = [SIDES[1], SIDES[2]];
const board = [TOP, FRONT, BELOW];
const still = lay(motif(...STILL.map((s) => side(s).m)), { at: [40, 70], seed: 3000, ink: INK, ph: 3, from: FROM, hide: board });
const knight = lay(KNIGHT.m, { at: [42, 72], seed: 4000, ink: INK, ph: 4, from: FROM, hide: board });
const front = [...board, SEAT_BACK, ...KNIGHT.m.parts, ...STILL.flatMap((s) => side(s).m.parts), CUP];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 580 }, 50);
const scene: Omit<Stroke, "at">[] = [
  ...still.strokes,
  edge(SEAT_BACK, 1.6, [...KNIGHT.m.parts, ...board]), edge(SEAT_PANEL, 1.1, [...KNIGHT.m.parts, ...board]),
  ...knight.strokes, edge(BITE, 1),
  st([[44, 580], [1556, 580]], 1.5, 0.9, INK, [SEAT_BACK, ...KNIGHT.m.parts]), st([[44, EDGE], [1556, EDGE]], 1.8), ...[700, 760, 820].map((y) => st([[44, y], [1556, y]], 0.9, 0.45)),
  ...[200, 480, 1120, 1400].map((x) => st([[x, 590], [x + 30, 640]], 0.8, 0.45, INK, [...KNIGHT.m.parts, CUP])), // the grain of the board
  edge(CUP, 1.4),
  ...TORCHES.map(([x, y]) => st([[x, y + 60], [x, y]], 6, 1, "#3a2a1e")), ...TORCHES.map(([x, y]) => st([[x - 14, y + 44], [x + 14, y + 44]], 4, 1, "#2a2a2a")),
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.35, mix(H.a, "#000000", 0.4), front)), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 2.8, 0.55, H.gold, front))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  flat(WALL, WALLC, 0, [26, 56], 500),
  ...still.washes,
  flat(SEAT_BACK, "#3a2418", 3, [32, 62], 510), flat(SEAT_PANEL, "#7a1a12", 3, [34, 64], 511),
  ...knight.washes, ...CROSS.map((q, i) => flat(q, "#7a1a14", 5, [44, 72], 512 + i)), flat(BITE, "#4a0806", 5, [46, 74], 514), ...STAINS.map((q, i) => flat(q, "#5a1a12", 5, [46, 74], 515 + i)),
  flat(TOP, BOARD, 6, [36, 66], 520), flat(FRONT, BOARD_EDGE, 6, [36, 66], 521),
  gilt(CUP, 0.6, [46, 76], 530, { ph: 7, from: FROM }),
  ...B.washes,
];
// the knight's hands lie on the board, over its top: redrawn above the board's colour
const HANDS = [KNIGHT.hands.near, KNIGHT.hands.far];

// ---------------------------------------------------------------- what moves
const tflame = (x: number, y: number, TT: number, k: number): P[] => { const h = 34 + 6 * Math.sin(TT * 5 + k) + 4 * Math.sin(TT * 13 + k), l = 4 * Math.sin(TT * 7 + k); return [[x - 12, y + 2], [x - 13, y - h * 0.35], [x - 3 + l * 0.5, y - h * 0.72], [x + l, y - h], [x + 5 + l * 0.4, y - h * 0.6], [x + 13, y - h * 0.3], [x + 12, y + 2]]; };
export const c12 = page({
  id: "c12", title: "La Table ronde", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [60, 92],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    g.group("plain", () => TORCHES.forEach(([x, y], i) => g.glow(x, y - 20, 150, "#ff9a3a", 0.16 * reveal * (0.9 + 0.1 * Math.sin(TT * 6 + i)))), { blend: "screen" });
    g.group("plain", () => TORCHES.forEach(([x, y], i) => { g.fill(tflame(x, y, TT, i * 2), "#e8872a", reveal); g.fill(tflame(x, y - 2, TT, i * 2).map(([px, py]) => [x + (px - x) * 0.5, y + (py - y) * 0.55] as P), "#ffe0a0", reveal); }));
    // the two nearest dead sway where they sit; the board is in front of them
    SWAY.forEach((s, i) => paintMotif(g, side(s, 0.02 * Math.sin(TT + i * 2)).m, { ink: INK, seed: 6000 + i * 100, reveal, hide: [...board, SEAT_BACK, ...KNIGHT.m.parts, CUP] }));
    // his hands, flat on the board
    g.group("plain", () => HANDS.forEach(([x, y], i) => { const hnd = blob(x, Math.min(y, EDGE - 18), 16, 9, 70 + i, 0.1, 10); g.fill(hnd, "#a3a58f", reveal); g.pen(dense([...hnd, hnd[0]], 6), { w: 1.2, color: INK, seed: 72 + i, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false, progress: reveal }); }));
    // Keu, bowing, straightening, bowing
    paintMotif(g, keu((Math.sin(TT) + 1) / 2).m, { ink: INK, seed: 7000, reveal, hide: [FRONT] });
    if (reveal < 1) return;
    glint(g, [CUP], t, LOOP, 0.6);
    borderGlint(g, t, LOOP, ROT);
  },
});
