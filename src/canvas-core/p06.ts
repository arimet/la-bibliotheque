// PAGE 6 · LA MINE. One idea: the old Callahan mine goes down into the dark, and something at the
// bottom of it has lit the rails.
// Focal subject: the two rails running from the reader's feet to the vanishing point, where a
// blue light pools on the floor and two tiny points look back. One light: that blue light, low,
// at the far end of the gallery, on the floor. It is drawn in the cyanotype hand (white-blue line,
// screen-blend glow): it catches only what faces it, the polished rail heads, the far edges of the
// sleepers, the inner feet of the posts, the undersides of the far caps. The reader stands at the
// dark entrance with no lantern lit, so everything facing us is umber and black.
// What moves: pulses of light running up the rails toward the reader, like water; the whole glow
// breathing, two slow breaths a loop; dust turning in the blue; a drip falling from a cap beam
// through the light; the two points at the bottom blinking once.
import { rng, type Gfx, type P } from "./core";
import { letter } from "./drafting";
import { blob, clamp, fillShape, mix } from "./gallery";
import { SEPIA, page, perspective, seq, st, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180;
const { ink: INK, paper: PAPER, umber: UMBER, sienna: SIENNA, dark: DARK, ochre: OCHRE } = SEPIA;
const BLACK = "#20140d", BLUE = "#6fb6ff", LINE = "#dff3ff", LINE2 = "#9cc3f0";

// the gallery descends: its vanishing point sits low in the frame, the eye 380 px above the floor
const VP: P = [800, 520];
const { G, U } = perspective(VP);
const Z = [0.88, 1.45, 2.1, 2.85, 3.75, 4.85, 6.2, 7.9, 10, 12.6]; // the timber sets, nearest first
const PB = 345, PT = 315, TH = 23, PH = 640, CAP = 700, CE = 385; // post foot / head u, half thickness, heights, cap end
const RAIL = 100, SLEEP = 165, RH = 28; // gauge half, sleeper half length, rail height
const FAR = 13; // where the light lies on the floor

// ---------------------------------------------------------------- the gallery, as geometry
// a timber set: two battered posts and a cap, as one outline (so it can mask what is behind it)
// (`pad` grows it by that many screen pixels, so a wash laid on it overlaps the rock it cuts out of)
const setShape = (z: number, pad = 0): P[] => { const d = pad * z, t = TH + d, e = CE + d, lo = PH - d, hi = CAP + d; return [G(-PB - t, z + 0.02), U(-PT - t, z, lo), U(-e, z, lo), U(-e, z, hi), U(e, z, hi), U(e, z, lo), U(PT + t, z, lo), G(PB + t, z + 0.02), G(PB - t, z + 0.02), U(PT - t, z, lo), U(-PT + t, z, lo), G(-PB + t, z + 0.02)]; };
const SETS = Z.map(setShape);
// the rock around each set: rough, a little outside the timber, the crown higher than the cap
const RING: P[] = [[-395, 0], [-404, 190], [-398, 410], [-391, 590], [-376, 690], [-312, 748], [-160, 772], [0, 781], [160, 769], [304, 751], [380, 694], [396, 588], [402, 402], [397, 190], [395, 0]];
const ringAt = (z: number, seed: number): P[] => { const r = rng(seed); return RING.map(([u, h], i) => (i === 0 || i === RING.length - 1 ? G(u, z) : U(u + (r() - 0.5) * 44, z, h + (r() - 0.5) * 46))); };
const RINGS = Z.map((z, i) => ringAt(z + 0.07, 40 + i * 17));
const MOUTH = [...ringAt(Z[0] - 0.02, 30), [1500, 960], [100, 960]] as P[]; // the adit's opening in the hillside
const FLOOR: P[] = [G(-395, 0.8), G(-395, 18), G(395, 18), G(395, 0.8)];
const railHide = [-1, 1].map((s) => [U(s * RAIL - 8, 0.8, RH), U(s * RAIL + 8, 0.8, RH), U(s * RAIL + 8, 18, RH), U(s * RAIL - 8, 18, RH)] as P[]);
// depths spaced evenly in log z: every step looks the same length on screen, far or near
const zs = (a: number, b: number, n: number) => Array.from({ length: n }, (_, i) => a * (b / a) ** (i / (n - 1)));

// the pick, left leaning on the second set by whoever ran out of here: its foot on the floor, its
// head across the face of the left post. Built in picture pixels from two perspective points.
const PF = G(-232, 1.3), PK = U(-303, 1.42, 250);
const pdir = (() => { const dx = PK[0] - PF[0], dy = PK[1] - PF[1], l = Math.hypot(dx, dy); return [dx / l, dy / l] as P; })(), pper: P = [-pdir[1], pdir[0]];
const pat = (s: number, off: number): P => { const c: P = [PK[0] + pdir[0] * 5, PK[1] + pdir[1] * 5], d = -(s * s) * 18 + off * (1 - s * s * 0.8); return [c[0] - pper[0] * s * 56 + pdir[0] * d, c[1] - pper[1] * s * 56 + pdir[1] * d]; };
const S7 = [-1, -0.7, -0.4, 0, 0.4, 0.7, 1];
const HEAD: P[] = [...S7.map((s) => pat(s, 6)), ...[...S7].reverse().map((s) => pat(s, -5))];
const HANDLE: P[] = [[PF[0] - 4, PF[1]], [PF[0] + 5, PF[1]], [PK[0] + 4, PK[1]], [PK[0] - 4, PK[1]]];
const PICK = [HEAD, HANDLE];

// ---------------------------------------------------------------- the pen
const setStrokes = (z: number, i: number): Omit<Stroke, "at">[] => {
  const w = 3.6 / z ** 0.55, sd = 100 + i * 40, near = i < 3, out: Omit<Stroke, "at">[] = [];
  for (const s of [-1, 1]) {
    out.push(st([G(s * (PB + TH), z), U(s * (PB + TH - 14), z, PH * 0.5), U(s * (PT + TH), z, PH)], w * 1.15, sd + (s + 1) * 3, 0.95, 0.9)); // outer edge
    out.push(st([U(s * (PB - TH - 5), z, 170), U(s * (PT - TH), z, PH)], w * 0.8, sd + (s + 1) * 3 + 1, 0.85, 0.7)); // inner edge, eaten by the light near the floor
  }
  out.push(st([U(-CE, z, CAP), U(0, z, CAP + 4), U(CE, z, CAP)], w, sd + 10, 0.9, 1.1), st([U(-CE + 6, z, PH), U(0, z, PH - 3), U(CE - 6, z, PH)], w * 1.2, sd + 11, 0.95, 1.1));
  out.push(st([U(-CE, z, CAP), U(-CE - 4, z, 670), U(-CE + 6, z, PH)], w * 0.8, sd + 12, 0.85), st([U(CE, z, CAP), U(CE + 4, z, 670), U(CE - 6, z, PH)], w * 0.8, sd + 13, 0.85));
  if (near) {
    const r = rng(sd + 20);
    for (const s of [-1, 1]) for (let k = 0; k < 2; k++) { const f = 0.35 + k * 0.3 + r() * 0.1, u0 = PB + TH - 2 * TH * f, u1 = PT + TH - 2 * TH * f, a = 0.1 + r() * 0.3, b = a + 0.25 + r() * 0.3; out.push(st([U(s * (u0 + (u1 - u0) * a), z, PH * a), U(s * (u0 + (u1 - u0) * b), z, PH * b)], w * 0.35, sd + 30 + k + (s + 1) * 2, 0.55, 0.5)); }
    for (let k = 0; k < 2; k++) { const a = -300 + r() * 220, b = a + 200 + r() * 260, h = 652 + k * 22 + r() * 10; out.push(st([U(a, z, h), U(b, z, h + (r() - 0.5) * 5)], w * 0.35, sd + 36 + k, 0.5, 0.5)); }
    // wedge blocks driven between the cap and the rock
    [-250, 30, 270].forEach((u, k) => { const a = u - 34, b = u + 34; out.push(st([U(a, z, CAP), U(a + 3, z, CAP + 38)], w * 0.6, sd + 40 + k * 3, 0.8), st([U(a + 3, z, CAP + 38), U(b - 3, z, CAP + 36)], w * 0.6, sd + 41 + k * 3, 0.8), st([U(b - 3, z, CAP + 36), U(b, z, CAP)], w * 0.6, sd + 42 + k * 3, 0.8)); });
  }
  return out;
};
// the rock behind each set, in three open runs: left wall, crown, right wall
const ringStrokes = (R: P[], z: number, i: number) => [[1, 6], [5, 10], [9, 14]].map(([a, b], k) => st(R.slice(a, b), 2.6 / z ** 0.5, 300 + i * 5 + k, 0.8, 1.6));
// fissures in the rock, a random walk on the wall or the crown
const cracks = (() => {
  const r = rng(420), out: Omit<Stroke, "at">[] = [];
  for (let k = 0; k < 26; k++) {
    const side = k % 3 === 2 ? 0 : k % 2 ? 1 : -1; let z = 0.95 + r() * r() * 4.5, h = side ? 80 + r() * 480 : 0, u = side ? 0 : -260 + r() * 520;
    const pts: P[] = [];
    for (let j = 0; j < 4 + Math.floor(r() * 3); j++) { pts.push(side ? U(side * (398 + (r() - 0.5) * 10), z, h) : U(u, z, 772)); z *= 1 + (r() - 0.35) * 0.12; h += (r() - 0.6) * 80; u += (r() - 0.5) * 70; }
    out.push(st(pts, 1.5 / z ** 0.5, 440 + k, 0.65, 1.2));
  }
  return out;
})();
// the hillside around the adit mouth: a few big fissures and bedding lines, hand placed
const MOUTHLINES: P[][] = [
  [[30, 80], [120, 110], [170, 96], [300, 138]], [[0, 300], [80, 318], [140, 362], [250, 376]], [[150, 186], [190, 250], [184, 318]], [[250, 376], [270, 470], [310, 520]],
  [[60, 560], [118, 598], [150, 700], [236, 730], [290, 850]], [[0, 700], [60, 690], [118, 598]], [[130, 460], [60, 430], [0, 450]],
  [[1320, 110], [1400, 92], [1470, 126], [1600, 100]], [[1310, 420], [1420, 396], [1480, 444], [1600, 430]], [[1420, 190], [1440, 262], [1530, 300]], [[1480, 444], [1500, 540], [1560, 580]],
  [[1330, 640], [1420, 700], [1470, 690], [1560, 792]], [[1300, 862], [1360, 820], [1440, 852]], [[1470, 690], [1540, 640], [1600, 650]],
];
const sleepers = (() => { const r = rng(610), out: { z: number; a: number; b: number }[] = []; for (let z = 0.93; z < 5.4; z += 0.16 + (r() - 0.5) * 0.04) { if (r() < 0.07) continue; out.push({ z, a: -SLEEP + (r() - 0.5) * 24, b: SLEEP + (r() - 0.5) * 24 }); } return out; })();
const RZ = zs(0.84, 16, 12);

const hideSets = SETS;
const strokes: Stroke[] = [
  // 1. the portal set and the rails, the lines that carry the eye in
  ...seq([...setStrokes(Z[0], 0), ...[-1, 1].flatMap((s) => [st(RZ.map((z) => U(s * (RAIL + 7), z, RH)), 2.8, 500 + s, 0.95, 0.4), st(RZ.map((z) => G(s * (RAIL + 12), z)), 1.2, 503 + s, 0.7, 0.4)])], 0, 16),
  // 2. the sets going down, big first, closer together as they go
  ...seq([...setStrokes(Z[1], 1).map((s) => ({ ...s, hide: PICK })), ...Z.slice(2).flatMap((z, i) => setStrokes(z, i + 2))], 10, 44),
  // 3. the rock: where the walls meet the floor, the rough rings behind each set, the fissures
  ...seq([-1, 1].map((s) => st(zs(0.86, 16, 14).map((z, i) => G(s * (395 + ((i * 37) % 11) - 5), z)), 2.4, 520 + s, 0.8, 1.4)), 30, 40, 0.35, hideSets),
  ...seq(RINGS.flatMap((R, i) => ringStrokes(R, Z[i] + 0.07, i)), 34, 56, 0.35, hideSets),
  ...seq([...cracks, ...MOUTHLINES.flatMap((p, i) => p.slice(1).map((b, j) => st([p[j], b], 2.6 - j * 0.4, 470 + i * 7 + j, 0.8, 0.9)))], 44, 64, 0.35, hideSets),
  // 4. the sleepers, the pick
  ...seq(sleepers.flatMap(({ z, a, b }, i) => [st([U(a, z, 14), U((a + b) / 2, z, 15), U(b, z, 14)], 2.4 / z ** 0.8, 700 + i * 3, 0.9, 0.6), ...(z < 1.9 ? [st([G(a + 3, z), G(b - 3, z)], 1.4 / z, 701 + i * 3, 0.6, 0.6)] : [])]), 50, 72, 0.3, railHide),
  ...seq([st([[PF[0] - 4, PF[1]], [PK[0] - 4, PK[1] + 6]], 2.2, 800, 0.95, 0.4), st([[PF[0] + 5, PF[1]], [PK[0] + 4, PK[1] + 8]], 1.6, 801, 0.85, 0.4),
    st(S7.map((s) => pat(s, 6)), 2.2, 802, 0.95, 0.3), st(S7.map((s) => pat(s, -5)), 1.8, 803, 0.9, 0.3), st([pat(-0.12, -7), pat(-0.12, 8)], 1.4, 804, 0.8, 0.2), st([pat(0.12, -7), pat(0.12, 8)], 1.4, 805, 0.8, 0.2)], 66, 76),
  // 5. last, in the other hand: what the blue light catches (it arrives from the depth)
  ...seq([-1, 1].flatMap((s) => [st(zs(15, 3, 8).map((z) => U(s * (RAIL - 6), z, RH + 1)), 1.8, 900 + s, 0.95, 0.3), st(zs(3.1, 0.86, 8).map((z) => U(s * (RAIL - 6), z, RH + 1)), 2.2, 903 + s, 0.7, 0.3)]).map((s) => ({ ...s, color: LINE })), 84, 92),
  ...seq(sleepers.filter((_, i) => i % 5 !== 3).map(({ z, a, b }, i) => ({ ...st([U(a * 0.9, z + 0.03, 14), U(b * 0.9, z + 0.03, 14)], 1.3 / z ** 0.6, 950 + i, 0.3 + 0.35 * clamp(z / 5), 0.5), color: LINE2 })).reverse(), 86, 98, 0.5, railHide),
  ...seq((Z.slice(1, 9).flatMap((z, i) => [-1, 1].map((s) => ({ ...st([G(s * (PB - TH - 1), z), U(s * (PB - TH - 5), z, 200)], 1.6 / z ** 0.5, 1000 + i * 2 + s, 0.75, 0.4), color: LINE2, hide: i === 0 ? PICK : undefined }))) as Omit<Stroke, "at">[])
    .concat(Z.slice(5).map((z, i) => ({ ...st([U(-CE + 30, z, PH - 2), U(CE - 30, z, PH - 2)], 1.1, 1030 + i, 0.4, 0.4), color: LINE2 })))
    .concat([{ ...st(S7.slice(0, 4).map((s) => pat(s, -5)), 1.4, 1040, 0.9, 0.2), color: LINE }, { ...st([[PF[0] + 6, PF[1] - 4], [PF[0] + 6 + (PK[0] - PF[0]) * 0.4, PF[1] + 4 + (PK[1] - PF[1]) * 0.4]], 1, 1041, 0.55, 0.2), color: LINE2 }]).reverse(), 88, 101),
];

// ---------------------------------------------------------------- the washes
const WOOD = mix(mix(SIENNA, UMBER, 0.45), DARK, 0.2);
const postHalf = (z: number, s: number): P[] => [G(s * (PB + TH), z), U(s * (PT + TH), z, PH), U(s * PT, z, PH), G(s * PB, z)];
const washes: Wash[] = [
  // ground: the rock of the gallery, the hillside at the mouth darker, the floor
  { pts: [[-40, -40], [1640, -40], [1640, 940], [-40, 940]], color: UMBER, alpha: 0.72, seed: 2000, pool: 0.5, at: [50, 76], from: VP },
  { pts: [[-40, -40], [1640, -40], [1640, 940], [-40, 940]], color: BLACK, alpha: 0.76, seed: 2001, pool: 0.4, at: [56, 82], from: [800, 0], hide: [MOUTH] },
  { pts: FLOOR, color: UMBER, alpha: 0.3, seed: 2002, pool: 0.3, at: [54, 80], from: VP, ph: 1 },
  // the timbers, facing us, unlit: wood colour sinking toward black as they go down
  ...Z.slice(0, 6).map((z, i) => ({ pts: setShape(z, 5), color: mix(WOOD, DARK, i * 0.16), alpha: 0.62 + i * 0.04, seed: 2010 + i, pool: 0.6, at: [60 + i * 2, 84 + i] as [number, number], from: VP, ph: 2, hide: i === 1 ? PICK : undefined })),
  // darks: the rock pooled in its hollows, the far end black, the floor dark away from the rails
  { pts: [[-40, -40], [1640, -40], [1640, 940], [-40, 940]], color: BLACK, alpha: 0.74, seed: 2020, pool: 0.2, at: [66, 90], from: VP, ph: 3, clip: MOUTH, hide: [FLOOR, ...SETS] },
  ...[[-1, 1.1, 250], [1, 1.7, 420], [-1, 2.4, 120], [1, 3.1, 520], [-1, 3.3, 480], [1, 1.2, 110], [0, 1.2, 0], [0, 2.4, 0]].map(([s, z, h], i) => {
    const [x, y] = s ? U(s * 398, z, h) : U(-80 + i * 20, z, 770);
    return { pts: blob(x, y, (s ? 70 : 170) / z ** 0.7, (s ? 130 : 44) / z ** 0.7, 2030 + i, 0.3, 14), color: BLACK, alpha: 0.32, seed: 2040 + i, pool: 0.7, at: [70 + i, 92] as [number, number], ph: 3, hide: SETS };
  }),
  { pts: FLOOR, color: BLACK, alpha: 0.4, seed: 2045, pool: 0.2, at: [68, 92], from: VP, ph: 3, hide: [PICK[1]] },
  // the gallery going down into the dark: two washes shaped like the gallery itself, laid from the depth
  { pts: RINGS[3], color: BLACK, alpha: 0.5, seed: 2050, pool: 0.3, at: [68, 92], from: VP, ph: 3 },
  { pts: RINGS[5], color: BLACK, alpha: 0.72, seed: 2051, pool: 0.2, at: [70, 94], from: VP, ph: 3 },
  { pts: [G(-395, 0.8), G(-395, 2), G(395, 2), G(395, 0.8)], color: BLACK, alpha: 0.5, seed: 2052, pool: 0.1, at: [72, 94], from: [800, 900], ph: 3, hide: [PICK[1]] },
  ...[-1, 1].map((s, i) => ({ pts: [G(s * 395, 0.8), G(s * 395, 16), G(s * 200, 16), G(s * 190, 0.8)], color: BLACK, alpha: 0.42, seed: 2060 + i, pool: 0.2, at: [72, 94] as [number, number], from: VP, ph: 3, hide: [...SETS, PICK[1]] })),
  // the hillside round the mouth, pooled darker in its hollows
  ...[[-60, -40, 380, 300], [1680, 20, 360, 340], [-40, 940, 360, 260], [1640, 930, 340, 240]].map(([x, y, rx, ry], i) => ({ pts: blob(x, y, rx, ry, 2100 + i, 0.3, 14), color: BLACK, alpha: 0.4, seed: 2104 + i, pool: 0.7, at: [74, 94] as [number, number], ph: 3, hide: [MOUTH] })),
  // the outer half of each near post, turned from even the little light there is
  ...Z.slice(0, 3).flatMap((z, i) => [-1, 1].map((s) => ({ pts: postHalf(z, s), color: BLACK, alpha: 0.45, seed: 2070 + i * 2 + s, pool: 0.5, at: [76, 94] as [number, number], ph: 3, hide: i === 1 ? PICK : undefined }))),
  ...Z.slice(0, 3).map((z, i) => ({ pts: [U(-CE, z, CAP), U(CE, z, CAP), U(CE, z, 675), U(-CE, z, 675)], color: BLACK, alpha: 0.35, seed: 2080 + i, pool: 0.2, at: [76, 94] as [number, number], ph: 3 })),
  ...Z.slice(0, 3).map((z, i) => ({ pts: setShape(z, 3), color: BLACK, alpha: 0.34 - i * 0.06, seed: 2085 + i, pool: 0.5, at: [74, 94] as [number, number], from: [800, 900] as P, ph: 3, hide: i === 1 ? PICK : undefined })),
  // the pick: ash handle, iron head, a short shadow thrown back toward the reader
  { pts: HANDLE, color: UMBER, alpha: 0.75, seed: 2090, pool: 0.4, at: [78, 94], ph: 3 },
  { pts: HEAD, color: BLACK, alpha: 0.75, seed: 2091, pool: 0.3, at: [78, 94], ph: 3 },
  { pts: [[PF[0] - 3, PF[1] - 2], [PF[0] + 6, PF[1]], [PF[0] - 70, PF[1] + 60], [PF[0] - 86, PF[1] + 52]], color: BLACK, alpha: 0.5, seed: 2092, at: [80, 96], ph: 3 },
];

// ---------------------------------------------------------------- what moves
const hex = (v: number) => Math.round(255 * clamp(v)).toString(16).padStart(2, "0");
// a glow squashed flat onto the floor (g.glow is round; the floor is foreshortened)
const floorGlow = (g: Gfx, x: number, y: number, rx: number, ry: number, color: string, op: number) => {
  if (op <= 0.004) return;
  const c = g.cur, gr = c.createRadialGradient(0, 0, 0, 0, 0, rx * 1.7);
  [[0, 1], [0.35, 0.9], [0.6, 0.55], [0.8, 0.2], [1, 0]].forEach(([t, v]) => gr.addColorStop(t, color + hex(v * op)));
  c.save(); c.translate(x, y); c.scale(1, ry / rx); c.fillStyle = gr; c.fillRect(-rx * 1.8, -rx * 1.8, rx * 3.6, rx * 3.6); c.restore();
  g.touch(x - rx * 1.8, y - ry * 1.8, x + rx * 1.8, y + ry * 1.8);
};
const GZ = zs(FAR, 0.9, 16); // where the standing light lies along the rails
// the pulses: each runs from the bottom of the gallery to the reader's feet in 90 frames (twice a
// loop), staggered unevenly; the right rail lags the left a little, like water finding its way
const PULSES = [0, 0.31, 0.64];
const pulseZ = (p: number) => FAR * (0.86 / FAR) ** p;
const motes = (() => { const r = rng(1200); return Array.from({ length: 34 }, () => ({ u: (r() - 0.5) * 380, z: 1.2 + r() * r() * 6, h: 12 + r() * r() * 260, a: 8 + r() * 20, b: 10 + r() * 26, k: 1 + Math.floor(r() * 3), ph: r() * 6.28, tw: 2 + Math.floor(r() * 4) })); })();
const DRIP = { u: 40, z: Z[1], period: 90 };
const EYES: P[] = [[793, 513], [806, 512]];

export const p06 = page({
  id: "p06", title: "La Mine", draw: DRAW, loop: LOOP, paper: PAPER, ink: INK, strokes, washes,
  spatter: { n: 16, seed: 1990, at: 98, box: [260, 640, 1340, 890] },
  animAt: [70, 100],
  anim: (g, t, reveal) => {
    const T = (t / LOOP) * Math.PI * 2;
    const breath = 0.62 + 0.38 * (0.5 - 0.5 * Math.cos(2 * T)); // two slow breaths a loop
    const R = reveal * breath;
    const pz = PULSES.flatMap((o, j) => [-1, 1].map((s) => ({ s, p: (t / 90 + o + (s > 0 ? 0.07 : 0) + 1) % 1, j })));
    // how much a pulse is lighting depth z right now
    const surge = (z: number) => pz.reduce((a, { p }) => { const d = Math.log(z / pulseZ(p)) / 0.16; return a + Math.exp(-d * d) * Math.sin(Math.PI * p) ** 0.6; }, 0) * 0.5;
    const pen = (pts: P[], w: number, seed: number, op: number, color = LINE) => g.pen(pts, { w, color, seed, wobble: 0.4, boil: 0.3, taper: 1, opacity: op, retrace: false, progress: 1 });

    g.group("plain", () => {
      // the light itself, pooled on the floor at the bottom of the gallery
      const [sx, sy] = G(0, FAR);
      floorGlow(g, sx, sy - 4, 120, 46, BLUE, 0.55 * R);
      g.glow(sx, sy - 8, 34, BLUE, 0.6 * R);
      g.glow(sx, sy - 6, 12, LINE, 0.7 * R);
      // standing light along both rails and the bed between them, rippling toward the reader
      GZ.forEach((z, k) => {
        const fall = 0.25 + 0.75 * Math.sqrt(z / FAR), rip = 0.75 + 0.25 * Math.sin(T * 3 + k * 0.8), up = surge(z);
        for (const s of [-1, 1]) { const [x, y] = U(s * RAIL, z, RH); floorGlow(g, x, y, 40 / z + 5, (40 / z + 5) * 0.4, BLUE, (0.3 * fall * rip + 0.5 * up) * R); }
        const [x, y] = G(0, z); floorGlow(g, x, y, 150 / z + 8, (150 / z + 8) * 0.22, BLUE, (0.16 * fall * rip + 0.22 * up) * R);
        // the feet of the posts at this depth, if a set stands near it
      });
      // the inner feet of the posts flare as a pulse goes by
      Z.slice(1, 9).forEach((z) => { const f = (0.18 + surge(z) * 0.9) * R * (0.4 + 0.6 * Math.sqrt(z / FAR)); for (const s of [-1, 1]) { const [x, y] = U(s * (PB - TH), z, 30); floorGlow(g, x, y, 18 / z + 3, 30 / z + 3, BLUE, f * 0.5); } });
      // the pulses: a bright run on the rail head, trailing back toward the depth
      pz.forEach(({ s, p, j }) => {
        const z = pulseZ(p), env = Math.sin(Math.PI * p) ** 0.6 * reveal;
        if (env < 0.02) return;
        pen([U(s * (RAIL - 6), z, RH + 1), U(s * (RAIL - 6), z * 1.18, RH + 1), U(s * (RAIL - 6), z * 1.4, RH + 1)], Math.max(0.8, 2.6 / z ** 0.5), 1300 + j * 2 + s, 0.9 * env);
        const [x, y] = U(s * RAIL, z, RH); g.glow(x, y, 16 / z ** 0.8 + 2, LINE, 0.55 * env);
      });
      // dust turning in the blue: bright only where the light reaches it
      motes.forEach((m, i) => {
        const u = m.u + Math.sin(T * m.k + m.ph) * m.a, h = m.h + Math.sin(T * (m.k + 1) + m.ph * 1.7) * m.b, [x, y] = U(u, m.z, h);
        const lit = Math.exp(-h / 140) * Math.exp(-Math.max(0, Math.abs(u) - RAIL) / 110) * (0.5 + 0.5 * Math.sin(T * m.tw + i)) * (0.6 + surge(m.z));
        const r = Math.max(0.9, 2.6 / m.z);
        fillShape(g, [[x - r, y], [x, y - r], [x + r, y], [x, y + r]], LINE, clamp(lit * 0.9) * R);
      });
      // two points at the bottom, low, looking back; they close once a loop
      const open = t >= 124 && t < 132 ? Math.abs(t - 128) / 4 : 1;
      EYES.forEach(([x, y]) => { g.glow(x, y, 5, BLUE, 0.7 * R); fillShape(g, blob(x, y, 1.9, 1.9 * open + 0.1, 1400, 0.05, 8), LINE, 0.95 * reveal); });
    }, { blend: "screen" });

    // the drip: a bead swells under the cap, lets go, falls through the light, splashes in it
    g.group("plain", () => {
      const q = t % DRIP.period, [x, y0] = U(DRIP.u, DRIP.z, PH), [, y1] = G(DRIP.u, DRIP.z);
      const grow = 64, fall = 13;
      if (q < grow) {
        const k = q / grow, r = 2 + 4 * k, yb = y0 + r * (1.4 + k);
        fillShape(g, [[x - r * 0.7, y0 + 1], [x + r * 0.7, y0 + 1], [x + r, yb], [x + r * 0.6, yb + r * 0.8], [x, yb + r], [x - r * 0.6, yb + r * 0.8], [x - r, yb]], BLACK, 0.9 * reveal);
        pen([[x - r * 0.8, yb + r * 0.3], [x, yb + r * 0.95], [x + r * 0.8, yb + r * 0.3]], 1.3, 1500, (0.4 + 0.5 * k) * reveal, LINE2); // lit from below
        fillShape(g, blob(x + r * 0.25, yb + r * 0.2, r * 0.3, r * 0.4, 1501, 0.1, 6), LINE, (0.55 + 0.4 * k) * reveal);
      } else if (q < grow + fall) {
        const k = (q - grow + 1) / fall, y = y0 + 10 + (y1 - y0 - 10) * k * k, lit = 0.45 + 0.55 * k;
        pen([[x, y - 30 * k - 4], [x, y - 3]], 1.6, 1510, 0.55 * lit, LINE2);
        fillShape(g, blob(x, y, 4, 5.6, 1511, 0.1, 8), BLACK, 0.85);
        fillShape(g, blob(x + 0.6, y + 2, 2.2, 2.8, 1512, 0.1, 6), LINE, lit);
      } else {
        const k = (q - grow - fall) / (DRIP.period - grow - fall), a = Math.max(0, 1 - k * 1.3);
        const rx = 8 + 56 * k, ry = rx * 0.24;
        if (k < 0.3) g.glow(x, y1 - 2, 22, LINE, 0.35 * (1 - k / 0.3));
        pen(Array.from({ length: 15 }, (_, i) => [x + Math.cos((i / 14) * Math.PI * 2) * rx, y1 + Math.sin((i / 14) * Math.PI * 2) * ry] as P), 1.6, 1520, 0.9 * a, LINE);
        if (k < 0.4) [-1, -0.45, 0.1, 0.55, 1].forEach((d, i) => { const e = 1 - k / 0.4; pen([[x + d * 3, y1 - 2], [x + d * (8 + 26 * k), y1 - 8 - 44 * k + 90 * k * k]], 1.4, 1530 + i, 0.95 * e, LINE); });
      }
    });

    // the company's name, whitewashed across the portal cap long ago
    const [, cy0] = U(0, Z[0], CAP), [, cy1] = U(0, Z[0], PH), cap = 36;
    g.group("plain", () => letter(g, "CALLAHAN MINE", 800, (cy0 + cy1) / 2 - cap / 2 + 2, { cap, color: "#cdb893", seed: 1600, align: "center", progress: reveal, w: 4.2, opacity: 0.82, track: 2.2 }));
  },
});
