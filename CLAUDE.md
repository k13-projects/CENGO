# CENGO — Project Guide

Portfolio site for **CENGO**, a DJ/producer. Live at **https://cengo.party**.

This file orients any AI coding assistant (Claude in Cursor, Claude Code, etc.) working on the repo. Read it before making changes.

## Stack & how to run

- **Static site** — plain `index.html` + `style.css` + `script.js`. No framework, no build step, no `npm install`, no dependencies.
- **Run locally** with a tiny static server (so the data fetches behave — `file://` triggers CORS/referrer issues):
  ```bash
  python3 -m http.server 8000
  # then open http://localhost:8000
  ```
  Opening `index.html` directly works for layout/styling, but live data falls back to placeholders.

## Architecture

- **`index.html`** — all markup, one page, anchored sections: `#hero`, `#about`, `#youtube`, `#music`, `#events`, `#contact`.
- **`style.css`** — all styles. CSS custom properties in `:root` (colors, fonts, `--transition`). Responsive breakpoints at 1024 / 768 / 390px. Reveal-on-scroll via `.reveal` + `.visible`.
- **`script.js`** — vanilla JS, no modules. Notable parts:
  - **Events** load from a public **Google Sheet CSV** (`SHEET_CSV_URL`), with a hardcoded `FALLBACK_EVENTS` if the fetch fails.
  - **YouTube section** pulls live channel stats + latest uploads from the **YouTube Data API v3** (`fetchYouTube()`), splits regular videos vs **Shorts** by duration (`SHORT_MAX_SECONDS = 60`), and shows a fallback Subscribe card if anything fails.
  - Shared helpers: `sanitize()` (XSS-safe text), `formatCount()`, `timeAgo()`, `formatTime()`, and a global `revealObserver`.
  - Smooth anchor scrolling: any `a[href^="#"]` scrolls to its section (used by the hero buttons).

## API keys / secrets

- The **YouTube Data API key** is committed in `script.js`. This is intentional and safe: it's **referrer-restricted** to `cengo.party` and **API-restricted** to YouTube Data API v3 only, read-only, quota-capped. Worst case is the daily quota exhausts and the section shows its fallback.
- **Locally the key returns the fallback** (your `localhost`/`file://` origin isn't `cengo.party`). That's expected — don't "fix" it. To get live data on localhost, the key owner adds `localhost/*` to the referrer allow-list in Google Cloud.
- No `.env`, no other secrets.

## Deploy

- Hosted on **GitHub Pages**, served from the **`main`** branch root.
- **Merging to `main` publishes to cengo.party within ~1 minute.** Treat `main` as production.
- Always work on a branch and merge via PR (or fast-merge) — never experiment directly on `main`.

## Conventions

### Branch naming
`{project}_{mon}{dd}_v{N}` — lowercase 3-letter month, zero-padded day, version starting at 1.
Examples: `cengo_jun09_v1`, `cengo_jun09_v2` (second branch same day).

### Commit messages
- **Title:** one emoji + short, punchy summary.
- **Body:** clean grouped sections. Each group = a header emoji + **bold title** on its own line, then concise `•` bullets (no emoji on every bullet). Blank line between groups.
- After a `---` separator, a tight *italic* line of technical detail (files touched).
- Goal: airy and scannable, not a wall of text.

### Workflow shortcuts ("Hail Mary")
When the repo owner uses these shorthands:
- **`hm`** = new branch (per convention) + commit + push
- **`hm-1`** = commit + push only (stay on current branch, no new branch)
- **`hm+`** = `hm` + open a PR (leave it for review, don't merge)
- **`hm++`** = `hm` + open a PR + merge to `main` (full deploy)

`hm` / `hm+` / `hm++` always create a new branch; only `-1` variants skip that.

## Housekeeping

- Cloud sync (iCloud/Drive/Dropbox) occasionally drops duplicate files named like `favicon 2.svg`. These are byte-identical copies of existing files — just delete them. Note: legitimate names like `images/Set 1.jpeg` use a space-number too, so don't blanket-ignore the pattern.


---

<!--K13_BROADCAST_START · managed by War Room — do not hand-edit-->
## 📡 War Room Broadcasts (org-wide rules)
> Synced from the K13 War Room. Each entry is a house rule that applies to every K13 project. Managed automatically — edit the rule in the War Room, not here.

<!--bc:2026-06-26-reports-archive-and-qa-->
### 2026-06-26 · Reports: archive every version + pass two-agent Chrome QA before "done"
**Archive every report — never overwrite.** Each report is written to `docs/reports/<Project>_<Type>_<YYYY-MM-DD>.html` (e.g. `Miramar_Development-Report_2026-06-25.html`). Same-day re-run → append `_v2`, `_v3`. The dated file is **permanent** — if the site links a "latest", copy/symlink to it, but never delete or overwrite an older dated report. Filenames are client-facing, so they carry the project name + type + date and explain themselves in an email. Types: `Development-Report`, `Security-Audit`, `Legal-Compliance`.

**No report is "done" until it passes the two-agent Chrome QA gate.** One agent **builds** the report; a second **tests** it — opens it in Chrome, screenshots desktop + mobile like a real user, and runs the design-review checklist (spacing, hierarchy, AI-slop, palette match, motion + `prefers-reduced-motion`, broken assets/links, Gmail-safe base64). Loop: fail → fix → re-review, until **design approval**. Only on PASS does the report take its final archived name and ship. Record the approval in a sidecar `docs/reports/<same-name>.qa.json` (date, screenshots, verdict) so "design signed off" is provable. Applies to **all** reports — dev, security, legal.

<!--K13_BROADCAST_END-->
