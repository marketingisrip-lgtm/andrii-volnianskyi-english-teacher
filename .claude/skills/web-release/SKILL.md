---
name: web-release
description: Deploy this website with an account check, a verified commit, a probed preview and Andrii's go before production.
disable-model-invocation: true
---

# Web release

Publishing puts a page in front of employers and students; it is outward-facing and hard to take
back, so it starts only when Andrii asks, and every step leaves evidence.

## 1. Which host, which account (before anything else)
This repo carries three hosting traces. Find out which one is live; do not assume:
- `netlify.toml`: Netlify builds with `npm run build` and publishes `dist/`;
- `server/index.js`: a Cloudflare Workers entry that serves the static assets;
- `.openai/hosting.json`: an OpenAI-hosted project id.

Observed on PR #4 (29 Oct 2026): the Netlify project **`sparkly-brigadeiros-2eebd1`** builds a deploy
preview for every PR (`deploy-preview-<n>--sparkly-brigadeiros-2eebd1.netlify.app`) and posts
"Pages changed", "Header rules" and "Redirect rules" checks. That makes Netlify the live pipeline.
Confirm the production URL and the owning account before deploying.

Run the account skill `account-check`. Read the config source, not the tool's summary. The
Netlify config can cache several accounts, and `netlify status` shows only the active one. Then
test the real operation: an account that can read and create sites can still get 403 on deploy.
Report: "deploying <site> on <host> as <account>".

## 2. Gate
`npm run verify` must be green on the commit being released (`git rev-parse HEAD`), and `git status`
must be clean. Claims with status `stale` or `conflict` in `web/claims-ledger.json`, and
`known-issues` entries with severity `major`, are listed to Andrii before deploying. He decides
whether they block the release.

## 3. Preview, probe, promote
1. Deploy a preview (Netlify: `netlify deploy --dir=dist` after `npm run build`, with no `--prod`).
2. Probe the preview URL. Every request must return 200:
   ```bash
   for p in / /styles.css /script.js /assets/andrii.png /assets/Andrii_Volnianskyi_CV.pdf; do
     printf '%s %s\n' "$(curl -s -o /dev/null -w '%{http_code}' "$URL$p")" "$p"; done
   ```
   Then run the runtime suite against it if needed, or open it once and read the console.
   Until step 3, say plainly that the release is **staged, not live** (owner skill `staged-release`).
3. Promote only after Andrii's explicit go-ahead for this release (`netlify deploy --prod --dir=dist`).
4. Probe production with the same loop, retrying with backoff (2 s, 4 s, 8 s). A first 200 can be
   a stale CDN copy of the previous publish, so compare content, not just status: fetch each changed
   file with a cache-busting query and compare its sha256 with the file in `dist/`:
   ```bash
   for f in index.html styles.css; do
     printf '%s %s\n' "$(curl -s "$URL/$f?v=$(date +%s)" | shasum -a 256 | cut -c1-12)" "$(shasum -a 256 dist/$f | cut -c1-12) $f"; done
   ```
5. **Check headers from outside after every publish**, not once at setup:
   `curl -sI "$URL/" | grep -iE 'cache-control|content-type|x-frame-options'`. Owner lesson
   (`staged-release`, 16 Aug 2026): a `Cache-Control` header verified once was reset by each later
   upload, and a summary went on reporting it as set.

## 4. Never
- Never deploy from a dirty tree or an unverified commit, delete a site or deployment, or create
  an account or a new OAuth client.
- Never print a token. Pipe anything that might echo one through
  `sed -E 's/[A-Za-z0-9_-]{30,}/<redacted>/g'`.

## Report
State the host, account, site and commit; the preview URL and its status codes; the go-ahead you
received (quoted); the production URL and its status codes, the content hashes and the headers; and
anything not verified. End the message to Andrii with "hard-refresh (Cmd/Ctrl+Shift+R) once": anyone
with the page already open still has the old copy (owner skill `deploy-verify-loop`).
