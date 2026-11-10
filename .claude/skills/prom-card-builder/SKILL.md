---
name: prom-card-builder
description: >-
  Use when a lesson's target phrases or blocking vocabulary should become or update a card set on
  Prom, Andrii's own learning platform, or when setting Prom homework, such as "make Prom cards for
  U39", "add the NASA phrases to Prom", "Prom homework for next week", "which Prom set covers V11" or
  "export the cards for Prom". Builds chunk-level cards only from language the pack taught, each with
  its drilled example and traced to its source lesson, as a plain UTF-8 tab-separated file (front,
  tab, back) that Andrii uploads to Prom himself. Dedupes across sets, checks the file, plans spaced
  review and records the set in Andrii's private registry sheet. Packs and the registry stay in his
  Drive, and no card names a learner.
---

# Prom card builder

Andrii sets vocabulary self-study on Prom, his own learning platform (it replaced Quizlet), each set
with a due date. A set is only as good as its cards. Cards that drill a word the lesson never used,
or a chunk in a form the class never met, send learners home to practise the wrong thing. A set on
Prom is not proof of learning either: the NASA plan says that being "prepared/available" in a tool
or in files is not evidence of teaching or mastery. The review test is the evidence. So every card
comes from the pack, the upload file is checked before Andrii uploads it, the reviews are dated, and
a private registry keeps track. Thornbury asks teachers "to keep track of their vocabulary input,
and to schedule tests at the optimal times" (*How to Teach Vocabulary*, knowledge-base key `httv`,
PDF p. 136).

Handouts and slides belong to `celta-handout`, a vocabulary quiz on a web page to
`learning-page-gate`, and test papers to `teacher-format-test`. Questions about which coursebook
pages were used are not this skill's job.

## Prom's import format is not confirmed
Prom's import format and API are not known yet. Until Andrii confirms them, the output is the
default below, and every report says "Prom format: unconfirmed, tab-separated default".
- **The file**: plain text, UTF-8 without a byte-order mark, Unix line endings (LF), one card per
  line, `front`, one tab, `back`. No header row, no quotes, no third column, no blank lines, and a
  final newline after the last card.
- **No API calls.** This skill never calls Prom, logs in, scrapes it or guesses an endpoint. A set
  exists on Prom only once Andrii has uploaded the file. If Prom offers a different import (CSV,
  a header row, extra fields, an API), Andrii says so and this skill is updated to match. Until then,
  never present the tab-separated file as Prom's confirmed format.
- If Prom rejects the file or splits a card, ask Andrii for the error or a screenshot and fix the file
  to match. Do not guess a new format and call it confirmed.

## Which job is this?
| Request | Do |
|---|---|
| "make Prom cards for U39" | steps 1–6: a new set |
| "add the NASA phrases to Prom" | steps 1–6 on the existing set: new cards only, in a file of their own |
| "Prom homework for next week" | find that week's lessons in the schedule, then build or reuse one set per lesson; steps 5–6 for each |
| "which Prom set covers V11" | the registry only (step 6); never guess a set |
| "export the cards for Prom" | step 3 from the set's card list, then the check in step 4 |
| a targeted revision set from `test-results-to-revision` | cards from the lexis sets it names by V-code, plus drilled sentences for the items the class missed most; one set for the class, never named after a learner |

## Where things live
- **Lesson packs** (plan, language analysis, phrase bank, blocking-vocabulary bank, deck, key):
  the lesson folders in Andrii's private Google Drive. Read them with the Google Drive connector, or
  from files Andrii supplies, and work on copies in a scratch folder outside this repo, such as the
  session scratchpad or `/tmp`.
- **Working files**: the card list (`<set id>.cards.json`) and the upload file (`<set id>.tsv`), in
  that scratch folder. The set id is the title in lower case with hyphens. Hand both to Andrii, or
  save them in the lesson's Drive folder after `account-check` has named the right Google account.
  The card list is the set's lasting record, because Prom's own copy cannot be read from here.
- **The registry**: a private Google Sheet in Andrii's Drive (step 6). It never goes into this repo
  or into a knowledge-base scratchpad, which does not outlive the session.
- **Links and codes**: Drive links and IDs, Prom links and set codes stay out of this repo, commit
  messages and handoffs. Name a file or a set by its title. Drive IDs a session needs live in the
  untracked `.env.local`, as `learner-data-guard` sets out.
- **Learners**: cards, titles, the registry and the report name no learner and hold no result. They
  describe sets, not people. Nothing this skill makes belongs in this repo; if any of it is to be
  saved here (an example, a fixture, a handoff), run `learner-data-guard` first. Its static rules live
  in `tests/lib/learner-data.mjs`, and its `learner-privacy-screen` subagent reads what a pattern
  cannot.

## 1. Source list: only what the lesson taught
1. Open the pack for the lesson named: the plan's target language, the language analysis, the phrase
   bank and the blocking-vocabulary bank. For a reading or listening lesson, also open the text or
   script where the class met the items.
2. Keep an item only if the plan targets it and the class met it: taught in a stage that ran, or
   heard or read in the lesson's text. If the plan does not say which stages ran, ask Andrii, or list
   the items as "planned, not confirmed taught".
3. Leave out anything the pack does not hold, however useful it looks, such as a word from a part of
   the coursebook unit the lesson skipped, or your own idea. List it for Andrii as a suggestion.
4. Write the card list as JSON, one object per card, in set order:
   - `front`: the chunk as the pack writes it;
   - `sentence`: the sentence the class drilled or met (deck, analysis, card or script), copied
     exactly. An item with no such sentence in the pack stays out, and is listed;
   - `back` and `fill`: from step 2;
   - `source`: lesson, file title, version and line or slide.

   This list is the evidence that every card traces to the pack.

## 2. Card design
- **Front**: the chunk as drilled ("break the record for", "get on someone's nerves"), never a single
  word cut out of it. Thornbury describes multi-word units, "loosely called chunks — that behave as
  if they were single words" (`httv`, PDF p. 112). A set that drilled forms, such as irregular verbs,
  keeps the forms the class drilled.
- **Back**, on one line: the meaning, then ` · `, then the sentence with the chunk gapped.
  - The meaning comes from the analysis where it gives one, in words a B1 learner knows. It never
    uses the chunk's key words. Or use the class's Ukrainian gloss, marked `UA:`, but only when the
    pack gives one: never translate on your own.
  - Replace the chunk's own words with `___`, one gap for each run of them, in the form the sentence
    uses ("gets on" for "get on"). Words that fill a slot in the chunk stay visible: "Loud music ___
    my ___." for "get on someone's nerves". Put the removed words, in order, in `fill`.
  - No tab or line break inside a front or a back. Either would split the card in the upload file.
- **No learner names.** A drilled sentence that names a learner gets a pronoun or one of the pack's
  avatar names instead. Treat any first name that is not an avatar, a book character or a public
  figure the text is about as a learner's. This is the only change allowed to a drilled sentence,
  and its `source` says so.
- **No test items.** If the learning plan or schedule names a test before the set's last review,
  compare each sentence with that test paper (`teacher-format-test` builds it with its key). A
  sentence that appears in the paper word for word is swapped for another drilled sentence. Without
  the paper, this check is NOT RUN; say so.
- **One meaning, one card.** If two backs could fit the same front, sharpen one; the pair check in
  step 4 shows it.
- **Title**: the lesson, the topic and the lexis-set code, such as "U39 · <topic> (V<n>)", so the
  teacher's code, the registry and Prom all match. The source lesson, file versions and build date go
  in the registry, and in a Prom description field only if Prom has one.
- Who can see the set on Prom is Andrii's choice. Tell him when cards carry coursebook sentences.

## 3. Build the upload file
1. **Across sets.** Compare every new front with every front in the class's earlier sets, ignoring
   case, extra spaces and curly quotes. The earlier sets are their card lists (from the lesson
   folders or Andrii) and the registry. Prom's own copy cannot be read from here, so for a set with
   no card list ask Andrii for an export or the list of fronts; otherwise report this check NOT RUN
   for that set. A front already in another set is left out and listed with that set, and Andrii
   decides whether to recycle it. A targeted revision set recycles on purpose: list the overlaps and
   keep them.
2. **Within the set.** No two cards share a front, by the same comparison.
3. **Write the file** from the card list, from the repo root:

   ```bash
   node --input-type=module -e '
   import { readFileSync, writeFileSync } from "node:fs";
   const [listFile, outFile] = process.argv.slice(1);
   const cards = JSON.parse(readFileSync(listFile, "utf8"));
   writeFileSync(outFile, cards.map((c) => `${c.front}\t${c.back}`).join("\n") + "\n", "utf8");
   ' "<scratch>/<set id>.cards.json" "<scratch>/<set id>.tsv"
   ```

   It never rewrites a card: a tab or line break inside a card is a defect the check in step 4
   reports, and you fix it in the card list.
4. **An update** (new cards for a set already on Prom) gets its own file with the new cards only,
   such as `<set id>.add-<date>.tsv`, because uploading the whole set again could duplicate its old
   cards. The card list keeps every card, old and new.
5. **A mistake in a set you built in this run**: fix the card list and write the file again. Cards
   already on Prom are changed or removed only by Andrii, on Prom.

## 4. Check before handing over
1. **Trace, gaps and file**, in one command from the repo root. It reads the upload file back as
   Prom would under the default format and compares it with the card list. It needs only node, so it
   also runs in Codex.

   ```bash
   node --input-type=module -e '
   import { readFileSync } from "node:fs";
   const [listFile, tsvFile] = process.argv.slice(1);
   const cards = JSON.parse(readFileSync(listFile, "utf8"));
   const raw = readFileSync(tsvFile);
   const text = raw.toString("utf8");
   const bad = [];
   if (raw[0] === 0xef && raw[1] === 0xbb && raw[2] === 0xbf) bad.push("file starts with a byte-order mark");
   if (text.includes("\r")) bad.push("file has carriage returns: use LF line endings");
   if (Buffer.from(text, "utf8").compare(raw) !== 0) bad.push("file is not valid UTF-8");
   if (!text.endsWith("\n")) bad.push("no newline after the last card");
   const lines = text.replace(/\n$/, "").split("\n");
   if (lines.length !== cards.length) bad.push(`file holds ${lines.length} lines, the list ${cards.length} cards`);
   const seen = new Map();
   cards.forEach((c, i) => {
     const n = i + 1;
     const gaps = String(c.back).split(" · ").slice(1).join(" · ").split("___");
     const fill = c.fill ?? [];
     if (!c.source) bad.push(`card ${n}: no source`);
     if (/[\t\r\n]/.test(c.front + c.back)) bad.push(`card ${n}: tab or line break inside the card`);
     if (!c.front?.trim() || !c.back?.trim()) bad.push(`card ${n}: empty front or back`);
     if (gaps.length !== fill.length + 1 || gaps.map((p, k) => p + (fill[k] ?? "")).join("") !== c.sentence) bad.push(`card ${n}: the gaps do not give back the sentence`);
     const key = String(c.front).normalize("NFKC").replace(/[\u2018\u2019]/g, "\u0027").replace(/\s+/g, " ").trim().toLowerCase();
     if (seen.has(key)) bad.push(`card ${n}: same front as card ${seen.get(key)}`); else seen.set(key, n);
     const cols = (lines[i] ?? "").split("\t");
     if (cols.length !== 2 || cols[0] !== c.front || cols[1] !== c.back) bad.push(`card ${n}: line ${n} of the file differs from the list`);
   });
   console.log(bad.join("\n") || `${cards.length} cards: sources, gaps and file all match`);
   process.exitCode = bad.length ? 1 : 0;
   ' "<scratch>/<set id>.cards.json" "<scratch>/<set id>.tsv"
   ```

   Any line other than "… all match" is a defect: fix the card or the list, write the file again
   (step 3) and rerun. The command proves that each card has a source, not that the source is right:
   check that against the pack files you opened. A set built before this skill has no card list.
   Rebuild the list from the file Andrii has, with `front` and `back` only: each card with no source
   or sentence goes to Andrii as a list, never as an invented source.
2. **Pair check**: read every back against every front in the set, as a learner meeting the meaning
   and example would. Exactly one front fits each back. Two that both fit mean the cards are too
   close: go back to step 2. Prom's own quiz modes are unknown, so this reading is the check.

## 5. Spaced review
- **Due**: the date Andrii gives. If he gives none, propose the day before the next lesson.
- **First review**: a short test at the start of the next lesson after the due date. Thornbury:
  "vocabulary covered in the previous lesson should be tested at the beginning of the next one"
  (`httv`, PDF p. 136). A few cards from the set, backs read out and fronts written, can be that test.
- **Later reviews**, at growing intervals: "the interval between successive tests should gradually
  be increased" (`httv`, PDF p. 30). Thornbury gives the principle, not the numbers. Propose real
  lesson dates from the schedule, for example about a week after the first review and about three
  weeks after that, plus one before any test that covers the set. Andrii sets the dates. If Prom
  schedules reviews itself, that does not replace the in-class tests.
- **The learning plan**: propose its self-study line as an edit Andrii approves, given as file, line,
  old text and new text, for example "Self-study: Prom — <set title> (due <date>; reviews <date>,
  <date>)". If the line still names Quizlet, the edit replaces it. He applies it, or asks you to apply
  it through `google-workspace`.

## 6. Registry (private)
- One row per set in Andrii's private registry sheet in Drive, with these columns:

  ```text
  set title · Prom link or code · lexis set · source lesson and versions · cards · due · reviews · built · status
  ```

  Status is "handed over" until Andrii has uploaded the set; then add the link or code and set it to
  "uploaded". A set the class no longer uses becomes "retired". Rows for earlier Quizlet sets stay as
  they are; Andrii decides whether to move them to Prom.
- **Lexis set**: the V-code from the codebook in the latest teacher key, which `teacher-format-test`
  owns. Codes are carried forward and never renumbered. A set with no code gets the next free number,
  marked "proposed" until Andrii accepts it.
- **Writing it**: append the row through `google-workspace` or the Google Sheets connector, after
  `account-check`, and never rewrite another row. In Codex, or without a connector, hand Andrii the
  row as tab-separated text. If he has no registry yet, give him the header row, and create the sheet
  only on his yes.
- The registry records sets, not learners: no names, no completion, no scores. Set codes are not
  personal data, but they tie sets to class homework, so the registry and its links stay out of this
  repo.
- **"Which Prom set covers V11?"** Read the registry and answer with the set title, its link or
  code, its source lesson and its dates. If the registry cannot be read, say so. Never guess a set.

## Report
```text
Prom set: <title> · <set id> · new, or +<n> cards to <title> · lexis set <V-code> (codebook or proposed)
Prom format: unconfirmed, tab-separated default (or: confirmed by Andrii on <date> as <format>)
Source: <lesson> · <files and versions read> · stages taught: confirmed by the plan, by Andrii, or not confirmed
Cards: <n> · left out <n>: <front: not taught / no sentence in the pack / already in <set> / in the <test> paper>
| front | back | source |
Checks: trace, gaps and file <all match, or the lines printed> · pair check <close pairs> · duplicates across sets <none / listed / NOT RUN for <set>> · test overlap <none / n swapped / NOT RUN>
Upload file: <file in the scratch folder> for Andrii to upload to Prom (after an update: the new cards only)
Review: due <date> · reviews <dates> · learning-plan edit proposed: <file, line, old → new>
Registry: row appended to <sheet title>, or handed to Andrii, or waiting for his upload
NOT RUN: <step: why>
```

## Done when
Every card traces to the pack; the check prints "all match"; no back fits two fronts; duplicates and
test overlaps are listed, or marked NOT RUN with the reason; the upload file and card list are with
Andrii, with the format marked unconfirmed until he confirms it; no call was made to Prom; the review
dates are proposed as a learning-plan edit; the registry row is written or handed to him; nothing
from this work went into the repo; and the routing evals pass
(`SKILL_EVAL_ONLY=prom-card-builder npm run eval:skills`).
