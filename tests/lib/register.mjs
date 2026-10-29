// web/known-issues.json holds defects whose fix needs the owner's decision.
// judge() passes registered defects, fails new ones, and fails entries that stopped reproducing.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./html.mjs";

export const register = JSON.parse(readFileSync(path.join(ROOT, "web/known-issues.json"), "utf8")).issues;

export function judge(check, violations) {
  const known = register.filter((i) => i.check === check);
  const unknown = violations.filter((v) => !known.some((k) => k.target === v.target));
  const fixed = known.filter((k) => !violations.some((v) => v.target === k.target));
  assert.deepEqual(unknown.map((v) => `${v.target}: ${v.detail}`), [], `new ${check} defects: fix them, or register them in web/known-issues.json if the fix needs an owner decision`);
  assert.deepEqual(fixed.map((k) => k.id), [], `these ${check} entries no longer reproduce: delete them from web/known-issues.json`);
}
