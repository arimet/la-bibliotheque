// PAGE 8 · LE GANG. One idea: the gang blocks the trail at night, and the man in front wears the
// missing sheriff's hat.
// Focal subject: Jeb Callahan on horseback, close, in 3/4 facing the reader, the PALE grey hat
// with its braided band (Hollis's hat, a clue) the lightest shape on the page. Behind him a frieze
// of five riders in silhouette, rifles across their saddles, torches raised.
// One light: the torches (warm), Callahan's own held up on the right, so his brim shadows his
// eyes and only his jaw catches it; rims on hats, shoulders, horses' crests. A cold counter-light
// behind: the blue glow on top of the mesa, drawn in the cyanotype hand (it does not belong here).
// What moves: the flames flickering and throwing their glow, embers and smoke rising, the blue
// glow going out twice and coming back like a call, a horse tossing its head, Callahan's horse
// flicking an ear, dust drifting along the trail.
import { Gfx, turn, type Env, type Layer, type P } from "./core";
import { blob, clamp, clipped, fillShape, mix, smooth } from "./gallery";
import { INK_M, SEPIA, masked, page, seq, st, wet, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { paper: PAPER, ink: INK, ochre: OCHRE, umber: UMBER, sienna: SIENNA, dark: DARK, shade: SHADE, dusk: DUSK, lamp: LAMP, glow: GLOW } = SEPIA;
const BLUE = "#6fb6ff", ICE = "#dff3ff", FROST = "#9cc3f0";
const SIL = "#22150e", FLAME = "#e8893a", EMBER = "#ffd88a", HOT = "#fff3d0";
const HAT = "#bdb7ae", HAT_SHADE = "#7c7672", OXBLOOD = "#5a1d14";
const ease = (p: number) => 1 - (1 - p) * (1 - p);

// ---------------------------------------------------------------- a horse's head
// Hand-placed profile in head units: `a` runs from the poll (0) to the muzzle (1), `c` across,
// + toward the face (forehead, nose), - toward the jaw. The jowl is round and deep (half the length), the muzzle a quarter.
const HEAD: P[] = [[0, 0.03], [0.08, 0.1], [0.22, 0.14], [0.4, 0.125], [0.6, 0.1], [0.8, 0.095], [0.9, 0.11], [0.98, 0.08], [1.02, 0.0], [1.01, -0.09], [0.97, -0.14], [0.9, -0.16], [0.84, -0.14], [0.7, -0.17], [0.55, -0.23], [0.42, -0.33], [0.3, -0.4], [0.17, -0.4], [0.08, -0.33], [0.03, -0.22]];
const EAR_NEAR: P[] = [[-0.05, 0.03], [-0.1, 0.16], [-0.13, 0.29], [-0.06, 0.2], [0.04, 0.06]];
const EAR_FAR: P[] = [[0.02, 0.05], [-0.02, 0.17], [-0.03, 0.26], [0.03, 0.18], [0.1, 0.07]];
// a head in picture space: poll, angle below the horizontal (the muzzle points down-left), length
const headW = (poll: P, th: number, L: number, pts: P[] = HEAD): P[] => {
  const d: P = [-Math.cos(th), Math.sin(th)], n: P = [-Math.sin(th), -Math.cos(th)];
  return pts.map(([a, c]) => [poll[0] + L * (a * d[0] + c * n[0]), poll[1] + L * (a * d[1] + c * n[1])] as P);
};
const rad = (deg: number) => (deg * Math.PI) / 180;

// a limb from joints [x, y, width] (width in the same units as x, y): offset both sides, smooth
const limb = (J: number[][], T: (p: P) => P, h: number): P[] => {
  const c = J.map(([x, y]) => T([x, y])), L: P[] = [], R: P[] = [];
  c.forEach((p, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, w = (J[i][2] * h) / 2; L.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]); R.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]); });
  return smooth([...L, ...R.reverse()], true, 3);
};

// ---------------------------------------------------------------- the frieze: horse and rider in profile
// Units: height at the withers = 1, withers at x = 0, ground at y = 0, y UP, facing left. A horse
// is about as long as it is tall; lower legs half the height; head 0.42; the rider's head 0.155.
const BODY: P[] = [[0.02, 1.02], [0.12, 0.985], [0.26, 0.965], [0.42, 0.97], [0.56, 1.0], [0.68, 0.985], [0.765, 0.94], [0.805, 0.85], [0.805, 0.75], [0.775, 0.64], [0.73, 0.56], [0.64, 0.52], [0.56, 0.555], [0.44, 0.52], [0.28, 0.49], [0.1, 0.49], [0.0, 0.5], [-0.07, 0.54], [-0.14, 0.58], [-0.19, 0.67], [-0.22, 0.76]];
const UNDER: P[] = [[-0.285, 0.87], [-0.33, 0.98], [-0.35, 1.1]];
const CREST: P[] = [[-0.36, 1.33], [-0.27, 1.31], [-0.16, 1.25], [-0.06, 1.14]];
const POLL: P = [-0.4, 1.3];
const TAIL: P[] = [[0.76, 0.93], [0.83, 0.86], [0.865, 0.72], [0.875, 0.55], [0.86, 0.42], [0.89, 0.34], [0.83, 0.39], [0.8, 0.55], [0.785, 0.72], [0.77, 0.86]];
const RIDER: P[] = [[0.3, 1.0], [0.315, 1.06], [0.32, 1.16], [0.305, 1.29], [0.285, 1.4], [0.255, 1.465], [0.26, 1.52], [0.245, 1.572], [0.34, 1.585], [0.335, 1.603], [0.255, 1.61], [0.252, 1.69], [0.215, 1.712], [0.18, 1.702], [0.145, 1.71], [0.14, 1.61], [0.05, 1.598], [0.055, 1.582], [0.14, 1.572], [0.128, 1.535], [0.143, 1.505], [0.17, 1.478], [0.13, 1.44], [0.09, 1.36], [0.03, 1.24], [-0.03, 1.19], [-0.035, 1.16], [0.03, 1.15], [0.1, 1.2], [0.1, 1.1], [0.04, 1.02], [-0.04, 0.88], [-0.02, 0.66], [-0.035, 0.6], [-0.09, 0.5], [0.03, 0.475], [0.06, 0.52], [0.05, 0.68], [0.06, 0.8], [0.05, 0.86], [0.14, 0.95], [0.24, 0.99]];
const RIFLE: P[] = [[-0.24, 1.185], [0.18, 1.162], [0.44, 1.15], [0.45, 1.1], [0.2, 1.14], [-0.24, 1.17]];
const TORCH_ARM = [[0.25, 1.4, 0.075], [0.36, 1.53, 0.06], [0.34, 1.7, 0.055]];
const STICK: P[] = [[0.335, 1.64], [0.37, 1.9]];
// legs [x, y, width]: elbow/stifle, forearm/gaskin, knee/hock, cannon, fetlock, pastern, hoof
const LEGS = {
  stand: [
    [[-0.05, 0.58, 0.13], [-0.07, 0.44, 0.095], [-0.08, 0.305, 0.078], [-0.08, 0.27, 0.066], [-0.08, 0.11, 0.054], [-0.083, 0.068, 0.064], [-0.105, 0.022, 0.058], [-0.12, 0.0, 0.07]],
    [[0.02, 0.58, 0.12], [0.0, 0.44, 0.09], [-0.01, 0.305, 0.074], [-0.01, 0.27, 0.062], [-0.01, 0.11, 0.052], [-0.013, 0.068, 0.06], [-0.035, 0.022, 0.055], [-0.05, 0.0, 0.066]],
    [[0.62, 0.64, 0.2], [0.67, 0.46, 0.13], [0.735, 0.315, 0.078], [0.735, 0.28, 0.068], [0.72, 0.11, 0.054], [0.718, 0.068, 0.064], [0.695, 0.022, 0.058], [0.68, 0.0, 0.07]],
    [[0.56, 0.64, 0.19], [0.6, 0.46, 0.12], [0.66, 0.315, 0.074], [0.66, 0.28, 0.064], [0.645, 0.11, 0.052], [0.643, 0.068, 0.06], [0.62, 0.022, 0.055], [0.605, 0.0, 0.066]],
  ],
  walk: [
    [[-0.06, 0.58, 0.13], [-0.1, 0.44, 0.095], [-0.14, 0.305, 0.078], [-0.15, 0.27, 0.066], [-0.18, 0.11, 0.054], [-0.19, 0.068, 0.064], [-0.215, 0.022, 0.058], [-0.23, 0.0, 0.07]],
    [[0.0, 0.58, 0.12], [-0.04, 0.44, 0.09], [-0.1, 0.31, 0.075], [-0.07, 0.2, 0.056], [-0.03, 0.13, 0.052], [-0.03, 0.095, 0.06], [-0.055, 0.06, 0.055], [-0.07, 0.045, 0.065]],
    [[0.6, 0.64, 0.2], [0.64, 0.46, 0.13], [0.7, 0.315, 0.078], [0.69, 0.28, 0.068], [0.65, 0.11, 0.054], [0.645, 0.068, 0.064], [0.62, 0.022, 0.058], [0.605, 0.0, 0.07]],
    [[0.62, 0.64, 0.19], [0.7, 0.46, 0.12], [0.8, 0.32, 0.075], [0.83, 0.28, 0.066], [0.88, 0.12, 0.054], [0.895, 0.08, 0.06], [0.895, 0.03, 0.056], [0.885, 0.0, 0.066]],
  ],
};
type Rider = { wx: number; gy: number; h: number; th: number; legs: keyof typeof LEGS; torch: boolean; seed: number; tone: number };
// far to near. R2 (index 2) is the one that tosses its head.
const GANG: Rider[] = [
  { wx: 1420, gy: 652, h: 86, th: rad(58), legs: "walk", torch: true, seed: 3000, tone: 0.3 },
  { wx: 30, gy: 672, h: 96, th: rad(52), legs: "stand", torch: true, seed: 3100, tone: 0.2 },
  { wx: 1232, gy: 672, h: 100, th: rad(50), legs: "stand", torch: false, seed: 3200, tone: 0.18 },
  { wx: 1030, gy: 695, h: 115, th: rad(60), legs: "walk", torch: true, seed: 3300, tone: 0.08 },
  { wx: 122, gy: 724, h: 122, th: rad(56), legs: "walk", torch: false, seed: 3400, tone: 0 },
];
const rot = (p: P, c: P, deg: number): P => turn([p], c[0], c[1], deg)[0];
const rider = (r: Rider, toss = 0, earFlick = 0) => {
  const T = ([x, y]: P): P => [r.wx + x * r.h, r.gy - y * r.h];
  // the neck bends from its root: points near the withers stay, the head turns the whole angle
  const piv = T([-0.08, 0.98]), bend = (p: P) => { const w = clamp((Math.hypot(p[0] - piv[0], p[1] - piv[1]) / r.h - 0.12) / 0.3); return toss ? rot(p, piv, toss * w) : p; };
  const poll = T(POLL), L = 0.42 * r.h, head = headW(poll, r.th, L);
  const fore = [...UNDER.map(T), ...[...head].reverse(), ...CREST.map(T)].map(bend);
  const horse = [...BODY.map(T), ...fore];
  const ears = [headW(poll, r.th, L, EAR_FAR), headW(poll, r.th, L, EAR_NEAR).map((p) => rot(p, head[0], earFlick))].map((e) => e.map(bend));
  const legs = LEGS[r.legs].map((J) => limb(J, T, r.h));
  const arm = r.torch ? limb(TORCH_ARM, T, r.h) : null, stick = r.torch ? STICK.map(T) : null;
  const flame = r.torch ? T([0.372, 1.92]) : null;
  const mane = CREST.map(T).map(bend), face = head.slice(0, 9).map(bend);
  return { T, horse, fore: [T([-0.22, 0.76]), ...fore, T([0.02, 1.02]), T([-0.05, 0.8])], head: head.map(bend), face, ears, legs, rider: RIDER.map(T), rifle: RIFLE.map(T), tail: TAIL.map(T), arm, stick, flame, mane, poll: bend(poll) };
};
const GANG_REST = GANG.map((r) => rider(r));

// ---------------------------------------------------------------- Callahan, close, in picture space
// Head ~105 px; we look UP at him, so the brim is seen from below: its near edge is the upper arc,
// the crown pokes above it, the face hangs from the underside.
const BRIM_NEAR: P[] = [[545, 296], [562, 290], [590, 287], [603, 286.5], [625, 285], [660, 285], [695, 286], [725, 289], [746, 292], [753, 294]];
const CROWN: P[] = [[603, 286.5], [604, 262], [608, 240], [616, 226], [630, 221], [641, 224], [649, 231], [657, 224], [670, 221], [683, 226], [690, 240], [694, 262], [695, 286]];
const BRIM_FAR_R: P[] = [[753, 294], [744, 305], [718, 313], [694, 317]];
const BRIM_FAR_L: P[] = [[607, 317], [585, 313], [562, 306], [545, 296]];
// 3/4 to the picture's left: nose on the left edge, ear and jaw on the right
const FACE: P[] = [[694, 316], [697, 330], [699, 342], [696, 354], [688, 360], [680, 368], [664, 376], [646, 382], [630, 386], [620, 384], [614, 376], [612, 368], [608, 360], [606, 352], [601, 344], [606, 334], [609, 325], [607, 317]];
const HEADSIL: P[] = [BRIM_NEAR[0], ...BRIM_NEAR.slice(1, 3), ...CROWN, ...BRIM_NEAR.slice(7), ...BRIM_FAR_R.slice(1), ...FACE, ...BRIM_FAR_L.slice(1, 3)];
const BAND_TOP: P[] = [[604, 272], [626, 268], [649, 267], [672, 268], [694, 272]];
const BAND: P[] = [...BAND_TOP, [695, 286], [660, 285], [625, 285], [603, 286.5]];
const BRIM_LENS: P[] = [...BRIM_NEAR, ...BRIM_FAR_R.slice(1), [680, 319], [648, 320], [620, 319], ...BRIM_FAR_L];
// the duster: torso, the arm down to the rifle, skirt and leg over the horse, the arm raised with the torch
const BODYSIL: P[] = [
  [606, 396], [590, 406], [568, 416], [548, 428], [536, 450], [530, 480], [527, 520], [526, 555], [532, 590], [548, 624], [576, 652], [598, 664], [596, 682], [574, 692], [558, 710], [548, 742], [556, 776], [586, 786], [594, 860], [600, 905],
  [650, 905], [652, 850], [660, 790], [720, 782], [790, 768], [842, 742],
  [836, 740], [812, 690], [792, 640], [780, 580], [776, 520], [772, 472],
  [796, 452], [832, 440], [866, 432], [892, 424], [904, 404], [906, 372], [906, 340], [908, 316], [922, 300], [918, 276], [900, 266], [884, 272], [878, 296], [880, 316], [878, 350], [872, 386],
  [850, 394], [808, 402], [776, 410], [752, 414], [730, 404], [708, 394], [696, 390], [684, 408], [664, 430], [650, 440], [636, 428], [622, 410],
];
const NECKERCHIEF: P[] = [[622, 382], [686, 368], [698, 392], [684, 410], [664, 432], [652, 446], [640, 432], [624, 412], [610, 398]];
const JAW_LIT: P[] = [[694, 330], [699, 342], [696, 354], [688, 360], [680, 368], [664, 376], [646, 382], [632, 386], [642, 377], [657, 370], [671, 361], [681, 351], [688, 341], [690, 331]];
const MOUSTACHE: P[] = [[603, 356], [614, 354], [630, 357], [644, 362], [648, 374], [643, 386], [636, 374], [624, 368], [612, 370], [606, 382], [601, 372], [600, 362]];
// the horse: head in near profile, neck coming at us, cropped by the frame. Head 260 px.
const C_POLL: P = [357, 470], C_TH = rad(56), C_L = 260;
const C_HEAD = headW(C_POLL, C_TH, C_L);
const C_CREST: P[] = [[372, 462], [410, 466], [452, 488], [494, 528], [528, 574]];
const C_UNDER: P[] = [[400, 508], [405, 566], [402, 640], [392, 720], [390, 790], [400, 850], [418, 905]];
// the coat's left edge from where the crest meets it down to the frame: the horse is behind it
const COAT_LEFT = BODYSIL.slice(7, 20);
const FRONT: P[] = [...C_CREST, ...COAT_LEFT, ...[...C_UNDER].reverse(), ...[...C_HEAD].reverse()];
const REAR: P[] = [[808, 660], [840, 650], [878, 662], [902, 690], [914, 730], [916, 790], [912, 905], [650, 905], [652, 850], [660, 790], [720, 782], [790, 768], [842, 742], [828, 700]];
const C_TAIL: P[] = [[905, 700], [928, 728], [942, 790], [948, 860], [946, 905], [920, 905], [914, 850], [908, 780]];
// inset: the dark leaves a lit band along the crest (torch) and down the face (the blue glow)
const HEAD_IN = HEAD.map(([a, c], i) => (i <= 8 ? [a + 0.02, c - (i < 6 ? 0.1 : 0.06)] : [a, c]) as P);
const FRONT_DARK: P[] = [[392, 492], [440, 505], [480, 540], [512, 582], ...COAT_LEFT.slice(1), ...[...C_UNDER].reverse(), ...[...headW(C_POLL, C_TH, C_L, HEAD_IN)].reverse().slice(0, -1)];
const EYE = headW(C_POLL, C_TH, C_L, [[0.28, 0.02]])[0];
const pt = (a: number, c: number) => headW(C_POLL, C_TH, C_L, [[a, c]])[0];
const C_EARS = { near: headW(C_POLL, C_TH, C_L, EAR_NEAR), far: headW(C_POLL, C_TH, C_L, EAR_FAR) };
// rifle across the saddle, in front of everything
const RIFLE_C = { barrel: [[384, 705], [520, 687], [646, 669]] as P[], fore: [[462, 700], [540, 690], [612, 681]] as P[], stock: [[644, 664], [700, 658], [758, 646], [794, 632], [806, 650], [800, 668], [746, 668], [694, 674], [650, 680]] as P[] };
const TORCH_C = { stick: [[896, 312], [908, 250], [920, 192]] as P[], flame: [922, 184] as P };
const FIST: P[] = [[880, 298], [884, 274], [900, 266], [916, 272], [921, 292], [910, 306], [890, 308]];

// ---------------------------------------------------------------- the land
const HORIZON = 600;
const MESA: P[] = [[-40, 340], [30, 333], [110, 329], [200, 324], [290, 321], [370, 322], [440, 326], [500, 330], [536, 336], [552, 350], [562, 378], [576, 412], [598, 452], [626, 494], [660, 534], [700, 568], [746, 596], [800, 604]];
const HILLS: P[] = [[746, 600], [860, 592], [980, 596], [1100, 589], [1250, 594], [1400, 586], [1520, 592], [1650, 588]];
const GLOW_AT: P = [300, 322];
const ABOVE_MESA: P[] = [[-60, -60], [1660, -60], [1660, 592], ...[...HILLS].reverse(), ...[...MESA].reverse().slice(1)];
// push a polygon's edge out by d along its vertex normals (so a wash reaches past the hard edge
// where the night was painted around it)
const grow = (pts: P[], d: number): P[] => { const n = pts.length, sg = pts.reduce((a, p, i) => a + p[0] * pts[(i + 1) % n][1] - pts[(i + 1) % n][0] * p[1], 0) > 0 ? -1 : 1; return pts.map((p, i) => { const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [p[0] - (sg * dy * d) / l, p[1] + (sg * dx * d) / l] as P; }); };
// the coat less its torchlit edges (top of the raised arm, the shoulder, the collar) and the fist
const COAT_IN: P[] = BODYSIL.map(([x, y], i) => (i >= 48 && i <= 54 ? [x, y + 12] : i >= 45 && i <= 47 ? [x + 9, y] : [x, y]) as P).filter((_, i) => i < 39 || i > 44);
const COAT_LIT: P[] = [[700, 386], [752, 404], [808, 392], [850, 384], [868, 378], [872, 300], [886, 290], [896, 304], [888, 352], [882, 392], [850, 410], [808, 418], [756, 426], [704, 406]]; // the band the torch reaches
const FRONT_IN: P[] = FRONT.map(([x, y], i) => (i < C_CREST.length ? [x + 6, y + 15] : [x, y]) as P);
const FACE_SHADOW: P[] = [[607, 318], [690, 316], [692, 330], [690, 344], [680, 350], [670, 362], [654, 372], [636, 380], [622, 380], [614, 374], [612, 366], [608, 360], [606, 352], [601, 344], [606, 334], [609, 325]];
const STOCK: P[] = [...RIFLE_C.stock];
const OCC = [HEADSIL, BODYSIL, FRONT, REAR]; // Callahan and his horse stand in front of everything
const FIG = OCC; // the night is painted around them: they get their own washes on clean paper

// ---------------------------------------------------------------- the pen
const gangStrokes = (r: Rider, R: ReturnType<typeof rider>, base: number): Omit<Stroke, "at">[] => {
  const k = r.h / 100, s = base, tossing = r === GANG[2];
  return [
    st(R.horse.slice(0, 7), 0.9 * k, s, 0.55, 1), st(R.horse.slice(6, 12), 1.6 * k, s + 1, 0.9, 0.9), st(R.horse.slice(11, 21), 1.7 * k, s + 9, 0.9, 0.9), // back lit, rump and belly firm
    // the horse that tosses its head gets no fixed neck on the plate: it would show when the head moves
    ...(tossing ? [] : [st(R.horse.slice(20, 25), 1.6 * k, s + 2, 0.9, 0.9), st(R.face, 1.1 * k, s + 3, 0.7, 1), st(R.head.slice(8), 1.6 * k, s + 4, 0.9, 0.9)]),
    st(R.rider.slice(0, 9), 1.5 * k, s + 5, 0.9, 1), st(R.rider.slice(9, 16), 0.8 * k, s + 15, 0.5, 1), st(R.rider.slice(15, 30), 1.2 * k, s + 6, 0.8, 1), st(R.rider.slice(29), 1.4 * k, s + 16, 0.85, 1),
    st([R.T([0.04, 1.6]), R.T([0.19, 1.59]), R.T([0.34, 1.595])], 2.2 * k, s + 7, 0.95), // the brim
    st([R.T([-0.24, 1.18]), R.T([0.44, 1.13])], 1.6 * k, s + 8, 0.95, 0.5), // the rifle across the saddle
    ...LEGS[r.legs].map((J, i) => st(J.map(([x, y]) => R.T([x, y])), (i % 2 ? 2.4 : 2.9) * k, s + 10 + i, 0.92, 0.6)), // legs: one loaded stroke each
    ...TAIL.slice(1, 6).map((_, q) => st([R.T([0.77, 0.92]), R.T([0.84 + q * 0.008, 0.7]), R.T([0.85 + q * 0.01, 0.42 + q * 0.02])], (1.6 - q * 0.2) * k, s + 20 + q, 0.8, 0.8)),
    ...(R.stick ? [st(R.stick, 2.6 * k, s + 26, 0.95, 0.4)] : []),
    ...(tossing ? [] : R.mane.slice(0, 3).map((m, q) => st([m, [m[0] + 5 * k, m[1] + 9 * k]], 1.2 * k, s + 27 + q, 0.85, 0.5))),
    st([R.T([-0.02, 1.17]), R.head[10]], 0.6 * k, s + 30, 0.7, 0.4), // reins
  ];
};

// the lines on Callahan and his horse, over the washes
const HATCH = (x0: number, y0: number, n: number, dx: number, dy: number, l: number, seed: number) => Array.from({ length: n }, (_, i) => st([[x0 + i * dx, y0 + i * dy], [x0 + i * dx - l * 0.45, y0 + i * dy + l * 0.9]], 0.9, seed + i, 0.45, 0.5));
const OVER: Stroke[] = seq([
    ...HATCH(426, 610, 7, 7, 9, 44, 160), ...HATCH(536, 640, 6, 4, 22, 36, 170), ...HATCH(560, 720, 6, 8, 12, 40, 180), // under the horse's throat, down the coat's shadow side
    st(FACE.slice(6), 1.9, 25, 0.95, 1), st(FACE.slice(2, 5), 0.7, 26, 0.35, 1), // the face; the lit jaw: light eats the edge
    st([[602, 357], [614, 355], [626, 357]], 1.4, 90, 0.9), st([[612, 360], [606, 372], [605, 382]], 1.1, 91, 0.8), st([[628, 360], [640, 370], [643, 384]], 1.1, 92, 0.8), st([[618, 361], [621, 370]], 0.8, 93, 0.6), st([[606, 352], [611, 348]], 1, 89, 0.7),
    st([[688, 333], [692, 344], [688, 352]], 0.9, 94, 0.6), // the ear
    st(NECKERCHIEF.slice(3, 8), 1.2, 95, 0.75),
    st([[626, 408], [636, 460], [644, 520], [648, 590]], 1.4, 96, 0.75), st([[684, 400], [672, 452], [662, 520], [656, 592]], 1.4, 97, 0.75), // the coat open on a vest
    st([[534, 596], [600, 606], [660, 608], [720, 602], [786, 590]], 1.8, 98, 0.8), // gun belt
    st([[562, 470], [558, 530], [560, 590], [576, 622]], 1.1, 99, 0.6), st([[760, 470], [762, 540], [770, 610]], 1.1, 100, 0.55),
    st([[596, 792], [630, 800], [656, 796]], 1.2, 101, 0.6), st([[598, 862], [626, 858], [652, 862]], 1.4, 105, 0.7), st([[620, 800], [622, 858]], 1.2, 106, 0.6), st([[420, 850], [434, 905]], 1.2, 107, 0.5), st([[536, 836], [522, 905]], 1.2, 108, 0.5), st([[704, 700], [740, 752], [760, 772]], 1, 102, 0.5), st([[820, 440], [850, 410]], 1, 103, 0.5), st([[886, 340], [896, 360]], 0.9, 104, 0.5),
    // the bridle: browband, cheekpiece down to the bit, noseband; the reins sag back to his hand
    st([pt(0.1, 0.09), pt(0.14, -0.04), pt(0.1, -0.2)], 1.2, 110, 0.8), st([pt(0.08, -0.14), pt(0.45, -0.12), pt(0.86, -0.08)], 1.4, 111, 0.85), st([pt(0.66, 0.08), pt(0.7, -0.04), pt(0.68, -0.16)], 1.3, 112, 0.8),
    st([pt(0.87, -0.08), [440, 740], [520, 724], [590, 684]], 1.1, 113, 0.75),
    st(blob(EYE[0], EYE[1], 9, 5, 114, 0.1, 10, -0.5), 1.4, 114, 0.9), st([pt(0.9, 0.05), pt(0.94, -0.01), pt(0.9, -0.04)], 1.4, 115, 0.85), st([pt(0.97, -0.08), pt(0.92, -0.09)], 1, 116, 0.7),
    st([pt(0.2, -0.3), pt(0.34, -0.22), pt(0.5, -0.2)], 1, 117, 0.5), // the jowl
    st([[418, 574], [428, 640], [432, 716]], 1, 118, 0.45), st([[508, 606], [470, 690], [428, 772]], 1, 119, 0.4), // the jugular groove, the shoulder
    ...[[392, 470, 400, 508], [418, 476, 428, 520], [446, 490, 452, 536], [470, 508, 478, 556], [496, 530, 500, 570], [382, 468, 360, 500]].map(([x0, y0, x1, y1], i) => st([[x0, y0], [(x0 + x1) / 2 + 6, (y0 + y1) / 2], [x1, y1]], 1.3, 120 + i, 0.8, 0.5)), // mane and forelock
    ...[[910, 704, 930, 860], [918, 716, 944, 830], [906, 730, 918, 890]].map(([x0, y0, x1, y1], i) => st([[x0, y0], [(x0 + x1) / 2 + 8, (y0 + y1) / 2], [x1, y1]], 1.2, 130 + i, 0.7, 0.6)), // tail
    st(RIFLE_C.barrel, 3, 140, 0.95, 0.3), st(RIFLE_C.fore, 1.2, 141, 0.7, 0.3), st([[384, 699], [384, 711]], 1.6, 146, 0.9, 0.2), st(RIFLE_C.stock.slice(0, 5), 1.8, 142, 0.9, 0.3), st(RIFLE_C.stock.slice(4), 1.6, 143, 0.85, 0.3), st([[630, 672], [636, 690], [654, 692], [658, 680]], 1.3, 144, 0.85, 0.3), // barrel, forestock, stock, lever
    st([[588, 666], [600, 660], [612, 666]], 1.1, 145, 0.7), st([[590, 674], [611, 674]], 0.8, 147, 0.6), // his knuckles on it
    st(TORCH_C.stick, 6, 150, 0.95, 0.3), st([[899, 300], [909, 252], [918, 200]], 1.2, 151, 0.6, 0.3),
  ], 38, 62);

const strokes: Stroke[] = [
  // 1. the land: the mesa's rim and scarp, the far horizon
  ...seq([st(MESA.slice(0, 12), 2.2, 10, 0.9), st(MESA.slice(11), 1.8, 11, 0.8), { ...st(HILLS, 1.1, 12, 0.6, 1), hide: [...OCC, ...[0, 2, 3].map((i) => GANG_REST[i].horse)] }], 0, 12, 0.35, OCC),
  // 2. Callahan, big shapes first: the hat, the face, the shoulders, the torch arm, the horse's neck and head
  ...seq([
    st(BRIM_NEAR.slice(0, 6), 2.8, 20, 0.95, 1), st(BRIM_NEAR.slice(6), 1.1, 19, 0.55, 1), st(CROWN.slice(0, 7), 2.2, 21, 0.9, 1), st(CROWN.slice(7, 11), 0.9, 22, 0.45, 1),
    st(BRIM_FAR_L, 1.6, 23, 0.85), st(BRIM_FAR_R, 1.4, 24, 0.8),
    st(BODYSIL.slice(0, 12), 3, 27, 0.95, 1.1), st(BODYSIL.slice(26, 33), 2.4, 28, 0.9, 1), st(BODYSIL.slice(51, 55), 0.9, 29, 0.4, 1.2),
    st(BODYSIL.slice(32, 38), 2.6, 30, 0.95, 1), st(BODYSIL.slice(37, 42), 1.6, 39, 0.8, 1), st(BODYSIL.slice(46, 49), 0.9, 31, 0.45, 1),
    st(C_CREST.slice(0, 3), 1, 32, 0.45, 1.2), st(C_HEAD.slice(0, 10), 1.8, 33, 0.85, 1), st(C_HEAD.slice(9), 2.8, 34, 0.95, 1), st(C_UNDER, 3, 35, 0.95, 1),
    st(BODYSIL.slice(12, 20), 2.6, 36, 0.9, 1), st(BODYSIL.slice(20, 27), 2.2, 37, 0.85, 1),
    st(REAR.slice(0, 3), 1, 38, 0.5, 1), st(REAR.slice(2, 7), 2.4, 40, 0.9, 1),
  ], 5, 34),
  // 3. the frieze, far to near
  ...seq(GANG.flatMap((r, i) => gangStrokes(r, GANG_REST[i], 200 + i * 30)), 20, 50, 0.4, OCC),
  // 4. details: the braided band, the crease, the moustache, the coat's lines, the bridle, the mane, the rifle, the torch
  ...seq([
    st(BAND_TOP, 1.4, 60, 0.9), st([[649, 231], [648, 246], [650, 262]], 1.1, 61, 0.7), st([[616, 232], [621, 250]], 0.8, 62, 0.5), st([[683, 232], [678, 250]], 0.8, 63, 0.5),
    ...Array.from({ length: 11 }, (_, i) => { const x = 607 + i * 8.2, top = 271 - Math.sin(((x - 604) / 90) * Math.PI) * 4; return { ...st([[x, top + 1], [x + 5, (top + 285) / 2], [x, 284]], 1.05, 70 + i, 0.95, 0.15), color: "#f1e6cf" }; }), // the braid, pale on the dark band
  ], 32, 50),
  ...OVER,
  // 5. the ground: ruts to the frieze, stones, sage, hoof marks
  ...seq([
    st([[1600, 780], [1320, 716], [1150, 690], [1000, 674]], 1.2, 400, 0.45, 1.2), st([[1600, 850], [1380, 760], [1200, 716], [1060, 694]], 1.2, 401, 0.4, 1.2),
    st([[0, 812], [160, 770], [300, 752]], 1.1, 402, 0.4, 1.2),
    ...[[1180, 846, 40, 20], [1430, 872, 58, 26], [1536, 806, 30, 14], [70, 872, 46, 20]].flatMap(([x, y, w, hh], i) => [st([[x - w, y], [x - w * 0.8, y - hh * 0.7], [x - w * 0.3, y - hh], [x + w * 0.45, y - hh * 0.85]], 1.6, 410 + i, 0.85, 0.3), st([[x + w * 0.45, y - hh * 0.85], [x + w, y]], 1.3, 415 + i, 0.8, 0.3), st([[x - w * 1.2, y + 1], [x + w * 1.3, y + 2]], 2, 420 + i, 0.8, 0.3), st([[x - w * 0.3, y - hh], [x - w * 0.1, y - hh * 0.4], [x, y]], 0.9, 425 + i, 0.5, 0.3)]),
    ...[[1300, 812], [1490, 752], [1110, 868], [60, 836], [200, 810], [1560, 880]].map(([x, y], i) => { const k = 22 + (i % 3) * 6; return st([[x - k * 0.7, y - k * 0.8], [x - k * 0.2, y], [x, y - k * 1.1], [x + k * 0.2, y], [x + k * 0.8, y - k * 0.7]], 1.2, 430 + i, 0.75, 0.5); }),
    ...[[300, 330, 40], [150, 334, 30], [440, 332, 36]].map(([x, y, l], i) => st([[x, y], [x + 3, y + l * 0.5], [x - 2, y + l]], 0.9, 440 + i, 0.45, 0.6)), // fissures under the caprock
    st([[-40, 372], [120, 366], [300, 362], [470, 366], [548, 376]], 1, 446, 0.4, 1), // the caprock's foot
    ...Array.from({ length: 22 }, (_, i) => { const x = 960 + ((i * 197) % 640), y = 700 + ((i * 83) % 190), l = 8 + (i % 4) * 5; return st([[x, y], [x + l * 0.5, y - 1], [x + l, y + 1]], 1, 450 + i, 0.4, 0.4); }),
  ], 44, 66, 0.35, OCC),
];


// ---------------------------------------------------------------- the washes: night laid over the paper
// a sheet of wash whose lower edge runs from yl (left) to yr (right), wavering like a wet edge
const sheet = (yl: number, yr: number, seed: number, amp = 22): P[] => [[-40, -40], [1640, -40], ...Array.from({ length: 15 }, (_, i) => { const x = 1640 - i * 120, k = (x + 40) / 1680; return [x, yl + (yr - yl) * k + amp * Math.sin(x * 0.0035 + seed) + amp * 0.45 * Math.sin(x * 0.009 + seed * 2)] as P; })];
const TORCH_ME: P = [922, 150];
const washes: Wash[] = [
  // the sky: night comes down from the top, the low sky keeps a little light
  { pts: sheet(620, 620, 1, 0), color: SHADE, alpha: 0.55, seed: 500, pool: 0.2, at: [40, 66], from: GLOW_AT, hide: FIG },
  { pts: sheet(90, 470, 3, 12), color: mix(DARK, SHADE, 0.35), alpha: 0.36, seed: 502, pool: 0.3, at: [44, 70], from: GLOW_AT, hide: FIG },
  { pts: sheet(-20, 190, 4, 8), color: mix(DARK, SHADE, 0.3), alpha: 0.26, seed: 503, pool: 0.2, at: [46, 72], from: GLOW_AT, hide: FIG },
  // the mesa, dark against the glow behind it
  { pts: [...MESA, [800, 610], [-40, 610]], color: mix(SHADE, DARK, 0.6), alpha: 0.7, seed: 510, pool: 0.5, at: [48, 72], from: GLOW_AT, hide: FIG },
  { pts: [[-40, 372], [120, 366], [300, 362], [470, 366], [548, 376], [576, 412], [598, 452], [626, 494], [660, 534], [700, 568], [746, 598], [-40, 604]], color: DARK, alpha: 0.35, seed: 511, pool: 0.6, at: [50, 74], from: GLOW_AT, hide: FIG },
  // the ground: the far flat, the trail, a dark foreground
  { pts: [[-40, 590], [1640, 580], [1640, 920], [-40, 920]], color: UMBER, alpha: 0.5, seed: 520, pool: 0.4, at: [52, 80], from: [1030, 690], ph: 1, hide: FIG },
  { pts: [[-40, 596], [1640, 586], [1640, 920], [-40, 920]], color: SHADE, alpha: 0.35, seed: 523, pool: 0.3, at: [54, 82], from: [1030, 690], ph: 1, hide: FIG },
  { pts: [[-40, 600], [740, 598], [1640, 590], [1640, 660], [1000, 668], [600, 650], [-40, 660]], color: OCHRE, alpha: 0.22, seed: 521, pool: 0.2, at: [54, 80], from: [1030, 690], ph: 1, hide: [...FIG, ...[0, 3, 4].map((i) => GANG_REST[i].horse), BODY.map(GANG_REST[2].T)] }, // painted around the horses standing on it
  { pts: [[-40, 790], [200, 770], [500, 800], [900, 820], [1200, 790], [1640, 800], [1640, 920], [-40, 920]], color: DARK, alpha: 0.45, seed: 522, pool: 0.6, at: [60, 86], from: [800, 920], ph: 1, hide: FIG },
  // the frieze, glazed: a warm dark first, then sepia-dark moved down off the lit top edges
  ...GANG_REST.flatMap((R, i) => [i === 2 ? BODY.map(R.T) : R.horse, R.rider].flatMap((pts, q) => [
    { pts, color: mix(UMBER, DARK, 0.3), alpha: 0.55, seed: 530 + i * 4 + q, pool: 0.6, at: [58, 82] as [number, number], from: R.T([0.3, 1.9]), ph: 2, hide: OCC },
    { pts: pts.map(([x, y]) => [x, y + 0.06 * GANG[i].h] as P), clip: pts, color: mix(SIL, SHADE, 0.12 + GANG[i].tone), alpha: 0.9, seed: 550 + i * 4 + q, pool: 0.7, at: [66, 90] as [number, number], from: R.T([0.3, 1.9]), ph: 3, hide: OCC },
  ])),
  // and a last dark over each horse's barrel and legs' roots, where no torch reaches
  ...GANG_REST.map((R, i) => ({ pts: [R.T([0.0, 0.62]), R.T([0.3, 0.78]), R.T([0.6, 0.8]), R.T([0.8, 0.76]), R.T([0.78, 0.6]), R.T([0.6, 0.5]), R.T([0.3, 0.48]), R.T([0.02, 0.48])], clip: i === 2 ? BODY.map(R.T) : R.horse, color: mix(SIL, SHADE, 0.3), alpha: 0.5, seed: 580 + i, pool: 0.8, at: [72, 94] as [number, number], ph: 4, hide: OCC })),
  // Callahan: warm light first where the torch reaches, then umber, sepia-dark, violet on the far side
  { pts: [...COAT_LIT], color: mix(OCHRE, LAMP, 0.4), alpha: 0.42, seed: 600, pool: 0.2, at: [56, 80], from: TORCH_ME, ph: 2 },
  { pts: grow(COAT_IN, 5), color: UMBER, alpha: 0.62, seed: 601, pool: 0.6, at: [60, 84], from: TORCH_ME, ph: 3, hide: [STOCK] },
  { pts: [[548, 428], [536, 450], [530, 480], [527, 520], [526, 555], [532, 590], [548, 624], [576, 652], [598, 664], [596, 682], [574, 692], [558, 710], [548, 742], [556, 776], [586, 786], [594, 860], [600, 905], [650, 905], [652, 850], [660, 790], [720, 782], [790, 768], [826, 736], [812, 700], [792, 660], [776, 610], [768, 555], [764, 500], [758, 462], [736, 436], [706, 420], [676, 420], [640, 424], [600, 420], [570, 424]].map(([x, y]) => [x - 3, y] as P), color: mix(DARK, UMBER, 0.15), alpha: 0.8, seed: 602, pool: 0.7, at: [68, 90], from: TORCH_ME, ph: 4, hide: [STOCK] },
  { pts: grow([[772, 472], [796, 452], [832, 440], [866, 432], [892, 424], [904, 404], [906, 372], [906, 340], [900, 322], [892, 322], [890, 352], [884, 394], [850, 410], [808, 418], [776, 426], [758, 444]], 6), color: mix(UMBER, DARK, 0.2), alpha: 0.62, seed: 605, pool: 0.5, at: [62, 86], from: TORCH_ME, ph: 3 }, // the raised sleeve under its lit top edge
  { pts: [[790, 470], [830, 452], [880, 440], [894, 424], [898, 380], [898, 336], [892, 326], [888, 352], [884, 380], [868, 406], [830, 420], [790, 436], [770, 448]], color: DARK, alpha: 0.5, seed: 603, pool: 0.5, at: [70, 90], ph: 4 }, // the underside of the raised arm
  { pts: [[530, 450], [524, 520], [526, 600], [552, 700], [556, 790], [596, 905], [626, 905], [616, 800], [612, 700], [604, 600], [596, 520], [586, 460], [566, 436]], color: mix(DARK, SHADE, 0.5), alpha: 0.5, seed: 604, pool: 0.5, at: [74, 94], from: [520, 900], ph: 5, hide: [STOCK] }, // the side turned from the torch
  { pts: [[534, 596], [600, 606], [660, 608], [720, 602], [786, 590], [800, 660], [826, 736], [790, 768], [720, 782], [660, 790], [652, 850], [650, 905], [600, 905], [594, 860], [586, 786], [556, 776], [548, 742], [558, 710], [574, 692], [540, 640]], color: mix(SIL, SHADE, 0.2), alpha: 0.5, seed: 606, pool: 0.8, at: [76, 96], from: [600, 905], ph: 5, hide: [STOCK] }, // below the belt, deepest
  // his horse: ochre where the torch lies along the crest, sienna, then the dark
  { pts: [...FRONT], color: OCHRE, alpha: 0.35, seed: 610, pool: 0.2, at: [56, 80], from: TORCH_ME, ph: 2 },
  { pts: grow(FRONT_IN, 5), color: mix(SIENNA, UMBER, 0.35), alpha: 0.66, seed: 611, pool: 0.5, at: [60, 84], from: TORCH_ME, ph: 3 },
  { pts: grow(REAR, 5), color: mix(SIENNA, UMBER, 0.35), alpha: 0.62, seed: 612, pool: 0.5, at: [60, 84], from: TORCH_ME, ph: 3 },
  { pts: FRONT_DARK, color: mix(DARK, UMBER, 0.15), alpha: 0.7, seed: 613, pool: 0.7, at: [68, 92], from: [300, 900], ph: 4 },
  { pts: [[830, 668], [872, 676], [896, 700], [906, 740], [908, 800], [906, 905], [660, 905], [662, 800], [740, 790], [810, 770], [846, 744], [836, 700]], color: DARK, alpha: 0.55, seed: 614, pool: 0.6, at: [68, 92], ph: 4 },
  { pts: [[404, 600], [412, 700], [404, 800], [420, 905], [600, 905], [590, 800], [556, 740], [520, 700], [470, 660], [430, 600]], color: mix(DARK, SHADE, 0.45), alpha: 0.5, seed: 615, pool: 0.6, at: [74, 94], from: [300, 900], ph: 5 }, // chest and throat, deepest
  { pts: [[400, 508], [405, 566], [402, 640], [392, 720], [390, 790], [400, 850], [418, 905], [600, 905], [594, 860], [586, 786], [556, 776], [548, 742], [540, 690], [500, 640], [460, 600], [430, 560]], color: mix(DARK, SHADE, 0.3), alpha: 0.45, seed: 617, pool: 0.6, at: [72, 94], from: [300, 900], ph: 5 }, // the neck turned from the torch
  { pts: headW(C_POLL, C_TH, C_L, HEAD.map(([a, c]) => [a, Math.min(c, -0.05)] as P)), color: mix(DARK, SHADE, 0.3), alpha: 0.4, seed: 618, pool: 0.5, at: [74, 94], ph: 5 }, // the jaw side of the head
  { pts: C_TAIL, color: DARK, alpha: 0.65, seed: 616, pool: 0.5, at: [66, 90], ph: 4 },
  // the face: a pale warm skin, the shadow of the brim over it, the jaw left in the light
  { pts: grow(FACE, 3), color: GLOW, alpha: 0.4, seed: 620, pool: 0.1, at: [58, 82], from: TORCH_ME, ph: 2 },
  { pts: FACE_SHADOW, color: SIENNA, alpha: 0.5, seed: 621, pool: 0.4, at: [62, 86], from: TORCH_ME, ph: 3 },
  { pts: FACE_SHADOW, color: DARK, alpha: 0.55, seed: 622, pool: 0.5, at: [70, 92], ph: 4 },
  { pts: [[603, 316], [696, 316], [697, 334], [660, 338], [630, 338], [604, 334]], color: DARK, alpha: 0.5, seed: 623, at: [74, 94], ph: 5 }, // the brim's shadow over the eyes
  { pts: MOUSTACHE, color: DARK, alpha: 0.75, seed: 624, pool: 0.3, at: [76, 96], ph: 5 },
  { pts: NECKERCHIEF, color: OXBLOOD, alpha: 0.75, seed: 625, pool: 0.5, at: [62, 86], ph: 3 }, { pts: NECKERCHIEF.slice(2), color: OXBLOOD, alpha: 0.5, seed: 627, pool: 0.6, at: [66, 88], ph: 4 },
  { pts: [[614, 402], [640, 432], [652, 446], [664, 432], [684, 410], [660, 412]], color: DARK, alpha: 0.35, seed: 626, at: [72, 92], ph: 4 },
  // the hat: nearly bare paper, a grey turned from the torch, the dark band
  { pts: [...CROWN, ...BRIM_NEAR.slice(7), ...BRIM_FAR_R.slice(1), [648, 320], ...BRIM_FAR_L], color: HAT, alpha: 0.3, seed: 630, pool: 0.2, at: [60, 84], from: TORCH_ME, ph: 2 },
  { pts: BRIM_LENS, color: HAT_SHADE, alpha: 0.38, seed: 631, pool: 0.4, at: [70, 90], ph: 3 }, // the brim's underside
  { pts: [[603, 286], [604, 262], [608, 240], [616, 226], [630, 221], [636, 223], [630, 250], [628, 286]], color: HAT_SHADE, alpha: 0.32, seed: 632, pool: 0.4, at: [72, 92], ph: 3 }, // the crown turned from the torch
  { pts: BAND, color: DARK, alpha: 0.8, seed: 633, at: [76, 94], ph: 4 },
  // the rifle's stock and his hands, lit
  { pts: RIFLE_C.stock, color: SIENNA, alpha: 0.6, seed: 640, pool: 0.6, at: [72, 94], ph: 4 },
  { pts: FIST, color: SIENNA, alpha: 0.4, seed: 641, pool: 0.4, at: [66, 90], from: TORCH_ME, ph: 3 },
  { pts: [[586, 664], [600, 658], [612, 664], [614, 682], [602, 690], [588, 684]], color: mix(SIENNA, DARK, 0.4), alpha: 0.6, seed: 642, at: [74, 94], ph: 5 },
  ];

// ---------------------------------------------------------------- what moves
const TT = (t: number) => (t / LOOP) * Math.PI * 2;
// the blue light goes out twice a loop and comes back, the second time a little brighter
const blueAt = (t: number) => {
  const out = (s: number) => {
    const u = (t - s + LOOP) % LOOP;
    if (u < 8) return 1 - ease(u / 8) * 0.94;
    if (u < 20) return 0.06;
    if (u < 24) return 0.06 + 0.55 * ((u - 20) / 4);   // it tries
    if (u < 27) return 0.61 - 0.45 * ((u - 24) / 3);   // fails
    if (u < 36) return 0.16 + 1.14 * ease((u - 27) / 9); // and calls, brighter than before
    if (u < 60) return 1.3 - 0.3 * ((u - 36) / 24);
    return 1;
  };
  return out(38) * out(122) * (0.94 + 0.06 * Math.sin(TT(t) * 3));
};
const flick = (t: number, ph: number) => { const T = TT(t); return 0.86 + 0.07 * Math.sin(T * 7 + ph) + 0.05 * Math.sin(T * 13 + ph * 2) + 0.03 * Math.sin(T * 29 + ph * 3); };
const tossAt = (t: number) => { const u = (t - 64 + LOOP) % LOOP, a = u < 10 ? ease(u / 10) : u < 42 ? 1 - ease((u - 10) / 32) : 0; return -(17 * a + 4 * Math.sin(u * 0.9) * a) + 1.2 * Math.sin(TT(t) * 2); };
const earAt = (t: number) => { const w = (s: number, n: number) => { const u = (t - s + LOOP) % LOOP; return u < n ? Math.sin((Math.PI * u) / n) ** 2 : 0; }; return 38 * w(18, 16) + 30 * w(128, 12); };

const flameShapes = (x: number, y: number, s: number, t: number, ph: number): P[][] => {
  const T = TT(t), sway = (Math.sin(T * 5 + ph) * 6 + Math.sin(T * 11 + ph * 2) * 3) * s, lick = 1 + 0.12 * Math.sin(T * 9 + ph) + 0.08 * Math.sin(T * 17 + ph * 3);
  const shape = (hg: number, wd: number, k: number, lean: number): P[] => smooth([[x - wd, y], [x - wd * 1.1, y - hg * 0.25], [x - wd * 0.6 + sway * 0.3 * k, y - hg * 0.55], [x + sway * k - wd * 0.1 + lean, y - hg], [x + wd * 0.45 + sway * 0.5 * k, y - hg * 0.62], [x + wd * 1.05, y - hg * 0.28], [x + wd * 0.9, y + wd * 0.3], [x, y + wd * 0.5]], true, 3);
  return [shape(62 * s * lick, 14 * s, 1.1, -4 * s), shape(44 * s * lick, 10 * s, 0.85, -2 * s), shape(24 * s * (0.9 + 0.1 * lick), 5.5 * s, 0.5, 0)];
};
const TORCHES = [{ at: TORCH_C.flame, s: 1.45, ph: 0.4 }, ...GANG_REST.filter((R) => R.flame).map((R, i) => ({ at: R.flame!, s: 0.7 + 0.12 * (i === 2 ? 1 : 0), ph: 1.7 + i * 2.1 }))];
const PUFF = blob(0, 0, 1, 0.8, 900, 0.3, 12);
const STARS = (() => { const out: [number, number, number][] = []; for (let i = 0; i < 40 && out.length < 22; i++) { const x = 20 + ((i * 373) % 1560), y = 24 + ((i * 211) % 300), dx = x - TORCH_ME[0], dg = x - GLOW_AT[0]; if (Math.hypot(dx, y - TORCH_ME[1]) < 200 || Math.hypot(dg, y - GLOW_AT[1]) < 230 || (x > 540 && x < 760 && y > 200)) continue; out.push([x, y, 0.9 + (i % 3) * 0.5]); } return out; })();
const DUST = Array.from({ length: 14 }, (_, i) => ({ x: (i * 431) % 1800, y: 640 + ((i * 97) % 130), l: 20 + ((i * 53) % 40), k: 1 + (i % 2) }));

// ---------------------------------------------------------------- sprites: paint once, blit every frame
// Only what truly moves is drawn each frame. Everything else is painted ONCE (after the draw-in,
// when reveal reaches 1) into a surface cropped to its box, and blitted. A part that only changes
// in brightness (a rim flickering with its torch, the blue light going out) is painted at a
// reference intensity and blitted with alpha = intensity / reference. During the draw-in every
// part is painted live, with its real intensity, exactly as the cached one is painted.
type Box = [number, number, number, number];
const box = (pts: P[], pad: number): Box => { let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9; pts.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }); return [x0 - pad, y0 - pad, x1 + pad, y1 + pad]; };
const sprite = (g: Gfx, env: Env, key: string, bx: Box, live: boolean, k: number, ref: number, paint: (h: Gfx, k: number) => void, blend: GlobalCompositeOperation = "source-over", res = 1) => {
  if (k <= 0) return;
  if (live) return g.group("plain", () => paint(g, k), { blend });
  const s = env.scale, dx = Math.max(0, Math.floor(bx[0] * s)), dy = Math.max(0, Math.floor(bx[1] * s)), id = `p08:${key}:${s}`;
  let L = env.cache.get(id) as Layer | undefined;
  if (!L) {
    const w = Math.min(Math.ceil(1600 * s), Math.ceil(bx[2] * s)) - dx, h = Math.min(Math.ceil(900 * s), Math.ceil(bx[3] * s)) - dy;
    const rw = Math.max(1, Math.round(w * res)), rh = Math.max(1, Math.round(h * res));
    L = env.canvas(rw, rh);
    const hg = new Gfx(L.ctx, { ...env, W: w / s, H: h / s, scale: s * res }, 0, INK_M); hg.push(-dx / s, -dy / s, 1); paint(hg, ref);
    env.cache.set(id, L);
  }
  const c = g.main; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = clamp(k / ref); c.globalCompositeOperation = blend; c.imageSmoothingEnabled = true; c.drawImage(L.canvas as CanvasImageSource, dx, dy, Math.round(L.canvas.width / res), Math.round(L.canvas.height / res)); c.restore();
};
const penOf = (h: Gfx, progress: number) => (pts: P[], w: number, seed: number, color: string, op: number) => h.pen(pts, { w, color, seed, wobble: 0.5, boil: 0.3, taper: 1, opacity: op, retrace: false, progress });
const TORCH_OF = [1, 2, 3, 3, 2]; // which torch lights each rider of the frieze
// a rider of the frieze, brushed in solid
const warmRims = (h: Gfx, i: number, R: ReturnType<typeof rider>, w: number, rv: number, mask = true) => {
  const r = GANG[i], k = r.h / 100, pen = penOf(h, rv);
  masked(h, mask ? OCC : undefined, () => {
    pen([R.T([0.145, 1.71]), R.T([0.18, 1.702]), R.T([0.215, 1.712]), R.T([0.252, 1.69])], 1.1 * k, r.seed + 60, LAMP, 0.85 * w);
    pen([R.T([0.255, 1.465]), R.T([0.285, 1.4]), R.T([0.305, 1.29])], 1 * k, r.seed + 61, LAMP, 0.7 * w);
    pen(R.mane, 1 * k, r.seed + 62, LAMP, 0.6 * w);
    pen([R.T([0.42, 0.97]), R.T([0.56, 1.0]), R.T([0.68, 0.985]), R.T([0.765, 0.94])], 1 * k, r.seed + 63, LAMP, 0.55 * w);
  });
};
const riderBox1 = (i: number): Box => { const R = GANG_REST[i], h = GANG[i].h; return box([...R.horse, ...R.rider, ...R.tail, ...R.rifle, ...(R.stick ?? []), ...R.legs.flat()], 0.1 * h + 8); };
const EMBER_DOT = blob(0, 0, 1, 0.9, 850, 0.1, 5), STAR_DOTS = STARS.map(([x, y, r], i) => blob(x, y, r, r, 700 + i, 0.2, 6));
const RAGS = TORCHES.map((f, i) => ({ wrap: blob(f.at[0] - 1 * f.s, f.at[1] + 4 * f.s, 8 * f.s, 11 * f.s, 860 + i, 0.25, 10), burn: blob(f.at[0] - 1 * f.s, f.at[1] + 1 * f.s, 7 * f.s, 4 * f.s, 870 + i, 0.3, 8) }));
const torchBox = (i: number): Box => { const f = TORCHES[i], [x, y] = f.at, r = 1.72 * 150 * f.s; const bx: Box = [x - r, y - 20 * f.s - r, x + r, y - 20 * f.s + r]; if (i > 0) { const R = GANG_REST.filter((q) => q.flame)[i - 1], p = R.T([0.3, 0.12]), gi = GANG_REST.indexOf(R), pr = 1.72 * GANG[gi].h; bx[3] = Math.max(bx[3], p[1] + pr); bx[0] = Math.min(bx[0], p[0] - pr); bx[2] = Math.max(bx[2], p[0] + pr); } return bx; };
const COLD_C: [P[], number, number, number][] = [[CROWN.slice(0, 5), 1.2, 810, 0.7], [BRIM_NEAR.slice(0, 3), 1.1, 811, 0.6], [[[612, 398], [592, 404], [568, 414], [548, 428], [536, 450]], 1.2, 812, 0.55], [C_HEAD.slice(1, 8), 1.6, 813, 0.7]];
// Callahan's warm rims: the torch above and to the right
const WARM_C: [P[], number, number, string, number][] = [
  [CROWN.slice(7), 1.5, 800, LAMP, 0.9], [BRIM_NEAR.slice(5), 1.4, 801, LAMP, 0.75],
  [[[697, 344], [694, 354], [686, 362], [674, 372], [656, 380], [636, 386]], 2, 802, LAMP, 0.85], // the jaw
  [[[710, 398], [736, 406], [752, 414], [800, 402], [850, 392], [872, 386]], 1.4, 803, LAMP, 0.8], // shoulder and sleeve
  [[[878, 350], [880, 316]], 1.3, 804, LAMP, 0.8],
  [[[372, 462], [410, 466], [452, 488], [494, 528], [522, 566]], 2, 805, LAMP, 0.8], // the crest
  [[[652, 662], [700, 656], [756, 644], [792, 631]], 1.2, 806, EMBER, 0.8], [[[420, 698], [540, 683], [640, 667]], 1, 807, EMBER, 0.75], // steel and wood catch it
  [[FIST[1], FIST[2], FIST[3], FIST[4]], 1.4, 814, LAMP, 0.9],
];
const WARM_GROUPS = [WARM_C.slice(0, 5), WARM_C.slice(5, 6), WARM_C.slice(6, 8), WARM_C.slice(8)]; // hat, jaw and arm; the crest; the rifle; the fist
// the light in the air stops at the figures: it is cut out of the glow surfaces where they stand,
// so a glow never lightens the washes of a rider (which are lit by what was left unpainted)
const FIGS: P[][] = [...GANG_REST.flatMap((R, i) => [R.horse, R.rider, R.tail, R.rifle, ...R.legs, ...(R.arm ? [R.arm] : []), ...(i === 2 ? [R.fore, rider(GANG[2], -21).fore] : [])]), BODYSIL, FRONT, REAR, C_TAIL, HEADSIL, NECKERCHIEF];
const cutFigures = (h: Gfx) => { const c = h.cur; c.save(); c.globalCompositeOperation = "destination-out"; FIGS.forEach((f) => fillShape(h, f, "#000", 0.96)); c.restore(); };
const FLICK_REF = 1.6, BLUE_REF = 1.3; // warm rims blitted at <= 0.65: the light is mostly paper left bare

export const p08 = page({
  id: "p08", title: "Le Gang", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 14, seed: 990, at: 98, box: [940, 720, 1580, 890] },
  animAt: [56, 98],
  anim: (g, t, reveal, env) => {
    const T = TT(t), B = blueAt(t) * reveal, I = TORCHES.map((f) => flick(t, f.ph) * reveal), live = reveal < 1, rv = reveal;
    const pen = penOf(g, reveal), toss = tossAt(t), ear = Math.round(earAt(t));
    const S = (key: string, bx: Box, k: number, ref: number, paint: (h: Gfx, k: number) => void, blend?: GlobalCompositeOperation, res?: number) => sprite(g, env, key, bx, live, k, ref, paint, blend, res);

    // stars, the few the torches and the glow leave
    STAR_DOTS.forEach((d, i) => fillShape(g, d, "#f6ecd6", (0.55 + 0.2 * Math.sin(T * (2 + (i % 3)) + i)) * reveal));
    // the blue light behind the mesa: it lights the sky only, the rock stays a silhouette. A deep
    // blue laid first so it reads as BLUE over the night, then the light screened over it
    S("blueDeep", [0, 0, 724, 604], Math.min(1, B), 1, (h, k) => { clipped(h, ABOVE_MESA, () => masked(h, [BODYSIL, FRONT, HEADSIL], () => h.glow(GLOW_AT[0] - 20, GLOW_AT[1] - 10, 260, "#2f78d8", 0.42 * k))); cutFigures(h); });
    S("blueLight", [0, 0, 812, 604], B, BLUE_REF, (h, k) => { clipped(h, ABOVE_MESA, () => masked(h, [BODYSIL, FRONT, HEADSIL], () => {
      h.glow(GLOW_AT[0], GLOW_AT[1] - 20, 300, BLUE, 0.5 * k); h.glow(GLOW_AT[0] - 70, GLOW_AT[1], 140, BLUE, 0.7 * k); h.glow(GLOW_AT[0] + 60, GLOW_AT[1] + 4, 70, ICE, 0.6 * k);
    })); cutFigures(h); }, "screen");
    // each time it comes back it calls: a ring of light goes out over the rim and fades (the rings are
    // the upper halves of ellipses on the rim, so they never touch the rock)
    const rings = [38, 122].flatMap((s0, j) => [0, 7].map((lag, k) => ({ u: (t - s0 - 27 - lag + 2 * LOOP) % LOOP, j, k }))).filter((q) => q.u <= 40 && !live);
    if (rings.length) {
      const c = g.cur; c.save(); c.globalCompositeOperation = "screen"; c.strokeStyle = FROST; c.lineCap = "round";
      masked(g, [HEADSIL, BODYSIL], () => rings.forEach(({ u, k }) => {
        const r = 60 + u * 9; c.globalAlpha = 0.75 * (1 - u / 40) ** 1.5; c.lineWidth = 2.2 - k * 0.7;
        c.beginPath(); c.ellipse(GLOW_AT[0], GLOW_AT[1] + 6, r * 1.5, r * 0.55, 0, Math.PI * 1.08, Math.PI * 1.92); c.stroke();
      })); c.restore();
    }
    // torchlight in the air, and a pool on the ground under each rider's torch
    TORCHES.forEach((f, i) => S(`torch${i}`, torchBox(i), I[i], FLICK_REF, (h, k) => {
      h.glow(f.at[0], f.at[1] - 20 * f.s, 150 * f.s, LAMP, 0.42 * k); h.glow(f.at[0], f.at[1] - 24 * f.s, 50 * f.s, "#ffe2a8", 0.55 * k);
      if (i > 0) { const R = GANG_REST.filter((q) => q.flame)[i - 1], gi = GANG_REST.indexOf(R), p = R.T([0.3, 0.12]); h.glow(p[0], p[1], GANG[gi].h, LAMP, 0.2 * k); }
      cutFigures(h);
    }, "screen"));

    // the horse tossing its head: neck and head painted wet, glazed like the plate. The angle is
    // taken to the half degree (under a pixel at the muzzle) and each pose is painted once
    const qa = Math.round(toss * 2) / 2, R2 = rider(GANG[2], qa), h2 = GANG[2].h, k2 = h2 / 100;
    S(`neck${qa}`, box(R2.fore, 0.3 * h2), 1, 1, (h) => {
      const p2 = penOf(h, rv);
      h.group("paint", () => {
        h.wash(grow(R2.fore, 3), mix(UMBER, DARK, 0.3), { alpha: 0.55 * rv, seed: 538, dx: 5, dy: 4, shrink: 1.04, rim: true });
        clipped(h, grow(R2.fore, 4), () => h.wash(R2.fore.map(([x, y]) => [x, y + 0.06 * h2] as P), mix(SIL, SHADE, 0.3), { alpha: 0.9 * rv, seed: 558, dx: 5, dy: 4, shrink: 1.04, rim: true }));
        R2.ears.forEach((e) => fillShape(h, e, mix(SIL, SHADE, 0.3), 0.85 * rv));
      });
      p2(R2.face, 1.1 * k2, GANG[2].seed + 3, INK, 0.7); p2(R2.head.slice(8), 1.6 * k2, GANG[2].seed + 4, INK, 0.9); p2(R2.horse.slice(20, 25), 1.6 * k2, GANG[2].seed + 2, INK, 0.9);
      R2.mane.slice(0, 3).forEach((m, q) => p2([m, [m[0] + 5 * k2, m[1] + 9 * k2]], 1.2 * k2, GANG[2].seed + 27 + q, INK, 0.85));
      p2([R2.T([-0.02, 1.17]), R2.head[10]], 0.6 * k2, GANG[2].seed + 30, INK, 0.7);
    });

    // rims: warm where a torch reaches, cold on the side that faces the mesa
    [0, 1, 3, 4].forEach((i) => S(`rim${i}`, riderBox1(i), I[TORCH_OF[i]] * (GANG[i].torch ? 1 : 0.55), FLICK_REF, (h, w) => warmRims(h, i, GANG_REST[i], w, rv)));
    warmRims(g, 2, R2, I[TORCH_OF[2]] * 0.55, rv, false);
    [1, 4].forEach((i) => { const R = GANG_REST[i], k = GANG[i].h / 100; S(`cold${i}`, box([...R.face, R.T([0.05, 1.6]), R.T([0.145, 1.71])], 8), B, BLUE_REF, (h, b) => { const p = penOf(h, rv); masked(h, OCC, () => { p(R.face.slice(1, 6), 1 * k, GANG[i].seed + 64, FROST, 0.8 * b); p([R.T([0.05, 1.6]), R.T([0.14, 1.61]), R.T([0.145, 1.71])], 0.9 * k, GANG[i].seed + 65, FROST, 0.7 * b); }); }); });
    [COLD_C.slice(0, 3), COLD_C.slice(3)].forEach((cs, i) => S(`coldC${i}`, box(cs.flatMap(([pts]) => pts), 12), B, BLUE_REF, (h, b) => cs.forEach(([pts, w, seed, op]) => penOf(h, rv)(pts, w, seed, FROST, op * b))));
    // Callahan: the torch above and to the right
    WARM_GROUPS.forEach((ws, i) => S(`warmC${i}`, box(ws.flatMap(([pts]) => pts), 12), I[0], FLICK_REF, (h, k) => ws.forEach(([pts, w, seed, color, op]) => penOf(h, rv)(pts, w, seed, color, op * k))));
    S("glints", [EYE[0] - 6, EYE[1] - 6, EYE[0] + 10, EYE[1] + 6], I[0], FLICK_REF, (h, w) => fillShape(h, blob(EYE[0] + 2, EYE[1] - 1, 1.8, 1.6, 816, 0.1, 6), EMBER, 0.9 * w)); // the horse's eye
    S("glint2", [636, 328, 648, 340], I[0], FLICK_REF, (h, w) => fillShape(h, blob(642, 334, 1.4, 1.2, 817, 0.1, 6), EMBER, 0.7 * w)); // and his, under the brim
    // the mesa's edge, drawn in the other hand: white-blue
    S("mesaRim", [0, 290, 580, 360], B, BLUE_REF, (h, b) => { const p = penOf(h, rv); p(MESA.slice(1, 9), 1.8, 820, ICE, 0.95 * b); p(MESA.slice(3, 7), 3, 821, FROST, 0.5 * b); }, "screen");
    // Callahan's horse flicks an ear back
    const e = C_EARS.near.map((q) => rot(q, C_HEAD[0], ear)); // to the degree, each pose painted once
    S(`ear${ear}`, box([...e, ...C_EARS.far], 10), 1, 1, (h) => { const p = penOf(h, rv); h.group("paint", () => { fillShape(h, C_EARS.far, mix(DARK, UMBER, 0.3), 0.8 * rv); fillShape(h, e, mix(SIENNA, DARK, 0.45), 0.8 * rv); }); p(e.slice(0, 3), 1.6, 840, INK, 0.9); p(C_EARS.far.slice(0, 3), 1.2, 842, INK, 0.8); });
    pen(e.slice(2), 1, 841, LAMP, 0.6 * I[0]);

    // the flames, their embers and their smoke
    TORCHES.forEach((f, i) => {
      const [x, y] = f.at;
      for (let k = 0; k < 4; k++) { const q = (t / 90 + k / 4 + i * 0.13) % 1, px = x - 50 * f.s * q + Math.sin(q * 6 + i) * 8 * f.s, py = y - 70 * f.s - 150 * f.s * q, r = (8 + 30 * q) * f.s; fillShape(g, PUFF.map(([u, v]) => [px + u * r, py + v * r] as P), q < 0.35 ? mix("#b89a80", LAMP, 0.35) : mix(DUSK, "#b89a80", 0.5), 0.3 * Math.sin(Math.PI * q) * reveal); }
      fillShape(g, RAGS[i].wrap, SIL, 0.95 * reveal); // the rag wrapped on the stick
      const [a, b, c] = flameShapes(x, y, f.s, t, f.ph), [a2] = flameShapes(x + 5 * f.s, y + 2 * f.s, f.s * 0.7, t, f.ph + 2.4);
      fillShape(g, a2, FLAME, 0.85 * reveal); fillShape(g, a, FLAME, 0.9 * reveal); fillShape(g, b, LAMP, 0.95 * reveal); fillShape(g, c, HOT, reveal);
      fillShape(g, RAGS[i].burn, EMBER, 0.8 * reveal); // the rag burning
      for (let k = 0; k < 5; k++) { const q = (t / 60 + k / 5 + i * 0.37) % 1, px = x + (Math.sin(q * 9 + k * 2 + i) * 14 - 24 * q) * f.s, py = y - 40 * f.s - 110 * f.s * q, rr = 1.8 * (1 - q) + 0.5; fillShape(g, EMBER_DOT.map(([u, v]) => [px + u * rr, py + v * rr] as P), EMBER, (1 - q) * reveal); }
    });
    if (reveal < 1) return;
    // dust along the trail, lit where it drifts through the torchlight
    DUST.forEach((d, i) => { const x = 1700 - ((d.x + (t / LOOP) * 1800 * d.k) % 1800), y = d.y + Math.sin(T * d.k + i) * 5; pen([[x, y], [x + d.l * 0.5, y - 1.5], [x + d.l, y + 1]], 0.7, 870 + i, "#d9b27a", 0.3); });
  },
});
