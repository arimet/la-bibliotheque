// CANICULE PAGE 2 · LE FLAMINGO. One idea: the club is shut and dark, and the only light comes in
// through the service door, left open on the courtyard.
// The little stage on the left under the dead neon flamingo, its microphone on its stand. Chairs
// upside down on the tables. The dressing-room door ajar on Lili's vanity, a pink lighter on it.
// Behind the bar, Momo, bald, bow tie, wiping a glass in the dark.
// What moves: the ceiling fan, dust in the light from the door, Momo's cloth round the glass.
import { oval, rng, tube, type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { figure, type Motif } from "./figures";
import { INK, MIX, PAPER, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";

const LOOP = 180;
const FLOOR = 650;
const R = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];

// ---------------------------------------------------------------- the light: the doorway and what it reaches
const DOOR = { x0: 1370, x1: 1560, y0: 150, y1: 660 };
const DOORWAY = R(DOOR.x0, DOOR.y0, DOOR.x1, DOOR.y1);
const SHAFT: P[] = [[DOOR.x0, DOOR.y0], [DOOR.x1, DOOR.y0], [DOOR.x1, DOOR.y1], [1330, 900], [820, 900]];
const shaftX = (y: number) => DOOR.x0 - ((y - DOOR.y0) / (900 - DOOR.y0)) * (DOOR.x0 - 820); // the shaft's left edge
// a piece and its copy in the light
const lit = (pts: P[], dark: Sep, light: Sep): Piece[] => [{ pts, ink: dark }, { pts, ink: light, clip: SHAFT }];

// ---------------------------------------------------------------- the room
const WALL = R(0, 0, 1600, FLOOR), FLOORP = R(0, FLOOR, 1600, 900);
// the stage, its drapes, the sign over it
const STAGE_TOP: P[] = [[0, 572], [470, 572], [492, 596], [0, 596]], STAGE = R(0, 596, 492, 690);
const DRAPES: P[][] = [[[0, 20], [70, 20], [58, 300], [74, 572], [0, 572]], [[400, 20], [470, 20], [470, 572], [396, 572], [412, 300]]];
const VALANCE: P[] = [[0, 0], [470, 0], [470, 40], ...Array.from({ length: 9 }, (_, i) => [470 - (i + 0.5) * 52, i % 2 ? 40 : 58] as P), [0, 40]];
const SIGN: P[] = R(100, 110, 370, 404);
// the name in dead neon too, block letters bent in glass
const GLYPH: Record<string, number[][][]> = {
  F: [[[0, 5], [0, 0], [3, 0]], [[0, 2.4], [2.2, 2.4]]], L: [[[0, 0], [0, 5], [2.8, 5]]], A: [[[0, 5], [1.5, 0], [3, 5]], [[0.6, 3.2], [2.4, 3.2]]],
  M: [[[0, 5], [0, 0], [1.75, 2.6], [3.5, 0], [3.5, 5]]], I: [[[0.5, 0], [0.5, 5]]], N: [[[0, 5], [0, 0], [3, 5], [3, 0]]],
  G: [[[3, 0.8], [2.3, 0], [0.7, 0], [0, 0.8], [0, 4.2], [0.7, 5], [2.3, 5], [3, 4.2], [3, 2.8], [1.8, 2.8]]], O: [[[0.7, 0], [2.3, 0], [3, 0.8], [3, 4.2], [2.3, 5], [0.7, 5], [0, 4.2], [0, 0.8], [0.7, 0]]],
};
const GW: Record<string, number> = { F: 3, L: 2.8, A: 3, M: 3.5, I: 1, N: 3, G: 3, O: 3 };
const NAME: P[][] = (() => { const k = 6.4, word = "FLAMINGO", w = [...word].reduce((a, c) => a + (GW[c] + 1.3) * k, -1.3 * k); let x = 235 - w / 2; return [...word].flatMap((c) => { const out = GLYPH[c].map((st) => st.map(([u, v]) => [x + u * k, 356 + v * k] as P)); x += (GW[c] + 1.3) * k; return out; }); })();
// the flamingo in dead neon tubes: body, neck, head and beak, the standing leg, the folded one
const BIRD: P[][] = [
  [[190, 250], [214, 232], [258, 230], [292, 244], [300, 262], [270, 272], [226, 272], [196, 262], [190, 250]],
  [[284, 242], [300, 214], [288, 186], [262, 170], [258, 150], [276, 138], [296, 144]],
  [[296, 144], [314, 156], [312, 172]],
  [[240, 272], [240, 346]], [[252, 272], [262, 300], [236, 312]],
];
const TUBES = [...BIRD.map((c) => tube(c, 3.6, 3.6, false)), ...NAME.map((c) => tube(c, 2.6, 2.6, false))];
const MIC_BASE = oval(250, 580, 30, 6, 12), MIC_POLE = R(247, 404, 253, 580), MIC = tube([[250, 406], [240, 390], [236, 380]], 7, 9);
// Lili's dressing room, through the door left ajar
const LOGE = { x0: 540, x1: 720, y0: 170, y1: FLOOR };
const LOGE_FRAME = R(LOGE.x0 - 16, LOGE.y0 - 18, LOGE.x1 + 16, FLOOR);
const LOGE_IN = R(LOGE.x0, LOGE.y0, LOGE.x1, FLOOR);
const LEAF: P[] = [[LOGE.x1, LOGE.y0], [640, LOGE.y0 + 22], [640, FLOOR - 16], [LOGE.x1, FLOOR]];
const MIRROR = R(560, 290, 690, 440), VANITY = R(548, 470, 700, 486), VANITY_FRONT = R(556, 486, 692, 560);
const BULBS: P[] = Array.from({ length: 12 }, (_, i) => (i < 5 ? [566 + i * 30, 282] : i < 8 ? [553, 310 + (i - 5) * 50] : i < 11 ? [697, 310 + (i - 8) * 50] : [553, 460]) as P);
const DRESS: P[] = [[562, 210], [582, 206], [590, 240], [584, 290], [598, 420], [552, 424], [566, 290], [558, 240]];
const HANGER: P[] = [[560, 212], [572, 196], [584, 212]];
const LIGHTER = R(610, 446, 626, 472), LIGHTER_CAP = R(610, 438, 626, 447);
const ASHTRAY = blob(578, 468, 18, 5, 9, 0.05, 12), POTS = [oval(648, 464, 7, 5, 8), oval(668, 466, 9, 4, 8)];

// ---------------------------------------------------------------- the bar, and Momo behind it
const BAR_TOP: P[] = [[846, 430], [1334, 430], [1346, 448], [834, 448]], BAR = R(846, 448, 1334, 706);
const RAIL = R(846, 672, 1334, 678);
const BACKBAR = R(880, 170, 1300, 420), SHELVES = [R(880, 262, 1300, 270), R(880, 350, 1300, 358)];
const rb = rng(21);
const BOTTLES: P[][] = [262, 350].flatMap((y) => Array.from({ length: 11 }, (_, i) => { const x = 900 + i * 37 + rb() * 10, h = 50 + rb() * 30, w = 9 + rb() * 5; return [[x - w, y], [x - w, y - h * 0.62], [x - 3, y - h * 0.8], [x - 3, y - h], [x + 3, y - h], [x + 3, y - h * 0.8], [x + w, y - h * 0.62], [x + w, y]] as P[]; }));
const HAIR_M = "#ecc9a8", TIE_M = "#101012";
const MOMO_F = figure({ x: 1080, g: 704, h: 470, f: -1, robe: "suit", head: "bare", cloth: "#e2d6d8", cloth2: "navy", hair: HAIR_M, skin: "skin", gold: TIE_M, ink: "#000", near: [0.55, 1.95], far: [0.4, 1.75] });
// Momo is bald and wears a bow tie: take away the fringe and the long tie
const strip = (m: Motif, color: string): Motif => {
  const gone = new Set(m.fills.filter((f) => f.color === color).map((f) => f.pts)), idx = m.parts.map((q, i) => (gone.has(q) ? i : -1)).filter((i) => i >= 0);
  return { fills: m.fills.filter((f) => !gone.has(f.pts)), parts: m.parts.filter((q) => !gone.has(q)), lines: m.lines.filter((l) => l.color !== color && !m.fills.some((f) => gone.has(f.pts) && f.pts[0] === l.pts[0])).map((l) => ({ ...l, z: (l.z ?? m.parts.length) - idx.filter((i) => i < (l.z ?? m.parts.length)).length })) };
};
const MOMO = strip(strip(MOMO_F.m, TIE_M), HAIR_M);
const NECK: P = [1080 + 0.004 * 470 * -1, 704 - 0.82 * 470];
const BOW: P[] = [[NECK[0], NECK[1]], [NECK[0] - 14, NECK[1] - 8], [NECK[0] - 14, NECK[1] + 8], [NECK[0], NECK[1]], [NECK[0] + 14, NECK[1] - 8], [NECK[0] + 14, NECK[1] + 8]];
const GL = { x: MOMO_F.hands.near[0] - 4, y: MOMO_F.hands.near[1] - 26 };
const GLASS: P[] = [[GL.x - 16, GL.y - 26], [GL.x + 16, GL.y - 26], [GL.x + 12, GL.y + 24], [GL.x - 12, GL.y + 24]];

// ---------------------------------------------------------------- the tables, chairs upside down on them
type Tbl = { x: number; g: number; s: number };
const T1: Tbl = { x: 760, g: 820, s: 1 }, T2: Tbl = { x: 1110, g: 860, s: 1.05 }, T3: Tbl = { x: 1440, g: 985, s: 1.45 };
const table = (t: Tbl) => { const top = t.g - 212 * t.s, r = 92 * t.s; return { top, r, TOP: oval(t.x, top + 5 * t.s, r, 9 * t.s, 22), POST: R(t.x - 6 * t.s, top + 10 * t.s, t.x + 6 * t.s, t.g - 8), FOOT: oval(t.x, t.g - 4, 42 * t.s, 7 * t.s, 14) }; };
// a bentwood chair on its back on the tabletop: seat down, legs up, the backrest hanging past the edge
const chairUp = (t: Tbl, dir: 1 | -1) => {
  const { top, r } = table(t), s = 96 * t.s, cx = t.x + dir * (r - 0.4 * s), y = top;
  const SEAT: P[] = [[cx - 0.47 * s, y - 0.16 * s], [cx + 0.47 * s, y - 0.16 * s], [cx + 0.47 * s, y - 0.1 * s], [cx + 0.4 * s, y - 0.02 * s], [cx - 0.4 * s, y - 0.02 * s], [cx - 0.47 * s, y - 0.1 * s]];
  const legs = [-1, 1].map((k) => tube([[cx + k * 0.36 * s, y - 0.14 * s], [cx + k * 0.5 * s, y - 0.95 * s]], 4.6 * t.s, 3.6 * t.s, false));
  const bx = cx + dir * 0.44 * s, BACK = tube([[bx, y - 0.04 * s], [bx + dir * 0.14 * s, y + 0.22 * s], [bx + dir * 0.13 * s, y + 0.46 * s], [bx + dir * 0.02 * s, y + 0.56 * s]], 5 * t.s, 5 * t.s, false);
  const RING: P[] = [[cx - 0.43 * s, y - 0.6 * s], [cx + 0.43 * s, y - 0.6 * s]];
  return { SEAT, legs, BACK, RING };
};
const tableSet = (t: Tbl) => ({ ...table(t), chairs: [chairUp(t, -1), chairUp(t, 1)] });
const TS1 = tableSet(T1), TS2 = tableSet(T2), TS3 = tableSet(T3);
const TS2_SHADOW: P[] = [[T2.x - 60, T2.g - 2], [T2.x + 40, T2.g - 2], [T2.x - 130, 900], [T2.x - 330, 900]];
const allOf = (ts: ReturnType<typeof tableSet>) => [ts.TOP, ts.POST, ts.FOOT, ...ts.chairs.flatMap((c) => [c.SEAT, c.BACK, ...c.legs])];

// ---------------------------------------------------------------- the fan
const FAN = { x: 800, y: 76, rx: 215, ry: 24 };
const FAN_ROD = R(FAN.x - 4, 0, FAN.x + 4, FAN.y - 14), FAN_BOX = blob(FAN.x, FAN.y - 4, 26, 14, 31, 0.04, 14);
const blade = (a: number): P[] => [[0.18, -0.07], [1, -0.13], [1, 0.13], [0.18, 0.07]].map(([u, v]) => { const x = Math.cos(a) * u - Math.sin(a) * v, y = Math.sin(a) * u + Math.cos(a) * v; return [FAN.x + x * FAN.rx, FAN.y + 4 + y * FAN.ry] as P; });

// ---------------------------------------------------------------- the print
const DARK: Sep = { b: 0.82, p: 0.55, y: 0.18 };
const WOOD: Sep = { y: 0.8, p: 0.85, b: 0.95 }, WOOD_LIT: Sep = { y: 0.95, p: 0.8, b: 0.5 }, BAR_LIT: Sep = { y: 0.85, p: 0.45, b: 0.15 };
const tableSetPieces = (ts: ReturnType<typeof tableSet>, inLight: boolean): Piece[] => {
  const w = (pts: P[], d: Sep, l: Sep): Piece[] => (inLight ? lit(pts, d, l) : [{ pts, ink: d }]);
  return [
    ...ts.chairs.flatMap((c) => w(c.BACK, WOOD, WOOD_LIT)),
    ...w(ts.FOOT, MIX.black, { y: 0.6, p: 0.6, b: 0.7 }), ...w(ts.POST, MIX.black, { y: 0.6, p: 0.6, b: 0.7 }),
    ...w(ts.TOP, { b: 0.62, p: 0.4, y: 0.15 }, { y: 0.35, p: 0.1, b: 0.1 }),
    ...ts.chairs.flatMap((c) => [...c.legs.flatMap((l) => w(l, WOOD, WOOD_LIT)), ...w(c.SEAT, WOOD, WOOD_LIT)]),
  ];
};
const momo = fromMotif(MOMO, [BAR_TOP, BAR, GLASS, BOW]);
const pieces: Piece[] = [
  { pts: WALL, ink: { b: (_x, y) => 0.84 - 0.2 * (y / FLOOR), p: 0.42, y: 0.06 } },
  { pts: FLOORP, ink: { b: 0.9, p: 0.62, y: 0.4 } },
  { pts: WALL, ink: { y: 0.5, p: 0.3, b: (x) => 0.2 + 0.35 * Math.max(0, (DOOR.x0 - x) / 500) }, clip: SHAFT }, // the air in the light
  { pts: FLOORP, ink: { y: 0.85, p: 0.4, b: 0.12 }, clip: SHAFT },
  { pts: TS2_SHADOW, ink: { y: 0.9, p: 0.7, b: 0.6 }, clip: SHAFT },
  // the stage
  { pts: VALANCE, ink: { p: 1, b: 0.6, y: 0.7 } }, ...DRAPES.map((q) => ({ pts: q, ink: { p: 0.95, b: 0.55, y: 0.6 } as Sep })),
  { pts: SIGN, ink: { b: 0.95, p: 0.8, y: 0.55 } },
  ...TUBES.map((q) => ({ pts: q, ink: { p: 0.42, b: 0.14 } as Sep })),
  { pts: STAGE, ink: { y: 0.75, p: 0.75, b: 0.8 } }, { pts: STAGE_TOP, ink: { y: 0.65, p: 0.6, b: 0.62 } },
  { pts: MIC_BASE, ink: MIX.black }, { pts: MIC_POLE, ink: MIX.black }, { pts: MIC, ink: { b: 0.3, p: 0.2, y: 0.1 } },
  // the dressing room
  { pts: LOGE_FRAME, ink: { b: 0.9, p: 0.65, y: 0.35 } },
  { pts: LOGE_IN, ink: { p: 0.4, y: 0.35, b: 0.42 } },
  { pts: MIRROR, ink: { b: 0.55, p: 0.3, y: 0.2 } }, ...BULBS.map((b) => ({ pts: oval(b[0], b[1], 6, 6, 8), ink: { y: 0.3, p: 0.1 } as Sep })),
  { pts: DRESS, ink: { p: 0.95, b: 0.3 } }, { pts: VANITY_FRONT, ink: { y: 0.6, p: 0.65, b: 0.6 } }, { pts: VANITY, ink: { y: 0.3, p: 0.25, b: 0.3 } },
  { pts: ASHTRAY, ink: { b: 0.6, p: 0.3 } }, ...POTS.map((q) => ({ pts: q, ink: { y: 0.6, p: 0.6 } as Sep })),
  { pts: LIGHTER, ink: MIX.pink }, { pts: LIGHTER_CAP, ink: { p: 0.6, b: 0.25 } },
  { pts: LEAF, ink: { y: 0.7, p: 0.72, b: 0.85 } },
  // the courtyard through the service door
  { pts: DOORWAY, ink: { y: (_x, y) => 0.95 - 0.35 * ((y - DOOR.y0) / 510), p: (_x, y) => 0.12 + 0.3 * ((y - DOOR.y0) / 510) } },
  { pts: [[DOOR.x0, 560], [1430, 540], [1430, 520], [1480, 520], [1480, 560], [DOOR.x1, 580], [DOOR.x1, DOOR.y1], [DOOR.x0, DOOR.y1]], ink: { p: 0.6, b: 0.45, y: 0.4 } }, // bins in the yard
  { pts: R(1500, 150, DOOR.x1, 470), ink: { y: 0.55, p: 0.45, b: 0.2 } }, // the yard's far wall
  { pts: oval(1515, 214, 16, 16, 12), ink: {} }, // its lamp
  { pts: R(1560, 130, 1600, 680), ink: { y: 0.7, p: 0.7, b: 0.8 } }, // the door leaf, open toward us
  // behind the bar
  ...lit(BACKBAR, { b: 0.7, p: 0.4, y: 0.15 }, { b: 0.35, p: 0.25, y: 0.5 }),
  ...BOTTLES.map((q, i) => ({ pts: q, ink: [{ y: 0.9, b: 0.7, p: 0.4 }, { y: 0.8, p: 0.9, b: 0.6 }, { b: 0.95, p: 0.7, y: 0.5 }][i % 3] as Sep })),
  ...SHELVES.map((q) => ({ pts: q, ink: WOOD })),
  ...momo.pieces, { pts: BOW, ink: MIX.black }, { pts: GLASS, ink: { b: 0.28, p: 0.12 } },
  ...lit(BAR, { y: 0.75, p: 0.72, b: 0.72 }, BAR_LIT), ...lit(BAR_TOP, { b: 0.55, p: 0.4, y: 0.3 }, { y: 0.4, p: 0.15, b: 0.08 }), ...lit(RAIL, { y: 0.8, p: 0.4, b: 0.5 }, { y: 1, p: 0.3 }),
  // the tables
  ...tableSetPieces(TS1, false), ...tableSetPieces(TS2, true), ...tableSetPieces(TS3, false),
  { pts: FAN_ROD, ink: MIX.black }, { pts: FAN_BOX, ink: MIX.black },
];
const edge = (pts: P[], w = 2.2, op = 0.9, hide?: P[][]): Key => ({ pts: [...pts, pts[0]], w, op, hide });
const TS1_ALL = allOf(TS1), TS2_ALL = allOf(TS2), TS3_ALL = allOf(TS3);
const keys: Key[] = [
  ...momo.keys,
  edge(SIGN, 2), edge(STAGE, 2.2), edge(LOGE_FRAME, 2), edge(LEAF, 1.8, 0.9, TS1_ALL), edge(MIRROR, 1.6, 0.8, [LEAF, ...TS1_ALL]), edge(VANITY_FRONT, 1.6, 0.8, [LEAF, ...TS1_ALL]),
  edge(LIGHTER, 1.6), edge(DRESS, 1.4, 0.8), { pts: HANGER, w: 1.8 },
  edge(DOORWAY, 2.4, 0.9, TS3_ALL), edge(BAR, 2.2, 0.9, [...TS2_ALL, ...TS3_ALL]), edge(BAR_TOP, 1.8), edge(GLASS, 1.4),
  ...[1000, 1160].map((x) => ({ pts: [[x, 460], [x, 694]] as P[], w: 1.6, op: 0.7, hide: TS2_ALL })),
  ...[TS1, TS2, TS3].flatMap((ts) => ts.chairs.map((c) => ({ pts: c.RING, w: 2.6 }))),
  ...[TS2, TS3].map((ts) => edge(ts.TOP, 1.6)),
];

// ---------------------------------------------------------------- what moves
const rd = rng(77);
const MOTES = Array.from({ length: 16 }, () => { const y = 220 + rd() * 560, x = shaftX(y) + 30 + rd() * (DOOR.x0 - shaftX(y) + 120); return { x, y, a: rd() * 6.28, b: rd() * 6.28, r: 3 + rd() * 3 }; });
export const r02 = press({
  id: "r02", title: "Le Flamingo", loop: LOOP, pieces, keys,
  extra: {
    b: (g) => letter(g, "BAR", 1090, 214, { cap: 20, color: INK.blue, seed: 9, align: "center", w: 2.6, opacity: 0.5 }),
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the fan, one slow turn a loop
    overprint(g, [0, 1, 2, 3].map((k) => ({ pts: blade(TT + (k * Math.PI) / 2), ink: { b: 0.95 * reveal, p: 0.8 * reveal, y: 0.5 * reveal } })));
    // dust turning in the light
    const motes = MOTES.map((m) => { const x = m.x + 16 * Math.sin(TT + m.a), y = m.y + 10 * Math.sin(2 * TT + m.b), k = 0.5 + 0.5 * Math.sin(3 * TT + m.a); return { pts: oval(x, y, m.r * (0.6 + 0.4 * k), m.r * (0.6 + 0.4 * k), 6), k }; });
    motes.forEach((m) => g.fill(m.pts, PAPER, reveal * (0.35 + 0.6 * m.k))); // a speck of bare paper: a knockout, as the press makes
    overprint(g, motes.map((m) => ({ pts: m.pts, ink: { y: 0.3 * reveal } })));
    // the cloth going round inside the glass, three times a loop
    const c = 3 * TT, cx = GL.x + Math.cos(c) * 8, cy = GL.y - 10 + Math.sin(c) * 5;
    overprint(g, [{ pts: blob(cx, cy, 15, 11, 5, 0.3, 12, c), ink: { p: 0.45 * reveal, y: 0.35 * reveal, b: 0.1 * reveal } }, { pts: tube([[cx + 6, cy + 6], [cx + 14 + Math.cos(c) * 4, cy + 30], [cx + 10, cy + 46]], 6, 4), ink: { p: 0.45 * reveal, y: 0.35 * reveal, b: 0.1 * reveal } }]);
  },
});
