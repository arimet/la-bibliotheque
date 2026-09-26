// The animals of the Grands Bois, as geometry any kit can render (a Motif: fills in order, a few
// lines, parts for hiding). In profile, facing `f`, sized by `h`, the height at the shoulder.
// Four-footed ones share one body plan (a barrel, a neck, a head, four legs, a tail), set per kind;
// they stand, or sit on their haunches the way the wood's animals sit in a ring. Birds are their own.
import { oval, sample, tube, type P } from "./core";
import { mix } from "./gallery";
import type { Fill, Line, Motif } from "./figures";

export type Kind = "fox" | "whitefox" | "badger" | "rabbit" | "deer" | "boar" | "marten";
type Plan = { coat: string; belly?: string; dark: string; len: number; leg: number; thick: number; neck: number; head: number; snout: number; ear: number; earW: number; tail: number; tailW: number; tailUp: number; tip?: string; mask?: boolean };
const PLANS: Record<Kind, Plan> = {
  fox: { coat: "#c8642a", belly: "#f1e6d2", dark: "#3a2620", len: 1.15, leg: 0.55, thick: 0.34, neck: 0.3, head: 0.3, snout: 0.26, ear: 0.2, earW: 0.1, tail: 0.95, tailW: 0.16, tailUp: 0.15, tip: "#f4efe4" },
  whitefox: { coat: "#efe9dc", belly: "#ffffff", dark: "#7a6e66", len: 1.15, leg: 0.55, thick: 0.34, neck: 0.3, head: 0.3, snout: 0.26, ear: 0.2, earW: 0.1, tail: 0.95, tailW: 0.16, tailUp: 0.15, tip: "#ffffff" },
  badger: { coat: "#8a8680", belly: "#3a3634", dark: "#2a2624", len: 1.25, leg: 0.3, thick: 0.52, neck: 0.12, head: 0.36, snout: 0.22, ear: 0.07, earW: 0.07, tail: 0.25, tailW: 0.08, tailUp: 0.1, mask: true },
  rabbit: { coat: "#a0886a", belly: "#efe6d6", dark: "#5a4a3a", len: 0.8, leg: 0.3, thick: 0.5, neck: 0.1, head: 0.34, snout: 0.12, ear: 0.46, earW: 0.1, tail: 0.1, tailW: 0.1, tailUp: 0.3, tip: "#ffffff" },
  deer: { coat: "#b07a4a", belly: "#ecdcc4", dark: "#4a3222", len: 1.0, leg: 0.95, thick: 0.34, neck: 0.55, head: 0.3, snout: 0.2, ear: 0.2, earW: 0.08, tail: 0.1, tailW: 0.06, tailUp: 0.4, tip: "#f4efe4" },
  boar: { coat: "#4a3a30", belly: "#3a2e26", dark: "#1e1814", len: 1.3, leg: 0.4, thick: 0.62, neck: 0.1, head: 0.42, snout: 0.3, ear: 0.12, earW: 0.08, tail: 0.18, tailW: 0.03, tailUp: -0.1 },
  marten: { coat: "#6a4a30", belly: "#e6d4a8", dark: "#2a1e16", len: 1.4, leg: 0.3, thick: 0.28, neck: 0.25, head: 0.24, snout: 0.16, ear: 0.08, earW: 0.08, tail: 0.7, tailW: 0.1, tailUp: 0.05 },
};

export const beast = (o: { kind: Kind; x: number; g: number; h: number; f?: 1 | -1; sit?: boolean; coat?: string; look?: number }): Motif & { head: P; nose: P } => {
  const k = { ...PLANS[o.kind], ...(o.coat ? { coat: o.coat } : {}) }, f = o.f ?? 1, h = o.h, sit = !!o.sit;
  // u forward (toward the head), v up, both in shoulder heights
  const S = (u: number, v: number): P => [o.x + f * u * h, o.g - v * h];
  const fills: Fill[] = [], lines: Line[] = [], parts: P[][] = [];
  const add = (pts: P[], color: string) => { fills.push({ pts, color }); parts.push(pts); };
  const L = k.len * 0.5, T = k.thick, legC = mix(k.coat, k.dark, 0.35), farC = mix(legC, "#000000", 0.18);
  const ell = (cu: number, cv: number, ru: number, rv: number, n = 20, rot = 0): P[] => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2, x = Math.cos(a) * ru, y = Math.sin(a) * rv; return S(cu + x * Math.cos(rot) - y * Math.sin(rot), cv + x * Math.sin(rot) + y * Math.cos(rot)); });
  // a leg: thick at the top, a joint, thin at the foot; `bend` + for a knee forward, - for a hock back
  const leg = (u: number, v: number, bend: number, color: string, len = k.leg + T * 0.3) => {
    const top = S(u, v), joint = S(u + bend * 0.12, v - len * 0.55), foot = S(u + bend * 0.02, 0.02);
    add(tube([top, joint, foot], Math.max(2.5, 0.075 * h * (T / 0.34) ** 0.5), Math.max(1.6, 0.03 * h)), color);
    add(oval(foot[0] + f * 0.03 * h, foot[1] - 0.01 * h, 0.045 * h, 0.022 * h, 8), mix(color, "#000000", 0.2));
  };
  let shoulder: P, headAt: [number, number];
  if (!sit) {
    const bv = k.leg + T * 0.5;
    leg(-L * 0.62, bv - T * 0.1, -0.6, farC); leg(L * 0.55, bv - T * 0.1, 0.3, farC);
    if (k.tail > 0.15) { const tb = S(-L * 0.95, bv + T * 0.15), te = S(-L * 0.95 - k.tail * 0.85, bv + k.tailUp + k.tail * 0.15); add(sample([tb, [tb[0] - f * k.tailW * h * 0.5, tb[1] - k.tailW * h * 0.9], [te[0], te[1] - k.tailW * h * 0.45], [te[0] - f * 0.05 * h, te[1] + 0.02 * h], [te[0], te[1] + k.tailW * h * 0.45], [tb[0], tb[1] + k.tailW * h * 0.6]], true, 3), k.coat); if (k.tip) add(oval(te[0] - f * 0.03 * h, te[1] + 0.01 * h, k.tailW * h * 0.6, k.tailW * h * 0.42, 10), k.tip); }
    else if (k.tip) add(oval(S(-L * 1.0, bv + T * 0.25)[0], S(-L * 1.0, bv + T * 0.25)[1], k.tailW * h, k.tailW * h, 10), k.tip);
    add(ell(0, bv, L, T * 0.5, 22), k.coat);
    if (k.belly) add(ell(L * 0.15, bv - T * 0.22, L * 0.7, T * 0.22, 14), k.belly);
    shoulder = S(L * 0.7, bv + T * 0.2); headAt = [L * 0.7 + k.neck * 0.45, bv + T * 0.3 + k.neck * 0.7];
    leg(-L * 0.5, bv - T * 0.15, -0.6, legC); leg(L * 0.68, bv - T * 0.15, 0.3, legC);
  } else {
    // on its haunches: the haunch on the ground at the back, the chest up above the front feet
    const hr = L * 0.55, chestU = L * 0.25, chestV = T * 0.5 + k.leg * 0.65;
    if (k.tail > 0.15) { const tb = S(-hr * 0.9, 0.08), te = S(hr * 0.4 + k.tail * 0.5, 0.04); add(sample([tb, [(tb[0] + te[0]) / 2, tb[1] + 0.02 * h], te, [te[0] + f * 0.02 * h, te[1] - k.tailW * h * 0.9], [(tb[0] + te[0]) / 2, tb[1] - k.tailW * h]], true, 3), k.coat); if (k.tip) add(oval(te[0], te[1] - k.tailW * h * 0.4, k.tailW * h * 0.55, k.tailW * h * 0.45, 10), k.tip); }
    add(ell(chestU * 0.2, chestV * 0.55, L * 0.5, chestV * 0.62, 22, 0.55 * f * 0 + 0.5), k.coat);
    if (k.belly) add(ell(chestU + L * 0.12, chestV * 0.7, L * 0.2, chestV * 0.4, 14, 0.4), k.belly);
    leg(chestU + L * 0.18, chestV * 0.55, 0.05, legC, chestV * 0.55);
    add(ell(-hr * 0.2, hr * 0.62, hr, hr * 0.62 + 0.02, 18), mix(k.coat, k.dark, 0.12)); // the haunch
    shoulder = S(chestU + L * 0.1, chestV + T * 0.2); headAt = [chestU + L * 0.12 + k.neck * 0.2, chestV + T * 0.35 + k.neck * 0.6];
  }
  // neck and head (the head a little up or down: `look`)
  const hc = S(headAt[0], headAt[1] + (o.look ?? 0) * 0.1), rH = k.head * h * 0.55;
  add(tube([shoulder, [(shoulder[0] + hc[0]) / 2, (shoulder[1] + hc[1]) / 2], hc], T * 0.36 * h, rH * 0.7), k.coat);
  const nose: P = [hc[0] + f * (rH * 0.8 + k.snout * h), hc[1] + rH * 0.35];
  const skull = sample([[hc[0] - f * rH, hc[1] - rH * 0.1], [hc[0] - f * rH * 0.4, hc[1] - rH * 0.9], [hc[0] + f * rH * 0.5, hc[1] - rH * 0.75], [nose[0] - f * rH * 0.1, nose[1] - rH * 0.3], [nose[0], nose[1]], [hc[0] + f * rH * 0.5, hc[1] + rH * 0.6], [hc[0] - f * rH * 0.6, hc[1] + rH * 0.65]], true, 3);
  const ear = (dx: number): P[] => { const b: P = [hc[0] + f * dx * rH, hc[1] - rH * 0.65]; return [[b[0] - f * k.earW * h * 0.7, b[1] + 3], [b[0] - f * k.earW * h * 0.15, b[1] - k.ear * h], [b[0] + f * k.earW * h * 0.7, b[1] + 3]]; };
  add(ear(-0.45), mix(k.coat, k.dark, 0.3));
  add(skull, k.coat);
  add(ear(0.0), k.coat);
  if (k.mask) add(sample([[hc[0] - f * rH * 0.9, hc[1] - rH * 0.25], [hc[0], hc[1] - rH * 0.55], [nose[0] - f * 5, nose[1] - rH * 0.25], [nose[0] - f * 7, nose[1] - 2], [hc[0], hc[1] - rH * 0.05], [hc[0] - f * rH * 0.9, hc[1] + rH * 0.05]], true, 2), "#f4efe4");
  add(oval(nose[0] - f * 2, nose[1] - 1, Math.max(2.2, rH * 0.16), Math.max(2, rH * 0.13), 8), k.dark);
  const eye: P = [hc[0] + f * rH * 0.3, hc[1] - rH * 0.2];
  add(oval(eye[0], eye[1], Math.max(2, rH * 0.12), Math.max(2, rH * 0.14), 8), "#1a1410");
  lines.push({ pts: [[hc[0] + f * rH * 0.1, hc[1] + rH * 0.35], [nose[0] - f * rH * 0.2, nose[1] + 1]], w: Math.max(1, h / 130), color: mix(k.coat, k.dark, 0.6), z: parts.length }); // the mouth
  return { fills, lines, parts, head: hc, nose };
};

// The heron standing in the water, the owl on a branch
export const heron = (o: { x: number; g: number; h: number; f?: 1 | -1 }): Motif & { head: P } => {
  const f = o.f ?? 1, h = o.h, S = (u: number, v: number): P => [o.x + f * u * h, o.g - v * h];
  const fills: Fill[] = [], parts: P[][] = [], lines: Line[] = [];
  const add = (pts: P[], color: string) => { fills.push({ pts, color }); parts.push(pts); };
  add(tube([S(-0.02, 0.5), S(-0.03, 0.25), S(-0.03, 0)], 0.012 * h, 0.01 * h), "#6a5a3a");
  add(tube([S(0.04, 0.5), S(0.06, 0.25), S(0.07, 0)], 0.012 * h, 0.01 * h), "#7a6a4a");
  add(sample([S(-0.3, 0.72), S(-0.2, 0.82), S(0.1, 0.82), S(0.2, 0.7), S(0.1, 0.52), S(-0.15, 0.55)], true, 4), "#9aa0a6");
  add(sample([S(-0.32, 0.72), S(-0.1, 0.78), S(0.12, 0.7), S(-0.05, 0.62)], true, 3), "#6a7078"); // the folded wing
  add(tube([S(0.14, 0.76), S(0.26, 0.9), S(0.18, 1.02), S(0.22, 1.1)], 0.035 * h, 0.028 * h), "#c9cdd0");
  const hd = S(0.25, 1.12);
  add(oval(hd[0], hd[1], 0.045 * h, 0.035 * h, 10), "#e6e8ea");
  add([S(0.28, 1.13), S(0.46, 1.1), S(0.28, 1.1)], "#c9a043");
  add(oval(hd[0] + f * 0.012 * h, hd[1] - 0.008 * h, 2.5, 2.5, 6), "#1a1410");
  lines.push({ pts: [S(0.22, 1.14), S(0.08, 1.16)], w: 2, color: "#2a2a2a", z: parts.length }); // the black plume
  return { fills, lines, parts, head: hd };
};
export const owl = (o: { x: number; g: number; h: number }): Motif & { eyes: P[] } => {
  const h = o.h, S = (u: number, v: number): P => [o.x + u * h, o.g - v * h];
  const fills: Fill[] = [], parts: P[][] = [];
  const add = (pts: P[], color: string) => { fills.push({ pts, color }); parts.push(pts); };
  add(oval(S(0, 0.38)[0], S(0, 0.38)[1], 0.26 * h, 0.38 * h, 18), "#8a6a4a");
  add(oval(S(0, 0.3)[0], S(0, 0.3)[1], 0.17 * h, 0.26 * h, 16), "#d8c4a0");
  add(oval(S(0, 0.8)[0], S(0, 0.8)[1], 0.24 * h, 0.2 * h, 16), "#8a6a4a");
  add([S(-0.2, 0.92), S(-0.16, 1.08), S(-0.08, 0.95)], "#6a4a30"); add([S(0.2, 0.92), S(0.16, 1.08), S(0.08, 0.95)], "#6a4a30");
  const eyes: P[] = [S(-0.09, 0.82), S(0.09, 0.82)];
  eyes.forEach(([x, y]) => { add(oval(x, y, 0.075 * h, 0.075 * h, 12), "#f2c14a"); add(oval(x, y, 0.035 * h, 0.035 * h, 10), "#1a1410"); });
  add([S(-0.02, 0.76), S(0.02, 0.76), S(0, 0.7)], "#4a3a2a");
  return { fills, lines: [], parts, eyes };
};
