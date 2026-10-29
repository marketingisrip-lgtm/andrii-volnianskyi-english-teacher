---
name: codex-handoff
description: >-
  Accept work from Codex or another session (a handoff, completion note or "import prompt"), adopt
  its workflows as native Claude Code and Codex assets, and write the evidence-backed adoption
  receipt; also write handoffs back to Codex. Treats every "verified" line as a claim to re-run, maps
  workflows to rules, skills, subagents, procedures and tests, keeps skills dual-harness (SKILL.md plus
  agents/openai.yaml, mirrored for Codex), and proves Claude Code loads them. Invoke on "import this
  prompt", "adopt these workflows", "Codex finished X", "read the handoff", "hand this to Codex", or
  when a report claims work was done elsewhere.
---

# Codex handoff

Another model's output is a draft, not a result. If a report shows no evidence (an output, a
file, a hash), treat the work as not done until you reproduce it. A Codex run once said it could not
open a browser and had not seen its own layout. Rendered, it showed a paragraph repeated four times.
A subagent once reported "complete" after doing nothing.

## Intake (P4)
1. **Read the whole handoff from the primary source**: the file itself, not a summary, a
   pasted excerpt or your memory of it. If it is on the owner's Mac and this session runs in the
   cloud, you cannot read it. Say so in one line and offer the fastest routes: a Remote Control
   folder, pushing the folder to a private repo, or pasting it. Then do every part that does not
   depend on it (see "When the source is unreachable").
2. **Extract the claims**: the files named, "verification already completed" lines, counts,
   tests, and statements that something was not changed.
3. **Re-verify** with the `handoff-verifier` subagent or by hand. Classify each claim as
   REPRODUCED, DIFFERENT, NOT REPRODUCIBLE HERE or UNVERIFIABLE. A claim that diverges from what
   is on disk is a hypothesis: re-derive from the file (path, mtime, sha256, grep), then decide.
4. **Adopt** (next section), **test** (`npm run verify`, `npm run check:native-load`), and
   **receipt** (template below).

## Adopting a workflow — pick the right native form
| The workflow is… | Native form | Where |
|---|---|---|
| a short constraint that applies every session | hard rule | `web/AGENTS.md` (Codex and Claude both read it) |
| a procedure applied to a specific task | skill | `.claude/skills/<name>/SKILL.md` |
| an independent role that judges without editing | subagent | `.claude/agents/<name>.md` (tools restricted, model chosen) |
| an ordered human-plus-agent routine | procedure | `web/PROCEDURES.md` (P-number) |
| an invariant a script can check | test | `tests/*.test.mjs`, plus a mutant in `tests/mutation.test.mjs` proving it fires |

Do not duplicate. If an account-level skill already covers the workflow (`llm-delegation`,
`autonomous-ops`, `celta-*`), reference it by name instead of copying it.

## Dual-harness format (one source, both tools)
- `SKILL.md` frontmatter: `name` (equal to the folder name, lowercase-hyphen, max 64 characters),
  `description` (max 1024 characters, saying what it does **and** when to invoke it), and optionally
  `disable-model-invocation: true` for user-only skills (deploys, deletes).
- `agents/openai.yaml` beside it, for the Codex skill picker:
  ```yaml
  interface:
    display_name: "Site verify"
    short_description: "…max 120 chars…"
  ```
  The owner's convention (`invocation.md` in his skills repo): a **model-invoked** skill omits the
  `policy` block and keeps a model-facing description that says when to use it, triggers first. A
  **user-invoked** skill sets `disable-model-invocation: true` in `SKILL.md`, adds
  `policy: allow_implicit_invocation: false` here, and has a one-line human description with no
  trigger list. A skill is user-invoked in both harnesses or neither.
- `evals/triggers.json` holds routing queries (`should_trigger` true, and near misses false).
  `npm run eval:skills` runs each in a fresh headless session and checks which skill it reaches for.
- Codex reads repo skills from `.agents/skills`, which is a symlink to `.claude/skills`, so there are
  no generated copies. `AGENTS.md` is a symlink to `CLAUDE.md`.
- `tests/agent-assets.test.mjs` enforces all of the above, and checks that the docs name only skills,
  agents, scripts and files that exist.
- `npm run check:native-load` starts a fresh headless `claude` in the repo and fails unless its
  init event lists every skill and agent. This is the proof that Claude Code adopted them natively.
  Codex loading is not proven by this repo's tests; say UNVERIFIED unless Codex was actually run.

## When the source is unreachable
Do not invent its contents. Reconstruct only from sources you can read: the repo and its branches,
earlier handoffs, the owner's skill library (Drive: "Claude Code Skills (Shareable)"), and account
skills. Say exactly which sources you used. Mark the adoption PARTIAL, and make the true
remainder the first line of the receipt: "diff this adoption against <path> when readable". When the
original becomes readable, run `handoff-verifier` on it and adopt only the difference.

## Adoption receipt (template)
```markdown
# Adoption receipt — <source> — <date>
Status: COMPLETE | PARTIAL (<why>)
## Sources
| Source | Read? | Identity (path / Drive id / commit / sha256) |
## Mapping
| Source workflow | Native asset(s) | Test(s) proving it | Result |
## Tests run (this session)
<command> → <tests/pass/fail/skip> (+ failures verbatim, NOT RUN with reasons)
## Native load
<claude_code_version, skills/agents listed by the init event, missing: none>
## Findings for the owner
<owner decisions, each with evidence>
## Unverified
<each item and why>
## True remainder
<the single next action and who must take it>
```

## Handing work to Codex (P6)
Write `CODEX_HANDOFF_<date>.md` with these sections: Objective · Read first (paths) · Source of
truth · Skill stack and order · Guardrails (no publishing, no deleting, claims via the ledger) ·
Verification already completed (each with its command and result) · Open items · Completion
condition ("done only when …"). Name the actor on every line. This is the shape of the Codex
CAE-hub handoff (25 Aug 2026), which worked.

The message that points Codex (or another chat) at it carries six parts (owner skill `chat-handoff`):
**WHAT** the change is, in one line · **WHERE** it is (paths, branch or patch) · **WHY it is not a
copy** (the decisions that would be lost if someone rebuilt it from the summary) · **WHAT IS EASY TO
BREAK** (the two or three invariants that look like noise) · **VERIFICATION STATE** (what was proved
and what was not) · **WHAT THEY MUST DO** (the next command, and how they will know it worked).

Codex sees only what is in the repo: `AGENTS.md`, `web/AGENTS.md`, `.agents/skills` and the files you
name. The owner's account-level Claude skills (`llm-delegation`, `autonomous-ops`, `account-check`, the
`celta-*` family) do not exist for Codex, so quote the rule a handoff depends on instead of naming the
skill.
