import { test } from "node:test";
import assert from "node:assert/strict";
import { camAt, project, JOURNEY, TABLE_Z, RINGS } from "../src/canvas-core/longroom.ts";

test("the camera starts at the door and stops short of the table", () => {
  assert.equal(camAt(0).z, 0);
  const end = camAt(JOURNEY).z;
  assert.ok(end < TABLE_Z - 1 && end > TABLE_Z - 4);
});
test("the camera eases: no jump, never goes back", () => {
  let prev = camAt(0).z;
  for (let f = 1; f <= JOURNEY; f++) { const z = camAt(f).z; assert.ok(z >= prev); assert.ok(z - prev < 0.5); prev = z; }
});
test("a card grows as the camera nears it", () => {
  const ring = RINGS[0];                              // the farthest ring: still ahead at the end
  assert.ok(project(ring, camAt(JOURNEY))!.s > project(ring, camAt(0))!.s);
});
test("cards behind the camera are not drawn", () => {
  assert.equal(project({ ...RINGS[0], z: 0.1 }, camAt(JOURNEY)), null);
});
