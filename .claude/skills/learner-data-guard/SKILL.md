---
name: learner-data-guard
description: >-
  Use before saving, committing, merging or pushing anything that touches lessons, students, marks,
  results or monitoring notes in this public repository, such as "merge the lessons branch", "add
  the 1-1 lessons folder to the repo", "commit the monitoring log", "save the results here" or "push
  the lesson notes", and before a handoff, fixture or learning page built from a lesson pack lands here.
  A static test with a planted defect keeps learner names, scores, tier assignments, monitoring-log
  rows, per-learner folders and Google Drive links out of the repo, and the skill sends that
  material to Andrii's private Drive instead.
---

# Learner data guard

This repository is public. Andrii's Grade 10 learners are minors, and his 1-1 students are private
people. Everything about them lives in his private Google Drive. This repository holds the website,
templates and procedures, and nothing that names or scores a learner.

Account skills such as `celta-brief-before-build` put real first names into lesson materials on
purpose. That is right in Drive. It is also why their output never lands here unchecked.

## The rule
Quoted in full, because Codex cannot see Andrii's account skills:

> This repository is public. It holds no learner names, scores, attendance, diagnoses or dyslexia
> status, tier assignments, monitoring-log content, work samples, or photos of learners or their
> work. It may hold aggregates over at least three learners, fictional avatars, templates and
> procedures.

## Where each thing lives
| Material | Where it lives | In this repo |
|---|---|---|
| Lesson packs, plans that name learners, keys with marks, monitoring logs, photos of work | the lesson folders in Andrii's private Drive | never |
| Per-learner marks, when Andrii wants them | his private evidence folder or a private Drive sheet, with learner codes | never |
| Drive folder and file IDs | an untracked local config, `.env.local` (`.gitignore` already ignores `.env*`) | never; name the folder by its title |
| The 1-1 student tree (the layout planned on PR #3) | Drive, or a private repository | templates and procedures only |
| Class-level results over three or more learners, fictional avatars, empty templates | here is fine | yes |

Skills that read lesson packs or marked papers (`lesson-pack-gate`, `test-results-to-revision`) keep
their inputs and outputs in Drive. Anything they produce passes this guard before a commit.

## Steps
1. **List what would land.** Run `git status --short` (untracked files count too),
   `git diff --cached --name-only`, and for a branch `git diff --name-only main...<branch>`.
2. **Run the static guard.** `node --test --test-name-pattern="learner data" tests/site.test.mjs`
   takes about a second, and `npm test` runs it with everything else. It reads every file a commit
   could carry, tracked or not (files `.gitignore` keeps local are skipped), and reports the place,
   the kind and a count, never the value. It catches:
   - a per-learner folder: one directly under `1-1 Lessons`, `students`, `learners` or `pupils`, or
     one under `lessons` that holds dated lesson folders (`YYYY-MM-DD_…`);
   - a table (Markdown, CSV or TSV, or HTML) whose header names learners or what a learner said, with
     at least one filled row: monitoring-log rows, a per-learner score table or a learner roster;
   - a file named as a roster, class list, attendance sheet, mark book or monitoring log, and a
     spreadsheet named scores, results, marks or students;
   - a Google Drive or Docs link, and a Drive ID written right after the word "Drive".

   It lets through header-only templates, placeholder rows (`<learner>`, empty cells, "Student A"),
   class-level rows (Class, Total, Mean), people under an Avatar column or marked "(avatar)", and
   long tokens such as sha256 values. Learner codes (L1, S2) still count as learners, so examples
   and fixtures use placeholders or avatars. The rules live in `tests/lib/learner-data.mjs`.
3. **Run the `learner-privacy-screen` subagent** on the same paths. It covers what a pattern cannot:
   a name in prose, a level judgement or support need beside a name, faces, name tags and
   handwriting in images, text in PDFs, and contact handles. A BLOCK stops the commit until Andrii
   decides.
4. **Route each finding. Never commit it.**
   - Learner material goes to its lesson folder in Andrii's private Drive. Run `account-check`
     before any Drive write, so the right Google account is named. Leave a pointer here by title
     only ("the U36 folder in Drive"), never a link or an ID.
   - Drive links and IDs go to `.env.local`, or to the private Drive copy of the document.
   - For per-learner folders (the 1-1 layout on PR #3), suggest Drive or a private repository for
     the student tree. This repository keeps the templates and procedures.
   - Andrii's own files that hold no learner data are an owner decision. Register them in
     `web/known-issues.json` with check `learner-data`, the target the test prints, and a suggested
     fix. Never edit or delete them without his approval. The four Drive IDs in
     `web/ADOPTION_RECEIPT_2026-10-29.md` are registered this way (`drive-ids-adoption-receipt`).
5. **Do not game the test.** Never rename a column, split a link or swap a name for initials to turn
   it green. Move the material. A false alarm goes to Andrii as an owner decision, as in step 4.
6. **Already committed?** A new commit that removes it leaves it in the git history and on GitHub.
   Stop, and tell Andrii the kind of data and where it is. Rewriting history and force-pushing are
   his decisions.
7. **Text that leaves this session carries kinds, never values:** commit messages, PR descriptions,
   reports and handoffs (`codex-handoff`). A number on a page that describes Andrii's own results
   goes through `claims-ledger`; a learner's number never reaches a page.
8. Run `site-verify` before calling the change done.

## The planted defects
`tests/mutation.test.mjs` proves the guard is not blind:
- a monitoring log with a student's line, added to `web/PROCEDURES.md`, must turn the test red;
- one copy holding every kind (a per-learner folder with a monitoring log, a CSV and an HTML score
  table, a roster spreadsheet, a Markdown roster, a Drive link and a Drive ID) must be reported
  place by place and kind by kind, with none of the planted values in the output;
- fictional avatar role cards on a staged page, and a monitoring-log template with a class average,
  must stay green.

When you change a rule in `tests/lib/learner-data.mjs`, plant its case there too.

## Report
```
Learner data guard: <paths or diff range>
Static test: pass or fail · <n> findings by kind · registered: <ids>
Privacy screen: CLEAR, BLOCK (<n>) or NOT RUN (<why>)
| place (file:line or folder) | kind | route (Drive / .env.local / owner decision) |
Moved: <what went where, by title>
```
Describe kinds, never values. "Clear" covers only the checks that ran.

## Done when
`npm test` is green, so the planted defects are caught and the allowed changes pass;
`learner-privacy-screen` returned CLEAR, or Andrii decided each BLOCK; nothing it listed is still
staged; and the routing evals pass (`SKILL_EVAL_ONLY=learner-data-guard npm run eval:skills`).
