// CORBENIC PAGE 5 · LA COUR. One idea: the knight in the middle of the dead, who do not die twice.
// The book has turned: the gold is dull and pitted, verdigris in the bar, thorns in the border.
// Inside Corbenic's courtyard: on the left the stair tower with its open door, on the right the
// keep's door where the singing comes from. The dead stand in rows facing it, shields on their arms.
// Yvain in the front row, half his face gone, a crow on his shoulder. In the middle the knight, his
// sword out, and the dead man he has struck.
// What moves: the struck man going down and getting up again; the dead swaying; the crow; the
// glint, weaker now, on the gold.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, motif, paintMotif, rotate, type Shield } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0.5, H = hand(ROT), INK = H.ink;
const STONE = "#b9b6a4", STONE2 = "#a3a08e", FLAGS = "#9c9580", DOORC = "#1e1812";
const B = border(ROT, [0, 44]);
const FROM: P = [800, 520];
const G = 830; // the flagstones' front edge

// ---------------------------------------------------------------- the courtyard
const SKY: P[] = [[44, 40], [1556, 40], [1556, 330], [44, 330]];
const BACKWALL: P[] = [[44, 640], [44, 300], ...crenel(44, 1556, 300, 40), [1556, 300], [1556, 640]];
const TOWER: P[] = [[44, 860], [44, 150], [120, 70], [300, 70], [300, 860]];
const TOWER_ROOF: P[] = [[34, 160], [172, 44], [310, 160]];
const STAIR_DOOR: P[] = [[110, 760], [110, 520], [130, 482], [172, 464], [214, 482], [234, 520], [234, 760]];
const STEPS: P[][] = [0, 1, 2, 3, 4].map((i) => [[118 + i * 6, 740 - i * 44], [226 - i * 6, 740 - i * 44 - 18]]);
const KEEP: P[] = [[1250, 860], [1250, 130], ...crenel(1250, 1556, 130, 40), [1556, 130], [1556, 860]];
const KEEP_DOOR: P[] = [[1320, 800], [1320, 540], [1344, 500], [1390, 482], [1436, 500], [1460, 540], [1460, 800]];
const GROUND: P[] = [[44, 870], [44, 640], [1556, 640], [1556, 870]];
function crenel(x0: number, x1: number, y: number, step = 30): P[] { const out: P[] = []; for (let x = x0; x < x1 - step / 2; x += step) out.push([x, y], [x, y - 20], [x + step / 2, y - 20], [x + step / 2, y]); return out; }
const FLAG_LINES: P[][] = [...[680, 730, 790].map((y) => [[44, y], [1556, y]] as P[]), ...Array.from({ length: 18 }, (_, i) => [[80 + i * 86 + (i % 2) * 30, 640], [70 + i * 86, 870]] as P[])];

// ---------------------------------------------------------------- the dead, in rows facing the keep door
const SH: Shield[] = [{ field: "#2d4f8e", mark: "#b9a15a", ord: "lion" }, { field: "#d8cfb8", mark: "#8a2a1f", ord: "merlettes" }, { field: "#3f6a3a", mark: "#d8cfb8", ord: "bend" }, { field: "#8a2a1f", mark: "#b9a15a", ord: "chevron" }, { field: "#9a8350", mark: "#2a1c14", ord: "cross" }, { field: "#5a4a6a", mark: "#d8cfb8", ord: "pale" }];
const CL = ["#3a5a7a", "#c8c0a8", "#4a6a44", "#7a3a2a", "#9a7a3a", "#5a4a6a", "#6b7f8a", "#7a6a4a"];
const r = rng(21);
type Dead = { x: number; g: number; h: number; f: 1 | -1; i: number; ph: number };
const ROW = (y: number, h: number, xs: number[]) => xs.map((x, k) => ({ x: x + (r() - 0.5) * 20, g: y, h, f: 1 as const, i: Math.floor(r() * 6), ph: r() * 6.28 }));
const BACK: Dead[] = ROW(690, 300, [360, 470, 580, 700, 820, 940, 1060, 1170]);
const MIDDLE: Dead[] = ROW(760, 360, [420, 900, 1020, 1140]);
const deadFig = (d: Dead, sway = 0, lite = true) => figure({ x: d.x, g: d.g, h: d.h, f: d.f, lean: 0.04 + sway, robe: "armor", head: "coif", cloth: CL[(d.i + d.x) % CL.length | 0], ink: INK, dead: true, lite, near: [0.25, 0.6], far: [0.2, 0.5], shield: SH[d.i] });
// Yvain in the front row, the crow on his shoulder
const YV = { x: 370, g: G - 4, h: 440 };
const YVAIN = figure({ x: YV.x, g: YV.g, h: YV.h, f: 1, lean: 0.03, robe: "armor", head: "coif", cloth: "#2d4f8e", ink: INK, dead: true, near: [0.25, 0.6], far: [0.2, 0.5], shield: SH[0] });
const GONE: P[] = (() => { const [cx, cy] = YVAIN.head; return [[cx - 4, cy - 30], [cx - 30, cy - 18], [cx - 34, cy + 8], [cx - 22, cy + 30], [cx - 2, cy + 34], [cx + 4, cy + 10], [cx - 6, cy - 6]]; })(); // the half of his face that is not there
const SHOULDER: P = [YV.x - 0.075 * YV.h, YV.g - 0.8 * YV.h]; // his far shoulder, so the bird stands against the wall
// the knight, sword out, and the man he has just cut down
const KN = { x: 700, h: 450 };
const KNIGHT = figure({ x: KN.x, g: G, h: KN.h, robe: "armor", head: "coif", cloth: "#e8e0cc", ink: INK, near: [1.35, 1.55], far: [0.35, 0.8] });
const BLADE: P[] = [[KNIGHT.hands.near[0] + 8, KNIGHT.hands.near[1] + 1], [KNIGHT.hands.near[0] + 190, KNIGHT.hands.near[1] + 34]];
const GUARD: P[] = [[KNIGHT.hands.near[0] + 12, KNIGHT.hands.near[1] - 16], [KNIGHT.hands.near[0] + 5, KNIGHT.hands.near[1] + 18]];
const CROSS: P[][] = [[[692, 510], [708, 510], [708, 624], [692, 624]], [[656, 548], [744, 548], [744, 564], [656, 564]]];
const STRUCK = { x: 930, g: G, h: 430 };
// 0 on his feet, 1 flat on his back, and up again: a fall, a still moment, a slow rise
const fallAt = (t: number) => { const p = (t % LOOP) / LOOP; return p < 0.12 ? (p / 0.12) ** 2 : p < 0.4 ? 1 : p < 0.8 ? 1 - ((p - 0.4) / 0.4) ** 1.4 : 0; };
const struck = (fall: number) => rotate(figure({ x: STRUCK.x, g: STRUCK.g, h: STRUCK.h, f: -1, lean: 0.02, robe: "armor", head: "coif", cloth: "#7a6a4a", ink: INK, dead: true, lite: true, near: [0.8 - fall * 0.5, 1.2], far: [0.6, 1.0], shield: SH[3] }).m, [STRUCK.x + 30, STRUCK.g], fall * 82);
// the three nearest dead in the middle row sway (the rest keep still on the plate)
const SWAY = MIDDLE.slice(1);

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const backRow = motif(...BACK.map((d) => deadFig(d).m)), middleStill = motif(deadFig(MIDDLE[0]).m);
const front = [...YVAIN.m.parts, ...KNIGHT.m.parts];
const layBack = lay(backRow, { at: [40, 70], seed: 3000, ink: INK, ph: 4, from: FROM, hide: [...middleStill.parts, ...front, ...SWAY.flatMap((d) => deadFig(d).m.parts)] });
const layMid = lay(middleStill, { at: [42, 72], seed: 3500, ink: INK, ph: 5, from: FROM, hide: front });
const layFront = lay(motif(YVAIN.m, KNIGHT.m), { at: [44, 74], seed: 4000, ink: INK, ph: 6, from: FROM });
const people = [...backRow.parts, ...middleStill.parts, ...front];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 330 }, 46);
const skyFront = [TOWER, TOWER_ROOF, KEEP, BACKWALL, ...people];
const scene: Omit<Stroke, "at">[] = [
  edge(BACKWALL, 1.5, [TOWER, KEEP, ...people]), ...[380, 460, 540].map((y) => st([[44, y], [1556, y]], 0.8, 0.4, INK, [TOWER, KEEP, ...people])),
  edge(TOWER, 1.6, people), edge(TOWER_ROOF, 1.5), edge(STAIR_DOOR, 1.5, people), ...STEPS.map((l) => st(l, 1.2, 0.8, INK, people)),
  edge(KEEP, 1.6, people), edge(KEEP_DOOR, 1.6, people), ...[1360, 1420].map((x) => st([[x, 540], [x, 800]], 1, 0.5, "#6a5a46", people)),
  ...FLAG_LINES.map((l) => st(l, 0.9, 0.5, INK, [TOWER, KEEP, ...people])),
  ...layBack.strokes, ...layMid.strokes, ...layFront.strokes, edge(GONE, 1.2),
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.38, mix(H.gold, INK, 0.45), skyFront)), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 3, 0.5, mix(H.gold, INK, 0.35), skyFront))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  gilt(SKY, ROT, [30, 60], 500, { ph: 0, from: [800, 40] }),
  flat(BACKWALL, STONE2, 1, [32, 62], 501), flat(GROUND, FLAGS, 1, [32, 62], 502),
  flat(TOWER, STONE, 2, [34, 64], 510), flat(TOWER_ROOF, mix(H.a, "#3a4a52", 0.5), 2, [34, 64], 511), flat(STAIR_DOOR, DOORC, 2, [36, 66], 512),
  flat(KEEP, STONE, 2, [34, 64], 513), flat(KEEP_DOOR, DOORC, 2, [36, 66], 514),
  ...layBack.washes, ...layMid.washes, ...layFront.washes,
  flat(GONE, "#7a2a22", 7, [48, 76], 520), flat(blob(YVAIN.head[0] - 16, YVAIN.head[1] - 2, 7, 8, 523, 0.1, 10), "#140c0a", 7, [50, 78], 524), // the eye socket
  ...CROSS.map((q, i) => flat(q, "#9a2a1f", 7, [48, 76], 521 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const crow = (TT: number): { body: P[]; head: P[]; beak: P[]; wing: P[] } => {
  const [x, y] = SHOULDER, turn = Math.sin(TT * 2) > 0.6 ? 1 : -1, flick = Math.max(0, Math.sin(TT * 3 - 1)) ** 8;
  const hx = x + 4, hy = y - 34;
  return {
    body: blob(x - 8, y - 20, 30, 16, 61, 0.12, 12, 0.35),
    head: blob(hx - 8, hy - 8, 12, 11, 62, 0.08, 10),
    beak: [[hx - 8 + 10 * turn, hy - 11], [hx - 8 + 28 * turn, hy - 6], [hx - 8 + 10 * turn, hy - 3]],
    wing: [[x - 30, y - 24], [x - 58, y - 40 - flick * 34], [x + 2, y - 30]],
  };
};
export const c05 = page({
  id: "c05", title: "La Cour", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [58, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    SWAY.forEach((d, i) => paintMotif(g, deadFig(d, 0.025 * Math.sin(TT + d.ph)).m, { ink: INK, seed: 6000 + i * 100, reveal, hide: front }));
    paintMotif(g, struck(fallAt(t)), { ink: INK, seed: 7000, reveal });
    // the knight's sword, nearest of all
    g.group("plain", () => { g.pen(BLADE, { w: 9, color: INK, seed: 89, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false, progress: reveal }); g.pen(BLADE, { w: 6, color: "#d3d6da", seed: 90, wobble: 0.1, boil: 0, opacity: 1, retrace: false, progress: reveal }); g.pen(GUARD, { w: 6, color: "#6b5a3a", seed: 91, wobble: 0.1, boil: 0, opacity: 1, retrace: false, progress: reveal }); });
    g.group("plain", () => {
      const c = crow(TT);
      [c.wing, c.body, c.head].forEach((q) => { g.fill(q, "#15110e", reveal); g.pen(dense([...q, q[0]], 8), { w: 1, color: INK, seed: 71, wobble: 0.1, boil: 0, opacity: 0.8, retrace: false }); });
      g.fill(c.beak, "#3a3228", reveal);
      g.fill(blob(c.head[0][0] - 2, c.head[0][1] - 2, 1.6, 1.6, 72, 0, 6), "#c9b98a", reveal);
    });
    if (reveal < 1) return;
    glint(g, [SKY], t, LOOP, ROT, skyFront);
    borderGlint(g, t, LOOP, ROT);
  },
});
