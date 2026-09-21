import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
process.env.QUIZLET_MCP_DIR = mkdtempSync(path.join(tmpdir(), "qmcp-"));
const S = await import("./store.js");

const set = await S.createSet({ title: "Unit 3 Food", cards: [{ term: "apple", definition: "яблуко" }, { term: "bread", definition: "хліб" }] });
assert.equal(set.id, "unit-3-food");
const { added } = await S.addCards(set.id, [{ term: "Apple", definition: "dup" }, { term: "milk", definition: "молоко" }, { term: "", definition: "x" }]);
assert.equal(added, 1);
assert.equal(S.toQuizletImport((await S.getSet(set.id)).cards), "apple\tяблуко\nbread\tхліб\nmilk\tмолоко");
const parsed = S.fromQuizletExport("cat\tкіт\ndog - пес\n\n");
assert.deepEqual(parsed, [{ term: "cat", definition: "кіт" }, { term: "dog", definition: "пес" }]);
const quiz = S.makeQuiz(await S.getSet(set.id), { count: 2, seed: 7 });
assert.equal(quiz.length, 2);
assert.ok(quiz[0].options.includes(quiz[0].answer));
await S.removeCards(set.id, ["milk"]);
assert.equal((await S.getSet(set.id)).cards.length, 2);
await S.deleteSet(set.id);
assert.deepEqual(await S.listSets(), []);
// A quiz must never list the same option twice, even when cards share a definition.
const dupSet = await S.createSet({ title: "Shared definitions", cards: [
  { term: "a", definition: "same" }, { term: "b", definition: "same" },
  { term: "c", definition: "other" }, { term: "d", definition: "third" }] });
for (const q of S.makeQuiz(dupSet, { count: 4, seed: 7 })) {
  assert.equal(new Set(q.options).size, q.options.length, `duplicate options: ${q.options}`);
  assert.ok(q.options.includes(q.answer));
}
await S.deleteSet(dupSet.id);

// Text pasted out of Quizlet on Windows arrives with CRLF line endings.
assert.deepEqual(S.fromQuizletExport("cat\tкіт\r\ndog\tпес\r\n"),
  [{ term: "cat", definition: "кіт" }, { term: "dog", definition: "пес" }]);

// A tab or newline inside a card would otherwise add a phantom column or row.
const messy = S.toQuizletImport(S.normalizeCards([{ term: "a\tb", definition: "one\ntwo" }]));
assert.equal(messy.split("\t").length, 2);
assert.equal(messy.split("\n").length, 1);

console.log("ok");
