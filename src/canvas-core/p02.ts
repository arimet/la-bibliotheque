// PAGE 2 · LE SALOON. One idea: the saloon has gone quiet for you, and the only warm thing in it is
// the lantern an old man is pushing across the table toward you.
// Focal subject: the hurricane lantern on the near table, the prospector's hand on it, his beard lit
// from below while his hat keeps his eyes. One light: the lantern (a hanging oil lamp over the bar
// is a weak second); the room falls off into warm umber dark, his shadow looms on the right wall.
// Mae, small behind the bar, wipes a glass; the piano at the back is shut up, its stool empty; the
// window at the end still holds the violet dusk of page 1.
// What moves: the lantern flame and its glow, the hanging lamp swaying, Mae's cloth going round the
// glass, pipe smoke curling up, dust motes turning in the light.
import { type P, rng } from "./core";
import { blob, fillShape, mix } from "./gallery";
import { SEPIA, masked, page, perspective, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { paper: PAPER, ink: INK, ochre: OCHRE, umber: UMBER, sienna: SIENNA, dark: DARK, shade: SHADE, dusk: DUSK, rose: ROSE, glow: GLOW, lamp: LAMP } = SEPIA;
const SMOKE = "#efe4cf", MOTE = "#fff4d6";

// ---------------------------------------------------------------- the room, as geometry
// eye 1.6 m up (470), ~294 units a metre, depth unit 1000 ≈ 3.4 m
const VP: P = [780, 430];
const { G, U, wallQuad } = perspective(VP);
const LW = -900, RW = 900, BACK = 3.6, CEIL = 940;
let sd = 1; // seeds, handed out in the order the marks are made
const s = (pts: P[], w: number, op = 0.9, wob = 0.7, color?: string): Omit<Stroke, "at"> => ({ pts, w, seed: sd++, op, wob, color });
const edges = (pts: P[], w: number, op = 0.9, closed = true) => pts.slice(0, closed ? pts.length : -1).map((a, i) => s([a, pts[(i + 1) % pts.length]], w * (i % 2 ? 0.8 : 1), op, 0.4));
// a quad facing the reader (on a plane of constant depth)
const faceQuad = (u0: number, u1: number, h0: number, h1: number, z: number): P[] => [U(u0, z, h0), U(u0, z, h1), U(u1, z, h1), U(u1, z, h0)];
// a horizontal circle in perspective: a table top, a stool seat
const circ = (u: number, z: number, h: number, R: number, a0: number, a1: number, n = 36): P[] => Array.from({ length: n }, (_, i) => { const a = a0 + ((a1 - a0) * i) / (n - 1); return U(u + R * Math.cos(a), z + (R / 1000) * Math.sin(a), h); });

const BW = faceQuad(LW, RW, 0, CEIL, BACK); // back wall: floor-left, ceil-left, ceil-right, floor-right
const cL = (x: number) => 430 - (470 * (780 - x)) / 900, fL = (x: number) => 430 + (470 * (780 - x)) / 900; // left wall's ceiling and floor edges
const cR = (x: number) => 430 - (470 * (x - 780)) / 900, fR = (x: number) => 430 + (470 * (x - 780)) / 900;
const CEILING: P[] = [[-40, -40], [1640, -40], [1640, cR(1640)], BW[2], BW[1], [-40, cL(-40)]];
const LEFTWALL: P[] = [[-40, cL(-40)], BW[1], BW[0], [-40, fL(-40)]];
const RIGHTWALL: P[] = [[1640, cR(1640)], BW[2], BW[3], [1640, fR(1640)]];
const FLOOR: P[] = [[-40, fL(-40)], BW[0], BW[3], [1640, fR(1640)], [1640, 940], [-40, 940]];
const WIN = faceQuad(-250, 30, 360, 760, BACK);
const BEAMS = [1.2, 1.7, 2.3, 3.0];
const beamFace = (z: number): P[] => [U(LW, z, 870), U(RW, z, 870), U(RW, z, CEIL), U(LW, z, CEIL)];

// the bar along the left: front face at u -520, top 1.05 m, from z 1.3 to 3.4
const CU = -520, CB = -700, CH = 309, CZ0 = 1.3, CZ1 = 3.4;
const COUNTER: P[] = [U(CB, CZ0, CH), U(CB, CZ1, CH), U(CU, CZ1, CH), G(CU, CZ1), G(CU, CZ0), G(CB, CZ0)];
const barFront = wallQuad(CU, CZ0, CZ1, 0, CH), barTop: P[] = [U(CB, CZ0, CH), U(CB, CZ1, CH), U(CU, CZ1, CH), U(CU, CZ0, CH)], barEnd = faceQuad(CB, CU, 0, CH, CZ0);
// the back-bar on the left wall: two bays of bottles either side of a mirror
const BAYS = [1.55, 2.1, 2.7, 3.35], BB0 = 330, BB1 = 860;

// the piano, shut up against the back wall, and its empty stool
const PZ = 3.42, PU0 = 150, PU1 = 540, PH = 400;
const piano = faceQuad(PU0, PU1, 0, PH, PZ), keys = faceQuad(PU0 + 20, PU1 - 20, 226, 246, PZ - 0.1), sheet = faceQuad(290, 400, 290, 360, PZ);
const STOOL: P[] = [[878, 527], [912, 527], [914, 538], [901, 584], [889, 584], [876, 538]];
// a table in the middle of the room, nobody at it, and a chair
const MT = { u: -200, z: 2.4, h: 220, R: 130 };
const midTop = circ(MT.u, MT.z, MT.h, MT.R, 0, Math.PI * 2, 30), midPed: P[] = [[689, 541], [705, 541], [724, 633], [670, 633]];

// ---------------------------------------------------------------- the near table and the lantern
const T = { u: 150, z: 0.85, h: 220, R: 150, th: 16 };
const tFar = circ(T.u, T.z, T.h, T.R, 0, Math.PI, 40), tNear = circ(T.u, T.z, T.h, T.R, Math.PI, Math.PI * 2, 40), tBand = circ(T.u, T.z, T.h - T.th, T.R, Math.PI, Math.PI * 2, 40);
const TABLE_TOP: P[] = [...tNear, ...tFar];
const RIM_BAND: P[] = [...tNear, ...[...tBand].reverse()];
const UNDER: P[] = [[776, 736], ...tBand, [1136, 750], [1150, 800], [1260, 905], [680, 905], [740, 820]];

// the hurricane lantern, dented, standing on the table at u 100, z 0.8 (screen coords, drawn by hand)
const LAN = { x: 905, base: 742, flame: [905, 688] as P };
const LANTERN: P[] = [[871, 746], [870, 716], [868, 650], [884, 640], [895, 628], [900, 620], [910, 620], [915, 628], [926, 640], [942, 650], [940, 716], [939, 746], [905, 752]];
const TANK: P[] = [[873, 742], [875, 716], [890, 711], [920, 711], [935, 716], [937, 742], [905, 749]];
const GLOBE: P[] = [[890, 707], [881, 695], [877, 679], [881, 661], [890, 649], [920, 649], [930, 661], [934, 679], [930, 695], [920, 707]];
const CAP: P[] = [[889, 647], [895, 630], [899, 623], [911, 623], [915, 630], [921, 647], [905, 651]];

// ---------------------------------------------------------------- the prospector, by hand
// seated behind the table at u 330, z ~1.08, turned three-quarters toward the lantern
const CROWN: P[] = [[1054, 526], [1057, 502], [1066, 489], [1080, 486], [1092, 495], [1104, 487], [1120, 486], [1130, 495], [1134, 511], [1132, 526]];
const BRIM_NEAR: P[] = [[997, 547], [1020, 553], [1050, 558], [1086, 557], [1120, 550], [1152, 540], [1180, 527]];
const BRIM: P[] = [...BRIM_NEAR, [1162, 519], [1134, 515], [1054, 517], [1028, 525], [1008, 536]];
const HAT: P[] = [...CROWN.slice(0, -1), [1134, 516], [1162, 519], [1180, 527], ...[...BRIM_NEAR].reverse().slice(1), [1008, 536], [1028, 525]];
const FACE: P[] = [[1036, 552], [1122, 547], [1124, 577], [1110, 582], [1058, 580], [1042, 568]];
const NOSE_LIT: P[] = [[1047, 566], [1058, 559], [1062, 570], [1052, 575]];
const BEARD: P[] = [[1046, 576], [1040, 592], [1034, 612], [1036, 632], [1046, 648], [1060, 660], [1076, 664], [1090, 657], [1104, 643], [1116, 622], [1122, 600], [1121, 581], [1108, 577], [1080, 580]];
const UP_A: P[] = [[1030, 612], [1012, 640], [998, 670], [986, 695], [972, 711]], LO_A: P[] = [[1047, 650], [1042, 682], [1034, 710], [1010, 724], [978, 732]];
const ARM: P[] = [...UP_A, ...[...LO_A].reverse()];
const HAND: P[] = [[974, 711], [962, 707], [948, 709], [938, 714], [931, 721], [929, 730], [932, 739], [944, 743], [960, 741], [978, 733]];
const COAT: P[] = [[1030, 612], [1044, 604], [1070, 602], [1140, 604], [1160, 612], [1174, 628], [1180, 680], [1183, 760], [1178, 830], [1134, 832], [1133, 724], [1103, 707], [1060, 694], [1047, 690], [1047, 650]];
const BACKSIDE: P[] = [[1118, 612], [1140, 604], [1160, 612], [1174, 628], [1180, 680], [1183, 760], [1178, 830], [1140, 830], [1134, 724], [1124, 705], [1110, 650]];
const PIPE_BOWL: P = [1019, 585];
// the far rim, left to right, cut where the lantern and the arm stand on it
const farLR = [...tFar].reverse();
// everything in the foreground as ONE outline (hide shapes must not overlap: they are even-odd)
const FG: P[] = [
  ...farLR.filter((p) => p[0] < 868), ...LANTERN.filter((p) => p[1] < 684), ...farLR.filter((p) => p[0] > 944 && p[0] < 990),
  [998, 670], [1012, 640], [1030, 612], [1034, 606], [1028, 604], [1009, 604], [1007, 585], [1030, 586], [1040, 588], [1044, 572], [1036, 556], [995, 549], [1000, 540],
  [1028, 525], [1054, 520], ...CROWN.slice(1, -1), [1134, 515], [1162, 519], [1183, 528], [1165, 540], [1130, 552], [1124, 578], [1124, 600], [1140, 604], [1160, 612], [1175, 628], [1181, 680], [1184, 760], [1188, 905], [765, 905], [779, 724],
];
// Mae stands at u -790, z 2.2; drawn by hand around her head, then scaled into place
const MK = 1.14, MA: P = [421, 437];
const M = (x: number, y: number): P => [MA[0] + (x - 466) * MK, MA[1] + (y - 437) * MK];
const mp = (pts: number[][]): P[] => pts.map(([x, y]) => M(x, y));
const barBack = (x: number) => 430 + (161 * (780 - x)) / 700; // the counter's back edge, which cuts her off
const MAE: P[] = mp([[449, 424], [455, 419], [466, 420], [474, 423], [479, 430], [481, 438], [478, 443], [476, 448], [473, 452], [485, 457], [492, 465], [496, 477], [499, 478], [498, 469], [503, 466], [511, 468], [511, 486], [500, 489], [490, 490], [470, 496], [440, 512], [438, 472], [446, 460], [459, 454], [455, 448], [450, 440], [447, 431]])
  .map(([x, y]) => [x, Math.min(y, barBack(x) - 1.5)] as P);
const BG = [COUNTER, FG, midPed, MAE]; // what stands in front of the room's lines

// the prospector's shadow thrown by the flame onto the right wall
const LIGHT = { u: 100, z: 800, h: 270 };
const onWall = ([x, y]: P): P => { const u = (x - 780) * 1.08, h = 470 - (y - 430) * 1.08, k = (RW - LIGHT.u) / Math.max(40, u - LIGHT.u); return U(RW, (LIGHT.z + k * (1080 - LIGHT.z)) / 1000, LIGHT.h + k * (h - LIGHT.h)); };
const SHADOW: P[] = ([[1070, 604], ...CROWN.slice(1, -1), [1134, 515], [1162, 519], [1180, 527], [1152, 540], [1124, 552], [1124, 600], [1160, 612], [1175, 628], [1180, 657], [1080, 657]] as P[]).map(onWall);

// ---------------------------------------------------------------- the pen, in the order a hand draws it
const r0 = rng(40);
const planks = [-800, -690, -580, -470, -360, -250, -140, -30, 80, 190, 300, 410, 520, 630, 740, 850].map((u) => s([G(u, 0.93), G(u + (r0() - 0.5) * 30, 2), G(u, BACK)], 1.1, 0.4 + r0() * 0.2, 0.5));
const bottles = (() => {
  const r = rng(77), out: Omit<Stroke, "at">[] = [];
  [[BAYS[0], BAYS[1]], [BAYS[2], BAYS[3]]].forEach(([z0, z1]) => [BB0, 480, 620, 760].forEach((h) => {
    for (let z = z0 + 0.03 + r() * 0.03; z < z1 - 0.03; z += 0.05 + r() * 0.06) {
      if (r() < 0.18) continue; // a gap on the shelf
      const hb = 60 + r() * 45, w = 10 + r() * 6, bu = -885, b = (dh: number, du: number) => U(bu + du, z, h + dh);
      out.push(s([b(3, -w), b(hb * 0.6, -w), b(hb * 0.72, -w * 0.3), b(hb, -w * 0.3), b(hb, w * 0.3), b(hb * 0.72, w * 0.3), b(hb * 0.6, w), b(3, w)], 1.2 / z * 1.6, 0.75, 0.3));
      if (r() < 0.5) out.push(s([b(hb * 0.15, w * 0.4), b(hb * 0.5, w * 0.4)], 1.4 / z * 1.6, 0.8, 0.2, PAPER));
    }
  }));
  return out;
})();
const beamLines = BEAMS.flatMap((z, i) => [s([U(LW, z, 870), U(RW, z, 870)], 2.4 - i * 0.4, 0.9, 0.5), s([U(LW, z, CEIL), U(RW, z, CEIL)], 1, 0.5, 0.5), s([U(LW, z + 0.08, 870), U(RW, z + 0.08, 870)], 0.8, 0.4, 0.5)]);
const midRim = circ(MT.u, MT.z, MT.h, MT.R, Math.PI, Math.PI * 2, 18);

const strokes: Stroke[] = [
  // 1. the box of the room: the back wall and the four long edges running to it
  ...seq([...edges(BW, 2, 0.9), s([[-40, cL(-40)], BW[1]], 2.2, 0.85), s([[1640, cR(1640)], BW[2]], 2.2, 0.85), s([[-40, fL(-40)], BW[0]], 2.4, 0.85), s([[1640, fR(1640)], BW[3]], 2.4, 0.85)], 0, 14, 0.35, BG),
  // 2. the big shapes up front: the table, the lantern, the old man
  ...seq([s(farLR, 2.2, 0.9, 0.5)], 6, 14, 0.3, [LANTERN, ARM, HAND]),
  ...seq([s(tNear, 3.4, 0.95, 0.5), s(tBand.slice(4, -4), 2.2, 0.8, 0.5), s([[942, 810], [939, 905]], 3.4, 0.95), s([[974, 810], [979, 905]], 4, 0.95), s([[948, 812], [946, 905]], 1, 0.5)], 10, 22),
  ...seq([
    s([TANK[0], TANK[1]], 2.6, 0.95, 0.3), { ...s([TANK[5], TANK[4]], 3, 0.95, 0.3), hide: [HAND] }, s([[873, 742], [890, 748], [920, 748], [937, 742]], 2.6, 0.95, 0.3), s([[875, 716], [890, 721], [920, 721], [935, 716]], 1.6, 0.8, 0.3),
    s([[890, 707], [881, 695], [877, 679], [881, 661], [890, 649]], 1.2, 0.8, 0.3), s([[920, 707], [930, 695], [934, 679], [930, 661], [920, 649]], 1.8, 0.9, 0.3),
    s([[877, 716], [871, 690], [869, 652], [876, 644], [889, 640]], 2.4, 0.95, 0.3), s([[933, 716], [939, 690], [941, 652], [934, 644], [921, 640]], 2.8, 0.95, 0.3),
    ...edges([CAP[0], CAP[1], CAP[2], CAP[3], CAP[4], CAP[5]], 1.8, 0.9, false),
  ], 12, 30),
  // the lantern's tin, laid in with the pen: a dark cap, the tank in two soft bands, hatching on its far side
  ...seq([s([[893, 645], [897, 632], [905, 628], [913, 632], [917, 645]], 4.6, 0.85, 0.2, DARK), s([[878, 727], [905, 729], [932, 727]], 8, 0.5, 0.2, UMBER), s([[878, 739], [905, 742], [932, 739]], 7, 0.6, 0.2, mix(UMBER, DARK, 0.5)),
    ...[918, 923, 928, 932].map((x) => s([[x, 721], [x + 1, 744]], 0.9, 0.7, 0.2)), s([[886, 718], [924, 718]], 2.2, 0.6, 0.2, UMBER)], 64, 80, 0.3, [HAND]),
  ...seq([
    s(CROWN, 2.6, 0.95, 0.5), s(BRIM_NEAR, 3.2, 0.95, 0.5), s([[997, 547], [1006, 538], [1028, 527], [1052, 521]], 1.6, 0.85, 0.5), s([[1134, 516], [1162, 519], [1180, 527]], 1.4, 0.8, 0.5),
    s([[1140, 604], [1160, 612], [1174, 628], [1180, 680], [1183, 760], [1178, 830]], 3, 0.9, 0.6), s([[1122, 596], [1140, 604]], 2, 0.85),
    s([[1121, 581], [1122, 600], [1116, 622], [1104, 643], [1090, 657], [1076, 664], [1062, 660]], 1.6, 0.85, 0.6), // the beard's shaded side; the lit side is left open
  ], 16, 40, 0.35, [TABLE_TOP]),
  ...seq([s(UP_A, 2.6, 0.95, 0.5), s(LO_A, 2.2, 0.9, 0.5), s([[972, 711], [978, 732]], 2.2, 0.9, 0.3)], 30, 40, 0.3, [BEARD]),
  // 3. the room's furniture, big to small
  ...seq([s([U(CU, CZ0, CH), U(CU, CZ1, CH)], 2.8, 0.95), s([U(CB, CZ0, CH), U(CB, CZ1, CH)], 1.6, 0.8), s([G(CU, CZ0), G(CU, CZ1)], 2.6, 0.9), ...edges(barEnd, 2.8, 0.95, false), s([barEnd[3], barEnd[0]], 2.4, 0.9), s([U(CU, CZ1, 0), U(CU, CZ1, CH)], 1.4, 0.8)], 20, 34),
  ...seq([...BAYS.map((z) => s([U(LW, z, BB0 - 10), U(LW, z, BB1)], 1.6, 0.85, 0.4)), s([U(LW, BAYS[0], BB1), U(LW, BAYS[3], BB1)], 2, 0.9, 0.4), s([U(LW, BAYS[0], BB1 + 50), U(LW, BAYS[3], BB1 + 50)], 1.4, 0.7, 0.4), s([U(LW, BAYS[0], BB0), U(LW, BAYS[3], BB0)], 1.8, 0.85, 0.4),
    ...[480, 620, 760].flatMap((h) => [s([U(LW, BAYS[0], h), U(LW, BAYS[1], h)], 1.2, 0.8, 0.3), s([U(LW, BAYS[2], h), U(LW, BAYS[3], h)], 1.1, 0.8, 0.3)]),
    ...edges(wallQuad(LW, BAYS[1] + 0.06, BAYS[2] - 0.06, 400, 800), 1.3, 0.85),
    s([U(LW, 2.2, 520), U(LW, 2.34, 760)], 2.2, 0.35, 0.3, PAPER), s([U(LW, 2.3, 470), U(LW, 2.44, 700)], 1.2, 0.3, 0.3, PAPER)], 24, 42, 0.35, [COUNTER, MAE]), // the mirror's shine
  ...seq(beamLines, 22, 38, 0.3, [FG]),
  ...seq([-690, -330, 30, 390, 750].map((u) => s([U(u, 1.0, CEIL), U(u, BACK, CEIL)], 0.9, 0.3, 0.4)), 40, 56, 0.4, BEAMS.map(beamFace)),
  ...seq([s([[72, -10], [70, 905]], 3.2, 0.95, 0.4), s([[22, -10], [18, 905]], 2, 0.8, 0.4)], 18, 30), // a post at the near left, holding up the first beam
  ...seq([...edges(piano, 1.8, 0.9, false), s([piano[3], piano[0]], 2, 0.9), s([U(PU0 - 10, PZ, PH), U(PU1 + 10, PZ, PH)], 2.4, 0.95), ...edges(keys, 1.2, 0.85), ...edges(faceQuad(PU0 + 40, PU1 - 40, 30, 190, PZ), 1, 0.7),
    ...edges(sheet, 0.9, 0.7), ...edges(WIN, 2, 0.9), s([U(-110, BACK, 360), U(-110, BACK, 760)], 1.2, 0.85), s([U(-250, BACK, 560), U(30, BACK, 560)], 1.2, 0.85), s([U(-270, BACK, 350), U(50, BACK, 350)], 2.2, 0.9)], 28, 46, 0.35, [STOOL, FG]),
  ...seq([s([[878, 529], [895, 526], [912, 529], [895, 534], [878, 529]], 1.6, 0.9, 0.2), s([[882, 533], [878, 582]], 1.2, 0.9, 0.2), s([[908, 533], [912, 582]], 1.2, 0.9, 0.2), s([[895, 535], [895, 584]], 1, 0.8, 0.2),
    s(midTop.slice(0, 16), 1.2, 0.8, 0.3), s(midRim, 1.8, 0.9, 0.3), s([[692, 541], [690, 627]], 1.8, 0.9, 0.2), s([[702, 541], [704, 627]], 1.8, 0.9, 0.2), s([[668, 632], [726, 632]], 2, 0.9, 0.2)], 32, 50, 0.35, [FG]),
  // Mae behind the bar: hair in a bun, a face bent over the glass, a white blouse, the apron's bib
  ...seq([
    s(mp([[474, 424], [464, 420], [455, 424], [451, 434], [453, 443], [458, 449]]), 4.2, 0.95, 0.3, DARK), s(mp([[473, 425], [464, 424], [458, 431], [457, 441], [461, 448]]), 4, 0.95, 0.3, DARK),
    s(mp([[472, 427], [465, 428], [461, 435], [462, 444]]), 3, 0.9, 0.3, DARK), s(mp([[452, 422], [446, 426], [448, 433], [455, 434], [458, 428], [453, 422]]), 4.4, 0.95, 0.2, DARK),
    s(mp([[473, 425], [477, 431], [480, 438], [477, 441], [476, 446], [471, 450]]), 1, 0.85, 0.2), s(mp([[472, 434], [476, 435]]), 0.8, 0.8, 0.1),
    s(mp([[463, 450], [462, 456]]), 0.9, 0.8), s(mp([[471, 450], [472, 456]]), 0.9, 0.8),
    s(mp([[462, 456], [450, 459], [443, 467], [441, 478], [440, 506]]), 1.3, 0.9, 0.3), s(mp([[472, 456], [484, 458], [491, 465], [494, 478], [500, 484]]), 1.3, 0.9, 0.3),
    s(mp([[457, 469], [456, 500]]), 0.9, 0.75), s(mp([[476, 468], [477, 498]]), 0.9, 0.75), s(mp([[457, 469], [476, 468]]), 0.9, 0.75), s(mp([[459, 468], [463, 455]]), 0.7, 0.7), s(mp([[474, 467], [470, 455]]), 0.7, 0.7),
    s(mp([[445, 474], [468, 487], [498, 483]]), 1.1, 0.85, 0.3), s(mp([[498, 470], [499, 484], [508, 484], [509, 470]]), 1, 0.9, 0.2), s(mp([[498, 470], [503, 468], [509, 470]]), 0.8, 0.8, 0.2),
  ], 34, 52, 0.3, [COUNTER]),
  // 4. details: bottles, floorboards, panels, the old man's beard and pipe, the lantern's wires
  ...seq(bottles, 44, 70, 0.5, [COUNTER, MAE]),
  ...seq([...planks, s([U(RW, 1.02, 300), U(RW, BACK, 300)], 1.4, 0.7, 0.5), ...[1.15, 1.45, 1.8, 2.3, 2.9].map((z) => s([U(RW, z, 0), U(RW, z, 300)], 1, 0.5, 0.4)),
    s([U(LW + 1, BACK, 300), U(RW, BACK, 300)], 1.2, 0.6, 0.4)], 44, 66, 0.4, BG),
  ...seq([...[1.6, 1.95, 2.3, 2.65, 3.0].map((z) => s([U(CU, z, 24), U(CU, z, 280)], 1.1, 0.6, 0.3)), s([U(CU + 40, CZ0 + 0.02, 40), U(CU + 40, CZ1, 40)], 2.2, 0.85, 0.3),
    s([U(CU, CZ0, 290), U(CU, CZ1, 290)], 1, 0.6, 0.3), ...edges(faceQuad(CB + 30, CU - 30, 30, 270, CZ0), 1.1, 0.6)], 50, 64),
  ...seq([
    s([[1049, 577], [1062, 581], [1078, 579]], 1.8, 0.9, 0.3), // moustache over the pipe stem
    ...[[1050, 590, 1044, 620], [1060, 592, 1056, 632], [1070, 596, 1068, 648], [1082, 592, 1084, 652], [1094, 590, 1098, 640], [1106, 588, 1110, 622], [1046, 604, 1042, 634], [1076, 610, 1074, 660]].map(([a, b, c, d], i) =>
      s([[a, b], [(a + c) / 2 + (i % 2 ? 3 : -3), (b + d) / 2], [c, d]], 0.8, 0.55, 0.6)),
    s([[1051, 589], [1036, 594], [1024, 598]], 2, 0.95, 0.2), s([[1012, 586], [1013, 599], [1018, 604], [1024, 601], [1026, 586]], 1.8, 0.95, 0.2), s([[1012, 586], [1019, 584], [1026, 586]], 1, 0.8, 0.2),
    s([[1062, 557], [1047, 567], [1054, 574]], 1.4, 0.9, 0.3), s([[1111, 558], [1117, 563], [1114, 574]], 1.1, 0.8, 0.3),
    s([[1055, 519], [1094, 526], [1133, 518]], 2.4, 0.9, 0.3), s([[1092, 495], [1095, 512]], 1, 0.7), // hatband, the pinch in the crown
    ...edges([[1142, 624], [1162, 626], [1164, 650], [1143, 648]], 1, 0.75),
    s([[1188, 600], [1192, 860]], 2.2, 0.85, 0.3), s([[1180, 604], [1196, 600]], 1.6, 0.8), // the chair's back post behind him
  ], 52, 76, 0.4, [TABLE_TOP]),
  ...seq([...edges([[1004, 664], [1022, 670], [1014, 690], [997, 684]], 1, 0.75), // a patch on the sleeve, the hand on the lantern
    s(HAND.slice(0, 6), 1.6, 0.9, 0.3), s(HAND.slice(5), 1.9, 0.9, 0.3), s([[952, 711], [944, 716], [940, 724]], 1, 0.85), s([[954, 722], [944, 725], [937, 731]], 1, 0.85), s([[958, 732], [946, 735], [938, 738]], 1, 0.85), s([[966, 712], [960, 722], [964, 734]], 0.8, 0.6)], 62, 78),
  ...seq([
    s([[897, 708], [893, 678], [897, 651]], 1, 0.85, 0.2), s([[913, 708], [917, 678], [913, 651]], 1, 0.85, 0.2), s([[876, 679], [905, 685], [934, 679]], 1.2, 0.85, 0.2),
    s([[871, 652], [875, 620], [905, 602], [935, 620], [940, 652]], 1.6, 0.9, 0.2), s([[899, 623], [903, 616], [907, 616], [911, 623]], 1, 0.8, 0.2),
    s([[891, 728], [896, 733], [903, 731]], 1, 0.7, 0.2), // the dent
    // cards and a shot glass on the table
    ...edges([U(-10, 0.8, 220), U(56, 0.8, 220), U(58, 0.735, 220), U(-8, 0.735, 220)], 1.3, 0.9), ...edges([U(22, 0.83, 220), U(84, 0.815, 220), U(80, 0.755, 220), U(18, 0.77, 220)], 1.3, 0.9),
    s([U(44, 0.8, 220), U(52, 0.795, 220)], 3, 0.9, 0.2, "#7a2216"), s([U(8, 0.77, 220), U(14, 0.768, 220)], 2.4, 0.85, 0.2, "#7a2216"),
    s([[964, 744], [965, 764], [982, 764], [983, 744]], 1.4, 0.9, 0.2), s([[964, 744], [973, 741], [983, 744], [973, 747], [964, 744]], 1, 0.85, 0.2),
  ], 58, 78),
  // 5. the last dark accents: under the brim, under the table, the corners of the room
  ...seq([s([[1002, 549], [1040, 559], [1086, 559], [1122, 551]], 4, 0.9, 0.4), s([[1122, 553], [1123, 578]], 3, 0.85), s([[1134, 724], [1133, 832]], 3, 0.8), s([[800, 760], [900, 800], [1000, 806], [1100, 780]], 4, 0.6, 0.8),
    s([[380, 791], [627, 568]], 3.6, 0.85, 0.4), s([[242, 792], [380, 792]], 3.6, 0.9, 0.3)], 82, 100, 0.3, [FG]),
];

// ---------------------------------------------------------------- the washes, flooding out from the lantern
const L0 = LAN.flame, bay = (i: number, h0 = BB0, h1 = BB1) => wallQuad(LW, BAYS[i], BAYS[i + 1], h0, h1);
// the dark coming in around the light: the whole sheet with a bite out of the bottom, centred on the
// lantern. Three of them, each bite smaller, so the umber deepens the further it is from the flame.
const pool = (R: number, cx: number, cy: number, ph: number): P[] => {
  const ry = R * 0.8, a0 = -Math.asin(Math.min(1, (940 - cy) / ry)), n = 40;
  const rim = Array.from({ length: n }, (_, i) => { const a = a0 + ((Math.PI - 2 * a0) * i) / (n - 1), k = 1 + 0.12 * Math.sin(a * 2 + ph) + 0.07 * Math.sin(a * 5 + ph * 3); return [cx + R * k * Math.cos(a), cy - ry * k * Math.sin(a)] as P; });
  return [[-40, -40], [1640, -40], [1640, 940], ...rim, [-40, 940]];
};
const washes: Wash[] = [
  // the room: back wall, dusk in the window, ceiling, walls, floor
  { pts: BW, color: UMBER, alpha: 0.5, seed: 500, at: [44, 70], from: L0, hide: [WIN, FG] },
  { pts: WIN, color: DUSK, alpha: 0.55, seed: 501, pool: 0.2, at: [46, 70], from: L0 },
  { pts: faceQuad(-250, 30, 360, 520, BACK), color: ROSE, alpha: 0.55, seed: 502, pool: 0.2, at: [48, 72], from: L0 },
  { pts: [U(-250, BACK, 360), U(-250, BACK, 400), U(-180, BACK, 420), U(-90, BACK, 416), U(-60, BACK, 400), U(30, BACK, 398), U(30, BACK, 360)], color: "#7b5a6a", alpha: 0.6, seed: 503, at: [50, 72], from: L0 },
  { pts: CEILING, color: mix(DARK, UMBER, 0.4), alpha: 0.55, seed: 504, pool: 0.2, at: [44, 70], from: L0 },
  { pts: LEFTWALL, color: UMBER, alpha: 0.55, seed: 505, at: [46, 72], from: L0, hide: [MAE] },
  { pts: RIGHTWALL, color: mix(SIENNA, OCHRE, 0.35), alpha: 0.5, seed: 506, at: [46, 72], from: L0, hide: [FG] },
  { pts: FLOOR, color: SIENNA, alpha: 0.45, seed: 507, pool: 0.6, at: [48, 74], from: L0, hide: [FG] },
  { pts: blob(940, 700, 330, 230, 508, 0.2, 18), color: GLOW, alpha: 0.3, seed: 509, pool: 0.1, at: [44, 66], from: L0, hide: [GLOBE] }, // the light's own colour
  // the bar, the back-bar, the piano, the beams
  { pts: barFront, color: UMBER, alpha: 0.6, seed: 510, pool: 0.7, at: [54, 78], from: L0, ph: 1 },
  { pts: barTop, color: OCHRE, alpha: 0.5, seed: 511, at: [54, 78], from: L0, ph: 1, hide: [MAE] },
  { pts: barEnd, color: DARK, alpha: 0.55, seed: 512, pool: 0.6, at: [56, 80], from: L0, ph: 1 },
  { pts: bay(0), color: DARK, alpha: 0.5, seed: 513, at: [56, 80], from: L0, ph: 1, hide: [COUNTER] },
  { pts: bay(2), color: DARK, alpha: 0.5, seed: 514, at: [56, 80], from: L0, ph: 1, hide: [COUNTER, MAE] },
  { pts: wallQuad(LW, BAYS[1] + 0.06, BAYS[2] - 0.06, 400, 800), color: "#8f8496", alpha: 0.5, seed: 515, at: [58, 80], from: L0, ph: 1, hide: [MAE] },
  { pts: wallQuad(LW, 0.9, BAYS[3], 0, BB0), color: DARK, alpha: 0.45, seed: 516, at: [56, 80], from: L0, ph: 1, hide: [COUNTER] },
  { pts: piano, color: DARK, alpha: 0.6, seed: 517, pool: 0.5, at: [58, 82], from: L0, ph: 1, hide: [keys, sheet, STOOL, FG] },
  { pts: STOOL, color: DARK, alpha: 0.5, seed: 518, at: [60, 82], from: L0, ph: 1 },
  ...BEAMS.map((z, i) => ({ pts: beamFace(z), color: DARK, alpha: 0.45, seed: 520 + i, at: [56, 82] as [number, number], from: L0, ph: 1 })),
  { pts: midTop, color: DARK, alpha: 0.45, seed: 525, at: [60, 82], from: L0, ph: 1 }, { pts: midPed, color: DARK, alpha: 0.45, seed: 526, at: [60, 82], from: L0, ph: 1 },
  // the near table, the old man, the lantern
  { pts: TABLE_TOP, color: OCHRE, alpha: 0.3, seed: 530, pool: 0.3, at: [62, 86], from: L0, ph: 2, hide: [GLOBE, ARM, HAND] },
  { pts: RIM_BAND, color: SIENNA, alpha: 0.65, seed: 531, pool: 0.5, at: [64, 86], from: L0, ph: 2 },
  { pts: UNDER, color: DARK, alpha: 0.55, seed: 532, pool: 0.6, at: [66, 90], from: L0, ph: 2 },
  { pts: COAT, color: DARK, alpha: 0.8, seed: 533, pool: 0.5, at: [64, 88], from: L0, ph: 2, hide: [BEARD] },
  { pts: BACKSIDE, color: DARK, alpha: 0.55, seed: 534, at: [68, 90], from: L0, ph: 2, hide: [BEARD] },
  { pts: ARM, color: mix(DARK, SIENNA, 0.4), alpha: 0.78, seed: 535, pool: 0.5, at: [64, 88], from: L0, ph: 2, hide: [BEARD] },
  { pts: [[1047, 650], [1042, 682], [1034, 710], [1010, 724], [978, 732], [990, 716], [1016, 706], [1028, 680], [1034, 650]], color: DARK, alpha: 0.5, seed: 546, at: [68, 90], from: L0, ph: 2 },
  { pts: HAND, color: SIENNA, alpha: 0.55, seed: 536, at: [66, 88], from: L0, ph: 2 },
  { pts: HAT, color: DARK, alpha: 0.85, seed: 537, pool: 0.4, at: [64, 88], from: L0, ph: 2 },
  { pts: FACE, color: DARK, alpha: 0.7, seed: 538, pool: 0.2, at: [66, 90], from: L0, ph: 2, hide: [NOSE_LIT] },
  { pts: [[1121, 581], [1122, 600], [1116, 622], [1104, 643], [1090, 657], [1082, 640], [1096, 610], [1100, 585]], color: SHADE, alpha: 0.3, seed: 539, at: [68, 90], from: L0, ph: 2 },
  { pts: [[18, -40], [74, -40], [72, 940], [16, 940]], color: DARK, alpha: 0.75, seed: 549, pool: 0.3, at: [70, 94], from: [40, 900], ph: 3 },
  // the darks: his shadow on the wall, the corners going to umber, shadows cast away from the flame
  { pts: SHADOW, color: DARK, alpha: 0.45, seed: 550, pool: 0.3, at: [74, 96], from: L0, ph: 3, clip: RIGHTWALL },
  ...([[700, 0.34, DARK, 940, 770, 1], [430, 0.26, mix(UMBER, DARK, 0.5), 960, 730, 2.6], [250, 0.14, SIENNA, 925, 735, 4.1]] as const).map(([R, a, c, x, y, ph], i) => ({ pts: pool(R, x, y, ph), color: c, alpha: a, seed: 551 + i, pool: 0.2, at: [70 + i * 3, 93 + i] as [number, number], from: L0, ph: 3, hide: [MAE, WIN] })),
  { pts: [[1047, 690], [1042, 700], [1034, 716], [1010, 730], [980, 738], [1000, 746], [1040, 736], [1070, 712], [1080, 700]], color: UMBER, alpha: 0.4, seed: 555, at: [78, 96], from: L0, ph: 3 },
  { pts: blob(LAN.x, 746, 44, 8, 556, 0.1, 14), color: DARK, alpha: 0.35, seed: 557, at: [78, 96], from: L0, ph: 3, hide: [TANK] },
  { pts: [[983, 762], [1010, 770], [1016, 764], [985, 752]], color: UMBER, alpha: 0.4, seed: 558, at: [80, 96], from: L0, ph: 3 },
];

// ---------------------------------------------------------------- what moves
const PIV = U(-380, 1.7, 870); // the hanging lamp's hook, under the second beam
const motes = (() => { const r = rng(930); return Array.from({ length: 16 }, () => ({ x: 760 + r() * 380, y: 470 + r() * 240, ax: 8 + r() * 18, ay: 10 + r() * 22, k1: 1 + Math.floor(r() * 2), k2: 1 + Math.floor(r() * 2), p: r() * 6.28, q: r() * 6.28, sz: 1 + r() * 1.3 })); })();

export const p02 = page({
  id: "p02", title: "Le Saloon", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 14, seed: 990, at: 98, box: [60, 700, 760, 880] },
  animAt: [56, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    const pen = (pts: P[], w: number, seed: number, op = 0.9, color = INK, progress = reveal) => g.pen(pts, { w, color, seed, wobble: 0.4, boil: 0.25, taper: 1, opacity: op, retrace: false, progress });
    const flick = 1 + 0.08 * Math.sin(TT * 5) + 0.05 * Math.sin(TT * 11 + 1.3) + 0.03 * Math.sin(TT * 23 + 0.4);
    // the lantern's light over the table and the old man, breathing with the flame
    g.group("plain", () => { g.glow(L0[0] + 20, L0[1], 220, LAMP, 0.13 * reveal * flick); g.glow(L0[0], L0[1] - 4, 34, "#ffe6a8", 0.6 * reveal * flick); }, { blend: "screen" });
    g.group("plain", () => {
      const h = 22 * flick, lean = 1.6 * Math.sin(TT * 7 + 0.5), [fx, fy] = L0;
      fillShape(g, [[fx - 5, fy + 8], [fx - 6, fy], [fx - 2 + lean * 0.5, fy - h * 0.6], [fx + lean, fy - h], [fx + 3 + lean * 0.5, fy - h * 0.6], [fx + 6, fy], [fx + 5, fy + 8]], LAMP, 0.9 * reveal);
      fillShape(g, [[fx - 2.5, fy + 7], [fx - 3, fy], [fx + lean * 0.6, fy - h * 0.62], [fx + 3, fy], [fx + 2.5, fy + 7]], "#fff8e6", reveal);
      fillShape(g, blob(975, 750, 2, 5, 3, 0.1, 8), "#fff8e6", (0.6 + 0.3 * Math.sin(TT * 5)) * reveal); // the flame in the shot glass
    });
    // the hanging lamp over the bar, swinging a little on its chain
    g.group("plain", () => {
      const a = 0.05 * Math.sin(TT) + 0.012 * Math.sin(TT * 3 + 0.7), c = Math.cos(a), sn = Math.sin(a), R = ([x, y]: P): P => [PIV[0] + x * c - y * sn, PIV[1] + x * sn + y * c];
      const lamp = R([0, 118]);
      g.glow(lamp[0], lamp[1] + 6, 46, LAMP, 0.28 * reveal);
      pen([R([0, 0]), R([0, 92])], 1, 700, 0.85); pen([R([0, 92]), R([-22, 112])], 1, 701, 0.8); pen([R([0, 92]), R([22, 112])], 1, 702, 0.8);
      fillShape(g, [R([-32, 114]), R([-16, 106]), R([0, 104]), R([16, 106]), R([32, 114]), R([0, 118])], UMBER, 0.85 * reveal);
      pen([R([-32, 114]), R([-16, 106]), R([0, 104]), R([16, 106]), R([32, 114])], 1.4, 703, 0.9); pen([R([-32, 114]), R([0, 119]), R([32, 114])], 1.2, 704, 0.9);
      pen([R([-3, 104]), R([-3, 94])], 0.8, 705, 0.7); pen([R([3, 104]), R([3, 94])], 0.8, 706, 0.7);
      fillShape(g, [R([-11, 119]), R([-13, 128]), R([-6, 135]), R([6, 135]), R([13, 128]), R([11, 119])], OCHRE, 0.75 * reveal);
      pen([R([-11, 119]), R([-13, 128]), R([-6, 135]), R([6, 135]), R([13, 128]), R([11, 119])], 1.1, 707, 0.9);
    });
    // Mae's cloth going round the rim of the glass, once a second
    g.group("plain", () => masked(g, [COUNTER], () => {
      const [cx, cy] = M(503 + 3.5 * Math.cos(TT * 6), 471 + 2 * Math.sin(TT * 6)), cloth = blob(cx, cy, 6.5, 4.5, 11, 0.25, 10), [ex, ey] = M(490, 466);
      pen([[ex, ey], [(ex + cx) / 2 + 2, ey + 6], [cx - 3, cy + 1]], 1.2, 710, 0.9);
      fillShape(g, cloth, "#f7efe0", reveal); pen([...cloth, cloth[0]], 0.9, 711, 0.8);
    }));
    if (reveal < 1) return;
    // pipe smoke: three wisps a loop, each rising, curling and thinning out; a thread always at the bowl
    g.group("plain", () => {
      const [bx, by] = PIPE_BOWL;
      pen([[bx, by - 2], [bx + 1.5 * Math.sin(TT * 4), by - 10], [bx - 1 + 2 * Math.sin(TT * 4 + 1), by - 20]], 1.6, 720, 0.7, SMOKE, 1);
      for (let k = 0; k < 3; k++) {
        const p = ((t + k * 60) % LOOP) / LOOP, head = 20 + p * 160, op = Math.sin(p * Math.PI) * 0.8, pts: P[] = [];
        for (let j = 0; j <= 10; j++) { const dy = head - (j / 10) * Math.min(80, head - 14), x = bx + dy * 0.16 + Math.sin(dy * 0.06 + p * 5 + k * 2) * (3 + dy * 0.16); pts.push([x, by - dy]); }
        pen(pts, 3.2 - p * 1.8, 721 + k, op, SMOKE, 1);
      }
    });
    // dust turning in the lantern light, brighter the nearer it drifts to the flame
    g.group("plain", () => motes.forEach((m, i) => {
      const x = m.x + m.ax * Math.sin(TT * m.k1 + m.p), y = m.y + m.ay * Math.sin(TT * m.k2 + m.q), d = Math.hypot(x - L0[0], y - L0[1]);
      fillShape(g, blob(x, y, m.sz, m.sz, 740 + i, 0.1, 6), MOTE, Math.max(0, 0.75 - d / 320));
    }), { blend: "screen" });
  },
});
