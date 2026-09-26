// CORBENIC PAGE 3 · LE CIMETIÈRE. One idea: Perceval, dead, chained to a cross, still straining
// toward Corbenic, with the key the knight needs hanging at his belt.
// The gold sky over the cemetery wall, the chapel's blue roof showing behind it on the left. In the
// ground, graves opened from below: dark pits with the earth thrown out round them, their little
// crosses knocked askew. On the right the big wooden cross and Perceval in his vermilion surcoat,
// chained to it by the waist, arms dragged back, face grey. The knight on the left, reaching.
// What moves: Perceval throwing himself forward, the chain snapping him back, his head knocking on
// the cross; the key swinging at his belt; the glint on the gold.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, paintMotif } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand, house } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0, H = hand(ROT), INK = H.ink;
const EARTH = "#9c8458", DARK_EARTH = "#6e5636", PIT = "#2a1d14", WOODC = "#7a5a3a", STONE = "#cfc3a6";
const B = border(ROT, [0, 44]);
const FROM: P = [1000, 560];

// ---------------------------------------------------------------- the ground and the wall
const SKY: P[] = [[44, 40], [1556, 40], [1556, 470], [44, 470]];
const CHAPEL = house({ x: 250, g: 440, w: 230, h: 150, roof: 110, wall: "#eadcc0", roofC: H.a, door: "none", win: "lit", bell: true, ink: INK });
const WALL: P[] = [[44, 520], [44, 420], [1556, 432], [1556, 530]];
const GROUND: P[] = [[44, 870], [44, 506], [1556, 516], [1556, 870]];
// the open graves: a pit, the earth heaped round it, clods thrown out
const r = rng(31);
const GRAVES = [[200, 640, 70], [430, 580, 56], [700, 700, 80], [640, 560, 48], [1300, 620, 60], [1420, 760, 74]].map(([x, y, s]) => ({
  x, y, s, heap: blob(x, y, s * 1.35, s * 0.55, 700 + x, 0.2, 18), pit: blob(x, y + 2, s * 0.9, s * 0.3, 800 + x, 0.12, 14),
  clods: Array.from({ length: 6 }, (_, i) => { const a = (i / 6) * Math.PI * 2 + r(); return blob(x + Math.cos(a) * s * (1.6 + r() * 0.4), y + Math.sin(a) * s * 0.7, 6 + r() * 5, 4 + r() * 3, 900 + x + i, 0.3, 8); }),
  cross: (() => { const tilt = (r() - 0.5) * 0.5, bx = x + s * 1.1, by = y - s * 0.2, up = (d: number): P => [bx + Math.sin(tilt) * d, by - Math.cos(tilt) * d], side = (d: number, k: number): P => [up(d)[0] + Math.cos(tilt) * k, up(d)[1] + Math.sin(tilt) * k]; return { up: [up(0), up(s * 1.2)], arm: [side(s * 0.85, -s * 0.35), side(s * 0.85, s * 0.35)] }; })(),
}));

// ---------------------------------------------------------------- the big cross and Perceval
const CX = 1060, CROSS_UP: P[] = [[CX - 18, 830], [CX - 18, 250], [CX + 18, 250], [CX + 18, 830]], CROSS_ARM: P[] = [[CX - 170, 340], [CX + 170, 340], [CX + 170, 376], [CX - 170, 376]];
const MOUND = blob(CX, 832, 130, 26, 77, 0.15, 16);
const PH = 450, PG = 812;
// `lunge` 0 at rest against the cross, 1 thrown forward as far as the chain lets him
const perceval = (lunge: number) => figure({ x: CX - 40 - lunge * 34, g: PG, h: PH, f: -1, lean: 0.03 + lunge * 0.12, robe: "armor", head: "coif", cloth: "#b8321f", metal: "#9a7a70", ink: INK, dead: true, near: [-0.55 + lunge * 0.2, -0.2], far: [-0.7 + lunge * 0.2, -0.35] });
const REST = perceval(0);
// the knight, reaching for the key
const KNIGHT = figure({ x: 560, g: 820, h: 470, robe: "armor", head: "coif", cloth: "#f0e8d6", ink: INK, near: [1.25, 1.52], far: [0.3, 0.6] });
const RED_CROSS: P[][] = [[[552, 500], [568, 500], [568, 620], [552, 620]], [[514, 540], [606, 540], [606, 556], [514, 556]]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const chapel = lay(CHAPEL, { at: [40, 66], seed: 2000, ink: INK, ph: 1, from: FROM, hide: [WALL] });
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 3000, ink: INK, ph: 5, from: FROM });
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 470 }, 46);
const skyFront = [...CHAPEL.parts, WALL, CROSS_UP, CROSS_ARM, ...KNIGHT.m.parts];
const front = [...KNIGHT.m.parts, ...REST.m.parts];
const scene: Omit<Stroke, "at">[] = [
  ...chapel.strokes, st(WALL.slice(1, 3), 1.6, 0.9, INK, [CROSS_UP]), ...[450, 480].map((y) => st([[44, y - 20 + (y - 450) * 0.1], [1556, y - 8]], 0.9, 0.45, INK, [CROSS_UP, ...front])),
  ...Array.from({ length: 24 }, (_, i) => st([[80 + i * 62, 430], [80 + i * 62, 522]], 0.8, 0.4, INK, [CROSS_UP, ...front])),
  ...GRAVES.flatMap((g) => [edge(g.heap, 1.3, front), edge(g.pit, 1.2, front), ...g.clods.map((c) => edge(c, 0.9, front)), st(g.cross.up, 4, 0.95, WOODC, front), st(g.cross.arm, 4, 0.95, WOODC, front)]),
  edge(MOUND, 1.3, front), edge(CROSS_UP, 1.8, [CROSS_ARM, ...REST.m.parts]), edge(CROSS_ARM, 1.8, REST.m.parts),
  ...[300, 440, 560, 700].map((y) => st([[CX - 8, y], [CX - 2, y + 30]], 0.9, 0.5, INK, REST.m.parts)), st([[CX - 120, 358], [CX - 60, 352]], 0.9, 0.5), st([[CX + 60, 356], [CX + 130, 362]], 0.9, 0.5), // grain
  ...knight.strokes,
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.45, mix(H.gold, INK, 0.45), skyFront)), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 3, 0.6, mix(H.gold, INK, 0.35), skyFront))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  gilt(SKY, ROT, [30, 62], 500, { ph: 0, from: [800, 40] }),
  ...chapel.washes,
  flat(WALL, STONE, 2, [36, 64], 510), flat(GROUND, EARTH, 2, [36, 66], 511),
  ...GRAVES.flatMap((g, i) => [flat(g.heap, DARK_EARTH, 3, [40, 70], 520 + i * 10), flat(g.pit, PIT, 3, [42, 72], 521 + i * 10), ...g.clods.map((c, k) => flat(c, DARK_EARTH, 3, [42, 72], 522 + i * 10 + k))]),
  flat(MOUND, DARK_EARTH, 3, [40, 70], 600), flat(CROSS_UP, WOODC, 4, [40, 70], 601), flat(CROSS_ARM, WOODC, 4, [40, 70], 602),
  ...knight.washes, ...RED_CROSS.map((q, i) => flat(q, H.b, 6, [46, 76], 610 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
// two lunges a loop: he leans into the chain, holds, and it throws him back against the wood
const ease = (p: number) => p * p * (3 - 2 * p);
const lungeAt = (t: number) => { const p = ((t / LOOP) * 2) % 1; return p < 0.55 ? ease(p / 0.55) : p < 0.66 ? 1 : p < 0.72 ? 1 - (p - 0.66) / 0.06 : 0; };
const knockAt = (t: number) => { const p = ((t / LOOP) * 2) % 1; return p >= 0.72 && p < 0.8 ? 1 - (p - 0.72) / 0.08 : 0; };
// the chain: links from his waist round the upright
const links = (a: P, b: P, n: number, sag: number): P[][] => Array.from({ length: n }, (_, i) => { const t = (i + 0.5) / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t + Math.sin(t * Math.PI) * sag; return blob(x, y, 6, 3.6, 40 + i, 0.05, 8, (i % 2) * 1.2 + Math.atan2(b[1] - a[1], b[0] - a[0])); });
export const c03 = page({
  id: "c03", title: "Le Cimetière", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [56, 88],
  anim: (g, t, reveal) => {
    const L = lungeAt(t), P = perceval(L), waist: P = [P.feet[0] - 0.02 * PH - L * 20, PG - 0.56 * PH], post: P = [CX + 18, PG - 0.56 * PH + 6];
    // the chain behind him first, then Perceval, then the chain across his front
    g.group("plain", () => links([waist[0] + 30, waist[1] - 6], post, 6, 3 - L * 3).forEach((q) => { g.fill(q, "#6b6258", reveal); g.pen([...q, q[0]], { w: 1, color: INK, seed: 50, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false }); }));
    paintMotif(g, P.m, { ink: INK, seed: 5000, reveal });
    g.group("plain", () => links(waist, [CX - 18, PG - 0.56 * PH + 4], 7, 6 - L * 5).forEach((q) => { g.fill(q, "#7c7268", reveal); g.pen([...q, q[0]], { w: 1, color: INK, seed: 60, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false }); }));
    // the key on a thong at his belt, swinging with him
    const kb: P = [P.feet[0] - PH * (0.06 + 0.12 * L * 0.55), PG - 0.54 * PH], sw = Math.sin((t / LOOP) * Math.PI * 8) * 0.25 + L * 0.4, ke: P = [kb[0] + Math.sin(sw) * 46, kb[1] + Math.cos(sw) * 46];
    g.group("plain", () => {
      g.pen([kb, ke], { w: 1.4, color: "#5a3a22", seed: 70, wobble: 0.2, boil: 0, opacity: 0.95, retrace: false, progress: reveal });
      const ring = blob(ke[0], ke[1] + 8, 9, 9, 71, 0.02, 12), sx = ke[0] + Math.sin(sw) * 12, sy = ke[1] + 16;
      g.fill(ring, H.gold, reveal); g.fill(blob(ke[0], ke[1] + 8, 4, 4, 72, 0.02, 10), H.paper, reveal);
      g.pen([[ke[0], ke[1] + 16], [sx, sy + 36]], { w: 4, color: H.gold, seed: 73, wobble: 0.1, boil: 0, opacity: 1, retrace: false, progress: reveal });
      g.pen([[sx - 1, sy + 30], [sx + 9, sy + 30]], { w: 3, color: H.gold, seed: 74, wobble: 0.1, boil: 0, opacity: 1, retrace: false, progress: reveal });
      g.pen([...ring, ring[0]], { w: 1, color: INK, seed: 75, wobble: 0.1, boil: 0, opacity: 0.9, retrace: false, progress: reveal });
    });
    // the knock of his head on the wood
    const k = knockAt(t);
    if (k > 0) g.group("plain", () => [[-1, -0.6], [0, -1], [-0.6, 0.4]].forEach(([dx, dy], i) => { const c: P = [CX - 26, P.head[1] - 6]; g.pen([[c[0] + dx * 30, c[1] + dy * 30], [c[0] + dx * (30 + 18 * k), c[1] + dy * (30 + 18 * k)]], { w: 2, color: INK, seed: 80 + i, wobble: 0.2, boil: 0, opacity: 0.8 * k, retrace: false }); }));
    if (reveal < 1) return;
    glint(g, [[[44, 40], [1556, 40], [1556, 420], [44, 420]]], t, LOOP, ROT, skyFront);
    borderGlint(g, t, LOOP, ROT);
  },
});
