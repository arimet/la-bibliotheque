// CANICULE PAGE 8 · LA CHAMBRE VIDE. One idea: she has gone, and left behind the one thing
// everyone wants.
// Room 9 again (page 7's room), empty under the bulb: the bed unmade, the sheet dragged to the floor,
// the wardrobe open on bare hangers, the window open on the viaduct. The radiator's grille lies on
// the floor, its four screws beside it; behind the fins, the reel in its nylon stocking. Across the
// street, under the viaduct, the grey 504 parked with its lights off.
// What moves: the net curtain blowing in, a train on the viaduct, the bulb swinging a little.
import { type P } from "./core";
import { blob } from "./gallery";
import { MIX, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";
import {
  BED_FRONT, BED_TOP, BULB, FOOT_POSTS, PILLOW, RADIATOR, REEL_INKS, ROOM_INKS, WARD, WIN, bedPieces, edge, inkPen, inset, mesh, reel, rect, ring, roomKeys, roomPieces, stocking, stroke, train,
} from "./r07";

const LOOP = 240;
// a net curtain at night, in a lit room, hides what is behind it: it hangs over the left of the
// opening; the bulb's glare is a round of bare paper it swings in
const NET: P[] = rect(1160, 128, 1296, 584), GLARE: P[] = blob(862, 176, 36, 34, 6, 0.05, 16);

// ---------------------------------------------------------------- the grey 504, in profile
// A long boxy saloon: the body to the beltline, the trapezoid cabin, the rectangular lamps, the two
// wheels. `L` its length, `f` where its nose points. Page 9 parks it in front of the café.
export const car504 = (o: { x: number; g: number; L: number; f: 1 | -1; lights?: boolean; doorOpen?: boolean; paint?: Sep }) => {
  const { L, f } = o, X = (u: number) => (f === 1 ? o.x + u * L : o.x + (1 - u) * L), Y = (v: number) => o.g - v * L, Q = (pts: number[][]): P[] => pts.map(([u, v]) => [X(u), Y(v)]);
  const paint = o.paint ?? { b: 0.4, p: 0.15, y: 0.05 }, shade: Sep = { b: 0.55, p: 0.25, y: 0.12 }, glass: Sep = { b: 0.85, p: 0.55, y: 0.3 }, chrome = MIX.cream;
  const cabin = Q([[0.25, 0.2], [0.33, 0.305], [0.6, 0.31], [0.7, 0.205]]);
  const body = Q([[0, 0.085], [0, 0.19], [0.03, 0.205], [0.25, 0.21], [0.72, 0.21], [0.97, 0.19], [1, 0.175], [1, 0.085]]);
  const sill = Q([[0.02, 0.085], [0.98, 0.085], [0.98, 0.1], [0.02, 0.1]]);
  const rearWin = Q([[0.345, 0.218], [0.35, 0.29], [0.455, 0.294], [0.455, 0.218]]), frontWin = Q([[0.47, 0.218], [0.47, 0.294], [0.59, 0.296], [0.665, 0.218]]);
  const bumpers = [Q([[-0.01, 0.1], [0.06, 0.1], [0.06, 0.125], [-0.01, 0.125]]), Q([[0.94, 0.1], [1.01, 0.1], [1.01, 0.125], [0.94, 0.125]])];
  const lamp = Q([[0.975, 0.14], [1.005, 0.14], [1.005, 0.17], [0.975, 0.17]]), tail = Q([[-0.005, 0.14], [0.02, 0.14], [0.02, 0.18], [-0.005, 0.18]]);
  const wheel = (u: number) => ring(X(u), Y(0.075), 0.075 * L, 0.075 * L, 22), hub = (u: number) => ring(X(u), Y(0.075), 0.036 * L, 0.036 * L, 14);
  const arches = [0.2, 0.8].map((u) => ring(X(u), Y(0.075), 0.088 * L, 0.088 * L, 22));
  const opening = Q([[0.3, 0.1], [0.3, 0.21], [0.46, 0.21], [0.46, 0.1]]);
  // the rear door swung out toward us on its front hinge: narrower, and lower where it comes nearer
  const hx = X(0.46), dw = 0.16 * L * 0.55 * -f, dy = 0.03 * L;
  const door: P[] = [[hx, Y(0.1)], [hx, Y(0.295)], [hx + dw * 0.8, Y(0.29) + dy], [hx + dw, Y(0.21) + dy], [hx + dw, Y(0.1) + dy * 1.2]];
  const doorWin: P[] = [[hx - f * 4, Y(0.22)], [hx - f * 4, Y(0.285)], [hx + dw * 0.78, Y(0.282) + dy], [hx + dw * 0.92, Y(0.22) + dy]];
  const pieces: Piece[] = [
    { pts: cabin, ink: paint }, ...arches.map((q) => ({ pts: q, ink: MIX.black })), { pts: body, ink: paint }, { pts: sill, ink: shade },
    { pts: rearWin, ink: glass }, { pts: frontWin, ink: glass }, ...(o.doorOpen ? [{ pts: opening, ink: MIX.black }] : []),
    ...bumpers.map((q) => ({ pts: q, ink: chrome })), { pts: lamp, ink: o.lights ? { y: 0.9, p: 0.1 } : MIX.cream }, { pts: tail, ink: { y: 0.8, p: 0.9 } },
    ...[0.2, 0.8].flatMap((u) => [{ pts: wheel(u), ink: MIX.black }, { pts: hub(u), ink: chrome }]),
  ];
  const keys: Key[] = [
    edge(body, 1.8), edge(cabin, 1.8), edge(rearWin, 1.2, 0.8), edge(frontWin, 1.2, 0.8),
    stroke(Q([[0.3, 0.1], [0.3, 0.205]]), 1.2, 0.8), stroke(Q([[0.46, 0.1], [0.46, 0.21]]), 1.2, 0.8), stroke(Q([[0.64, 0.1], [0.66, 0.21]]), 1.2, 0.8), // the door lines
    stroke(Q([[0.4, 0.19], [0.43, 0.19]]), 2.4), stroke(Q([[0.56, 0.19], [0.59, 0.19]]), 2.4), // the handles
    stroke(Q([[0.03, 0.16], [0.97, 0.155]]), 1, 0.5), // the swage line along the flank
  ];
  return {
    pieces, keys, door: o.doorOpen ? [{ pts: door, ink: paint }, { pts: doorWin, ink: glass }] as Piece[] : [], doorKeys: o.doorOpen ? [edge(door, 1.8), edge(doorWin, 1.2, 0.8)] : [],
    lamp: [X(1.0), Y(0.155)] as P, driver: [X(0.56), Y(0.25)] as P, frontWin, all: [body, cabin, ...arches, ...[0.2, 0.8].map(wheel)],
  };
};

// ---------------------------------------------------------------- what is left in the room
// the wardrobe open: its back in shadow, the rail, bare hangers; one door swung out toward us
const WARD_IN: P[] = rect(WARD.x0 + 14, WARD.y0 + 18, WARD.x1 - 14, WARD.y1 - 26), WARD_FLOOR: P[] = rect(WARD.x0 + 14, WARD.y1 - 60, WARD.x1 - 14, WARD.y1 - 26);
const WARD_DOOR: P[] = [[WARD.x0 + 4, WARD.y0 + 20], [WARD.x0 - 40, WARD.y0 + 40], [WARD.x0 - 40, WARD.y1 + 6], [WARD.x0 + 4, WARD.y1 - 26]];
const HANGERS: P[][] = [410, 470, 548].map((x, i) => [[x - 34, 252 + i * 3], [x, 228], [x + 34, 252 + i * 3], [x - 34, 252 + i * 3]]);
// the bed unmade: the sheet pulled half off and down to the floor, the pillow thrown to the foot
const SHEET: P[] = [[700, 614], [860, 606], [980, 626], [1000, 668], [1010, 742], [1040, 800], [940, 826], [880, 800], [830, 742], [780, 690], [690, 664]];
const PILLOW2: P[] = blob(1040, 606, 54, 20, 29, 0.14, 16, -0.2);
const DENT: P[] = blob(718, 640, 70, 12, 37, 0.1, 12);
// the window open: both casements swung in against the wall
const LEAF_L: P[] = [[WIN.x0 - 22, WIN.y0 - 22], [WIN.x0 - 108, WIN.y0 + 6], [WIN.x0 - 108, WIN.y1 - 4], [WIN.x0 - 22, WIN.y1 + 14]];
const LEAF_R: P[] = [[WIN.x1 + 22, WIN.y0 - 22], [1600, WIN.y0 + 8], [1600, WIN.y1 - 6], [WIN.x1 + 22, WIN.y1 + 14]];
// the radiator bare: its fins; the grille on the floor with its screws; the reel tucked behind the fins
const FINS: P[][] = Array.from({ length: 12 }, (_, i) => rect(1206 + i * 23.5, 634, 1222 + i * 23.5, 742));
const REEL_AT: P = [1398, 650];
const STOCK = stocking(REEL_AT, 0.45), R = reel(REEL_AT, 26);
const GRILLE_FLAT: P[] = [[1170, 800], [1470, 800], [1540, 860], [1120, 860]];
const GRILLE_SLOTS: P[][] = Array.from({ length: 12 }, (_, i) => { const u0 = 0.06 + i * 0.075, u1 = u0 + 0.035, x = (u: number, v: number) => 1170 - 50 * v + (300 + 120 * v) * u; return [[x(u0, 0.15), 809], [x(u1, 0.15), 809], [x(u1, 0.85), 851], [x(u0, 0.85), 851]] as P[]; });
const SCREWS: P[][] = [[1070, 830], [1090, 846], [1058, 856], [1100, 866]].map(([x, y]) => ring(x, y, 5, 4, 8));
// through the window, across the street under the viaduct, the 504, dark; a street lamp over it
const CAR = car504({ x: 1300, g: 578, L: 214, f: -1 });
const LAMP_POST: P[] = rect(1470, 404, 1476, 584), LAMP: P[] = [[1452, 404], [1494, 404], [1486, 392], [1460, 392]], POOL: P[] = [[1456, 408], [1490, 408], [1540, 584], [1380, 584]];

const pieces: Piece[] = [
  ...roomPieces({ wardOpen: true, grilleOff: true, winOpen: true }),
  { pts: POOL, ink: { y: 0.4, p: 0.35, b: 0.62 } }, { pts: LAMP_POST, ink: MIX.black }, { pts: LAMP, ink: MIX.cream },
  ...CAR.pieces,
  { pts: NET, ink: { y: 0.2, p: 0.12, b: 0.12 } }, { pts: GLARE, ink: { y: 0.1 } },
  { pts: WARD_IN, ink: { y: 0.34, p: 0.26, b: (_x, y) => 0.34 - 0.24 * (y - WARD.y0) / (WARD.y1 - WARD.y0) } }, { pts: WARD_FLOOR, ink: ROOM_INKS.darkWood },
  { pts: LEAF_L, ink: MIX.cream }, { pts: inset(LEAF_L, 0.72), ink: { b: 0.3, p: 0.2, y: 0.2 } }, { pts: LEAF_R, ink: MIX.cream }, { pts: inset(LEAF_R, 0.72), ink: { b: 0.3, p: 0.2, y: 0.2 } },
  { pts: RADIATOR, ink: { b: 0.55, p: 0.45, y: 0.45 } }, ...FINS.map((q) => ({ pts: q, ink: MIX.cream })),
  { pts: STOCK, ink: REEL_INKS.stocking }, { pts: R.reel, ink: REEL_INKS.reel }, { pts: R.tape, ink: REEL_INKS.tape }, { pts: R.hub, ink: REEL_INKS.hub },
  ...FINS.slice(8, 9).map((q) => ({ pts: q, ink: MIX.cream })), // one fin in front of the reel: it is tucked behind them
  ...bedPieces(), { pts: DENT, ink: { p: 0.35, y: 0.4, b: 0.1 } }, { pts: PILLOW2, ink: ROOM_INKS.sheet }, { pts: SHEET, ink: ROOM_INKS.sheet },
  { pts: WARD_DOOR, ink: ROOM_INKS.wood },
  { pts: GRILLE_FLAT, ink: MIX.cream }, ...GRILLE_SLOTS.map((q) => ({ pts: q, ink: { b: 0.5, p: 0.35, y: 0.3 } as Sep })), ...SCREWS.map((q) => ({ pts: q, ink: MIX.grey })),
];
const keys: Key[] = [
  ...roomKeys({ wardOpen: true, grilleOff: true, winOpen: true }), ...CAR.keys,
  edge(WARD_IN, 1.6, 0.7, [WARD_DOOR]), stroke([[WARD.x0 + 14, 228], [WARD.x1 - 14, 228]], 3), ...HANGERS.map((q) => stroke(q, 2.6, 0.95)), edge(WARD_DOOR, 2),
  edge(BED_FRONT, 1.8, 0.8, [SHEET]), edge(BED_TOP, 1.4, 0.5, [SHEET, PILLOW2]), ...FOOT_POSTS.map((q) => edge(q, 1.4, 0.8)),
  edge(SHEET, 1.6, 0.9), stroke([[760, 650], [860, 640], [930, 680]], 1.2, 0.6), stroke([[900, 700], [960, 760], [960, 810]], 1.2, 0.6), edge(PILLOW2, 1.3, 0.8), stroke([[PILLOW[0][0], 628], [PILLOW[0][0] - 40, 640]], 1, 0.4),
  edge(LEAF_L, 1.8), edge(LEAF_R, 1.8), stroke([[1466, 404], [1466, 580]], 1, 0.4),
  ...FINS.map((q) => edge(q, 1.1, 0.7, [STOCK])), edge(RADIATOR, 1.6, 0.7, [STOCK]),
  edge(STOCK, 1.6, 0.95, [R.reel, FINS[8]]), edge(R.reel, 1.6, 0.95, [FINS[8]]), edge(R.hub, 1.2), ...mesh(REEL_AT, 26).map((k) => ({ ...k, hide: [FINS[8]] })),
  edge(GRILLE_FLAT, 1.8), ...SCREWS.map((q) => edge(q, 1, 0.8)),
];

// ---------------------------------------------------------------- what moves
const ROD_Y = WIN.y0 - 30, PANE = [{ x0: 1296, x1: WIN.x1 }];
// the net curtain: hung from the rod over the left of the opening, its hem lifted into the room
const curtain = (wind: number, flut: number): { pts: P[]; folds: P[][]; hem: P[] } => {
  const x0 = WIN.x0 - 6, x1 = 1300, bottom = WIN.y1 + 10, N = 12;
  const at = (u: number, v: number): P => { const lift = v * v * wind; return [x0 + (x1 - x0) * u - lift * (150 + 40 * u) + Math.sin(v * 6 + u * 4 + flut) * 6 * v, ROD_Y + (bottom - ROD_Y) * v - lift * 40 * (1 - u * 0.5)]; };
  const hem = Array.from({ length: N + 1 }, (_, i) => at(1 - i / N, 1)), right = Array.from({ length: N + 1 }, (_, i) => at(1, i / N));
  const left = Array.from({ length: N + 1 }, (_, i) => at(0, 1 - i / N));
  const folds = [0.2, 0.4, 0.6, 0.8].map((u) => Array.from({ length: 8 }, (_, i) => at(u, 0.05 + (i / 7) * 0.93)));
  return { pts: [at(0, 0), at(1, 0), ...right, ...hem, ...left], folds, hem };
};
export const r08 = press({
  id: "r08", title: "La Chambre vide", loop: LOOP, pieces, keys,
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    overprint(g, train((t * 2) % LOOP, LOOP, reveal, PANE)); // two trains a loop
    // the curtain: a gust twice a loop, never quite still
    const wind = 0.35 + 0.3 * (0.5 - 0.5 * Math.cos(TT * 2)) + 0.06 * Math.sin(TT * 7), C = curtain(wind, TT * 3);
    overprint(g, [{ pts: C.pts, ink: { b: 1 } }], { alpha: 0.2 * reveal }); // a sheer: a thin film of solid ink, cheap to print each frame
    // the bulb swings on its cord, once a loop there and back
    const sw = 0.07 * Math.sin(TT), top: P = [BULB.x, 34], len = BULB.y - 34, bx = top[0] + Math.sin(sw) * len, by = top[1] + Math.cos(sw) * len;
    overprint(g, [{ pts: blob(bx, by, 14, 18, 5, 0.04, 12), ink: { y: 0.5 * reveal } }]);
    inkPen(g, "b", (ink) => {
      C.folds.forEach((q, i) => g.pen(q, { w: 1.4, color: ink, seed: 60 + i, wobble: 0.3, boil: 0, taper: 1, opacity: 0.6 * reveal, retrace: false }));
      g.pen(C.hem, { w: 1.8, color: ink, seed: 70, wobble: 0.3, boil: 0, taper: 1, opacity: 0.8 * reveal, retrace: false });
      g.pen([[WIN.x0 - 40, ROD_Y], [WIN.x1 + 40, ROD_Y]], { w: 3, color: ink, seed: 71, wobble: 0.2, boil: 0, taper: 1, opacity: 0.9 * reveal, retrace: false });
      g.pen([top, [bx, by - 18]], { w: 1.6, color: ink, seed: 72, wobble: 0.1, boil: 0, taper: 1, opacity: 0.9 * reveal, retrace: false });
      g.pen([...ring(bx, by, 15, 19, 14), [bx + 15, by]], { w: 1.2, color: ink, seed: 73, wobble: 0.1, boil: 0, taper: 1, opacity: 0.8 * reveal, retrace: false });
    });
  },
});
