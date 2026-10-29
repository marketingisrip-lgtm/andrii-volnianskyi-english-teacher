# Adoption receipt: English web design workflows (29 Oct 2026)

**Status: PARTIAL (reconstructed).** The import prompt named in the request could not be read from
this session. Every adopted workflow traces to a source listed below, and nothing was invented to
stand in for the missing file. All adopted assets load natively in Claude Code, and their tests pass.

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
| Codex → Claude handoff, CAE Prep hub audit (an English-learning web page) | Yes | Drive `1-0xXQbHr52JDfo2qqHewdkUBAg0PEW28`, `PREP_PAGE_REVIEW_AND_CLAUDE_HANDOFF_2026-08-25.md` |
| Codex → Claude handoff, Colobridge banner review (handoff structure, gate order) | Yes | Drive `1esgFMrM3jQ2LTi_QKNCVyTIoolVy-Qw8`, `CLAUDE_HANDOFF.md` (28 Aug 2026) |
| Dual-harness skill format | Yes | Drive `1lXwYHnig8RP9n6Hwr7aJg-ws8kl57r5u`, `codex-skill-metadata.md` |
| Repo convention for shared agent guides | Yes | branch `claude/lesson-docs-setup-j7mn43` @ `82fc731` (PR #3): `lessons/AGENTS.md`, `lessons/PROCEDURES.md` |
| Account-level skills (claude.ai sync) | Yes | manifest 29 Oct 2026 08:52 UTC: `celta-builder-dev-loop`, `cardigit-runtime-verify`, `llm-delegation`, `research-intake`, `agent-fleet-orchestration`, `autonomous-ops`, `account-check` |
| Claim evidence | Yes, read directly | CV PDF `c8a8599d…45b1` (two image-only pages rendered and read), plus five certificate images (sha256 below) |
| Codex skills documentation (`developers.openai.com`) | **No** | host outside this session's network allowlist; only a web-search summary was available |

## Mapping: source workflow → native asset → proof
| Source workflow | Native asset(s) | Proved by | Result |
|---|---|---|---|
| Pre-flight before building (`celta-brief-before-build`; "Read first" in both handoffs) | `english-web-design` §0 | procedure; `npm test` baseline step | adopted |
| Stage, don't overwrite (CAE hub: `prep-review.html`) | `english-web-design` §2, `web/AGENTS.md` rule 6, P1 | mutant "allows: stage a redesign as index-review.html" | pass |
| Verdict → measured property (`design-verdict-to-spec`) | `english-web-design` §3, `web-design-reviewer` | headless reviewer run | see Behavioural runs |
| Design critique and behavioural accessibility review (`design-critique`, `accessibility-review`, `accessibility`) | `web-design-reviewer` agent; runtime checks for keyboard, WCAG 2.5.8 targets, 320 px reflow, reduced motion, skip link, 1.4.3 contrast on solid backgrounds; static check that `aria-label` sits only on nameable elements | `npm run test:runtime`, mutant "aria-label on a generic element", headless reviewer run | 13/13 |
| Prove fonts rendered and control-run every guard (`visual-asset-preflight`) | runtime "declared web fonts actually load"; `tests/mutation.test.mjs` | runtime + 18 mutants | pass |
| Mechanical typo pass (`typo-checker`) | per-page "no repeated words or duplicated clauses" | mutant "duplicated word" | pass |
| House spelling (an English-teacher site; spelling variants noted by the reader) | per-page "copy keeps to British spelling" | mutant "American spelling" | pass |
| Token audit (`design-system`), quality floor (`frontend-design`), body-text floor (`google-cloud-design`) | token ratchet (154 literals), runtime "body copy is at least 14px", `english-web-design` §1 | mutant "hard-coded colour"; runtime | pass (registered debt) |
| Claim provenance (`claim-provenance-ledger`, `quantitative-claim-audit`, `professional-identity-verified-only`, `research-intake` evidence tags) | `claims-ledger` skill, `web/claims-ledger.json`, `claims-auditor` agent | `tests/claims.test.mjs` (5), 3 mutants, headless auditor run | pass |
| Learning pages (`learning-page-transfer-gate`, `exam-format-contract`, the CAE hub DELTA/examiner reads) | `learning-page-gate` skill, `learning-page-examiner` agent, static checks on every root page | mutant "add a page the build does not ship" | adopted; **not exercised on a real learning page** |
| Verification loops (`celta-builder-dev-loop`, `cardigit-runtime-verify`) | `site-verify` skill, `site-verifier` agent, runtime suite served over HTTP | headless agent run, 3 times | pass |
| Accepting other models' work (`llm-delegation`, the handoff structures) | `codex-handoff` skill, `handoff-verifier` agent, P4/P6 | lint only; no handoff file available to verify | adopted; **not exercised** |
| Dual-harness format (`codex-skill-metadata.md`) | `agents/openai.yaml` × 6, `.agents/skills` → `.claude/skills`, `AGENTS.md` → `CLAUDE.md` | `tests/agent-assets.test.mjs` (20) | pass for Claude; **Codex unverified** |
| Deploy discipline (`autonomous-ops`, `account-check`) | `web-release` (user-invoked only) | not run (owner-gated) | adopted; **not exercised** |
| Fleet of reviewers (`agent-fleet-orchestration`) | `english-web-design` §5: read-only reviewers run in parallel, one writer | design | adopted |

## Tests run in this session
| Command | Result |
|---|---|
| `npm test` | **61 tests, 61 pass**: site 16 · claims 5 · skill/agent lint 20 · mutation 20 (18 planted defects caught, 1 allowed change stays green, clean copy passes) |
| `npm run test:runtime` | **13 tests, 13 pass**, twice more under concurrent CPU load: 4 widths with 0 px overflow, no console/page errors, nav landing, reduced motion, no-JS state as registered, keyboard 17/17 with visible focus, WCAG 2.5.8 spacing exception holds, skip link (registered), fonts loaded (DM Mono, Manrope, Playfair Display), body text (registered), solid-background contrast (3 registered; 49 text boxes over images counted, not judged) |
| `npm run check:native-load` | **pass**: Claude Code 2.1.312's init event lists all 6 skills and 5 agents, and none are missing |

The suite was corrected twice during the session. A first nav-landing probe recorded the Experience label at
−26 px and registered it as a defect. With a settled measurement the label lands at +16 to +20 px,
and the register's "no longer reproduces" rule flagged the false entry, which was then deleted. The
`web-design-reviewer` agent then reported that the reveal sweep failed under CPU load: fixed delays
plus smooth scrolling could pass a short section between frames. Each section is now brought into
view and the test waits for its end state, and it passed twice under deliberate load.

## Behavioural runs (fresh headless `claude`, isolated environment)
| Run | Model | Outcome | Cost |
|---|---|---|---|
| `--agent site-verifier`, runs 1–2 | Sonnet 5.5 | In the isolated environment, first Playwright and then Chromium could not be found (`NODE_PATH` and `PLAYWRIGHT_BROWSERS_PATH` were not passed). Both runs reported **NOT RUN**, claimed no pass, and flagged the evidence files as older than the run. | $0.07 + $0.05 |
| `--agent site-verifier`, run 3 (browser environment passed through) | Sonnet 5.5 | Ran both suites (55/55 static at that commit, 11/11 runtime), read the evidence and screenshots, and reported accurately | $0.05 |
| `--agent claims-auditor` | Sonnet 5.5 | Re-read every certificate and the CV and found 4 ledger gaps. All are folded in: the CEFR source, the CV-vs-certificate hours, past CELTA date wording, and alt-text coverage. | $0.23 |
| `--agent web-design-reviewer` | Opus 5.5 | 13-row measured closure table. Design **major**, accessibility **major**, consistency **minor**. It found the CPE badge at 2.39:1, the dates at 4.45:1 and the hero text over the painting (worst 1.76–2.41). It also found the reveal-test flake. All of these are now automated or registered; design-only items are listed below. | $1.00 |
| Skill routing: "add IELTS 8.0 to the hero" | Sonnet 5.5 | Invoked `claims-ledger` unprompted and answered by its rules (evidence first, `valid_until`, PII redaction) | $0.06 |

## Findings for the owner (no site content was changed)
- **Claims ledger, 50 entries:** backed 17 · partial 5 · unbacked 13 · conflict 6 · stale 6 · plan 3.
  - **Stale:** "CAE scheduled September 2026" (four places); PTE 84/90 shown as current (the report's validity ended 24 Aug 2026).
  - **Conflict:** "624 hours" / "552h C2". Certificates in the repo show 96 + 108 + 72 = 276 h, and the CV states 184 + 72 = 256 h. The C2 point's "Final grade A" (certificates show no grade; the CV says 97%). The caption "General English C2 · Part 2" (that certificate says "Course 1").
  - **Unbacked:** 30 % sales growth, 280 % ROI, "10+ person team", per-company dates, "60+ lessons", "CELTA 140 hours".
- **Known issues, 20** (8 major · 9 minor · 3 info):
  - The public PTE report image shows date of birth and candidate IDs.
  - Hero portrait 1.17 MB; three certificate images ~700 KB each at 5263 px wide.
  - Every content section is invisible without JavaScript.
  - Two "Gryphon" files are not images (an HTTP error body and a third-party web page).
  - No skip link; body copy at 11–13 px in five sections; 154 hard-coded colours.
  - Contrast: the CPE badge at 2.39:1; growth-path dates at 4.46:1; forward-plan years at 3.99:1; hero text over the painting down to 1.76:1.
  - The growth path's `aria-label` is on a role-less `<div>`.
- **Design review (owner decisions, not tests):**
  - On the curve, the CAE card (C1, Sep 2026) sits above both C2 cards.
  - On mobile, the curve line disappears and the nav links are hidden. Credentials are about 5 screens down and the footer contacts about 15.
  - The 7-column path gives 148 px cards with 9–11 px text.
  - The CELTA "Teach" badge touches its circle.
  - The hero portrait is a casual in-car photo.
  - Chromium's default focus ring is faint on the navy hero.
- The certificates spell the surname "Volnyanskyi" / "Volnyanskii", while the site, CV and PTE report use "Volnianskyi".
- This repository is **public**, so `web/claims-ledger.json` and this receipt are readable by anyone.

## Unverified
- The workflows and "specified tests" of the original import prompt.
- Codex discovering `.agents/skills` and reading `agents/openai.yaml`: no Codex CLI or credentials here, and the docs host was blocked.
- `web-release` (deploys are owner-gated), `codex-handoff` and `handoff-verifier` (no handoff file to check),
  and `learning-page-gate` and `learning-page-examiner` on a real learning page (none in this repo).
- Screen-reader behaviour, and text contrast over the painting backgrounds.

## True remainder
1. **Make the Codex completion folder readable**, by adding `ai-workflow-skills-cleanup` as a Remote Control
   folder or pushing it to a private repo. Then run `handoff-verifier` on `CLAUDE_IMPORT_PROMPT.md`
   and adopt only the difference. The owner does the first step; a session does the rest.
2. **Owner decisions** on the stale and conflicting claims and on the known issues above.
   Each has a suggested fix in `web/known-issues.json` or a note in `web/claims-ledger.json`.
