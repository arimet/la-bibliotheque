// PAGE 3 · LE BUREAU. One idea: the sheriff left in a hurry, and the only thing still lit in his
// office is the star he left behind.
// Focal subject: the brass star, half under the open notebook on the desk, in the one patch of sun.
// One light: the last low sun through the window in the left wall. It rakes across the room from
// the back left, down onto the desk; everything else sits in warm shadow, the cell darkest. The
// front of the desk and the chair face away from it (contre-jour).
// What moves: dust motes drifting in the sunbeam, the torn curtain in the wind, the star's glint
// pulsing, and once a loop the window panes rattle (the dull thud from outside), with their
// shadows on the desk.
import { rng, type P } from "./core";
import { letter, width } from "./drafting";
import { blob, clipped, fillShape, lerp, lerpP, mix } from "./gallery";
import { masked, perspective, page, seq, st, type Stroke, type Wash } from "./west";
import type { Gfx } from "./core";

const DRAW = 105, LOOP = 180;
const INK = "#2b1a10", PAPER = "#f3e7cf";
const OCHRE = "#c99a58", UMBER = "#7d5234", SIENNA = "#a4633c", DARK = "#3a2418", SHADE = "#6f5a7a", GLOW = "#f1c77a", ROSE = "#dc9a78", BRASS = "#d8a24a";

// ---------------------------------------------------------------- the room, seen from the doorway
// Standing in the door, a little left of the room's axis. X lateral, Y height, z depth (1 = the
// bottom of the frame, 1000 world units per z). Eye at 640 (a tall man), ceiling 880.
const VP: P = [880, 260];
const { G, U } = perspective(VP);
const S = (X: number, Y: number, z: number): P => U(X, z, Y);
const XL = -900, XR = 620, ZN = 0.8, ZB = 1.8, HC = 880;
const quadX = (X: number, z0: number, z1: number, h0: number, h1: number): P[] => [S(X, h0, z0), S(X, h1, z0), S(X, h1, z1), S(X, h0, z1)];
const quadZ = (z: number, x0: number, x1: number, h0: number, h1: number): P[] => [S(x0, h0, z), S(x0, h1, z), S(x1, h1, z), S(x1, h0, z)];
const edges = (pts: P[], w: number, seed: number, op = 0.9, closed = true) => pts.slice(0, closed ? pts.length : -1).map((a, i) => st([a, pts[(i + 1) % pts.length]], w * (i % 2 ? 0.8 : 1), seed + i, op, 0.4));

// polygon helpers: keep the part of a polygon left of a directed line; convex hull
const clipHalf = (poly: P[], a: P, b: P): P[] => {
  const side = (p: P) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]), out: P[] = [];
  poly.forEach((p, i) => { const q = poly[(i + 1) % poly.length], sp = side(p), sq = side(q); if (sp >= 0) out.push(p); if (sp * sq < 0) out.push(lerpP(p, q, sp / (sp - sq))); });
  return out;
};
const hull = (pts: P[]): P[] => {
  const s = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: P[]) => list.reduce<P[]>((h, p) => { while (h.length > 1 && cr(h[h.length - 2], h[h.length - 1], p) <= 0) h.pop(); h.push(p); return h; }, []);
  const lo = half(s), up = half([...s].reverse()); return [...lo.slice(0, -1), ...up.slice(0, -1)];
};

const room = {
  floor: [G(XL, ZN), G(XL, ZB), G(XR, ZB), G(XR, ZN)],
  left: [G(XL, ZN), S(XL, HC, ZN), S(XL, HC, ZB), G(XL, ZB)],
  right: [G(XR, ZN), S(XR, HC, ZN), S(XR, HC, ZB), G(XR, ZB)],
  back: quadZ(ZB, XL, XR, 0, HC),
  ceil: [S(XL, HC, ZN), S(XL, HC, ZB), S(XR, HC, ZB), S(XR, HC, ZN)],
};

// ---------------------------------------------------------------- the one light
// Sun rays fall 1 unit for every 2.2 they travel right and 1.1 thousandths of z they come forward.
const LXR = 2.2, LZR = 0.0011;
const ray = (X: number, Y: number, z: number, y: number): [number, number] => [X + LXR * (Y - y), z - LZR * (Y - y)];
const WIN = { z0: 1.28, z1: 1.48, h0: 440, h1: 660 };
const glass = quadX(XL, WIN.z0, WIN.z1, WIN.h0, WIN.h1);
const DESK = { x0: -380, x1: 160, z0: 0.8, z1: 1.15, h: 240 };
const onDesk = (X: number, z: number): P => S(X, DESK.h, z);
// the window's four corners landing on the plane of the desk top: [near-low, far-low, far-high, near-high]
const land = ([[WIN.z0, WIN.h0], [WIN.z1, WIN.h0], [WIN.z1, WIN.h1], [WIN.z0, WIN.h1]] as P[]).map(([z, h]) => ray(XL, h, z, DESK.h));
// the patch of sun on the desk, in desk coordinates (X, z*1000), then on screen
const deskRect: P[] = [[DESK.x0, DESK.z0 * 1000], [DESK.x1, DESK.z0 * 1000], [DESK.x1, DESK.z1 * 1000], [DESK.x0, DESK.z1 * 1000]];
const k1 = (p: [number, number]): P => [p[0], p[1] * 1000];
const nearEdge: [P, P] = [k1(land[0]), k1(land[3])], farEdge: [P, P] = [k1(land[2]), k1(land[1])];
const topEdge: [P, P] = [k1(land[3]), k1(land[2])], band = clipHalf(clipHalf(deskRect, nearEdge[0], nearEdge[1]), farEdge[0], farEdge[1]);
const litD = clipHalf(band, topEdge[0], topEdge[1]);
const toScreen = (poly: P[]) => poly.map(([X, zz]) => onDesk(X, zz / 1000));
const lit = toScreen(litD);
// the rest of the top, in three pieces that never overlap: in front of the patch, behind it, beyond it
const shades = [clipHalf(deskRect, nearEdge[1], nearEdge[0]), clipHalf(clipHalf(deskRect, nearEdge[0], nearEdge[1]), farEdge[1], farEdge[0]), clipHalf(band, topEdge[1], topEdge[0])].filter((q) => q.length > 2).map(toScreen);
// the beam through the air: from the window to where it lands (it ends on the desk)
// (the lowest rays pass the desk's left end and die on its side panel)
const yLeft = WIN.h0 - (DESK.x0 - XL) / LXR, lowSide = [WIN.z0, WIN.z1].map((z) => S(DESK.x0, yLeft, ray(XL, WIN.h0, z, yLeft)[1]));
const shaft = hull([...glass, ...lit, ...lowSide]);

// ---------------------------------------------------------------- the desk and what is on it
const deskTop = [onDesk(DESK.x0, DESK.z0), onDesk(DESK.x1, DESK.z0), onDesk(DESK.x1, DESK.z1), onDesk(DESK.x0, DESK.z1)];
const deskFront = [G(DESK.x0, DESK.z0), onDesk(DESK.x0, DESK.z0), onDesk(DESK.x1, DESK.z0), G(DESK.x1, DESK.z0)];
const deskSil = [G(DESK.x0, DESK.z0), onDesk(DESK.x0, DESK.z0), onDesk(DESK.x0, DESK.z1), onDesk(DESK.x1, DESK.z1), onDesk(DESK.x1, DESK.z0), G(DESK.x1, DESK.z0)];

// the notebook lies open, turned a little, its front right corner over the star
const NB = { c: [-250, 1030] as P, hw: 125, hd: 78, rot: -0.12 };
const nbAt = (u: number, v: number): P => { const [cx, cz] = NB.c, c = Math.cos(NB.rot), s = Math.sin(NB.rot), x = u * NB.hw, y = v * NB.hd; return onDesk(cx + x * c - y * s, (cz + x * s + y * c) / 1000); };
const notebook = [nbAt(-1, -1), nbAt(1, -1), nbAt(1, 1), nbAt(-1, 1)];
// handwriting: words as squiggles on ruled rows, looser toward the end of the entry
const script = (() => {
  const r = rng(330), out: ReturnType<typeof st>[] = [];
  [[-0.94, -0.08], [0.08, 0.94]].forEach(([u0, u1], pg) => {
    for (let row = 0; row < (pg ? 4 : 6); row++) {
      const v = 0.7 - row * 0.28; let u = u0 + (row === 0 && !pg ? 0.1 : 0);
      while (u < u1 - 0.1) {
        const len = Math.min(u1 - u, 0.12 + r() * 0.3), n = Math.max(4, Math.round(len * 26)), pts: P[] = [];
        for (let i = 0; i <= n; i++) { const [x, y] = nbAt(u + (len * i) / n + (r() - 0.5) * 0.012, v); pts.push([x, y + (i % 2 ? -(1.2 + r() * 2.2) - (r() < 0.15 ? 3.5 : 0) : 0.4 + r() * 1.3)]); }
        out.push(st(pts, 0.75, 340 + out.length, 0.7, 0.3)); u += len + 0.05 + r() * 0.05;
      }
    }
  });
  return out;
})();
const ink = { c: onDesk(95, 1.1), r: 15, h: 34 };
const inkPot: P[] = [[ink.c[0] - ink.r, ink.c[1]], [ink.c[0] - ink.r, ink.c[1] - ink.h * 0.7], [ink.c[0] - 6, ink.c[1] - ink.h], [ink.c[0] + 6, ink.c[1] - ink.h], [ink.c[0] + ink.r, ink.c[1] - ink.h * 0.7], [ink.c[0] + ink.r, ink.c[1] + 2]];
// papers swept off the desk when the chair went over
const papers = [[[250, 1.1], [390, 1.07], [412, 1.17], [270, 1.2]]].map((q) => q.map(([X, z]) => G(X, z)));
const paperScript = [0.3, 0.5, 0.7].map((v, i) => { const [a, b, c, d] = papers[0]; return st(Array.from({ length: 9 }, (_, k) => { const p = lerpP(lerpP(a, d, v), lerpP(b, c, v), 0.12 + (k / 8) * (i === 2 ? 0.45 : 0.76)); return [p[0], p[1] + (k % 2 ? -1.6 : 1)] as P; }), 0.7, 296 + i, 0.6, 0.2); });

// the star: five slender points with ball tips, lying flat (drawn a little less foreshortened than
// the desk, or it would read as a smear), tip toward the light
const STAR = { c: nbAt(1.24, -1.12), R: 62, r: 26, sq: 0.6, rot: -0.35 };
const starPt = (k: number, rad: number): P => { const a = STAR.rot - Math.PI / 2 + (k * Math.PI) / 5; return [STAR.c[0] + Math.cos(a) * rad, STAR.c[1] + Math.sin(a) * rad * STAR.sq]; };
const starOut = Array.from({ length: 10 }, (_, k) => starPt(k, k % 2 ? STAR.r : STAR.R));
const tips = [0, 2, 4, 6, 8].map((k) => starPt(k, STAR.R + 4)), GLINT = 8;
// each point has a facet turned to the sun (upper left) and one turned away
const facets = [0, 2, 4, 6, 8].map((k) => { const tip = starPt(k, STAR.R), lit = (j: number) => { const q = starPt(j, STAR.r); return (q[0] - tip[0]) * -0.8 + (q[1] - tip[1]) * -0.6; }; return [STAR.c, tip, starPt(lit(k - 1) < lit(k + 1) ? k - 1 : k + 1, STAR.r)] as P[]; });

// ---------------------------------------------------------------- the rest of the room
// the cell across the back right: a barred partition, floor to ceiling, its door shut, a cot inside
const CELL = { z: 1.5, x0: 40, door: 300 };
const bars = Array.from({ length: 14 }, (_, i) => CELL.x0 + (i * (XR - CELL.x0)) / 13);
const cot = { top: [S(300, 150, 1.6), S(600, 150, 1.6), S(600, 150, 1.78), S(300, 150, 1.78)], front: quadZ(1.6, 300, 600, 90, 150) };
// the WANTED poster, pinned on the back wall, square to us
const POSTER = { x0: -560, x1: -200, h0: 400, h1: 800 };
const poster = quadZ(ZB, POSTER.x0, POSTER.x1, POSTER.h0, POSTER.h1);
const pc = S((POSTER.x0 + POSTER.x1) / 2, 0, ZB)[0], py0 = S(0, POSTER.h1, ZB)[1];
const wanted = (() => { const out: Omit<Stroke, "at">[] = [], cap = 30, track = 1.1; letter({ pen: (pts: P[], o: { w: number; seed: number }) => out.push({ pts, w: o.w / 1.7, seed: o.seed, op: 0.95, wob: 0.25 }) } as unknown as Gfx, "WANTED", pc, py0 + 14, { cap, seed: 360, align: "center", track, w: 4.6 }); return { out, w: width("WANTED", cap, track) }; })();
// the rifle rack on the right wall: two rails, four pairs of pegs, every one empty
const RACK = { z0: 0.98, z1: 1.36, h0: 330, h1: 740 };
const rackRails = [quadX(XR, RACK.z0, RACK.z1, RACK.h1 - 52, RACK.h1), quadX(XR, RACK.z0, RACK.z1, RACK.h0, RACK.h0 + 44)];
// the chair, knocked over backwards: built upright (x across, y up, d from front to back), tipped
// onto its back, turned a little, projected. Every member has thickness: a stick figure of a
// chair reads as a crate.
const CH = { X: -520, z: 1.08, yaw: 0.45, tip: 1.5 };
const chair3 = (x: number, y: number, d: number): [number, number, number] => {
  const dd = d - 145, c = Math.cos(CH.tip), s = Math.sin(CH.tip), d2 = dd * c + y * s, y2 = -dd * s + y * c;
  const cy = Math.cos(CH.yaw), sy = Math.sin(CH.yaw);
  return [CH.X + x * sy - d2 * cy, y2 + 4, CH.z + (x * cy + d2 * sy) / 1000];
};
const chair = (x: number, y: number, d: number): P => { const [X, Y, z] = chair3(x, y, d); return S(X, Y, z); };
// every member has thickness (a stick chair reads as a crate) and constant width (the pen's
// swelling stroke reads as leaves), so the members are solid shapes of wash with a pen edge
type V3 = [number, number, number];
const member = (a: V3, b: V3, th: number, th1 = th) => {
  const pa = chair(...a), pb = chair(...b), za = chair3(...a)[2], zb = chair3(...b)[2], l = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) || 1, nx = -(pb[1] - pa[1]) / l, ny = (pb[0] - pa[0]) / l;
  const o = (p: P, z: number, k: number, t: number): P => [p[0] + (nx * t * k) / z, p[1] + (ny * t * k) / z];
  return { poly: [o(pa, za, -0.5, th), o(pb, zb, -0.5, th1), o(pb, zb, 0.5, th1), o(pa, za, 0.5, th)], e: [[o(pa, za, -0.5, th), o(pb, zb, -0.5, th1)], [o(pa, za, 0.5, th), o(pb, zb, 0.5, th1)]] as P[][] };
};
const side = (x: number) => [member([x, 176, 6], [x, -4, 12], 26, 16), member([x, -4, 144], [x, 176, 150], 18, 26), member([x, 176, 150], [x, 364, 168], 26, 22), member([x, 60, 12], [x, 60, 142], 12)];
const chairFar = side(72), chairNear = side(-72);
const chairSeat = [chair(-84, 176, -4), chair(84, 176, -4), chair(84, 176, 154), chair(-84, 176, 154)];
const chairRails = [member([-72, 348, 164], [72, 348, 164], 34), member([-72, 300, 161], [72, 300, 161], 12), member([-72, 254, 157], [72, 254, 157], 12), member([-72, 86, 8], [72, 86, 8], 12)];
// the door we stand in: its jamb and lintel frame the room
const jamb: P[] = [[-20, -20], [44, -20], [40, 920], [-20, 920]], lintel: P[] = [[-20, -20], [1620, -20], [1620, 30], [-20, 38]];

// ---------------------------------------------------------------- the pen
const plank = (pts: P[], w: number, seed: number, op: number, hide?: P[][]) => ({ ...st(pts, w, seed, op, 0.5), hide });
const strokes: Stroke[] = [
  // 1. the box of the room: its four corner lines and the back wall
  ...seq([st([G(XL, ZN), G(XL, ZB)], 3, 1, 0.9), st([G(XR, ZN), G(XR, ZB)], 2.6, 2, 0.85), st([G(XL, ZB), G(XR, ZB)], 2.2, 3, 0.85),
    st([S(XL, HC, ZN), S(XL, HC, ZB)], 2.2, 4, 0.8), st([S(XR, HC, ZN), S(XR, HC, ZB)], 2, 5, 0.8), st([S(XL, HC, ZB), S(XR, HC, ZB)], 1.8, 6, 0.8),
    st([G(XL, ZB), S(XL, HC, ZB)], 2, 7, 0.85), st([G(XR, ZB), S(XR, HC, ZB)], 2, 8, 0.85)], 0, 14, 0.35, [deskSil, jamb]),
  // 2. the big things: the desk, the window, the cell, the chair
  ...seq([...edges(deskTop, 3.2, 20, 0.95), st([deskFront[1], deskFront[0]], 3.4, 25), st([deskFront[2], deskFront[3]], 3, 26),
    st([onDesk(DESK.x0, DESK.z0 - 0.005).map((v, i) => v + (i ? 16 : 0)) as P, onDesk(DESK.x1, DESK.z0 - 0.005).map((v, i) => v + (i ? 16 : 0)) as P], 1.6, 27, 0.8)], 8, 26),
  ...seq(edges(glass, 2.6, 30, 0.95), 12, 24),
  ...seq([st([S(DESK.x0 + 20, 196, DESK.z0), S(DESK.x1 - 20, 196, DESK.z0)], 1.4, 280, 0.8), ...[-0.62, 0, 0.62].map((f, i) => st([S((DESK.x0 + DESK.x1) / 2 + f * 250, 212, DESK.z0), S((DESK.x0 + DESK.x1) / 2 + f * 250, 196, DESK.z0)], 1.2, 281 + i, 0.7)),
    ...[-0.31, 0.31].map((f, i) => st(blob(...S((DESK.x0 + DESK.x1) / 2 + f * 250, 178, DESK.z0), 5, 4, 285 + i, 0.05, 8), 1.6, 285 + i, 0.9, 0.1)),
    ...[[DESK.x0 + 30, -125], [-95, 135]].flatMap(([a, b], i) => [st([S(a, 160, DESK.z0), S(b, 160, DESK.z0)], 1.3, 287 + i * 3, 0.75), st([S(a, 160, DESK.z0), [S(a, 160, DESK.z0)[0], 905]], 1.3, 288 + i * 3, 0.7), st([S(b, 160, DESK.z0), [S(b, 160, DESK.z0)[0], 905]], 1, 289 + i * 3, 0.55)]),
    ...papers.flatMap((q, i) => edges(q, 1.2, 290 + i * 5, 0.75)), ...paperScript], 26, 40),
  ...seq(edges([S(XL, WIN.h0 - 22, WIN.z0 - 0.03), S(XL, WIN.h0 - 22, WIN.z1 + 0.03), S(XL, WIN.h0 - 8, WIN.z1 + 0.03), S(XL, WIN.h0 - 8, WIN.z0 - 0.03)], 1.6, 36, 0.8), 18, 26), // the sill
  ...seq([...bars.map((X, i) => st([S(X, 0, CELL.z), S(X, HC, CELL.z)], i === 0 || i === 13 ? 2.6 : 1.7, 40 + i, 0.9, 0.3)),
    ...[70, 470, 840].map((h, i) => st([S(CELL.x0, h, CELL.z), S(XR, h, CELL.z)], 2.4, 60 + i, 0.9, 0.3)),
    st([S(CELL.door, 0, CELL.z), S(CELL.door, HC, CELL.z)], 3, 64, 0.95, 0.3)], 18, 40, 0.5, [deskSil]),
  // 3. the walls' boards and the floor's planks, converging on the door
  ...seq([
    ...Array.from({ length: 10 }, (_, i) => plank([S(XL, 90 + i * 84, ZN), S(XL, 90 + i * 84, ZB)], 0.8, 100 + i, 0.4, [glass])),
    ...Array.from({ length: 5 }, (_, i) => plank([S(XR, 100 + i * 160, ZN), S(XR, 100 + i * 160, ZB)], 0.8, 110 + i, 0.35, rackRails)),
    ...Array.from({ length: 16 }, (_, i) => plank([S(XL + 95 * (i + 1), 0, ZB), S(XL + 95 * (i + 1), HC, ZB)], 0.8, 120 + i, 0.35, [poster, deskSil])),
    ...Array.from({ length: 11 }, (_, i) => plank([G(XL + 130 * (i + 0.6), ZN), G(XL + 130 * (i + 0.6), ZB)], 1.1, 140 + i, 0.5, [deskSil])),
    ...[-760, -150, 460].map((X, i) => plank([S(X, HC, ZN), S(X, HC, ZB)], 1.6, 160 + i, 0.6)), // ceiling joists
    ...[1.08, 1.34, 1.62].map((z, i) => plank([G(XL + 40 + i * 90, z), G(XL + 300 + i * 120, z)], 0.8, 170 + i, 0.4, [deskSil])), // butt joints
  ], 34, 62, 0.5, undefined),
  // 4. details: the desk's panels, the notebook, the star, the poster, the rack, the cot, the cell door
  ...seq([
    ...edges(notebook, 1.6, 200, 0.9), st([nbAt(0, -1), nbAt(0.02, 0), nbAt(0, 1)], 1.3, 205, 0.8),
    ...[[-0.97, -1.04], [0.97, -1.04]].map(([u, v], i) => st([nbAt(u, v), nbAt(u * 0.5, v - 0.02), nbAt(0, -1)], 0.8, 206 + i, 0.6)), // the page stack's edge
    ...edges(inkPot, 1.4, 210, 0.9, false), st([[ink.c[0] - 6, ink.c[1] - ink.h], [ink.c[0] - 5, ink.c[1] - ink.h - 8], [ink.c[0] + 5, ink.c[1] - ink.h - 8], [ink.c[0] + 6, ink.c[1] - ink.h]], 1.2, 216, 0.85),
    st([[ink.c[0] + 3, ink.c[1] - ink.h - 6], [ink.c[0] + 22, ink.c[1] - ink.h - 70]], 1.3, 217, 0.85), // the pen in the pot
  ], 56, 74, 0.35),
  ...seq([...starOut.map((a, i) => ({ ...st([a, starOut[(i + 1) % 10]], 2.2, 220 + i, 0.95, 0.2), hide: [notebook] })),
    ...[0, 2, 4, 6, 8].map((k, i) => ({ ...st([STAR.c, starPt(k, STAR.R - 3)], 0.8, 232 + i, 0.6, 0.2), hide: [notebook] })),
    ...tips.map((p, i) => ({ ...st(blob(p[0], p[1], 4.4, 3.6, 240 + i, 0.05, 8), 1.2, 240 + i, 0.95, 0.1), hide: [notebook] })),
    st(blob(STAR.c[0], STAR.c[1], 7, 4.4, 247, 0.05, 10), 0.9, 247, 0.7, 0.1)], 62, 78, 0.3),
  ...seq([...script], 66, 86, 0.2),
  ...seq([...edges(poster, 1.6, 250, 0.85), ...wanted.out,
    st([[pc - 30, py0 + 110], [pc - 26, py0 + 84], [pc - 14, py0 + 72], [pc + 14, py0 + 72], [pc + 26, py0 + 84], [pc + 30, py0 + 110]], 1.4, 290, 0.85), // the hat of a man they want
    st([[pc - 46, py0 + 112], [pc, py0 + 106], [pc + 46, py0 + 112]], 1.8, 291, 0.9),
    st([[pc - 20, py0 + 132], [pc, py0 + 138], [pc + 20, py0 + 132]], 1.2, 292, 0.8), st([[pc - 36, py0 + 172], [pc - 22, py0 + 150], [pc + 22, py0 + 150], [pc + 36, py0 + 172]], 1.3, 293, 0.8),
    ...[196, 208, 220].map((dy, i) => st([[pc - 56 + i * 6, py0 + dy], [pc + 56 - i * 10, py0 + dy + 1]], 0.8, 294 + i, 0.55)),
  ], 60, 84, 0.3),
  ...seq([...rackRails.flatMap((q, j) => edges(q, 1.6, 300 + j * 4, 0.9)),
    ...[1.04, 1.13, 1.22, 1.31].flatMap((z, i) => [st([S(XR, RACK.h1 - 52, z), S(XR - 46, RACK.h1 - 58, z), S(XR - 52, RACK.h1 - 26, z)], 2.4, 310 + i, 0.95), st([S(XR, RACK.h0 + 44, z), S(XR - 46, RACK.h0 + 38, z), S(XR - 52, RACK.h0 + 70, z)], 2.4, 316 + i, 0.95)]),
    ...edges(cot.front, 1.4, 320, 0.8), st([cot.top[3], cot.top[2]], 1.2, 325, 0.7), st([cot.front[1], cot.top[3]], 1.2, 326, 0.7),
    st([S(360, 150, 1.62), S(420, 176, 1.66), S(520, 168, 1.7), S(590, 152, 1.64)], 1.1, 327, 0.7), // a blanket, thrown back
    ...edges(quadZ(CELL.z, CELL.x0 + 20, CELL.x0 + 70, 400, 460), 1.4, 330, 0.9), // the lock
  ], 66, 88, 0.35, [deskSil]),
  // 5. last: the doorframe we stand in, and the dark searching lines under things
  ...seq([st([[42, -10], [40, 910]], 3.6, 400, 0.95), st([[-10, 34], [1610, 28]], 3.2, 401, 0.9),
    st([deskFront[1], [deskFront[1][0] + 2, 900]], 4.2, 402, 0.9), st([G(XL, ZB), [G(XL, ZB)[0] + 300, G(XL, ZB)[1] + 1]], 3.4, 403, 0.8),
    st([chair(-80, -4, 150), chair(-80, -4, 300), chair(80, -4, 380)], 3.2, 404, 0.75)], 88, 101, 0.3, [deskSil]),
];

// ---------------------------------------------------------------- the washes
const sun: P = glass[2];
const washes: Wash[] = [
  // through the window, the dusk sky itself: gold low, rose above
  { pts: glass, color: GLOW, alpha: 0.5, seed: 500, pool: 0.1, at: [44, 66], from: glass[0] },
  { pts: [glass[1], glass[2], lerpP(glass[2], glass[3], 0.45), lerpP(glass[1], glass[0], 0.45)], color: ROSE, alpha: 0.35, seed: 501, pool: 0.1, at: [46, 68], from: glass[1] },
  // 1. the room, one warm shadow on every surface except the window and the poster
  { pts: room.back, color: SIENNA, alpha: 0.36, seed: 510, pool: 0.4, at: [48, 76], from: sun, ph: 1, hide: [poster] },
  { pts: room.left, color: UMBER, alpha: 0.38, seed: 511, pool: 0.5, at: [48, 74], from: sun, ph: 1, hide: [glass] },
  { pts: room.right, color: SIENNA, alpha: 0.42, seed: 512, pool: 0.5, at: [50, 78], from: sun, ph: 1 },
  { pts: room.floor, color: OCHRE, alpha: 0.46, seed: 513, pool: 0.4, at: [50, 80], from: sun, ph: 1, hide: [lit] },
  { pts: room.ceil, color: UMBER, alpha: 0.42, seed: 514, pool: 0.3, at: [50, 76], from: sun, ph: 1 },
  // 2. deeper shadow everywhere the beam does not pass
  { pts: room.back, color: UMBER, alpha: 0.3, seed: 520, pool: 0.5, at: [58, 82], from: sun, ph: 2, hide: [shaft, poster] },
  { pts: room.left, color: DARK, alpha: 0.26, seed: 521, pool: 0.6, at: [58, 80], from: sun, ph: 2, hide: [shaft] },
  { pts: room.right, color: DARK, alpha: 0.3, seed: 522, pool: 0.6, at: [60, 84], from: sun, ph: 2 },
  { pts: room.floor, color: UMBER, alpha: 0.44, seed: 523, pool: 0.6, at: [60, 86], from: sun, ph: 2, hide: [shaft] },
  { pts: room.ceil, color: DARK, alpha: 0.32, seed: 524, pool: 0.4, at: [58, 82], from: sun, ph: 2 },
  { pts: poster, color: mix(OCHRE, SHADE, 0.4), alpha: 0.3, seed: 525, pool: 0.5, at: [62, 84], ph: 2 },
  // the desk: brown wood, its front turned away from the sun, the sun lying across its top
  { pts: deskTop, color: OCHRE, alpha: 0.2, seed: 530, pool: 0.2, at: [60, 84], from: lit[0], ph: 2, hide: [notebook] },
  ...shades.map((pts, i) => ({ pts, color: UMBER, alpha: 0.68, seed: 531 + i * 7, pool: 0.5, at: [64, 88] as [number, number], ph: 2, hide: [notebook] })),
  { pts: [...deskFront.slice(0, 3), deskFront[3]].map(([x, y]) => [x, Math.min(y, 940)] as P), color: UMBER, alpha: 0.66, seed: 533, pool: 0.7, at: [62, 88], from: [740, 900], ph: 2 },
  { pts: deskFront.map(([x, y]) => [x, Math.min(y, 940)] as P), color: DARK, alpha: 0.55, seed: 536, pool: 0.8, at: [70, 92], from: [740, 900], ph: 3 },
  { pts: notebook, color: SHADE, alpha: 0.22, seed: 534, pool: 0.3, at: [66, 88], ph: 2, hide: [lit] },
  { pts: starOut, color: BRASS, alpha: 0.62, seed: 535, pool: 0.3, at: [68, 88], ph: 2, hide: [notebook] },
  // the chair and the rack, dark wood
  ...rackRails.map((pts, i) => ({ pts, color: UMBER, alpha: 0.6, seed: 542 + i, pool: 0.5, at: [66, 90] as [number, number], ph: 2 })),
  // 3. the darks: the cell, the corners, under things, the doorframe
  { pts: quadZ(CELL.z, CELL.x0, XR, 0, HC), color: DARK, alpha: 0.42, seed: 550, pool: 0.6, at: [70, 94], from: S(400, 400, 1.6), ph: 3, hide: [deskSil] },
  { pts: [...cot.front, ...cot.top.slice(2).reverse()], color: SHADE, alpha: 0.35, seed: 551, at: [72, 94], ph: 3 },
  { pts: [S(XR, 0, 1.4), S(XR, HC, 1.4), S(XR, HC, ZN), S(XR, 0, ZN)], color: DARK, alpha: 0.22, seed: 561, pool: 0.5, at: [74, 94], from: [1600, 900], ph: 3 },
  { pts: [G(XL, ZN), S(XL, HC, ZN), S(XL, HC, 1.05), G(XL, 1.05)], color: DARK, alpha: 0.26, seed: 562, pool: 0.5, at: [74, 94], from: [0, 900], ph: 3 },
  { pts: [S(XR - 40, HC, ZN), S(XR - 40, HC, ZB), S(XR, 0, ZB), S(XR, 0, ZN)], color: DARK, alpha: 0.22, seed: 553, pool: 0.6, at: [72, 94], ph: 3 },
  { pts: blob(...chair(0, 0, 260), 190, 26, 554, 0.25, 14, -0.1), color: DARK, alpha: 0.35, seed: 555, pool: 0.3, at: [76, 96], ph: 3, hide: [deskSil] },
  { pts: [deskFront[1], deskFront[2], [deskFront[2][0], deskFront[2][1] + 26], [deskFront[1][0], deskFront[1][1] + 26]], color: DARK, alpha: 0.35, seed: 556, pool: 0.3, at: [76, 96], ph: 3 }, // under the lip of the top
  { pts: [G(XL, 0.8), G(XL, 1.1), G(XR, 1.1), G(XR, 0.8)], color: DARK, alpha: 0.24, seed: 567, pool: 0.9, at: [76, 96], from: [800, 900], ph: 3 }, // the floor by the door, out of the light
  { pts: jamb, color: DARK, alpha: 0.72, seed: 557, pool: 0.4, at: [74, 96], from: [0, 450], ph: 3 },
  { pts: lintel, color: DARK, alpha: 0.7, seed: 558, pool: 0.4, at: [74, 96], from: [800, 0], ph: 3 },
  // and the beam itself, a little gold in the air
  { pts: shaft, color: GLOW, alpha: 0.2, seed: 560, pool: 0.1, at: [80, 98], from: sun, ph: 3 },
];

// ---------------------------------------------------------------- what moves
// dust motes: each rides a ray of the beam, bobbing a little about its place on it
const motes = (() => { const r = rng(900); return Array.from({ length: 70 }, () => ({ a: r(), b: r(), s: 0.08 + r() * 0.88, k: 1 + Math.floor(r() * 2), ph: r() * 6.28, tw: 1 + Math.floor(r() * 3), sz: 1.3 + r() * r() * 2.8 })); })();
const moteAt = (a: number, b: number, s: number): P => {
  const z = lerp(WIN.z0, WIN.z1, a), h = lerp(WIN.h0, WIN.h1, b), [X1, z1] = ray(XL, h, z, DESK.h);
  return S(lerp(XL, X1, s), lerp(h, DESK.h, s), lerp(z, z1, s));
};
// the rattle: the thud from outside comes at frame 64 of the loop and dies in half a second
const rattle = (t: number) => { const u = t - 64; return u < 0 || u > 16 ? 0 : Math.sin(u * 2.4) * (1 - u / 16) * 3.6; };

export const p03 = page({
  id: "p03", title: "Le Bureau", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 14, seed: 990, at: 99, box: [60, 640, 1540, 890] },
  animAt: [60, 96],
  anim: (g, t, reveal) => {
    const T = (t / LOOP) * Math.PI * 2, j = rattle(t);
    const pen = (pts: P[], w: number, seed: number, op = 0.9, progress = reveal) => g.pen(pts, { w, color: INK, seed, wobble: 0.5, boil: 0.3, taper: 1, opacity: op, retrace: false, progress });
    // the chair on its back: wash-dark members, far side first, then the seat, then the near side
    masked(g, [deskSil], () => {
      g.group("paint", () => {
        [...chairFar, ...chairRails].forEach((m) => fillShape(g, m.poly, UMBER, 0.8 * reveal));
        fillShape(g, chairSeat, UMBER, 0.6 * reveal);
        chairNear.forEach((m) => fillShape(g, m.poly, DARK, 0.85 * reveal));
      });
      g.group("plain", () => {
        [...chairFar, ...chairRails].forEach((m, i) => m.e.forEach((e, k) => g.pen(e, { w: 0.9, color: INK, seed: 640 + i * 2 + k, wobble: 0.4, boil: 0, taper: 1, opacity: 0.6, retrace: false, progress: reveal })));
        chairSeat.forEach((q, i) => g.pen([q, chairSeat[(i + 1) % 4]], { w: 1.4, color: INK, seed: 660 + i, wobble: 0.4, boil: 0, taper: 1, opacity: 0.85, retrace: false, progress: reveal }));
        chairNear.forEach((m, i) => m.e.forEach((e, k) => g.pen(e, { w: k ? 1.8 : 1.1, color: INK, seed: 670 + i * 2 + k, wobble: 0.4, boil: 0, taper: 1, opacity: 0.95, retrace: false, progress: reveal })));
      });
    });
    // the star's facets turned from the sun: too fine for a wet wash, so laid in crisp
    masked(g, [notebook], () => g.group("paint", () => facets.forEach((f) => fillShape(g, f, mix(SIENNA, UMBER, 0.6), 0.6 * reveal))));
    // the window's muntins and the shadow they throw on the desk, shaken together by the thud
    g.group("plain", () => {
      const mz = (WIN.z0 + WIN.z1) / 2, mh = (WIN.h0 + WIN.h1) / 2, off = (p: P, k = 1): P => [p[0] + j * k, p[1] - j * 0.4 * k];
      pen([off(S(XL, WIN.h0, mz)), off(S(XL, WIN.h1, mz))], 2.2, 600, 0.95); pen([off(S(XL, mh, WIN.z0)), off(S(XL, mh, WIN.z1))], 2, 601, 0.95);
      [[0.3, 0.6], [0.7, 0.2]].forEach(([a, b], i) => { const p = S(XL, lerp(WIN.h0, WIN.h1, b), lerp(WIN.z0, WIN.z1, a)); pen([off(p, 1.5), off([p[0] + 16, p[1] - 30], 1.5)], 0.8, 602 + i, 0.5); });
      clipped(g, lit, () => {
        const [a0, z0] = ray(XL, WIN.h0, mz, DESK.h), [a1, z1] = ray(XL, WIN.h1, mz, DESK.h), [b0, zb0] = ray(XL, mh, WIN.z0, DESK.h), [, zb1] = ray(XL, mh, WIN.z1, DESK.h);
        fillShape(g, [onDesk(a0, z0 - 0.004), onDesk(a1, z1 - 0.004), onDesk(a1, z1 + 0.004), onDesk(a0, z0 + 0.004)].map((p) => off(p, 2.5)), UMBER, 0.42 * reveal);
        fillShape(g, [onDesk(b0 - 10, zb0), onDesk(b0 + 10, zb0), onDesk(b0 + 10, zb1), onDesk(b0 - 10, zb1)].map((p) => off(p, 2.5)), UMBER, 0.42 * reveal);
      });
    });
    // the torn curtain at the near side of the window, the wind lifting it into the room
    g.group("plain", () => {
      const N = 9, top = 730, z0 = 1.09, z1 = 1.26, r = rng(610);
      const hang = (v: number, zz: number, cut: number): P => { const h = top - v * (top - cut), sw = v * v * (70 + 38 * Math.sin(T + zz * 9) + 18 * Math.sin(T * 3 + v * 4)); return S(XL + 8 + sw, h, zz - v * v * 0.04 * (1 + Math.sin(T * 2))); };
      const cuts = Array.from({ length: N + 1 }, (_, i) => 360 + r() * 90 + (i === 6 ? -110 : 0));
      const rows = (v: number) => Array.from({ length: N + 1 }, (_, i) => hang(v, lerp(z0, z1, i / N), cuts[i]));
      const bottom = rows(1).map((p, i) => [p[0], p[1] + (i % 2 ? -6 : 4)] as P), topRow = rows(0);
      const cloth = [...topRow, ...[...bottom].reverse()];
      fillShape(g, cloth, "#f0dfbb", 0.72 * reveal); fillShape(g, cloth, UMBER, 0.1 * reveal);
      pen([...topRow.slice(0, 1), rows(0.5)[0], bottom[0]], 1.6, 620, 0.85); pen([topRow[N], rows(0.5)[N], bottom[N]], 1.4, 621, 0.8); pen(bottom, 1, 622, 0.75);
      [0.3, 0.55, 0.8].forEach((u, i) => { const k = Math.round(u * N); pen([topRow[k], rows(0.35)[k], rows(0.7)[k], lerpP(rows(0.7)[k], bottom[k], 0.7)], 0.8, 623 + i, 0.5); });
      pen([S(XL, top + 6, 1.06), S(XL, top + 6, 1.55)], 2.2, 628, 0.95); // the rod
    });
    // the star's glint, on the point turned to the sun
    const tip = starPt(GLINT, STAR.R + 2), pulse = 0.5 - 0.5 * Math.cos(T * 2), a = 0.15 + 0.85 * pulse * pulse;
    g.group("plain", () => g.glow(tip[0], tip[1], 26 + 10 * pulse, "#fff1c4", 0.7 * a * reveal), { blend: "screen" });
    g.group("plain", () => {
      const L = 10 + 16 * pulse, w = 1.6 + pulse, sp = 0.2 * Math.sin(T);
      const ray4 = Array.from({ length: 8 }, (_, i) => { const ang = sp + (i * Math.PI) / 4, rr = i % 2 ? w : L * (i % 4 ? 0.62 : 1); return [tip[0] + Math.cos(ang) * rr, tip[1] + Math.sin(ang) * rr] as P; });
      fillShape(g, ray4, "#fffaeb", 0.95 * a * reveal);
    });
    if (reveal < 1) return;
    // dust in the beam: a slow drift along the ray, a bob across it, a twinkle as each mote turns
    g.group("plain", () => motes.forEach((m, i) => {
      const s = m.s + 0.05 * Math.sin(T * m.k + m.ph), a2 = m.a + 0.05 * Math.sin(T * m.k + m.ph * 2), b = m.b + 0.07 * Math.sin(T * (m.k + 1) + m.ph) + (j ? 0.01 * j : 0);
      const [x, y] = moteAt(a2, b, s), tw = Math.max(0, Math.sin(T * m.tw + m.ph * 3));
      fillShape(g, blob(x, y, m.sz, m.sz, 700 + i, 0.1, 6), "#fffaf0", 0.25 + 0.65 * tw);
    }));
  },
});
