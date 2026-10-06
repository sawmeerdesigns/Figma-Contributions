# Figma Contributions

> An open-source, local-first GitHub-style contribution graph for Figma designers.

**Status:** Phases 1–4 complete · Next: Phase 5 (raw data processing)  
**Project type:** Open-source developer tool  
**Primary goal:** Let anyone clone the repository, connect their own Figma account/data locally, and generate a GitHub-style contribution heatmap from their Figma design activity.

---

## 1. Project Overview

Figma Contributions is an open-source project inspired by GitHub's contribution graph.

GitHub makes coding activity visible through a simple calendar heatmap. Designers do not have an equivalent, portable, open-source visualization for their Figma work.

This project aims to provide that visualization without initially becoming a SaaS product.

The intended experience is:

```text
Clone repository
      ↓
Configure Figma credentials
      ↓
Run local sync
      ↓
Fetch Figma activity/version history
      ↓
Process activity
      ↓
Generate contribution data
      ↓
Open local dashboard
      ↓
View Figma contribution heatmap
```

The first version is intentionally **local-first**.

There will be:

- No central user database
- No account system
- No payments
- No public profiles
- No SaaS subscription
- No requirement to send user activity to our servers

Each person runs their own instance.

---

# 2. Problem Statement

## 2.1 The broader problem

Designers spend a significant amount of time working in Figma, but their work activity is difficult to visualize over time.

A designer may work on:

- Product interfaces
- Design systems
- Wireframes
- Prototypes
- Client projects
- Personal projects
- Community work
- Presentations
- FigJam boards

Figma contains activity and version information, but there is no simple, portable, GitHub-style contribution visualization that a designer can clone and run themselves.

## 2.2 Existing behavior

Developers commonly have a GitHub contribution graph:

```text
Less                              More

□ □ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪
□ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪
□ □ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪ ▪
```

This creates an immediate visual representation of activity over time.

Designers generally rely on:

- Portfolio projects
- Figma file timestamps
- Version history
- Screenshots
- Case studies
- Manual activity claims

These do not provide the same compact longitudinal view.

## 2.3 The problem this project solves

> Create a transparent, open-source, self-hostable way to transform Figma activity into a GitHub-style contribution calendar.

---

# 3. Project Vision

The long-term vision is:

> **GitHub Contributions for Figma designers.**

However, this repository should not begin by trying to become a direct competitor to hosted products.

The initial goal is to create a technically clean open-source foundation that anyone can:

1. Clone
2. Configure
3. Run
4. Inspect
5. Modify
6. Self-host

The project should prioritize:

- Privacy
- Simplicity
- Transparency
- Developer experience
- Extensibility
- Good documentation

---

# 4. Project Principles

## 4.1 Local-first

User data should remain local wherever possible.

```text
Figma
  ↓
User's machine
  ↓
Processing
  ↓
Local data
  ↓
Local dashboard
```

## 4.2 Open source

The entire core system should be inspectable and modifiable.

## 4.3 No unnecessary infrastructure

Do not introduce:

- Supabase
- Redis
- Cloud databases
- Authentication systems
- Microservices

unless a future requirement actually justifies them.

## 4.4 API abstraction

The UI should not directly depend on Figma's API response structure.

Instead:

```text
Figma API
   ↓
Figma Adapter
   ↓
Normalized Activity Model
   ↓
Contribution Engine
   ↓
UI
```

## 4.5 Incremental development

Each phase must produce a working milestone.

**DO NOT START THE NEXT PHASE UNTIL THE CURRENT PHASE IS COMPLETED AND VERIFIED.**

This is a core project rule.

---

# 5. Critical Development Rule

## 🚨 PHASE GATE SYSTEM

> **DO NOT START PHASE 2 WITHOUT COMPLETING PHASE 1.**
>
> **DO NOT START PHASE 3 WITHOUT COMPLETING PHASE 2.**
>
> **DO NOT SKIP PHASES.**
>
> **DO NOT build future features before the current milestone works.**

Every phase must end with:

1. Implementation
2. Testing
3. Verification
4. Git commit
5. Updated documentation
6. Explicit phase completion

Only then should the next phase begin.

### Example

```text
PHASE 1
   ↓
Build
   ↓
Test
   ↓
Verify
   ↓
Commit
   ↓
PHASE 1 COMPLETE
   ↓
Start PHASE 2
```

If Phase 1 fails:

```text
Phase 1
   ↓
❌ Test failed
   ↓
Fix Phase 1
   ↓
Retest
   ↓
Only then continue
```

This rule exists to prevent the project from becoming a collection of half-finished features.

---

# 6. Target MVP

The first public MVP should support:

- Figma Personal Access Token
- Figma file key
- Figma version-history retrieval
- User activity filtering
- Activity aggregation by date
- Contribution intensity calculation
- Year calendar
- Heatmap visualization
- Hover information
- Basic statistics
- Local data storage
- Local development
- Public demo deployment with demo/static data

---

# 7. Explicitly Out of Scope for MVP

Do NOT build these during the initial MVP:

- Figma OAuth
- User registration
- Login
- User accounts
- Public designer profiles
- Rankings
- Social features
- Teams
- Collaboration features
- Payments
- Subscription system
- Central database
- Admin dashboard
- AI analysis
- Figma plugin
- Mobile application
- Browser extension

These may become future phases only after the core system is stable.

---

# 8. Recommended Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI primitives | shadcn/ui |
| Data visualization | Custom React components |
| External API | Figma REST API |
| Local data | JSON initially |
| Optional future storage | SQLite |
| Package manager | npm |
| Version control | Git |
| Repository | GitHub |
| Demo deployment | Vercel |

---

# 9. High-Level Architecture

```text
                         ┌─────────────────┐
                         │      FIGMA      │
                         │   REST API      │
                         └────────┬────────┘
                                  │
                           Personal Access
                               Token
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │    Figma API Client     │
                    │                         │
                    │ Authentication          │
                    │ Requests                │
                    │ Error handling           │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Sync Engine          │
                    │                         │
                    │ Fetch                   │
                    │ Filter                  │
                    │ Normalize               │
                    │ Aggregate               │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │     Local Data Layer     │
                    │                         │
                    │ contributions.json      │
                    │                         │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    Contribution Engine  │
                    │                         │
                    │ Daily counts            │
                    │ Intensity levels        │
                    │ Streaks                 │
                    │ Statistics              │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │       Next.js UI        │
                    │                         │
                    │ Heatmap                 │
                    │ Statistics              │
                    │ Tooltips                │
                    │ Year navigation         │
                    └─────────────────────────┘
```

---

# 10. Data Flow

The core data flow should be:

```text
Figma Version History
        ↓
Raw Figma Response
        ↓
Filter Relevant User
        ↓
Normalize Timestamp
        ↓
Group By Calendar Date
        ↓
Count Activity
        ↓
Calculate Contribution Level
        ↓
ContributionDay[]
        ↓
React Heatmap
```

The UI must not need to understand Figma's API response.

---

# 11. Repository Architecture

The target structure:

```text
figma-contributions/
│
├── src/
│   │
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
│   │   │
│   │   ├── stats/
│   │   │   ├── StatCard.tsx
│   │   │   └── StatsGrid.tsx
│   │   │
│   │   └── ui/
│   │
│   ├── lib/
│   │   ├── figma/
│   │   │   ├── client.ts
│   │   │   ├── versions.ts
│   │   │   └── types.ts
│   │   │
│   │   ├── contributions/
│   │   │   ├── calculate.ts
│   │   │   ├── normalize.ts
│   │   │   └── types.ts
│   │   │
│   │   └── utils.ts
│   │
│   └── types/
│       └── index.ts
│
├── scripts/
│   └── sync.ts
│
├── data/
│   └── contributions.json
│
├── public/
│
├── .env.example
├── .gitignore
├── README.md
├── package.json
└── tsconfig.json
```

Do not create every file immediately.

Build the architecture progressively.

---

# 12. Core Data Model

## Raw Figma Version

```typescript
type FigmaVersion = {
  id: string;
  created_at: string;
  label?: string;
  description?: string;
  user?: {
    id: string;
    handle: string;
    img_url?: string;
  };
};
```

## Normalized Activity

```typescript
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

```typescript
type ContributionDay = {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
};
```

---

# 13. Contribution Intensity

Initial algorithm:

```text
0 activity       → Level 0
1–2              → Level 1
3–5              → Level 2
6–9              → Level 3
10+              → Level 4
```

This is intentionally simple.

Do not attempt sophisticated statistical normalization until the basic visualization works.

---

# 14. Development Phases

# PHASE 1 — Project Definition & Architecture

## Goal

Create a clear technical specification before coding.

## Tasks

- Define problem
- Define MVP
- Define non-goals
- Define architecture
- Choose stack
- Define data model
- Define repository structure
- Define phase gates
- Create initial project documentation

## Deliverables

- `README.md`
- Architecture documentation
- Project roadmap
- Technology decisions
- Data model

## Completion criteria

You should be able to explain:

> What problem does this project solve?

> Who is it for?

> What happens when a user runs it?

> Where is the data stored?

> What does Figma provide?

> What does our application calculate?

> What is deliberately excluded?

### 🚨 Gate

Do not start Phase 2 until all Phase 1 questions are answered and the architecture is documented.

- [x] All questions answered and architecture documented in `docs/phase-1.md` (gate passed)

---

# PHASE 2 — GitHub Repository & Next.js Foundation

## Goal

Create a clean, runnable repository.

## Tasks

Create GitHub repository:

```text
figma-contributions
```

Initialize:

```bash
git init
```

Create Next.js:

```bash
npx create-next-app@latest .
```

Configure:

- TypeScript
- Tailwind
- ESLint
- App Router
- src directory

Run:

```bash
npm run dev
```

## Deliverables

```text
localhost:3000
```

should display the initial application.

Create:

```text
.env.example
.gitignore
README.md
```

## First commit

```bash
git add .
git commit -m "chore: initialize project"
git push
```

### Completion criteria

- [x] Repository exists
- [x] Application runs
- [x] Git history exists
- [x] No secrets committed
- [x] README exists

### 🚨 Gate

Do not start Phase 3 until the repository clones successfully and the application runs from a clean install.

---

# PHASE 3 — Environment & Figma Configuration

## Goal

Create secure local configuration.

## Tasks

Create:

```env
FIGMA_ACCESS_TOKEN=
FIGMA_FILE_KEY=
```

in `.env.example`.

Create `.env.local` locally.

Never commit `.env.local`.

## Deliverables

Configuration documentation explaining:

- Where to get the Figma token
- What scopes are needed
- Where to get the file key
- How environment variables work

### Completion criteria

- [x] Application can read configuration without exposing credentials to the client (only `scripts/sync.ts` reads `.env.local`, via `--env-file-if-exists`; `.env*.local` is gitignored)

### 🚨 Gate

Do not start Phase 4 until configuration is validated locally and no secret appears in Git.

---

# PHASE 4 — Figma API Client

## Goal

Successfully communicate with Figma.

## Tasks

Create:

```text
src/lib/figma/client.ts
```

Implement:

- Request helper
- Authorization header
- Error handling
- Response parsing

Create:

```text
src/lib/figma/versions.ts
```

Implement version-history retrieval.

Figma's REST API provides file version history through its version-history endpoints.

## First success condition

Run:

```bash
npm run sync
```

and see:

```text
Figma Contributions Sync

✓ Configuration loaded (file <FILE_KEY>)

Connecting to Figma and fetching version history...
✓ Authentication successful
✓ File found
✓ Version history fetched

Total versions: <n>
Oldest: <timestamp>
Newest: <timestamp>
```

### 🚨 Gate

Do not build the heatmap.

Do not build statistics.

Do not build UI analytics.

Until this phase can reliably retrieve real Figma data.

- [x] Client, paginated version retrieval and error handling built (`npm test` covers pagination, the token host check, and auth/404/429 errors)
- [x] `npm run sync` verified against a real Figma file with a real token (69 versions, 2026-10-06)

---

# PHASE 5 — Raw Data Processing

## Goal

Turn Figma API responses into application-owned data.

## Tasks

- Parse version history
- Identify relevant user activity
- Normalize timestamps
- Normalize dates
- Remove duplicates
- Handle missing users
- Handle malformed data

Output:

```text
data/
└── contributions.json
```

Example:

```json
{
  "2026-10-05": 7,
  "2026-10-06": 2
}
```

### Completion criteria

Running:

```bash
npm run sync
```

generates valid local data.

### 🚨 Gate

Do not start the UI until the data pipeline produces correct results.

---

# PHASE 6 — Contribution Engine

## Goal

Convert activity counts into meaningful contribution information.

## Tasks

Implement:

- Daily counts
- Intensity levels
- Total contributions
- Active days
- Current streak
- Longest streak
- Most active day

Create:

```text
src/lib/contributions/calculate.ts
```

### Completion criteria

Given test data:

```text
Monday: 0
Tuesday: 2
Wednesday: 5
Thursday: 10
```

the engine correctly returns:

```text
0 → Level 0
2 → Level 1
5 → Level 2
10 → Level 4
```

### 🚨 Gate

Do not start Phase 7 until the calculation engine passes test cases.

---

# PHASE 7 — Calendar Engine

## Goal

Generate a correct year calendar.

## Tasks

Handle:

- January 1
- December 31
- Leap years
- 52/53 weeks
- Week boundaries
- Sunday/Monday starting conventions
- Missing days
- Year transitions

Output should look conceptually like:

```text
Week 1   Week 2   Week 3
  │        │        │
  ▼        ▼        ▼

  □        ▪        □
  ▪        ▪        □
  □        ▪        ▪
  □        □        ▪
  ▪        □        □
  □        ▪        ▪
  □        □        □
```

### 🚨 Gate

Test at least:

- Normal year
- Leap year
- Year beginning on different weekdays

Do not proceed until calendar positioning is correct.

---

# PHASE 8 — Heatmap UI

## Goal

Create the main visual experience.

## Components

```text
ContributionGraph
├── MonthLabels
├── ContributionCell
├── ContributionTooltip
└── ContributionLegend
```

## Requirements

- 365/366 days
- 7 rows
- Responsive behavior
- Hover states
- Keyboard accessibility
- Empty state
- Legend

Example:

```text
Less

□ ▪ ▪ ▪ ▪

More
```

### 🚨 Gate

Do not start statistics until the heatmap correctly represents test data.

---

# PHASE 9 — Statistics Dashboard

## Goal

Add useful summary information.

Display:

```text
284
Contributions

83
Active days

14
Current streak

32
Longest streak
```

Also:

```text
Most active day
October 5, 2026

Most active month
October
```

### 🚨 Gate

Do not start multi-file support until statistics match the underlying data.

---

# PHASE 10 — Year Navigation

## Goal

Allow users to inspect different years.

Example:

```text
2024    2025    [2026]    2027
```

The application should load the corresponding contribution data.

### 🚨 Gate

Test:

- Empty year
- Current year
- Previous year
- Leap year

---

# PHASE 11 — Multi-File Support

## Goal

Allow users to combine activity from multiple Figma files.

Configuration could eventually be:

```json
{
  "files": [
    {
      "key": "abc",
      "name": "Portfolio"
    },
    {
      "key": "xyz",
      "name": "HRMS"
    }
  ]
}
```

Pipeline:

```text
File A ──┐
File B ──┼──→ Aggregate ──→ Heatmap
File C ──┘
```

### 🚨 Gate

Do not start project analytics until multiple files aggregate correctly without duplicate counting.

---

# PHASE 12 — Project Analytics

Add:

```text
Most active projects

Swift Pay HRMS       124
Portfolio             63
Club Connect          41
Travelverse            27
```

Eventually users could inspect project-specific activity.

---

# PHASE 13 — UX & Visual Polish

Focus on:

- Dark theme
- Typography
- Spacing
- Hover states
- Empty states
- Loading states
- Error states
- Responsive behavior
- Micro-interactions

Suggested starting palette:

```text
Background
#020617

Surface
#0F1728

Brand
#6D57E8

Primary text
#F1F5F9

Secondary text
#94A3B8
```

Do not blindly copy GitHub's visual design.

Create a distinct Figma-oriented identity.

---

# PHASE 14 — Accessibility

Test:

- Keyboard navigation
- Focus states
- Screen readers
- Color contrast
- Tooltip accessibility
- Reduced motion
- Mobile usability

Every contribution cell should have meaningful accessible information.

Example:

```text
October 5, 2026 — 7 contributions
```

---

# PHASE 15 — Testing & Reliability

Test the data pipeline.

## API

- Valid token
- Invalid token
- Expired token
- Invalid file
- Empty history
- API errors
- Rate limiting

## Data

- Duplicate versions
- Multiple versions on one day
- Different years
- Leap years
- Time zones
- Year boundaries

## UI

- Empty data
- Heavy activity
- Long years
- Mobile
- Tablet
- Desktop

---

# PHASE 16 — Sync Optimization

The first sync can retrieve the required history.

Later syncs should avoid unnecessary API requests.

Conceptually:

```text
First sync

Figma
 ↓
Fetch
 ↓
Save


Later sync

Figma
 ↓
Check existing data
 ↓
Fetch required changes
 ↓
Merge
 ↓
Save
```

The implementation must respect Figma API rate limits.

---

# PHASE 17 — Documentation

The README should explain:

1. What the project is
2. Why it exists
3. Screenshots
4. Features
5. Architecture
6. Requirements
7. Installation
8. Configuration
9. Figma token setup
10. File key setup
11. Syncing
12. Development
13. Troubleshooting
14. Privacy
15. Contributing
16. License

---

# PHASE 18 — Open Source Readiness

Add:

```text
LICENSE
CONTRIBUTING.md
CODE_OF_CONDUCT.md
SECURITY.md
CHANGELOG.md
```

Document:

- Branch conventions
- Commit conventions
- Pull request process
- Local development
- Testing
- Feature proposals

---

# PHASE 19 — Public Demo

Deploy the UI to Vercel.

Important:

**Never put your personal Figma token in the public deployment.**

The public deployment should use demo/static data.

```text
Vercel
  ↓
Demo dataset
  ↓
Heatmap
```

The local clone uses:

```text
User's machine
  ↓
User's Figma token
  ↓
User's Figma data
```

This keeps the project privacy-friendly.

---

# PHASE 20 — Version 1.0 Release

Before releasing:

```text
✓ Clean install works
✓ Environment setup works
✓ Figma API works
✓ Sync works
✓ Data processing works
✓ Heatmap works
✓ Statistics work
✓ Year navigation works
✓ Error handling works
✓ Documentation works
✓ Secrets are excluded
✓ Tests pass
✓ Demo works
```

Then:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Create a GitHub Release.

---

# 15. Final Architecture

The final MVP architecture should remain simple:

```text
                         ┌─────────────────────┐
                         │       FIGMA         │
                         │                     │
                         │ REST API            │
                         │ Version History     │
                         └──────────┬──────────┘
                                    │
                            Personal Access
                                Token
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Figma Client     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     Sync Engine     │
                         │                     │
                         │ Fetch               │
                         │ Filter              │
                         │ Normalize           │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    Local Data       │
                         │                     │
                         │ JSON / SQLite       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Contribution Engine │
                         │                     │
                         │ Counts              │
                         │ Levels              │
                         │ Streaks             │
                         │ Statistics          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      Next.js        │
                         │                     │
                         │ Heatmap             │
                         │ Stats               │
                         │ Filters             │
                         │ Year Navigation    │
                         └──────────┬──────────┘
                                    │
                         ┌──────────┴──────────┐
                         ▼                     ▼
                    localhost               Vercel
                    Personal                Demo
```

---

# 16. Development Philosophy

This project should be developed **vertically**, not horizontally.

### Bad approach

```text
Build API
Build half UI
Build database
Build OAuth
Build analytics
Build plugin
Build deployment
...
Nothing actually works.
```

### Good approach

```text
Phase 1
Architecture ✓

Phase 2
App runs ✓

Phase 3
Configuration ✓

Phase 4
Figma API works ✓

Phase 5
Data works ✓

Phase 6
Calculations work ✓

Phase 7
Calendar works ✓

Phase 8
Heatmap works ✓

Phase 9
Statistics work ✓

...
```

Every phase produces something usable.

---

# 17. Master Phase Checklist

```text
[x] PHASE 1 — Project Definition & Architecture
[x] PHASE 2 — GitHub Repository & Next.js
[x] PHASE 3 — Environment & Figma Configuration
[x] PHASE 4 — Figma API Client
[ ] PHASE 5 — Raw Data Processing
[ ] PHASE 6 — Contribution Engine
[ ] PHASE 7 — Calendar Engine
[ ] PHASE 8 — Heatmap UI
[ ] PHASE 9 — Statistics Dashboard
[ ] PHASE 10 — Year Navigation
[ ] PHASE 11 — Multi-File Support
[ ] PHASE 12 — Project Analytics
[ ] PHASE 13 — UX & Visual Polish
[ ] PHASE 14 — Accessibility
[ ] PHASE 15 — Testing & Reliability
[ ] PHASE 16 — Sync Optimization
[ ] PHASE 17 — Documentation
[ ] PHASE 18 — Open Source Readiness
[ ] PHASE 19 — Public Demo
[ ] PHASE 20 — Version 1.0 Release
```

---

# 18. Definition of Done

A phase is **NOT complete** because the code was written.

A phase is complete only when:

```text
Implementation
     ↓
Testing
     ↓
Expected result confirmed
     ↓
Edge cases checked
     ↓
Documentation updated
     ↓
Git commit created
     ↓
Phase marked COMPLETE
```

### Absolute rule

> **Never start the next phase while the current phase is incomplete.**

If a phase exposes a problem in an earlier phase, return to the earlier phase, fix it, test it again, and only then continue.

---

# 19. Long-Term Ideas

These are deliberately postponed.

Possible future versions:

### v2

- Multiple Figma files
- Better project analytics
- More detailed activity types
- Local SQLite database

### v3

- Figma OAuth
- Easier setup
- Automatic synchronization

### v4

- Public designer profiles
- Shareable contribution graphs
- Embeddable portfolio widget

### v5

- Figma plugin
- Design activity insights
- Design-system activity
- Personal design analytics

These should **not influence the MVP architecture prematurely**.

---

# 20. Final Project Goal

The project should eventually allow someone to say:

> "I want to see my Figma activity like GitHub contributions."

Then they should be able to:

```bash
git clone <repo>

cd figma-contributions

npm install

cp .env.example .env.local

# Add Figma credentials

npm run sync

npm run dev
```

and immediately get:

```text
                 MY FIGMA ACTIVITY

       2026

     Jan   Feb   Mar   Apr   May   Jun   Jul   Aug   Sep   Oct

Mon  ▢ ▪   ▪ ▢   ▪ ▪   ▢ ▪   ▪ ▢   ▢ ▪   ▪ ▪   ▢ ▪   ▪ ▢   ▪
Tue  ▪ ▪   ▢ ▪   ▪ ▢   ▪ ▪   ▢ ▢   ▪ ▪   ▢ ▪   ▪ ▢   ▪ ▪   ▢
Wed  ▢ ▪   ▪ ▪   ▢ ▪   ▪ ▢   ▪ ▪   ▢ ▪   ▪ ▢   ▪ ▪   ▢ ▪   ▪
Thu  ▪ ▢   ▪ ▪   ▪ ▢   ▢ ▪   ▪ ▢   ▪ ▢   ▪ ▪   ▢ ▪   ▪ ▢   ▪
Fri  ▢ ▪   ▢ ▢   ▪ ▪   ▪ ▢   ▢ ▪   ▪ ▪   ▢ ▪   ▪ ▢   ▪ ▪   ▢

Less  □  ▪  ▪  ▪  ▪  More

284 contributions
83 active days
14 day current streak
```

**That is the core product.**

Everything else should be built only after this foundation is working correctly.
