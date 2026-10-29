// Claim provenance: every number or credential word on the page must have a ledger entry,
// and every ledger entry must still be on the page and cite evidence that exists.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { ROOT, readSite } from "./lib/html.mjs";

const ledger = JSON.parse(readFileSync(path.join(ROOT, "web/claims-ledger.json"), "utf8"));
const { doc } = readSite();
const TODAY = process.env.CLAIMS_TODAY || new Date().toISOString().slice(0, 10);

// Digits not glued to a letter (so C1, B2B, L74 are labels, not claims), with their unit.
const NUMBER = /(?<![A-Za-z0-9])\d+(?:[.,]\d+)?(?:\/\d+|%|\+|h\b)?/g;
const CREDENTIAL_WORD = /\b(verified|certified|scheduled|completed|grade [A-F])\b/i;

// Visible text plus image alt text: an alt like "certificate, Course 1 Part 1" is a claim about the evidence.
const altChunks = doc.elements.filter((e) => e.name === "img" && e.attrs.alt).map((e) => ({ value: e.attrs.alt, line: e.line, ancestors: [...e.ancestors, e] }));
const chunks = [...doc.text, ...altChunks].filter((t) => !t.ancestors.some((a) => /^(tel|mailto):/.test(a.attrs.href || "")));
const classesOf = (t) => new Set(t.ancestors.flatMap((a) => (a.attrs.class || "").split(/\s+/)));
const within = (entry, t) => !entry.where || classesOf(t).has(entry.where.class);
const covers = (entry, t, token) => t.value.includes(entry.text) && entry.text.includes(token) && within(entry, t);

test("every number and credential word on the page has a ledger entry", () => {
  const uncovered = [];
  for (const t of chunks) {
    const tokens = [...t.value.matchAll(NUMBER)].map((m) => m[0]);
    const word = t.value.match(CREDENTIAL_WORD);
    if (word) tokens.push(word[0]);
    for (const token of tokens) {
      const known = [...ledger.claims, ...ledger.ignore].some((e) => covers(e, t, token));
      if (!known) uncovered.push(`line ${t.line}: "${token}" in "${t.value}"`);
    }
  }
  assert.deepEqual(uncovered, [], "add these to web/claims-ledger.json with their evidence status");
});

test("every ledger entry is still on the page", () => {
  const gone = [...ledger.claims, ...ledger.ignore].filter((e) => !chunks.some((t) => t.value.includes(e.text) && within(e, t)));
  assert.deepEqual(gone.map((e) => e.id || e.text), [], "remove or update ledger entries whose text left the page");
});

test("ledger entries are well-formed and cite evidence that exists", () => {
  const problems = [];
  const ids = new Set();
  for (const c of ledger.claims) {
    if (ids.has(c.id)) problems.push(`${c.id}: duplicate id`);
    ids.add(c.id);
    if (!(c.status in ledger.statuses)) problems.push(`${c.id}: unknown status ${c.status}`);
    if (c.status === "backed" && !c.evidence?.length) problems.push(`${c.id}: backed without evidence`);
    if (c.status !== "backed" && c.status !== "plan" && !c.note) problems.push(`${c.id}: ${c.status} needs a note`);
    for (const e of c.evidence || []) if (!existsSync(path.join(ROOT, e.file))) problems.push(`${c.id}: evidence file missing ${e.file}`);
  }
  assert.deepEqual(problems, []);
});

test("no claim is past its valid_until date unless marked stale", () => {
  const expired = ledger.claims.filter((c) => c.valid_until && c.valid_until < TODAY && c.status !== "stale");
  assert.deepEqual(expired.map((c) => `${c.id} (valid_until ${c.valid_until})`), []);
});

test("claim status summary", (t) => {
  const counts = {};
  for (const c of ledger.claims) counts[c.status] = (counts[c.status] || 0) + 1;
  t.diagnostic(`claims by status: ${JSON.stringify(counts)}`);
  for (const c of ledger.claims.filter((c) => ["conflict", "stale"].includes(c.status))) t.diagnostic(`${c.status}: ${c.id} — ${c.note}`);
});
