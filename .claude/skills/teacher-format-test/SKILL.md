---
name: teacher-format-test
description: >-
  Use when building or auditing a Grade 10 test or exam-practice paper, including checking or
  recomputing its coverage matrix against the learning plan's rules, such as "build the Use of
  English test", "make the December test", "does the test cover every rule", "recompute the
  coverage matrix", "speaking test cards for the trio", "a writing test with a line graph" or "is
  this B2 First format". Its dyslexia version is built by dyslexia-variant, not here. Produces the
  paper and a teacher key with a coverage matrix by rule and by lexis set, a
  drilled-in-class source for every item, balanced answer letters, one-word and contraction rules,
  B2 First values checked against the official specification in the knowledge base, and honest
  teacher-format labels. Any rule the plan tests with zero items blocks release.
---

# Teacher-format test

Andrii writes his own Grade 10 tests. They are modelled on B2 First, IELTS Academic Task 1 and PTE
Academic, and they are teacher format, not official exam material (learning plan, line 79). After a
practice paper he reads out the rule codes in the key's coverage matrix, and each learner writes down
two rules to revise from the items they missed (UoE plan, line 33). So the matrix decides what every
learner revises. A rule credited to an item that does not test it sends a learner to the wrong rule.
A planned rule with no item is never tested at all. This skill builds the paper and its key from one
item list, computes the matrix by script, and blocks release while any rule the plan tests has zero
items.

"UoE plan" below is the lesson plan of the October Use of English pack, and "the October key" is its
teacher key.

Related work:
- `dyslexia-variant` builds the paper's dyslexia partner from the same item list.
- `lesson-pack-gate` checks the whole test pack before it is called ready.
- `test-results-to-revision` reads this matrix after marking. `quizlet-set-builder` reads the lexis-set
  codes and keeps test items out of the class's Quizlet sets.
- The base handout design belongs to the account skill `celta-handout`, and in Claude the account
  skill `celta-align` reviews the content.
- A quiz or exam-prep page on the website belongs to `learning-page-gate`, not here.

## Where things live
- **Packs:** one folder per test in the Grade 10 folder of Andrii's private Google Drive, beside the
  learning plan. Name the files as the October pack did: "Student handout – Use of English – Exam
  practice – V1.html", its "… – dyslexia – V1.html" partner, "Teacher key – … – V1.html", the lesson
  plan and the language analysis. The type "Test paper" also works: `lesson-pack-gate` counts it as a
  student file.
- **Working files** (the item list, the codebook, extracted text, renders): a scratch folder outside
  this repository, such as the session scratchpad or `/tmp`. Never the repository tree.
- **Folder IDs:** the untracked `.env.local`, as `learner-data-guard` sets out, or find the folder by
  its title. Never in this repository, a report, a commit or a handoff.
- **Marks never come here.** This skill builds and audits papers. It never reads, enters or stores a
  learner's mark. Marked papers go to `test-results-to-revision`, which keeps learner-level data in
  Andrii's private files. Before anything from this work lands in this repository (a fixture, a
  handoff, a page built from a paper), run `learner-data-guard`. Its rules live in
  `tests/lib/learner-data.mjs`, and its `learner-privacy-screen` subagent reads what a pattern cannot.
- **The knowledge base** (`<KB>` below), when a session has one: a folder outside this repository
  holding `lesson_manifest.json`, `lessons/`, `BOOKS.md` and `quote_check.py`. In `BOOKS.md` the key
  `fcespec` is the official B2 First specification (Cambridge English: First, Specifications and
  Sample Papers, 2015 format).

## What runs where
- **Claude with the Google Drive connector:** every step. Run `account-check` before the first Drive
  call, so the report names the Google account whose Drive was read and written.
- **Codex, or Claude without the connector:** work from a local copy that Andrii names, or from the
  knowledge base. With neither, the build is NOT RUN. Never rebuild the plan's rule list, a drilled
  sentence or a format value from memory.
- **Subagents** run only in Claude Code, and account skills only in Andrii's Claude sessions. In
  Codex, apply a reviewer's method from its file in `.claude/agents/`, or mark it NOT RUN.

**Auditing a paper that exists?** Rebuild the two files in section 1 from its key, run section 4,
then check sections 2, 3 and 5 against the paper. Report and propose changes; never edit the paper.

## 1. Inputs and the codebook
Read these before writing any item:
- the learning plan: "What the tests check" (each paper's format, what learners must show, where it
  was taught), "Grammar to be secure by the tests" (each area's rules and the items it names as
  evidence), its "Not tested now" line and "Vocabulary to be secure";
- the sentences drilled in each lesson (decks, dominoes, language analyses, handouts), with the lesson
  and file each came from;
- the codebook in the latest teacher key.

**The codebook is owned here.** G codes are grammar rules and V codes are lexis sets. The October key
defined G1–G22 and V1–V15 (lines 51–101), including the codes it did not test. Carry every code
forward with its number, meaning and status. Add new codes at the end (G23, V16 and so on). Never
renumber a code or reuse a number. A code that was not taught or was excluded keeps its number when it
comes back: G19, G21 and G22 in October. A code another skill proposes (`quizlet-set-builder` marks
one "proposed") joins the codebook when Andrii accepts it.

Keep two tab-separated files in the scratch folder. Together they are the paper's single content
source. The paper, the key, the matrix and the dyslexia partner are generated from them, never typed
twice.
- `codes.tsv`, one row per code: `code`; `status` (`tested`, or why not, such as "not taught (moved
  to a later week)"); `area`, the plan's area for a G code ("present tenses", "past tenses",
  "present perfect"), blank for a V code; and `meaning`.
- `items.tsv`, one row per item: `item` ("1" for multiple choice, "gap 1" for a gap, "writing" or
  "speaking" for a task); `answer` (for a gap, every accepted answer, separated by " / "); `letter`
  (multiple choice only); `job` (for a gap: A auxiliary, N negative, P preposition or T article; W or
  S for a writing or speaking task); `rules` and `sets` (codes separated by spaces); and `source`,
  the lesson and file where the item's sentence or language was drilled.

## 2. Items
- **Meaning decides every item** (teacher rule, 4 Oct 2026; UoE language analysis, line 3). No item
  tests spelling, pronunciation or form-building alone.
- **Multiple choice crosses form with word** in a 2 × 2 grid: two verb forms times two words, so the
  learner needs the right tense and the right word (UoE plan, line 43). Official B2 First Part 1 tests
  vocabulary (`fcespec` line 1021, PDF p.9), so this part is labelled teacher format.
- **Distractors are wrong by meaning,** never by spelling. The key gives the meaning reason for each
  item ("usually = a habit → Present Simple").
- **Only drilled language.** A gap uses only a sentence drilled in class (learning plan, line 75).
  Every item names where its language was drilled. A lesson whose plan marks its delivery "not sure"
  or "not delivered" does not count: ask Andrii, or choose another sentence. In October, gap 10 came
  from the Week 2 lesson, whose plan marks its delivery "not sure" (line 3).
- **A gap tests the word it deletes.** Credit a gap to the rule its deleted word is the exponent of,
  not to the grammar of the sentence around it. A preposition gap in a past perfect sentence tests the
  preposition. "For" and "since" are the exponents of the for/since rule. An article or preposition
  inside a rule's own frame ("the worst … had ever", "the third time") is frame-adjacent: list it for
  Andrii to decide, and never count or drop it silently. In October, gaps 1, 2, 6, 7 and 16 were
  credited to rules their deleted word does not test.
- **One defensible answer per gap** (UoE plan, line 41). For each gap, list the other words that would
  be grammatical and fit the meaning. If any remain, rewrite the sentence or let Andrii accept the
  list. October's gap 16 accepted eight answers.
- **Writing and speaking tasks** name the rules and lexis the task must elicit (from "What learners
  must show") and the criterion that scores each one. A rule counts as covered by a task only if a
  criterion scores it.

## 3. Mechanics
- **Balance the answer letters** and print the counts in the key, as the October key did (line 103:
  A 4, B 5, C 4, D 5). A spread of 0 or 1 is balanced.
- **One word per gap.** A contraction counts as one word ("didn't"), and "has not" in one gap is two
  words and scores no point (UoE plan, lines 19, 31 and 32). Print both rules in the paper's
  instructions. They are the paper's own rules. The B2 First specification in the knowledge base
  states neither, and the U37 plan (line 113) says contractions count as two. Keep the rule Andrii
  set for the paper, list the conflict as an owner decision until he settles it, and never change it
  on your own. `exam-format-auditor` reports it across packs.
- **Accepted answers:** a list for every gap and every open answer, in the key.
- **Totals:** items and marks per part and for the paper, on the paper and in the key.
- **Build by script.** Generate the paper (A4 HTML), the key and the matrix from the two files with a
  script in the scratch folder. Keep the script with the pack, so the partner and the next version
  come from it. The student paper holds no answers.

## 4. Coverage matrix and release
Run this in the scratch folder. After the two files, give each area of the plan with the items it
names as evidence, as the plan states them. The October plan named present tenses 1–5, past tenses
6–13 and gaps 1–8, and present perfect 14–18 and gaps 9–16. It also named writing and speaking for
some areas: add `writing` or `speaking` to a range only where the plan does.

```bash
python3 -I - items.tsv codes.tsv "present tenses=1-5" "past tenses=6-13,gap 1-8" "present perfect=14-18,gap 9-16" <<'EOF'
import csv, re, sys
from collections import Counter

def rows(path):
    with open(path, encoding="utf-8") as f:
        return [{k.strip().lower(): (v or "").strip() for k, v in r.items() if k} for r in csv.DictReader(f, delimiter="\t")]

def ids(spec):  # "6-13,gap 1-8,writing" -> {"6", ..., "13", "gap 1", ..., "gap 8", "writing"}
    out = set()
    for part in spec.lower().split(","):
        m = re.fullmatch(r"\s*(gap\s+)?(\d+)\s*(?:[-–]\s*(\d+))?\s*", part)
        if m:
            out |= {("gap " if m[1] else "") + str(n) for n in range(int(m[2]), int(m[3] or m[2]) + 1)}
        elif re.fullmatch(r"\s*[a-z][a-z ]*", part):
            out.add(part.strip())
        else:
            sys.exit(f"cannot read the range '{part}'; write it as 6-13,gap 1-8,writing")
    return out

ranges = [(a.strip().lower(), s, ids(s)) for a, _, s in (x.partition("=") for x in sys.argv[3:])]
items = [r for r in rows(sys.argv[1]) if r.get("item")]
book = {c["code"]: c for c in rows(sys.argv[2]) if c.get("code")}
codes = lambda r, col: r.get(col, "").split()
tested = lambda c: book[c].get("status", "").lower() == "tested"
if not any(c.startswith("G") and tested(c) for c in book):
    sys.exit("the codebook marks no G code as tested: check its code and status columns")
tasks = [r for r in items if r.get("job", "").upper() in ("W", "S")]  # writing and speaking tasks
mc = [r for r in items if r.get("letter")]
gaps = [r for r in items if not r.get("letter") and r not in tasks]
fix, block = [], []

unknown = sorted({c for r in items for c in codes(r, "rules") + codes(r, "sets") if c not in book})
if unknown:
    fix.append("not in the codebook (add new codes at the end, never renumber): " + ", ".join(unknown))
for prefix, col, title in (("G", "rules", "rules (0 items blocks release)"), ("V", "sets", "lexis sets")):
    print("Coverage · " + title)
    for code in (c for c in book if c.startswith(prefix)):
        hits = [r["item"] for r in items if code in codes(r, col)]
        if tested(code):
            print(f"  {code}\t{', '.join(hits) or '0 items'}")
            if not hits:
                (block if prefix == "G" else fix).append(f"{code} has 0 items")
        elif hits:
            fix.append(f"{code} is marked '{book[code].get('status')}', yet coded on {', '.join(hits)}")
print("Not tested (teacher decisions): " + "; ".join(f"{c} {r.get('status')}" for c, r in book.items() if not tested(c)))

count = Counter(r["letter"].upper() for r in mc)
count = {L: count.get(L, 0) for L in sorted(set("ABCD") | set(count))}
spread = max(count.values()) - min(count.values()) if mc else 0
print(f"Totals: {len(mc)} multiple-choice items · {len(gaps)} gaps · {len(tasks)} writing or speaking tasks")
print("Answer letters: " + " · ".join(f"{L} {n}" for L, n in count.items()) + f" (spread {spread})")
if spread > 1:
    fix.append(f"answer letters uneven (spread {spread}; balanced is 0 or 1)")

print("Gaps to check (a preposition or article credited to a grammar rule):")
for r in gaps:
    accepted = [a.strip() for a in r.get("answer", "").split("/") if a.strip()]
    if not accepted:
        fix.append(f"{r['item']} has no answer")
    if any(" " in a for a in accepted):
        fix.append(f"{r['item']} accepts more than one word: {' / '.join(accepted)}")
    if len(accepted) > 1:
        fix.append(f"{r['item']} accepts {len(accepted)} answers; one defensible answer per gap, or Andrii decides")
    if r.get("job", "").upper() in ("P", "T") and codes(r, "rules"):
        print(f"  {r['item']} '{accepted[0] if accepted else '?'}' -> {' '.join(codes(r, 'rules'))}")
nosource = [r["item"] for r in items if not r.get("source")]
if nosource:
    fix.append("no drilled-in-class source: " + ", ".join(nosource))

for area, spec, want in ranges:
    have = {r["item"].lower(): r for r in items}
    fix += [f"the plan's {area} range ({spec}) names {i}, which the paper lacks" for i in sorted(want - set(have))]
    for i, r in have.items():
        mine = [c for c in codes(r, "rules") if c in book and book[c].get("area", "").lower() == area]
        if i in want and not mine:
            fix.append(f"{r['item']} sits in the plan's {area} range ({spec}) but is coded {' '.join(codes(r, 'rules'))}")
        elif i not in want and mine:
            fix.append(f"{r['item']} is coded {' '.join(mine)} ({area}) but sits outside the plan's range ({spec})")

print("Fix before print:" + ("" if fix else " none"))
print("\n".join("  - " + f for f in fix))
print(f"Release: BLOCKED ({'; '.join(block)})" if block else "Release: CLEAR (every tested rule has at least one item)")
EOF
```

It prints the matrix by rule and by lexis set, the codes not tested, the totals, the answer letters,
the gaps to check, a fix list and the release line.
- **Release is BLOCKED** while any rule marked `tested` has zero items. Fix it by writing an item, or
  Andrii moves the rule to not tested with a reason. Never credit the rule to an item that does not
  test it.
- **Paste the matrix into the key** under "Coverage matrix · rules (0 items would block release)",
  then the lexis-set matrix and the "Not tested (teacher decisions)" list, as the October key did
  (lines 51–101).
- **Gaps to check** lists every preposition or article credited to a grammar rule. Decide each one
  with the rule in section 2: keep it, list it as frame-adjacent, or recode it.
- **A plan-range line** is a mismatch between the plan and the matrix. List each one as a proposed
  plan edit for Andrii, quoting the plan line. In October the learning plan (line 33) counts gaps 9–16
  as present perfect evidence, while the key (line 59) codes gap 10 as G6, present continuous for
  change.
- A lexis set with zero items, a code missing from the codebook, an uneven letter count, a gap with
  two words or several answers, and an item with no drilled source all go on the fix list.

**Check the check.** Before trusting the snippet, plant two defects in a copy of `items.tsv`: delete
the only row coded to one tested rule, and change two answer letters that are not A to A. It must
print `Release: BLOCKED` naming that rule, and "answer letters uneven". A snippet that stays CLEAR is
blind: do not use it.

## 5. Formats and labels
- **B2 First values cite the specification.** Every timing, part and count comes from `fcespec`.
  `python3 -I <KB>/quote_check.py fcespec "<the specification's words>"` prints the line and PDF page
  (it needs at least four words). Write the source and the date checked beside each value in the key,
  the teacher notes and any deck timer. Cite `fcespec`, not the website, because anyone can re-check
  it line by line. Values checked on 5 Nov 2026: Reading and Use of English, 1 hour 15 minutes (line
  718, PDF p.6); Parts 1 and 2, each "a modified cloze test containing eight gaps" (PDF p.9); Speaking
  Part 3, "a 2-minute discussion followed by a 1-minute decision-making task" (line 4821, PDF p.37).
- **Speaking for 7 learners needs a trio.** The specification allows "a group of three" (line 731, PDF
  p.6) but gives no timings for one. A trio's timings are Andrii's decision, labelled teacher format.
  Never take them from a trainer or coursebook: the B2 First trainer in the knowledge base gives Part 4
  five minutes, where the specification gives four.
- **IELTS and PTE values** come from the lesson files, such as the PTE-style image or graph
  description, "25 s to prepare, 40 s to speak" (learning plan, line 14). Their official specifications are not in the knowledge
  base, so they are teacher format. Cite the lesson file and the date it gives, and list a value with
  no date as undated.
- **Label every paper, key and deck** "B2 First-style (teacher format)", "IELTS Academic Task 1-style"
  or "PTE-style", as the learning plan does. A part that departs from the official format says so
  (18 items where the specification has 8). Never present a teacher format as official exam material.
- **Marking criteria** for writing and speaking are printed in the key. Thornbury: "The reliability of
  the test can be improved by providing more explicit criteria for marking" (`httv`, PDF p.138). Where
  a B2 First assessment scale applies, quote it from `fcespec`.

## 6. Writing graph
- Use a dated snapshot: a CSV saved with a source receipt before the paper is written. L21 did this:
  its plan (line 41) names the receipt, the CSV and the date the data was retrieved.
- Generate the graph, the model answer and the key from that file only.
- Recompute by script every figure the task, the model answer or the key states (rises, falls,
  differences, the highest and lowest values). Keep the formula beside the figure in the key.
- Label invented data "practice data" on the paper and in the key.

## 7. Partner, key and credits
- The dyslexia partner comes from `dyslexia-variant`, built from the same item list. It keeps every
  item, number, option and letter.
- The key's first line is "Teacher only · never screen-share".
- Where the knowledge base is present, check every key line taken from MyGrammarLab with
  `python3 -I <KB>/quote_check.py mgl "<the key's sentence>"` (at least four words). A NOT FOUND on an
  error-correction item means "check the page image", not "wrong key".
- The paper and the key carry a source line and an AI-use line, as the October key did (line 105).
- Save each file as a new version in the test's Drive folder, after `account-check`. Never save over
  an older version.

## Reviewers beside the build (Claude Code)
These subagents are read-only, so run them in parallel on the scratch folder. Give them the files and
the plan, never learner names or marks. Add each finding to the report with the agent named.
- `test-coverage-auditor` recomputes the matrix from what each item really tests, and checks one
  defensible answer per gap, the plan's ranges and the drilled sources.
- `exam-format-auditor` checks every format value and label against `fcespec` and across packs.
- `dyslexia-parity-checker` checks the partner item by item.
- `sensitive-topic-screen` screens speaking cards and writing prompts against the class's written
  safeguards.

## Report
```text
Teacher-format test · <paper> V<n> · <date> · <n> multiple choice, <n> gaps, <n> tasks
Release: CLEAR, or BLOCKED (<rules with 0 items>)
Coverage: rules <code: items> · lexis sets <code: items> · not tested <code: reason>
Mechanics: letters A <n> · B <n> · C <n> · D <n> (spread <n>) · one word per gap <yes, or gaps> · several answers <gaps>
Sources: <n> of <n> items drilled in a delivered lesson · doubtful <item: lesson, plan line>
Formats: <value: fcespec line and page, or teacher format with its lesson file and date, or UNDATED>
Labels: <files with the teacher-format label> · missing <files>
Graph: <snapshot file, retrieval date, receipt> · figures recomputed <n> of <n>
Proposed plan edits (Andrii approves): <plan line: what it says, what the matrix says, new text>
Owner decisions: <contraction rule, frame-adjacent items, accepted-answer lists>
Reviewers: <agent: result, or NOT RUN and why>
NOT RUN: <check: why>
```
Name files by title. No line names a learner or gives a learner's mark.

## Done when
No tested rule has zero items. The letter counts are printed in the key. Every B2 First value cites
an `fcespec` line and page. Every graph figure traces to the snapshot. The plan-range mismatches and
the owner decisions are with Andrii. The dyslexia partner has passed its parity check. Nothing from
the pack was copied into this repository. The routing evals pass
(`SKILL_EVAL_ONLY=teacher-format-test npm run eval:skills`).

## Known case (the October Use of English pack, 29 Oct knowledge base)
The item list rebuilt from the October key must give at least these:
- Release CLEAR, the key's matrix (lines 51–89) and answer letters A 4 · B 5 · C 4 · D 5.
- Gap 10 (G6) inside the plan's present perfect range "gaps 9–16" (learning plan line 33 against key
  line 59).
- Gap 16's eight accepted answers against "one answer per gap".
- Nine prepositions and articles credited to grammar rules. Gaps 1, 2, 6, 7 and 16 do not test the
  rule they are credited to, so G13 and G18 fall to one item each. Gaps 8 and 15 are frame-adjacent.
- No drilled source for any Part 1 item: the key gives sources for gaps only.
- Gap 10's source in the Week 2 lesson, whose delivery is marked "not sure".
- The format line cites the website (checked 4 Oct 2026), and Parts 1 and 2 hold 18 items and 16
  gaps against the specification's eight each: re-cite it with `fcespec` and keep the teacher-format
  label.

`test-coverage-auditor` adds gap 4 (coded G10, it deletes the past continuous auxiliary after
"while") and item 18 (G20) as required and excluded at once.
