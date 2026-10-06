const FIGMA_API_HOST = "api.figma.com";
// Rate-limit waits longer than this are reported instead of waited out.
const MAX_RETRY_WAIT_SECONDS = 60;
export const MAX_RETRIES = 3;

export class FigmaApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function describeError(status: number, figmaMessage: string | undefined): string {
  const detail = figmaMessage ? ` Figma said: "${figmaMessage}".` : "";
  if (status === 401 || status === 403) {
    return `Figma rejected the request (${status}).${detail} Your token may be invalid, expired, missing the file_versions:read scope, or your account can't open this file.`;
  }
  if (status === 404) {
    return `Figma file not found (404).${detail} Check FIGMA_FILE_KEY.`;
  }
  return `Figma API error (${status}).${detail}`;
}

export async function figmaGet<T>(url: string, token: string): Promise<T> {
  // The token must only ever go to Figma, even if a pagination URL points elsewhere.
  const { protocol, hostname } = new URL(url);
  if (protocol !== "https:" || hostname !== FIGMA_API_HOST) {
    throw new FigmaApiError(0, `Refusing to send the Figma token to ${protocol}//${hostname}.`);
  }

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(url, { headers: { "X-Figma-Token": token }, signal: AbortSignal.timeout(30_000) });
    } catch {
      throw new FigmaApiError(0, "Could not reach the Figma API. Check your internet connection.");
    }

    if (res.ok) return (await res.json()) as T;

    if (res.status === 429) {
      const wait = Number(res.headers.get("retry-after")) || 0;
      if (wait > 0 && wait <= MAX_RETRY_WAIT_SECONDS && attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, wait * 1000));
        continue;
      }
      const when = wait > 0 ? `in about ${Math.ceil(wait / 60)} minute(s)` : "later";
      throw new FigmaApiError(429, `Figma rate limit reached (429). Please try again ${when}.`);
    }

    const body = (await res.json().catch(() => null)) as { err?: string } | null;
    throw new FigmaApiError(res.status, describeError(res.status, body?.err));
  }
}
