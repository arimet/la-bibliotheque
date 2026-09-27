// THE LIBRARY'S BAKER (driven by tools/bake-library.mjs). The front page never paints: it sets
// images. For each style: every card finished at scale 1; each book cut from the table card by its
// silhouette (the copy that lifts under the pointer) and the place it leaves on the oak; each book's cover laid flat, facing the eye
// (the one that opens): the painted cover itself, taken off the table through its perspective.
import type { Env, Layer } from "../canvas-core/core";
import { libraryOilCards } from "../canvas-core/libraryOil";
import { libraryBrokenCards } from "../canvas-core/libraryBroken";
import { BOOKS, PAD, PLATES, bp, footprint, silhouette, spriteBox, type Img } from "../canvas-core/libraryScene";

declare global { interface Window { BAKE: unknown; __ASSETS__?: Record<string, string> } }
const STYLES = { oil: libraryOilCards, broken: libraryBrokenCards }, COVER_W = 520, COVER_SCALE = 2;
type Style = keyof typeof STYLES;
const images = new Map<string, CanvasImageSource>();
const surface = (w: number, h: number): Layer => { const c = new OffscreenCanvas(w, h); return { canvas: c, ctx: c.getContext("2d", { willReadFrequently: true }) as unknown as CanvasRenderingContext2D }; };   // CPU raster, as the films are painted
const envs = new Map<string, Env>();
const envAt = (s: Style, scale: number) => { const k = `${s}:${scale}`; let e = envs.get(k); if (!e) { e = { W: 1600, H: 900, scale, cache: new Map(), canvas: surface, image: (n) => images.get(n) }; envs.set(k, e); } return e; };
const png = async (c: Img) => { const b = await (c as OffscreenCanvas).convertToBlob({ type: "image/png" }), u8 = new Uint8Array(await b.arrayBuffer()); let s = ""; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); };
const table = (s: Style, scale: number) => STYLES[s].table.paint(envAt(s, scale));

const ready = Promise.all(Object.entries(PLATES).map(async ([name, url]) => { const img = new Image(); img.src = window.__ASSETS__?.[name] ?? url; await img.decode(); images.set(name, img); }));
window.BAKE = {
  ready, styles: Object.keys(STYLES), cards: Object.keys(libraryOilCards), books: BOOKS.map((b) => b.id),
  card: (s: Style, id: string) => png(STYLES[s][id].paint(envAt(s, 1))),
  // the book as it lies, alpha outside its silhouette; the page sets it back at spriteBox
  book: (s: Style, id: string) => {
    const b = BOOKS.find((q) => q.id === id)!, [x0, y0, x1, y1] = spriteBox(b), L = surface(x1 - x0, y1 - y0), c = L.ctx;
    c.beginPath(); silhouette(b).forEach(([x, y], i) => (i ? c.lineTo(x - x0, y - y0) : c.moveTo(x - x0, y - y0))); c.closePath(); c.clip();
    c.drawImage(table(s, 1), x0 + PAD, y0, x1 - x0, y1 - y0, 0, 0, x1 - x0, y1 - y0); return png(L.canvas);
  },
  // the place the book leaves: nothing was ever painted under it, so the oak round its footprint is
  // carried in, smoothly (the untouched pixels averaged near and far, the near where there are enough of
  // them), the grain of the oak just in front of the book laid over that (its own detail, less its blur),
  // and the whole a little darker toward the middle: the print of where it lay. Alpha is the footprint.
  place: (s: Style, id: string) => {
    const b = BOOKS.find((q) => q.id === id)!, [x0, y0, x1, y1] = spriteBox(b), w = x1 - x0, h = y1 - y0, t = (table(s, 1) as OffscreenCanvas).getContext("2d")!;
    const src = t.getImageData(x0 + PAD, y0, w, h).data, front = t.getImageData(x0 + PAD, y0 + h, w, h).data;
    const M = surface(w, h); M.ctx.fillStyle = "#000"; M.ctx.beginPath(); footprint(b).forEach(([x, y], i) => (i ? M.ctx.lineTo(x - x0, y - y0) : M.ctx.moveTo(x - x0, y - y0))); M.ctx.closePath(); M.ctx.fill();
    const md = M.ctx.getImageData(0, 0, w, h).data, m = new Float32Array(w * h).map((_, i) => md[i * 4 + 3] / 255), keep = m.map((v) => (v > 0 ? 0 : 1));
    const box = (a: Float32Array, r: number) => { const o = new Float32Array(a.length), tmp = new Float32Array(a.length); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0, n = 0; for (let d = -r; d <= r; d++) { const q = x + d; if (q >= 0 && q < w) { v += a[y * w + q]; n++; } } tmp[y * w + x] = v / n; } for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let v = 0, n = 0; for (let d = -r; d <= r; d++) { const q = y + d; if (q >= 0 && q < h) { v += tmp[q * w + x]; n++; } } o[y * w + x] = v / n; } return o; };
    const blur = (a: Float32Array, r: number) => box(box(a, r), r), kn = blur(keep, 10), kf = blur(keep, 70);
    const inner = blur(m, 6), L = surface(w, h), out = L.ctx.createImageData(w, h), d = out.data;
    for (let ch = 0; ch < 3; ch++) {
      const c = new Float32Array(w * h).map((_, i) => src[i * 4 + ch] * keep[i]), f = new Float32Array(w * h).map((_, i) => front[i * 4 + ch]), fb = blur(f, 4), near = blur(c, 10), far = blur(c, 70);
      for (let i = 0; i < w * h; i++) {
        const u = Math.min(1, kn[i] * 5), fill = u * (near[i] / Math.max(kn[i], 1e-6)) + (1 - u) * (far[i] / Math.max(kf[i], 1e-6));
        d[i * 4 + ch] = (fill + 0.9 * (f[i] - fb[i])) * (1 - 0.14 * inner[i]);
      }
    }
    for (let i = 0; i < w * h; i++) d[i * 4 + 3] = md[i * 4 + 3];
    L.ctx.putImageData(out, 0, 0); return png(L.canvas);
  },
  // the cover face on: each pixel (u, v) of the board is looked up where the painting put it, in the
  // table card painted at COVER_SCALE so the risen book stays sharp enough
  cover: (s: Style, id: string) => {
    const b = BOOKS.find((q) => q.id === id)!, t = table(s, COVER_SCALE), sw = t.width, sh = t.height, src = (t as OffscreenCanvas).getContext("2d")!.getImageData(0, 0, sw, sh).data;
    const w = COVER_W, h = Math.round((COVER_W * b.d) / b.w), L = surface(w, h), out = L.ctx.createImageData(w, h), d = out.data;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const [x, y] = bp(b, (i + 0.5) / w, (j + 0.5) / h), sx = Math.min(sw - 2, Math.max(0, (x + PAD) * COVER_SCALE - 0.5)), sy = Math.min(sh - 2, Math.max(0, y * COVER_SCALE - 0.5));
      const ix = Math.floor(sx), iy = Math.floor(sy), fx = sx - ix, fy = sy - iy, o = (iy * sw + ix) * 4, q = (j * w + i) * 4;
      for (let ch = 0; ch < 4; ch++) d[q + ch] = (src[o + ch] * (1 - fx) + src[o + 4 + ch] * fx) * (1 - fy) + (src[o + sw * 4 + ch] * (1 - fx) + src[o + sw * 4 + 4 + ch] * fx) * fy;
    }
    L.ctx.putImageData(out, 0, 0); return png(L.canvas);
  },
  free: (s: Style) => { for (const k of [...envs.keys()]) if (k.startsWith(s)) envs.delete(k); },
};
