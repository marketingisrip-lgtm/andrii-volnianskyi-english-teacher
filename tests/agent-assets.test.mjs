// Lint for the adopted skills, subagents and procedures, in both harnesses:
// Claude Code reads .claude/skills and .claude/agents; Codex reads AGENTS.md, .agents/skills
// and each skill's agents/openai.yaml.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync, lstatSync, realpathSync } from "node:fs";
import path from "node:path";
import { ROOT as REPO } from "./lib/html.mjs"; // SITE_ROOT when a planted-defect run points the suite at a copy

const SKILLS_DIR = path.join(REPO, ".claude/skills");
const AGENTS_DIR = path.join(REPO, ".claude/agents");
const skills = existsSync(SKILLS_DIR) ? readdirSync(SKILLS_DIR).filter((d) => existsSync(path.join(SKILLS_DIR, d, "SKILL.md"))) : [];
const agents = existsSync(AGENTS_DIR) ? readdirSync(AGENTS_DIR).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)) : [];
const pkg = JSON.parse(readFileSync(path.join(REPO, "package.json"), "utf8"));

// Account-level skills synced from claude.ai that repo docs may name (they do not live in this repo).
const ACCOUNT_SKILLS = new Set(["celta-aims-first", "celta-brief-before-build", "celta-lesson-plan-author", "celta-handout", "celta-lesson-simulation", "celta-error-remediation-planner", "celta-builder-dev-loop", "celta-align", "llm-delegation", "agent-fleet-orchestration", "autonomous-ops", "account-check", "research-intake"]);
// Skills from the owner's Drive library ("Claude Code Skills (Shareable)") that docs cite as sources.
const LIBRARY_SKILLS = new Set(["learning-page-transfer-gate", "exam-format-contract", "accessibility-review", "professional-identity-verified-only", "claim-provenance-ledger", "creative-verification-discipline", "verification-discipline", "verify-the-set-not-the-item", "visual-asset-preflight", "design-verdict-to-spec", "typo-checker", "deploy-verify-loop", "staged-release", "chat-handoff"]);
const SKILL_KEYS = new Set(["name", "description", "disable-model-invocation", "user-invocable", "allowed-tools", "argument-hint"]);
const AGENT_KEYS = new Set(["name", "description", "tools", "model", "color"]);
const TOOLS = new Set(["Read", "Grep", "Glob", "Bash", "Edit", "Write", "WebFetch", "WebSearch", "Skill"]);
const NAME = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** Frontmatter subset used here: `key: value` scalars and `key: >-` folded blocks. */
function frontmatter(file) {
  const src = readFileSync(file, "utf8");
  const m = src.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  assert.ok(m, `${path.relative(REPO, file)}: missing --- frontmatter ---`);
  const data = {};
  const lines = m[1].split("\n");
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    assert.ok(kv, `${path.relative(REPO, file)}: cannot parse frontmatter line "${lines[i]}"`);
    let value = kv[2];
    if (/^[>|]-?$/.test(value)) {
      const block = [];
      while (i + 1 < lines.length && /^\s+\S/.test(lines[i + 1])) block.push(lines[++i].trim());
      value = block.join(" ");
    }
    data[kv[1]] = value.replace(/^(["'])(.*)\1$/, "$2");
  }
  return { data, body: m[2] };
}

/** openai.yaml subset: two-level mapping of scalars. */
function yaml2(file) {
  const out = {};
  let section = null;
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const top = line.match(/^([\w-]+):\s*$/);
    const leaf = line.match(/^\s+([\w-]+):\s*(.+)$/);
    if (top) out[(section = top[1])] = {};
    else if (leaf && section) out[section][leaf[1]] = leaf[2].replace(/^(["'])(.*)\1$/, "$2");
    else assert.fail(`${path.relative(REPO, file)}: cannot parse "${line}"`);
  }
  return out;
}

test("at least one skill and one agent are adopted", () => {
  assert.ok(skills.length > 0, "no .claude/skills/*/SKILL.md");
  assert.ok(agents.length > 0, "no .claude/agents/*.md");
});

for (const skill of skills) {
  test(`skill ${skill}: valid for Claude Code`, () => {
    const { data, body } = frontmatter(path.join(SKILLS_DIR, skill, "SKILL.md"));
    assert.equal(data.name, skill, "name must equal the folder name");
    assert.match(skill, NAME);
    assert.ok(skill.length <= 64 && !/anthropic|claude/.test(skill), "name: max 64 chars, no reserved words");
    assert.ok(data.description && data.description.length <= 1024, "description: required, max 1024 chars");
    assert.doesNotMatch(data.description, /[<>]/, "description: no angle brackets (the skill listing is XML-delimited)");
    // The model routes on the description alone, so a model-invoked one says when to use it. A
    // user-invoked one is read only by a person browsing slash commands: one line, no trigger list.
    if (data["disable-model-invocation"] === "true") {
      assert.ok(data.description.length <= 160 && !/\b(use|invoke)\b[^.]*\bwhen\b/i.test(data.description), "user-invoked: description is a one-line human summary without trigger phrasing");
    } else assert.match(data.description, /\b(use|invoke)\b[^.]*\b(when|whenever|before|after|for)\b/i, "model-invoked: description must say when to use it (\"Use when/before/after/for …\"), so auto-invocation fires");
    assert.deepEqual(Object.keys(data).filter((k) => !SKILL_KEYS.has(k)), [], "unknown frontmatter keys");
    assert.ok(body.trim().length > 200, "body is too thin to be a procedure");
  });

  test(`skill ${skill}: valid for Codex (agents/openai.yaml)`, () => {
    const file = path.join(SKILLS_DIR, skill, "agents/openai.yaml");
    assert.ok(existsSync(file), "agents/openai.yaml missing");
    const y = yaml2(file);
    assert.ok(y.interface?.display_name, "interface.display_name missing");
    assert.ok(y.interface?.short_description && y.interface.short_description.length <= 120, "interface.short_description missing or over 120 chars");
    // Written out for every skill (the field the owner's codex-skill-metadata.md lists), so the
    // two harnesses visibly agree: false exactly when Claude's disable-model-invocation is true.
    assert.match(y.policy?.allow_implicit_invocation || "", /^(true|false)$/, "policy.allow_implicit_invocation must be true or false");
    const userOnly = frontmatter(path.join(SKILLS_DIR, skill, "SKILL.md")).data["disable-model-invocation"] === "true";
    assert.equal(y.policy.allow_implicit_invocation === "false", userOnly, "Codex implicit invocation must mirror Claude's disable-model-invocation");
  });
}

for (const agent of agents) {
  test(`agent ${agent}: valid subagent definition`, () => {
    const { data, body } = frontmatter(path.join(AGENTS_DIR, `${agent}.md`));
    assert.equal(data.name, agent, "name must equal the file name");
    assert.match(agent, NAME);
    assert.ok(data.description && data.description.length <= 1024, "description: required, max 1024 chars");
    assert.deepEqual(Object.keys(data).filter((k) => !AGENT_KEYS.has(k)), [], "unknown frontmatter keys");
    if (data.tools) assert.deepEqual(data.tools.split(/,\s*/).filter((t) => !TOOLS.has(t)), [], "unknown tools");
    if (data.model) assert.match(data.model, /^(inherit|sonnet|opus|haiku|fable|claude-[\w.-]+)$/);
    assert.ok(body.trim().length > 200, "system prompt is too thin");
  });
}

test("Codex sees the same files: AGENTS.md -> CLAUDE.md and .agents/skills -> .claude/skills", () => {
  for (const [link, target] of [["AGENTS.md", "CLAUDE.md"], [".agents/skills", ".claude/skills"]]) {
    const p = path.join(REPO, link);
    assert.ok(existsSync(p) && lstatSync(p).isSymbolicLink(), `${link} must be a symlink`);
    assert.equal(realpathSync(p), realpathSync(path.join(REPO, target)), `${link} must resolve to ${target}`);
  }
});

test("docs name only skills, agents, scripts and files that exist", () => {
  const docs = ["CLAUDE.md", "web/AGENTS.md", "web/PROCEDURES.md", ...skills.map((s) => `.claude/skills/${s}/SKILL.md`), ...agents.map((a) => `.claude/agents/${a}.md`)];
  const problems = [];
  for (const doc of docs) {
    const text = readFileSync(path.join(REPO, doc), "utf8");
    for (const [, name] of text.matchAll(/`([a-z0-9]+(?:-[a-z0-9]+)+)`/g))
      if (/^(celta|cardigit|web|site|claims|english|codex|learning)-/.test(name) && !skills.includes(name) && !agents.includes(name) && !ACCOUNT_SKILLS.has(name) && !LIBRARY_SKILLS.has(name)) problems.push(`${doc}: unknown skill/agent \`${name}\``);
    for (const [, script] of text.matchAll(/npm run ([\w-]+(?::[\w-]+)*)/g)) if (!pkg.scripts?.[script]) problems.push(`${doc}: npm run ${script} is not a package.json script`);
    for (const [, file] of text.matchAll(/`((?:tests|web|scripts|\.claude)\/[\w./-]+\.(?:mjs|json|md))`/g)) if (!existsSync(path.join(REPO, file))) problems.push(`${doc}: missing file ${file}`);
  }
  assert.deepEqual(problems, []);
});
