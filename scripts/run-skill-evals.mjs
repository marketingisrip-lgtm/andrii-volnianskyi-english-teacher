#!/usr/bin/env node
// Routing evals: does a fresh headless Claude Code session in this repo reach for the right skill?
// Runs every .claude/skills/*/evals/triggers.json query, watches the first few tool calls for a
// Skill call, and stops the session there. Read-only tools only, so nothing is changed.
// Usage: npm run eval:skills   (needs the claude CLI, signed in; costs one short session per query)
// SKILL_EVAL_MODEL picks the model (default sonnet); SKILL_EVAL_ONLY=site-verify runs one skill.
import { spawn } from "node:child_process";
import { readdirSync, existsSync, readFileSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MODEL = process.env.SKILL_EVAL_MODEL || "sonnet";
const TOOL_CALLS_WATCHED = 3; // the skill may come after a quick look around, but not later
const TIMEOUT_MS = 180_000;
const CONCURRENCY = 4;

// Same filtered environment as check-native-load.mjs: never attach to the calling session.
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(HOME|PATH|USER|LOGNAME|SHELL|TMPDIR|LANG|LC_\w+|TERM|ANTHROPIC_API_KEY|NODE_EXTRA_CA_CERTS|HTTPS?_PROXY|NO_PROXY)$/i.test(k)));

const cases = readdirSync(path.join(REPO, ".claude/skills"))
  .filter((s) => existsSync(path.join(REPO, ".claude/skills", s, "evals/triggers.json")) && (!process.env.SKILL_EVAL_ONLY || s === process.env.SKILL_EVAL_ONLY))
  .flatMap((skill) => JSON.parse(readFileSync(path.join(REPO, ".claude/skills", skill, "evals/triggers.json"), "utf8")).queries.map((q) => ({ skill, ...q })));

function run({ query }) {
  return new Promise((resolve) => {
    const args = ["-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence", "--model", MODEL, "--max-turns", String(TOOL_CALLS_WATCHED + 1), "--allowedTools=Skill,Read,Grep,Glob", query];
    const child = spawn("claude", args, { cwd: REPO, env, stdio: ["ignore", "pipe", "pipe"] });
    const calls = [];
    const skills = [];
    let buffer = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill("SIGTERM"), TIMEOUT_MS);
    const stop = () => child.kill("SIGTERM");
    child.stdout.on("data", (chunk) => {
      buffer += chunk;
      const lines = buffer.split("\n");
      buffer = lines.pop();
      for (const line of lines) {
        let event;
        try {
          event = JSON.parse(line);
        } catch {
          continue;
        }
        for (const block of event.type === "assistant" ? event.message?.content || [] : []) {
          if (block.type !== "tool_use") continue;
          // Plugin and account skills arrive as "plugin:name"; repo skills as the bare name.
          const skill = block.name === "Skill" ? String(block.input?.skill ?? block.input?.command ?? "?").split(":").pop() : null;
          if (skill) skills.push(skill);
          calls.push(skill ? `Skill(${skill})` : block.name);
          if (skill || calls.length >= TOOL_CALLS_WATCHED) stop();
        }
        if (event.type === "result") stop();
      }
    });
    child.stderr.on("data", (c) => (stderr += c));
    child.on("error", (e) => resolve({ calls, skills, error: e.message }));
    child.on("close", () => {
      clearTimeout(timer);
      resolve({ calls, skills, error: calls.length || !stderr.trim() ? null : stderr.slice(0, 300) });
    });
  });
}

const results = [];
for (let i = 0; i < cases.length; i += CONCURRENCY) {
  const batch = cases.slice(i, i + CONCURRENCY);
  results.push(...(await Promise.all(batch.map(async (c) => {
    const { calls, skills, error } = await run(c);
    const triggered = skills.includes(c.skill);
    return { ...c, triggered, pass: !error && triggered === c.should_trigger, first_tool_calls: calls, error };
  }))));
}

const bySkill = {};
for (const r of results) (bySkill[r.skill] ??= { pass: 0, total: 0 }).total++, r.pass && bySkill[r.skill].pass++;
const report = { checked_at: new Date().toISOString(), model: MODEL, passed: results.filter((r) => r.pass).length, total: results.length, by_skill: bySkill, results };
mkdirSync(path.join(REPO, "test-results"), { recursive: true });
writeFileSync(path.join(REPO, "test-results/skill-evals.json"), JSON.stringify(report, null, 2) + "\n");
for (const r of results) console.log(`${r.pass ? "pass" : "FAIL"}  ${r.skill}  ${r.should_trigger ? "should trigger" : "should not"}  "${r.query}"  -> ${r.first_tool_calls.join(", ") || r.error || "no tool call"}`);
console.log(`\n${report.passed}/${report.total} routing evals passed (${MODEL}); details in test-results/skill-evals.json`);
process.exitCode = report.passed === report.total ? 0 : 1;
