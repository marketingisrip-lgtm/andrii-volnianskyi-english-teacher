// Learner data in a public repository (the learner-data-guard skill). Andrii's learners are minors, and
// their names, scores and lesson notes belong in his private Google Drive. The rules are narrow and
// structural: a table with filled learner rows, a per-learner folder, a file named as a roster or a
// monitoring log, a Drive or Docs link, and a Drive ID written right after the word "Drive". Long
// tokens on their own are never matched, because the sha256 values in web/privacy-review.json would be
// false positives. Names in prose, judgements beside a name, images and PDFs are left to the
// learner-privacy-screen subagent. Findings give the place, the kind and a count, never the value, and
// a per-learner folder's name is a value, so it is masked even inside a path.
import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { REPO, parse } from "./html.mjs";

export const KIND = {
  folder: "per-learner folder",
  log: "monitoring-log rows",
  scores: "per-learner score table",
  roster: "learner roster",
  logFile: "monitoring-log file",
  rosterFile: "roster or mark-book file",
  link: "Google Drive or Docs link",
  id: "Drive file or folder ID",
};

const SKIP = new Set([".git", "node_modules", "dist", "test-results", ".netlify"]);
// Binary formats: their names are still checked, their bytes are not read.
const BINARY = /\.(?:png|jpe?g|webp|gif|ico|pdf|woff2?|xlsx?|ods|numbers|docx?|pptx?|zip|mp3|m4a|wav|mp4|mov)$/i;
const PROSE = /(?:^|\/)[^./]+$|\.(?:md|markdown|txt)$/i; // tables are read only where tables are written
const DELIMITED = /\.(?:csv|tsv)$/i;

/** Every file a commit could carry: tracked or untracked, minus what .gitignore keeps local. */
function committable(root) {
  const files = [];
  (function walk(dir) {
    for (const name of readdirSync(dir)) {
      const p = path.join(dir, name);
      const st = lstatSync(p);
      // .agents/skills and AGENTS.md are symlinks to files this walk already reads.
      if (SKIP.has(name) || st.isSymbolicLink()) continue;
      if (st.isDirectory()) walk(p);
      else files.push(path.relative(root, p).split(path.sep).join("/"));
    }
  })(root);
  // Ask the real repository's .gitignore (a planted-defect copy has no .git). Without git, check everything.
  const r = spawnSync("git", ["-C", REPO, "check-ignore", "--stdin", "-z"], { input: files.join("\0"), encoding: "utf8" });
  const ignored = new Set(r.status === 0 ? r.stdout.split("\0") : []);
  return files.filter((f) => !ignored.has(f));
}

// The layout planned on the lesson-docs branch (PR #3): 1-1 Lessons/<Student>/YYYY-MM-DD_<Unit>_<Topic>/.
const PER_LEARNER_PARENT = /^(?:(?:1-1|one[ _-]to[ _-]one|individual)(?:[ _-]*lessons?)?|students|learners|pupils|tutees)$/i;
const DATED = /^\d{4}-\d{2}-\d{2}(?:[ _-]|$)/;
const NOT_A_LEARNER = /^(?:<.*>|\{.*\}|[_.].*|templates?|examples?|samples?|shared|common|resources|procedures|avatars?)$/i;

function learnerFolders(files) {
  const found = new Set();
  for (const seg of files.map((f) => f.split("/")))
    for (let i = 1; i < seg.length - 1; i++)
      if (!NOT_A_LEARNER.test(seg[i]) && (PER_LEARNER_PARENT.test(seg[i - 1]) || (/^lessons$/i.test(seg[i - 1]) && DATED.test(seg[i + 1]))))
        found.add(seg.slice(0, i + 1).join("/"));
  return found;
}

const ROSTER_FILE = /(?:^|[^a-z])(?:roster|class[ _-]?list|(?:student|learner|pupil)s?[ _-]?list|attendance|grade[ _-]?book|mark[ _-]?(?:book|sheet))(?:[^a-z]|$)/i;
const DATA_FILE = /(?:^|[^a-z])(?:scores?|results?|marks|grades|students|learners|pupils)(?:[^a-z][^/]*)?\.(?:csv|tsv|xlsx?|ods|numbers)$/i;
const LOG_FILE = /monitoring[ _-]?log/i;
const TEMPLATE_NAME = /template|example|sample/i;

// Table headers, lower-cased. A learner column, or "name" when a column only learners have sits beside it.
const LEARNER_COL = /^(?:(?:student|learner|pupil|tutee|candidate)s?(?: (?:first |full |given )?names?| initials| codes?)?|(?:first |full |given )?names? of (?:the )?(?:student|learner|pupil)s?|учень|учениця|учні|студент(?:ка|и)?|піб|прізвище(?: та ім['’]я)?)$/u;
const NAME_COL = /^(?:(?:first |full |given )?names?|ім['’]я)$/u;
const LEARNER_ONLY_COL = /^(?:tiers?|dyslexi\w*|support(?: needs?)?|sen|send|attendance|absen\w*|homework)$/;
const SCORE_COL = /score|mark|grade|result|points?\b|\bpts\b|band|percent|оцінк|бал|\/ ?\d+|%/u;
const SAID_COL = /^(?:what )?(?:the )?(?:(?:student|learner|pupil|tutee|s|ss)s?|they|he|she) said$/;
// Cells that hold nobody: placeholders, role labels ("Student A"), class-level rows, and fictional people.
const PLACEHOLDER = /^(?:[-–—_.…?x\s]*|<[^>]*>|\{[^}]*\}|\[[^\]]*\]|n\/?a|tbd|todo|e\.?g\.?(?:\s.*)?|(?:the )?(?:student|learner|pupil|name|initials|code)s?(?: [a-z0-9])?)$/i;
const AGGREGATE = /^(?:all|total|totals|sum|average|avg|mean|median|range|min|max|minimum|maximum|class|group|whole class|everyone|overall|count|n ?=)(?![\p{L}\p{N}])/iu;
const FICTIONAL = /\bavatars?\b|\bfictional\b/i;
// Under a bare "Name" header the cell must look like a person's name, so a table of test names passes.
const PERSON = /^\p{Lu}[\p{Ll}'’-]+(?:,? \p{Lu}[\p{Ll}'’.-]*){0,2}$/u;

const norm = (s) => s.replace(/^\uFEFF/, "").replace(/[*_`"“”]/g, "").replace(/\s+/g, " ").trim().toLowerCase();

/** Rows that put a real learner (or what one said) into a table, as [{ kind, line }]. */
function learnerRows(header, rows) {
  const h = header.map(norm);
  let kind = KIND.log;
  let col = h.findIndex((c) => SAID_COL.test(c));
  let byName = false;
  if (col < 0) {
    col = h.findIndex((c) => LEARNER_COL.test(c));
    if (col < 0 && h.some((c) => LEARNER_ONLY_COL.test(c) || SCORE_COL.test(c))) byName = (col = h.findIndex((c) => NAME_COL.test(c))) >= 0;
    if (col < 0) return [];
    kind = h.some((c, i) => i !== col && SCORE_COL.test(c)) ? KIND.scores : KIND.roster;
  }
  return rows
    .filter(({ cells }) => {
      const cell = (cells[col] ?? "").replace(/[*_`]/g, "").trim();
      if (PLACEHOLDER.test(cell) || cells.some((c) => FICTIONAL.test(c))) return false;
      return kind === KIND.log || (!AGGREGATE.test(cell) && (!byName || PERSON.test(cell)));
    })
    .map(({ line }) => ({ kind, line }));
}

// Pipe tables in Markdown or plain text. Code in a fence with a language, and code spans holding a
// pipe (a shell pipeline or a regex), are not tables; a row counts only with the header's cell count.
const FENCE = /^\s*(`{3,}|~{3,})\s*([\w+-]*)/;
const CODE_LANG = /^(?:bash|sh|shell|zsh|console|js|javascript|mjs|cjs|ts|typescript|json|jsonc|yaml|yml|python|py|regex|html|css|diff|toml|ini)$/i;
function pipeTables(text) {
  const tables = [];
  let block = [];
  let fence = null;
  const flush = () => {
    const lines = block.filter((b) => !/^\s*\|?\s*:?-{2,}:?\s*(?:\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(b.text));
    if (lines.length > 1) {
      const cells = (t) => t.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((c) => c.trim());
      const header = cells(lines[0].text);
      tables.push({ header, rows: lines.slice(1).map((b) => ({ cells: cells(b.text), line: b.line })).filter((r) => r.cells.length === header.length) });
    }
    block = [];
  };
  text.split(/\r?\n/).forEach((raw, i) => {
    const f = raw.match(FENCE);
    if (fence) {
      if (f && f[1][0] === fence.mark[0] && f[1].length >= fence.mark.length && !f[2]) fence = null;
      else if (!fence.code) return void (raw.includes("|") ? block.push({ text: raw, line: i + 1 }) : flush());
      return void flush();
    }
    if (f) {
      flush();
      fence = { mark: f[1], code: CODE_LANG.test(f[2]) };
      return;
    }
    const line = raw.replace(/\\\|/g, "/").replace(/`[^`]*\|[^`]*`/g, "");
    if (line.includes("|")) block.push({ text: line, line: i + 1 });
    else flush();
  });
  flush();
  return tables;
}

function splitDelimited(line, sep) {
  if (sep === "\t") return line.split("\t");
  const out = [""];
  let quoted = false;
  for (const ch of line) {
    if (ch === '"') quoted = !quoted;
    else if (ch === "," && !quoted) out.push("");
    else out[out.length - 1] += ch;
  }
  return out;
}

function delimitedTable(text, sep) {
  const lines = text.split(/\r?\n/);
  const first = lines.findIndex((l) => l.trim());
  if (first < 0) return [];
  const rows = lines.slice(first + 1).map((l, k) => ({ cells: splitDelimited(l, sep), line: first + k + 2 })).filter((r) => r.cells.some((c) => c.trim()));
  return [{ header: splitDelimited(lines[first], sep), rows }];
}

function htmlTables(html) {
  const doc = parse(html);
  const textOf = (el) => doc.text.filter((t) => t.ancestors.includes(el)).map((t) => t.value).join(" ");
  return doc.elements
    .filter((e) => e.name === "table")
    .map((table) => {
      const rows = doc.elements
        .filter((e) => e.name === "tr" && e.ancestors.filter((a) => a.name === "table").at(-1) === table)
        .map((tr) => ({ line: tr.line, cells: doc.elements.filter((c) => ["td", "th"].includes(c.name) && c.ancestors.at(-1) === tr).map(textOf) }));
      return { header: rows[0]?.cells || [], rows: rows.slice(1) };
    });
}

const DRIVE_LINK = /\b(?:drive|docs)\.google\.com\/[\w-]/gi;
// "Drive", up to four words such as "folder", "file", "copy" or "ID", then a token of 25 or more characters.
// Drive IDs mix upper and lower case; skill names, file names and sha256 hex do not.
const DRIVE_WORD_ID = /(?<![\w./-])drive(?![\w.])(?:[\s:=(`'"*#/-]+(?:folders?|files?|cop(?:y|ies)|docs?|documents?|sheets?|ids?|links?|under|in|at|is|root|of|the)){0,4}[\s:=(`'"*#/-]+([a-z0-9_-]{25,})/gi;
const isDriveId = (token) => /[A-Z]/.test(token) && /[a-z]/.test(token);

/** Findings as { target, detail } for judge(): place, kind and count in the target, line numbers in the detail. */
export function learnerDataFindings(root) {
  const files = committable(root);
  const folders = learnerFolders(files);
  const shown = (f) => f.split("/").map((s, i, seg) => (folders.has(seg.slice(0, i + 1).join("/")) ? "<learner folder>" : s)).join("/");
  const dirOf = (f) => `${shown(path.posix.dirname(f))}/`;
  const hits = new Map();
  const add = (where, kind, line) => {
    const key = `${where}: ${kind}`;
    hits.set(key, [...(hits.get(key) || []), line]);
  };

  for (const folder of folders) add(dirOf(folder), KIND.folder, null);
  for (const f of files) {
    const base = path.posix.basename(f);
    // The file name may carry the value, so only its folder is shown.
    if (!TEMPLATE_NAME.test(base) && LOG_FILE.test(base)) add(dirOf(f), KIND.logFile, null);
    else if (!TEMPLATE_NAME.test(base) && (ROSTER_FILE.test(base) || DATA_FILE.test(base))) add(dirOf(f), KIND.rosterFile, null);
    if (BINARY.test(f)) continue;
    const text = readFileSync(path.join(root, f), "utf8");
    text.split(/\r?\n/).forEach((line, i) => {
      for (const _ of line.matchAll(DRIVE_LINK)) add(shown(f), KIND.link, i + 1);
      for (const m of line.matchAll(DRIVE_WORD_ID)) if (isDriveId(m[1])) add(shown(f), KIND.id, i + 1);
    });
    const tables = PROSE.test(f) ? pipeTables(text) : DELIMITED.test(f) ? delimitedTable(text, f.endsWith(".tsv") ? "\t" : ",") : /\.html?$/i.test(f) ? htmlTables(text) : [];
    for (const { header, rows } of tables) for (const { kind, line } of learnerRows(header, rows)) add(shown(f), kind, line);
  }
  return [...hits].map(([key, lines]) => {
    const at = [...new Set(lines.filter(Boolean))];
    return { target: `${key} (${lines.length})`, detail: at.length ? `line ${at.join(", ")}` : "names withheld: list the folder to see them" };
  });
}
