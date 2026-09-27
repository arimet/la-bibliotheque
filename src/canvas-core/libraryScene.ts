import { fractal, oval, rng, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { blob, clamp, inside, profile } from "./gallery";
import { G, width } from "./drafting";
import { W, H, F, PAINT, JOURNEY, TABLE, SLOTS, EYE as EYE_Y, FAR, RINGS, TABLE_CARD, camAt, project, type Card, type Cam } from "./longroom";

// THE LONG ROOM'S SCENE, once for every style that paints it: the reading table seen from the
// reader's chair (the top, the lamp, the four books, their faces, plates and gilt titles), one bay
// of the nave as a portal and what the eye meets through each point of it, the busts and the
// ladder, the far window, where the light falls, and the room itself: the cards set at their
// depths, the lit air between them, the camera's journey and the live table. A style supplies only
// its paint: one painting per card (`Art`), the colour of the air, its canvas, its lamp's tint.

// ---------------------------------------------------------------- the seated eye
// Y up from the table top, Z away from the reader along the table, X across; metres.
const EYE = 0.45, TILT = (33 * Math.PI) / 180, FOC = 900, CT = Math.cos(TILT), ST = Math.sin(TILT);
export const proj = (X: number, Y: number, Z: number): P => { const dy = Y - EYE, zc = -dy * ST + Z * CT, yc = dy * CT + Z * ST; return [W / 2 + (FOC * X) / zc, H / 2 - (FOC * yc) / zc]; };
// the point of the plane at height Y seen at screen (x, y)
export const unproj = (x: number, y: number, Y: number): [number, number] => { const a = (x - W / 2) / FOC, b = -(y - H / 2) / FOC, s = (Y - EYE) / (b * CT - ST); return [s * a, s * (b * ST + CT)]; };
export const hull = (pts: P[]): P[] => {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o: P, a: P, b: P) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: P[] = [], up: P[] = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of [...p].reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
};
export const lerp2 = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const shift = (pts: P[], dx: number, dy: number): P[] => pts.map(([x, y]) => [x + dx, y + dy] as P);
export const PILASTERS = [120, 520, 900, 1290];                   // the bays' pilasters behind the table, in the drawing and the shelves

// ---------------------------------------------------------------- the table and the lamp
const T_HALF = 0.78, T_NEAR = 0.3, T_FAR = 1.46, T_EDGE = 0.045;
export const TOP: P[] = [proj(-T_HALF, 0, T_NEAR), proj(-T_HALF, 0, T_FAR), proj(T_HALF, 0, T_FAR), proj(T_HALF, 0, T_NEAR)];
export const EDGE: P[] = [proj(-T_HALF, 0, T_NEAR), proj(T_HALF, 0, T_NEAR), proj(T_HALF, -T_EDGE, T_NEAR - 0.012), proj(-T_HALF, -T_EDGE, T_NEAR - 0.012)];
const VP = proj(0, 0, 1e6);                                        // where the grain runs to
export const grain = (x: number, y: number) => Math.atan2(VP[1] - y, VP[0] - x);
// a brass student's oil lamp: a body of revolution, [height above the foot, radius] in px, drawn upright
export const LAMP_AT = proj(-0.7, 0, 1.2), LS = 1.15;
const LAMP_PROF: [number, number][] = [[0, 46], [7, 48], [12, 42], [16, 26], [22, 13], [30, 7.5], [74, 7.5], [78, 11], [83, 7.5], [92, 9], [97, 21], [110, 31], [124, 31], [136, 22], [140, 12], [150, 12], [153, 18], [159, 19], [176, 18], [189, 10], [212, 9]];
export const lampR = (h: number) => profile(LAMP_PROF)(h / LS) * LS, LAMP_TOP = 212 * LS, CHIM0 = 151 * LS, FLAME: P = [LAMP_AT[0], LAMP_AT[1] - 166 * LS];
const lampOpen = (h: number) => 0.33 - (0.2 * h) / LAMP_TOP;      // a horizontal circle opens less the nearer it is to eye level
export const LAMP: P[] = (() => {
  const R: P[] = [], L: P[] = [], [x, y] = LAMP_AT;
  for (let h = 12; h <= LAMP_TOP; h += 5) { R.push([x + lampR(h), y - h]); L.push([x - lampR(h), y - h]); }
  const foot: P[] = Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI; return [x + Math.cos(a) * 48 * LS, y - 7 + Math.sin(a) * 48 * LS * lampOpen(0)] as P; });
  return [...foot, ...L, ...R.reverse()];
})();
export const inChimney = (x: number, y: number) => LAMP_AT[1] - y > CHIM0 && Math.abs(x - LAMP_AT[0]) < lampR(LAMP_AT[1] - y);
export const LA = (dx: number, h: number): P => [LAMP_AT[0] + dx * LS, LAMP_AT[1] - h * LS];   // a point of the lamp: across its axis, up from its foot
export const chim = (h0: number, h1: number, nx: number): P[] => [h0, (h0 + h1) / 2, h1].map((h) => [LAMP_AT[0] + nx * lampR(h), LAMP_AT[1] - h] as P);   // down the chimney glass from h0 to h1, at nx of its radius
export const edgeAt = (s: number, h: number) => lerp2(lerp2(EDGE[0], EDGE[1], s), lerp2(EDGE[3], EDGE[2], s), h);   // the table's near edge: s along it, h down its lip

// ---------------------------------------------------------------- the books
// Four closed books lie on the oak in a loose fan that turns toward the reader; each style gives them their leather
export type Book = { id: string; lines: string[]; w: number; d: number; t: number; yaw: number; light: number; seed: number; cx: number; cz: number };
export const BOOKS: Book[] = [
  { id: "dust-creek", lines: ["DUST CREEK"], w: 0.226, d: 0.3, t: 0.036, yaw: 0.15, light: 1.02, seed: 1 },
  { id: "corbenic", lines: ["CORBENIC"], w: 0.216, d: 0.308, t: 0.044, yaw: 0.05, light: 1.08, seed: 2 },
  { id: "canicule", lines: ["CANICULE"], w: 0.22, d: 0.29, t: 0.03, yaw: -0.06, light: 0.98, seed: 3 },
  { id: "grands-bois", lines: ["LES GRANDS", "BOIS"], w: 0.228, d: 0.296, t: 0.04, yaw: -0.16, light: 1.14, seed: 4 },
].map((b, i) => { const [cx, cz] = unproj(SLOTS[i][0], SLOTS[i][1], b.t); return { ...b, cx, cz }; });
export const PLATES: Record<string, string> = Object.fromEntries(BOOKS.map((b) => [b.id, `www/covers/${b.id}-plate.jpg`]));   // each book's first picture, set into its cover
// u across the board from the spine (0) to the fore-edge (1), v from the head (0, far) to the tail (1, near), h up the thickness
export const bw = (b: Book, u: number, v: number): [number, number] => { const a = (u - 0.5) * b.w, c = (0.5 - v) * b.d, co = Math.cos(b.yaw), si = Math.sin(b.yaw); return [b.cx + a * co - c * si, b.cz + a * si + c * co]; };
export const bp = (b: Book, u: number, v: number, h = 1): P => { const [X, Z] = bw(b, u, v); return proj(X, h * b.t, Z); };
export const uvOf = (b: Book, x: number, y: number): P => { const [X, Z] = unproj(x, y, b.t), dx = X - b.cx, dz = Z - b.cz, co = Math.cos(b.yaw), si = Math.sin(b.yaw); return [(dx * co + dz * si) / b.w + 0.5, 0.5 - (-dx * si + dz * co) / b.d]; };
export const quad = (b: Book, u0: number, v0: number, u1: number, v1: number, h = 1): P[] => [bp(b, u0, v0, h), bp(b, u1, v0, h), bp(b, u1, v1, h), bp(b, u0, v1, h)];
export const cover = (b: Book) => quad(b, 0, 0, 1, 1);
export const onBook = (b: Book, pts: P[]): P[] => pts.map(([u, v]) => bp(b, u, v));
// the faces round the board: the tail (toward the reader) and whichever side turns to the eye;
// each as [top edge start, top edge end, bottom end, bottom start]
export type Face = { pts: P[]; kind: "tail" | "fore" | "spine" };
const sees = (b: Book, u: 0 | 1) => { const [X, Z] = bw(b, u, 0.5), s = u ? 1 : -1; return s * (-X * Math.cos(b.yaw) - Z * Math.sin(b.yaw)) > 0; };
export const faces = (b: Book): Face[] => [
  { kind: "tail", pts: [bp(b, 0, 1, 1), bp(b, 1, 1, 1), bp(b, 1, 1, 0), bp(b, 0, 1, 0)] },
  ...([0, 1] as const).filter((u) => sees(b, u)).map((u): Face => ({ kind: u ? "fore" : "spine", pts: [bp(b, u, 0, 1), bp(b, u, 1, 1), bp(b, u, 1, 0), bp(b, u, 0, 0)] })),
];
export const faceAt = (f: P[], s: number, h: number): P => lerp2(lerp2(f[0], f[1], s), lerp2(f[3], f[2], s), h);
const silhouette = (b: Book) => hull([...cover(b), bp(b, 0, 1, 0), bp(b, 1, 1, 0), bp(b, 0, 0, 0), bp(b, 1, 0, 0)]);
export const SPINE = 0.1;
// the plate: 16:9, 70 % of the board's width, a little below the title
export const plateBox = (b: Book) => { const pw = 0.7, ph = (pw * b.w * 9) / 16 / b.d, u0 = SPINE + (1 - SPINE - pw) / 2, v0 = 0.4; return [u0, v0, u0 + pw, v0 + ph] as const; };
// the plate's four edges in (u, v), each [start, end, a step outward off the picture]: where the leather is dragged over it
export const plateEdges = (b: Book): [P, P, P][] => { const bx = plateBox(b); return [[[bx[0], bx[1]], [bx[2], bx[1]], [0, -0.007]], [[bx[2], bx[1]], [bx[2], bx[3]], [0.006, 0]], [[bx[2], bx[3]], [bx[0], bx[3]], [0, 0.007]], [[bx[0], bx[3]], [bx[0], bx[1]], [-0.006, 0]]]; };
export const labelBox = (b: Book) => [SPINE + 0.09, 0.075, 0.95, b.lines.length > 1 ? 0.33 : 0.29] as const;
export const BANDS = [0.19, 0.39, 0.59, 0.79];
export const inBox = (u: number, v: number, bx: readonly number[], pad = 0) => u > bx[0] - pad && u < bx[2] + pad && v > bx[1] - pad && v < bx[3] + pad;
export const rule = (b: Book, bx: readonly number[]): P[][] => { const [u0, v0, u1, v1] = bx; return [[[u0, v0], [u1, v0]], [[u1, v0], [u1, v1]], [[u1, v1], [u0, v1]], [[u0, v1], [u0, v0]]].map((l) => onBook(b, l as P[])); };
// the book's cast shadow on the oak: its footprint swept along the window light
const shadowOf = (b: Book): P[] => {
  const pts: P[] = [], k = b.t * 1.3;
  for (const [u, v] of [[0, 0], [1, 0], [1, 1], [0, 1]] as P[]) { const [X, Z] = bw(b, u, v); pts.push(proj(X, 0, Z), proj(X + 0.9 * k, 0, Z - 0.42 * k)); }
  return hull(pts);
};
export const SHADOWS = BOOKS.map(shadowOf);
export const LAMP_SHADOW: P[] = (() => { const [x, y] = LAMP_AT; return [[x + 10, y - 14], [x + 230, y + 22], [x + 236, y + 40], [x + 36, y + 14]]; })();
export const HOLES = [...BOOKS.map(silhouette), LAMP];
export const along = (b: Book) => (x: number, y: number) => { const [u, v] = uvOf(b, x, y), a = bp(b, u, v), c = bp(b, u + 0.05, v); return Math.atan2(c[1] - a[1], c[0] - a[0]); };   // across the board, spine to fore-edge

// ---------------------------------------------------------------- where the light falls on the table
export const pool = (x: number, y: number) => Math.exp(-(((x - 400) / 450) ** 2) - (((y - 320) / 230) ** 2));   // the lamp's warm pool on the oak
export const sheen = (x: number, y: number) => Math.exp(-(((x - 800) / 340) ** 2) - (((y - 250) / 38) ** 2));   // the high windows, mirrored far down the polished top
export const flameGlow = (x: number, y: number) => Math.exp(-((x - FLAME[0]) ** 2 + ((y - FLAME[1]) * 1.2) ** 2) / (2 * 170 ** 2));
// how much of the light the oak keeps under a cast shadow (1: none), deepest near the book that throws it
export const shadowK = (x: number, y: number) => { for (let i = 0; i < SHADOWS.length; i++) if (inside(SHADOWS[i], x, y)) { const [u] = uvOf(BOOKS[i], x, y); return 0.4 + 0.3 * clamp((u - 1) * 2.2); } return inside(LAMP_SHADOW, x, y) ? 0.62 : 1; };
// the brass: a body of revolution lit from the window on its left, the lamp's own flame caught on the round of the font
const brassAcross = profile([[-1, 0.3], [-0.8, 0.62], [-0.55, 0.88], [-0.38, 0.6], [-0.15, 0.36], [0.1, 0.18], [0.45, 0.1], [0.78, 0.24], [1, 0.12]]);
export const brassI = (x: number, y: number) => { const h = LAMP_AT[1] - y, r = Math.max(4, lampR(h)), nx = clamp((x - LAMP_AT[0]) / r, -1, 1); return brassAcross(nx) + (h > 100 * LS && h < 140 * LS ? 0.14 * (1 - Math.abs(nx)) : 0); };
// leather: the window from the left, its soft sheen on the upper left of the board, rubbed lighter
// along the edges and corners; the spine a round back lit on its left (the lamp is the style's to add)
const SPINE_ACROSS = profile([[0, 0.36], [0.22, 0.62], [0.5, 0.54], [0.78, 0.32], [0.9, 0.14], [1, 0.22], [1.12, 0.42]]);
export const boardLight = (u: number, v: number) => {
  let I = u < SPINE * 1.12 ? SPINE_ACROSS(u / SPINE) : 0.42 + 0.1 * (0.5 - u) + 0.05 * (0.5 - v) + 0.15 * Math.exp(-(((u - 0.34) / 0.3) ** 2) - (((v - 0.28) / 0.34) ** 2));
  const e = Math.min(Math.abs(u - SPINE * 1.12), 1 - u, v, 1 - v); if (e < 0.035) I += 0.07 * (1 - e / 0.035);
  return I;
};

// ---------------------------------------------------------------- gilt lettering
// the draftsman's single-stroke capitals, set upright and a little condensed, as polylines in (u, v) of the board
const CONDENSE = 0.8, TRACK = 1.1;
const glyphs = (text: string, cap: number): P[][] => {
  const s = cap / 6, out: P[][] = []; let x = 0;
  for (const ch of text) { const gl = G[ch] ?? G["-"]; (gl.l ?? []).forEach((l) => { for (let q = 1; q < l.length; q++) out.push([l[q - 1], l[q]].map(([px, py]) => [x + px * s * CONDENSE, py * s] as P)); }); (gl.c ?? []).forEach((l) => { const pts = l.map(([px, py]) => [x + px * s * CONDENSE, py * s] as P), n = pts.length, closed = Math.hypot(l[0][0] - l[n - 1][0], l[0][1] - l[n - 1][1]) < 0.05; if (!closed) return out.push(pts); const h = Math.floor(n / 2); out.push(pts.slice(0, h + 2), [...pts.slice(h - 1), pts[1], pts[2]]); }); x += ((gl.w ?? 4) * CONDENSE + TRACK) * s; }
  return out;
};
const textW = (text: string, cap: number) => width(text, cap, TRACK / CONDENSE) * CONDENSE;
export const titleLines = (b: Book): { pts: P[][]; cap: number }[] => {
  const lb = labelBox(b), room = (lb[2] - lb[0] - 0.12) * b.w, cap = Math.min(0.027, ...b.lines.map((l) => room / textW(l, 1))), gap = cap * 1.55;
  const h0 = ((lb[1] + lb[3]) / 2) * b.d - ((b.lines.length - 1) * gap + cap) / 2, uc = (lb[0] + lb[2]) / 2;
  return b.lines.map((l, i) => { const w = textW(l, cap); return { cap, pts: glyphs(l, cap).map((pl) => pl.map(([x, y]) => [uc + (x - w / 2) / b.w, (h0 + i * gap + y) / b.d] as P)) }; });
};

// ---------------------------------------------------------------- the plates
export type Img = CanvasImageSource & { width: number; height: number };
// a big picture drawn small through a transform is sampled, not filtered: halve it first, as a mip chain would
const mip = (env: Env, name: string, img: Img, target: number): Img => {
  const key = `library:mip:${name}:${env.scale}`; let src = env.cache.get(key) as Img | undefined; if (src) return src;
  src = img; while (src.width > target * 2) { const l = env.canvas(Math.ceil(src.width / 2), Math.ceil(src.height / 2)); l.ctx.imageSmoothingEnabled = true; l.ctx.imageSmoothingQuality = "high"; l.ctx.drawImage(src, 0, 0, l.canvas.width, l.canvas.height); src = l.canvas; }
  env.cache.set(key, src); return src;
};
// the plate laid into the board in thin bands (`frac` of them so far), each an affine patch of the
// perspective, in c's current transform; `bare` fills the frame when the picture is missing, and
// `glaze` goes over it inside the frame
export const setPlate = (c: Ctx, env: Env, b: Book, frac: number, bare: string, glaze: (c: Ctx, q: P[]) => void) => {
  const full = env.image?.(b.id) as Img | undefined, [u0, v0, u1, v1] = plateBox(b), n = 24, q = quad(b, u0, v0, u1, v1);
  c.save(); c.beginPath(); q.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
  if (!full) { c.fillStyle = bare; c.fill(); c.restore(); return; }
  const img = mip(env, b.id, full, Math.hypot(q[1][0] - q[0][0], q[1][1] - q[0][1]) * env.scale); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = "high";
  for (let i = 0; i < Math.ceil(n * frac); i++) {
    const va = v0 + ((v1 - v0) * i) / n, vb = v0 + ((v1 - v0) * (i + 1)) / n, p0 = bp(b, u0, va), p1 = bp(b, u1, va), p2 = bp(b, u0, vb), sh = img.height / n, rows = Math.min(sh + 2, img.height - sh * i);
    c.save(); c.transform((p1[0] - p0[0]) / img.width, (p1[1] - p0[1]) / img.width, (p2[0] - p0[0]) / sh, (p2[1] - p0[1]) / sh, p0[0], p0[1]);
    c.drawImage(img, 0, sh * i, img.width, rows, 0, 0, img.width, rows); c.restore();
  }
  glaze(c, q); c.restore();
};

// ---------------------------------------------------------------- cutting a card to its shapes
// a card keeps only its own shapes: what lies outside `keep` is cut away, then what lies inside `holes`
// (each costs the area it covers, so a card that keeps nearly everything only cuts its holes)
export const cut = (c: Ctx, env: Env, keep: P[][] | null, holes: P[][] = []) => {
  const k = env.scale, lay = (op: GlobalCompositeOperation, ps: P[][]) => { c.globalCompositeOperation = op; c.beginPath(); ps.forEach((p) => { c.moveTo(p[0][0], p[0][1]); p.forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); }); c.fill("nonzero"); };
  c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.fillStyle = "#000"; if (keep) lay("destination-in", keep); if (holes.length) lay("destination-out", holes); c.restore();
};
export const LAST = PAINT - 2;   // every card has painted itself two frames before the journey sets off

// ---------------------------------------------------------------- a bay of the Long Room
// A RING is one bay seen from the nave's axis, as a portal. Its own plane holds the stack faces and
// their pilasters, the rib of the vault, and a bust on its pedestal before each pilaster. What runs
// down the nave (the floor, the gallery's fascia and rail, the cornice, the barrel of the vault) is
// laid as its run toward the eye, along the rays from the vanishing point: the ring nearer the eye
// covers the run where its own begins, so the runs join up bay after bay, like a toy theatre's
// wings. Metres in the ring's plane (x across, y up), card px on the canvas.
export const RC = RINGS[0], RP = F / RINGS[RINGS.length - 1].z;   // px per metre: the nearest ring is 1:1 in the start view
export const RW = Math.round(RC.w * RP), RH = Math.round(RC.h * RP), RTOP = RC.y + RC.h / 2;
export const m = (x: number, y: number): P => [(x + RC.w / 2) * RP, (RTOP - y) * RP], ms = (pts: P[]) => pts.map(([x, y]) => m(x, y));
export const mOf = (px: number, py: number): P => [px / RP - RC.w / 2, RTOP - py / RP];
export const A0 = 2.1, A1 = 2.3, LOW = 4, FASC = 4.35, RAIL = 5.3, CORN0 = 8.6, CORN1 = 8.95, ARY = 2.05, OUT = 6.6, RUN = 3.4;   // the aisle's half-width below and above the rail, the storeys, the vault's rise
export const F0: P = [A0, 0], G0: P = [A0, LOW], G1: P = [A0, FASC], RT: P = [A0, RAIL], C0: P = [A1, CORN0], C1: P = [A1, CORN1];   // where the runs leave the plane (right side)
export const toward = (p: P, t: number): P => [p[0] * t, EYE_Y + (p[1] - EYE_Y) * t];   // a point of the run from p: t = 1 in the plane, larger nearer the eye
export const runY = (p: P, ax: number) => EYE_Y + ((p[1] - EYE_Y) * ax) / p[0];        // the run's height where it passes |x| = ax
export const archY = (ax: number) => CORN1 + ARY * Math.sqrt(Math.max(0, 1 - (ax / A1) ** 2));
export const ARCH: P[] = Array.from({ length: 25 }, (_, i) => { const a = Math.PI * (1 - i / 24); return [A1 * Math.cos(a), CORN1 + ARY * Math.sin(a)] as P; });   // left springing, over the crown, to the right
export const RVP = m(0, EYE_Y), radial = (x: number, y: number) => Math.atan2(y - RVP[1], x - RVP[0]);
export type Zone = "floor" | "alcove" | "lower" | "pilaster" | "soffit" | "fascia" | "balustrade" | "upper" | "upilaster" | "usoffit" | "cornice" | "vault";
// what the eye meets through a point of the plane: follow the ray from the eye and take the first surface it reaches
export const zoneAt = (x: number, y: number): Zone | null => {
  const ax = Math.abs(x);
  if (ax < A1 && y > archY(ax)) return "vault";
  if (ax < A0) return y < 0 ? "floor" : null;
  const h0 = EYE_Y + ((y - EYE_Y) * A0) / ax;                                    // where the ray crosses the aisle's edge
  if (h0 < 0) return "floor";
  if (h0 < LOW) return y < 0 ? "alcove" : y < LOW ? (ax < 2.55 ? "pilaster" : "lower") : "soffit";
  if (h0 < FASC) return "fascia";
  if (h0 < RAIL) return "balustrade";
  if (ax < A1) return null;
  const h1 = EYE_Y + ((y - EYE_Y) * A1) / ax;                                    // over the rail: where it crosses the upper storey's edge
  if (h1 < CORN0) return y < CORN0 ? (ax < 2.7 ? "upilaster" : "upper") : "usoffit";
  return h1 < CORN1 ? "cornice" : "vault";
};
const mir = (pts: P[]): P[][] => [pts, pts.map(([x, y]) => [-x, y] as P)];
const wedge = (a: P, b: P): P[] => [a, toward(a, RUN), toward(b, RUN), b];
const xRT = (A0 * (CORN0 - EYE_Y)) / (RAIL - EYE_Y);                                // where the rail's run passes the top of the upper stacks
const RZ: Record<Zone, P[][]> = {
  floor: [[[-OUT, runY(F0, OUT)], [-A0, 0], [A0, 0], [OUT, runY(F0, OUT)], [OUT, -3], [-OUT, -3]]],
  alcove: mir([F0, [OUT, 0], [OUT, runY(F0, OUT)]]), lower: mir([[2.55, 0], [OUT, 0], [OUT, LOW], [2.55, LOW]]), pilaster: mir([F0, [2.55, 0], [2.55, LOW], G0]),
  soffit: mir([G0, [OUT, LOW], [OUT, runY(G0, OUT)]]), fascia: mir(wedge(G0, G1)), balustrade: mir(wedge(G1, RT)),
  upper: mir([[2.7, runY(RT, 2.7)], [xRT, CORN0], [2.7, CORN0]]), upilaster: mir([[A1, runY(RT, A1)], [2.7, runY(RT, 2.7)], [2.7, CORN0], C0]),
  usoffit: mir([C0, [xRT, CORN0], toward(RT, RUN), toward(C0, RUN)]), cornice: mir(wedge(C0, C1)),
  vault: [[toward([-A1, CORN1], RUN), [-A1, CORN1], ...ARCH, C1, toward(C1, RUN)]],
};
export const RZP = (z: Zone) => RZ[z].map(ms);
// the vault is only ever seen a little way past its rib, before the next ring's rib takes over
export const VAULT_SEEN = ms([...ARCH, ...[...ARCH].reverse().map((p) => toward(p, 1.28))]);
const OPEN: P[] = [[-A0, 0], [A0, 0], [A0, RAIL], [A1, RAIL], ...[...ARCH].reverse(), [-A1, RAIL], [-A0, RAIL]];
export const RING_HOLE = [ms(OPEN)];
// the light: tall windows in the side walls above the gallery, so the upper storey and the stacks on
// the right (facing the left-hand windows across the nave) take more of it
export const rLit = (x: number, y: number) => 0.9 + 0.16 * Math.tanh(x * 0.7) + 0.1 * clamp((y - 3) / 6) + (fractal(41, x, y, 0.7, 0.7, 2) - 0.5) * 0.24;
export const upright = (z: Zone | null) => z === "lower" || z === "pilaster" || z === "upper" || z === "upilaster";
// only what an eye in the nave can ever meet: the nearest ring shows no more than the screen, a
// farther one no more than the next ring's opening lets through (the rest keeps its ground)
export const seen = (x: number, y: number) => { const ax = Math.abs(x); return y > -2.1 && y < RTOP + 0.3 && (ax < 2.8 || (ax < 3.2 && y < 9.2) || (ax < 3.8 && y < 6.8) || (ax < 5 && y < 4)); };
export const sd = (s: number, p: P): P => [s * p[0], p[1]];

// the busts: marble heads on oak pedestals, one before each pilaster, looking into the aisle
export type Head = "sage" | "wig" | "curls" | "bun";
const HEADS: Head[][] = [["sage", "wig"], ["curls", "bun"]];                  // ringA's left and right, ringB's
export type Bust = { x: number; f: number; head: Head; hx: number; hy: number; ped: P[][]; chest: P[]; face: P[]; back: P[][]; front: P[][] };   // hair behind the face, and in front of it
const bustOf = (s: number, head: Head): Bust => {
  const x = s * 2.36, f = -s, hx = x + 0.014 * f, hy = 2.04;
  const ped: P[][] = [[[x - 0.25, 0], [x + 0.25, 0], [x + 0.24, 0.15], [x - 0.24, 0.15]], [[x - 0.19, 0.15], [x + 0.19, 0.15], [x + 0.19, 1.3], [x - 0.19, 1.3]], [[x - 0.26, 1.3], [x + 0.26, 1.3], [x + 0.245, 1.42], [x - 0.245, 1.42]]];
  const chest: P[] = [[x - 0.08, 1.42], [x + 0.08, 1.42], [x + 0.1, 1.48], [x + 0.28, 1.52], [x + 0.31, 1.62], [x + 0.26, 1.72], [x + 0.13, 1.79], [x + 0.07, 1.9], [x - 0.07, 1.9], [x - 0.13, 1.79], [x - 0.26, 1.72], [x - 0.31, 1.62], [x - 0.28, 1.52], [x - 0.1, 1.48]];
  const [back, front]: P[][][] = head === "wig" ? [[oval(hx - 0.02 * f, hy + 0.035, 0.15, 0.155, 18, 0), oval(hx - 0.115, hy - 0.08, 0.055, 0.12, 12, 0), oval(hx + 0.115, hy - 0.08, 0.055, 0.12, 12, 0)], [oval(hx - 0.005 * f, hy + 0.105, 0.1, 0.045, 14, 0)]]
    : head === "sage" ? [[], [oval(hx + 0.012 * f, hy - 0.088, 0.085, 0.075, 14, 0)]]
    : head === "curls" ? [[blob(hx - 0.01 * f, hy + 0.03, 0.122, 0.15, 5, 0.12, 16)], [blob(hx, hy + 0.1, 0.095, 0.05, 6, 0.2, 12)]]
    : [[oval(hx - 0.012 * f, hy + 0.035, 0.105, 0.12, 16, 0), oval(hx - 0.1 * f, hy + 0.07, 0.055, 0.055, 12, 0)], [oval(hx, hy + 0.105, 0.09, 0.035, 12, 0)]];
  return { x, f, head, hx, hy, ped, chest, face: oval(hx, hy, 0.095, 0.13, 16, 0), back, front };
};
export const BUSTS: Bust[][] = HEADS.map(([l, r]) => [bustOf(-1, l), bustOf(1, r)]);
export const marbleOf = (b: Bust) => [b.chest, ...b.back, b.face, ...b.front];
// marble lit from the upper left: the head a ball, the chest a drum
export const marbleI = (b: Bust, x: number, y: number) => { const hd = y > 1.9, nx = hd ? (x - b.hx) / 0.13 : (x - b.x) / 0.3, ny = hd ? (y - b.hy - 0.02) / 0.16 : (y - 1.64) / 0.22; return clamp(0.56 - 0.46 * nx + 0.2 * ny - 0.12 * (nx * nx + ny * ny) + (fractal(61, x, y, 9, 9, 2) - 0.5) * 0.06); };
// the ladder leant on one stack face (ringA's on the right, ringB's on the left): its two rails' x at height y
export const ladderSide = (v: number) => (v ? -1 : 1);
export const ladderX = (v: number): [(y: number) => number, (y: number) => number] => { const ls = ladderSide(v); return [(y) => ls * (3.02 + 0.012 * y), (y) => ls * (3.44 - 0.012 * y)]; };
// the busts and the ladder of a ring variant, on a small card of their own at the ring's depth: the
// bay itself is painted once and both variants share it. One per side: the bust, and the ladder where it leans
export const ov = (s: number) => ({ x: s * 2.9, y: 2.05, w: 1.8, h: 4.3 }), OW = Math.round(1.8 * RP), OH = Math.round(4.3 * RP);
export const ovAt = (s: number): P => { const q = ov(s); return [(q.x - q.w / 2 + RC.w / 2) * RP, (RTOP - q.y - q.h / 2) * RP]; };   // the overlay's corner, in ring px
// what an overlay keeps: the pedestals, the marble, and the ladder's rails and rungs a little inside their strokes
const ladderShape = (v: number): P[][] => {
  const [x0, x1] = ladderX(v), q = (a: P, b: P, h: number): P[] => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = (-dy / l) * h, ny = (dx / l) * h; return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; };
  return [...[x0, x1].map((f) => q([f(0), 0.02], [f(3.96), 3.96], 0.021)), ...Array.from({ length: 12 }, (_, i) => { const y = 0.3 + i * 0.3; return q([x0(y), y], [x1(y), y + 0.012], 0.014); })];
};
export const OV_KEEP = (v: number, side: number): P[][] => { const b = BUSTS[v][side > 0 ? 1 : 0], [ox, oy] = ovAt(side); return [...b.ped, ...marbleOf(b), ...(ladderSide(v) === side ? ladderShape(v) : [])].map((p) => shift(ms(p), -ox, -oy)); };

// ---------------------------------------------------------------- the far window
// The west end of the Long Room: the great window pale with the afternoon, the last bays going
// into its light. Only what the last ring's opening shows of it is ever seen.
export const FP = F / (FAR.z - camAt(JOURNEY).z), FW = Math.round(FAR.w * FP), FH = Math.round(FAR.h * FP), FTOP = FAR.y + FAR.h / 2;   // px per metre: 1:1 in the end view, the nearest it comes
export const fm = (x: number, y: number): P => [(x + FAR.w / 2) * FP, (FTOP - y) * FP], fms = (pts: P[]) => pts.map(([x, y]) => fm(x, y)), fOf = (px: number, py: number): P => [px / FP - FAR.w / 2, FTOP - py / FP];
export const WX = 1.2, WY0 = 2.4, WY1 = 8.4;                                  // the window's half-width, sill, springing of its round head
export const WINDOW: P[] = [[-WX, WY0], [WX, WY0], ...Array.from({ length: 17 }, (_, i) => { const a = (i / 16) * Math.PI; return [WX * Math.cos(a), WY1 + WX * Math.sin(a)] as P; })];
export const glow = (x: number, y: number) => Math.exp(-((x / 2) ** 2) - ((y - 6) / 4.4) ** 2);

// ---------------------------------------------------------------- the table card
// The table, its near edge and the lamp; the gallery shows behind it. The table runs out of its
// 1600 px frame at its near corners, so the card is widened by PAD on each side. PAD is whole weave
// tiles, so the canvas lines up with the frame's.
export const PAD = 34 * 19, TW = W + 2 * PAD;
export const MARGINS: [number, number][] = [[-PAD - 10, -10], [W + 10, W + PAD + 10]];
export const TABLE_KEEP: P[][] = ([TOP, EDGE, [[-PAD, 830], [W + PAD, 830], [W + PAD, H + 60], [-PAD, H + 60]], LAMP, shift(LAMP, 5, 2)] as P[][]).map((p) => shift(p, PAD, 0));

// ---------------------------------------------------------------- the cards and the room
// a card's painting: drawn into ctx as it stands at frame f (a pure function of f and env), done by
// frame `end`, on a canvas of w x h logical px
export type Art = { run: (ctx: Ctx, f: number, env: Env) => void; end: number; w: number; h: number };
// a style: its paintings of the cards (far, ring, bustsAL/AR/BL/BR, table), the ground under them,
// the lit air of the nave, the canvas laid over the whole frame, and the tint of the lamp's light
export type Lamp = { glow: [string, string]; mote: string[]; tongue: [string, string, string] };
export type Look = { id: string; title: string; art: Record<string, Art>; under: string; air: string; canvas: (ctx: Ctx, env: Env) => void; lamp: Lamp };
const cardEnv = (env: Env, a: Art): Env => ({ ...env, W: a.w, H: a.h });
// a card half painted: its painting run into the card's own surface at frame f
const live = (L: Look, env: Env, id: string, f: number): Img[] => {
  const a = L.art[id], key = `${L.id}:live:${id}:${env.scale}`; let S = env.cache.get(key) as { canvas: Img; ctx: Ctx } | undefined;
  if (!S) { S = env.canvas(Math.round(a.w * env.scale), Math.round(a.h * env.scale)); env.cache.set(key, S); }
  S.ctx.setTransform(1, 0, 0, 1, 0, 0); S.ctx.clearRect(0, 0, S.canvas.width, S.canvas.height);   // a card of dabs alone is not opaque: last frame's must not show through
  a.run(S.ctx, f, cardEnv(env, a)); return [S.canvas];
};
// a card finished, with its halvings: a card drawn small is taken from the nearest halving above its size, so it is filtered, not sampled
const finished = (L: Look, env: Env, id: string): Img[] => {
  const a = L.art[id], key = `${L.id}:card:${id}:${env.scale}`; let lv = env.cache.get(key) as Img[] | undefined; if (lv) return lv;
  const S = env.canvas(Math.round(a.w * env.scale), Math.round(a.h * env.scale)); a.run(S.ctx, a.end, cardEnv(env, a)); lv = [S.canvas];
  while (lv[lv.length - 1].width > 96) { const s = lv[lv.length - 1], l = env.canvas(Math.ceil(s.width / 2), Math.ceil(s.height / 2)); l.ctx.imageSmoothingEnabled = true; l.ctx.imageSmoothingQuality = "high"; l.ctx.drawImage(s, 0, 0, l.canvas.width, l.canvas.height); lv.push(l.canvas); }
  env.cache.set(key, lv); return lv;
};
// one card on its own, finished, at env.scale: what a baker writes to an image file. Every style has
// the same cards; PARTS says where each is set in the room
export type Cards = Record<string, { w: number; h: number; paint: (env: Env) => Img }>;
export const cardsOf = (L: Look): Cards => Object.fromEntries(Object.entries(L.art).map(([id, a]) => [id, { w: a.w, h: a.h, paint: (env: Env) => finished(L, env, id)[0] }]));
// the room: every card back to front at its place for the eye, the lit air of the nave laid between
// them (a card at depth d keeps clear(d) of its own colour), so the far bays go into the window's
// light. The canvas goes over the whole picture last: it is the canvas the film is painted on, so
// it stays put while the room moves, and it is laid once a frame rather than once a card
const ORDER: Card[] = [FAR, ...RINGS, TABLE_CARD].sort((a, b) => b.z - a.z);
// what each card is drawn from, in metres at the card's depth: a ring is the shared bay and its variant's busts, both in the ring's plane
export const PARTS: Record<string, { art: string; x: number; y: number; w: number; h: number }[]> = {
  far: [{ art: "far", ...FAR }], table: [{ art: "table", ...TABLE_CARD, w: (TABLE_CARD.w * TW) / W }],
  ...Object.fromEntries(["A", "B"].map((v) => [`ring${v}`, [{ art: "ring", ...RC }, { art: `busts${v}L`, ...ov(-1) }, { art: `busts${v}R`, ...ov(1) }]])),
};
const clear = (d: number) => Math.exp(-Math.max(0, d - 5) / 30);
const composite = (ctx: Ctx, env: Env, cam: Cam, L: Look, layers: (id: string) => Img[]) => {
  const k = env.scale; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "low";   // the halvings do the filtering
  ctx.fillStyle = L.under; ctx.fillRect(0, 0, Math.round(W * k), Math.round(H * k));
  const air = (a: number, b: number[]) => { if (a < 0.003) return; ctx.globalAlpha = a; ctx.fillStyle = L.air; ctx.fillRect(b[0] * k, b[1] * k, (b[2] - b[0]) * k, (b[3] - b[1]) * k); ctx.globalAlpha = 1; };
  let last = -1;
  for (const c of ORDER) {
    const p = project(c, cam); if (!p) continue;
    const d = c.z - cam.z, x0 = p.x - (c.w * p.s) / 2, y0 = p.y - (c.h * p.s) / 2, x1 = x0 + c.w * p.s, y1 = y0 + c.h * p.s;
    const vx0 = Math.max(0, x0), vy0 = Math.max(0, y0), vx1 = Math.min(W, x1), vy1 = Math.min(H, y1); if (vx1 <= vx0 || vy1 <= vy0) continue;
    // the air between this card and the last: only where this card will not cover it (a ring that fills the screen shows the rest through its opening only)
    if (last >= 0) { const ring = c.id !== "table" && c.id !== "far" && x0 <= 0 && y0 <= 0 && x1 >= W && y1 >= H; air(1 - clear(last) / clear(d), ring ? [Math.max(0, p.x - A1 * p.s), Math.max(0, p.y - (archY(0) - c.y) * p.s), Math.min(W, p.x + A1 * p.s), Math.min(H, p.y + c.y * p.s)] : [0, 0, W, H]); }
    for (const q of PARTS[c.id]) {
      const qx0 = p.x + (q.x - q.w / 2 - c.x) * p.s, qy0 = p.y - (q.y + q.h / 2 - c.y) * p.s, qx1 = qx0 + q.w * p.s, qy1 = qy0 + q.h * p.s;
      const ux0 = Math.max(0, qx0), uy0 = Math.max(0, qy0), ux1 = Math.min(W, qx1), uy1 = Math.min(H, qy1); if (ux1 <= ux0 || uy1 <= uy0) continue;
      const lv = layers(q.art); let img = lv[0]; for (const l of lv) if (l.width / q.w >= p.s * k) img = l;
      const u = img.width / (qx1 - qx0), v = img.height / (qy1 - qy0);
      ctx.drawImage(img, (ux0 - qx0) * u, (uy0 - qy0) * v, (ux1 - ux0) * u, (uy1 - uy0) * v, ux0 * k, uy0 * k, (ux1 - ux0) * k, (uy1 - uy0) * k);
    }
    last = d;
  }
  if (last >= 0) air(1 - clear(last), [0, 0, W, H]);
  L.canvas(ctx, env);
};

// ---------------------------------------------------------------- the table, live
// The end view is the table card 1:1, so the lamp's flame is where the painting put it. Dust drifts
// in its light and the flame breathes; every motion makes whole cycles over the loop.
const loop = (f: number, n: number, ph = 0) => Math.sin((2 * Math.PI * n * f) / TABLE + ph);
const MOTES = (() => { const r = rng(77); return Array.from({ length: 72 }, () => ({ x: FLAME[0] - 220 + r() * 600, y: FLAME[1] - 40 + r() * 440, ax: 8 + r() * 22, n: 1 + Math.floor(r() * 3), rise: 1 + Math.floor(r() * 2), ph: r() * 6.283, k: r(), size: 0.8 + r() * 1.8 })); })();
const endView = (ctx: Ctx, env: Env, L: Look) => {
  const key = `${L.id}:end:${env.scale}`; let S = env.cache.get(key) as { canvas: Img; ctx: Ctx } | undefined;
  if (!S) { S = env.canvas(Math.round(W * env.scale), Math.round(H * env.scale)); composite(S.ctx, env, camAt(JOURNEY), L, (id) => finished(L, env, id)); env.cache.set(key, S); }
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over"; ctx.drawImage(S.canvas, 0, 0);
};
const lampLive = (ctx: Ctx, f: number, env: Env, T: Lamp) => {
  const k = env.scale, [fx, fy] = FLAME, fl = 0.5 * loop(f, 29, 1) + 0.3 * loop(f, 47, 2.3) + 0.2 * loop(f, 71, 0.4);
  ctx.setTransform(k, 0, 0, k, 0, 0); ctx.globalCompositeOperation = "screen";
  const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 170); g.addColorStop(0, `rgba(${T.glow[0]},${(0.22 + 0.1 * fl).toFixed(3)})`); g.addColorStop(0.35, `rgba(${T.glow[1]},${(0.08 + 0.05 * fl).toFixed(3)})`); g.addColorStop(1, `rgba(${T.glow[1]},0)`);
  ctx.fillStyle = g; ctx.fillRect(fx - 170, fy - 170, 340, 340);
  // the motes: each drifts up through the light and fades at both ends of its climb, so the loop has no seam
  MOTES.forEach((d, i) => {
    const u = ((d.rise * f) / TABLE + d.k) % 1, x = d.x + d.ax * loop(f, d.n, d.ph), y = d.y + 70 - 140 * u, lit = Math.exp(-((x - fx) ** 2 + (y - fy - 60) ** 2) / (2 * 190 ** 2)), a = 0.85 * lit * Math.sin(Math.PI * u) * (0.75 + 0.25 * loop(f, 3 * d.n, d.ph * 2));
    if (a < 0.02) return; ctx.globalAlpha = a; ctx.fillStyle = T.mote[i % T.mote.length]; ctx.beginPath(); ctx.arc(x, y, d.size, 0, 2 * Math.PI); ctx.fill();
  });
  // the flame: a tongue over the painted one, lengthening and leaning as it breathes
  const top = fy - 16 - 3.5 * fl, lean = 1.6 * loop(f, 37, 0.8); ctx.globalAlpha = 0.85; ctx.globalCompositeOperation = "source-over";
  const t = ctx.createLinearGradient(fx, fy + 9, fx, top); t.addColorStop(0, T.tongue[0]); t.addColorStop(0.4, T.tongue[1]); t.addColorStop(1, T.tongue[2]);
  ctx.fillStyle = t; ctx.beginPath(); ctx.moveTo(fx - 4.6, fy + 5); ctx.quadraticCurveTo(fx - 5.4 + lean * 0.3, fy - 6, fx + lean, top); ctx.quadraticCurveTo(fx + 5.4 + lean * 0.3, fy - 6, fx + 4.6, fy + 5); ctx.quadraticCurveTo(fx, fy + 10, fx - 4.6, fy + 5); ctx.fill();
  ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
};

// the film: the arrival (the start view, every card painting itself at once), the journey down the
// nave, and the table with its dust and flame live over the cached end view
export const libraryFilm = (L: Look): Film => ({
  meta: { title: L.title, W, H, fps: 30, bpm: 120, durationFrames: PAINT + JOURNEY + TABLE, raster: "cpu" },
  assets: { images: PLATES },
  shots: [
    { id: "paint", start: 0, end: PAINT, draw: (ctx, f, env) => composite(ctx, env, camAt(0), L, (id) => (f >= L.art[id].end ? finished(L, env, id) : live(L, env, id, f))) },
    { id: "journey", start: PAINT, end: PAINT + JOURNEY, draw: (ctx, f, env) => composite(ctx, env, camAt(f), L, (id) => finished(L, env, id)) },
    { id: "table", start: PAINT + JOURNEY, end: PAINT + JOURNEY + TABLE, draw: (ctx, f, env) => { endView(ctx, env, L); lampLive(ctx, f, env, L.lamp); } },
  ],
});
