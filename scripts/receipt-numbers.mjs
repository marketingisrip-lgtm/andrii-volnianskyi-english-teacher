#!/usr/bin/env node
// Numbers for an adoption receipt, generated instead of typed (owner skill
// derived-numbers-need-a-generator): runs each suite, then reads the evidence files and registers.
// Usage: npm run receipt:numbers   Writes test-results/receipt-numbers.json and prints Markdown rows.
import { spawnSync, execFileSync } from "node:child_process";
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (f) => (existsSync(path.join(REPO, f)) ? JSON.parse(readFileSync(path.join(REPO, f), "utf8")) : null);
const git = (...args) => execFileSync("git", args, { cwd: REPO, encoding: "utf8" }).trim();

const SUITES = {
  site: "tests/site.test.mjs",
  claims: "tests/claims.test.mjs",
  "skill/agent lint": "tests/agent-assets.test.mjs",
  "planted defects (static)": "tests/mutation.test.mjs",
  runtime: "tests/runtime.test.mjs",
  "planted defects (browser)": "tests/runtime-mutation.test.mjs",
};

const commit = git("rev-parse", "--short", "HEAD");
const clean = git("status", "--porcelain") === "";
const suites = {};
for (const [name, file] of Object.entries(SUITES)) {
  const started = Date.now();
  const { NODE_TEST_CONTEXT, ...env } = process.env;
  const run = spawnSync(process.execPath, ["--test", "--test-reporter=tap", file], { cwd: REPO, env, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  const count = (k) => Number(run.stdout.match(new RegExp(`^# ${k} (\\d+)$`, "m"))?.[1] ?? NaN);
  suites[name] = { file, tests: count("tests"), pass: count("pass"), fail: count("fail"), skipped: count("skipped"), seconds: Math.round((Date.now() - started) / 1000), failing: [...run.stdout.matchAll(/^\s*not ok \d+ - (.+)$/gm)].map((m) => m[1]) };
  console.error(`${name}: ${suites[name].pass}/${suites[name].tests} pass, ${suites[name].fail} fail, ${suites[name].skipped} skipped (${suites[name].seconds} s)`);
}

const issues = read("web/known-issues.json").issues;
const claims = read("web/claims-ledger.json").claims;
const tally = (rows, key) => rows.reduce((t, r) => ((t[r[key]] = (t[r[key]] || 0) + 1), t), {});
const evidence = read("test-results/runtime-evidence.json");
const native = read("test-results/native-load.json");
const evals = read("test-results/skill-evals.json");

const numbers = {
  generated_at: new Date().toISOString(),
  commit,
  tree_clean: clean,
  suites,
  known_issues: { total: issues.length, by_severity: tally(issues, "severity") },
  claims: { total: claims.length, by_status: tally(claims, "status") },
  runtime_facts: evidence && {
    keyboard: evidence.keyboard,
    contrast_text_boxes: Object.fromEntries(Object.entries(evidence.contrast || {}).map(([w, c]) => [w, c.text_boxes_sampled])),
    fonts_loaded: evidence.fonts_loaded,
    short_viewports: evidence.short_viewports,
  },
  native_load: native && { checked_at: native.checked_at, version: native.claude_code_version, pass: native.pass, skills: native.loaded?.skills?.filter((s) => native.expected.skills.includes(s)).length, agents: native.loaded?.agents?.filter((a) => native.expected.agents.includes(a)).length, missing: native.missing },
  skill_evals: evals && { checked_at: evals.checked_at, model: evals.model, passed: evals.passed, total: evals.total },
};
mkdirSync(path.join(REPO, "test-results"), { recursive: true });
writeFileSync(path.join(REPO, "test-results/receipt-numbers.json"), JSON.stringify(numbers, null, 2) + "\n");

console.log(`Suites run at \`${commit}\`${clean ? "" : " (working tree had uncommitted changes)"}, ${numbers.generated_at.slice(0, 16).replace("T", " ")} UTC:\n`);
console.log("| Suite | Tests | Pass | Fail | Skipped | Time |\n|---|---|---|---|---|---|");
for (const [name, s] of Object.entries(suites)) console.log(`| ${name} (\`${s.file}\`) | ${s.tests} | ${s.pass} | ${s.fail} | ${s.skipped} | ${s.seconds} s |`);
console.log(`\nKnown issues: ${issues.length} (${Object.entries(numbers.known_issues.by_severity).map(([k, v]) => `${v} ${k}`).join(" · ")}). Claims: ${claims.length} (${Object.entries(numbers.claims.by_status).map(([k, v]) => `${v} ${k}`).join(" · ")}).`);
process.exitCode = Object.values(suites).every((s) => s.fail === 0 && s.tests > 0) ? 0 : 1;
