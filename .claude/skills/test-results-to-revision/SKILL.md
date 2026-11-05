---
name: test-results-to-revision
description: >-
  Use after a Grade 10 test or exam-practice paper is marked, or when the rules learners chose to
  revise (a tally of their codes) should be compared with what the class actually got wrong, such
  as "enter the test results", "what should we revise after the tests", "plan revision before Unit
  39", "class results summary", "does their revision tally match their mistakes" or "which rules did
  the group miss". Takes class-level counts by default (how many learners missed
  each item, and band counts for writing and speaking), joins them with the paper's coverage matrix
  once that matrix is checked, holds items nearly everyone missed as possible item defects, and gives
  error rates by rule, lexis set and gap type. Picks the class's top one or two rules, anchors them
  to the next real lessons and Quizlet sets, and hands them to the remediation planner. Learner-level
  data stays in Andrii's private files and never enters this repository.
---

# Test results to revision

After a test, the marked papers are the best evidence of what the class needs next. The Grade 10
learning plan says the teacher "uses the coverage matrix (rule → item) to target revision before the
tests" (line 78), yet the lesson plans still read "priorities unknown" from the planning snapshot
(L22 plan, line 5). The coursebook calls this Assessment for Learning: "using this to help decide
what we need to do next" (Focus 2 Teacher's Book, knowledge-base key `focus2tb`, line 11491). This
skill turns marks into class priorities, and it needs no name to do it. The learners are minors and
the class has seven of them, so learner-level data stays in Andrii's private files.

Below, "UoE plan" is the lesson plan of the October Use of English practice pack, and "the October
key" is its teacher key. Other files are named by their titles in Drive.

What this skill does not do:
- It designs no lesson stage. `celta-error-remediation-planner` does (step 6).
- It builds no paper, key or matrix. `teacher-format-test` does, and the `test-coverage-auditor`
  subagent checks the matrix (step 3).
- It builds no Quizlet set. `quizlet-set-builder` does, from the lexis sets named here (step 5).
- It never marks or re-marks a paper, a script or a recording.
- Andrii's own development as a teacher (recurring feedback on his teaching) is not its job.
  Numbers about Andrii on the site belong to `claims-ledger`. A learner's number never reaches the
  site.

## The rule
Quoted in full, because Codex cannot see Andrii's account skills:

> Class-level counts are the default input. Per-learner marks are optional. They stay in Andrii's
> private evidence folder or a private Drive sheet, under learner codes, and the key from codes to
> names stays with him. Names, marks, totals, photos of sheets and per-learner notes never go into
> this repository, a public page, a commit message or a Codex handoff. Outside his private files, no
> figure describes fewer than three learners.

## Where things live
- **The paper, its key, the learning plan and the schedule:** the Grade 10 folder in Andrii's
  private Google Drive. The key holds the coverage matrix by rule and by lexis set.
  `teacher-format-test` builds each paper from an item list (`items.tsv`) and a codebook
  (`codes.tsv`). For an older paper, rebuild both from its key as that skill's section 1 sets out.
- **Class-level counts:** typed by Andrii in the chat, or kept in a private Drive sheet.
- **Per-learner marks (optional):** only in his private evidence folder on his Mac
  (`~/Documents/01_English-Teaching/3_School-10-Teaching/LEARNING_EVIDENCE`, which the plans cite) or
  in a private Drive sheet, under learner codes.
- **The learners' two-rules sheets** from the practice lesson (stage S7) stay with the learners.
- **Working files** (the counts, the checked item list, the join's output): a scratch folder outside
  this repository, such as the session scratchpad or `/tmp`. Class-level only: never a per-learner
  copy.
- **Results:** the private results table goes back to his private sheet or evidence folder, or to
  him in the chat. The priorities go to him, to the remediation planner and, as aggregates, to the
  learning plan and the planning snapshot (step 7).
- **This repository:** none of it. Drive links and IDs stay in the untracked `.env.local`, as
  `learner-data-guard` sets out; name a file or a folder by its title. If anything from this work is
  ever to be committed here, run `learner-data-guard` first. Its static rules live in
  `tests/lib/learner-data.mjs`, and its `learner-privacy-screen` subagent reads what a pattern cannot.

## What runs where
- **Claude with the Google Drive or Sheets connector** reads the key, the plan, the schedule and a
  private counts sheet itself. Run `account-check` before the first Drive call, so the report names
  the Google account it read.
- **Claude Code on Andrii's Mac** can also read the evidence folder. **A cloud session** cannot: work
  from the private sheet or the counts Andrii types.
- **Codex:** the account skills (`celta-error-remediation-planner`, `account-check`,
  `google-workspace`) and the subagents do not load, so every rule this skill needs is written out
  here. Apply the matrix method in step 3 yourself. The hand-off in step 6 is NOT RUN: give Andrii the
  watch-list to take to a Claude session.

## 1. Privacy first
- **Ask for the default input.** It is enough for class priorities:
  - for each multiple-choice item and each gap: how many sheets answered it, and how many scored no
    mark;
  - for writing and speaking: how many learners fell in each band of each criterion, using the
    criteria and bands printed in the key.

  Two class-level extras sharpen the result: how many chose each option of a multiple-choice item
  (step 2), and the commonest wrong answers in each gap.
- **Per-learner marks only when Andrii asks for a per-learner analysis** (step 4). Read them where
  they live, under learner codes, and write results back to the same private place. Never copy them
  into the scratch folder, a report or a handoff.
- **Names that arrive anyway** (in the chat, in a sheet or on a photo): never repeat them, write them
  down or put them on a command line. Reduce them to counts at once, or ask Andrii for a copy with
  codes.
- **Photos of marked sheets** only when Andrii offers them. Tally the item marks into counts, show
  him the tally to confirm, and save neither the photo nor a transcript. A mark you cannot read is
  asked about, never guessed.
- **The dyslexia version** holds the same items, so its answers count with the class. Results are
  never split by version, because who uses it is learner data. If its parity was never checked
  (`dyslexia-variant`), confirm the item numbering with Andrii before pooling.
- **Report the class.** Splits by tier, pair or trio stay in his private files, if he wants them at
  all.

## 2. Enter the counts
- **Exactly as Andrii gives them.** Never infer a mark, fill in a missing count or turn a blank into
  a guess.
- **His marking stands.** Two words in a one-word gap score no point, and a contraction counts as one
  word (UoE plan, lines 19 and 32). A spelling slip with the right word is his call. Record the mark
  he gave; never re-mark.
- **One row per item** in `counts.tsv` in the scratch folder, tab-separated, with each item named as
  in `items.tsv` (`1` for multiple choice, `gap 1` for a gap). Writing and speaking stay out of it.

  | column | what goes in it |
  |---|---|
  | `item` | the item, as `items.tsv` names it |
  | `sat` | sheets that answered it: learners present, or pairs for pair work |
  | `wrong` | answers that scored no mark, blanks included |
  | `blank` | optional: how many of those were left blank |
  | `form_wrong`, `word_wrong` | optional, multiple choice only (below) |
  | `mode` | `alone` (or empty), `pairs`, or `supported` when help was printed on the sheet |

- **Option counts split grammar from vocabulary.** Each multiple-choice item crosses two forms with
  two words (UoE plan, line 43), so one option is right, one has the wrong form, one the wrong word
  and one both. The language analysis names the form and the word for every item. `form_wrong` is
  how many chose the wrong-form option or the both-wrong option; `word_wrong` is how many chose the
  wrong-word option or the both-wrong option. The rule then counts only form errors, and the lexis
  set only word errors. Without option counts, a wrong answer counts against both.
- **How each item was done.** In the October practice lesson, gaps 1–8 were done in pairs with the
  job printed under each gap, and gaps 9–16 alone in exam conditions (UoE plan, lines 31–32). Pair and
  supported work is listed apart, never pooled with individual work.
- **Wrong answers in gaps (optional):** sort them into the right word written as two words or
  misspelt (an exam routine, step 5) and a different word (the rule or the job).
- **Writing and speaking:** for each criterion, the band counts add up to the scripts or performances
  marked. If Andrii noted rule codes while marking, record how many scripts showed each code. Never
  code a script yourself.
- **The join checks the arithmetic first** (step 3): no item has more wrong answers than sheets, no
  item more sheets than the class has learners (7, course overview line 2), the option counts fit
  the wrong answers, and every item in the key has a count. When every item scores one mark and was
  done alone, give it the class's total of marks (the sum of the sheets' totals): the right answers
  must add up to it. Any failure goes back to Andrii. Never adjust a count to make it fit.

## 3. Check the matrix, then join
The October key credited five gaps that delete a preposition or an article to tense rules, and an
auxiliary gap to the wrong past-tense rule. Joined as printed, preposition and article errors would
count against G11, G13, G14 and G18, and send the class to revise rules it may already know. So the
join uses a checked matrix.

1. Copy the paper's `items.tsv` to `items.checked.tsv` in the scratch folder and add a `check`
   column. Never edit the pack's own files: the matrix belongs to `teacher-format-test`.
2. In Claude Code, run the `test-coverage-auditor` subagent on the paper (the key, the plan and the
   language analysis) and carry its recomputed matrix into the copy:
   - a recoded item: the rules it really tests in `rules`, and `recoded from` plus the old code in
     `check`. A preposition or article gap that no rule code covers keeps its job and an empty
     `rules`;
   - a frame-adjacent item: `frame-adjacent`, until Andrii decides;
   - an item whose answer rests on a rule the plan or the key marks not taught, or on a contrast the
     plan both requires and excludes: `excluded`, until Andrii decides;
   - Andrii's decision on a held item: `cleared` (count it as coded) or a recode.
3. In Codex, or without the subagent, apply its method yourself. A multiple-choice item tests its
   rule through the form contrast and its lexis set through the word contrast. A gap tests the word
   it deletes: an auxiliary or a negative tests the form it builds, and a preposition or an article
   tests itself, not the tense of the sentence around it. "For" and "since" are the exponents of the
   for/since rule. An article or preposition inside a rule's own frame ("the worst … had ever", "the
   third time") is frame-adjacent. If you cannot apply the method, join on the matrix as printed and
   say so in the report: "matrix as printed, not recomputed".
4. Run the join in the scratch folder. The fourth argument is the class size. Add the class's total
   of marks as a fifth only when step 2 allows it.

```bash
python3 -I - counts.tsv items.checked.tsv codes.tsv 7 <<'EOF'
import csv, sys
from collections import defaultdict

def rows(path):
    with open(path, encoding="utf-8") as f:
        return [{k.strip().lower(): (v or "").strip() for k, v in r.items() if k} for r in csv.DictReader(f, delimiter="\t")]

counts_tsv, items_tsv, codes_tsv, size = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
total = int(sys.argv[5]) if len(sys.argv) > 5 else None  # optional: the class's total of marks
NUMS = ("sat", "wrong", "blank", "form_wrong", "word_wrong")
num = lambda r, k: int(r[k]) if r.get(k, "") != "" else None
counts = {r["item"].lower(): r for r in rows(counts_tsv) if r.get("item")}
items = {r["item"].lower(): r for r in rows(items_tsv) if r.get("item") and r.get("job", "").upper() not in ("W", "S")}
book = {r["code"]: r for r in rows(codes_tsv) if r.get("code")}

# 1. The arithmetic. Every line here goes back to Andrii: never adjust a count to make it fit.
fix = [f"{i}: in the key, no count" for i in items if i not in counts]
fix += [f"{i}: counted, not in the key" for i in counts if i not in items]
for i, r in counts.items():
    if [k for k in NUMS if r.get(k, "") and not r[k].isdigit()]:
        fix.append(f"{i}: a count that is not a whole number")
        continue
    sat, wrong, blank, form, word = (num(r, k) for k in NUMS)
    if sat is None or wrong is None:
        fix.append(f"{i}: sat or wrong is empty")
        continue
    if wrong > sat:
        fix.append(f"{i}: {wrong} wrong of {sat} sheets")
    if sat > size:
        fix.append(f"{i}: {sat} sheets in a class of {size}")
    if blank is not None and blank > wrong:
        fix.append(f"{i}: {blank} blank of {wrong} wrong")
    chosen = wrong - (blank or 0)  # wrong answers that chose an option or wrote a word
    if any(v is not None and v > chosen for v in (form, word)):
        fix.append(f"{i}: a form or word count above the {chosen} wrong answers given")
    if form is not None and word is not None and form + word < chosen:
        fix.append(f"{i}: form_wrong + word_wrong = {form + word}, below the {chosen} wrong answers given")
    if (form is not None or word is not None) and not items.get(i, {}).get("letter", "x"):
        fix.append(f"{i}: a form/word split on an item that is not multiple choice")
if fix:
    sys.exit("FIX THE COUNTS FIRST (ask Andrii):\n" + "\n".join("  - " + f for f in fix))

# 2. The join, on individual work only. Held items wait for Andrii; other work is listed apart.
tested = lambda c: book.get(c, {}).get("status", "").lower() == "tested"
rule, lexis, job = (defaultdict(lambda: [0, 0, []]) for _ in range(3))
held, apart, unsplit = [], [], []
for i, r in counts.items():
    it, sat, wrong = items[i], num(r, "sat"), num(r, "wrong")
    check, codes = it.get("check", "").lower(), it.get("rules", "").split()
    untested = [c for c in codes if not tested(c)]
    if check in ("frame-adjacent", "excluded", "defect") or untested:
        held.append(f"{it['item']}\t{wrong}/{sat}\t{check or 'coded ' + ' '.join(untested) + ', not marked tested in codes.tsv'}")
    elif sat and wrong / sat >= 0.8 and check != "cleared":
        held.append(f"{it['item']}\t{wrong}/{sat}\tpossible item defect: check the item and the key first")
    elif not sat or (r.get("mode") or "alone").lower() != "alone":
        apart.append(f"{it['item']}\t{wrong}/{sat}\t{r.get('mode') or 'nobody sat it'}\t{' '.join(codes) or it.get('job', '')}")
    else:
        form, word = num(r, "form_wrong"), num(r, "word_wrong")
        if it.get("letter") and form is None:
            unsplit.append(it["item"])
        for agg, keys, err in ((rule, codes, wrong if form is None else form),  # the rule takes the wrong forms
                               (lexis, it.get("sets", "").split(), wrong if word is None else word),  # the set, the wrong words
                               (job, [it.get("job", "").upper()] if it.get("job") else [], wrong)):
            for k in keys:
                agg[k][0] += err; agg[k][1] += sat; agg[k][2].append(it["item"])

def share(err, ans):  # outside Andrii's private files, no figure describes one or two learners
    return "fewer than 3 wrong" if 0 < err < 3 else "fewer than 3 right" if 0 < ans - err < 3 else f"{round(100 * err / ans)}%"

for title, agg in (("rule", rule), ("lexis set", lexis), ("gap job", job)):
    print(f"{title}\titems\twrong/answers\trate\tshare as")
    for code, (err, ans, its) in sorted(agg.items(), key=lambda kv: (-kv[1][0] / kv[1][1], -len(kv[1][2]))):
        name = " ".join(filter(None, (code, book.get(code, {}).get("meaning"))))
        weak = "\tone item: weak evidence" if len(its) == 1 else ""
        print(f"  {name}\t{', '.join(its)}\t{err}/{ans}\t{round(100 * err / ans)}%\t{share(err, ans)}{weak}")
print("held for Andrii (not ranked):" + "".join("\n  " + h for h in held) if held else "held for Andrii: none")
print("not ranked (pair or supported work, or nobody sat it):" + "".join("\n  " + a for a in apart) if apart else "not ranked: none")
if unsplit:
    print("multiple choice without option counts (each wrong answer counts against the rule and the set): " + ", ".join(unsplit))
if total is not None:  # one mark per item, all done alone: the right answers add up to the class total
    right = sum(num(r, "sat") - num(r, "wrong") for r in counts.values())
    if any((r.get("mode") or "").lower() == "pairs" for r in counts.values()):
        print("class total: NOT RUN (pair work puts one answer on two sheets)")
    else:
        print(f"class total: {right} right answers against {total}: " + ("match" if right == total else "DIFFERENT, ask Andrii"))
EOF
```

5. Read the output in this order.
   - **Held for Andrii** comes first. An item that at least four in five of its sheets got wrong is
     a possible item defect (an ambiguous item, a second right answer or a wrong key) before it is a
     learning gap. List it with the commonest wrong answer, if he tallied one, and in Claude Code
     ask `test-coverage-auditor` whether a second answer is defensible. Frame-adjacent and excluded
     items wait too. Andrii decides each one: `cleared`, a recode, or a defect for
     `teacher-format-test` to fix in the next paper.
   - **The rule, lexis-set and gap-job tables** rank individual work by rate: wrong answers over
     answers, across the code's items. They show where the class lost marks, not who lost them. A
     code with one item is weak evidence. Gap jobs: A auxiliary, N negative, P preposition, T article.
   - **"Share as"** applies step 7: a figure that would describe one or two learners reads "fewer
     than 3".

**Check the check.** Before trusting the join, plant two defects in copies of `counts.tsv`, one at a
time. A row with more wrong answers than sheets must stop it with "FIX THE COUNTS FIRST". An item at
6 wrong of 7 must appear under "held for Andrii" as a possible item defect. A join that stays quiet
is blind: do not use it.

## 4. The learners' own two rules
- After a practice paper, each learner writes two rules to revise, from the codes Andrii reads out
  for the items they missed (UoE plan, line 33). Those sheets stay with the learners.
- If Andrii shares a tally of the codes the class chose (how many chose each code), compare it with
  the class rates:
  - **agreement:** codes the class chose often that also have high rates;
  - **blind spots:** rules with a high rate that few chose;
  - **sent to the wrong rule:** codes chosen because the printed matrix credited an item that the
    checked matrix recodes (the auditor's "Revision risk" line lists these items). In October, a
    learner who missed gap 1, a preposition gap the key credits to G13, would have been sent to
    revise G13. List each such item with its printed code and what it really tests, as a correction
    Andrii can read out to the class. No learner is named.
- **Per-learner two rules (optional, private).** Only when Andrii asks, with the marks in his
  evidence folder or private sheet under codes. For each code, take the rules of the items that
  learner missed by the checked matrix; with the chosen option letters, a multiple-choice miss counts
  for its rule only when the option has the wrong form. Name the two rules with the most misses, and
  break a tie with the rule the class missed more. Write them back next to the marks, in the same
  private place, after `account-check` and on his yes. Andrii gives each learner their rules on paper,
  as in S7.

## 5. Class priorities
- **Choose the top one or two rules.** A short remedial stage cannot fix everything. Weigh:
  - **frequency:** the rule's rate over its individual items, from the join. Prefer a rule with two
    or more items. One item is weak evidence: name it, and let Andrii choose;
  - **impact:** the next lessons build on the rule or contrast with it, or the next test will test it
    again. Unit 39 (present perfect continuous) builds on the present perfect simple rules and the
    plan's "simple vs continuous (how many vs how long)" contrast (learning plan, lines 32–34). Unit
    41 (future forms) includes the present continuous for arrangements ("Is she meeting me at the
    station?", MyGrammarLab key, line 829).
  - Writing and speaking evidence (band counts, codes noted while marking) supports a rule. Report it
    beside the rate, never added into it.
- **Never a priority:** a rule the plan marks not tested, an item held for Andrii, or pair or
  supported work on its own.
- **Anchor each priority to a real slot:** the lesson, its date and its folder title from the
  schedule. The October schedule ends with test week. Until Andrii adds the next lessons, name the
  slot from the learning plan (Unit 39, then Unit 41 after the tests, line 34) and ask him for the
  date. Never invent a lesson or a date.
- **Lexis:** the lexis sets with the highest word-error rates go to `quizlet-set-builder` as one
  targeted revision set for the class, by V code, with the items the class missed most and where each
  was drilled. Never a set named after a learner.
- **An exam routine is not a rule.** Right words written as two words or misspelt call for a routine
  to rehearse (one word per gap; check the spelling). List it apart from the grammar priorities.

## 6. Hand to the remediation planner
`celta-error-remediation-planner` starts from a logged watch-list and needs a rule-coded list to work
from. Give it this one, with the next slot. Use the "share as" figures, because its output goes into
lesson materials.

```text
Watch-list · Grade 10 · <paper>, marked <date> · class-level, no learner named
| priority | type | code and meaning | items | rate (share as) | form or word | commonest wrong answer | next slot |
Held, not for remediation: <item: why> · Exam routine: <one word per gap, spelling>
```

- Type is grammar or lexis, or the criterion's area for writing and speaking (discourse,
  pronunciation).
- The planner designs the remedial stage: clarification, drill and controlled practice. This skill
  designs none.
- Its "personalise to the learners who made the error" stays class-level here: the target is the
  class. If Andrii wants learner targets, he picks them from his private files.
- Its watch-list lives in his private files, never here.
- In Codex, or without the account skill: NOT RUN. Give Andrii the watch-list for a Claude session.

## 7. Aggregates only, as edits Andrii approves
- **Outside his private files** (the learning plan, the planning snapshot, the watch-list, a
  handoff):
  - no learner name, code, mark, total, attendance figure, tier or version;
  - no figure that describes one or two learners, on either side: it reads "fewer than 3" (the
    join's "share as" column);
  - no group smaller than three: a pair, a trio, the learners who chose a code.
- **The learning plan:** propose the class priorities as an edit to its "How progress is checked"
  section (line 78), given as file, line, old text and new text, such as "Class priorities after
  the tests of <dates>: <code> (<meaning>) → <lesson>; lexis <V code> → Quizlet set <title>". Andrii
  applies it, or asks Claude to through `google-workspace` after `account-check`.
- **The planning snapshot:** lesson plans read the class-level priorities from
  `PLANNING_SNAPSHOT.md` in the evidence folder (Week 2 plan, line 88; L22 plan, line 5). Offer the
  same aggregates as its new dated entry. On his Mac, write it only on his yes. In a cloud session,
  hand him the text.
- **This repository:** nothing. A handoff to Codex (`codex-handoff`) carries codes, items and the
  "share as" figures, never learner-level data. Before any commit that might carry this work, run
  `learner-data-guard`.
- **The scan.** Save the text that will leave (the report, the watch-list, the plan edit) in the
  scratch folder as `shared.txt` and search it:

  ```bash
  grep -n -E '<learner-code pattern>|[0-9]+ ?/ ?(<paper totals>)\b' shared.txt
  ```

  Use Andrii's own code pattern (ask him; for example `\bL[0-9]+\b`) and the paper's totals (for the
  October practice paper, `34|18|16`). Read every hit. Remove a learner code or a learner's total;
  a wrong-over-answers figure that only looks like a total stays. If names reached the session,
  search for each with the Grep tool, never on a command line. Then read every number: each one
  covers three or more learners, or reads "fewer than 3".

## Report
```text
Test results to revision · <paper> · marked <date> · read <date> as <Google account, or "counts typed by Andrii">
Input: class-level counts, or per-learner marks read in <private place, by title> · <n> sheets · class of <n>
Arithmetic: pass, or <each failed check> · class total: match, DIFFERENT or NOT RUN
Matrix: recomputed by test-coverage-auditor, by its method here, or as printed in the key (not recomputed)
Held for Andrii:
| item | wrong/sat | why (possible defect, frame-adjacent, excluded) | commonest wrong answer |
Rules, individual work:
| code and meaning | items | wrong/answers | rate | share as | writing or speaking evidence |
Lexis sets: | code | items | word errors/answers | rate | share as |
Gap jobs: | job | gaps | wrong/answers | rate | share as |
Not ranked: pair or supported work <items> · multiple choice without option counts <items>
Two-rules tally: agreement <codes> · blind spots <codes> · sent to the wrong rule <item: printed code → what it tests>
Class priorities: 1. <code, meaning> · <items, rate> · <next slot: lesson, date, folder title> · 2. …
Hand-offs: remediation planner <sent, or NOT RUN> · Quizlet <V codes> · teacher-format-test <item defects for the next paper>
Learning-plan edit (Andrii approves): | file | line | old text | new text |
Planning snapshot: <entry, written on his yes, or handed over>
Privacy scan: <command, hits read> · NOT RUN: <step: why>
```

The report is for Andrii. Anything copied out of it uses the "share as" figures, and band counts
stay in his private files.

## Done when
The counts pass the arithmetic check, so no item has more wrong answers than sheets (7 at most in
October). The matrix status is stated, and every recode cites the auditor or the method. Every held
item is listed for Andrii before any rate is read as a learning gap. Every priority cites its rule
code, its items and a real next slot, or Andrii has been asked for the date. The hand-offs are sent
or marked NOT RUN. The learning-plan edit and the snapshot entry hold only aggregates over three or
more learners. The scan finds no name, learner code or learner total in the text that leaves.
Nothing from this work went into this repository. The routing evals pass
(`SKILL_EVAL_ONLY=test-results-to-revision npm run eval:skills`).
