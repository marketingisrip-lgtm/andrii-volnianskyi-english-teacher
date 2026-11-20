# 1-1 Lessons — Agent Guide (Claude + Codex)

Scope: generating 1-1 English lessons, adapting coursebook pages and student
handouts into Google Docs for monitoring, and maintaining procedures.

## Hard rules
1. **Aims first.** No materials before the lesson's aims (main / subsidiary /
   stage aims) are written in the lesson doc and approved by Andrii.
2. **Never fabricate sources.** Only use pages, audio and texts that exist in
   the book/handout provided. Cite unit + page on every doc.
3. **Everything lives in the shared Drive folder.** Create every new doc inside
   the `1-1 Lessons` folder (ID in `lessons/config.md`). Margo has access to the
   folder, so new docs inherit it. If a doc must live elsewhere, share it with
   Margo directly (role in `config.md`).
4. Verify the account before any Drive write (`marketing.is.rip@gmail.com`).

## Folder layout (Drive and repo mirror)
```
1-1 Lessons/
  <Student>/
    YYYY-MM-DD_<Unit>_<Topic>/
      Lesson Plan
      Student Handout
      Monitoring Log
```

## Procedures
See `lessons/PROCEDURES.md`.

## Reusable skills (account-level)
- `celta-aims-first`: gate, which runs first
- `celta-brief-before-build`: read the source + student profile silently
- `celta-lesson-plan-author`: build a staged, timed plan
- `celta-handout`: handout / Google Doc design
- `celta-lesson-simulation`: optional pressure test
- `celta-error-remediation-planner`: turn monitoring notes into the next lesson
