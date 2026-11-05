---
name: quizlet-set-builder
description: >-
  Use when a lesson's target phrases or blocking vocabulary should become or update a Quizlet set,
  or when setting Quizlet homework, such as "make a Quizlet set for U39", "add the NASA phrases to
  Quizlet", "Quizlet homework for next week", "which Quizlet set covers V11" or "export the set for
  Quizlet". Builds chunk-level cards only from language the pack taught, each with its drilled
  example and traced to its source lesson, through the repo's Quizlet MCP server (quizlet in
  .mcp.json). Dedupes across sets, checks the import text and a quiz, plans spaced review and records
  the set in Andrii's private registry sheet. Packs and the registry stay in his Drive, and no card
  names a learner.
---

# Quizlet set builder

The Grade 10 learning plan sets Quizlet Learn as self-study homework, each set with a due date. A
set is only as good as its cards. Cards that drill a word the lesson never used, or a chunk in a form
the class never met, send learners home to practise the wrong thing. A set on Quizlet is not proof of
learning either: the NASA plan says that "Prepared/available in Quizlet or files" is not evidence
of teaching or mastery. The review test is the evidence. So every card comes from the pack, the import
text is checked before Andrii pastes it, the reviews are dated, and a private registry keeps track.
Thornbury asks teachers "to keep track of their vocabulary input, and to schedule tests at the
optimal times" (*How to Teach Vocabulary*, knowledge-base key `httv`, PDF p. 136).

Handouts and slides belong to `celta-handout`, a vocabulary quiz on a web page to
`learning-page-gate`, and test papers to `teacher-format-test`. Questions about which coursebook
pages were used are not this skill's job.

## Which job is this?
| Request | Do |
|---|---|
| "make a Quizlet set for U39" | steps 1–6: a new set |
| "add the NASA phrases to Quizlet" | steps 1–6 on the existing set: new cards only |
| "Quizlet homework for next week" | find that week's lessons in the schedule, then build or reuse one set per lesson; steps 5–6 for each |
| "which Quizlet set covers V11" | the registry only (step 6); never guess a set code |
| "export the set for Quizlet" | `quizlet_export_import_text`, then the check in step 4 |
| a targeted revision set from `test-results-to-revision` | cards from the lexis sets it names by V-code, plus drilled sentences for the items the class missed most; one set for the class, never named after a learner |

## The server
The repo registers it in `.mcp.json` as `quizlet` (`node mcp/quizlet/index.js`, started from the repo
root). In Claude Code its tools appear as `mcp__quizlet__<tool>`. Their own names are:

| Tool | Arguments | What it does |
|---|---|---|
| `quizlet_list_sets` | none | id, title, description, card count and last update of every stored set (no cards) |
| `quizlet_get_set` | `id` | one set with its cards |
| `quizlet_create_set` | `title`, `description` (optional), `cards` | a new set; its id is the title in lower case with hyphens, plus `-2` if that id is taken |
| `quizlet_add_cards` | `id`, `cards` | appends cards, skips a term already in that set (case-insensitive) and returns `added` |
| `quizlet_remove_cards` | `id`, `terms` | removes cards by term |
| `quizlet_delete_set` | `id` | deletes a set permanently |
| `quizlet_export_import_text` | `id`, `termSep`, `cardSep` | text for quizlet.com/create → Import: by default a tab between term and definition and a newline between cards; a tab or line break inside a card becomes a space |
| `quizlet_import_text` | `title`, `text`, `description`, `termSep`, `cardSep` | a new set from text copied out of Quizlet's Export |
| `quizlet_quiz` | `id`, `count` (1–50), `mode`, `seed` | multiple choice with distractors from the same set; `mode` is `term-to-definition` (default) or `definition-to-term` |

The resource `quizlet://sets` gives the same list as `quizlet_list_sets`.

What it cannot do:
- **Reach quizlet.com.** Quizlet has no public API (`mcp/quizlet/README.md`). A set exists on Quizlet
  only once Andrii has pasted the import text there.
- **Hold a source or an example.** A card is `term` and `definition`, nothing else. The example goes
  into the definition; the source goes into the card list (step 1) and the registry (step 6).
- **Dedupe across sets.** `quizlet_add_cards` skips duplicates inside one set only, so the check
  across sets is yours (step 3).
- **Give four options from fewer than four cards.** The quiz draws distractors from the same set.

The store is `~/.quizlet-mcp/sets.json` (or `QUIZLET_MCP_DIR`), outside this repo. In a cloud session
it does not survive the session, so the import text and the card list are the lasting output. On
Andrii's Mac it persists, but the set's real home is Quizlet.

**Is it running?** If the session has no `mcp__quizlet__` tools, it is not. Install it once per
machine or container (`cd mcp/quizlet && npm install && npm test`). Claude Code asks once whether to
use the project's `.mcp.json` servers, and `/mcp` shows whether `quizlet` is connected; the tools
appear after the server is reconnected or a new session starts. Never write a tool result you did
not get.

**Without the server** (it is not loaded, or Codex has not been given it), the store and the quiz
are NOT RUN. Do steps 1 and 2, then make the import text from the card list with the server's own
export function (from the repo root), run the check in step 4, read the cards in pairs for meanings
that could swap, and hand both files over:

```bash
node --input-type=module -e 'import { readFileSync } from "node:fs"; import { toQuizletImport } from "./mcp/quizlet/store.js"; process.stdout.write(toQuizletImport(JSON.parse(readFileSync(process.argv[1], "utf8"))))' "<scratch>/<set id>.cards.json" > "<scratch>/<set id>.txt"
```

**Codex** reads this skill through `.agents/skills` but does not read `.mcp.json`. To build sets it
needs the server in its own configuration (`~/.codex/config.toml`: a `[mcp_servers.quizlet]` table
with `command = "node"` and the absolute path to `mcp/quizlet/index.js` in `args`). Without a Drive
or Sheets connector there, it works on files Andrii supplies and hands the registry row over.

## Where things live
- **Lesson packs** (plan, language analysis, phrase bank, blocking-vocabulary bank, deck, key):
  the lesson folders in Andrii's private Google Drive. Read them with the Google Drive connector, or
  from files Andrii supplies, and work on copies in a scratch folder outside this repo, such as the
  session scratchpad or `/tmp`.
- **Working files**: the card list (`<set id>.cards.json`) and the import text (`<set id>.txt`), in
  that scratch folder. Hand them to Andrii, or save them in the lesson's Drive folder after
  `account-check` has named the right Google account.
- **The registry**: a private Google Sheet in Andrii's Drive (step 6). It never goes into this repo
  or into a knowledge-base scratchpad, which does not outlive the session.
- **Links and codes**: Drive links and IDs, Quizlet links and set codes stay out of this repo,
  commit messages and handoffs. Name a file or a set by its title. Drive IDs a session needs live in
  the untracked `.env.local`, as `learner-data-guard` sets out.
- **Learners**: cards, titles, descriptions, the registry and the report name no learner and hold
  no result. They describe sets, not people. Nothing this skill makes belongs in this repo; if any
  of it is to be saved here (an example, a fixture, a handoff), run `learner-data-guard` first. Its
  static rules live in `tests/lib/learner-data.mjs`, and its `learner-privacy-screen` subagent reads
  what a pattern cannot.

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
   - `term`: the chunk as the pack writes it;
   - `sentence`: the sentence the class drilled or met (deck, analysis, card or script), copied
     exactly. An item with no such sentence in the pack stays out, and is listed;
   - `definition` and `fill`: from step 2;
   - `source`: lesson, file title, version and line or slide.

   This list is the evidence that every card traces to the pack.

## 2. Card design
- **Term**: the chunk as drilled ("break the record for", "get on someone's nerves"), never a single
  word cut out of it. Thornbury describes multi-word units, "loosely called chunks — that behave as
  if they were single words" (`httv`, PDF p. 112). A set that drilled forms, such as irregular verbs,
  keeps the forms the class drilled.
- **Definition**, on one line: the meaning, then ` · `, then the sentence with the chunk gapped.
  - The meaning comes from the analysis where it gives one, in words a B1 learner knows. It never
    uses the chunk's key words. Or use the class's Ukrainian gloss, marked `UA:`, but only when the
    pack gives one: never translate on your own.
  - Replace the chunk's own words with `___`, one gap for each run of them, in the form the sentence
    uses ("gets on" for "get on"). Words that fill a slot in the chunk stay visible: "Loud music ___
    my ___." for "get on someone's nerves". Put the removed words, in order, in `fill`.
  - No tab or line break inside a card. The export turns them into spaces, and a stray one would
    split the card on Quizlet.
- **No learner names.** A drilled sentence that names a learner gets a pronoun or one of the pack's
  avatar names instead. Treat any first name that is not an avatar, a book character or a public
  figure the text is about as a learner's. This is the only change allowed to a drilled sentence,
  and its `source` says so.
- **No test items.** If the learning plan or schedule names a test before the set's last review,
  compare each sentence with that test paper (`teacher-format-test` builds it with its key). A
  sentence that appears in the paper word for word is swapped for another drilled sentence. Without
  the paper, this check is NOT RUN; say so.
- **One meaning, one card.** If two meanings could swap, sharpen one; the quiz in step 4 shows it.
- **Title**: the lesson, the topic and the lexis-set code, such as "U39 · <topic> (V<n>)", so the
  teacher's code, the registry and Quizlet all match. **Description**: the source lesson, the file
  versions and the build date.
- Whether the set is public on Quizlet is Andrii's choice. Tell him when cards carry coursebook
  sentences.

## 3. Build (needs the server)
1. **Across sets.** Call `quizlet_list_sets`, then `quizlet_get_set` on each set, and compare every
   new term with every stored term, ignoring case, extra spaces and curly quotes. In a cloud session
   the store starts empty, so an empty list proves nothing: ask Andrii for the Export text of the
   sets the class uses (the Export option on the set's page on Quizlet) and load each with
   `quizlet_import_text` under its Quizlet title, unless the store already holds it. Otherwise
   report this check NOT RUN for sets outside the store. A term already in another set is left out
   and listed with that set, and Andrii decides whether to recycle it. A targeted revision set
   recycles on purpose: list the overlaps and keep them.
2. **New set**: `quizlet_create_set` with `title`, `description` and `cards`, sending `term` and
   `definition` only. Note the `id` it returns.
   **Update**: `quizlet_add_cards` with the set's `id` and the new cards only. `added` must equal the
   number you sent; if it is smaller, a term was already in the set, so find it with
   `quizlet_get_set`. A set that lives only on Quizlet is first loaded from Andrii's Export text with
   `quizlet_import_text`.
3. **Export**: `quizlet_export_import_text` with the `id` and the default separators. Save the text
   as `<set id>.txt` in the scratch folder. After an update the new cards are the last `added` lines.
   Andrii pastes only those into the existing set on Quizlet, because pasting the whole set again
   would duplicate its old cards. Check those lines against the new cards.
4. **A mistake in a set you built in this run**: `quizlet_remove_cards` on the cards you added, then
   add the corrected ones. Cards that were there before you started are removed only when Andrii
   asks.

## 4. Check before handing over
1. **Trace, gaps and round trip**, in one command from the repo root. It parses the import text with
   `fromQuizletExport` from `mcp/quizlet/store.js`, the function `quizlet_import_text` runs, and
   compares the result with the card list. It never writes to the store, so no copy of the set
   appears there and nothing needs deleting. It needs only node, so it also runs in Codex.

   ```bash
   node --input-type=module -e '
   import { readFileSync } from "node:fs";
   import { fromQuizletExport } from "./mcp/quizlet/store.js";
   const [listFile, textFile] = process.argv.slice(1);
   const cards = JSON.parse(readFileSync(listFile, "utf8"));
   const back = fromQuizletExport(readFileSync(textFile, "utf8"));
   const bad = back.length === cards.length ? [] : [`import text holds ${back.length} cards, the list ${cards.length}`];
   cards.forEach((c, i) => {
     const gaps = c.definition.split(" · ").slice(1).join(" · ").split("___");
     const fill = c.fill ?? [];
     if (!c.source) bad.push(`card ${i + 1}: no source`);
     if (gaps.length !== fill.length + 1 || gaps.map((p, k) => p + (fill[k] ?? "")).join("") !== c.sentence) bad.push(`card ${i + 1}: the gaps do not give back the sentence`);
     if (back[i]?.term !== c.term || back[i]?.definition !== c.definition) bad.push(`card ${i + 1}: differs after the round trip`);
   });
   console.log(bad.join("\n") || `${cards.length} cards: sources, gaps and round trip all match`);
   process.exitCode = bad.length ? 1 : 0;
   ' "<scratch>/<set id>.cards.json" "<scratch>/<set id>.txt"
   ```

   Any line other than "… all match" is a defect: fix the card or the list and run it again. The
   command proves that each card has a source, not that the source is right: check that against the
   pack files you opened. A set built before this skill has no card list. Save `quizlet_get_set`'s
   cards as the list: the round trip still runs, and each card it reports with no source or sentence
   goes to Andrii as a list, never as an invented source.
2. **Quiz**: `quizlet_quiz` with the `id`, `count` set to the number of cards (50 at most), `mode`
   `definition-to-term` (what Quizlet Learn asks of a learner: meaning and example in, chunk out) and
   a fixed `seed` such as 1, so the quiz can be repeated. Then run it once more with
   `term-to-definition`. Read every item: exactly one option fits the prompt, no option repeats, and
   no two options mean the same. With four or more cards every item has four options; with fewer,
   say so. A second option that fits means two cards are too close: go back to step 2.

## 5. Spaced review
- **Due**: the date Andrii gives. If he gives none, propose the day before the next lesson.
- **First review**: a short test at the start of the next lesson after the due date. Thornbury:
  "vocabulary covered in the previous lesson should be tested at the beginning of the next one"
  (`httv`, PDF p. 136). A few items from `quizlet_quiz` with a new seed can be that test.
- **Later reviews**, at growing intervals: "the interval between successive tests should gradually
  be increased" (`httv`, PDF p. 30). Thornbury gives the principle, not the numbers. Propose real
  lesson dates from the schedule, for example about a week after the first review and about three
  weeks after that, plus one before any test that covers the set. Andrii sets the dates.
- **The learning plan**: propose its self-study line as an edit Andrii approves, given as file, line,
  old text and new text, for example "Self-study: Quizlet Learn — <set title> (due <date>; reviews
  <date>, <date>)". He applies it, or asks you to apply it through `google-workspace`.

## 6. Registry (private)
- One row per set in Andrii's private registry sheet in Drive, with these columns:

  ```text
  set title · Quizlet link or code · lexis set · source lesson and versions · cards · due · reviews · built · status
  ```

  Status is "handed over" until Andrii has imported the set; then add the link or code and set it to
  "imported". A set the class no longer uses becomes "retired".
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
- **"Which Quizlet set covers V11?"** Read the registry (and the store's titles, on the Mac) and
  answer with the set title, its link or code, its source lesson and its dates. If the registry
  cannot be read, say so. Never guess a set code.

## 7. Deleting
`quizlet_delete_set` is permanent. Run it only when Andrii explicitly asks for that set to go, after
naming its id and title back to him. Never use it to tidy the store or to redo a build. The server
cannot touch Quizlet itself: deleting a set there is Andrii's own action.

## Report
```text
Quizlet set: <title> · store id <id> · new, or +<n> cards to <id> · lexis set <V-code> (codebook or proposed)
Source: <lesson> · <files and versions read> · stages taught: confirmed by the plan, by Andrii, or not confirmed
Cards: <n> · left out <n>: <term: not taught / no sentence in the pack / already in <set> / in the <test> paper>
| term | definition | source |
Checks: trace, gaps and round trip <all match, or the lines printed> · quiz <n items, n with four options, close pairs> · test overlap <none / n swapped / NOT RUN>
Import text: <file in the scratch folder> for quizlet.com/create → Import (after an update: the last <n> lines, into the existing set)
Review: due <date> · reviews <dates> · learning-plan edit proposed: <file, line, old → new>
Registry: row appended to <sheet title>, or handed to Andrii, or waiting for his import
NOT RUN: <step: why>
```

## Done when
Every card traces to the pack; the check prints "all match" (for an older set exported as it is:
no round-trip difference, and its untraced cards listed for Andrii); no quiz item has two fitting options;
duplicates and test overlaps are listed, or marked NOT RUN with the reason; the import text is with
Andrii; the review dates are proposed as a learning-plan edit; the registry row is written or handed
to him; nothing from this work went into the repo; and the routing evals pass
(`SKILL_EVAL_ONLY=quizlet-set-builder npm run eval:skills`).
