// CANICULE PAGE 3 · L'APPARTEMENT. One idea: someone has turned Lili's flat over looking for
// something small, and missed it.
// Third floor, rue Houdon, evening through the open window. The drawers dumped on the floor, the
// mattress slit and its stuffing out, the Flamingo poster peeled half off the wall, the photo frame
// face down on the bedside table. Through the bathroom door, the bath with its side panel off, and on
// the tiles under it, the flat key with its label, taped.
// What moves: the net curtain breathing at the window, the tap dripping, a fly.
import { oval, rng, turn, type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { figure } from "./figures";
import { INK, MIX, PAPER, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";

const LOOP = 180;
const FLOOR = 640;
const R = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const edge = (pts: P[], w = 2.2, op = 0.9, hide?: P[][]): Key => ({ pts: [...pts, pts[0]], w, op, hide });

// ---------------------------------------------------------------- the room
const WALL = R(0, 0, 1600, FLOOR), FLOORP = R(0, FLOOR, 1600, 900);
const STRIPES: P[][] = Array.from({ length: 21 }, (_, i) => R(20 + i * 60, 0, 44 + i * 60, FLOOR)); // the wallpaper
const PLANKS: P[][] = Array.from({ length: 6 }, (_, i) => { const y = FLOOR + 22 + i * i * 9 + i * 20; return [[0, y], [1600, y]] as P[]; });
// the window, open on the roofs
const WIN = { x0: 60, x1: 330, y0: 90, y1: 540 };
const WINDOW = R(WIN.x0, WIN.y0, WIN.x1, WIN.y1), FRAME = R(WIN.x0 - 18, WIN.y0 - 18, WIN.x1 + 18, WIN.y1 + 26);
const ROOFS: P[] = [[WIN.x0, 360], [110, 360], [110, 320], [126, 320], [126, 350], [200, 330], [270, 350], [270, 300], [284, 300], [284, 340], [WIN.x1, 340], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]];
const LEAVES: P[][] = [[[WIN.x0, WIN.y0], [WIN.x0 + 36, WIN.y0 + 30], [WIN.x0 + 36, WIN.y1 - 20], [WIN.x0, WIN.y1]], [[WIN.x1, WIN.y0], [WIN.x1 + 40, WIN.y0 + 34], [WIN.x1 + 40, WIN.y1 - 24], [WIN.x1, WIN.y1]]];
const ROD: P[] = R(WIN.x0 - 30, WIN.y0 - 30, WIN.x1 + 30, WIN.y0 - 24);
// the bedside table, the frame face down on it, a lamp
const NIGHT = R(360, 520, 450, 640), NIGHT_TOP = R(352, 510, 458, 522);
const FRAME_DOWN = R(364, 498, 430, 510), STRUT = tube2([[414, 498], [428, 472]], 2.4);
const LAMP_BASE = R(436, 470, 446, 510), LAMP_SHADE: P[] = [[424, 440], [458, 440], [466, 472], [416, 472]];
// the bed, the mattress slit, its stuffing out
const HEAD = R(470, 400, 494, 668), FOOT = R(906, 492, 930, 668);
const BEDFRAME = R(486, 590, 916, 628), MATTRESS: P[] = [[490, 540], [904, 540], [912, 552], [912, 592], [482, 592], [482, 552]];
const SLITS: P[][] = [[[560, 548], [640, 586]], [[680, 546], [760, 588]], [[800, 550], [860, 580]]];
const rs = rng(5);
const STUFF: P[][] = [...SLITS.flatMap(([a, b], j) => Array.from({ length: 4 }, (_, i) => { const k = (i + 0.5) / 4; return blob(a[0] + (b[0] - a[0]) * k + (rs() - 0.5) * 20, a[1] + (b[1] - a[1]) * k - 10 - rs() * 16, 16 + rs() * 12, 11 + rs() * 7, 60 + j * 5 + i, 0.45, 12, rs() * 3); })), ...Array.from({ length: 6 }, (_, i) => blob(560 + i * 64 + rs() * 30, 656 + rs() * 50, 12 + rs() * 12, 7 + rs() * 5, 80 + i, 0.4, 12, rs() * 0.6))];
// the poster, pinned by one corner, the rest hanging; the unfaded patch of wallpaper where it was
const PIN: P = [566, 116], TILT = 21, PW = 200, PH = 290;
const tilt = (pts: P[]) => turn(pts, PIN[0], PIN[1], TILT);
const GHOST = R(PIN[0], PIN[1], PIN[0] + PW, PIN[1] + PH);
const POSTER = tilt(R(PIN[0], PIN[1], PIN[0] + PW, PIN[1] + PH)), BAND = tilt(R(PIN[0] + 10, PIN[1] + 10, PIN[0] + PW - 10, PIN[1] + 56));
const CURL = tilt([[PIN[0] + PW, PIN[1] + PH - 70], [PIN[0] + PW, PIN[1] + PH], [PIN[0] + PW - 64, PIN[1] + PH], [PIN[0] + PW - 40, PIN[1] + PH - 30]]); // its corner curling off, the white back
const TAPES: P[][] = [R(PIN[0] + PW - 14, PIN[1] - 6, PIN[0] + PW + 6, PIN[1] + 8), R(PIN[0] - 8, PIN[1] + PH - 8, PIN[0] + 10, PIN[1] + PH + 6), R(PIN[0] + PW - 10, PIN[1] + PH - 6, PIN[0] + PW + 8, PIN[1] + PH + 8)];
const LILI = figure({ x: PIN[0] + 96, g: PIN[1] + PH - 14, h: 200, f: 1, robe: "dress", head: "bare", cloth: "pink", hair: "#f4ecc4", skin: "skin", ink: "#000", near: [0.35, 2.75], far: [0.2, 0.35], lite: true });
const MICP = tilt(tube2([[LILI.hands.near[0] + 2, LILI.hands.near[1] + 2], [LILI.hands.near[0] - 10, LILI.hands.near[1] - 22]], 4));
const lili = fromMotif({ fills: LILI.m.fills.map((f) => ({ ...f, pts: tilt(f.pts) })), lines: LILI.m.lines.map((l) => ({ ...l, pts: tilt(l.pts) })), parts: LILI.m.parts.map(tilt) }, [CURL]);
// the chest of drawers, gutted, its drawers upside down on the floor with what was in them
const CHEST = R(990, 420, 1160, FLOOR), CHEST_TOP = R(982, 410, 1168, 422);
const HOLES = [0, 1, 2].map((i) => R(1004, 436 + i * 66, 1146, 486 + i * 66));
// each drawer upside down: its bottom up, its front along one side with the knob
const DRAWERS: P[][] = [[[930, 700], [1080, 690], [1086, 736], [936, 746]], [[1060, 764], [1200, 774], [1196, 818], [1056, 808]]];
const FRONTS: P[][] = [[[936, 746], [1086, 736], [1088, 760], [938, 772]], [[1056, 808], [1196, 818], [1195, 842], [1055, 832]]];
const KNOBS: P[][] = [oval(1012, 755, 6, 5, 8), oval(1126, 826, 6, 5, 8)];
const CLOTHES: { pts: P[]; ink: Sep }[] = [
  { pts: blob(900, 760, 60, 16, 41, 0.35, 14, 0.2), ink: MIX.pink }, { pts: blob(1130, 700, 50, 12, 42, 0.3, 14, -0.1), ink: { y: 0.2, p: 0.1, b: 0.15 } },
  { pts: blob(990, 800, 44, 10, 43, 0.4, 14, 0.4), ink: { b: 0.5, p: 0.3 } }, { pts: blob(1230, 740, 38, 10, 44, 0.3, 14, 0.1), ink: { y: 0.8, p: 0.2 } },
];
const PAPERS: P[][] = [[[780, 720], [840, 710], [846, 750], [786, 758]], [[820, 800], [880, 812], [872, 846], [812, 834]], [[1250, 830], [1310, 820], [1316, 856], [1256, 862]]].map((q) => q as P[]);
// the bathroom through its door
const BATH_DOOR = { x0: 1210, x1: 1560, y0: 130, y1: FLOOR + 10 };
const BFRAME = R(BATH_DOOR.x0 - 20, BATH_DOOR.y0 - 20, BATH_DOOR.x1 + 20, BATH_DOOR.y1);
const BROOM = R(BATH_DOOR.x0, BATH_DOOR.y0, BATH_DOOR.x1, BATH_DOOR.y1);
const BFLOOR: P[] = [[BATH_DOOR.x0, 600], [BATH_DOOR.x1, 600], [BATH_DOOR.x1, BATH_DOOR.y1], [BATH_DOOR.x0, BATH_DOOR.y1]];
const DOOR_LEAF: P[] = [[BATH_DOOR.x1 - 36, BATH_DOOR.y0 + 12], [BATH_DOOR.x1, BATH_DOOR.y0], [BATH_DOOR.x1, BATH_DOOR.y1], [BATH_DOOR.x1 - 36, BATH_DOOR.y1 - 12]];
const RIM = R(1226, 452, 1500, 474), CAVITY = R(1236, 474, 1490, 604);
const TUB: P[] = [[1236, 474], [1490, 474], [1486, 500], [1462, 530], [1400, 546], [1300, 546], [1256, 530], [1240, 504]];
const PIPE = tube2([[1450, 474], [1450, 540], [1480, 560], [1490, 560]], 7);
const PANEL: P[] = [[1256, 612], [1500, 598], [1506, 640], [1250, 652]]; // the side panel, off, leaning on the floor
const SCREWS: P[][] = [[1300, 640], [1330, 648]].map(([x, y]) => oval(x, y, 4, 3, 8));
const HOLESP: P[][] = [[1272, 628], [1480, 616], [1276, 642], [1484, 630]].map(([x, y]) => oval(x, y, 3, 3, 8));
const KEY = { x: 1330, y: 560 };
const TAPE = R(KEY.x - 26, KEY.y - 8, KEY.x + 26, KEY.y + 8);
const KEYB: P[] = [...oval(KEY.x - 14, KEY.y, 10, 10, 12), [KEY.x - 4, KEY.y - 3], [KEY.x + 26, KEY.y - 3], [KEY.x + 26, KEY.y + 5], [KEY.x + 18, KEY.y + 5], [KEY.x + 18, KEY.y + 3], [KEY.x - 4, KEY.y + 3]];
const LABEL: P[] = [[KEY.x - 30, KEY.y + 6], [KEY.x - 2, KEY.y + 14], [KEY.x - 10, KEY.y + 42], [KEY.x - 38, KEY.y + 34]];
const TAP = { x: 1484, y: 424 };
const TAP_P: P[] = [[TAP.x + 12, TAP.y - 12], [TAP.x + 12, TAP.y + 4], [TAP.x - 2, TAP.y + 4], [TAP.x - 2, TAP.y + 14], [TAP.x - 10, TAP.y + 14], [TAP.x - 10, TAP.y - 4], [TAP.x + 4, TAP.y - 4], [TAP.x + 4, TAP.y - 12]];
const TILES: P[][] = [...Array.from({ length: 7 }, (_, i) => [[BATH_DOOR.x0, 170 + i * 60], [BATH_DOOR.x1, 170 + i * 60]] as P[]), ...Array.from({ length: 6 }, (_, i) => [[1260 + i * 60, BATH_DOOR.y0], [1260 + i * 60, 452]] as P[])];

function tube2(c: P[], r: number): P[] { // a rod of even width along a polyline, closed
  const L: P[] = [], Rr: P[] = [];
  c.forEach((p, i) => { const q = c[Math.min(c.length - 1, i + 1)], o = c[Math.max(0, i - 1)], dx = q[0] - o[0], dy = q[1] - o[1], l = Math.hypot(dx, dy) || 1; L.push([p[0] - (dy / l) * r, p[1] + (dx / l) * r]); Rr.push([p[0] + (dy / l) * r, p[1] - (dx / l) * r]); });
  return [...L, ...Rr.reverse()];
}

// ---------------------------------------------------------------- the print
const EVE = (x: number, y: number) => Math.exp(-((x - 200) ** 2 + (y - 320) ** 2) / 260000); // the evening, coming in at the window
const pieces: Piece[] = [
  { pts: WALL, ink: { y: 0.34, p: (x, y) => 0.18 + 0.2 * EVE(x, y) } },
  ...STRIPES.map((q) => ({ pts: q, ink: { y: 0.5, p: (x: number, y: number) => 0.3 + 0.2 * EVE(x, y), b: 0.06 } })),
  { pts: FLOORP, ink: { y: 0.75, p: 0.45, b: 0.12 } },
  { pts: FRAME, ink: MIX.cream }, { pts: ROD, ink: MIX.brown },
  { pts: WINDOW, ink: { p: (_x, y) => 0.25 + 0.55 * (y - WIN.y0) / (WIN.y1 - WIN.y0), y: (_x, y) => 0.9 - 0.45 * (y - WIN.y0) / (WIN.y1 - WIN.y0) } },
  { pts: ROOFS, ink: MIX.dusk },
  ...LEAVES.map((q) => ({ pts: q, ink: { y: 0.3, p: 0.25, b: 0.12 } as Sep })),
  // the poster's ghost, the poster
  { pts: GHOST, ink: { y: 0.2, p: 0.1 } },
  { pts: POSTER, ink: { b: 0.85, p: 0.45, y: 0.1 } }, { pts: BAND, ink: MIX.yellow },
  ...lili.pieces, { pts: MICP, ink: MIX.black },
  { pts: CURL, ink: { y: 0.1 } }, ...TAPES.map((q) => ({ pts: q, ink: { y: 0.25, b: 0.05 } as Sep })),
  // the bedside table
  { pts: NIGHT, ink: { y: 0.9, p: 0.6, b: 0.25 } }, { pts: NIGHT_TOP, ink: { y: 0.9, p: 0.45, b: 0.2 } },
  { pts: FRAME_DOWN, ink: MIX.black }, { pts: STRUT, ink: MIX.black },
  { pts: LAMP_BASE, ink: MIX.brown }, { pts: LAMP_SHADE, ink: { y: 0.6, p: 0.2 } },
  // the bed
  { pts: HEAD, ink: { y: 0.8, p: 0.7, b: 0.4 } }, { pts: BEDFRAME, ink: { y: 0.8, p: 0.7, b: 0.4 } },
  { pts: MATTRESS, ink: { b: 0.35, p: 0.1, y: 0.1 } }, ...SLITS.map((s) => ({ pts: tube2(s, 5), ink: MIX.night })),
  ...STUFF.map((q) => ({ pts: q, ink: { y: 0.06 } })),
  { pts: FOOT, ink: { y: 0.8, p: 0.7, b: 0.4 } },
  // the chest of drawers
  { pts: CHEST, ink: { y: 0.8, p: 0.5, b: 0.3 } }, { pts: CHEST_TOP, ink: { y: 0.85, p: 0.4, b: 0.2 } },
  ...HOLES.map((q) => ({ pts: q, ink: MIX.black })),
  // the bathroom
  { pts: BFRAME, ink: MIX.cream },
  { pts: BROOM, ink: { b: 0.08, y: 0.06 } }, { pts: BFLOOR, ink: { b: 0.25, p: 0.1 } },
  { pts: CAVITY, ink: { b: 0.9, p: 0.7, y: 0.5 } }, { pts: TUB, ink: { b: 0.35, p: 0.2, y: 0.2 } }, { pts: PIPE, ink: { b: 0.4, p: 0.25, y: 0.3 } },
  { pts: TAPE, ink: { y: 0.12, p: 0.1 } }, { pts: KEYB, ink: { y: 0.75, p: 0.3 } }, { pts: LABEL, ink: {} },
  { pts: RIM, ink: { y: 0.04 } }, { pts: TAP_P, ink: { b: 0.45, p: 0.2 } },
  { pts: PANEL, ink: { p: 0.3, y: 0.15 } }, ...HOLESP.map((q) => ({ pts: q, ink: MIX.black })), ...SCREWS.map((q) => ({ pts: q, ink: { b: 0.5, p: 0.3 } as Sep })),
  { pts: DOOR_LEAF, ink: MIX.cream },
  // what was thrown on the floor
  ...PAPERS.map((q) => ({ pts: q, ink: { y: 0.06 } })),
  ...DRAWERS.map((q) => ({ pts: q, ink: { y: 0.45, p: 0.2, b: 0.04 } })), ...FRONTS.map((q) => ({ pts: q, ink: { y: 0.85, p: 0.55, b: 0.3 } })), ...KNOBS.map((q) => ({ pts: q, ink: MIX.black })), ...CLOTHES,
];
const keys: Key[] = [
  ...lili.keys,
  edge(WINDOW, 2.2), edge(FRAME, 1.8), ...LEAVES.map((q) => edge(q, 1.6)),
  edge(GHOST, 1.2, 0.35, [POSTER]), edge(POSTER, 2), edge(CURL, 1.8),
  edge(NIGHT, 2), edge(NIGHT_TOP, 1.8), edge(LAMP_SHADE, 1.6),
  edge(HEAD, 2), edge(FOOT, 2), edge(BEDFRAME, 2, 0.9, [FOOT]), edge(MATTRESS, 2, 0.9, [FOOT, ...STUFF]),
  ...STUFF.map((q) => edge(q, 1.3, 0.6)),
  edge(CHEST, 2), edge(CHEST_TOP, 1.8),
  edge(BFRAME, 2), edge(RIM, 2), edge(CAVITY, 1.6, 0.8, [PANEL]), edge(PANEL, 1.8), edge(LABEL, 1.4), edge(TAPE, 1.2, 0.7),
  ...TILES.map((l) => ({ pts: l, w: 1.2, op: 0.45, hide: [RIM, CAVITY, DOOR_LEAF] })),
  ...PLANKS.map((l) => ({ pts: l, w: 1.4, op: 0.5, hide: [...DRAWERS, ...FRONTS, ...CLOTHES.map((c) => c.pts), ...PAPERS, ...STUFF, BFLOOR, NIGHT, HEAD, FOOT, BEDFRAME] })),
  ...DRAWERS.map((q) => edge(q, 1.8)), ...FRONTS.map((q) => edge(q, 1.8)), ...PAPERS.map((q) => edge(q, 1.2, 0.7)),
];

// ---------------------------------------------------------------- what moves
// the net curtain: bare paper, a veil over the sky, its hem lifting into the room
const curtain = (TT: number): P[] => {
  const b = Math.sin(TT) * 0.6 + Math.sin(2 * TT + 1) * 0.4, top = WIN.y0 - 24;
  const left: P[] = Array.from({ length: 12 }, (_, i) => { const k = i / 11; return [196 - k * k * (26 + 22 * b), top + k * (WIN.y1 + 10 - top)] as P; });
  const hem: P[] = Array.from({ length: 8 }, (_, i) => { const k = i / 7; return [196 - (26 + 22 * b) + k * (WIN.x1 + 32 - 196 + 26 + 22 * b), WIN.y1 + 10 + Math.sin(k * 9 + TT * 2) * 4 + k * 6 * b] as P; });
  return [...left, ...hem, [WIN.x1 + 32, top]];
};
const FOLDS = [0.18, 0.4, 0.62, 0.82];
export const r03 = press({
  id: "r03", title: "L'Appartement", loop: LOOP, pieces, keys,
  extra: {
    p: (g) => { const c = g.cur; c.save(); c.translate(PIN[0], PIN[1]); c.rotate((TILT * Math.PI) / 180); c.translate(-PIN[0], -PIN[1]); letter(g, "FLAMINGO", PIN[0] + PW / 2, PIN[1] + 22, { cap: 21, color: INK.pink, seed: 11, align: "center", w: 3.6 }); c.restore(); },
    b: (g) => letter(g, "214", KEY.x - 21, KEY.y + 16, { cap: 9, color: INK.blue, seed: 12, w: 1.6 }),
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, C = curtain(TT);
    g.fill(C, PAPER, 0.78 * reveal);
    const sway = Math.sin(TT) * 0.6 + Math.sin(2 * TT + 1) * 0.4;
    overprint(g, FOLDS.map((k, i) => { const x0 = 196 + k * (WIN.x1 + 32 - 196), lean = -(1 - k) * (26 + 22 * sway) * 0.8; return { pts: [[x0 - 3, WIN.y0 - 24], [x0 + 3, WIN.y0 - 24], [x0 + 5 + lean, WIN.y1 + 8], [x0 - 5 + lean, WIN.y1 + 8]] as P[], ink: { p: (0.2 + 0.06 * Math.sin(TT + i)) * reveal } }; }));
    // the tap: a drop swells, lets go, falls into the bath, four times a loop
    const ph = ((t * 4) % LOOP) / LOOP, drop: Piece[] = [];
    if (ph < 0.7) drop.push({ pts: oval(TAP.x - 6, TAP.y + 16 + ph * 4, 2 + ph * 3, 2 + ph * 4, 8), ink: { b: 0.6 * reveal, p: 0.2 * reveal } });
    else { const f = (ph - 0.7) / 0.3; drop.push({ pts: oval(TAP.x - 6, TAP.y + 22 + f * f * 30, 3, 5, 8), ink: { b: 0.6 * reveal, p: 0.2 * reveal } }); }
    overprint(g, drop);
    // the fly, round the poster and the lamp
    const fx = 700 + 190 * Math.sin(TT * 2) + 60 * Math.sin(TT * 5), fy = 330 + 90 * Math.sin(TT * 3 + 0.7) + 30 * Math.cos(TT * 7), flap = Math.sin(TT * 45) > 0 ? 1 : 0.6;
    overprint(g, [{ pts: oval(fx, fy, 5, 3.5, 8), ink: { y: 0.8 * reveal, p: 0.9 * reveal, b: reveal } }, { pts: oval(fx - 3, fy - 5 * flap, 5, 2.5 * flap, 8), ink: { b: 0.3 * reveal } }, { pts: oval(fx + 3, fy - 5 * flap, 5, 2.5 * flap, 8), ink: { b: 0.3 * reveal } }]);
  },
});
