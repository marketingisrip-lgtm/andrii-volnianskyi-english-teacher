// Local JSON storage + Quizlet import/export helpers (no network; Quizlet has no public API).
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

export const DATA_DIR =
  process.env.QUIZLET_MCP_DIR || path.join(os.homedir(), ".quizlet-mcp");
const FILE = () => path.join(DATA_DIR, "sets.json");

async function load() {
  try {
    return JSON.parse(await fs.readFile(FILE(), "utf8"));
  } catch (e) {
    if (e.code === "ENOENT") return { sets: [] };
    throw e;
  }
}
async function save(db) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(FILE(), JSON.stringify(db, null, 2));
}

export function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "set";
}

export function normalizeCards(cards) {
  return cards
    .map((c) => ({ term: String(c.term ?? "").trim(), definition: String(c.definition ?? "").trim() }))
    .filter((c) => c.term && c.definition);
}

export async function listSets() {
  const db = await load();
  return db.sets.map(({ id, title, description, cards, updatedAt }) => ({
    id, title, description, cardCount: cards.length, updatedAt,
  }));
}

export async function getSet(id) {
  const db = await load();
  const set = db.sets.find((s) => s.id === id);
  if (!set) throw new Error(`Set "${id}" not found`);
  return set;
}

export async function createSet({ title, description = "", cards = [] }) {
  const db = await load();
  let id = slugify(title);
  let n = 2;
  while (db.sets.some((s) => s.id === id)) id = `${slugify(title)}-${n++}`;
  const now = new Date().toISOString();
  const set = { id, title, description, cards: normalizeCards(cards), createdAt: now, updatedAt: now };
  db.sets.push(set);
  await save(db);
  return set;
}

export async function addCards(id, cards) {
  const db = await load();
  const set = db.sets.find((s) => s.id === id);
  if (!set) throw new Error(`Set "${id}" not found`);
  const existing = new Set(set.cards.map((c) => c.term.toLowerCase()));
  const fresh = normalizeCards(cards).filter((c) => !existing.has(c.term.toLowerCase()));
  set.cards.push(...fresh);
  set.updatedAt = new Date().toISOString();
  await save(db);
  return { set, added: fresh.length };
}

export async function removeCards(id, terms) {
  const db = await load();
  const set = db.sets.find((s) => s.id === id);
  if (!set) throw new Error(`Set "${id}" not found`);
  const drop = new Set(terms.map((t) => t.toLowerCase()));
  const before = set.cards.length;
  set.cards = set.cards.filter((c) => !drop.has(c.term.toLowerCase()));
  set.updatedAt = new Date().toISOString();
  await save(db);
  return { set, removed: before - set.cards.length };
}

export async function deleteSet(id) {
  const db = await load();
  const before = db.sets.length;
  db.sets = db.sets.filter((s) => s.id !== id);
  if (db.sets.length === before) throw new Error(`Set "${id}" not found`);
  await save(db);
}

// Quizlet "Import" box format: one card per line, term and definition separated by a tab.
export function toQuizletImport(cards, { termSep = "\t", cardSep = "\n" } = {}) {
  const clean = (s) => s.replace(/\t/g, " ").replace(/\r?\n/g, " ");
  return cards.map((c) => `${clean(c.term)}${termSep}${clean(c.definition)}`).join(cardSep);
}

// Parse text pasted from Quizlet's export ("Export" → tab / newline defaults) or a CSV-ish list.
export function fromQuizletExport(text, { termSep = "\t", cardSep = "\n" } = {}) {
  return normalizeCards(
    text
      .split(cardSep)
      .map((line) => {
        const i = line.indexOf(termSep);
        if (i === -1) {
          const m = line.match(/^(.+?)\s+[-–—:]\s+(.+)$/);
          return m ? { term: m[1], definition: m[2] } : null;
        }
        return { term: line.slice(0, i), definition: line.slice(i + termSep.length) };
      })
      .filter(Boolean)
  );
}

// Simple quiz generator: multiple choice with distractors drawn from the same set.
export function makeQuiz(set, { count = 10, mode = "term-to-definition", seed = Date.now() } = {}) {
  let x = seed % 2147483647 || 1;
  const rnd = () => (x = (x * 48271) % 2147483647) / 2147483647;
  const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const cards = shuffle([...set.cards]).slice(0, count);
  const askTerm = mode === "term-to-definition";
  return cards.map((c, i) => {
    const answer = askTerm ? c.definition : c.term;
    // Distractors are de-duplicated and never repeat the answer, so two cards
    // sharing a definition can't put the same option on the list twice.
    const pool = [...new Set(
      set.cards.filter((o) => o !== c).map((o) => (askTerm ? o.definition : o.term))
    )].filter((o) => o !== answer);
    const options = shuffle([answer, ...shuffle(pool).slice(0, 3)]);
    return { n: i + 1, prompt: askTerm ? c.term : c.definition, options, answer };
  });
}
