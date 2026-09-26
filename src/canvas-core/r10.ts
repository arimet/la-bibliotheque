// CANICULE PAGE 10 · LA UNE. One idea: the tape went to the paper, and in September she sings again.
// An ending, printed at dawn with the yellow drum back on the press. Two pictures on one sheet, as a
// poster puts them. On the left, a news kiosk at six in the morning, Libération hung on its front:
// UN COMMISSAIRE ET LE MEURTRE DE PIGALLE, Varenne's photograph under it. On the right, September at
// the Flamingo: the neon flamingo lit again on the wall, Momo behind the bar, Lili in her pink sequin
// dress singing into the microphone in the spotlight, looking to the back of the room, where you sit.
// What moves: the spotlight's beam shimmering and the dust in it, smoke drifting, the sequins, the
// neon flamingo buzzing.
import { rng, tube, type Gfx, type P } from "./core";
import { letter } from "./drafting";
import { blob, bounds, inside } from "./gallery";
import { figure } from "./figures";
import { INK, MIX, fromMotif, overprint, press, type Key, type Piece, type Sep } from "./press";
import { PLATINUM, bob, edge, inkPen, rect, ring, stroke } from "./r07";
import { seated } from "./r09";

const LOOP = 240;
const GUT = { x0: 684, x1: 708 }; // the gutter of bare paper between the two pictures

// ---------------------------------------------------------------- left: the kiosk at dawn
const L_SKY: P[] = rect(0, 0, GUT.x0, 900);
const ROOFS: P[] = [[0, 420], [70, 420], [70, 360], [180, 360], [180, 400], [300, 400], [300, 340], [420, 340], [420, 390], [560, 390], [560, 350], [GUT.x0, 350], [GUT.x0, 900], [0, 900]];
const KIOSK: P[] = rect(70, 250, 620, 820), KIOSK_ROOF: P[] = [[40, 250], [650, 250], [610, 196], [80, 196]], CREST: P[] = [[250, 196], [440, 196], [420, 150], [345, 130], [270, 150]];
const COUNTER: P[] = rect(50, 740, 640, 780), PAVE: P[] = rect(0, 800, GUT.x0, 900);
const SHEET = { x0: 120, x1: 570, y0: 290, y1: 730 };
const PAGE: P[] = rect(SHEET.x0, SHEET.y0, SHEET.x1, SHEET.y1);
const MAST: P[] = rect(SHEET.x0 + 14, SHEET.y0 + 14, SHEET.x1 - 14, SHEET.y0 + 64);
const PHOTO: P[] = rect(SHEET.x0 + 20, 548, SHEET.x0 + 190, 712);
const PHOTO_MAN: P[] = [[PHOTO[0][0] + 16, 712], [PHOTO[0][0] + 30, 660], [PHOTO[0][0] + 66, 644], [PHOTO[0][0] + 104, 644], [PHOTO[0][0] + 140, 660], [PHOTO[0][0] + 154, 712]];
const PHOTO_HEAD: P[] = blob(PHOTO[0][0] + 85, 610, 34, 38, 44, 0.05, 14);
const SIDE_PAPERS: P[][] = [rect(84, 300, 112, 720), rect(578, 300, 606, 720)];

// ---------------------------------------------------------------- right: the Flamingo in September
const R_ROOM: P[] = rect(GUT.x1, 0, 1600, 900);
const STAGE: P[] = rect(1120, 770, 1600, 900), STAGE_LIP: P[] = rect(1120, 770, 1600, 790);
const CURTAIN: P[] = [[1300, 0], [1600, 0], [1600, 770], [1470, 770]];
const FOLDS: P[][] = [0, 1, 2, 3].map((i) => { const x = 1330 + i * 70; return [[x, 0], [x + 20, 0], [x + 50 + i * 12, 770], [x + 28 + i * 12, 770]] as P[]; });
const BAR: P[] = rect(GUT.x1, 560, 880, 900), BAR_TOP: P[] = rect(GUT.x1, 548, 894, 566);
const SHELF: P[] = rect(GUT.x1, 380, 880, 392), BOTTLES: P[][] = Array.from({ length: 5 }, (_, i) => rect(726 + i * 30, 330 - (i % 2) * 14, 742 + i * 30, 380));
// the spotlight, from high over the room onto the stage
const SPOT_SRC: P = [1150, -40];
const POOL: P[] = ring(1310, 820, 150, 34, 22);
const BEAM: P[] = [[SPOT_SRC[0] - 20, SPOT_SRC[1]], [SPOT_SRC[0] + 30, SPOT_SRC[1]], [1470, 820], [1170, 836]];
// the neon flamingo on the back wall, on one leg
const FL = { x: 960, y: 300 }, fl = (pts: number[][]): P[] => pts.map(([u, v]) => [FL.x + u, FL.y + v]);
const FLAMINGO: P[][] = [
  fl([[-70, 0], [-40, -24], [10, -30], [50, -18], [62, 0], [40, 18], [0, 24], [-40, 16], [-70, 0]]), // the body, its tail to the left
  fl([[50, -18], [72, -50], [62, -92], [36, -122], [40, -152], [62, -162], [82, -152]]), // the neck in an S
  fl([[82, -152], [98, -140], [92, -120]]), // the bent beak
  fl([[12, 24], [14, 130], [38, 132]]), fl([[0, 22], [-22, 70], [8, 76]]), // one leg down, one folded
];
// you, at a table at the back, a small lamp on it
const DET = seated({ x: 944, h: 270, f: 1, seat: 690, floor: 760, head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "#3a2a1e", skin: "skin", gold: "#b8321f", ink: "#000", near: [0.7, 1.55], far: [0.4, 1.3] });
const TABLE_TOP: P[] = ring(1040, 654, 44, 10, 16), TABLE_LEG: P[] = rect(1037, 654, 1043, 760), TABLE_FOOT: P[] = ring(1040, 760, 20, 5, 10);
const LAMP_SHADE: P[] = [[1026, 616], [1054, 616], [1062, 640], [1018, 640]], LAMP_STEM: P[] = rect(1038, 640, 1042, 652);
// Momo behind the bar: bald, white shirt, black bow tie
const MOMO = figure({ x: 790, g: 740, h: 300, f: 1, robe: "suit", head: "bare", cloth: "#f2eee4", cloth2: "navy", hair: "skin", skin: "skin", gold: "#1a1a1a", ink: "#000", near: [0.6, 1.4], far: [0.4, 1.2], lite: true });
const BOW: P[] = (() => { const [x, y] = MOMO.head; return [[x - 12, y + 30], [x - 12, y + 44], [x, y + 38], [x + 12, y + 44], [x + 12, y + 30], [x, y + 36]]; })();
// Lili singing, looking to the back of the room
const LILI_K = { x: 1320, g: 820, h: 400, f: -1 as const };
const LILI = figure({ ...LILI_K, robe: "dress", head: "bare", cloth: "pink", hair: PLATINUM, skin: "skin", ink: "#000", near: [0.35, 2.55], far: [0.5, 0.9] });
const BOB = bob(LILI, LILI_K.h, -1);
const MIC_AT: P = [LILI.hands.near[0] - 6, LILI.hands.near[1] - 14];
const MIC: P[] = blob(MIC_AT[0], MIC_AT[1], 7, 10, 3, 0.02, 10), STAND: P[] = rect(MIC_AT[0] - 2, MIC_AT[1] + 20, MIC_AT[0] + 2, 818), STAND_FOOT: P[] = ring(MIC_AT[0], 818, 26, 5, 10);

// ---------------------------------------------------------------- the print
// the neon lights the wall round it: the room's own ink thinning toward the tubes, so no edge shows
const nglow = (x: number, y: number) => Math.exp(-(((x - FL.x - 10) / 120) ** 2) - (((y - FL.y + 30) / 140) ** 2));
const det = DET, momo = fromMotif(MOMO.m), lili = fromMotif(LILI.m);
const DRESS = lili.pieces.filter((pc) => pc.ink === MIX.pink).map((pc) => pc.pts).sort((a, b) => { const A = bounds(a), B = bounds(b); return (B.x1 - B.x0) * (B.y1 - B.y0) - (A.x1 - A.x0) * (A.y1 - A.y0); })[0];
const SEQUINS: P[] = (() => { const r = rng(77), b = bounds(DRESS), out: P[] = []; for (let i = 0; i < 400 && out.length < 60; i++) { const x = b.x0 + r() * (b.x1 - b.x0), y = b.y0 + r() * (b.y1 - b.y0); if (inside(DRESS, x, y)) out.push([x, y]); } return out; })();
const dawn: Sep = { y: (_x, y) => 0.25 + 0.6 * (y / 900), p: (_x, y) => 0.45 - 0.3 * (y / 900) };
const pieces: Piece[] = [
  { pts: L_SKY, ink: dawn }, { pts: ROOFS, ink: { p: 0.5, b: 0.35, y: 0.2 } },
  { pts: KIOSK_ROOF, ink: MIX.green }, { pts: CREST, ink: MIX.green }, { pts: KIOSK, ink: { y: 0.9, b: 0.7, p: 0.15 } }, ...SIDE_PAPERS.map((q) => ({ pts: q, ink: MIX.cream })),
  { pts: PAGE, ink: { y: 0.06 } }, { pts: PHOTO, ink: { b: 0.4, p: 0.2, y: 0.2 } }, { pts: PHOTO_MAN, ink: { b: 0.75, p: 0.5, y: 0.4 } }, { pts: PHOTO_HEAD, ink: { b: 0.55, p: 0.4, y: 0.4 } },
  { pts: COUNTER, ink: MIX.green }, { pts: PAVE, ink: { p: 0.3, b: 0.35, y: 0.3 } },
  // the club
  { pts: R_ROOM, ink: { b: (x) => 0.85 - 0.2 * Math.max(0, (x - 1100) / 500), p: 0.6, y: 0.15 } },
  { pts: blob(FL.x + 10, FL.y - 30, 190, 210, 71, 0.08, 18), ink: { p: (x, y) => 0.6 - 0.15 * nglow(x, y), b: (x, y) => 0.85 - 0.7 * nglow(x, y), y: 0.15 } }, // the neon's glow on the wall
  { pts: CURTAIN, ink: { p: 0.85, y: 0.5, b: 0.3 } }, ...FOLDS.map((q) => ({ pts: q, ink: { p: 0.9, y: 0.6, b: 0.55 } as Sep })),
  { pts: SHELF, ink: MIX.brown }, ...BOTTLES.map((q, i) => ({ pts: q, ink: i % 2 ? MIX.green : MIX.orange })),
  ...FLAMINGO.map((q) => ({ pts: tube(q, 5, 5, false), ink: { p: 0.5, y: 0.4 } as Sep })),
  ...momo.pieces, { pts: BOW, ink: MIX.black }, { pts: BAR, ink: { y: 0.8, p: 0.7, b: 0.5 } }, { pts: BAR_TOP, ink: MIX.brown },
  ...det.legs, ...det.pieces,
  { pts: TABLE_LEG, ink: MIX.black }, { pts: TABLE_FOOT, ink: MIX.black }, { pts: TABLE_TOP, ink: { b: 0.5, p: 0.4, y: 0.3 } }, { pts: LAMP_STEM, ink: MIX.black }, { pts: LAMP_SHADE, ink: { p: 0.9, y: 0.8 } },
  { pts: STAGE, ink: { y: 0.7, p: 0.65, b: 0.45 } }, { pts: STAGE_LIP, ink: MIX.brown },
  { pts: BEAM, ink: { y: (x, y) => 0.25 + 0.3 * (y / 900), p: 0.05 } }, { pts: POOL, ink: { y: 0.4, p: 0.1 } },
  { pts: STAND_FOOT, ink: MIX.black }, { pts: STAND, ink: MIX.black },
  { pts: BOB, ink: { y: 0.3, p: 0.08 } }, ...lili.pieces, { pts: MIC, ink: MIX.black },
];
const keys: Key[] = [
  edge(KIOSK, 2), edge(KIOSK_ROOF, 2), edge(CREST, 1.6), edge(PAGE, 2), edge(PHOTO, 1.6), edge(COUNTER, 1.8), ...SIDE_PAPERS.map((q) => edge(q, 1.4)),
  stroke([[SHEET.x0 + 14, SHEET.y0 + 72], [SHEET.x1 - 14, SHEET.y0 + 72]], 2.4), stroke([[SHEET.x0 + 14, SHEET.y0 + 250], [SHEET.x1 - 14, SHEET.y0 + 250]], 1.4), stroke([[SHEET.x0 + 14, SHEET.y0 + 212], [SHEET.x1 - 14, SHEET.y0 + 212]], 1),
  // the body text in columns beside the photograph
  ...Array.from({ length: 22 }, (_, i) => { const col = i < 11 ? 0 : 1, row = i % 11, x0 = SHEET.x0 + 208 + col * 122; return stroke([[x0, 556 + row * 15], [x0 + (row === 10 ? 60 : 108), 556 + row * 15]], 1.2, 0.6); }),
  ...[90, 190, 300, 420, 520, 620].map((x) => stroke([[x, 250], [x - 6, 200]], 1.2, 0.5)), // ribs of the roof
  ...momo.keys, edge(BAR, 1.8, 0.8), edge(SHELF, 1.2, 0.6),
  ...det.keys, ...det.legKeys, edge(TABLE_TOP, 1.2, 0.8),
  stroke([[1120, 770], [1600, 770]], 2, 0.9, [BOB, ...lili.pieces.map((p) => p.pts)]),
  ...FOLDS.map((q) => stroke([q[0], q[3]], 1.2, 0.6, [...lili.pieces.map((p) => p.pts)])),
  edge(BOB, 1.6, 0.9, lili.pieces.map((p) => p.pts)), ...lili.keys, edge(MIC, 1.2),
];
const HEADLINE = ["UN COMMISSAIRE", "ET LE MEURTRE", "DE PIGALLE"];
const headline = (g: Gfx, color: string, w: number, op: number) => HEADLINE.forEach((l, i) => letter(g, l, (SHEET.x0 + SHEET.x1) / 2, SHEET.y0 + 84 + i * 46, { cap: 34, color, seed: 40 + i, align: "center", w, opacity: op }));
const flamingo = (g: Gfx, color: string, w: number, op: number) => FLAMINGO.forEach((q, i) => g.pen(q, { w, color, seed: 80 + i, wobble: 0.2, boil: 0, taper: 1, opacity: op, retrace: false }));

// ---------------------------------------------------------------- what moves
const flick = (t: number) => { const k = Math.floor(t / 4) % 60; return k === 7 || k === 33 || k === 34 ? 1 : 0; };
export const r10 = press({
  id: "r10", title: "La Une", loop: LOOP, pieces, keys,
  extra: {
    // the masthead, the headline in a heavy black (blue over pink), the neon tubes lit
    b: (g) => { letter(g, "LIBERATION", (SHEET.x0 + SHEET.x1) / 2, SHEET.y0 + 22, { cap: 34, color: INK.blue, seed: 30, align: "center", w: 6 }); g.pen([[282, SHEET.y0 + 16], [292, SHEET.y0 + 8]], { w: 3, color: INK.blue, seed: 31, wobble: 0.1, boil: 0, taper: 1, opacity: 0.95, retrace: false }); headline(g, INK.blue, 6.5, 0.95); letter(g, "LE FLAMINGO", 800, 460, { cap: 12, color: INK.blue, seed: 33, align: "center", w: 1.6, opacity: 0.4 }); },
    p: (g) => { headline(g, INK.pink, 5, 0.8); letter(g, "LA BANDE DE ROCCO", (SHEET.x0 + SHEET.x1) / 2, SHEET.y0 + 226, { cap: 16, color: INK.pink, seed: 34, align: "center", w: 2.6 }); },
    // the sequins: a scatter of yellow on the pink
    y: (g) => SEQUINS.forEach(([x, y], i) => g.pen([[x - 2, y], [x + 2, y + 1]], { w: 2.6, color: INK.yellow, seed: 300 + i, wobble: 0, boil: 0, taper: 1, opacity: 0.9, retrace: false })),
  },
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the beam never quite steady; dust turning in it
    overprint(g, [{ pts: BEAM, ink: { y: 1 } }], { alpha: (0.07 + 0.05 * Math.sin(TT * 6) * Math.sin(TT * 4 + 1)) * reveal });
    const motes: Piece[] = Array.from({ length: 14 }, (_, i) => { const u = (i * 0.618) % 1, v = ((i * 0.37 + t / LOOP) % 1), x = SPOT_SRC[0] + (1320 - SPOT_SRC[0]) * v + (u - 0.5) * 200 * v + Math.sin(TT * 2 + i) * 8, y = SPOT_SRC[1] + (820 - SPOT_SRC[1]) * v; return { pts: ring(x, y, 2.6, 2.6, 6), ink: { y: reveal } }; });
    overprint(g, motes);
    // smoke drifting across the room, slowly, through the light
    overprint(g, [0, 1].map((k) => { const p = ((t / LOOP) + k * 0.5) % 1, x = 760 + p * 760, y = 520 - 60 * Math.sin(p * Math.PI * 2 + k) - 40 * k; return { pts: blob(x, y, 90, 26, 60 + k, 0.35, 14, 0.1), ink: { b: 0.22 * Math.sin(p * Math.PI) * reveal, p: 0.1 * Math.sin(p * Math.PI) * reveal } }; }));
    // the sequins catching the light, a few at a time
    const sq: Piece[] = [];
    SEQUINS.forEach(([x, y], i) => { if (Math.sin(TT * 8 + i * 2.4) < 0.8) return; sq.push({ pts: [[x, y - 7], [x + 2, y - 1], [x + 7, y], [x + 2, y + 1], [x, y + 7], [x - 2, y + 1], [x - 7, y], [x - 2, y - 1]], ink: { y: reveal } }); });
    overprint(g, sq);
    // the neon flamingo drops out now and then, a blink
    if (flick(t)) overprint(g, [{ pts: blob(FL.x + 10, FL.y - 30, 110, 150, 72, 0.05, 16), ink: { b: 1 } }], { alpha: 0.5 * reveal });
    inkPen(g, "p", (ink) => flamingo(g, ink, 2, 0.35 * (0.5 + 0.5 * Math.sin(TT * 30)) * reveal));
  },
});
