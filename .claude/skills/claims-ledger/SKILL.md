---
name: claims-ledger
description: >-
  Use before adding, changing or checking any number, date, score, hour count, grade, employer,
  result or credential word on Andrii's site, such as "change the PTE score", "add CELTA completed",
  "is the 624 hours claim accurate" or "update my credentials"; also when the claims test fails or a
  dated claim may have expired. Every factual claim maps to in-repo evidence in
  web/claims-ledger.json with a status (backed, partial, conflict, unbacked, stale, plan), and the
  agent never invents, picks or rewords a figure to make a check pass.
---

# Claims ledger

A portfolio is a set of claims about a real person. A wrong number on it reaches employers and
students as the owner's own statement. A plausible guess is worse than a blank: the reader acts
on it without checking.

## The rule
Nothing goes on the page as fact unless the ledger can show where it comes from. The ledger records
**what the evidence shows, not whether the claim is true**. An `unbacked` claim may be true. It is
the owner's to source or reword, never the agent's to "fix".

## Statuses
| Status | Meaning | Agent action |
|---|---|---|
| `backed` | an in-repo evidence file states it | none |
| `partial` | evidence covers part (e.g. 1 of 3 certificates) | the note says which part is missing |
| `conflict` | sources disagree with the page or each other | report both numbers to Andrii; never pick one |
| `unbacked` | no in-repo evidence | ask for a source or a rewording |
| `stale` | was true or planned, but its date has passed | ask for the new wording (taken / result / new date) |
| `plan` | a future target the page labels as a target | re-check when the year arrives |

These map onto the owner's `evidence-quality-checker` statuses: backed = Verified, partial =
Partially verified, conflict = Contradicted, unbacked = Unverified (or Fabrication risk when it is
suspiciously specific and untraceable), stale = Outdated. Exercise material on learning pages is
Constructed and stays out of the ledger.

**The metric's name is part of the claim.** "280% ROI improvement" and "+280% ROMI" are different
claims: return on marketing investment is not return on investment. So are "C1" and "84/90", and
"completed" and "completing".

**Graphics carry claims too.** A logo, certification mark, flag or chart says something about
Andrii, and its alt text repeats it. On 29 Oct 2026 the Beinf card showed another company's
wordmark under the Beinf name (`logo-beinf`, conflict). Check each image against the name beside it,
and keep provider marks for qualifications not yet held clearly labelled as targets.

## Adding or changing a claim (P2)
1. **Find the evidence first**: a certificate, score report, the CV (`assets/Andrii_Volnianskyi_CV.pdf`,
   which has image-only pages, so render them to read: `pdftoppm -r 80 -png <pdf> /tmp/cv`), or
   an employer document. Read the actual file. Never accept a summary of it, including your own
   earlier one.
2. **Before publishing evidence, check it for personal data.** The PTE score report shows date of
   birth, test-taker and registration IDs (registered as `pii-pte-report`). Redact those; keep the
   name, scores and date.
3. **Write the entry**: `text` exactly as it appears on the page, `kind`, `status`, `evidence`
   (`file` plus what it `says`, quoted from the document), and a `note` for anything other than
   `backed`. Add `where: {"class": "..."}` when the same text means different things in two places
   (for example two "Final grade A" badges). Add `valid_until` to anything that expires.
4. **Propagate.** Before calling a claim fixed, sweep every place it lives: the page text, alt
   text, `<meta>` description, the CV, and every ledger entry whose note says "Repeats …". Owner
   lesson (`claim-provenance-ledger`): in August 2026 a wrong "300% ROMI" sat in four summary
   sentences of a CV and survived the first two fixes, because each fix corrected one field.
5. Run `npm test`. The claims suite fails on any visible number or credential word with no entry,
   on entries whose text left the page, on missing evidence files, and on an expired `valid_until`
   not marked `stale`. It scans `index.html` only, because learning pages are full of exercise
   numbers that are not claims about Andrii. A claim about him on another page (a bio line, a
   credential badge) needs a hand-written entry and a check by `claims-auditor`.

## What the ledger found on 29 Oct 2026
These are evidence facts for Andrii to act on, not edits to make:
- **624 h / 552 h C2**: the certificates in the repo show 96 h (May 2026) + 108 h (Jun 2024) of
  General English C2 and 72 h of CAE prep (Aug 2024), 276 h in total. The CV says 184 h C2 + 72 h.
  Neither shows 624 h.
- **CAE "scheduled September 2026"**: the date has passed.
- **PTE 84/90**: backed (test date 24 Aug 2024), but the report's validity ended 24 Aug 2026.
  Present-tense "verified PTE Academic C1" needs a date.
- **"General English C2 · Part 2"**: that certificate says "Course 1".
- **30 % sales growth, 280 % ROI, "10+ person team", per-company dates, "60+ lessons", "CELTA
  140 hours"**: no evidence in the repo. The owner's own CVs reportedly say "+30% sales and +280%
  ROMI", so a source probably exists, but the page's "ROI" is a different metric.
- **"Before moving into English teaching, I built and led marketing"**: the page and the CV date
  the tutoring from 2017 and the marketing from 2018, both running to now.
- **Beinf logo**: the image is another company's wordmark.

## Third parties
Linking a real person (a reference, a colleague, a testimonial) is a claim about **them**. Use a
profile only if the profile itself, or that person's employer's page, names the matching employer or
role. A same-name search result or a directory listing is not confirmation. Write "NOT FOUND" rather
than the best-looking guess (owner skill `professional-identity-verified-only`).

## Report
For each changed claim: ledger id, status before and after, the evidence quote, and whether the
owner must act. Give counts by status from the `claim status summary` test diagnostics.
