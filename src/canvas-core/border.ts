// THE BORDER, one design around every Corbenic picture, as the ship is one design for Dust Creek.
// A painted bar between two ruled lines, burnished gold squares at the corners, and ivy scrolls
// curling in from each corner and from the middle of each side, ending in gold bezants.
// It rots with the book: at rot 0 the ivy is three-lobed, green, lapis and vermilion; by 0.5 the
// leaves have gone to thorns and the gold is pitted; at 1 the vine is bone and the berries are blood.
// Its washes sit on phases 8 and 9, above anything a page paints, so the frame is always on top.
import { oval, rng, type Gfx, type P } from "./core";
import { lerp, smooth } from "./gallery";
import { gilt, glint, hand } from "./manuscript";
import { seq, type Stroke, type Wash } from "./west";

const O = { x0: 28, y0: 24, x1: 1572, y1: 876 }, I = { x0: 44, y0: 40, x1: 1556, y1: 860 }; // outer and inner rules
const rect = (b: typeof O): P[] => [[b.x0, b.y0], [b.x1, b.y0], [b.x1, b.y1], [b.x0, b.y1]];
const CS = 24; // half the side of a corner square
const CORNERS: P[][] = rect({ x0: 36, y0: 32, x1: 1564, y1: 868 }).map(([x, y]) => [[x - CS, y - CS], [x + CS, y - CS], [x + CS, y + CS], [x - CS, y + CS]]);
// the painted bar, one quad per side, stopping at the corner squares
const BARS: P[][] = [
  [[O.x0 + 2 * CS, O.y0], [O.x1 - 2 * CS, O.y0], [I.x1 - 2 * CS, I.y0], [I.x0 + 2 * CS, I.y0]],
  [[O.x1, O.y0 + 2 * CS], [O.x1, O.y1 - 2 * CS], [I.x1, I.y1 - 2 * CS], [I.x1, I.y0 + 2 * CS]],
  [[O.x1 - 2 * CS, O.y1], [O.x0 + 2 * CS, O.y1], [I.x0 + 2 * CS, I.y1], [I.x1 - 2 * CS, I.y1]],
  [[O.x0, O.y1 - 2 * CS], [O.x0, O.y0 + 2 * CS], [I.x0, I.y0 + 2 * CS], [I.x0, I.y1 - 2 * CS]],
];

// a scroll: from `start`, curling round `c` and tightening, `dir` +1 clockwise
const spiral = (start: P, c: P, turns: number, dir: number, n = 44): P[] => {
  const a0 = Math.atan2(start[1] - c[1], start[0] - c[0]), R = Math.hypot(start[0] - c[0], start[1] - c[1]);
  return Array.from({ length: n + 1 }, (_, i) => { const t = i / n, a = a0 + dir * t * turns * Math.PI * 2, r = R * (1 - 0.82 * t); return [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r] as P; });
};
const at = (pts: P[], t: number): { p: P; d: number } => {
  const k = Math.min(pts.length - 2, Math.floor(t * (pts.length - 1))), a = pts[k], b = pts[k + 1];
  return { p: a, d: Math.atan2(b[1] - a[1], b[0] - a[0]) };
};
const ray = (p: P, a: number, len: number): P[] => [p, [p[0] + Math.cos(a) * len * 0.55, p[1] + Math.sin(a) * len * 0.55], [p[0] + Math.cos(a) * len, p[1] + Math.sin(a) * len]];

export const border = (rot: number, when: [number, number], seed = 3000): { strokes: Stroke[]; washes: Wash[] } => {
  const H = hand(rot), r = rng(seed), mid = lerp(when[0], when[1], 0.5), bone = rot >= 0.75, thorny = rot >= 0.34;
  let sd = seed;
  const pen = (pts: P[], w: number, color = H.ink, op = 0.9, wob = 0.5): Omit<Stroke, "at"> => ({ pts, w, seed: sd++, op, wob, color });
  const out: Omit<Stroke, "at">[] = [];
  // the rules, edge by edge
  for (const b of [O, I]) rect(b).forEach((a, i, q) => out.push(pen([a, q[(i + 1) % 4]], 1.3, H.ink, 0.85, 0.3)));
  CORNERS.forEach((q) => q.forEach((a, i) => out.push(pen([a, q[(i + 1) % 4]], 1.2, H.ink, 0.85, 0.3))));

  // the vines: one scroll from each corner, one spray from the middle of each side
  const vines: P[][] = [];
  ([[I.x0, I.y0, 1, 1], [I.x1, I.y0, -1, 1], [I.x1, I.y1, -1, -1], [I.x0, I.y1, 1, -1]] as const).forEach(([x, y, sx, sy]) =>
    vines.push(spiral([x + sx * 14, y + sy * 14], [x + sx * 118, y + sy * 104], 1.2, sx * sy)));
  const spray = (base: P, ax: P, side: number): P[] => { const nx = -ax[1] * side, ny = ax[0] * side; return smooth([0, 0.35, 0.7, 1].map((t, i) => [base[0] + ax[0] * t * 150 + nx * [0, 30, 14, 40][i], base[1] + ax[1] * t * 150 + ny * [0, 30, 14, 40][i]] as P), false, 8); };
  vines.push(spray([I.x0, 450], [1, 0], 1), spray([I.x1, 450], [-1, 0], -1), spray([800, I.y0], [0, 1], 1));
  const tips: P[] = [];
  for (const v of vines) {
    if (bone) { out.push(pen(v, 5.2, H.ink, 0.9, 0.4), pen(v, 2.8, "#ecdfc2", 0.95, 0.4)); } else out.push(pen(v, 2.8, H.ink, 0.9, 0.6));
    // leaves along the vine, alternating sides
    for (let k = 1; k <= 6; k++) {
      const t = k / 7.2, { p, d } = at(v, t), side = k % 2 ? 1 : -1, a = d + side * 1.05, s = 26 - k * 1.6;
      if (bone) {
        out.push(pen([p, [p[0] + Math.cos(d) * 2, p[1] + Math.sin(d) * 2]], 8, H.ink, 0.9, 0.2), pen([p, [p[0] + Math.cos(d) * 2, p[1] + Math.sin(d) * 2]], 5, "#ecdfc2", 1, 0.2)); // a knuckle
        if (k % 2) out.push(pen(ray([p[0] + Math.cos(a) * 6, p[1] + Math.sin(a) * 6], a + 0.5, 9), 5.5, H.a, 0.95, 0.2)); // a drop of blood
      } else if (thorny) out.push(pen(ray(p, a, s + 6), 6, H.c, 0.95, 0.2));
      else { const cols = [H.c, H.a, H.b]; for (const da of [-0.62, 0, 0.62]) out.push(pen(ray(p, a + da, da ? s * 0.72 : s), 10, cols[Math.floor(r() * 3)], 0.95, 0.3)); }
    }
    tips.push(v[v.length - 1]);
  }
  // gold bezants at the vine tips
  const BEZ = tips.map(([x, y]) => oval(x, y, 8, 8, 14));
  BEZ.forEach((q) => out.push(pen([...q, q[0]], 1.2, H.ink, 0.85, 0.2)));

  const washes: Wash[] = [
    ...BARS.map((q, i) => ({ pts: q, color: H.a, alpha: 0.9, seed: seed + 400 + i, flat: true, at: [mid, when[1]] as [number, number], ph: 8 })),
    // knots of the second colour along the bar
    ...BARS.flatMap((q, i) => {
      const [a, b, c, d] = q, L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.floor(L / 230);
      return Array.from({ length: n }, (_, k) => { const t0 = (k + 0.5) / n - 18 / L, t1 = (k + 0.5) / n + 18 / L, P0 = (u: P, v: P, t: number): P => [lerp(u[0], v[0], t), lerp(u[1], v[1], t)];
        return { pts: [P0(a, b, t0), P0(a, b, t1), P0(d, c, t1), P0(d, c, t0)], color: H.b, alpha: 0.95, seed: seed + 420 + i * 20 + k, flat: true, at: [mid, when[1]] as [number, number], ph: 8 }; });
    }),
    ...[...CORNERS, ...BEZ].map((q, i) => gilt(q, rot, [mid, when[1]], seed + 480 + i, { ph: 9 })),
  ];
  return { strokes: seq(out, when[0], mid, 0.5), washes };
};

// the glint crossing the four gold corners, once per loop
export const borderGlint = (g: Gfx, t: number, loop: number, rot: number) => glint(g, CORNERS, t, loop, rot);
