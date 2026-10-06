// Test helper: replaces global fetch with canned replies per URL. Not a test file itself.
// A reply list is served in order (the last one repeats); "network-error" makes fetch reject.
export type Reply = { status?: number; headers?: HeadersInit; body: unknown; raw?: boolean } | "network-error";

export function stubFetch(routes: Record<string, Reply | Reply[]>) {
  const calls: { url: string; token: string | null }[] = [];
  const served = new Map<string, number>();
  globalThis.fetch = (async (input: string | URL, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, token: new Headers(init?.headers).get("X-Figma-Token") });
    const route = routes[url];
    if (!route) throw new Error(`unexpected request: ${url}`);
    const n = served.get(url) ?? 0;
    served.set(url, n + 1);
    const reply = Array.isArray(route) ? route[Math.min(n, route.length - 1)] : route;
    if (reply === "network-error") throw new TypeError("fetch failed");
    const body = reply.raw ? String(reply.body) : JSON.stringify(reply.body);
    return new Response(body, { status: reply.status ?? 200, headers: reply.headers });
  }) as typeof fetch;
  return calls;
}
