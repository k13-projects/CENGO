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

<!--bc:2026-06-26-imagegen-global-->
### 2026-06-26 · Image generation — free, via /imagegen (Gemini Nano Banana) + central pool
**Need an image? Generate it free with `/imagegen`.** Run `/imagegen <subject, style, aspect>` (or read `/Users/k13/Desktop/PROJECTS/K13-WarRoom/starter-kit/IMAGEGEN.md` and follow it). Engine: GStack Browser → Google Gemini (Nano Banana), free / no credits; fallback Bing Image Creator. The agent never types your password — it asks you to log in if prompted.

**Central pool, zero duplicates.** Every generated image lands first in the shared pool `/Users/k13/Desktop/PROJECTS/generatedAssets/` with a raw name (`gen_<proj>_<topic>_<n>.png`) and is **never committed**. On your approval the used image is **moved** (not copied) into this project's correct folder with a proper name; unused variants stay in the pool. Only the final relocated, renamed asset enters the repo — under this project's own git rules (branch → PR → merge).

<!--bc:2026-06-29-agent-agency-org-->
### 2026-08-13 · Team K13: named departments, the handoff contract & the autonomy contract
**K13 runs as team K13 — a controlled delivery pipeline, not a swarm.** Each AI specialist owns one repeatable stage, emits a predictable artifact, and hands off cleanly to the next. The **main Claude session is the GM (James)** — the only layer that sequences work (the hierarchy is flat: subagents don't spawn subagents, so agents never hand off to each other directly). **Jessica** runs Kazim's desk.

- **Roster + status legend:** `starter-kit/ORG.md` (War Room). Lean 7 to build first: Selma (`solutions-architect`) → Valentina (`brand-dna-designer`) → Natalia (`frontend-engineer`) → Olga (`qa-test-engineer`) → Irina (`security-auditor`) → Kate (`release-engineer`) → Gabi (`report-writer`). Human names are display labels; the functional `name:` is the routing key.
- **Handoff contract + Definition of Done:** `starter-kit/AGENT_HANDOFF_PROTOCOL.md`. Every delivery agent ends with the handoff block (Status / Summary / Files / Risks / Next / Human gate) and writes its artifact to `docs/handoffs/<stage>_<YYYY-MM-DD>.md` (same-day re-run → `_v2`, never overwrite).
- **Delegation is not optional.** James does not do a pipeline stage's work himself and call it done — every stage gets its named agent actually invoked (Task tool, `subagent_type` matching the agent file), even on a small project. **No artifact = the work never happened**: the War Room Org tab reads only `docs/handoffs/`, so skipping the artifact makes team K13 invisible on the board.
- **Autonomy contract — don't drip questions at Kazim.** Agents proceed by default. Only `Human gate` items come back to him: irreversible/destructive steps, money, real scope changes, anything that leaves for a client. Every other decision gets made, then **recorded in the handoff** instead of asked. Questions that genuinely survive are batched at the end of a run — never one at a time.
- **Parallel work:** sequential by default; James may fan out several agents **concurrently for independent work** (QA dimensions, security + a11y, research) and relay findings between them — each still writes its own handoff.
- **Agent vs skill:** token-heavy + isolatable → agent; in-context checklist/workflow → skill (compliance-checklist, media-generation).

<!--bc:2026-08-25-fitcheck-house-word-->
### 2026-08-25 · fitcheck: run the responsive-readiness pass after any layout, breakpoint or nav change
**Run `fitcheck` after any layout, breakpoint or nav change** — those are exactly the edits that regress one screen size while fixing another. `fitcheck` (alias `fit`) is the K13 responsive-readiness house pass: nine viewports (320 → 1920, including the two landscape sizes everyone forgets), a shared measurement harness with a trust gate, and the bug classes that only appear at one size — horizontal leaks, tap targets under the WCAG 2.5.8 AA floor, panels that are invisible but still in the tab order, scroll containers that strand their own header, and heroes that exactly fill a short viewport so nothing signals the page continues. It measures, looks, fixes at the source, and re-measures. It is also part of the P5 "done" checklist (`starter-kit/CONVENTIONS.md`). Skill: `~/.claude/skills/fitcheck/SKILL.md`.

<!--bc:2026-08-28-cc-commit-check-->
### 2026-08-28 · CC? — the pre-close commit check
**Ask `CC?` before closing a tab.** It means: "is anything lost if I close right now?" The session audits itself, read-only, and answers in one of two shapes: `✅ CC: safe to close` (one line of why), or `⚠️ CC: save these first` listing each unsaved item with a proposed save action, then waits for your pick. The sweep, in order: (1) git — uncommitted session work, unpushed commits, feature branches without a PR, open unmerged PRs (a repo's own known auto-refresh churn is excluded, not every dirty tree); (2) unwritten rules — corrections, decisions, or coined commands from the conversation not yet in this repo's `CLAUDE.md`/`Lessons.md`/memory; (3) deferrals not parked in a tracking ledger if this repo has one; (4) deliverables stranded in scratchpad/temp or outside any repo; (5) end of a working day — offer a journal/changelog entry if this repo keeps one, never auto-write it. `CC?` itself never saves anything — saving only happens after you choose.

<!--K13_BROADCAST_END-->
