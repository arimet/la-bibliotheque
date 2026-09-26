// Walks every path through each book, carrying the inventory, and checks the graph holds up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { pageIn, type Book } from "../src/app/book.ts";
import { book as dustCreek } from "../src/stories/dust-creek.ts";
import { book as corbenic } from "../src/stories/corbenic.ts";

const BOOKS: Book[] = [dustCreek, corbenic];

const walk = (b: Book) => {
  const seen = new Set<string>(), reached = new Set<string>(), stuck: string[] = [], queue: [string, string[]][] = [[b.start, b.startItems]];
  while (queue.length) {
    const [id, inv0] = queue.shift()!, page = pageIn(b, id)!, inv = [...new Set([...inv0, ...(page.gives ? [page.gives] : [])])].sort();
    const key = id + ":" + inv.join(","); if (seen.has(key)) continue; seen.add(key); reached.add(id);
    const open = page.choices.filter((c) => !c.needs || inv.includes(c.needs));
    if (!page.ending && !open.length) stuck.push(key);
    open.forEach((c) => queue.push([c.to, inv]));
  }
  return { reached, stuck };
};

for (const b of BOOKS) {
  test(`${b.id}: every choice leads to a page that exists`, () => {
    for (const p of b.pages) for (const c of p.choices) assert.ok(pageIn(b, c.to), `${p.id} -> ${c.to}`);
  });
  test(`${b.id}: every item given or needed is one the book knows`, () => {
    const known = Object.keys(b.items), used = [...b.startItems, ...b.pages.flatMap((p) => [p.gives, ...p.choices.map((c) => c.needs)])].filter(Boolean) as string[];
    assert.deepEqual(used.filter((i) => !known.includes(i)), []);
  });
  test(`${b.id}: every page, and so every ending, can be reached`, () => {
    const { reached } = walk(b);
    assert.deepEqual(b.pages.filter((p) => !reached.has(p.id)).map((p) => p.id), []);
  });
  test(`${b.id}: no reader is ever left without a card to play`, () => assert.deepEqual(walk(b).stuck, []));
  test(`${b.id}: endings have no choices, and everything else has at least one`, () => {
    for (const p of b.pages) assert.equal(p.ending ? p.choices.length === 0 : p.choices.length > 0, true, p.id);
  });
}
