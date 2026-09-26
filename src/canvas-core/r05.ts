// CANICULE PAGE 5 · LE QUAI. One idea: the man who runs Pigalle tells you to drop it, sweating
// in his short sleeves, and his desk tells you more than he does.
// Quai des Orfèvres after midnight. Commissaire Varenne behind his desk, a bottle out of the drawer,
// his glass in his hand, mopping his brow; the fan; the window shut on the Seine, the lamp's glare
// on its panes, the far bank's lights on the water behind. Under the ashtray, in front of you, the
// hotel card. You, from behind, in the visitor's chair.
// What moves: the lights shivering on the river, the fan, the cigarette's smoke, Varenne's handkerchief.
import { INK, LITHO, MIX, PAPER, fromMotif, overprint, press, sep, type Key, type Piece, type Sep } from "./press";
import { Gfx, oval, rng, tube, type Env, type Layer, type P } from "./core";
import { letter } from "./drafting";
import { blob, bounds } from "./gallery";
import { dense, figure, remap, type Motif } from "./figures";

const LOOP = 180;
const FLOOR = 700;
const R = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const edge = (pts: P[], w = 2.2, op = 0.9, hide?: P[][]): Key => ({ pts: [...pts, pts[0]], w, op, hide });

// ---------------------------------------------------------------- the office
const WALL = R(0, 0, 1600, FLOOR), FLOORP = R(0, FLOOR, 1600, 900);
const LAMP = { x: 1420, y: 520 };
const POOL = (x: number, y: number) => Math.exp(-((x - LAMP.x) ** 2 + ((y - LAMP.y) * 1.6) ** 2) / 160000);
const WIN = { x0: 330, x1: 760, y0: 90, y1: 520 };
const WINDOW = R(WIN.x0, WIN.y0, WIN.x1, WIN.y1), FRAME = R(WIN.x0 - 20, WIN.y0 - 20, WIN.x1 + 20, WIN.y1 + 28);
// shut (he gets up to open it later): two casement leaves meeting in the middle, three panes each,
// the espagnolette's rod and handle on the meeting stile
const MID = 545, ST = 14, BARS_Y = [222, 350];
const SASH: P[][] = [R(WIN.x0, WIN.y0, WIN.x0 + ST, WIN.y1), R(MID - ST, WIN.y0, MID + ST, WIN.y1), R(WIN.x1 - ST, WIN.y0, WIN.x1, WIN.y1), R(WIN.x0, WIN.y0, WIN.x1, WIN.y0 + ST), R(WIN.x0, WIN.y1 - 30, WIN.x1, WIN.y1), ...BARS_Y.map((y) => R(WIN.x0, y, WIN.x1, y + 7))];
const PANES_X: [number, number][] = [[WIN.x0 + ST, MID - ST], [MID + ST, WIN.x1 - ST]];
const PANES = PANES_X.flatMap(([a, b]) => [[WIN.y0 + ST, BARS_Y[0]], [BARS_Y[0] + 7, BARS_Y[1]], [BARS_Y[1] + 7, WIN.y1 - 30]].map(([y0, y1]) => R(a, y0, b, y1)));
const ROD = R(MID + 2, WIN.y0 + 20, MID + 6, WIN.y1 - 36), HANDLE: P[] = [[MID - 5, 280], [MID + 13, 280], [MID + 12, 346], [MID + 4, 360], [MID - 4, 346]], ROSE = oval(MID + 4, 288, 12, 12, 12);
// the glare of the lamp on the glass: two slanting bands where the view shows through paler
const GLARES: P[][] = [[[380, WIN.y1], [470, WIN.y1], [680, WIN.y0], [590, WIN.y0]], [[500, WIN.y1], [522, WIN.y1], [732, WIN.y0], [710, WIN.y0]]];
const veil = (s: Sep, k = 0.55): Sep => Object.fromEntries(Object.entries(s).map(([d, t]) => [d, typeof t === "number" ? t * k : (x: number, y: number) => (t as (x: number, y: number) => number)(x, y) * k]));
// through it: the far bank, its lamps, the river
const BANK: P[] = [[WIN.x0, 250], [380, 250], [380, 226], [460, 226], [460, 244], [560, 236], [560, 214], [610, 214], [640, 240], [720, 240], [720, 226], [WIN.x1, 226], [WIN.x1, 334], [WIN.x0, 334]];
const QUAY = R(WIN.x0, 334, WIN.x1, 350);
const LAMPS_X = [360, 430, 505, 585, 660, 735];
const BANK_WINS = [[350, 262], [398, 270], [482, 260], [520, 270], [580, 250], [620, 266], [690, 256], [736, 262]].map(([x, y]) => R(x, y, x + 12, y + 18));
const WATER = R(WIN.x0, 350, WIN.x1, WIN.y1);
// on the walls: a clock at twenty to one, a filing cabinet
const CLOCK = oval(1240, 170, 44, 44, 24);
const CABINET = R(1480, 250, 1600, FLOOR), DRAWERS_C = [0, 1, 2].map((i) => R(1494, 270 + i * 140, 1600, 390 + i * 140));
// the desk and what is on it
const DESK_TOP: P[] = [[640, 598], [1580, 598], [1600, 626], [620, 626]], DESK = R(630, 626, 1600, 900);
const DESK_PANELS = [R(680, 660, 1000, 880), R(1040, 660, 1360, 880)];
const FAN = { x: 780, y: 520, r: 54 };
const FAN_BASE: P[] = [[FAN.x - 32, 600], [FAN.x + 32, 600], [FAN.x + 20, 586], [FAN.x - 20, 586]], FAN_STEM = R(FAN.x - 5, FAN.y, FAN.x + 5, 588);
const CARD: P[] = [[930, 604], [1030, 598], [1044, 618], [940, 624]];
const ASHTRAY = blob(1024, 606, 34, 10, 71, 0.05, 16), CIG = R(996, 596, 1026, 601);
const BOTTLE: P[] = [[1224, 598], [1224, 516], [1234, 500], [1236, 470], [1250, 470], [1252, 500], [1262, 516], [1262, 598]], LABEL = R(1226, 530, 1260, 566);
const LAMP_BASE: P[] = [[LAMP.x - 40, 598], [LAMP.x + 40, 598], [LAMP.x + 30, 586], [LAMP.x - 30, 586]], LAMP_STEM = R(LAMP.x - 4, 530, LAMP.x + 4, 588);
const SHADE: P[] = [[LAMP.x - 70, LAMP.y + 16], [LAMP.x - 56, LAMP.y - 16], [LAMP.x + 56, LAMP.y - 16], [LAMP.x + 70, LAMP.y + 16]];
const FILES = [R(1300, 588, 1400, 598), R(1306, 578, 1392, 588)];

// ---------------------------------------------------------------- Varenne
const VX = 1150, VH = 760, VG = 1045, NECK_Y = VG - 0.83 * VH;
const VAR0 = figure({ x: VX, g: VG, h: VH, f: -1, robe: "suit", head: "bare", cloth: "#cddff0", cloth2: "navy", hair: "#e9c3a4", skin: "skin", gold: "#6a5a8a", ink: "#000", far: [0.3, 1.75], near: [0.2, 0.3] });
// a heavy man: wider below the neck, and the near arm is drawn apart, since it moves
const widen = (p: P): P => [VX + (p[0] - VX) * (p[1] > NECK_Y ? 1.32 : 1.06), p[1]];
const drop = (m: Motif, n: number): Motif => { const gone = new Set(m.parts.slice(-n)); return { fills: m.fills.filter((f) => !gone.has(f.pts)), parts: m.parts.filter((q) => !gone.has(q)), lines: m.lines.filter((l) => ![...gone].some((q) => q[0] === l.pts[0]) && l.color !== "#e9c3a4").map((l) => ({ ...l, z: Math.min(l.z ?? 0, m.parts.length - n) })) }; };
const VAR = remap(drop(VAR0.m, 2), widen);
const HEADV = widen(VAR0.head), SHOULDER = widen([VX - 0.06 * VH, VG - 0.785 * VH]);
const FRINGE: P[] = [[HEADV[0] + 0.02 * VH, HEADV[1] - 0.01 * VH], [HEADV[0] + 0.064 * VH, HEADV[1] - 0.03 * VH], [HEADV[0] + 0.07 * VH, HEADV[1] + 0.02 * VH], [HEADV[0] + 0.04 * VH, HEADV[1] + 0.06 * VH], [HEADV[0] + 0.012 * VH, HEADV[1] + 0.05 * VH]];
const SWEAT: P[][] = [[-0.02, -0.05], [0.0, -0.058], [-0.036, -0.02]].map(([u, v]) => oval(HEADV[0] + u * VH, HEADV[1] + v * VH, 3, 5, 8));
const PATCH = blob(SHOULDER[0] + 36, SHOULDER[1] + 60, 22, 30, 17, 0.2, 12); // sweat through the shirt under the arm
const GLASS: P[] = (() => { const x = VAR0.hands.far[0] * 1 + (widen(VAR0.hands.far)[0] - VAR0.hands.far[0]) - 6, y = 596; return [[x - 14, y - 40], [x + 14, y - 40], [x + 11, y], [x - 11, y]] as P[]; })();

// ---------------------------------------------------------------- you, from behind, in the visitor's chair
const HX = 500, HY = 590;
const YOU_HAIR = oval(HX, HY, 60, 68, 24), EARS = [oval(HX - 60, HY + 12, 10, 16, 10), oval(HX + 60, HY + 12, 10, 16, 10)];
const NAPE: P[] = [[HX - 30, HY + 50], [HX + 30, HY + 50], [HX + 34, HY + 96], [HX - 34, HY + 96]];
const COLLAR: P[] = [[HX - 46, HY + 86], [HX + 46, HY + 86], [HX + 54, HY + 110], [HX - 54, HY + 110]];
const BACK: P[] = [[HX - 180, 900], [HX - 168, HY + 170], [HX - 130, HY + 124], [HX - 50, HY + 100], [HX + 50, HY + 100], [HX + 130, HY + 124], [HX + 168, HY + 170], [HX + 180, 900]];
const CHAIR = [R(HX - 210, 780, HX + 210, 806), R(HX - 200, 806, HX - 176, 900), R(HX + 176, 806, HX + 200, 900)];

// ---------------------------------------------------------------- the print
const varenne = fromMotif(VAR, [DESK_TOP, DESK, GLASS, BOTTLE, SHADE, LAMP_STEM, LAMP_BASE, FILES[0], FILES[1]]);
const WOOD: Sep = { y: 0.85, p: (x, y) => 0.55 - 0.15 * POOL(x, y), b: (x, y) => 0.32 - 0.2 * POOL(x, y) };
// through the glass: the sky, the far bank and its lamps, the river
const VIEW: Piece[] = [
  { pts: WINDOW, ink: { b: (_x, y) => 0.95 - 0.2 * ((y - WIN.y0) / 260), p: 0.5, y: 0.1 } },
  { pts: BANK, ink: { b: 0.95, p: 0.75, y: 0.5 } }, ...BANK_WINS.map((q) => ({ pts: q, ink: { y: 0.9, p: 0.25 } as Sep })),
  { pts: QUAY, ink: { b: 0.8, p: 0.5, y: 0.4 } }, ...LAMPS_X.map((x) => ({ pts: oval(x, 328, 6, 6, 8), ink: { y: 0.95, p: 0.1 } as Sep })),
  { pts: WATER, ink: { b: 0.9, p: 0.62, y: 0.2 } },
];
const pieces: Piece[] = [
  { pts: WALL, ink: { y: (x, y) => 0.38 + 0.35 * POOL(x, y), b: (x, y) => 0.55 - 0.35 * POOL(x, y), p: 0.2 } }, // green distemper, yellow by the lamp
  { pts: FLOORP, ink: { y: 0.6, p: 0.6, b: 0.6 } },
  { pts: CLOCK, ink: MIX.cream }, { pts: CABINET, ink: { b: 0.45, p: 0.25, y: 0.4 } }, ...DRAWERS_C.map((q) => ({ pts: q, ink: { b: 0.5, p: 0.3, y: 0.45 } as Sep })),
  // the window and the river
  { pts: FRAME, ink: { y: 0.3, p: 0.15, b: 0.2 } },
  ...VIEW, ...GLARES.flatMap((gl) => VIEW.map((v) => ({ ...v, ink: veil(sep(v.ink)), clip: gl }))),
  ...SASH.map((q) => ({ pts: q, ink: { y: 0.3, p: 0.15, b: 0.2 } as Sep })), { pts: ROD, ink: { y: 0.8, p: 0.45, b: 0.15 } }, { pts: HANDLE, ink: { y: 0.95, p: 0.6, b: 0.35 } }, { pts: ROSE, ink: { y: 0.9, p: 0.5, b: 0.2 } },
  // Varenne
  ...varenne.pieces, { pts: FRINGE, ink: { y: 0.6, p: 0.55, b: 0.55 } }, { pts: PATCH, ink: { b: 0.45, p: 0.1 } }, ...SWEAT.map((q) => ({ pts: q, ink: { b: 0.3 } as Sep })),
  { pts: GLASS, ink: { y: 0.55, p: 0.25, b: 0.1 } },
  // the desk
  { pts: DESK, ink: WOOD }, ...DESK_PANELS.map((q) => ({ pts: q, ink: { y: 0.9, p: 0.62, b: 0.42 } as Sep })), { pts: DESK_TOP, ink: { y: 0.8, p: (x, y) => 0.45 - 0.2 * POOL(x, y), b: (x, y) => 0.35 - 0.25 * POOL(x, y) } },
  { pts: FAN_BASE, ink: MIX.navy }, { pts: FAN_STEM, ink: MIX.navy },
  { pts: CARD, ink: MIX.cream }, { pts: CIG, ink: {} }, { pts: ASHTRAY, ink: { b: 0.45, p: 0.2, y: 0.15 } },
  { pts: BOTTLE, ink: { y: 0.95, p: 0.6, b: 0.3 } }, { pts: LABEL, ink: MIX.cream },
  ...FILES.map((q, i) => ({ pts: q, ink: [{ y: 0.9, p: 0.3 }, { y: 0.3, p: 0.5 }][i] as Sep })),
  { pts: LAMP_BASE, ink: MIX.brown }, { pts: LAMP_STEM, ink: MIX.brown }, { pts: SHADE, ink: MIX.green },
  // you
  { pts: BACK, ink: { y: 0.06, b: 0.04 } }, { pts: COLLAR, ink: {} }, { pts: NAPE, ink: MIX.skin }, ...EARS.map((q) => ({ pts: q, ink: MIX.skin })), { pts: YOU_HAIR, ink: { y: 0.75, p: 0.65, b: 0.72 } },
  ...CHAIR.map((q) => ({ pts: q, ink: { y: 0.9, p: 0.7, b: 0.5 } as Sep })),
];
const YOU = [BACK, COLLAR, NAPE, YOU_HAIR, ...EARS, ...CHAIR];
const keys: Key[] = [
  ...varenne.keys.map((k) => ({ ...k, hide: [...(k.hide ?? []), ...YOU] })),
  edge(WINDOW, 2.2, 0.9, YOU), edge(FRAME, 1.8, 0.9, YOU), ...PANES.map((q) => edge(q, 1.3, 0.8, YOU)), { pts: [[MID, WIN.y0 + ST], [MID, WIN.y1 - 30]], w: 1.6, op: 0.9 }, edge(HANDLE, 1.5), edge(ROSE, 1.2), edge(CLOCK, 2, 0.9), edge(CABINET, 2), ...DRAWERS_C.map((q) => edge(q, 1.6)),
  edge(DESK_TOP, 2, 0.9, YOU), edge(DESK, 2.2, 0.9, YOU), ...DESK_PANELS.map((q) => edge(q, 1.6, 0.8, YOU)),
  edge(CARD, 1.6), edge(ASHTRAY, 1.6), edge(BOTTLE, 1.8), edge(LABEL, 1.2), edge(GLASS, 1.6), edge(SHADE, 1.8), edge(FAN_BASE, 1.6),
  edge(BACK, 2.2, 0.9, CHAIR), edge(COLLAR, 1.8, 0.9, [NAPE]), edge(NAPE, 1.6, 0.8, [YOU_HAIR]), ...EARS.map((q) => edge(q, 1.4, 0.8, [YOU_HAIR])), edge(YOU_HAIR, 2),
  ...CHAIR.map((q) => edge(q, 1.8)),
  { pts: [[HX - 90, HY + 200], [HX - 60, HY + 290], [HX - 70, 760]], w: 1.4, op: 0.5 }, { pts: [[HX + 70, HY + 190], [HX + 50, HY + 280]], w: 1.4, op: 0.5 }, // folds in the shirt
  { pts: [[1240, 170], [1240, 140]], w: 3.4 }, { pts: [[1240, 170], [1212, 184]], w: 3.4 }, // twenty to one
];

// ---------------------------------------------------------------- what moves
const ik = (s: P, t: P, a: number, b: number): P => { const dx = t[0] - s[0], dy = t[1] - s[1], d = Math.min(Math.hypot(dx, dy), a + b - 1), x = (a * a - b * b + d * d) / (2 * d), h = Math.sqrt(Math.max(0, a * a - x * x)), ux = dx / d, uy = dy / d, e1: P = [s[0] + ux * x - uy * h, s[1] + uy * x + ux * h], e2: P = [s[0] + ux * x + uy * h, s[1] + uy * x - ux * h]; return e1[0] < e2[0] ? e1 : e2; }; // the elbow forward, on the side he faces
const blade = (a: number): P[] => { const c = Math.cos(a), s = Math.sin(a), R0 = FAN.r; return [[FAN.x, FAN.y], [FAN.x + c * R0 * 0.3 - s * 15, FAN.y + s * R0 * 0.3 + c * 15], [FAN.x + c * R0 - s * 11, FAN.y + s * R0 + c * 11], [FAN.x + c * R0 + s * 9, FAN.y + s * R0 - c * 9]]; };
const rw = rng(33);
const GLINTS = Array.from({ length: 22 }, (_, i) => ({ x: LAMPS_X[i % LAMPS_X.length], y: 360 + rw() * 124, p: rw() * 6.28, w: 5 + rw() * 7 })); // above the bottom rail
const HAND0: P = [HEADV[0] - 0.03 * VH, HEADV[1] - 0.03 * VH];
const ELBOW = ik(SHOULDER, HAND0, 0.2 * VH, 0.18 * VH), SLEEVE_END: P = [SHOULDER[0] + (ELBOW[0] - SHOULDER[0]) * 0.55, SHOULDER[1] + (ELBOW[1] - SHOULDER[1]) * 0.55];
const SKIN_ARM = tube([SLEEVE_END, ELBOW, HAND0], 0.03 * VH, 0.026 * VH), SLEEVE = tube([SHOULDER, SLEEVE_END], 0.038 * VH, 0.034 * VH), HANDP = oval(HAND0[0], HAND0[1], 0.026 * VH, 0.028 * VH, 12);
const HANKY = blob(HAND0[0] - 6, HAND0[1] - 10, 26, 18, 90, 0.35, 12, 0);
const ARM_SHAPES = [SKIN_ARM, SLEEVE, HANDP, HANKY];
const ARM_BOX = (() => { const b = bounds(ARM_SHAPES.flat()); return { x0: Math.floor(b.x0 - 14), y0: Math.floor(b.y0 - 14), x1: Math.ceil(b.x1 + 14), y1: Math.ceil(b.y1 + 14) }; })();
// the arm's inks on a transparent sprite, drum by drum through their registration, and its key line
const armSprite = (env: Env): Layer => {
  const key = `r05:arm:${env.scale}`; let L = env.cache.get(key) as Layer | undefined; if (L) return L;
  L = env.canvas(Math.ceil((ARM_BOX.x1 - ARM_BOX.x0) * env.scale), Math.ceil((ARM_BOX.y1 - ARM_BOX.y0) * env.scale));
  const g2 = new Gfx(L.ctx, env, 0, LITHO); g2.push(-ARM_BOX.x0, -ARM_BOX.y0, 1);
  overprint(g2, [{ pts: SKIN_ARM, ink: MIX.skin }, { pts: HANDP, ink: MIX.skin }, { pts: SLEEVE, ink: { b: 0.2, p: 0.05 } }, { pts: HANKY, ink: { b: 0.08 } }]);
  g2.group("plain", () => [SKIN_ARM, SLEEVE, HANKY].forEach((q, i) => g2.pen(dense([...q, q[0]], 8), { w: 1.8, color: INK.blue, seed: 300 + i, wobble: 0.5, boil: 0, taper: 1, opacity: 0.9, retrace: false })), { blend: "multiply" });
  env.cache.set(key, L); return L;
};
export const r05 = press({
  id: "r05", title: "Le Quai", loop: LOOP, pieces, keys,
  extra: { b: (g) => { letter(g, "HOTEL", 972, 606, { cap: 6, color: INK.blue, seed: 21, w: 1.3 }); letter(g, "TERMINUS", 966, 614, { cap: 5, color: INK.blue, seed: 22, w: 1.1 }); } },
  anim: (g, t, reveal, env) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the far bank's lamps on the water: short dashes of light, breaking and closing
    const glints = GLINTS.map((q, i) => { const k = 0.5 + 0.5 * Math.sin(TT * (3 + (i % 4)) + q.p), wv = q.w * (0.4 + k), x = q.x + Math.sin(TT * 2 + q.p) * (4 + (q.y - 350) * 0.06); const [a, b] = PANES_X[x < MID ? 0 : 1]; return R(Math.max(a, x - wv), q.y, Math.min(b, x + wv), q.y + 4 + k * 2); }); // kept inside their pane
    glints.forEach((q) => g.fill(q, PAPER, reveal));
    overprint(g, glints.map((q) => ({ pts: q, ink: { y: reveal, p: 0.25 * reveal } })));
    // the fan
    const a0 = TT * 6;
    overprint(g, [{ pts: Array.from({ length: 24 }, (_, i) => [FAN.x + Math.cos((i / 24) * 6.283) * (FAN.r + 6), FAN.y + Math.sin((i / 24) * 6.283) * (FAN.r + 6)] as P), ink: { b: 0.25 * reveal } }, ...[0, 1, 2, 3].map((k) => ({ pts: blade(a0 + (k * Math.PI) / 2), ink: { b: 0.9 * reveal, p: 0.4 * reveal } })), { pts: oval(FAN.x, FAN.y, 10, 10, 10), ink: { b: reveal, p: reveal } }]);
    // the cigarette's smoke, bent by the fan's air
    overprint(g, [0, 1, 2].map((k) => { const p = ((t + k * 60) % LOOP) / LOOP, x = 1000 + Math.sin(p * 5 + k) * 10 + p * 70, y = 590 - p * 250; return { pts: blob(x, y, 8 + p * 26, 5 + p * 12, 20 + k, 0.35, 12), ink: { b: 0.3 * Math.sin(p * Math.PI) * reveal, p: 0.1 * Math.sin(p * Math.PI) * reveal } }; }));
    // Varenne's near arm, printed once and swung about the shoulder: the handkerchief over his brow, twice a loop
    const a = 0.055 * Math.sin(2 * TT) + 0.012 * Math.sin(4 * TT), sp = armSprite(env), k = env.scale, c = g.main;
    const turn = (q: P[]) => q.map(([x, y]) => { const dx = x - SHOULDER[0], dy = y - SHOULDER[1]; return [SHOULDER[0] + dx * Math.cos(a) - dy * Math.sin(a), SHOULDER[1] + dx * Math.sin(a) + dy * Math.cos(a)] as P; });
    ARM_SHAPES.forEach((q) => g.fill(turn(q), PAPER, reveal)); // its knockout
    c.save(); c.setTransform(k, 0, 0, k, 0, 0); c.translate(SHOULDER[0], SHOULDER[1]); c.rotate(a); c.translate(-SHOULDER[0], -SHOULDER[1]);
    c.globalCompositeOperation = "multiply"; c.globalAlpha = reveal; c.drawImage(sp.canvas as CanvasImageSource, ARM_BOX.x0, ARM_BOX.y0, ARM_BOX.x1 - ARM_BOX.x0, ARM_BOX.y1 - ARM_BOX.y0); c.restore();
  },
});
