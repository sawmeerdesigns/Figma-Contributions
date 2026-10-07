# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). Roadmap phases are in [docs/roadmap.md](docs/roadmap.md).

## [Unreleased]

### Added

- **Light/dark toggle** in the header (Icon Button, 40×40 target). It follows the system setting until clicked, then remembers the choice (`localStorage`). A small script applies the theme before first paint, so there's no flash, and the toggle exposes its state with `aria-pressed`.
- **Footer** with "Made by sawmeerdesigns", a "Get it now on GitHub" button and the demo notice, which moved here from the top of the page. A "Demo data" tag next to the graph title keeps it clear the data is made up.

### Changed

- **New look from Sameer's Design System:** antique gold on warm neutrals in Light and Dark, Manrope and Roboto Mono, and a 1200px container with the system's margins and section spacing. Every colour maps to a Mapped token (`src/app/globals.css` names each one).
- **Heatmap:** a gold ramp from the Brand primitives, since the system has no sequential Data token. Cells are 12px, 4px apart.
- **Components:** the demo notice uses the Info tone with an icon, and the error page is an Error Alert card. Year tabs and Try again use gold with the `Text/Button/Primary` label (white on gold fails contrast). The tooltip uses the inverse surface; focus rings use `Border/Focus`.
- **Stat cards** follow Metric Content (label, value, detail) and lost their misleading hover state.
- **Mobile:** year tabs have a 40px tap target.
- **Contrast test** covers the new token pairs, status alerts included.

## [1.0.0] - 2026-10-07

First release.

### Added

- **Sync** (`npm run sync`): reads the version history of one or more Figma files (`FIGMA_FILE_KEYS`, keys or pasted URLs, branch URLs supported) and writes daily counts per file to `data/contributions.json`. Only versions by the token's owner are counted.
- **Incremental sync:** after the first run, only versions newer than the last sync are fetched and merged, usually one request per file. Days Figma no longer returns are kept. `npm run sync -- --full` rebuilds from scratch.
- **Heatmap:** a GitHub-style year grid with five levels, tooltips, month and weekday labels, and scroll-to-today on narrow screens.
- **Stats:** contributions, active days, current and longest streak, most active day and month.
- **Most active projects:** versions per file for the selected year. File names come from Figma (with the optional `file_metadata:read` scope) or the pasted URL.
- **Year navigation** for any year from the first synced year to now, including empty years.
- **Demo mode:** committed, made-up `data/demo.json`, shown when there's no synced data, with dates shifted so the latest day is today. Public deployments always show it ([live demo](https://figma-contributions.vercel.app)).
- **Design:** dark and light themes, card layout, logo and favicon, loading and error states.
- **Accessibility:** a keyboard-navigable grid (arrows, Home/End, Ctrl+Home/End), accessible names for every day, a hoverable tooltip dismissable with Escape, reduced-motion and forced-colors support, and a WCAG AA contrast test.
- **Reliability:** API errors explained (invalid or expired token, missing scope, 404, 5xx, network, invalid response), short rate limits retried up to 3 times, a 30-second request timeout, and atomic data writes.
- **Tests and CI:** 47 tests with Node's test runner (Figma API stubbed). GitHub Actions runs test, typecheck, lint and build.
- **Docs:** README (setup, token and file key setup, syncing, troubleshooting, privacy), roadmap and project decisions.
- **Open source:** MIT license, contributing guide, code of conduct, security policy and this changelog.

### Security

- The Figma token is only read by the sync script and only sent to `https://api.figma.com`; the client refuses any other host, even one named in a pagination link.

[Unreleased]: https://github.com/sawmeerdesigns/Figma-Contributions/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/sawmeerdesigns/Figma-Contributions/releases/tag/v1.0.0
