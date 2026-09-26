// CANICULE PAGE 7 · LILI. One idea: in a cheap hotel room at Barbès, the singer everyone is looking
// for puts a reel of tape in your hands.
// Room 9 of the hôtel Terminus, half past one at night, under a bare bulb. The door on the chain,
// the brass key and its tag on the lock; the wardrobe; the iron bed with her suitcase open on it;
// the window on the elevated métro, the radiator under it. Lili, small, platinum bob, a pale blue
// summer dress, holds out the reel in its nylon stocking; you, in shirt sleeves, reach for it.
// What moves: a train sliding along the viaduct outside, its windows lit; the bulb's glow wavering
// and a moth going round it.
// The room (and the small kit below) is shared with page 8, which is the same room, empty.
import { type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { figure, type Figure } from "./figures";
import { type Gfx } from "./core";
import { INK, MIX, REG, fromMotif, inkOf, overprint, press, type Drum, type Key, type Piece, type Sep } from "./press";

// ---------------------------------------------------------------- the kit shared by pages 7 to 12
export const rect = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
export const edge = (pts: P[], w = 2.2, op = 0.9, hide?: P[][]): Key => ({ pts: [...pts, pts[0]], w, op, hide });
export const stroke = (pts: P[], w = 2, op = 0.9, hide?: P[][]): Key => ({ pts, w, op, hide });
// a shape shrunk toward its middle, for a pane in its frame
export const inset = (q: P[], k: number): P[] => { const cx = q.reduce((a, p) => a + p[0], 0) / q.length, cy = q.reduce((a, p) => a + p[1], 0) / q.length; return q.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k] as P); };
export const ring = (cx: number, cy: number, rx: number, ry = rx, n = 20): P[] => Array.from({ length: n }, (_, i) => [cx + Math.cos((i / n) * 6.2832) * rx, cy + Math.sin((i / n) * 6.2832) * ry] as P);
// pen strokes printed with one drum, for what moves (neon tubes, a clock hand): multiplied, off register
export const inkPen = (g: Gfx, d: Drum, fn: (ink: string) => void, o: { act3?: boolean; alpha?: number } = {}) =>
  g.group("plain", () => fn(inkOf(d, o.act3)), { blend: "multiply", off: REG[d], alpha: o.alpha ?? 1, textures: ["risoSpeck"] });
// a platinum bob: hair to the jaw, behind the face (put it before the figure's pieces)
export const bob = (fig: Figure, h: number, f: 1 | -1): P[] => { const [x, y] = fig.head; return blob(x - f * 0.012 * h, y + 0.004 * h, 0.066 * h, 0.07 * h, 91, 0.06, 18); };
export const PLATINUM = "#f3ecc4";
// a short-sleeved arm: the forearm of a figure in skin, over its sleeve (same geometry as figures.ts)
export const forearm = (k: { x: number; g: number; h: number; f?: 1 | -1 }, near: [number, number], su = 0.06): P[][] => {
  const f = k.f ?? 1, h = k.h, S = (u: number, v: number): P => [k.x + f * u * h, k.g - v * h];
  const s: P = [su, 0.785], e: P = [s[0] + 0.19 * Math.sin(near[0]), s[1] - 0.19 * Math.cos(near[0])], w: P = [e[0] + 0.17 * Math.sin(near[1]), e[1] - 0.17 * Math.cos(near[1])];
  const mid: P = [(s[0] + e[0]) / 2 + (e[0] - s[0]) * 0.25, (s[1] + e[1]) / 2 + (e[1] - s[1]) * 0.25];
  return [[S(...mid), S(...e), S(...w)]];
};

// ---------------------------------------------------------------- the room, shared with page 8
export const FLOOR = 770;
export const WALL: P[] = rect(0, 0, 1600, FLOOR), FLOORP: P[] = rect(0, FLOOR, 1600, 900), CORNICE: P[] = rect(0, 0, 1600, 34);
export const BULB = { x: 862, y: 176 };
// the bulb lights the wall; the corners stay in the night; faded striped paper
const glow = (x: number, y: number, r = 200000) => Math.exp(-((x - BULB.x) ** 2 + (y - BULB.y) ** 2) / r);
const stripe = (x: number) => (Math.floor(x / 36) % 2 ? 1 : 0);
export const WALL_INK: Sep = { y: (x, y) => 0.22 + 0.4 * glow(x, y), p: (x, y) => 0.2 + 0.1 * stripe(x) + 0.08 * glow(x, y), b: (x, y) => 0.42 * (1 - glow(x, y, 420000)) };
export const FLOOR_INK: Sep = { y: 0.55, p: 0.5, b: (x) => 0.35 + 0.25 * Math.abs(x - 860) / 860 };
// the door, hinged on the left, the latch and the chain on the right
export const DOOR = { x0: 70, x1: 300, y0: 196, y1: FLOOR };
export const DOOR_FRAME: P[] = rect(46, 172, 324, FLOOR), DOOR_LEAF: P[] = rect(DOOR.x0, DOOR.y0, DOOR.x1, DOOR.y1);
export const DOOR_PANELS: P[][] = [rect(100, 230, 270, 460), rect(100, 500, 270, 730)];
export const KNOB: P[] = blob(276, 492, 11, 11, 17, 0.05, 10), LOCK: P[] = rect(268, 514, 284, 540);
// the wardrobe
export const WARD = { x0: 352, x1: 600, y0: 150, y1: FLOOR };
export const WARDROBE: P[] = rect(WARD.x0, WARD.y0, WARD.x1, WARD.y1), WARD_TOP: P[] = rect(WARD.x0 - 14, WARD.y0 - 22, WARD.x1 + 14, WARD.y0);
export const WARD_DOORS: P[][] = [rect(368, 172, 474, 740), rect(478, 172, 584, 740)];
// the iron bed along the wall: head at the left, foot at the right
export const BED_TOP: P[] = [[660, 616], [1106, 616], [1130, 668], [636, 668]], BED_FRONT: P[] = rect(636, 668, 1130, 742);
// the iron bedstead: posts with brass knobs, a curved top rail, bars; lower at the foot
export const HEAD_POSTS: P[][] = [rect(632, 452, 646, 760), rect(752, 452, 766, 612)], FOOT_POSTS: P[][] = [rect(1112, 540, 1126, 760)];
export const HEAD_TOP: P[] = [[640, 470], [700, 452], [760, 470], [760, 482], [700, 466], [640, 482]];
export const HEAD_BARS: P[][] = [0, 1, 2, 3, 4].map((i) => rect(662 + i * 20, 470 - (i === 2 ? 6 : i % 2 ? 4 : 0), 667 + i * 20, 616));
export const KNOBS: P[][] = [[639, 446], [759, 446], [1119, 534]].map(([x, y]) => blob(x, y, 11, 10, 31, 0.04, 10));
export const PILLOW: P[] = blob(716, 604, 58, 22, 23, 0.1, 16);
// the window on the viaduct, the radiator under it
export const WIN = { x0: 1160, x1: 1520, y0: 128, y1: 584 };
export const WIN_FRAME: P[] = rect(WIN.x0 - 22, WIN.y0 - 22, WIN.x1 + 22, WIN.y1 + 26), WIN_SILL: P[] = rect(WIN.x0 - 36, WIN.y1 + 14, WIN.x1 + 36, WIN.y1 + 32);
export const PANES = [{ x0: WIN.x0, x1: 1334 }, { x0: 1346, x1: WIN.x1 }];
export const MULLION: P[] = rect(1334, WIN.y0, 1346, WIN.y1);
export const SKY: P[] = rect(WIN.x0, WIN.y0, WIN.x1, WIN.y1);
export const FACADES: P[] = [[WIN.x0, 178], [1236, 178], [1236, 150], [1318, 150], [1318, 196], [1404, 196], [1404, 164], [WIN.x1, 164], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
export const LIT: P[][] = [[1182, 214], [1262, 190], [1290, 226], [1420, 206], [1470, 232]].map(([x, y]) => rect(x, y, x + 18, y + 26));
// under the viaduct, across the street: a café still lit, a hotel's glass door
export const SHOPS: P[][] = [rect(1262, 478, 1300, 520), rect(1316, 478, 1354, 520), rect(1478, 470, 1506, 520)];
// the viaduct of line 2: the girder, the rail on it, the cast iron columns down to the street
export const DECK = { y0: 356, y1: 400 };
export const GIRDER: P[] = rect(WIN.x0, DECK.y0, WIN.x1, DECK.y1), RAIL: P[] = rect(WIN.x0, DECK.y0 - 8, WIN.x1, DECK.y0);
export const COLUMNS: P[][] = [1218, 1452].flatMap((x) => [rect(x, DECK.y1, x + 16, WIN.y1), [[x - 16, DECK.y1], [x + 32, DECK.y1], [x + 18, DECK.y1 + 26], [x - 2, DECK.y1 + 26]] as P[]]);
export const TRACK_BAND = { y0: DECK.y0 - 8 - 76, y1: DECK.y0 - 8 };
export const BAND: P[] = rect(WIN.x0, TRACK_BAND.y0, WIN.x1, TRACK_BAND.y1);
export const STREET: P[] = rect(WIN.x0, 520, WIN.x1, WIN.y1);
export const RADIATOR: P[] = rect(1196, 628, 1484, 746), GRILLE: P[] = rect(1184, 616, 1496, 700);
export const GRILLE_SLOTS: P[][] = Array.from({ length: 13 }, (_, i) => rect(1200 + i * 22, 626, 1210 + i * 22, 690));
export const ROOM_INKS = {
  frame: MIX.cream, wood: { y: 0.62, p: 0.5, b: 0.32 } as Sep, darkWood: { y: 0.75, p: 0.7, b: 0.55 } as Sep, iron: { b: 0.7, p: 0.5, y: 0.3 } as Sep,
  sky: { b: 0.95, p: 0.55 } as Sep, facade: { b: 1, p: 0.75, y: 0.25 } as Sep, lit: { y: 0.95, p: 0.25 } as Sep, girder: { y: 0.55, b: 0.95, p: 0.35 } as Sep,
  street: { b: 0.8, p: 0.6, y: 0.4 } as Sep, radiator: { y: 0.2, b: 0.25, p: 0.1 } as Sep, bedspread: { p: 0.55, y: 0.45, b: 0.1 } as Sep, sheet: { y: 0.12, b: 0.06 } as Sep,
};
// the room's back wall, door, wardrobe frame, bed, window and radiator: pages 7 and 8 differ only
// in what they add
export type RoomState = { wardOpen?: boolean; grilleOff?: boolean; winOpen?: boolean };
export const roomPieces = (o: RoomState): Piece[] => [
  { pts: WALL, ink: WALL_INK }, { pts: CORNICE, ink: { y: 0.3, p: 0.25, b: 0.35 } }, { pts: FLOORP, ink: FLOOR_INK },
  { pts: DOOR_FRAME, ink: ROOM_INKS.frame }, { pts: DOOR_LEAF, ink: ROOM_INKS.wood }, ...DOOR_PANELS.map((q) => ({ pts: q, ink: { y: 0.66, p: 0.55, b: 0.38 } as Sep })), { pts: KNOB, ink: MIX.orange }, { pts: LOCK, ink: MIX.orange },
  { pts: WARD_TOP, ink: ROOM_INKS.darkWood }, { pts: WARDROBE, ink: ROOM_INKS.darkWood }, ...(o.wardOpen ? [] : WARD_DOORS.map((q) => ({ pts: q, ink: ROOM_INKS.wood }))),
  { pts: WIN_FRAME, ink: ROOM_INKS.frame }, { pts: SKY, ink: ROOM_INKS.sky }, { pts: FACADES, ink: ROOM_INKS.facade }, ...LIT.map((q) => ({ pts: q, ink: ROOM_INKS.lit })), ...SHOPS.map((q) => ({ pts: q, ink: { y: 0.75, p: 0.35, b: 0.1 } as Sep })), { pts: BAND, ink: {} },
  { pts: STREET, ink: ROOM_INKS.street }, ...COLUMNS.map((q) => ({ pts: q, ink: ROOM_INKS.girder })), { pts: GIRDER, ink: ROOM_INKS.girder }, { pts: RAIL, ink: MIX.black },
  ...(o.winOpen ? [] : [{ pts: MULLION, ink: ROOM_INKS.frame }]), { pts: WIN_SILL, ink: ROOM_INKS.frame },
  { pts: RADIATOR, ink: ROOM_INKS.radiator }, ...(o.grilleOff ? [] : [{ pts: GRILLE, ink: MIX.cream }, ...GRILLE_SLOTS.map((q) => ({ pts: q, ink: { b: 0.5, p: 0.35, y: 0.3 } as Sep }))]),
  ...HEAD_BARS.map((q) => ({ pts: q, ink: ROOM_INKS.iron })), ...HEAD_POSTS.map((q) => ({ pts: q, ink: ROOM_INKS.iron })), { pts: HEAD_TOP, ink: ROOM_INKS.iron }, ...KNOBS.slice(0, 2).map((q) => ({ pts: q, ink: MIX.orange })),
];
export const bedPieces = (): Piece[] => [{ pts: BED_FRONT, ink: ROOM_INKS.bedspread }, { pts: BED_TOP, ink: { p: 0.45, y: 0.4, b: 0.05 } }, ...FOOT_POSTS.map((q) => ({ pts: q, ink: ROOM_INKS.iron })), { pts: KNOBS[2], ink: MIX.orange }];
export const roomKeys = (o: RoomState): Key[] => [
  edge(DOOR_FRAME, 2), edge(DOOR_LEAF, 2.2), ...DOOR_PANELS.map((q) => edge(q, 1.5, 0.7)), edge(WARDROBE, 2.2), edge(WARD_TOP, 1.8),
  ...(o.wardOpen ? [] : [...WARD_DOORS.map((q) => edge(q, 1.6)), stroke([[468, 440], [468, 480]], 3.5), stroke([[484, 440], [484, 480]], 3.5)]),
  edge(WIN_FRAME, 2), edge(SKY, 2.2), edge(WIN_SILL, 1.6), edge(GIRDER, 1.6, 0.8),
  // the girder's lattice
  ...Array.from({ length: 12 }, (_, i) => stroke([[WIN.x0 + i * 32, DECK.y1 - 4], [WIN.x0 + i * 32 + 16, DECK.y0 + 4], [WIN.x0 + i * 32 + 32, DECK.y1 - 4]], 1.3, 0.6)),
  ...(o.winOpen ? [] : [...[282, 432].map((y) => stroke([[WIN.x0, y], [WIN.x1, y]], 3.2, 0.9)), edge(MULLION, 1.4)]), // the casement bars
  edge(RADIATOR, 1.8), ...(o.grilleOff ? [] : [edge(GRILLE, 1.8)]),
  ...HEAD_POSTS.map((q) => edge(q, 1.4, 0.8)), edge(HEAD_TOP, 1.4, 0.8),
];

// ---------------------------------------------------------------- page 7
const LOOP = 240;
// Lili, small, in front of the wardrobe, the reel held out in both hands
const LILI_K = { x: 560, g: 850, h: 500, f: 1 as const };
const LILI = figure({ ...LILI_K, robe: "dress", head: "bare", cloth: "#b9d7ee", hair: PLATINUM, skin: "skin", ink: "#000", near: [1.15, 1.62], far: [0.95, 1.5] });
const BOB = bob(LILI, LILI_K.h, 1);
export const REEL_AT: P = [LILI.hands.near[0] + 30, LILI.hands.near[1] + 4];
// the reel in the stocking: the spool, and the sheer leg of the stocking round it, its toe hanging
export const stocking = (at: P, droop = 1): P[] => { const [x, y] = at; return [[x - 36, y - 10], [x - 22, y - 34], [x + 12, y - 38], [x + 36, y - 20], [x + 38, y + 14], [x + 26, y + 40], [x + 20 + 12 * droop, y + 110 * droop], [x + 2 + 12 * droop, y + 118 * droop], [x - 4, y + 44], [x - 30, y + 26]]; };
export const reel = (at: P, r = 28) => ({ reel: ring(at[0], at[1], r, r, 22), tape: ring(at[0], at[1], r * 0.68, r * 0.68, 20), hub: ring(at[0], at[1], r * 0.25, r * 0.25, 10) });
export const REEL_INKS = { stocking: { y: 0.55, p: 0.5, b: 0.4 } as Sep, reel: { b: 0.55, p: 0.4, y: 0.3 } as Sep, tape: { y: 0.85, p: 0.75, b: 0.65 } as Sep, hub: { y: 0.3, p: 0.2, b: 0.15 } as Sep };
// the mesh of the nylon over the spool
export const mesh = (at: P, r = 28): Key[] => [-2, -1, 0, 1, 2].map((i) => stroke([[at[0] - r + i * 12, at[1] - r], [at[0] + r * 0.4 + i * 12, at[1] + r]], 1, 0.45));
// page 7's own, larger, since it is what she holds out: the reel through a sheer beige nylon, the
// flange's three windows and the hub showing through, the stocking knotted under it, the toe hanging
const RR = 32, BAG_R = RR + 9, [RX, RY] = REEL_AT;
const arc = (r: number, a0: number, a1: number, n: number): P[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [RX + Math.cos(a) * r, RY + Math.sin(a) * r] as P; });
const BAG: P[] = [...arc(BAG_R, Math.PI * 0.62, Math.PI * 2.38, 26), [RX + 9, RY + BAG_R + 8], [RX - 5, RY + BAG_R + 8]]; // gathered to a neck under the reel
const KNOT: P[] = blob(RX + 2, RY + BAG_R + 13, 11, 8, 44, 0.12, 12);
const TOE: P[] = [[RX - 7, RY + BAG_R + 17], [RX + 9, RY + BAG_R + 17], [RX + 20, RY + BAG_R + 46], [RX + 18, RY + BAG_R + 66], [RX + 6, RY + BAG_R + 70], [RX - 3, RY + BAG_R + 50]];
const SHEEN: P[] = [...arc(BAG_R - 2, Math.PI * 1.05, Math.PI * 1.45, 6), ...arc(RR + 3, Math.PI * 1.45, Math.PI * 1.05, 6)];
const FLANGE = ring(RX, RY, RR, RR, 24), HUB = ring(RX, RY, RR * 0.3, RR * 0.3, 12), SPINDLE = ring(RX, RY, RR * 0.1, RR * 0.1, 8);
const WINDOWS: P[][] = [0, 1, 2].map((k) => { const a = -Math.PI / 2 + (k * 2 * Math.PI) / 3 - 0.62, b = a + 1.24; return [...arc(RR * 0.84, a, b, 8), ...arc(RR * 0.4, b, a, 5)]; });
const NYLON: Sep = { y: 0.2, p: 0.12, b: 0.03 }; // paler than the lamp-lit wall behind it
// what shows through the nylon prints paler, and carries its beige
const thru = (s: Sep): Sep => Object.fromEntries((["y", "p", "b"] as const).map((d) => [d, Math.min(1, ((s[d] as number) ?? 0) * 0.62 + (NYLON[d] as number))]));
// the nylon's mesh: fine chords across the bag, both ways
const chords = (r: number, a: number, step: number): Key[] => { const out: Key[] = [], c = Math.cos(a), sn = Math.sin(a); for (let d = -r + step; d < r - step / 2; d += step) { const h = Math.sqrt(r * r - d * d); out.push(stroke([[RX - sn * d - c * h, RY + c * d - sn * h], [RX - sn * d + c * h, RY + c * d + sn * h]], 0.8, 0.3)); } return out; };
// you: shirt sleeves, the red tie, a hand out for it
const DET_K = { x: 1150, g: 900, h: 560, f: -1 as const };
const DET = figure({ ...DET_K, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "#3a2a1e", skin: "skin", gold: "#b8321f", ink: "#000", near: [1.12, 1.62], far: [0.15, 0.3] });
// her suitcase open on the bed: the case, its lid standing up, a dress spilling over the edge
const CASE: P[] = [[846, 572], [1028, 572], [1040, 636], [836, 636]], CASE_IN: P[] = [[856, 578], [1018, 578], [1024, 598], [852, 598]];
const LID: P[] = [[850, 572], [1024, 572], [1034, 470], [860, 470]], LID_IN: P[] = [[862, 562], [1014, 562], [1022, 482], [870, 482]];
const SPILL: P[] = [[900, 590], [960, 584], [990, 600], [1004, 640], [992, 682], [970, 690], [964, 650], [930, 610]];
const CLASPS: P[][] = [rect(872, 610, 886, 624), rect(990, 610, 1004, 624)], HANDLE: P[] = [[912, 636], [960, 636], [956, 648], [916, 648]];
// the chain across from the frame to the door's track, and the key with its brass tag in the lock
const CHAIN: P[] = Array.from({ length: 9 }, (_, i) => { const u = i / 8; return [316 - u * 70, 420 + Math.sin(u * Math.PI) * 26 + u * 6] as P; });
const TRACK: P[] = rect(234, 418, 258, 432), CATCH: P[] = rect(310, 410, 322, 430);
const TAG: P[] = [[268, 552], [288, 552], [296, 600], [278, 612], [260, 600]];
const BULB_P: P[] = blob(BULB.x, BULB.y, 15, 19, 5, 0.04, 12);

const lili = fromMotif(LILI.m), det = fromMotif(DET.m);
const pieces: Piece[] = [
  ...roomPieces({}),
  { pts: TRACK, ink: MIX.orange }, { pts: CATCH, ink: MIX.orange }, { pts: TAG, ink: MIX.orange },
  ...bedPieces(), { pts: PILLOW, ink: ROOM_INKS.sheet },
  { pts: LID, ink: MIX.brown }, { pts: LID_IN, ink: { p: 0.5, y: 0.2 } }, { pts: CASE, ink: MIX.brown }, { pts: CASE_IN, ink: { p: 0.35, y: 0.2 } }, { pts: SPILL, ink: { b: 0.3, y: 0.08 } }, ...CLASPS.map((q) => ({ pts: q, ink: MIX.orange })), { pts: HANDLE, ink: MIX.black },
  { pts: BULB_P, ink: { y: 0.25 } },
  ...det.pieces,
  { pts: BOB, ink: { y: 0.3, p: 0.08 } }, ...lili.pieces,
  { pts: TOE, ink: NYLON }, { pts: BAG, ink: NYLON }, { pts: KNOT, ink: { y: 0.42, p: 0.3, b: 0.12 } },
  { pts: FLANGE, ink: thru({ b: 0.3, p: 0.2, y: 0.15 }) }, ...WINDOWS.map((q) => ({ pts: q, ink: thru(REEL_INKS.tape) })), { pts: HUB, ink: thru(REEL_INKS.hub) }, { pts: SPINDLE, ink: thru(MIX.black) },
  { pts: SHEEN, ink: { y: 0.1 } },
];
const front = [...lili.pieces.map((p) => p.pts), BOB, BAG, TOE];
const keys: Key[] = [
  ...roomKeys({}),
  edge(BED_FRONT, 1.8, 0.8, [...det.pieces.map((p) => p.pts)]), ...FOOT_POSTS.map((q) => edge(q, 1.4, 0.8, det.pieces.map((p) => p.pts))), edge(PILLOW, 1.3, 0.7, front),
  edge(LID, 1.8, 0.9, front), edge(CASE, 1.8, 0.9, front), edge(SPILL, 1.2, 0.6, front),
  { pts: CHAIN, w: 3, op: 0.95 }, ...CHAIN.filter((_, i) => i % 2).map(([x, y]) => edge(ring(x, y, 4, 3, 8), 1.2, 0.9)),
  stroke([[BULB.x, 34], [BULB.x, BULB.y - 18]], 1.6), edge(BULB_P, 1.2, 0.8),
  ...det.keys, edge(BOB, 1.8, 0.9, lili.pieces.map((p) => p.pts)), ...lili.keys,
  edge(BAG, 1.6, 0.95), edge(TOE, 1.4, 0.9, [KNOT]), edge(KNOT, 1.4, 0.95), edge(FLANGE, 1.3, 0.6), ...WINDOWS.map((q) => edge(q, 1.2, 0.6)), edge(HUB, 1.1, 0.6),
  ...chords(BAG_R, 0.8, 7), ...chords(BAG_R, -0.8, 7), stroke([[RX + 1, RY + BAG_R + 20], [RX + 10, RY + BAG_R + 56]], 0.9, 0.4), // the toe's seam
];

// ---------------------------------------------------------------- what moves
// the train: cars along the deck, windows lit. The band it runs in is bare paper on the plate, and
// the train prints over it each frame together with the dark facade behind it, so the lit windows
// stay bright. It crosses both panes once a loop and wraps out of sight at both ends.
const CAR = 300, GAP = 18, CARS = 3, TRAIN = CARS * CAR + (CARS - 1) * GAP;
export type Pane = { x0: number; x1: number };
export const train = (t: number, loop: number, reveal: number, panes: Pane[] = PANES): Piece[] => {
  const k = (s: Sep): Sep => Object.fromEntries(Object.entries(s).map(([d, v]) => [d, (v as number) * reveal])), { y0, y1 } = TRACK_BAND;
  const span = (a: number, b: number, y0: number, y1: number, ink: Sep, out: Piece[]) => { for (const pn of panes) { const lo = Math.max(a, pn.x0), hi = Math.min(b, pn.x1); if (hi - lo >= 1) out.push({ pts: rect(lo, y0, hi, y1), ink }); } };
  const bg = k(ROOM_INKS.facade as Sep), body = k({ y: 0.55, b: 0.75, p: 0.25 }), glass = k({ y: 0.9, p: 0.14 }), out: Piece[] = [];
  const x0 = WIN.x0 - TRAIN - 10 + (t / loop) * (WIN.x1 - WIN.x0 + TRAIN + 20);
  let cur = WIN.x0; // what lies left of each car is the facade
  for (let c = 0; c < CARS; c++) {
    const a = x0 + c * (CAR + GAP), b = a + CAR;
    span(cur, a, y0, y1, bg, out); cur = b;
    if (b < WIN.x0 || a > WIN.x1) continue;
    span(a, b, y0 + 6, y0 + 20, body, out); span(a, b, y0 + 46, y1 - 2, body, out); span(a, b, y1 - 2, y1, bg, out); span(a, b, y0, y0 + 6, bg, out);
    let px = a;
    for (let w = 0; w < 5; w++) { const wx = a + 22 + w * 56; span(px, wx, y0 + 20, y0 + 46, body, out); span(wx, wx + 36, y0 + 20, y0 + 46, glass, out); px = wx + 36; }
    span(px, b, y0 + 20, y0 + 46, body, out);
  }
  span(cur, WIN.x1, y0, y1, bg, out);
  return out;
};
export const r07 = press({
  id: "r07", title: "Lili", loop: LOOP, pieces, keys,
  extra: {
    b: (g) => letter(g, "9", 278, 572, { cap: 16, color: INK.blue, seed: 9, align: "center", w: 2.4 }),
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    overprint(g, train(t, LOOP, reveal));
    // the bulb: its glow never quite steady, a moth going round it four times a loop
    const fl = 0.55 + 0.25 * Math.sin(TT * 5) * Math.sin(TT * 3 + 1) + 0.1 * Math.sin(TT * 17);
    const ma = TT * 4, mx = BULB.x + Math.cos(ma) * 56, my = BULB.y + 8 + Math.sin(ma) * 22, wing = 5 + 4 * Math.abs(Math.sin(TT * 40));
    overprint(g, [
      { pts: blob(BULB.x, BULB.y, 46, 50, 4, 0.05, 16), ink: { y: 0.45 * fl * reveal } },
      { pts: [[mx - 9, my - wing], [mx + 9, my - wing], [mx + 2, my + 2], [mx - 2, my + 2]], ink: { b: 0.7 * reveal, p: 0.5 * reveal, y: 0.4 * reveal } },
    ]);
  },
});
