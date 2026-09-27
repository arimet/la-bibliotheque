import { Gfx, rng, fractal, type P } from "./core";
import { bounds, clamp, inside, mix } from "./gallery";
import { fit, runProcess, timeline, type Proc } from "./sumiEKit";
import { darken, fill, lighten, oilStroke, weave, type OStroke } from "./paintedOilKit";
import { OIL_M, OIL_ROOM } from "./libraryRooms";
import { W, H, EYE as EYE_Y } from "./longroom";
import {
  BOOKS as SCENE, BANDS, EDGE, FLAME, HOLES, LA, LAMP, LAMP_SHADOW, LS, PILASTERS, chim, edgeAt, plateEdges, SHADOWS, SPINE, TOP, along, bp, boardLight, brassI, shadowK, cover, faceAt, faces, flameGlow, grain, inBox, inChimney,
  labelBox, lerp2, onBook, plateBox, pool, quad, rule, setPlate, sheen, shift, titleLines, uvOf, type Book as SceneBook, type Face,
  A0, A1, ARCH, BUSTS, C0, C1, CORN0, F0, FASC, G0, G1, LOW, OH, OV_KEEP, OW, RAIL, RH, RING_HOLE, RP, RUN, RW, RZP, VAULT_SEEN, ladderSide, ladderX, m, marbleI, marbleOf, mOf, ms, ovAt, radial, rLit, sd, seen, toward, upright, zoneAt, type Bust, type Zone,
  FH, FP, FW, WINDOW, WX, WY0, WY1, fms, fOf, glow, MARGINS, PAD, TABLE_KEEP, TW, LAST, cardsOf, cut, libraryFilm, type Art, type Look,
} from "./libraryScene";

// THE LONG ROOM · oil on canvas, after anidoodle's paintedOil hero. The reading table first; then
// the gallery's cards (a bay of the nave, its busts, the far window), the room they make together,
// and the journey down it to the table.
//
// THE READING TABLE.
// SUBJECT: the near end of an oak reading table in the Long Room, seen by a reader sitting at it,
// eye about 45 cm above the top, looking down at 33 degrees. Four closed books lie on the oak in a
// loose fan that turns toward the reader: Dust Creek (tan calf), Corbenic (oxblood morocco),
// Canicule (mustard), Les Grands Bois (bottle green). Each is lettered in gilt in its book's own
// colour, has raised bands on its rounded spine, and carries its first picture as a plate set into
// a sunk, gilt-ruled frame. A brass oil lamp stands at the far left of the table; behind the table
// the shelved bays are lost into shadow.
// LIGHT: the high windows of the nave, left and a little above, over everything; and the lamp's
// warm pool over the left of the table and the two left books. Cast shadows fall to the right.
// ORDER (the kit's): priming and toning; the umber drawing; dark masses (bays, oak, the books'
// shadow faces, the lamp); mid tones (the shelved books, the oak along the grain, the leather, the
// brass); lights (the pool and the sheen, the leather's lights, the plates laid in); impasto (the
// leather over the plates' edges, gilt, the bands, the flame, glints); dark accents (contact
// shadows, the sunk frames, the joints).
// SIZE HIERARCHY: the bays and the oak with the big flat in few broad passes, the toned ground
// left between them; the leather with a medium brush laid across each board; a small brush for the
// page edges, the bands and the gilt only.


// ---------------------------------------------------------------- colour
const ramp = (stops: string[], t: number) => { const f = clamp(t) * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(f)); return mix(stops[i], stops[i + 1], f - i); };
const BAYS = ["#090605", "#110c08", "#1a130c", "#251b11", "#33261a", "#463524", "#5e4830"];
const OAK = ["#170e07", "#2a1b0e", "#442d17", "#654524", "#8a5f33", "#b0824a", "#d6ab70"];
const BRASS = ["#140d05", "#33240c", "#5e4416", "#8f6d27", "#bf9a40", "#e3c674", "#fbf0c8"];
const PAGES = ["#2c2418", "#54462f", "#85734f", "#b09c74", "#d3c29a", "#ece0bf"];
const UMBER = "#4a2c1a", TONE = "#4e3320", WARM = "#f2b25e", COOL = "#b9bcae";

// ---------------------------------------------------------------- the books' leather
type Book = SceneBook & { leather: string[]; ink: string };
const TAN = ["#1f1208", "#3d2412", "#63401f", "#8a5f31", "#ad8048", "#c99f66", "#e2c190"];
const OXBLOOD = ["#150405", "#2c0a0b", "#4a1214", "#661d1c", "#822c27", "#9e4337", "#bd6a56"];
const MUSTARD = ["#231805", "#44300a", "#6e5112", "#98741d", "#b8922c", "#d2ae4a", "#e8cd80"];
const GREEN = ["#06110b", "#0c2016", "#143422", "#1d4a30", "#2a6040", "#407a56", "#6a9c7c"];
const SKIN: Record<string, { leather: string[]; ink: string }> = { "dust-creek": { leather: TAN, ink: "#c89a4b" }, corbenic: { leather: OXBLOOD, ink: "#d2a94a" }, canicule: { leather: MUSTARD, ink: "#ff48b0" }, "grands-bois": { leather: GREEN, ink: "#e0a458" } };
const BOOKS: Book[] = SCENE.map((b) => ({ ...b, ...SKIN[b.id] }));

// ---------------------------------------------------------------- the light model
const bayI = (x: number, y: number) => clamp(0.12 - 0.08 * (x / W) + 0.04 * (1 - y / 440) + 0.5 * flameGlow(x, y) + (fractal(5, x, y, 0.004, 0.02, 2) - 0.5) * 0.07);
const bayCol = (x: number, y: number) => mix(ramp(BAYS, bayI(x, y)), "#7a4a20", 0.3 * flameGlow(x, y));
const oakI = (x: number, y: number) => clamp(0.2 - 0.12 * (x / W) + 0.05 * clamp((y - 200) / 300) - 0.11 * clamp((y - 560) / 280) + 0.52 * pool(x, y) + 0.2 * sheen(x, y) + (fractal(9, x, y, 0.03, 0.002, 2) - 0.5) * 0.1);
const oakCol = (x: number, y: number, k = 1) => { const c = ramp(OAK, oakI(x, y) * k); return mix(mix(c, WARM, 0.16 * pool(x, y)), COOL, 0.3 * sheen(x, y)); };
// leather: the window and the lamp, rubbed lighter along the edges and corners; the spine a round back lit on its left
const leatherI = (b: Book, u: number, v: number, x: number, y: number) => {
  let I = boardLight(u, v);
  I += 0.2 * pool(x, y) + (fractal(20 + b.seed, x, y, 0.045, 0.045, 2) - 0.5) * 0.09;
  return clamp(I * b.light);
};
const leatherCol = (b: Book, x: number, y: number, k = 1) => {
  const [u, v] = uvOf(b, x, y);
  return mix(ramp(b.leather, leatherI(b, u, v, x, y) * k), WARM, 0.12 * pool(x, y));
};

// ---------------------------------------------------------------- stages
type Clip = { keep?: P[][]; out?: P[][] };
export type Stage = { name: string; clip?: Clip; strokes: OStroke[]; per: number; paint?: (g: Gfx, p: number) => void };
const lost = (pts: P[], dx = 7, dy = 3): Clip => ({ keep: [pts, shift(pts, dx, dy)] });
const st = (ctrl: P[], w: number, c0: string, seed: number, c1 = c0, imp = 0.5, dry = 0.25, load = 1.1): OStroke => ({ ctrl, w, c0, c1, load, dry, impasto: imp, jit: 0.05, seed });
// the plate, set into the board under the same lamp and window as the leather round it
const plate = (g: Gfx, b: Book, frac: number) => setPlate(g.cur, g.env, b, frac, darken(b.leather[3], 0.5), (c, q) => {
  const gr = c.createLinearGradient(q[0][0], q[0][1], q[2][0], q[2][1]); gr.addColorStop(0, `rgba(255,206,140,${(0.14 * pool(q[0][0], q[0][1])).toFixed(3)})`); gr.addColorStop(1, "rgba(30,16,6,0.22)");
  c.fillStyle = gr; c.fillRect(Math.min(q[0][0], q[3][0]) - 2, Math.min(q[0][1], q[1][1]) - 2, 400, 300);
});
// long strokes laid along a face in rows: the page block between two board edges, or the round back
const faceRows = (b: Book, f: Face, seed: number): OStroke[] => {
  const out: OStroke[] = [], len = Math.hypot(f.pts[1][0] - f.pts[0][0], f.pts[1][1] - f.pts[0][1]), hgt = Math.hypot(f.pts[3][0] - f.pts[0][0], f.pts[3][1] - f.pts[0][1]);
  const rows: [number, number, string, string][] = f.kind === "spine"
    ? [[0, 0.4, ramp(b.leather, 0.5 * b.light), ramp(b.leather, 0.4 * b.light)], [0.35, 0.75, ramp(b.leather, 0.42 * b.light), ramp(b.leather, 0.32 * b.light)], [0.7, 1, ramp(b.leather, 0.24), ramp(b.leather, 0.18)]]
    : (() => { const lit = f.kind === "tail" ? 0.6 : 0.36, board = ramp(b.leather, 0.3 * b.light), bd = ramp(b.leather, 0.16);
      return [[0, 0.17, board, bd], [0.15, 0.42, ramp(PAGES, lit), ramp(PAGES, lit - 0.1)], [0.4, 0.64, ramp(PAGES, lit - 0.06), ramp(PAGES, lit - 0.14)], [0.62, 0.86, ramp(PAGES, lit - 0.14), ramp(PAGES, lit - 0.22)], [0.84, 1, bd, ramp(b.leather, 0.08)]] as [number, number, string, string][]; })();
  const pieces = Math.max(1, Math.round(len / 150));
  rows.forEach(([h0, h1, c0, c1], r) => { const h = (h0 + h1) / 2; for (let k = 0; k < pieces; k++) { const s0 = k / pieces - 0.03, s1 = (k + 1) / pieces + 0.03;
    out.push({ ctrl: [faceAt(f.pts, s0, h), faceAt(f.pts, (s0 + s1) / 2, h), faceAt(f.pts, s1, h)], w: Math.max(2.4, (h1 - h0) * hgt * 1.25), c0: mix(c0, WARM, 0.12 * pool(f.pts[0][0], f.pts[0][1])), c1, load: 1.05, dry: 0.3, impasto: 0.16, jit: f.kind === "spine" ? 0.04 : 0.12, soft: 0.1, seed: seed + r * 10 + k }); } });
  if (f.kind !== "spine") [0.3, 0.52, 0.74].forEach((h, k) => out.push({ ctrl: [faceAt(f.pts, 0.02, h), faceAt(f.pts, 0.98, h)], w: 1, c0: ramp(PAGES, 0.3), load: 0.8, dry: 0.6, impasto: 0, seed: seed + 90 + k }));   // the leaves
  else BANDS.forEach((v, k) => { const a = faceAt(f.pts, v, 0.05), c = faceAt(f.pts, v, 0.95); out.push(st([a, c], 4, ramp(b.leather, 0.6), seed + 95 + k, ramp(b.leather, 0.34), 0.45, 0.2)); });
  return out;
};

export const tableStages = (): Stage[] => {
  const S: Stage[] = [];
  // 1. the toned ground: a thin rub of sienna and umber over the white priming
  // (rubbed deeper where the picture will be darkest: the near oak and the room to the right)
  S.push({ name: "rub", strokes: [], per: 2, paint: (g) => {
    const c = g.cur, deep = (x0: number, y0: number, x1: number, y1: number, a: number) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, "rgba(22,13,7,0)"); gr.addColorStop(1, `rgba(22,13,7,${a})`); c.fillStyle = gr; c.fillRect(-10, -10, W + 20, H + 20); };
    c.globalAlpha = 0.82; c.fillStyle = TONE; c.fillRect(-10, -10, W + 20, H + 20); c.globalAlpha = 1; deep(500, 0, W, 0, 0.45); deep(0, 480, 0, H, 0.6);
  } });
  const tr = rng(3), toning: OStroke[] = [];
  for (let i = 0; i < 3; i++) { const y = 120 + i * 330 + tr() * 60, a = (i % 2 ? 0.1 : -0.08) + (tr() - 0.5) * 0.1; toning.push({ ctrl: [[-80, y - a * 800], [W / 2, y + (tr() - 0.5) * 40], [W + 80, y + a * 800]], w: 150, c0: mix(TONE, "#6e4a2e", tr() * 0.6), c1: mix(TONE, "#a07048", tr() * 0.5), load: 1.1, dry: 0.6, impasto: 0, alpha: 0.6, jit: 0.06, seed: 10 + i }); }
  S.push({ name: "tone", strokes: toning, per: 2.4 });
  // 2. the drawing: thin burnt umber, searching lines
  const ln = (ctrl: P[], seed: number, w = 3, alpha = 0.75): OStroke => ({ ctrl, w, c0: UMBER, load: 1, dry: 0.15, impasto: 0, alpha, seed });
  const drawing: OStroke[] = [
    ln([TOP[0], TOP[1]], 40), ln([TOP[1], TOP[2]], 41), ln([TOP[2], TOP[3]], 42), ln([EDGE[0], EDGE[1]], 43, 3.4),
    ln(LAMP.slice(0, 17), 44, 2.6), ln(LAMP.slice(17, 64), 45, 2.6), ln(LAMP.slice(64), 46, 2.6),
    ...PILASTERS.map((x, i) => ln([[x, -20], [x + 2, 120], [x - 1, 260]], 47 + i, 5, 0.4)),
  ];
  BOOKS.forEach((b, i) => { const cv = cover(b), tl = faces(b)[0].pts; drawing.push(ln([cv[0], cv[1], cv[2]], 60 + i * 5), ln([cv[2], cv[3], cv[0]], 61 + i * 5), ln([tl[3], tl[2]], 62 + i * 5, 2.6), ln(quad(b, ...plateBox(b)), 63 + i * 5, 2.2, 0.55),
    { ctrl: [SHADOWS[i][0], SHADOWS[i][Math.floor(SHADOWS[i].length / 2)]], w: 14, c0: UMBER, load: 0.9, dry: 0.6, impasto: 0, alpha: 0.35, seed: 64 + i * 5 }); });
  S.push({ name: "drawing", strokes: drawing, per: 1.6 });
  // 3. the dark masses: the bays with the big flat, the oak blocked in along the grain, the lamp, the books' boards and faces
  const BG: Clip = { out: [TOP, EDGE, LAMP] }, TAB: Clip = { keep: [TOP], out: HOLES };
  const bayDir = (x: number, y: number) => -1.35 + (fractal(91, x, y, 0.002, 0.002, 1) - 0.5) * 0.3;
  const side = (a: P, b: P, x: number): P => [x, a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0])];
  S.push({ name: "bays", clip: BG, per: 1.4, strokes: fill({ region: [[-60, -60], [W + 60, -60], ...shift([side(TOP[3], TOP[2], W + 60), TOP[2], TOP[1], side(TOP[0], TOP[1], -60)], 0, 70)], step: 132, len: 320, w: 130, dir: bayDir, seed: 100, load: 1.05, dry: 0.42, impasto: 0.04, bend: 0.12, jit: 0.035, soft: 0.25, color: bayCol, sweep: 0 }) });
  S.push({ name: "front", per: 1.2, strokes: fill({ region: [[-60, 830], [W + 60, 830], [W + 60, H + 60], [-60, H + 60]], step: 130, len: 460, w: 110, dir: () => 0.01, seed: 105, load: 1.05, dry: 0.4, impasto: 0.04, jit: 0.035, soft: 0.25, color: (x) => ramp(OAK, 0.03 + 0.07 * (1 - x / W)) }) });
  S.push({ name: "oak block-in", clip: TAB, per: 1.1, strokes: fill({ region: TOP, step: 150, len: 420, w: 130, dir: grain, seed: 110, load: 1.05, dry: 0.4, impasto: 0.04, bend: 0.03, jit: 0.035, soft: 0.25, color: (x, y) => (HOLES.some((h) => inside(h, x, y)) ? null : oakCol(x, y, 0.72)), sweep: 1.57 }) });
  BOOKS.forEach((b, i) => {
    S.push({ name: `book ${i} faces`, clip: { keep: faces(b).map((f) => f.pts) }, per: 0.4, strokes: faces(b).flatMap((f, k) => faceRows(b, f, 130 + i * 200 + k * 60)) });
    S.push({ name: `book ${i} leather block-in`, clip: lost(cover(b)), per: 0.35, strokes: fill({ region: cover(b), step: 28, len: 84, w: 28, dir: along(b), seed: 140 + i * 10, dry: 0.35, impasto: 0.05, jit: 0.03, soft: 0.3, color: (x, y) => leatherCol(b, x, y, 0.72), sweep: 1.4 }) });
  });
  S.push({ name: "lamp dark", clip: lost(LAMP, 5, 2), per: 0.5, strokes: fill({ region: LAMP, step: 11, len: 40, w: 13, dir: () => -Math.PI / 2, seed: 170, dry: 0.3, impasto: 0.06, jit: 0.04, soft: 0.2, color: (x, y) => (inChimney(x, y) ? bayCol(x, y) : ramp(BRASS, 0.12)), sweep: 0 }) });
  // 4. mid tones: the shelved books in the bays, barely out of the dark; the oak along the grain; the leather; the brass
  const sr = rng(7), spines: OStroke[] = [], SPINE_COLS = ["#5a2a18", "#3c3a1e", "#5a4420", "#2e2a26", "#6a3a1c", "#40301a"];
  for (let shelf = 0; shelf < 4; shelf++) for (let x = -20; x < W + 20; x += 10 + sr() * 11) {
    const y1 = 60 + shelf * 118, y0 = y1 - 66 - sr() * 26; if (sr() < 0.12) continue;
    const k = clamp(bayI(x, y1) * 1.5), c = mix(SPINE_COLS[Math.floor(sr() * SPINE_COLS.length)], BAYS[0], clamp(1 - k * 2.4));
    spines.push({ ctrl: [[x, y1], [x + (sr() - 0.5) * 2, (y0 + y1) / 2], [x + (sr() - 0.5) * 3, y0]], w: 8 + sr() * 6, c0: c, c1: darken(c, 0.4), load: 0.85, dry: 0.6, impasto: 0.05, jit: 0.05, soft: 0.2, seed: 180 + spines.length });
  }
  S.push({ name: "shelved books", clip: BG, per: 0.15, strokes: spines });
  S.push({ name: "shelves", clip: BG, per: 1.2, strokes: [0, 1, 2, 3].map((s) => st([[-30, 62 + s * 118], [W / 2, 60 + s * 118], [W + 30, 63 + s * 118]], 9, ramp(BAYS, 0.06), 200 + s, ramp(BAYS, 0.01), 0.05, 0.3, 1)).concat(PILASTERS.map((x, i) => st([[x, -30], [x + 3, 200], [x - 2, 480]], 34, mix(ramp(BAYS, 0.2 - i * 0.04), "#6a3a18", 0.25 * flameGlow(x, 200)), 205 + i, ramp(BAYS, 0.04), 0.06, 0.45, 1))) });
  S.push({ name: "oak body", clip: TAB, per: 0.8, strokes: fill({ region: [TOP[0], TOP[1], TOP[2], TOP[3]].map(([x, y]) => [x, Math.min(y, 740)] as P), step: 108, len: 320, w: 84, dir: grain, seed: 210, dry: 0.42, impasto: 0.08, bend: 0.03, jit: 0.04, soft: 0.25, color: (x, y) => oakCol(x, y), sweep: 1.57 }) });
  // the near edge, a rounded lip: lit along its top, falling into dark under it
  const edge: OStroke[] = []; [[0.2, 0.5], [0.5, 0.3], [0.8, 0.12]].forEach(([h, I], r) => { for (let k = -1; k < 5; k++) { const s0 = k / 4 - 0.02, s1 = (k + 1) / 4 + 0.08; edge.push({ ctrl: [edgeAt(s0, h), edgeAt((s0 + s1) / 2, h), edgeAt(s1, h)], w: 18, c0: ramp(OAK, I * (1 - 0.4 * ((s0 + 0.3) / 1.6))), c1: ramp(OAK, I * 0.8 * (1 - 0.4 * ((s1 + 0.3) / 1.6))), load: 1.05, dry: 0.35, impasto: 0.1, jit: 0.04, soft: 0.2, seed: 215 + r * 10 + k }); } });
  S.push({ name: "table edge", clip: { keep: [EDGE] }, per: 0.6, strokes: edge });
  BOOKS.forEach((b, i) => {
    S.push({ name: `book ${i} leather`, clip: { keep: [cover(b)] }, per: 0.22, strokes: fill({ region: cover(b), step: 18, len: 66, w: 18, dir: along(b), seed: 250 + i * 10, dry: 0.32, impasto: 0.14, jit: 0.035, soft: 0.28, color: (x, y) => leatherCol(b, x, y), sweep: 1.4 }) });
    // the title label: a darker skin pared thin and set into the board
    const lq = quad(b, ...labelBox(b));
    S.push({ name: `book ${i} label`, clip: { keep: [lq] }, per: 0.3, strokes: fill({ region: lq, step: 8, len: 44, w: 11, dir: along(b), seed: 260 + i * 10, dry: 0.3, impasto: 0.12, jit: 0.035, soft: 0.2, color: (x, y) => leatherCol(b, x, y, 0.4), sweep: 1.4 }) });
  });
  const brassCol = (x: number, y: number) => mix(ramp(BRASS, brassI(x, y)), WARM, 0.15);
  S.push({ name: "brass", clip: { keep: [LAMP] }, per: 0.4, strokes: fill({ region: LAMP, step: 7, len: 26, w: 8, dir: () => -Math.PI / 2, seed: 270, dry: 0.3, impasto: 0.2, jit: 0.04, soft: 0.2, color: (x, y) => (inChimney(x, y) ? null : brassCol(x, y)), sweep: 0 }) });
  // 5. lights: the lamp's pool and the window's sheen on the oak, the cast shadows laid back into them, the leather's lights, the plates laid in
  S.push({ name: "oak lights", clip: TAB, per: 0.7, strokes: fill({ region: TOP, step: 60, len: 220, w: 44, dir: grain, seed: 280, dry: 0.45, impasto: 0.12, bend: 0.03, jit: 0.04, soft: 0.25, color: (x, y) => (oakI(x, y) > 0.42 ? oakCol(x, y, 1.08) : null), sweep: 1.57 }) });
  S.push({ name: "cast shadows", clip: TAB, per: 0.5, strokes: [...SHADOWS, LAMP_SHADOW].flatMap((sh, i) => fill({ region: sh, step: 23, len: 70, w: 24, dir: grain, seed: 290 + i, dry: 0.35, impasto: 0.06, bend: 0.04, jit: 0.04, color: (x, y) => { const k = shadowK(x, y); return k < 1 && !HOLES.some((h) => inside(h, x, y)) ? oakCol(x, y, k) : null; }, sweep: 0 })) });
  // the oak's figure: dark grain lines, and the pale flecks of the rays where the light is on it
  const gr = rng(11), figure: OStroke[] = [], free = (x: number, y: number) => inside(TOP, x, y) && !HOLES.some((h) => inside(h, x, y));
  for (let i = 0; i < 60; i++) { const x = -200 + gr() * (W + 400), y = 230 + gr() * 600; if (!free(x, y)) continue; const a = grain(x, y), L = 80 + gr() * 180, c = oakCol(x, y, 0.72); figure.push({ ctrl: [[x - (Math.cos(a) * L) / 2, y - (Math.sin(a) * L) / 2], [x + (gr() - 0.5) * 8, y], [x + (Math.cos(a) * L) / 2, y + (Math.sin(a) * L) / 2]], w: 2.5 + gr() * 2.5, c0: c, c1: darken(c, 0.1), load: 0.8, dry: 0.6, impasto: 0.04, jit: 0.04, seed: 300 + i }); }
  for (let i = 0; i < 70; i++) { const x = gr() * W, y = 230 + gr() * 600; if (!free(x, y) || oakI(x, y) < 0.36 || shadowK(x, y) < 1) continue; const a = grain(x, y) + (gr() - 0.5) * 0.3, L = 8 + gr() * 12, c = oakCol(x, y, 1.22); figure.push({ ctrl: [[x - (Math.cos(a) * L) / 2, y - (Math.sin(a) * L) / 2], [x + (Math.cos(a) * L) / 2, y + (Math.sin(a) * L) / 2]], w: 4, c0: c, load: 1, dry: 0.3, impasto: 0.35, jit: 0.04, seed: 400 + i }); }
  S.push({ name: "oak figure", clip: TAB, per: 0.3, strokes: figure });
  BOOKS.forEach((b, i) => {
    S.push({ name: `book ${i} leather lights`, clip: { keep: [cover(b)], out: [quad(b, ...labelBox(b)), quad(b, ...plateBox(b))] }, per: 0.3, strokes: fill({ region: cover(b), step: 14, len: 46, w: 13, dir: along(b), seed: 320 + i * 10, dry: 0.4, impasto: 0.26, jit: 0.035, soft: 0.25, color: (x, y) => { const [u, v] = uvOf(b, x, y); return leatherI(b, u, v, x, y) > 0.56 && !inBox(u, v, labelBox(b), 0.02) && !inBox(u, v, plateBox(b), 0.01) ? leatherCol(b, x, y, 1.07) : null; }, sweep: 1.4 }) });
    S.push({ name: `book ${i} plate`, per: 3, strokes: [], paint: (g, p) => plate(g, b, p) });
  });
  // 6. impasto: the leather dragged over the plates' edges so they sit in the boards, the sunk frames, the gilt, the bands, the flame
  BOOKS.forEach((b, i) => {
    const bx = plateBox(b), r = rng(500 + i), lip: OStroke[] = [];
    plateEdges(b).forEach(([a, c, o]) => { for (let k = 0; k < 8; k++) { if (r() < 0.5) continue; const t = (k + 0.2 + r() * 0.6) / 8, m = lerp2(a, c, t), d: P = [(c[0] - a[0]) * 0.06, (c[1] - a[1]) * 0.06];
      const p0 = bp(b, m[0] - d[0] + o[0], m[1] - d[1] + o[1]), p1 = bp(b, m[0] + d[0] + o[0], m[1] + d[1] + o[1]), cc = leatherCol(b, (p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, 0.95);
      lip.push({ ctrl: [p0, p1], w: 5, c0: cc, c1: darken(cc, 0.1), load: 0.8, dry: 0.7, impasto: 0.2, jit: 0.05, soft: 0.3, seed: 520 + i * 40 + lip.length }); } });
    // the sunk frame: its far and window-side walls in shadow over the picture's edge, the other two catching a thin light
    const q = quad(b, ...bx), dk = darken(b.leather[1], 0.45), lt = lighten(ramp(b.leather, 0.62), 0.12);
    const bevel = [st([q[0], q[1]], 3.4, dk, 540 + i * 4, dk, 0.1, 0.1, 1), st([q[3], q[0]], 3.4, dk, 541 + i * 4, dk, 0.1, 0.1, 1), st([q[1], q[2]], 1.6, lt, 542 + i * 4, lt, 0.3, 0.3, 1), st([q[2], q[3]], 1.6, lt, 543 + i * 4, lt, 0.3, 0.3, 1)];
    S.push({ name: `book ${i} plate set`, per: 0.6, strokes: [...lip, ...bevel] });
    // gilt: the rule round the plate, the fillet round the board, the label's rule, the title. The
    // tool presses a groove into the skin; the leaf lies in it, dark where it turns from the window, bright where it faces it
    const gold = b.ink, gdk = darken(gold, 0.45), glt = gold, pad = 0.022;
    const lines = [...rule(b, [bx[0] - pad, bx[1] - (pad * b.w) / b.d, bx[2] + pad, bx[3] + (pad * b.w) / b.d]), ...rule(b, [SPINE + 0.045, 0.032, 0.968, 0.968]), ...rule(b, labelBox(b))];
    const titles = titleLines(b), tw = Math.max(2, titles[0].cap * 1175 * 0.1), letters = titles.flatMap((t) => t.pts.map((pl) => onBook(b, pl)));
    const groove = (l: P[], w: number, seed: number): OStroke => ({ ctrl: shift(l, 0.6, 0.7), w: w + 1.4, c0: darken(ramp(b.leather, 0.3), 0.45), load: 1.3, dry: 0, impasto: 0, jit: 0.02, seed });
    const leaf = (l: P[], w: number, seed: number): OStroke => ({ ctrl: l, w, c0: glt, c1: gdk, load: 1.3, dry: 0.05, impasto: 0.26, jit: 0.2, soft: 0, seed });
    S.push({ name: `book ${i} tooling`, per: 0.2, strokes: [...lines.map((l, k) => groove(l, 1.6, 600 + i * 100 + k)), ...letters.map((l, k) => groove(l, tw, 650 + i * 100 + k))] });
    S.push({ name: `book ${i} gilt`, per: 0.3, strokes: [...lines.map((l, k) => leaf(l, 1.6, 700 + i * 100 + k)), ...letters.map((l, k) => leaf(l, tw, 750 + i * 100 + k))] });
    // the raised bands across the round back: each a ridge standing off the spine, its near side in shadow
    const bands: OStroke[] = [];
    BANDS.forEach((v, k) => { const [u0, u1] = [0.015, SPINE * 0.95], c = ramp(b.leather, 0.5 * b.light); bands.push(st([bp(b, u0, v + 0.011), bp(b, u1, v + 0.011)], 2.2, darken(c, 0.3), 810 + i * 20 + k, darken(c, 0.2), 0, 0.2), st([bp(b, u0, v), bp(b, (u0 + u1) / 2, v - 0.002), bp(b, u1, v)], 3.6, lighten(c, 0.14), 800 + i * 20 + k, c, 0.45, 0.25)); });
    bands.push(st([bp(b, SPINE * 1.1, 0.01), bp(b, SPINE * 1.1, 0.5), bp(b, SPINE * 1.1, 0.99)], 2.2, darken(b.leather[1], 0.5), 830 + i, darken(b.leather[1], 0.3), 0.1, 0.15));   // the joint where the board hinges
    S.push({ name: `book ${i} bands`, per: 0.5, strokes: bands });
    // the window catches the gilt here and there: small thick bright dabs on a few strokes
    const gl = rng(900 + i), glints: OStroke[] = [];
    letters.forEach((l, k) => { if (gl() < 0.8) return; const j = Math.floor((l.length - 1) / 2), a = l[j], c = l[j + 1], t = 0.25 + gl() * 0.3; glints.push({ ctrl: [lerp2(a, c, t), lerp2(a, c, t + 0.3)], w: tw * 0.7, c0: lighten(gold, 0.45), load: 1.3, dry: 0, impasto: 0.5, jit: 0.02, soft: 0, seed: 950 + i * 50 + k }); });
    S.push({ name: `book ${i} glints`, per: 1, strokes: glints });
  });
  // the chimney glass and the flame: the dark room through the glass, the window on its left edge, the flame's glow in the bulb
  const [fx, fy] = FLAME;
  S.push({ name: "flame", per: 3, strokes: [
    st([[fx - 13, fy + 8], [fx, fy + 10], [fx + 13, fy + 8]], 14, "#d08040", 1000, "#8a4a22", 0.2, 0.4, 1),
    st(chim(155 * LS, 205 * LS, -0.72), 2.5, "#d8d2bc", 1001, "#7a746a", 0.5, 0.4, 1), st(chim(158 * LS, 180 * LS, 0.72), 2, "#e8a860", 1002, "#6a3a18", 0.4, 0.4, 1),
    { ctrl: [[fx, fy + 9], [fx - 1.5, fy], [fx, fy - 15]], w: 10, c0: "#fff6d8", c1: "#ffd27a", load: 1.4, dry: 0.2, impasto: 0.9, jit: 0.02, soft: 0.05, seed: 1003 },
    { ctrl: [[fx, fy + 4], [fx, fy - 9]], w: 5, c0: "#fffdf4", load: 1.4, dry: 0, impasto: 1, jit: 0.01, soft: 0, seed: 1004 },
  ] });
  S.push({ name: "brass glints", per: 3, strokes: [
    st([LA(-17, 122), LA(-19, 113), LA(-15, 103)], 5, "#fff2c4", 1010, "#e8c878", 0.9, 0.3, 1.2),
    st([LA(-30, 9), LA(-12, 13)], 4, "#f8e2a0", 1011, "#c8a048", 0.8, 0.3),
    st([LA(-3.5, 34), LA(-3.5, 72)], 2.4, "#f0d690", 1012, "#a88438", 0.6, 0.3),
    st([LA(-9, 139), LA(6, 139)], 3, "#fff0c0", 1013, "#e8c070", 0.8, 0.3),
  ] });
  // the lit lip of the table's near edge: one long stroke catching the window
  S.push({ name: "edge light", per: 3, strokes: [st([edgeAt(-0.01, 0.06), edgeAt(0.3, 0.06), edgeAt(0.62, 0.07)], 4, oakCol(200, 820, 1.6), 1020, ramp(OAK, 0.3), 0.5, 0.45, 1.1)] });
  // 7. dark accents: where each book presses on the oak, the lamp's foot, the far edge of the table
  S.push({ name: "contact", per: 1.5, clip: TAB, strokes: [
    ...BOOKS.flatMap((b, i) => { const tl = faces(b)[0].pts, rt = [bp(b, 1, 0, 0), bp(b, 1, 1, 0)]; return [st([tl[3], tl[2]], 5, "#120a05", 1100 + i, "#1e140b", 0.08, 0.3, 1), st([rt[1], rt[0]], 6, "#120a05", 1110 + i, "#2a1c10", 0.08, 0.5, 1)]; }),
    st([LA(-44, -3), LA(0, -7), LA(46, -4)], 6, "#120a05", 1120, "#1e140b", 0.08, 0.3, 1),
    st([TOP[1], [(TOP[1][0] + TOP[2][0]) / 2, TOP[1][1] + 1], TOP[2]], 4, ramp(OAK, 0.45), 1121, ramp(OAK, 0.1), 0.3, 0.2, 1),
  ] });
  return S;
};

// ---------------------------------------------------------------- the process
const ground = (g: Gfx) => { const c = g.cur, e = g.env; c.setTransform(e.scale, 0, 0, e.scale, 0, 0); c.fillStyle = "#efe8da"; c.fillRect(0, 0, e.W, e.H); weave(g, 0.55); };
// Strokes drawn through a complex clip rasterise several times slower in software, so a clipped
// batch is laid on a spare surface and only its box is composited through the clip, once. (The
// kit's lean strokes composite straight to the main surface, so a clipped stage holds none.)
const withClip = (g: Gfx, clip: Clip | undefined, box: [number, number, number, number], fn: () => void) => {
  if (!clip) return fn();
  const c = g.cur, e = g.env, L = g.layer(), k = e.scale, path = (p: P[]) => { c.moveTo(p[0][0], p[0][1]); p.forEach(([x, y]) => c.lineTo(x, y)); c.closePath(); };
  L.ctx.setTransform(k, 0, 0, k, 0, 0); g.cur = L.ctx; fn(); g.cur = c;
  const r: [number, number, number, number] = [Math.max(0, Math.floor(box[0] * k)), Math.max(0, Math.floor(box[1] * k)), Math.min(Math.round(e.W * k), Math.ceil(box[2] * k)), Math.min(Math.round(e.H * k), Math.ceil(box[3] * k))];
  if (r[2] > r[0] && r[3] > r[1]) {
    c.save();
    if (clip.keep) { c.beginPath(); clip.keep.forEach(path); c.clip("nonzero"); }
    if (clip.out) { c.beginPath(); c.rect(-50, -50, e.W + 100, e.H + 100); clip.out.forEach(path); c.clip("evenodd"); }
    c.setTransform(1, 0, 0, 1, 0, 0); c.drawImage(L.canvas as CanvasImageSource, r[0], r[1], r[2] - r[0], r[3] - r[1], r[0], r[1], r[2] - r[0], r[3] - r[1]); c.restore();
  }
  g.release(L, r);
};
const boxOf = (ss: OStroke[]): [number, number, number, number] => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; ss.forEach((o) => o.ctrl.forEach(([x, y]) => { const m = o.w + 6; x0 = Math.min(x0, x - m); y0 = Math.min(y0, y - m); x1 = Math.max(x1, x + m); y1 = Math.max(y1, y + m); })); return [x0, y0, x1, y1]; };
const PACE = 0.3;   // the per-stroke paces are a hand's; each card has to paint itself in about 3 s
const build = (id: string, stages: Stage[], finish: (g: Gfx) => void) => (k: number): Proc => {
  const tl = timeline(4, k, true);
  stages.forEach((s, si) => {
    if (s.paint) { tl.add(s.per, (g, p) => s.paint!(g, p)); tl.wait(1); return; }
    const B = Math.max(1, Math.round(2 / (s.per * PACE * k)));   // a batch is about two frames of work
    for (let a = 0; a < s.strokes.length; a += B) {
      const batch = s.strokes.slice(a, a + B), box = boxOf(batch);
      tl.add(batch.length * s.per * PACE, (g, p) => withClip(g, s.clip, box, () => { const f = p * batch.length; batch.forEach((o, i) => { if (p >= 1 || i < Math.floor(f)) oilStroke(g, o, 1); else if (i === Math.floor(f)) oilStroke(g, o, f - i); }); }));
    }
    tl.wait(si < 2 ? 6 : 2);
  });
  return { id, medium: OIL_M, ground, ops: tl.ops, finish };
};
// the toned ground of a card: a thin rub of sienna and umber, deeper toward the foot
const rub = (tone: string, deep: number, dark = 1e9, alpha = 0.82): Stage => ({ name: "rub", strokes: [], per: 2, paint: (g) => {   // `dark`: below this line (px) the rub goes on deeper still
  const c = g.cur, e = g.env, gr = c.createLinearGradient(0, 0, 0, e.H); gr.addColorStop(0, "rgba(22,13,7,0)"); gr.addColorStop(1, `rgba(22,13,7,${deep})`);
  c.globalAlpha = alpha; c.fillStyle = tone; c.fillRect(-10, -10, e.W + 20, e.H + 20); c.globalAlpha = 1; c.fillStyle = gr; c.fillRect(-10, -10, e.W + 20, e.H + 20); c.fillStyle = "rgba(18,11,6,0.72)"; c.fillRect(-10, dark, e.W + 20, e.H + 20);
} });

// ---------------------------------------------------------------- a bay of the Long Room
const RED = ["#5a2418", "#6e2a1c", "#4a1c14", "#7a3a22", "#3c2a18", "#5a4420", "#2e2420", "#6a3a1c", "#8a4a26", "#40301a", "#6a2020", "#34301c"];   // calf and morocco on the shelves: umbers and reds, an olive now and then
const MARBLE = ["#2a221c", "#473f36", "#6b645a", "#918a7e", "#b6afa1", "#d6cfc0", "#eee8da"];
const zoneCol = (z: Zone, x: number, y: number): string => {
  const ax = Math.abs(x), L = rLit(x, y);
  switch (z) {
    case "floor": { const sh = 0.24 * Math.exp(-((x / 0.9) ** 2)); return mix(ramp(OAK, (0.15 + sh) * L), COOL, sh * 0.8); }   // the far window along the polished aisle
    case "alcove": return ramp(OAK, 0.06 * L);
    case "lower": return mix(ramp(BAYS, 0.34 * L), "#4a1c12", 0.3);
    case "pilaster": return ax < 2.2 ? mix(ramp(OAK, 0.3 * L), COOL, 0.08) : ramp(OAK, 0.21 * L);
    case "soffit": return ramp(BAYS, (0.14 + 0.16 * clamp(1 - (ax - A0) / 1.6)) * L);
    case "fascia": return ramp(OAK, 0.27 * L);
    case "balustrade": return ramp(BAYS, 0.2 * L);
    case "upper": return mix(ramp(BAYS, 0.42 * L), "#5a2016", 0.28);
    case "upilaster": return ramp(OAK, 0.25 * L);
    case "usoffit": return ramp(BAYS, 0.13 * L);
    case "cornice": return ramp(OAK, 0.3 * L);
    case "vault": return ramp(OAK, (0.12 + 0.08 * clamp(1 - ax / 5)) * L);
  }
};
const ringCol = (k: number, zone?: Zone) => (x: number, y: number) => { const [mx, my] = mOf(x, y), z = zoneAt(mx, my); return z && (!zone || z === zone) ? darken(zoneCol(z, mx, my), 1 - k) : null; };
const ringDir = (x: number, y: number) => { const [mx, my] = mOf(x, y); return upright(zoneAt(mx, my)) ? -Math.PI / 2 : radial(x, y); };
// the run from the plane band a..b (one above the other), laid toward the eye in pieces that widen as it nears
const run = (a: P, b: P, t0: number, t1: number, col: (t: number) => string, seed: number, over = 1.25, imp = 0.08): OStroke[] => {
  const out: OStroke[] = [], p: P = [a[0], (a[1] + b[1]) / 2], hw = Math.abs(b[1] - a[1]);
  for (let t = t0, k = 0; t < t1; t += 0.32, k++) out.push({ ctrl: [m(...toward(p, t)), m(...toward(p, t + 0.17)), m(...toward(p, t + 0.36))], w: Math.max(2, hw * (t + 0.18) * RP * over), c0: col(t), c1: col(t + 0.36), load: 1.1, dry: 0.2, impasto: imp, jit: 0.05, soft: 0.15, seed: seed + k });
  return out;
};
const both = (f: (s: number) => OStroke[]) => [...f(1), ...f(-1)];
// the runs' wedges reach far past the card: keep only the strokes that land on it, and of those only what the eye can meet
const onCard = (ss: OStroke[]) => ss.filter((o) => o.ctrl.some(([x, y]) => seen(...mOf(x, y))));
const BLOCKED = new Set<Zone>(["lower", "pilaster", "upper", "upilaster", "balustrade", "fascia", "cornice"]);   // the zones the block-in lays; the others get a pass of their own

// the busts: marble lit from the upper left; warm oak light thrown back into the shadow side
const marbleCol = (b: Bust, x: number, y: number, k = 1) => { const I = marbleI(b, x, y) * k; return mix(mix(ramp(MARBLE, I), COOL, 0.14 * clamp((I - 0.4) * 2)), "#6a4a2c", 0.3 * clamp(1 - I * 2.4)); };

const ringStages = (): Stage[] => {
  const S: Stage[] = [];
  S.push(rub("#33210f", 0.3, m(0, 0)[1], 0.92));   // a dark room: the rub goes on deeper than the table's
  // 1. the drawing: the aisle's edges, the arch, the runs set off toward the eye, the busts
  const ln = (ctrl: P[], seed: number, w = 3.4, alpha = 0.7): OStroke => ({ ctrl, w, c0: UMBER, load: 1, dry: 0.15, impasto: 0, alpha, seed });
  const drawing: OStroke[] = [ln(ms(ARCH), 2010, 4)];
  [-1, 1].forEach((s, i) => {
    drawing.push(ln(ms([sd(s, F0), sd(s, G0)]), 2020 + i), ln(ms([sd(s, [A1, RAIL]), sd(s, C1)]), 2024 + i), ln(ms([sd(s, G0), toward(sd(s, G0), 1.6)]), 2030 + i, 3, 0.55));
  });
  S.push({ name: "drawing", strokes: drawing, per: 1.6 });
  // 2. the dark masses: the whole bay in few broad passes, upright on the stacks, along the rays on the runs
  S.push({ name: "block-in", per: 1.1, strokes: onCard(fill({ region: [[-60, -60], [RW + 60, -60], [RW + 60, RH + 60], [-60, RH + 60]], step: 168, len: 270, w: 158, dir: ringDir, seed: 2100, load: 1.05, dry: 0.42, impasto: 0.04, bend: 0.1, jit: 0.035, soft: 0.25, color: (x, y) => { const [mx, my] = mOf(x, y), z = zoneAt(mx, my); return z && BLOCKED.has(z) ? darken(zoneCol(z, mx, my), 0.26) : null; }, sweep: 1.57 })) });
  // the floor with the walls, board by board toward the eye, each a little lighter or darker than the next (it meets no stack face, so it can go in early)
  const fr = rng(3090), boards: OStroke[] = [];
  for (let i = 0; i < 14; i++) { const xc = -A0 + 0.15 + i * 0.3, k = (fr() - 0.5) * 0.14, cos = EYE_Y / Math.hypot(xc, EYE_Y), col = (t: number) => { const c = zoneCol("floor", xc * t, EYE_Y - EYE_Y * t); return k > 0 ? lighten(c, k) : darken(c, -k); };
    for (let t = 1; t < 2.7 && xc * t < 5.2; t += 0.3) boards.push({ ctrl: [m(...toward([xc, 0], t)), m(...toward([xc + (fr() - 0.5) * 0.02, 0], t + 0.17)), m(...toward([xc, 0], t + 0.36))], w: 0.3 * (t + 0.18) * RP * 1.2 * cos, c0: col(t), c1: col(t + 0.36), load: 1.1, dry: 0.25, impasto: 0.04, jit: 0.05, soft: 0.2, seed: 3100 + boards.length }); }
  S.push({ name: "floor", per: 0.6, strokes: [...boards,
    ...onCard(RZP("alcove").flatMap((r, k) => fill({ region: r, step: 90, len: 200, w: 84, dir: radial, seed: 3120 + k, dry: 0.4, impasto: 0.04, jit: 0.04, soft: 0.25, color: ringCol(1, "alcove"), sweep: 0 })))] });
  // 3. the stack faces in the ring's plane: the books upright on their shelves, dabs of umber and red barely out of the dark
  const br = rng(2200), books: OStroke[] = [], gilt: OStroke[] = [];
  const row = (s: number, y0: number, y1: number, x0: number, x1: number, dk: number) => {
    for (let x = x0; x < x1;) {
      const w = 0.035 + br() * 0.045, X = s * (x + w / 2), top = y1 - br() * 0.1, lean = br() < 0.07 ? (br() - 0.5) * 0.1 : 0; x += w;
      if (br() < 0.05) continue;
      const c = mix(RED[Math.floor(br() * RED.length)], BAYS[0], clamp(dk - (rLit(X, y0) - 0.9) * 0.8 + (br() - 0.5) * 0.14));
      books.push({ ctrl: [m(X, y0 + 0.01), m(X + lean / 2, (y0 + top) / 2), m(X + lean, top)], w: w * RP * 0.95, c0: lighten(c, 0.04), c1: darken(c, 0.2), load: 0.95, dry: 0.5, impasto: 0.04, jit: 0.08, soft: 0.1, seed: 2300 + books.length });
      if (br() < 0.14) gilt.push(st([m(X - w * 0.3, top - 0.04), m(X + w * 0.3, top - 0.04)], 2.2, mix("#b08a4a", c, 0.35), 2900 + gilt.length, mix("#8a6a3a", c, 0.4), 0.4, 0.3));
    }
  };
  [-1, 1].forEach((s) => {
    for (let i = 0; i < 10; i++) row(s, 0.24 + i * 0.366, 0.24 + i * 0.366 + 0.33, 2.58, 4.7, 0.6);
    for (let i = 0; i < 11; i++) { const y0 = FASC + 0.1 + i * 0.37, x1 = Math.min(4.7, (A0 * (y0 + 0.2 - EYE_Y)) / (RAIL - EYE_Y) + 0.2); if (x1 > 2.75) row(s, y0, y0 + 0.33, 2.72, x1, 0.48); }
  });
  S.push({ name: "books", per: 0.1, strokes: books });
  S.push({ name: "shelves", per: 0.9, strokes: both((s) => [
    ...Array.from({ length: 11 }, (_, i) => st(ms([[s * 2.55, 0.23 + i * 0.366], [s * 4, 0.235 + i * 0.366], [s * 5.4, 0.23 + i * 0.366]]), 7, ramp(BAYS, 0.07), 2400 + i + (s > 0 ? 20 : 0), ramp(BAYS, 0.02), 0.04, 0.35, 1)),
    ...Array.from({ length: 11 }, (_, i) => st(ms([[s * 2.7, FASC + 0.09 + i * 0.37], [s * 5.4, FASC + 0.09 + i * 0.37]]), 7, ramp(BAYS, 0.07), 2440 + i + (s > 0 ? 20 : 0), ramp(BAYS, 0.02), 0.04, 0.35, 1)),
  ]) });
  // 4. the stack ends: an oak pilaster on each, its aisle side catching the far window; the upper ones over the rail
  const oak = (x: number, y: number, v0: number) => ramp(OAK, v0 * rLit(x, y));
  S.push({ name: "pilasters", per: 0.5, strokes: both((s) => [
    ...[2.28, 2.45].map((x, k) => st(ms([[s * x, 0.05], [s * x, 2], [s * x, LOW - 0.05]]), 0.2 * RP, oak(s * x, 1, 0.24), 2500 + k + (s > 0 ? 10 : 0), oak(s * x, 3, 0.2), 0.08, 0.2, 1.2)),
    st(ms([[s * 2.15, 0.05], [s * 2.15, 2], [s * 2.15, LOW - 0.05]]), 0.1 * RP, mix(oak(s * 2.1, 1, 0.34), COOL, 0.1), 2503 + (s > 0 ? 10 : 0), oak(s * 2.1, 3, 0.28), 0.1, 0.2, 1.2),
    st(ms([[s * A0, 3.84], [s * 2.62, 3.84]]), 0.14 * RP, oak(s * 2.3, 3.8, 0.36), 2504 + (s > 0 ? 10 : 0), oak(s * 2.6, 3.8, 0.26), 0.2, 0.3),
    st(ms([[s * A0, 0.1], [s * 2.62, 0.1]]), 0.2 * RP, oak(s * 2.3, 0.1, 0.16), 2505 + (s > 0 ? 10 : 0), oak(s * 2.6, 0.1, 0.12), 0.06, 0.3),
    ...[2.42, 2.6].map((x, k) => st(ms([[s * x, 5.2], [s * x, 7], [s * x, CORN0 - 0.05]]), 0.18 * RP, oak(s * x, 7, 0.27), 2506 + k + (s > 0 ? 10 : 0), oak(s * x, 8, 0.24), 0.08, 0.2, 1.2)),
    st(ms([[s * A1, CORN0 - 0.2], [s * 2.74, CORN0 - 0.2]]), 0.12 * RP, oak(s * 2.4, 8.4, 0.36), 2508 + (s > 0 ? 10 : 0), oak(s * 2.7, 8.4, 0.28), 0.2, 0.3),
  ]) });
  // the recessed panel of each lower pilaster: a dark line in the shadow of its moulding, a lit one opposite
  S.push({ name: "panels", per: 0.5, strokes: both((s) => [st(ms([[s * 2.3, 0.5], [s * 2.3, 3.5]]), 3, ramp(OAK, 0.06), 2520 + (s > 0 ? 5 : 0), ramp(OAK, 0.04), 0.05, 0.3), st(ms([[s * 2.5, 0.5], [s * 2.5, 3.5]]), 2.2, ramp(OAK, 0.4), 2521 + (s > 0 ? 5 : 0), ramp(OAK, 0.3), 0.3, 0.4), st(ms([[s * 2.3, 3.5], [s * 2.5, 3.5]]), 2.4, ramp(OAK, 0.06), 2522 + (s > 0 ? 5 : 0), ramp(OAK, 0.06), 0.05, 0.3)]) });
  // 7. the runs down the nave, over the stack faces: the gallery's underside, its fascia and rail, the cornice, the vault, the floor
  S.push({ name: "soffits", clip: { keep: [...RZP("soffit"), ...RZP("usoffit")] }, per: 0.6, strokes: onCard([...RZP("soffit"), ...RZP("usoffit")].flatMap((r, k) => fill({ region: r, step: 112, len: 220, w: 100, dir: radial, seed: 2600 + k, dry: 0.4, impasto: 0.04, bend: 0.05, jit: 0.04, soft: 0.25, color: ringCol(1), sweep: 0 }))) });
  S.push({ name: "fascia", clip: { keep: [...RZP("fascia"), ...RZP("cornice")] }, per: 0.7, strokes: both((s) => [
    ...run(sd(s, G0), sd(s, G1), 1, 1.9, (t) => ramp(OAK, (0.3 - 0.03 * t) * rLit(s * 3, 4)), 2700 + (s > 0 ? 30 : 0)),
    ...run(sd(s, C0), sd(s, C1), 1, 1.4, (t) => ramp(OAK, (0.34 - 0.03 * t) * rLit(s * 3, 8)), 2760 + (s > 0 ? 30 : 0)),
  ]) });
  // the balustrade: the bottom and top rails, and balusters that close up as they go away down the nave
  const bal: OStroke[] = both((s) => [
    ...run(sd(s, [A0, FASC + 0.02]), sd(s, [A0, FASC + 0.1]), 1, 1.9, () => ramp(OAK, 0.26), 2800 + (s > 0 ? 20 : 0), 1.4),
    ...run(sd(s, [A0, RAIL - 0.08]), sd(s, [A0, RAIL]), 1, 1.9, () => ramp(OAK, 0.32 * rLit(s * 3, 5)), 2840 + (s > 0 ? 20 : 0), 1.4, 0.2),
    ...Array.from({ length: 9 }, (_, i) => { const t = 1.03 + i * 0.1 * (1 + i * 0.03), a = m(...toward(sd(s, [A0, FASC + 0.08]), t)), b = m(...toward(sd(s, [A0, RAIL - 0.06]), t)), c = ramp(OAK, 0.3 * rLit(s * 3, 5)); return st([a, lerp2(a, b, 0.5), b], Math.max(2.5, 0.045 * t * RP), c, 2880 + i + (s > 0 ? 30 : 0), darken(c, 0.25), 0.15, 0.2); }),
  ]);
  S.push({ name: "balustrade", clip: { keep: RZP("balustrade") }, per: 0.4, strokes: bal });
  // the barrel vault: laid along its boards toward the eye, panel joints along the rays and across, and the rib at the ring's own plane
  S.push({ name: "vault", per: 0.7, strokes: onCard(fill({ region: VAULT_SEEN, step: 130, len: 250, w: 118, dir: radial, seed: 2950, dry: 0.4, impasto: 0.04, bend: 0.04, jit: 0.04, soft: 0.25, color: ringCol(1, "vault"), sweep: 0 })) });
  const arcAt = (t: number, i0 = 0, i1 = ARCH.length) => ms(ARCH.slice(i0, i1).map((p) => toward(p, t)));
  S.push({ name: "vault joints", per: 0.5, strokes: [
    ...ARCH.filter((_, i) => i % 2 === 0).map((p, i) => st([m(...toward(p, 1.03)), m(...toward(p, 1.15)), m(...toward(p, 1.3))], 3, ramp(OAK, 0.05), 3000 + i, ramp(OAK, 0.04), 0.05, 0.3, 1)),
    ...[1.11, 1.22].flatMap((t, k) => [0, 8, 16].map((i0, j) => st(arcAt(t, i0, i0 + 9), 3.4, ramp(OAK, 0.05), 3020 + k * 3 + j, ramp(OAK, 0.04), 0.05, 0.3, 1))),
    ...[1.11, 1.22].flatMap((t, k) => [0, 8, 16].map((i0, j) => st(arcAt(t * 0.994, i0, i0 + 9), 2, ramp(OAK, 0.26), 3040 + k * 3 + j, ramp(OAK, 0.2), 0.3, 0.4, 1))),
  ] });
  S.push({ name: "rib", per: 0.8, strokes: [0, 6, 12, 18].map((i0, k) => st(arcAt(1.02, i0, i0 + 7), 0.3 * RP, ramp(OAK, 0.3), 3060 + k, ramp(OAK, 0.24), 0.12, 0.25, 1.2)) });
  // the boards' joints along the aisle, and the threshold across it where one bay's floor meets the next
  S.push({ name: "boards", per: 0.4, strokes: [...Array.from({ length: 15 }, (_, i) => { const x0 = (i - 7) * 0.3; return st([m(...toward([x0, 0], 1)), m(...toward([x0, 0], 2)), m(...toward([x0, 0], RUN))], 2.6, ramp(OAK, 0.05), 3140 + i, ramp(OAK, 0.03), 0.05, 0.55, 0.9); }),
    st(ms([[-A0 - 0.1, -0.012], [0, -0.016], [A0 + 0.1, -0.012]]), 6, "#140c06", 3160, "#1a1008", 0.05, 0.2, 1.2)] });
  // 8. lights: the lit edges of the runs, the rib's soffit, the pilasters' aisle sides, the far window along the floor, gilt
  const pale = (v0: number) => mix(ramp(OAK, v0), COOL, 0.25);
  S.push({ name: "edges", per: 0.35, strokes: [
    ...both((s) => [...run(sd(s, [A0, RAIL - 0.01]), sd(s, [A0, RAIL + 0.01]), 1, 1.9, () => pale(0.5), 3200 + (s > 0 ? 20 : 0), 1, 0.4).map((o) => ({ ...o, w: 2.6 })),
      ...run(sd(s, [A0, FASC - 0.01]), sd(s, [A0, FASC + 0.01]), 1, 1.9, () => pale(0.46), 3240 + (s > 0 ? 20 : 0), 1, 0.4).map((o) => ({ ...o, w: 2.4 })),
      ...run(sd(s, [A1, CORN0 - 0.01]), sd(s, [A1, CORN0 + 0.01]), 1, 1.4, () => pale(0.5), 3280 + (s > 0 ? 20 : 0), 1, 0.4).map((o) => ({ ...o, w: 2.4 })),
      st(ms([[s * (A0 + 0.015), 0.25], [s * (A0 + 0.015), 2], [s * (A0 + 0.015), 3.72]]), 3, pale(0.46), 3320 + (s > 0 ? 3 : 0), pale(0.38), 0.4, 0.35),
      st(ms([[s * (A1 + 0.015), 5.8], [s * (A1 + 0.015), CORN0 - 0.3]]), 2.6, pale(0.48), 3324 + (s > 0 ? 3 : 0), pale(0.4), 0.4, 0.35)]),
    st(arcAt(1.004, 2, 23), 4, pale(0.52), 3330, pale(0.4), 0.45, 0.3),
    ...gilt,
  ] });
  // 9. dark accents: under the fascia and the cornice, the stacks' feet along the floor, the top of each stack face
  S.push({ name: "accents", per: 0.4, strokes: both((s) => [
    ...run(sd(s, [A0, LOW - 0.02]), sd(s, [A0, LOW + 0.02]), 1, 1.9, () => "#120a05", 3400 + (s > 0 ? 20 : 0), 1, 0.05).map((o) => ({ ...o, w: 4 })),
    ...run(sd(s, [A0, -0.02]), sd(s, [A0, 0.02]), 1, 2.5, () => "#120a05", 3440 + (s > 0 ? 20 : 0), 1, 0.05).map((o) => ({ ...o, w: 5 })),
    st(ms([[s * 2.55, LOW - 0.04], [s * 4, LOW - 0.03], [s * 5.4, LOW - 0.04]]), 8, "#120a05", 3480 + (s > 0 ? 3 : 0), "#1e140b", 0.05, 0.3, 1),
  ]) });
  return S;
};
const toOv = (side: number) => (s: Stage): Stage => { const [ox, oy] = ovAt(side); return { ...s, clip: s.clip && { keep: s.clip.keep?.map((p) => shift(p, -ox, -oy)) }, strokes: s.strokes.map((o) => ({ ...o, ctrl: shift(o.ctrl, -ox, -oy) })) }; };
const bustStages = (v: number, side: number): Stage[] => {
  const S: Stage[] = [rub("#24180e", 0, 1e9, 0.95)], sv = 8000 + v * 1000 + (side > 0 ? 500 : 0), busts = [BUSTS[v][side > 0 ? 1 : 0]];
  // 5. the ladder leant on one stack face (ringA on the right, ringB on the left)
  const ls = ladderSide(v), [lx0, lx1] = ladderX(v), lc = (y: number) => ramp(OAK, 0.4 * rLit(ls * 3.2, y));
  if (ls === side) S.push({ name: "ladder", per: 0.4, strokes: [
    ...[lx0, lx1].map((f, k) => st(ms([[f(0), 0.02], [f(2), 2], [f(3.96), 3.96]]), 0.05 * RP, lc(1), sv + 10 + k, lc(3), 0.2, 0.25, 1.2)),
    ...Array.from({ length: 12 }, (_, i) => { const y = 0.3 + i * 0.3; return st(ms([[lx0(y), y], [lx1(y), y + 0.012]]), 0.034 * RP, lc(y), sv + 20 + i, darken(lc(y), 0.2), 0.2, 0.3); }),
    ...[lx0, lx1].map((f, k) => st(ms([[f(0) - ls * 0.022, 0.1], [f(3.9) - ls * 0.022, 3.9]]), 1.8, lighten(lc(3), 0.2), sv + 40 + k, lc(3), 0.4, 0.4)),
  ] });
  // 6. the pedestals, then the marble: the chest, the hair behind, the face, the hair in front, then curls in short touches
  busts.forEach((b, i) => {
    const c = (y: number) => ramp(OAK, 0.2 * rLit(b.x, y));
    S.push({ name: `pedestal ${i}`, per: 0.6, strokes: [
      ...[-0.12, 0, 0.12].map((dx, k) => st(ms([[b.x + dx, 1.31], [b.x + dx, 0.7], [b.x + dx, 0.14]]), 0.15 * RP, c(1.2), sv + 100 + i * 10 + k, c(0.5 + k * 0.2), 0.08, 0.12, 1.3)),
      st(ms([[b.x - 0.26, 1.36], [b.x + 0.26, 1.36]]), 0.13 * RP, c(1.4), sv + 103 + i * 10, darken(c(1.4), 0.2), 0.15, 0.2), st(ms([[b.x - 0.25, 0.08], [b.x + 0.25, 0.08]]), 0.16 * RP, c(0.1), sv + 104 + i * 10, darken(c(0.1), 0.2), 0.08, 0.2),
      st(ms([[b.x - 0.17, 0.2], [b.x - 0.17, 1.26]]), 2.4, lighten(c(1), 0.12), sv + 105 + i * 10, c(1), 0.3, 0.4), st(ms([[b.x - 0.25, 1.415], [b.x + 0.24, 1.415]]), 2.4, lighten(c(1.4), 0.2), sv + 106 + i * 10, c(1.4), 0.4, 0.4),
    ] });
    const MB = marbleOf(b).map(ms), col = (k: number) => (x: number, y: number) => { const [mx, my] = mOf(x, y); return marbleCol(b, mx, my, k); };
    const mass = (h: P[], k: number, dir: number, step = 6): OStroke[] => fill({ region: ms(h), step, len: step * 3, w: step + 2, dir: () => dir, seed: sv + 150 + i * 20 + k, dry: 0.3, impasto: 0.05, bend: 0.16, jit: 0.02, soft: 0.3, color: col(0.9), sweep: 1.57 });
    S.push({ name: `marble ${i}`, clip: { keep: MB }, per: 0.35, strokes: [...mass(b.chest, 0, 0.1 * b.f, 7), ...b.back.flatMap((h, k) => mass(h, 1 + k, -Math.PI / 2)), ...mass(b.face, 5, -Math.PI / 2 + 0.2 * b.f), ...b.front.flatMap((h, k) => mass(h, 6 + k, 0.2))] });
    const hr = rng(sv + 170 + i), curls: OStroke[] = [];
    [...b.back, ...b.front].forEach((h) => { const bx = bounds(h); for (let k = 0; k < 44; k++) { const x = bx.x0 + hr() * (bx.x1 - bx.x0), y = bx.y0 + hr() * (bx.y1 - bx.y0); if (!inside(h, x, y) || (inside(b.face, x, y) && !b.front.some((q) => inside(q, x, y)))) continue; const a = hr() * 6.28, c0 = marbleCol(b, x, y, hr() < 0.5 ? 0.72 : 1.08); curls.push({ ctrl: ms([[x - Math.cos(a) * 0.018, y - Math.sin(a) * 0.018], [x + Math.sin(a) * 0.012, y - Math.cos(a) * 0.012], [x + Math.cos(a) * 0.018, y + Math.sin(a) * 0.018]]), w: 3.4, c0, load: 1, dry: 0.4, impasto: 0.25, jit: 0.03, seed: sv + 200 + i * 60 + curls.length }); } });
    S.push({ name: `hair ${i}`, clip: { keep: MB }, per: 0.3, strokes: curls });
  });
  // the marble's lights, then its accents: the eyes' sockets, the nose's shadow, the mouth, under the jaw, the neck's shadow side
  busts.forEach((b, i) => {
    const MB = marbleOf(b).map(ms), f = b.f, h = (x: number, y: number, dx: number, dy: number, w: number, k: number, seed: number) => st(ms([[x, y], [x + dx, y + dy]]), w, marbleCol(b, x, y, k), seed, marbleCol(b, x + dx, y + dy, k * 0.95), 0.3, 0.2, 1.2);
    S.push({ name: `marble lights ${i}`, clip: { keep: MB }, per: 0.5, strokes: [
      ...fill({ region: ms(b.chest), step: 9, len: 20, w: 7, dir: () => -0.3, seed: sv + 300 + i, dry: 0.35, impasto: 0.15, jit: 0.02, soft: 0.3, color: (x, y) => { const [mx, my] = mOf(x, y); return marbleI(b, mx, my) > 0.64 ? marbleCol(b, mx, my, 1.1) : null; }, sweep: 1.57 }),
      h(b.hx - 0.035, b.hy + 0.065, 0.03, 0.01, 5, 1.2, sv + 310 + i * 8), h(b.hx + f * 0.045, b.hy + 0.01, f * 0.012, -0.045, 3, 1.3, sv + 311 + i * 8), h(b.hx - 0.055, b.hy - 0.02, 0.012, -0.035, 4, 1.18, sv + 312 + i * 8), h(b.x - 0.24, 1.69, 0.12, 0.03, 6, 1.18, sv + 313 + i * 8),
    ] });
    const dk = (pts: P[], w: number, k: number, seed: number) => st(ms(pts), w, marbleCol(b, pts[0][0], pts[0][1], k), seed, marbleCol(b, pts[0][0], pts[0][1], k + 0.1), 0.1, 0.3);
    S.push({ name: `marble accents ${i}`, per: 0.6, strokes: [
      dk([[b.hx - 0.012, b.hy + 0.018], [b.hx + 0.014, b.hy + 0.012]], 5, 0.42, sv + 320 + i * 8), dk([[b.hx + f * 0.052, b.hy + 0.016], [b.hx + f * 0.074, b.hy + 0.012]], 4.4, 0.42, sv + 321 + i * 8),
      dk([[b.hx + f * 0.03, b.hy - 0.048], [b.hx + f * 0.06, b.hy - 0.05]], 3, 0.4, sv + 322 + i * 8), dk([[b.hx + f * 0.018, b.hy - 0.078], [b.hx + f * 0.05, b.hy - 0.076]], 2.4, 0.45, sv + 323 + i * 8),
      ...(b.head === "sage" ? [] : [dk([[b.hx - 0.06, b.hy - 0.128], [b.hx, b.hy - 0.14], [b.hx + 0.06, b.hy - 0.128]], 4, 0.4, sv + 324 + i * 8)]),
      dk([[b.hx + 0.055, 1.91], [b.hx + 0.05, 1.84]], 6, 0.4, sv + 325 + i * 8), dk([[b.x - 0.09, 1.45], [b.x + 0.09, 1.45]], 5, 0.4, sv + 326 + i * 8), st(ms([[b.x - 0.3, 0.02], [b.x + 0.3, 0.02]]), 6, "#120a05", sv + 327 + i * 8, "#1e140b", 0.08, 0.3, 1),
    ] });
  });
  return S.map(toOv(side));
};

// ---------------------------------------------------------------- the far window
const farCol = (x: number, y: number, k = 1) => {
  if (inside(WINDOW, x, y)) return mix("#e6e0cc", "#fbf8ee", clamp(0.4 + 0.5 * glow(x, y) + (y > 6.6 ? -0.15 : 0)) * k);
  const gl = glow(x, y); if (y < 0) return mix(ramp(OAK, 0.3 * k), "#d8d0bc", clamp(gl * 1.3 * Math.exp(-((x / 1.1) ** 2)) * k));
  return mix(ramp(OAK, (0.28 + 0.3 * gl) * k), "#c4b89e", clamp(gl * 0.9 * k));
};
const farStages = (): Stage[] => {
  const S: Stage[] = [rub("#8a7050", 0.2)];
  const col = (k: number) => (x: number, y: number) => farCol(...fOf(x, y), k);
  S.push({ name: "wall", per: 0.8, strokes: fill({ region: [[-20, -20], [FW + 20, -20], [FW + 20, FH + 20], [-20, FH + 20]], step: 58, len: 150, w: 56, dir: (x, y) => (fOf(x, y)[1] < 0 ? Math.PI / 2 : -Math.PI / 2), seed: 4100, dry: 0.4, impasto: 0.04, jit: 0.04, soft: 0.25, color: (x, y) => (inside(WINDOW, ...fOf(x, y)) ? null : farCol(...fOf(x, y), 0.9)), sweep: 1.57 }) });
  S.push({ name: "glass", clip: { keep: [fms(WINDOW)] }, per: 0.6, strokes: fill({ region: fms(WINDOW), step: 21, len: 56, w: 21, dir: () => -Math.PI / 2, seed: 4200, dry: 0.3, impasto: 0.12, jit: 0.03, soft: 0.2, color: col(1), sweep: 1.57 }) });
  // the last bays: stack ends and a bust or two standing into the glare, barely there
  S.push({ name: "last bays", per: 0.6, strokes: [-1, 1].flatMap((s, i) => [
    st(fms([[s * 2.05, 0], [s * 2.05, 4], [s * 2.05, 8.4]]), 0.3 * FP, mix(ramp(OAK, 0.4), "#b0a282", 0.5), 4300 + i, mix(ramp(OAK, 0.36), "#a09274", 0.5), 0.05, 0.3, 1.1),
    st(fms([[s * 1.62, 0], [s * 1.62, 4], [s * 1.62, 8.2]]), 0.2 * FP, mix(ramp(OAK, 0.5), "#c8bc9c", 0.6), 4302 + i, mix(ramp(OAK, 0.46), "#b8ac8e", 0.6), 0.05, 0.3, 1.1),
    st(fms([[s * 1.9, 1.3], [s * 1.9, 2.1]]), 0.16 * FP, "#c8c0ac", 4304 + i, "#b4ab98", 0.2, 0.3),
    st(fms([[s * 2.2, 4.3], [s * 1.5, 4.3]]), 0.12 * FP, mix(ramp(OAK, 0.46), "#c0b494", 0.5), 4306 + i, "#c8bc9c", 0.1, 0.3),
  ]) });
  S.push({ name: "mullions", per: 0.4, strokes: [
    ...[-0.42, 0.42].map((x, i) => st(fms([[x, WY0], [x, 6], [x, WY1 + 1.1]]), 2.6, "#9a8e76", 4400 + i, "#8a7e68", 0.1, 0.3, 1)),
    ...[4.4, 6.4, WY1].map((y, i) => st(fms([[-WX, y], [WX, y]]), 2.4, "#a09480", 4410 + i, "#948872", 0.1, 0.3, 1)),
    st(fms(WINDOW.slice(2)), 3, "#8a7c64", 4420, "#7a6c56", 0.1, 0.3, 1),
  ] });
  S.push({ name: "reflection", per: 0.6, strokes: Array.from({ length: 6 }, (_, i) => { const x = (i - 2.5) * 0.3; return st(fms([[x, -0.02], [x * 1.2, -0.5], [x * 1.5, -1.1]]), 10, "#e8e2d0", 4500 + i, "#b8ae96", 0.3, 0.45); }) });
  S.push({ name: "glare", per: 0.8, strokes: [st(fms([[-0.2, 5], [0, 6.2], [0.2, 7.4]]), 14, "#fffdf6", 4600, "#fbf6ea", 0.6, 0.3, 1.2), st(fms([[0.7, 3.2], [0.7, 4.2]]), 8, "#fdf9ee", 4601, "#f4eee0", 0.5, 0.3)] });
  return S;
};

// ---------------------------------------------------------------- the table card
// The reading-table painting (`tableStages`), cut to the table, its near edge and the lamp; the bays painted behind it are
// dropped, and the gallery shows there instead. The table runs out of that frame at its near corners,
// so the card is widened by PAD on each side and the table's own passes carry on into the margin:
// only a rub and the dark front are added out there, so the frame keeps its approved pixels. PAD is
// whole weave tiles, so the canvas lines up with the frame's.
const BEHIND = new Set(["bays", "shelved books", "shelves"]);
const padded = (s: Stage): Stage => ({ ...s, clip: s.clip && { keep: s.clip.keep?.map((p) => shift(p, PAD, 0)), out: s.clip.out?.map((p) => shift(p, PAD, 0)) }, strokes: s.strokes.map((o) => ({ ...o, ctrl: shift(o.ctrl, PAD, 0) })), paint: s.paint && ((g, p) => { const c = g.cur; c.save(); c.translate(PAD, 0); s.paint!(g, p); c.restore(); }) });
const rubBeyond: Stage = { name: "rub beyond", strokes: [], per: 1, paint: (g) => {   // the table's rub, laid where its frame's rub stopped
  const c = g.cur, deep = (x0: number, y0: number, x1: number, y1: number, a: number, [u0, u1]: [number, number]) => { const gr = c.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, "rgba(22,13,7,0)"); gr.addColorStop(1, `rgba(22,13,7,${a})`); c.fillStyle = gr; c.fillRect(u0, -10, u1 - u0, H + 20); };
  MARGINS.forEach((u) => { c.globalAlpha = 0.82; c.fillStyle = TONE; c.fillRect(u[0], -10, u[1] - u[0], H + 20); c.globalAlpha = 1; deep(500, 0, W, 0, 0.45, u); deep(0, 480, 0, H, 0.6, u); });
} };
const frontBeyond: Stage = { name: "front beyond", per: 1.2, strokes: [[-PAD - 60, -350], [W + 350, W + PAD + 60]].flatMap(([x0, x1], k) => fill({ region: [[x0, 830], [x1, 830], [x1, H + 60], [x0, H + 60]], step: 130, len: 460, w: 110, dir: () => 0.01, seed: 106 + k, load: 1.05, dry: 0.4, impasto: 0.04, jit: 0.035, soft: 0.25, color: (x) => ramp(OAK, 0.03 + 0.07 * (1 - x / W)) })) };
const tableCard = () => tableStages().filter((s) => !BEHIND.has(s.name)).flatMap((s) => (s.name === "rub" ? [s, rubBeyond] : s.name === "front" ? [s, frontBeyond] : [s])).map(padded);

// ---------------------------------------------------------------- the cards and the room
const art = (id: string, stages: Stage[], w: number, h: number, finish: (g: Gfx) => void): Art => { const proc: Proc = fit(build(`libraryOil:${id}`, stages, finish), LAST); return { run: (ctx, f, env) => runProcess(proc, ctx, f, env), end: proc.ops[proc.ops.length - 1].t1, w, h }; };
const ART: Record<string, Art> = {
  far: art("far", farStages(), FW, FH, () => {}),
  ring: art("ring", ringStages(), RW, RH, (g) => cut(g.main, g.env, null, RING_HOLE)),
  ...Object.fromEntries([0, 1].flatMap((v) => [-1, 1].map((s) => [`busts${"AB"[v]}${s > 0 ? "R" : "L"}`, art(`busts${"AB"[v]}${s > 0 ? "R" : "L"}`, bustStages(v, s), OW, OH, (g) => cut(g.main, g.env, OV_KEEP(v, s)))]))),
  table: art("table", tableCard(), TW, H, (g) => cut(g.main, g.env, TABLE_KEEP)),
};
const OIL: Look = { ...OIL_ROOM, title: "La Bibliothèque · la galerie, huile", art: ART };   // the room's ground is BAYS[1]
export const libraryOil = libraryFilm(OIL);
export const libraryOilCards = cardsOf(OIL);   // each card on its own, finished: { w, h, paint(env) }
