import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFileKeys } from "./fileKeys.ts";

test("parses keys, URLs and branch URLs; dedupes", () => {
  const raw = `AAA, https://www.figma.com/design/BBB/Name?node-id=1
    https://www.figma.com/design/BBB/Name/branch/CCC/Name,AAA`;
  assert.deepEqual(parseFileKeys(raw), ["AAA", "BBB", "CCC"]);
});

test("rejects entries that aren't keys or file URLs", () => {
  assert.throws(() => parseFileKeys("AAA, bad-key!"), /"bad-key!" doesn't look like/);
});
