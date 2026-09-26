// LES GRANDS BOIS PAGE 4 · LA CLAIRIÈRE. One idea: in a round clearing at nightfall the animals
// sit in a ring, too many and too still, and every one of them is looking at the child.
// Coloured pencil, dusk going to night. A ring of autumn trees round a clearing of short grass, the
// sky orange low and violet high. We stand behind the child in the middle. Across the ring, rabbits
// sit facing us, staring; one wears a knot of old blue wool round its neck. On the sides, in profile
// and turned toward the child, two roe deer, a boar, a marten.
// What moves: all the heads turning a little together, as if following the child; eyes catching the
// last light.
import { oval, rng, turn, type P } from "./core";
import { beast } from "./beasts";
import { figure } from "./figures";
import { blob, mix } from "./gallery";
import { fromMotif, live, prehatch, sketch, tint, type Hatched, type Shape } from "./pencil";
import type { Gfx } from "./core";

const LOOP = 180;
const HORIZON = 440;

// ---------------------------------------------------------------- helpers
const tree = (x: number, g: number, h: number, seed: number, cols: string[]): Shape[] => {
  const q = rng(seed), trunk: P[] = [[x - h * 0.05, g], [x - h * 0.035, g - h * 0.5], [x - h * 0.02, g - h * 0.7], [x + h * 0.02, g - h * 0.7], [x + h * 0.035, g - h * 0.5], [x + h * 0.05, g]];
  const crowns = [0, 1, 2, 3].map((i) => blob(x + (q() - 0.5) * h * 0.35, g - h * (0.62 + q() * 0.3), h * (0.2 + q() * 0.1), h * (0.16 + q() * 0.08), seed + i, 0.25, 14));
  return [{ pts: trunk, layers: tint(trunk, "#4a3a36", { angle: 1.4, gap: 5 }) }, ...crowns.map((c, i) => ({ pts: c, layers: tint(c, cols[i % cols.length], { seed: seed + i, gap: 5, dark: 0.5 }) }))];
};
// strokes replayed turned about a pivot: a head that looks round
const replayTurned = (g: Gfx, h: Hatched, c: P, deg: number, at: P, alpha: number) => h.strokes.forEach((m) => g.pen(turn(m.pts, c[0], c[1], deg).map(([x, y]) => [x + at[0], y + at[1]] as P), { w: m.w, color: m.color, seed: m.seed, wobble: 0.5, boil: 0, taper: 1, opacity: m.alpha * alpha, retrace: false }));
const hatchOf = (pts: P[], color: string, gap = 4): Shape => ({ pts, layers: tint(pts, color, { gap }), outline: { color: mix(color, "#2a2238", 0.6) } });

// ---------------------------------------------------------------- the clearing and the wood round it
const SKY: P[] = [[0, 0], [1600, 0], [1600, HORIZON + 60], [0, HORIZON + 60]];
const WOOD: P[] = [[0, 640], [0, 330], [1600, 330], [1600, 640], [1300, 540], [800, 510], [300, 540]];
const CLEARING: P[] = Array.from({ length: 40 }, (_, i) => { const a = (i / 40) * Math.PI * 2; return [800 + Math.cos(a) * 980, 740 + Math.sin(a) * 240 + (Math.sin(a) < 0 ? 0 : 200)] as P; });
const AUTUMN = ["#8a3a2a", "#6a4a2a", "#4a5a3a", "#a8522a", "#4a3044"]; // the wood's colours going out with the light
const r = rng(44);
const TREES: Shape[] = [];
for (let i = 0; i < 17; i++) { const x = -40 + i * 102 + (r() - 0.5) * 30, h = 230 + r() * 80 + Math.abs(x - 800) * 0.18; TREES.push(...tree(x, 520 - Math.abs(x - 800) * 0.03 + (i % 2) * 8, h, 200 + i * 7, AUTUMN.slice(i % 3).concat(AUTUMN))); }

// ---------------------------------------------------------------- the animals
type Stroke = { pts: P[]; w: number; color: string; alpha: number };
type Beast = { body: Shape[]; head: Shape[]; hole: P[]; pivot: P; eyes: P[]; eyeW: number; frontal: boolean; extra?: Stroke[] };
// a rabbit sitting facing us: the one thing the beasts kit doesn't draw
const frontRabbit = (x: number, g: number, h: number, coat: string, wool = false): Beast => {
  const body: Shape[] = [
    hatchOf(oval(x - h * 0.16, g - h * 0.05, h * 0.12, h * 0.06, 10), mix(coat, "#3a2a20", 0.3)), hatchOf(oval(x + h * 0.16, g - h * 0.05, h * 0.12, h * 0.06, 10), mix(coat, "#3a2a20", 0.3)),
    hatchOf(oval(x, g - h * 0.33, h * 0.3, h * 0.33, 18), coat),
    { pts: oval(x, g - h * 0.28, h * 0.17, h * 0.24, 14), layers: [{ color: "#efe6d6", angle: 0.4, gap: 5, w: 1.8, alpha: 0.6 }], outline: false },
    hatchOf(oval(x - h * 0.1, g - h * 0.08, h * 0.07, h * 0.08, 10), mix(coat, "#f4efe4", 0.4)), hatchOf(oval(x + h * 0.1, g - h * 0.08, h * 0.07, h * 0.08, 10), mix(coat, "#f4efe4", 0.4)),
  ];
  if (wool) body.push({ pts: oval(x, g - h * 0.63, h * 0.21, h * 0.075, 14), layers: [{ color: "#4a6aa0", angle: 0.3, gap: 2.5, w: 1.8, alpha: 0.9 }, { color: "#6a6a7a", angle: -1, gap: 4, w: 1.4, alpha: 0.6 }], outline: { color: "#2a3a5a" } }, { pts: oval(x + h * 0.06, g - h * 0.6, h * 0.05, h * 0.045, 10), layers: [{ color: "#3a5a8a", angle: 1, gap: 2, w: 1.6, alpha: 0.95 }], outline: { color: "#2a3a5a" } });
  const c: P = [x, g - h * 0.8], rr = h * 0.2;
  const earL: P[] = oval(c[0] - rr * 0.45, c[1] - rr * 1.9, rr * 0.28, rr * 1.05, 12).map(([px, py]) => turn([[px, py]], c[0] - rr * 0.4, c[1] - rr * 0.9, -8)[0]);
  const earR: P[] = oval(c[0] + rr * 0.45, c[1] - rr * 1.9, rr * 0.28, rr * 1.05, 12).map(([px, py]) => turn([[px, py]], c[0] + rr * 0.4, c[1] - rr * 0.9, 8)[0]);
  const skull = oval(c[0], c[1], rr * 1.05, rr * 0.95, 16);
  const head: Shape[] = [hatchOf(earL, coat), hatchOf(earR, coat), { pts: oval(c[0] - rr * 0.45, c[1] - rr * 1.85, rr * 0.12, rr * 0.7, 10), layers: [{ color: "#d9a0a0", angle: 1.5, gap: 3, w: 1.4, alpha: 0.7 }], outline: false }, { pts: oval(c[0] + rr * 0.45, c[1] - rr * 1.85, rr * 0.12, rr * 0.7, 10), layers: [{ color: "#d9a0a0", angle: 1.5, gap: 3, w: 1.4, alpha: 0.7 }], outline: false }, hatchOf(skull, coat), { pts: oval(c[0], c[1] + rr * 0.35, rr * 0.5, rr * 0.4, 12), layers: [{ color: "#efe6d6", angle: 0.3, gap: 4, w: 1.6, alpha: 0.6 }], outline: false }];
  const eyes: P[] = [[c[0] - rr * 0.55, c[1] - rr * 0.1], [c[0] + rr * 0.55, c[1] - rr * 0.1]];
  head.push({ pts: [[c[0] - rr * 0.14, c[1] + rr * 0.22], [c[0] + rr * 0.14, c[1] + rr * 0.22], [c[0], c[1] + rr * 0.38]], layers: [{ color: "#b86a6a", angle: 0, gap: 1.6, w: 1.4, alpha: 0.9 }], outline: { color: "#8a4a4a" } });
  return { body, head, hole: skull.map(([px, py]) => [c[0] + (px - c[0]) * 0.9, c[1] + (py - c[1]) * 0.9] as P), pivot: [c[0], c[1] + rr], eyes, eyeW: Math.max(5, rr * 0.36), frontal: true };
};
// the kit's beasts in profile, sitting, their heads kept apart so they can turn
const sideBeast = (o: Parameters<typeof beast>[0]): Beast => {
  const m = beast({ ...o, sit: true }), nHead = o.kind === "badger" ? 6 : 5;
  const all = fromMotif(m).map((s, i) => ({ ...s, layers: tint(s.pts, m.fills[i].color, { seed: i, gap: o.h > 110 ? 4.5 : 4 }) }));
  const head = all.slice(-nHead, -1), skull = m.fills[m.fills.length - nHead + 1].pts, eye = m.fills[m.fills.length - 1].pts;
  const ec = eye.reduce((a, p) => [a[0] + p[0] / eye.length, a[1] + p[1] / eye.length] as P, [0, 0] as P);
  const hc = m.head;
  return { body: all.slice(0, -nHead), head, hole: skull.map(([px, py]) => [hc[0] + (px - hc[0]) * 0.88, hc[1] + (py - hc[1]) * 0.88] as P), pivot: [hc[0] - (o.f ?? 1) * o.h * 0.12, hc[1] + o.h * 0.15], eyes: [ec], eyeW: Math.max(5, o.h * 0.06), frontal: false };
};
// lying down, legs folded under, head up: the kit's standing beast with its legs taken off and set on the ground
const couched = (o: Parameters<typeof beast>[0] & { leg: number; len: number; antlers?: boolean; tusk?: boolean }): Beast => {
  const m = beast({ ...o, sit: false }), f = o.f ?? 1, dy = o.leg * o.h * 0.92, down = (p: P): P => [p[0], p[1] + dy];
  const keep = m.fills.map((fl, i) => ({ ...fl, pts: fl.pts.map(down) })).filter((_, i) => !(i < 4 || (i >= 7 && i < 11)));
  const legC = mix(m.fills[5].color, "#2a2238", 0.3);
  const folded = [oval(o.x + f * o.len * 0.42 * o.h, o.g - 0.035 * o.h, 0.2 * o.h, 0.045 * o.h, 12), oval(o.x - f * o.len * 0.3 * o.h, o.g - 0.05 * o.h, 0.16 * o.h, 0.06 * o.h, 12)];
  const all: Shape[] = [...keep.slice(0, 3).map((fl, i) => ({ pts: fl.pts, layers: tint(fl.pts, fl.color, { seed: i, gap: 4.5 }), outline: { color: mix(fl.color, "#2a2238", 0.6) } })), ...folded.map((pts) => hatchOf(pts, legC, 4)), ...keep.slice(3).map((fl, i) => ({ pts: fl.pts, layers: tint(fl.pts, fl.color, { seed: i + 3, gap: 4.5 }), outline: { color: mix(fl.color, "#2a2238", 0.6) } }))];
  const nHead = 5, head = all.slice(-nHead, -1), skull = keep[keep.length - nHead + 1].pts, eye = keep[keep.length - 1].pts;
  const ec = eye.reduce((a, p) => [a[0] + p[0] / eye.length, a[1] + p[1] / eye.length] as P, [0, 0] as P), hc = down(m.head);
  const extra: Stroke[] = [], H = o.h, A = (u: number, v: number): P => [hc[0] + f * u * H, hc[1] - v * H];
  if (o.antlers) [0.02, 0.07].forEach((u) => { extra.push({ pts: [A(u - 0.04, 0.08), A(u - 0.05, 0.2), A(u - 0.03, 0.27)], w: 3, color: "#4a3222", alpha: 0.9 }); extra.push({ pts: [A(u - 0.05, 0.17), A(u, 0.21)], w: 2.4, color: "#4a3222", alpha: 0.9 }); });
  if (o.tusk) { const n = down(m.nose); extra.push({ pts: [[n[0] - f * 0.1 * H, n[1] + 0.02 * H], [n[0] - f * 0.06 * H, n[1] - 0.03 * H], [n[0] - f * 0.075 * H, n[1] - 0.06 * H]], w: 3, color: "#efe6d0", alpha: 0.95 }); }
  return { body: all.slice(0, -nHead), head, hole: skull.map(([px, py]) => [hc[0] + (px - hc[0]) * 0.88, hc[1] + (py - hc[1]) * 0.88] as P), pivot: [hc[0] - f * o.h * 0.1, hc[1] + o.h * 0.14], eyes: [ec], eyeW: Math.max(5, o.h * 0.05), frontal: false, extra };
};
const RABBIT = "#a0886a", GREY = "#8a7a6a", PALE = "#9a8060";
// the ring, back to front; the sides face the middle
const BEASTS: Beast[] = [
  frontRabbit(520, 545, 96, GREY), frontRabbit(655, 540, 92, RABBIT), frontRabbit(790, 538, 90, PALE), frontRabbit(930, 540, 94, RABBIT, true), frontRabbit(1068, 545, 92, GREY),
  frontRabbit(420, 590, 108, RABBIT), frontRabbit(1180, 590, 110, PALE),
  couched({ kind: "deer", x: 190, g: 672, h: 200, f: 1, leg: 0.95, len: 1.0, look: 0.8, coat: "#9a7456", antlers: true }), couched({ kind: "deer", x: 1420, g: 668, h: 190, f: -1, leg: 0.95, len: 1.0, look: 0.6, coat: "#a07a58" }),
  frontRabbit(505, 715, 124, GREY), frontRabbit(1095, 715, 126, RABBIT),
  sideBeast({ kind: "marten", x: 170, g: 820, h: 150, f: 1, look: -0.4 }), couched({ kind: "boar", x: 1380, g: 850, h: 210, f: -1, leg: 0.4, len: 1.3, tusk: true }),
];

// ---------------------------------------------------------------- the child, from behind, in the middle
const KH = 330, KID = figure({ x: 800, g: 895, h: KH, f: 1, robe: "tunic", head: "bare", cloth: "#b8472a", cloth2: "#4a4a5a", hair: "#5a3a22", ink: "#000", near: [0.2, 0.3], far: [0.12, 0.25] });
const BACK_OF_HEAD = blob(KID.head[0] + 6, KID.head[1], 20, 24, 8, 0.1, 14);
const WHISTLE: P[] = (() => { const [x, y] = KID.hands.near; return [[x - 2, y + 6], [x + 20, y + 10], [x + 22, y + 16], [x - 2, y + 14]]; })();

// ---------------------------------------------------------------- the page, back to front
const woolEnds = (() => { const b = BEASTS[3], [x, y] = [930 + 94 * 0.06, 540 - 94 * 0.6]; return [[[x, y + 3], [x + 4, y + 14], [x + 2, y + 22]], [[x + 3, y + 2], [x + 10, y + 12], [x + 12, y + 19]]].map((pts) => ({ pts: pts as P[], w: 2.6, color: "#3a5a8a", alpha: 0.95, hide: b.body.slice(0, 2).map((q) => q.pts) })); })();
const grass = Array.from({ length: 150 }, (_, i) => { const q = rng(300 + i), y = 480 + q() ** 0.7 * 420, x = q() * 1600, h = 4 + (y - 470) * 0.035; return { pts: [[x, y], [x + (q() - 0.4) * 4, y - h]] as P[], w: 1.4 + (y - 470) * 0.002, color: q() < 0.5 ? "#4a5a2a" : "#7a8a3a", alpha: 0.75, hide: [...KID.m.parts, ...BEASTS.flatMap((b) => [...b.body.map((s) => s.pts), b.hole])] }; });
const shapes: Shape[] = [
  { pts: SKY, layers: [{ color: "#e8a45a", angle: 0.2, gap: 6, w: 2.4, alpha: 0.6, keep: (_x, y) => y > 200 }, { color: "#8a6a9a", angle: -0.25, gap: 6, w: 2.2, alpha: 0.55, keep: (_x, y) => y < 300 }, { color: "#d9707a", angle: 0.05, gap: 8, w: 2, alpha: 0.4, keep: (_x, y) => y > 140 && y < 400 }, { color: "#4a3a6a", angle: 1.2, gap: 6, w: 2, alpha: 0.5, keep: (_x, y) => y < 160 }], outline: false },
  { pts: WOOD, layers: [{ color: "#3a2e3a", angle: 1.2, gap: 4, w: 2.4, alpha: 0.8 }, { color: "#4a3a2a", angle: -0.4, gap: 6, w: 2, alpha: 0.5 }], outline: false },
  ...TREES,
  // short grass, the last light on the middle of it, the edges going violet
  { pts: CLEARING, layers: [{ color: "#7a8a42", angle: 0.1, gap: 5, w: 2.2, alpha: 0.7 }, { color: "#d9a441", angle: -0.6, gap: 8, w: 1.8, alpha: 0.45, keep: (x, y) => Math.hypot(x - 800, (y - 700) * 2.4) < 520 }, { color: "#5a5a7a", angle: 1.25, gap: 5.5, w: 2, alpha: 0.5, keep: (x, y) => Math.hypot(x - 800, (y - 700) * 2.4) > 440 }, { color: "#3a3a5a", angle: 0.6, gap: 7, w: 1.8, alpha: 0.45, keep: (x, y) => Math.hypot(x - 800, (y - 700) * 2.4) > 760 }], outline: { color: "#4a5a2a" } },
  ...BEASTS.flatMap((b) => [...b.body, { pts: b.hole, layers: [], outline: false as const }]),
  ...fromMotif(KID.m), { pts: BACK_OF_HEAD, layers: tint(BACK_OF_HEAD, "#5a3a22", { gap: 3.5 }) }, { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.6, alpha: 0.9 }] },
];

// ---------------------------------------------------------------- what moves: the heads, all together
const HEADS = BEASTS.map((b, i): Hatched => { const h = prehatch(b.head); (b.extra ?? []).forEach((e, k) => h.strokes.push({ ...e, seed: 7500 + i * 9 + k })); b.eyes.forEach(([x, y], k) => h.strokes.push({ pts: [[x - b.eyeW * 0.2, y], [x + b.eyeW * 0.2, y + 0.5]], w: b.eyeW, color: "#1a1410", alpha: 0.95, seed: 7000 + i * 5 + k })); return h; });
export const f04 = sketch({
  id: "f04", title: "La Clairière", loop: LOOP, shapes, lines: [...grass, ...woolEnds],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2, turnBy = Math.tanh(1.6 * Math.sin(TT)) / Math.tanh(1.6); // all at once: a turn, a long still look, a turn back
    live(g, () => {
      BEASTS.forEach((b, i) => {
        const side = b.pivot[0] < 800 ? 1 : -1, deg = b.frontal ? turnBy * 4 : turnBy * 9 * side, at: P = b.frontal ? [turnBy * 5, 0] : [0, 0];
        replayTurned(g, HEADS[i], b.pivot, deg, at, reveal);
        // the last light in their eyes
        b.eyes.forEach((e, k) => { const [x, y] = turn([e], b.pivot[0], b.pivot[1], deg)[0], s = 1.1 + 1.1 * Math.pow(0.5 + 0.5 * Math.sin(TT * 2 + i * 0.25), 3); g.pen([[x + at[0] - b.eyeW * 0.2, y + at[1] - b.eyeW * 0.15], [x + at[0] - b.eyeW * 0.05, y + at[1] - b.eyeW * 0.2]], { w: s * 2.2, color: "#fff0c0", seed: 200 + i * 3 + k, wobble: 0.1, boil: 0, taper: 0.2, opacity: reveal, retrace: false }); });
      });
    });
  },
});
