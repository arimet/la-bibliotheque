// CORBENIC'S KIT, on top of west.ts: a Corbenic page is still a `page()` of strokes, washes and one
// `anim`. What this adds is the manuscript: iron-gall ink and body colour on vellum, burnished gold
// leaf, and a hand that rots as the book goes on. `rot` runs 0 (a fresh illumination: lapis,
// vermilion, green, gold) through 0.5 (the gold dulls, verdigris and bile creep in) to 1 (blood and
// black on browned vellum). Space is flat, as in a real manuscript: figures stand on ground lines,
// sized by what matters, with no vanishing point.
import { rng, type Gfx, type P } from "./core";
import { overlapping, type Motif } from "./figures";
import { blob, bounds, clamp, clipped, fillShape, mix } from "./gallery";
import { masked, type Wash } from "./west";

export type Hand = { paper: string; ink: string; a: string; b: string; c: string; gold: string; hi: string };
export const VELLUM: Hand = { paper: "#efe2c2", ink: "#3a2414", a: "#2d4f8e", b: "#c0452b", c: "#4f6b3a", gold: "#c9a043", hi: "#f6e3a0" };
export const ROT: Hand = { paper: "#ddd0ae", ink: "#262018", a: "#5d8a73", b: "#6b6a3a", c: "#4a4a44", gold: "#9a8350", hi: "#d2c496" };
export const BLOOD: Hand = { paper: "#cdb088", ink: "#1a0f0c", a: "#7d1712", b: "#a8261b", c: "#241512", gold: "#8d6d3a", hi: "#c4a06a" };
const blend = (x: Hand, y: Hand, t: number): Hand => Object.fromEntries(Object.keys(x).map((k) => [k, mix(x[k as keyof Hand], y[k as keyof Hand], t)])) as Hand;
// the colours of a page `rot` of the way through the book's decay
export const hand = (rot: number): Hand => (rot <= 0.5 ? blend(VELLUM, ROT, clamp(rot / 0.5)) : blend(ROT, BLOOD, clamp((rot - 0.5) / 0.5)));

// Gold leaf: laid flat and opaque, with a clean edge. As the page rots, the leaf lifts off in pits
// that show the vellum underneath (`hide` shapes, set on a grid so they never overlap: even-odd).
export const gilt = (pts: P[], rot: number, at: [number, number], seed: number, o: { ph?: number; from?: P } = {}): Wash => {
  const b = bounds(pts), r = rng(seed), pits: P[][] = [], n = Math.floor(clamp((rot - 0.2) / 0.8) * 10), step = Math.min(44, Math.max(8, Math.min(b.x1 - b.x0, b.y1 - b.y0) / 3));
  for (let y = b.y0 + step / 2; y < b.y1 && pits.length < n; y += step) for (let x = b.x0 + step / 2; x < b.x1 && pits.length < n; x += step)
    if (r() < 0.55) pits.push(blob(x + (r() - 0.5) * step * 0.3, y + (r() - 0.5) * step * 0.3, step * (0.18 + r() * 0.16), step * (0.14 + r() * 0.12), seed + pits.length, 0.35, 9));
  return { pts, color: hand(rot).gold, alpha: 1, seed, at, ph: o.ph, from: o.from, hide: pits.length ? pits : undefined, flat: true };
};

// A glint crossing burnished gold once per loop: a narrow slanted band of light, clipped to the leaf,
// sweeping left to right over the first third of the loop and then gone. Rotting gold shines less.
export const glint = (g: Gfx, shapes: P[][], t: number, loop: number, rot: number, hide?: P[][]) => {
  const p = (t % loop) / (loop / 3); if (p >= 1) return;
  const op = 0.55 * (1 - 0.75 * clamp(rot)), hi = hand(rot).hi;
  g.group("plain", () => shapes.forEach((pts) => {
    const b = bounds(pts), w = Math.min(70, Math.max(6, (b.x1 - b.x0) * 0.22)), x = b.x0 - w * 2 + p * (b.x1 - b.x0 + w * 4), h = b.y1 - b.y0;
    const band: P[] = [[x - w, b.y1 + 2], [x - w * 0.2 + h * 0.4, b.y0 - 2], [x + w + h * 0.4, b.y0 - 2], [x + w * 0.2, b.y1 + 2]];
    masked(g, overlapping(hide ?? [], bounds(band)), () => clipped(g, pts, () => fillShape(g, band, hi, op * Math.sin(p * Math.PI))));
  }), { blend: "screen" });
};

// ---------------------------------------------------------------- scenery, as a manuscript paints it
// A diapered ground: a lattice of lozenges ruled across a box, with a dot in each, the way gold and
// coloured backgrounds are tooled behind figures. Only the segments inside the box come back.
export const diaper = (b: { x0: number; y0: number; x1: number; y1: number }, pitch: number): { lines: P[][]; dots: P[] } => {
  const lines: P[][] = [], dots: P[] = [], w = b.x1 - b.x0, h = b.y1 - b.y0;
  const clipSeg = (a: P, d: P): P[] | null => { // a + t d inside the box, t in [0, 1]
    let t0 = 0, t1 = 1;
    for (const [p, q] of [[-d[0], a[0] - b.x0], [d[0], b.x1 - a[0]], [-d[1], a[1] - b.y0], [d[1], b.y1 - a[1]]]) {
      if (p === 0) { if (q < 0) return null; continue; }
      const t = q / p; if (p < 0) t0 = Math.max(t0, t); else t1 = Math.min(t1, t);
    }
    return t0 < t1 ? [[a[0] + d[0] * t0, a[1] + d[1] * t0], [a[0] + d[0] * t1, a[1] + d[1] * t1]] : null;
  };
  for (let c = -h; c < w + h; c += pitch) {
    const s1 = clipSeg([b.x0 + c, b.y0], [h, h]), s2 = clipSeg([b.x0 + c, b.y0], [-h, h]);
    if (s1) lines.push(s1); if (s2) lines.push(s2);
  }
  for (let y = b.y0 + pitch / 2; y < b.y1; y += pitch / 2) for (let x = b.x0 + ((Math.round((y - b.y0) / (pitch / 2)) % 2) ? pitch / 2 : 0); x < b.x1; x += pitch) dots.push([x, y]);
  return { lines, dots };
};

// A row of rounded hillocks from x0 to x1, their tops about `y`, down to the bottom of the page.
// `ledges` are the short curved strokes a painter puts inside each hump to give it a shoulder.
export const hills = (x0: number, x1: number, y: number, n: number, amp: number, seed: number, bottom = 870): { pts: P[]; ledges: P[][] } => {
  const r = rng(seed), tops: P[] = [], ledges: P[][] = [], step = (x1 - x0) / n;
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * step, top = y - amp * (0.6 + r() * 0.4);
    tops.push([x, y + (r() - 0.5) * amp * 0.3]);
    if (i < n) { tops.push([x + step * 0.5, top]); ledges.push([[x + step * 0.25, top + amp * 0.5], [x + step * 0.45, top + amp * 0.28], [x + step * 0.7, top + amp * 0.42]]); }
  }
  return { pts: [...sampleOpen(tops), [x1, bottom], [x0, bottom]], ledges };
};
const sampleOpen = (pts: P[]) => { const out: P[] = []; for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1]; for (let k = 0; k < 6; k++) { const t = k / 6, e = (1 - Math.cos(t * Math.PI)) / 2; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * e]); } } out.push(pts[pts.length - 1]); return out; };

// A house seen square on: a wall, a pitched roof, a door (boarded up, if the village has had to),
// a window, lit or not. `bell` puts a bell-cote and a cross on the roof: a chapel.
export const house = (o: { x: number; g: number; w: number; h: number; roof: number; wall: string; roofC: string; door?: "boarded" | "shut" | "none"; win?: "dark" | "lit" | "none"; bell?: boolean; ink: string }): Motif => {
  const { x, g, w, h, roof } = o, x0 = x - w / 2, x1 = x + w / 2, top = g - h, parts: P[][] = [], fills: Motif["fills"] = [], lines: Motif["lines"] = [];
  const add = (pts: P[], color: string, lw = 1.5) => { fills.push({ pts, color }); parts.push(pts); lines.push({ pts: [...pts, pts[0]], w: lw, z: parts.length }); };
  const line = (pts: P[], lw: number, color?: string, op?: number) => lines.push({ pts, w: lw, color, op, z: parts.length });
  if (o.bell) { const bx = x + w * 0.22; add([[bx - 14, top - roof * 0.55], [bx + 14, top - roof * 0.55], [bx + 14, top - roof * 0.55 - 34], [bx, top - roof * 0.55 - 50], [bx - 14, top - roof * 0.55 - 34]], o.wall); line([[bx, top - roof * 0.55 - 50], [bx, top - roof * 0.55 - 78]], 2.2); line([[bx - 9, top - roof * 0.55 - 68], [bx + 9, top - roof * 0.55 - 68]], 2.2); }
  add([[x0, g], [x0, top], [x1, top], [x1, g]], o.wall);
  add([[x0 - 8, top + 2], [x, top - roof], [x1 + 8, top + 2]], o.roofC);
  for (let k = 1; k < 4; k++) line([[x0 - 8 + (k / 4) * (x - x0 + 8), top + 2 - (k / 4) * (roof + 2)], [x1 + 8 - (k / 4) * (x1 + 8 - x), top + 2 - (k / 4) * (roof + 2)]], 0.9, undefined, 0.5); // courses of tile
  const dw = Math.min(w * 0.3, 34), dh = Math.min(h * 0.55, 62), dx = x - w * 0.12;
  if (o.door !== "none") {
    add([[dx - dw / 2, g], [dx - dw / 2, g - dh], [dx + dw / 2, g - dh], [dx + dw / 2, g]], "#3b2a20");
    if (o.door === "boarded") { line([[dx - dw / 2 - 5, g - dh + 6], [dx + dw / 2 + 5, g - 10]], 6, "#c9a877", 0.95); line([[dx - dw / 2 - 5, g - 12], [dx + dw / 2 + 5, g - dh + 8]], 6, "#b8966a", 0.95); }
  }
  if (o.win && o.win !== "none") {
    const wx = x + w * 0.24, wy = top + h * 0.3, ww = 11, wh = 16;
    add([[wx - ww, wy + wh], [wx - ww, wy - wh + 6], [wx, wy - wh], [wx + ww, wy - wh + 6], [wx + ww, wy + wh]], o.win === "lit" ? "#f3c85a" : "#3b2a20");
  }
  return { fills, lines, parts };
};
