import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildSync } from "esbuild";

// the front page sets each baked picture at a size the geometry gives (library.ts, PARTS): a change to
// the geometry without `npm run library` would misplace them without an error. libraryScene imports
// without extensions, so it is bundled first
const js = buildSync({ stdin: { contents: `export * from "./src/canvas-core/libraryScene"; export { H } from "./src/canvas-core/longroom";`, resolveDir: process.cwd() }, bundle: true, platform: "node", format: "esm", write: false }).outputFiles[0].text;
const S = await import(`data:text/javascript;base64,${Buffer.from(js).toString("base64")}`);
// a WebP's size from its header: lossy (VP8), lossless (VP8L) or extended (VP8X)
const size = (f: string) => {
  const b = readFileSync(f), t = b.toString("latin1", 12, 16);
  return t === "VP8X" ? [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)] : t === "VP8L" ? [1 + (b.readUInt32LE(21) & 0x3fff), 1 + ((b.readUInt32LE(21) >>> 14) & 0x3fff)] : [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
};

for (const style of ["oil", "broken"]) test(`the ${style} room's baked pictures fit the geometry`, () => {
  const want: Record<string, number[]> = { far: [S.FW, S.FH], ring: [S.RW, S.RH], table: [S.TW, S.H], ...Object.fromEntries(["AL", "AR", "BL", "BR"].map((v) => [`busts${v}`, [S.OW, S.OH]])) };
  for (const b of S.BOOKS) {
    const [x0, y0, x1, y1] = S.spriteBox(b);
    want[`book-${b.id}`] = want[`place-${b.id}`] = [x1 - x0, y1 - y0];
    want[`cover-${b.id}`] = [520, Math.round((520 * b.d) / b.w)];
  }
  for (const [name, wh] of Object.entries(want)) assert.deepEqual(size(`www/library/${style}/${name}.webp`), wh, name);
});
