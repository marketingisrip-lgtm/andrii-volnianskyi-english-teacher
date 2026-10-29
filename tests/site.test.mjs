// Static checks for every root page and for what `npm run build` ships.
// Defects that need an owner decision live in web/known-issues.json; anything else fails.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { REPO, ROOT, readSite, sitePages, isHidden, isLocalRef, cssUrls, sniffImage } from "./lib/html.mjs";
import { buildToTemp } from "./lib/build.mjs";
import { judge, ratchet, register } from "./lib/register.mjs";
import { pdfFacts } from "./lib/pdf.mjs";

const IMAGE_BUDGET = 500 * 1024;
const RASTER = /\.(png|jpe?g|webp|gif|ico)$/i;
// Unambiguous US forms only; "practice"/"license" double as nouns in British English, so they are not listed.
const US_SPELLING = /\b(colou?r(?<!colour)(?:s|ed|ful|ing)?|behavior\w*|favor(?:ite|s|ed|able)?|honor\w*|labor\w*|neighbor\w*|center(?:s|ed)?|theater|catalog(?:s)?|dialog(?!ue)|analyz\w*|organiz\w*|optimiz\w*|recogniz\w*|personaliz\w*|prioritiz\w*|summariz\w*|emphasiz\w*|realiz\w*|speciali[zs]ed?(?<=z\w*)|traveled|traveling|modeling|enrollment|program(?:s)?(?=\s+(?:of|for|in)\b))\b/gi;
const pages = sitePages().map((page) => readSite(ROOT, page));
// *-review.html copies are staging (P1): checked like any page, never shipped, and left out of counts.
const shippedPages = pages.filter((p) => !p.page.endsWith("-review.html"));
const allCss = Object.assign({}, ...pages.map((p) => p.css));
assert.ok(shippedPages.length > 0 && Object.keys(allCss).length > 0, `no pages or stylesheets found under ${ROOT}: every check below would pass on nothing`);

const SKIP_DIRS = new Set([".git", "node_modules", "dist", "test-results", ".netlify"]);
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    if (SKIP_DIRS.has(f)) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const textOf = (doc, el) => doc.text.filter((t) => t.ancestors.includes(el)).map((t) => t.value).join(" ");

const refsOf = ({ doc, css }) =>
  [...doc.elements.flatMap((e) => [e.attrs.href, e.attrs.src]).filter(isLocalRef), ...Object.values(css).flatMap(cssUrls).filter(isLocalRef)].map((r) => decodeURI(r.split(/[?#]/)[0]));

for (const { page, doc, css } of pages) {
  test(`${page}: document metadata is complete`, () => {
    const html = doc.elements.find((e) => e.name === "html");
    const meta = (n) => doc.elements.find((e) => e.name === "meta" && e.attrs.name === n);
    assert.ok(html?.attrs.lang, "<html lang> missing");
    assert.ok(doc.elements.some((e) => e.name === "meta" && e.attrs.charset), "<meta charset> missing");
    assert.match(meta("viewport")?.attrs.content || "", /width=device-width/, "responsive viewport meta missing");
    assert.ok((meta("description")?.attrs.content || "").length >= 50, "meta description missing or too short");
    assert.ok(doc.elements.some((e) => e.name === "title"), "<title> missing");
  });

  test(`${page}: HTML tags are balanced`, () => {
    assert.deepEqual(doc.errors, []);
  });

  test(`${page}: ids are unique and every in-page link has a target`, () => {
    const ids = doc.elements.map((e) => e.attrs.id).filter(Boolean);
    assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], "duplicate ids");
    const anchors = doc.elements.map((e) => e.attrs.href).filter((h) => h?.startsWith("#") && h.length > 1);
    assert.deepEqual(anchors.filter((h) => !ids.includes(h.slice(1))), [], "anchors without a target");
  });

  test(`${page}: heading outline has one h1 and no skipped levels`, () => {
    const levels = doc.elements.filter((e) => /^h[1-6]$/.test(e.name)).map((e) => Number(e.name[1]));
    assert.equal(levels.filter((l) => l === 1).length, 1, "exactly one h1");
    const skips = levels.flatMap((l, i) => (i && l > levels[i - 1] + 1 ? [`h${levels[i - 1]} -> h${l}`] : []));
    assert.deepEqual(skips, []);
  });

  test(`${page}: every visible image has alt text`, () => {
    const missing = doc.elements.filter((e) => e.name === "img" && !isHidden(e) && !(e.attrs.alt || "").trim());
    assert.deepEqual(missing.map((e) => `line ${e.line}: ${e.attrs.src}`), []);
  });

  test(`${page}: links that open a new tab set rel=noopener or noreferrer`, () => {
    const bad = doc.elements.filter((e) => e.name === "a" && e.attrs.target === "_blank" && !/\bno(opener|referrer)\b/.test(e.attrs.rel || ""));
    assert.deepEqual(bad.map((e) => `line ${e.line}: ${e.attrs.href}`), []);
  });

  test(`${page}: every local file it or its CSS references exists`, () => {
    assert.deepEqual([...new Set(refsOf({ doc, css }))].filter((r) => !existsSync(path.join(ROOT, r))), []);
  });

  test(`${page}: copy keeps to British spelling`, () => {
    // House variety is British English (the copy already uses "optimisation", "Practising", "centre").
    const blocks = [...doc.text.map((t) => t.value), ...doc.elements.flatMap((e) => [e.attrs.alt, e.attrs.title, e.attrs["aria-label"], e.name === "meta" ? e.attrs.content : null]).filter(Boolean)];
    const found = blocks.flatMap((b) => [...b.matchAll(US_SPELLING)].map((m) => `"${m[0]}" in "${b.slice(0, 80)}"`));
    assert.deepEqual(found, [], "use the British form (colour, behaviour, centre, optimise, organise, analyse, programme, licence…)");
  });

  test(`${page}: copy has no repeated words or duplicated clauses`, () => {
    // Unicode-aware, so Ukrainian text is covered too (JS \b and \w are ASCII-only).
    const blocks = [...doc.text.map((t) => t.value), ...doc.elements.flatMap((e) => [e.attrs.alt, e.attrs.title, e.attrs["aria-label"]]).filter(Boolean)];
    const problems = [];
    for (const block of blocks) {
      for (const m of block.matchAll(/(?<![\p{L}\p{N}])([\p{L}\p{N}]+)\s+\1(?![\p{L}\p{N}])/giu)) problems.push(`repeated "${m[0]}" in "${block}"`);
      const words = block.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
      const first = new Map();
      for (let i = 0; i + 3 <= words.length; i++) {
        const gram = words.slice(i, i + 3).join(" ");
        if (first.has(gram) && i - first.get(gram) >= 3) problems.push(`clause "${gram}" twice in "${block}"`);
        else if (!first.has(gram)) first.set(gram, i);
      }
    }
    assert.deepEqual(problems, []);
  });
}

test("npm run build ships every page and every file the pages reference", () => {
  const { dist, cleanup } = buildToTemp(ROOT);
  try {
    // server/index.js is the Workers entry for the OpenAI-hosted target (see the web-release skill).
    const needed = ["server/index.js", ...shippedPages.map((p) => p.page), ...new Set(shippedPages.flatMap(refsOf))];
    assert.deepEqual(needed.filter((r) => !existsSync(path.join(dist, r))), [], "the build script's copy list is out of step with the pages");
    // And nothing else: assets have their own "referenced" check; anything outside them is a leak.
    const extra = walk(dist).map((f) => path.relative(dist, f)).filter((f) => !f.startsWith("assets/") && !needed.includes(f));
    assert.deepEqual(extra, [], "the build ships files no page needs");
  } finally {
    cleanup();
  }
});

test("asset files are what their extension says", () => {
  const files = walk(path.join(ROOT, "assets")).filter((f) => /\.(png|jpe?g|svg|webp|gif|ico)$/i.test(f));
  const violations = files.flatMap((f) => {
    const ext = path.extname(f).slice(1).toLowerCase().replace("jpg", "jpeg");
    const kind = sniffImage(readFileSync(f));
    return kind === ext ? [] : [{ target: path.relative(ROOT, f), detail: `content is ${kind || "not an image"}` }];
  });
  judge("asset-integrity", violations);
});

test("every shipped asset is referenced", () => {
  const texts = [...pages.map((p) => p.html), ...Object.values(allCss), readFileSync(path.join(ROOT, "script.js"), "utf8")].join("\n");
  const violations = walk(path.join(ROOT, "assets"))
    .map((f) => path.relative(ROOT, f))
    .filter((f) => !texts.includes(f))
    .map((f) => ({ target: f, detail: "not referenced by any page, its CSS or script.js" }));
  judge("asset-unreferenced", violations);
});

test("shipped raster images stay within the 500 KB budget", () => {
  const violations = walk(path.join(ROOT, "assets"))
    .filter((f) => RASTER.test(f) && statSync(f).size > IMAGE_BUDGET)
    .map((f) => ({ target: path.relative(ROOT, f), detail: `${Math.round(statSync(f).size / 1024)} KB` }));
  judge("image-weight", violations);
});

test("content is not hidden from visitors without JavaScript", () => {
  const violations = Object.entries(allCss).flatMap(([file, text]) =>
    [...text.matchAll(/(^|})\s*([^{}@]*\.reveal)\s*\{([^}]*)\}/g)]
      .filter((m) => /opacity\s*:\s*0(?![.\d])/.test(m[3]) && !/\.(js|has-js)\b/.test(m[2]))
      .map(() => ({ target: `${file} .reveal`, detail: "opacity:0 is not scoped to a JS-enabled class" })));
  judge("no-js-visibility", violations);
});

test("hard-coded colours do not grow (token ratchet)", () => {
  const count = Object.values(allCss).reduce((n, text) => n + (text.replace(/:root\s*\{[^}]*\}/, "").match(/#[0-9a-fA-F]{3,8}\b/g) || []).length, 0);
  ratchet("token-ratchet", count, "use var(--token) for new colours");
});

test("aria-label sits only on elements that can be named", () => {
  // ARIA forbids naming generic elements (div, span…) that have no role; screen readers ignore it.
  // One judgement across all pages: a staged *-review.html copy shares its source page's defects.
  const GENERIC = new Set(["div", "span", "p", "b", "i", "em", "strong", "small", "time"]);
  const violations = [];
  for (const { page, doc } of pages)
    for (const e of doc.elements.filter((e) => e.attrs["aria-label"] && GENERIC.has(e.name) && !e.attrs.role)) {
      const target = `${e.name}${e.attrs.class ? "." + e.attrs.class.split(/\s+/).join(".") : ""}`;
      if (!violations.some((v) => v.target === target)) violations.push({ target, detail: `${page}:${e.line} aria-label="${e.attrs["aria-label"]}" with no role` });
    }
  judge("aria-naming", violations);
});

test("images declare their size, so the layout does not jump while they load", () => {
  const count = shippedPages.flatMap((p) => p.doc.elements.filter((e) => e.name === "img" && !(e.attrs.width && e.attrs.height))).length;
  ratchet("image-dimensions", count, "give every <img> width and height attributes (its intrinsic size; CSS still scales it)");
});

// A <time> needs a machine-readable value in datetime, or as its text when there is no datetime:
// a year, month, date, local or global date-time, yearless date, week, time or duration.
const MACHINE_DATE = /^(?:\d{4,}(?:-\d{2}(?:-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?)?)?|--\d{2}-\d{2}|\d{4,}-W\d{2}|\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?|P(?=\d|T\d)(?:\d+D)?(?:T(?:\d+H)?(?:\d+M)?(?:\d+(?:\.\d+)?S)?)?)$/;
test("<time> elements carry a machine-readable date", () => {
  const count = shippedPages.flatMap((p) => p.doc.elements.filter((e) => e.name === "time" && !MACHINE_DATE.test((e.attrs.datetime ?? textOf(p.doc, e)).trim()))).length;
  ratchet("time-datetime", count, 'add datetime="YYYY" or "YYYY-MM"; a period has no single value, so write it as two <time> elements or as text in a <span>');
});

test("decorative glyphs are hidden from screen readers", () => {
  // An element whose whole text is symbols (◎, ▢, ★…) is an icon: screen readers announce it by name.
  const violations = [];
  for (const { page, doc } of pages)
    for (const t of doc.text) {
      const el = t.ancestors.at(-1);
      if (!el || !/^[^\p{L}\p{N}]+$/u.test(t.value) || textOf(doc, el) !== t.value || isHidden(el)) continue;
      const target = `${el.name} "${t.value}"`;
      if (!violations.some((v) => v.target === target)) violations.push({ target, detail: `${page}:${t.line} not aria-hidden` });
    }
  judge("glyph-hidden", violations);
});

test("animations that run forever come with a pause control (WCAG 2.2.2)", () => {
  const css = Object.values(allCss).join("\n");
  const keyframes = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]));
  const forever = new Set();
  for (const [, body] of css.matchAll(/[^{}]+\{([^{}]*)\}/g))
    if (/animation(?:-iteration-count)?\s*:[^;}]*\binfinite\b/.test(body)) for (const name of body.match(/[\w-]+/g)) if (keyframes.has(name)) forever.add(name);
  const pause = shippedPages.some(({ doc }) => doc.elements.some((e) => e.name === "button" && /pause|stop|motion|animation/i.test(`${e.attrs["aria-label"] || ""} ${textOf(doc, e)}`)));
  judge("motion-pause", pause ? [] : [...forever].map((name) => ({ target: name, detail: "runs forever and the page has no pause control" })));
});

test("pages carry social-preview and canonical metadata", () => {
  const violations = [];
  for (const { doc } of shippedPages)
    for (const prop of ["og:title", "og:description", "og:image", "canonical"]) {
      const has = doc.elements.some((e) => (e.name === "meta" && [e.attrs.property, e.attrs.name].includes(prop) && e.attrs.content) || (e.name === "link" && e.attrs.rel === prop && e.attrs.href));
      if (!has && !violations.some((v) => v.target === prop)) violations.push({ target: prop, detail: "missing, so shared links render without a preview" });
    }
  judge("social-meta", violations);
});

test("text in another alphabet is marked with its language (WCAG 3.1.2)", () => {
  // Also catches a Cyrillic letter typed inside an English word (о for o), which looks identical.
  const LANG = /^(uk|ru|be|bg|sr|mk)\b/i;
  const problems = [];
  for (const { page, doc } of pages) {
    for (const t of doc.text) if (/\p{Script=Cyrillic}/u.test(t.value) && !t.ancestors.some((a) => LANG.test(a.attrs.lang || ""))) problems.push(`${page}:${t.line} "${t.value.slice(0, 50)}"`);
    for (const e of doc.elements)
      for (const a of ["alt", "title", "aria-label"])
        if (/\p{Script=Cyrillic}/u.test(e.attrs[a] || "") && ![e, ...e.ancestors].some((x) => LANG.test(x.attrs.lang || ""))) problems.push(`${page}:${e.line} ${a}="${e.attrs[a].slice(0, 50)}"`);
  }
  assert.deepEqual(problems, [], 'wrap other-language text in an element with lang="uk", or retype a look-alike letter');
});

test("shipped PDFs are readable documents with a text layer and a proper title", () => {
  const violations = [];
  for (const f of walk(path.join(ROOT, "assets")).filter((f) => /\.pdf$/i.test(f))) {
    const rel = path.relative(ROOT, f);
    const facts = pdfFacts(readFileSync(f));
    assert.ok(facts?.pages > 0, `${rel} is not a readable PDF`);
    if (!facts.hasText) violations.push({ target: rel, detail: "image-only: no text for screen readers, search or recruiters' ATS" });
    if (!facts.title || /_|\.pdf$/i.test(facts.title)) violations.push({ target: `${rel} title`, detail: `title "${facts.title ?? ""}" reads as a file name` });
  }
  judge("document-text", violations);
});

test("every shipped document was reviewed for personal data", () => {
  const review = JSON.parse(readFileSync(path.join(ROOT, "web/privacy-review.json"), "utf8")).reviewed;
  const docs = walk(path.join(ROOT, "assets")).map((f) => path.relative(ROOT, f)).filter((f) => f.startsWith("assets/certificates/") || /\.pdf$/i.test(f));
  const sha = (f) => createHash("sha256").update(readFileSync(path.join(ROOT, f))).digest("hex");
  assert.deepEqual(docs.filter((f) => review.find((r) => r.file === f)?.sha256 !== sha(f)), [], "unreviewed, or changed since review: look at each for personal data, then record it in web/privacy-review.json");
  assert.deepEqual(review.filter((r) => !docs.includes(r.file)).map((r) => r.file), [], "reviewed files that no longer ship: remove them from web/privacy-review.json");
  judge("personal-data", review.filter((r) => r.decision === "redact").map((r) => ({ target: r.file, detail: r.notes })));
});

// High-signal credential shapes only. Matches are reported by file, line and kind, never by value.
const SECRET_SHAPES = {
  "private key": /-----BEGIN (?:[A-Z]+ )?PRIVATE KEY-----/,
  "AWS access key": /\bAKIA[0-9A-Z]{16}\b/,
  "GitHub token": /\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})/,
  "Slack token": /\bxox[abprs]-[A-Za-z0-9-]{10,}/,
  "Google API key": /\bAIza[0-9A-Za-z_-]{35}/,
  "Anthropic key": /\bsk-ant-[A-Za-z0-9_-]{20,}/,
  "OpenAI key": /(?<![\w-])sk-(?:proj-)?[A-Za-z0-9_-]{32,}/,
  "Stripe live key": /\b[rs]k_live_[0-9A-Za-z]{20,}/,
};
test("no credentials are committed", () => {
  const found = [];
  for (const f of walk(ROOT).filter((f) => !/\.(png|jpe?g|webp|gif|ico|pdf|woff2?)$/i.test(f))) {
    const lines = readFileSync(f, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const [kind, re] of Object.entries(SECRET_SHAPES)) if (re.test(line)) found.push(`${path.relative(ROOT, f)}:${i + 1} ${kind}`);
    });
  }
  assert.deepEqual(found, [], "remove the credential, rotate it, and load it from the environment");
  assert.match(readFileSync(path.join(ROOT, ".gitignore"), "utf8"), /^\.env/m, ".gitignore must ignore .env files");
});

test("every known-issues entry is re-checked by a test", () => {
  // An entry no test judges can go stale unnoticed, which is what the register exists to prevent.
  const sources = readdirSync(path.join(REPO, "tests")).filter((f) => f.endsWith(".mjs")).map((f) => readFileSync(path.join(REPO, "tests", f), "utf8")).join("\n");
  const checked = new Set([...sources.matchAll(/\b(?:judge|ratchet)\("([\w-]+)"/g)].map((m) => m[1]));
  const ids = register.map((i) => i.id);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], "duplicate ids");
  assert.deepEqual(register.filter((i) => !checked.has(i.check)).map((i) => `${i.id} (${i.check})`), [], "no test re-checks these: add a check, or move the finding to the receipt");
  const malformed = register.filter((i) => !i.id || !i.finding || !i.suggested_fix || !["major", "minor", "info"].includes(i.severity) || (i.target === undefined) === (i.limit === undefined));
  assert.deepEqual(malformed.map((i) => i.id), [], "each entry needs id, check, a target or a limit (not both), severity major/minor/info, finding and suggested_fix");
});
