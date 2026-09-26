// CORBENIC PAGE 9 · CAMELOT. One idea: the king the knight rode out for is one of them.
// The book has gone to blood and black. Camelot's hall, tooled in dark red: the Round Table with the
// dead knights at their places, hands flat on the board, Sagremor with his throat open; in front,
// the Siège Périlleux, empty. On the right the door of the king's chamber, Keu bowing beside it with
// his black hand, and in the doorway Arthur, crowned, grey, the bite on his wrist. On the left, the
// knight, holding the Grail.
// What moves: Arthur's jaw, working on nothing; the torches; the glint on the crown and the cup.
import { type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, motif } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 1, H = hand(ROT), INK = H.ink;
const STONE = "#7a6a5a", BOARD = "#b9a582", CLOTH = "#5a1410", DARK = "#140a08";
const B = border(ROT, [0, 44]);
const FLOOR = 790;
const FROM: P = [1270, 480];

// ---------------------------------------------------------------- the hall
const WALL: P[] = [[44, 40], [1556, 40], [1556, FLOOR], [44, FLOOR]];
const DADO: P[] = [[44, 560], [1556, 560], [1556, FLOOR], [44, FLOOR]];
const GROUND: P[] = [[44, 870], [44, FLOOR], [1556, FLOOR], [1556, 870]];
const DOOR = { x0: 1130, x1: 1410, top: 250 };
const DOORWAY: P[] = [[DOOR.x0, FLOOR], [DOOR.x0, DOOR.top + 80], ...Array.from({ length: 11 }, (_, i) => { const a = Math.PI - (i / 10) * Math.PI, cx = (DOOR.x0 + DOOR.x1) / 2, R = (DOOR.x1 - DOOR.x0) / 2; return [cx + Math.cos(a) * R, DOOR.top + 80 - Math.sin(a) * 80] as P; }), [DOOR.x1, DOOR.top + 80], [DOOR.x1, FLOOR]];
const JAMB: P[] = [[DOOR.x0 - 26, FLOOR], [DOOR.x0 - 26, DOOR.top + 70], [(DOOR.x0 + DOOR.x1) / 2, DOOR.top - 26], [DOOR.x1 + 26, DOOR.top + 70], [DOOR.x1 + 26, FLOOR]];
const LEAF: P[] = [[DOOR.x1 + 26, FLOOR], [DOOR.x1 + 26, DOOR.top + 90], [DOOR.x1 + 120, DOOR.top + 120], [DOOR.x1 + 120, FLOOR + 30]]; // the door, swung open
const BED_CORNER: P[] = [[DOOR.x1 - 120, 650], [DOOR.x1, 640], [DOOR.x1, 720], [DOOR.x1 - 120, 726]];
// the table: its round board seen from a little above, the cloth hanging from it
const T = { cx: 560, cy: 600, rx: 400, ry: 76 };
const BOARD_P: P[] = Array.from({ length: 36 }, (_, i) => { const a = (i / 36) * Math.PI * 2; return [T.cx + Math.cos(a) * T.rx, T.cy + Math.sin(a) * T.ry] as P; });
const SKIRT_P: P[] = [[T.cx + T.rx, T.cy], ...Array.from({ length: 19 }, (_, i) => { const a = (i / 18) * Math.PI; return [T.cx + Math.cos(a) * T.rx, T.cy + Math.sin(a) * T.ry] as P; }), [T.cx - T.rx + 14, FLOOR + 4], ...Array.from({ length: 9 }, (_, i) => [T.cx - T.rx + 14 + ((i + 1) / 10) * (2 * T.rx - 28), FLOOR + 4 + (i % 2 ? 6 : 0)] as P), [T.cx + T.rx - 14, FLOOR + 4]];
// the dead at their places: four behind the board, one at each end
const SEATED = [
  { x: 330, h: 380, f: 1 as const, cloth: "#5a4a3a", sag: false }, { x: 470, h: 390, f: 1 as const, cloth: "#3a4a5a", sag: true },
  { x: 650, h: 390, f: -1 as const, cloth: "#4a5a3a", sag: false }, { x: 790, h: 380, f: -1 as const, cloth: "#6a3a2a", sag: false },
];
const seated = SEATED.map((s) => figure({ x: s.x, g: T.cy + 0.46 * s.h, h: s.h, f: s.f, lean: 0.06, robe: "long", head: "coif", cloth: s.cloth, ink: INK, dead: true, lite: true, near: [1.1, 1.75], far: [0.9, 1.6] }));
const ENDS = [figure({ x: 150, g: FLOOR - 10, h: 420, f: 1, lean: 0.08, robe: "long", head: "coif", cloth: "#4a3a4a", ink: INK, dead: true, lite: true, near: [1.2, 1.7], far: [1.0, 1.6] }), figure({ x: 975, g: FLOOR - 10, h: 420, f: -1, lean: 0.08, robe: "long", head: "coif", cloth: "#3a4a4a", ink: INK, dead: true, lite: true, near: [1.2, 1.7], far: [1.0, 1.6] })];
const SAG = seated[1];
const GASH: P[] = [[SAG.head[0] - 18, SAG.head[1] + 40], [SAG.head[0] + 16, SAG.head[1] + 34], [SAG.head[0] + 20, SAG.head[1] + 44], [SAG.head[0] - 14, SAG.head[1] + 52]];
// the Siège Périlleux, empty, at the front of the board
const CHAIR: P[] = [[520, FLOOR], [520, 610], [534, 570], [560, 548], [586, 570], [600, 610], [600, FLOOR]];
const SEAT_CLOTH: P[] = [[528, 700], [592, 700], [596, 760], [524, 760]];
// Keu at the door, bowing, his black hand; Arthur in the doorway
const KEU = figure({ x: 1056, g: FLOOR, h: 450, f: -1, lean: 0.12, robe: "tunic", head: "bare", cloth: "#2e3a2a", cloth2: "#3a2a1e", hair: "#3a2a1a", ink: INK, dead: true, near: [0.35, 0.9], far: [0.1, 0.3] });
const BLACK_HAND = blob(KEU.hands.near[0], KEU.hands.near[1], 0.03 * 450, 0.034 * 450, 70, 0.1, 10);
const BANDAGE: P[] = (() => { const [x, y] = KEU.hands.near; return [[x - 14, y - 28], [x + 10, y - 34], [x + 16, y - 16], [x - 8, y - 10]]; })();
const ARTHUR = figure({ x: 1272, g: FLOOR, h: 500, f: -1, lean: 0.02, robe: "long", head: "crown", cloth: "#3a2a4a", hair: "#7a6a52", gold: "#9a7a3a", ink: INK, dead: true, near: [0.9, 1.3], far: [0.2, 0.4] });
const BITE: P[][] = (() => { const [x, y] = ARTHUR.hands.near; return Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return blob(x + 22 + Math.cos(a) * 10, y - 4 + Math.sin(a) * 6, 2.2, 1.8, 90 + i, 0, 6); }); })();
const MOUTH = ((): P => { const c = ARTHUR.head, h = 500; return [c[0] - 0.035 * h, c[1] + 0.035 * h]; })();
// the knight, on the left, holding the cup
const KNIGHT = figure({ x: 96, g: 880, h: 520, f: 1, robe: "armor", head: "coif", cloth: "#c8c0ac", ink: INK, near: [1.2, 1.6], far: [0.2, 0.4] });
const GR: P = [KNIGHT.hands.near[0] + 20, KNIGHT.hands.near[1] - 6];
const CUP: P[] = [[GR[0] - 22, GR[1] + 20], [GR[0] - 4, GR[1] + 14], [GR[0] - 4, GR[1] - 4], [GR[0] - 26, GR[1] - 14], [GR[0] - 28, GR[1] - 36], [GR[0] - 18, GR[1] - 50], [GR[0], GR[1] - 58], [GR[0] + 18, GR[1] - 50], [GR[0] + 28, GR[1] - 36], [GR[0] + 26, GR[1] - 14], [GR[0] + 4, GR[1] - 4], [GR[0] + 4, GR[1] + 14], [GR[0] + 22, GR[1] + 20]];
// torches on the wall
const TORCHES: P[] = [[330, 250], [860, 250]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const board = [BOARD_P, SKIRT_P];
const deadAt = lay(motif(...seated.map((f) => f.m)), { at: [40, 70], seed: 3000, ink: INK, ph: 3, from: FROM, hide: [...board, CHAIR] });
const ends = lay(motif(...ENDS.map((f) => f.m)), { at: [42, 72], seed: 3500, ink: INK, ph: 5, from: FROM, hide: [KNIGHT.m.parts].flat() });
const door = lay(motif(ARTHUR.m), { at: [36, 66], seed: 4000, ink: INK, ph: 3, from: FROM, hide: KEU.m.parts });
const keu = lay(KEU.m, { at: [40, 70], seed: 4500, ink: INK, ph: 5, from: FROM });
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 5000, ink: INK, ph: 6, from: FROM });
const front = [...board, CHAIR, ...ENDS.flatMap((f) => f.m.parts), ...KEU.m.parts, ...KNIGHT.m.parts, ...ARTHUR.m.parts, JAMB, LEAF];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 560 }, 50);
const scene: Omit<Stroke, "at">[] = [
  st([[44, 560], [1556, 560]], 1.4, 0.9, INK, front), ...[600, 660, 720].map((y) => st([[44, y], [1556, y]], 0.8, 0.4, INK, front)),
  edge(JAMB, 1.6, [LEAF, ...KEU.m.parts]), edge(DOORWAY, 1.4, [...ARTHUR.m.parts, ...KEU.m.parts]), edge(LEAF, 1.5), ...[0.3, 0.6].map((t) => st([[DOOR.x1 + 26 + 94 * t, DOOR.top + 90 + 30 * t + 20], [DOOR.x1 + 26 + 94 * t, FLOOR + 30 * t]], 1, 0.6)),
  edge(BED_CORNER, 1.2, ARTHUR.m.parts),
  ...deadAt.strokes, edge(GASH, 1.2),
  edge(BOARD_P, 1.6, [CHAIR, ...ENDS.flatMap((f) => f.m.parts)]), st(SKIRT_P, 1.5, 0.9, INK, [CHAIR, ...ENDS.flatMap((f) => f.m.parts)]),
  ...[0.2, 0.4, 0.6, 0.8].map((t) => st([[T.cx - T.rx + 30 + t * (2 * T.rx - 60), T.cy + T.ry * 0.9], [T.cx - T.rx + 22 + t * (2 * T.rx - 44), FLOOR]], 1, 0.55, INK, [CHAIR, ...ENDS.flatMap((f) => f.m.parts)])),
  edge(CHAIR, 1.6), edge(SEAT_CLOTH, 1.2),
  ...ends.strokes, ...door.strokes, ...BITE.map((q) => edge(q, 0.8)), ...keu.strokes, edge(BANDAGE, 1),
  ...knight.strokes, edge(CUP, 1.3),
  ...TORCHES.map(([x, y]) => st([[x, y + 60], [x, y]], 6, 1, "#3a2a1e")), ...TORCHES.map(([x, y]) => st([[x - 14, y + 44], [x + 14, y + 44]], 4, 1, "#2a2a2a")),
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.35, mix(H.a, "#000000", 0.4), [...front, ...seated.flatMap((f) => f.m.parts), DOORWAY])), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 2.8, 0.55, H.gold, [...front, ...seated.flatMap((f) => f.m.parts), DOORWAY]))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  flat(WALL, mix(H.a, "#1a0806", 0.35), 0, [26, 56], 500), flat(DADO, STONE, 1, [28, 58], 501), flat(GROUND, mix(STONE, DARK, 0.4), 1, [28, 58], 502),
  flat(JAMB, mix(STONE, "#ffffff", 0.12), 2, [30, 60], 503), flat(DOORWAY, DARK, 2, [30, 60], 504), flat(BED_CORNER, "#6a1a14", 2, [32, 62], 505), flat(LEAF, "#4a2e1c", 5, [34, 64], 506),
  ...deadAt.washes, flat(GASH, "#6a0e0a", 4, [44, 72], 510),
  flat(BOARD_P, BOARD, 4, [36, 66], 511), flat(SKIRT_P, CLOTH, 4, [36, 66], 512),
  flat(CHAIR, "#3a2418", 5, [38, 68], 513), flat(SEAT_CLOTH, "#8a1a12", 5, [40, 70], 514),
  ...door.washes, ...ends.washes, ...keu.washes, flat(BANDAGE, "#c9bfa6", 6, [44, 72], 515), flat(BLACK_HAND, "#0e0806", 6, [46, 74], 516),
  ...BITE.map((q, i) => flat(q, "#1a0806", 4, [46, 74], 520 + i)),
  ...knight.washes, gilt(CUP, 0.2, [46, 76], 530, { ph: 7, from: FROM }),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const tflame = (x: number, y: number, TT: number, k: number): P[] => { const h = 34 + 6 * Math.sin(TT * 5 + k) + 4 * Math.sin(TT * 13 + k), l = 4 * Math.sin(TT * 7 + k); return [[x - 12, y + 2], [x - 13, y - h * 0.35], [x - 3 + l * 0.5, y - h * 0.72], [x + l, y - h], [x + 5 + l * 0.4, y - h * 0.6], [x + 13, y - h * 0.3], [x + 12, y + 2]]; };
export const c09 = page({
  id: "c09", title: "Camelot", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [60, 92],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    g.group("plain", () => TORCHES.forEach(([x, y], i) => g.glow(x, y - 20, 150, "#ff9a3a", 0.16 * reveal * (0.9 + 0.1 * Math.sin(TT * 6 + i)))), { blend: "screen" });
    g.group("plain", () => TORCHES.forEach(([x, y], i) => { g.fill(tflame(x, y, TT, i * 2), "#e8872a", reveal); g.fill(tflame(x, y - 2, TT, i * 2).map(([px, py]) => [x + (px - x) * 0.5, y + (py - y) * 0.55] as P), "#ffe0a0", reveal); }));
    // the king's jaw: open, shut, open, never still
    const chew = (Math.sin(TT * 6) + 1) / 2, [mx, my] = MOUTH;
    g.group("plain", () => {
      g.fill(blob(mx, my, 11, 9, 80, 0.05, 10), "#a3a58f", reveal);
      g.fill(blob(mx, my + 1 + chew * 2, 7, 1.5 + chew * 6, 81, 0.05, 10), "#1a0806", reveal);
      g.pen([[mx - 16, my + 12 + chew * 6], [mx + 2, my + 16 + chew * 6], [mx + 12, my + 10 + chew * 4]], { w: 1.2, color: INK, seed: 82, wobble: 0.2, boil: 0, opacity: 0.8 * reveal, retrace: false }); // the chin going down and up
    });
    if (reveal < 1) return;
    glint(g, [CUP], t, LOOP, 0.2);
    borderGlint(g, t, LOOP, ROT);
  },
});
