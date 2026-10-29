// Shared by the planted-defect suites: copy the site, plant one defect, run real tests against it.
import assert from "node:assert/strict";
import { mkdtempSync, cpSync, rmSync, readFileSync, writeFileSync } from "node:fs";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { REPO } from "./html.mjs";

const SKIP = new Set([".git", "node_modules", "dist", "test-results", ".netlify"]);

/**
 * Run test files (with extra node --test flags) against a mutated copy of the repo.
 * Returns how many tests ran and the names of those that failed.
 */
export async function runMutant(mutate, testArgs) {
  const root = mkdtempSync(path.join(tmpdir(), "site-mutant-"));
  try {
    cpSync(REPO, root, { recursive: true, filter: (src) => !path.relative(REPO, src).split(path.sep).some((s) => SKIP.has(s)) });
    await mutate(root);
    // Drop NODE_TEST_CONTEXT: inherited from this runner, it makes the child emit a binary
    // protocol instead of TAP, and every mutant then "passes" with zero tests run.
    const { NODE_TEST_CONTEXT, ...env } = process.env;
    const child = spawn(process.execPath, ["--test", "--test-reporter=tap", ...testArgs.map((a) => (a.startsWith("tests/") ? path.join(REPO, a) : a))], { env: { ...env, SITE_ROOT: root } });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => (stdout += d));
    child.stderr.on("data", (d) => (stderr += d));
    await new Promise((resolve) => child.on("close", resolve));
    return {
      ran: Number(stdout.match(/^# tests (\d+)$/m)?.[1] || 0),
      failed: [...stdout.matchAll(/^not ok \d+ - (.+)$/gm)].map((m) => m[1]),
      output: stdout,
      stderr,
    };
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

/** Replace the first occurrence of `from` in a file of the copy; fails loudly if the anchor moved. */
export const edit = (file, from, to) => (root) => {
  const p = path.join(root, file);
  const src = readFileSync(p, "utf8");
  assert.ok(src.includes(from), `mutation anchor not found in ${file}: ${from}`);
  writeFileSync(p, src.replace(from, to));
};

export const append = (file, text) => (root) => writeFileSync(path.join(root, file), readFileSync(path.join(root, file), "utf8") + text);
