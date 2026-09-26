// PAGE 5 · LE CRATERE. One idea: something that does not belong to this paper has landed in it.
// Focal subject: the pebble-smooth ship stuck nose-down in a fresh crater on the mesa, its tail
// standing up out of the hole against the sky, its hatch open. Secondary: the blue crystal shard
// pulsing on the glassed sand at your feet.
// Both hands: the land, the rocks, the smoke, the torches are sepia; only the alien things (ship,
// crystal, their light) are drawn in the cyanotype hand. The ship is painted opaque over the plate
// (a dark back, a pale flank lit from the floor, the terminator between, a white rim on top).
// One light: the blue light pouring out of the hatch's dark mouth, down onto the crater floor. It
// fans across the floor, lights the far wall and the far lip, catches the slivers of the glass crust
// and the smoke's belly; the near inner wall faces away from it and sits in shadow, and the rocks'
// shadows fall away to the left. The torches climbing the far spur are tiny warm counterpoints.
// What moves: the hatch glow breathing, the crystal pulsing, smoke rolling up out of the crater,
// the torches flickering as they creep up the trail, glints running over the glass.
import { drawShip, type ShipPose } from "./ship";
import { arc, oval, rng, type P } from "./core";
import { blob, bounds, clipped, fillShape, inside, lerpP } from "./gallery";
import { CYAN, SEPIA, page, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { ink: INK, paper: PAPER, umber: UMBER, sienna: SIENNA, dark: DARK, shade: SHADE, lamp: LAMP } = SEPIA;
const NIGHT = "#3b2c3e", LINE = "#dff3ff", LINE2 = "#9cc3f0", BLUE = "#6fb6ff";
const pts = (a: number[][]) => a as P[];

// ---------------------------------------------------------------- the land, as geometry
// the far rim of the mesa, the far plain beyond it, the buttes on the horizon
const FAR_RIM = pts([[-40, 346], [300, 342], [620, 348], [900, 344], [1150, 348]]);
const BUTTES = pts([[-40, 318], [60, 314], [84, 297], [168, 294], [190, 313], [430, 320], [466, 302], [520, 299], [544, 318], [1640, 326]]);
// the mesa's own edge swings toward you on the right: beyond it the drop, and across the drop a spur
const EDGE = pts([[1150, 348], [1262, 374], [1362, 422], [1452, 492], [1530, 568], [1640, 676]]);
const MESA: P[] = [...FAR_RIM, ...EDGE, [1640, 960], [-40, 960]];
const SPUR = pts([[1236, 640], [1250, 380], [1272, 356], [1330, 345], [1460, 339], [1640, 334], [1640, 700]]);
const TRAIL = pts([[1650, 590], [1510, 520], [1600, 470], [1424, 420], [1570, 388], [1390, 362], [1334, 347]]);
// a trail seen from far off: a pale thread, so the washes leave it paper
const band = (a: P, b: P, w: number): P[] => { const l = Math.hypot(b[0] - a[0], b[1] - a[1]), nx = (-(b[1] - a[1]) / l) * w, ny = ((b[0] - a[0]) / l) * w; return [[a[0] + nx, a[1] + ny], [b[0] + nx, b[1] + ny], [b[0] - nx, b[1] - ny], [a[0] - nx, a[1] - ny]]; };
const TRAIL_BANDS = TRAIL.slice(1).map((b, i) => band(lerpP(TRAIL[i], b, 0.02), lerpP(TRAIL[i], b, 0.98), 1.6));

// the crater: an irregular raised lip, the floor, the foot of the near lip, the ring of glass
const C: P = [760, 540], RX = 470, RY = 145;
const lipR = (a: number) => 1 + 0.03 * Math.sin(3 * a + 1) + 0.02 * Math.sin(7 * a + 2) + 0.012 * Math.sin(13 * a);
const cp = (a: number, dx = 0, dy = 0): P => [C[0] + Math.cos(a) * (RX + dx) * lipR(a), C[1] + Math.sin(a) * (RY + dy) * lipR(a)];
const ring = (a0: number, a1: number, n: number, dx = 0, dy = 0) => Array.from({ length: n }, (_, i) => cp(a0 + ((a1 - a0) * i) / (n - 1), dx, dy));
const CREST_FAR = ring(Math.PI - 0.02, Math.PI * 2 + 0.02, 30), CREST_NEAR = ring(0, Math.PI, 30), CRATER = ring(0, Math.PI * 2, 60).slice(0, -1);
const FLOOR_FAR = arc(770, 580, 400, 96, Math.PI * 1.05, Math.PI * 1.95, 18);
const FAR_WALL: P[] = [...CREST_FAR, ...FLOOR_FAR.slice().reverse()];
const FOOT_NEAR = ring(0.1, Math.PI - 0.1, 24, 58, 32);

// the near inner wall, turned away from us and from the light: a band of shadow inside the near lip
const NEAR_WALL: P[] = [...ring(0.08, Math.PI - 0.08, 28), ...ring(Math.PI - 0.16, 0.16, 28, -40, -46)];
// the far lip, raised: its top catches the light, a thin band outside the far crest
const FAR_LIP: P[] = [...ring(Math.PI + 0.1, Math.PI * 2 - 0.1, 28, 4, 2), ...ring(Math.PI * 2 - 0.18, Math.PI + 0.18, 28, 26, 13)];

// ---------------------------------------------------------------- the ship
// a river pebble as long as a stagecoach, tilted nose-down: the nose has ploughed into the far
// right wall of the crater, the tail stands up out of the hole against the sky. Built in its own
// frame (u along its length, -1 tail to +1 nose; k across it, negative up the back) then turned.
const SC: P = [800, 454], SA = 285, SB = 112, TILT = (22 * Math.PI) / 180;
const S = ([x, y]: P): P => [SC[0] + x * Math.cos(TILT) - y * Math.sin(TILT), SC[1] + x * Math.sin(TILT) + y * Math.cos(TILT)];
const prof = (u: number) => Math.sqrt(Math.max(0, 1 - u * u)) * (1 - 0.22 * u); // full at the tail, tapering to the nose
const BACK_W = 1, BELLY_W = 0.82;
const loc = (u: number, k: number): P => [u * SA, k * SB * prof(u)];
const us = (n: number) => Array.from({ length: n + 1 }, (_, i) => -Math.cos((Math.PI * i) / n)); // bunched at the ends, so both round off
// the nose is buried past a contact curve that runs from the belly obliquely up the back
// only the tip of the nose is in the sand, so the pebble's taper shows
const CONTACT_X = 230, HEAP_SHIFT: P = [74, 30];
const buried = ([x, y]: P) => x > CONTACT_X - 0.28 * y - 0.0022 * y * y;
const cut = (k: number, n = 30) => us(n).map((u) => loc(u, k)).filter((p) => !buried(p));
const CONTACT_L: P[] = Array.from({ length: 9 }, (_, i) => { const y = -SB * 0.95 + (i / 8) * SB * 1.72; return [CONTACT_X - 0.28 * y - 0.0022 * y * y, y] as P; }).filter(([x, y]) => Math.abs(y) < SB * prof(x / SA) * (y < 0 ? BACK_W : BELLY_W));
const SHIP_VIS: P[] = [...cut(-BACK_W), ...CONTACT_L, ...cut(BELLY_W).reverse()].map(S);
const CONTACT = CONTACT_L.map(S);
const POSE: ShipPose = { c: SC, ang: TILT, len: SA };
// everything past the contact curve is inside the sand
const BURIED: P[] = ([...Array.from({ length: 13 }, (_, i) => { const y = -SB * 1.6 + (i / 12) * SB * 3.2; return [CONTACT_X - 0.28 * y - 0.0022 * y * y, y] as P; }), [SA * 1.6, SB * 1.6], [SA * 1.6, -SB * 1.6]] as P[]).map(S);
// the hatch on the lit flank: a dark mouth, the light pouring out of its lower lip
const HATCH_C = S(loc(-0.28, 0.3)), HROT = TILT;
const hatchPt = (a: number, rx = 50, ry = 30): P => [HATCH_C[0] + Math.cos(a) * rx * Math.cos(HROT) - Math.sin(a) * ry * Math.sin(HROT), HATCH_C[1] + Math.cos(a) * rx * Math.sin(HROT) + Math.sin(a) * ry * Math.cos(HROT)];
// the light spills out of the hatch, down onto the floor, and fans across it to the near wall
const FOOT_L: P = [660, 604], FOOT_R: P = [790, 600], FAN_L = 2.12, FAN_R = 1.18;
const FAN: P[] = [FOOT_L, FOOT_R, ...ring(FAN_R, FAN_L, 12, -36, -40)];
const FLOOR: P[] = [...ring(FAN_L, Math.PI * 2 + FAN_R, 50, -2, -2), FOOT_R, FOOT_L];
const BEAM: P[] = [hatchPt(Math.PI * 0.95), hatchPt(Math.PI * 0.05), [FOOT_R[0] + 40, FOOT_R[1] + 20], [FOOT_L[0] - 40, FOOT_L[1] + 22]];
// the ploughed sand heaped over the nose, spilling a little onto the hull
const MOUND: P[] = (() => { const top = CONTACT[0], bot = CONTACT[CONTACT.length - 1]; return [[top[0] - 40, top[1] - 10], [top[0] - 6, top[1] - 26], [top[0] + 50, top[1] - 30], [top[0] + 120, top[1] - 4], [bot[0] + 150, bot[1] - 10], [bot[0] + 90, bot[1] + 22], [bot[0] - 10, bot[1] + 22], [bot[0] - 50, bot[1] + 10]]; })();
// the heap of ploughed sand over the nose, drawn over the hull: its face toward the hatch is a
// bumpy edge a little tail-ward of the contact, its back rounds off into the far wall
// the heap follows the contact: drawn where it was first placed, shifted to where the nose now goes in
const heapPts = (a: number[][]) => a.map(([x, y]) => [x + HEAP_SHIFT[0], y + HEAP_SHIFT[1]] as P);
const HEAP_EDGE = heapPts([[994, 430], [972, 444], [960, 462], [946, 474], [938, 496], [921, 510], [908, 532], [886, 546], [862, 566], [836, 584]]);
const HEAP: P[] = [...HEAP_EDGE, ...heapPts([[868, 590], [920, 596], [980, 590], [1040, 580], [1100, 560], [1136, 532], [1130, 496], [1096, 464], [1052, 440], [1014, 428]])];
const HEAP_LIT: P[] = [...HEAP_EDGE, ...heapPts([[850, 580], [880, 562], [912, 546], [930, 524], [950, 506], [960, 484], [978, 466], [996, 450], [1012, 436]])];
const HEAP_HATCH = [[1060, 452, 1070, 480], [1096, 474, 1100, 504], [1122, 500, 1120, 534], [1030, 440, 1044, 470], [1100, 540, 1086, 572], [1060, 560, 1040, 590]].map(([a, b, c, d]) => heapPts([[a, b], [(a + c) / 2 + 3, (b + d) / 2], [c, d]]));

// the glass: a splash a little wider than the rim, thrown out in a tongue toward the reader
const CRY: P = [1060, 786];
const GLASS: P[] = Array.from({ length: 56 }, (_, i) => { const a = (i / 56) * Math.PI * 2, d = Math.atan2(Math.sin(a - 1.1), Math.cos(a - 1.1)), f = 1 + 0.2 * Math.exp(-(d * d) / 0.06) + 0.05 * Math.sin(a * 3 + 1) + 0.03 * Math.sin(a * 8 + 2); return [C[0] + Math.cos(a) * 570 * f, 560 + Math.sin(a) * 210 * f] as P; });

// ejecta: chunks of the mesa thrown up onto the lip
const BOULDERS = [[0.35, 34, 16, 13], [0.72, 46, 22, 12], [1.02, 30, 14, 10], [1.62, 60, 26, 15], [2.02, 38, 18, 11], [2.46, 30, 24, 14], [2.86, 44, 20, 12], [3.2, 26, 14, 10], [5.95, 30, 18, 12]].map(([a, d, w, h], i) => { const [x, y] = cp(a, d, d * 0.4), r = rng(470 + i); return pts([[x - w, y + 2], [x - w * (0.5 + r() * 0.3), y - h * (0.6 + r() * 0.4)], [x + w * (0.1 + r() * 0.3), y - h], [x + w, y - h * (0.2 + r() * 0.4)], [x + w * 0.9, y + 3]]); });

// ---------------------------------------------------------------- the crystal, the rocks, the tracks
// a shard like a quartz prism lying on the glass, pointed end up and toward the crater
const cry = (a: number[][]) => a.map(([x, y]) => [CRY[0] + x * 1.2, CRY[1] + y * 1.2] as P);
const CRYSTAL = cry([[-58, 10], [-46, -6], [30, -34], [66, -30], [52, -8], [-30, 20]]);
const CRY_RIDGE = cry([[-52, 3], [40, -20], [66, -30]]);
const CHIPS = [cry([[-82, 22], [-70, 13], [-64, 21], [-75, 27]]), cry([[76, 4], [88, -5], [92, 4], [82, 9]])];
const ROCK1 = pts([[-10, 580], [-4, 520], [14, 488], [38, 472], [56, 442], [108, 430], [150, 436], [170, 458], [196, 472], [210, 522], [214, 580]]);
const ROCK2 = pts([[180, 594], [186, 556], [204, 540], [222, 522], [262, 518], [288, 536], [300, 566], [302, 596]]);
const ROCKS = [ROCK1, ROCK2];
// two dark stones right under you, framing the bottom corners
const NEAR_L = pts([[-40, 900], [-30, 820], [10, 786], [70, 776], [120, 800], [150, 850], [170, 900]]), NEAR_R = pts([[1440, 900], [1470, 856], [1530, 830], [1600, 826], [1640, 834], [1640, 900]]);
const ROCK_RIDGES = [pts([[108, 430], [116, 480], [104, 530], [110, 580]]), pts([[262, 518], [252, 556], [258, 594]])];
// something wounded dragged itself out of the hatch, over the lip, into the rocks
const DRAG: P[] = [[712, 604], [650, 630], [572, 650], [484, 660], [404, 650], [344, 630], [300, 608], [262, 588], [236, 574]];
const along = (q: P[], t: number) => { const k = t * (q.length - 1), j = Math.min(q.length - 2, Math.floor(k)); return lerpP(q[j], q[j + 1], k - j); };
const offset = (q: P[], d: number): P[] => q.map((p, i) => { const a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)], l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [p[0] - ((b[1] - a[1]) / l) * d * 0.4, p[1] + ((b[0] - a[0]) / l) * d * 0.5]; });
const pieces = (q: P[], n: number, keep: number, seed: number) => { const r = rng(seed); return Array.from({ length: n }, (_, i) => { const t0 = (i + r() * 0.2) / n, t1 = t0 + (keep / n) * (0.7 + r() * 0.3); return [along(q, t0), along(q, (t0 + t1) / 2), along(q, Math.min(1, t1))]; }); };

// ---------------------------------------------------------------- the glass crust, the sky
const inGlass = (x: number, y: number, m = 0) => inside(GLASS, x, y) && !inside(oval(C[0], C[1] + 6, RX + 34 + m, RY + 20 + m, 30, 0), x, y) && !inside(oval(CRY[0], CRY[1] - 8, 90 + m, 40 + m, 12), x, y) && ![...ROCKS, ...BOULDERS].some((q) => inside(q, x, y));
const CRACKS = (() => { const r = rng(300), out: Omit<Stroke, "at">[] = []; let tries = 0; while (out.length < 70 && tries++ < 1500) { const x = 180 + r() * 1180, y = 350 + r() * 480; if (!inGlass(x, y)) continue; const n = 3 + Math.floor(r() * 3), q: P[] = [[x, y]]; let a = r() * 6.28; for (let k = 0; k < n; k++) { a += (r() - 0.5) * 1.8; const l = 10 + r() * 16, [px, py] = q[q.length - 1]; q.push([px + Math.cos(a) * l, py + Math.sin(a) * l * 0.45]); } if (q.every(([u, v]) => inGlass(u, v))) out.push(st(q, 0.8 + r() * 0.8, 310 + out.length, 0.6 + r() * 0.3, 0.3)); } return out; })();
// slivers of the crust tilted toward the hatch: bare paper, the blue lands on them
const SHINE = (() => { const r = rng(360), out: P[][] = [], at: P[] = []; let tries = 0; while (out.length < 24 && tries++ < 900) { const a = 0.1 + r() * (Math.PI - 0.2) + (r() < 0.25 ? Math.PI : 0), f = 0.88 + r() * 0.18, x = C[0] + Math.cos(a) * 540 * f, y = 560 + Math.sin(a) * 196 * f; if (!inGlass(x, y, 10) || at.some(([u, v]) => Math.hypot(u - x, (v - y) * 2) < 64)) continue; const l = 22 + r() * 34, t = a + Math.PI / 2, dx = Math.cos(t) * l, dy = Math.sin(t) * l * 0.35; at.push([x, y]); out.push([[x - dx, y - dy], [x - dx * 0.3, y - dy * 0.3 - 5], [x + dx * 0.4, y + dy * 0.4 - 3], [x + dx, y + dy], [x + dx * 0.2, y + dy * 0.2 + 2]]); } return out; })();
// ejecta: streaks thrown out over the glass, and clods of it
const RAYS = [0.25, 0.55, 0.8, 1.05, 1.4, 1.75, 2.05, 2.35, 2.7, 2.95, 3.3, 6.1].map((a, i) => [cp(a, 44 + (i % 3) * 10, 20), cp(a + 0.02, 100 + (i % 4) * 22, 50 + (i % 3) * 8)]);
const CLODS = (() => { const r = rng(420), out: P[] = []; let tries = 0; while (out.length < 26 && tries++ < 600) { const a = r() * Math.PI * 2, f = 1.12 + r() * 0.2, x = C[0] + Math.cos(a) * RX * f, y = C[1] + 10 + Math.sin(a) * RY * f * 1.15; if (inGlass(x, y) && !(a > Math.PI + 0.3 && a < Math.PI * 2 - 0.3)) out.push([x, y]); } return out; })();
const STARS = (() => { const r = rng(40), out: P[][] = []; while (out.length < 46) { const x = r() * 1600, y = 10 + r() * r() * 300; if (y > 300 || (x > 560 && x < 1060 && y > 120)) continue; const s = r() < 0.18 ? 2.5 : 1.1 + r() * 0.7; out.push(oval(x, y, s, s, 6)); } return out; })();

// ---------------------------------------------------------------- the pen
const cyan = (q: P[], w: number, seed: number, op = 0.95, color = LINE2, hide?: P[][]) => ({ ...st(q, w, seed, op, 0.35), color, hide });
// a shape drawn edge by edge, so its corners stay corners (the pen smooths through a vertex)
const edges = (q: P[], w: number, seed: number, op = 0.9, color?: string, shut = true) => q.slice(0, shut ? q.length : -1).map((a, i) => ({ ...st([a, q[(i + 1) % q.length]], w * (i % 2 ? 0.8 : 1), seed + i, op, 0.3), color }));
const marks = (() => { const r = rng(700), out: Omit<Stroke, "at">[] = []; while (out.length < 50) { const x = r() * 1600, y = 360 + r() * 540; if (!inside(MESA, x, y) || inside(GLASS, x, y) || ROCKS.some((q) => inside(q, x, y))) continue; const k = 0.4 + (y - 340) / 560, l = (6 + r() * 12) * k; out.push(st([[x, y], [x + l * 0.5, y - 1], [x + l, y + 0.8]], 0.6 + k * 0.9, 710 + out.length, 0.35 + 0.3 * k, 0.4)); } return out; })();
const tuft = (x: number, y: number, k: number, seed: number) => st([[x - k * 0.7, y - k * 0.8], [x - k * 0.2, y], [x + k * 0.05, y - k * 1.3], [x + k * 0.25, y], [x + k * 0.8, y - k * 0.9]], 0.5 + k / 22, seed, 0.8, 0.5);
// the rocks' backs, turned from the light: hatching left of each ridge
const rockHatch = ROCKS.flatMap((q, j) => Array.from({ length: j ? 5 : 8 }, (_, i) => { const x = q[0][0] + 16 + i * 11, y0 = ROCK_RIDGES[j][0][1] + 18 + ((i * 17) % 22), y1 = q[0][1] - 8 - ((i * 11) % 16); return st([[x, y0], [x - 9, y1]], 0.8, 150 + j * 10 + i, 0.55, 0.5); }).filter((s) => inside(q, ...s.pts[0]) && inside(q, ...s.pts[1])));
// the spur's face: a few strata and the vertical breaks of a cliff under its lip
const strata = (() => { const r = rng(120); return [372, 404, 446, 494, 544].map((y, i) => { const x0 = 1262 + r() * 50 + i * 20; return st([[x0, y + 4], [x0 + 120, y + r() * 6 - 2], [x0 + 250, y - 3 + r() * 6], [1640, y - 8]], 0.6 + r() * 0.4, 120 + i, 0.3 + r() * 0.15, 1.4); }).concat(Array.from({ length: 12 }, (_, i) => { const x = 1280 + i * 30 + r() * 12, y = 346 - (x - 1280) * 0.03; return st([[x, y + 3], [x + 2, y + 16 + r() * 18]], 0.7, 130 + i, 0.5, 0.4); })); })();
// the far wall slumps in streaks toward the floor; ejecta thrown out over the glass
const slumps = Array.from({ length: 18 }, (_, i) => { const a = Math.PI + 0.2 + (i / 17) * (Math.PI - 0.4), p = cp(a, -4, -3), q = lerpP(p, [770 + Math.cos(a) * 400, 580 + Math.sin(a) * 96], 0.55 + ((i * 7) % 5) * 0.08); return st([p, lerpP(p, q, 0.5), q], 0.8, 200 + i, 0.4, 0.8); });
const rays = RAYS.map(([a, b], i) => st([a, lerpP(a, b, 0.5), b], 1 + (i % 3) * 0.3, 220 + i, 0.5, 0.6));
const clods = CLODS.map(([x, y], i) => st([[x, y], [x + 2 + (i % 3), y + 0.6]], 2.6 + (i % 4) * 0.8, 240 + i, 0.9, 0.3));
// drops along the tracks, in the other hand: whatever bled here bled blue
const drops = [0.12, 0.2, 0.33, 0.46, 0.54, 0.7, 0.84, 0.93].map((t, i) => { const [x, y] = along(DRAG, t); return cyan([[x + ((i * 7) % 11) - 5, y + ((i * 5) % 9) - 4], [x + ((i * 7) % 11) - 3, y + ((i * 5) % 9) - 4]], 2.2 - (i % 3) * 0.4, 280 + i, 0.95, LINE2); });

const strokes: Stroke[] = [
  // 1. the land: far rim, buttes, the mesa edge swinging round, the spur across the drop
  ...seq([st(FAR_RIM, 1.8, 1, 0.9), st(BUTTES, 1, 2, 0.55), st(EDGE, 2.8, 3, 0.95), st(SPUR.slice(1, 6), 1.5, 4, 0.8)], 0, 14),
  // 2. the crater: its crest, the floor's far edge, the foot of the lip, the glass splash
  ...seq([st(CREST_FAR, 2.4, 10, 0.95), st(CREST_NEAR, 3, 11, 0.95), st(FLOOR_FAR, 1.2, 12, 0.6), st(FOOT_NEAR, 1.4, 13, 0.55), st([...GLASS.slice(30), ...GLASS.slice(0, 16)], 1.1, 14, 0.5)], 8, 28, 0.35, [SHIP_VIS]),
  // 3. the ship, in the other hand: one long fast back line, the belly, the hatch; the heaped sand
  ...seq([st([...MOUND.slice(0, 6)], 1.8, 30, 0.9, 0.9), st(MOUND.slice(5), 1.4, 31, 0.7), ...BOULDERS.flatMap((q, i) => edges(q, 1.6, 300 + i * 6, 0.9, undefined, false))], 34, 48),
  // 4. the rocks, the trail on the spur, the drag tracks
  ...seq([...ROCKS.flatMap((q, i) => edges(q, 2.6 - i * 0.4, 40 + i * 20, 0.95, undefined, false)), ...ROCK_RIDGES.map((q, i) => st(q, 1.2, 80 + i, 0.7, 0.6))], 38, 54),
  ...seq(TRAIL.slice(1).map((b, i) => st([TRAIL[i], b], 0.8, 50 + i, 0.4, 0.5)), 44, 56, 0.3, [MESA]),
  ...seq([...pieces(offset(DRAG, 9), 10, 0.8, 60), ...pieces(offset(DRAG, -9), 10, 0.75, 70)].map((p, i) => st(p, 1.6 + (i % 3) * 0.4, 84 + i, 0.9, 0.5)), 46, 62, 0.4, [SHIP_VIS, ROCK2]),
  ...seq([0.25, 0.5, 0.75].map((k, i) => st([lerpP(CONTACT[0], CONTACT[CONTACT.length - 1], k), lerpP(MOUND[3], MOUND[4], k)], 0.9, 290 + i, 0.55, 0.8)), 46, 54),
  // 5. details: the ship's sheen, the crystal, the far wall, the crackle of the glass, strata
  ...seq([
    ...edges(CRYSTAL, 2.2, 160, 1, LINE), cyan(CRY_RIDGE, 1.3, 170, 0.9, LINE), cyan([CRY_RIDGE[1], CRYSTAL[2]], 1, 171, 0.8, LINE), cyan([cry([[-6, -8]])[0], cry([[2, 16]])[0]], 1, 172, 0.7, LINE2),
    ...CHIPS.flatMap((q, i) => edges(q, 1, 174 + i * 5, 0.8, LINE)), ...drops,
  ], 54, 70),
  ...seq([...slumps, ...rays], 58, 76, 0.35, [SHIP_VIS]),
  ...seq(CRACKS, 60, 86),
  ...seq(Array.from({ length: 30 }, (_, i) => { const a = 0.2 + (i / 29) * (Math.PI - 0.4), p = cp(a, -3, -3), q = cp(a + 0.01, -34, -40); return st([p, lerpP(p, q, 0.55 + (i % 3) * 0.15)], 0.8, 330 + i, 0.5, 0.4); }), 70, 88),
  ...seq((() => { const r = rng(380), out: Omit<Stroke, "at">[] = []; let n = 0; while (out.length < 26 && n++ < 400) { const x = 330 + r() * 860, y = 470 + r() * 170; if (!inside(FLOOR, x, y) || inside(SHIP_VIS, x, y) || inside(NEAR_WALL, x, y) || inside(FAR_WALL, x, y) || inside(FAN, x, y)) continue; const l = 4 + r() * 8; out.push(st([[x, y], [x + l, y + (r() - 0.5) * 2]], 1 + r() * 1.4, 360 + out.length, 0.6, 0.4)); } return out; })(), 72, 90),
  ...seq([...strata, ...rockHatch], 64, 84, 0.3, [MESA]),
  ...seq([...marks, ...clods, tuft(120, 820, 24, 176), tuft(168, 846, 18, 177), tuft(1440, 812, 26, 178), tuft(1492, 850, 20, 179), tuft(560, 872, 22, 180), tuft(1250, 640, 12, 181), tuft(380, 400, 9, 182)], 66, 92),
  ...seq([...edges(NEAR_L, 3, 260, 0.95, undefined, false), ...edges(NEAR_R, 3, 270, 0.95, undefined, false)], 30, 40),
  // 6. last darks: the second searching line under the near lip, the sand line, the rocks' feet
  ...seq([st(CREST_NEAR.slice(3, 26), 4.2, 190, 0.85), ...ROCKS.map((q, i) => st([q[0], q[q.length - 1]], 3.4 - i, 191 + i, 0.9)), st(ring(Math.PI - 0.3, 0.3, 20, -40, -46), 1.4, 195, 0.6)], 88, 100, 0.35),
];

// ---------------------------------------------------------------- the washes, flooding out of the hatch
// the crown of the hull catches the lit smoke above it: a patch of pale body colour, the flanks in blue
const sky = (y1: number): P[] => [[-40, -40], [1640, -40], [1640, y1], [1100, y1 + 8], [500, y1 - 6], [-40, y1]];
const washes: Wash[] = [
  // the night: violet over everything above the land, the ink gathering in the top corners; stars left paper
  { pts: sky(352), color: SHADE, alpha: 0.6, seed: 500, pool: 0.2, at: [46, 72], from: [800, -120], hide: STARS },
  { pts: sky(330), color: NIGHT, alpha: 0.45, seed: 501, pool: 0.1, at: [48, 76], from: [800, -120], hide: STARS },
  { pts: pts([[-40, -40], [1000, -40], [930, 40], [900, 96], [836, 150], [820, 214], [756, 262], [736, 330], [-40, 330]]), color: NIGHT, alpha: 0.42, seed: 503, pool: 0, at: [50, 78], from: [800, -120], hide: STARS },
  { pts: pts([[1640, -40], [1250, -40], [1130, 46], [1110, 120], [1016, 186], [996, 256], [936, 296], [924, 330], [1640, 330]]), color: NIGHT, alpha: 0.42, seed: 504, pool: 0, at: [50, 78], from: [800, -120], hide: STARS },
  { pts: [[-40, 290], [1640, 290], [1640, 356], [-40, 356]], color: NIGHT, alpha: 0.5, seed: 502, pool: 0.5, at: [50, 74], from: HATCH_C, clip: [[-40, 300], ...BUTTES, [1640, 360], [-40, 360]] },
  // the land: the mesa top in shade, darker toward you; the spur across the drop, dark
  { pts: MESA, color: SHADE, alpha: 0.55, seed: 510, pool: 0.4, at: [52, 80], from: HATCH_C, ph: 1, hide: [CRATER, FAR_LIP, CRYSTAL] },
  { pts: [[-40, 700], [500, 750], [1000, 820], [1640, 700], [1640, 960], [-40, 960]], color: DARK, alpha: 0.45, seed: 511, pool: 0.6, at: [60, 86], from: [800, 960], ph: 1, hide: [CRYSTAL] },
  { pts: SPUR, color: UMBER, alpha: 0.5, seed: 512, pool: 0.5, at: [54, 80], from: [1300, 350], ph: 1, hide: [MESA] },
  { pts: SPUR, color: NIGHT, alpha: 0.5, seed: 513, pool: 0.7, at: [56, 82], from: [1300, 350], ph: 1, hide: [MESA, ...TRAIL_BANDS] },
  // the crater: the floor dark but for the fan of light, the far wall in the ship's own shadow
  { pts: FLOOR, color: SHADE, alpha: 0.5, seed: 524, pool: 0.3, at: [56, 82], from: HATCH_C, ph: 2 },
  { pts: FLOOR, color: DARK, alpha: 0.5, seed: 520, pool: 0.3, at: [58, 84], from: HATCH_C, ph: 2 },
  { pts: FAN, color: CYAN.pale, alpha: 0.35, seed: 523, pool: 0.1, at: [56, 80], from: HATCH_C, ph: 2 },
  { pts: FAR_WALL, color: CYAN.pale, alpha: 0.3, seed: 522, pool: 0.2, at: [60, 86], from: HATCH_C, ph: 3 },
  { pts: FAR_WALL, color: SHADE, alpha: 0.28, seed: 525, pool: 0.7, at: [62, 88], from: HATCH_C, ph: 3 },
  { pts: FAR_LIP, color: CYAN.pale, alpha: 0.3, seed: 528, at: [62, 88], from: HATCH_C, ph: 3 },
  { pts: NEAR_WALL, color: DARK, alpha: 0.6, seed: 526, pool: 0.2, at: [64, 90], from: HATCH_C, ph: 3 },
  { pts: NEAR_WALL, color: NIGHT, alpha: 0.45, seed: 527, pool: 0.6, at: [66, 92], from: HATCH_C, ph: 3 },
  { pts: [...CREST_NEAR, ...FOOT_NEAR.slice().reverse()], color: DARK, alpha: 0.45, seed: 521, pool: 0.3, at: [62, 88], from: HATCH_C, ph: 2 },
  // the glass: dark and glossy, its slivers left paper to catch the blue
  { pts: GLASS, color: DARK, alpha: 0.5, seed: 530, pool: 0.3, at: [60, 88], from: HATCH_C, ph: 2, hide: [CRATER, FAR_LIP, CRYSTAL, ...ROCKS, ...SHINE] },
  { pts: GLASS, color: UMBER, alpha: 0.3, seed: 531, pool: 0.8, at: [64, 90], from: HATCH_C, ph: 2, hide: [CRATER, FAR_LIP, CRYSTAL, ...ROCKS, ...SHINE] },
  // the rocks: faces toward the hatch in sienna, the backs dark
  ...ROCKS.map((q, i) => ({ pts: q, color: SIENNA, alpha: 0.42, seed: 540 + i, pool: 0.7, at: [62, 88] as [number, number], from: HATCH_C, ph: 2 })),
  ...ROCKS.map((q, i) => ({ pts: [...q.slice(0, q.indexOf(ROCK_RIDGES[i][0]) + 1), ...ROCK_RIDGES[i].slice(1)], color: DARK, alpha: 0.6, seed: 545 + i, at: [72, 94] as [number, number], ph: 3 })),
  // their shadows fall away from the hatch, to the left
  { pts: pts([[0, 576], [214, 580], [100, 614], [-40, 628], [-40, 578]]), color: NIGHT, alpha: 0.5, seed: 550, at: [76, 96], from: [214, 580], ph: 3, hide: ROCKS },
  { pts: pts([[180, 594], [302, 596], [206, 626], [124, 618]]), color: NIGHT, alpha: 0.45, seed: 551, at: [76, 96], from: [302, 596], ph: 3, hide: ROCKS },
  // the sand heaped over the nose (its face over the hull is drawn with the ship)
  { pts: MOUND, color: UMBER, alpha: 0.55, seed: 566, pool: 0.6, at: [66, 90], from: HATCH_C, ph: 3 },
  ...BOULDERS.map((q, i) => ({ pts: q, color: DARK, alpha: 0.55, seed: 600 + i, at: [74, 96] as [number, number], ph: 3 })),
  // the crystal: pale, its long lower face in blue shadow
  { pts: CRYSTAL, color: CYAN.pale, alpha: 0.9, seed: 570, at: [64, 88], from: CRY, ph: 2 },
  { pts: [CRY_RIDGE[0], CRY_RIDGE[1], CRY_RIDGE[2], CRYSTAL[4], CRYSTAL[5], CRYSTAL[0]], color: CYAN.mid, alpha: 0.7, seed: 571, at: [72, 94], from: CRY, ph: 3 },
  ...[NEAR_L, NEAR_R].map((q, i) => ({ pts: q, color: DARK, alpha: 0.7, seed: 590 + i, pool: 0.5, at: [74, 96] as [number, number], from: [q[0][0], 900] as P, ph: 3 })),
  // the drag tracks: a dark furrow
  ...pieces(DRAG, 7, 0.9, 580).map((p, i) => ({ pts: [...offset(p, 8), ...offset(p, -8).reverse()], color: DARK, alpha: 0.55, seed: 580 + i, at: [78, 96] as [number, number], ph: 3, hide: [ROCK2] })),
];

// ---------------------------------------------------------------- what moves
// the torches: points strung along the lower trail, each creeping one gap up per loop, so the
// top one fades out where the next arrives and the line is always the same length
const TR_LEN = TRAIL.slice(1).map((b, i) => Math.hypot(b[0] - TRAIL[i][0], b[1] - TRAIL[i][1]));
const onTrail = (d: number): P => { let i = 0; while (i < TR_LEN.length - 1 && d > TR_LEN[i]) d -= TR_LEN[i++]; return lerpP(TRAIL[i], TRAIL[i + 1], Math.min(1, d / TR_LEN[i])); };
const TORCH_N = 10, TORCH_D0 = 20, TORCH_GAP = 46;
// smoke: soft billows and a few curling strands rising out of the crater, leaning with the wind
const PUFFS = Array.from({ length: 10 }, (_, i) => ({ ph: i / 10, x: 690 + ((i * 53) % 160), s: 0.8 + ((i * 7) % 5) / 10, shape: blob(0, 0, 1, 0.7, 600 + i, 0.28, 12) }));
const WISPS = Array.from({ length: 5 }, (_, i) => ({ x: 680 + i * 44, ph: i / 5 + 0.1, k: 1 + (i % 2), a: 10 + (i % 3) * 5 }));
const GLINTS = SHINE.filter((_, i) => i % 3 === 0).map((q, i) => ({ c: lerpP(q[0], q[2], 0.5), k: 1 + (i % 3), ph: i * 1.7 }));
const smokeAt = (p: number, x0: number): P => { const rise = p * 520; return [x0 + rise * 0.5 + Math.sin(p * 5) * 20, 470 - rise]; };

export const p05 = page({
  id: "p05", title: "Le Cratere", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 16, seed: 990, at: 98, box: [40, 700, 1560, 890] },
  animAt: [58, 92],
  anim: (g, t, reveal, env) => {
    const T = (t / LOOP) * Math.PI * 2;
    const breath = 0.85 + 0.1 * Math.sin(T * 2) + 0.05 * Math.sin(T * 5 + 1), beat = Math.max(0, Math.sin(T * 3)) ** 2;
    const pen = (q: P[], w: number, color: string, seed: number, op: number) => g.pen(q, { w, color, seed, wobble: 0.5, boil: 0.3, taper: 1, opacity: op, retrace: false });
    const glint = (q: (typeof GLINTS)[number]) => Math.max(0, Math.sin(T * q.k + q.ph)) ** 8 * reveal;
    // smoke billows: soft grey bodies rising and swelling, each fading in low and out high; behind the ship
    g.group("plain", () => PUFFS.forEach((q) => { const p = (t / LOOP + q.ph) % 1, [x, y] = smokeAt(p, q.x), a = Math.sin(p * Math.PI) ** 1.5, r = (46 + p * 120) * q.s; fillShape(g, q.shape.map(([u, v]) => [x + u * r, y + v * r] as P), "#d2d8e2", 0.3 * a * reveal); }), { blur: 10 });
    g.group("plain", () => WISPS.forEach((w, i) => {
      const p = (t / LOOP + w.ph) % 1, fade = Math.sin(p * Math.PI) * reveal;
      for (let s = 0; s < 2; s++) pen(Array.from({ length: 14 }, (_, k) => { const q = Math.max(0, p - k * 0.022), [x, y] = smokeAt(q, w.x), rise = 470 - y; return [x + Math.sin(rise * 0.028 + T * w.k + i * 2) * w.a * (0.5 + rise / 260) + s * (6 + rise * 0.03), y] as P; }), 1.3 - s * 0.5, s ? "#e3ebf2" : "#b9c9d8", 900 + i * 2 + s, 0.55 * fade);
    }));
    g.group("plain", () => {
      const c = g.cur;
      // the far wall lit behind the ship, the pool of light on the floor, the smoke's belly
      g.glow(760, 470, 250, BLUE, 0.22 * breath * reveal);
      c.save(); c.translate(720, 640); c.scale(1, 0.3); c.translate(-720, -640); g.glow(720, 640, 250, BLUE, 0.55 * breath * reveal); c.restore();
      // the crystal's own heartbeat, three beats a loop
      g.glow(CRY[0], CRY[1] - 8, 40 + 18 * beat, BLUE, (0.3 + 0.45 * beat) * reveal);
      GLINTS.forEach((q) => { const f = glint(q); if (f > 0.02) g.glow(q.c[0], q.c[1], 12, LINE, f); });
    }, { blend: "screen" });
    // the ship (one design for the whole book, see ship.ts), its nose buried in the far wall
    drawShip(g, POSE, { reveal, light: [HATCH_C[0], HATCH_C[1] + 60], hatch: { u: -0.28, k: 0.3, size: 0.46, open: breath }, hide: [BURIED], cache: { env, key: "p05" } });
    g.group("plain", () => {
      const c = g.cur, b = bounds(SHIP_VIS), fill = (gr: CanvasGradient) => { c.globalAlpha = reveal; c.fillStyle = gr; c.fillRect(b.x0 - 4, b.y0 - 4, b.x1 - b.x0 + 8, b.y1 - b.y0 + 8); c.globalAlpha = 1; };
      // the hull goes dark where it sinks into the sand
      clipped(g, SHIP_VIS, () => { const m = CONTACT[Math.floor(CONTACT.length / 2)], gr = c.createRadialGradient(m[0], m[1], 10, m[0], m[1], 150); gr.addColorStop(0, "#06162ce0"); gr.addColorStop(0.5, "#06162c70"); gr.addColorStop(1, "#06162c00"); fill(gr); });
      // the sand spilling over the hull where it goes in
      clipped(g, HEAP, () => { const gr = c.createLinearGradient(930 + HEAP_SHIFT[0], 480 + HEAP_SHIFT[1], 1120 + HEAP_SHIFT[0], 560 + HEAP_SHIFT[1]); gr.addColorStop(0, "#9c95a3"); gr.addColorStop(0.45, "#7d6f74"); gr.addColorStop(1, "#4f4043"); c.globalAlpha = 0.97 * reveal; c.fillStyle = gr; c.fillRect(830 + HEAP_SHIFT[0], 420 + HEAP_SHIFT[1], 320, 190); c.globalAlpha = 1; });
      fillShape(g, HEAP_LIT, "#b4b4c6", 0.7 * reveal);
      pen(HEAP_EDGE, 1.8, INK, 902, 0.9 * reveal);
      pen(HEAP.slice(HEAP_EDGE.length + 3), 1.2, INK, 910, 0.6 * reveal);
      HEAP_HATCH.forEach((q, i) => pen(q, 0.9, INK, 903 + i, 0.55 * reveal));
    });
    // the light pouring out of the hatch's lower lip, down onto the floor
    g.group("plain", () => {
      const c = g.cur;
      clipped(g, BEAM, () => { const gr = c.createLinearGradient(HATCH_C[0], HATCH_C[1] + 22, HATCH_C[0], FOOT_L[1] + 20); gr.addColorStop(0, LINE + "90"); gr.addColorStop(0.5, BLUE + "48"); gr.addColorStop(1, BLUE + "00"); c.globalAlpha = breath * reveal; c.fillStyle = gr; c.fillRect(FOOT_L[0] - 60, HATCH_C[1] - 30, FOOT_R[0] - FOOT_L[0] + 140, FOOT_L[1] - HATCH_C[1] + 60); c.globalAlpha = 1; });
      g.glow(HATCH_C[0], HATCH_C[1] + 30, 30, LINE, 0.5 * breath * reveal);
    }, { blend: "screen" });
    g.group("plain", () => {
      fillShape(g, blob(CRY[0] + 6, CRY[1] - 12, 22, 5, 6, 0.3, 10, -0.25), "#ffffff", (0.25 + 0.6 * beat) * reveal);
      GLINTS.forEach((q, i) => { const f = glint(q); if (f > 0.02) { const [x, y] = q.c, l = 5 + 6 * f; pen([[x - l, y], [x + l, y]], 0.7, "#ffffff", 950 + i, f); pen([[x, y - l * 0.6], [x, y + l * 0.6]], 0.6, "#ffffff", 960 + i, f); } });
      // the torches, climbing
      for (let i = 0; i < TORCH_N; i++) {
        const d = TORCH_D0 + (i + t / LOOP) * TORCH_GAP, edge = Math.min(1, (d - TORCH_D0) / TORCH_GAP, (TORCH_D0 + TORCH_N * TORCH_GAP - d) / TORCH_GAP), [x, y] = onTrail(d);
        const fl = (0.75 + 0.15 * Math.sin(T * (7 + (i % 4)) + i * 2.1) + 0.1 * Math.sin(T * 13 + i)) * edge * reveal;
        g.glow(x, y - 4, 9, LAMP, 0.6 * fl);
        fillShape(g, blob(x, y - 4, 2.6, 3.4, 20 + i, 0.2, 8), "#fff0c0", fl);
      }
    });
  },
});
