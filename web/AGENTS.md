# Website — Agent Guide (Claude + Codex)

Scope: the English-teacher portfolio (`index.html`, its CSS, `script.js`, `assets/`) and any
English-learning web page added to this repo (lesson pages, exam-prep hubs). Codex reads this
file through `AGENTS.md`, and Claude reads it through `CLAUDE.md`. The same skills load in both
(`.claude/skills`, mirrored as `.agents/skills`).

## Hard rules
1. **Claims need evidence.** Every number, date, score, grade and credential on a page has an
   entry in `web/claims-ledger.json`, and its evidence file is in the repo. Never write a credential,
   hour count or result that the ledger cannot back. Stale or conflicting claims go to Andrii;
   agents never "fix" them by rewording.
2. **Prove it, don't declare it.** A change is done when `npm run verify` is green and the
   screenshots in `test-results/screens/` have been looked at. "Should work" is not a result.
3. **Owner-gated actions:** deleting files, changing published claims, recompressing his images and
   deploying. Register the defect in `web/known-issues.json` with a suggested fix instead.
4. **Another model's output is a draft.** A Codex completion, a subagent report or an earlier
   session's "verified" line is a claim to re-run, not a fact (`codex-handoff`).
5. **Serve over HTTP, never `file://`**, and test at 320, 390, 768 and 1280 px.
6. **Stage before you replace.** A redesign of a live page goes into a `*-review.html` copy or a
   branch first. The live file changes only after review.

## Layout
```
index.html, *.css, script.js   the portfolio (static, no framework)
assets/                         images, certificates, CV (all shipped by `npm run build`)
server/index.js                 Cloudflare Workers entry (serves the static assets)
web/claims-ledger.json          claim -> evidence -> status
web/known-issues.json           owner-gated defects the tests tolerate (and re-check)
web/PROCEDURES.md               P1–P6
tests/                          node:test suites (static, claims, lint, mutation, runtime)
scripts/check-native-load.mjs   proves Claude Code loads the skills and agents
.claude/skills, .claude/agents  native skills and subagents (Codex: .agents/skills)
```

## Commands
- `npm test`: static page checks, claims ledger, skill/agent lint, and the mutation suite (checks the checks)
- `npm run test:runtime`: Playwright at 320/390/768/1280, keyboard, targets, no-JS, fonts
- `npm run verify`: both of the above
- `npm run check:native-load`: a fresh `claude` must list every skill and agent
- `npm run build`: what Netlify publishes (`dist/`)

## Procedures
See `web/PROCEDURES.md`.

## Skills (this repo)
- `english-web-design`: the entry point for any page change, which routes to the gates below
- `site-verify`: the verification gate and how to read its evidence
- `claims-ledger`: adding or changing a claim, with its evidence and status
- `learning-page-gate`: English-learning pages (aims, transfer, exam-format honesty, links)
- `codex-handoff`: accepting a Codex completion, writing a handoff, and the adoption receipt
- `web-release`: owner-invoked deploy and live probe

## Subagents (this repo)
- `site-verifier`: runs the suites and reports evidence, without editing
- `claims-auditor`: audits every claim against the ledger and evidence files
- `web-design-reviewer`: design critique and accessibility review from renders, returning a closure table
- `learning-page-examiner`: DELTA-tutor and CAE-examiner read of a learning page
- `handoff-verifier`: re-runs every "verified" claim in a Codex handoff

## Account-level skills this guide relies on
`autonomous-ops` and `account-check` (before any deploy), `llm-delegation` (accepting other models'
work), `agent-fleet-orchestration` (parallel reviewers), `celta-builder-dev-loop` (single-file HTML
tools), and `celta-align` (CELTA content on learning pages).
