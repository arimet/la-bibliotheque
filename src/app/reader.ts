// The reader: which page you are on, what you carry, and the cards you can play.
// The page lives in the URL (#p05) so the back button works; the satchel lives in localStorage.
import { gallery } from "./gallery";
import { play, vignette } from "./player";
import type { PageFilm } from "../canvas-core/west";
import { pageIn, ROMAN, toneOf, type Book, type Page } from "./book";

export const reader = (book: Book, film: (p: Page) => PageFilm) => {
  const films = new Map<string, PageFilm>();
  const filmFor = (p: Page) => { let f = films.get(p.id); if (!f) { f = film(p); films.set(p.id, f); } return f; };

  const KEY = `${book.id}:satchel`;
  const load = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? "null"); return Array.isArray(v) ? v : [...book.startItems]; } catch { return [...book.startItems]; } };
  const save = (inv: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(inv)); } catch { /* private mode: the satchel lasts the visit */ } };
  let satchel = load();

  const $ = <T extends HTMLElement>(s: string) => document.querySelector(s) as T;
  const canvas = $<HTMLCanvasElement>("#scene"), band = $("#band"), title = $("#title"), text = $("#text"), hand = $("#hand"), bag = $("#satchel");

  const renderSatchel = () => {
    bag.innerHTML = (Object.keys(book.items) ).map((k) => `<span class="slot${satchel.includes(k) ? "" : " empty"}" title="${satchel.includes(k) ? book.items[k].name : "vide"}">${satchel.includes(k) ? book.items[k].icon : ""}</span>`).join("");
  };

  const card = (p: Page, c: Page["choices"][number] | null, i: number) => {
    const to = c ? pageIn(book, c.to)! : pageIn(book, book.start)!, locked = !!c?.needs && !satchel.includes(c.needs);
    const b = document.createElement("button");
    b.className = "card" + (locked ? " locked" : "") + ` tone-${toneOf(to)}`;
    b.style.setProperty("--i", String(i));
    b.disabled = locked;
    b.innerHTML = `<span class="num">${c ? ROMAN[to.n] : "I"}</span><span class="art"></span><span class="ttl">${c ? c.card ?? to.title : "Recommencer"}</span><span class="sub">${c ? c.label : "une autre route"}</span>${locked ? `<span class="need">il te faut ${book.items[c!.needs!].icon} ${book.items[c!.needs!].name}</span>` : ""}`;
    if (locked) b.setAttribute("aria-label", `${c!.label} : il te faut ${book.items[c!.needs!].name}`);
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
    if (id === "galerie") { document.title = `Toutes les scènes · ${book.name}`; wall = gallery(scenes, book, filmFor); scrollTo(0, 0); return; }
    const p = pageIn(book, id) ?? pageIn(book, book.start)!;
    if (p.id === book.start) satchel = [...book.startItems]; // page one is always a fresh ride into town
    if (p.gives && !satchel.includes(p.gives)) satchel = [...satchel, p.gives];
    save(satchel);
    renderSatchel();
    document.body.dataset.tone = String(toneOf(p));
    document.title = `${p.title} · ${book.name}`;
    band.classList.remove("in"); hand.innerHTML = "";
    title.textContent = `${ROMAN[p.n]}. ${p.title}`;
    text.innerHTML = p.text.map((t) => `<p>${t}</p>`).join("") + (p.gives ? `<p class="found">Tu gardes ${book.items[p.gives].icon} ${book.items[p.gives].name}.</p>` : "") + (p.ending ? `<p class="found">Fin.</p>` : "");
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
  show(location.hash.slice(1) || book.start);
};
