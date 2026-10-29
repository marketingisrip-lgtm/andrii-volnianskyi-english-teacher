---
name: site-verify
description: >-
  Verification gate for this website. Use it after any change to index.html, CSS, script.js, assets/,
  the build script or a learning page, and before saying a page change is done, fixed or ready. Runs
  the static, claims, lint and mutation suites plus the Playwright runtime checks (320/390/768/1280,
  keyboard, targets, no-JS, reduced motion, fonts), then requires looking at the screenshots. Explains
  how to read failures, when a defect may be registered in web/known-issues.json instead of fixed, and
  what a report must contain. Invoke on "verify", "does it work", "check the site", "run the tests", or
  when a report (yours, Codex's or another session's) claims the site is fine.
---

# Site verify

A green suite proves that each check passed. It does not prove the page looks right. A screenshot
proves layout, not logic. Use both, and report which you used.

## Run it
```bash
npm test                 # static, claims, skill/agent lint, mutation (checks the checks)
npm run test:runtime     # Playwright: builds, serves dist/ over HTTP, writes test-results/
```
Or both at once with `npm run verify`. Runtime needs Playwright with Chromium. If it is missing the suite
**fails**: a browser check that could not run is not a pass. In a cloud session Playwright is
pre-installed; on a fresh Mac run `npm i -D playwright && npx playwright install chromium` in a
scratch folder or the repo.

## What each suite proves
| Suite | Proves | Does not prove |
|---|---|---|
| `tests/site.test.mjs` | Per root page: metadata, balanced tags, ids and anchors, headings, alt text, `rel` on new-tab links, local refs, British spelling, no repeated words. Across pages: the build ships every page and ref (except `*-review.html` staging copies); asset bytes match extensions; assets are referenced; 500 KB image budget; content visible without JS; hard-coded colours never grow (token ratchet); `aria-label` only on nameable elements | how anything looks |
| `tests/claims.test.mjs` | every number or credential word on the page has a ledger entry, entries are still on the page, evidence files exist, nothing is past `valid_until` unless marked stale | that a claim is true. The ledger records evidence status, not truth |
| `tests/agent-assets.test.mjs` | skills and subagents are valid for Claude Code and Codex; docs name only things that exist | that a skill is any good |
| `tests/mutation.test.mjs` | each static check fails on a planted defect, and the clean copy passes | coverage of defects nobody planted |
| `tests/runtime.test.mjs` | no console or page errors or failed local requests; no sideways scroll at 4 widths; every reveal and counter reaches its end state when scrolled into view; nav lands on visible text; keyboard reaches all controls with visible focus; WCAG 2.5.8 targets; text meets 1.4.3 contrast against the pixels rendered behind it, paintings included (390 and 1280 px, settled reduced-motion frame); body copy at least 14 px; reduced motion; no-JS state matches the register; fonts load | visual quality; contrast at other widths and at other frames of the drifting paintings |

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

## Report
State the commands with their pass/fail/skip counts, anything NOT RUN and why, the screenshots you
looked at and what you checked in them, every new `known-issues` entry, and any remaining failure
with its error text. Not "verified", "tests pass" or "looks good" on their own.
