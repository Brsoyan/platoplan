#!/bin/sh
# Deploy PlatoPlan to Cloudflare Pages (free): https://platoplan.pages.dev
# First time only: run `npx wrangler login` and approve in the browser.
set -e
cd "$(dirname "$0")"
OUT=$(mktemp -d)
cp index.html privacy.html credits.html i18n.js recipes.js recipes2.js credits.js app.js "$OUT"/
[ -f ads.txt ] && cp ads.txt "$OUT"/
cp -R img "$OUT"/img
npx wrangler pages deploy "$OUT" --project-name platoplan --branch main --commit-dirty=true
rm -rf "$OUT"
