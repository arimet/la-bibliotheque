// THE LONG ROOM, once for both styles: where each painted card stands in the nave, where the
// camera goes, where the books lie. Metres: x across (0 = the nave's centre), y up, z down the nave.
import type { P } from "./core";

export const W = 1600, H = 900, F = 900;                 // film size, focal length in px
export const PAINT = 90, JOURNEY = 210, TABLE = 180;      // frames: arrival, travel, table loop
export const BAY = 3.2;                                   // one bay of the Long Room, pilaster to pilaster
export const TABLE_Z = 7 * BAY + 2, STOP = 2.2;           // the table, and how far short of it the camera stops
export const HORIZON = H * 0.42;                          // where the eye's level falls on screen
// the eye's height: the one that stands the table card on the floor in the end view. It never
// changes, so every card's runs along the nave head for the same vanishing point all the way
export const EYE = ((H - HORIZON) * STOP) / F;
export type Card = { id: string; x: number; y: number; z: number; w: number; h: number };   // a painted card: centre, depth, size in metres
export const ease = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * u));   // sets off at once after the arrival, slows into the table
export const camAt = (f: number) => ({ x: 0, y: EYE, z: (TABLE_Z - STOP) * ease(f / JOURNEY) });
export type Cam = ReturnType<typeof camAt>;
// the far window, then a ring at every bay (two painted variants, alternating), then the table.
// A ring is the width and height the next nearer ring's opening can ever reveal of it; the far
// card only has to fill the last ring's opening
export const FAR: Card = { id: "far", x: 0, y: 5.75, z: 12 * BAY, w: 7, h: 13.5 };
export const RINGS: Card[] = Array.from({ length: 11 }, (_, i) => ({ id: i % 2 ? "ringB" : "ringA", x: 0, y: 5, z: (12 - i) * BAY - BAY / 2, w: 10.4, h: 15.2 }));
// the table card fills the screen exactly in the end view, so its painting is shown 1:1 there
export const TABLE_CARD: Card = { id: "table", x: 0, y: EYE - ((H / 2 - HORIZON) * STOP) / F, z: TABLE_Z, w: (W * STOP) / F, h: (H * STOP) / F };
// where a card lands on screen: its centre in px and its scale (px per metre); null once it is behind us
export const project = (c: Card, cam: Cam): { x: number; y: number; s: number } | null => {
  const d = c.z - cam.z; if (d < 0.3) return null;
  const s = F / d; return { x: W / 2 + (c.x - cam.x) * s, y: HORIZON - (c.y - cam.y) * s, s };
};
// the books' four places on the table, in the table card's own px (the card is painted 1600 px wide)
export const SLOTS: P[] = [[330, 420], [640, 400], [960, 400], [1270, 420]];
