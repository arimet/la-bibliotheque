// CANICULE PAGE 9 · DEUX HEURES. One idea: the woman who hired you gets out of the car of the man
// you were hired against.
// Place Pigalle at two in the morning. The café Sans-Souci, its neon over the striped awning, the
// glass front still lit, a terrace of round tables. You sit at one with a lukewarm demi and a
// cigarette in the ashtray. The grey 504 has stopped double-parked in front of the terrace, lamps
// on, Maillard at the wheel; the rear door open, Nadia stepping out with her sunglasses in her hand,
// for the first time, and behind her, in his short-sleeved shirt, Varenne.
// From this page the press prints its yellow drum in red.
// What moves: the neon flickering, the glare of the 504's headlamps, smoke from your cigarette.
import { tube, type P } from "./core";
import { letter, width } from "./drafting";
import { blob } from "./gallery";
import { figure, remap, type Look } from "./figures";
import { MIX, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";
import { edge, forearm, inkPen, rect, ring, stroke } from "./r07";
import { car504 } from "./r08";

const LOOP = 240;
const ACT3 = true;
const SIGN_TEXT = "SANS-SOUCI", SIGN_X = 540, SIGN_Y = 166, CAP = 56;

// ---------------------------------------------------------------- a figure sitting down
// figures.ts only stands people up: this sits one on a chair. The hips go to the seat, the figure is
// cut off below it, and the thighs and shins are drawn forward and down to the floor.
export const seated = (k: Omit<Look, "g" | "robe"> & { seat: number; floor: number; robe?: Look["robe"] }) => {
  const f = k.f ?? 1, h = k.h, g = k.seat + 0.5 * h, fig = figure({ ...k, robe: k.robe ?? "suit", g });
  const cut: P[] = rect(-100, -100, 1700, k.seat + 0.02 * h), below: P[] = rect(-100, k.seat + 0.02 * h, 1700, 1000);
  const legC = k.cloth2 ?? k.cloth, knee: P = [k.x + f * 0.2 * h, k.seat + 0.01 * h], foot: P = [k.x + f * 0.2 * h, k.floor - 0.03 * h];
  const thigh = [[k.x - f * 0.02 * h, k.seat], knee] as P[], shin = [knee, foot] as P[];
  const tube2 = (c: P[], r: number): P[] => { const [a, b] = c, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = (-dy / l) * r, ny = (dx / l) * r; return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; };
  const legs: Piece[] = [
    { pts: tube2(shin, 0.03 * h), ink: MIX[legC] ?? legC }, { pts: tube2(thigh, 0.045 * h), ink: MIX[legC] ?? legC },
    { pts: [[foot[0] - f * 0.02 * h, foot[1]], [foot[0] + f * 0.09 * h, foot[1] + 0.012 * h], [foot[0] + f * 0.09 * h, foot[1] + 0.035 * h], [foot[0] - f * 0.02 * h, foot[1] + 0.035 * h]], ink: MIX.black },
  ];
  const m = fromMotif(fig.m, [below]);
  return {
    fig, legs, legKeys: legs.map((pc) => edge(pc.pts, 1.4, 0.85)),
    pieces: m.pieces.map((pc) => ({ ...pc, clip: cut })), keys: m.keys,
  };
};

// ---------------------------------------------------------------- the square and the café
const SKY: P[] = rect(0, 0, 1600, 900);
const FACADE: P[] = rect(0, 0, 1130, 260), NEXT: P[] = [[1130, 40], [1600, 70], [1600, 640], [1130, 640]];
const UPPER: P[][] = [[70, 30], [300, 30], [530, 30], [760, 30], [990, 30]].map(([x, y]) => rect(x, y, x + 90, y + 100));
const NEXT_WIN: P[][] = [[1180, 110], [1330, 120], [1470, 130]].map(([x, y]) => rect(x, y, x + 80, y + 110));
const SIGN_GLOW: P[] = blob(540, 196, 430, 78, 8, 0.04, 22);
const AWNING: P[] = [[0, 262], [1130, 262], [1160, 344], [0, 344]];
const STRIPES: P[][] = Array.from({ length: 15 }, (_, i) => { const x = i * 80; return [[x, 262], [x + 40, 262], [x + 42, 344], [x + 2, 344]] as P[]; });
const VALANCE: P[] = Array.from({ length: 30 }, (_, i) => [i * 40, 344 + (i % 2) * 16] as P).concat([[1160, 344], [1160, 330], [0, 330]]);
const FRONT: P[] = rect(0, 344, 1130, 640);
const GLASS: P[][] = [rect(40, 372, 380, 640), rect(420, 372, 760, 640), rect(800, 372, 1110, 640)];
const BAR: P[] = rect(420, 520, 760, 640), BOTTLES: P[][] = Array.from({ length: 9 }, (_, i) => rect(450 + i * 34, 440 - (i % 3) * 10, 464 + i * 34, 490));
const PATRON = figure({ x: 640, g: 700, h: 300, f: -1, robe: "suit", head: "hat", cloth: "#2e2a32", cloth2: "#2e2a32", skin: "skin", ink: "#000", near: [0.5, 1.4], far: [0.3, 0.6], lite: true });
const LAMPS: P[][] = [210, 590, 955].map((x) => blob(x, 392, 22, 12, x, 0.05, 12));
// across the square on the right, another sign, dark but for three letters
const NEXT_SIGN: P[] = rect(1200, 300, 1560, 360);
const PAVE: P[] = rect(0, 640, 1600, 770), GUTTER: P[] = rect(0, 770, 1600, 782), STREET: P[] = rect(0, 782, 1600, 900);
// a far table with a man who does not want to go home, the empty tables between
const table = (x: number, y: number, s: number) => ({ top: ring(x, y, 50 * s, 12 * s, 16), leg: rect(x - 3 * s, y, x + 3 * s, y + 130 * s), foot: ring(x, y + 130 * s, 22 * s, 5 * s, 10) });
const T_FAR = [table(560, 668, 0.72), table(780, 664, 0.7), table(1000, 662, 0.68)];
const chair = (x: number, y: number, s: number, f: 1 | -1): P[][] => [[[x - f * 26 * s, y - 90 * s], [x - f * 22 * s, y], [x - f * 16 * s, y], [x - f * 20 * s, y - 90 * s]], [[x - f * 28 * s, y], [x + f * 24 * s, y], [x + f * 22 * s, y + 8 * s], [x - f * 26 * s, y + 8 * s]], rect(x - f * 24 * s, y, x - f * 20 * s, y + 90 * s), rect(x + f * 18 * s, y, x + f * 22 * s, y + 90 * s)];
const FAR_MAN = seated({ x: 740, h: 280, f: -1, seat: 708, floor: 780, head: "hat", cloth: "#3a3530", cloth2: "#3a3530", skin: "skin", ink: "#000", near: [0.7, 1.5], far: [0.4, 1.4], lite: true });

// ---------------------------------------------------------------- you, at your table
const DET_K = { x: 230, h: 400, f: 1 as const, seat: 690, floor: 792 };
const DET = seated({ ...DET_K, head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "#3a2a1e", skin: "skin", gold: "#b8321f", ink: "#000", near: [0.62, 1.55], far: [0.35, 1.2] });
const MY_CHAIR = chair(DET_K.x, DET_K.seat + 6, 1.1, 1);
const MY_TABLE = table(DET_K.x + 150, DET_K.seat - 46, 1.05);
const TT = MY_TABLE.top, TX = DET_K.x + 150, TY = DET_K.seat - 46;
const DEMI: P[] = [[TX + 20, TY - 64], [TX + 50, TY - 64], [TX + 46, TY - 2], [TX + 24, TY - 2]], BEER: P[] = [[TX + 21, TY - 48], [TX + 49, TY - 48], [TX + 46, TY - 3], [TX + 24, TY - 3]];
const ASHTRAY: P[] = blob(TX - 14, TY - 4, 20, 6, 3, 0.05, 12), CIG: P[] = [[TX - 16, TY - 8], [TX + 8, TY - 14], [TX + 9, TY - 11], [TX - 15, TY - 5]];
const SMOKE_AT: P = [TX + 8, TY - 14];

// ---------------------------------------------------------------- the 504, and who gets out of it
const CAR = car504({ x: 560, g: 884, L: 1000, f: 1, lights: true, doorOpen: true });
const GLARE: P[] = blob(CAR.lamp[0], CAR.lamp[1], 64, 34, 12, 0.06, 16);
const SHADOW: P[] = blob(1060, 884, 520, 16, 11, 0.04, 20);
// Maillard at the wheel, seen through the front window: leather jacket, black hair, the moustache
const [MX, MY] = CAR.driver, FRONT_WIN = CAR.frontWin;
const MAILLARD: Piece[] = [
  { pts: [[MX - 62, MY + 90], [MX - 40, MY + 36], [MX + 46, MY + 40], [MX + 60, MY + 90]], ink: { y: 0.8, p: 0.7, b: 0.5 } },
  { pts: blob(MX, MY, 22, 27, 13, 0.04, 14), ink: MIX.skin }, { pts: blob(MX - 5, MY - 14, 23, 15, 14, 0.06, 12), ink: MIX.black },
  { pts: [[MX + 20, MY + 7], [MX + 4, MY + 5], [MX + 2, MY + 11], [MX + 18, MY + 13]], ink: MIX.black },
];
// Varenne, heavyset, balding, sweating in his short-sleeved shirt, out on the road behind her, clear of
// the car, beside the open door's edge
const VAR_K = { x: 876, g: 892, h: 450, f: -1 as const };
const VAR_NEAR: [number, number] = [0.25, 0.55];
const VAR0 = figure({ ...VAR_K, robe: "suit", head: "bare", cloth: "#c3d6ea", cloth2: "#6b6258", hair: "skin", skin: "skin", gold: "#3a3a52", ink: "#000", near: VAR_NEAR, far: [0.1, 0.2] });
const widen = (p: P): P => [VAR_K.x + (p[0] - VAR_K.x) * 1.3, p[1]];
const VAR_M = remap(VAR0.m, widen), VAR_ARM = forearm(VAR_K, VAR_NEAR)[0].map(widen);
const VAR_FRINGE: P[] = (() => { const [x, y] = widen(VAR0.head), h = VAR_K.h; return [[x + 0.02 * h, y - 0.03 * h], [x + 0.075 * h, y - 0.045 * h], [x + 0.08 * h, y + 0.02 * h], [x + 0.05 * h, y + 0.03 * h], [x + 0.035 * h, y - 0.005 * h]]; })();
// Nadia, the glasses off in her hand, the orange bag on her arm
const NAD_K = { x: 786, g: 898, h: 420, f: -1 as const };
const NADIA = figure({ ...NAD_K, robe: "dress", head: "long", cloth: "green", hair: "#2a1a14", skin: "skin", ink: "#000", near: [0.7, 2.3], far: [0.12, 0.25] });
const SPECS: P[] = (() => { const [x, y] = NADIA.hands.near; return [[x - 2, y + 8], [x + 18, y + 6], [x + 17, y + 20], [x, y + 22]]; })();
const SPECS2: P[] = SPECS.map(([x, y]) => [x - 24, y + 2]);
const BAG: P[] = (() => { const [x, y] = NADIA.hands.far; return [[x - 26, y + 6], [x + 26, y + 6], [x + 30, y + 58], [x - 30, y + 58]]; })();

// ---------------------------------------------------------------- the print
// her green dress: with red in the yellow drum, yellow and blue make violet, so the green is the blue
// drum alone, a teal on the cream sheet against the violet night
const DRESS: Sep = { b: 0.78 };
const det = DET, var_ = fromMotif(VAR_M), nad0 = fromMotif(NADIA.m), far = FAR_MAN;
const nad = { ...nad0, pieces: nad0.pieces.map((pc) => (pc.ink === MIX.green ? { ...pc, ink: DRESS } : pc)) };
const carFront = [...CAR.all, ...CAR.door.map((p) => p.pts)];
const people = [...var_.pieces, ...nad.pieces].map((p) => p.pts).concat([tube(VAR_ARM, 0.034 * VAR_K.h, 0.03 * VAR_K.h)]);
const warm: Sep = { y: (_x, y) => 0.35 + 0.35 * (y - 372) / 268, p: 0.28, b: 0.08 };
const pieces: Piece[] = [
  { pts: SKY, ink: MIX.night },
  { pts: FACADE, ink: { b: 0.8, p: 0.55, y: 0.35 } }, ...UPPER.map((q, i) => ({ pts: q, ink: i === 3 ? { y: 0.6, p: 0.3, b: 0.1 } as Sep : { b: 0.95, p: 0.75, y: 0.5 } as Sep })),
  { pts: NEXT, ink: { b: 0.9, p: 0.7, y: 0.45 } }, ...NEXT_WIN.map((q, i) => ({ pts: q, ink: i === 1 ? { y: 0.5, p: 0.35 } as Sep : { b: 1, p: 0.8, y: 0.55 } as Sep })), { pts: NEXT_SIGN, ink: MIX.black },
  { pts: SIGN_GLOW, ink: { p: (x, y) => 0.15 + 0.45 * Math.exp(-(((x - 540) / 380) ** 2) - (((y - 196) / 60) ** 2)), y: 0.12, b: 0.05 } },
  { pts: FRONT, ink: { b: 0.7, p: 0.55, y: 0.45 } }, ...GLASS.map((q) => ({ pts: q, ink: warm })), ...BOTTLES.map((q) => ({ pts: q, ink: { b: 0.6, p: 0.4, y: 0.6 } as Sep })), ...fromMotif(PATRON.m).pieces, { pts: BAR, ink: { y: 0.7, p: 0.6, b: 0.45 } }, ...LAMPS.map((q) => ({ pts: q, ink: { y: 0.3 } as Sep })),
  { pts: AWNING, ink: MIX.cream }, ...STRIPES.map((q) => ({ pts: q, ink: { y: 1, p: 0.3 } as Sep, clip: AWNING })), { pts: VALANCE, ink: { y: 1, p: 0.3 } },
  { pts: PAVE, ink: { b: 0.5, p: 0.38, y: (x, y) => 0.25 + 0.3 * Math.exp(-(((y - 640) / 70) ** 2)) * (x < 1130 ? 1 : 0.2) } }, { pts: GUTTER, ink: { b: 0.4, p: 0.2, y: 0.2 } }, { pts: STREET, ink: { b: 0.85, p: 0.62, y: 0.4 } },
  // the empty tables, the man at the far one
  ...T_FAR.flatMap((t) => [{ pts: t.leg, ink: MIX.black }, { pts: t.foot, ink: MIX.black }, { pts: t.top, ink: { b: 0.35, p: 0.2, y: 0.25 } as Sep }]),
  ...chair(640, 700, 0.75, -1).map((q) => ({ pts: q, ink: { y: 0.6, p: 0.5, b: 0.4 } as Sep })), ...chair(880, 700, 0.72, 1).map((q) => ({ pts: q, ink: { y: 0.6, p: 0.5, b: 0.4 } as Sep })),
  ...far.legs, ...far.pieces,
  // you
  ...MY_CHAIR.map((q) => ({ pts: q, ink: { y: 0.65, p: 0.55, b: 0.4 } as Sep })),
  ...det.legs, ...det.pieces,
  { pts: MY_TABLE.leg, ink: MIX.black }, { pts: MY_TABLE.foot, ink: MIX.black }, { pts: TT, ink: { b: 0.3, p: 0.18, y: 0.22 } },
  { pts: DEMI, ink: { b: 0.08 } }, { pts: BEER, ink: { y: 0.55, p: 0.2 } }, { pts: ASHTRAY, ink: MIX.grey }, { pts: CIG, ink: {} },
  // the car and the people getting out of it
  { pts: SHADOW, ink: MIX.black },
  ...CAR.pieces, { pts: GLARE, ink: { y: 0.2, p: 0.05 } },
  ...MAILLARD.map((pc) => ({ ...pc, clip: FRONT_WIN })),
  ...CAR.door,
  ...var_.pieces, { pts: tube(VAR_ARM, 0.034 * VAR_K.h, 0.03 * VAR_K.h), ink: MIX.skin }, { pts: VAR_FRINGE, ink: MIX.grey },
  ...nad.pieces, { pts: SPECS, ink: MIX.black }, { pts: SPECS2, ink: MIX.black }, { pts: BAG, ink: MIX.orange },
];
const keys: Key[] = [
  edge(AWNING, 1.8), ...GLASS.map((q) => edge(q, 1.8, 0.9, [...carFront, ...det.pieces.map((p) => p.pts)])), ...UPPER.map((q) => edge(q, 1.4, 0.7)),
  stroke([[0, 640], [1600, 640]], 1.4, 0.6, carFront), ...Array.from({ length: 14 }, (_, i) => stroke([[i * 120, 640], [i * 120 - 30, 770]], 1, 0.35, carFront)),
  ...far.keys, ...far.legKeys, ...det.keys, ...det.legKeys, edge(TT, 1.6, 0.9), edge(DEMI, 1.4, 0.9), edge(ASHTRAY, 1.2, 0.8),
  ...CAR.keys.map((k) => ({ ...k, hide: [...(k.hide ?? []), ...people, ...CAR.door.map((p) => p.pts)] })),
  stroke([[MX + 70, MY + 50], [MX + 44, MY + 34], [MX + 34, MY + 80]], 3, 0.9, people), // the wheel's rim under his hands
  ...CAR.doorKeys.map((k) => ({ ...k, hide: people })),
  ...var_.keys.map((k) => ({ ...k, hide: [...(k.hide ?? []), ...nad.pieces.map((p) => p.pts)] })),
  ...nad.keys, edge(BAG, 1.4, 0.9), stroke([SPECS[2], SPECS2[3]], 1.4),
];

// ---------------------------------------------------------------- what moves
// the last letter's tube, for the buzz: the I is a single slanted stroke
const I_TUBE: P[] = (() => { const s = CAP / 6, cx = SIGN_X + width(SIGN_TEXT, CAP) / 2 - 2 * s; return [[cx + 2.2 * s - 9, SIGN_Y - 6], [cx + 2.2 * s + 9, SIGN_Y - 6], [cx + s + 9, SIGN_Y + CAP + 6], [cx + s - 9, SIGN_Y + CAP + 6]]; })();
// a neon that has been failing all summer: now and then it drops out, and the S at the end buzzes
const flicker = (t: number) => { const k = Math.floor(t / 3) % 80; return k === 13 || k === 14 || k === 51 ? 0.15 : k === 52 ? 0.6 : 1; };
export const r09 = press({
  id: "r09", title: "Deux heures", loop: LOOP, act3: ACT3, pieces, keys,
  extra: {
    // the neon, lit: red tubes, pink where the gas is hottest
    y: (g) => letter(g, SIGN_TEXT, SIGN_X, SIGN_Y, { cap: CAP, color: "#f15060", seed: 21, align: "center", w: 12, opacity: 0.95 }),
    p: (g) => { letter(g, SIGN_TEXT, SIGN_X, SIGN_Y, { cap: CAP, color: "#ff48b0", seed: 21, align: "center", w: 4.5, opacity: 0.9 }); letter(g, "BAR", 1380, 314, { cap: 32, color: "#ff48b0", seed: 22, align: "center", w: 4, opacity: 0.8 }); },
  },
  anim: (g, t, reveal) => {
    const TT2 = (t / LOOP) * Math.PI * 2;
    // the neon failing: when the gas drops out a dark veil comes over the sign and its glow; the
    // last letter buzzes on its own
    const off = 1 - flicker(t), iOff = 0.5 + 0.5 * Math.sin(TT2 * 60);
    if (off > 0.01) overprint(g, [{ pts: SIGN_GLOW, ink: { b: 1, p: 1 } }], { act3: ACT3, alpha: 0.55 * off * reveal });
    overprint(g, [{ pts: I_TUBE, ink: { b: 1, p: 1 } }], { act3: ACT3, alpha: 0.6 * iOff * reveal });
    // the headlamps' glare: rays off the lamp, breathing
    const [lx, ly] = CAR.lamp, gl = 0.75 + 0.25 * Math.sin(TT2 * 4) * Math.sin(TT2 * 3 + 2);
    // a starburst, as glare prints on a photograph: long flat rays, short ones between
    inkPen(g, "y", (ink) => { for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2 + 0.13, flat = Math.abs(Math.cos(a)), l = (i % 2 ? 34 : 60 + 70 * flat) * gl; g.pen([[lx + Math.cos(a) * 14, ly + Math.sin(a) * 10], [lx + Math.cos(a) * l, ly + Math.sin(a) * l * 0.55]], { w: i % 2 ? 1.8 : 3, color: ink, seed: 90 + i, wobble: 0.1, boil: 0, taper: 0.2, opacity: 0.9 * reveal, retrace: false }); } }, { act3: ACT3 });
    overprint(g, [{ pts: blob(lx, ly, 46 * gl, 26 * gl, 5, 0.05, 14), ink: { p: 1 } }], { act3: ACT3, alpha: 0.22 * reveal });
    // your cigarette's smoke, three threads going up
    const smoke: Piece[] = [0, 1, 2].map((k) => { const p = ((t + k * 80) % LOOP) / LOOP, x = SMOKE_AT[0] + Math.sin(p * 6 + k) * 12 + p * 30, y = SMOKE_AT[1] - p * 230; return { pts: blob(x, y, 7 + p * 24, 5 + p * 12, 20 + k, 0.35, 12), ink: { b: 0.45 * Math.sin(p * Math.PI) * reveal, p: 0.1 * Math.sin(p * Math.PI) * reveal } }; });
    overprint(g, smoke, { act3: ACT3 });
  },
});
