#!/usr/bin/env node
// Proves Claude Code itself loads the adopted skills and subagents: starts a fresh headless
// `claude` in this repo, reads its init event, and stops it before any real work.
// Usage: npm run check:native-load   (needs the claude CLI, signed in)
import { spawn } from "node:child_process";
import { readdirSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const want = {
  skills: readdirSync(path.join(REPO, ".claude/skills")).filter((d) => existsSync(path.join(REPO, ".claude/skills", d, "SKILL.md"))),
  agents: readdirSync(path.join(REPO, ".claude/agents")).filter((f) => f.endsWith(".md")).map((f) => f.slice(0, -3)),
};

// Pass only what a normal login shell has, so a check run from inside another Claude Code
// session cannot attach to that session.
const env = Object.fromEntries(Object.entries(process.env).filter(([k]) => /^(HOME|PATH|USER|LOGNAME|SHELL|TMPDIR|LANG|LC_\w+|TERM|ANTHROPIC_API_KEY|NODE_EXTRA_CA_CERTS|HTTPS?_PROXY|NO_PROXY)$/i.test(k)));
const child = spawn("claude", ["-p", "--output-format", "stream-json", "--verbose", "--no-session-persistence", "--max-turns", "1", "Reply with OK"], { cwd: REPO, env, stdio: ["ignore", "pipe", "pipe"] });

let buffer = "";
let init = null;
child.stdout.on("data", (chunk) => {
  buffer += chunk;
  for (const line of buffer.split("\n").slice(0, -1)) {
    try {
      const event = JSON.parse(line);
      if (event.type === "system" && event.subtype === "init") {
        init = event;
        child.kill("SIGTERM");
      }
    } catch {}
  }
  buffer = buffer.slice(buffer.lastIndexOf("\n") + 1);
});
let stderr = "";
child.stderr.on("data", (c) => (stderr += c));
child.on("error", (e) => finish(`could not start claude: ${e.message}`));
child.on("close", () => finish(init ? null : `no init event from claude; stderr: ${stderr.slice(0, 400)}`));

function finish(error) {
  if (finish.done) return;
  finish.done = true;
  const loaded = { skills: init?.skills || [], agents: init?.agents || [] };
  const missing = { skills: want.skills.filter((s) => !loaded.skills.includes(s)), agents: want.agents.filter((a) => !loaded.agents.includes(a)) };
  const result = { checked_at: new Date().toISOString(), claude_code_version: init?.claude_code_version || null, cwd: init?.cwd || null, expected: want, missing, error, pass: !error && !missing.skills.length && !missing.agents.length };
  mkdirSync(path.join(REPO, "test-results"), { recursive: true });
  writeFileSync(path.join(REPO, "test-results/native-load.json"), JSON.stringify({ ...result, loaded }, null, 2) + "\n");
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.pass ? 0 : 1;
}
