// Static checks for every root page and for what `npm run build` ships.
// Defects that need an owner decision live in web/known-issues.json; anything else fails.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { ROOT, readSite, sitePages, isHidden, isLocalRef, cssUrls, sniffImage } from "./lib/html.mjs";
import { buildToTemp } from "./lib/build.mjs";
import { judge, register } from "./lib/register.mjs";

const IMAGE_BUDGET = 500 * 1024;
const RASTER = /\.(png|jpe?g|webp|gif|ico)$/i;
// Unambiguous US forms only; "practice"/"license" double as nouns in British English, so they are not listed.
const US_SPELLING = /\b(colou?r(?<!colour)(?:s|ed|ful|ing)?|behavior\w*|favor(?:ite|s|ed|able)?|honor\w*|labor\w*|neighbor\w*|center(?:s|ed)?|theater|catalog(?:s)?|dialog(?!ue)|analyz\w*|organiz\w*|optimiz\w*|recogniz\w*|personaliz\w*|prioritiz\w*|summariz\w*|emphasiz\w*|realiz\w*|speciali[zs]ed?(?<=z\w*)|traveled|traveling|modeling|enrollment|program(?:s)?(?=\s+(?:of|for|in)\b))\b/gi;
const pages = sitePages().map((page) => readSite(ROOT, page));
const allCss = Object.assign({}, ...pages.map((p) => p.css));

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

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
    // *-review.html copies are staging (P1): checked like any page, never shipped.
    const shipped = pages.filter((p) => !p.page.endsWith("-review.html"));
    const needed = ["server/index.js", ...shipped.map((p) => p.page), ...new Set(shipped.flatMap(refsOf))];
    assert.deepEqual(needed.filter((r) => !existsSync(path.join(dist, r))), [], "the build script's copy list is out of step with the pages");
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
  const entry = register.find((i) => i.check === "token-ratchet");
  const count = Object.values(allCss).reduce((n, text) => n + (text.replace(/:root\s*\{[^}]*\}/, "").match(/#[0-9a-fA-F]{3,8}\b/g) || []).length, 0);
  assert.ok(entry, "register a token-ratchet entry with the current count as limit");
  assert.ok(count <= entry.limit, `${count} hex literals, above the ratchet of ${entry.limit}: use var(--token) for new colours`);
  assert.equal(count, entry.limit, `only ${count} hex literals now: lower "limit" in web/known-issues.json to ${count} so the gain is kept`);
});
