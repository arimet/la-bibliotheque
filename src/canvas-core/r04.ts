// CANICULE PAGE 4 · LA FILATURE. One idea: at the red light on place Blanche, the grey Peugeot
// that has followed you down the boulevard stops level with you, and the man at its wheel is a cop.
// Night, thirty degrees. The Moulin Rouge's red mill behind, the boulevard's neon. The mustard
// Renault 16 in the far lane, you at its wheel; the grey 504 in the near lane, pulled up just behind,
// Maillard in profile through its open window, looking straight ahead. The light on its post in front.
// What moves: the mill's sails, a neon sign that stutters, the red light glowing.
import { oval, rng, tube, type P } from "./core";
import { figure } from "./figures";
import { MIX, PAPER, REG, fromMotif, inkOf, overprint, press, type Key, type Piece, type Sep } from "./press";

const LOOP = 180;
const R = (x0: number, y0: number, x1: number, y1: number): P[] => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
const edge = (pts: P[], w = 2.2, op = 0.9, hide?: P[][]): Key => ({ pts: [...pts, pts[0]], w, op, hide });
const arch = (cx: number, r: number, v: number): [number, number][] => Array.from({ length: 9 }, (_, i) => { const a = (i / 8) * Math.PI; return [cx + r * Math.cos(a), v + r * Math.sin(a)]; });

// ---------------------------------------------------------------- neon letters, bent in glass
const GLYPH: Record<string, number[][][]> = {
  A: [[[0, 5], [1.5, 0], [3, 5]], [[0.6, 3.2], [2.4, 3.2]]], B: [[[0, 0], [0, 5], [2.2, 5], [3, 4.2], [3, 3.2], [2.2, 2.5], [0, 2.5]], [[0, 0], [2, 0], [2.7, 0.7], [2.7, 1.8], [2, 2.5]]],
  R: [[[0, 5], [0, 0], [2.2, 0], [3, 0.8], [3, 1.8], [2.2, 2.6], [0, 2.6]], [[1.6, 2.6], [3, 5]]], H: [[[0, 0], [0, 5]], [[3, 0], [3, 5]], [[0, 2.5], [3, 2.5]]],
  O: [[[0.7, 0], [2.3, 0], [3, 0.8], [3, 4.2], [2.3, 5], [0.7, 5], [0, 4.2], [0, 0.8], [0.7, 0]]], T: [[[0, 0], [3, 0]], [[1.5, 0], [1.5, 5]]],
  E: [[[3, 0], [0, 0], [0, 5], [3, 5]], [[0, 2.5], [2.2, 2.5]]], L: [[[0, 0], [0, 5], [2.8, 5]]], M: [[[0, 5], [0, 0], [1.75, 2.6], [3.5, 0], [3.5, 5]]],
  U: [[[0, 0], [0, 4.2], [0.7, 5], [2.3, 5], [3, 4.2], [3, 0]]], I: [[[0.5, 0], [0.5, 5]]], N: [[[0, 5], [0, 0], [3, 5], [3, 0]]],
  G: [[[3, 0.8], [2.3, 0], [0.7, 0], [0, 0.8], [0, 4.2], [0.7, 5], [2.3, 5], [3, 4.2], [3, 2.8], [1.8, 2.8]]],
};
const GW: Record<string, number> = { A: 3, B: 3, R: 3, H: 3, O: 3, T: 3, E: 3, L: 2.8, M: 3.5, U: 3, I: 1, N: 3, G: 3, " ": 1.5 };
// a word in neon tubes, left to right from x (or down from y when `down`)
const neon = (word: string, x: number, y: number, k: number, r: number, down = false): P[][] => {
  let o = 0; const out: P[][] = [];
  for (const c of word) { (GLYPH[c] ?? []).forEach((st) => out.push(tube(st.map(([u, v]) => (down ? [x + u * k, y + o + v * k] : [x + o + u * k, y + v * k]) as P), r, r, false))); o += down ? 6.6 * k : (GW[c] + 1.3) * k; }
  return out;
};

// ---------------------------------------------------------------- the boulevard
const SKY = R(0, 0, 1600, 640);
const rb = rng(9);
const BLOCKS: P[][] = [[0, 150], [210, 110], [470, 170], [760, 130], [1010, 190]].map(([x, top], i, a) => { const x1 = i < a.length - 1 ? a[i + 1][0] : 1180; return [[x, 640], [x, top + 30], [x + 20, top], [x1 - 20, top], [x1, top + 30], [x1, 640]] as P[]; });
const LIT: P[][] = BLOCKS.flatMap((b, i) => { const x0 = b[0][0], x1 = b[5][0], top = b[2][1]; const out: P[][] = []; for (let y = top + 60; y < 560; y += 70) for (let x = x0 + 26; x < x1 - 30; x += 58) if (rb() < 0.35) out.push(R(x, y, x + 22, y + 36)); return i === 1 ? out.filter((q) => q[0][0] > 330 || q[0][1] < 250) : out; });
const DARK_WINS: P[][] = BLOCKS.flatMap((b) => { const x0 = b[0][0], x1 = b[5][0], top = b[2][1]; const out: P[][] = []; for (let y = top + 60; y < 560; y += 70) for (let x = x0 + 26; x < x1 - 30; x += 58) out.push(R(x, y, x + 22, y + 36)); return out; });
// the signs: HOTEL down a board, BAR over a door (this one stutters), CABARET
const HOTEL_BOARD = R(344, 250, 392, 470), HOTEL = neon("HOTEL", 355, 262, 5, 2.4, true);
const BAR_BOARD = R(830, 470, 950, 520), BAR = neon("BAR", 846, 480, 6, 2.6);
// the Moulin Rouge: the red front, the mill on its roof, the name in lights
const MR_FRONT = R(1150, 420, 1600, 640), MR_CORNICE = R(1140, 406, 1600, 424);
const MILL: P[] = [[1318, 420], [1330, 250], [1350, 206], [1392, 190], [1434, 206], [1454, 250], [1466, 420]];
const MILL_CAP: P[] = [[1330, 214], [1392, 150], [1454, 214]];
const HUB: P = [1392, 250];
const MOULIN = neon("MOULIN ROUGE", 1170, 440, 6.2, 2.6);
const MR_DOORS = [R(1190, 520, 1270, 640), R(1500, 520, 1580, 640)];
const BULBS: P[] = Array.from({ length: 16 }, (_, i) => [1160 + i * 28, 500] as P);
// the street
const PAVE = R(0, 632, 1600, 662), ROAD = R(0, 662, 1600, 900), KERB = R(0, 656, 1600, 664);
const LANE: P[][] = [R(40, 790, 180, 796), R(300, 790, 440, 796)];
const STOPLINE: P[] = [[0, 866], [70, 866], [60, 880], [0, 880]];

// ---------------------------------------------------------------- the cars, in profile, facing left
// (u from the front bumper back, v up from the ground, in the car's own units)
type Car = { x: number; g: number; s: number };
const at = (c: Car) => (pts: number[][]): P[] => pts.map(([u, v]) => [c.x + u * c.s, c.g - v * c.s] as P);
// the grey 504: a long three-box saloon, its cabin a trapezoid, the boot flat
const C504: Car = { x: 200, g: 856, s: 1 }; // pulled up alongside: Maillard level with you, a little behind so both faces show
const p504 = at(C504);
const B504 = p504([[8, 58], [2, 96], [6, 128], [18, 150], [300, 168], [770, 178], [884, 172], [900, 150], [902, 60], ...arch(730, 74, 60), ...arch(162, 74, 60).map(([u, v]) => [u, v]), [60, 58]].map(([u, v]) => [u, v]).filter((_, i, a) => i === 0 || a[i - 1][0] !== _[0] || a[i - 1][1] !== _[1]));
const G504 = p504([[300, 168], [424, 286], [664, 290], [772, 178]]);
const WIN504 = [p504([[322, 176], [428, 278], [532, 280], [532, 178]]), p504([[550, 178], [550, 282], [650, 282], [716, 184]])];
const ROOF504 = p504([[418, 284], [666, 288], [666, 296], [418, 292]]);
const B_PILLAR = p504([[532, 176], [550, 176], [550, 286], [532, 286]]), C_PILLAR = p504([[650, 284], [666, 290], [772, 178], [716, 180]]);
const A_PILLAR = p504([[300, 168], [322, 170], [430, 280], [418, 286]]);
const BUMPERS = [p504([[-6, 92], [10, 92], [10, 112], [-6, 112]]), p504([[890, 92], [910, 92], [910, 112], [890, 112]])];
const LAMP504 = p504([[-2, 118], [14, 118], [14, 140], [-2, 140]]), TAIL504 = p504([[892, 124], [904, 124], [904, 150], [892, 150]]);
const WHEELS504 = [162, 730].map((u) => { const [x, y] = p504([[u, 56]])[0]; return { tyre: oval(x, y, 56, 56, 20), cap: oval(x, y, 26, 26, 14) }; });
const DOORS504 = [p504([[304, 168], [304, 70], [540, 64], [540, 172]]), p504([[540, 172], [540, 64], [690, 66], [740, 110], [760, 176]])];
const HANDLES504 = [p504([[500, 150], [526, 150]]), p504([[700, 152], [726, 152]])];
const WHEEL_RING = oval(C504.x + 400, C504.g - 200, 10, 32, 14);
// the mustard Renault 16 in the far lane: a hatchback, its roof running down to the tail
const C16: Car = { x: 40, g: 716, s: 0.82 }; // first at the light, its nose past the post
const p16 = at(C16);
const WHEEL16 = oval(C16.x + 350 * C16.s, C16.g - 196 * C16.s, 8, 26, 14);
const B16 = p16([[6, 58], [2, 100], [8, 132], [20, 144], [270, 162], [826, 170], [848, 150], [850, 60], ...arch(700, 72, 60), ...arch(150, 72, 60), [50, 58]]);
const R16_TAIL = C16.x + 850 * C16.s, G504_R16: P[] = [G504[0], G504[1], [R16_TAIL, G504[1][1] + ((G504[2][1] - G504[1][1]) * (R16_TAIL - G504[1][0])) / (G504[2][0] - G504[1][0])], [R16_TAIL, G504[0][1] + ((G504[3][1] - G504[0][1]) * (R16_TAIL - G504[0][0])) / (G504[3][0] - G504[0][0])]];
const G16 = p16([[270, 162], [392, 282], [610, 286], [836, 172]]);
const WIN16 = [p16([[292, 170], [396, 274], [508, 276], [508, 172]]), p16([[526, 174], [526, 278], [606, 278], [700, 180]])];
const PIL16 = [p16([[270, 162], [292, 164], [400, 274], [388, 282]]), p16([[508, 170], [526, 170], [526, 282], [508, 282]]), p16([[600, 280], [612, 286], [836, 172], [700, 176]])];
const ROOF16 = p16([[386, 280], [612, 284], [612, 292], [386, 288]]);
const LAMP16 = p16([[-2, 110], [16, 110], [16, 134], [-2, 134]]), BUMP16 = p16([[-6, 86], [12, 86], [12, 104], [-6, 104]]);
const WHEELS16 = [150, 700].map((u) => { const [x, y] = p16([[u, 56]])[0]; return { tyre: oval(x, y, 46, 46, 20), cap: oval(x, y, 20, 20, 14) }; });
// the two drivers
const HAIR_DET = "#3a2a1e";
const DET = figure({ x: C16.x + 452 * C16.s, g: C16.g + 70, h: 292, f: -1, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: HAIR_DET, skin: "skin", gold: "#b8321f", ink: "#000", near: [0.5, 2.3], far: [0.45, 2.2] });
const MAIL = figure({ x: C504.x + 452, g: C504.g + 79, h: 360, f: -1, robe: "suit", head: "bare", cloth: "#a8683e", cloth2: "#2a2a2a", hair: "#16100c", skin: "skin", gold: "#3a3030", ink: "#000", near: [0.2, 2.6], far: [0.15, 2.5] });
const MOUSTACHE: P[] = (() => { const [x, y] = MAIL.head, h = 360; return [[x - 0.022 * h, y + 0.024 * h], [x - 0.06 * h, y + 0.02 * h], [x - 0.066 * h, y + 0.036 * h], [x - 0.046 * h, y + 0.046 * h], [x - 0.02 * h, y + 0.042 * h]]; })();
// the light, on its post in front of everything
const POST = R(80, 300, 96, 900), HEAD = R(48, 270, 128, 500);
const LAMPS = [0, 1, 2].map((i) => oval(88, 308 + i * 74, 27, 27, 18));
const VISOR = [0, 1, 2].map((i) => [[56, 274 + i * 74], [120, 274 + i * 74], [112, 284 + i * 74], [64, 284 + i * 74]] as P[]);

// ---------------------------------------------------------------- the print
const NIGHT: Sep = { b: (_x, y) => 0.95 - 0.25 * (y / 640), p: (_x, y) => 0.45 + 0.25 * (y / 640), y: 0.12 };
const GREY504: Sep = { b: 0.46, p: (x) => 0.26 + 0.25 * Math.exp(-((x - 300) ** 2) / 90000), y: 0.24 }; // the red light on its nose
const MUSTARD: Sep = { y: 1, p: 0.3, b: 0.26 };
const BELOW16 = R(0, C16.g - 166 * C16.s, 1600, 900), BELOW504 = R(0, C504.g - 172, 1600, 900);
const inCab = (f: ReturnType<typeof fromMotif>, cab: P[]) => ({ pieces: f.pieces.map((p) => ({ ...p, clip: cab })), keys: f.keys });
const det = inCab(fromMotif(DET.m, [B504, ...PIL16, ROOF16, B16, BELOW16]), G16), mail = inCab(fromMotif(MAIL.m, [B504, A_PILLAR, B_PILLAR, ROOF504, MOUSTACHE, BELOW504]), G504);
const pieces: Piece[] = [
  { pts: SKY, ink: NIGHT },
  ...BLOCKS.map((q, i) => ({ pts: q, ink: { b: 0.9, p: 0.62 + (i % 2) * 0.1, y: 0.3 } as Sep })),
  ...DARK_WINS.map((q) => ({ pts: q, ink: { b: 1, p: 0.8, y: 0.5 } as Sep })), ...LIT.map((q, i) => ({ pts: q, ink: { y: 0.85, p: 0.2 + (i % 3) * 0.12 } as Sep })),
  { pts: HOTEL_BOARD, ink: MIX.black }, ...HOTEL.map((q) => ({ pts: q, ink: MIX.pink })),
  { pts: BAR_BOARD, ink: MIX.black }, ...BAR.map((q) => ({ pts: q, ink: { y: 1, p: 0.25 } as Sep })),
  // the Moulin Rouge
  { pts: MILL, ink: { y: 0.8, p: 0.9, b: 0.45 } }, { pts: MILL_CAP, ink: { y: 0.7, p: 0.8, b: 0.7 } },
  { pts: MR_FRONT, ink: { y: 0.95, p: 0.95, b: 0.3 } }, { pts: MR_CORNICE, ink: { y: 0.6, p: 0.85, b: 0.55 } },
  ...MR_DOORS.map((q) => ({ pts: q, ink: { y: 1, p: 0.5 } as Sep })),
  ...MOULIN.map((q) => ({ pts: q, ink: { y: 1, p: 0.12 } as Sep })), ...BULBS.map(([x, y]) => ({ pts: oval(x, y, 5, 5, 8), ink: { y: 0.9 } as Sep })),
  // the street, the beams of the headlights on it
  { pts: PAVE, ink: { b: 0.75, p: 0.6, y: 0.35 } }, { pts: ROAD, ink: { b: 0.85, p: 0.55, y: 0.45 } }, { pts: KERB, ink: { b: 0.5, p: 0.4, y: 0.3 } },
  { pts: [[C16.x, 690], [C16.x - 400, 668], [C16.x - 400, 740], [C16.x, 716]], ink: { b: 0.55, p: 0.45, y: 0.65 } },
  { pts: [[C504.x, 830], [C504.x - 520, 810], [C504.x - 520, 900], [C504.x, 862]], ink: { b: 0.5, p: 0.42, y: 0.7 } },
  ...LANE.map((q) => ({ pts: q, ink: { b: 0.3, p: 0.25, y: 0.3 } as Sep })), { pts: STOPLINE, ink: { b: 0.3, p: 0.25, y: 0.3 } },
  // the Renault 16 and you in it
  { pts: G16, ink: { b: 0.8, p: 0.6, y: 0.35 } },
  { pts: WHEEL16, ink: MIX.black }, ...det.pieces,
  ...PIL16.map((q) => ({ pts: q, ink: MUSTARD })), { pts: ROOF16, ink: MUSTARD },
  { pts: B16, ink: MUSTARD }, { pts: LAMP16, ink: { y: 0.2 } }, { pts: BUMP16, ink: { b: 0.3, p: 0.2 } },
  ...WHEELS16.flatMap((w) => [{ pts: w.tyre, ink: MIX.black }, { pts: w.cap, ink: { b: 0.4, p: 0.25 } as Sep }]),
  // the 504 and Maillard in it: through its open window, the lit boulevard beyond
  { pts: G504, ink: { b: 0.7, p: 0.5, y: 0.45 } },
  { pts: G504_R16, ink: { y: 0.95, p: 0.3, b: 0.3 } }, // the Renault's door behind the glass, up to its tail
  { pts: WHEEL_RING, ink: MIX.black },
  ...mail.pieces, { pts: MOUSTACHE, ink: MIX.black },
  { pts: A_PILLAR, ink: GREY504 }, { pts: B_PILLAR, ink: GREY504 }, { pts: C_PILLAR, ink: GREY504 }, { pts: ROOF504, ink: GREY504 },
  { pts: WIN504[1], ink: { b: 0.7, p: 0.35, y: 0.25 } }, // the back window is wound up
  { pts: B504, ink: GREY504 },
  ...BUMPERS.map((q) => ({ pts: q, ink: { b: 0.2, p: 0.1 } as Sep })), { pts: LAMP504, ink: { y: 0.15 } }, { pts: TAIL504, ink: MIX.red },
  ...WHEELS504.flatMap((w) => [{ pts: w.tyre, ink: MIX.black }, { pts: w.cap, ink: { b: 0.35, p: 0.2 } as Sep }]),
  // the traffic light
  { pts: POST, ink: MIX.black }, { pts: HEAD, ink: MIX.black },
  { pts: LAMPS[0], ink: MIX.red }, { pts: LAMPS[1], ink: { y: 0.4, p: 0.3, b: 0.6 } }, { pts: LAMPS[2], ink: { y: 0.4, b: 0.7, p: 0.3 } },
  ...VISOR.map((q) => ({ pts: q, ink: MIX.black })),
];
const keys: Key[] = [
  ...det.keys, ...mail.keys,
  edge(B16, 2.2, 0.9, [B504]), edge(G16, 2, 0.9, [B504]), ...WIN16.map((q) => edge(q, 1.6, 0.8, [B504, ...det.pieces.map((p) => p.pts)])),
  edge(B504, 2.4), edge(G504, 2.2), edge(WIN504[1], 1.6), ...DOORS504.map((q) => ({ pts: q, w: 1.6, op: 0.8 })), ...HANDLES504.map((q) => ({ pts: q, w: 3 })),
  edge(MR_FRONT, 2), edge(MILL, 1.8),
];

// ---------------------------------------------------------------- what moves
// a sail: a long lattice, bulbs along its frame
const sail = (a: number): P[][] => {
  const c = Math.cos(a), s = Math.sin(a), T = (u: number, v: number): P => [HUB[0] + c * u - s * v, HUB[1] + s * u + c * v];
  const bar = (u0: number, v0: number, u1: number, v1: number, w: number): P[] => { const dx = u1 - u0, dy = v1 - v0, l = Math.hypot(dx, dy), nx = (-dy / l) * w, ny = (dx / l) * w; return [T(u0 + nx, v0 + ny), T(u1 + nx, v1 + ny), T(u1 - nx, v1 - ny), T(u0 - nx, v0 - ny)]; };
  return [bar(10, 0, 196, 0, 6), bar(40, 12, 196, 12, 5), bar(40, 50, 196, 50, 5), bar(196, 12, 196, 50, 5), ...[80, 120, 160].map((u) => bar(u, 12, u, 50, 3.6))];
};
const STUTTER = [1, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 1]; // the BAR sign, 6 frames a step
const GLOW = oval(88, 308, 74, 74, 28);
export const r04 = press({
  id: "r04", title: "La Filature", loop: LOOP, pieces, keys,
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the sails, lit red against the night: a knockout to paper, then the red; half a turn a loop
    const sails = [0, 1, 2, 3].flatMap((k) => sail(TT / 2 + (k * Math.PI) / 2));
    // solid inks need no screen: each drum's fill straight onto the sheet, through its registration
    sails.forEach((q) => g.fill(q, PAPER, reveal));
    const c = g.main; c.save(); c.globalCompositeOperation = "multiply";
    (["y", "p"] as const).forEach((d) => { const [ox, oy] = REG[d]; sails.forEach((q) => g.fill(q.map(([x, y]) => [x + ox, y + oy] as P), inkOf(d), reveal)); });
    c.restore();
    overprint(g, [{ pts: oval(HUB[0], HUB[1], 14, 14, 12), ink: { y: 0.7 * reveal, p: 0.8 * reveal, b: 0.6 * reveal } }]);
    // the BAR sign: when it drops out, the dark board shows over its tubes
    if (!STUTTER[Math.floor(t / 6) % STUTTER.length]) overprint(g, [{ pts: BAR_BOARD, ink: { b: 0.85 * reveal, p: 0.5 * reveal } }]);
    // the red light breathes a glow round itself
    const k = 0.6 + 0.4 * Math.sin(TT * 3);
    g.fill(GLOW, PAPER, 0.3 * k * reveal);
    overprint(g, [{ pts: GLOW, ink: { y: 0.3 * k * reveal, p: 0.32 * k * reveal } }, { pts: LAMPS[0], ink: { y: 0.5 * k * reveal } }]);
  },
});
