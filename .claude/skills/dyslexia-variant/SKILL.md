---
name: dyslexia-variant
description: >-
  Use when a student-facing file (handout, tier handout, test paper, cards, domino or game sheet) is
  made or gets a new version, and when asked which resources lack a dyslexia version, such as "make
  the dyslexia version of the December test", "which handouts have no dyslexia version", "does the
  dyslexia sheet still match V23" or "print the dyslexia cards". Builds the same-version dyslexia
  partner from the pack's single content source, using the house spec measured from files Andrii
  accepted, then reports parity on tasks, items, numbering, options, answers and instructions, and A4
  page fit. Packs stay in Andrii's private Drive, and nothing records who uses the partner.
---

# Dyslexia variant

The Grade 10 learning plan promises that every student resource has a dyslexia-friendly version:
"larger type, cream paper, more space". A partner that drops an item, renumbers a task or changes an
answer gives one learner a different lesson, or a different test. So the partner is generated from
the same source as the standard file, never retyped, and it is checked item by item and page by page
before anyone prints it.

This skill covers print and screen-shared student files. Web pages belong to `learning-page-gate`.
The base handout design belongs to the account skill `celta-handout`. `lesson-pack-gate` reports
missing partners when it checks a pack, and `teacher-format-test` calls this skill for a test paper's
partner.

## Where the files live
- Lesson packs live in the lesson folders in Andrii's private Google Drive: the standard file, its
  partner, and the pack's content source or build script. Work on a downloaded copy in a private
  folder outside this repository.
- The finished partner goes back into the same Drive lesson folder, next to its standard file. Run
  the account skill `account-check` before any Drive write, so the right Google account is named.
- Drive folder and file IDs stay in the untracked `.env.local`, as `learner-data-guard` sets out. Name
  a folder by its title, never by a link or an ID.
- The parity report goes to Andrii in the chat or into the pack's private notes, never into this
  repository.
- Who uses the dyslexia version is learner data (dyslexia status). No file name, shared document,
  report, repo file, commit message or handoff says which learner uses it. Before anything from this
  work lands here (a fixture, a handoff, a page built from a pack), run `learner-data-guard`: its
  static rules live in `tests/lib/learner-data.mjs`, and its `learner-privacy-screen` subagent reads
  what a pattern cannot.

Codex sees this skill through `.agents/skills`, but not the subagent, the account skills or the Drive
connector. In Codex, run the parity method in section 4 yourself, work on the files Andrii supplies,
and mark anything you could not open NOT RUN.

## 1. Scope
- Every new or re-versioned student-facing file gets a same-version partner: handouts, each tier or
  route handout (each counts separately), test and exam-practice papers, cards, dominoes and game
  sheets. Next in line: the December test paper and new skills-lesson files.
- A lesson with no student file needs none. The Unit 36–38 grammar lessons had "No handout". Teacher
  files (plans, keys, guides) and the projected deck are not student resources.
- Older files get a partner only for lessons Andrii says he will teach again. List the candidates and
  let him choose; never backfill on your own. On the 29 Oct manifest, 8 of 25 standard student files
  had a partner, and most gaps belong to lessons already taught.
- The learning plan says "every student resource"; the course overview says "dyslexia versions where
  made". Until Andrii settles the wording, follow the scope above and list the mismatch as an owner
  decision.

**Which resources lack a partner?** List each lesson folder (the Google Drive connector, or the private
knowledge base's `lesson_manifest.json` when a session has one). Parse the names
(`Type – Focus – Topic – variant – Vn.ext`) and pair each standard student file with its partner by
lesson, type and variant. A partner's variant is the standard variant plus the word "dyslexia" (one
accepted file reads "dyslexia, final"). Report standard files with no partner, and partners whose Vn
differs. In Claude Code the `dyslexia-parity-checker` subagent runs this inventory read-only.

## 2. House spec (measured, not invented)
Base typography belongs to `celta-handout` section 3. Quoted for Codex: sans-serif; body 12–14 pt,
never below 12 pt; line spacing at least 1.5; bold as the only emphasis; dark text on white or cream;
50–75 characters per line. Only the dyslexia differences live here.

Measured on 5 Nov 2026 from the CSS of the accepted dyslexia HTML files. The present perfect adverbs
handout V8, the L21 line-graph cards V4 and the L22 line-graph domino V2 share one style. The Use of
English exam-practice sheet V1 layers a dyslexia block over its standard sheet's CSS, so the right-hand
column comes from that standard sheet. Line length was measured by rendering in Chromium (Liberation
Sans, which has Arial's metrics).

| Token | Accepted dyslexia value | UoE V1 standard sheet |
|---|---|---|
| Font | Arial, then Verdana or Helvetica, sans-serif | Arial, Helvetica |
| Task text | 13 pt for instructions, items, options and prompts | items 10.4 pt, options 9.6 pt |
| Line height | 1.5 | 1.3 |
| Letter and word spacing | +0.03 em and +0.12 em in the shared style; none in UoE V1 | none |
| Paper | cream page `#fbf7ec`, ink `#1d2a33`; UoE V1 page `#fdf8e8`, ink `#0b1f2e` | white page, ink `#0b1f2e` |
| Line length | 180 mm column (15 mm side margins), about 76 characters; UoE V1 about 87 | about 110 characters |
| Headings | title 21–24 pt; sections 15–16 pt under a 3 px rule; sub-sections 14 pt; UoE V1 title 17 pt | title 15 pt |
| Emphasis | bold only; italics switched off (`i` set to normal); labels in sentence case | label in capitals |
| Answer space | items 5 mm apart; choice options in two columns; gaps at least 30 × 6 mm; answer lines 7–8 mm; tick boxes 6 mm | items 2.4 mm apart; options in four columns; gaps 22 × 4 mm |
| Chunks | target chunks on a shaded band (`#ece5d0`, adverbs V8) | not used |
| Instructions | on their own line; the shared style puts them in a pale box (`#eef3f6`) with a 5 px blue bar (`#2459a8`) on the left, UoE V1 keeps a plain line | plain line |
| Small text | graph subtitles, data tables and tile labels 10–11.5 pt; footer 8.5–9 pt (UoE V1 6.6 pt) with spacing reset to 0 | footer 6.6 pt |
| Length | more pages: UoE V1 6 against 3; adverbs V8 6 against 2 | |

- Never make the partner smaller than its standard. If the standard already uses 13 pt or more, keep
  its size.
- Both measured styles run at or past the base 50–75 characters per line. A narrower column is
  Andrii's decision, not the builder's, because it changes the page count he has accepted.
- Not measured: the L15 and L17 partners are PDFs, and the L21 and L22 handout partners were not
  opened. Before reusing a style from one of them, run `pdffonts` and `pdfinfo` on a local copy, or read
  its CSS, and add the values here in a reviewed commit.
- Outside guidance, such as the British Dyslexia Association's Dyslexia Style Guide, is not in the
  knowledge base. It is a recommendation for Andrii to read, not a checked source. Never change an
  accepted token because of it on your own.

## 3. Build the partner
1. **Find the single content source.** A build script or data file that generates the standard file
   should generate the partner too. The present perfect adverbs pack's `work/build_pron_pp_v1.cjs`
   builds both versions and self-tests page fit for both.
2. **No build script, HTML standard:** layer the dyslexia stylesheet over the standard file's own
   markup and let a script insert the page breaks. Do not rewrite the markup by hand (section 6 shows
   what that does).
3. **Only a PDF or a document:** export a document to PDF, extract the text by script
   (`pdftotext -layout`, as in section 4) and generate the partner from that text. Never retype. Tell
   Andrii the pack has no single source, so the next version can have one.
4. **Keep everything the learner works with:** task numbers and order, items, options and their
   letters, the answers the key marks, instructions word for word, worked examples, phrase banks, the
   same images with their alt text and credits, and the source and AI-use lines. If a shorter
   instruction would help, propose it to Andrii and list it in the report; never make it silently.
5. **Change only the presentation,** to the tokens in section 2: 13 pt task text, line height 1.5,
   the extra spacing, the cream page, larger answer spaces, shaded target chunks, choice options in
   two columns, instructions on their own line, left-aligned text (never justified), no italic blocks.
6. **Keep screen-share safety** (`celta-handout`, quoted for Codex): no answers, stress keys, CCQs,
   tier assignments or teacher notes on a student file. The footer carries the source line, the
   AI-use line and "Dyslexia-friendly version".
7. **Name it** like its standard file, with "dyslexia" added to the variant and the same Vn:
   `Student handout – Focus – Topic – dyslexia – V3.html`, or `Cards – Focus – Topic – game dyslexia –
   V17.html`. When the standard moves to a new Vn, the partner moves with it. The format follows
   Andrii's accepted practice and need not match: L21 and L22 pair a standard PDF with a dyslexia HTML
   file.

## 4. Check parity
Every difference between the two texts is a defect unless it is on the allowed list below. In Claude
Code, hand the pair to the `dyslexia-parity-checker` subagent for the item-by-item report. It reads
the files cold, so it sees what is there rather than what the builder meant, and it is read-only, so
it can run while you render the pages. In Codex, or for a quick first pass, run this yourself. If
either file is a PDF, compare PDF with PDF: print the HTML file first (section 5).

```bash
python3 -I - standard.html partner.html <<'EOF'
import difflib, re, subprocess, sys
from bs4 import BeautifulSoup, Comment, Doctype
BLOCKS = {"[document]", "body", "section", "article", "main", "header", "footer", "aside", "nav", "div", "p", "ul", "ol",
          "li", "dl", "dt", "dd", "table", "tr", "td", "th", "caption", "figure", "figcaption", "blockquote", "pre",
          "h1", "h2", "h3", "h4", "h5", "h6"}
def tokens(line):  # folds case, curly quotes, dashes and spaces; drops the allowed "Dyslexia-friendly version" label
    line = line.translate(str.maketrans("‘’“”–— ", "''\"\"-- "))
    line = re.sub(r"\s*[·|]?\s*dyslexia.friendly( version)?", "", line, flags=re.I)
    return re.findall(r"[\w']+|[^\w\s]", line.lower())
def pages(path):  # each page as a list of lines, one line per block
    if path.lower().endswith(".pdf"):
        r = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True, text=True)
        text = re.sub(r"(\w)-\n\s*(\w)", r"\1\2", r.stdout if r.returncode == 0 else "")
        return [page.split("\n") for page in text.split("\f") if page.strip()]
    soup = BeautifulSoup(open(path, encoding="utf-8").read(), "html.parser")
    for t in soup(["head", "script", "style", "template", "noscript"]) + soup.select("[hidden]"):
        t.extract()
    out = []
    for page in soup.select(".page") or [soup.body or soup]:
        lines, owner = [], None
        for s in page.find_all(string=True):
            if isinstance(s, (Comment, Doctype)):
                continue
            block = next(p for p in s.parents if p.name in BLOCKS)
            if block is not owner:
                lines.append("")
                owner = block
            lines[-1] += " " + s
        out.append(lines)
    return out
key = lambda line: " ".join(tokens(re.sub(r"\d+\s*/\s*\d+", "#/#", line)))  # page numbers n/m masked
def furniture(pgs):  # lines with words that sit on every page: running heads, footers, repeated instructions
    sets = [{key(l) for l in pg if re.search(r"[a-z]{2}", key(l))} for pg in pgs]
    return set.intersection(*sets) if len(sets) > 1 else set()
A, B = pages(sys.argv[1]), pages(sys.argv[2])
furn = furniture(A) | furniture(B)
def words(pgs, path):
    w = [t for pg in pgs for l in pg if key(l) not in furn for t in tokens(l)]
    if len(w) < 20:
        sys.exit(f"NOT RUN: {path} has no usable text layer")
    return w
a, b = words(A, sys.argv[1]), words(B, sys.argv[2])
for k in sorted(furn):
    on = [sum(any(key(l) == k for l in pg) for pg in P) for P in (A, B)]
    print(f"furniture «{k}» on standard {on[0]}/{len(A)} pages · partner {on[1]}/{len(B)}")
runs = []  # differing runs, merged when fewer than 3 words apart
for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if op != "equal":
        if runs and i1 - runs[-1][1] <= 2:
            runs[-1][1], runs[-1][3] = i2, j2
        else:
            runs.append([i1, i2, j1, j2])
flat = lambda ws: re.sub(r"[-·•|]", "", "".join(ws))
real = [r for r in runs if flat(a[r[0]:r[1]]) != flat(b[r[2]:r[3]])]  # spacing- or separator-only runs are noise
for i1, i2, j1, j2 in real:
    print(f"standard «{' '.join(a[i1:i2]) or '-'}» · partner «{' '.join(b[j1:j2]) or '-'}» · after «{' '.join(a[max(0, i1 - 6):i1])}»")
print(f"pages: standard {len(A)} · partner {len(B)} · words compared {len(a)} / {len(b)} · differing runs {len(real)}")
EOF
```

It prints each line that sits on every page (running heads, footers, repeated instructions) with the
pages it is on, then each run of words that differs, with the words before it. Tested on 5 Nov 2026
against planted defects: a dropped option, a reworded item, a changed number in a tile, and a
repeated instruction missing from one page or from all of them were each reported, while page
splits, spacing and separators caused no false alarms, PDF and HTML routes gave the same result,
and 9,600 words took about a second. A PDF without a text layer prints NOT RUN.

- **Allowed (page splits only):** a heading repeated with "(continued)" or a new item range, a
  running head, an instruction repeated at the top of a page, page numbers, and the
  "Dyslexia-friendly version" label. A line that sits on every page of one version must sit on every
  page of the other (`standard 2/2 · partner 2/3` means a page lost it).
- **A defect:** a missing, added, reworded or reordered task, item or option; a changed number,
  answer, instruction, worked example, phrase bank or source line. Quote both texts.
- **Answer spaces are not text,** so the word diff cannot see them. Count them per task in both
  versions: gap and line elements in the HTML markup, or the drawn lines and boxes on the page renders
  of a PDF.
- **Keys:** if the teacher key numbers the items, both versions keep the numbering the key marks.
- **Simplifications are Andrii's call.** Report each one; never accept one yourself.
- On a test pack, run `test-coverage-auditor` beside the parity check: the partner must carry exactly
  the items the coverage matrix scores.

## 5. Page fit (measure, then look at every page)
Fixed-height pages with `overflow:hidden` (the L21, L22 and UoE files use them) cut text silently: the
clipped page still looks full. So measure first. For an HTML file, save this as `fit.cjs` in your
working folder and run `node fit.cjs partner.html partner.pdf`. It needs Playwright with Chromium, and
Node finds it only from the script's own folder: in that working folder run
`npm i playwright && npx playwright install chromium` once (as `site-verify` describes), or run the
script as `NODE_PATH=<repo>/node_modules node fit.cjs …` when the repo has Playwright installed. It
opens the file the way Andrii does, from disk.

```js
// Print an HTML student file to A4 PDF and name the pages that clip or spill, measured in print layout.
const { chromium } = require("playwright");
const path = require("path");
(async () => {
  const [src, out] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + path.resolve(src));
  await page.emulateMedia({ media: "print" });
  const a4 = (297 * 96) / 25.4; // px
  const boxes = await page.$$eval(".page", (els, a4) => els.map((el, i) => {
    const notes = [];
    if (el.scrollHeight > el.clientHeight + 1) notes.push("content clipped");
    if (el.getBoundingClientRect().height > a4 + 1) notes.push("taller than A4");
    return notes.length ? `page ${i + 1}: ${notes.join(", ")}` : null;
  }), a4);
  await page.pdf({ path: out, format: "A4", preferCSSPageSize: true, printBackground: true });
  console.log(`page boxes ${boxes.length} · problems: ${boxes.filter(Boolean).join("; ") || "none"}`);
  await browser.close();
})();
```

1. Fix every clipped or spilling page before anything else.
2. `pdfinfo partner.pdf` gives the page count and size (A4 is 595 × 842 pt). More PDF pages than page
   boxes means a page spilled.
3. `pdftoppm -r 100 -png partner.pdf partner` writes one image per page. Open every page image of both
   versions. Check that no item is split across pages, no heading sits alone at the foot of a page,
   the footer is clear of the text, every answer space is there, and the images and their credits are
   there. In Claude, the account skill `pdf` can read and render PDFs too.
4. Add both page counts to the plan's materials line, as the adverbs plan did (a 2-page standard
   handout beside a 6-page partner). The plan is Andrii's file in Drive, so propose the line for him
   to approve.
5. Physical print checks (paper colour, cutting lines, the room) stay NOT RUN until Andrii confirms
   them.

## 6. What the accepted files teach
- **Shared CSS does not keep the text in step.** The UoE V1 partner reuses its standard sheet's
  stylesheet, but its markup was rewritten for six pages. Read side by side on 5 Nov 2026, its 34
  items and their options match the standard, while one instruction was reworded, one was added, the
  Part 2 worked example was shortened and four headings were reworded or dropped. Those may be good
  simplifications. The point of the parity check is that Andrii sees each one.
- **A clipped page looks full.** In a test page with a fixed height, 15 of 40 lines vanished and the
  render looked like an ordinary full page. The measurement in section 5 caught it.
- **Formats differ by design.** L21 and L22 pair a standard PDF with a dyslexia HTML file, so compare
  like with like before diffing.

## Report
```
Dyslexia variant: <lesson> · <resource> · standard Vn (format, pages) · partner Vn (format, pages)
Built from: <content source or script> · Spec: house tokens, departures: <none or list with reasons>
Parity: differing runs <n> · allowed page splits <n> · defects <n> · NOT RUN: <pairs and why>
| where (task.item or repeated line) | standard (quoted) | partner (quoted) | kind (missing / added / reworded / reordered / answer differs) |
Answer spaces: <task: n/n, …>
Page fit: clipped or spilling pages <none or list> · page images looked at <n of n> · counts proposed for the plan: <line>
Inventory (when asked): standard student files <n> · with a same-version partner <n> · missing: <titles> · Vn differs: <titles>
Owner decisions: <simplifications, older lessons to backfill, line length>
```
Name the kinds of data, never a learner. "Parity clean" covers only the pairs that ran.

## Done when
Every standard file in scope has a same-version partner, or Andrii has said which older ones to skip;
the parity check finds no defect, so every remaining difference is an allowed page split or a change
Andrii accepted; no page clips or spills, and every page image of both versions has been looked at;
both page counts are proposed for the plan; and nothing written anywhere says which learner uses the
partner.
