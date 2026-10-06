# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). Roadmap phases are in [docs/roadmap.md](docs/roadmap.md).

## [Unreleased]

Everything so far; the first release will be `0.1.0`.

### Added

- **Sync** (`npm run sync`): reads the version history of one or more Figma files (`FIGMA_FILE_KEYS`, keys or pasted URLs, branch URLs supported) and writes daily counts per file to `data/contributions.json`. Only versions by the token's owner are counted.
- **Incremental sync:** after the first run, only versions newer than the last sync are fetched and merged, usually one request per file. Days Figma no longer returns are kept. `npm run sync -- --full` rebuilds from scratch.
- **Heatmap:** a GitHub-style year grid with five levels, tooltips, month and weekday labels, and scroll-to-today on narrow screens.
- **Stats:** contributions, active days, current and longest streak, most active day and month.
- **Most active projects:** versions per file for the selected year. File names come from Figma (with the optional `file_metadata:read` scope) or the pasted URL.
- **Year navigation** for any year from the first synced year to now, including empty years.
- **Demo mode:** committed, made-up `data/demo.json`, shown when there's no synced data.
- **Design:** dark and light themes, card layout, logo and favicon, loading and error states.
- **Accessibility:** a keyboard-navigable grid (arrows, Home/End, Ctrl+Home/End), accessible names for every day, a hoverable tooltip dismissable with Escape, reduced-motion and forced-colors support, and a WCAG AA contrast test.
- **Reliability:** API errors explained (invalid or expired token, missing scope, 404, 5xx, network, invalid response), short rate limits retried up to 3 times, a 30-second request timeout, and atomic data writes.
- **Tests and CI:** 45 tests with Node's test runner (Figma API stubbed). GitHub Actions runs test, typecheck, lint and build.
- **Docs:** README (setup, token and file key setup, syncing, troubleshooting, privacy), roadmap and project decisions.
- **Open source:** MIT license, contributing guide, code of conduct, security policy and this changelog.

### Security

- The Figma token is only read by the sync script and only sent to `https://api.figma.com`; the client refuses any other host, even one named in a pagination link.

[Unreleased]: https://github.com/sawmeerdesigns/Figma-Contributions/commits/main
