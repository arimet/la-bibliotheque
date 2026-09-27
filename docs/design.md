# Dust Creek — design

A choose-your-own-adventure western that turns into science fiction. Twelve pages, three endings,
every picture drawn in code with [anidoodle](https://github.com/alexgreensh/anidoodle) and animated:
each page draws itself stroke by stroke, then loops.

## Story

1881. You ride into Dust Creek, a town whose sheriff has gone missing. One night something falls on
the mesa: not a meteor, a ship, with a wounded pilot. The Callahan gang wants to sell the wreck.
Your ending depends on what you picked up on the way.

- **Recurring token:** the sheriff's star. Found on page 3, it glows blue near the ship, and in the
  last picture it becomes a star in the sky.
- **Satchel:** revolver (from the start), lantern (p02), sheriff's star (p03), blue crystal (p05).
- **Locked cards:** a card that needs an item you lack is shown greyed out, naming the item.

```
p01 Dust Creek ─┬─ p02 Saloon (+lantern) ─┐
                └─ p03 Office (+star) ────┴─ p04 The Fall
p04 ─┬─ p05 Crater (+crystal) ─┬─ p07 The Pilot ─┐
     │                         └─ p08 The Gang ──┤
     └─ p06 Mine ── lantern? p07 : p08 ──────────┴─ p09 Showdown
p09: star → p10 · crystal → p11 · revolver → p12
```

The text lives in `src/stories/dust-creek.ts`; `test/story.test.ts` walks every path with its inventory.

## Look

- p01–p03: pen and line-wash on warm paper (after anidoodle's wren plate).
- p04: the first blue strokes appear in the sky.
- p05–p06: both hands.
- p07–p11: cyanotype.
- p12 goes back to sepia.

Choices are desert-tarot cards: a numeral, a vignette (the destination page's own picture, rendered
small) and a title. The layout is full-screen immersive; on a phone held upright, the picture sits on top.

## Code

| Path | What it is |
|---|---|
| `src/canvas-core/` | anidoodle's portable art core (Apache 2.0, see `NOTICE`) plus the book's pages |
| `src/canvas-core/west.ts` | the book's kit: perspective, washes, stroke timing, `page()` → a two-shot film |
| `src/canvas-core/pNN.ts` | one page's picture: strokes, washes, and an `anim` for what moves |
| `src/stories/` | each book's text and items, as a `Book` (`src/app/book.ts`) |
| `src/app/` | the reader: `reader.ts` (state, cards), `player.ts` (canvas loop), one entry per book |
| `tools/` | anidoodle's tools: `still.mjs`, `render.mjs`, `gate.mjs` |

Every page film has two shots: `draw` (the picture makes itself) and `loop` (a seamless cycle). The
player plays `draw` once and then repeats `loop`. Washes are painted onto cached surfaces, at no
more than 0.6 scale, during the cheap pen-only frames; the ink stays at full resolution.

## Commands

```bash
npm run dev                                   # http://localhost:5180: the library; /dust-creek/, /corbenic/, …
npm test                                      # story graph of every book, the camera, the baked images
npm run covers                                # each book's first picture, for the library
node tools/still.mjs p01 --shot loop --frame 150 --out out/p01.png
node tools/render.mjs p01 && node tools/gate.mjs p01 --mp4 out/p01.mp4
```

## Status

- **Done:** all twelve pages are drawn and animated. Each passes the anidoodle determinism and
  contract checks, and runs at about 60 fps in the reader on desktop and phone sizes (headless
  Chromium, no GPU).

## The library

The site's front page (`www/index.html`, `src/app/library.ts`) is a painted library: the camera travels
down a Long Room to a reading table where the four books lie, and a click opens one on its first
picture and dives into it before the book's reader takes over. See `docs/library-design.md`. Each book
has its own page and bundle: `www/dust-creek/`, `www/corbenic/` (see `docs/corbenic-design.md`),
`www/canicule/` and `www/grands-bois/` (see `docs/canicule-grands-bois-design.md`).
