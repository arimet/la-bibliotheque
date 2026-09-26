// CANICULE PAGE 1 · LA CLIENTE. One idea: a woman in sunglasses puts five new banknotes on a
// private detective's desk, on the hottest evening of the summer.
// Printed in three drums like a 1970s poster. The office on rue Frochot: the window's venetian blind
// barring the pink evening, a wall calendar on JUILLET 1976, a coat rack with the detective's hat.
// Nadia on the left, green dress, dark glasses, bag on her arm. Behind the desk the detective, shirt
// sleeves, tie loosened. On the desk: the fan, the phone, the typewriter, the fanned banknotes, the
// poster photo of Lili.
// What moves: the fan's blades, cigarette smoke from the ashtray, heat shimmer at the window.
import { type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { figure } from "./figures";
import { INK, MIX, fromMotif, overprint, press, type Key, type Piece } from "./press";

const LOOP = 180;
const FLOOR = 800;

// ---------------------------------------------------------------- the room
const WALL: P[] = [[0, 0], [1600, 0], [1600, FLOOR], [0, FLOOR]];
const FLOORP: P[] = [[0, FLOOR], [1600, FLOOR], [1600, 900], [0, 900]];
const WIN = { x0: 110, x1: 520, y0: 110, y1: 560 };
const WINDOW: P[] = [[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
const FRAME: P[] = [[WIN.x0 - 22, WIN.y0 - 22], [WIN.x1 + 22, WIN.y0 - 22], [WIN.x1 + 22, WIN.y1 + 30], [WIN.x0 - 22, WIN.y1 + 30]];
// through the window: the far side of the street, roofs and a dead neon sign against the evening
const OUT_ROOFS: P[] = [[WIN.x0, 330], [190, 330], [190, 290], [290, 290], [290, 350], [380, 350], [380, 270], [470, 270], [470, 320], [WIN.x1, 320], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
const SIGN: P[] = [[300, 400], [460, 400], [460, 450], [300, 450]];
const SLATS: P[][] = Array.from({ length: 13 }, (_, i) => { const y = WIN.y0 + 16 + i * 34; return [[WIN.x0, y], [WIN.x1, y], [WIN.x1, y + 13], [WIN.x0, y + 13]]; });
const CAL: P[] = [[640, 150], [780, 150], [780, 330], [640, 330]], CAL_HEAD: P[] = [[640, 150], [780, 150], [780, 190], [640, 190]];
const RACK: P[] = [[1470, FLOOR], [1478, 180], [1486, 180], [1494, FLOOR]], RACK_FOOT: P[] = [[1430, FLOOR], [1540, FLOOR], [1540, FLOOR - 10], [1430, FLOOR - 10]];
const HAT: P[] = [[1430, 210], [1540, 210], [1530, 196], [1512, 192], [1510, 150], [1488, 142], [1462, 150], [1458, 192], [1440, 196]];
const RAINCOAT: P[] = [[1452, 220], [1520, 220], [1540, 420], [1530, 520], [1440, 520], [1432, 420]];

// ---------------------------------------------------------------- the people
const NADIA = figure({ x: 700, g: 830, h: 560, f: 1, robe: "dress", head: "long", cloth: "green", hair: "#2a1a14", skin: "skin", ink: "#000", near: [0.25, 1.9], far: [0.15, 0.3] });
const GLASSES: P[] = (() => { const [x, y] = NADIA.head, h = 560; return [[x - 0.006 * h, y - 0.034 * h], [x + 0.064 * h, y - 0.036 * h], [x + 0.062 * h, y - 0.008 * h], [x + 0.032 * h, y - 0.002 * h], [x - 0.002 * h, y - 0.01 * h]]; })();
const BAG: P[] = (() => { const [x, y] = NADIA.hands.far; return [[x - 30, y + 10], [x + 30, y + 10], [x + 34, y + 70], [x - 34, y + 70]]; })();
const DET = figure({ x: 1180, g: 900, h: 560, f: -1, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "#3a2a1e", skin: "skin", gold: "#b8321f", ink: "#000", near: [1.1, 1.6], far: [0.9, 1.5] });

// ---------------------------------------------------------------- the desk and what is on it
const DESK_TOP: P[] = [[860, 640], [1560, 640], [1590, 672], [830, 672]];
const DESK: P[] = [[850, 672], [1570, 672], [1570, 900], [850, 900]];
const DRAWERS: P[][] = [[[880, 700], [1100, 700], [1100, 770], [880, 770]], [[880, 790], [1100, 790], [1100, 860], [880, 860]]];
const TYPEWRITER: P[] = [[1280, 640], [1300, 590], [1450, 590], [1470, 640]], PLATEN: P[] = [[1290, 590], [1460, 590], [1460, 572], [1290, 572]], PAPER_SHEET: P[] = [[1320, 574], [1430, 574], [1424, 520], [1326, 520]];
const PHONE: P[] = [[900, 640], [904, 614], [990, 614], [994, 640]], HANDSET: P[] = [[894, 612], [898, 596], [996, 596], [1000, 612], [980, 614], [970, 604], [924, 604], [914, 614]];
const FAN = { x: 1120, y: 560, r: 58 };
const FAN_BASE: P[] = [[FAN.x - 34, 640], [FAN.x + 34, 640], [FAN.x + 22, 626], [FAN.x - 22, 626]], FAN_STEM: P[] = [[FAN.x - 5, 628], [FAN.x + 5, 628], [FAN.x + 5, FAN.y], [FAN.x - 5, FAN.y]];
const NOTES: P[][] = [0, 1, 2, 3, 4].map((i) => { const a = -0.3 + i * 0.13, cx = 1010 + i * 12, cy = 630, w = 90, h = 46, c = Math.cos(a), s = Math.sin(a); return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as P[]).map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c * 0.35] as P); });
const PHOTO: P[] = [[1190, 648], [1260, 640], [1266, 664], [1196, 670]];
const ASHTRAY: P[] = blob(1520, 634, 34, 9, 44, 0.05, 14);

// ---------------------------------------------------------------- the print
const nadia = fromMotif(NADIA.m), det = fromMotif(DET.m, [DESK_TOP, DESK]);
const pieces: Piece[] = [
  { pts: WALL, ink: { y: 0.16, p: (x, y) => 0.22 * Math.exp(-((x - 320) ** 2 + (y - 340) ** 2) / 120000) } }, // bare wall, pink where the evening comes in
  { pts: FLOORP, ink: { b: 0.55, p: 0.7 } },
  { pts: FRAME, ink: MIX.cream },
  { pts: WINDOW, ink: { p: (_x, y) => 0.25 + 0.55 * (y - WIN.y0) / (WIN.y1 - WIN.y0), y: (_x, y) => 0.9 - 0.5 * (y - WIN.y0) / (WIN.y1 - WIN.y0) } }, // the sky at seven, yellow going to pink
  { pts: OUT_ROOFS, ink: MIX.dusk },
  { pts: SIGN, ink: { b: 0.35, p: 0.15 } },
  ...SLATS.map((q) => ({ pts: q, ink: { y: 0.5, p: 0.15 } as const })),
  { pts: CAL, ink: MIX.cream }, { pts: CAL_HEAD, ink: MIX.pink },
  { pts: RAINCOAT, ink: { y: 0.7, p: 0.3, b: 0.1 } }, { pts: RACK, ink: MIX.brown }, { pts: RACK_FOOT, ink: MIX.brown }, { pts: HAT, ink: { b: 0.7, p: 0.55, y: 0.4 } },
  ...nadia.pieces, { pts: GLASSES, ink: MIX.black }, { pts: BAG, ink: MIX.orange },
  ...det.pieces,
  { pts: DESK, ink: { y: 1, p: 0.6 } }, { pts: DESK_TOP, ink: { y: 1, p: 0.3 } }, ...DRAWERS.map((q) => ({ pts: q, ink: { y: 1, p: 0.8, b: 0.2 } as const })),
  { pts: PAPER_SHEET, ink: {} }, { pts: TYPEWRITER, ink: MIX.teal }, { pts: PLATEN, ink: MIX.black },
  { pts: PHONE, ink: MIX.black }, { pts: HANDSET, ink: MIX.black },
  { pts: FAN_BASE, ink: MIX.navy }, { pts: FAN_STEM, ink: MIX.navy },
  ...NOTES.map((q, i) => ({ pts: q, ink: { y: 0.35 + i * 0.03, b: 0.45, p: 0.1 } as const })), { pts: PHOTO, ink: MIX.pink },
  { pts: ASHTRAY, ink: MIX.grey },
];
const edge = (pts: P[], w = 2.2, op = 0.9): Key => ({ pts: [...pts, pts[0]], w, op });
const keys: Key[] = [
  ...nadia.keys, ...det.keys,
  edge(WINDOW, 2.4), edge(FRAME, 2), edge(CAL, 1.8), edge(DESK, 2.4), edge(DESK_TOP, 2), ...DRAWERS.map((q) => edge(q, 1.6)),
  ...DRAWERS.map((q) => ({ pts: [[(q[0][0] + q[1][0]) / 2 - 18, (q[0][1] + q[2][1]) / 2], [(q[0][0] + q[1][0]) / 2 + 18, (q[0][1] + q[2][1]) / 2]] as P[], w: 4 })),
  edge(TYPEWRITER, 1.8), edge(HANDSET, 1.6), edge(HAT, 1.6), edge(RAINCOAT, 1.6),
  ...[[1300, 610], [1340, 610], [1380, 610], [1420, 610]].map(([x, y]) => ({ pts: [[x, y], [x + 24, y]] as P[], w: 3 })), // keys of the typewriter
];

// ---------------------------------------------------------------- what moves
const blade = (a: number): P[] => { const c = Math.cos(a), s = Math.sin(a), R = FAN.r; return [[FAN.x, FAN.y], [FAN.x + c * R * 0.3 - s * 16, FAN.y + s * R * 0.3 + c * 16], [FAN.x + c * R - s * 12, FAN.y + s * R + c * 12], [FAN.x + c * R + s * 10, FAN.y + s * R - c * 10]]; };
export const r01 = press({
  id: "r01", title: "La Cliente", loop: LOOP, pieces, keys,
  extra: {
    b: (g) => { letter(g, "JUILLET", 710, 206, { cap: 18, color: INK.blue, seed: 3, align: "center", w: 2.4 }); letter(g, "1976", 710, 240, { cap: 26, color: INK.blue, seed: 4, align: "center", w: 3 }); for (let i = 0; i < 20; i++) { const x = 660 + (i % 5) * 24, y = 282 + Math.floor(i / 5) * 12; g.pen([[x, y], [x + 10, y]], { w: 2, color: INK.blue, seed: 30 + i, wobble: 0.2, boil: 0, opacity: 0.7, retrace: false }); } },
    p: (g) => letter(g, "HOTEL", 380, 410, { cap: 26, color: INK.pink, seed: 5, align: "center", w: 3.4, opacity: 0.45 }),
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the fan: its cage, four blades going round, the hub
    const a0 = TT * 6;
    overprint(g, [{ pts: Array.from({ length: 24 }, (_, i) => [FAN.x + Math.cos((i / 24) * 6.283) * (FAN.r + 6), FAN.y + Math.sin((i / 24) * 6.283) * (FAN.r + 6)] as P), ink: { b: 0.25 * reveal } }, ...[0, 1, 2, 3].map((k) => ({ pts: blade(a0 + (k * Math.PI) / 2), ink: { b: 0.9 * reveal, p: 0.4 * reveal } })), { pts: blob(FAN.x, FAN.y, 10, 10, 1, 0, 10), ink: { b: reveal, p: reveal } }]);
    // smoke from the ashtray, three threads going up and leaning away from the fan
    const smoke: Piece[] = [0, 1, 2].map((k) => { const p = ((t + k * 60) % LOOP) / LOOP, x = 1520 + Math.sin(p * 5 + k) * 10 + p * 40, y = 620 - p * 260; return { pts: blob(x, y, 8 + p * 26, 5 + p * 12, 20 + k, 0.35, 12), ink: { b: 0.28 * Math.sin(p * Math.PI) * reveal, p: 0.1 * Math.sin(p * Math.PI) * reveal } }; });
    overprint(g, smoke);
    // the air above the roofs across the street, trembling in the heat
    const shimmer: Piece[] = [0, 1, 2].map((k) => ({ pts: Array.from({ length: 16 }, (_, i) => [WIN.x0 + (i / 15) * (WIN.x1 - WIN.x0), 262 - k * 10 + Math.sin(i * 1.3 + TT * 3 + k) * 3] as P).concat([[WIN.x1, 268 - k * 10], [WIN.x0, 268 - k * 10]]), ink: { y: 0.3 * reveal } }));
    overprint(g, shimmer);
  },
});
