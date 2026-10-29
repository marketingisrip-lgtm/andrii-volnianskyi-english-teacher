// Runtime checks in a real browser, against the built site served over HTTP.
// Needs Playwright with Chromium (`npm i -D playwright && npx playwright install chromium`
// on a fresh machine). Writes screenshots and test-results/runtime-evidence.json.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { ROOT } from "./lib/html.mjs";
import { buildToTemp, serve } from "./lib/build.mjs";
import { register, judge } from "./lib/register.mjs";

const WIDTHS = [320, 390, 768, 1280]; // 320 = WCAG 1.4.10 reflow width
const OUT = path.join(ROOT, "test-results");
const evidence = { generated_at: new Date().toISOString(), widths: {}, external_requests_blocked: [], no_js: null, reduced_motion: null };

let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch {
  throw new Error("Playwright is not installed: runtime checks cannot run. Install it (npm i -D playwright && npx playwright install chromium); a skipped browser check is not a pass.");
}

let browser, site, build;
before(async () => {
  build = buildToTemp(ROOT);
  site = await serve(build.dist);
  browser = await chromium.launch();
  mkdirSync(path.join(OUT, "screens"), { recursive: true });
});
after(async () => {
  await browser?.close();
  await site?.close();
  build?.cleanup();
  // Written even when the browser never launched, so a failed run cannot leave older evidence looking current.
  evidence.browser_launched = Boolean(browser);
  writeFileSync(path.join(OUT, "runtime-evidence.json"), JSON.stringify(evidence, null, 2) + "\n");
});

/** Open the page with third-party requests blocked, so results do not depend on the network. */
async function open(contextOptions) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const log = { console: [], pageErrors: [], failed: [] };
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(site.url)) return route.continue();
    if (!evidence.external_requests_blocked.includes(new URL(url).origin)) evidence.external_requests_blocked.push(new URL(url).origin);
    return route.abort();
  });
  page.on("console", (m) => m.type() === "error" && !/ERR_FAILED|net::/.test(m.text()) && log.console.push(m.text()));
  page.on("pageerror", (e) => log.pageErrors.push(String(e)));
  page.on("response", (r) => r.url().startsWith(site.url) && r.status() >= 400 && log.failed.push(`${r.status()} ${r.url()}`));
  await page.goto(site.url, { waitUntil: "load" });
  return { context, page, log };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight * 0.6)) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 1300)); // count-up animation runs 900 ms
  });
}

for (const width of WIDTHS) {
  test(`renders cleanly at ${width}px`, async () => {
    const { context, page, log } = await open({ viewport: { width, height: 900 } });
    try {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      await scrollThrough(page);
      const hiddenReveals = await page.$$eval(".reveal", (els) => els.filter((e) => !e.classList.contains("is-visible")).map((e) => e.id || e.className));
      const counters = await page.$$eval("[data-count]", (els) => els.map((e) => ({ target: e.dataset.count, text: e.textContent })));
      const shot = path.join(OUT, "screens", `w${width}.png`);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: shot, fullPage: true });
      evidence.widths[width] = {
        horizontal_overflow_px: overflow,
        hidden_reveal_sections: hiddenReveals,
        counters,
        console_errors: log.console,
        page_errors: log.pageErrors,
        failed_local_requests: log.failed,
        screenshot: path.relative(ROOT, shot),
        screenshot_sha256: createHash("sha256").update(readFileSync(shot)).digest("hex"),
      };
      assert.deepEqual(log.pageErrors, [], "uncaught page errors");
      assert.deepEqual(log.console, [], "console errors");
      assert.deepEqual(log.failed, [], "local requests that failed");
      assert.ok(overflow <= 1, `page scrolls sideways by ${overflow}px`);
      assert.deepEqual(hiddenReveals, [], "sections still hidden after scrolling past them");
      const STATIC = { 8: "8+", 4: "4", 30: "30%", 280: "280%" };
      for (const c of counters) assert.equal(c.text, STATIC[c.target] ?? c.text, `counter ${c.target} ended at "${c.text}"`);
    } finally {
      await context.close();
    }
  });
}

test("navigation links land with the section's first line on screen", async () => {
  const { context, page } = await open({ viewport: { width: 1280, height: 900 } });
  try {
    const violations = [];
    evidence.nav_landing = {};
    for (const href of await page.$$eval(".nav-links a", (as) => as.map((a) => a.getAttribute("href")))) {
      await page.goto(site.url);
      await page.click(`.nav-links a[href="${href}"]`);
      // Wait for the state a visitor ends up in: scrolling stopped and the 0.7 s reveal finished.
      await page.waitForFunction(async (sel) => {
        const y = scrollY;
        await new Promise((r) => setTimeout(r, 150));
        return y === scrollY && document.querySelector(sel).classList.contains("is-visible");
      }, href, { timeout: 5000 });
      await page.waitForTimeout(800);
      const landing = await page.$eval(href, (el) => {
        const first = el.querySelector("p, h1, h2, h3");
        return { section_top: Math.round(el.getBoundingClientRect().top), first_line_top: Math.round(first.getBoundingClientRect().top), first_line: first.textContent.trim().slice(0, 40) };
      });
      evidence.nav_landing[href] = landing;
      if (landing.first_line_top < 0 || landing.first_line_top > 400) violations.push({ target: href, detail: `first line "${landing.first_line}" lands at ${landing.first_line_top}px` });
    }
    judge("nav-landing", violations);
  } finally {
    await context.close();
  }
});

test("reduced-motion visitors see every section without scrolling", async () => {
  const { context, page } = await open({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  try {
    const transparent = await page.$$eval(".reveal", (els) => els.filter((e) => getComputedStyle(e).opacity === "0").length);
    evidence.reduced_motion = { transparent_reveal_sections: transparent };
    assert.equal(transparent, 0);
  } finally {
    await context.close();
  }
});

test("no-JavaScript rendering matches web/known-issues.json", async () => {
  const { context, page } = await open({ viewport: { width: 1280, height: 900 }, javaScriptEnabled: false });
  try {
    const [total, transparent] = await page.$$eval(".reveal", (els) => [els.length, els.filter((e) => getComputedStyle(e).opacity === "0").length]);
    evidence.no_js = { reveal_sections: total, transparent_reveal_sections: transparent };
    const registered = register.some((i) => i.id === "no-js-hidden-reveal");
    assert.equal(transparent > 0, registered, registered ? "no-js-hidden-reveal is registered but no longer reproduces: remove it" : `${transparent} sections are invisible without JavaScript`);
  } finally {
    await context.close();
  }
});

test("keyboard reaches every control and focus stays visible", async () => {
  const { context, page } = await open({ viewport: { width: 1280, height: 900 } });
  try {
    const total = await page.$$eval("a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])", (els) => els.filter((e) => e.offsetParent !== null).length);
    const visited = new Set();
    const invisible = [];
    for (let i = 0; i < total; i++) {
      await page.keyboard.press("Tab");
      const f = await page.evaluate(() => {
        const e = document.activeElement;
        if (!e || e === document.body) return null;
        const cs = getComputedStyle(e);
        // Index in document order: the header and footer wordmarks share href and text.
        const index = [...document.querySelectorAll("a[href], button, input, select, textarea, [tabindex]")].indexOf(e);
        return { key: `${index}:${e.tagName}|${e.textContent.trim().slice(0, 30)}`, visible: cs.outlineStyle !== "none" || cs.boxShadow !== "none" };
      });
      assert.ok(f, `focus fell back to <body> after ${i + 1} Tab presses`);
      visited.add(f.key);
      if (!f.visible) invisible.push(f.key);
    }
    evidence.keyboard = { focusable: total, reached: visited.size, without_visible_focus: invisible };
    assert.equal(visited.size, total, "some controls are unreachable by Tab");
    assert.deepEqual(invisible, [], "focused controls with no outline or box-shadow");
  } finally {
    await context.close();
  }
});

test("touch targets meet WCAG 2.5.8 (24px, or spaced so 24px circles do not overlap)", async () => {
  const { context, page } = await open({ viewport: { width: 390, height: 844 } });
  try {
    const targets = await page.$$eval("a[href], button, input, select, textarea", (els) =>
      els.filter((e) => e.offsetParent !== null).map((e) => {
        const r = e.getBoundingClientRect();
        const inline = getComputedStyle(e).display === "inline" && !!e.closest("p, li");
        return { label: e.textContent.trim().slice(0, 40) || e.getAttribute("href"), x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, inline };
      }));
    const small = (t) => !t.inline && (t.w < 24 || t.h < 24);
    const centre = (t) => [t.x + t.w / 2, t.y + t.h / 2];
    const circleHitsRect = ([cx, cy], t) => Math.hypot(cx - Math.max(t.x, Math.min(cx, t.x + t.w)), cy - Math.max(t.y, Math.min(cy, t.y + t.h))) < 12;
    const violations = targets.filter(small).flatMap((a) => {
      const clash = targets.find((b) => b !== a && (small(b) ? Math.hypot(centre(a)[0] - centre(b)[0], centre(a)[1] - centre(b)[1]) < 24 : circleHitsRect(centre(a), b)));
      return clash ? [{ target: a.label, detail: `${Math.round(a.w)}x${Math.round(a.h)}px and its 24px circle overlaps "${clash.label}"` }] : [];
    });
    evidence.target_size = { undersized: targets.filter(small).map((t) => `${t.label} ${Math.round(t.w)}x${Math.round(t.h)}`), failing_spacing_exception: violations.map((v) => v.target) };
    judge("target-size", violations);
  } finally {
    await context.close();
  }
});

test("a skip link leads to the main content", async () => {
  const { context, page } = await open({ viewport: { width: 1280, height: 900 } });
  try {
    await page.keyboard.press("Tab");
    const first = await page.evaluate(() => {
      const a = document.activeElement;
      const target = a?.getAttribute("href")?.startsWith("#") ? document.querySelector(a.getAttribute("href")) : null;
      return { href: a?.getAttribute("href"), text: a?.textContent.trim(), leadsToMain: !!target && (target.tagName === "MAIN" || !!target.closest("main") || !!target.querySelector?.("main")) && target.id !== "top" };
    });
    evidence.skip_link = first;
    judge("skip-link", first.leadsToMain ? [] : [{ target: "index.html", detail: `first Tab stop is ${first.href} "${first.text}", not a skip link to <main>` }]);
  } finally {
    await context.close();
  }
});

// A FontFaceSet with no faces makes document.fonts.check() return true, so "check" proves nothing
// when the stylesheet never loaded. Require loaded faces, and report NOT RUN when the font host
// is unreachable instead of passing.
const FONT_FAMILIES = ["Manrope", "Playfair Display", "DM Mono"];
const fontsReachable = await fetch("https://fonts.googleapis.com/css2?family=Manrope", { signal: AbortSignal.timeout(5000) }).then((r) => r.ok, () => false);
test("declared web fonts actually load", { skip: fontsReachable ? false : "NOT RUN: fonts.googleapis.com is unreachable from this machine" }, async () => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  try {
    const page = await context.newPage();
    await page.goto(site.url, { waitUntil: "networkidle" });
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/["']/g, ""));
    });
    evidence.fonts_loaded = [...new Set(loaded)];
    assert.deepEqual(FONT_FAMILIES.filter((f) => !loaded.includes(f)), [], "declared families with no loaded face (text fell back to a system font)");
  } finally {
    await context.close();
  }
});

test("body copy is at least 14px", async () => {
  const violations = [];
  evidence.text_size = {};
  for (const width of [390, 1280]) {
    const { context, page } = await open({ viewport: { width, height: 900 } });
    try {
      const small = await page.$$eval("p, li", (els) =>
        els.filter((e) => e.offsetParent !== null && e.textContent.trim().length > 20 && !e.closest(".eyebrow, .mini-head"))
          .map((e) => ({ px: parseFloat(getComputedStyle(e).fontSize), where: (e.closest("section, footer, header")?.className || "page").split(" ")[0] }))
          .filter((x) => x.px < 14));
      const bySection = {};
      for (const s of small) bySection[s.where] = Math.min(bySection[s.where] ?? 99, s.px);
      evidence.text_size[width] = bySection;
      if (small.length) violations.push({ target: "index.html", detail: `at ${width}px: ${JSON.stringify(bySection)}` });
    } finally {
      await context.close();
    }
  }
  judge("text-size", violations.slice(0, 1));
});
