# Figma Contributions

GitHub Contributions, but for Figma. A local-first, open-source app that turns your Figma files' version history into a GitHub-style contribution heatmap.

It can combine several files into one graph, and only counts versions you created.

> Measures Figma **activity**, not productivity. 10 versions ≠ 10 hours of work.

## How it works

```text
npm run sync  →  Figma REST API (GET /v1/files/:key/versions)  →  data/contributions.json
npm run dev   →  data/contributions.json  →  heatmap + stats
```

The Figma API is only called by `npm run sync`, never on page render. Sync writes `data/contributions.json` as `{ "YYYY-MM-DD": count }` (UTC dates, only your versions). The file is gitignored, and every sync rewrites it. Without it, the page shows the committed, made-up `data/demo.json` (that's what a public deploy shows). Pick a year with the year switcher or `/?year=2025`. Any year from your first synced year up to now can be opened, including empty ones.

## Setup

Requires Node.js 22.18 or newer (the sync script runs TypeScript natively).

1. `npm install`
2. `cp .env.example .env.local` and fill in `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_KEYS` (see below)
3. `npm run sync`
4. `npm run dev`

## Configuration

### `FIGMA_ACCESS_TOKEN`

1. In Figma, open **Settings → Security → Personal access tokens**.
2. Click **Generate new token**.
3. Give it two read-only scopes: **`file_versions:read`** (version history) and **`current_user:read`** (so sync only counts your versions, not teammates').
4. Copy the token (starts with `figd_`). Figma only shows it once.

Tokens expire (at most 90 days). If sync reports an authentication error, generate a new one.

### `FIGMA_FILE_KEYS`

The files to count, separated by commas. Each one is a file key or a pasted file URL. The key is the part of the URL after `/design/`:

```text
https://www.figma.com/design/AbC123xyz/My-File
                             ^^^^^^^^^
```

```env
FIGMA_FILE_KEYS=AbC123xyz, https://www.figma.com/design/DeF456/Other-File
```

Branch URLs count the branch's history. Add new files to this list yourself; sync doesn't discover them. An older `.env.local` with a single `FIGMA_FILE_KEY` still works.

### How the variables are used

- `.env.local` is gitignored and never committed.
- Only `npm run sync` reads it, via Node's `--env-file-if-exists=.env.local`. The Next.js app never reads the token, so it can't end up in the browser.
- Never rename the variables with a `NEXT_PUBLIC_` prefix. That would ship the token to every visitor.

## Contribution levels

| Versions per day (UTC) | Level |
|---:|---:|
| 0 | 0 |
| 1–2 | 1 |
| 3–5 | 2 |
| 6–9 | 3 |
| 10+ | 4 |

## Security

- Your token lives only in `.env.local`, which is gitignored.
- It is read only by the local sync script. It is never sent to the browser.
- The public demo uses demo data, never a real token.

## Status

See [docs/roadmap.md](docs/roadmap.md). Phase 1 (definition) ✅ · Phase 2 (Next.js foundation) ✅ · Phase 3 (configuration) ✅ · Phase 4 (Figma API client) ✅ · Phase 5 (raw data processing) ✅ · Phase 6 (contribution engine) ✅ · Phase 7 (calendar engine) ✅ · Phase 8 (heatmap UI) ✅ · Phase 9 (statistics dashboard) ✅ · Phase 10 (year navigation) ✅ · Phase 11 (multi-file) ✅ via `FIGMA_FILE_KEYS`. See the roadmap for what's next. Decisions: [docs/phase-1.md §31](docs/phase-1.md).
