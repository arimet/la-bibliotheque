// LES GRANDS BOIS' PENCILS: a page drawn in coloured pencil on cream paper with a tooth to it.
// Colour is laid by HATCHING: parallel strokes across a shape, a second pencil crossing the first on
// the side away from the light, a third, darker, in the deepest shade. The pencil skips the valleys
// of the sheet (`ink` groups carry the pencilTooth tile), so the paper shows through every stroke,
// and highlights are paper left bare. The contour comes first, soft and broken, the colour after,
// back to front, each shape's hatching kept out of the shapes that stand in front of it.
// The draw is the hand at work, stroke by stroke. Strokes are many (thousands a page), so a stroke
// that is finished is BAKED into a layer kept across frames, in fixed batches (one per frame of the
// draw), so a frame's pixels never depend on the order frames were asked for.
import { Gfx, PENCIL, rng, type Ctx, type Env, type Layer, type P } from "./core";
import type { Film } from "./film";
import { bounds, clamp, hatchRuns, inside, mix } from "./gallery";
import { dense, overlapping, type Motif } from "./figures";
import { FPS, H, W, masked, type PageFilm } from "./west";

export const PAPER = "#f4ecd8";
export type Layer_ = { color: string; angle: number; gap: number; w?: number; alpha?: number; keep?: (x: number, y: number) => boolean };
export type Shape = { pts: P[]; layers: Layer_[]; outline?: { color: string; w?: number; alpha?: number } | false };
export type Mark = { pts: P[]; w: number; color: string; alpha: number; seed: number; at: [number, number]; hide?: P[][] };

// the side of a shape away from a light at the upper left: where the second pencil goes
export const shadeSide = (pts: P[], k = 0) => { const b = bounds(pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, R = Math.max(b.x1 - b.x0, b.y1 - b.y0); return (x: number, y: number) => (x - cx) * 0.55 + (y - cy) * 0.83 > -k * R; };
// the usual way to colour a shape: one pencil all over, the same pencil darker on the shade side
export const tint = (pts: P[], color: string, o: { angle?: number; gap?: number; dark?: number; seed?: number } = {}): Layer_[] => {
  const a = o.angle ?? 0.9 + (((o.seed ?? 0) * 0.37) % 0.6);
  return [
    { color, angle: a, gap: o.gap ?? 5.5, w: 2.1, alpha: 0.82 },
    { color: mix(color, "#2a2238", o.dark ?? 0.42), angle: a - 1.25, gap: (o.gap ?? 5.5) * 1.35, w: 1.8, alpha: 0.55, keep: shadeSide(pts, 0.05) },
  ];
};
// a figure's fills, coloured the usual way, its outlines as soft contours
export const fromMotif = (m: Motif): Shape[] => m.fills.map((f, i) => ({ pts: f.pts, layers: tint(f.pts, f.color, { seed: i }), outline: { color: mix(f.color, "#2a2238", 0.6) } }));

// hatch runs across a shape, each run a slightly curved stroke that overshoots a little at the ends
const hatch = (s: Shape, L: Layer_, seed: number): P[][] => {
  const b = bounds(s.pts), r = rng(seed);
  const runs = hatchRuns({ x0: b.x0 - 4, y0: b.y0 - 4, x1: b.x1 + 4, y1: b.y1 + 4 }, L.angle, L.gap, (x, y) => inside(s.pts, x, y) && (!L.keep || L.keep(x, y)), 4, seed);
  return runs.map((run) => { const a = run[0], z = run[run.length - 1], dx = z[0] - a[0], dy = z[1] - a[1], len = Math.hypot(dx, dy) || 1, ox = (dx / len) * 2, oy = (dy / len) * 2, bow = (r() - 0.5) * Math.min(6, len * 0.05); return [[a[0] - ox * r(), a[1] - oy * r()], [(a[0] + z[0]) / 2 - (dy / len) * bow, (a[1] + z[1]) / 2 + (dx / len) * bow], [z[0] + ox * r(), z[1] + oy * r()]] as P[]; });
};

export type SketchArt = {
  id: string; title: string; draw?: number; loop: number; paper?: string;
  shapes: Shape[];                   // back to front
  lines?: Mark[] | Omit<Mark, "at" | "seed">[]; // extra strokes: twigs, grass, fur (untimed ones are timed with the contours)
  anim?: (g: Gfx, t: number, reveal: number, env: Env) => void; animAt?: [number, number];
  contourAt?: [number, number]; colourAt?: [number, number];
};

export const sketch = (a: SketchArt): PageFilm => {
  const DRAW = a.draw ?? 105, [c0, c1] = a.contourAt ?? [0, 34], [h0, h1] = a.colourAt ?? [22, 96], animAt = a.animAt ?? [70, 100];
  const batchOf = (m: Mark) => Math.min(DRAW, Math.ceil(m.at[1]));
  // the marks are worked out on first use, not at import: a book loads all its pages at once
  let built: { marks: Mark[]; batches: Mark[][] } | undefined;
  const build = () => built ??= (() => {
    // ---- every mark on the page, in the order the hand makes them
    const marks: Mark[] = [];
    let sd = 1;
    const contours: Omit<Mark, "at">[] = [];
    a.shapes.forEach((s, i) => {
      if (s.outline === false) return;
      const o = s.outline ?? { color: "#4a3a30" }, front = overlapping(a.shapes.slice(i + 1).map((q) => q.pts), bounds(s.pts));
      contours.push({ pts: dense([...s.pts, s.pts[0]], 12), w: o.w ?? 1.5, color: o.color, alpha: o.alpha ?? 0.7, seed: sd++, hide: front.length ? front : undefined });
    });
    (a.lines ?? []).forEach((l) => { if (!("at" in l)) contours.push({ ...l, seed: sd++ } as Omit<Mark, "at">); });
    contours.forEach((m, i) => marks.push({ ...m, at: [c0 + ((c1 - c0) * i) / Math.max(1, contours.length), c0 + ((c1 - c0) * (i + 1.6)) / Math.max(1, contours.length)] }));
    (a.lines ?? []).forEach((l) => { if ("at" in l) marks.push(l as Mark); });
    const hatches: Omit<Mark, "at">[] = [];
    a.shapes.forEach((s, i) => {
      const front = overlapping(a.shapes.slice(i + 1).map((q) => q.pts), bounds(s.pts));
      s.layers.forEach((L, j) => hatch(s, L, 1000 + i * 17 + j).forEach((pts) => hatches.push({ pts, w: L.w ?? 2, color: L.color, alpha: L.alpha ?? 0.8, seed: sd++, hide: front.length ? overlapping(front, bounds(pts)) : undefined })));
    });
    // colour goes on back to front, a shape at a time, the strokes quick: each takes a few frames
    const n = hatches.length, dur = Math.max(2, Math.min(6, ((h1 - h0) * 40) / Math.max(1, n)));
    hatches.forEach((m, i) => { const t = h0 + ((h1 - h0 - dur) * i) / Math.max(1, n - 1); marks.push({ ...m, at: [t, t + dur] }); });
    marks.forEach((m) => { if (m.hide && !m.hide.length) m.hide = undefined; });
    // ---- baking: a mark belongs to the batch of the frame it finishes on
    const batches: Mark[][] = Array.from({ length: DRAW + 1 }, () => []);
    marks.forEach((m) => batches[batchOf(m)].push(m));
    return { marks, batches };
  })();
  const stroke = (g: Gfx, m: Mark, progress = 1) => masked(g, m.hide, () => g.pen(m.pts, { w: m.w, color: m.color, seed: m.seed, wobble: 0.6, boil: 0, taper: 1, opacity: m.alpha, retrace: false, progress }));
  const acc = (env: Env) => { const k = `${a.id}:acc:${env.scale}`; let s = env.cache.get(k) as { L: Layer; upTo: number } | undefined; if (!s) { s = { L: env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)), upTo: -1 }; env.cache.set(k, s); } return s; };
  const bakeTo = (env: Env, f: number) => {
    const s = acc(env);
    if (s.upTo > f) { s.L.ctx.setTransform(1, 0, 0, 1, 0, 0); s.L.ctx.clearRect(0, 0, s.L.canvas.width, s.L.canvas.height); s.upTo = -1; }
    const g = new Gfx(s.L.ctx, env, 0, PENCIL);
    for (let b = s.upTo + 1; b <= f; b++) { const todo = build().batches[b]; if (todo.length) g.group("ink", () => todo.forEach((m) => stroke(g, m))); s.upTo = b; }
    return s.L;
  };
  const paper = a.paper ?? PAPER;
  const ground = (ctx: Ctx) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = paper; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); };
  const blit = (ctx: Ctx, L: Layer) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(L.canvas as CanvasImageSource, 0, 0); ctx.restore(); };
  const grain = (env: Env) => { const k = `${a.id}:grain:${env.scale}`; let L = env.cache.get(k) as Layer | undefined; if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); const c = L.ctx; c.fillStyle = "#fff"; c.fillRect(0, 0, L.canvas.width, L.canvas.height); const g = new Gfx(c, env, 0, PENCIL); g.paper("coldpress", 0.2); g.paper("paper", 0.12); env.cache.set(k, L); } return L; };
  const finish = (ctx: Ctx, env: Env) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(grain(env).canvas as CanvasImageSource, 0, 0); ctx.restore(); };
  const drawShot = (ctx: Ctx, f: number, env: Env) => {
    ground(ctx); blit(ctx, bakeTo(env, Math.floor(f)));
    const g = new Gfx(ctx, env, 0, PENCIL), live = build().marks.filter((m) => m.at[0] < f && batchOf(m) > f);
    if (live.length) g.group("ink", () => live.forEach((m) => stroke(g, m, clamp((f - m.at[0]) / (m.at[1] - m.at[0])))));
    finish(ctx, env);
    const rv = clamp((f - animAt[0]) / (animAt[1] - animAt[0])); if (a.anim && rv > 0) a.anim(new Gfx(ctx, env, 0, PENCIL), 0, rv, env);
  };
  const plate = (env: Env) => { const k = `${a.id}:plate:${env.scale}`; let L = env.cache.get(k) as Layer | undefined; if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); ground(L.ctx); blit(L.ctx, bakeTo(env, DRAW)); finish(L.ctx, env); env.cache.set(k, L); } return L; };
  const loopShot = (ctx: Ctx, t: number, env: Env) => { blit(ctx, plate(env)); a.anim?.(new Gfx(ctx, env, t, PENCIL), t, 1, env); };
  const film: Film & { prepare: (env: Env, more: () => boolean) => void } = {
    prepare: () => {}, // the bake follows the draw frame by frame; nothing to paint ahead
    meta: { title: a.title, W, H, fps: FPS, bpm: 120, durationFrames: DRAW + a.loop },
    assets: { images: {} },
    shots: [{ id: "draw", start: 0, end: DRAW, draw: drawShot }, { id: "loop", start: DRAW, end: DRAW + a.loop, draw: loopShot }],
  };
  return film;
};

// What moves, drawn live in pencil. Hatching is worked out once (`prehatch`) and the strokes are
// replayed each frame, moved with `at`; call these inside ONE `live(g, ...)` a frame: each pencil
// group costs a layer and a pass of the paper's tooth, so a frame should pay for one.
export type Hatched = { strokes: { pts: P[]; w: number; color: string; alpha: number; seed: number }[] };
export const prehatch = (shapes: Shape[]): Hatched => {
  const strokes: Hatched["strokes"] = []; let sd = 5000;
  shapes.forEach((sh, i) => {
    sh.layers.forEach((L, j) => hatch(sh, L, 3000 + i * 13 + j).forEach((pts) => strokes.push({ pts, w: L.w ?? 2, color: L.color, alpha: L.alpha ?? 0.8, seed: sd++ })));
    if (sh.outline !== false) strokes.push({ pts: dense([...sh.pts, sh.pts[0]], 12), w: sh.outline?.w ?? 1.4, color: sh.outline?.color ?? "#4a3a30", alpha: sh.outline?.alpha ?? 0.7, seed: sd++ });
  });
  return { strokes };
};
export const live = (g: Gfx, fn: () => void) => g.group("ink", fn);
export const replay = (g: Gfx, h: Hatched, o: { at?: P; alpha?: number } = {}) => {
  const [dx, dy] = o.at ?? [0, 0]; g.push(dx, dy, 1);
  h.strokes.forEach((m) => g.pen(m.pts, { w: m.w, color: m.color, seed: m.seed, wobble: 0.5, boil: 0, taper: 1, opacity: m.alpha * (o.alpha ?? 1), retrace: false }));
  g.pop();
};
// a small shape that changes every frame (a leaf turning, cloth in the wind): hatched on the spot
export const pencilLive = (g: Gfx, pts: P[], color: string, o: { angle?: number; gap?: number; seed?: number; alpha?: number; outline?: string } = {}) => {
  const s: Shape = { pts, layers: [{ color, angle: o.angle ?? 0.9, gap: o.gap ?? 5, w: 2, alpha: o.alpha ?? 0.85 }] };
  hatch(s, s.layers[0], o.seed ?? 7).forEach((q, i) => g.pen(q, { w: 2, color, seed: (o.seed ?? 7) + i, wobble: 0.5, boil: 0, taper: 1, opacity: o.alpha ?? 0.85, retrace: false }));
  if (o.outline) g.pen(dense([...pts, pts[0]], 12), { w: 1.4, color: o.outline, seed: (o.seed ?? 7) + 99, wobble: 0.5, boil: 0, taper: 1, opacity: 0.7, retrace: false });
};
