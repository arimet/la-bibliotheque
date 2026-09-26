// The reader: which page you are on, what you carry, and the cards you can play.
// The page lives in the URL (#p05) so the back button works; the satchel lives in localStorage.
import type { Film } from "../canvas-core/film";
import { p01 } from "../canvas-core/p01";
import { p02 } from "../canvas-core/p02";
import { p03 } from "../canvas-core/p03";
import { p04 } from "../canvas-core/p04";
import { p05 } from "../canvas-core/p05";
import { p06 } from "../canvas-core/p06";
import { p07 } from "../canvas-core/p07";
import { p08 } from "../canvas-core/p08";
import { p09 } from "../canvas-core/p09";
import { p10 } from "../canvas-core/p10";
import { p11 } from "../canvas-core/p11";
import { p12 } from "../canvas-core/p12";
import { placeholder } from "../canvas-core/placeholder";
import { gallery } from "./gallery";
import { play, vignette } from "./player";
import { ITEMS, START, START_ITEMS, pageById, type Item, type Page } from "./story";

const DRAWN: Record<string, Film> = { p01, p02, p03, p04, p05, p06, p07, p08, p09, p10, p11, p12 };
const films = new Map<string, Film>();
const filmFor = (p: Page) => { let f = films.get(p.id); if (!f) { f = DRAWN[p.id] ?? placeholder(p.id, p.title, p.blue); films.set(p.id, f); } return f; };

const KEY = "dust-creek:satchel";
const load = (): Item[] => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "null"); return Array.isArray(v) ? v : [...START_ITEMS]; } catch { return [...START_ITEMS]; } };
const save = (inv: Item[]) => { try { localStorage.setItem(KEY, JSON.stringify(inv)); } catch { /* private mode: the satchel lasts the visit */ } };
let satchel = load();

const $ = <T extends HTMLElement>(s: string) => document.querySelector(s) as T;
const canvas = $<HTMLCanvasElement>("#scene"), band = $("#band"), title = $("#title"), text = $("#text"), hand = $("#hand"), bag = $("#satchel");
const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const renderSatchel = () => {
  bag.innerHTML = (Object.keys(ITEMS) as Item[]).map((k) => `<span class="slot${satchel.includes(k) ? "" : " empty"}" title="${satchel.includes(k) ? ITEMS[k].name : "vide"}">${satchel.includes(k) ? ITEMS[k].icon : ""}</span>`).join("");
};

const card = (p: Page, c: Page["choices"][number] | null, i: number) => {
  const to = c ? pageById(c.to)! : pageById(START)!, locked = !!c?.needs && !satchel.includes(c.needs);
  const b = document.createElement("button");
  b.className = "card" + (locked ? " locked" : "") + ((to.blue ?? 0) >= 0.5 ? " blue" : "");
  b.style.setProperty("--i", String(i));
  b.disabled = locked;
  b.innerHTML = `<span class="num">${c ? ROMAN[to.n] : "I"}</span><span class="art"></span><span class="ttl">${c ? c.card ?? to.title : "Recommencer"}</span><span class="sub">${c ? c.label : "une autre route"}</span>${locked ? `<span class="need">il te faut ${ITEMS[c!.needs!].icon} ${ITEMS[c!.needs!].name}</span>` : ""}`;
  if (locked) b.setAttribute("aria-label", `${c!.label} : il te faut ${ITEMS[c!.needs!].name}`);
  b.onclick = () => { location.hash = to.id; };
  // the vignette is the destination's own picture, drawn once the hand is on the table
  setTimeout(() => { const art = b.querySelector(".art") as HTMLElement, r = art.getBoundingClientRect(), k = Math.min(2, devicePixelRatio || 1); art.append(vignette(filmFor(to), Math.round(r.width * k), Math.round(r.height * k))); }, 700 + i * 250);
  return b;
};

let current: ReturnType<typeof play> | null = null, wall: ReturnType<typeof gallery> | null = null;
const scenes = $("#gallery");
const show = (id: string) => {
  wall?.stop(); wall = null; current?.stop(); current = null;
  document.documentElement.classList.toggle("gallery-mode", id === "galerie"); scenes.hidden = id !== "galerie";
  if (id === "galerie") { document.title = "Toutes les scènes · Dust Creek"; wall = gallery(scenes, filmFor); scrollTo(0, 0); return; }
  const p = pageById(id) ?? pageById(START)!;
  if (p.id === START) satchel = [...START_ITEMS]; // page one is always a fresh ride into town
  if (p.gives && !satchel.includes(p.gives)) satchel = [...satchel, p.gives];
  save(satchel);
  renderSatchel();
  document.body.classList.toggle("blue", (p.blue ?? 0) >= 0.5);
  document.title = `${p.title} · Dust Creek`;
  band.classList.remove("in"); hand.innerHTML = "";
  title.textContent = `${ROMAN[p.n]}. ${p.title}`;
  text.innerHTML = p.text.map((t) => `<p>${t}</p>`).join("") + (p.gives ? `<p class="found">Tu gardes ${ITEMS[p.gives].icon} ${ITEMS[p.gives].name}.</p>` : "") + (p.ending ? `<p class="found">Fin.</p>` : "");
  drawn = false; hideBand(false);
  current = play(canvas, filmFor(p), () => {
    drawn = true; band.classList.add("in");
    (p.ending ? [card(p, null, 0)] : p.choices.map((c, i) => card(p, c, i))).forEach((b) => hand.append(b));
  });
};

// a tap on the picture first finishes the drawing; once it is drawn, it clears the text away
let drawn = false;
const hideBand = (on: boolean) => document.body.classList.toggle("band-hidden", on);
canvas.addEventListener("click", () => { if (!drawn) current?.finish(); else hideBand(!document.body.classList.contains("band-hidden")); });
$("#hide-band").addEventListener("click", () => hideBand(true));
$("#show-band").addEventListener("click", () => hideBand(false));
addEventListener("keydown", (e) => { if (e.key.toLowerCase() === "h" && drawn && !e.metaKey && !e.ctrlKey) hideBand(!document.body.classList.contains("band-hidden")); });
addEventListener("hashchange", () => show(location.hash.slice(1)));
show(location.hash.slice(1) || START);
