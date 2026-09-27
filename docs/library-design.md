# La Bibliothèque — design

The site's front page becomes a painted library after the Long Room of Trinity College Dublin. The
visitor travels down the gallery to a reading table where the four books lie closed; clicking one
opens it on its first picture and dives into it, and the book's reader takes over.

## What the visitor sees

1. **Arrival.** The Long Room paints itself in about 3 s: the dark oak barrel vault, the two-storey
   bays of books, the marble busts along the nave, light from the high windows.
2. **The journey (6–8 s, on its own).** The camera travels down the nave between the busts and
   slows at a reading table. A « Passer » button jumps to the table. A visitor who has made the
   journey once lands at the table directly; « Revoir le voyage » at the table takes them back to
   the door and down the nave again.
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
- **Baked, not painted at load.** The painters run at build time (`npm run library`): each card is
  painted once at scale 1 and written to `www/library/<oil|broken>/` as a WebP, with each book's lifted
  copy, its frontal cover and the empty place it leaves on the table. The front page loads the
  current style's images (oil 0.94 MB, broken colour 2.17 MB) and sets them with the film's own
  compositor, so the journey and the table are the film's frames drawn from pictures. The other
  style is loaded when first asked for, then kept.
- **Books.** Each cover is painted in the current style (leather, gilt lettering, the plate set
  into it). The plate is the book's first picture, from `www/covers/`, regenerated at full size so
  the dive stays sharp (the films read the JPG, the site the WebP, 100–760 KB). The book is a CSS 3D box as thick as the painted
  one (a fifth more, or facing the screen it reads thin): boards, spine, a page block with striped
  edges. It rises leaning back, so its tail shows; the cover turns round the spine and falls level
  with the back board; eight printed leaves riffle from the right block to the left (fast, then
  slower, each six strips chained on the spine that curl, the free edge lagging, with a shade sweeping
  across it and a shadow on the page under it), carrying half the block over, so both open pages end
  level and curve alike into the gutter (three strips each, darkening toward the spine, meeting on
  it); the last leaf uncovers the plate, set clear of the gutter, and the dive is a CSS scale onto it. 0.12 s fade, 0.5 s rise, 0.7 s cover, 0.9 s
  riffle, 0.6 s zoom. The front page loads no book's code.

## Handing over to the reader

At the end of the dive the browser goes to the book (`corbenic/?from=library`). With that flag the
reader starts page 1 in its loop, already drawn, instead of painting it from a blank sheet, so the
picture the visitor dived into is the one they land on. The page never goes dark on the way:

- **A crossfade.** Every page opts in to cross-document view transitions (`@view-transition`, in an
  inline `<style>` in each head, not in `style.css`: Chromium drops the opt-in of a page whose first
  frame waits on a script when the rule comes from a linked sheet), so the last frame of the dive
  crossfades into the reader's page 1, the same picture. Not with reduced motion.
- **The first frame waits for page 1.** With `from=library`, a book page's head adds a render-blocking
  `<link rel="expect" href="#drawn">`, an element after `app.js`: the reader draws page 1 in its
  first frame, so the dive's last frame holds until then.
- **A fallback.** Without either (another browser), an inline script sets the plate as the canvas's
  background, placed like the canvas's picture (cover, Corbenic contain); the reader clears it once
  it has drawn over it.

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

## Status

Done, on the `library` branch: both styles painted and baked, the journey and the table from the
clock at the screen's rate, the four books as links over their painted selves (hover and focus lift,
silhouette focus ring), the dive in CSS 3D onto the reader's first picture, « Passer », journey seen,
reduced motion, the style switch, storage without failure, and the phone layout.

Where it differs from the plan above:

- **The gallery is baked into images at build time**, not painted at load: the owner chose to show
  the room already painted. The films (`libraryOil`, `libraryBroken`) still paint it for the stills
  and the gate.
- **The arrival starts on the journey**, the room already there, fading in once its images are
  decoded; there is no painting-in on the front page.
- **The book's place is a baked "empty place"**: nothing is painted under a book, so the bake builds
  the oak it leaves (`place-<id>.webp`) from the table round it. It shows under a lifted book and
  under the one that rises for the dive, so there is never a second copy on the table.
- **Portrait framing instead of rearranging the books.** The books are painted into the table card,
  so they cannot be set two by two. A screen narrower than the table (a phone held upright) takes the
  four books across its width; the room shows round the frame as far as the cards are painted at
  every step of the journey (100 film px above, 200 below), fading into the dark, with the title over
  it. The framing is the same from the first frame of the journey to the table, so the arrival never
  jumps. On a touch screen each book's title stays under it at the table.
- **`player.ts` `finish()`**: a finished drawing (the `?from=library` landing, a tap, reduced motion)
  now jumps to its loop whatever the rAF clock says; before, the first frame's older timestamp
  restarted the drawing.
- **A way in without the room.** Without JS, or when the first style's pictures fail to load, the
  page is a plain list of the four books (`plain` on the body: titles and ledes in their own
  letters). A style that fails to load leaves the room as it was and the switch free. The links are
  reachable from the start; a book focused during the journey ends it, like « Passer ».
- **The dive starts at once.** The book rises as soon as its cover is loaded; its plate is awaited
  only before the cover turns, and both are fetched from the first hover, touch or focus.

Measured (headless Chromium with the GPU, dev server on localhost): journey and table 60 fps at
1440×900 dpr 2 and 390×844 dpr 3; first journey frame 0.35–0.6 s from navigation with a cold cache,
about 0.8 s (oil) and 1.4 s (broken colour) at 20 Mbit/s; before a click the page loads no script but
`library/app.js`.

To rebuild: `npm run covers` (the books' first-picture plates, `www/covers/`; needs macOS `sips`
and `cwebp`), then `npm run library` (the baked room, `www/library/`, about 45 s; needs
`playwright-core` with a Chromium and `cwebp` on the PATH), then `npm run build`.
