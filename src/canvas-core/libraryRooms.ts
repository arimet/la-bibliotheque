import { Gfx, type Medium } from "./core";
import { weave } from "./paintedOilKit";
import { linen } from "./brokenColourKit";
import type { Room } from "./libraryScene";

// THE LONG ROOM'S TWO ROOMS: what each style lays under, between and over its cards (the ground,
// the lit air of the nave, the canvas fixed to the screen) and the tint of its lamp. Kept apart from
// the paintings, so the front page can set the baked cards without carrying the painters.
export const OIL_M: Medium = { nib: 1, taper: 1, pressure: 1, retrace: false, wobble: 0, rough: 0 };
export const OIL_ROOM: Room = { id: "libraryOil", under: "#110c08", air: "#9c8a6c", canvas: (ctx, env) => weave(new Gfx(ctx, env, 0, OIL_M), 0.3), lamp: { glow: ["255,196,120", "240,150,70"], mote: ["#ffe0a8"], tongue: ["#ffd27a", "#fff2c8", "rgba(255,246,216,0)"] } };
export const BROKEN_ROOM: Room = {
  id: "libraryBroken", under: "#b49cc6", air: "#f0dccb", canvas: (ctx, env) => linen(ctx, env, 0.26),
  lamp: { glow: ["250,180,100", "240,130,110"], mote: ["#fff4d0", "#ffc27e", "#f9b4c2"], tongue: ["#ffc860", "#fff6d8", "rgba(255,250,232,0)"] },
};
