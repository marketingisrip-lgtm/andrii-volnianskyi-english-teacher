// Checks the browser checks: plant one defect in a copy of the site, run only the runtime test
// meant to catch it, and require that it fails. Slow (a build and a browser per mutant), so it
// runs from `npm run test:runtime-mutation` and `npm run verify`, not `npm test`.
import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { runMutant, edit, append } from "./lib/mutant.mjs";

const MUTANTS = [
  ["a wide element that scrolls sideways", edit("index.html", '<main id="main">', '<main id="main"><div style="width:1400px;height:1px"></div>'), "renders cleanly at 320px"],
  ["a console error", append("script.js", '\nconsole.error("planted defect");\n'), "renders cleanly at 1280px"],
  ["a broken image", edit("index.html", '<main id="main">', '<main id="main"><img src="assets/missing.png" alt="Missing" />'), "renders cleanly at 768px"],
  ["an image that answers 200 but never renders", edit("index.html", '<main id="main">', '<main id="main"><img src="script.js" alt="Planted" width="10" height="10" />'), "renders cleanly at 390px"],
  ["script.js removed, so sections never reveal", edit("index.html", '<script src="script.js"></script>', ""), "renders cleanly at 390px"],
  ["reduced-motion visitors no longer see sections", edit("styles.css", "scroll-behavior:auto!important}.js .reveal{opacity:1;transform:none}}", "scroll-behavior:auto!important}}"), "reduced-motion visitors see every section without scrolling"],
  ["focus outline removed", append("styles.css", "a:focus,a:focus-visible,button:focus-visible{outline:none!important;box-shadow:none!important}"), "keyboard reaches every control and focus stays visible"],
  ["low-contrast body text", edit("styles.css", ".statement p:last-child{max-width:700px;font-size:18px;color:#59594f", ".statement p:last-child{max-width:700px;font-size:18px;color:#c4c2b4"), "text meets WCAG 1.4.3 contrast against what is actually rendered behind it"],
  ["a stricter reveal threshold that more sections never meet", edit("script.js", "threshold: 0, rootMargin: '0px 0px -48px 0px'", "threshold: 0.3"), "every section reveals on short and zoomed screens (WCAG 1.4.10)"],
  ["a percentage bottom margin that strands the last section", edit("script.js", "rootMargin: '0px 0px -48px 0px'", "rootMargin: '0px 0px -10% 0px'"), "every section reveals on short and zoomed screens (WCAG 1.4.10)"],
  ["a reveal that fails closed when script.js cannot run", edit("index.html", 'if (/\\/script\\.js(\\?|#|$)/.test(src)) root.classList.remove("js");', ""), "sections stay readable when script.js cannot run"],
  ["a skip link that stays invisible when focused", edit("styles.css", ".skip-link:focus{opacity:1;pointer-events:auto}", ".skip-link:focus{pointer-events:auto}"), "a skip link leads to the main content"],
  ["a badge and its period run together for screen readers", edit("index.html", '<div class="period">2024–2026</div>', '<span class="period">2024–2026</span>'), "screen readers do not run neighbouring labels together"],
  ["bold text that runs into its neighbour for screen readers", edit("index.html", '>Download CV <span aria-hidden="true">', '>Download<strong>CV</strong> <span aria-hidden="true">'), "screen readers do not run neighbouring labels together"],
  ["a skip link whose text matches its background", edit("styles.css", "background:var(--paper);color:var(--ink);font-weight:800", "background:var(--paper);color:var(--paper);font-weight:800"), "a skip link leads to the main content"],
  ["a skip link hidden when focused on narrow screens", append("styles.css", "@media(max-width:480px){.skip-link:focus{opacity:0}}"), "a skip link leads to the main content"],
  ["a decorative glyph added by CSS", append("styles.css", '.text-link:after{content:"→"}'), "screen readers hear no decorative glyphs"],
  ["a new third-party script", edit("index.html", '<script src="script.js"></script>', '<script src="https://cdn.example.com/tracker.js"></script><script src="script.js"></script>'), "the page makes no third-party requests beyond the registered ones"],
  ["a 7px label", append("styles.css", ".metrics span{font-size:7px}"), "no visible text is smaller than 10px"],
];

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Two at a time: each mutant runs Chromium, and heavier parallel load is what made reveal checks flaky.
describe("planted browser defects", { concurrency: 2 }, () => {
  for (const [name, mutate, mustFail] of MUTANTS) {
    test(`catches: ${name}`, async () => {
      const { ran, failed, stderr } = await runMutant(mutate, [`--test-name-pattern=^${escape(mustFail)}$`, "tests/runtime.test.mjs"]);
      assert.equal(ran, 1, `the name filter matched ${ran} tests, not 1; stderr: ${stderr.slice(0, 300)}`);
      assert.deepEqual(failed, [mustFail], `"${mustFail}" stayed green with the defect planted`);
    });
  }
});
