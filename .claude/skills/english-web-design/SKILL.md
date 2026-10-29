---
name: english-web-design
description: >-
  Use for any design or content change to Andrii's English-teaching site: adding or editing a section
  ("add a testimonials section"), redesigning or restyling ("the hero feels cluttered", "make it look
  better"), building a new English-learning page or hub, "fix this" with a screenshot, or an
  aesthetic verdict ("childish", "too busy", "дитячо", "штучно"). The entry point that sets the order
  of work: pre-flight, the house visual system, staging instead of overwriting, verdicts turned into
  measurements, the claims and learning-page gates, read-only reviewers, and verification before
  anything is called done.
---

# English web design

This skill routes the work; the gates do the checking. Follow the order: each step exists
because skipping it once cost a round of rework.

## 0. Pre-flight (silent, no questions the files can answer)
1. Read `web/AGENTS.md`, `web/claims-ledger.json` and `web/known-issues.json`.
2. Run `npm test`. A red baseline is information: understand it before changing anything.
3. Classify the page: **portfolio** (claims gate) or **learning page** (`learning-page-gate`).
   A page can be both.

## 1. House visual system (reuse, don't invent)
- Tokens in `styles.css` `:root`: `--ink #162642`, `--paper #fbf7ea`, `--cream #f4ecd5`,
  `--blue #325e9f`, `--sky #bcdbe7`, `--gold #e6ae30`, `--green #557e4c`, `--red #bf4d36`,
  `--line #d9ca9c`. New rules use `var(--…)`, not new hex values.
- Type: Manrope for body and UI, Playfair Display for display accents (the italic *real*), DM Mono
  for eyebrows and labels. Webfonts load from Google Fonts. The runtime suite proves they rendered;
  do not assume.
- Van Gogh paintings (`starry-night`, `almond-blossom`, `wheat-cypresses`) are the decorative
  grounds. Any new ground needs a contrast check for the text on it.
- One stylesheet per feature (`growth-path.css`, `certificate-evidence.css`, …). A new one must be
  linked in `index.html` **and** added to the `build` script (the build test enforces this).
- `.reveal` sections fade in on scroll. Content hidden without JS is a registered defect
  (`no-js-hidden-reveal`); don't add more hidden-until-JS content.

## 2. Stage before replacing
A redesign of a live section goes into `index-review.html` (or a branch) first. The Codex CAE-hub
handoff left the live `prep.html` untouched and staged everything in `prep-review.html`; merge only
after review. Deleting files and changing published claims are owner decisions.

## 3. Visual feedback → a measured property → one rebuild
When feedback is a verdict and not an instruction:
1. Locate the element (say which one if two fit).
2. Measure the named zone with Playwright (`getBoundingClientRect`, computed styles): padding on all
   four sides of the widest line, stroke weight, size relative to the headline, contrast against
   neighbours, and the number of competing accents.
3. Say the number back in one line with one proposed change, and get a yes or no. Skip this only if
   the verdict already names the property ("too close to the border").
4. Rebuild once. Show the before and after numbers next to the render.

Change only the named zone; if the same defect exists elsewhere, say so instead of redesigning silently.

## 4. Gates
- Claims: every number, date, grade or credential goes through `claims-ledger` (P2).
- Learning pages: `learning-page-gate`.
- Everything: `site-verify` (`npm run verify`, then look at the 390 and 1280 renders).

## 5. Reviewers (read-only, can run in parallel)
Spawn them together, giving each the page and the question. They do not edit, so they cannot collide.
You remain the only writer.
- `web-design-reviewer`: first impression, hierarchy, consistency with section 1, and the
  accessibility review, returning a closure table.
- `claims-auditor`: claims versus the ledger and evidence files.
- `learning-page-examiner`: DELTA tutor and CAE examiner reads (learning pages only).
- `site-verifier`: runs the suites and reports evidence.

Treat their reports as inputs: spot-check one finding from each before acting on it.

When several agents must measure or classify the same way (contrast, counts, claims), give them the
same executable helper and one worked example with a known answer, never a prose description of
the method: five agents given one described query once produced three different counts for the
same phrase, which agreed often enough to look verified (owner skill
`delegate-a-fixture-not-a-method`). In this repo the fixtures are the test helpers
(`tests/lib/png.mjs` for contrast, `tests/lib/html.mjs` for page parsing) and the tests themselves.

## 6. Other models' work
A Codex completion or another session's "done, verified" is a draft until re-run
(`codex-handoff`). Render it yourself. Codex once shipped layout it could not open in a browser,
and the render showed a paragraph repeated four times plus badges duplicating job titles.

## 7. Close
Commit with explicit paths, after the repo-scope tripwire (owner skill `repo-scope-commit`):
`git rev-parse --show-toplevel` must be this repo, and `git diff --cached --name-only | wc -l` must
match the number of files you meant to change. If the count is far larger, stop and unstage. Report what changed, the gate results (counts, NOT RUN items), the
renders you looked at, and every owner decision still open. If Codex continues the work, write a
handoff (P6).
