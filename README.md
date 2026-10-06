# Figma Contributions

GitHub Contributions, but for Figma. A local-first, open-source app that turns a Figma file's version history into a GitHub-style contribution heatmap.

> Measures Figma **activity**, not productivity. 10 versions ≠ 10 hours of work.

## How it works

```text
npm run sync  →  Figma REST API (GET /v1/files/:key/versions)  →  data/contributions.json
npm run dev   →  data/contributions.json  →  heatmap + stats
```

The Figma API is only called by `npm run sync`, never on page render.

## Setup

1. `npm install`
2. `cp .env.example .env.local` and fill in `FIGMA_ACCESS_TOKEN` and `FIGMA_FILE_KEY`
3. `npm run sync`
4. `npm run dev`

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

See [docs/roadmap.md](docs/roadmap.md). Phase 1 (definition) ✅ · Phase 2 (Next.js foundation) ✅ · Phase 3 (configuration) in progress. Decisions: [docs/phase-1.md §31](docs/phase-1.md).
