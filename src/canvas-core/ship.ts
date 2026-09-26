// THE SHIP, one design for every page it appears on (p05, p09, p11). A river pebble as long as a
// stagecoach: full and round at the tail, tapering to the nose, no rivets, no fins, no portholes.
// It carries its own light in its belly, so it is always lit from underneath: a pale flank
// falling off to a terminator that bows up along its length, a back darker than the night, and
// one thin white rim along the top contour. It is drawn in the cyanotype hand on every page.
import { Gfx, type Env, type Layer, type P } from "./core";
import { bounds, clamp, clipped, fillShape, mix } from "./gallery";
import { CYAN, H, INK_M, W, masked } from "./west";

// A pose places the pebble on the page: `c` its centre, `ang` the direction the nose points
// (radians, screen space), `len` its half-length (foreshorten it yourself), `flip` puts the belly
// on the other side of the axis (the belly is on the left of the nose direction by default).
export type ShipPose = { c: P; ang: number; len: number; flip?: boolean };
const WID = 0.42, BACK = 1.12, BELLY = 0.9, TERM = -0.04; // the back domes higher than the belly

const frame = (s: ShipPose) => {
  const ax: P = [Math.cos(s.ang), Math.sin(s.ang)], f = s.flip ? -1 : 1, nx: P = [-ax[1] * f, ax[0] * f], wid = s.len * WID;
  // u runs -1 (tail) to +1 (nose); k runs across, negative up the back, positive down the belly
  const prof = (u: number) => Math.sqrt(clamp(1 - u * u)) * (1 - 0.34 * u) * (u > 0.4 ? 1 - 0.2 * (u - 0.4) : 1);
  const at = (u: number, k: number): P => [s.c[0] + ax[0] * u * s.len + nx[0] * k * wid * prof(u), s.c[1] + ax[1] * u * s.len + nx[1] * k * wid * prof(u)];
  const us = (n: number) => Array.from({ length: n + 1 }, (_, i) => -Math.cos((Math.PI * i) / n)); // bunched at the ends, so both round off
  const side = (k: number | ((u: number) => number), n = 26) => us(n).map((u) => at(u, typeof k === "number" ? k : k(u)));
  const term = (d: number) => (u: number) => TERM * BACK - d - 0.16 * (1 - u * u); // bows up into the back, as round a solid
  const lit = (k: number | ((u: number) => number)): P[] => [...side(BELLY), ...side(k).reverse()];
  return { at, side, term, lit, outline: [...side(-BACK), ...side(BELLY).reverse().slice(1, -1)], wid };
};

export const shipOutline = (s: ShipPose) => frame(s).outline;
// a point on the hull: u along it (-1 tail, +1 nose), k across it (-1 top of the back, +1 belly edge)
export const shipAt = (s: ShipPose, u: number, k: number) => frame(s).at(u, k);
// the hatch: an oval set into the flank at (u, k), `size` as a fraction of the hull's width
export const hatchOutline = (s: ShipPose, u: number, k: number, size = 0.5): P[] => {
  const F = frame(s), c = F.at(u, k), a = s.ang, rx = F.wid * size * 0.9, ry = F.wid * size * 0.55;
  return Array.from({ length: 20 }, (_, i) => { const t = (i / 20) * Math.PI * 2, x = Math.cos(t) * rx, y = Math.sin(t) * ry; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)] as P; });
};

export type ShipDraw = {
  reveal: number; // 0..1 during the draw-in: the rim line is drawn first, then the body fills in
  light?: P; // where the belly light is strongest (default: under the rear third)
  hatch?: { u: number; k: number; size?: number; open: number }; // open 0 = a closed seam, 1 = light pouring out
  hide?: P[][]; // ground or sand in front of the hull
  frame?: number; // for the rim line's boil
  cache?: { env: Env; key: string }; // a ship that does not move: its hull is painted once, then blitted
};

export const drawShip = (g: Gfx, s: ShipPose, o: ShipDraw) => {
  if (o.cache && o.reveal >= 1) {
    const k = `ship:${o.cache.key}:${o.cache.env.scale}`, env = o.cache.env;
    let L = env.cache.get(k) as Layer | undefined;
    if (!L) { L = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); paint(new Gfx(L.ctx, env, 0, INK_M), s, { ...o, hatch: undefined }); env.cache.set(k, L); }
    const c = g.cur, b = bounds(shipOutline(s)); c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(L.canvas, 0, 0); c.restore(); g.touch(b.x0 - 4, b.y0 - 4, b.x1 + 4, b.y1 + 4);
    if (o.hatch) paint(g, s, o, true);
    return;
  }
  paint(g, s, o);
};

const paint = (g: Gfx, s: ShipPose, o: ShipDraw, hatchOnly = false) => {
  const F = frame(s), body = F.outline, b = bounds(body), rFill = clamp(o.reveal * 2.6 - 1), rLine = clamp(o.reveal * 2.2);
  const light = o.light ?? F.at(-0.45, BELLY * 0.8), span = Math.max(b.x1 - b.x0, b.y1 - b.y0);
  const pen = (pts: P[], w: number, seed: number, op: number, progress = rLine) => g.pen(pts, { w, color: CYAN.glow, seed, wobble: 0.5, boil: 0.3, taper: 1, opacity: op, retrace: false, progress });
  g.group("plain", () => masked(g, o.hide, () => {
    const c = g.cur, box = () => c.fillRect(b.x0 - 8, b.y0 - 8, b.x1 - b.x0 + 16, b.y1 - b.y0 + 16);
    if (rFill > 0 && !hatchOnly) {
      fillShape(g, body, mix(CYAN.deep, "#06162c", 0.35), rFill);                                   // the back, darker than the night
      for (let k = 8; k >= 1; k--) fillShape(g, F.lit(F.term(k * 0.03)), CYAN.mid, 0.085 * rFill); // a soft penumbra above the terminator
      const u0 = -0.25, e0 = F.at(u0, BELLY), e1 = F.at(u0, F.term(0)(u0));
      clipped(g, F.lit(F.term(0)), () => { const gr = c.createLinearGradient(e0[0], e0[1], e1[0], e1[1]); gr.addColorStop(0, CYAN.glow); gr.addColorStop(0.3, CYAN.pale); gr.addColorStop(0.7, mix(CYAN.pale, CYAN.mid, 0.55)); gr.addColorStop(1, CYAN.mid); c.globalAlpha = rFill; c.fillStyle = gr; box(); c.globalAlpha = 1; });
      // the light thins out away from where it is strongest
      clipped(g, body, () => { const gr = c.createRadialGradient(light[0], light[1], span * 0.1, light[0], light[1], span * 0.85); gr.addColorStop(0, CYAN.deep + "00"); gr.addColorStop(0.55, CYAN.deep + "30"); gr.addColorStop(1, CYAN.deep + "b0"); c.globalAlpha = rFill; c.fillStyle = gr; box(); c.globalAlpha = 1; });
    }
    // one thin white rim along the top contour and round the nose; the belly edge is left to the light
    if (!hatchOnly) pen([...F.side(-BACK, 30).slice(3), ...F.side(BELLY, 30).reverse().slice(1, 5)], Math.max(1.1, span / 260), 900, 0.95);
    if (o.hatch) {
      const h = hatchOutline(s, o.hatch.u, o.hatch.k, o.hatch.size), hc = F.at(o.hatch.u, o.hatch.k), open = o.hatch.open;
      if (open > 0) {
        fillShape(g, h, "#040e1f", rFill);                                                           // a dark mouth
        fillShape(g, h.map(([x, y]) => [hc[0] + (x - hc[0]) * 0.72, hc[1] + (y - hc[1]) * 0.6 + (y > hc[1] ? 2 : 6)] as P), CYAN.glow, 0.9 * open * rFill); // its far inside lit
      }
      pen([...h, h[0], h[1]], Math.max(1, span / 300), 901, open > 0 ? 0.9 : 0.45);                  // closed, it is only a seam
    }
  }));
};
