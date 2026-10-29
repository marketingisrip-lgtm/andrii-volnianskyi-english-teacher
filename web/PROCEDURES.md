# Website procedures

Each procedure ends with evidence: command output, a screenshot looked at, or a ledger diff.
"Done" without one of these is not done.

## P1 — Change the portfolio page
1. Run `npm test` before editing. If it is red, find out why before adding changes on top.
2. Work on a branch. For a redesign of a live section, stage it as `index-review.html` first.
3. Edit. If you add a stylesheet or script, add it to the `build` script in `package.json`; the
   build test fails otherwise.
4. A new or changed number, date, grade or credential goes through P2 before it ships.
5. Run `npm run verify`. Open `test-results/screens/w390.png` and `w1280.png` and look at the
   changed area, because a passing suite says nothing about whether it looks right.
6. For visible design changes, run the `web-design-reviewer` subagent. Fix every blocker and
   major it reports, or register them in `web/known-issues.json` with the reason.
7. Commit with explicit paths. The PR states the test counts and what you looked at.

## P2 — Add or change a claim
1. Find the evidence: a certificate, score report, the CV or an employer document. Public evidence
   goes under `assets/`. Redact date of birth and candidate/registration IDs before publishing.
2. Add or update the entry in `web/claims-ledger.json`: `text` exactly as it appears on the
   page, then `status`, `evidence` (`file` plus what it `says`), and `valid_until` for anything with
   an expiry date (score validity, "scheduled", "this year").
3. Run `npm test`. The claims suite fails on any number or credential word without an entry.
4. A `conflict`, `stale` or `unbacked` entry goes to Andrii with the evidence. Do not reword a
   claim to make it pass.

## P3 — New English-learning page or hub
1. Aims first: the page states what the learner can do by the end (`celta-aims-first`).
2. Build to `learning-page-gate`: a small core set, an optional extension, a timed task, a
   self-check with a retry criterion, and honest exam-format labels.
3. Add the page to the `build` script. The static suite checks every root `*.html` page.
4. Crawl links: zero missing local targets, and every resource has one home card.
5. Run `npm run verify`, then the `learning-page-examiner` subagent. Fix its P0 items before
   publishing.

## P4 — Accept a Codex handoff or completion
1. Read the whole handoff. List every "verification already completed" line and every file it
   names.
2. Re-run each verification yourself, or with the `handoff-verifier` subagent. A claim you have
   not reproduced stays `UNVERIFIED` in the receipt.
3. Adopt workflows as native files: skills in `.claude/skills/<name>/SKILL.md` with
   `agents/openai.yaml`, subagents in `.claude/agents/<name>.md`, and steps here.
4. Run `npm run verify` and `npm run check:native-load`.
5. Write the adoption receipt (`codex-handoff` has the template). It lists sources, the
   mapping, evidence, what is unverified, and the true remainder.

## P5 — Release (only when Andrii says deploy)
1. Use `web-release`, which starts with `account-check`: name the Netlify account and site before
   any deploy.
2. `npm run verify` must be green on the commit being deployed.
3. Deploy a preview, then probe it: `/` and every asset and the CV must return 200, and the
   console must be clean. Promote only after that.
4. Probe production after promoting. Report the status codes and the account, not just "deployed".

## P6 — Hand work back to Codex
Write `CODEX_HANDOFF_<date>.md` with these sections: Objective · Read first · Source of truth ·
Skill stack and order · Guardrails · Verification already completed (commands with their
results) · Open items · Completion condition. Name the actor in every report line ("this session
ran…"), so the reader can tell what was done from what was claimed.
