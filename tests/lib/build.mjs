// Run `npm run build` in a throwaway copy, so tests check what ships without touching ./dist.
import { mkdtempSync, cpSync, rmSync, createReadStream, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const SKIP = new Set([".git", "node_modules", "dist", "test-results"]);

export function buildToTemp(root) {
  const work = mkdtempSync(path.join(tmpdir(), "site-build-"));
  cpSync(root, work, { recursive: true, filter: (src) => !path.relative(root, src).split(path.sep).some((s) => SKIP.has(s)) });
  execFileSync("npm", ["run", "build", "--silent"], { cwd: work, stdio: "pipe" });
  return { dist: path.join(work, "dist"), cleanup: () => rmSync(work, { recursive: true, force: true }) };
}

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".ico": "image/x-icon", ".webp": "image/webp" };

/** Serve a directory over HTTP (never file://: browsers treat file pages differently). */
export function serve(dir) {
  const server = createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (rel.endsWith("/")) rel += "index.html";
    const file = path.join(dir, path.normalize(rel));
    if (!file.startsWith(dir) || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(404).end("not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve({ url: `http://127.0.0.1:${server.address().port}/`, close: () => new Promise((r) => server.close(r)) })));
}
