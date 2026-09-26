// LES GRANDS BOIS PAGE 7 · LA TANIÈRE. One idea: under the roots of a beech, Tom asleep among four
// fox cubs, his ears gone pointed, and the white fox waiting at the mouth of the den.
// Coloured pencil, night. The den is a warm brown hollow, roots across its roof; the mouth opens on
// the right onto the Prussian blue night and a pool of moonlight. On a bed of dry leaves, four cubs
// curled up and Tom on his back among them, rust down on his pointed ears; the child kneels beside
// him, a hand on his shoulder. In the mouth of the den the white fox sits, facing in.
// What moves: the cubs breathing, Tom's ear twitching, the white fox's tail.
import { oval, rng, sample, tube, turn, type P } from "./core";
import { beast } from "./beasts";
import { dense, figure, overlapping, rotate, type Motif } from "./figures";
import { blob, bounds, inside, mix } from "./gallery";
import { fromMotif, live, pencilLive, prehatch, replay, sketch, tint, type Shape } from "./pencil";
import { masked } from "./west";

const LOOP = 180;
type Line = { pts: P[]; w: number; color: string; alpha: number };

// ---------------------------------------------------------------- helpers
// a place kept free for something drawn live: whatever is behind it is hatched around it
const holes = (sh: Shape[]): Shape[] => sh.map((s) => ({ pts: s.pts, layers: [], outline: false }));
// a fox cub asleep, curled on its side: the tail wrapped round the front, the nose tucked into it
const curled = (cx: number, cy: number, r: number, f: 1 | -1, seed: number, coat = "#c8642a"): Shape[] => {
  const X = (u: number) => cx + f * u * r, hy = cy - 0.62 * r;
  const body = blob(cx, cy - 0.5 * r, r, 0.5 * r, seed, 0.05, 18);
  const head = sample([[X(0.2), hy - 0.05 * r], [X(0.36), hy - 0.3 * r], [X(0.62), hy - 0.28 * r], [X(0.86), hy], [X(0.96), hy + 0.2 * r], [X(0.7), hy + 0.3 * r], [X(0.32), hy + 0.24 * r]], true, 3);
  const ear = (a: number, b: number, t: number): P[] => [[X(a), hy - 0.2 * r], [X(t), hy - 0.62 * r], [X(b), hy - 0.24 * r]];
  const tail = sample([[X(-0.98), cy - 0.42 * r], [X(-0.72), cy - 0.02 * r], [X(0), cy + 0.03 * r], [X(0.72), cy - 0.02 * r], [X(1.05), cy - 0.22 * r], [X(1.0), cy - 0.4 * r], [X(0.72), cy - 0.26 * r], [X(0.1), cy - 0.2 * r], [X(-0.5), cy - 0.22 * r], [X(-0.82), cy - 0.44 * r]], true, 3);
  const tip = oval(X(0.9), cy - 0.2 * r, 0.17 * r, 0.14 * r, 10);
  const eye: P[] = [[X(0.52), hy - 0.04 * r], [X(0.6), hy - 0.01 * r], [X(0.68), hy - 0.02 * r], [X(0.6), hy + 0.01 * r]];
  const dark = mix(coat, "#2a1a14", 0.45), line = { color: mix(coat, "#2a1a14", 0.6) };
  return [
    { pts: body, layers: tint(body, coat, { seed, gap: 5.5 }), outline: line },
    { pts: ear(0.3, 0.44, 0.3), layers: tint(ear(0.3, 0.44, 0.3), dark, { gap: 3 }), outline: line },
    { pts: head, layers: tint(head, coat, { seed: seed + 1, gap: 4.5 }), outline: line },
    { pts: ear(0.48, 0.64, 0.56), layers: tint(ear(0.48, 0.64, 0.56), dark, { gap: 3 }), outline: line },
    { pts: eye, layers: [{ color: "#2a1a14", angle: 0.2, gap: 2, w: 1.4, alpha: 0.9 }], outline: { color: "#2a1a14", w: 1.2 } },
    { pts: tail, layers: tint(tail, mix(coat, "#e0a060", 0.15), { seed: seed + 2, gap: 5 }), outline: line },
    { pts: tip, layers: [{ color: "#e8dcc4", angle: 0.4, gap: 4, w: 1.6, alpha: 0.6 }], outline: line },
  ];
};
// legs bent at hip and knee (degrees; + folds the lower leg back, - brings the thigh forward)
const bend = (m: Motif, x: number, g: number, h: number, f: 1 | -1, hipDeg: number, kneeDeg: number): Motif => {
  const Hp: P = [x, g - 0.42 * h], K: P = [x, g - 0.2 * h];
  const map = (p: P): P => { let q = p; if (p[1] > K[1]) q = turn([q], K[0], K[1], kneeDeg * f)[0]; if (p[1] > Hp[1]) q = turn([q], Hp[0], Hp[1], hipDeg * f)[0]; return q; };
  const closed = (q: P[]) => dense([...q, q[0]], 5).slice(0, -1).map(map);
  const keep = m.fills.map((fl) => fl.color !== "#3b2a20"); // the shoes: put back by hand
  return { fills: m.fills.filter((_, i) => keep[i]).map((fl) => ({ ...fl, pts: closed(fl.pts) })), lines: [], parts: m.parts.filter((_, i) => keep[i]).map(closed) };
};
const shift = (m: Motif, dx: number, dy: number): Motif => ({ fills: m.fills.map((f) => ({ ...f, pts: f.pts.map(([x, y]) => [x + dx, y + dy] as P) })), lines: [], parts: m.parts.map((q) => q.map(([x, y]) => [x + dx, y + dy] as P)) });

// ---------------------------------------------------------------- the den
const EARTH: P[] = [[0, 0], [1600, 0], [1600, 900], [0, 900]];
const HOLLOW: P[] = sample([[0, 900], [0, 560], [40, 330], [180, 170], [420, 76], [800, 44], [1180, 70], [1420, 170], [1560, 330], [1600, 470], [1600, 900]], true, 4);
const outside = (x: number, y: number) => !inside(HOLLOW, x, y); // the earth round the hollow
const inHollow = (x: number, y: number, k: number) => ((x - 760) / 820) ** 2 + ((y - 660) / 600) ** 2 > k;
const MOUTH: P[] = sample([[1290, 826], [1296, 620], [1330, 490], [1410, 410], [1510, 400], [1580, 470], [1612, 560], [1612, 826]], true, 4);
const MOON_AT: P = [1440, 500];
const OUT_GROUND: P[] = [[1280, 730], [1380, 716], [1480, 724], [1620, 712], [1620, 830], [1280, 830]];
const TRUNKS: P[][] = [tube([[1560, 730], [1552, 600], [1570, 470], [1596, 380]], 22, 14, false), tube([[1330, 726], [1318, 640]], 5, 2)];
const STARS: P[][] = [[1420, 460], [1460, 540], [1500, 600], [1400, 620], [1580, 640], [1470, 660]].map(([x, y]) => oval(x, y, 2.8, 2.8, 6));
const FLOOR: P[] = [[0, 740], [300, 730], [700, 742], [1100, 780], [1600, 826], [1600, 900], [0, 900]];
const POOL: P[] = [[1290, 826], [1620, 826], [1620, 900], [1120, 900]];
const BED: P[] = blob(740, 792, 520, 74, 44, 0.1, 24);
const ROOTS: P[][] = [
  tube([[120, 110], [260, 180], [330, 300], [296, 420], [340, 540]], 34, 6),
  tube([[520, 30], [566, 140], [520, 236], [600, 310]], 28, 5),
  tube([[860, 10], [838, 120], [900, 206], [874, 300]], 30, 5),
  tube([[1180, 40], [1116, 160], [1170, 252], [1128, 340]], 26, 4),
  tube([[1600, 150], [1480, 250], [1392, 330], [1336, 480]], 40, 10),
  tube([[0, 380], [84, 500], [64, 660]], 32, 8),
];
const PEBBLES: P[][] = [[200, 460, 22, 15], [1010, 300, 16, 11], [360, 640, 14, 10], [1180, 470, 20, 13], [700, 230, 13, 9], [1250, 640, 15, 10]].map(([x, y, a, b], i) => blob(x, y, a, b, 60 + i, 0.2, 10));
// the layers of the earth, and the little roots hanging from the big ones
const strata: Line[] = [[60, 330, 520], [120, 520, 420], [980, 400, 300], [900, 560, 360], [420, 420, 260]].map(([x, y, l], i) => { const q = rng(90 + i); return { pts: Array.from({ length: 6 }, (_, k) => [x + (l * k) / 5, y + (q() - 0.5) * 14 + k * 3] as P), w: 1.4, color: "#4a2e1e", alpha: 0.55 }; });
const rootlets: Line[] = (() => { const q = rng(71), out: Line[] = []; for (let i = 0; i < 34; i++) { const x = 100 + q() * 1250, y = 110 + q() * 220, n = 3 + Math.floor(q() * 4), pts: P[] = [[x, y]]; for (let k = 1; k <= n; k++) pts.push([x + (q() - 0.5) * 26, y + k * (16 + q() * 14)]); out.push({ pts, w: 1.2, color: "#3a2618", alpha: 0.75 }); } return out; })();
const floorLitter: Line[] = Array.from({ length: 40 }, (_, i) => { const q = rng(400 + i), x = 60 + q() * 1450, y = 800 + q() * 95, a = q() * 3, l = 8 + q() * 12; return { pts: [[x, y], [x + Math.cos(a) * l, y + Math.sin(a) * l * 0.4]] as P[], w: 1.6, color: q() < 0.5 ? "#6a3a1a" : "#b07a3a", alpha: 0.8 }; });

// ---------------------------------------------------------------- Tom, on his back, head to the right
const TH = 420, TX = 580, FLOOR_Y = 776, TG = FLOOR_Y - 0.1 * TH;
const tomLook = { x: TX, g: TG, h: TH, f: -1 as const, robe: "tunic" as const, head: "bare" as const, cloth: "#6a8ab0", cloth2: "#5a4a3a", hair: "#7a5230", ink: "#000", near: [0.08, 0.3] as [number, number], far: [0.1, 0.2] as [number, number] };
const TOM = rotate(figure(tomLook).m, [TX, TG], 90);
const TS = (u: number, v: number): P => [TX + v * TH, TG - u * TH]; // figure units onto the page, lying down
const EAR: P[] = [TS(0.035, 0.955), TS(0.07, 1.13), TS(-0.05, 0.925)]; // pointed, and pointing the way a fox's would
const EAR_BASE = TS(-0.03, 0.94);
const earShape = (pts: P[]): Shape[] => [{ pts, layers: [{ color: "#c8642a", angle: 0.5, gap: 3, w: 1.8, alpha: 0.9 }, { color: "#8a3a1a", angle: -0.8, gap: 4.5, w: 1.6, alpha: 0.5 }], outline: { color: "#6a2a14" } }];
const tomFace: Line[] = [
  { pts: [TS(0.024, 0.93), TS(0.032, 0.922), TS(0.042, 0.93)], w: 1.8, color: "#3a2618", alpha: 0.9 }, // the eye, shut
  { pts: [TS(0.052, 0.925), TS(0.066, 0.9), TS(0.05, 0.897)], w: 1.4, color: "#6a4a3a", alpha: 0.8 },
  { pts: [TS(0.03, 0.965), TS(0.052, 0.958)], w: 1.3, color: "#6a4a3a", alpha: 0.6 }, // a frown in his sleep
  { pts: [TS(0.012, 0.878), TS(0.022, 0.886)], w: 2.6, color: "#7a5a3a", alpha: 0.6 }, // earth on the cheek
  { pts: [TS(0.03, 0.872), TS(0.036, 0.882)], w: 2.2, color: "#7a5a3a", alpha: 0.55 },
];
const tomShapes = fromMotif(TOM), tomArm = tomShapes.splice(-2); // his near arm lies over the cub on his chest

// ---------------------------------------------------------------- the cubs
const cub = (x: number, y: number, r: number, f: 1 | -1, seed: number, ph: number, coat?: string) => ({ c: curled(x, y, r, f, seed, coat), at: [x, y] as P, ph });
// two of them breathe (drawn live); the two half hidden behind Tom sleep on in the plate
const CUBS = [
  cub(862, 738, 104, 1, 11, 0, "#b85a28"),     // behind his shoulders
  cub(430, 752, 100, -1, 21, 0.55, "#c26630"), // behind his feet
  cub(730, 694, 76, 1, 31, 0.25),              // on his chest, under his arm
  cub(600, 872, 104, 1, 41, 0.8, "#c8703a"),   // in front, at his knees
];
// ---------------------------------------------------------------- the child, kneeling, facing Tom
const KH = 520, KX = 1130;
const kidLook = { x: KX, g: 0, h: KH, f: -1 as const, robe: "tunic" as const, head: "bare" as const, cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.5, 0.8] as [number, number], far: [0.3, 0.55] as [number, number] };
const KG = 884, KDY = KG + 0.135 * KH; // the shins flat on the floor
const KID = shift(bend(figure(kidLook).m, KX, 0, KH, -1, 0, 90), 0, KDY);
const KS = (u: number, v: number): P => [KX - u * KH, KDY - v * KH];
const SHOE: P[] = oval(KX + 0.2 * KH, KG - 0.035 * KH, 0.05 * KH, 0.03 * KH, 10);
const kidFace: Line[] = [
  { pts: [KS(0.032, 0.927), KS(0.05, 0.929)], w: 2.2, color: "#3a2618", alpha: 0.9 },
  { pts: [KS(0.064, 0.925), KS(0.074, 0.901), KS(0.062, 0.898)], w: 1.6, color: "#6a4a3a", alpha: 0.8 },
  { pts: [KS(0.03, 0.95), KS(0.056, 0.944)], w: 1.6, color: "#3a2618", alpha: 0.7 }, // the brow, drawn in
  { pts: [KS(0.035, 0.87), KS(0.05, 0.868)], w: 1.4, color: "#8a4a3a", alpha: 0.6 },
];
const MOON_RIM: Line = { pts: [...oval(MOON_AT[0], MOON_AT[1], 44, 44, 24), oval(MOON_AT[0], MOON_AT[1], 44, 44, 24)[0]], w: 1.2, color: "#8a94b0", alpha: 0.7 };
const CORD: Line = { pts: [KS(-0.04, 0.83), KS(-0.02, 0.77), KS(0.01, 0.74)], w: 1.1, color: "#6a5a4a", alpha: 0.8 };
const WHISTLE: P[] = [KS(0.0, 0.748), KS(0.018, 0.742), KS(0.02, 0.7), KS(0.004, 0.702)]; // on its cord at the neck

// ---------------------------------------------------------------- the white fox, in the mouth of the den
// sitting up, facing in, its tail wrapped round its front feet. In figure units: u forward, v up, s its height to the ears
const sitFox = (x: number, g: number, s: number, f: 1 | -1) => {
  const S = (u: number, v: number): P => [x + f * u * s, g - v * s], Sp = (q: number[][]) => q.map(([u, v]) => S(u, v));
  const body = sample(Sp([[-0.26, 0.02], [-0.34, 0.14], [-0.3, 0.3], [-0.17, 0.44], [-0.02, 0.56], [0.08, 0.63], [0.17, 0.57], [0.16, 0.38], [0.12, 0.14], [0.06, 0.02]]), true, 3);
  const legs = [tube([S(0.03, 0.3), S(0.05, 0.12), S(0.05, 0.015)], 0.03 * s, 0.022 * s), tube([S(0.11, 0.32), S(0.13, 0.12), S(0.13, 0.015)], 0.034 * s, 0.024 * s)];
  const head = sample(Sp([[0.04, 0.71], [0.08, 0.8], [0.18, 0.82], [0.27, 0.76], [0.43, 0.705], [0.41, 0.67], [0.25, 0.645], [0.1, 0.62]]), true, 3);
  const ears = [Sp([[0.06, 0.79], [0.075, 0.99], [0.14, 0.815]]), Sp([[0.12, 0.815], [0.18, 1.0], [0.21, 0.79]])];
  const eye = Sp([[0.2, 0.745], [0.24, 0.752], [0.25, 0.74], [0.21, 0.736]]), nose = oval(S(0.425, 0.69)[0], S(0.425, 0.69)[1], 0.016 * s, 0.013 * s, 8);
  const tail = sample(Sp([[-0.3, 0.22], [-0.39, 0.07], [-0.22, -0.005], [0.1, -0.01], [0.32, 0.02], [0.38, 0.08], [0.3, 0.1], [0.1, 0.055], [-0.14, 0.06], [-0.25, 0.15]]), true, 3);
  const coat = (pts: P[], k = 0): Shape => ({ pts, layers: [{ color: "#e2ded8", angle: 0.9 + k, gap: 5.5, w: 1.8, alpha: 0.55 }, { color: "#8a94b0", angle: -0.4 + k, gap: 5, w: 1.6, alpha: 0.55, keep: shadeOf(pts) }], outline: { color: "#4a5070", w: 1.6 } });
  return { still: [coat(legs[0], 0.2), coat(body), coat(legs[1], 0.2), coat(ears[0]), coat(head, 0.3), coat(ears[1]), { pts: eye, layers: [{ color: "#1a1a2a", angle: 0, gap: 2, w: 1.4, alpha: 0.9 }], outline: { color: "#1a1a2a", w: 1.2 } }, { pts: nose, layers: [{ color: "#2a2a3a", angle: 0.5, gap: 2, w: 1.6, alpha: 0.9 }], outline: { color: "#2a2a3a", w: 1 } }] as Shape[], tail, base: S(-0.3, 0.12) };
};
// moonlight comes in from the mouth, on the right: the side away from it is the shaded one
const shadeOf = (pts: P[]) => { const b = bounds(pts), cx = (b.x0 + b.x1) / 2, cy = (b.y0 + b.y1) / 2, R = Math.max(b.x1 - b.x0, b.y1 - b.y0); return (x: number, y: number) => -(x - cx) * 0.7 + (y - cy) * 0.7 > -0.1 * R; };
const WF = sitFox(1440, 824, 250, -1);
const TAIL_BASE = WF.base;

// ---------------------------------------------------------------- the page, back to front
const BREATHE = [1, 3], cubHoles = CUBS.map((c, i) => (BREATHE.includes(i) ? holes(c.c) : c.c));
const earHole = holes(earShape(EAR));
const shapes: Shape[] = [
  { pts: EARTH, layers: [{ color: "#3a2a20", angle: 1.2, gap: 4, w: 2.4, alpha: 0.85, keep: outside }, { color: "#5a3a26", angle: -0.5, gap: 6, w: 2, alpha: 0.6, keep: outside }], outline: false },
  { pts: HOLLOW, layers: [{ color: "#a8743f", angle: 1.1, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#7a5030", angle: -0.35, gap: 6, w: 2, alpha: 0.5 }, { color: "#5a3a26", angle: 0.3, gap: 6, w: 2, alpha: 0.55, keep: (x, y) => inHollow(x, y, 0.35) }, { color: "#3e2a1e", angle: 1.5, gap: 6, w: 2, alpha: 0.6, keep: (x, y) => inHollow(x, y, 0.7) }], outline: { color: "#3a2618", w: 2 } },
  ...PEBBLES.map((p, i) => ({ pts: p, layers: tint(p, "#8a7a6a", { seed: i, gap: 4 }), outline: { color: "#4a3a30" } })),
  { pts: MOUTH, layers: [{ color: "#1e2a4a", angle: 0.3, gap: 4, w: 2.4, alpha: 0.85, keep: (x, y) => Math.hypot(x - MOON_AT[0], y - MOON_AT[1]) > 90 }, { color: "#4a3a6a", angle: -0.7, gap: 5.5, w: 2, alpha: 0.55, keep: (x, y) => Math.hypot(x - MOON_AT[0], y - MOON_AT[1]) > 46 }, { color: "#1e2a4a", angle: 1.2, gap: 6, w: 2, alpha: 0.5, keep: (x, y) => Math.hypot(x - MOON_AT[0], y - MOON_AT[1]) > 150 }], outline: false },
  ...STARS.map((p) => ({ pts: p, layers: [], outline: false as const })),
  ...TRUNKS.map((p) => ({ pts: p, layers: [{ color: "#141c34", angle: 1.5, gap: 3, w: 2.2, alpha: 0.9 }], outline: false as const })),
  { pts: OUT_GROUND, layers: [{ color: "#8a94b0", angle: 0.2, gap: 5, w: 2, alpha: 0.55 }, { color: "#2a3458", angle: -0.3, gap: 7, w: 1.8, alpha: 0.5 }], outline: false },
  ...ROOTS.map((p, i) => ({ pts: p, layers: tint(p, "#5a3a26", { angle: 0.4 + i * 0.3, gap: 4, dark: 0.5 }), outline: { color: "#2a1a12", w: 1.8 } })),
  { pts: FLOOR, layers: [{ color: "#7a5234", angle: 0.25, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#3e2a1e", angle: -0.5, gap: 6, w: 2, alpha: 0.55, keep: (x, y) => x < 1150 || y > 880 }], outline: false },
  { pts: POOL, layers: [{ color: "#9aa4bc", angle: 0.9, gap: 5, w: 2, alpha: 0.55 }, { color: "#7a5234", angle: 0.25, gap: 8, w: 1.8, alpha: 0.4 }], outline: false },
  { pts: BED, layers: [{ color: "#b07a3a", angle: 0.7, gap: 4.5, w: 2, alpha: 0.75 }, { color: "#8a4a22", angle: -0.6, gap: 6, w: 1.8, alpha: 0.6 }], outline: { color: "#5a3a22" } },
  ...cubHoles[0], ...cubHoles[1],
  ...tomShapes, ...earHole,
  ...cubHoles[2], ...tomArm, ...cubHoles[3],
  ...fromMotif(KID), { pts: SHOE, layers: tint(SHOE, "#3b2a20"), outline: { color: "#2a1a12" } }, { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.9 }], outline: { color: "#8a7a60", w: 1 } },
  ...WF.still,
];
const bedLeaves: Line[] = Array.from({ length: 30 }, (_, i) => { const q = rng(500 + i), a = q() * Math.PI * 2, x = 740 + Math.cos(a) * 500 * q(), y = 792 + Math.sin(a) * 64 * q(), l = 7 + q() * 8; return { pts: [[x, y], [x + l, y - l * 0.3 * (q() - 0.5)]] as P[], w: 1.6, color: q() < 0.5 ? "#6a3a1a" : "#c08a3a", alpha: 0.8 }; });

// ---------------------------------------------------------------- what moves
// every live thing is masked by what stands in front of its place on the page
const frontOf = (hole: Shape[]) => { const i = shapes.indexOf(hole[hole.length - 1]); return overlapping(shapes.slice(i + 1).map((s) => s.pts), bounds(hole.flatMap((s) => s.pts)), 6); };
const CUB_LIVE = BREATHE.map((i) => ({ ...CUBS[i], h: prehatch(CUBS[i].c), hide: frontOf(cubHoles[i]) }));
const EAR_HIDE = frontOf(earHole);


export const f07 = sketch({
  id: "f07", title: "La Tanière", loop: LOOP, shapes, lines: [...strata, ...rootlets, ...floorLitter, ...bedLeaves, ...tomFace, ...kidFace, CORD, MOON_RIM],
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    live(g, () => {
      // the two cubs in the open breathe, each at its own pace, two breaths a loop
      CUB_LIVE.forEach((c) => {
        const s = 1 + 0.018 * Math.sin(TT * 2 + c.ph * Math.PI * 2), [cx, cy] = c.at;
        masked(g, c.hide, () => { g.push(cx * (1 - s), cy * (1 - s), s); replay(g, c.h, { alpha: reveal }); g.pop(); });
      });
      // Tom's ear twitches in his sleep, twice a loop, a little shake each time
      const tw = (p: number, a: number, b: number) => (p > a && p < b ? Math.sin(((p - a) / (b - a)) * Math.PI * 3) * Math.sin(((p - a) / (b - a)) * Math.PI) : 0);
      const deg = 9 * (tw(T, 0.22, 0.3) + 0.7 * tw(T, 0.64, 0.7));
      masked(g, EAR_HIDE, () => { const ear = turn(EAR, EAR_BASE[0], EAR_BASE[1], deg); pencilLive(g, ear, "#c8642a", { angle: 0.5, gap: 3, seed: 70, alpha: 0.9 * reveal, outline: "#6a2a14" }); });
      // the white fox's tail sweeps the moonlit floor, once a loop
      const tail = turn(WF.tail, TAIL_BASE[0], TAIL_BASE[1], -5 + 5 * Math.cos(TT)); // the tip lifts off the floor and comes down
      pencilLive(g, tail, "#c4c8d6", { angle: 0.8, gap: 4.5, seed: 90, alpha: 0.7 * reveal, outline: "#4a5070" });
    });
  },
});
