// CORBENIC PAGE 10 · LE REPOS. One idea: the king lying still at last, carried off on the water.
// The gold comes back into the book. A morning lake under a burnished sky, the far shore in low
// hills; mist lying on the water. In the middle the barge, Arthur on his back in it, crowned, hands
// crossed, his face at rest. On the near shore among the reeds, the knight watching it go, the cup
// in his hand.
// What moves: the barge rocking on the swell, the mist drifting, the ripples, the reeds, the glint.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, lay, paintMotif, rotate, type Motif } from "./figures";
import { blob, mix } from "./gallery";
import { diaper, gilt, glint, hand, hills } from "./manuscript";
import { masked, page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0.2, H = hand(ROT), INK = H.ink;
const WATER = mix(H.a, "#5a7a9a", 0.35), WATER2 = mix(H.a, "#1e3050", 0.3), SHORE = "#7a7048", REED = "#5a6a38";
const B = border(ROT, [0, 44]);
const FROM: P = [900, 520];
const LAKE_TOP = 470;

// ---------------------------------------------------------------- the lake
const SKY: P[] = [[44, 40], [1556, 40], [1556, LAKE_TOP + 10], [44, LAKE_TOP + 10]];
const FAR = hills(44, 1556, LAKE_TOP - 6, 8, 30, 9, LAKE_TOP + 12);
const SKY_SEEN: P[] = [[44, 40], [1556, 40], ...FAR.pts.slice(0, -2).reverse()];
const LAKE: P[] = [[44, 870], [44, LAKE_TOP + 8], [1556, LAKE_TOP + 8], [1556, 870]];
const DEEP: P[][] = [[[44, 600], [1556, 580], [1556, 680], [44, 700]]];
const NEAR_SHORE: P[] = [[44, 870], [44, 700], [180, 690], [340, 720], [480, 780], [600, 870]];
const r = rng(19);
const REEDS = Array.from({ length: 34 }, (_, i) => { const x = 60 + i * 15 + r() * 8, g = 760 + (i % 4) * 26 + r() * 8; return { x, g, h: 70 + r() * 60, lean: (r() - 0.4) * 14, ph: r() * 6.28 }; }).filter((q) => q.x < 580 - (870 - q.g) * 0.3);
// the barge and the king in it
const BARGE_C: P = [980, 590];
const barge = (dy: number, tilt: number) => {
  const [cx, cy] = [BARGE_C[0], BARGE_C[1] + dy], T = (p: P): P => { const a = tilt, x = p[0] - cx, y = p[1] - cy; return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]; };
  const hull: P[] = ([[cx - 300, cy - 30], [cx - 250, cy + 10], [cx - 120, cy + 34], [cx + 120, cy + 34], [cx + 250, cy + 10], [cx + 310, cy - 40], [cx + 280, cy - 22], [cx - 270, cy - 18]] as P[]).map(T);
  const gunwale: P[] = ([[cx - 280, cy - 20], [cx - 120, cy - 14], [cx + 120, cy - 14], [cx + 290, cy - 26]] as P[]).map(T);
  const pall: P[] = ([[cx - 210, cy - 16], [cx - 190, cy - 44], [cx + 190, cy - 44], [cx + 210, cy - 16]] as P[]).map(T);
  const king: Motif = rotate(figure({ x: cx + 160, g: cy - 30, h: 350, robe: "long", head: "crown", cloth: "#3a3a6a", hair: "#9a8a6a", skin: "#d9ccb4", gold: H.gold, ink: INK, near: [0.1, 0.2], far: [0.05, 0.1] }).m, [cx + 160, cy - 30], -90 + (tilt * 180) / Math.PI);
  // the near side of the hull, from the gunwale down: drawn over the king, so he lies in the boat
  const side: P[] = [...gunwale, ...([[cx + 250, cy + 10], [cx + 120, cy + 34], [cx - 120, cy + 34], [cx - 250, cy + 10]] as P[]).map(T)];
  return { hull, gunwale, pall, king, side };
};
// the knight on the shore, the cup in his hand
const KNIGHT = figure({ x: 300, g: 800, h: 460, f: 1, robe: "armor", head: "coif", cloth: "#e8e0cc", ink: INK, near: [0.7, 1.2], far: [0.1, 0.3] });
const CUP: P[] = (() => { const [x, y] = [KNIGHT.hands.near[0] + 16, KNIGHT.hands.near[1] - 4]; return [[x - 18, y + 16], [x - 3, y + 10], [x - 3, y - 4], [x - 21, y - 12], [x - 23, y - 30], [x - 14, y - 40], [x, y - 46], [x + 14, y - 40], [x + 23, y - 30], [x + 21, y - 12], [x + 3, y - 4], [x + 3, y + 10], [x + 18, y + 16]]; })();
const CROSS: P[][] = [[[292, 452], [308, 452], [308, 566], [292, 566]], [[256, 492], [344, 492], [344, 508], [256, 508]]];

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const knight = lay(KNIGHT.m, { at: [44, 74], seed: 3000, ink: INK, ph: 6, from: FROM });
const B0 = barge(0, 0), fore = [...KNIGHT.m.parts, NEAR_SHORE];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: LAKE_TOP }, 46);
const RIPPLES: P[][] = Array.from({ length: 22 }, (_, i) => { const y = LAKE_TOP + 30 + (i % 11) * 34, x = 560 + ((i * 263) % 960); return [[x, y], [x + 26, y - 3], [x + 52, y]]; });
const scene: Omit<Stroke, "at">[] = [
  st(FAR.pts.slice(0, -2), 1.4), ...FAR.ledges.map((l) => st(l, 1, 0.5)),
  st([[44, LAKE_TOP + 8], [1556, LAKE_TOP + 8]], 1.2, 0.8, INK, fore),
  ...RIPPLES.map((l) => st(l, 1.2, 0.55, mix(WATER, "#ffffff", 0.5), [...fore, B0.hull])),
  st(NEAR_SHORE.slice(1), 1.5, 0.9, INK, KNIGHT.m.parts),
  ...knight.strokes, edge(CUP, 1.3),
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.42, mix(H.gold, INK, 0.45), [FAR.pts])), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 3, 0.6, mix(H.gold, INK, 0.35), [FAR.pts]))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  gilt(SKY, ROT, [28, 60], 500, { ph: 0, from: [800, 40] }),
  flat(FAR.pts, mix("#8a8a5a", H.a, 0.2), 1, [30, 62], 501),
  flat(LAKE, WATER, 1, [30, 62], 502), ...DEEP.map((q, i) => flat(q, WATER2, 2, [32, 64], 503 + i)),
  flat(NEAR_SHORE, SHORE, 3, [34, 66], 510),
  ...knight.washes, ...CROSS.map((q, i) => flat(q, H.b, 7, [46, 76], 520 + i)), gilt(CUP, 0.1, [46, 76], 525, { ph: 7, from: FROM }),
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const MIST = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 200 + ((i * 431) % 1100), y: LAKE_TOP + 20 + (i % 4) * 38, w: 380 + (i % 3) * 120, dir: i % 2 ? -1 : 1, seed: 700 + i }));
export const c10 = page({
  id: "c10", title: "Le Repos", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [52, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, bob = 3 * Math.sin(TT * 2), tilt = 0.012 * Math.sin(TT * 2 + 1);
    const Bt = barge(bob, tilt);
    g.group("plain", () => {
      g.fill(blob(BARGE_C[0], BARGE_C[1] + 44, 320, 16, 60, 0.1, 18), WATER2, 0.6 * reveal); // its reflection, dark under it
      paintMotif(g, { fills: [{ pts: Bt.hull, color: "#4a3020" }, { pts: Bt.pall, color: "#6a1a14" }], lines: [{ pts: [...Bt.pall, Bt.pall[0]], w: 1.3 }], parts: [Bt.hull, Bt.pall] }, { ink: INK, seed: 800, reveal });
    });
    paintMotif(g, Bt.king, { ink: INK, seed: 900, reveal });
    paintMotif(g, { fills: [{ pts: Bt.side, color: "#5a3a22" }], lines: [{ pts: [...Bt.hull, Bt.hull[0]], w: 1.6 }, { pts: Bt.gunwale, w: 3, color: H.gold }], parts: [Bt.side] }, { ink: INK, seed: 850, reveal });
    // the mist, banks of it drifting to and fro over the water
    g.group("plain", () => masked(g, [[[-50, -50], [1650, -50], [1650, LAKE_TOP + 4], [-50, LAKE_TOP + 4]], NEAR_SHORE, ...KNIGHT.m.parts], () => MIST.forEach((m, i) => g.fill(blob(m.x + m.dir * 60 * Math.sin(TT + i), m.y, m.w / 2, 14, m.seed, 0.25, 20), "#f4f0e4", 0.4 * reveal))));
    // the reeds, stirred by the same air
    g.group("plain", () => REEDS.forEach((q, i) => { const lean = q.lean + 5 * Math.sin(TT + q.ph); g.pen([[q.x, q.g], [q.x + lean * 0.4, q.g - q.h * 0.6], [q.x + lean, q.g - q.h]], { w: 2.2, color: REED, seed: 1000 + i, wobble: 0.2, boil: 0, taper: 1, opacity: 0.95 * reveal, retrace: false }); if (i % 3 === 0) g.pen([[q.x + lean, q.g - q.h], [q.x + lean * 1.05, q.g - q.h - 18]], { w: 5, color: "#6a4a2a", seed: 1100 + i, wobble: 0.1, boil: 0, opacity: reveal, retrace: false }); }));
    if (reveal < 1) return;
    glint(g, [SKY_SEEN], t, LOOP, ROT);
    borderGlint(g, t, LOOP, ROT);
  },
});
