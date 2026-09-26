// Corbenic's people and beasts, in the manuscript manner: flat body colour inside a firm ink line,
// long gothic figures about seven heads tall, a face in three-quarter view made of a few marks.
// A figure is built in its own units (u across, v up from the feet, both in figure heights) and
// mapped onto the page, so every page draws the same people the same way.
// Everything comes back as a Motif (fills + lines) plus the points a page needs: the hands (to put
// something in them), the head, and the parts (to hide what stands behind the figure).
import { oval, sample, tube, turn, type Gfx, type P } from "./core";
import { bounds, lerp } from "./gallery";
import { masked, type Stroke, type Wash } from "./west";

export type Fill = { pts: P[]; color: string; alpha?: number };
// `z`: how many of the motif's parts were already drawn when the line was; the ones drawn after it stand in front
export type Line = { pts: P[]; w: number; color?: string; op?: number; z?: number };
export type Motif = { fills: Fill[]; lines: Line[]; parts: P[][] };
export const motif = (...ms: Motif[]): Motif => {
  let n = 0; const lines: Line[] = [];
  for (const m of ms) { lines.push(...m.lines.map((l) => ({ ...l, z: (l.z ?? m.parts.length) + n }))); n += m.parts.length; }
  return { fills: ms.flatMap((m) => m.fills), lines, parts: ms.flatMap((m) => m.parts) };
};
// move every point of a motif (lay a figure down, flip it, place it)
export const remap = (m: Motif, fn: (p: P) => P): Motif => ({ fills: m.fills.map((f) => ({ ...f, pts: f.pts.map(fn) })), lines: m.lines.map((l) => ({ ...l, pts: l.pts.map(fn) })), parts: m.parts.map((q) => q.map(fn)) });
export const rotate = (m: Motif, c: P, deg: number): Motif => remap(m, (p) => turn([p], c[0], c[1], deg)[0]);

// The pen smooths a line through its points, so a shape with corners is given points along each
// edge: the curve then hugs the edges and only the corners round off, as a quill's would.
export const dense = (pts: P[], step = 10): P[] => pts.flatMap((a, i) => { if (i === pts.length - 1) return [a]; const b = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step)); return Array.from({ length: n }, (_, k) => [a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n] as P); });

// the shapes whose box reaches a box: the only ones worth clipping by
export const overlapping = (shapes: P[][], b: { x0: number; y0: number; x1: number; y1: number }, pad = 4) => shapes.filter((q) => { const c = bounds(q); return c.x0 < b.x1 + pad && c.x1 > b.x0 - pad && c.y0 < b.y1 + pad && c.y1 > b.y0 - pad; });

// A motif onto the page: its fills become flat washes on phase `ph` (opaque: whatever is painted
// later covers them), its lines become strokes, not yet timed (the page puts all its strokes in order).
export const lay = (m: Motif, o: { at: [number, number]; seed: number; ink: string; ph?: number; from?: P; hide?: P[][]; wob?: number }): { strokes: Omit<Stroke, "at">[]; washes: Wash[] } => {
  let sd = o.seed;
  return {
    washes: m.fills.map((f) => ({ pts: f.pts, color: f.color, alpha: f.alpha ?? 1, seed: sd++, at: o.at, ph: o.ph, from: o.from, hide: o.hide, flat: true })),
    strokes: m.lines.map((l) => {
      // hide a line behind the parts drawn after it, the ones that reach it at least
      const b = bounds(l.pts), front = m.parts.slice(l.z ?? m.parts.length).filter((q) => { const c = bounds(q); return c.x0 < b.x1 + 4 && c.x1 > b.x0 - 4 && c.y0 < b.y1 + 4 && c.y1 > b.y0 - 4; });
      const hide = [...(o.hide ?? []), ...front];
      return { pts: dense(l.pts), w: l.w, seed: sd++, op: l.op ?? 0.92, wob: o.wob ?? 0.45, color: l.color ?? o.ink, hide: hide.length ? hide : undefined };
    }),
  };
};

export const SKIN = "#ecd0ad", DEAD = "#a3a58f", MAIL = "#8d949a";
export type Shield = { field: string; mark?: string; ord?: "bend" | "cross" | "chevron" | "pale" | "lion" | "merlettes" };
export type Look = {
  x: number; g: number; h: number; f?: 1 | -1; lean?: number;
  robe: "long" | "tunic" | "armor" | "saddle"; // long: to the ground; tunic/armor: to the knee; saddle: sitting astride
  head: "bare" | "hood" | "helm" | "crown" | "veil" | "coif";
  cloth: string; cloth2?: string; hair?: string; skin?: string; metal?: string; gold?: string;
  // upper arm, forearm angles in radians from hanging straight down, positive toward where the figure faces
  near?: [number, number]; far?: [number, number];
  dead?: boolean; shield?: Shield; ink: string;
  lite?: boolean; // no folds, belt or brow: for small figures, and ones redrawn every frame
};
export type Figure = { m: Motif; hands: { near: P; far: P }; head: P; feet: P };

export const figure = (k: Look): Figure => {
  const f = k.f ?? 1, h = k.h, lean = k.lean ?? 0, dead = !!k.dead, skin = k.skin ?? (dead ? DEAD : SKIN), metal = k.metal ?? MAIL, ink = k.ink;
  const S = (u: number, v: number): P => [k.x + f * (u + lean * v) * h, k.g - v * h];
  const Sp = (pts: number[][]) => pts.map(([u, v]) => S(u, v));
  const fills: Fill[] = [], lines: Line[] = [], parts: P[][] = [];
  const add = (pts: P[], color: string, w = 1.6, outline = true) => { fills.push({ pts, color }); parts.push(pts); if (outline) line({ pts: [...pts, pts[0]], w, z: parts.length }); };
  const line = (l: Line) => { if (k.lite && (l.op ?? 1) < 0.8) return; lines.push({ ...l, z: parts.length }); };
  const lw = Math.max(1.2, h / 150);

  // arms, far one first: it is behind the body
  const arm = (su: number, [a1, a2]: [number, number]) => {
    const s: P = [su, 0.785], e: P = [s[0] + 0.19 * Math.sin(a1), s[1] - 0.19 * Math.cos(a1)], w: P = [e[0] + 0.17 * Math.sin(a2), e[1] - 0.17 * Math.cos(a2)];
    return { pts: [S(...s), S(...e), S(...w)], hand: S(w[0] + 0.012 * Math.sin(a2), w[1] - 0.012 * Math.cos(a2)) };
  };
  const nearA = arm(0.06, k.near ?? (dead ? [0.7, 1.35] : [0.08, 0.25])), farA = arm(-0.07, k.far ?? (dead ? [0.55, 1.2] : [-0.05, 0.1]));
  const armCloth = k.robe === "armor" ? metal : k.cloth;
  const drawArm = (A: typeof nearA) => { add(tube(A.pts, 0.034 * h, 0.026 * h), armCloth, lw); add(oval(A.hand[0], A.hand[1], 0.024 * h, 0.026 * h, 10), skin, lw * 0.8); };
  drawArm(farA);

  // the legs, for anything shorter than a gown
  if (k.robe === "tunic" || k.robe === "armor") {
    const legC = k.robe === "armor" ? metal : k.cloth2 ?? k.cloth;
    add(Sp([[-0.065, 0.4], [-0.015, 0.4], [-0.02, 0.03], [-0.06, 0.03]]), legC, lw);
    add(Sp([[0.015, 0.4], [0.065, 0.4], [0.055, 0.03], [0.015, 0.03]]), legC, lw);
    add(sample(Sp([[-0.07, 0.035], [-0.02, 0.035], [0.03, 0.012], [0.03, 0], [-0.07, 0]]), true, 3), "#3b2a20", lw * 0.8); // far foot
    add(sample(Sp([[0.01, 0.035], [0.06, 0.035], [0.11, 0.012], [0.11, 0], [0.01, 0]]), true, 3), "#3b2a20", lw * 0.8); // near foot
  }
  if (k.robe === "saddle") { // one leg down the horse's flank
    add(tube([S(0.02, 0.46), S(0.11, 0.3), S(0.09, 0.08)], 0.04 * h, 0.03 * h), k.cloth2 ?? metal, lw);
    add(sample(Sp([[0.06, 0.1], [0.12, 0.1], [0.17, 0.07], [0.16, 0.05], [0.06, 0.05]]), true, 3), "#3b2a20", lw * 0.8);
  }
  // the gown, the tunic or the surcoat
  const hem = k.robe === "long" ? 0 : k.robe === "saddle" ? 0.42 : 0.36, flare = k.robe === "long" ? 0.19 : k.robe === "saddle" ? 0.16 : 0.13;
  if (k.robe === "armor") add(Sp([[-flare - 0.01, hem - 0.04], [flare + 0.01, hem - 0.04], [0.11, hem + 0.1], [-0.11, hem + 0.1]]), metal, lw); // mail below the surcoat
  const body = sample(Sp([[-flare, hem], [-(flare + 0.1) / 2 + 0.02, (hem + 0.55) / 2], [-0.075, 0.55], [-0.09, 0.7], [-0.105, 0.785], [-0.05, 0.83], [0.05, 0.83], [0.1, 0.785], [0.085, 0.7], [0.075, 0.55], [(flare + 0.1) / 2 - 0.02, (hem + 0.55) / 2], [flare, hem], [0.08, hem - 0.012], [-0.08, hem - 0.012]]), true, 3);
  add(body, k.cloth, lw * 1.1);
  if (!k.lite) line({ pts: Sp([[-0.078, 0.555], [0, 0.545], [0.078, 0.555]]), w: lw }); // the belt
  line({ pts: Sp([[-0.02, 0.53], [-0.05, (hem + 0.53) / 2], [-flare * 0.55, hem + 0.01]]), w: lw * 0.8, op: 0.7 }); // folds
  line({ pts: Sp([[0.025, 0.53], [0.06, (hem + 0.53) / 2], [flare * 0.6, hem + 0.01]]), w: lw * 0.8, op: 0.7 });

  // the head. The dead hang theirs forward.
  const hc: P = dead ? [0.035, 0.895] : [0.012, 0.915], C = S(...hc), rx = 0.056 * h, ry = 0.07 * h;
  add(Sp([[-0.022, 0.82], [0.024, 0.82], [0.02 + hc[0] * 0.3, 0.87], [-0.018 + hc[0] * 0.3, 0.87]]), skin, lw, false); // neck
  const face = oval(C[0] + f * 0.004 * h, C[1], rx, ry, 16);
  const hair = k.hair ?? "#5a3a22";
  if (k.head === "hood" || k.head === "coif") {
    const col = k.head === "coif" ? metal : k.cloth2 ?? k.cloth;
    add(sample(Sp([[hc[0] - 0.085, hc[1] - 0.09], [hc[0] - 0.09, hc[1] + 0.02], [hc[0] - 0.02, hc[1] + 0.1], [hc[0] + 0.07, hc[1] + 0.05], [hc[0] + 0.08, hc[1] - 0.06], [hc[0] + 0.1, hc[1] - 0.1]]), true, 4), col, lw);
    add(oval(C[0] + f * 0.018 * h, C[1] + 0.006 * h, rx * 0.8, ry * 0.85, 14), skin, lw);
  } else if (k.head === "veil") {
    add(sample(Sp([[hc[0] - 0.07, hc[1] + 0.02], [hc[0] - 0.01, hc[1] + 0.095], [hc[0] + 0.06, hc[1] + 0.06], [hc[0] + 0.02, hc[1] - 0.02], [hc[0] - 0.02, 0.72], [hc[0] - 0.1, 0.7]]), true, 4), k.cloth2 ?? "#f2ece0", lw);
    add(face, skin, lw);
  } else if (k.head === "helm") {
    add(sample(Sp([[hc[0] - 0.062, hc[1] - 0.08], [hc[0] - 0.066, hc[1] + 0.06], [hc[0] - 0.04, hc[1] + 0.085], [hc[0] + 0.05, hc[1] + 0.085], [hc[0] + 0.07, hc[1] + 0.06], [hc[0] + 0.074, hc[1] - 0.08]]), true, 2), metal, lw);
    line({ pts: Sp([[hc[0] + 0.0, hc[1] + 0.012], [hc[0] + 0.07, hc[1] + 0.012]]), w: lw * 1.6 }); // eye slit
    line({ pts: Sp([[hc[0] + 0.035, hc[1] + 0.08], [hc[0] + 0.035, hc[1] - 0.075]]), w: lw * 0.8 });
  } else {
    add(oval(C[0] - f * 0.012 * h, C[1] - 0.012 * h, rx * 1.1, ry * 1.08, 16), hair, lw); // the hair shows round the back and top
    add(face, skin, lw);
    if (!dead) line({ pts: [S(hc[0] - 0.03, hc[1] + 0.05), S(hc[0] + 0.02, hc[1] + 0.064), S(hc[0] + 0.05, hc[1] + 0.04)], w: lw * 0.9, color: hair }); // a fringe
  }
  if (k.head !== "helm") {
    const E = S(hc[0] + 0.03, hc[1] + 0.012);
    if (dead) { line({ pts: [...oval(E[0], E[1], 0.009 * h, 0.009 * h, 8), oval(E[0], E[1], 0.009 * h, 0.009 * h, 8)[0]], w: lw * 0.8 }); const Mo = S(hc[0] + 0.035, hc[1] - 0.035); fills.push({ pts: oval(Mo[0], Mo[1], 0.012 * h, 0.01 * h, 8), color: "#2a1812" }); } // blank eyes, the mouth open
    else { line({ pts: [S(hc[0] + 0.02, hc[1] + 0.012), S(hc[0] + 0.038, hc[1] + 0.014)], w: lw * 1.2 }); line({ pts: [S(hc[0] + 0.025, hc[1] - 0.032), S(hc[0] + 0.042, hc[1] - 0.03)], w: lw * 0.8, op: 0.7 }); }
    line({ pts: [S(hc[0] + 0.052, hc[1] + 0.01), S(hc[0] + 0.062, hc[1] - 0.014), S(hc[0] + 0.05, hc[1] - 0.017)], w: lw * 0.8, op: 0.8 }); // the nose
    line({ pts: [S(hc[0] + 0.018, hc[1] + 0.03), S(hc[0] + 0.045, hc[1] + 0.034)], w: lw * 0.8, op: 0.7 }); // the brow
  }
  if (k.head === "crown") {
    const cy = hc[1] + 0.05, cr = Sp([[hc[0] - 0.058, cy], [hc[0] - 0.06, cy + 0.06], [hc[0] - 0.035, cy + 0.03], [hc[0] - 0.002, cy + 0.075], [hc[0] + 0.028, cy + 0.03], [hc[0] + 0.058, cy + 0.065], [hc[0] + 0.062, cy + 0.002], [hc[0] + 0.002, cy - 0.012]]);
    add(cr, k.gold ?? "#c9a043", lw);
  }
  drawArm(nearA);

  // a heater shield on the near forearm
  if (k.shield) {
    const [e, w] = [nearA.pts[1], nearA.pts[2]], c: P = [lerp(e[0], w[0], 0.55) + f * 0.02 * h, lerp(e[1], w[1], 0.55)], s = h;
    const Q = (u: number, v: number): P => [c[0] + f * u * s, c[1] - v * s];
    const sh = sample([Q(-0.085, 0.1), Q(0.085, 0.1), Q(0.085, 0.02), Q(0.05, -0.07), Q(0, -0.115), Q(-0.05, -0.07), Q(-0.085, 0.02)], true, 3);
    add(sh, k.shield.field, lw * 1.1);
    const mk = k.shield.mark ?? "#f1e6c8", o = k.shield.ord;
    const band = (pts: P[], wd: number) => line({ pts, w: wd * s, color: mk, op: 0.95 });
    if (o === "bend") band([Q(-0.07, 0.085), Q(0.06, -0.06)], 0.032);
    if (o === "pale") band([Q(0, 0.095), Q(0, -0.1)], 0.036);
    if (o === "cross") { band([Q(0, 0.09), Q(0, -0.1)], 0.022); band([Q(-0.075, 0.035), Q(0.075, 0.035)], 0.022); }
    if (o === "chevron") band([Q(-0.075, -0.03), Q(0, 0.05), Q(0.075, -0.03)], 0.03);
    if (o === "merlettes") [[-0.04, 0.05], [0.04, 0.05], [0, -0.03]].forEach(([u, v]) => fills.push({ pts: oval(Q(u, v)[0], Q(u, v)[1], 0.016 * s, 0.012 * s, 8), color: mk }));
    if (o === "lion") fills.push({ pts: sample([Q(-0.035, -0.05), Q(-0.03, 0.02), Q(-0.01, 0.07), Q(0.03, 0.075), Q(0.035, 0.04), Q(0.015, 0.02), Q(0.04, -0.01), Q(0.02, -0.06)], true, 3), color: mk });
  }
  return { m: { fills, lines, parts }, hands: { near: nearA.hand, far: farA.hand }, head: C, feet: [k.x, k.g] };
};

// A horse in profile, facing `f`, `h` its height at the withers, in a caparison of `cloth` if given.
// Returns the saddle point: sit a `robe: "saddle"` figure there with its v 0.45 on it.
export const horse = (k: { x: number; g: number; h: number; f?: 1 | -1; coat: string; cloth?: string; hem?: string; ink: string; stride?: number }) => {
  const f = k.f ?? 1, h = k.h, st = k.stride ?? 0, S = (u: number, v: number): P => [k.x + f * u * h, k.g - v * h];
  const Sp = (pts: number[][]) => pts.map(([u, v]) => S(u, v));
  const fills: Fill[] = [], lines: Line[] = [], parts: P[][] = [], lw = Math.max(1.3, h / 140), dark = mixDark(k.coat);
  const add = (pts: P[], color: string, w = lw) => { fills.push({ pts, color }); parts.push(pts); lines.push({ pts: [...pts, pts[0]], w, z: parts.length }); };
  // a leg: from the body down through the knee (or hock) to the fetlock, and a dark hoof
  const leg = (top: P, knee: P, fet: P, color: string) => {
    add(tube([S(...top), S(...knee), S(...fet)], 0.06 * h, 0.034 * h), color);
    add(sample(Sp([[fet[0] - 0.045, fet[1] - 0.01], [fet[0] + 0.05, fet[1] - 0.01], [fet[0] + 0.07, fet[1] - 0.07], [fet[0] - 0.04, fet[1] - 0.07]]), true, 2), "#3b2a20", lw * 0.8);
  };
  leg([-0.34, 0.66], [-0.46 - st * 0.3, 0.34], [-0.38 - st * 0.5, 0.08], dark); // far hind, behind
  leg([0.38, 0.64], [0.42 + st * 0.4, 0.32], [0.4 + st * 0.7, 0.08], dark);     // far fore
  add(tube([S(-0.5, 0.9), S(-0.63, 0.74), S(-0.62, 0.42)], 0.055 * h, 0.03 * h), dark); // tail
  add(sample(Sp([[-0.56, 0.84], [-0.46, 0.98], [0.0, 0.95], [0.3, 0.98], [0.56, 0.86], [0.5, 0.6], [0.1, 0.52], [-0.4, 0.56]]), true, 4), k.coat); // barrel
  add(sample(Sp([[0.26, 0.96], [0.5, 1.2], [0.64, 1.38], [0.78, 1.14], [0.64, 0.92], [0.56, 0.68]]), true, 4), k.coat); // neck
  add(sample(Sp([[0.6, 1.36], [0.68, 1.42], [0.96, 1.08], [0.97, 1.0], [0.88, 0.99], [0.76, 1.1]]), true, 3), k.coat); // head
  add(Sp([[0.62, 1.4], [0.64, 1.51], [0.69, 1.41]]), k.coat); // ear
  lines.push({ pts: Sp([[0.28, 1.0], [0.46, 1.2], [0.6, 1.36]]), w: lw * 2.6, color: dark, z: parts.length }); // mane
  lines.push({ pts: Sp([[0.8, 1.2], [0.83, 1.19]]), w: lw * 1.5, z: parts.length });                        // eye
  lines.push({ pts: Sp([[0.93, 1.03], [0.95, 1.02]]), w: lw, z: parts.length });                            // nostril
  leg([-0.28, 0.66], [-0.34 + st * 0.3, 0.34], [-0.28 + st * 0.5, 0.08], k.coat); // near hind
  leg([0.44, 0.64], [0.47 - st * 0.4, 0.32], [0.45 - st * 0.7, 0.08], k.coat);    // near fore
  if (k.cloth) {
    const top = Sp([[-0.6, 0.8], [-0.46, 1.0], [0.0, 0.97], [0.3, 1.0], [0.52, 1.0], [0.6, 0.8]]), low = Array.from({ length: 13 }, (_, i) => { const u = lerp(0.6, -0.64, i / 12); return S(u, 0.4 + (i % 2) * 0.05); });
    add(sample([...top, ...low], true, 2), k.cloth);
    if (k.hem) lines.push({ pts: low, w: lw * 2.6, color: k.hem, z: parts.length });
  }
  return { m: { fills, lines, parts } as Motif, saddle: S(-0.02, 0.98), feet: [k.x, k.g] as P };
};
const mixDark = (c: string) => { const n = parseInt(c.slice(1), 16), d = (v: number) => Math.round(v * 0.72).toString(16).padStart(2, "0"); return "#" + d(n >> 16) + d((n >> 8) & 255) + d(n & 255); };

// A motif painted straight onto the frame, for a figure that moves: fills, then lines, each line
// hidden behind the parts drawn after it. Costs a few dozen fills and strokes a frame.
export const paintMotif = (g: Gfx, m: Motif, o: { ink: string; seed: number; reveal?: number; hide?: P[][] }) => {
  const rv = o.reveal ?? 1, all = bounds(m.parts.flat()), hide = overlapping(o.hide ?? [], all);
  g.group("plain", () => {
    masked(g, hide, () => m.fills.forEach((f) => g.fill(f.pts, f.color, (f.alpha ?? 1) * Math.min(1, rv * 1.5))));
    m.lines.forEach((l, i) => {
      const b = bounds(l.pts);
      masked(g, [...overlapping(hide, b), ...overlapping(m.parts.slice(l.z ?? m.parts.length), b)], () => g.pen(dense(l.pts), { w: l.w, color: l.color ?? o.ink, seed: o.seed + i, wobble: 0.35, boil: 0.2, taper: 1, opacity: l.op ?? 0.92, retrace: false, progress: rv }));
    });
  });
};
