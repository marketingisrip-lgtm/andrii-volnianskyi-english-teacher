// Minimal, dependency-free HTML reader for the static site checks.
// It is deliberately small: the site is hand-written, well-formed HTML, and the
// checks only need tags, attributes, ids, headings and visible text.
import { readFileSync, existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not URL.pathname: the owner's Mac paths contain spaces ("New project").
// SITE_ROOT lets tests/mutation.test.mjs run the same checks against a deliberately broken copy.
export const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
export const ROOT = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : REPO;

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TAG_RE = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/gi;
const ATTR_RE = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

export function parseAttrs(src) {
  const attrs = {};
  for (const m of src.matchAll(ATTR_RE)) attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? "";
  return attrs;
}

export function lineOf(html, index) {
  return html.slice(0, index).split("\n").length;
}

/** Tokenize into open/close/text events, tracking ancestors for each element. */
export function parse(html) {
  const elements = [];
  const errors = [];
  const stack = [];
  const text = [];
  let last = 0;
  for (const m of html.matchAll(TAG_RE)) {
    if (m.index > last) pushText(html.slice(last, m.index), m.index);
    last = m.index + m[0].length;
    if (m[0].startsWith("<!")) continue;
    const [, closing, rawName, attrSrc, selfClose] = m;
    const name = rawName.toLowerCase();
    if (closing) {
      const top = stack[stack.length - 1];
      if (!top || top.name !== name) {
        errors.push(`line ${lineOf(html, m.index)}: </${name}> does not close <${top ? top.name : "nothing"}>`);
        const at = stack.map((e) => e.name).lastIndexOf(name);
        if (at >= 0) stack.length = at;
      } else stack.pop();
      continue;
    }
    const el = { name, attrs: parseAttrs(attrSrc), line: lineOf(html, m.index), ancestors: stack.slice(), index: m.index };
    elements.push(el);
    if (!VOID.has(name) && !selfClose) stack.push(el);
    if (name === "script" || name === "style") {
      const end = html.indexOf(`</${name}>`, last);
      if (end > 0) last = end; // skip raw content; the close tag is consumed next
    }
  }
  if (last < html.length) pushText(html.slice(last), last);
  for (const open of stack) errors.push(`line ${open.line}: <${open.name}> is never closed`);
  return { elements, errors, text };

  function pushText(chunk, index) {
    const parent = stack[stack.length - 1];
    if (parent && (parent.name === "script" || parent.name === "style")) return;
    const value = decode(chunk).replace(/\s+/g, " ").trim();
    if (value) text.push({ value, line: lineOf(html, index), ancestors: stack.slice() });
  }
}

export function decode(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export function isHidden(el) {
  return [el, ...el.ancestors].some((a) => a.attrs["aria-hidden"] === "true");
}

/** Local file references (href/src and CSS url()) that should exist on disk. */
export function isLocalRef(ref) {
  return ref && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(ref);
}

export function cssUrls(css) {
  return [...css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)].map((m) => m[2]);
}

/** Every page at the site root: the portfolio and any learning page added beside it. */
export function sitePages(root = ROOT) {
  return readdirSync(root).filter((f) => f.endsWith(".html")).sort();
}

export function readSite(root = ROOT, page = "index.html") {
  const html = readFileSync(path.join(root, page), "utf8");
  const doc = parse(html);
  const stylesheets = doc.elements.filter((e) => e.name === "link" && /\bstylesheet\b/.test(e.attrs.rel || "")).map((e) => e.attrs.href);
  const localCss = stylesheets.filter(isLocalRef);
  const css = Object.fromEntries(localCss.filter((f) => existsSync(path.join(root, f))).map((f) => [f, readFileSync(path.join(root, f), "utf8")]));
  return { page, html, doc, stylesheets, localCss, css };
}

/** Magic-byte check so a saved error page cannot pass as an image. */
export function sniffImage(buf) {
  if (buf.length >= 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpeg";
  if (buf.length >= 4 && buf.readUInt32BE(0) === 0x00000100) return "ico";
  const head = buf.subarray(0, 512).toString("utf8").trimStart();
  if (/^(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*(<!DOCTYPE svg[^>]*>\s*)?<svg[\s>]/i.test(head)) return "svg";
  if (buf.length >= 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export function pngSize(buf) {
  return buf.length >= 24 ? { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) } : null;
}
