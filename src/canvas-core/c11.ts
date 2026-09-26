// CORBENIC PAGE 11 · LE BÛCHER. One idea: Camelot burning in the night, with its king and its Table.
// Blood and black. A night sky tooled in dark red, smoke going up into it. Camelot on its hill: the
// curtain wall, the towers, the great hall with its roof alight, every window lit from inside. On the
// near hill, the knight, watching, alone.
// What moves: the fire in the roofs and windows, sparks going up, the smoke, the glow on the hill.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay } from "./figures";
import { blob, clipped, mix } from "./gallery";
import { diaper, hand, hills } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 1, H = hand(ROT), INK = H.ink;
const NIGHT = "#1a0c0a", STONE = "#3a2e2a", STONE_LIT = "#5a3a2a", HILL = "#241612", HILL2 = "#2e1c16";
const B = border(ROT, [0, 44]);
const FROM: P = [900, 400];

// ---------------------------------------------------------------- the night and the hill
const SKY: P[] = [[44, 40], [1556, 40], [1556, 870], [44, 870]];
const CAM_HILL = hills(420, 1556, 600, 4, 40, 13, 870);
const NEAR: P[] = [[44, 870], [44, 640], [200, 620], [380, 660], [560, 740], [700, 870]];
// Camelot: the curtain wall, towers, the hall with its high roof, the keep
const G0 = 590;
function crenel(x0: number, x1: number, y: number, step = 26): P[] { const out: P[] = []; for (let x = x0; x < x1 - step / 2; x += step) out.push([x, y], [x, y - 14], [x + step / 2, y - 14], [x + step / 2, y]); return out; }
const WALL: P[] = [[600, G0], [600, 500], ...crenel(600, 1400, 500), [1400, 500], [1400, G0]];
const tower = (x: number, w: number, top: number) => ({ body: [[x - w / 2, G0], [x - w / 2, top], [x + w / 2, top], [x + w / 2, G0]] as P[], roof: [[x - w / 2 - 8, top], [x, top - w * 1.1], [x + w / 2 + 8, top]] as P[] });
const TOWERS = [tower(620, 70, 380), tower(1380, 70, 390), tower(1180, 90, 300)];
const HALL: P[] = [[760, 500], [760, 360], [1080, 360], [1080, 500]], HALL_ROOF: P[] = [[744, 362], [920, 220], [1096, 362]];
const WINDOWS: P[][] = [800, 860, 920, 980, 1040].map((x) => [[x - 10, 460], [x - 10, 410], [x, 396], [x + 10, 410], [x + 10, 460]]);
const TWIN: P[][] = [[1170, 360], [1190, 420], [620, 430], [1380, 440]].map(([x, y]) => [[x - 7, y + 20], [x - 7, y], [x, y - 8], [x + 7, y], [x + 7, y + 20]]);
// where the fire is: the hall roof most of all, the keep's roof, a tower
const FIRES = [{ x: 860, y: 300, w: 120, h: 150 }, { x: 960, y: 290, w: 130, h: 170 }, { x: 1040, y: 340, w: 70, h: 110 }, { x: 800, y: 350, w: 70, h: 90 }, { x: 1180, y: 250, w: 60, h: 90 }, { x: 620, y: 330, w: 40, h: 60 }];
// the knight on the near hill, turned toward it
const KNIGHT = figure({ x: 300, g: 820, h: 480, f: 1, robe: "armor", head: "coif", cloth: "#b8b0a0", ink: INK, near: [0.15, 0.3], far: [0.1, 0.2] });
const CROSS: P[][] = [[[292, 466], [308, 466], [308, 584], [292, 584]], [[256, 506], [344, 506], [344, 522], [256, 522]]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, "#0a0504", hide);
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 3000, ink: INK, ph: 6, from: FROM });
const TW = TOWERS.flatMap((t) => [t.body, t.roof]);
const town = [WALL, HALL, HALL_ROOF, ...TW];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 640 }, 52);
const scene: Omit<Stroke, "at">[] = [
  st(CAM_HILL.pts.slice(0, -2), 1.4, 0.8, "#0a0504", [...town, NEAR]),
  ...TOWERS.flatMap((t) => [edge(t.body, 1.5, [WALL]), edge(t.roof, 1.4)]),
  edge(HALL, 1.5, [WALL]), edge(HALL_ROOF, 1.5), edge(WALL, 1.5, TW.slice(0, 4)),
  ...WINDOWS.map((q) => edge(q, 1)), ...TWIN.map((q) => edge(q, 0.9)),
  st(NEAR.slice(1), 1.5, 0.9, "#0a0504", KNIGHT.m.parts),
  ...knight.strokes,
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.3, mix(H.a, "#000000", 0.2), [...town, CAM_HILL.pts, NEAR, ...KNIGHT.m.parts])), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 2.6, 0.45, H.gold, [...town, CAM_HILL.pts, NEAR, ...KNIGHT.m.parts]))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  flat(SKY, mix(NIGHT, H.a, 0.35), 0, [26, 56], 500),
  flat(CAM_HILL.pts, HILL2, 1, [28, 58], 501),
  ...TOWERS.flatMap((t, i) => [flat(t.body, STONE, 2, [30, 60], 510 + i * 2), flat(t.roof, "#241a18", 2, [30, 60], 511 + i * 2)]),
  flat(HALL, STONE_LIT, 2, [30, 60], 520), flat(HALL_ROOF, "#2a1a14", 2, [30, 60], 521), flat(WALL, STONE, 3, [32, 62], 522),
  ...[...WINDOWS, ...TWIN].map((q, i) => flat(q, "#f2a03a", 4, [40, 70], 530 + i)),
  flat(NEAR, HILL, 4, [34, 64], 540),
  ...knight.washes, ...CROSS.map((q, i) => flat(q, "#6a1a14", 7, [46, 76], 550 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const tongue = (x: number, base: number, w: number, h: number, TT: number, k: number): P[] => {
  const hh = h * (0.75 + 0.25 * Math.sin(TT * 4 + k * 1.7) + 0.1 * Math.sin(TT * 11 + k)), l = w * 0.25 * Math.sin(TT * 5 + k * 2.3);
  return [[x - w / 2, base], [x - w * 0.42, base - hh * 0.35], [x - w * 0.12 + l * 0.5, base - hh * 0.7], [x + l, base - hh], [x + w * 0.15 + l * 0.4, base - hh * 0.62], [x + w * 0.45, base - hh * 0.3], [x + w / 2, base]];
};
const SPARKS = (() => { const r = rng(55); return Array.from({ length: 28 }, () => ({ x: 760 + r() * 460, ph: r(), sp: 2 + Math.floor(r() * 3), drift: (r() - 0.5) * 80 })); })();
const SMOKE = [0, 1, 2, 3].map((i) => ({ x: 860 + i * 70, ph: i / 4 }));
export const c11 = page({
  id: "c11", title: "Le Bûcher", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [50, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // smoke, climbing and spreading, behind everything that burns
    g.group("plain", () => clipped(g, SKY, () => SMOKE.forEach((s, i) => { for (let k = 0; k < 3; k++) { const p = ((t / LOOP) * 2 + s.ph + k / 3) % 1, y = 260 - p * 240, rx = 40 + p * 110; g.fill(blob(s.x + p * 120 + Math.sin(p * 6 + i) * 20, y, rx, rx * 0.55, 600 + i * 3 + k, 0.3, 14), "#2a1e1c", 0.45 * Math.sin(p * Math.PI) * reveal); } })));
    g.group("plain", () => { g.glow(930, 330, 420, "#ff6a1a", 0.22 * reveal * (0.9 + 0.1 * Math.sin(TT * 6))); g.glow(300, 700, 260, "#ff7a2a", 0.08 * reveal); }, { blend: "screen" });
    g.group("plain", () => FIRES.forEach((f, i) => {
      for (let k = 0; k < 4; k++) { const x = f.x + (k - 1.5) * f.w * 0.28; g.fill(tongue(x, f.y + f.h * 0.35, f.w * 0.45, f.h * (0.7 + 0.3 * ((k + i) % 2)), TT * 2, i * 4 + k), "#d8561a", 0.95 * reveal); }
      for (let k = 0; k < 3; k++) { const x = f.x + (k - 1) * f.w * 0.22; g.fill(tongue(x, f.y + f.h * 0.35, f.w * 0.26, f.h * 0.55, TT * 2, i * 3 + k + 9), "#f5a534", reveal); }
      g.fill(tongue(f.x, f.y + f.h * 0.35, f.w * 0.16, f.h * 0.3, TT * 2, i + 20), "#ffe7a8", reveal);
    }));
    // sparks going up
    g.group("plain", () => SPARKS.forEach((s, i) => { const p = ((t / LOOP) * s.sp + s.ph) % 1, y = 360 - p * 300, x = s.x + s.drift * p + Math.sin(p * 9 + i) * 8; g.fill(blob(x, y, 1.8, 1.8, 700 + i, 0, 6), "#ffcf7a", (1 - p) * reveal); }), { blend: "screen" });
    if (reveal < 1) return;
    borderGlint(g, t, LOOP, ROT);
  },
});
