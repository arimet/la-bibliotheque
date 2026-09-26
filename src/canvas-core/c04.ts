// CORBENIC PAGE 4 · CORBENIC. One idea: the castle at the end of the valley, and over its wall, the
// knights of the Round Table, dead, all turned toward the same door.
// The gold is starting to dull. Corbenic stands on its rock: a curtain wall with a tower at each end,
// the keep behind with its door, a gatehouse with a dove carved over the arch and the drawbridge
// down. Over the wall, as a painter shows what the eye could not, the courtyard: dead knights in
// mail with their shields, facing the keep's door. At the foot of the rock, the dry well. On the
// left, small on the road, the knight on his horse.
// What moves: the dead swaying where they stand, crows turning over the keep, cold air rising from
// the well, the glint on the dulled gold.
import { rng, type P } from "./core";
import { border, borderGlint } from "./border";
import { dense, figure, horse, lay, motif, paintMotif, type Shield } from "./figures";
import { blob, inside, mix } from "./gallery";
import { diaper, gilt, glint, hand, hills } from "./manuscript";
import { page, seq, type Stroke, type Wash } from "./west";

const DRAW = 105, LOOP = 180, ROT = 0.3, H = hand(ROT), INK = H.ink;
const STONE = "#c4bfae", STONE2 = "#ada898", ROCKC = "#8f8676", SLATE = "#5d6b78", EARTH = "#a89468";
const B = border(ROT, [0, 44]);
const FROM: P = [1000, 460];

// ---------------------------------------------------------------- the land and the rock
const SKY: P[] = [[44, 40], [1556, 40], [1556, 560], [44, 560]];
const FAR = hills(44, 1556, 540, 6, 40, 41);
const SKY_SEEN: P[] = [[44, 40], [1556, 40], ...FAR.pts.slice(0, -2).reverse()];
const ROCK: P[] = [[660, 870], [690, 720], [720, 640], [700, 560], [740, 500], [1470, 496], [1500, 560], [1480, 640], [1510, 720], [1540, 870]];
// the rock in strata, as a painter builds a cliff: bands with a wavy top, alternately lit and
// shaded, each with a dark line along its lip; the bands are clipped to the rock
const rl = rng(5), STRATA: P[][] = [], LEDGES: P[][] = [];
for (const [y, k] of [[548, 0], [612, 1], [690, 2], [770, 3]] as const) {
  const top: P[] = Array.from({ length: 23 }, (_, i) => [640 + i * 42, y + Math.sin(i * 1.3 + k * 2) * 9 + (rl() - 0.5) * 8] as P);
  STRATA.push([...top, [1560, 880], [640, 880]]);
  LEDGES.push(...top.reduce<P[][]>((runs, p) => { if (inside(ROCK, p[0], p[1] + 3)) { const last = runs[runs.length - 1]; if (last && Math.abs(last[last.length - 1][0] - p[0]) < 50) last.push(p); else runs.push([p]); } return runs; }, []).filter((l) => l.length > 1));
}
const GROUND: P[] = [[44, 870], [44, 700], [400, 660], [700, 690], [1556, 700], [1556, 870]];
const CRACKS: P[][] = [[[800, 560], [790, 600]], [[1240, 560], [1250, 600]], [[1060, 700], [1070, 760]], [[1400, 700], [1390, 750]], [[900, 630], [910, 680]], [[1300, 790], [1290, 840]], [[760, 790], [770, 840]]];
// the courtyard, seen over the wall: the keep at the back, the dead facing its door
const KEEP: P[] = [[1150, 470], [1150, 180], ...crenel(1150, 1330, 180), [1330, 180], [1330, 470]];
const KEEP_DOOR: P[] = [[1206, 470], [1206, 392], [1224, 372], [1246, 364], [1268, 372], [1286, 392], [1286, 470]];
const WALL_TOP = 430;
const WALL: P[] = [[740, 500], [740, WALL_TOP], ...crenel(740, 1470, WALL_TOP, 36), [1470, WALL_TOP], [1470, 500]];
const tower = (x0: number, x1: number, top: number): { body: P[]; roof: P[] } => ({ body: [[x0, 520], [x0, top], [x1, top], [x1, 520]], roof: [[x0 - 10, top], [(x0 + x1) / 2, top - 90], [x1 + 10, top]] });
const TOWERS = [tower(700, 790, 330), tower(1420, 1510, 340)];
const GATE: P[] = [[880, 560], [880, 380], ...crenel(880, 1000, 380, 30), [1000, 380], [1000, 560]];
const ARCH: P[] = [[906, 560], [906, 470], [918, 448], [940, 438], [962, 448], [974, 470], [974, 560]];
const DOVE: P[] = [[922, 412], [934, 404], [944, 406], [952, 398], [960, 400], [954, 408], [966, 410], [948, 418], [930, 418]];
const BRIDGE: P[] = [[906, 560], [974, 560], [900, 640], [812, 640]];
const WELL = { x: 1420, y: 800 }, WELL_BODY: P[] = [[1370, 850], [1370, 800], [1470, 800], [1470, 850]], WELL_TOP = blob(WELL.x, WELL.y, 50, 14, 90, 0.04, 16), WELL_HOLE = blob(WELL.x, WELL.y + 1, 38, 8, 91, 0.04, 14);
function crenel(x0: number, x1: number, y: number, step = 30): P[] { const out: P[] = []; for (let x = x0; x < x1 - step / 2; x += step) out.push([x, y], [x, y - 16], [x + step / 2, y - 16], [x + step / 2, y]); return out; }
const ROAD: P[] = [[160, 870], [360, 760], [600, 690], [812, 640], [900, 640], [680, 730], [470, 800], [420, 870]];

// the knight on his horse, small, on the road
const HORSE = horse({ x: 320, g: 812, h: 150, coat: "#e8dfc9", cloth: "#f0e8d6", hem: H.b, ink: INK });
const KNIGHT = figure({ x: HORSE.saddle[0], g: HORSE.saddle[1] + 0.45 * 206, h: 206, robe: "saddle", head: "coif", cloth: "#f0e8d6", ink: INK, near: [0.55, 1.25], far: [0.4, 1.1], shield: { field: "#f0e8d6", mark: H.b, ord: "cross" } });
// the dead in the courtyard, row behind row, all facing the keep
const SHIELDS: Shield[] = [
  { field: "#2d4f8e", mark: "#c9a043", ord: "lion" },      // Yvain
  { field: "#e6dfcc", mark: "#b8321f", ord: "merlettes" }, // Lamorak
  { field: "#3f6a3a", mark: "#e6dfcc", ord: "bend" },
  { field: "#b8321f", mark: "#c9a043", ord: "chevron" },
  { field: "#c9a043", mark: "#2a1c14", ord: "cross" },
  { field: "#5a4a6a", mark: "#e6dfcc", ord: "pale" },
  { field: "#2d4f8e", mark: "#e6dfcc", ord: "bend" },
];
const CLOTHS = ["#2d4f8e", "#d8cfb8", "#3f6a3a", "#9a3a2a", "#b38a3a", "#5a4a6a", "#6b7f8a"];
const r = rng(12);
const DEAD = Array.from({ length: 7 }, (_, i) => ({ x: 826 + i * 48 + (i % 2) * 12, g: 480 + (i % 2) * 14, h: 150 + (i % 3) * 8, ph: r() * 6.28, sp: 0.8 + r() * 0.5 }));
const dead = (d: (typeof DEAD)[number], i: number, sway: number) => figure({ x: d.x, g: d.g, h: d.h, f: 1, lean: 0.04 + sway, robe: "armor", head: "coif", cloth: CLOTHS[i], ink: INK, dead: true, lite: true, near: [0.25, 0.6], far: [0.2, 0.5], shield: SHIELDS[i] });

// ---------------------------------------------------------------- the pen
let sd = 1;
const st = (pts: P[], w: number, op = 0.9, color = INK, hide?: P[][]): Omit<Stroke, "at"> => ({ pts: dense(pts), w, seed: sd++, op, wob: 0.45, color, hide });
const edge = (pts: P[], w: number, hide?: P[][]) => st([...pts, pts[0]], w, 0.9, INK, hide);
const rider = lay(motif(HORSE.m, KNIGHT.m), { at: [44, 72], seed: 3000, ink: INK, ph: 6, from: FROM });
const TW = TOWERS.flatMap((t) => [t.body, t.roof]);
const skyFront = [...TW, KEEP, WALL, GATE, ROCK, FAR.pts, ...KNIGHT.m.parts];
const DIA = diaper({ x0: 44, y0: 40, x1: 1556, y1: 540 }, 46);
const scene: Omit<Stroke, "at">[] = [
  st(FAR.pts.slice(0, -2), 1.5, 0.9, INK, [ROCK, ...TW]), ...FAR.ledges.map((l) => st(l, 1, 0.55, INK, [ROCK, ...TW, ...KNIGHT.m.parts, ...HORSE.m.parts])),
  edge(KEEP, 1.6, [WALL, GATE]), edge(KEEP_DOOR, 1.4, [WALL]), ...[240, 300].map((y) => st([[1200, y], [1200, y + 34]], 5, 0.95, "#2a1c14")), ...[240, 300].map((y) => st([[1280, y], [1280, y + 34]], 5, 0.95, "#2a1c14")),
  ...TOWERS.flatMap((t) => [edge(t.body, 1.6), edge(t.roof, 1.5), st([[(t.body[0][0] + t.body[2][0]) / 2, t.body[1][1] + 50], [(t.body[0][0] + t.body[2][0]) / 2, t.body[1][1] + 84]], 5, 0.95, "#2a1c14")]),
  edge(WALL, 1.6, [GATE, ...TW]), ...[455, 478].map((y) => st([[740, y], [1470, y]], 0.8, 0.4, INK, [GATE, ...TW])),
  edge(GATE, 1.6), edge(ARCH, 1.5, [BRIDGE]), edge(DOVE, 1.2), edge(BRIDGE, 1.5), ...[0.25, 0.5, 0.75].map((t) => st([[906 + (812 - 906) * t, 560 + 80 * t], [974 + (900 - 974) * t, 560 + 80 * t]], 0.9, 0.6)),
  st([[906, 470], [812, 640]], 1.2, 0.8, "#3b2a20"), st([[974, 470], [900, 640]], 1.2, 0.8, "#3b2a20"), // the chains of the bridge
  st(ROCK.slice(0, -1), 1.6, 0.9, INK, [GATE, BRIDGE, WELL_BODY, WELL_TOP, ...TW]), ...LEDGES.map((l) => st(l, 1.4, 0.8, INK, [BRIDGE, WELL_BODY, WELL_TOP, GATE])), ...LEDGES.map((l) => st(l.map(([x, y]) => [x, y + 5] as P), 5, 0.18, INK, [BRIDGE, WELL_BODY, WELL_TOP, GATE])), ...CRACKS.map((l) => st(l, 1, 0.6, INK, [BRIDGE, WELL_BODY, WELL_TOP])),
  edge(WELL_BODY, 1.4), edge(WELL_TOP, 1.3), edge(WELL_HOLE, 1.1), ...[1392, 1420, 1448].map((x) => st([[x, 806], [x, 848]], 0.8, 0.45)),
  st(ROAD.slice(0, 4), 1.4, 0.9, INK, [...KNIGHT.m.parts, ...HORSE.m.parts]), st(ROAD.slice(4), 1.4, 0.9, INK, [...KNIGHT.m.parts, ...HORSE.m.parts]),
  ...rider.strokes,
];
const lattice = [...DIA.lines.map((l) => st(l, 1, 0.42, mix(H.gold, INK, 0.45), skyFront)), ...DIA.dots.map(([x, y]) => st([[x - 0.6, y], [x + 0.6, y]], 3, 0.55, mix(H.gold, INK, 0.35), skyFront))];
const strokes = [...B.strokes, ...seq(scene, 6, 72), ...seq(lattice, 60, 86, 0.8)];

// ---------------------------------------------------------------- the colour
const flat = (pts: P[], color: string, ph: number, at: [number, number], seed: number): Wash => ({ pts, color, alpha: 1, seed, at, ph, from: FROM, flat: true });
const washes: Wash[] = [
  gilt(SKY, ROT, [30, 62], 500, { ph: 0, from: [1240, 40] }),
  flat(FAR.pts, mix(EARTH, H.c, 0.25), 1, [34, 64], 501),
  flat(KEEP, STONE, 2, [36, 66], 510), flat(KEEP_DOOR, "#2a1c14", 2, [38, 66], 511),
  ...TOWERS.flatMap((t, i) => [flat(t.body, STONE, 3, [38, 68], 520 + i * 2), flat(t.roof, SLATE, 3, [38, 68], 521 + i * 2)]),
  flat(WALL, STONE2, 3, [40, 70], 530), flat(GATE, STONE, 4, [42, 72], 531), flat(ARCH, "#2a1c14", 4, [42, 72], 532), flat(DOVE, "#f3eee2", 4, [46, 74], 533),
  flat(GROUND, EARTH, 2, [34, 66], 541), flat(ROCK, ROCKC, 3, [36, 68], 540), ...STRATA.map((q, i) => ({ ...flat(q, i % 2 ? mix(ROCKC, "#e6dcc4", 0.28) : mix(ROCKC, "#3a3228", 0.12), 3, [38, 70], 560 + i), clip: ROCK })), flat(ROAD, "#d9c9a0", 4, [40, 70], 542), flat(BRIDGE, "#8a6a44", 5, [44, 72], 543),
  flat(WELL_BODY, STONE, 5, [44, 72], 550), flat(WELL_TOP, STONE2, 5, [44, 72], 551), flat(WELL_HOLE, "#1d1510", 5, [46, 74], 552),
  ...rider.washes,
  ...B.washes,
];

// ---------------------------------------------------------------- what moves
const WALL_FRONT: P[] = [[700, 900], [700, WALL_TOP - 16], [1520, WALL_TOP - 16], [1520, 900]]; // the dead are cut off at the wall's top
const CROWS = [0, 1, 2].map((i) => ({ r: 70 + i * 26, ph: i * 2.1, y: 150 + i * 18 }));
export const c04 = page({
  id: "c04", title: "Corbenic", draw: DRAW, loop: LOOP, paper: H.paper, ink: INK, strokes, washes,
  animAt: [58, 90],
  anim: (g, t, reveal) => {
    const TT = (t / LOOP) * Math.PI * 2;
    // the dead, behind the wall and the gatehouse, each swaying on its own slow beat
    DEAD.forEach((d, i) => paintMotif(g, dead(d, i, 0.03 * Math.sin(TT * d.sp + d.ph)).m, { ink: INK, seed: 6000 + i * 100, reveal, hide: [WALL_FRONT, GATE] }));
    // crows turning over the keep
    g.group("plain", () => CROWS.forEach((c, i) => {
      const a = TT * (i % 2 ? -1 : 1) + c.ph, x = 1240 + Math.cos(a) * c.r, y = c.y + Math.sin(a) * c.r * 0.35, flap = Math.sin(TT * 9 + i) * 5;
      g.pen([[x - 13, y - 3 + flap], [x - 5, y - 1], [x, y + 2], [x + 5, y - 1], [x + 13, y - 3 + flap]], { w: 2.4, color: "#1a1410", seed: 90 + i, wobble: 0.1, boil: 0, opacity: 0.95 * reveal, retrace: false });
    }));
    // cold air out of the well
    g.group("plain", () => [0, 1, 2].forEach((k) => {
      const p = ((t + k * 60) % LOOP) / LOOP, pts: P[] = [];
      for (let j = 0; j <= 8; j++) { const dy = 6 + p * 110 * (j / 8); pts.push([WELL.x - 20 + k * 20 + Math.sin(dy * 0.07 + p * 6 + k) * (4 + dy * 0.08), WELL.y - dy]); }
      g.pen(pts, { w: 2.2, color: "#f1ede2", seed: 95 + k, wobble: 0.2, boil: 0.2, opacity: Math.sin(p * Math.PI) * 0.55 * reveal, retrace: false });
    }));
    if (reveal < 1) return;
    glint(g, [SKY_SEEN], t, LOOP, ROT, skyFront);
    borderGlint(g, t, LOOP, ROT);
  },
});
