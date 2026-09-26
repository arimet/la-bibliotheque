// A stand-in for a page whose picture is not drawn yet: the title lettered by hand, a horizon, and
// dust drifting across it, so the whole book is playable (and moving) before its art exists.
import { rng, type P } from "./core";
import { letter } from "./drafting";
import { page, seq, st } from "./west";

export const placeholder = (id: string, title: string, blue = 0) => {
  const plain = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(); // the drafting hand has no accents
  const ink = blue >= 0.5 ? "#e8f1ff" : "#2b1a10", paper = blue >= 0.5 ? "#1d4f86" : "#f3e7cf", r = rng(id.length * 97 + title.length);
  const hills: P[] = Array.from({ length: 9 }, (_, i) => [i * 200 - 20, 560 - r() * 60] as P);
  return page({
    id, title, draw: 60, loop: 120, paper, ink, washes: [],
    strokes: seq([st(hills, 1.6, 1, 0.7), st([[-20, 640], [1620, 640]], 1, 2, 0.5)], 0, 30),
    animAt: [10, 55],
    anim: (g, t, reveal) => {
      g.group("plain", () => {
        letter(g, plain, 800, 330, { cap: 64, color: ink, seed: 7, align: "center", progress: reveal, w: 4 });
        letter(g, "ILLUSTRATION A VENIR", 800, 440, { cap: 20, color: ink, seed: 8, align: "center", progress: reveal, opacity: 0.6 });
        if (reveal < 1) return;
        for (let i = 0; i < 12; i++) { const x = 1700 - (((i * 157 + (t / 120) * 1800) % 1800)), y = 600 + ((i * 53) % 220); g.pen([[x, y], [x + 30, y - 1], [x + 60, y + 1]], { w: 0.8, color: ink, seed: 20 + i, boil: 0.4, opacity: 0.4, retrace: false }); }
      });
    },
  });
};
