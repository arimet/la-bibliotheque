// CANICULE PAGE 12 · LA PHOTO. One idea: the only picture there ever was of her ends up in the paper.
// An ending, printed on the red drum. Your office on rue Frochot, the desk of page 1 seen from
// closer, and nobody at it. The fan switched off, the phone, the typewriter, the ashtray; France-Soir
// open at page six on a small photograph: the Flamingo's poster, Lili in profile at the microphone,
// UNE INCONNUE REPECHEE DANS LE CANAL. The top drawer pulled open on the five new notes. On the wall
// the calendar still on July, the hat on the rack, the window's blind.
// What moves: a fly walking on the desk, the blind's shadow bars edging across it, a drop running down
// the side of a glass of water nobody drinks.
import { type P } from "./core";
import { letter } from "./drafting";
import { blob } from "./gallery";
import { INK, MIX, overprint, press, type Key, type Piece, type Sep } from "./press";
import { edge, inset, rect, ring, stroke } from "./r07";

const LOOP = 240;
const ACT3 = true;

// ---------------------------------------------------------------- the room behind the desk
const WALL: P[] = rect(0, 0, 1600, 470), FLOOR: P[] = rect(0, 470, 1600, 900);
const WIN = { x0: 60, x1: 430, y0: -10, y1: 380 };
const FRAME: P[] = rect(WIN.x0 - 22, WIN.y0, WIN.x1 + 22, WIN.y1 + 30), WINDOW: P[] = rect(WIN.x0, WIN.y0, WIN.x1, WIN.y1);
const SLATS: P[][] = Array.from({ length: 11 }, (_, i) => { const y = WIN.y0 + 16 + i * 34; return rect(WIN.x0, y, WIN.x1, y + 13); });
const CAL: P[] = rect(600, 60, 740, 240), CAL_HEAD: P[] = rect(600, 60, 740, 100);
const RACK: P[] = [[1486, 470], [1494, 40], [1502, 40], [1510, 470]], HAT: P[] = [[1446, 70], [1556, 70], [1546, 56], [1528, 52], [1526, 10], [1504, 2], [1478, 10], [1474, 52], [1456, 56]];
const RAINCOAT: P[] = [[1468, 80], [1536, 80], [1556, 280], [1546, 380], [1456, 380], [1448, 280]];

// ---------------------------------------------------------------- the desk, from closer and higher than on page 1
const TOP: P[] = [[150, 440], [1470, 440], [1560, 780], [40, 780]];
const FRONT: P[] = rect(40, 780, 1560, 900);
// the top drawer pulled out toward us: its sides, the notes lying inside
const DRAWER_IN: P[] = [[296, 772], [694, 772], [712, 862], [278, 862]], DRAWER_FRONT: P[] = rect(266, 862, 724, 900);
const NOTES: P[][] = [0, 1, 2, 3, 4].map((i) => { const a = -0.45 + i * 0.2, cx = 400 + i * 46, cy = 818 - i * 3, w = 150, h = 84, c = Math.cos(a), s = Math.sin(a); return ([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]] as P[]).map(([x, y]) => [cx + x * c - y * s * 0.5, cy + (x * s + y * c) * 0.5] as P); });
const NOTE_OVAL = (q: P[]): P[] => { const cx = (q[0][0] + q[2][0]) / 2 + (q[1][0] - q[0][0]) * 0.22, cy = (q[0][1] + q[2][1]) / 2 + (q[1][1] - q[0][1]) * 0.22; return ring(cx, cy, 16, 11, 12); };
const OTHER_DRAWER: P[] = rect(900, 800, 1320, 880);
// the fan, switched off: base, stem, the cage, the blades still
const FAN = { x: 330, y: 400, r: 70 };
const FAN_BASE: P[] = [[FAN.x - 46, 520], [FAN.x + 46, 520], [FAN.x + 30, 500], [FAN.x - 30, 500]], FAN_STEM: P[] = rect(FAN.x - 6, FAN.y, FAN.x + 6, 502);
const blade = (a: number): P[] => { const c = Math.cos(a), s = Math.sin(a), R = FAN.r; return [[FAN.x, FAN.y], [FAN.x + c * R * 0.3 - s * 18, FAN.y + s * R * 0.3 + c * 18], [FAN.x + c * R - s * 14, FAN.y + s * R + c * 14], [FAN.x + c * R + s * 12, FAN.y + s * R - c * 12]]; };
const BLADES = [0, 1, 2, 3].map((k) => blade(0.4 + (k * Math.PI) / 2)), CAGE: P[] = ring(FAN.x, FAN.y, FAN.r + 8, FAN.r + 8, 28), HUB: P[] = ring(FAN.x, FAN.y, 12, 12, 10);
// the phone and the typewriter, where they were
const PHONE: P[] = [[1020, 540], [1026, 504], [1140, 504], [1146, 540]], HANDSET: P[] = [[1012, 502], [1018, 482], [1148, 482], [1154, 502], [1128, 506], [1116, 492], [1050, 492], [1036, 506]];
const DIAL: P[] = ring(1083, 522, 16, 9, 14);
const TYPEWRITER: P[] = [[1220, 600], [1246, 520], [1440, 520], [1466, 600]], PLATEN: P[] = rect(1236, 498, 1452, 520), PAPER_SHEET: P[] = [[1276, 500], [1410, 500], [1402, 430], [1284, 430]];
const ASHTRAY: P[] = blob(1470, 690, 44, 14, 44, 0.05, 14), BUTTS: P[][] = [[[1450, 684], [1480, 680], [1481, 686], [1451, 690]], [[1462, 694], [1490, 690], [1491, 696], [1463, 700]]];
// France-Soir open on the blotter at page six
const PAPER_L: P[] = [[520, 500], [800, 486], [812, 720], [500, 734]], PAPER_R: P[] = [[800, 486], [1076, 498], [1100, 716], [812, 720]];
const PHOTO: P[] = [[870, 580], [980, 576], [984, 676], [874, 680]];
// Lili on the poster: in profile, the bob, the microphone, her shoulders in the sequin dress
const PROFILE: P[] = [[890, 680], [896, 652], [910, 640], [908, 628], [900, 620], [906, 614], [904, 604], [914, 594], [932, 594], [944, 608], [946, 630], [940, 642], [958, 654], [968, 678]].map(([x, y]) => [x, y - 2] as P);
const BOB: P[] = [[906, 604], [918, 590], [940, 590], [952, 604], [952, 636], [940, 642], [934, 616], [914, 606]];
const MIC: P[] = ring(892, 626, 5, 6, 8), MIC_STEM: P[] = rect(890, 630, 894, 680);
// the glass of water, the drop's little pool at its foot
const GLASS: P[] = [[1150, 610], [1200, 610], [1194, 700], [1156, 700]], WATER: P[] = [[1152, 640], [1198, 640], [1194, 700], [1156, 700]], POOL: P[] = blob(1176, 704, 40, 7, 61, 0.1, 12);

// ---------------------------------------------------------------- the print
const desk: Sep = { y: 1, p: 0.55, b: 0.1 };
const pieces: Piece[] = [
  { pts: WALL, ink: { y: 0.16, p: (x, y) => 0.18 + 0.2 * Math.exp(-((x - 250) ** 2 + (y - 200) ** 2) / 120000), b: 0.12 } },
  { pts: FLOOR, ink: { b: 0.55, p: 0.7 } }, { pts: FRAME, ink: MIX.cream }, { pts: WINDOW, ink: { p: (_x, y) => 0.3 + 0.5 * (y - WIN.y0) / (WIN.y1 - WIN.y0), y: (_x, y) => 0.8 - 0.4 * (y - WIN.y0) / (WIN.y1 - WIN.y0) } },
  ...SLATS.map((q) => ({ pts: q, ink: { y: 0.5, p: 0.15 } as Sep })),
  { pts: CAL, ink: MIX.cream }, { pts: CAL_HEAD, ink: MIX.pink },
  { pts: RAINCOAT, ink: { y: 0.7, p: 0.3, b: 0.1 } }, { pts: RACK, ink: MIX.brown }, { pts: HAT, ink: { b: 0.7, p: 0.55, y: 0.4 } },
  { pts: TOP, ink: { y: 1, p: (_x, y) => 0.3 + 0.2 * (y - 440) / 340 } }, { pts: FRONT, ink: desk }, { pts: OTHER_DRAWER, ink: { y: 1, p: 0.8, b: 0.2 } },
  { pts: DRAWER_IN, ink: { y: 0.8, p: 0.6, b: 0.3 } }, ...NOTES.map((q, i) => ({ pts: q, ink: { y: 0.18 + i * 0.03, b: 0.3, p: 0.05 } as Sep })), { pts: DRAWER_FRONT, ink: { y: 1, p: 0.8, b: 0.2 } },
  { pts: FAN_BASE, ink: MIX.navy }, { pts: FAN_STEM, ink: MIX.navy }, { pts: CAGE, ink: { b: 0.2 } }, ...BLADES.map((q) => ({ pts: q, ink: { b: 0.9, p: 0.4 } as Sep })), { pts: HUB, ink: MIX.navy },
  { pts: PAPER_SHEET, ink: {} }, { pts: TYPEWRITER, ink: MIX.teal }, { pts: PLATEN, ink: MIX.black },
  { pts: PHONE, ink: MIX.black }, { pts: HANDSET, ink: MIX.black }, { pts: DIAL, ink: MIX.grey },
  { pts: ASHTRAY, ink: MIX.grey }, ...BUTTS.map((q) => ({ pts: q, ink: MIX.cream })),
  { pts: PAPER_L, ink: { y: 0.1, b: 0.04 } }, { pts: PAPER_R, ink: { y: 0.1, b: 0.04 } },
  { pts: PHOTO, ink: MIX.pink }, { pts: PROFILE, ink: { b: 0.8, p: 0.6, y: 0.3 } }, { pts: BOB, ink: { b: 0.5, p: 0.3 } }, { pts: MIC_STEM, ink: MIX.black }, { pts: MIC, ink: MIX.black },
  { pts: POOL, ink: { b: 0.2, p: 0.1 } }, { pts: GLASS, ink: { b: 0.08 } }, { pts: WATER, ink: { b: 0.25, p: 0.05 } },
];
// the body text of the paper, in columns: the photograph's column narrower
const col = (x0: number, x1: number, y0: number, y1: number, skew: number, gap = 12): Key[] => Array.from({ length: Math.floor((y1 - y0) / gap) }, (_, i) => { const y = y0 + i * gap; return stroke([[x0, y + skew * (x0 - 520)], [x1 - (i % 7 === 6 ? (x1 - x0) * 0.4 : 0), y + skew * (x1 - 520)]], 1, 0.5); });
const keys: Key[] = [
  edge(WINDOW, 2.4), edge(FRAME, 2), edge(CAL, 1.8), edge(HAT, 1.6), edge(RAINCOAT, 1.6),
  edge(TOP, 2.2), edge(FRONT, 2.2, 0.9, [DRAWER_FRONT, DRAWER_IN]), edge(OTHER_DRAWER, 1.8), stroke([[1090, 840], [1130, 840]], 4),
  edge(DRAWER_IN, 1.8), edge(DRAWER_FRONT, 2), stroke([[475, 882], [515, 882]], 4), ...NOTES.map((q, i) => edge(q, 1.4, 0.9, NOTES.slice(i + 1))), ...NOTES.slice(-1).map((q) => edge(NOTE_OVAL(q), 1.2, 0.8)), ...NOTES.slice(-1).map((q) => edge(inset(q, 0.84), 1, 0.5)),
  edge(CAGE, 1.4, 0.8), ...BLADES.map((q) => edge(q, 1.2, 0.8)), ...[0, 1, 2].map((i) => edge(ring(FAN.x, FAN.y, 24 + i * 16, 24 + i * 16, 22), 0.9, 0.35)),
  edge(TYPEWRITER, 1.8), ...[[1270, 555], [1316, 555], [1362, 555], [1408, 555]].map(([x, y]) => stroke([[x, y], [x + 28, y]], 3)), edge(HANDSET, 1.6), edge(ASHTRAY, 1.2, 0.8),
  edge(PAPER_L, 1.6), edge(PAPER_R, 1.6), stroke([[800, 486], [812, 720]], 1.2, 0.6),
  ...col(530, 650, 560, 720, -0.05), ...col(664, 790, 560, 720, -0.05), ...col(826, 858, 586, 704, 0.043), ...col(996, 1082, 586, 704, 0.043),
  edge(PHOTO, 1.4), edge(PROFILE, 1, 0.5),
  edge(GLASS, 1.4, 0.9), stroke([[1150, 610], [1200, 610]], 1.8),
];

// ---------------------------------------------------------------- what moves
// clip a shape by a convex one (Sutherland-Hodgman): the blind's bars only fall on the desk top
const clip = (subject: P[], by: P[]): P[] => {
  let out = subject;
  for (let i = 0; i < by.length && out.length; i++) {
    const a = by[i], b = by[(i + 1) % by.length], side = (p: P) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]), inp = out; out = [];
    inp.forEach((p, j) => { const q = inp[(j + 1) % inp.length], sp = side(p), sq = side(q); if (sp >= 0) out.push(p); if (sp * sq < 0) { const k = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k]); } });
  }
  return out;
};
const bars = (shift: number): P[][] => Array.from({ length: 9 }, (_, i) => { const y = 380 + i * 58 + shift, k = 0.34; return clip([[0, y], [1600, y + 1600 * k], [1600, y + 1600 * k + 22], [0, y + 22]], TOP); }).filter((q) => q.length > 2);
// the fly: its path round the desk, walking in starts and stops
const flyAt = (t: number): P => { const p = t / LOOP, u = p * Math.PI * 2 + 0.35 * Math.sin(p * Math.PI * 12); return [790 + 330 * Math.cos(u) + 50 * Math.cos(3 * u), 640 + 90 * Math.sin(u) + 20 * Math.sin(2 * u)]; };
export const r12 = press({
  id: "r12", title: "La Photo", loop: LOOP, act3: ACT3, pieces, keys,
  extra: {
    b: (g) => {
      letter(g, "JUILLET", 670, 116, { cap: 18, color: INK.blue, seed: 3, align: "center", w: 2.4 }); letter(g, "1976", 670, 150, { cap: 26, color: INK.blue, seed: 4, align: "center", w: 3 });
      for (let i = 0; i < 20; i++) { const x = 620 + (i % 5) * 24, y = 196 + Math.floor(i / 5) * 11; g.pen([[x, y], [x + 10, y]], { w: 2, color: INK.blue, seed: 30 + i, wobble: 0.2, boil: 0, opacity: 0.7, retrace: false }); }
      letter(g, "FRANCE-SOIR", 530, 506, { cap: 11, color: INK.blue, seed: 11, w: 2 }); letter(g, "6", 780, 504, { cap: 11, color: INK.blue, seed: 14, w: 2 });
      letter(g, "FAITS DIVERS", 655, 530, { cap: 15, color: INK.blue, seed: 15, align: "center", w: 2.6 });
      letter(g, "UNE INCONNUE", 952, 506, { cap: 15, color: INK.blue, seed: 12, align: "center", w: 2.8 }); letter(g, "DANS LE CANAL", 954, 530, { cap: 15, color: INK.blue, seed: 13, align: "center", w: 2.8 });
      letter(g, "SAINT-MARTIN", 956, 554, { cap: 10, color: INK.blue, seed: 17, align: "center", w: 1.8 });
    },
    p: (g) => letter(g, "FLAMINGO", 928, 584, { cap: 7, color: INK.pink, seed: 16, align: "center", w: 1.2, opacity: 0.7 }),
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the blind's bars of shade on the desk, edging along as the blind sways on its cord
    overprint(g, bars(10 * Math.sin(TT) + 4 * Math.sin(TT * 3)).map((q) => ({ pts: q, ink: { b: 1, p: 1 } })), { act3: ACT3, alpha: 0.13 * reveal });
    // the fly: body, head, two wings, a shadow; still for a moment, then off again
    const [x, y] = flyAt(t), [x2, y2] = flyAt(t + 1), a = Math.atan2(y2 - y, x2 - x), c = Math.cos(a) * 1.5, s = Math.sin(a) * 1.5, R = (u: number, v: number): P => [x + u * c - v * s, y + u * s + v * c];
    const buzz = Math.sin(TT * 48) > 0.6 ? 1 : 0.6;
    overprint(g, [
      { pts: blob(x + 4, y + 7, 14, 6, 71, 0.02, 10, a), ink: { b: 0.3 * reveal, p: 0.2 * reveal } },
      { pts: [R(-8, -3), R(6, -4), R(9, 0), R(6, 4), R(-8, 3)], ink: { b: reveal, p: 0.9 * reveal, y: 0.6 * reveal } }, { pts: ring(...R(10, 0), 4.6, 4.6, 8), ink: { b: reveal, p: reveal } },
      { pts: [R(-2, -1), R(-12, -8 * buzz), R(-6, -9 * buzz)], ink: { b: 0.35 * reveal } }, { pts: [R(-2, 1), R(-12, 8 * buzz), R(-6, 9 * buzz)], ink: { b: 0.35 * reveal } },
    ], { act3: ACT3 });
    // a drop gathering at the rim of the glass and running down its side, once a loop
    const p = t / LOOP, dy = p < 0.4 ? 0 : Math.min(1, (p - 0.4) / 0.5) ** 2, r = 3 + 1.6 * Math.min(1, p / 0.4);
    const fade = Math.min(1, p / 0.1, (1 - p) / 0.08) * reveal; // it gathers out of nothing and is gone into the pool
    overprint(g, [{ pts: blob(1196 - dy * 3, 616 + dy * 80, r * 0.8, r, 81, 0.02, 10), ink: { b: 0.7 * fade, p: 0.3 * fade } }], { act3: ACT3 });
  },
});
