---
name: lesson-pack-gate
description: >-
  Use before a Grade 10 lesson pack is called ready, print-ready or taught, and when a pack arrives
  from Codex or another session, such as "is the L15 pack ready", "check the U39 folder before
  Monday", "print-ready?", "what is missing in this folder" or "can I teach this tomorrow".
  Read-only: checks the aims, the files the lesson type needs, versions across plan, key, guide,
  schedule and podcasts, a dyslexia partner for every student file, the 60-minute clock,
  teacher-only markers, the tier roster, attribution and AI disclosure, and page counts. Reports
  pass, fail or NOT RUN for each check with evidence, a change list for Andrii and one schedule
  status line. It never edits the pack.
---

# Lesson pack gate

A Grade 10 lesson pack is a Drive folder of files revised many times, often by different sessions.
In October one pack held versions V4 to V23, and the schedule's "Materials status" column said
"Ready", "Print-ready V4", "Deck/LP/LA V13" or "In preparation", with no shared meaning. L15 was
"Ready (handouts V22 incl. dyslexia; deck V12)" while its folder held handouts V23 and deck V13, and
its plan still had the room-speaker check pending. This gate is the one shared definition of ready.
It reads and reports. It never edits, renames, moves, re-versions or deletes a pack file. Superseded
files stay where they are until Andrii decides.

The gate checks that a pack's files agree with each other, with the folder and with the schedule.
Other tools judge the rest, and the gate calls them instead of repeating them:
- content and staging: the account skills `celta-aims-first` and `celta-align`;
- building a missing dyslexia partner, and checking that a partner keeps every item: `dyslexia-variant`;
- the coverage matrix of a test or exam-practice paper: `teacher-format-test`;
- teacher-made audio: `lesson-audio-build`;
- English-learning web pages in this repository: `learning-page-gate`.

## Where things live
- **Packs:** one folder per lesson in the Grade 10 folder of Andrii's private Google Drive, beside
  the schedule, the course overview and the learning plan. File titles follow
  `Type – Focus – Topic – variant – Vn.ext`; the variant is optional.
- **Folder IDs:** the untracked `.env.local`, as `learner-data-guard` sets out, or find the folder
  by its title. Never in this repository, a report, a commit or a handoff.
- **Working copies** (the listing, downloads, extracted text): a scratch folder outside this
  repository, such as the session scratchpad or `/tmp`. Never the repository tree.
- **The report** goes to Andrii. Plans name learners beside levels and support needs, so the report
  quotes files, never learners: a line that names a learner is cited by title and line only. If any
  part of this work is to be committed here, run `learner-data-guard` first.

## What runs where
- **Claude with the Google Drive connector:** every step.
- **Codex, or Claude without the connector:** work from a local copy of the pack that Andrii names
  (a downloaded folder, or the pack's working folder on his Mac), or from the converted knowledge
  base: a folder outside this repository holding `lesson_manifest.json`, `lessons/`, `BOOKS.md` and
  `quote_check.py`. With none of these, every check is NOT RUN. Never rebuild a file list from
  memory or from a plan's materials line.
- **Account skills** load only in Andrii's Claude sessions, and subagents only in Claude Code. The
  school-lessons lane prefers Codex (present perfect adverbs plan, line 11), so every rule the gate
  needs is written out below. In Codex, apply a subagent's method yourself or mark it NOT RUN.

## Results
Each check gets PASS, FAIL or NOT RUN with the reason. A "verified" line in the pack that this run
did not re-run is UNVERIFIED. Print, TV legibility, the listen-through and the room-speaker check
belong to Andrii: they stay pending until he confirms them. A FAIL stays a FAIL until it is fixed or
Andrii accepts it in writing; then it reads "FAIL, accepted by Andrii (date)".

## 0. Aims
The rule of the account skill `celta-aims-first`, as it applies to a Grade 10 pack:

> No lesson is ready while its aims are missing from the plan document. The plan holds a filled-in
> aims block: a main aim that names what learners will be better able to do by the end (the house
> formula is "By the end of the lesson, the students will be better able to [do something
> observable] using [target language] in the context of [the lesson's context]"), subsidiary aims
> that serve the main aim, and stage aims that say what learners can do after each stage, not what
> the teacher does. A language lesson fills in its target language; a skills lesson names the
> sub-skill and the text or task. Aims discussed in chat do not count, and nor does a template
> prompt with nothing after it. The stages the aims imply must fit the real slot.

Grade 10 plans label the main aim in several ways ("Main aim", "Main listening aim", "Main skill
aim", "Achievement aim"). Any of them passes when it names a learner outcome, not a topic or a list
of activities. The gate drafts nothing: if the aims are missing, offer `celta-aims-first` in Claude.

## 1. Inventory and the files each lesson type needs
1. In Claude, run `account-check` before the first Drive call, so the report names the Google
   account whose Drive was read. Its rule, for Codex: never infer which account you act as from a
   tool's summary; read the configuration, then confirm it with the service.
2. Find the folder by the ID in `.env.local`, or with the connector's `search_files`:
   `title contains '<lesson>' and mimeType = 'application/vnd.google-apps.folder'`. If more than one
   folder matches, ask Andrii which; never pick one.
3. List it with `search_files` (`parentId = '<folder ID>'`, `excludeContentSnippets: true`), and
   follow `next_page_token` to the end. In the scratch folder keep the listing (title, type, size,
   modified time) and a `titles.txt` with the titles alone, one per line. Read each document with
   `read_file_content` (Word, PDF, HTML and text come back as text) and save its text, so later
   steps can cite lines. Download bytes with `download_file_content` only where a step needs them
   (page counts).
4. Parse the titles. In the scratch folder, this prints each item's newest version with the older
   versions beside it, "version unknown" for titles without one, titles off the pattern, and the
   dyslexia pairing for step 4:

```bash
python3 -I - titles.txt <<'EOF'
import re, sys
from collections import defaultdict
SEP = re.compile(r"\s+[–—-]\s+")  # titles use " – "; " - " is accepted too
STUDENT = {"student handout", "cards", "game sheets", "domino", "test paper"}
items, odd = defaultdict(dict), []
for title in (t.strip() for t in open(sys.argv[1], encoding="utf-8")):
    if not title:
        continue
    *head, last = SEP.split(title)
    m = re.fullmatch(r"[Vv](\d+)\.\w+", last)
    if not m:
        head.append(last.rsplit(".", 1)[0])  # no version, as in "… – methodology.m4a"
    if len(head) < 3:
        odd.append(title)
        continue
    kind, focus, topic, *variant = head
    items[(kind, focus, topic, " ".join(variant))][int(m[1]) if m else None] = title
newest = lambda vs: max((v for v in vs if v is not None), default=None)
plain = lambda v: re.sub(r",?\s*\bdyslexia\b,?\s*", " ", v, flags=re.I).strip()
paired = standard = 0
for (kind, focus, topic, variant), vs in sorted(items.items()):
    top = newest(vs)
    older = sorted(v for v in vs if v is not None and v != top)
    line = f"{kind} – {topic}{' – ' + variant if variant else ''}: "
    line += f"newest V{top}" if top else "version unknown"
    if older:
        line += " · older " + ", ".join(f"V{v}" for v in older)
    if kind.lower() in STUDENT and "dyslexia" not in variant.lower():
        standard += 1
        twin = [newest(p) for (k, f, t, var), p in items.items()
                if (k, f, t) == (kind, focus, topic) and "dyslexia" in var.lower() and plain(var) == variant]
        if not twin:
            line += " · dyslexia partner: NONE"
        elif twin[0] != top:
            line += f" · dyslexia partner: V{twin[0]} (version differs)"
        else:
            paired += 1
            line += " · dyslexia partner: same version"
    print(line)
print(f"dyslexia {paired}/{standard}: standard student files with a same-version partner")
for title in odd:
    print("off-pattern:", title)
EOF
```

5. Check the files the lesson type needs. Report each missing kind as FAIL.

   | Lesson type | Must hold | May lack |
   |---|---|---|
   | Grammar (focus "Grammar") | lesson plan, language analysis, teacher presentation (the deck) | a student handout ("No handout", as in U36) and a key file (keys on slides) |
   | Skills (listening, reading, speaking, writing, pronunciation, Use of English) | lesson plan and language analysis (one combined file counts as both, and so does a plan with an analysis section), the deck, every student file the plan names, a key (a teacher key, or a guide and key), and cards when the plan uses tiers or roles | nothing |

6. List older versions as superseded and leave them in place. Deleting, moving or renaming them is
   Andrii's decision.

## 2. Versions
Every place that names a version must name the newest file of that type and variant. Read:
- the plan's materials line ("Execution materials: …") and the rest of the plan;
- the key's header and the guide's "Current files" line;
- the version written inside each file (its title line or header);
- the schedule's "Materials status" column and the course overview;
- the titles of the teacher podcasts.

To list every version a saved text names, with the words before it:
`grep -n -o -E '.{0,40}\b[Vv][0-9]+(\.[0-9]+)?\b' <file>.txt`. For each one, report the title and
line, the words quoted, the version named and the newest in the folder. Also report:
- a list of variants that leaves out variants the folder holds (the L15 key header, line 5, names
  T1A, T1B, T1B dyslexia, T23A and T23B; the folder also holds T1C–T1E, which the key's own line 35
  assigns);
- a document that calls a file "not yet built" when the folder holds it (L21 plan, line 51);
- a file whose own header names another version (the L17 plan's line 1 says "LESSON PLAN V16" in the
  V17 file).

A plan's newest change-log entry ("V16 delta …") is a claim about the current files. Older entries,
and lines marked historical, earlier, replaced or superseded, are history and are skipped.

Teacher podcasts: a title without a plan version is "version unknown" (13 of 17 in October). One
that a pack document says describes an older design is stale: the Week 2 plan (line 63) says its
podcasts "describe the September design". The gate does not listen to podcasts.

Audio and script: the plan, the key and the deck name the same audio and script versions, as
`lesson-audio-build` requires (in L15, audio v7 goes with script V5).

## 3. Clock
The slot is 60 minutes: three lessons a week, 60 minutes each (course overview, line 2).
- The plan's stated length equals the slot. Work and travel says "45–50 minutes" (plan, line 5): FAIL.
- The stage times run from 0 to 60 with no gap and no overlap.
- Wherever the plan lists deck timers, they add up to 3600 s, and with one timer per stage each
  timer equals its stage. L17 (plan, line 148) lists 240/420/720/1020/480/720 for six stages: 3600 s.
- Timed sub-steps that overfill a stage come from `pack-consistency-auditor`. In Unit 36 a one-minute
  comparison, a story, a question, a 30-second retell, a reveal and two retells share 52–55 min.

Give the stage spans as the plan states them, and the timers if it lists them:

```bash
python3 -I - "0-4 4-11 11-23 23-40 40-48 48-60" "240/420/720/1020/480/720" <<'EOF'
import sys
slot = 60
spans = [tuple(int(x) for x in s.replace("–", "-").split("-")) for s in sys.argv[1].split()]
problems = [] if spans[0][0] == 0 else [f"starts at {spans[0][0]}, not 0"]
for (a, b), (c, d) in zip(spans, spans[1:]):
    if c != b:
        problems.append(f"{'gap' if c > b else 'overlap'} between {a}–{b} and {c}–{d}")
if spans[-1][1] != slot:
    problems.append(f"ends at {spans[-1][1]}, not {slot}")
print("stages:", " + ".join(str(b - a) for a, b in spans), "=", sum(b - a for a, b in spans), f"min of {slot}")
if len(sys.argv) > 2:
    timers = [int(t) for t in sys.argv[2].split("/")]
    print("timers:", " + ".join(map(str, timers)), "=", sum(timers), f"s of {slot * 60}")
    if sum(timers) != slot * 60:
        problems.append(f"timers add up to {sum(timers)} s, not {slot * 60}")
    if len(timers) == len(spans):  # one timer per stage: each must equal its stage
        problems += [f"stage {a}–{b} lasts {(b - a) * 60} s, its timer {t} s" for (a, b), t in zip(spans, timers) if t != (b - a) * 60]
print("PASS" if not problems else "FAIL: " + "; ".join(problems))
EOF
```

**Check the checks.** Before trusting either snippet, feed it a planted defect once. A `titles.txt`
holding only "Student handout – Grammar – Test – V2.pdf" must print "dyslexia partner: NONE", and the
timers 240/420/720/960/480/720 must print FAIL with 3540 s.

## 4. Dyslexia partners
Every standard student file has a dyslexia partner of the same version, or the gap is listed.
Student files are student handouts (each tier or route variant counts separately), cards, game
sheets and dominoes; plans, keys, guides and the projected deck are not. A partner's variant is the
standard variant plus "dyslexia" ("T1B dyslexia", "dyslexia, final"). Its format may differ: L21 and
L22 pair a standard PDF with an HTML partner. The learning plan promises a partner for every
resource (line 74); in October 8 of 25 standard student files had one.
- Report each standard file with no partner, and each partner whose version differs. A lesson with
  no student file needs none.
- The gate checks presence and version only. Building a partner, and checking that it keeps every
  item, belongs to `dyslexia-variant` (in Claude Code, the `dyslexia-parity-checker` subagent).
- Which learner uses a partner is learner data. No report line, title or change list says.

## 5. Tiers and roles (when the plan uses them)
- The number of role or avatar cards equals the class size in the course overview (7 learners in
  October). Report roster statements that do not match: L15 (line 69) and L17 (line 31) give a
  five-learner arrangement, and L22 (line 5) says the class size is unknown.
- Each Tier 1 card carries two phrases and one grammar frame (learning plan, line 73).
- Every phrase on a card occurs in the text or the audio script, allowing for tense and pronoun
  changes, or is marked "recycled" (L15 key, line 35). Search the script's saved text for each
  phrase's fixed words.
- No card, title or file given to learners links a learner to a tier or role. Assignments by name
  live only in teacher files that carry the screen-share marker (step 7). Report a breach by kind and
  place, never the name.

## 6. Keys against their sources
Where the converted knowledge base is in the session:
- check each key line taken from MyGrammarLab with
  `python3 -I <KB>/quote_check.py mgl "<the key's sentence>"`. It needs at least four words, so
  check whole sentences;
- check each page a plan or key cites, with the book's key from `<KB>/BOOKS.md` and the quoted words.

A NOT FOUND on an error-correction item means "check the page image", not "wrong key": the scan's
text loses strikethrough and mixes the two columns. A cited book that `BOOKS.md` does not list is
MISSING: a recommendation, never "checked". Without the knowledge base this check is NOT RUN.
Answers that differ between the key, the analysis and the plan come from `pack-consistency-auditor`.

## 7. Screen-share safety
- Every key and guide opens with "Teacher only · never screen-share" (any case) on its first line,
  and so does any other teacher file used in class that holds answers, stress keys, CCQs or tier
  assignments. In October the L15, UoE and L22 keys did; the L17 and present perfect adverbs guides
  did not. A marker lower down (the L21 key has "NEVER SCREEN-SHARE" on line 5) is a FAIL with its
  line noted, for Andrii to accept or move.
- A plan or analysis that assigns tiers or roles needs the marker too. One that holds only answers
  or CCQs gets a note, not a FAIL: plans are read, not projected.
- The deck is made to be projected and needs no marker. Its answers stay behind a reveal, and no
  slide shows which learner has which tier or role.
- Student files hold none of these. Grep their text for "key", "answer", "CCQ" and the stress mark
  "ˈ", and read each hit: an answer list or a stress key on a student file is a FAIL.

## 8. Sources, AI use and credits
- Every student file carries a source line (the text, data or book it draws on) and an AI-use line.
- Every AI-made image has a credit, on the file or in the plan's provenance section. Count the images
  in each student file (`img` elements in HTML; `pdfimages -list` or PyMuPDF for a PDF) and match
  each with a credit. The Week 2 plan (line 329) records a student pack whose images look
  AI-generated and have no credit: FAIL until they have one.
- Teacher-made audio is disclosed on the plan's materials line and on the slide or audio bar that
  plays it: "Teacher-made recording · AI voice (ElevenLabs), British English · not the publisher's
  audio" (`lesson-audio-build`, step 7).

## 9. Page counts and print
- Count PDF pages and compare each count with the one the plan or guide states (for example "handout
  V21 (three pages)"). An HTML file's count needs an A4 print render at 100 %; without one it is NOT
  RUN.

```bash
for f in *.pdf; do printf '%s\t' "$f"; python3 -I -c 'import sys, fitz; print(fitz.open(sys.argv[1]).page_count)' "$f" 2>/dev/null || pdfinfo "$f" | awk '/^Pages:/ {print $2}'; done
```

- Never propose shrinking cards below their 36 pt/27 pt targets to save pages. The NASA reading
  guide (line 13) says "do not silently scale these down to two per sheet".
- Physical print and TV legibility are Andrii's checks, pending until he confirms them (the same
  guide, line 15, still lists them as unverified).

## 10. The pack's own checks
- If the pack has its own verifier (the present perfect adverbs pack's `work/build_pron_pp_v1.cjs`
  self-test, the L22 pack's `sources/check_pack.py`), run it on a copy in the scratch folder, never
  inside this repository, and quote the last lines of its output. A verifier the session cannot
  reach (for example one on Andrii's Mac) is NOT RUN.
- Any "verified", "checked" or "checked by the build" line in the pack stays UNVERIFIED until this
  run re-runs it (the L15 key, line 5: "Every answer is checked against the script by the build").
- For a pack that Codex or another session built, run the intake of `codex-handoff` first, with the
  `handoff-verifier` subagent re-running each "verified" line.

## Reviewers beside the gate (Claude Code)
These subagents are read-only, so they can run in parallel. Give them the scratch folder and the
class profile, never learner names, and add each finding to the gate's table with the agent named as
its source.
- `pack-consistency-auditor`, on every pack: every version the documents name, stage order across
  plan, guide, key and deck, sub-steps that overfill a stage, answers across key, analysis and plan,
  roster statements, and open checks against the schedule's status. Give it the slot (60 minutes)
  and the class profile (group size, number of Tier 1 roles).
- `dyslexia-parity-checker`, when partners exist: item-by-item parity.
- `sensitive-topic-screen`, when the pack has speaking, writing or exam cards: prompts against the
  class's written safeguards.
- `exam-format-auditor`, when a deck times an exam task or a key counts words.
- `test-coverage-auditor`, on a test or exam-practice pack.

In Claude, `celta-align` reviews the content, and `celta-lesson-simulation` (optional; it needs
Andrii's Mac) runs learner personas through the tasks. In Codex both are NOT RUN, and the gate itself
does not judge content.

## Report
```text
Lesson pack gate · <lesson> · folder <title> · read <date> as <Google account> · <n> files
| # | check | result | evidence (title:line quoted, or the end of a command's output) | owner action |
NOT RUN: <check — why>
UNVERIFIED: <claim — title:line>
Pending (Andrii): print · TV legibility · listen-through · room-speaker check
Proposed changes (Andrii approves, then applies them or asks Claude to):
| file (title) | line | old text | new text |
Superseded, left in place: <titles>
Schedule status: <status line>
```

Proposed changes are exact text edits. Andrii applies them, or asks Claude to through the account
skills `google-workspace` (Google Docs and Sheets) or `docx` (Word files). A PDF is rebuilt from its
source by whoever built it. A fix is saved as a new version beside the old file, never over it.

The status line, for the schedule's "Materials status" column:
- **Ready V(n)** only when every check passes or Andrii has accepted each FAIL in writing; **Not
  ready V(n) (k FAIL)** otherwise; **In preparation** when the plan or the deck is missing.
- V(n) is the version of the pack's student files, or of the deck when there are none.
- Then the counts: for each student-file type, how many of the variants the plan uses the folder
  holds at the newest version (handouts 7/7); the standard student files with a same-version partner
  (dyslexia 1/8); the deck's version; and anything pending or accepted.

Format example: "Ready V23: handouts 7/7, cards 1/1, dyslexia 1/8 (gaps accepted), deck V13 ·
pending: room-speaker check".

## Done when
Every check passes, or Andrii has accepted each FAIL in writing; his own checks are confirmed or
shown as pending in the status line; the change list and the status line are with him; nothing from
the pack was copied into this repository; and the routing evals pass
(`SKILL_EVAL_ONLY=lesson-pack-gate npm run eval:skills`).

## Known cases (the 29 Oct knowledge base)
A run on the October snapshot must report at least these; they are the gate's acceptance test.
- L15: the plan (line 11) names handouts V22 and avatar cards V13 while the folder holds V23 and V15;
  the key header (line 5) leaves out T1C–T1E; schedule line 2 says "Ready (handouts V22 incl.
  dyslexia; deck V12)" while the plan keeps the listen-through and the room-speaker check pending;
  dyslexia 1/8.
- L17: "LESSON PLAN V16" on line 1 of the V17 file; "cards V10" (line 148) against cards V17; deck
  timers 3600 s (PASS); no screen-share marker on the guide.
- NASA reading: the guide's "handout V19 (two A4 pages)" (line 3) and the plan's "handout V21 (three
  pages)" (line 9) against handout V24 in the folder.
- L21: "not yet built" (plan, line 51) against its V4 files and the schedule's "Print-ready V4".
- Work and travel: 45–50 minutes in a 60-minute slot.
- Week 2: podcasts that "describe the September design", images with no AI credit, and no dyslexia
  partner.
- All packs: 13 of 17 teacher podcasts are "version unknown", and 8 of 25 standard student files
  have a partner.
