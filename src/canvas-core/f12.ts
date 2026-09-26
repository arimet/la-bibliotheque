// LES GRANDS BOIS PAGE 12 · LES PATTES. One idea: in the morning there are two more foxes in the
// clearing, a big one and a small one curled up together, and the big one has a bone whistle on a
// string round its neck.
// Coloured pencil, a grey early morning. The Old Oak's clearing, cold, mist between the trunks, the
// light only just coming; the animals still sitting in their ring round the oak. In front, on the
// frosted grass, the two new foxes asleep against each other; on the big one's neck the string, and
// the whistle lying in the fur.
// What moves: their breath smoking in the cold, the big fox's tail curling, the slow dawn light.
import { oval, rng, sample, tube, turn, type P } from "./core";
import { beast, type Kind } from "./beasts";
import { fromMotif, live, pencilLive, sketch, tint, type Layer_, type Shape } from "./pencil";
import { blob, bounds, mix } from "./gallery";

const LOOP = 180;
type Line = { pts: P[]; w: number; color: string; alpha: number };
const GREY = "#8a94a4";

// ---------------------------------------------------------------- helpers
const cold = (sh: Shape[], k = 0.45): Shape[] => sh.map((s) => ({ ...s, layers: s.layers.map((L) => ({ ...L, color: mix(L.color, GREY, k) })), outline: s.outline ? { ...s.outline, color: mix(s.outline.color, "#2a3040", 0.3) } : s.outline }));
// a fox asleep, curled on its side: the tail wrapped round the front, the nose tucked into it
const curled = (cx: number, cy: number, r: number, f: 1 | -1, seed: number, coat: string, eyeOpen = false) => {
  const X = (u: number) => cx + f * u * r, hy = cy - 0.62 * r;
  const body = blob(cx, cy - 0.5 * r, r, 0.5 * r, seed, 0.05, 18);
  const head = sample([[X(0.22), hy - 0.04 * r], [X(0.36), hy - 0.26 * r], [X(0.56), hy - 0.24 * r], [X(0.8), hy - 0.04 * r], [X(1.02), hy + 0.1 * r], [X(1.0), hy + 0.16 * r], [X(0.78), hy + 0.2 * r], [X(0.5), hy + 0.26 * r], [X(0.3), hy + 0.22 * r]], true, 3);
  const ear = (a: number, b: number, t: number): P[] => [[X(a), hy - 0.18 * r], [X(t - 0.08), hy - 0.7 * r], [X(b), hy - 0.22 * r]];
  const muzzle = sample([[X(0.56), hy + 0.1 * r], [X(0.98), hy + 0.13 * r], [X(0.8), hy + 0.2 * r], [X(0.52), hy + 0.24 * r]], true, 3), nose = oval(X(1.0), hy + 0.12 * r, 0.035 * r, 0.028 * r, 8);
  const tail = sample([[X(-0.98), cy - 0.42 * r], [X(-0.72), cy - 0.02 * r], [X(0), cy + 0.03 * r], [X(0.72), cy - 0.02 * r], [X(1.05), cy - 0.22 * r], [X(1.0), cy - 0.4 * r], [X(0.72), cy - 0.26 * r], [X(0.1), cy - 0.2 * r], [X(-0.5), cy - 0.22 * r], [X(-0.82), cy - 0.44 * r]], true, 3);
  const tip = oval(X(0.9), cy - 0.2 * r, 0.17 * r, 0.14 * r, 10);
  const eye: P[] = eyeOpen ? turn(oval(X(0.62), hy - 0.06 * r, 0.055 * r, 0.026 * r, 10), X(0.62), hy - 0.06 * r, f * 12) : [[X(0.52), hy - 0.04 * r], [X(0.6), hy - 0.01 * r], [X(0.68), hy - 0.02 * r], [X(0.6), hy + 0.01 * r]];
  const dark = mix(coat, "#2a1a14", 0.45), line = { color: mix(coat, "#2a1a14", 0.6) };
  return {
    shapes: [
      { pts: body, layers: tint(body, coat, { seed, gap: 4.5 }), outline: line },
      { pts: ear(0.3, 0.44, 0.3), layers: tint(ear(0.3, 0.44, 0.3), dark, { gap: 3 }), outline: line },
      { pts: head, layers: tint(head, coat, { seed: seed + 1, gap: 4 }), outline: line },
      { pts: ear(0.48, 0.64, 0.56), layers: tint(ear(0.48, 0.64, 0.56), dark, { gap: 3 }), outline: line },
      { pts: muzzle, layers: [{ color: "#ece6da", angle: 0.3, gap: 4, w: 1.6, alpha: 0.6 }], outline: false },
      { pts: nose, layers: [{ color: "#1a1410", angle: 0.3, gap: 2, w: 1.6, alpha: 0.95 }], outline: { color: "#1a1410", w: 1 } },
      { pts: eye, layers: [{ color: "#1a1410", angle: 0.2, gap: 2, w: 1.6, alpha: 0.95 }], outline: { color: "#1a1410", w: 1.2 } },
      { pts: tail, layers: tint(tail, mix(coat, "#e0a060", 0.1), { seed: seed + 2, gap: 4 }), outline: line },
    ] as Shape[],
    tip, nose: [X(1.02), hy + 0.12 * r] as P, neck: [X(0.22), hy + 0.05 * r] as P, chin: [X(0.62), hy + 0.3 * r] as P, tailAt: [X(0.75), cy - 0.15 * r] as P,
  };
};

// ---------------------------------------------------------------- the clearing, grey
const SKY: P[] = [[0, 0], [1600, 0], [1600, 520], [0, 520]];
const WOOD: P[] = (() => { const q = rng(31), top: P[] = []; for (let x = -20; x <= 1620; x += 38) top.push([x, 280 + Math.abs(x - 800) * 0.05 + (q() - 0.5) * 60 - Math.sin(x * 0.02) * 20]); return [...top, [1620, 540], [-20, 540]] as P[]; })();
const MIST: P[][] = [blob(400, 440, 520, 40, 3, 0.2, 10), blob(1200, 460, 520, 36, 4, 0.2, 10)];
const CLEARING: P[] = sample([[-20, 490], [300, 474], [800, 468], [1300, 474], [1620, 490], [1620, 900], [-20, 900]], true, 3);
const OAK_X = 800, OAK_G = 560, K = 0.62;
const O = (u: number, v: number): P => [OAK_X + u * K, OAK_G - v * K];
const TRUNK: P[] = sample([O(-150, -8), O(-96, 70), O(-84, 220), O(-120, 330), O(-40, 300), O(10, 360), O(60, 300), O(140, 340), O(92, 210), O(100, 70), O(160, -8)], true, 4);
const LIMBS: P[][] = [tube([O(-90, 300), O(-240, 380), O(-400, 400), O(-520, 360)], 40 * K, 8), tube([O(100, 310), O(250, 400), O(420, 420), O(540, 380)], 42 * K, 8), tube([O(-20, 330), O(-60, 460), O(-140, 540)], 30 * K, 6)];
const CROWN: P[][] = (() => { const q = rng(77), out: P[][] = []; for (let i = 0; i < 20; i++) { const a = q() * Math.PI * 2, r = Math.sqrt(q()), [x, y] = O(Math.cos(a) * r * 520, 435 + Math.sin(a) * r * 150); out.push(blob(x, y, (90 + q() * 60) * K, (64 + q() * 40) * K, 400 + i, 0.22, 14)); } return out; })();

// ---------------------------------------------------------------- the ring, still sitting there
type Sitter = { sh: Shape[]; nose: P; y: number };
const KINDS: Kind[] = ["rabbit", "fox", "badger", "marten", "rabbit", "fox", "badger", "rabbit", "marten", "rabbit"];
const RING: Sitter[] = [];
{
  const q = rng(515), RX = 780, RY = 190, C: P = [800, 640];
  for (let row = 0; row < 2; row++) for (let a = Math.PI * 0.95; a < Math.PI * 2.05;) {
    const rx = RX + row * 80, ry = RY + row * 22, x = C[0] + Math.cos(a) * rx, y = C[1] + Math.sin(a) * ry, h = 20 + ((y - 440) / 400) * 80;
    a += (h * (1.1 + q() * 0.4)) / Math.hypot(rx * Math.sin(a), ry * Math.cos(a));
    if (x < -40 || x > 1640 || (Math.abs(x - OAK_X) < 110 && y < 580)) continue;
    const kind = KINDS[Math.floor(q() * KINDS.length)], f = x < 800 ? 1 : -1;
    const m = beast({ kind, x, g: y, h, f, sit: kind !== "deer" && kind !== "boar", look: 0.3 });
    // the far ones only a few shapes each: their biggest parts, one pencil
    const all = fromMotif(m), area = (q: P[]) => { const b = bounds(q); return (b.x1 - b.x0) * (b.y1 - b.y0); }, keepN = h < 45 ? 4 : h < 75 ? 7 : all.length, big = new Set([...all].sort((p, q) => area(q.pts) - area(p.pts)).slice(0, keepN));
    RING.push({ sh: cold(all.filter((s) => big.has(s)).map((s) => (h < 45 ? { ...s, layers: s.layers.slice(0, 1).map((L) => ({ ...L, gap: 3.5 })) } : s)), 0.5), nose: m.nose, y });
  }
  // down the sides, nearer, the ring comes round toward you
  ([[70, 800, 90, 1, "rabbit"], [220, 760, 80, 1, "badger"], [1380, 770, 84, -1, "fox"], [1530, 820, 96, -1, "rabbit"]] as [number, number, number, 1 | -1, Kind][]).forEach(([x, y, h, f, kind]) => { const m = beast({ kind, x, g: y, h, f, sit: true, look: 0.3 }); RING.push({ sh: cold(fromMotif(m), 0.45), nose: m.nose, y }); });
}

// ---------------------------------------------------------------- the two new foxes
const BIG = curled(820, 800, 190, 1, 11, mix("#c8642a", GREY, 0.2), true);
const SMALL = curled(660, 846, 110, -1, 21, "#d0783a");
const TIP_BIG = BIG.tip;
// the string round the big one's neck, and the whistle hanging from it into the fur of its tail
const STRING: Line[] = [
  { pts: [[BIG.neck[0] + 4, BIG.neck[1] - 50], [BIG.neck[0] + 22, BIG.neck[1] - 4], [BIG.neck[0] + 30, BIG.neck[1] + 40], [BIG.neck[0] + 22, BIG.neck[1] + 70]], w: 2.6, color: "#3a2e24", alpha: 0.95 },
  { pts: [[BIG.neck[0] + 4, BIG.neck[1] - 50], [BIG.neck[0] - 14, BIG.neck[1] - 20], [BIG.neck[0] - 12, BIG.neck[1] + 20]], w: 2.2, color: "#3a2e24", alpha: 0.8 },
];
const WHISTLE: P[] = (() => { const [x, y] = [BIG.neck[0] + 22, BIG.neck[1] + 94]; return turn([[x - 34, y - 7], [x + 24, y - 9], [x + 32, y], [x + 24, y + 9], [x - 34, y + 8]], x, y, 70); })();
const WHISTLE_HOLE: P[] = (() => { const cx = (WHISTLE[0][0] + WHISTLE[2][0]) / 2, cy = (WHISTLE[0][1] + WHISTLE[2][1]) / 2; return oval(cx, cy, 3.4, 3.4, 8); })();

// ---------------------------------------------------------------- the page, back to front
const shapes: Shape[] = [
  { pts: SKY, layers: [{ color: "#a8b0bc", angle: 0.2, gap: 5.5, w: 2.4, alpha: 0.65 }, { color: "#7a8494", angle: -0.4, gap: 7, w: 2, alpha: 0.45, keep: (_x, y) => y < 200 }, { color: "#d8c8c0", angle: 0.05, gap: 8, w: 1.8, alpha: 0.4, keep: (_x, y) => y > 300 }], outline: false },
  { pts: WOOD, layers: [{ color: "#3a4250", angle: 1.3, gap: 4, w: 2.4, alpha: 0.8 }, { color: "#5a6270", angle: -0.3, gap: 5, w: 2, alpha: 0.5 }], outline: false },
  ...MIST.map((m) => ({ pts: m, layers: [{ color: "#e4e8ec", angle: 0.05, gap: 5, w: 2, alpha: 0.5 }] as Layer_[], outline: false as const })),
  { pts: CLEARING, layers: [{ color: "#8a9a9a", angle: 0.15, gap: 5, w: 2.1, alpha: 0.65 }, { color: "#5a6a6e", angle: 1.2, gap: 7, w: 1.8, alpha: 0.5, keep: (_x, y) => y > 620 }, { color: "#c8d0d8", angle: -0.5, gap: 8, w: 1.6, alpha: 0.4 }], outline: false }, // frost on it
  ...RING.filter((r) => r.y < OAK_G).sort((a, b) => a.y - b.y).flatMap((s) => s.sh),
  ...cold(LIMBS.map((p) => ({ pts: p, layers: tint(p, "#4a4238", { angle: 1.1, gap: 4 }), outline: { color: "#2a2a30" } })), 0.35),
  ...CROWN.map((c, i) => ({ pts: c, layers: [{ color: ["#4a5a58", "#56645e", "#445250"][i % 3], angle: 0.9 + (i % 5) * 0.12, gap: 4.5, w: 2, alpha: 0.8 }, { color: "#2a3238", angle: -0.4, gap: 6, w: 1.8, alpha: 0.5 }] as Layer_[], outline: { color: "#2a3238", w: 1.2, alpha: 0.6 } })),
  ...cold([{ pts: TRUNK, layers: [{ color: "#4a4238", angle: 1.45, gap: 4, w: 2.2, alpha: 0.85 }, { color: "#1e2228", angle: 0.4, gap: 5, w: 2, alpha: 0.6, keep: (x: number) => x > OAK_X - 20 }], outline: { color: "#2a2a30", w: 1.8 } }], 0.3),
  ...RING.filter((r) => r.y >= OAK_G).sort((a, b) => a.y - b.y).flatMap((s) => s.sh),
  ...cold(BIG.shapes, 0.1), { pts: TIP_BIG, layers: [], outline: false }, // its tail's tip curls, drawn live
  ...cold(SMALL.shapes, 0.1), { pts: SMALL.tip, layers: [{ color: "#e8e4dc", angle: 0.4, gap: 4, w: 1.6, alpha: 0.6 }], outline: { color: "#5a4a40" } },
  { pts: WHISTLE, layers: [{ color: "#e8dcc0", angle: 0.3, gap: 2.5, w: 1.8, alpha: 0.95 }, { color: "#a8987a", angle: -0.9, gap: 4, w: 1.4, alpha: 0.6, keep: (_x, y) => y > WHISTLE[2][1] }], outline: { color: "#6a5a40", w: 1.3 } },
  { pts: WHISTLE_HOLE, layers: [{ color: "#3a2a20", angle: 0.2, gap: 2, w: 1.4, alpha: 0.9 }], outline: false },
];
const frost: Line[] = Array.from({ length: 90 }, (_, i) => { const q = rng(300 + i), x = q() * 1600, y = 660 + q() * 235, h = 8 + q() * 16; return { pts: [[x, y], [x + (q() - 0.4) * 6, y - h]] as P[], w: 1.5, color: q() < 0.5 ? "#4a5a5e" : "#e8eef2", alpha: 0.8 }; });

// ---------------------------------------------------------------- what moves
const BREATH = [{ at: BIG.nose, s: 1.4, ph: 0 }, { at: SMALL.nose, s: 1, ph: 0.4 }, ...RING.filter((_, i) => i % 5 === 2).map((r, i) => ({ at: r.nose, s: 0.5 + ((r.y - 440) / 400) * 0.6, ph: (i * 0.29) % 1 }))];
const TAIL_PIVOT = BIG.tailAt;

export const f12 = sketch({
  id: "f12", title: "Les Pattes", loop: LOOP, shapes, lines: [...frost.map((l, i) => ({ ...l, seed: 900 + i, at: [4 + (i % 30), 8 + (i % 30)] as [number, number] })), ...STRING.map((l, i) => ({ ...l, seed: 1000 + i, at: [97, 102] as [number, number] }))], // the string goes on over the fur
  anim: (g, t, reveal) => {
    const T = t / LOOP, TT = T * Math.PI * 2;
    live(g, () => {
      // the slow dawn: a cold light coming along the tops of the trees, and going
      const dawn = 0.5 - 0.5 * Math.cos(TT);
      for (let k = 0; k < 6; k++) { const y = 250 + k * 14; g.pen([[-10, y + 30], [800, y - 10], [1610, y + 20]], { w: 3, color: k % 2 ? "#f0d8b8" : "#f4e4d4", seed: 10 + k, wobble: 0.3, boil: 0, taper: 1, opacity: dawn * 0.4 * reveal, retrace: false }); }
      // breath, smoking in the cold: each one a puff that rises and thins, two a loop
      BREATH.forEach((b, i) => { for (let k = 0; k < 2; k++) { const p = (T * 2 + b.ph + k * 0.5) % 1, [x, y] = b.at, r = (7 + p * 20) * b.s, a = Math.sin(p * Math.PI) * reveal, cx = x + p * 26 * b.s, cy = y - 6 - p * 40 * b.s, puff = oval(cx, cy, r, r * 0.62, 12);
        pencilLive(g, puff, "#f6f8fa", { angle: 0.3, gap: 2.6, seed: 40 + i * 3 + k, alpha: 0.85 * a });
        g.pen([...puff, puff[0]], { w: 1.2, color: "#9aa4b4", seed: 140 + i * 3 + k, wobble: 0.4, boil: 0, taper: 1, opacity: 0.5 * a, retrace: false }); } });
      // the big one's tail: its tip curls up a little and settles, once a loop
      const c = 14 * Math.sin(TT) ** 2;
      pencilLive(g, turn(TIP_BIG, TAIL_PIVOT[0], TAIL_PIVOT[1], -c), "#ece8e0", { angle: 0.4, gap: 3.5, seed: 70, alpha: 0.8 * reveal, outline: "#5a4a40" });
    });
  },
});
