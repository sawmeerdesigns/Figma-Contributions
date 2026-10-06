import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { FigmaApiError, MAX_RETRIES, fetchCurrentUserId, fetchFileName } from "./client.ts";
import { stubFetch } from "./stubFetch.ts";
import { fetchAllVersions } from "./versions.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

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

test("drops versions repeated across pages", async () => {
  stubFetch({
    [first]: { body: { versions: [{ id: "3" }, { id: "2" }], pagination: { next_page: second } } },
    [second]: { body: { versions: [{ id: "2" }, { id: "1" }], pagination: {} } },
  });
  assert.deepEqual((await fetchAllVersions("KEY", "tok")).map((v) => v.id), ["3", "2", "1"]);
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

test("gives up after MAX_RETRIES short rate-limit waits", async () => {
  const calls = stubFetch({ [first]: { status: 429, headers: { "retry-after": "0.001" }, body: {} } });
  await assert.rejects(
    fetchAllVersions("KEY", "tok"),
    (e: unknown) => e instanceof FigmaApiError && e.status === 429,
  );
  assert.equal(calls.length, 1 + MAX_RETRIES);
});

test("fetchCurrentUserId explains a missing current_user:read scope", async () => {
  const me = "https://api.figma.com/v1/me";
  stubFetch({ [me]: { body: { id: "u1" } } });
  assert.equal(await fetchCurrentUserId("tok"), "u1");
  stubFetch({ [me]: { status: 403, body: { status: 403, err: "Invalid scope" } } });
  await assert.rejects(fetchCurrentUserId("tok"), /current_user:read/);
});

const isApiError = (status: number, pattern: RegExp) => (e: unknown) =>
  e instanceof FigmaApiError && e.status === status && pattern.test(e.message);

test("invalid and expired tokens say to regenerate, quoting Figma", async () => {
  stubFetch({ [first]: { status: 401, body: { status: 401, err: "Invalid token" } } });
  await assert.rejects(fetchAllVersions("KEY", "tok"), isApiError(401, /Figma said: "Invalid token".*expired/));
  stubFetch({ [first]: { status: 403, body: { status: 403, err: "Token expired" } } });
  await assert.rejects(fetchAllVersions("KEY", "tok"), isApiError(403, /Figma said: "Token expired"/));
});

test("server errors, network failures and non-JSON bodies become FigmaApiErrors", async () => {
  stubFetch({ [first]: { status: 500, body: "<html>oops</html>", raw: true } });
  await assert.rejects(fetchAllVersions("KEY", "tok"), isApiError(500, /Figma API error \(500\)\.$/));
  stubFetch({ [first]: "network-error" });
  await assert.rejects(fetchAllVersions("KEY", "tok"), isApiError(0, /Could not reach the Figma API/));
  stubFetch({ [first]: { body: "not json", raw: true } });
  await assert.rejects(fetchAllVersions("KEY", "tok"), isApiError(200, /isn't valid JSON/));
});

test("waits out a short rate limit, then succeeds", async () => {
  const calls = stubFetch({
    [first]: [
      { status: 429, headers: { "retry-after": "0.001" }, body: {} },
      { body: { versions: [{ id: "1" }] } },
    ],
  });
  assert.deepEqual((await fetchAllVersions("KEY", "tok")).map((v) => v.id), ["1"]);
  assert.equal(calls.length, 2);
});

test("a long rate limit is reported, not waited out", async () => {
  const calls = stubFetch({ [first]: { status: 429, headers: { "retry-after": "3600" }, body: {} } });
  await assert.rejects(fetchAllVersions("KEY", "tok"), isApiError(429, /in about 60 minute/));
  assert.equal(calls.length, 1);
});

test("empty history and missing fields give no versions", async () => {
  stubFetch({ [first]: { body: { versions: [] } } });
  assert.deepEqual(await fetchAllVersions("KEY", "tok"), []);
  stubFetch({ [first]: { body: {} } });
  assert.deepEqual(await fetchAllVersions("KEY", "tok"), []);
});

test("fetchFileName returns the name, or null on any Figma error", async () => {
  const meta = "https://api.figma.com/v1/files/KEY/meta";
  stubFetch({ [meta]: { body: { file: { name: "Portfolio" } } } });
  assert.equal(await fetchFileName("KEY", "tok"), "Portfolio");
  stubFetch({ [meta]: { status: 403, body: { status: 403, err: "Invalid scope" } } });
  assert.equal(await fetchFileName("KEY", "tok"), null);
});
