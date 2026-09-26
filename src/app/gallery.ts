// Every scene of the book on one page (#galerie). Each tile rests on its finished picture; the one
// under the pointer (or tapped) replays its drawing and its loop. Only one plays at a time: twelve
// live films would bring a phone to its knees.
import type { PageFilm } from "../canvas-core/west";
import { play, still } from "./player";
import { ROMAN, toneOf, type Book, type Page } from "./book";

export const gallery = (root: HTMLElement, book: Book, filmFor: (p: Page) => PageFilm) => {
  const k = Math.min(2, devicePixelRatio || 1), scale = Math.min(0.9, (Math.min(innerWidth, 520) * k) / 1600);
  let playing: { stop: () => void; canvas: HTMLCanvasElement; film: PageFilm } | null = null;
  const rest = () => { if (!playing) return; playing.stop(); still(playing.canvas, playing.film, scale); playing = null; };
  root.innerHTML = `<header><h1>${book.name}</h1><p>Toutes les scènes. <span class="hover">Survole une image pour la voir se dessiner, clique pour l'ouvrir dans le livre.</span><span class="touch">Touche une image pour la voir se dessiner, touche-la encore pour l'ouvrir dans le livre.</span></p><a href="#${book.start}">Commencer l'histoire</a></header><div class="grid"></div>`;
  const grid = root.querySelector(".grid")!;
  const tiles = book.pages.map((p) => {
    const a = document.createElement("a"), canvas = document.createElement("canvas");
    a.className = "tile tone-" + toneOf(p); a.href = "#" + p.id;
    a.innerHTML = `<span class="num">${ROMAN[p.n]}</span><span class="ttl">${p.title}</span>${p.ending ? `<span class="end">fin</span>` : ""}`;
    a.prepend(canvas); grid.append(a);
    const start = () => { if (playing?.canvas === canvas) return; rest(); const film = filmFor(p); playing = { stop: play(canvas, film, () => {}, scale).stop, canvas, film }; };
    a.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") start(); });
    a.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && playing?.canvas === canvas) rest(); });
    // on a touch screen the first tap plays the scene, the second opens it
    a.addEventListener("click", (e) => { if (matchMedia("(hover: none)").matches && playing?.canvas !== canvas) { e.preventDefault(); start(); } });
    return { p, canvas };
  });
  // paint the resting pictures one by one, so the page stays responsive while they arrive
  let i = 0; const next = () => { if (i >= tiles.length || !root.isConnected || root.hidden) return; const t = tiles[i++]; if (playing?.canvas !== t.canvas) still(t.canvas, filmFor(t.p), scale); setTimeout(next, 0); };
  next();
  return { stop: rest };
};
