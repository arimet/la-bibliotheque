// LES GRANDS BOIS PAGE 10 · L'AUBE. One idea: at dawn you come out of the wood with Tom's hand in
// yours, his scarf round his neck and his ears a boy's again, and the blackbirds are singing.
// Coloured pencil, dawn. The sky pink above, gold where the sun comes up behind the hills; the same
// meadow as on the first page, Grandmother's house small at the far end of it, no smoke from the
// chimney; on the right the edge of the wood, and the path coming out of it. On the path the two of
// you, walking toward the house, hand in hand. Blackbirds in the wet grass.
// What moves: the blackbirds hopping, one flying off and another coming in; leaves coming down; the
// sun's rays.
import { oval, rng, sample, turn, type P } from "./core";
import { figure, type Motif } from "./figures";
import { blob, bounds, mix } from "./gallery";
import { fromMotif, live, pencilLive, prehatch, replay, sketch, tint, type Layer_, type Shape } from "./pencil";

const LOOP = 180;
type Line = { pts: P[]; w: number; color: string; alpha: number };
const HORIZON = 470, SUN: P = [420, 404];

// ---------------------------------------------------------------- helpers
// a tree of the wood's edge, as on the first page, with the low sun on its left side
const tree = (x: number, g: number, h: number, seed: number, cols: string[]): Shape[] => {
  const q = rng(seed), trunk: P[] = [[x - h * 0.05, g], [x - h * 0.035, g - h * 0.5], [x - h * 0.02, g - h * 0.7], [x + h * 0.02, g - h * 0.7], [x + h * 0.035, g - h * 0.5], [x + h * 0.05, g]];
  const crowns = [0, 1, 2, 3].map((i) => blob(x + (q() - 0.5) * h * 0.35, g - h * (0.62 + q() * 0.3), h * (0.2 + q() * 0.1), h * (0.16 + q() * 0.08), seed + i, 0.25, 14));
  const dawn = (c: P[]): Layer_ => { const b = bounds(c), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2; return { color: "#f2b86a", angle: 0.3, gap: 7, w: 1.8, alpha: 0.5, keep: (px, py) => (px - cx) * 0.8 + (py - cy) * 0.5 < 0 }; };
  return [{ pts: trunk, layers: tint(trunk, "#5a4636", { angle: 1.4, gap: 5 }) }, ...crowns.map((c, i) => ({ pts: c, layers: [...tint(c, cols[i % cols.length], { seed: seed + i, gap: 5 }), dawn(c)] }))];
};
// a figure's legs swung at the hip, for a step: the back leg back, the front one forward
const stride = (m: Motif, x: number, g: number, h: number, deg: number): Motif => {
  const hip: P = [x, g - 0.4 * h], legs = [2, 3, 4, 5]; // far leg, near leg, far foot, near foot (figure.ts order)
  const sw = (i: number) => (i === 2 || i === 4 ? deg : -deg);
  return { fills: m.fills.map((f, i) => (legs.includes(i) ? { ...f, pts: turn(f.pts, hip[0], hip[1], sw(i)) } : f)), lines: [], parts: m.parts.map((p, i) => (legs.includes(i) ? turn(p, hip[0], hip[1], sw(i)) : p)) };
};

// ---------------------------------------------------------------- the land at dawn
const SKY: P[] = [[0, 0], [1600, 0], [1600, HORIZON + 40], [0, HORIZON + 40]];
const SUN_DISC: P[] = oval(SUN[0], SUN[1], 46, 46, 22);
const HILLS: P[] = [[0, 430], [260, 390], [520, 432], [760, 372], [1000, 410], [1200, 380], [1600, 400], [1600, 520], [0, 520]];
const MEADOW: P[] = [[0, 500], [300, 486], [700, 500], [1100, 492], [1600, 510], [1600, 900], [0, 900]];
const NEAR: P[] = [[0, 790], [500, 770], [1000, 796], [1600, 780], [1600, 900], [0, 900]];
const AUTUMN = ["#c8642a", "#d9a441", "#8a5a2a", "#6f7d3a", "#a8452a"];
const TREES: Shape[] = [];
{ const r = rng(12); [[1080, 610, 420], [1240, 590, 470], [1390, 640, 520], [1540, 620, 560], [980, 560, 330], [1320, 560, 360]].sort((a, b) => a[1] - b[1]).forEach(([x, g, h], i) => TREES.push(...tree(x + (r() - 0.5) * 20, g, h, 200 + i * 7, AUTUMN.slice(i % 3).concat(AUTUMN)))); }
const WOOD_DARK: P[] = [[940, 580], [1600, 600], [1600, 250], [940, 300]];
const PATH: P[] = sample([[1180, 596], [1150, 640], [1000, 700], [760, 740], [520, 700], [360, 620], [280, 540], [300, 540], [390, 610], [560, 682], [780, 716], [980, 676], [1130, 624], [1200, 596]], true, 4);
// Grandmother's house, far off at the end of the meadow: no smoke, nobody home till noon
const HX = 170, HG = 540, HW = 130;
const HOUSE: P[] = [[HX, HG], [HX, HG - 60], [HX + HW, HG - 60], [HX + HW, HG]], ROOF: P[] = [[HX - 10, HG - 56], [HX + HW / 2, HG - 110], [HX + HW + 10, HG - 56]], DOOR: P[] = [[HX + 44, HG], [HX + 44, HG - 30], [HX + 64, HG - 30], [HX + 64, HG]], WIN: P[] = [[HX + 88, HG - 42], [HX + 108, HG - 42], [HX + 108, HG - 22], [HX + 88, HG - 22]], CHIMNEY: P[] = [[HX + 92, HG - 84], [HX + 104, HG - 84], [HX + 104, HG - 104], [HX + 92, HG - 104]];
const POLES: P[][] = [[[HX + 150, HG + 4], [HX + 152, HG - 40], [HX + 155, HG - 40], [HX + 153, HG + 4]], [[HX + 250, HG + 8], [HX + 252, HG - 36], [HX + 255, HG - 36], [HX + 253, HG + 8]]];

// ---------------------------------------------------------------- the two of you, hand in hand
const KX = 900, TX = 770, GY = 730, KH = 290, TH = 210;
const kidF = figure({ x: KX, g: GY - 6, h: KH, f: -1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.42, 0.5], far: [-0.2, -0.1] });
const KID = stride(kidF.m, KX, GY - 6, KH, 11);
const tomF = figure({ x: TX, g: GY, h: TH, f: -1, robe: "tunic", head: "bare", cloth: "#6a8ab0", cloth2: "#5a4a3a", hair: "#7a5230", ink: "#000", near: [0.25, 0.4], far: [-1.0, -1.08] });
const TOM = stride(tomF.m, TX, GY, TH, -13);
const TS = (u: number, v: number): P => [TX - u * TH, GY - v * TH], KS = (u: number, v: number): P => [KX - u * KH, GY - 6 - v * KH];
// his scarf, round his neck, one end hanging down his back with the name on it
const SCARF: P[] = sample([TS(-0.06, 0.845), TS(0.05, 0.85), TS(0.07, 0.8), TS(-0.07, 0.79)], true, 3);
const SCARF_END: P[] = sample([TS(-0.04, 0.82), TS(-0.1, 0.8), TS(-0.13, 0.6), TS(-0.08, 0.59)], true, 3);
const TOM_LETTERS: Line = { pts: [TS(-0.1, 0.66), TS(-0.11, 0.625)], w: 1.4, color: "#f4efe4", alpha: 0.95 };
const faceOf = (S: (u: number, v: number) => P, w: number): Line[] => [
  { pts: [S(0.028, 0.93), S(0.048, 0.932)], w, color: "#2a1a14", alpha: 0.95 },
  { pts: [S(0.064, 0.925), S(0.074, 0.901), S(0.062, 0.898)], w: w * 0.6, color: "#6a4a3a", alpha: 0.8 },
  { pts: [S(0.036, 0.875), S(0.05, 0.872)], w: w * 0.55, color: "#8a4a3a", alpha: 0.7 },
];

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: SKY, layers: [
    { color: "#e8a0a0", angle: 0.2, gap: 5.5, w: 2.4, alpha: 0.6, keep: (x, y) => Math.hypot(x - SUN[0], y - SUN[1]) > 80 },
    { color: "#b890b8", angle: -0.3, gap: 8, w: 2, alpha: 0.4, keep: (_x, y) => y < 200 },
    { color: "#f2c14a", angle: 0.05, gap: 6, w: 2.2, alpha: 0.6, keep: (x, y) => y > 260 && Math.hypot(x - SUN[0], y - SUN[1]) > 60 },
    { color: "#f4d890", angle: 0.8, gap: 7, w: 1.8, alpha: 0.5, keep: (x, y) => Math.hypot(x - SUN[0], y - SUN[1]) < 200 && Math.hypot(x - SUN[0], y - SUN[1]) > 52 }], outline: false },
  { pts: SUN_DISC, layers: [{ color: "#f8e4a0", angle: 0.3, gap: 5, w: 1.8, alpha: 0.5 }], outline: { color: "#e8a040", w: 1.4 } },
  { pts: HILLS, layers: [...tint(HILLS, "#a88aa8", { angle: 0.3, gap: 7 }), { color: "#f2c14a", angle: 0.1, gap: 6, w: 1.8, alpha: 0.5, keep: (x, y) => y < 440 && Math.abs(x - SUN[0]) < 380 }], outline: { color: "#7a5a7a" } },
  { pts: WOOD_DARK, layers: [{ color: "#4a3040", angle: 1.2, gap: 4, w: 2.4, alpha: 0.75 }, { color: "#8a4a3a", angle: -0.4, gap: 6, w: 2, alpha: 0.5 }], outline: false },
  { pts: MEADOW, layers: [{ color: "#a8a04a", angle: 1.35, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#6f7d3a", angle: 1.1, gap: 8, w: 2, alpha: 0.45, keep: (_x, y) => y > 620 }, { color: "#e8a080", angle: -0.6, gap: 9, w: 1.8, alpha: 0.4 }, { color: "#f2c14a", angle: 0.2, gap: 9, w: 1.8, alpha: 0.35, keep: (x) => x < 900 }], outline: false },
  { pts: CHIMNEY, layers: tint(CHIMNEY, "#9a5a3a", { gap: 3 }) }, { pts: HOUSE, layers: tint(HOUSE, "#e6c8b0", { gap: 5 }) }, { pts: ROOF, layers: tint(ROOF, "#8a3a2a", { angle: 0.6, gap: 4 }) },
  { pts: DOOR, layers: tint(DOOR, "#5a3a22", { gap: 3 }) }, { pts: WIN, layers: [{ color: "#4a3a4a", angle: 0.8, gap: 3, w: 1.8, alpha: 0.9 }] },
  ...POLES.map((q) => ({ pts: q, layers: tint(q, "#6a4a30", { angle: 1.55, gap: 2.5 }), outline: false as const })),
  ...TREES,
  { pts: PATH, layers: [...tint(PATH, "#d0a888", { angle: 1.5, gap: 6 }), { color: "#f2c890", angle: 0.2, gap: 8, w: 1.8, alpha: 0.4 }], outline: { color: "#8a6a4a" } },
  ...fromMotif(KID).map((s) => ({ ...s, layers: s.layers.map((L) => ({ ...L, gap: L.gap * 0.8 })) })),
  ...fromMotif(TOM).map((s) => ({ ...s, layers: s.layers.map((L) => ({ ...L, gap: L.gap * 0.8 })) })),
  { pts: SCARF_END, layers: [{ color: "#c8322a", angle: 1.3, gap: 2.8, w: 2, alpha: 0.95 }], outline: { color: "#7a1a14", w: 1.2 } },
  { pts: SCARF, layers: [{ color: "#c8322a", angle: 0.4, gap: 2.8, w: 2, alpha: 0.95 }, { color: "#8a1a14", angle: -0.8, gap: 4, w: 1.6, alpha: 0.5 }], outline: { color: "#7a1a14", w: 1.2 } },
  { pts: NEAR, layers: [{ color: "#7a8a3a", angle: 1.4, gap: 4, w: 2.4, alpha: 0.75 }, { color: "#4a5a2a", angle: 1.2, gap: 7, w: 2, alpha: 0.55 }, { color: "#e8a090", angle: -0.5, gap: 10, w: 1.8, alpha: 0.35 }], outline: false },
];
const grass: Line[] = Array.from({ length: 80 }, (_, i) => { const q = rng(300 + i), x = q() * 1600, y = 790 + q() * 105, h = 14 + q() * 20; return { pts: [[x, y], [x + (q() - 0.4) * 8, y - h]] as P[], w: 1.6, color: q() < 0.5 ? "#4a5a2a" : "#b0a050", alpha: 0.8 }; });
const dew: Line[] = Array.from({ length: 30 }, (_, i) => { const q = rng(900 + i), x = q() * 1600, y = 800 + q() * 90; return { pts: [[x, y], [x + 1.5, y]] as P[], w: 2.6, color: "#fff4e0", alpha: 0.9 }; });
const LINE_: Line = { pts: [[HX + 153, HG - 38], [HX + 200, HG - 32], [HX + 253, HG - 34]], w: 1, color: "#4a3a30", alpha: 0.8 }; // the washing line, empty: you took it in

// ---------------------------------------------------------------- what moves
// a blackbird, in profile, facing f
const blackbird = (x: number, y: number, s: number, f: 1 | -1): Shape[] => {
  const Q = (u: number, v: number): P => [x + f * u * s, y - v * s];
  const body = sample([Q(-0.5, 0.35), Q(-0.1, 0.62), Q(0.35, 0.6), Q(0.5, 0.4), Q(0.3, 0.1), Q(-0.3, 0.12)], true, 3), head = oval(Q(0.5, 0.72)[0], Q(0.5, 0.72)[1], 0.2 * s, 0.18 * s, 10);
  const tail: P[] = [Q(-0.4, 0.34), Q(-1.0, 0.72), Q(-0.95, 0.52), Q(-0.3, 0.22)], beak: P[] = [Q(0.66, 0.76), Q(0.92, 0.7), Q(0.66, 0.66)];
  const legs: P[] = [Q(0.02, 0.14), Q(0.06, 0.14), Q(0.06, 0), Q(0.02, 0)];
  const b = (pts: P[]) => ({ pts, layers: [{ color: "#1e1a1e", angle: 0.8, gap: 2.8, w: 2, alpha: 0.9 }, { color: "#4a4050", angle: -0.6, gap: 4, w: 1.6, alpha: 0.5 }] as Layer_[], outline: { color: "#141014", w: 1.2 } });
  return [{ pts: legs, layers: [{ color: "#8a6a40", angle: 1.5, gap: 2, w: 1.4, alpha: 0.9 }], outline: false }, b(tail), b(body), b(head), { pts: beak, layers: [{ color: "#e8a020", angle: 0.2, gap: 2, w: 1.6, alpha: 0.95 }], outline: { color: "#8a5a10", w: 1 } }];
};
const BIRDS = [[290, 836, 50, 1, 0], [520, 872, 56, -1, 0.3], [1160, 858, 54, 1, 0.6], [1430, 830, 46, -1, 0.15]].map(([x, y, s, f, ph]) => ({ h: prehatch(blackbird(x, y, s, f as 1 | -1)), ph }));
const FLYER_AT: P = [760, 866], FLYER = prehatch(blackbird(0, 0, 52, -1).slice(1));
const LEAVES = (() => { const q = rng(77); return Array.from({ length: 10 }, () => ({ x: 960 + q() * 600, y0: 180 + q() * 180, drift: 40 + q() * 60, ph: q(), c: AUTUMN[Math.floor(q() * AUTUMN.length)] })); })();
const smooth01 = (a: number) => a * a * (3 - 2 * a);

export const f10 = sketch({
  id: "f10", title: "L'Aube", loop: LOOP, shapes, lines: [...grass, ...dew, LINE_, TOM_LETTERS, ...faceOf(TS, 2.2), ...faceOf(KS, 2.6)],
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    live(g, () => {
      // the sun's rays, turning slowly, each one brightening and fading
      for (let i = 0; i < 12; i++) { const a = -Math.PI + (i / 11) * Math.PI + 0.04 * Math.sin(TT + i), k = 0.5 + 0.5 * Math.sin(TT * 2 + i * 1.7), r0 = 70, r1 = 230 + 90 * (i % 3); g.pen([[SUN[0] + Math.cos(a) * r0, SUN[1] + Math.sin(a) * r0], [SUN[0] + Math.cos(a) * r1, SUN[1] + Math.sin(a) * r1]], { w: 3, color: "#f8d070", seed: 20 + i, wobble: 0.3, boil: 0, taper: 1, opacity: 0.75 * k * reveal, retrace: false }); }
      // the blackbirds: a hop, a pause, a hop
      BIRDS.forEach((b) => { const p = (T * 3 + b.ph) % 1, hop = p < 0.18 ? Math.sin((p / 0.18) * Math.PI) : 0; replay(g, b.h, { at: [0, -9 * hop], alpha: reveal }); });
      // one flies off, low over the grass and up and away; another comes in and lands in its place
      const out = T > 0.3 && T < 0.62 ? smooth01((T - 0.3) / 0.32) : 0, inn = T > 0.8 ? 1 - smooth01((T - 0.8) / 0.2) : 0;
      const fly = out || inn, [x, y] = out ? [FLYER_AT[0] - 700 * out, FLYER_AT[1] - 560 * out * out - 60 * out] : inn ? [FLYER_AT[0] + 900 * inn, FLYER_AT[1] - 500 * inn * inn] : FLYER_AT;
      replay(g, FLYER, { at: [x, y], alpha: reveal });
      if (fly) { const flap = Math.sin(TT * 36), wy = y - 26; [0, 1].forEach((i) => pencilLive(g, [[x - 10, wy], [x + 14, wy + 2], [x + 8 + i * 6, wy - 34 * flap * (i ? 1 : 0.75)], [x - 4 + i * 6, wy - 30 * flap * (i ? 1 : 0.75)]], i ? "#1e1a1e" : "#3a343e", { gap: 2.5, seed: 70 + i, alpha: 0.9 * reveal, outline: "#141014" })); }
      else g.pen([[x - 2, y - 6], [x - 2, y]], { w: 1.8, color: "#8a6a40", seed: 72, wobble: 0.2, boil: 0, taper: 0, opacity: 0.9 * reveal, retrace: false }); // its legs, when it stands
      // leaves coming down off the edge of the wood
      LEAVES.forEach((l, i) => { const p = (T + l.ph) % 1, yy = l.y0 + p * 420, xx = l.x + Math.sin(p * 9 + i) * 18 - p * l.drift, a = Math.sin(p * 11 + i) * 0.8; pencilLive(g, [[xx - 7 * Math.cos(a), yy - 7 * Math.sin(a)], [xx + 3, yy - 4], [xx + 7 * Math.cos(a), yy + 7 * Math.sin(a)], [xx - 3, yy + 4]], l.c, { gap: 2.5, seed: 80 + i, alpha: Math.sin(p * Math.PI) * 0.95 * reveal }); });
    });
  },
});
