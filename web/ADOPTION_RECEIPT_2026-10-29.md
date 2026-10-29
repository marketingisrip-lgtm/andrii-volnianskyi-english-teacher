# Adoption receipt: English web design workflows (29 Oct 2026)

**Status: PARTIAL (reconstructed).** The import prompt named in the request could not be read from
this session. Every adopted workflow traces to a source listed below, and nothing was invented to
stand in for the missing file. All adopted assets load natively in Claude Code, a fresh session
reaches for the right skill in 23 of 23 routing evals, and every suite passes.

## Request
> Read and execute this import prompt:
> `/Users/andriyv/Documents/Codex/2026-09-03/ai-workflow-skills-cleanup/ENGLISH_WEB_DESIGN_HANDOFF_2026-10-27/CODEX_COMPLETION_2026-10-28/CLAUDE_IMPORT_PROMPT.md`
> Adopt the workflows into your own native skills, procedures and agent definitions. Run the
> specified tests and return an evidence-backed adoption receipt.

Then, when told the file was unreachable: "do on ur own".

## Sources
| Source | Read? | Identity |
|---|---|---|
| `CLAUDE_IMPORT_PROMPT.md` and the `CODEX_COMPLETION_2026-10-28` folder | **No** | Mac-only path. This cloud session had no Remote Control folder (`list_computer_folders`: none). Not in Google Drive or Gmail (searched by name and content). Not on GitHub (no repo pushed since 5 Oct 2026). Adding the related private repo `ai-control-plane` was refused by the session's permission check. |
| Owner skill library "Claude Code Skills (Shareable)" | Yes: 34 skills in 7 clusters, plus a completeness critic | Drive folder `1HoRkn44WEsqcggFp1nCAFp6iTPGTcLWL`, snapshot of 30 Aug 2026 (before the 3 Sep "skills cleanup") |
| Third-party skills repo the owner uploaded for review (`skills-main`, 30 Aug 2026), including `invocation.md` | Yes | Drive copy under `review-this-suggest-what-to-install`. Not the owner's own convention: used only for the description rules below. Its rule of omitting the Codex policy block was adopted, then reverted when its provenance was rechecked. |
| Codex → Claude handoff, CAE Prep hub audit (an English-learning web page) | Yes | Drive `1-0xXQbHr52JDfo2qqHewdkUBAg0PEW28`, `PREP_PAGE_REVIEW_AND_CLAUDE_HANDOFF_2026-08-25.md` |
| Codex → Claude handoff, Colobridge banner review (handoff structure, gate order) | Yes | Drive `1esgFMrM3jQ2LTi_QKNCVyTIoolVy-Qw8`, `CLAUDE_HANDOFF.md` (28 Aug 2026) |
| Dual-harness skill format | Yes | Drive `1lXwYHnig8RP9n6Hwr7aJg-ws8kl57r5u`, `codex-skill-metadata.md` |
| Repo convention for shared agent guides | Yes | branch `claude/lesson-docs-setup-j7mn43` @ `82fc731` (PR #3): `lessons/AGENTS.md`, `lessons/PROCEDURES.md` |
| Account-level skills (claude.ai sync) | Yes | manifest 29 Oct 2026 08:52 UTC: `celta-builder-dev-loop`, `cardigit-runtime-verify`, `llm-delegation`, `research-intake`, `agent-fleet-orchestration`, `autonomous-ops`, `account-check` |
| Claim and privacy evidence | Yes, read directly | CV PDF `c8a8599d…45b1` (both image-only pages rendered and read, the PTE card at full resolution) and all five certificate images, each pinned by sha256 in `web/privacy-review.json` |
| Codex skills documentation (`developers.openai.com`) | **No** | host outside this session's network allowlist; only a web-search summary was available |

## Mapping: source workflow → native asset → proof
| Source workflow | Native asset(s) | Proved by | Result |
|---|---|---|---|
| Pre-flight before building (`celta-brief-before-build`; "Read first" in both handoffs) | `english-web-design` §0 | procedure; `npm test` baseline step | adopted |
| Stage, don't overwrite (CAE hub: `prep-review.html`; `staged-release`) | `english-web-design` §2, `web/AGENTS.md` rule 6, P1; `web-release` "staged, not live" | planted change "allows: stage a redesign as index-review.html" | pass |
| Verdict → measured property (`design-verdict-to-spec`) | `english-web-design` §3, `web-design-reviewer` | headless reviewer run | see Behavioural runs |
| Design critique and behavioural accessibility review (`design-critique`, `accessibility-review`, `accessibility`) | `web-design-reviewer` agent; runtime checks for keyboard, WCAG 2.5.8 targets, 1.4.10 reflow at 320 px and on short or 400%-zoomed screens, reduced motion, skip link, 1.4.3 contrast pixel-sampled over the paintings, a 10 px text floor, mobile navigation; static checks for `aria-label` on generic elements, decorative glyphs, `<time>` values, endless motion (2.2.2), `lang` on Cyrillic | runtime suite; one planted defect per check (static and browser) | pass, with defects registered |
| Prove fonts rendered and control-run every guard (`visual-asset-preflight`, `check-the-check`, `prove-the-negative`) | runtime "declared web fonts actually load"; `tests/mutation.test.mjs` (33 planted defects); `tests/runtime-mutation.test.mjs` (10) | every planted defect turns its check red; the clean copy stays green | pass |
| Extend the guard, not the exception (`extend-the-guard-not-the-exception`) | register entries must be re-checked by a test; grouped targets fail when one stops reproducing; short-screen targets include the viewport | planted defects "register an issue no test re-checks", "fix one target of a grouped entry", "a stricter reveal threshold" | pass |
| Mechanical typo pass (`typo-checker`) | per-page "no repeated words or duplicated clauses"; Cyrillic look-alike letters caught by the `lang` check | planted "duplicated word", "Cyrillic look-alike letter" | pass |
| House spelling (an English-teacher site) | per-page "copy keeps to British spelling" | planted "American spelling" | pass |
| Token audit (`design-system`), quality floor (`frontend-design`), body-text floor (`google-cloud-design`) | ratchets for hex colours (154), images without size (17) and `<time>` without a date (9); runtime "body copy is at least 14px" | planted "hard-coded colour", "image without width and height", "date a machine cannot read" | pass (registered debt) |
| Claim provenance (`claim-provenance-ledger`, `quantitative-claim-audit`, `evidence-quality-checker`, `professional-identity-verified-only`, `research-intake`) | `claims-ledger` skill (status mapping, propagation sweep, metric names, graphics as claims), `web/claims-ledger.json`, `claims-auditor` agent | `tests/claims.test.mjs` (5), 3 planted defects, headless auditor run | pass |
| Personal data before publishing (`claim-provenance-ledger`, `secret-hygiene`) | `web/privacy-review.json`; checks that every certificate and PDF was reviewed (sha256), PDFs have a text layer and a real title, no credentials in the tree, `.env*` ignored | planted "new certificate nobody reviewed", "CV that is not a PDF", "access token" | pass |
| Learning pages (`learning-page-transfer-gate`, `exam-format-contract`, `contract-not-content`, the CAE hub DELTA/examiner reads) | `learning-page-gate` skill, `learning-page-examiner` agent, static checks on every root page | planted "page the build does not ship"; routing evals 3/3 + near miss | adopted; **not exercised on a real learning page** |
| Verification loops (`celta-builder-dev-loop`, `cardigit-runtime-verify`, `verification-discipline`) | `site-verify` skill, `site-verifier` agent, runtime suite served over HTTP | headless agent run, 3 times | pass |
| Release (`deploy-verify-loop`, `staged-release`, `autonomous-ops`, `account-check`) | `web-release` (user-invoked only): account check, preview, content hashes, headers after every publish, hard-refresh line | not run (owner-gated); routing evals confirm the model never reaches for it | adopted; **not exercised** |
| Accepting other models' work (`llm-delegation`, `chat-handoff`, the handoff structures) | `codex-handoff` skill (six-part message, what Codex cannot see), `handoff-verifier` agent, P4/P6 | routing evals 3/3 + near miss; no handoff file to verify | adopted; **not exercised on a handoff** |
| Fan-out with one method (`delegate-a-fixture-not-a-method`, `agent-fleet-orchestration`) | `english-web-design` §5: read-only reviewers in parallel, one writer, shared helpers as fixtures | design | adopted |
| Commit hygiene (`repo-scope-commit`) | `english-web-design` §7 tripwire; this session committed explicit paths only | procedure | adopted |
| Generated numbers (`derived-numbers-need-a-generator`) | `npm run receipt:numbers` produced the test table below | the table | pass |
| Dual-harness format (`codex-skill-metadata.md`) and description rules | `agents/openai.yaml` × 6 with `allow_implicit_invocation` mirroring `disable-model-invocation`, `.agents/skills` → `.claude/skills`, `AGENTS.md` → `CLAUDE.md`; model-invoked descriptions say when, the user-invoked one is a one-line summary | `tests/agent-assets.test.mjs` (20) and 4 planted defects | pass for Claude; **Codex unverified** |
| Routing (does a fresh session reach for the skill?) | `evals/triggers.json` per skill, `npm run eval:skills`, routing list in `CLAUDE.md` | 23 headless sessions | 23/23 (after one fix round, below) |

## Tests run in this session
Generated by `npm run receipt:numbers` at commit `3cee11d` (clean tree), 13:41 UTC. The commit
that records these numbers changes only this file.

| Suite | Tests | Pass | Fail | Skipped | Time |
|---|---|---|---|---|---|
| site (`tests/site.test.mjs`) | 26 | 26 | 0 | 0 | under 1 s |
| claims (`tests/claims.test.mjs`) | 5 | 5 | 0 | 0 | under 1 s |
| skill/agent lint (`tests/agent-assets.test.mjs`) | 20 | 20 | 0 | 0 | under 1 s |
| planted defects, static (`tests/mutation.test.mjs`): 33 caught, 1 allowed change green, clean copy green | 35 | 35 | 0 | 0 | 9 s |
| runtime (`tests/runtime.test.mjs`) | 17 | 17 | 0 | 0 | 57 s |
| planted defects, browser (`tests/runtime-mutation.test.mjs`) | 10 | 10 | 0 | 0 | 59 s |

From the same run's evidence: keyboard reached 17/17 controls with visible focus; contrast was
pixel-sampled for 199 text boxes at 390 px and 203 at 1280 px; DM Mono, Manrope and Playfair
Display loaded.

`npm run check:native-load` at the same commit: **pass**. Claude Code 2.1.312's init event lists
all 6 skills and all 5 agents; none missing.

`npm run eval:skills` (Sonnet, 23 fresh headless sessions, read-only tools): **23/23**. The first
run scored 13/22: `claims-ledger` never fired, and `site-verify` and `learning-page-gate` fired once
in three. Four descriptions were rewritten to put the triggers first, `CLAUDE.md` gained a routing
list, and the `learning-page-gate` set was redefined (building a page routes through
`english-web-design`, which calls the gate).

Corrections made during the session, each found by a check or a planted defect:
- A first nav-landing probe recorded the Experience label at −26 px. Measured after scrolling
  settled it lands at +16 to +20 px; the register's "no longer reproduces" rule flagged the false
  entry.
- The reveal sweep failed under CPU load (fixed delays plus smooth scrolling). Each section is now
  brought into view and the test waits for its end state.
- The first pixel-contrast probe froze the hero's delayed entrance at opacity 0 and read "Contact
  me" as 1.02:1. It now waits for every animation to finish under reduced motion.
- A stricter reveal threshold stayed green because registered sections masked failures at other
  sizes; targets now include the viewport.
- A top-level `await` between tests made node:test delete the build early under a name filter,
  which looked like a hang.

## Behavioural runs (fresh headless `claude`, isolated environment)
| Run | Model | Outcome | Cost |
|---|---|---|---|
| `--agent site-verifier`, runs 1–2 | Sonnet 5.5 | In the isolated environment, first Playwright and then Chromium could not be found (`NODE_PATH` and `PLAYWRIGHT_BROWSERS_PATH` were not passed). Both runs reported **NOT RUN**, claimed no pass, and flagged the evidence files as older than the run. | $0.07 + $0.05 |
| `--agent site-verifier`, run 3 (browser environment passed through) | Sonnet 5.5 | Ran both suites (55/55 static at that commit, 11/11 runtime), read the evidence and screenshots, and reported accurately | $0.05 |
| `--agent claims-auditor` | Sonnet 5.5 | Re-read every certificate and the CV and found 4 ledger gaps. All are folded in: the CEFR source, the CV-vs-certificate hours, past CELTA date wording, and alt-text coverage. | $0.23 |
| `--agent web-design-reviewer` | Opus 5.5 | 13-row measured closure table. Design **major**, accessibility **major**, consistency **minor**. It found the CPE badge at 2.39:1, the dates at 4.45:1 and the hero text over the painting (worst 1.76–2.41), and the reveal-test flake. All of these are now automated or registered. | $1.00 |
| Routing evals, two runs of 22 and 23 queries | Sonnet | 13/22, then 23/23 (above) | one short session per query |

## Findings for the owner (no site file was changed)
**Claims ledger, 52 entries:** 17 backed · 5 partial · 13 unbacked · 8 conflict · 6 stale · 3 plan.
- **Stale:** "CAE scheduled September 2026" (four places); PTE 84/90 shown as current (the
  report's validity ended 24 Aug 2026).
- **Conflict:**
  - "624 hours" / "552h C2". Certificates in the repo show 96 + 108 + 72 = 276 h, and the CV states
    184 + 72 = 256 h.
  - The C2 point's "Final grade A" (certificates show no grade; the CV says 97%).
  - The caption "General English C2 · Part 2" (that certificate says "Course 1").
  - "Before moving into English teaching, I built and led marketing": the page and the CV date the
    tutoring from 2017 and the marketing from 2018, both to now.
  - The Beinf card shows another company's logo ("coxit") under the Beinf name and alt text.
- **Unbacked:** 30 % sales growth, 280 % ROI (the owner's skill library records "+280% ROMI" on
  his own CVs: a different metric), "10+ person team", per-company dates, "60+ lessons", "CELTA
  140 hours".

**Known issues, 34** (10 major · 19 minor · 5 info). The major ones:
- The public PTE score report shows a photo, date of birth and candidate IDs.
- The CV is two pictures with no text layer, so screen readers, search and applicant-tracking
  systems read nothing; its PDF title is a working file name.
- Every content section is invisible without JavaScript, and on a phone held sideways the
  credentials section never appears (at 400% zoom the method and business sections too).
- Contrast: the CPE badge at 2.39:1; the hero eyebrow over the painting down to 1.76:1.
- Images: the portrait is 1.17 MB, and three certificate images are about 700 KB each.

The minor and info entries cover: contrast of the growth dates, plan years, nav links, the fourth
method card and the company-card tags; labels at 7–9 px; body copy under 14 px; no mobile
navigation; endless animations with no pause control; 17 images without size and 9 dates that are
not machine-readable; announced icon glyphs; the `aria-label` on a role-less `<div>`; no skip link;
154 hard-coded colours; the starry-night image weight; two Gryphon files that are not images and
three unreferenced logo files; missing social-preview meta; and Google Fonts as a third party. Each
has a suggested fix in `web/known-issues.json`.

**Design review (owner decisions, not tests):**
- On the curve, the CAE card (C1, Sep 2026) sits above both C2 cards.
- On mobile, the curve line disappears.
- The 7-column path gives 148 px cards with 9–11 px text.
- The CELTA "Teach" badge touches its circle.
- The hero portrait is a casual in-car photo.
- Chromium's default focus ring is faint on the navy hero.

**Other:**
- The certificates spell the surname "Volnyanskyi" / "Volnyanskii", while the site, CV and PTE
  report use "Volnianskyi".
- The Yappi certificate shows the issuer's handwritten signature and stamp (recorded as public in
  `web/privacy-review.json`; the owner's call).
- This repository is **public**, so `web/claims-ledger.json`, `web/privacy-review.json` and this
  receipt are readable by anyone. They name kinds of data, never the values.

## Unverified
- The workflows and "specified tests" of the original import prompt.
- Codex discovering `.agents/skills` and reading `agents/openai.yaml`: no credentials here, installing
  the Codex CLI was refused by the session's permission check, and the docs host was blocked.
- The Netlify deploy previews: Netlify built one for each pushed commit and its checks completed;
  `netlify.app` is outside this session's network allowlist, so no preview URL was probed.
- `web-release` (deploys are owner-gated), `codex-handoff` and `handoff-verifier` on a real handoff,
  and `learning-page-gate` and `learning-page-examiner` on a real learning page (none in this repo).
- Contrast at widths other than 390 and 1280 px, and at other frames of the drifting paintings;
  screen-reader behaviour.

## True remainder
1. **Make the Codex completion folder readable**, by adding `ai-workflow-skills-cleanup` as a Remote Control
   folder or pushing it to a private repo. Then run `handoff-verifier` on `CLAUDE_IMPORT_PROMPT.md`
   and adopt only the difference. The owner does the first step; a session does the rest.
2. **Owner decisions** on the stale and conflicting claims and on the known issues above.
   Each has a suggested fix in `web/known-issues.json` or a note in `web/claims-ledger.json`.
