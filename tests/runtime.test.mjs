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
import { decodePng, luminance, ratio } from "./lib/png.mjs";

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
  const log = { console: [], pageErrors: [], failed: [], external: [] };
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith(site.url)) return route.continue();
    const { origin } = new URL(url);
    if (!log.external.includes(origin)) log.external.push(origin);
    if (!evidence.external_requests_blocked.includes(origin)) evidence.external_requests_blocked.push(origin);
    return route.abort();
  });
  page.on("console", (m) => m.type() === "error" && !/ERR_FAILED|net::/.test(m.text()) && log.console.push(m.text()));
  page.on("pageerror", (e) => log.pageErrors.push(String(e)));
  page.on("response", (r) => r.url().startsWith(site.url) && r.status() >= 400 && log.failed.push(`${r.status()} ${r.url()}`));
  await page.goto(site.url, { waitUntil: "load" });
  return { context, page, log };
}

/**
 * Bring each reveal section and each counter into view and wait for its end state. A fixed-delay
 * sweep with smooth scrolling flaked under CPU load: the page could pass a short section between
 * frames, so its IntersectionObserver never fired. Returns what never settled.
 */
async function scrollThrough(page, selector = ".reveal, [data-count]") {
  const unsettled = [];
  for (const sel of await page.$$eval(selector, (els) => els.map((e, i) => (e.dataset.probe = String(i), `[data-probe="${i}"]`)))) {
    await page.$eval(sel, (el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
    const settled = await page
      .waitForFunction((s) => {
        const el = document.querySelector(s);
        if (el.classList.contains("reveal")) return el.classList.contains("is-visible");
        const suffix = el.textContent.includes("+") ? "+" : el.textContent.includes("%") ? "%" : "";
        return el.textContent === `${el.dataset.count}${suffix}`;
      }, sel, { timeout: 4000 })
      .then(() => true, () => false);
    if (!settled) unsettled.push(await page.$eval(sel, (el) => (el.id ? `#${el.id}` : el.classList.length ? `.${el.classList[0]}` : `[data-count="${el.dataset.count}"]`)));
  }
  return unsettled;
}

for (const width of WIDTHS) {
  test(`renders cleanly at ${width}px`, async () => {
    const { context, page, log } = await open({ viewport: { width, height: 900 } });
    try {
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
      const hiddenReveals = await scrollThrough(page);
      // Images below the first screen load lazily, as a visitor scrolls. Bring each rendered one into
      // view and wait for it, or the evidence shot shows blank frames where certificates should be.
      for (const sel of await page.$$eval("img", (els) => els.filter((e) => e.offsetParent !== null).map((e, i) => (e.dataset.img = String(i), `img[data-img="${i}"]`))))
        await page.$eval(sel, (el) => el.scrollIntoView({ block: "center", behavior: "instant" }));
      const unloaded = await page
        .waitForFunction(() => [...document.images].every((i) => i.offsetParent === null || (i.complete && i.naturalWidth > 0)), null, { timeout: 15000 })
        .then(() => [], () => page.$$eval("img", (els) => els.filter((i) => i.offsetParent !== null && !(i.complete && i.naturalWidth > 0)).map((i) => i.getAttribute("src"))));
      const counters = await page.$$eval("[data-count]", (els) => els.map((e) => ({ target: e.dataset.count, text: e.textContent })));
      const shot = path.join(OUT, "screens", `w${width}.png`);
      await page.evaluate(() => scrollTo(0, 0));
      await page.screenshot({ path: shot, fullPage: true });
      evidence.widths[width] = {
        horizontal_overflow_px: overflow,
        hidden_reveal_sections: hiddenReveals,
        images_not_loaded: unloaded,
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
      assert.deepEqual(hiddenReveals, [], "sections or counters that never reached their end state when scrolled into view");
      assert.deepEqual(unloaded, [], "images that never loaded when scrolled into view");
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
// is unreachable instead of passing. The probe runs inside the test: a top-level await between
// tests makes node:test run the after() hook early when --test-name-pattern skips the earlier ones.
const FONT_FAMILIES = ["Manrope", "Playfair Display", "DM Mono"];
test("declared web fonts actually load", async (t) => {
  const reachable = await fetch("https://fonts.googleapis.com/css2?family=Manrope", { signal: AbortSignal.timeout(5000) }).then((r) => r.ok, () => false);
  if (!reachable) return t.skip("NOT RUN: fonts.googleapis.com is unreachable from this machine");
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

test("text meets WCAG 1.4.3 contrast against what is actually rendered behind it", async () => {
  // Every text box is measured against the rendered pixels behind it: glyphs are hidden, the page is
  // captured once, and the background under each line box is sampled. Reading background-color
  // from ancestors missed text over the paintings, because the paintings are positioned siblings.
  const violations = [];
  evidence.contrast = {};
  for (const width of [390, 1280]) {
    const { context, page } = await open({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    try {
      // Reduced motion cuts every animation to one .01ms run but keeps its delay. Pausing animations
      // instead froze the hero's delayed entrance at opacity 0, so "Contact me" read as 1.02:1.
      const settled = await page.waitForFunction(() => document.getAnimations().every((a) => a.playState === "finished"), null, { timeout: 5000 }).then(() => true, () => false);
      assert.ok(settled, `animations never settled: ${await page.evaluate(() => document.getAnimations().filter((a) => a.playState !== "finished").map((a) => a.animationName || a.constructor.name).join(", "))}`);
      const boxes = await page.evaluate(() => {
        const parse = (c) => {
          const m = c.match(/rgba?\(([^)]+)\)/);
          const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
          return { r, g, b, a };
        };
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const texts = [...el.childNodes].filter((t) => t.nodeType === 3 && t.textContent.trim());
          if (!texts.length || el.offsetParent === null) continue;
          const cs = getComputedStyle(el);
          if (parseFloat(cs.opacity) === 0 || cs.visibility === "hidden") continue;
          const px = parseFloat(cs.fontSize);
          const large = px >= 24 || (parseInt(cs.fontWeight) >= 700 && px >= 18.66);
          const host = el.parentElement?.closest("[class]");
          const target = `${host ? `${host.tagName.toLowerCase()}.${host.classList[0]} ` : ""}${el.tagName.toLowerCase()}${[...el.classList].map((c) => "." + c).join("")}`;
          const rects = texts.flatMap((t) => { const r = document.createRange(); r.selectNodeContents(t); return [...r.getClientRects()]; }).filter((r) => r.width > 1 && r.height > 1);
          if (rects.length) out.push({ target, label: texts.map((t) => t.textContent.trim()).join(" ").slice(0, 24), px, need: large ? 3 : 4.5, color: parse(cs.color), rects: rects.map((r) => ({ x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height })) });
        }
        return out;
      });
      assert.ok(boxes.length > 50, `only ${boxes.length} text boxes found: the probe is not seeing the page`);
      await page.addStyleTag({ content: "body,body *,body *::before,body *::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}" });
      // Capture viewport-sized windows while scrolling. A fullPage screenshot resizes the viewport to
      // the page height, which reflows vh-based sections, so measured boxes no longer line up with it.
      const stats = boxes.map(() => ({ total: 0, below: 0, worst: Infinity }));
      const done = boxes.map((b) => b.rects.map(() => false));
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let top = 0; top < height; top += 700) {
        const at = await page.evaluate((y) => (scrollTo({ top: y, behavior: "instant" }), scrollY), top);
        const shot = decodePng(await page.screenshot({ type: "png" }));
        boxes.forEach((b, i) => b.rects.forEach((r, j) => {
          if (done[i][j] || r.y < at || r.y + r.height > at + shot.height) return;
          done[i][j] = true;
          const fg = b.color;
          const fgLum = fg.a >= 1 ? luminance(fg.r, fg.g, fg.b) : null;
          for (let y = Math.floor(r.y - at); y < Math.min(shot.height, Math.ceil(r.y - at + r.height)); y++)
            for (let x = Math.max(0, Math.floor(r.x)); x < Math.min(shot.width, Math.ceil(r.x + r.width)); x++) {
              const o = (y * shot.width + x) * shot.bpp;
              const [R, G, B] = [shot.data[o], shot.data[o + 1], shot.data[o + 2]];
              const c = ratio(fgLum ?? luminance(fg.r * fg.a + R * (1 - fg.a), fg.g * fg.a + G * (1 - fg.a), fg.b * fg.a + B * (1 - fg.a)), luminance(R, G, B));
              stats[i].total++;
              if (c < b.need) stats[i].below++;
              if (c < stats[i].worst) stats[i].worst = c;
            }
        }));
      }
      const failing = [];
      boxes.forEach((b, i) => {
        const { total, below, worst } = stats[i];
        assert.ok(total > 0, `text box "${b.label}" sampled zero pixels`);
        // Fail when more than 5% of the background under the text is below the threshold.
        if (below / total > 0.05) failing.push({ target: b.target, detail: `"${b.label}" ${((below / total) * 100).toFixed(1)}% of background below ${b.need}:1, worst ${worst.toFixed(2)}:1 at ${b.px}px` });
      });
      evidence.contrast[width] = { text_boxes_sampled: boxes.length, failing: failing.map((v) => `${v.target}: ${v.detail}`) };
      for (const v of failing) if (!violations.some((x) => x.target === v.target)) violations.push(v);
    } finally {
      await context.close();
    }
  }
  judge("contrast", violations);
});

// Short phones, phones held sideways, and 1280x1024 at 400% zoom (a 320x256 CSS viewport).
const SHORT_VIEWPORTS = [{ width: 320, height: 568 }, { width: 568, height: 320 }, { width: 320, height: 256 }];
test("every section reveals on short and zoomed screens (WCAG 1.4.10)", async () => {
  const violations = [];
  evidence.short_viewports = {};
  for (const viewport of SHORT_VIEWPORTS) {
    const { context, page } = await open({ viewport });
    try {
      const never = await scrollThrough(page, ".reveal");
      // Keyboard focus still enters a section that never appears, onto controls nobody can see.
      const focusable = await page.$$eval(".reveal:not(.is-visible)", (els) => els.reduce((n, el) => n + el.querySelectorAll("a[href], button, input, select, textarea").length, 0));
      evidence.short_viewports[`${viewport.width}x${viewport.height}`] = { never_revealed: never, focusable_controls_inside: focusable };
      // The viewport is part of the target, so a registered section cannot hide a regression at another size.
      for (const t of never) violations.push({ target: `${t} at ${viewport.width}x${viewport.height}`, detail: "never reveals" });
    } finally {
      await context.close();
    }
  }
  judge("reveal-short-viewport", violations);
});

test("phones and tablets get in-page navigation", async () => {
  const missing = [];
  for (const width of [390, 768]) {
    const { context, page } = await open({ viewport: { width, height: 844 } });
    try {
      const ways = await page.$$eval("header a[href^='#'], nav a[href^='#'], header button[aria-expanded], nav button[aria-expanded]", (els) =>
        els.filter((e) => e.offsetParent !== null && !/^#(top|main|content)?$/.test(e.getAttribute("href") ?? "x")).length);
      if (!ways) missing.push(width);
    } finally {
      await context.close();
    }
  }
  evidence.mobile_navigation_missing_at = missing;
  judge("mobile-nav", missing.length ? [{ target: "in-page navigation below 800px", detail: `no visible section links or menu button at ${missing.join(" and ")}px` }] : []);
});

test("the page makes no third-party requests beyond the registered ones", async () => {
  const { context, page, log } = await open({ viewport: { width: 1280, height: 900 } });
  try {
    await scrollThrough(page);
    judge("third-party", log.external.map((origin) => ({ target: origin, detail: "requested while the page loads and scrolls" })));
  } finally {
    await context.close();
  }
});

test("no visible text is smaller than 10px", async () => {
  // A floor for labels; body copy has its own 14px check above.
  const violations = [];
  evidence.text_floor = {};
  for (const width of [390, 1280]) {
    const { context, page } = await open({ viewport: { width, height: 900 }, reducedMotion: "reduce" });
    try {
      const tiny = await page.evaluate(() => {
        const out = [];
        for (const el of document.querySelectorAll("body *")) {
          const text = [...el.childNodes].filter((t) => t.nodeType === 3 && t.textContent.trim()).map((t) => t.textContent.trim()).join(" ");
          if (!text || el.offsetParent === null || parseFloat(getComputedStyle(el).fontSize) >= 10) continue;
          const host = el.parentElement?.closest("[class]");
          out.push({ target: `${host ? `${host.tagName.toLowerCase()}.${host.classList[0]} ` : ""}${el.tagName.toLowerCase()}${[...el.classList].map((c) => "." + c).join("")}`, px: parseFloat(getComputedStyle(el).fontSize), text: text.slice(0, 24) });
        }
        return out;
      });
      evidence.text_floor[width] = tiny.map((t) => `${t.target} ${t.px}px "${t.text}"`);
      for (const t of tiny) if (!violations.some((v) => v.target === t.target)) violations.push({ target: t.target, detail: `${t.px}px "${t.text}" at ${width}px` });
    } finally {
      await context.close();
    }
  }
  judge("text-floor", violations);
});
