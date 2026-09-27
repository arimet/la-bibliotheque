// Plays one page's film on the full-screen canvas: the `draw` shot once, then `loop` forever.
// Timing is from the clock, so a slow device drops frames instead of slowing the story down.
import type { Env, Layer } from "../canvas-core/core";
import { renderFrame, type Film } from "../canvas-core/film";
import { warm, type PageFilm } from "../canvas-core/west";

const surface = (w: number, h: number): Layer => {
  const c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });
  return { canvas: c, ctx: c.getContext("2d") as unknown as CanvasRenderingContext2D } as Layer;
};
// Textures are made pixel by pixel and depend only on the scale, so every film shares them;
// everything else a film caches (its washes, its plate) goes when the film does.
const tiles = new Map<string, unknown>();
class Cache extends Map<string, unknown> {
  get(k: string) { return k.startsWith("tile:") ? tiles.get(k) : super.get(k); }
  set(k: string, v: unknown) { if (k.startsWith("tile:")) tiles.set(k, v); else super.set(k, v); return this; }
}
export const makeEnv = (film: Film, scale: number): Env => ({ W: film.meta.W, H: film.meta.H, scale, cache: new Cache(), canvas: surface });

// how many device pixels per picture pixel: cover the screen, capped so phones stay smooth
// (from the window, not the element: on first paint the element can still measure 0)
const scaleFor = (film: Film) => {
  const portrait = innerHeight > innerWidth, k = Math.max(innerWidth / film.meta.W, portrait ? 0 : innerHeight / film.meta.H);
  return Math.min(1.25, Math.max(0.4, k * Math.min(2, devicePixelRatio || 1)));
};

export const play = (canvas: HTMLCanvasElement, film: PageFilm, onDrawn: () => void, scale = scaleFor(film)) => {
  const drawEnd = film.shots.find((s) => s.id === "draw")!.end, loopLen = film.meta.durationFrames - drawEnd;
  const env = makeEnv(film, scale), ctx = canvas.getContext("2d")!;
  canvas.width = Math.round(film.meta.W * scale); canvas.height = Math.round(film.meta.H * scale);
  const skip = matchMedia("(prefers-reduced-motion: reduce)").matches, spf = 1000 / film.meta.fps;
  warm(env);
  let t0 = performance.now(), last = -1, raf = 0, told = false, finished = skip;
  const tick = (now: number) => {
    let f = Math.floor((now - t0) / spf);
    // a finished drawing starts its loop, whatever the frame's clock says (it can be older than the
    // call that finished it: a frame's time is when it began, before a long script ran)
    if (finished) { if (f < drawEnd) { f = drawEnd; t0 = now - f * spf; } }
    // while the picture is being drawn, a slow device draws it slower rather than skipping marks
    else if (f < drawEnd && f > last + 2) { f = last + 2; t0 = now - f * spf; }
    const frame = f < drawEnd ? f : drawEnd + ((f - drawEnd) % loopLen);
    if (frame !== last) { renderFrame(film, ctx, frame, env); last = frame; }
    // spend what is left of this frame's budget painting washes that will be needed later
    film.prepare?.(env, () => performance.now() - now < 12);
    if (!told && f >= drawEnd - 10) { told = true; onDrawn(); }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    // a tap on the picture finishes the drawing at once
    finish: () => { finished = true; },
    stop: () => cancelAnimationFrame(raf),
  };
};

// the finished picture, once, into a canvas of its own (the gallery's resting tiles)
export const still = (canvas: HTMLCanvasElement, film: Film, scale: number) => {
  canvas.width = Math.round(film.meta.W * scale); canvas.height = Math.round(film.meta.H * scale);
  renderFrame(film, canvas.getContext("2d")!, film.shots.find((s) => s.id === "loop")!.start, makeEnv(film, scale));
};

// a card's vignette: the destination page, fully drawn, cropped to the card's shape
// drawn small (a quarter-ish scale costs a twentieth of the pixels) and stretched to the card
export const vignette = (film: Film, w: number, h: number): HTMLCanvasElement => {
  const scale = 0.3, env = makeEnv(film, scale), full = surface(Math.round(film.meta.W * scale), Math.round(film.meta.H * scale));
  renderFrame(film, full.ctx, film.shots.find((s) => s.id === "loop")!.start, env);
  const out = Object.assign(document.createElement("canvas"), { width: w, height: h }), sh = full.canvas.height, sw = (sh * w) / h;
  out.getContext("2d")!.drawImage(full.canvas as CanvasImageSource, (full.canvas.width - sw) / 2, 0, sw, sh, 0, 0, w, h);
  return out;
};
