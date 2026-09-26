# Corbenic — design

The second book on the shelf, next to Dust Creek. A knight of the Round Table rides into the
Wasteland to bring the Grail back to Arthur. The dead do not stay dead. The twist, on every
path: Arthur is one of them. Same size as Dust Creek: twelve pages, three endings, four items,
every picture drawn in code with anidoodle, drawn stroke by stroke and then looped.

## Story

### Rules of the dead (stated in the text before they are needed)

- Whoever dies in the valley gets up the next night. A bite kills within a day.
- A blessed flame makes the dead back away.
- The Grail gives each one what is his: life to the living, death to the dead. Told by the Fisher
  King on p07; readers who skip p07 only know Arthur's order ("the Grail heals").

### Clues to the twist

- p01: Arthur has not sat at the Table since Easter; Keu handed you the order, left hand bandaged.
- p04: the dead in Corbenic's courtyard carry Round Table shields: every knight sent before you.
- p09: on the road home, the dead grow more numerous as Camelot gets closer, not fewer.

### Pages

```
p01 Le Val ─┬─ p02 La Chapelle (+cierge) ─┐
            └─ p03 Le Cimetière (+clé) ───┴─ p04 Corbenic
p04 ─┬─ p05 La Cour ─┬─ p07 Le Roi Pêcheur (+graal) ─┐
     │               └─ p08 Le Cortège (+graal) ─────┤
     └─ p06 La Crypte ── clé? p07 : p08 ─────────────┴─ p09 Camelot
p09: graal → p10 Le Repos · cierge → p11 Le Bûcher · épée → p12 La Table ronde
```

| Page | What happens |
|---|---|
| p01 Le Val stérile | You arrive with Arthur's order: "Rapporte-moi le Graal." Black wheat, doors nailed shut from outside. |
| p02 La Chapelle | A barricaded hermit states the rules of the dead and gives you a blessed candle. |
| p03 Le Cimetière | Graves opened from inside. Perceval, gone a year, chained to his cross, dead and moving. You end him; the postern key of Corbenic is on his belt. |
| p04 Corbenic | The castle; the dead in the courtyard wear Round Table shields. Great gate or dry well. |
| p05 La Cour | Through the dead, familiar faces. Up to the king's chamber (p07) or after the singing (p08). |
| p06 La Crypte | A locked grille. With the key: p07. Without: up through the hall, p08. |
| p07 Le Roi Pêcheur | Pellès, wounded twenty years, cannot die, so the valley's dead cannot rest. He states the Grail rule, drinks, dies. Outside, the dead lie down. |
| p08 Le Cortège | The Grail procession goes on without the living: dead maidens carry the bleeding lance and the cup. You snatch the Grail and run. The valley's dead keep walking. |
| p09 Camelot | The twist. The knights who came back empty-handed sit dead at the Table. Keu, grey, opens the door. Arthur, bitten at the Easter hunt, jaw working. The orders were Keu's; he fed his king the knights who came back with nothing. |
| p10 Le Repos | Arthur drinks and lies down; the dead of the kingdom lie down with him. The barge to Avalon. |
| p11 Le Bûcher | Camelot burns with its king and its Table. |
| p12 La Table ronde | You strike; the Table stands up. Last picture: you sit in the Siège Périlleux, kept for the one who finds the Grail. You are hungry. |

- **Items:** épée (start), cierge (p02), clé (p03), graal (p07 or p08). Every path carries the Grail
  home; the candle card at p09 is locked for readers who went through p03.
- **Writing:** the rules in `feedback-writing-style` hold: no similes, no punchline the story does
  not explain, every sentence checked against what the reader knows on each path to that page.

## Look

- `rot` (0..1) per page replaces Dust Creek's `blue`, for the picture and the text panel:
  - I (p01–p03, rot 0): vellum, iron-gall ink, lapis, vermilion, gold leaf.
  - II (p04–p08, rot ~0.5): the gold dulls, verdigris and grey-black spread.
  - III (p09, p11, p12, rot 1): blood red and black on browned paper. p10 returns to gold.
- Flat space like a real manuscript: stacked figures, no vanishing point.
- One shared border (`border.ts`, like `ship.ts`): scrolls around the picture whose leaves become
  thorns then bones and whose gold flakes as `rot` rises.
- Loops: a glint across the gold leaf, the dead swaying, candle flames, blood beading on the lance.
- Type: Grenze Gotisch for titles, EB Garamond for text. Cards keep the tarot layout, gilt edge.

## Code

- `src/app/main.ts` becomes `reader(book)`; one entry per book (`src/app/dust-creek.ts`,
  `src/app/corbenic.ts`); esbuild builds `www/dust-creek/app.js` and `www/corbenic/app.js`.
- `www/index.html` is the shelf: two covers (each book's p01 as a PNG). The books live at
  `/dust-creek/` and `/corbenic/`.
- `src/corbenic/`: `story.ts`, `kit.ts` (palettes, border, flat-space helpers on top of
  `west.ts`), `p01.ts` … `p12.ts`.
- Shared: player, gallery, cards, satchel (localStorage key per book), the story graph test (walks
  both books), the anidoodle tools.

## Order of work

1. Reader refactor and shelf; Dust Creek looks and plays exactly as before.
2. Corbenic's full text with placeholder pictures. The text is reviewed before any drawing.
3. Kit and border.
4. The twelve pages.
5. Performance (about 60 fps desktop and phone) and the anidoodle gate on every page.

## Status

- **Done:** the text (reviewed) and all twelve pages, drawn and animated with the manuscript kit
  (`manuscript.ts`, `border.ts`, `figures.ts`). Every page passes the anidoodle determinism and
  forbidden-call checks and runs at about 60 fps in the reader on desktop and phone sizes (headless
  Chromium). The shelf and both books' galleries work.
- **Deviation from the plan:** Corbenic's pages are shown whole (`object-fit: contain`) so the border
  is never cropped; Dust Creek stays full-bleed.
- **Next:** a page-by-page review.
