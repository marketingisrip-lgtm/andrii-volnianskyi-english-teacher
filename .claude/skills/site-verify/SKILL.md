---
name: site-verify
description: >-
  Use after any change to the site (index.html, CSS, script.js, assets, the build or a learning page)
  and before saying it is done, fixed or ready; also whenever someone asks whether something broke or
  works, such as "check nothing broke", "is it ready", "did my edit break the animations" or "run the
  tests", or a report claims the site is fine. Runs the static, claims, lint and planted-defect
  suites plus the Playwright checks (four widths, short and zoomed screens, keyboard, targets,
  contrast, no-JS, reduced motion, fonts), requires looking at the renders, and says when a defect
  may be registered in web/known-issues.json instead of fixed.
---

# Site verify

A green suite proves that each check passed. It does not prove the page looks right. A screenshot
proves layout, not logic. Use both, and report which you used.

## Run it
```bash
npm test                        # static, claims, skill/agent lint, planted defects (~15 s)
npm run test:runtime            # Playwright: builds, serves dist/ over HTTP, writes test-results/ (~1 min)
npm run test:runtime-mutation   # plants 10 browser defects, each must turn its test red (~1 min)
```
Or all three with `npm run verify`. To rerun one browser test, filter by name:
`node --test --test-name-pattern="contrast" tests/runtime.test.mjs` (about 8 s). Runtime needs Playwright with Chromium. If it is missing the suite
**fails**: a browser check that could not run is not a pass. In a cloud session Playwright is
pre-installed; on a fresh Mac run `npm i -D playwright && npx playwright install chromium` in a
scratch folder or the repo.

## What each suite proves
| Suite | Proves | Does not prove |
|---|---|---|
| `tests/site.test.mjs` | Per root page: metadata, balanced tags, ids and anchors, headings, alt text, `rel` on new-tab links, local refs, British spelling, no repeated words. Across pages: the build ships every page and ref (except `*-review.html` staging copies) and nothing else; asset bytes match extensions; assets are referenced; 500 KB image budget; content visible without JS; ratchets for hard-coded colours, images without width/height and `<time>` without a machine-readable date; `aria-label` only on nameable elements and roles; decorative glyphs hidden, also inside link text; ARIA lists hold only list items; endless animations need a pause control; social and canonical meta; Cyrillic marked with `lang`; PDFs have a text layer and a real title; every certificate and PDF reviewed for personal data (`web/privacy-review.json`); no credentials; every register entry re-checked by some test | how anything looks |
| `tests/claims.test.mjs` | every number or credential word on the page has a ledger entry, entries are still on the page, evidence files exist, nothing is past `valid_until` unless marked stale; `datetime` values and `aria-label`/`title` numbers match the visible text | that a claim is true. The ledger records evidence status, not truth |
| `tests/agent-assets.test.mjs` | skills and subagents are valid for Claude Code and Codex; Codex's invocation policy mirrors Claude's `disable-model-invocation`; model-invoked descriptions say when to use the skill and user-invoked ones are one-line summaries; docs name only things that exist | that a skill is any good, or that the model reaches for it (that is `npm run eval:skills`) |
| `tests/mutation.test.mjs` | each static, claims and lint check fails on a planted defect, an allowed change (staging a review copy) stays green, and the clean copy passes | coverage of defects nobody planted |
| `tests/runtime-mutation.test.mjs` | each browser check fails on a planted defect (15: sideways scroll, console error, broken or never-rendering image, no script, no reduced-motion fallback, no focus ring, low contrast, stricter reveal threshold, percentage reveal margin, fail-closed reveal, invisible skip link, run-together labels, third-party script, 7 px label) | the same: only what was planted |
| `tests/runtime.test.mjs` | no console or page errors or failed local requests; no sideways scroll at 4 widths; every reveal and counter reaches its end state when scrolled into view; nav lands on visible text; keyboard reaches all controls with visible focus; WCAG 2.5.8 targets; text meets 1.4.3 contrast against the pixels rendered behind it, paintings included (390 and 1280 px, settled reduced-motion frame); body copy at least 14 px and no text under 10 px; every section reveals at 320x568, 568x320, 400% zoom and in a window as tall as the page; sections stay readable when script.js fails to load, throws or lacks IntersectionObserver; screen readers do not run neighbouring labels together (read from the accessibility tree); the skip link is visible when focused and Tab continues inside `<main>`; every rendered image loads when scrolled to; in-page navigation on phones; no unregistered third-party requests; reduced motion; no-JS state matches the register; fonts load | visual quality; contrast at other widths and at other frames of the drifting paintings |

## Then look
Open `test-results/screens/w390.png` and `w1280.png` at the changed area. One look is enough. If a
number can settle a doubt (padding, size, contrast, overlap), measure it instead of looking again:
take `getBoundingClientRect` or computed styles from Playwright. Never take a second look-and-guess
round when a measurement exists.

## Reading failures
- **New defect:** fix it. If the fix needs Andrii (deleting his file, recompressing his image,
  changing published wording, a layout change he has not approved), add an entry to
  `web/known-issues.json` with `check`, `target`, `finding`, `severity` and `suggested_fix`. The
  suite passes registered defects and **fails when a registered defect stops reproducing**, so delete
  the entry in the same commit as the fix.
- **Claims failure:** follow P2 in `web/PROCEDURES.md`. Never reword a claim just to turn the test
  green.
- **Mutation failure:** a check has gone blind. Fix the check before trusting any other result.
- **Registered is not clean.** A green run with registered defects means "no new defects", not "no
  defects". Say how many registered entries remain, and which are `major`, in every report.

## Lessons this gate encodes
- **Vacuous checks pass.** With no font faces loaded, `document.fonts.check()` returns `true`, so
  the font test requires faces with `status === "loaded"`. A child `node --test` that inherited
  `NODE_TEST_CONTEXT` ran zero tests, and every mutant "passed"; the harness now asserts that the
  child actually ran its tests. A guard that never fires manufactures confidence, so every guard needs
  a run on known-bad input.
- **Serve over HTTP.** `file://` pages behave differently (scripts, fonts, fetches), so the runtime
  suite serves `dist/` from a local server.
- **Test what ships.** The build copies an explicit file list. A new stylesheet missing from that
  list works locally and 404s in production, and the build test catches it.
- **Third-party requests are blocked in the layout tests** so results do not depend on the network.
  The font test is the one place they are allowed. When `fonts.googleapis.com` is unreachable it
  reports NOT RUN as a skip, never a pass.
- **Wait for conditions, not delays.** The first runtime sweep scrolled the page in fixed 120 ms
  steps with smooth scrolling on. Under CPU load (a reviewer agent ran it alongside other
  suites) it scrolled past a short section between frames and failed. Each section is now brought
  into view and the test waits for `is-visible`, which holds under load.
- **Measure the settled state.** A first nav-landing probe read the "Experience" label at -26 px
  and it was registered as a defect. Once the test waited for scrolling to stop and the reveal to
  finish, the label landed at +16 to +20 px. The register's "no longer reproduces" rule caught the
  false positive. Wait on a condition (`waitForFunction`), not a fixed delay.
- **A clean screenshot proves nothing about logic.** For counters, nav jumps and reveals, the suite
  reads DOM values.
- **Freeze nothing mid-entrance.** The first contrast probe paused animations right after load and
  froze the hero's delayed entrance at opacity 0, so "Contact me" read as 1.02:1. Under reduced
  motion every animation is finite, so the probe waits until `document.getAnimations()` are all
  finished, then measures.
- **A registered target must not mask a regression.** The short-screen reveal check first named only
  the section; a stricter threshold that broke the same sections at other sizes stayed green. The
  planted defect caught it, and the target now includes the viewport.
- **A loaded image is not a painted image.** With `loading="lazy"` the evidence shot showed a blank
  certificate until the test scrolled every image into view and waited for it; with
  `decoding="async"` a full-page capture still dropped images beyond the viewport at random, so the
  page does not use it. Capture twice and diff before trusting a render comparison.
- **Pixels cannot hear.** Renders identical to the pixel hid a screen-reader regression ("C2" and
  "2024–2026" read as one word); an independent review found it in the accessibility tree, and the
  runtime suite now reads that tree too.
- **No top-level `await` between tests.** With `--test-name-pattern`, node:test ran the `after()`
  hook early, deleted the build and left the browser open, which looked like a hang.

## Report
State the commands with their pass/fail/skip counts, anything NOT RUN and why, the screenshots you
looked at and what you checked in them, every new `known-issues` entry, and any remaining failure
with its error text. Not "verified", "tests pass" or "looks good" on their own.
