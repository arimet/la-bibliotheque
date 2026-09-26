// CORBENIC PAGE 7 · LE ROI PÊCHEUR. One idea: an old king who cannot die, and on the table beside
// his bed, a plain gold cup with a lid.
// A hot, close chamber. Under a red canopy with green curtains, Pellès lies on his back, crowned,
// grey-haired, the coverlet turned back from his legs: the thigh bound in a cloth gone black and wet.
// On a little round table, the Grail. On the right the knight, looking at it. Through the window on
// the left, the valley's black wheat standing under the gold.
// What moves: the king's slow breath under the coverlet, the Grail's light, dust in the window light.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, rotate } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0.6, H = hand(ROT), INK = H.ink;
const WALLC = "#8a8470", WOODC = "#5a3e28", RED = mix(H.b, "#8a2a1f", 0.6), GREEN = "#3f5a3a", LINEN = "#e6dfcc";
const B = border(ROT, [0, 44]);
const FLOOR = 720, GRAIL: P = [1100, 580];
const FROM: P = GRAIL;

// ---------------------------------------------------------------- the room
const WALL: P[] = [[44, 40], [1556, 40], [1556, FLOOR], [44, FLOOR]];
const TILES: { pts: P[]; c: string }[] = [];
for (let row = 0; row < 4; row++) for (let x = 44, k = 0; x < 1556; x += 50, k++) TILES.push({ pts: [[x, FLOOR + row * 38], [Math.min(1556, x + 50), FLOOR + row * 38], [Math.min(1556, x + 50), Math.min(870, FLOOR + (row + 1) * 38)], [x, Math.min(870, FLOOR + (row + 1) * 38)]], c: (k + row) % 2 ? mix(RED, "#3a2418", 0.4) : "#c9bd9e" });
const WIN = { x0: 150, x1: 360, y0: 170, y1: 480 };
const arch = (x0: number, x1: number, y: number, rise: number): P[] => { const cx = (x0 + x1) / 2, R = (x1 - x0) / 2; return Array.from({ length: 13 }, (_, i) => { const a = Math.PI - (i / 12) * Math.PI; return [cx + Math.cos(a) * R, y - Math.sin(a) * rise] as P; }); };
const WINDOW: P[] = [[WIN.x0, WIN.y1], ...arch(WIN.x0, WIN.x1, WIN.y0 + 60, 60), [WIN.x1, WIN.y1]];
const FRAME: P[] = [[WIN.x0 - 22, WIN.y1 + 18], ...arch(WIN.x0 - 22, WIN.x1 + 22, WIN.y0 + 60, 80), [WIN.x1 + 22, WIN.y1 + 18]];
const OUT_SKY: P[] = [[WIN.x0, 380], ...arch(WIN.x0, WIN.x1, WIN.y0 + 60, 60), [WIN.x1, 380]];
const OUT_FIELD: P[] = [[WIN.x0, WIN.y1], [WIN.x0, 380], [WIN.x1, 370], [WIN.x1, WIN.y1]];
const r = rng(4);
const WHEAT = Array.from({ length: 26 }, (_, i) => { const x = WIN.x0 + 8 + i * 7.6 + r() * 3, g = WIN.y1 - 4 - (i % 3) * 20, h = 36 + r() * 16; return { x, g, h }; });

// the bed: posts, the canopy with its fringe, curtains, the mattress, the pillow
const BED = { x0: 420, x1: 1000, top: 560 };
const POSTS: P[][] = [[[BED.x0, FLOOR], [BED.x0, 140], [BED.x0 + 18, 140], [BED.x0 + 18, FLOOR]], [[BED.x1 - 18, FLOOR], [BED.x1 - 18, 140], [BED.x1, 140], [BED.x1, FLOOR]]];
const VALANCE: P[] = [[BED.x0 - 20, 130], [BED.x1 + 20, 130], [BED.x1 + 20, 196], ...Array.from({ length: 16 }, (_, i) => { const x = BED.x1 + 20 - ((i + 0.5) / 16) * (BED.x1 - BED.x0 + 40); return [x, 196 + (i % 2 ? 0 : 14)] as P; }), [BED.x0 - 20, 196]];
const CURTAIN_L: P[] = [[BED.x0 + 18, 196], [BED.x0 + 110, 196], [BED.x0 + 70, 330], [BED.x0 + 40, 470], [BED.x0 + 18, 520]];
const CURTAIN_R: P[] = [[BED.x1 - 18, 196], [BED.x1 - 130, 196], [BED.x1 - 80, 330], [BED.x1 - 44, 470], [BED.x1 - 18, 520]];
const FRAME_SIDE: P[] = [[BED.x0, BED.top + 40], [BED.x1, BED.top + 40], [BED.x1, BED.top + 110], [BED.x0, BED.top + 110]];
const MATTRESS: P[] = [[BED.x0 + 18, BED.top], [BED.x1 - 18, BED.top], [BED.x1 - 18, BED.top + 40], [BED.x0 + 18, BED.top + 40]];
const PILLOW = blob(BED.x0 + 90, BED.top - 12, 64, 22, 55, 0.1, 14);
// the king, lying on his back, head on the pillow to the left
const KING_FEET: P = [BED.x1 - 60, BED.top + 2], KH = 470;
const KING = rotate(figure({ x: KING_FEET[0], g: KING_FEET[1], h: KH, robe: "long", head: "crown", cloth: LINEN, hair: "#b9b3a4", skin: "#d8c2a2", ink: INK, near: [0.1, 0.2], far: [0.05, 0.1] }).m, KING_FEET, -90);
// the thigh, bound, where the coverlet is turned back
const BANDAGE: P[] = [[KING_FEET[0] - KH * 0.42, BED.top - 30], [KING_FEET[0] - KH * 0.28, BED.top - 28], [KING_FEET[0] - KH * 0.28, BED.top + 2], [KING_FEET[0] - KH * 0.42, BED.top + 2]];
const coverlet = (breath: number): P[] => { const x0 = BED.x0 + 150, x1 = KING_FEET[0] - KH * 0.45, lift = 4 * breath; return [[x0, BED.top - 36 - lift], [x0 + 60, BED.top - 44 - lift * 1.2], [x0 + 140, BED.top - 42 - lift], [x1, BED.top - 34], [x1 + 20, BED.top + 40], [x1 + 10, BED.top + 90], [x0 - 10, BED.top + 92], [x0 - 20, BED.top + 40]]; };
const COVER_FOLD: P[] = [[KING_FEET[0] - KH * 0.45, BED.top - 34], [KING_FEET[0] - KH * 0.45 + 34, BED.top - 26], [KING_FEET[0] - KH * 0.45 + 44, BED.top + 60], [KING_FEET[0] - KH * 0.45 + 16, BED.top + 88]];
// the table and the cup
const TABLE: P[] = [[1030, GRAIL[1] + 6], [1170, GRAIL[1] + 6], [1170, GRAIL[1] + 20], [1030, GRAIL[1] + 20]], LEG: P[] = [[1092, GRAIL[1] + 20], [1108, GRAIL[1] + 20], [1116, FLOOR + 40], [1084, FLOOR + 40]];
const [gx, gy] = GRAIL;
const CUP: P[] = [[gx - 34, gy + 6], [gx - 28, gy], [gx - 6, gy - 6], [gx - 6, gy - 34], [gx - 40, gy - 50], [gx - 44, gy - 82], [gx + 44, gy - 82], [gx + 40, gy - 50], [gx + 6, gy - 34], [gx + 6, gy - 6], [gx + 28, gy], [gx + 34, gy + 6]];
const LID: P[] = [[gx - 46, gy - 82], [gx - 40, gy - 100], [gx - 16, gy - 112], [gx + 16, gy - 112], [gx + 40, gy - 100], [gx + 46, gy - 82]];
const KNOB = blob(gx, gy - 120, 8, 9, 60, 0.05, 10);
// the knight, on the right, looking at the cup
const KNIGHT = figure({ x: 1330, g: 820, h: 470, f: -1, robe: "armor", head: "coif", cloth: "#d8d0bc", ink: INK, near: [0.35, 0.8], far: [0.1, 0.3] });
const CROSS: P[][] = [[[1322, 480], [1338, 480], [1338, 596], [1322, 596]], [[1286, 520], [1374, 520], [1374, 536], [1286, 536]]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const king = lay(KING, { at: [40, 72], seed: 3000, ink: INK, ph: 4, from: FROM, hide: [coverlet(0), COVER_FOLD] });
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 4000, ink: INK, ph: 6, from: FROM });
const bedFront = [MATTRESS, FRAME_SIDE, PILLOW, ...KING.parts, coverlet(0), COVER_FOLD, CURTAIN_L, CURTAIN_R];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: FLOOR }, 58);
const scene: Omit<Stroke, "at">[] = [
  edge(FRAME, 1.6, [WINDOW]), edge(WINDOW, 1.5), st([[WIN.x0, 380], [WIN.x1, 370]], 1.2), st([[255, 110], [255, WIN.y1]], 5, 0.95, "#3a342a"), st([[WIN.x0, 330], [WIN.x1, 330]], 5, 0.95, "#3a342a"), // the mullion and transom
  ...WHEAT.flatMap((w) => [st([[w.x, w.g], [w.x + 1, w.g - w.h]], 1, 0.8, "#6f5d38"), st([[w.x + 1, w.g - w.h], [w.x + 2, w.g - w.h - 12]], 3, 0.95, "#1f1a14")]),
  ...POSTS.map((q) => edge(q, 1.5, [VALANCE, CURTAIN_L, CURTAIN_R, MATTRESS, FRAME_SIDE])), edge(VALANCE, 1.5), edge(CURTAIN_L, 1.4), edge(CURTAIN_R, 1.4),
  ...[0.3, 0.6].map((t) => st([[BED.x0 + 18 + 92 * (1 - t), 196], [BED.x0 + 18 + 40 * (1 - t), 500]], 0.9, 0.55)), ...[0.3, 0.6].map((t) => st([[BED.x1 - 18 - 112 * (1 - t), 196], [BED.x1 - 18 - 40 * (1 - t), 500]], 0.9, 0.55)),
  edge(FRAME_SIDE, 1.5), edge(MATTRESS, 1.3, [coverlet(0), COVER_FOLD, ...KING.parts]), edge(PILLOW, 1.3, KING.parts),
  ...king.strokes, edge(BANDAGE, 1.2), ...[0.3, 0.6].map((t) => st([[BANDAGE[0][0] + (BANDAGE[1][0] - BANDAGE[0][0]) * t, BED.top - 29], [BANDAGE[0][0] + (BANDAGE[1][0] - BANDAGE[0][0]) * t + 6, BED.top + 1]], 0.8, 0.6)),
  edge(TABLE, 1.4), edge(LEG, 1.3, [TABLE]), edge(CUP, 1.5), edge(LID, 1.5), edge(KNOB, 1.2), st([[gx - 40, gy - 60], [gx + 40, gy - 60]], 1, 0.6),
  ...knight.strokes,
  ...TILES.map((t) => edge(t.pts, 0.8, [...KNIGHT.m.parts, LEG, FRAME_SIDE, ...POSTS])),
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.3, mix(H.a, INK, 0.45), [FRAME, ...POSTS, VALANCE, CURTAIN_L, CURTAIN_R, ...bedFront, ...KNIGHT.m.parts, CUP, LID, KNOB, TABLE, LEG])), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 2.6, 0.45, H.gold, [FRAME, ...POSTS, VALANCE, CURTAIN_L, CURTAIN_R, ...bedFront, ...KNIGHT.m.parts, CUP, LID, KNOB, TABLE, LEG]))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  flat(WALL, WALLC, 0, [28, 58], 500), ...TILES.map((t, i) => flat(t.pts, t.c, 1, [30, 60], 700 + i)),
  flat(FRAME, "#b9b3a0", 1, [30, 60], 501), gilt(OUT_SKY, ROT, [32, 62], 502, { ph: 2, from: FROM }), flat(OUT_FIELD, "#8a7442", 2, [32, 62], 503),
  ...POSTS.map((q, i) => flat(q, WOODC, 2, [34, 64], 510 + i)), flat(VALANCE, RED, 3, [34, 64], 512), flat(CURTAIN_L, GREEN, 3, [36, 66], 513), flat(CURTAIN_R, GREEN, 3, [36, 66], 514),
  flat(FRAME_SIDE, WOODC, 3, [36, 66], 515), flat(MATTRESS, LINEN, 3, [36, 66], 516), flat(PILLOW, "#f2ecdc", 3, [38, 68], 517),
  ...king.washes, flat(BANDAGE, "#2a1612", 5, [44, 72], 518),
  flat(COVER_FOLD, mix(RED, "#000000", 0.25), 5, [42, 70], 519),
  flat(TABLE, WOODC, 4, [40, 70], 520), flat(LEG, WOODC, 4, [40, 70], 521),
  gilt(CUP, ROT * 0.3, [42, 72], 522, { ph: 5, from: FROM }), gilt(LID, ROT * 0.3, [44, 74], 523, { ph: 5, from: FROM }), gilt(KNOB, ROT * 0.3, [46, 74], 524, { ph: 5, from: FROM }),
  ...knight.washes, ...CROSS.map((q, i) => flat(q, "#8a2a1f", 7, [46, 76], 530 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const MOTES = (() => { const q = rng(71); return Array.from({ length: 12 }, () => ({ x: 200 + q() * 400, y: 300 + q() * 300, a: 10 + q() * 20, p: q() * 6.28 })); })();
export const c07 = page({
  id: "c07", title: "Le Roi Pêcheur", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [56, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, breath = (Math.sin(TT * 2) + 1) / 2;
    // the coverlet over his chest, rising and falling slowly: two breaths a loop
    g.group("plain", () => { const c = coverlet(breath); g.fill(c, RED, reveal); g.pen(dense([...c, c[0]]), { w: 1.4, color: INK, seed: 40, wobble: 0.3, boil: 0.2, taper: 1, opacity: 0.9, retrace: false, progress: reveal }); [0.3, 0.55, 0.8].forEach((u, i) => { const x = c[0][0] + (c[3][0] - c[0][0]) * u; g.pen([[x, c[1][1] + 12], [x + 6, BED.top + 80]], { w: 0.9, color: INK, seed: 41 + i, wobble: 0.2, boil: 0, opacity: 0.5, retrace: false, progress: reveal }); }); g.pen([[c[0][0] + 10, BED.top + 20], [c[3][0] - 10, BED.top + 16]], { w: 5, color: H.gold, seed: 45, wobble: 0.2, boil: 0, opacity: 0.8, retrace: false, progress: reveal }); });
    // the cup's light, very slow
    g.group("plain", () => g.glow(gx, gy - 56, 110, "#ffe6a0", 0.2 * reveal * (0.8 + 0.2 * Math.sin(TT))), { blend: "screen" });
    // dust turning in the window light
    g.group("plain", () => MOTES.forEach((m, i) => g.fill(blob(m.x + m.a * Math.sin(TT + m.p), m.y + m.a * 0.6 * Math.cos(TT * 2 + m.p), 1.6, 1.6, 80 + i, 0.1, 6), "#f6ecd0", 0.55 * reveal)), { blend: "screen" });
    if (reveal < 1) return;
    glint(g, [CUP, LID], t, LOOP, ROT * 0.3);
    borderGlint(g, t, LOOP, ROT);
  },
});
