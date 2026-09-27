# La Bibliothèque — design

The site's front page becomes a painted library after the Long Room of Trinity College Dublin. The
visitor travels down the gallery to a reading table where the four books lie closed; clicking one
opens it on its first picture and dives into it, and the book's reader takes over.

## What the visitor sees

1. **Arrival.** The Long Room paints itself in about 3 s: the dark oak barrel vault, the two-storey
   bays of books, the marble busts along the nave, light from the high windows.
2. **The journey (6–8 s, on its own).** The camera travels down the nave between the busts and
   slows at a reading table. A « Passer » button jumps to the table. A visitor who has made the
   journey once lands at the table directly.
3. **The table.** The four closed books in perspective: leather in each book's colour, gilt title,
   the book's page 1 set into the cover. Dust drifts in the light, a lamp flickers, the book under
   the pointer lifts a little.
4. **The click.** The book rises to face the camera, its cover opens, the right-hand page shows the
   story's first picture; the camera dives into it until it fills the screen. The book's reader then
   takes over on that same picture, already drawn, its text in its cards.
5. **The switch.** A small « Huile / Couleur brisée » button repaints the library in the other style
   and remembers the choice.
6. **Access.** The four books are real links (keyboard, screen reader). With reduced motion the page
   opens at the table, without journey or dive.

## Two styles, one scene

Both are anidoodle styles, ported like the Risograph kit and credited in `NOTICE`:

- **Oil on canvas** (`paintedOilKit.ts`, the default): lead-white linen toned with sienna and umber,
  dark masses first, then mid tones, lights, impasto, dark accents. Umbers, ochre, terre verte,
  Naples yellow; gilt on the spines and titles.
- **Broken colour** (`brokenColourKit.ts`): unmixed dabs side by side, high key, no black; form by
  temperature, the window light breaking into orange and violet.

`src/canvas-core/longroom.ts` holds the scene once: depth planes, bays, busts, windows, table,
book positions. `libraryOil.ts` and `libraryBroken.ts` paint it, each from the same geometry, so the
journey and the books land in the same place in both.

## How it moves

- **Cards.** A few painted cards: the far window, one bay seen as a portal (vault rib, stack ends,
  busts) in two variants, the table. Each is painted once into its own layer and set at several
  depths down the nave, like a toy theatre's wings, so the long room recedes for the cost of four
  paintings.
- **Camera.** A forward move on an eased curve. Each frame draws the layers back to front, each
  scaled by its distance to the camera. Dust and the lamp flame are drawn live on top. The painting
  is never recomputed during the journey.
- **Painting at load.** The layers are painted while the painting paints itself on screen, so the
  cost is spent under the arrival. The second style is painted when first asked for, then cached.
- **Books.** Each cover is painted in the current style (leather, gilt lettering, the plate set
  into it). The plate is the book's first picture, from `www/covers/`, regenerated at full size so
  the dive stays sharp. The cover opens with CSS 3D (a turn round the spine); the dive is a CSS
  scale onto the right-hand page. The front page loads no book's code.

## Handing over to the reader

At the end of the dive the browser goes to the book (`corbenic/?from=library`). With that flag the
reader starts page 1 in its loop, already drawn, instead of painting it from a blank sheet, so the
picture the visitor dived into is the one they land on.

## Code

- Entry `src/app/library.ts`, bundled to `www/library/app.js`; `www/index.html` is rewritten for it
  (the shelf markup goes; the four links stay, as the accessible books).
- Kits `src/canvas-core/paintedOilKit.ts`, `brokenColourKit.ts`; scene `longroom.ts`; painters
  `libraryOil.ts`, `libraryBroken.ts`; tool hosts for stills and the gate.
- `src/app/reader.ts`: the `from=library` start.
- Storage: the style and "journey seen" in `localStorage`, every access wrapped; without storage
  the defaults apply (oil, full journey).

## Order of work

Each step is shown and approved before the next.

1. One oil still: the table and its four books, close up.
2. The whole gallery in oil, and the journey as a 3 s clip.
3. Broken colour, and the switch.
4. The book opening and the dive, one book first, then all four and the reader handover.
5. Passer, journey seen, reduced motion, phone layout, docs.

## Targets

- The arrival paints itself in 3 s or less on desktop.
- Journey and table at 60 fps on desktop and phone sizes.
- Every painted layer passes the anidoodle gate (deterministic, no forbidden calls).
- No book code loaded before the click.
