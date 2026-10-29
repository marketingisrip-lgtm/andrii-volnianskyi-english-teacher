---
name: web-release
description: >-
  Owner-invoked release of this website: identify the live host and account, require a green
  `npm run verify` on the exact commit, deploy a preview, probe it, promote only on Andrii's explicit go,
  then probe production with retries and report the account, URLs and status codes. Invoke only when
  Andrii says to deploy or publish (/web-release); never on your own initiative.
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
3. Promote only after Andrii's explicit go-ahead for this release (`netlify deploy --prod --dir=dist`).
4. Probe production with the same loop, retrying with backoff (2 s, 4 s, 8 s). A first 200 can be
   a stale CDN copy of the previous publish, so confirm one changed file's new content as well.

## 4. Never
- Never deploy from a dirty tree or an unverified commit, delete a site or deployment, or create
  an account or a new OAuth client.
- Never print a token. Pipe anything that might echo one through
  `sed -E 's/[A-Za-z0-9_-]{30,}/<redacted>/g'`.

## Report
State the host, account, site and commit; the preview URL and its status codes; the go-ahead you
received (quoted); the production URL and its status codes, including the content check; and
anything not verified.
