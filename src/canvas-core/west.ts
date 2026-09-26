// THE BOOK'S KIT. Every page is a film with two shots: `draw` (the picture makes itself, mark by
// mark) then `loop` (a seamless cycle the reader's app repeats forever). A page is DATA: strokes,
// washes and one `anim` function for what moves. This file turns that data into shots.
//
// Look: pen and line-wash on warm paper (after anidoodle's wren plate). The pen goes down first,
// then the washes flood in from a point like wet pigment spreading, then the last dark accents.
import { Gfx, rng, type Ctx, type Env, type Layer, type Medium, type P } from "./core";
import type { Film } from "./film";
import { blob, bounds, clamp, clipped, fillShape } from "./gallery";

export const W = 1600, H = 900, FPS = 30, BEAT = 15, WASH_SCALE = 0.6;
export const INK_M: Medium = { nib: 1.7, taper: 1, pressure: 1.75, retrace: false, wobble: 1.35, rough: 0.6 };
// the two hands of the book. Sepia: pen and line-wash on warm paper. Cyanotype: the paper IS the
// deep blue, the line is white, "washes" are darker blues and pale body colour laid over it.
export const SEPIA = { paper: "#f3e7cf", ink: "#2b1a10", ochre: "#c99a58", umber: "#7d5234", sienna: "#a4633c", dark: "#3a2418", shade: "#6f5a7a", dusk: "#8d84a8", rose: "#dc9a78", glow: "#f1c77a", lamp: "#f2b54a" };
export const CYAN = { paper: "#1d4f86", ink: "#eef6fb", deep: "#0f2f57", mid: "#2f6aa8", pale: "#bfe3ff", glow: "#dff3ff" };

// ---------------------------------------------------------------- one-point perspective
// Camera on horseback looking down the street. `u` is the lateral offset in picture pixels at
// depth z = 1 (the bottom edge of the frame), `h` a height in the same units, z the depth.
// The eye sits at height H - vp[1] above the floor. Each page picks its own vanishing point.
export const perspective = (vp: P) => {
  const K = H - vp[1];
  const G = (u: number, z: number): P => [vp[0] + u / z, vp[1] + K / z];
  const U = (u: number, z: number, h: number): P => [vp[0] + u / z, vp[1] + (K - h) / z];
  // a quad on a wall at lateral u, from depth z0 to z1, heights h0..h1
  const wallQuad = (u: number, z0: number, z1: number, h0: number, h1: number): P[] => [U(u, z0, h0), U(u, z0, h1), U(u, z1, h1), U(u, z1, h0)];
  return { G, U, wallQuad };
};
export const VP: P = [860, 468];
export const { G, U, wallQuad } = perspective(VP);

// ---------------------------------------------------------------- timing
export const span = (f: number, a: number, b: number) => clamp((f - a) / Math.max(1e-6, b - a));
const ease = (p: number) => 1 - (1 - p) * (1 - p);

// ---------------------------------------------------------------- the marks
// `hide` lists shapes standing in front of a mark: it is not drawn where they are.
export type Stroke = { pts: P[]; w: number; seed: number; op?: number; wob?: number; at: [number, number]; color?: string; hide?: P[][] };
// `ph` puts washes on separate surfaces so one flooding in cannot uncover another laid later;
// `clip` cuts a wash in around shapes (the sky around the rooflines), like masking fluid.
export type Wash = { pts: P[]; color: string; alpha: number; seed: number; pool?: number; at: [number, number]; from?: P; ph?: number; clip?: P[]; hide?: P[][] };

// Lay strokes out one after another across [a, b], each taking time in proportion to its
// length, with a little overlap: long strokes are fast, a flurry of short ones takes its time.
export const seq = (strokes: Omit<Stroke, "at">[], a: number, b: number, overlap = 0.35, hide?: P[][]): Stroke[] => {
  const len = (s: P[]) => s.reduce((t, p, i) => (i ? t + Math.hypot(p[0] - s[i - 1][0], p[1] - s[i - 1][1]) : 0), 0);
  const L = strokes.map((s) => Math.sqrt(len(s.pts)) + 4), tot = L.reduce((x, y) => x + y, 0) * (1 - overlap) + L[L.length - 1] * overlap;
  let t = a;
  return strokes.map((s, i) => { const d = (L[i] / tot) * (b - a), at: [number, number] = [t, t + d]; t += d * (1 - overlap); return { ...s, at, hide: s.hide ?? hide }; });
};
// everything except the `hide` shapes: the frame, then each shape as a hole (even-odd)
export const masked = (g: Gfx, hide: P[][] | undefined, fn: () => void) => {
  if (!hide?.length) return fn();
  const c = g.cur; c.save(); c.beginPath(); c.rect(-50, -50, W + 100, H + 100);
  hide.forEach((q) => q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))));
  c.clip("evenodd"); fn(); c.restore();
};
// a stroke with a fixed pen, for building lists quickly
export const st = (pts: P[], w: number, seed: number, op = 0.9, wob = 0.8) => ({ pts, w, seed, op, wob });

// A wash: displaced wet edge, pigment pooled along the bottom of the shape (from the wren plate).
// corners survive the wash's smoothing only if every edge carries points along it
const densify = (pts: P[], step = 36): P[] => pts.flatMap((a, i) => { const b = pts[(i + 1) % pts.length], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); return Array.from({ length: n }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as P); });
export const wet = (g: Gfx, pts0: P[], color: string, o: { alpha: number; seed: number; pool?: number }) => {
  const { alpha, seed, pool = 0.55 } = o, pts = densify(pts0), b = bounds(pts), hex = (v: number) => Math.round(255 * clamp(v)).toString(16).padStart(2, "0");
  g.group("paint", () => {
    g.wash(pts, color, { alpha, seed, dx: 5, dy: 4, shrink: 1.04, rim: true });
    clipped(g, pts, () => {
      const c = g.cur, gr = c.createLinearGradient(0, b.y0 + (b.y1 - b.y0) * 0.45, 0, b.y1 + 2);
      gr.addColorStop(0, color + "00"); gr.addColorStop(0.75, color + hex(alpha * pool * 0.6)); gr.addColorStop(1, color + hex(alpha * pool * 1.3));
      c.fillStyle = gr; c.fillRect(b.x0 - 20, b.y0, b.x1 - b.x0 + 40, b.y1 - b.y0 + 20);
    });
  });
};

// ---------------------------------------------------------------- surfaces kept across frames
const cached = (env: Env, key: string, paint: (ctx: Ctx) => void): Layer => {
  const k = `${key}:${env.scale}`;
  let L = env.cache.get(k) as Layer | undefined;
  if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); paint(L.ctx); env.cache.set(k, L); }
  return L;
};
const blit = (ctx: Ctx, L: Layer) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.imageSmoothingEnabled = true; ctx.drawImage(L.canvas, 0, 0, ctx.canvas.width, ctx.canvas.height); ctx.restore(); };

// ---------------------------------------------------------------- a page
export type PageArt = {
  id: string; title: string; draw: number; loop: number;
  paper?: string; ink?: string; strokes: Stroke[]; washes: Wash[];
  // what moves. t = loop frame (0 during the draw), reveal = 0..1 while the draw is making it
  anim?: (g: Gfx, t: number, reveal: number, env: Env) => void; animAt?: [number, number];
  spatter?: { n: number; seed: number; at: number; box: [number, number, number, number] };
};

// Build the paper and pigment textures for this scale up front: they are made pixel by pixel,
// and a host would rather pay for that before its clock starts than in the middle of a stroke.
export const warm = (env: Env) => {
  const L = env.canvas(64, 64), g = new Gfx(L.ctx, { ...env, W: 64 / env.scale, H: 64 / env.scale }, 0, INK_M);
  g.paper("coldpress", 0.1); g.paper("paper", 0.1); g.group("paint", () => g.wash([[4, 4], [40, 4], [40, 40]], "#000", {}));
};

// A page film, plus `prepare(env, more)`: paint pending washes while `more()` says there is time.
export type PageFilm = Film & { prepare?: (env: Env, more: () => boolean) => void };
export const page = (a: PageArt): PageFilm => {
  const paper = a.paper ?? SEPIA.paper, ink = a.ink ?? SEPIA.ink;
  const reach = a.washes.map((w) => { const b = bounds(w.pts), o = w.from ?? [(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]; return { o, R: 1.15 * Math.max(...[[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1]].map(([x, y]) => Math.hypot(x - o[0], y - o[1]))) }; });
  const spat = a.spatter ? (() => { const r = rng(a.spatter.seed), [x0, y0, x1, y1] = a.spatter.box; return Array.from({ length: a.spatter.n }, (_, i) => { const big = r() < 0.25; return blob(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), big ? 3.4 : 1.3 + r(), big ? 2.8 : 1.1 + r() * 0.8, a.spatter!.seed + i, 0.3, 8); }); })() : [];

  // Each phase's washes are painted onto one surface kept across frames. Painting is split into
  // single washes so a host can spread it over the cheap pen-only frames (see `prepare`); a phase
  // is always finished before its first frame is drawn, so the pixels never depend on timing.
  const phases = [...new Set(a.washes.map((w) => w.ph ?? 0))].sort((x, y) => x - y);
  const byPhase = new Map(phases.map((ph) => [ph, a.washes.filter((w) => (w.ph ?? 0) === ph)]));
  // Washes are soft by nature, so on big screens they are painted at a lower resolution and
  // stretched; the pen stays at full resolution. A quarter of the pixels, the same picture.
  const washEnv = (env: Env): Env => ({ ...env, scale: Math.min(env.scale, WASH_SCALE) });
  const surf = (env: Env, ph: number) => {
    const e = washEnv(env), k = `${a.id}:wash${ph}:${e.scale}`; let s = env.cache.get(k) as { L: Layer; next: number } | undefined;
    if (!s) { s = { L: env.canvas(Math.round(W * e.scale), Math.round(H * e.scale)), next: 0 }; env.cache.set(k, s); }
    return s;
  };
  const paintOne = (env: Env, ph: number) => {
    const s = surf(env, ph), w = byPhase.get(ph)![s.next++], g = new Gfx(s.L.ctx, washEnv(env), 0, INK_M);
    const paint = () => masked(g, w.hide, () => wet(g, w.pts, w.color, w));
    if (w.clip) clipped(g, w.clip, paint); else paint();
  };
  const washLayer = (env: Env, ph: number) => { const s = surf(env, ph), n = byPhase.get(ph)!.length; while (s.next < n) paintOne(env, ph); return s.L; };
  const prepare = (env: Env, more: () => boolean) => { for (const ph of phases) { const s = surf(env, ph), n = byPhase.get(ph)!.length; while (s.next < n) { if (!more()) return; paintOne(env, ph); } } };
  const inkAll = (g: Gfx, f: number) => g.group("plain", () => {
    for (const s of a.strokes) { const p = span(f, s.at[0], s.at[1]); if (p > 0) masked(g, s.hide, () => g.pen(s.pts, { w: s.w, color: s.color ?? ink, seed: s.seed, wobble: s.wob ?? 0.8, boil: 0, taper: 1, opacity: s.op ?? 0.9, retrace: false, progress: p })); }
    if (a.spatter && f >= a.spatter.at) spat.forEach((b, i) => fillShape(g, b, ink, 0.6 + (i % 3) * 0.12));
  });
  const washes = (ctx: Ctx, env: Env, f: number) => phases.forEach((ph) => {
    const mine = a.washes.map((w, i) => [w, i] as const).filter(([w]) => (w.ph ?? 0) === ph);
    if (mine.every(([w]) => f < w.at[0])) return; // nothing of this phase is on the paper yet
    const L = washLayer(env, ph);
    if (mine.every(([w]) => f >= w.at[1])) return blit(ctx, L);
    ctx.save(); ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); ctx.beginPath();
    let any = false;
    mine.forEach(([w, i]) => {
      const p = span(f, w.at[0], w.at[1]); if (p <= 0) return; any = true;
      const { o, R } = reach[i], edge = blob(o[0], o[1], R * ease(p), R * ease(p) * 0.8, w.seed + 900, 0.22, 18);
      edge.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath();
    });
    if (any) { ctx.clip(); blit(ctx, L); }
    ctx.restore();
  });
  const ground = (ctx: Ctx, env: Env) => { ctx.setTransform(env.scale, 0, 0, env.scale, 0, 0); ctx.fillStyle = paper; ctx.fillRect(0, 0, W, H); };
  // the sheet's grain, both tiles multiplied into one surface once, then one blit per frame
  const grain = (env: Env) => cached(env, "grain", (c) => { c.fillStyle = "#fff"; c.fillRect(0, 0, c.canvas.width, c.canvas.height); const g = new Gfx(c, env, 0, INK_M); g.paper("coldpress", 0.16); g.paper("paper", 0.08); });
  const finish = (ctx: Ctx, env: Env) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(grain(env).canvas, 0, 0); ctx.restore(); };
  const animAt = a.animAt ?? [a.draw * 0.55, a.draw * 0.85];

  const drawShot = (ctx: Ctx, f: number, env: Env) => {
    ground(ctx, env); washes(ctx, env, f);
    inkAll(new Gfx(ctx, env, 0, INK_M), f);
    // the grain goes on before what moves, exactly as on the loop's plate, so the cut is invisible
    finish(ctx, env);
    const rv = span(f, animAt[0], animAt[1]); if (a.anim && rv > 0) a.anim(new Gfx(ctx, env, 0, INK_M), 0, rv, env);
  };
  // the finished plate carries its grain; what moves is drawn over it, clean, like a fresh mark
  const loopShot = (ctx: Ctx, t: number, env: Env) => {
    blit(ctx, cached(env, `${a.id}:plate`, (c) => { ground(c, env); washes(c, env, Infinity); inkAll(new Gfx(c, env, 0, INK_M), Infinity); finish(c, env); }));
    a.anim?.(new Gfx(ctx, env, t, INK_M), t, 1, env);
  };
  return {
    prepare,
    meta: { title: a.title, W, H, fps: FPS, bpm: 120, durationFrames: a.draw + a.loop },
    assets: { images: {} },
    shots: [{ id: "draw", start: 0, end: a.draw, draw: drawShot }, { id: "loop", start: a.draw, end: a.draw + a.loop, draw: loopShot }],
  };
};
