#!/bin/bash
# Deploy to bisonboost.com/groovemakers-preview/ on the Namecheap cPanel host (ssh alias: otaku).
# CSS/JS are published under content-hashed names because the Supersonic CDN in front of
# www can keep serving stale copies of an unchanged URL (even with a ?v= query).
set -euo pipefail
cd "$(dirname "$0")"
REMOTE=/home/striurym/bisonboost.com/groovemakers-preview
DIST=$(mktemp -d)
trap 'rm -rf "$DIST"' EXIT

css=style.$(shasum -a 256 style.css | cut -c1-8).css
js=app.$(shasum -a 256 app.js | cut -c1-8).js
cp style.css "$DIST/$css"
cp app.js "$DIST/$js"
sed -E "s#href=\"style[^\"]*\.css[^\"]*\"#href=\"$css\"#; s#src=\"app[^\"]*\.js[^\"]*\"#src=\"$js\"#" index.html > "$DIST/index.html"
grep -q "$css" "$DIST/index.html" && grep -q "$js" "$DIST/index.html"

ts=$(date +%Y%m%d-%H%M%S)
ssh otaku "cd $REMOTE && mkdir -p ~/groovemakers-preview-backups/$ts && cp -p index.html ~/groovemakers-preview-backups/$ts/ && mkdir -p assets"
scp -q assets/*.webp otaku:$REMOTE/assets/
scp -q "$DIST/$css" "$DIST/$js" otaku:$REMOTE/
scp -q "$DIST/index.html" otaku:$REMOTE/.index.html.new
ssh otaku "cd $REMOTE && chmod 644 $css $js assets/*.webp .index.html.new && mv -f .index.html.new index.html"

for f in "" "$css" "$js"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bisonboost.com/groovemakers-preview/$f")
  echo "$code /groovemakers-preview/$f"
  [ "$code" = 200 ] || { echo "verify failed"; exit 1; }
done
echo "Deployed $css $js (index backup: ~/groovemakers-preview-backups/$ts)"
