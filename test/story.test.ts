// Walks every path through the book, carrying the inventory, and checks the graph holds up.
import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGES, START, START_ITEMS, pageById, type Item } from "../src/app/story.ts";

const walk = () => {
  const seen = new Set<string>(), reached = new Set<string>(), stuck: string[] = [], queue: [string, Item[]][] = [[START, START_ITEMS]];
  while (queue.length) {
    const [id, inv0] = queue.shift()!, page = pageById(id)!, inv = [...new Set([...inv0, ...(page.gives ? [page.gives] : [])])].sort();
    const key = id + ":" + inv.join(","); if (seen.has(key)) continue; seen.add(key); reached.add(id);
    const open = page.choices.filter((c) => !c.needs || inv.includes(c.needs));
    if (!page.ending && !open.length) stuck.push(key);
    open.forEach((c) => queue.push([c.to, inv]));
  }
  return { reached, stuck };
};

test("every choice leads to a page that exists", () => {
  for (const p of PAGES) for (const c of p.choices) assert.ok(pageById(c.to), `${p.id} -> ${c.to}`);
});

test("every page, and so every ending, can be reached", () => {
  const { reached } = walk();
  assert.deepEqual(PAGES.filter((p) => !reached.has(p.id)).map((p) => p.id), []);
});

test("no reader is ever left without a card to play", () => {
  assert.deepEqual(walk().stuck, []);
});

test("endings have no choices, and everything else has at least one", () => {
  for (const p of PAGES) assert.equal(p.ending ? p.choices.length === 0 : p.choices.length > 0, true, p.id);
});
