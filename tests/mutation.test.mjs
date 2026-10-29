// Checks the checks: plant one known defect in a throwaway copy of the site and require
// that the matching static check goes red. A check that stays green here proves nothing.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { REPO } from "./lib/html.mjs";

const SKIP = new Set([".git", "node_modules", "dist", "test-results"]);
const SUITES = ["tests/site.test.mjs", "tests/claims.test.mjs"].map((f) => path.join(REPO, f));

function withMutant(mutate) {
  const root = mkdtempSync(path.join(tmpdir(), "site-mutant-"));
  try {
    cpSync(REPO, root, { recursive: true, filter: (src) => !path.relative(REPO, src).split(path.sep).some((s) => SKIP.has(s)) });
    mutate(root);
    // Drop NODE_TEST_CONTEXT: inherited from this runner, it makes the child emit a binary
    // protocol instead of TAP, and every mutant then "passes" with zero tests run.
    const { NODE_TEST_CONTEXT, ...env } = process.env;
    const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap", ...SUITES], { env: { ...env, SITE_ROOT: root }, encoding: "utf8" });
    const ran = Number(run.stdout.match(/^# tests (\d+)$/m)?.[1] || 0);
    assert.ok(ran >= 18, `child run executed ${ran} tests; stderr: ${run.stderr.slice(0, 500)}`);
    return [...run.stdout.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

const edit = (file, from, to) => (root) => {
  const p = path.join(root, file);
  const src = readFileSync(p, "utf8");
  assert.ok(src.includes(from), `mutation anchor not found in ${file}: ${from}`);
  writeFileSync(p, src.replace(from, to));
};

const MUTANTS = [
  ["drop an image's alt text", edit("index.html", 'alt="Andrii Volnianskyi"', ""), "index.html: every visible image has alt text"],
  ["link to a missing section", edit("index.html", 'href="#approach"', 'href="#methods"'), "index.html: ids are unique and every in-page link has a target"],
  ["skip a heading level", edit("index.html", "<h2>Language learning with purpose, structure and room to speak.</h2>", "<h3>Language learning with purpose, structure and room to speak.</h3>"), "index.html: heading outline has one h1 and no skipped levels"],
  ["leave a tag unclosed", edit("index.html", '<div class="value-tags">', '<div class="value-tags"><div>'), "index.html: HTML tags are balanced"],
  ["open a new tab without rel", edit("index.html", 'target="_blank" rel="noreferrer">LinkedIn', 'target="_blank">LinkedIn'), "index.html: links that open a new tab set rel=noopener or noreferrer"],
  ["reference a missing image", edit("index.html", "assets/logos/yappi.png", "assets/logos/yappi-new.png"), "index.html: every local file it or its CSS references exists"],
  ["add a stylesheet the build does not copy", (root) => {
    writeFileSync(path.join(root, "extra.css"), ".x{color:red}");
    edit("index.html", '<link rel="stylesheet" href="provider-marks.css" />', '<link rel="stylesheet" href="provider-marks.css" />\n    <link rel="stylesheet" href="extra.css" />')(root);
  }, "npm run build ships every page and every file the pages reference"],
  ["add a page the build does not ship", (root) => writeFileSync(path.join(root, "cae-hub.html"), readFileSync(path.join(root, "index.html"), "utf8")), "npm run build ships every page and every file the pages reference"],
  ["commit an error page as a PNG", (root) => writeFileSync(path.join(root, "assets/logos/broken.png"), '{"status":"error","code":404}'), "asset files are what their extension says"],
  ["fix a registered issue without updating the register", (root) => unlinkSync(path.join(root, "assets/logos/pearson-pte.png")), "every shipped asset is referenced"],
  ["hide content behind JavaScript", edit("growth-path.css", ".growth-path{", ".growth-path.reveal{opacity:0}.growth-path{"), "content is not hidden from visitors without JavaScript"],
  ["add an unsourced number", edit("index.html", "Aims, staging, timing and purposeful practice.", "Aims, staging, timing and a 98% pass rate."), "every number and credential word on the page has a ledger entry"],
  ["leave a duplicated word from an edit", edit("index.html", "Grammar, lexis and pronunciation in usable context.", "Grammar, lexis and and pronunciation in usable context."), "index.html: copy has no repeated words or duplicated clauses"],
  ["slip into American spelling", edit("index.html", "conversion optimisation", "conversion optimization"), "index.html: copy keeps to British spelling"],
  ["add a hard-coded colour instead of a token", edit("growth-path.css", ".growth-path{", ".growth-path .x{color:#123456}.growth-path{"), "hard-coded colours do not grow (token ratchet)"],
  ["put an unsourced number in alt text", edit("index.html", 'alt="Pearson PTE Academic score report"', 'alt="Pearson PTE Academic score report, 90/90"'), "every number and credential word on the page has a ledger entry"],
  ["remove a claim but keep its ledger entry", edit("index.html", "<span>UK · 2024–2025</span>", "<span>UK</span>"), "every ledger entry is still on the page"],
];

for (const [name, mutate, mustFail] of MUTANTS) {
  test(`catches: ${name}`, () => {
    const failed = withMutant(mutate);
    assert.ok(failed.includes(mustFail), `expected "${mustFail}" to fail; failing tests were: ${JSON.stringify(failed)}`);
  });
}

// Changes the procedures allow must stay green, or the suite punishes the workflow it encodes.
const ALLOWED = [
  ["stage a redesign as index-review.html (P1)", (root) => writeFileSync(path.join(root, "index-review.html"), readFileSync(path.join(root, "index.html"), "utf8"))],
];
for (const [name, change] of ALLOWED) {
  test(`allows: ${name}`, () => {
    assert.deepEqual(withMutant(change), []);
  });
}

test("the unmutated copy passes every check", () => {
  assert.deepEqual(withMutant(() => {}), []);
});
