# Phase 1 — Project Definition & Architecture

## Project
**Figma Contributions**

A local-first, open-source application that converts a user's Figma file activity into a GitHub-style contribution heatmap.

## Phase Objective

Define the product, MVP, architecture, data model, security model, repository structure, and development gate **before writing application code**.

> **Rule: Do not start Phase 2 until Phase 1 is complete, verified, documented, and approved.**

---

# 1. Problem Statement

GitHub makes developer activity easy to understand through its contribution graph. Figma does not provide the same simple visual representation of a designer's historical activity.

Designers may work in Figma for months or years without having an easy way to see their activity patterns over time.

This project solves that by turning Figma version-history activity into daily contribution data and displaying it as a GitHub-style calendar.

### Problems to solve

- Designers cannot easily visualize Figma activity over time.
- There is no simple GitHub-style activity calendar for personal Figma work.
- Activity patterns are difficult to understand at a glance.
- Designers may want a private, local way to analyze their history.
- A useful MVP should not require a SaaS backend or central database.

---

# 2. Project Vision

> **GitHub Contributions, but for Figma.**

The long-term product should help a designer visualize:

- Daily Figma activity
- Weekly patterns
- Monthly activity
- Yearly consistency
- Current and longest streaks
- Total activity
- Activity intensity

The MVP should remain focused:

```text
Figma data → contribution data → heatmap
```

---

# 3. Target Users

### Primary
- UI/UX designers
- Product designers
- Freelance designers
- Design students
- Design enthusiasts

### Secondary
- Developers/designers interested in open-source activity visualization.

---

# 4. Core Product Principle

## Local-first

The user's Figma data should remain on their machine during the MVP.

```text
User
 ↓
Local Application
 ↓
Figma API
 ↓
Local Processing
 ↓
Local JSON
 ↓
Heatmap
```

No central database, SaaS account, payment system, or hosted user profile is required for the MVP.

---

# 5. MVP Workflow

```text
Clone repository
        ↓
npm install
        ↓
Configure Figma token + file key
        ↓
npm run sync
        ↓
Fetch Figma version history
        ↓
Normalize activity
        ↓
Aggregate by date
        ↓
Calculate contribution levels
        ↓
Write local JSON
        ↓
npm run dev
        ↓
View heatmap
```

---

# 6. MVP Features

## Figma configuration

The user supplies:

```env
FIGMA_ACCESS_TOKEN=your_token_here
FIGMA_FILE_KEYS=key1, https://www.figma.com/design/key2/...
```

One or more files, comma-separated (see §31 #10). The token is stored in `.env.local` and must never be committed.

## Version history sync

The application retrieves Figma file version history through the Figma REST API.

Conceptual endpoint:

```text
GET /v1/files/:key/versions
```

## Activity processing

```text
Raw Figma Version
        ↓
Normalized Activity
        ↓
Calendar Date
        ↓
Daily Count
```

## Contribution levels

Initial MVP thresholds:

| Daily activity | Level |
|---:|---:|
| 0 | 0 |
| 1–2 | 1 |
| 3–5 | 2 |
| 6–9 | 3 |
| 10+ | 4 |

The algorithm must be isolated so it can change later.

## Heatmap

The main UI is a GitHub-style calendar where each cell represents one day.

## Basic statistics

Initial metrics:

- Total contributions
- Active days
- Current streak
- Longest streak
- Selected year
- Most active day

---

# 7. Important Product Principle

## Activity ≠ Productivity

The project measures **Figma activity**, not productivity.

For example:

```text
10 versions ≠ 10 hours of work
```

and:

```text
More activity ≠ Better designer
```

Avoid language that claims contribution counts represent design quality or productivity.

---

# 8. MVP Scope

### Included

- Next.js
- TypeScript
- Tailwind CSS
- Figma REST API
- Personal Access Token
- One Figma file
- Version-history sync
- Local JSON storage
- Contribution calculation
- Calendar generation
- Heatmap
- Basic statistics
- Year navigation
- Local development
- Public demo using non-sensitive demo data
- Open-source documentation

### Out of scope

Do **not** implement these during the MVP:

- User accounts
- Email/password authentication
- Google login
- SaaS backend
- Supabase
- Firebase
- PostgreSQL
- MongoDB
- Payments
- Subscriptions
- Figma OAuth
- Team dashboards
- Team leaderboards
- AI productivity scoring
- Design quality scoring
- Time tracking
- Screen tracking

These can be considered after the MVP.

**This scope is frozen for the MVP.** Adding to it requires updating this section first.

**Scope change (2026-10-06):** multiple files with an explicit list (§31 #10) moved into the MVP. Automatic discovery of team files is still out of scope.

---

# 9. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI primitives | shadcn/ui, optional |
| API | Figma REST API |
| Storage | JSON |
| Future storage | SQLite |
| Package manager | npm |
| Version control | Git + GitHub |
| Deployment | Vercel |

---

# 10. High-Level Architecture

```text
┌─────────────────────────────┐
│          Figma API          │
│       Version History       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Figma API Client      │
│ Authentication / Requests  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Sync Engine          │
│ Fetch / Normalize / Filter  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       Local Data Store      │
│   contributions.json        │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Contribution Engine       │
│ Counts / Levels / Streaks   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│        Next.js UI           │
│ Heatmap / Stats / Years     │
└─────────────────────────────┘
```

---

# 11. Data Flow

```text
Figma File
    ↓
Figma Version History API
    ↓
Raw Versions
    ↓
Version Normalization
    ↓
Activity Records
    ↓
Daily Aggregation
    ↓
Contribution Levels
    ↓
Contribution Dataset
    ↓
JSON Storage
    ↓
Next.js
    ↓
Calendar Grid
```

---

# 12. Repository Architecture

Planned structure:

```text
figma-contributions/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── contribution/
│   │   │   ├── ContributionGraph.tsx
│   │   │   ├── ContributionCell.tsx
│   │   │   ├── ContributionTooltip.tsx
│   │   │   ├── MonthLabels.tsx
│   │   │   └── ContributionLegend.tsx
│   │   ├── stats/
│   │   │   ├── StatCard.tsx
│   │   │   └── StatsGrid.tsx
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── figma/
│   │   │   ├── client.ts
│   │   │   ├── versions.ts
│   │   │   └── types.ts
│   │   ├── contributions/
│   │   │   ├── calculate.ts
│   │   │   ├── normalize.ts
│   │   │   └── types.ts
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── scripts/
│   └── sync.ts
├── data/
│   └── contributions.json
├── public/
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── tsconfig.json
```

This is the intended architecture. Files are created by the phase that needs them (§31 #9), so the real tree (`git ls-files`) is a subset of this plus tooling files (`next.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `package-lock.json`) and tests next to the code they cover (e.g. `src/lib/figma/versions.test.ts`).

---

# 13. Core Data Models

## Figma Version

```ts
type FigmaVersion = {
  id: string;
  created_at: string;
  label?: string | null;
  description?: string | null;
  user?: {
    id: string;
    handle: string;
    img_url?: string;
  };
};
```

## Activity

```ts
type Activity = {
  id: string;
  userId: string;
  fileKey: string;
  occurredAt: string;
  date: string;
  type: "version_created";
};
```

## Contribution Day

```ts
type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};
```

---

# 14. Contribution Dataset

Target structure:

```json
{
  "generatedAt": "2026-10-06T12:00:00.000Z",
  "fileKey": "example-file-key",
  "year": 2026,
  "days": [
    {
      "date": "2026-01-01",
      "count": 0,
      "level": 0
    },
    {
      "date": "2026-01-02",
      "count": 3,
      "level": 2
    }
  ]
}
```

The schema may be refined during implementation. **Superseded by §31 #4–#5:** no top-level `year`, and storage holds counts only (`{ "YYYY-MM-DD": count }`); levels are computed at read time.

---

# 15. Activity Filtering

The MVP begins with one configured Figma file.

Initial source:

```text
Selected Figma File
        ↓
Version History
        ↓
Activity
```

If reliable user identification is available, the implementation may filter to the configured user's activity.

Do not introduce unnecessary filtering complexity before the basic data pipeline works.

---

# 16. Date and Timezone Policy

Figma timestamps should be handled consistently.

MVP policy:

```text
Figma timestamp
      ↓
UTC
      ↓
Normalize to calendar date
      ↓
Aggregate
```

A future version may allow user-selected timezones.

---

# 17. Year Strategy

The application should support historical years without redesigning the data model.

Example:

```text
2024
2025
2026
```

The MVP may default to the current year.

---

# 18. Security Requirements

The Figma token is sensitive.

### Never commit

```text
.env.local
```

### `.gitignore`

At minimum:

```gitignore
.env.local
.env*.local
```

### Never expose the token publicly

Do not use:

```text
NEXT_PUBLIC_FIGMA_ACCESS_TOKEN
```

The token must remain in local/server-side tooling.

---

# 19. Public Deployment Rule

The public Vercel demo must never contain the developer's private Figma token.

Use:

```text
Demo data
```

for the public MVP.

A future hosted version can introduce secure server-side OAuth/authentication.

---

# 20. Error Handling Requirements

The eventual application must gracefully handle:

### Invalid token

```text
401 Unauthorized
```

### Invalid/inaccessible file

Display a useful configuration error.

### Rate limit

```text
429
```

Explain that the user should retry later.

### Empty history

Display:

```text
No Figma activity found.
```

Do not crash.

---

# 21. Performance Principle

Do not call the Figma API on every page render.

Expected workflow:

```text
npm run sync
      ↓
Figma API
      ↓
Local JSON
```

Then:

```text
npm run dev
      ↓
Local JSON
      ↓
UI
```

---

# 22. Sync Command Contract

The eventual command:

```bash
npm run sync
```

must:

1. Load environment variables.
2. Validate required configuration.
3. Call the Figma API.
4. Retrieve version history.
5. Normalize versions.
6. Aggregate activity by date.
7. Calculate contribution levels.
8. Write JSON.
9. Print a useful summary.

Expected style of output:

```text
Figma Contributions Sync

✓ Configuration loaded
✓ Figma file validated
✓ Version history fetched
✓ Activity processed
✓ Contributions generated

Total versions: 842
Active days: 173

Data written to:
data/contributions.json
```

---

# 23. Future Architecture

These are intentionally postponed.

## SQLite

```text
Figma API
    ↓
Sync
    ↓
SQLite
    ↓
Contribution Engine
```

## Multiple files

Partly moved into the MVP: an explicit file list is supported (§31 #10). What remains future work is discovering files automatically via `GET /v1/teams/:id/projects` (needs the `projects:read` scope; drafts aren't exposed).

```text
File A ─┐
File B ─┼→ Aggregation
File C ─┘
```

## Figma OAuth

Allow users to authorize the application without manually creating tokens.

## Hosted profiles

Potential future architecture:

```text
User
 ↓
OAuth
 ↓
Backend
 ↓
Database
 ↓
Public Profile
```

Only consider this after the local-first MVP is stable.

---

# 24. Architectural Decisions

| Decision | Choice | Reason |
|---|---|---|
| Architecture | Local-first | Privacy + simplicity |
| Framework | Next.js | Modern React framework |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | Fast UI development |
| API | Figma REST API | Official data source |
| Authentication | Personal Access Token | Simple MVP |
| Storage | JSON | No infrastructure |
| Database | None initially | Avoid unnecessary complexity |
| Files | One initially | Reduce scope |
| Deployment | Vercel | Simple hosting |
| Public data | Demo data | Prevent token exposure |

---

# 25. Architecture Principles

### Separation of concerns

Keep:

```text
API logic
```

separate from:

```text
Data processing
```

and:

```text
UI
```

### Server/local secrets only

Secrets never belong in client-side code.

### Data-first architecture

The UI should consume clean contribution data rather than raw Figma API responses.

### Replaceable storage

The contribution engine should not depend directly on JSON so that SQLite can be introduced later.

### Small modules

Avoid a single file containing API calls, processing, calculations, and UI.

---

# 26. Phase 1 Deliverables

By the end of Phase 1, we should have:

- Project specification
- Problem statement
- MVP scope
- Non-goals
- Architecture definition
- Data model definition
- Contribution algorithm
- Security model
- Repository architecture
- Future-scope notes
- Phase gate checklist

---

# 27. Phase 1 Tasks

## Task 1 — Confirm project name

Working name:

```text
Figma Contributions
```

Repository:

```text
figma-contributions
```

## Task 2 — Confirm architecture

```text
Next.js
+
TypeScript
+
Tailwind
+
Figma REST API
+
Local JSON
```

## Task 3 — Confirm MVP

```text
One Figma file
+
Personal Access Token
+
Version history
+
Daily aggregation
+
Heatmap
+
Basic statistics
```

## Task 4 — Confirm security model

```text
Token → local environment
Token → never committed
Token → never public
```

## Task 5 — Confirm contribution rules

```text
0       → Level 0
1–2     → Level 1
3–5     → Level 2
6–9     → Level 3
10+     → Level 4
```

## Task 6 — Confirm repository structure

Use the architecture defined in this document.

## Task 7 — Document future scope

Record future features without implementing them.

---

# 28. Phase 1 Completion Checklist

## Product

- [x] Problem statement approved
- [x] Project vision approved
- [x] Target users defined
- [x] MVP scope approved
- [x] Non-goals documented
- [x] Activity ≠ productivity principle documented

## Architecture

- [x] Local-first architecture approved
- [x] Figma REST API selected
- [x] Next.js selected
- [x] TypeScript selected
- [x] Tailwind selected
- [x] JSON selected for MVP
- [x] Vercel deployment strategy defined

## Data

- [x] FigmaVersion model defined
- [x] Activity model defined
- [x] ContributionDay model defined
- [x] Contribution JSON structure defined
- [x] Daily aggregation logic defined
- [x] Contribution intensity levels defined
- [x] Timezone policy defined

## Security

- [x] PAT strategy defined
- [x] `.env.local` strategy defined
- [x] `.gitignore` requirements defined
- [x] Public token exposure prohibited
- [x] Public demo-data strategy defined

## Repository

- [x] Repository name selected
- [x] Folder architecture defined
- [x] Sync script location defined
- [x] Figma client location defined
- [x] Contribution engine location defined
- [x] UI component structure defined

## Process

- [x] Phase 1 document completed
- [x] Architecture reviewed
- [x] MVP scope frozen
- [x] No Phase 2 implementation started prematurely

---

# 29. 🚨 Phase 1 Gate

**Do not start Phase 2 until this gate is passed.**

Phase 1 is complete only when:

```text
Product Definition
        +
Architecture
        +
Data Model
        +
Security Model
        +
Repository Structure
        +
MVP Scope
        ↓
     APPROVED
```

The next phase is:

> **Phase 2 — GitHub Repository & Next.js Foundation**

---

# 30. Definition of Done

Phase 1 is DONE when a developer can read this document and answer all of these without guessing:

1. What problem are we solving?
2. Who is this for?
3. What exactly is the MVP?
4. What is intentionally excluded?
5. How does data move through the system?
6. Where does Figma data come from?
7. How is activity converted into contributions?
8. Where is data stored?
9. How is the Figma token protected?
10. What does the repository structure look like?
11. What does `npm run sync` do?
12. What will be deployed publicly?
13. What features are postponed?
14. What must be completed before Phase 2?

If any answer is unclear:

> **Phase 1 is not finished.**

---

# Final Phase 1 Architecture

```text
                    ┌─────────────────┐
                    │    Figma API    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  Figma Client   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Sync Engine   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Normalize Data  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Contribution    │
                    │     Engine      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Local JSON Data │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    Next.js UI   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Figma Heatmap   │
                    └─────────────────┘
```

---

# PHASE 1 STATUS

**Status:** ✅ Complete (2026-10-06)

**Gate:** ✅ Passed. All §28 checklist items are complete.

**Implementation:** In progress. Phase 2 (Next.js foundation) ✅ · Phase 3 (configuration) ✅ · Phase 4 (Figma API client) ✅ (verified with a real token 2026-10-06) · Phase 5 (raw data processing) ✅ · Phase 6 (contribution engine) ✅ · Phase 7 (calendar engine) ✅ · Phase 8 (heatmap UI) ✅ · Phase 9 (statistics dashboard) ✅ · Phase 10 (year navigation) ✅ · Phase 11 (multi-file) ✅ · Phase 12 (project analytics) ✅ · Phase 13 (UX & visual polish) ✅ · Phase 14 (accessibility) ✅. See `roadmap.md` §17.

---

## Project-wide rule

> **One phase at a time.**
>
> Complete → Test → Verify → Document → Commit → Pass Gate → Start next phase.

**Never skip a phase.**

---

# 31. Phase 1 Decisions (resolved gaps)

These resolve gaps found while reviewing this document against `roadmap.md`. Where the two disagree, this section wins.

| # | Gap | Decision |
|---|---|---|
| 1 | Version history is paginated | `npm run sync` follows `pagination.next_page` until exhausted. Otherwise only the most recent page is counted. |
| 2 | Autosaves vs named versions | Every entry returned by `/versions` (autosave or named) counts as 1 activity. The README states this. |
| 3 | PAT scopes / expiry | Token needs the `file_versions:read` and `current_user:read` scopes. PATs expire (max 90 days); a 401/403 error message says to regenerate. |
| 4 | §14 `year` field vs §17 multi-year | No top-level `year`. Storage holds all dates across all years; the UI picks the year. |
| 5 | Where levels are computed (§10 vs §11) | **Storage holds counts only**: daily counts per file, `{ "files": [{ "key", "name", "days": { "YYYY-MM-DD": count } }] }` (was a single `{ date: count }` map until Phase 12, see #11). Levels, streaks and stats are computed at read time by `lib/contributions`, so thresholds can change without re-syncing and storage stays swappable for SQLite. |
| 6 | Real data in a public repo | `data/contributions.json` (real, from sync) is gitignored. A committed `data/demo.json` is the fallback the UI uses when no real data exists — that is what Vercel shows. |
| 7 | Loading `.env.local` in the sync script | Use Node's built-in `--env-file-if-exists=.env.local` flag (`package.json` `sync` script), so a missing file reaches the script's friendly "missing token" message instead of a Node crash. No `dotenv` dependency. |
| 8 | User filtering | Sync counts only versions whose `user.id` matches the token owner (`GET /v1/me`). Required once files are shared, so teammates' versions aren't counted. |
| 9 | Placeholder files | Files are created by the phase that needs them (roadmap §11: "Do not create every file immediately"). |
| 10 | One file vs many | `FIGMA_FILE_KEYS` is a comma-separated list of keys or file URLs; sync fetches each file in turn and merges the user's versions. `FIGMA_FILE_KEY` is still accepted. Auto-discovery is future scope (§23). |
| 11 | Project analytics needs per-file data (roadmap Phase 12) | `data/contributions.json` stores daily counts per file with its name; totals are summed at read time. File name: Figma's current name via `GET /v1/files/:key/meta` if the token has the optional `file_metadata:read` scope, else the pasted URL's slug, else the key. A pre-Phase-12 file shows an error asking to re-sync. |
