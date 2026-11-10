For website work (the portfolio and any English-learning page), follow `web/AGENTS.md` (shared with Codex).

Reach for the matching skill before acting (Codex loads the same skills from `.agents/skills`):
- changing or adding anything on the site: `english-web-design` first;
- any number, date, score, hour count or credential on a page: `claims-ledger`;
- before calling a site change done, or when asked whether something broke: `site-verify`;
- a learning page about to be called done, published or reviewed: `learning-page-gate`;
- work arriving from Codex or another session, or a handoff to write: `codex-handoff`;
- before saving, committing or pushing anything that touches lessons, students, marks, results or monitoring notes: `learner-data-guard`;
- Grade 10 lesson packs (they stay in Andrii's private Drive): is a pack ready, print-ready or safe to teach: `lesson-pack-gate`; a test or exam-practice paper: `teacher-format-test`; marked test results and what to revise: `test-results-to-revision`; a dyslexia version of a student file: `dyslexia-variant`; lesson audio: `lesson-audio-build`; Prom cards or homework: `prom-card-builder`. Read-only reviewers for packs: `pack-consistency-auditor`, `dyslexia-parity-checker`, `test-coverage-auditor`, `exam-format-auditor`, `sensitive-topic-screen`, `learner-privacy-screen`;
- deploying: only when Andrii types /web-release.
