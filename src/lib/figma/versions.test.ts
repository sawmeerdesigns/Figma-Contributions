import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { FigmaApiError } from "./client.ts";
import { fetchAllVersions } from "./versions.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

function stubFetch(pages: Record<string, { status?: number; body: unknown }>) {
  const calls: { url: string; token: string | null }[] = [];
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, token: new Headers(init?.headers).get("X-Figma-Token") });
    const page = pages[url];
    if (!page) throw new Error(`unexpected request: ${url}`);
    return new Response(JSON.stringify(page.body), { status: page.status ?? 200 });
  }) as typeof fetch;
  return calls;
}

const first = "https://api.figma.com/v1/files/KEY/versions?page_size=50";
const second = "https://api.figma.com/v1/files/KEY/versions?page_size=50&before=2";

test("follows pagination and sends the token", async () => {
  const calls = stubFetch({
    [first]: { body: { versions: [{ id: "3" }, { id: "2" }], pagination: { next_page: second } } },
    [second]: { body: { versions: [{ id: "1" }], pagination: {} } },
  });
  const versions = await fetchAllVersions("KEY", "tok");
  assert.deepEqual(versions.map((v) => v.id), ["3", "2", "1"]);
  assert.deepEqual(calls.map((c) => c.token), ["tok", "tok"]);
});

test("stops if Figma repeats a page URL", async () => {
  stubFetch({ [first]: { body: { versions: [{ id: "1" }], pagination: { next_page: first } } } });
  assert.equal((await fetchAllVersions("KEY", "tok")).length, 1);
});

test("never sends the token to a non-Figma host", async () => {
  const calls = stubFetch({
    [first]: { body: { versions: [], pagination: { next_page: "https://evil.example/steal" } } },
  });
  await assert.rejects(fetchAllVersions("KEY", "tok"), /Refusing to send the Figma token/);
  assert.equal(calls.length, 1);
});

test("explains auth, missing-file and rate-limit errors", async () => {
  for (const [status, pattern] of [
    [403, /token may be invalid, expired/],
    [404, /file not found/],
    [429, /rate limit/],
  ] as const) {
    stubFetch({ [first]: { status, body: { status, err: "x" } } });
    await assert.rejects(
      fetchAllVersions("KEY", "tok"),
      (e: unknown) => e instanceof FigmaApiError && e.status === status && pattern.test(e.message),
    );
  }
});
