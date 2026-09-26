// LES GRANDS BOIS PAGE 1 · LA LISIÈRE. One idea: at sundown a little boy follows a white fox into
// the wood, while his older sibling stands at the other end of the meadow.
// Coloured pencil, autumn. On the left Grandmother's house, washing on the line; the meadow going up
// to the edge of the Grands Bois, big trees in rust and ochre; the path going in on the left; on the
// right, at the first trees, Tom in his red cap looking back, and ahead of him the white fox. In the
// foreground, seen from behind, the child, the bone whistle in one hand. The sky going orange.
// What moves: the washing on the line, leaves coming down, the fox's tail, Tom's wave.
import { rng, type P } from "./core";
import { beast } from "./beasts";
import { figure } from "./figures";
import { blob } from "./gallery";
import { fromMotif, live, pencilLive, prehatch, replay, sketch, tint, type Shape } from "./pencil";

const LOOP = 180;
const HORIZON = 470;

// ---------------------------------------------------------------- the land
const SKY: P[] = [[0, 0], [1600, 0], [1600, HORIZON + 40], [0, HORIZON + 40]];
const HILLS: P[] = [[0, 430], [260, 380], [520, 420], [760, 360], [1000, 410], [1200, 370], [1600, 400], [1600, 520], [0, 520]];
const MEADOW: P[] = [[0, 520], [300, 500], [700, 520], [1100, 505], [1600, 520], [1600, 900], [0, 900]];
const NEAR: P[] = [[0, 760], [500, 740], [1000, 770], [1600, 750], [1600, 900], [0, 900]];
// the wood's edge: a wall of big trees across the back right
const r = rng(12);
const tree = (x: number, g: number, h: number, seed: number, cols: string[]): Shape[] => {
  const q = rng(seed), trunk: P[] = [[x - h * 0.05, g], [x - h * 0.035, g - h * 0.5], [x - h * 0.02, g - h * 0.7], [x + h * 0.02, g - h * 0.7], [x + h * 0.035, g - h * 0.5], [x + h * 0.05, g]];
  const crowns = [0, 1, 2, 3].map((i) => blob(x + (q() - 0.5) * h * 0.35, g - h * (0.62 + q() * 0.3), h * (0.2 + q() * 0.1), h * (0.16 + q() * 0.08), seed + i, 0.25, 14));
  return [{ pts: trunk, layers: tint(trunk, "#5a4636", { angle: 1.4, gap: 5 }) }, ...crowns.map((c, i) => ({ pts: c, layers: tint(c, cols[i % cols.length], { seed: seed + i, gap: 5 }) }))];
};
const AUTUMN = ["#c8642a", "#d9a441", "#8a5a2a", "#6f7d3a", "#a8452a"];
const TREES: Shape[] = [];
for (let i = 0; i < 11; i++) { const x = 820 + i * 78 + (r() - 0.5) * 30, h = 330 + r() * 120; TREES.push(...tree(x, 520 + (i % 2) * 8, h, 100 + i * 7, AUTUMN.slice(i % 3).concat(AUTUMN))); }
const PATH: P[] = [[560, 900], [640, 900], [700, 640], [760, 540], [790, 520], [772, 520], [730, 560], [640, 700]];
const WOOD_DARK: P[] = [[790, 520], [1600, 520], [1600, 300], [790, 330]]; // the dark between the trunks

// the house: walls, roof, door, a lit window; the washing line
const HOUSE: P[] = [[40, 640], [40, 460], [300, 460], [300, 640]], ROOF: P[] = [[20, 470], [170, 350], [320, 470]], DOOR: P[] = [[130, 640], [130, 540], [190, 540], [190, 640]], WIN: P[] = [[220, 520], [270, 520], [270, 570], [220, 570]], CHIMNEY: P[] = [[240, 410], [270, 410], [270, 360], [240, 360]];
const POLES: P[][] = [[[360, 660], [366, 520], [372, 520], [368, 660]], [[610, 670], [616, 530], [622, 530], [618, 670]]];
const LINE: P[] = [[369, 530], [490, 548], [619, 540]];
// Tom at the first trees, and the white fox going in ahead of him
const TOM = figure({ x: 1060, g: 560, h: 120, f: -1, robe: "tunic", head: "bare", cloth: "#6a8ab0", cloth2: "#5a4a3a", hair: "#7a5230", ink: "#000", near: [2.4, 2.8], far: [0.2, 0.3] });
const CAP = blob(TOM.head[0] + 1, TOM.head[1] - 6, 10, 6, 5, 0.1, 10);
const FOX_AT = { x: 1150, g: 552, h: 46 };
// the child in the foreground, from behind: no face, the whistle in the right hand
const KID = figure({ x: 300, g: 880, h: 360, f: 1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.25, 0.4], far: [0.15, 0.3] });
const BACK_OF_HEAD = blob(KID.head[0] + 6, KID.head[1], 22, 26, 8, 0.1, 14); // hair over the face: we see the back of the head
const WHISTLE: P[] = (() => { const [x, y] = KID.hands.near; return [[x - 2, y + 6], [x + 22, y + 10], [x + 24, y + 16], [x - 2, y + 14]]; })();

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: SKY, layers: [{ color: "#e8a45a", angle: 0.2, gap: 6, w: 2.4, alpha: 0.55 }, { color: "#d9707a", angle: -0.25, gap: 8, w: 2, alpha: 0.35, keep: (_x, y) => y < 260 }, { color: "#f2d38a", angle: 0.05, gap: 7, w: 2.2, alpha: 0.5, keep: (_x, y) => y > 300 }], outline: false },
  { pts: HILLS, layers: tint(HILLS, "#8a7a9a", { angle: 0.3, gap: 7 }), outline: { color: "#5a4a6a" } },
  { pts: WOOD_DARK, layers: [{ color: "#3a2e3a", angle: 1.2, gap: 4, w: 2.4, alpha: 0.8 }, { color: "#5a3a2a", angle: -0.4, gap: 6, w: 2, alpha: 0.5 }], outline: false },
  { pts: MEADOW, layers: [{ color: "#a8a04a", angle: 1.35, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#6f7d3a", angle: 1.1, gap: 8, w: 2, alpha: 0.45, keep: (_x, y) => y > 620 }, { color: "#c98a3a", angle: -0.6, gap: 10, w: 1.8, alpha: 0.35 }], outline: false },
  ...TREES,
  { pts: PATH, layers: tint(PATH, "#c9a878", { angle: 1.5, gap: 6 }), outline: { color: "#8a6a4a" } },
  { pts: CHIMNEY, layers: tint(CHIMNEY, "#9a5a3a") }, { pts: HOUSE, layers: tint(HOUSE, "#e6d4b0", { gap: 7 }) }, { pts: ROOF, layers: tint(ROOF, "#8a3a2a", { angle: 0.6 }) },
  { pts: DOOR, layers: tint(DOOR, "#5a3a22") }, { pts: WIN, layers: [{ color: "#f2c14a", angle: 0.8, gap: 4, w: 2.2, alpha: 0.9 }] },
  ...POLES.map((q) => ({ pts: q, layers: tint(q, "#6a4a30", { angle: 1.55, gap: 3 }) })),
  ...fromMotif(TOM.m), { pts: CAP, layers: [{ color: "#c8322a", angle: 0.9, gap: 3, w: 2, alpha: 0.95 }] },
  { pts: NEAR, layers: [{ color: "#7a8a3a", angle: 1.4, gap: 4, w: 2.4, alpha: 0.75 }, { color: "#4a5a2a", angle: 1.2, gap: 7, w: 2, alpha: 0.55 }], outline: false },
  ...fromMotif(KID.m), { pts: BACK_OF_HEAD, layers: tint(BACK_OF_HEAD, "#5a3a22", { gap: 3.5 }) }, { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.9 }] },
];
const grass = Array.from({ length: 70 }, (_, i) => { const q = rng(300 + i), x = q() * 1600, y = 780 + q() * 110, h = 14 + q() * 20; return { pts: [[x, y], [x + (q() - 0.4) * 8, y - h]] as P[], w: 1.6, color: q() < 0.5 ? "#4a5a2a" : "#8a8a3a", alpha: 0.8 }; });

// ---------------------------------------------------------------- what moves
const FOX = prehatch(fromMotif(beast({ kind: "whitefox", x: FOX_AT.x, g: FOX_AT.g, h: FOX_AT.h, f: 1 })).map((sh, i) => ({ ...sh, outline: i ? { color: "#8a7e76" } : false })));
const LEAVES = (() => { const q = rng(77); return Array.from({ length: 10 }, () => ({ x: 830 + q() * 700, y0: 150 + q() * 200, drift: 40 + q() * 60, ph: q(), c: AUTUMN[Math.floor(q() * AUTUMN.length)] })); })();
export const f01 = sketch({
  id: "f01", title: "La Lisière", loop: LOOP, shapes, lines: grass,
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    live(g, () => {
      // the washing: a sheet and a shirt, bellying on the line
      [[400, 150, 70], [500, 80, 60]].forEach(([x0, w, hgt], i) => {
        const y0 = 530 + ((x0 - 369) / 250) * 14, belly = 10 * Math.sin(TT * 2 + i);
        pencilLive(g, [[x0, y0], [x0 + w, y0 + 4], [x0 + w + belly * 0.6, y0 + hgt], [x0 + w / 2 + belly, y0 + hgt + 6], [x0 + belly * 0.5, y0 + hgt]], i ? "#9ab0d0" : "#f2ece0", { angle: 1.4, gap: 5, seed: 40 + i, alpha: 0.85 * reveal, outline: "#7a7060" });
      });
      g.pen(LINE, { w: 1.2, color: "#4a3a30", seed: 50, wobble: 0.3, boil: 0, opacity: 0.8 * reveal, retrace: false });
      // the white fox, trotting a step forward and back at the edge of the trees
      replay(g, FOX, { at: [4 * Math.sin(TT), 0], alpha: reveal });
      // leaves coming down in front of the trees, rocking as they fall
      LEAVES.forEach((l, i) => { const p = ((t / LOOP) + l.ph) % 1, y = l.y0 + p * 380, x = l.x + Math.sin(p * 9 + i) * 18 - p * l.drift, a = Math.sin(p * 11 + i) * 0.8; pencilLive(g, [[x - 7 * Math.cos(a), y - 7 * Math.sin(a)], [x + 3, y - 4], [x + 7 * Math.cos(a), y + 7 * Math.sin(a)], [x - 3, y + 4]], l.c, { gap: 2.5, seed: 80 + i, alpha: Math.sin(p * Math.PI) * 0.95 * reveal }); });
    });
  },
});
