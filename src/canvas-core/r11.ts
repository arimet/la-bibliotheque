// CANICULE PAGE 11 · LE TRAIN DE NUIT. One idea: you give her back the key to her way out.
// An ending, at dawn, the yellow drum back on the press. The Gare du Nord at a quarter to six: the
// glass roof going pale on its iron ribs, the big clock, the departure board with the 5.48 for
// Bruxelles. On the left the left-luggage lockers, number 214 standing open and empty; you beside
// them. On the platform the green carriage of the 5.48, and Lili at its door in a headscarf, her
// suitcase in her hand, looking back at you.
// What moves: the clock's second hand (the loop is the minute it takes), a flap of the board turning,
// pigeons, the dust in the dawn light coming down through the roof.
import { type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { figure } from "./figures";
import { INK, MIX, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";
import { PLATINUM, edge, inkPen, inset, rect, ring, stroke } from "./r07";

const LOOP = 1800; // sixty seconds: one turn of the second hand

// ---------------------------------------------------------------- the hall
const VP: P = [800, 330]; // where the platforms go to, under the far end of the roof
const ROOF: P[] = rect(0, 0, 1600, 440);
const GABLE: P[] = rect(690, 250, 910, 440);
const FAR: P[] = rect(0, 410, 1600, 800);
const PLATFORM: P[] = rect(0, 800, 1600, 900), EDGE_LINE: P[] = rect(480, 800, 1600, 810);
// the carriage of the 5.48: green, a row of windows, the door with its steps
const COACH = { x0: 500, x1: 1640, y0: 440, y1: 790 };
const COACH_BODY: P[] = rect(COACH.x0, COACH.y0 + 24, COACH.x1, COACH.y1), COACH_ROOF: P[] = [[COACH.x0 + 10, COACH.y0 + 24], [COACH.x0 + 30, COACH.y0], [COACH.x1, COACH.y0], [COACH.x1, COACH.y0 + 24]];
const UNDER: P[] = rect(COACH.x0, COACH.y1, COACH.x1, 830);
const WINDOWS: P[][] = [540, 640, 1080, 1180, 1280, 1380, 1480].map((x) => rect(x, 500, x + 76, 590));
const DOOR = { x0: 880, x1: 990 };
const DOORWAY: P[] = rect(DOOR.x0, 480, DOOR.x1, 790), DOOR_WIN: P[] = rect(DOOR.x0 + 20, 500, DOOR.x1 - 20, 580);
const STEP: P[] = rect(DOOR.x0 + 4, 790, DOOR.x1 - 4, 806), STEP2: P[] = rect(DOOR.x0 + 10, 760, DOOR.x1 - 10, 770);
const RAIL_L: P[] = rect(DOOR.x0 - 6, 520, DOOR.x0, 760), RAIL_R: P[] = rect(DOOR.x1, 520, DOOR.x1 + 6, 760);
const BOARD_PLATE: P[] = rect(1150, 640, 1440, 680); // the destination plate on the coach
// the lockers: five columns, six rows; 214 open and empty
const LK = { x0: 20, y0: 330, w: 86, h: 74, cols: 5, rows: 6 };
const CELL = (c: number, r: number): P[] => rect(LK.x0 + c * LK.w + 4, LK.y0 + r * LK.h + 4, LK.x0 + (c + 1) * LK.w - 4, LK.y0 + (r + 1) * LK.h - 4);
const LOCKERS: P[] = rect(LK.x0 - 10, LK.y0 - 20, LK.x0 + LK.cols * LK.w + 10, LK.y0 + LK.rows * LK.h + 26);
const OPEN = { c: 3, r: 2 }, OPEN_CELL = CELL(OPEN.c, OPEN.r);
const OPEN_PLATE: P[] = [[OPEN_CELL[0][0] - 42, OPEN_CELL[0][1] + 16], [OPEN_CELL[0][0] - 10, OPEN_CELL[0][1] + 10], [OPEN_CELL[0][0] - 10, OPEN_CELL[0][1] + 26], [OPEN_CELL[0][0] - 42, OPEN_CELL[0][1] + 32]];
const OPEN_DOOR: P[] = [[OPEN_CELL[0][0], OPEN_CELL[0][1]], [OPEN_CELL[0][0] - 50, OPEN_CELL[0][1] + 10], [OPEN_CELL[0][0] - 50, OPEN_CELL[3][1] + 12], [OPEN_CELL[0][0], OPEN_CELL[3][1]]];
const PLATE = (c: number, r: number, dx = 0): P[] => { const q = CELL(c, r), x = (q[0][0] + q[1][0]) / 2 + dx; return rect(x - 18, q[0][1] + 6, x + 18, q[0][1] + 22); };
const cells = Array.from({ length: LK.cols * LK.rows }, (_, i) => ({ c: i % LK.cols, r: Math.floor(i / LK.cols) })).filter(({ c, r }) => !(c === OPEN.c && r === OPEN.r));
// the clock hanging from the roof, at 5.44
const CLK = { x: 690, y: 176, r: 74 };
const CLOCK_RIM: P[] = ring(CLK.x, CLK.y, CLK.r + 10, CLK.r + 10, 32), CLOCK_FACE: P[] = ring(CLK.x, CLK.y, CLK.r, CLK.r, 32), CLOCK_ROD: P[] = rect(CLK.x - 4, 0, CLK.x + 4, CLK.y - CLK.r - 8);
const hand = (a: number, len: number, w: number, tail = 0.15): P[] => { const c = Math.cos(a - Math.PI / 2), s = Math.sin(a - Math.PI / 2), nx = -s * w, ny = c * w; return [[CLK.x - c * len * tail + nx, CLK.y - s * len * tail + ny], [CLK.x + c * len + nx * 0.4, CLK.y + s * len + ny * 0.4], [CLK.x + c * len - nx * 0.4, CLK.y + s * len - ny * 0.4], [CLK.x - c * len * tail - nx, CLK.y - s * len * tail - ny]]; };
const MIN_A = (44 / 60) * Math.PI * 2, HOUR_A = ((5 + 44 / 60) / 12) * Math.PI * 2;
// the departure board
const BOARD: P[] = rect(1010, 70, 1560, 330);
const ROWS = [["5.48", "BRUXELLES", "7"], ["6.02", "LILLE", "9"], ["6.15", "AMIENS", "4"], ["6.31", "MAUBEUGE", "11"]];
const ROW_Y = (i: number) => 142 + i * 44, FLAP = (i: number): P[] => rect(1490, ROW_Y(i) - 4, 1540, ROW_Y(i) + 30);
const STRIPS: P[][] = ROWS.map((_, i) => rect(1030, ROW_Y(i) - 4, 1476, ROW_Y(i) + 30)), HEADER: P[] = rect(1190, 82, 1380, 116);

// ---------------------------------------------------------------- the people
// you, beside the lockers, the empty one open behind you
const DET = figure({ x: 560, g: 890, h: 470, f: 1, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "#3a2a1e", skin: "skin", gold: "#b8321f", ink: "#000", near: [0.35, 0.5], far: [0.1, 0.2] });
// Lili on the step, her scarf over her hair, the suitcase in her hand, looking back
const LILI_K = { x: 930, g: 808, h: 380, f: -1 as const };
const LILI = figure({ ...LILI_K, robe: "dress", head: "hood", cloth: "#b9d7ee", cloth2: "#e88aa6", skin: "skin", ink: "#000", near: [0.08, 0.15], far: [-0.5, -1.4] });
const FRINGE: P[] = (() => { const [x, y] = LILI.head, h = LILI_K.h; return [[x - 0.01 * h, y - 0.06 * h], [x - 0.06 * h, y - 0.05 * h], [x - 0.062 * h, y - 0.03 * h], [x - 0.02 * h, y - 0.035 * h]]; })();
const CASE: P[] = (() => { const [x, y] = LILI.hands.near; return [[x - 44, y + 8], [x + 36, y + 8], [x + 38, y + 70], [x - 46, y + 70]]; })();
const CASE_HANDLE: P[] = (() => { const [x, y] = LILI.hands.near; return [[x - 14, y - 4], [x + 8, y - 4], [x + 8, y + 8], [x - 14, y + 8]]; })();

// ---------------------------------------------------------------- the print
// the dawn coming down through the glass in three shafts, onto the platform
const SHAFTS: P[][] = [[[300, 0], [420, 0], [760, 900], [560, 900]], [[900, 0], [990, 0], [1260, 900], [1100, 900]], [[1300, 0], [1350, 0], [1560, 900], [1470, 900]]];
// where each shaft lands: the platform lit in a patch (ink cannot lighten what moves, the plate can)
const floorOf = (q: P[]): P[] => { const at = (a: P, b: P, y: number): P => [a[0] + (b[0] - a[0]) * (y / 900), y]; return [at(q[0], q[3], 810), at(q[1], q[2], 810), q[2], q[3]]; };
const det = fromMotif(DET.m), lili = fromMotif(LILI.m);
const glass: Sep = { y: (_x, y) => 0.55 - 0.3 * (y / 440), p: (_x, y) => 0.12 + 0.28 * (y / 440), b: (x, y) => 0.08 + 0.12 * Math.abs(x - VP[0]) / 800 };
const green: Sep = { y: 0.9, b: 0.72, p: 0.2 };
const people = [...det.pieces, ...lili.pieces].map((p) => p.pts);
const pieces: Piece[] = [
  { pts: ROOF, ink: glass }, { pts: GABLE, ink: { y: 0.3, p: 0.1 } }, { pts: FAR, ink: { b: (_x, y) => 0.3 + 0.3 * (y - 410) / 390, p: 0.3, y: 0.35 } },
  { pts: CLOCK_ROD, ink: MIX.black }, { pts: CLOCK_RIM, ink: MIX.black }, { pts: CLOCK_FACE, ink: MIX.cream }, { pts: hand(HOUR_A, CLK.r * 0.55, 5), ink: MIX.black }, { pts: hand(MIN_A, CLK.r * 0.85, 3.6), ink: MIX.black },
  { pts: BOARD, ink: MIX.black }, ...STRIPS.map((q) => ({ pts: q, ink: MIX.cream })), { pts: HEADER, ink: { y: 0.9, p: 0.1 } }, ...ROWS.map((_, i) => ({ pts: FLAP(i), ink: MIX.cream })),
  { pts: COACH_ROOF, ink: MIX.grey }, { pts: COACH_BODY, ink: green }, { pts: UNDER, ink: MIX.black },
  ...WINDOWS.map((q) => ({ pts: q, ink: { y: 0.45, p: 0.2, b: 0.25 } as Sep })), { pts: BOARD_PLATE, ink: MIX.cream },
  { pts: DOORWAY, ink: { y: 0.95, b: 0.85, p: 0.4 } }, { pts: DOOR_WIN, ink: { y: 0.35, p: 0.15, b: 0.35 } }, { pts: STEP2, ink: MIX.grey }, { pts: RAIL_L, ink: MIX.cream }, { pts: RAIL_R, ink: MIX.cream },
  { pts: LOCKERS, ink: { b: 0.6, p: 0.3, y: 0.25 } }, ...cells.map(({ c, r }) => ({ pts: CELL(c, r), ink: { b: 0.4, p: 0.16, y: 0.12 } as Sep })), { pts: OPEN_CELL, ink: MIX.black },
  { pts: OPEN_DOOR, ink: { b: 0.4, p: 0.16, y: 0.12 } }, ...cells.map(({ c, r }) => ({ pts: PLATE(c, r), ink: MIX.cream })), { pts: OPEN_PLATE, ink: MIX.cream },
  { pts: PLATFORM, ink: { y: 0.4, p: 0.3, b: 0.3 } }, ...SHAFTS.map((q) => ({ pts: floorOf(q), ink: { y: 0.45, p: 0.12, b: 0.08 } as Sep })), { pts: EDGE_LINE, ink: MIX.cream }, { pts: STEP, ink: MIX.grey },
  ...det.pieces,
  ...lili.pieces, { pts: FRINGE, ink: { y: 0.3, p: 0.08 } }, { pts: CASE, ink: MIX.brown }, { pts: CASE_HANDLE, ink: MIX.black },
];
// the iron of the roof, running away to the far end; the purlins across it
const RIBS: Key[] = [-900, -500, -200, 80, 300, 520, 1080, 1300, 1520, 1800, 2100, 2500].map((x) => { const t = 0.92; return stroke([[x, 0], [x + (VP[0] - x) * t, VP[1] * t]], 2.6, 0.85, [GABLE, CLOCK_RIM, BOARD, CLOCK_ROD]); });
const PURLINS: Key[] = [70, 160, 232, 286].map((y) => stroke([[0, y], [1600, y]], 1.4, 0.55, [GABLE, CLOCK_RIM, BOARD, CLOCK_ROD]));
const keys: Key[] = [
  ...RIBS, ...PURLINS, edge(GABLE, 1.6, 0.7), ...[730, 770, 810, 850].map((x) => stroke([[x, 250], [x, 410]], 1.4, 0.6)),
  edge(CLOCK_RIM, 1.8), ...Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2, c = Math.sin(a), s = -Math.cos(a), r0 = CLK.r * (i % 3 ? 0.84 : 0.76); return stroke([[CLK.x + c * r0, CLK.y + s * r0], [CLK.x + c * CLK.r * 0.94, CLK.y + s * CLK.r * 0.94]], i % 3 ? 2 : 4, 0.95); }),
  edge(BOARD, 2), ...STRIPS.map((q) => edge(q, 1.2, 0.7)),
  edge(COACH_BODY, 2, 0.9, people), edge(COACH_ROOF, 1.8, 0.9, people), stroke([[COACH.x0, 610], [COACH.x1, 610]], 1.4, 0.6, people), stroke([[COACH.x0, 480], [COACH.x1, 480]], 1.4, 0.6, people),
  ...WINDOWS.map((q) => edge(q, 1.6, 0.9, people)), edge(DOORWAY, 1.8, 0.9, people), edge(DOOR_WIN, 1.4, 0.8, people), edge(BOARD_PLATE, 1.2, 0.8, people),
  edge(LOCKERS, 2, 0.9, people), ...cells.map(({ c, r }) => edge(CELL(c, r), 1.2, 0.7, people)), edge(OPEN_DOOR, 1.6, 0.9, people),
  ...cells.map(({ c, r }) => { const q = CELL(c, r); return stroke([[q[1][0] - 14, (q[1][1] + q[2][1]) / 2 - 8], [q[1][0] - 14, (q[1][1] + q[2][1]) / 2 + 8]], 3, 0.9, people); }), // the lock of each door
  stroke([[0, 800], [1600, 800]], 1.6, 0.8, people),
  ...det.keys, ...lili.keys, edge(CASE, 1.6, 0.9), edge(FRINGE, 1, 0.6),
];

// ---------------------------------------------------------------- what moves
// a pigeon: body, head, a wing that beats or folds
const pigeon = (x: number, y: number, f: 1 | -1, wing: number, peck = 0, reveal = 1): Piece[] => {
  const body = blob(x, y, 24, 14, 7, 0.05, 12), head = blob(x + f * 22, y - 12 + peck * 16, 9, 9, 8, 0.02, 10), tail: P[] = [[x - f * 18, y - 5], [x - f * 42, y - 3], [x - f * 40, y + 6], [x - f * 16, y + 8]];
  const w: P[] = [[x - f * 8, y - 5], [x + f * 10, y - 5], [x - f * 5, y - 5 - wing * 34], [x - f * 21, y - 5 - wing * 26]];
  const grey: Sep = { b: 0.55 * reveal, p: 0.3 * reveal };
  return [{ pts: tail, ink: grey }, { pts: body, ink: grey }, { pts: head, ink: grey }, { pts: w, ink: { b: 0.75 * reveal, p: 0.45 * reveal } }];
};
export const r11 = press({
  id: "r11", title: "Le Train de nuit", loop: LOOP, pieces, keys,
  extra: {
    b: (g) => {
      letter(g, "DEPARTS", 1285, 88, { cap: 22, color: INK.blue, seed: 50, align: "center", w: 3 }); g.pen([[1245, 84], [1253, 77]], { w: 2.4, color: INK.blue, seed: 52, wobble: 0.1, boil: 0, taper: 1, opacity: 0.95, retrace: false });
      ROWS.forEach(([h, dest, v], i) => { letter(g, h, 1044, ROW_Y(i), { cap: 22, color: INK.blue, seed: 60 + i, w: 3 }); letter(g, dest, 1150, ROW_Y(i), { cap: 22, color: INK.blue, seed: 70 + i, w: 3 }); letter(g, v, 1515, ROW_Y(i), { cap: 22, color: INK.blue, seed: 80 + i, w: 3, align: "center" }); });
      letter(g, "PARIS  BRUXELLES", 1295, 650, { cap: 16, color: INK.blue, seed: 90, align: "center", w: 2.2 });
      cells.forEach(({ c, r }, i) => { const q = PLATE(c, r); letter(g, String(201 + r * LK.cols + c), (q[0][0] + q[1][0]) / 2, q[0][1] + 3, { cap: 9, color: INK.blue, seed: 100 + i, align: "center", w: 1.4, opacity: 0.8 }); });
      letter(g, "214", OPEN_CELL[0][0] - 26, OPEN_CELL[0][1] + 15, { cap: 10, color: INK.blue, seed: 99, align: "center", w: 1.8 });
    },
    // the clock's accent: the SNCF red lettering on its face, a small mark
    p: (g) => letter(g, "SNCF", CLK.x, CLK.y + 26, { cap: 10, color: INK.pink, seed: 51, align: "center", w: 1.6, opacity: 0.8 }),
  },
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    // the dust turning in the shafts of light
    overprint(g, Array.from({ length: 18 }, (_, i) => { const s = SHAFTS[i % 3], v = ((i * 0.29 + T * 6) % 1), u = (i * 0.618) % 1, x0 = s[0][0] + (s[1][0] - s[0][0]) * u, x1 = s[3][0] + (s[2][0] - s[3][0]) * u, x = x0 + (x1 - x0) * v + Math.sin(TT * 12 + i) * 6, y = 900 * v; return { pts: ring(x, y, 2.4, 2.4, 6), ink: { y: reveal } }; }));
    // the second hand, one turn a loop, with its round tip
    const sa = TT, sx = CLK.x + Math.sin(sa) * CLK.r * 0.9, sy = CLK.y - Math.cos(sa) * CLK.r * 0.9;
    inkPen(g, "p", (ink) => { g.pen([[CLK.x - Math.sin(sa) * 16, CLK.y + Math.cos(sa) * 16], [sx, sy]], { w: 1.6, color: ink, seed: 5, wobble: 0, boil: 0, taper: 1, opacity: 0.95 * reveal, retrace: false }); });
    overprint(g, [{ pts: ring(sx - Math.sin(sa) * 12, sy + Math.cos(sa) * 12, 5, 5, 10), ink: { p: reveal, y: 0.6 * reveal } }, { pts: ring(CLK.x, CLK.y, 5, 5, 10), ink: { p: reveal, y: 0.6 * reveal } }]);
    // a flap of the board turning: every six seconds one row's platform card flips over
    const per = LOOP / 10, k = Math.floor(t / per), ph = (t % per) / 12;
    if (ph < 1) { const q = FLAP(k % ROWS.length), y0 = q[0][1], y1 = q[2][1], mid = (y0 + y1) / 2, fall = ph < 0.5 ? y0 + (mid - y0) * ph * 2 : mid + (y1 - mid) * (ph - 0.5) * 2; overprint(g, [{ pts: rect(q[0][0], ph < 0.5 ? y0 : mid, q[1][0], fall), ink: { b: 0.9 * reveal, p: 0.6 * reveal, y: 0.5 * reveal } }]); }
    // a pigeon walking the platform, pecking; another crossing under the roof twice a minute
    const wx = 1180 + 120 * Math.sin(TT * 2), dir: 1 | -1 = Math.cos(TT * 2) > 0 ? 1 : -1, peck = Math.max(0, Math.sin(TT * 40)) ** 6;
    const birds = pigeon(wx, 872 + 3 * Math.abs(Math.sin(TT * 60)), dir, 0.05, peck, reveal);
    const fp = (T * 2) % 1; if (fp < 0.3) { const u = fp / 0.3; birds.push(...pigeon(-60 + u * 1720, 300 - 80 * Math.sin(u * Math.PI) + 10 * Math.sin(u * 30), 1, 0.5 + 0.5 * Math.sin(t * 1.3), 0, reveal)); }
    overprint(g, birds);
  },
});
