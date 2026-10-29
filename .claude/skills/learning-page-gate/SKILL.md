---
name: learning-page-gate
description: >-
  Gate for any English-learning web page or hub (lesson page, exam-prep hub, speaking or writing
  practice tool, cross-page practice flow) before it is called done or published. Checks that the page
  states a learner aim, protects the productive stage, has a self-check with a retry, labels exam
  formats honestly against the official spec, keeps saved state meaningful across pages, has zero dead
  links, and works on keyboard and at 320/390 px. Invoke when building, reviewing or merging a learning
  page, on "review the prep hub", "is this lesson page ready", "check the practice flow", or when a
  handoff says a learning page was audited.
---

# Learning page gate

A learning page has three contracts. It must teach toward a stated aim, it must tell the truth about
the exam it rehearses, and it must still work when the learner arrives with saved state, a phone or
a keyboard. A page that looks finished can break all three.

Sources: the owner's `learning-page-transfer-gate`, `exam-format-contract` and
`accessibility-review` skills (Drive library snapshot, 30 Aug 2026), and the Codex CAE Prep hub audit
and handoff (25 Aug 2026).

## 1. Aim contract (before any material)
- The page states what the learner can do by the end ("By the end of this page I can…"). An
  activity list ("we will practise…") does not count. If no aim exists, stop and run the account
  skill `celta-aims-first`.
- Split the content into a **core set** (3–5 active items) and an optional **extension**. Extension
  stays collapsible so it cannot use up the only speaking attempt.
- Protect the productive stage: a timed task comes after the core set, and a self-check plus a
  retry of the same task comes after the timed task.

## 2. Self-check with a retry criterion
"I used a phrase" is not a check. After the timed task the learner sees:
```text
[ ] Meaning: the frame fits the claim I intended, not a nearby idea.
[ ] Form: slot, tense, article/preposition and complementation are accurate.
[ ] Sound: I can say the key chunk clearly and name the stressed word.
[ ] Discourse: a reason plus an example/consequence or a qualification.
[ ] Interaction: I responded to a point and helped reach a decision.
[ ] Retry: I repeated the same task and improved one checked item.
```
For solo work, "Interaction" can be met by answering the partner's likely follow-up. Do not present
that as equal to live interaction. Replace classroom-only labels (CCQ, ICQ) with checks the learner
can run alone.

## 3. Exam-format honesty
- Any timer, part duration, question count or examiner script must match the **current official
  Cambridge spec**. Fetch cambridgeenglish.org; never use memory or a coursebook edition. Put a
  one-line source-and-date comment next to every hardcoded value.
- Cached contract (C1 Advanced Speaking, per pair, verified 24 Aug 2026 by `exam-format-contract`;
  re-verify before use): Part 1, 2 min · Part 2, 1 min per candidate plus a 30 s response · Part 3,
  3 min (2 discuss + 1 decide) · Part 4, 5 min · total 15 min. Part 4 was once hardcoded at 4 min for
  weeks, so a fifth of every rehearsal was missing.
- Keep CAE and CPE banks separate, and never offer CPE as "more CAE practice". Label cold-practice
  sources (Testbuilder, Trainer) as such.
- Never claim support the page does not give. "Every page carries your frames and the analyser" was
  false on the CAE hub; label exactly which pages support persistence or analysis.

## 4. Saved state across pages (only if the page reads or writes storage)
- Document the producer → consumer contract: storage key and version, shape, field names, dedupe
  identity, and behaviour on missing or old fields.
- Exercise the state matrix and reload between states: no value · empty array · only irrelevant
  items · one valid item · several · mixed · duplicates · malformed JSON · wrong type · legacy
  fields. Test the real consumer branch, not a copy of its logic.
- Personalisation is additive. Merge personal picks, dedupe, and keep defaults for any function the
  picks do not cover. A learner must never be told to do a task the current state makes impossible.
- Check inventory parity both ways: consumer defaults minus producer choices, and producer choices
  minus consumer items. Report the exact set difference.

## 5. Links and structure
- Crawl every `href` from the hub: zero missing local targets, and each resource has one home card
  (no duplicates). The CAE hub had six dead targets (wrong folders, wrong file names) and three
  usable pages it never linked.
- Run `npm test`, which applies every static check to every root `*.html` page, and add the page to
  the `build` script.

## 6. Interaction, mobile and accessibility
- Use `npm run test:runtime` for widths, keyboard reach, focus, targets, no-JS and reduced motion.
  Learning widgets need direct checks too:
  - clickable chips are `<button>`s or have role, tabindex and Enter/Space;
  - selected state is exposed with `aria-pressed` or `aria-checked`, not only a class;
  - essential examples are not hidden in a `title` tooltip;
  - task-feedback counters sit in an `aria-live` region;
  - reset clears exactly what it says.
- Text in another language (for example Ukrainian glosses) carries `lang="uk"`.
- Mark screen-reader behaviour "not manually verified" unless VoiceOver or NVDA was actually used.

## 7. Two expert reads (the `learning-page-examiner` subagent)
- **DELTA tutor:** aims as a contract, staging, the core/extension split, a pronunciation check,
  and whether the productive stage is protected.
- **CAE examiner:** Grammatical Resource, Lexical Resource, Discourse Management, Pronunciation and
  Interactive Communication. Ask whether the page rewards fit or the count of signature phrases.

## Report
Group findings by learner impact:
- **Blocker:** the flow will not load, or it destroys data.
- **High:** a valid state makes the aim impossible, the format is wrong, or a claim is false.
- **Medium:** a misleading notice, an inaccessible central interaction or a dead next step.
- **Low:** polish.

Give each finding a file:line, the observed state, the expected invariant and the smallest fix. List
checks not run as NOT RUN.

## Done when
The aim is written; core and extension are separate; the self-check and retry exist; every exam value
cites a dated official source; the state matrix is exercised or marked unverified; the link crawl
finds zero missing targets; `npm run verify` is green; and both expert reads have no open Blocker or
High findings.
