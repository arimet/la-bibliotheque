// BAKE THE LIBRARY. The front page sets images instead of painting: each style's cards, finished at
// scale 1, each book's lifted copy, the place it leaves, and its cover laid flat, into www/library/<style>/*.webp.
//   node tools/bake-library.mjs [oil|broken]
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { buildPage } from "./build-page.mjs";
import { detect } from "./detect.mjs";

const Q = 95, DIRS = { oil: "oil", broken: "broken" };
const env = detect();
if (!env.pw.ok || !env.browser.ok) { console.error(`bake-library: no browser.\n  playwright: ${env.report.playwright}\n  browser:    ${env.report.browser}`); process.exit(1); }
const page = await buildPage({ entry: "src/hosts/bake-library.ts", out: resolve("dist/bake-library.html"), title: "libraryOil" });   // the manifest (the plates) is the same for both styles
const browser = await env.pw.lib.chromium.launch({ executablePath: env.browser.executablePath });
const tab = await (await browser.newContext({ viewport: { width: 640, height: 640 } })).newPage();
const errors = []; tab.on("pageerror", (e) => errors.push(e.message));
await tab.goto(pathToFileURL(page.out).href); await tab.evaluate(() => window.BAKE.ready);
if (errors.length) throw new Error("page failed: " + errors.join("; "));
const { styles, cards, books } = await tab.evaluate(() => ({ styles: window.BAKE.styles, cards: window.BAKE.cards, books: window.BAKE.books }));
const tmp = resolve("out/library-bake"); mkdirSync(tmp, { recursive: true });
for (const s of process.argv[2] ? [process.argv[2]] : styles) {
  const dir = resolve("www/library", DIRS[s]); mkdirSync(dir, { recursive: true });
  const jobs = [...cards.map((id) => ["card", id, id]), ...books.map((id) => ["book", id, `book-${id}`]), ...books.map((id) => ["place", id, `place-${id}`]), ...books.map((id) => ["cover", id, `cover-${id}`])];
  let total = 0;
  for (const [kind, id, name] of jobs) {
    const t0 = Date.now(), b64 = await tab.evaluate(([k, st, i]) => window.BAKE[k](st, i), [kind, s, id]);
    const src = join(tmp, `${s}-${name}.png`), out = join(dir, `${name}.webp`); writeFileSync(src, Buffer.from(b64, "base64"));
    // lossy colour, lossless alpha: the cut edges stay clean
    execFileSync("cwebp", ["-quiet", "-q", String(Q), "-m", "6", "-alpha_q", "100", src, "-o", out]);
    const kb = statSync(out).size / 1024; total += kb; console.log(`  ${s.padEnd(7)} ${name.padEnd(18)} ${kb.toFixed(0).padStart(5)} KB  (${Date.now() - t0} ms)`);
  }
  await tab.evaluate((st) => window.BAKE.free(st), s);
  console.log(`${s}: ${(total / 1024).toFixed(2)} MB in www/library/${DIRS[s]}/`);
}
await browser.close();
