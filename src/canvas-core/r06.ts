// CANICULE PAGE 6 · LE MÉTRO. One idea: one token, one call, one in the morning, in a phone booth
// so hot the receiver sticks to your hand.
// A café by the Anvers métro. Through the front window, the station's cast-iron entrance and its
// METROPOLITAIN plate, the red TABAC sign. The zinc counter, the waiter reading the paper under a
// ceiling fan. At the back by the toilets, the wooden phone booth: you inside, behind the glass door,
// the receiver at your ear.
// What moves: the ceiling fan, the coiled phone cord swaying, a neon sign that stutters.
import { oval, rng, tube, type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { figure } from "./figures";
import { INK, MIX, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";

const LOOP = 180;
const FLOOR = 760;
const R = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const edge = (pts: P[], w = 2.2, op = 0.9, hide?: P[][]): Key => ({ pts: [...pts, pts[0]], w, op, hide });
const ik = (s: P, t: P, a: number, b: number, f: number): P => { const dx = t[0] - s[0], dy = t[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 1), x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x)), ux = dx / d, uy = dy / d, e1: P = [s[0] + ux * x - uy * h, s[1] + uy * x + ux * h], e2: P = [s[0] + ux * x + uy * h, s[1] + uy * x - ux * h]; return (e1[0] - e2[0]) * f > 0 ? e1 : e2; };

// ---------------------------------------------------------------- neon letters, bent in glass
const GLYPH: Record<string, number[][][]> = {
  T: [[[0, 0], [3, 0]], [[1.5, 0], [1.5, 5]]], A: [[[0, 5], [1.5, 0], [3, 5]], [[0.6, 3.2], [2.4, 3.2]]],
  B: [[[0, 0], [0, 5], [2.2, 5], [3, 4.2], [3, 3.2], [2.2, 2.5], [0, 2.5]], [[0, 0], [2, 0], [2.7, 0.7], [2.7, 1.8], [2, 2.5]]],
  C: [[[3, 0.8], [2.3, 0], [0.7, 0], [0, 0.8], [0, 4.2], [0.7, 5], [2.3, 5], [3, 4.2]]], I: [[[0.5, 0], [0.5, 5]]],
  E: [[[3, 0], [0, 0], [0, 5], [3, 5]], [[0, 2.5], [2.2, 2.5]]], R: [[[0, 5], [0, 0], [2.2, 0], [3, 0.8], [3, 1.8], [2.2, 2.6], [0, 2.6]], [[1.6, 2.6], [3, 5]]],
};
const GW: Record<string, number> = { T: 3, A: 3, B: 3, C: 3, I: 1, E: 3, R: 3 };
const neon = (word: string, x: number, y: number, k: number, r: number, down = false): P[][] => {
  let o = 0; const out: P[][] = [];
  for (const c of word) { (GLYPH[c] ?? []).forEach((st) => out.push(tube(st.map(([u, v]) => (down ? [x + u * k, y + o + v * k] : [x + o + u * k, y + v * k]) as P), r, r, false))); o += down ? 6.6 * k : (GW[c] + 1.3) * k; }
  return out;
};

// ---------------------------------------------------------------- the café
const WALL = R(0, 0, 1600, FLOOR), WAINSCOT = R(0, 560, 1600, FLOOR), RAILW = R(0, 552, 1600, 564);
const ROWS = 5, TILES: P[][] = [];
for (let r = 0; r < ROWS; r++) { const y0 = FLOOR + r * 28, h = 28, n = 20; for (let i = 0; i < n; i++) if ((i + r) % 2 === 0) TILES.push(R(i * 80, y0, i * 80 + 80, y0 + h)); }
// the front window on the street: the métro's entrance across it, the tabac's red sign
const WIN = { x0: 40, x1: 420, y0: 90, y1: 540 };
const WINDOW = R(WIN.x0, WIN.y0, WIN.x1, WIN.y1), WFRAME = R(WIN.x0 - 18, WIN.y0 - 18, WIN.x1 + 18, WIN.y1 + 22), WBAR = R(WIN.x0, 300, WIN.x1, 308);
const FACADES: P[] = [[WIN.x0, 150], [140, 150], [140, 120], [260, 120], [260, 160], [WIN.x1, 160], [WIN.x1, 440], [WIN.x0, 440]];
const FACADE_WINS = [[70, 200], [120, 250], [190, 190], [300, 210], [360, 260], [220, 330]].map(([x, y]) => R(x, y, x + 20, y + 30));
const PAVEMENT = R(WIN.x0, 440, WIN.x1, WIN.y1);
const POSTS = [tube([[120, 540], [118, 420], [108, 330], [92, 290]], 5, 4, false), tube([[340, 540], [342, 420], [352, 330], [368, 290]], 5, 4, false)];
const GLOBES = [oval(88, 280, 13, 16, 12), oval(372, 280, 13, 16, 12)];
const PLATE = R(126, 330, 334, 356);
const BALUSTRADE = R(120, 470, 340, 482), BALUSTERS = Array.from({ length: 10 }, (_, i) => R(128 + i * 22, 482, 134 + i * 22, 540));
const CARROT: P[] = [[400, 110], [436, 140], [436, 260], [400, 290], [364, 260], [364, 140]];
const TABAC = neon("TABAC", 390, 150, 4, 2, true);
// the counter, the zinc, behind it the mirror and the bottles, the waiter with his paper
const COUNTER_PANELS = [0, 1, 2, 3].map((i) => R(470 + i * 152, 556, 606 + i * 152, 700));
const ZINC: P[] = [[450, 510], [1080, 510], [1092, 530], [438, 530]], COUNTER = R(446, 530, 1082, FLOOR), FOOTRAIL = R(446, 718, 1082, 726);
const MIRROR = R(480, 150, 1060, 380), SHELF = R(480, 380, 1060, 390), SHELF2 = R(480, 260, 1060, 268);
const rb = rng(12);
const BOTTLES: P[][] = [260, 380].flatMap((y) => Array.from({ length: 14 }, (_, i) => { const x = 500 + i * 40 + rb() * 8, h = 46 + rb() * 34, w = 8 + rb() * 5; return [[x - w, y], [x - w, y - h * 0.6], [x - 3, y - h * 0.8], [x - 3, y - h], [x + 3, y - h], [x + 3, y - h * 0.8], [x + w, y - h * 0.6], [x + w, y]] as P[]; }));
const BIERE_BOARD = R(620, 90, 900, 140), BIERE = neon("BIERE", 648, 100, 6, 2.6);
const PERCO: P[] = [[940, 510], [940, 440], [956, 420], [1020, 420], [1036, 440], [1036, 510]], PERCO_TOP = oval(988, 414, 30, 10, 14);
const WAITER = figure({ x: 740, g: 790, h: 470, f: -1, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "#1a1a1a", hair: "#1a1410", skin: "skin", gold: "#161616", ink: "#000", near: [0.95, 1.7], far: [0.85, 1.6] });
const VEST: P[] = (() => { const [x, g, h] = [740, 790, 470], S = (u: number, v: number): P => [x - u * h, g - v * h]; return [S(-0.08, 0.56), S(-0.085, 0.7), S(-0.07, 0.8), S(-0.02, 0.8), S(0, 0.66), S(0.02, 0.8), S(0.07, 0.79), S(0.078, 0.7), S(0.075, 0.56)]; })();
const PAPER_W: P[] = (() => { const [nx, ny] = WAITER.hands.near, [fx, fy] = WAITER.hands.far; return [[nx - 6, ny - 70], [fx + 90, fy - 64], [fx + 84, fy + 44], [nx - 10, ny + 40]]; })();
const STOOLS = [640, 880].map((x) => ({ seat: oval(x, 640, 38, 9, 16), post: R(x - 5, 648, x + 5, FLOOR + 30), foot: oval(x, FLOOR + 32, 30, 6, 14) }));
// the phone booth at the back, you inside it behind the glass
const BOOTH = R(1140, 130, 1440, FLOOR + 4), BOOTH_IN = R(1180, 210, 1400, 742), BOOTH_SIGN = R(1180, 150, 1400, 190);
const DOORF = { x0: 1180, x1: 1400, y0: 210, y1: 742 };
const DOOR_BARS = [R(DOORF.x0, DOORF.y0, DOORF.x0 + 18, DOORF.y1), R(DOORF.x1 - 18, DOORF.y0, DOORF.x1, DOORF.y1), R(DOORF.x0, DOORF.y0, DOORF.x1, DOORF.y0 + 16), R(DOORF.x0, 560, DOORF.x1, 578), R(DOORF.x0, DOORF.y1 - 16, DOORF.x1, DOORF.y1)];
const HANDLE = R(DOORF.x0 + 22, 470, DOORF.x0 + 30, 520);
const GLARE: P[][] = [[[1204, 330], [1250, 232], [1258, 232], [1212, 330]], [[1214, 356], [1270, 236], [1274, 236], [1218, 356]], [[1356, 548], [1380, 500], [1384, 500], [1360, 548]]];
const PHONE_BOX = R(1340, 360, 1384, 470), DIAL = oval(1362, 402, 14, 14, 14);
const DH = 480, DX = 1258, DG = 760;
const YOU = figure({ x: DX, g: DG, h: DH, f: 1, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "#3a2a1e", skin: "skin", gold: "#b8321f", ink: "#000", far: [0.1, 0.25], near: [0.3, 0.4] });
// the near arm redrawn to the ear, the handset in the hand
const SHO: P = [DX + 0.06 * DH, DG - 0.785 * DH], HAND: P = [YOU.head[0] + 0.03 * DH, YOU.head[1] + 0.07 * DH];
const ELB = ik(SHO, HAND, 0.19 * DH, 0.17 * DH, 1);
const ARM = tube([SHO, ELB, HAND], 0.034 * DH, 0.027 * DH), FIST = oval(HAND[0], HAND[1], 0.026 * DH, 0.028 * DH, 12);
const EAR: P = [YOU.head[0] - 0.028 * DH, YOU.head[1] + 0.012 * DH], MOUTH: P = [YOU.head[0] + 0.058 * DH, YOU.head[1] + 0.085 * DH];
const HANDSET = tube([EAR, [(EAR[0] + MOUTH[0]) / 2 + 6, (EAR[1] + MOUTH[1]) / 2 - 4], MOUTH], 6, 6, false), EARCUP = oval(EAR[0], EAR[1], 11, 14, 12), MOUTHCUP = oval(MOUTH[0], MOUTH[1], 11, 10, 12);
const SWEAT: P[][] = [[-0.03, 0.05], [0.05, 0.06], [0.1, -0.02]].map(([u, v]) => oval(YOU.head[0] + u * DH, YOU.head[1] - v * DH, 3, 5, 8));
const nearArmGone = (() => { const m = YOU.m, gone = new Set(m.parts.slice(-2)); return { fills: m.fills.filter((f) => !gone.has(f.pts)), parts: m.parts.filter((q) => !gone.has(q)), lines: m.lines.filter((l) => ![...gone].some((q) => q[0] === l.pts[0])).map((l) => ({ ...l, z: Math.min(l.z ?? 0, m.parts.length - 2) })) }; })();

// ---------------------------------------------------------------- the fan
const FAN = { x: 760, y: 56, rx: 200, ry: 22 };
const FAN_ROD = R(FAN.x - 4, 0, FAN.x + 4, FAN.y - 12), FAN_BOX = blob(FAN.x, FAN.y - 4, 24, 13, 31, 0.04, 14);
const blade = (a: number): P[] => [[0.18, -0.07], [1, -0.13], [1, 0.13], [0.18, 0.07]].map(([u, v]) => { const x = Math.cos(a) * u - Math.sin(a) * v, y = Math.sin(a) * u + Math.cos(a) * v; return [FAN.x + x * FAN.rx, FAN.y + 4 + y * FAN.ry] as P; });

// ---------------------------------------------------------------- the print
const GLASS_HIDE = [...DOOR_BARS, ...GLARE];
const waiter0 = fromMotif(WAITER.m, [ZINC, COUNTER, PAPER_W, VEST]), waiter = { pieces: waiter0.pieces.map((p) => ({ ...p, clip: R(0, 0, 1600, 530) })), keys: waiter0.keys.map((k) => ({ ...k, hide: [...(k.hide ?? []), R(0, 528, 1600, 900)] })) }, you = fromMotif(nearArmGone, [...DOOR_BARS, ARM, FIST, HANDSET, EARCUP, MOUTHCUP]);
const WOOD: Sep = { y: 0.9, p: 0.65, b: 0.45 };
const pieces: Piece[] = [
  { pts: WALL, ink: { y: 0.42, p: 0.22, b: (_x, y) => 0.08 + 0.2 * (1 - y / FLOOR) } }, { pts: WAINSCOT, ink: { y: 0.55, p: 0.3, b: 0.5 } }, { pts: RAILW, ink: MIX.brown },
  { pts: R(0, FLOOR, 1600, 900), ink: MIX.cream }, ...TILES.map((q) => ({ pts: q, ink: { b: 0.5, p: 0.4, y: 0.35 } as Sep })),
  // the street through the window
  { pts: WFRAME, ink: MIX.brown },
  { pts: WINDOW, ink: MIX.night }, { pts: FACADES, ink: { b: 1, p: 0.75, y: 0.45 } }, ...FACADE_WINS.map((q, i) => ({ pts: q, ink: i % 2 ? ({ b: 1, p: 0.8, y: 0.6 } as Sep) : ({ y: 0.9, p: 0.3 } as Sep) })),
  { pts: PAVEMENT, ink: { b: 0.8, p: 0.6, y: 0.5 } },
  ...POSTS.map((q) => ({ pts: q, ink: MIX.green })), ...GLOBES.map((q) => ({ pts: q, ink: MIX.orange })),
  { pts: PLATE, ink: { y: 0.55, p: 0.1 } }, { pts: BALUSTRADE, ink: MIX.green }, ...BALUSTERS.map((q) => ({ pts: q, ink: MIX.green })),
  { pts: CARROT, ink: MIX.red }, ...TABAC.map((q) => ({ pts: q, ink: { y: 0.5 } as Sep })),
  { pts: WBAR, ink: MIX.brown },
  // behind the counter
  { pts: MIRROR, ink: { b: 0.3, p: 0.2, y: 0.3 } }, ...BOTTLES.map((q, i) => ({ pts: q, ink: [{ y: 0.9, b: 0.7, p: 0.3 }, { y: 0.9, p: 0.7, b: 0.3 }, { b: 0.7, p: 0.4, y: 0.6 }][i % 3] as Sep })),
  { pts: SHELF, ink: WOOD }, { pts: SHELF2, ink: WOOD },
  { pts: BIERE_BOARD, ink: MIX.black }, ...BIERE.map((q) => ({ pts: q, ink: MIX.pink })),
  ...waiter.pieces, { pts: VEST, ink: MIX.black }, { pts: PAPER_W, ink: { y: 0.1, b: 0.06 } },
  { pts: PERCO, ink: { b: 0.35, p: 0.2, y: 0.25 } }, { pts: PERCO_TOP, ink: { y: 0.8, p: 0.4 } },
  { pts: COUNTER, ink: { y: 0.95, p: 0.62, b: 0.3 } }, ...COUNTER_PANELS.map((q) => ({ pts: q, ink: { y: 0.95, p: 0.75, b: 0.45 } as Sep })), { pts: ZINC, ink: { b: 0.3, p: 0.12, y: 0.12 } }, { pts: FOOTRAIL, ink: { y: 0.9, p: 0.3 } },
  ...STOOLS.flatMap((s) => [{ pts: s.post, ink: MIX.black }, { pts: s.foot, ink: MIX.black }, { pts: s.seat, ink: MIX.red }]),
  // the booth
  { pts: BOOTH, ink: { y: 0.95, p: 0.72, b: 0.55 } }, { pts: BOOTH_SIGN, ink: MIX.cream },
  { pts: BOOTH_IN, ink: { y: (_x, y) => 0.25 + 0.3 * ((y - 210) / 530), p: 0.14, b: (_x, y) => 0.06 + 0.2 * ((y - 210) / 530) } }, // a bare bulb in the booth's ceiling
  { pts: PHONE_BOX, ink: { b: 0.55, p: 0.35, y: 0.35 } }, { pts: DIAL, ink: MIX.cream },
  ...you.pieces, ...SWEAT.map((q) => ({ pts: q, ink: { b: 0.3 } as Sep })),
  { pts: ARM, ink: MIX.cream }, { pts: FIST, ink: MIX.skin },
  { pts: HANDSET, ink: MIX.black }, { pts: EARCUP, ink: MIX.black }, { pts: MOUTHCUP, ink: MIX.black },
  ...GLARE.map((q) => ({ pts: q, ink: {} })),
  ...DOOR_BARS.map((q) => ({ pts: q, ink: { y: 0.9, p: 0.6, b: 0.4 } as Sep })), { pts: HANDLE, ink: { y: 0.9, p: 0.3 } },
  { pts: FAN_ROD, ink: MIX.black }, { pts: FAN_BOX, ink: MIX.black },
];
const keys: Key[] = [
  ...waiter.keys, ...you.keys.map((k) => ({ ...k, hide: [...(k.hide ?? []), ...GLARE] })),
  edge(ARM, 1.8, 0.9, [FIST, HANDSET, ...GLASS_HIDE]), edge(FIST, 1.6, 0.9, [HANDSET]),
  edge(WFRAME, 1.8), edge(PLATE, 1.6), edge(MIRROR, 2, 0.9, [BIERE_BOARD, ...waiter.pieces.map((p) => p.pts), VEST, PAPER_W, PERCO]),
  edge(COUNTER, 2.2, 0.9, STOOLS.flatMap((s) => [s.seat, s.post])), edge(ZINC, 1.8), edge(PAPER_W, 1.6), edge(PERCO, 1.8), edge(VEST, 1.6),
  ...Array.from({ length: 8 }, (_, i) => ({ pts: [[PAPER_W[0][0] + 16 + (i % 2) * 44, PAPER_W[0][1] + 24 + Math.floor(i / 2) * 18], [PAPER_W[0][0] + 50 + (i % 2) * 44, PAPER_W[0][1] + 26 + Math.floor(i / 2) * 18]] as P[], w: 1.6, op: 0.6 })), // the paper's columns
  edge(BOOTH, 2.2), edge(BOOTH_SIGN, 1.8), edge(PHONE_BOX, 1.8, 0.9, [...you.pieces.map((p) => p.pts), ARM, HANDSET]),
  ...DOOR_BARS.map((q) => edge(q, 1.6)), edge(WINDOW, 2),
];

// ---------------------------------------------------------------- what moves
const STUTTER = [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1]; // 6 frames a step
const CORD_A: P = [1350, 470];
export const r06 = press({
  id: "r06", title: "Le Métro", loop: LOOP, pieces, keys,
  extra: {
    b: (g) => { letter(g, "METROPOLITAIN", 230, 336, { cap: 12, color: INK.blue, seed: 31, align: "center", w: 2 }); letter(g, "TELEPHONE", 1290, 160, { cap: 20, color: INK.blue, seed: 32, align: "center", w: 2.6 }); },
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    overprint(g, [0, 1, 2, 3].map((k) => ({ pts: blade(TT + (k * Math.PI) / 2), ink: { b: 0.95 * reveal, p: 0.8 * reveal, y: 0.5 * reveal } })));
    // the coiled cord from the box down to the handset, swaying
    const sway = Math.sin(2 * TT) * 14, B = MOUTH;
    const cord: P[] = Array.from({ length: 49 }, (_, i) => { const s = i / 48, bow = Math.sin(Math.PI * s), x = CORD_A[0] + (B[0] - CORD_A[0]) * s + sway * bow, y = CORD_A[1] + (B[1] - CORD_A[1]) * s + 110 * bow, z = (i % 2 ? 1 : -1) * 4; return [x + z, y + z * 0.4] as P; });
    overprint(g, [{ pts: tube(cord, 1.6, 1.6, false), ink: { y: 0.7 * reveal, p: 0.9 * reveal, b: reveal } }]);
    // the BIERE sign stutters: when it drops, its board shows over the tubes
    if (!STUTTER[Math.floor(t / 6) % STUTTER.length]) overprint(g, [{ pts: BIERE_BOARD, ink: { b: 0.8 * reveal, p: 0.4 * reveal } }]);
  },
});
