// CANICULE'S PRESS: a page printed on a Risograph, after anidoodle's riso toolkit (riso.ts and the
// lighthouse plate, Apache 2.0, see NOTICE). One drum per ink: yellow, fluorescent pink, blue. Each
// drum is its own layer, multiplied onto the paper through its own slightly-off registration, so
// every other colour is an OVERPRINT and white is the bare sheet. Tone is a halftone screen, one
// angle per ink. A shape KNOCKS OUT what is behind it on every drum before it prints its own ink,
// as a separation does, so the misregistration leaves slivers of paper along the edges.
// From page 9 the yellow drum is changed for red, as a printer changes drums: `act3`.
// Any colour given as hex is separated into the three drums (yellow takes the blue, pink the green,
// blue the red), so a page can be written in ordinary colours and still print as a riso.
// The draw is the press: the yellow pass, the pink pass, the blue pass, each sweeping down the sheet.
import { Gfx, halftone, type Ctx, type Env, type Layer, type Medium, type P } from "./core";
import type { Film } from "./film";
import { bounds, clamp, fillShape } from "./gallery";
import { dense, overlapping, type Motif } from "./figures";
import { FPS, H, W, masked, type PageFilm } from "./west";

export const INK = { yellow: "#ffd400", pink: "#ff48b0", blue: "#0078bf", red: "#f15060" }, PAPER = "#f5efe2";
export const LITHO: Medium = { nib: 1.5, taper: 0.95, pressure: 1.15, retrace: false, wobble: 0.9, rough: 0.9 };
export type Drum = "y" | "p" | "b";
export const DRUMS: Drum[] = ["y", "p", "b"];
export const REG: Record<Drum, P> = { y: [-4.5, 3.5], p: [4.5, -3], b: [0, 0] };
const ANG: Record<Drum, number> = { y: 0, p: 75, b: 15 };
export const inkOf = (d: Drum, act3 = false) => (d === "y" ? (act3 ? INK.red : INK.yellow) : d === "p" ? INK.pink : INK.blue);

// how much of each ink a colour takes, 0..1, a constant or a tone over the sheet
export type Tone = number | ((x: number, y: number) => number);
export type Sep = Partial<Record<Drum, Tone>>;
export const sep = (c: string | Sep): Sep => {
  if (typeof c !== "string") return c;
  const n = parseInt(c.slice(1), 16), [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255], t = (v: number) => clamp((1 - v / 255) * 1.08 - 0.04);
  return { y: t(b), p: t(g), b: t(r) };
};
// a few printer's mixes, for the colours a riso gives best
export const MIX: Record<string, Sep> = {
  pink: { p: 1 }, blue: { b: 1 }, yellow: { y: 1 }, orange: { y: 1, p: 0.55 }, red: { y: 1, p: 1 }, violet: { p: 0.8, b: 0.8 },
  green: { y: 1, b: 0.75 }, teal: { y: 0.3, b: 0.9 }, navy: { b: 1, p: 0.45 }, black: { y: 0.7, p: 0.9, b: 1 }, skin: { y: 0.35, p: 0.22 },
  night: { b: 0.95, p: 0.6 }, dusk: { p: 0.45, b: 0.35 }, cream: { y: 0.12 }, grey: { b: 0.35, p: 0.12 }, brown: { y: 0.7, p: 0.6, b: 0.35 },
};

// what goes on the sheet: shapes (in order, back to front) and key lines, printed with one drum
export type Piece = { pts: P[]; ink: string | Sep; clip?: P[] };
export type Key = { pts: P[]; w: number; op?: number; drum?: Drum; hide?: P[][] };
// a figure's fills become pieces, its lines key lines hidden behind the parts drawn after them
export const fromMotif = (m: Motif, hide: P[][] = []): { pieces: Piece[]; keys: Key[] } => ({
  pieces: m.fills.map((f) => ({ pts: f.pts, ink: MIX[f.color] ?? f.color })),
  keys: m.lines.map((l) => ({ pts: l.pts, w: l.w, op: l.op, hide: [...hide, ...overlapping(m.parts.slice(l.z ?? m.parts.length), bounds(l.pts))] })),
});

const tone = (t: Tone | undefined) => (t === undefined ? null : typeof t === "number" ? (t < 0.03 ? null : () => t) : t);
// one drum's printing of one piece: a knockout, then its ink, solid or screened
const printPiece = (g: Gfx, c: Ctx, pc: Piece, d: Drum, ink: string, pitch: number) => {
  const run = () => {
    c.globalCompositeOperation = "destination-out"; g.path(c, pc.pts); c.fillStyle = "#000"; c.fill(); c.globalCompositeOperation = "source-over";
    const t = sep(pc.ink)[d], fn = tone(t); if (!fn) return;
    if (typeof t === "number" && t >= 0.92) { fillShape(g, pc.pts, ink); return; }
    const b = bounds(pc.pts); c.save(); g.path(c, pc.pts); c.clip(); c.fillStyle = ink; c.beginPath();
    halftone(b, pitch, ANG[d], fn).forEach(([x, y, r]) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); }); c.fill(); c.restore();
  };
  if (pc.clip) { c.save(); g.path(c, pc.clip); c.clip(); run(); c.restore(); } else run();
};

export type PressArt = {
  id: string; title: string; draw?: number; loop: number; act3?: boolean; pitch?: number;
  pieces: Piece[]; keys: Key[];
  // anything a drum prints that is not a piece or a key line (lettering, dots, rain), after its pieces
  extra?: Partial<Record<Drum, (g: Gfx) => void>>;
  // what moves: drawn over the print each frame (use `overprint` so it prints like ink)
  anim?: (g: Gfx, t: number, reveal: number, env: Env) => void; animAt?: [number, number];
};

// Print shapes straight onto the frame, drum by drum, multiplied: for what moves. No knockout (the
// print underneath is already on the paper), so moving things overprint, as a second run would.
export const overprint = (g: Gfx, pieces: Piece[], o: { act3?: boolean; alpha?: number; pitch?: number } = {}) => DRUMS.forEach((d) => {
  const ink = inkOf(d, o.act3), todo = pieces.filter((pc) => tone(sep(pc.ink)[d]));
  if (!todo.length) return;
  g.group("plain", () => todo.forEach((pc) => {
    const t = sep(pc.ink)[d]!, c = g.cur;
    if (typeof t === "number" && t >= 0.92) return fillShape(g, pc.pts, ink);
    const b = bounds(pc.pts); g.touch(b.x0 - 4, b.y0 - 4, b.x1 + 4, b.y1 + 4); c.save(); g.path(c, pc.pts); c.clip(); c.fillStyle = ink; c.beginPath();
    halftone(b, o.pitch ?? 6, ANG[d], tone(t)!).forEach(([x, y, r]) => { c.moveTo(x + r, y); c.arc(x, y, r, 0, Math.PI * 2); }); c.fill(); c.restore();
  }), { blend: "multiply", off: REG[d], alpha: o.alpha ?? 1, textures: ["risoSpeck"] });
});

export const press = (a: PressArt): PageFilm => {
  const DRAW = a.draw ?? 105, pitch = a.pitch ?? 6, sweep: Record<Drum, [number, number]> = { y: [0, 30], p: [26, 56], b: [52, 84] };
  const animAt = a.animAt ?? [70, 100];
  const layer = (env: Env, d: Drum): Layer => {
    const k = `${a.id}:drum:${d}:${env.scale}`; let L = env.cache.get(k) as Layer | undefined;
    if (L) return L;
    L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale));
    const g = new Gfx(L.ctx, env, 0, LITHO), c = L.ctx, ink = inkOf(d, a.act3);
    c.setTransform(env.scale, 0, 0, env.scale, 0, 0);
    a.pieces.forEach((pc) => printPiece(g, c, pc, d, ink, pitch));
    a.extra?.[d]?.(g);
    if (d === "b" || a.keys.some((k2) => k2.drum === d)) a.keys.filter((k2) => (k2.drum ?? "b") === d).forEach((k2, i) => masked(g, k2.hide, () => g.pen(dense(k2.pts), { w: k2.w, color: ink, seed: 700 + i, wobble: 0.6, boil: 0, taper: 1, opacity: k2.op ?? 0.95, retrace: false })));
    // the drum never inks evenly, and the soy ink misses in pinholes
    (g as unknown as { tooth: (L: Layer, kind: string, r: number[]) => void }).tooth(L, "risoMottle", [0, 0, L.canvas.width, L.canvas.height]);
    (g as unknown as { tooth: (L: Layer, kind: string, r: number[]) => void }).tooth(L, "risoSpeck", [0, 0, L.canvas.width, L.canvas.height]);
    env.cache.set(k, L); return L;
  };
  const sheet = (ctx: Ctx, env: Env) => { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = PAPER; ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height); };
  // a drum onto the sheet, through its registration, as far down as the paper has gone through
  const pass = (ctx: Ctx, env: Env, d: Drum, upTo = 1) => {
    if (upTo <= 0) return;
    const L = layer(env, d), [ox, oy] = REG[d], w = L.canvas.width, h = L.canvas.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply";
    if (upTo < 1) { ctx.beginPath(); ctx.rect(0, 0, w, h * upTo); ctx.clip(); }
    ctx.drawImage(L.canvas as CanvasImageSource, Math.round(ox * env.scale), Math.round(oy * env.scale)); ctx.restore();
  };
  const grain = (env: Env) => { const k = `${a.id}:grain:${env.scale}`; let L = env.cache.get(k) as Layer | undefined; if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); const c = L.ctx; c.fillStyle = "#fff"; c.fillRect(0, 0, L.canvas.width, L.canvas.height); const g = new Gfx(c, env, 0, LITHO); g.paper("paper", 0.22); g.paper("coldpress", 0.16); env.cache.set(k, L); } return L; };
  const finish = (ctx: Ctx, env: Env) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = "multiply"; ctx.drawImage(grain(env).canvas as CanvasImageSource, 0, 0); ctx.restore(); };
  const ease = (p: number) => 1 - (1 - p) ** 2;
  const drawShot = (ctx: Ctx, f: number, env: Env) => {
    sheet(ctx, env);
    DRUMS.forEach((d) => { const [s0, s1] = sweep[d]; pass(ctx, env, d, ease(clamp((f - s0) / (s1 - s0)))); });
    finish(ctx, env);
    const rv = clamp((f - animAt[0]) / (animAt[1] - animAt[0])); if (a.anim && rv > 0) a.anim(new Gfx(ctx, env, 0, LITHO), 0, rv, env);
  };
  const plate = (env: Env) => { const k = `${a.id}:plate:${env.scale}`; let L = env.cache.get(k) as Layer | undefined; if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); sheet(L.ctx, env); DRUMS.forEach((d) => pass(L!.ctx, env, d)); finish(L.ctx, env); env.cache.set(k, L); } return L; };
  const loopShot = (ctx: Ctx, t: number, env: Env) => { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(plate(env).canvas as CanvasImageSource, 0, 0); ctx.restore(); a.anim?.(new Gfx(ctx, env, t, LITHO), t, 1, env); };
  // paint the drums ahead of their pass, in the frames that have time to spare
  const prepare = (env: Env, more: () => boolean) => { for (const d of DRUMS) { if (!more()) return; layer(env, d); } if (more()) plate(env); };
  const film: Film & { prepare: typeof prepare } = {
    prepare,
    meta: { title: a.title, W, H, fps: FPS, bpm: 120, durationFrames: DRAW + a.loop },
    assets: { images: {} },
    shots: [{ id: "draw", start: 0, end: DRAW, draw: drawShot }, { id: "loop", start: DRAW, end: DRAW + a.loop, draw: loopShot }],
  };
  return film;
};
