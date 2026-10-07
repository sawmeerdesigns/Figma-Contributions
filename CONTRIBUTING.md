# Contributing

Thanks for helping! This guide covers how to propose changes, set up the project, and get a pull request merged. By taking part, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md). Security problems go by email instead; see [SECURITY.md](SECURITY.md).

## Feature proposals

Open an issue before starting anything larger than a bug fix, using the **Feature proposal** template. Describe the problem first, then the idea. That way nobody spends a weekend on something that doesn't fit.

Before proposing, check:

- **The [roadmap](docs/roadmap.md):** it may already be planned.
- **The [project decisions](docs/phase-1.md#31-phase-1-decisions-resolved-gaps):** they explain why things are the way they are.

Proposals fit best when they keep the project's principles:

- **Local-first:** no servers, accounts or tracking, and the token stays on the user's machine.
- **Activity, not productivity:** no scores or rankings that pretend to measure the quality of work.
- **Small and boring:** standard library and platform features before new dependencies.

## Local development

You need Node.js 22.18 or newer.

```bash
git clone https://github.com/sawmeerdesigns/Figma-Contributions.git
cd Figma-Contributions
npm install
npm run dev     # http://localhost:3000, shows the demo data
```

- **No Figma token needed for UI work.** Without `data/contributions.json`, the app uses `data/demo.json`.
- **To work with real data,** set up `.env.local` as described in the [README](README.md#configuration) and run `npm run sync`.
- **Never commit `.env.local` or `data/contributions.json`.** Both are gitignored; keep it that way.
- **Next.js version:** the project uses Next.js 16, whose APIs differ from older versions. Check `node_modules/next/dist/docs/` before relying on what you remember (see [AGENTS.md](AGENTS.md)).

### Where things live

- **Pure logic:** in `src/lib/` (Figma client, sync pipeline, contribution math), so it can be tested with plain Node.
- **UI:** in `src/app/` and `src/components/`.
- **Colors and type:** theme tokens in `src/app/globals.css`, taken from Sameer's Design System. Each variable names its Mapped token (for example `--brand` is `Action/Primary`). Use them, and the `text-heading-*`, `text-label-*` and `text-body-*` type styles, instead of hard-coded colors or sizes. Labels on gold use `text-on-brand`, never white.

## Testing

Run all four before opening a PR. CI (`.github/workflows/ci.yml`) runs the same checks on every push and pull request.

```bash
npm test            # unit tests, Node's built-in runner
npm run typecheck   # generates Next.js route types, then tsc
npm run lint
npm run build
```

- **Put tests next to the code** as `*.test.ts`, using `node:test` and `node:assert/strict`. No test framework is needed.
- **Stub the Figma API** with `stubFetch` from `src/lib/figma/stubFetch.ts`, as in `versions.test.ts` and `sync.test.ts`. Tests must never need a real token or the network.
- **Logic changes need a test** for each new branch, edge case or bug fix: one that fails without the change.
- **UI changes:** check the page by hand in both themes and at a narrow width (about 360px). Describe what you checked in the PR. The contrast test (`src/app/contrast.test.ts`) fails if a theme color drops below WCAG AA.

## Branch conventions

Work on a branch, never directly on `main`. Name it `<type>/<short-description>`, using the same types as commits:

```text
feat/team-file-discovery
fix/leap-day-streak
docs/troubleshooting-proxy
```

Keep a branch to one topic. Rebase on `main` if it falls behind.

## Commit conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```text
<type>: <what changed, in the imperative>

feat: show weekly totals in the tooltip
fix: count versions on Feb 29 in leap years
docs: explain the file_metadata:read scope
```

| Type | For |
|---|---|
| `feat` | New behavior users can see |
| `fix` | Bug fixes |
| `docs` | Documentation only |
| `test` | Tests only |
| `refactor` | Code changes that don't change behavior |
| `chore` | Tooling, dependencies, config |

Keep the subject under about 72 characters and explain the *why* in the body when it isn't obvious. Mark breaking changes, such as a new `data/contributions.json` format, with `!` (`feat!: …`) and say in the body how users upgrade (usually `npm run sync -- --full`).

## Pull request process

1. **Start with an issue** for anything beyond a small fix, and link it in the PR (`Closes #12`).
2. **Keep the PR to one change.** Small PRs get reviewed faster.
3. **Fill in the PR template:** what changed, why, and how you tested it. For UI changes, add screenshots in both themes, using demo data and never your real files.
4. **Update the docs** in the same PR when behavior changes: the README, `CHANGELOG.md` under *Unreleased*, and the roadmap if a phase moves.
5. **CI must pass.** A maintainer reviews, may ask for changes, and squash-merges with a Conventional Commit title.

Be patient: this is a small project, and reviews can take a few days.
