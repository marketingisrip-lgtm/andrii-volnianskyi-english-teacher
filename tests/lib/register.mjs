// web/known-issues.json holds defects whose fix needs the owner's decision.
// judge() passes registered defects, fails new ones, and fails entries that stopped reproducing.
// An entry's target may be a list when one decision covers several places.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ROOT } from "./html.mjs";

export const register = JSON.parse(readFileSync(path.join(ROOT, "web/known-issues.json"), "utf8")).issues;

const targetsOf = (entry) => [].concat(entry.target ?? []);

export function judge(check, violations) {
  const known = register.filter((i) => i.check === check);
  const unknown = violations.filter((v) => !known.some((k) => targetsOf(k).includes(v.target)));
  const fixed = known.flatMap((k) => targetsOf(k).filter((t) => !violations.some((v) => v.target === t)).map((t) => `${k.id}: ${t}`));
  assert.deepEqual(unknown.map((v) => `${v.target}: ${v.detail}`), [], `new ${check} defects: fix them, or register them in web/known-issues.json if the fix needs an owner decision`);
  assert.deepEqual(fixed, [], `these ${check} targets no longer reproduce: remove them from web/known-issues.json`);
}

/** A count that may only fall. The entry's "limit" must equal the count, so every gain is kept. */
export function ratchet(check, count, advice) {
  const entry = register.find((i) => i.check === check);
  if (!entry) return assert.equal(count, 0, `${count} found: ${advice}`);
  assert.ok(count <= entry.limit, `${count} found, above the ratchet of ${entry.limit}: ${advice}`);
  assert.equal(count, entry.limit, count ? `only ${count} left: lower "limit" of ${entry.id} in web/known-issues.json to ${count} so the gain is kept` : `none left: delete ${entry.id} from web/known-issues.json`);
}
