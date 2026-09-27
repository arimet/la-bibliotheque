// THE LIBRARY: the site's front page. The Long Room is baked (tools/bake-library.mjs), one image per
// card, and the film's own compositor sets them at their depths, so the journey down the nave and
// the table are the film's frames drawn from pictures instead of paint. The four books are links
// laid over their painted selves; a click opens one on its first picture and dives into it, and the
// book's reader takes over on that picture, already drawn.
import type { Layer } from "../canvas-core/core";
import { W, H, JOURNEY, TABLE, TABLE_CARD, camAt, project, type Cam } from "../canvas-core/longroom";
import { BOOKS, FOC, bw, composite, endView, eyeSpace, footprint, halvings, lampLive, silhouette, spriteBox, type Img, type Rect, type Room } from "../canvas-core/libraryScene";
import { BROKEN_ROOM, OIL_ROOM } from "../canvas-core/libraryRooms";

// ---------------------------------------------------------------- storage (without it: oil, the whole journey)
const get = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const set = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode: the defaults next time */ } };

// ---------------------------------------------------------------- the baked room
const ROOMS: Record<string, Room> = { oil: OIL_ROOM, broken: BROKEN_ROOM };
const CARDS = ["far", "ring", "bustsAL", "bustsAR", "bustsBL", "bustsBR", "table"];
type Baked = { layers: Record<string, Img[]>; books: Img[]; places: Img[] };
const surface = (w: number, h: number): Layer => {
  const c = typeof OffscreenCanvas !== "undefined" ? new OffscreenCanvas(w, h) : Object.assign(document.createElement("canvas"), { width: w, height: h });
  return { canvas: c, ctx: c.getContext("2d") as unknown as CanvasRenderingContext2D } as Layer;
};
const load = (src: string) => { const i = new Image(); i.src = src; return i.decode().then(() => i); };
const bakes = new Map<string, Promise<Baked>>();
const baked = (s: string) => {
  let p = bakes.get(s);
  if (!p) {
    p = Promise.all([...CARDS.map((id) => load(`library/${s}/${id}.webp`)), ...["book", "place"].flatMap((k) => BOOKS.map((b) => load(`library/${s}/${k}-${b.id}.webp`)))])
      .then((im) => ({ layers: Object.fromEntries(CARDS.map((id, i) => [id, halvings(env, im[i])])), books: im.slice(CARDS.length, CARDS.length + 4), places: im.slice(CARDS.length + 4) }));
    p.catch(() => bakes.delete(s)); bakes.set(s, p);
  }
  return p;
};

// ---------------------------------------------------------------- the screen
const $ = <T extends HTMLElement>(s: string) => document.querySelector(s) as T;
const canvas = $<HTMLCanvasElement>("#hall"), ctx = canvas.getContext("2d")!, skip = $<HTMLButtonElement>("#skip"), replay = $<HTMLButtonElement>("#replay"), toggle = $<HTMLButtonElement>("#style");
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>("a.book")), at = links.map((a) => BOOKS.findIndex((b) => a.getAttribute("href") === `${b.id}/`));
const portrait = matchMedia("(orientation: portrait)"), reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const SIL = BOOKS.map(silhouette), FOOT = BOOKS.map((b) => footprint(b)), BOX = BOOKS.map(spriteBox), XS = SIL.flat().map(([x]) => x), SPAN = Math.max(...XS) - Math.min(...XS);
// the film on the screen: covering it, unless that would cut a book off. A screen narrower than the table
// (a phone held upright) takes the four books across its width, a little below its middle, and the room
// shows round the frame as far as the cards are painted every step of the journey (ROOM: film px above it
// and below it), fading into the dark. `vp` is the film px the canvas shows, `band` where it lies on the screen
const ROOM = [100, 200];
const fit = () => {
  const vw = document.documentElement.clientWidth || innerWidth, vh = document.documentElement.clientHeight || innerHeight;
  const c = Math.min(Math.max(vw / W, vh / H), (vw - 2 * Math.min(24, Math.max(8, 0.025 * vw))) / SPAN), ox = (vw - W * c) / 2, oy = H * c < vh ? Math.min(0.55 * vh - (H / 2) * c, vh - H * c) : (vh - H * c) / 2;
  const y0 = Math.max(-oy / c, -ROOM[0]), y1 = Math.min((vh - oy) / c, H + ROOM[1]);
  return { vw, vh, c, ox, oy, vp: [-ox / c, y0, (vw - ox) / c, y1] as Rect, band: [oy + y0 * c, (y1 - y0) * c, y0 > -oy / c, y1 < (vh - oy) / c] as const };
};
// device px per film px: the screen's, capped like the books' pictures (the cards are baked at 1, so more
// sharpens only the canvas grain and costs a Retina screen 2.5 times the pixels) and so no layer passes 16 Mpx
const scaleFor = ({ c, vp }: ReturnType<typeof fit>) => Math.min(1.25, Math.sqrt(16e6 / ((vp[2] - vp[0]) * (vp[3] - vp[1]))), c * (devicePixelRatio || 1));
let view = fit(), env = { W, H, scale: scaleFor(view), cache: new Map<string, unknown>(), canvas: surface }, grain = env;   // grain: the canvas the room is painted on, the size of the screen
const resize = () => {
  view = fit(); const s = scaleFor(view), [x0, y0, x1, y1] = view.vp, [top, h, fadeT, fadeB] = view.band, fade = fadeT || fadeB ? `linear-gradient(transparent, #000 ${fadeT ? 12 : 0}%, #000 ${fadeB ? 84 : 100}%, transparent)` : "";
  env = { ...env, scale: s, cache: new Map() }; grain = { ...env, W: x1 - x0, H: y1 - y0 }; canvas.width = Math.round((x1 - x0) * s); canvas.height = Math.round((y1 - y0) * s); placed = "";
  Object.assign(canvas.style, { top: `${top}px`, height: `${h}px`, maskImage: fade, webkitMaskImage: fade }); document.body.style.setProperty("--band", `${top}px`);
};

// ---------------------------------------------------------------- the books over their painted selves
let placed = "";
const place = (cam: Cam) => {
  const p = project(TABLE_CARD, cam), key = `${cam.z}:${view.c}:${view.vw}:${view.vh}`; if (!p || key === placed) return; placed = key;
  const k = (p.s * TABLE_CARD.w) / W, { c, ox, oy } = view, to = ([x, y]: [number, number]) => [ox + c * (p.x + (x - W / 2) * k), oy + c * (p.y + (y - H / 2) * k)];
  links.forEach((a, i) => {
    const pts = SIL[at[i]].map(to), xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), x0 = Math.min(...xs), y0 = Math.min(...ys);
    Object.assign(a.style, { transform: `translate(${x0}px,${y0}px)`, width: `${Math.max(...xs) - x0}px`, height: `${Math.max(...ys) - y0}px` });
    a.querySelector("polygon")!.setAttribute("points", pts.map(([x, y]) => `${(x - x0).toFixed(1)},${(y - y0).toFixed(1)}`).join(" "));
  });
};
// the book under the pointer or the keyboard lifts off the table: the place it lay shows under it, its
// own picture a few px up, its shadow falling on that place. `gone` (0..1) takes it off altogether, for the dive
const lift = BOOKS.map(() => 0);
const lifted = (B: Baked, i: number, t: number, gone = 0) => {
  const [x0, y0, x1, y1] = BOX[i], k = env.scale, [tx, ty] = view.vp.map((v) => -v * k), up = 6 * t, book = t * (1 - gone), trace = (pts: number[][], dy: number) => pts.forEach(([x, y], j) => (j ? ctx.lineTo(x, y - dy) : ctx.moveTo(x, y - dy)));
  ctx.save(); ctx.setTransform(k, 0, 0, k, tx, ty); ctx.globalAlpha = Math.max(t, gone); ctx.drawImage(B.places[i], x0, y0, x1 - x0, y1 - y0);
  if (book > 0.01) { ctx.globalAlpha = book; ctx.shadowColor = `rgba(14,7,2,${(0.6 * t).toFixed(3)})`; ctx.shadowBlur = 12 * t * k; ctx.shadowOffsetY = 0.8 * up * k; ctx.drawImage(B.books[i], x0, y0 - up, x1 - x0, y1 - y0); }
  ctx.restore();
  // the canvas the room is painted on stays on the screen: lay it again over the place and the lifted book
  ctx.save(); ctx.setTransform(k, 0, 0, k, tx, ty); ctx.beginPath(); trace(FOOT[i], 0); ctx.closePath(); if (book > 0.01) { trace(SIL[i], up); ctx.closePath(); } ctx.clip(); room.canvas(ctx, grain); ctx.restore();
};
let gone: { i: number; t: number } | null = null;   // the book that has left the table for the dive, and when

// ---------------------------------------------------------------- the film: the journey, then the table, from the clock
const SPF = 1000 / 30;
let style = get("library:style") === "broken" ? "broken" : "oil", room = ROOMS[style], B: Baked | null = null, t0 = 0, last = 0, atTable = false, diving = false, seen = get("library:seen") === "1" || reduced;
const toTable = () => { seen = true; t0 = Math.min(t0, performance.now() - JOURNEY * SPF); };   // « Passer », or a book reached by the keyboard: the table now
const reach = () => {
  atTable = true; set("library:seen", "1"); document.body.classList.add("at-table");
  const wasSkip = document.activeElement === skip; skip.hidden = true; replay.hidden = reduced;
  if (wasSkip) links[0].focus();
};
// « Revoir le voyage »: back to the door, and down the nave again
const again = () => { if (diving) return; atTable = false; document.body.classList.remove("at-table"); replay.hidden = true; skip.hidden = false; skip.focus(); t0 = performance.now(); };
const tick = (now: number) => {
  requestAnimationFrame(tick);
  if (!B) return;
  // film time: the camera glides between the film's frames, so a fast screen runs smoother and a slow one drops frames, never time
  const f = (now - t0) / SPF, dt = Math.min(100, now - last), layers = (id: string) => B!.layers[id]; last = now;
  if (f < JOURNEY) { const cam = camAt(Math.max(0, f)); composite(ctx, env, cam, room, layers, view.vp); place(cam); return; }
  if (!atTable) reach();
  place(camAt(JOURNEY)); endView(ctx, env, room, layers, view.vp);
  links.forEach((a, n) => {
    const i = at[n], on = !diving && a.matches(":hover, :focus-visible"), off = gone?.i === i ? Math.min(1, (now - gone.t) / 120) : 0;   // it goes as the CSS book fades in over it
    lift[i] += ((on ? 1 : 0) - lift[i]) * Math.min(1, dt / 70); if (lift[i] > 0.01 || off) lifted(B!, i, lift[i], off);
  });
  lampLive(ctx, (f - JOURNEY) % TABLE, env, room.lamp, view.vp);
};
const show = (s: string) => {
  canvas.classList.remove("ready"); toggle.disabled = true;
  return Promise.all([baked(s), new Promise((r) => setTimeout(r, B ? 250 : 0))]).then(([b]) => {
    style = s; room = ROOMS[s]; B = b; set("library:style", s);
    toggle.setAttribute("aria-pressed", String(s === "broken")); toggle.disabled = false;
    requestAnimationFrame(() => canvas.classList.add("ready"));
  });
};

// ---------------------------------------------------------------- the dive
// The book is built again in CSS 3D over the painted one, a box as thick as the painted book: its
// cover (baked face on) set by a matrix exactly where the painting has it, under the same eye as the
// room. It rises and leans toward the screen, its cover turns round the spine, a few leaves riffle
// over to the left, and the page they leave, the book's first picture, grows until the picture lies
// where the book's reader will show it.
const images = new Map<string, Promise<HTMLImageElement>>();
const image = (src: string) => { let p = images.get(src); if (!p) { p = load(src); p.catch(() => images.delete(src)); images.set(src, p); } return p; };
// the cover is all the rise needs; the plate (the book's first picture, 100–760 KB) only once the last leaf turns
const cover = (i: number) => image(`library/${style}/cover-${BOOKS[i].id}.webp`), plate = (i: number) => image(`covers/${BOOKS[i].id}-plate.webp`);
const m3 = (a: number[], b: number[], n: number[], t: number[]) => `matrix3d(${[...a, 0, ...b, 0, ...n, 0, ...t, 1].map((v) => +v.toFixed(6)).join(",")})`;
// the leather of the box's edges: the cover's own, averaged over its lower right (below the plate, inside the gilt)
const leather = (im: HTMLImageElement) => {
  const g = Object.assign(document.createElement("canvas"), { width: 8, height: 8 }).getContext("2d", { willReadFrequently: true })!, w = im.naturalWidth, h = im.naturalHeight;
  g.drawImage(im, 0.6 * w, 0.8 * h, 0.3 * w, 0.14 * h, 0, 0, 8, 8); const d = g.getImageData(0, 0, 8, 8).data, m = [0, 0, 0];
  for (let j = 0; j < d.length; j += 4) for (let c = 0; c < 3; c++) m[c] += d[j + c] / 64;
  return `rgb(${m.map(Math.round).join(",")})`;
};
// a face of the box: a w×h rectangle laid by `t`, seen from its front only. From the plane z = 0 facing
// the eye: rotateY(180deg) faces away, rotateX(-90deg) down (its height running back), rotateX(90deg) up
// (its height running forward), rotateY(90deg) right (its width running back), rotateY(-90deg) left (forward)
const face = (cls: string, w: number, h: number, t: string, css = "") => `<i class="${cls}" style="width:${+w.toFixed(2)}px;height:${h}px;transform:${t};${css}"></i>`;
const at3 = (x: number, y: number, z: number, turn = "") => `translate3d(${+x.toFixed(2)}px,${+y.toFixed(2)}px,${+z.toFixed(2)}px) ${turn}`;
const deg = (r: number) => (r * 180) / Math.PI, poly = (pts: number[][]) => `clip-path:polygon(${pts.map(([x, y]) => `${+x.toFixed(2)}px ${+y.toFixed(2)}px`).join(",")})`;
// the leaves that riffle over, the strips each bends in (the first GUT of them the gutter's), how long, the share of the block they
// carry left (half: the two open pages end level and dip alike), the lean of the risen book (deg), the samples of the riffle's clock
const LEAVES = 8, STRIPS = 6, GUT = 3, RIFFLE = 900, CARRY = 0.5, TILT = 34, STEPS = 90;
const flight = (k: number) => 300 + 22 * k, flick = (k: number) => (RIFFLE - flight(LEAVES - 1)) * (k / (LEAVES - 1)) ** 1.6;   // each leaf slower, and later after the one before
const ease = (u: number) => 1 - (1 - u) ** 2.5 * (1 + 2.5 * u);   // a leaf's turn: still at both ends, fastest before its middle
const lerp = (pts: number[][]) => (t: number) => { const j = pts.findIndex((q) => q[0] >= t); if (j <= 0) return pts.at(j)![1]; const [a, b] = [pts[j - 1], pts[j]]; return a[1] + ((b[1] - a[1]) * (t - a[0])) / (b[0] - a[0]); };
const dive = async (i: number, href: string) => {
  diving = true; document.body.classList.add("diving");
  const b = BOOKS[i], sheet = plate(i), cov = await cover(i), { vw, vh, c, ox, oy } = view, ew = cov.naturalWidth, eh = cov.naturalHeight;
  // the risen book: its spine on the screen's centre, so the open spread is centred
  const s1 = Math.min((0.6 * vh) / eh, (0.44 * vw) / ew), k = (s1 * ew) / b.w, P = FOC * c, O = [ox + (c * W) / 2, oy + (c * H) / 2];
  // a small room's eye (a phone) stands too close to the book for the cover to turn without swinging into the face: the stage
  // takes a deeper perspective, and the lying book is stretched in depth by as much, which draws it exactly the same (a point
  // at depth z shows at P/(P − z) of its size, unchanged when P and z grow together)
  const P2 = Math.max(P, 2.2 * ew * s1), deep = P2 / P;
  // a point of the board in the dive's CSS space: the eye's frame, scaled so the book keeps its size s1 as it rises (depth is free under perspective)
  const css = (u: number, v: number) => { const [X, Z] = bw(b, u, v), [x, y, z] = eyeSpace(X, b.t, Z); return [O[0] + x * k, O[1] - y * k, P - z * k]; };
  const T = css(0, 0), A = css(1, 0).map((q, j) => (q - T[j]) / ew), Bv = css(0, 1).map((q, j) => (q - T[j]) / eh);
  const N = [A[1] * Bv[2] - A[2] * Bv[1], A[2] * Bv[0] - A[0] * Bv[2], A[0] * Bv[1] - A[1] * Bv[0]].map((q) => q / s1);
  const lying = m3(...([A, Bv, N, T].map((v) => [v[0], v[1], v[2] * deep]) as [number[], number[], number[], number[]]));
  const facing = new DOMMatrix().translate(vw / 2, vh / 2).rotateAxisAngle(1, 0, 0, TILT).scale(s1, s1, s1).translate(0, -eh / 2).toString();
  // the box, in cover px from the spine's top corner, z toward the eye from the cover: the painted book's thickness (a little
  // more, or facing the screen it reads thin), boards of a sixth of it, the page block set in from the boards' edges.
  // Open, both boards lie at the back: the leaves carry a share of the block from the right over to the left
  const D = 1.2 * (b.t / b.w) * ew, cb = D / 6, sq = 0.018 * ew, Db = D - 2 * cb, bw2 = ew - sq, bh = eh - 2 * sq, eps = 0.4, del = 1;
  const zR = (j: number) => -cb - (j / LEAVES) * CARRY * Db, zL = (j: number) => -D + cb + (j / LEAVES) * CARRY * Db;   // the right block's top after j leaves have gone, the left's after j have landed
  const block = (f: number) => at3(0, sq, -D + cb, `scale3d(1,1,${+f.toFixed(4)})`), pile = (f: number) => at3(-bw2, sq, -D + cb - del, `scale3d(1,1,${+Math.max(1e-3, f).toFixed(4)})`);
  // their depths (shares of Db) on the riffle's clock: the right block sinks as each leaf lifts off it, the pile grows as each lands
  const land = (j: number) => flick(j) + flight(j), top = (t: number) => -D + cb + fR(t) * Db;
  const fR = lerp([...Array.from({ length: LEAVES }, (_, j) => [flick(j), 1 - (j / LEAVES) * CARRY]), [flick(LEAVES - 1) + 0.3 * flight(LEAVES - 1), 1 - CARRY]]);
  const fL = lerp([[0, 0], [land(0) - 0.1, 0], ...Array.from({ length: LEAVES }, (_, j) => [land(j), (zL(j + 1) + 2 * eps + D - cb + del) / Db])]);
  // the gutter: an open page curves down into it over its inner G, a parabola in GUT strips, `dip` deep once the book lies open. A page
  // lies in its block, whose depth scales it, so its own curve is deeper by as much: at the end both pages dip alike and meet on the spine
  const G = 0.13 * ew, dip = 0.45 * Db, dR = dip / (1 - CARRY), dL = dip / fL(RIFFLE), sum = (v: number[]) => v.reduce((s, x) => s + x, 0);
  const curve = (d: number) => Array.from({ length: GUT + 1 }, (_, j) => [(j / GUT) * G, d * (1 - j / GUT) ** 2]), lens = (k: number[][]) => k.slice(1).map((q, j) => Math.hypot(q[0] - k[j][0], q[1] - k[j][1]));   // from the spine out: [x, depth]
  const gutter = (d: number, cls: string, left: boolean) => {   // a page's strips in its block's frame, the pile's mirrored (its spine at bw2), each with its slice of the paper
    const k = curve(d).map(([x, y]) => [left ? bw2 - x : x, Db - y]), len = lens(k);
    return len.map((w, j) => { const [P, Q] = left ? [k[j + 1], k[j]] : [k[j], k[j + 1]], x = left ? bw2 - G + sum(len.slice(j + 1)) : sum(len.slice(0, j));
      return face(cls, w + 1, bh, at3(P[0], 0, P[1], `rotateY(${+-deg(Math.atan2(Q[1] - P[1], Q[0] - P[0])).toFixed(3)}deg)`), `--x:${+x.toFixed(2)}px`); }).join("");
  };
  // a leaf: STRIPS strips chained on the spine, the gutter's (as long as the open page's) then the rest of the leaf in equal parts. Lying on
  // the right it rises out of the gutter (AR, absolute degrees), on the left it comes down into it (AL)
  const cw = curve(dip), wl = [...lens(cw), ...Array(STRIPS - GUT).fill((bw2 - G) / (STRIPS - GUT))], X = wl.map((_, j) => sum(wl.slice(0, j))), WL = sum(wl);
  const AR = wl.map((_, j) => (j < GUT ? -deg(Math.atan2(cw[j][1] - cw[j + 1][1], G / GUT)) : 0)), AL = AR.map((a) => -180 - a);
  // leaf n at riffle time t: it lies on the right block, sinking with it, until it lifts; then it turns on the spine, its root sliding down to the
  // left, each strip following the root the later the farther it lies from the spine, so the leaf curls most mid-turn and lands flat (p: each strip's share of its turn)
  const pose = (n: number, t: number) => {
    const e = ease(Math.min(1, Math.max(0, (t - flick(n)) / flight(n)))), z0 = top(Math.min(t, flick(n))) + (LEAVES - n) * eps - dip, z1 = zL(n + 1) + eps - dip, p = X.map((x) => e ** (1 + (1.4 * x) / WL));
    return { z: z0 + (z1 - z0) * e, a: AR.map((r, j) => r + (AL[j] - r) * p[j]), p };
  };
  const knot = ({ z, a }: { z: number; a: number[] }, j: number) => (j ? `translateX(${+wl[j - 1].toFixed(2)}px) rotateY(${+(a[j] - a[j - 1]).toFixed(3)}deg)` : `${at3(0, sq, z)} rotateY(${+a[0].toFixed(3)}deg)`);
  // the picture on the right-hand page, clear of the gutter, and where the reader will show it (covering the screen; Corbenic's manuscript whole; a phone held upright: across the top)
  const pw = 0.78 * ew, ph = (pw * 9) / 16, px = 0.14 * ew, py = (eh - ph) * 0.4;
  const q = portrait.matches ? vw / 1600 : (b.id === "corbenic" ? Math.min : Math.max)(vw / 1600, vh / 900), tw = 1600 * q, tx = portrait.matches ? 0 : (vw - tw) / 2, ty = portrait.matches ? 0 : (vh - 900 * q) / 2, S = tw / pw;
  const dove = m3([S, 0, 0], [0, S, 0], [0, 0, S], [tx - px * S, ty - py * S, -zR(LEAVES) * S]);   // the page the leaves leave lies in the plane the perspective leaves alone
  const stage = document.createElement("div"); stage.className = "dive"; stage.setAttribute("aria-hidden", "true");
  Object.assign(stage.style, { perspective: `${P2}px`, perspectiveOrigin: `${O[0]}px ${O[1]}px` }); stage.style.setProperty("--leather", leather(cov));
  const leaf = (n: number, j = 0, at = pose(n, 0)): string => `<div class="${j ? "st" : "leaf"}" style="transform:${knot(at, j)}${j ? "" : `;--W:${+WL.toFixed(2)}px`}">`
    + face(`tx re${n % 4 ? "" : " dc"}`, wl[j] + 1, bh, "none", `--x:${+X[j].toFixed(2)}px`) + face("tx vo", wl[j] + 1, bh, at3(wl[j], 0, 0, "rotateY(180deg)"), `--x:${+(WL - X[j] - wl[j]).toFixed(2)}px`)
    + (j + 1 < STRIPS ? leaf(n, j + 1, at) : "") + "</div>";
  // the blocks' head and tail edges, cut down to the curve of the page on them (their faces' y runs down from the top on the tail, up to it on the head)
  const cr = curve(dR), cl = curve(dL).map(([x, y]) => [bw2 - x, y]), flip = (k: number[][]) => k.map(([x, y]) => [x, Db - y]);
  const edges = (tail: number[][], head: number[][]) => face("ed", bw2, Db, at3(0, bh, Db, "rotateX(-90deg)"), poly(tail)) + face("ed", bw2, Db, at3(0, 0, 0, "rotateX(90deg)"), poly(head));
  stage.innerHTML = `<div class="tome">`
    + face("lea spine", D, eh, at3(0, 0, -D, "rotateY(-90deg)")) + face("lea", ew, eh, at3(0, 0, -D + cb)) + face("lea", ew, cb, at3(0, eh, -D + cb, "rotateX(-90deg)")) + face("lea", ew, cb, at3(0, 0, -D, "rotateX(90deg)")) + face("lea", cb, eh, at3(ew, 0, -D + cb, "rotateY(90deg)"))
    + `<div class="rb" style="transform:${block(1)}">${gutter(dR, "pg", false)}<div class="page pg" style="width:${bw2 - G}px;height:${bh}px;transform:${at3(G, 0, Db)};--x:${+sum(lens(curve(dR))).toFixed(2)}px"></div>`
    + edges([...cr, [bw2, 0], [bw2, Db], [0, Db]], [[0, 0], [bw2, 0], [bw2, Db], ...flip(cr).reverse()]) + face("ed v", Db, bh, at3(bw2, 0, Db, "rotateY(90deg)")) + `</div>`
    + `<div class="lb" style="transform:${pile(0)};visibility:hidden;--W:${+(bw2 - G + sum(lens(curve(dL)))).toFixed(2)}px">${face("tx vo", bw2 - G + 1, bh, at3(0, 0, Db), "--x:0px")}${gutter(dL, "tx vo", true)}`
    + edges([[0, 0], ...[...cl].reverse(), [bw2, Db], [0, Db]], [[0, 0], [bw2, 0], ...flip(cl), [0, Db]]) + face("ed v", Db, bh, at3(0, 0, 0, "rotateY(-90deg)")) + `</div>`
    + Array.from({ length: LEAVES }, (_, n) => leaf(n)).join("")
    + `<div class="cover">${face("pd", ew, eh, at3(ew, 0, -cb, "rotateY(180deg)"))}${face("lea", ew, cb, at3(0, eh, 0, "rotateX(-90deg)"))}${face("lea", ew, cb, at3(0, 0, -cb, "rotateX(90deg)"))}${face("lea", cb, eh, at3(ew, 0, 0, "rotateY(90deg)"))}</div></div>`;
  const tome = stage.firstElementChild as HTMLElement, page = tome.querySelector(".page") as HTMLElement, lid = tome.querySelector(".cover") as HTMLElement;
  const rb = tome.querySelector(".rb") as HTMLElement, lb = tome.querySelector(".lb") as HTMLElement;
  cov.className = "front"; Object.assign(cov.style, { width: `${ew}px`, height: `${eh}px` }); lid.prepend(cov);
  let pic: HTMLImageElement | null = null;
  const shown = sheet.then((im) => { pic = im; im.alt = ""; Object.assign(im.style, { left: `${px - G}px`, top: `${py - sq}px`, width: `${pw}px`, height: `${ph}px` }); page.append(im); });
  shown.catch(() => { /* awaited before the last leaf turns: the plain link then */ });
  document.body.append(stage); gone = { i, t: performance.now() };
  const run = (el: Element, frames: Keyframe[], duration: number, easing: string) => el.animate(frames, { duration, easing, fill: "forwards" });
  tome.style.transform = lying;
  await run(stage, [{ opacity: 0 }, { opacity: 1 }], 120, "linear").finished;   // on the stage: opacity on the book itself would flatten its 3D
  canvas.animate([{ opacity: 1 }, { opacity: 0.35 }], { duration: 500, fill: "forwards" });
  await run(tome, [{ transform: lying }, { transform: facing }], 500, "cubic-bezier(.3,.1,.25,1)").finished;
  // the cover turns on the spine and, past upright, falls to lie level with the back board
  const opening = run(lid, [{ transform: `${at3(0, 0, 0)} rotateY(0deg)` }, { offset: 0.5, transform: `${at3(0, 0, -0.12 * D)} rotateY(-90deg)` }, { transform: `${at3(0, 0, -D)} rotateY(-180deg)` }], 700, "cubic-bezier(.45,.05,.35,1)");
  // the riffle, on one clock sampled every RIFFLE / STEPS ms: the blocks' depths, every strip of every leaf, the shades over them. It is built a leaf a
  // frame while the cover turns (all at once it would hold a frame up), every animation set to start as the cover lands
  await opening.ready;
  const t0 = (opening.startTime as number) + 700, clock = Array.from({ length: STEPS + 1 }, (_, s) => (s / STEPS) * RIFFLE), poses: ReturnType<typeof pose>[][] = [], riffle: Animation[] = [];
  const track = (el: Element, frames: Keyframe[], pseudoElement?: string) => { const a = el.animate(frames, { duration: RIFFLE, fill: "forwards", pseudoElement }); a.startTime = t0; riffle.push(a); };
  // a turning strip darkens edge on to the eye (so the shade sweeps across the leaf as its curl does); a leaf's shadow falls on the page it leaves (p < ½), then on the one it comes down on
  const turn = (p: number) => 0.22 * Math.sin(Math.PI * p) ** 2, fall = (p: number, on: number) => 0.35 * Math.max(0, on * Math.sin(2 * Math.PI * p));
  const dark = (el: Element, f: (s: number) => number) => track(el, clock.map((_, s) => ({ opacity: +f(s).toFixed(3) })), "::after");
  const leaves = tome.querySelectorAll(".leaf");
  for (let n = 0; n < LEAVES; n++) {
    const el = leaves[n], o = Math.min(1, land(n) / RIFFLE); poses.push(clock.map((t) => pose(n, t)));
    track(el, [{ visibility: "visible" }, { offset: o, visibility: "visible" }, { offset: o, visibility: "hidden" }, { visibility: "hidden" }]);   // landed, a leaf goes: the pile's top, a hair above it, is that page from then on
    [el, ...Array.from(el.querySelectorAll(".st"))].forEach((k, j) => {
      track(k, poses[n].map((at) => ({ transform: knot(at, j) })));
      dark(k.querySelector(":scope > .re")!, (s) => Math.max(turn(poses[n][s].p[j]), n ? fall(poses[n - 1][s].p[j], 1) : 0));
      dark(k.querySelector(":scope > .vo")!, (s) => turn(poses[n][s].p[j]));
    });
    await new Promise(requestAnimationFrame);
  }
  const mid = Math.min(GUT + 1, STRIPS - 1);   // the strip of a leaf that shades the flat of a page
  rb.querySelectorAll(".pg").forEach((el, j) => dark(el, (s) => fall(poses[LEAVES - 1][s].p[j < GUT ? j : mid], 1)));   // the gutter's strips, then the flat
  lb.querySelectorAll(".tx").forEach((el, j) => dark(el, (s) => Math.max(...poses.map((at) => fall(at[s].p[j ? j - 1 : mid], -1)))));   // the flat, then the gutter's strips
  track(rb, clock.map((t) => ({ transform: block(fR(t)) }))); track(lb, clock.map((t) => ({ transform: pile(fL(t)) }))); track(lb, [{ visibility: "visible" }, { visibility: "visible" }]);   // the pile: out beside the closed book until then
  await opening.finished;
  // the plate may still be on its way: the riffle holds before the last leaf lifts off it
  await new Promise((r) => setTimeout(r, flick(LEAVES - 1) - 40));
  if (!pic) { riffle.forEach((a) => a.pause()); await shown; riffle.forEach((a) => a.play()); }
  await Promise.all(riffle.map((a) => a.finished));
  canvas.animate([{ opacity: 0.35 }, { opacity: 0 }], { duration: 600, fill: "forwards" });
  await run(tome, [{ transform: facing }, { transform: dove }], 600, "cubic-bezier(.55,0,.75,.45)").finished;
  location.href = `${href}?from=library`;
};
// back from the book (the page kept whole in the history): the table again, as it was
addEventListener("pageshow", (e: PageTransitionEvent) => { if (!e.persisted) return; document.querySelector(".dive")?.remove(); canvas.getAnimations().forEach((a) => a.cancel()); diving = false; gone = null; document.body.classList.remove("diving"); });

// ---------------------------------------------------------------- start
// without JS, or when the room fails to load, the links are a plain list (`plain`, style.css): the way in never depends on the pictures
links.forEach((a, n) => {
  const warm = () => { cover(at[n]); plate(at[n]); };   // a failure is caught in `image` and tried again on the click
  for (const ev of ["pointerenter", "pointerdown", "touchstart", "focus"]) a.addEventListener(ev, warm, { passive: true });
  a.addEventListener("focus", () => { if (!atTable) toTable(); });
  a.addEventListener("click", (e) => {
    if (diving) return e.preventDefault();
    if (!B || !atTable || reduced || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;   // no room, a new tab, or no motion: the plain link
    e.preventDefault(); dive(at[n], a.getAttribute("href")!).catch(() => { location.href = a.href; });
  });
});
skip.addEventListener("click", toTable);
replay.addEventListener("click", again);
// the other style failed to load: the room as it was, and the switch to try again
toggle.addEventListener("click", () => { if (!diving) show(style === "oil" ? "broken" : "oil").catch(() => { canvas.classList.add("ready"); toggle.disabled = false; }); });
addEventListener("resize", resize);
resize();
show(style).then(() => {
  t0 = performance.now() - (seen ? JOURNEY * SPF : 0); last = performance.now();
  requestAnimationFrame(tick);
}, () => document.body.classList.add("plain"));
