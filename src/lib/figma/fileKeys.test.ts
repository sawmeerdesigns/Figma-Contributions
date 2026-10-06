import assert from "node:assert/strict";
import { test } from "node:test";
import { parseFileKeys } from "./fileKeys.ts";

test("parses keys, URLs and branch URLs; dedupes", () => {
  const raw = `AAA, https://www.figma.com/design/BBB/Name?node-id=1
    https://www.figma.com/design/BBB/Name/branch/CCC/Name,AAA`;
  assert.deepEqual(parseFileKeys(raw).map((f) => f.key), ["AAA", "BBB", "CCC"]);
});

test("takes a fallback name from the URL slug", () => {
  const raw = `https://www.figma.com/design/BBB/Swift-Pay--HRMS?node-id=1-2,
    https://www.figma.com/design/BBB/Main/branch/CCC/New-Nav, https://www.figma.com/design/DDD,
    https://www.figma.com/design/EEE/Caf%C3%A9-App, FFF`;
  assert.deepEqual(parseFileKeys(raw), [
    { key: "BBB", name: "Swift Pay HRMS" },
    { key: "CCC", name: "New Nav" },
    { key: "DDD" },
    { key: "EEE", name: "Café App" },
    { key: "FFF" },
  ]);
});

test("rejects entries that aren't keys or file URLs", () => {
  assert.throws(() => parseFileKeys("AAA, bad-key!"), /"bad-key!" doesn't look like/);
});
