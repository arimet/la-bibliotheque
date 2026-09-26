# Canicule and Les Grands Bois — design

Books three and four on the shelf, each exploring one of anidoodle's hands: **Risograph** for a 1970s
noir, **coloured pencil** for a forest tale. Same size as the others: twelve pages, three endings,
four items, a twist on page 9, every picture drawn in code and animated.

The writing rules of `feedback-writing-style` hold for both: no similes, no punchline the story does
not explain, every sentence checked against what the reader knows on each path to that page.

## Canicule (Risograph)

Paris, August 1976, the heatwave. You are a private detective, an ex-cop, office on rue Frochot. A
woman who calls herself Nadia pays you to find her sister Lili, a singer at the Flamingo, gone five
days. Commissaire Varenne runs Pigalle. He shot Rocco, the Flamingo's owner, in the club's office;
the tape recorder Rocco kept under his desk caught it; Lili has the tape.

Clues to the twist: r01, Nadia pays in new notes with consecutive numbers and has no picture of her
sister except the one on the club's poster; r02, the barman says Lili grew up in care, no family.

```
r01 La Cliente ─┬─ r02 Le Flamingo (+briquet) ─┐
                └─ r03 L'Appartement (+clé) ───┴─ r04 La Filature
r04 ─┬─ r05 Le Quai ─┬─ r07 Lili (+bande) ─────────┐
     │               └─ r08 La Chambre vide (+bande)┤
     └─ r06 Le Métro ── briquet? r07 : r08 ────────┴─ r09 Deux heures
r09: bande → r10 La Une · clé → r11 Le Train de nuit · photo → r12 La Photo
```

| Page | What happens |
|---|---|
| r01 La Cliente | Nadia hires you and gives you the photo. The Flamingo or Lili's flat. |
| r02 Le Flamingo | Shut: "Rocco is on holiday". Momo the barman gives you a lighter from Lili's dressing room, a phone number inside. Lili has no family. |
| r03 L'Appartement | Turned over. Under the bath panel, a Gare du Nord left-luggage key. |
| r04 La Filature | A grey Peugeot 504 on your tail; at a red light, Maillard, Varenne's man. |
| r05 Le Quai | You confront him; Varenne tells you to drop it, lets slip that no one has seen Rocco. |
| r06 Le Métro | You lose them. With the lighter you can call the number (r07); without, you are too late (r08). |
| r07 Lili | A hotel at Barbès: Varenne killed Rocco, the tape caught it, she has it. She has no sister. |
| r08 La Chambre vide | She has run; the tape is still hidden in the radiator. |
| r09 Deux heures | The twist: at the meeting, Nadia gets out of Varenne's car. His informant; you led them to Lili. |
| r10 La Une | The tape goes to *Libération*; Varenne falls. |
| r11 Le Train de nuit | The locker holds Lili's bag; you put her on the night train to Marseille. |
| r12 La Photo | You give them the photo and the address, and understand too late. |

- **Items:** photo (start), briquet (r02), clé (r03), bande (r07 or r08).
- **Look:** three drums (fluorescent pink `#ff48b0`, blue `#0078bf`, yellow `#ffd400`), each a
  multiplied layer off register; from r09 the yellow drum is changed for red (`#f15060`). Tone by
  halftone screen, overprints for mixed colours, white is bare paper, no outlines: a 1970s poster.
  The draw is the press: yellow, then pink, then blue landing. Loops: neon, smoke, a fan, heat haze,
  traffic lights. Type: Anton titles, Courier Prime text.

## Les Grands Bois (coloured pencil)

You are ten. At dusk your little brother Tom followed a white fox into the Grands Bois. Grandmother's
rules: never leave the path; never tell your name to anyone of the wood. The animals of the wood are
the children who did.

```
f01 La Lisière ─┬─ f02 Le Sentier (+écharpe) ─┐
                └─ f03 Le Terrier (+gland) ───┴─ f04 La Clairière
f04 ─┬─ f05 La Rivière ─┬─ f07 La Tanière ─┐
     │                  └─ f08 La Cabane ──┤
     └─ f06 La Nuit ── écharpe? f07 : f08 ─────┴─ f09 Le Vieux Chêne
f09: écharpe → f10 L'Aube · gland → f11 L'Échange · sifflet → f12 Les Pattes
```

| Page | What happens |
|---|---|
| f01 La Lisière | Tom's prints go into the wood. Grandmother's whistle, "for when you're lost". The path or the fox's tracks. |
| f02 Le Sentier | Tom's scarf on a bramble, his name embroidered on it. |
| f03 Le Terrier | A talking badger gives a golden acorn "for the Old Oak", and asks your name. You say nothing. |
| f04 La Clairière | The animals watch you: too many, too calm. |
| f05 La Rivière | A heron offers to carry you over; the Lady's hut or the fox's den. |
| f06 La Nuit | Lost in the dark. With Tom's scarf, the white fox smells it and leads you to its den (f07); without, you follow a light to the hut (f08). |
| f07 La Tanière | Tom asleep among fox cubs, his ears gone pointed. |
| f08 La Cabane | The Lady of the Wood, kind, soup; on her walls, children's scarves and caps. |
| f09 Le Vieux Chêne | The twist: the animals are the children who told their names. Tom told his. |
| f10 L'Aube | You call him by the name on the scarf; he comes back. |
| f11 L'Échange | You give the Oak your own name so Tom can go; you become a doe. |
| f12 Les Pattes | You whistle, the wood answers, and you both stay. |

- **Items:** three: sifflet (start), écharpe (f02), gland (f03). The scarf opens the den on f06 and
  brings Tom back on f10; the acorn is for the Oak on f11; the whistle is the ending every path keeps.
- **Look:** coloured pencil on cream toothy paper: colour laid by directional hatching, two or three
  pencils over each other, paper grain through it, soft outlines in a darker pencil, highlights left
  bare. Autumn (ochre, rust, moss, plum) to night (Prussian blue, violet, grey) to dawn (pink, gold)
  in f10. The draw is the hatching appearing stroke by stroke. Loops: falling leaves, fireflies,
  snow, the fox's tail, breathing. Type: Caveat titles, Nunito text.

## Code

- Stories `src/stories/canicule.ts`, `src/stories/grands-bois.ts`; entries `src/app/canicule.ts`,
  `src/app/grands-bois.ts`; pages `www/canicule/`, `www/grands-bois/`; four covers on the shelf.
- Kits: `src/canvas-core/press.ts` (anidoodle's `riso.ts` ported, credited in `NOTICE`: drums,
  screens, registration) and `src/canvas-core/pencil.ts` (layered hatching, soft contour, grain).
- `figures.ts` grows 1970s people (suit, dress, raincoat), a child, and animals (fox, badger, heron,
  owl, doe). Figures stay geometry; each kit renders a Motif in its own mark.
- Pages `r01…r12`, `f01…f12` in `src/canvas-core/`, with tool hosts.

## Order of work

1. Both texts, playable with placeholders. Reviewed before any drawing.
2. The two kits and the new figures, each tried on one hard still.
3. The 24 pages, one commit each.
4. Gate, fps, covers, docs.

## Status

- **Done:** both texts (reviewed) and all 24 pages, drawn and animated with `press.ts` and
  `pencil.ts` (plus `beasts.ts` for the animals). Every page passes the anidoodle determinism and
  forbidden-call checks and runs at about 60 fps in the reader on desktop and phone sizes (headless
  Chromium). The pencil pages work out their strokes on first use, not at import, so a book opens
  as fast as the others.
- **Deviations:** page 9 of Canicule puts the tape in a shirt pocket (no jacket in the heat); on the
  red drum Nadia's green dress prints teal. Page 6 of Les Grands Bois is drawn on a dark sheet.
- **Next:** a page-by-page review.
