// CORBENIC PAGE 6 · LA CRYPTE. One idea: under the castle, in the torchlight, a locked grille with
// a dove on its lock, and old dead who stay where they were laid.
// A vaulted passage cut in the rock. In the back wall, two tiers of burial niches, a shrouded body in
// each, grey with dust, bones through the cloth. On the left the well's iron rungs coming down and
// the knight, torch raised. On the right the grille across a stair going up, its lock plate engraved
// with a dove; beside it the other stair, open, with a little warm light coming down it.
// What moves: the torch flame and its light, a drop of water falling from the vault, the glint on
// the lock plate.
import { rng, sample, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0.5, H = hand(ROT), INK = H.ink;
const ROCKC = "#5a554a", ROCK2 = "#4a453c", NICHE = "#1e1a15", SHROUD = "#c9c3b0", BONE = "#e6dcc4", IRON = "#2e2c2a";
const B = border(ROT, [0, 44]);
const FLOOR = 770;

// ---------------------------------------------------------------- the passage
const BACK: P[] = [[44, 40], [1556, 40], [1556, FLOOR], [44, FLOOR]];
const VAULT = (x0: number, x1: number, y: number): P[] => { const cx = (x0 + x1) / 2, R = (x1 - x0) / 2; return Array.from({ length: 17 }, (_, i) => { const a = Math.PI - (i / 16) * Math.PI; return [cx + Math.cos(a) * R, y - Math.sin(a) * R * 0.5] as P; }); };
const RIBS = [[44, 560, 250], [560, 1100, 250], [1100, 1556, 250]].map(([a, b, y]) => VAULT(a, b, y));
const GROUND: P[] = [[44, 870], [44, FLOOR], [1556, FLOOR], [1556, 870]];
// the niches, two tiers, with their dead
const r = rng(8);
const niche = (x: number, y: number, w: number, h: number): P[] => [[x, y + h], [x, y + h * 0.3], ...Array.from({ length: 9 }, (_, i) => { const a = Math.PI - (i / 8) * Math.PI; return [x + w / 2 + Math.cos(a) * (w / 2), y + h * 0.3 - Math.sin(a) * h * 0.3] as P; }), [x + w, y + h * 0.3], [x + w, y + h]];
const NICHES = [...[330, 540, 750, 960].map((x) => ({ x, y: 290, w: 180, h: 110 })), ...[330, 540, 750, 960].map((x) => ({ x, y: 470, w: 180, h: 110 }))];
const shroud = (n: { x: number; y: number; w: number; h: number }, k: number) => {
  const base = n.y + n.h - 8, x0 = n.x + 12, x1 = n.x + n.w - 12, L = x1 - x0, headRight = k % 2 === 0;
  // the top of a wrapped body, head to feet: the round of the head, the neck, the chest, the knees, the feet
  const prof: [number, number][] = [[0, 16], [0.04, 32], [0.1, 36], [0.16, 26], [0.24, 34], [0.4, 36], [0.55, 30], [0.72, 28], [0.86, 22], [0.96, 20], [1, 12]];
  const X = (u: number) => (headRight ? x1 - u * L : x0 + u * L);
  const top = prof.map(([u, h]) => [X(u), base - h] as P), body = sample([...top, [X(1), base], [X(0), base]], true, 3);
  const cx = X(0.36 + r() * 0.12), tear = blob(cx, base - 18, 16, 9, 400 + k, 0.2, 10);
  const ribs: P[][] = [-9, -2, 5, 12].map((dx) => [[cx + dx - 4, base - 26], [cx + dx, base - 18], [cx + dx - 3, base - 10]]);
  const wraps: P[][] = [0.22, 0.5, 0.64, 0.8].map((u) => [[X(u) - 4, base - prof.find((q) => q[0] >= u)![1] + 2], [X(u) + 4, base - 2]]);
  return { body, tear, ribs, wraps };
};
const DEAD = NICHES.map(shroud);
// the grille across the stair on the right, and its lock
const GR = { x0: 1150, x1: 1330, y0: 380, y1: FLOOR };
const STAIR1: P[] = [[GR.x0, FLOOR], [GR.x0, GR.y0 + 40], [GR.x0 + 30, GR.y0], [GR.x1 - 30, GR.y0], [GR.x1, GR.y0 + 40], [GR.x1, FLOOR]];
const STEPS1: P[][] = [0, 1, 2, 3, 4, 5].map((i) => [[GR.x0 + 10, FLOOR - 20 - i * 58], [GR.x1 - 10, FLOOR - 40 - i * 58]]);
const BARS: P[][] = Array.from({ length: 7 }, (_, i) => [[GR.x0 + 18 + i * 24, GR.y0 + 6], [GR.x0 + 18 + i * 24, FLOOR]]);
const BANDS: P[][] = [GR.y0 + 90, GR.y0 + 250].map((y) => [[GR.x0 + 4, y], [GR.x1 - 4, y]]);
const LOCK: P[] = [[1180, 540], [1236, 540], [1236, 606], [1180, 606]];
const DOVE: P[] = [[1190, 572], [1200, 564], [1208, 566], [1214, 558], [1222, 560], [1218, 568], [1228, 570], [1212, 580], [1196, 580]];
const KEYHOLE: P[] = [[1204, 588], [1212, 588], [1210, 600], [1206, 600]];
// the open stair beside it, a little light coming down
const STAIR2: P[] = [[1380, FLOOR], [1380, 420], [1410, 380], [1500, 380], [1530, 420], [1530, FLOOR]];
const STEPS2: P[][] = [0, 1, 2, 3, 4, 5].map((i) => [[1388, FLOOR - 20 - i * 58], [1522, FLOOR - 44 - i * 58]]);
// the well's rungs, and the knight at the foot of them with his torch up
const RUNGS: P[][] = Array.from({ length: 9 }, (_, i) => [[120, 90 + i * 64], [210, 90 + i * 64]]);
const RAILS: P[][] = [[[120, 40], [120, FLOOR]], [[210, 40], [210, FLOOR]]];
const KNIGHT = figure({ x: 300, g: 830, h: 460, robe: "armor", head: "coif", cloth: "#e0d8c4", ink: INK, near: [2.3, 2.9], far: [0.35, 0.7] });
const TORCH_TOP: P = [KNIGHT.hands.near[0] + 26, KNIGHT.hands.near[1] - 70], TORCH: P[] = [[KNIGHT.hands.near[0] - 8, KNIGHT.hands.near[1] + 26], TORCH_TOP];
const CROSS: P[][] = [[[292, 490], [306, 490], [306, 596], [292, 596]], [[260, 524], [338, 524], [338, 538], [260, 538]]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 3000, ink: INK, ph: 6, from: TORCH_TOP });
const fore = KNIGHT.m.parts;
const holes = [...NICHES.map((n) => niche(n.x, n.y, n.w, n.h)), STAIR1, STAIR2];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: FLOOR }, 64);
const scene: Omit<Stroke, "at">[] = [
  ...RIBS.map((l) => st(l, 2, 0.8, INK, [...holes, ...fore])), ...RIBS.map((l) => st(l.map(([x, y]) => [x, y + 16] as P), 1, 0.5, INK, [...holes, ...fore])),
  ...RAILS.map((l) => st(l, 3.4, 0.95, IRON, fore)), ...RUNGS.map((l) => st(l, 3, 0.95, IRON, fore)),
  ...NICHES.map((n) => edge(niche(n.x, n.y, n.w, n.h), 1.5, fore)),
  ...DEAD.flatMap((d) => [edge(d.body, 1.2, fore), edge(d.tear, 1, fore), ...d.ribs.map((l) => st(l, 2.4, 0.95, BONE, fore)), ...d.wraps.map((l) => st(l, 0.9, 0.55, INK, fore))]),
  edge(STAIR1, 1.5), ...STEPS1.map((l) => st(l, 1.2, 0.7, INK, BARS.map((b) => b.map(([x, y]) => [x - 4, y] as P).concat(b.map(([x, y]) => [x + 4, y] as P).reverse())))),
  ...BARS.map((l) => st(l, 5, 1, IRON)), ...BANDS.map((l) => st(l, 6, 1, IRON)), edge(LOCK, 1.3), edge(DOVE, 1), edge(KEYHOLE, 0.8),
  edge(STAIR2, 1.5), ...STEPS2.map((l, i) => st(l, 2.2, 0.5 + i * 0.08, mix("#8a7450", "#e8c98a", i / 5))),
  st([[44, FLOOR], [1556, FLOOR]], 1.5, 0.9, INK, [...fore, STAIR1, STAIR2]), ...[800, 836].map((y) => st([[44, y], [1556, y]], 0.8, 0.4, INK, fore)),
  ...knight.strokes, st(TORCH, 7, 1, "#5a3a22"), st(TORCH, 1.2, 0.9),
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.25, mix(H.a, INK, 0.3), [...holes, ...fore])), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 2.6, 0.35, H.gold, [...holes, ...fore]))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: TORCH_TOP, flat: true });
const washes: Wash[] = [
  flat(BACK, ROCKC, 0, [28, 58], 500), flat(GROUND, ROCK2, 1, [30, 60], 501),
  ...NICHES.map((n, i) => flat(niche(n.x, n.y, n.w, n.h), NICHE, 2, [32, 62], 510 + i)),
  ...DEAD.flatMap((d, i) => [flat(d.body, SHROUD, 3, [36, 66], 520 + i * 4), flat(d.tear, "#2a221a", 4, [38, 68], 522 + i * 4)]),
  flat(STAIR1, "#3a342c", 2, [34, 64], 560), flat(STAIR2, "#2e2820", 2, [34, 64], 561),
  gilt(LOCK, ROT, [42, 70], 562, { ph: 5, from: TORCH_TOP }), flat(DOVE, "#e6e0d0", 5, [44, 72], 563), flat(KEYHOLE, "#140e0a", 5, [44, 72], 564),
  ...knight.washes, ...CROSS.map((q, i) => flat(q, "#9a2a1f", 7, [46, 76], 570 + i)),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const flame = (x: number, y: number, TT: number, s: number): P[] => {
  const h = (44 + 7 * Math.sin(TT * 5) + 5 * Math.sin(TT * 13 + 1)) * s, lean = 5 * Math.sin(TT * 7) * s;
  return [[x - 12 * s, y + 4], [x - 14 * s, y - h * 0.3], [x - 4 + lean * 0.5, y - h * 0.7], [x + lean, y - h], [x + 6 + lean * 0.4, y - h * 0.62], [x + 14 * s, y - h * 0.3], [x + 12 * s, y + 4]];
};
const DRIP = { x: 820, y0: 150, y1: FLOOR };
export const c06 = page({
  id: "c06", title: "La Crypte", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [40, 80],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, flick = 1 + 0.07 * Math.sin(TT * 5) + 0.05 * Math.sin(TT * 11 + 1.3);
    // the torchlight, and a little from the open stair
    g.group("plain", () => { g.glow(TORCH_TOP[0], TORCH_TOP[1] - 20, 420, "#ffb347", 0.16 * reveal * flick); g.glow(TORCH_TOP[0], TORCH_TOP[1] - 20, 90, "#ffd27a", 0.4 * reveal * flick); g.glow(1455, 400, 120, "#ffcf7a", 0.12 * reveal * (0.9 + 0.1 * Math.sin(TT * 2))); }, { blend: "screen" });
    g.group("plain", () => { g.fill(flame(TORCH_TOP[0], TORCH_TOP[1], TT, 1), "#f2a93a", reveal); g.fill(flame(TORCH_TOP[0], TORCH_TOP[1] - 2, TT, 0.5), "#fff0c0", reveal); });
    // a drop of water, once a loop: it swells on the vault, falls, and rings on the floor
    const p = (t % LOOP) / LOOP;
    g.group("plain", () => {
      if (p < 0.6) g.fill(blob(DRIP.x, DRIP.y0 + p * 6, 3 + p * 3, 4 + p * 5, 3, 0.05, 8), "#b9c9c4", 0.8 * reveal);
      else if (p < 0.7) { const q = (p - 0.6) / 0.1, y = DRIP.y0 + (DRIP.y1 - DRIP.y0) * q * q; g.fill(blob(DRIP.x, y, 3, 6, 4, 0.05, 8), "#b9c9c4", 0.8 * reveal); }
      else if (p < 0.85) { const q = (p - 0.7) / 0.15; g.pen(dense(blob(DRIP.x, DRIP.y1 + 8, 8 + q * 40, 2 + q * 8, 5, 0, 14).concat([blob(DRIP.x, DRIP.y1 + 8, 8 + q * 40, 2 + q * 8, 5, 0, 14)[0]]), 8), { w: 1.4, color: "#b9c9c4", seed: 6, wobble: 0.1, boil: 0, opacity: (1 - q) * 0.8, retrace: false }); }
    });
    if (reveal < 1) return;
    glint(g, [LOCK], t, LOOP, ROT);
    borderGlint(g, t, LOOP, ROT);
  },
});
