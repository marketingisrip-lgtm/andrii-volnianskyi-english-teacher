// Checks the checks: plant one known defect in a throwaway copy of the site and require
// that the matching static check goes red. A check that stays green here proves nothing.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, unlinkSync, copyFileSync } from "node:fs";
import path from "node:path";
import { runMutant, edit, append } from "./lib/mutant.mjs";

const SUITES = ["tests/site.test.mjs", "tests/claims.test.mjs", "tests/agent-assets.test.mjs"];

async function failingTests(mutate) {
  const { ran, failed, stderr } = await runMutant(mutate, SUITES);
  assert.ok(ran >= 30, `child run executed ${ran} tests; stderr: ${stderr.slice(0, 500)}`);
  return failed;
}

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
  ["ship a file no page needs", edit("package.json", "cp server/index.js dist/server/", "cp server/index.js dist/server/ && cp netlify.toml dist/"), "npm run build ships every page and every file the pages reference"],
  ["commit an error page as a PNG", (root) => writeFileSync(path.join(root, "assets/logos/broken.png"), '{"status":"error","code":404}'), "asset files are what their extension says"],
  ["fix a registered issue without updating the register", (root) => unlinkSync(path.join(root, "assets/logos/pearson-pte.png")), "every shipped asset is referenced"],
  ["fix one target of a grouped entry without updating the register", edit("index.html", "</head>", '<meta property="og:title" content="Andrii Volnianskyi, English Teacher" />\n  </head>'), "pages carry social-preview and canonical metadata"],
  ["hide content behind JavaScript", edit("growth-path.css", ".growth-path{", ".growth-path.reveal{opacity:0}.growth-path{"), "content is not hidden from visitors without JavaScript"],
  ["add an unsourced number", edit("index.html", "Aims, staging, timing and purposeful practice.", "Aims, staging, timing and a 98% pass rate."), "every number and credential word on the page has a ledger entry"],
  ["leave a duplicated word from an edit", edit("index.html", "Grammar, lexis and pronunciation in usable context.", "Grammar, lexis and and pronunciation in usable context."), "index.html: copy has no repeated words or duplicated clauses"],
  ["slip into American spelling", edit("index.html", "conversion optimisation", "conversion optimization"), "index.html: copy keeps to British spelling"],
  ["type a Cyrillic look-alike letter", edit("index.html", "<h3>Clear lesson architecture</h3>", "<h3>Clear lessоn architecture</h3>"), "text in another alphabet is marked with its language (WCAG 3.1.2)"],
  ["add a hard-coded colour instead of a token", edit("growth-path.css", ".growth-path{", ".growth-path .x{color:#123456}.growth-path{"), "hard-coded colours do not grow (token ratchet)"],
  ["put an unsourced number in alt text", edit("index.html", 'alt="Pearson PTE Academic score report"', 'alt="Pearson PTE Academic score report, 90/90"'), "every number and credential word on the page has a ledger entry"],
  ["name a generic element with aria-label", edit("index.html", '<div class="frameworks">', '<div class="frameworks" aria-label="Frameworks">'), "aria-label sits only on elements that can be named"],
  ["remove a claim but keep its ledger entry", edit("index.html", "<span>UK · 2024–2025</span>", "<span>UK</span>"), "every ledger entry is still on the page"],
  ["add an image without width and height", edit("index.html", '<main id="main">', '<main id="main"><img src="assets/logos/yappi.png" alt="Yappi" />'), "images declare their size, so the layout does not jump while they load"],
  ["write a date a machine cannot read", edit("index.html", "<time>2022</time>", "<time>Spring 2022</time>"), "<time> elements carry a machine-readable date"],
  ["add an icon screen readers will announce", edit("index.html", "<b>CELTA into practice</b>", "<b>CELTA into practice</b><i>★</i>"), "decorative glyphs are hidden from screen readers"],
  ["add an animation that never stops", edit("growth-path.css", ".growth-path{", ".growth-path .y{animation:spin 3s linear infinite}@keyframes spin{to{transform:rotate(1turn)}}.growth-path{"), "animations that run forever come with a pause control (WCAG 2.2.2)"],
  ["replace the CV with something that is not a PDF", (root) => writeFileSync(path.join(root, "assets/Andrii_Volnianskyi_CV.pdf"), "<html>Not found</html>"), "shipped PDFs are readable documents with a text layer and a proper title"],
  ["ship a new certificate nobody reviewed for personal data", (root) => copyFileSync(path.join(root, "assets/certificates/yappi-business-english.png"), path.join(root, "assets/certificates/yappi-copy.png")), "every shipped document was reviewed for personal data"],
  // Built at run time, so this file never holds the token shape it plants.
  ["commit an access token", append("web/PROCEDURES.md", `\ntoken: ${"ghp_"}${"x".repeat(36)}\n`), "no credentials are committed"],
  ["let Codex's invocation policy disagree with Claude's", edit(".claude/skills/site-verify/agents/openai.yaml", "allow_implicit_invocation: true", "allow_implicit_invocation: false"), "skill site-verify: valid for Codex (agents/openai.yaml)"],
  ["leave a trigger list on a user-invoked skill", edit(".claude/skills/web-release/SKILL.md", "before production.", "before production. Use it when Andrii says deploy."), "skill web-release: valid for Claude Code"],
  ["give a subagent a tool that does not exist", edit(".claude/agents/site-verifier.md", "tools: Bash, Read, Grep, Glob", "tools: Bash, Read, Grep, Glob, Teleport"), "agent site-verifier: valid subagent definition"],
  ["point the docs at a script that does not exist", append("web/PROCEDURES.md", "\nThen run `npm run deploy:all`.\n"), "docs name only skills, agents, scripts and files that exist"],
  ["give a date a datetime that disagrees with it", edit("index.html", 'datetime="2024-08"', 'datetime="2024-09"'), "datetime values and accessible-only labels agree with the visible text"],
  ["put a number in an accessible-only label", edit("index.html", 'aria-label="AV English, back to top"', 'aria-label="AV English, 8 years of teaching"'), "datetime values and accessible-only labels agree with the visible text"],
  ["leave an arrow glyph inside link text", edit("index.html", '>LinkedIn <span aria-hidden="true">↗</span></a>', ">LinkedIn ↗</a>"), "decorative glyphs are hidden from screen readers"],
  ["put a non-item inside an ARIA list", edit("index.html", '<svg class="growth-line"', '<p>Extra</p><svg class="growth-line"'), "ARIA lists hold only list items, and list items sit in lists"],
  ["give a list-item role to an element outside a list", edit("index.html", '<div class="frameworks">', '<div class="frameworks" role="listitem">'), "ARIA lists hold only list items, and list items sit in lists"],
  ["name an element whose role cannot be named", edit("index.html", '<div class="frameworks">', '<div class="frameworks" role="presentation" aria-label="Frameworks">'), "aria-label sits only on elements that can be named"],
  ["label a score with a number that only appears inside a longer one", edit("index.html", "<h3>PTE Academic · 84/90</h3>", '<h3 aria-label="PTE Academic, overall score 90">PTE Academic · 84/90</h3>'), "datetime values and accessible-only labels agree with the visible text"],
  ["give a date a day the text does not show", edit("index.html", 'datetime="2024-08"', 'datetime="2024-08-15"'), "datetime values and accessible-only labels agree with the visible text"],
  ["put an arrow glyph in an aria-label", edit("index.html", 'aria-label="AV English, back to top"', 'aria-label="AV English → back to top"'), "decorative glyphs are hidden from screen readers"],
  ["name an element whose first role cannot be named", edit("index.html", '<nav class="nav wrap">', '<nav class="nav wrap" role="none presentation" aria-label="Main">'), "aria-label sits only on elements that can be named"],
  ["leave bare text inside an ARIA list", edit("index.html", '<svg class="growth-line"', 'Planted text<svg class="growth-line"'), "ARIA lists hold only list items, and list items sit in lists"],
  ["register an issue no test re-checks", (root) => {
    const file = path.join(root, "web/known-issues.json");
    const reg = JSON.parse(readFileSync(file, "utf8"));
    reg.issues.push({ id: "orphan", check: "made-up-check", target: "index.html", severity: "minor", finding: "f", suggested_fix: "s" });
    writeFileSync(file, JSON.stringify(reg));
  }, "every known-issues entry is re-checked by a test"],
];

// Changes the procedures allow must stay green, or the suite punishes the workflow it encodes.
const ALLOWED = [
  ["stage a redesign as index-review.html (P1)", (root) => writeFileSync(path.join(root, "index-review.html"), readFileSync(path.join(root, "index.html"), "utf8"))],
  // The accessibility tree skips a plain wrapper, so the item still belongs to its list.
  ["wrap a list item in a plain <div>", (root) => {
    const file = path.join(root, "index.html");
    const lines = readFileSync(file, "utf8").split("\n");
    const i = lines.findIndex((l) => l.includes('<div role="listitem" class="growth-point c1">'));
    assert.ok(i >= 0 && lines[i].trimEnd().endsWith("</div>"), "anchor for the wrapped list item moved");
    lines[i] = lines[i].replace('<div role="listitem"', '<div><div role="listitem"') + "</div>";
    writeFileSync(file, lines.join("\n"));
  }],
];

// Each mutant is an independent copy, so they run four at a time.
describe("planted defects", { concurrency: 4 }, () => {
  for (const [name, mutate, mustFail] of MUTANTS) {
    test(`catches: ${name}`, async () => {
      const failed = await failingTests(mutate);
      assert.ok(failed.includes(mustFail), `expected "${mustFail}" to fail; failing tests were: ${JSON.stringify(failed)}`);
    });
  }
  for (const [name, change] of ALLOWED) {
    test(`allows: ${name}`, async () => {
      assert.deepEqual(await failingTests(change), []);
    });
  }
  test("the unmutated copy passes every check", async () => {
    assert.deepEqual(await failingTests(() => {}), []);
  });
});
