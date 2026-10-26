#!/bin/bash
# Deploy to bisonboost.com/groovemakers-preview/ on the Namecheap cPanel host (ssh alias: otaku).
# CSS/JS are published under content-hashed names because the Supersonic CDN in front of
# www can keep serving stale copies of an unchanged URL (even with a ?v= query).
set -euo pipefail
# Fresh connections: a wedged shared ControlMaster socket can hang every scp.
SSHO="-o ControlPath=none -o ConnectTimeout=30 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"
cd "$(dirname "$0")"
REMOTE=/home/striurym/bisonboost.com/groovemakers-preview
DIST=$(mktemp -d)
trap 'rm -rf "$DIST"' EXIT

css=style.$(shasum -a 256 style.css | cut -c1-8).css
js=app.$(shasum -a 256 app.js | cut -c1-8).js
cp style.css "$DIST/$css"
cp app.js "$DIST/$js"
spot=spotlight.$(shasum -a 256 spotlight.html | cut -c1-8).html
cp spotlight.html "$DIST/$spot"
sed -E "s#src=\"spotlight[^\"]*\.html\"#src=\"$spot\"#; s#href=\"style[^\"]*\.css[^\"]*\"#href=\"$css\"#; s#src=\"app[^\"]*\.js[^\"]*\"#src=\"$js\"#" index.html > "$DIST/index.html"
grep -q "$css" "$DIST/index.html" && grep -q "$js" "$DIST/index.html"

ts=$(date +%Y%m%d-%H%M%S)
ssh $SSHO otaku "cd $REMOTE && mkdir -p ~/groovemakers-preview-backups/$ts && cp -p index.html ~/groovemakers-preview-backups/$ts/ && mkdir -p assets/spotlight assets/loader"
scp $SSHO -q assets/*.webp otaku:$REMOTE/assets/
scp $SSHO -q assets/spotlight/* otaku:$REMOTE/assets/spotlight/
scp $SSHO -q assets/loader/* otaku:$REMOTE/assets/loader/
scp $SSHO -q "$DIST/$css" "$DIST/$js" otaku:$REMOTE/
scp $SSHO -q "$DIST/index.html" otaku:$REMOTE/.index.html.new
scp $SSHO -q "$DIST/$spot" otaku:$REMOTE/
ssh $SSHO otaku "cd $REMOTE && chmod 755 assets/spotlight assets/loader && chmod 644 assets/loader/* $css $js assets/*.webp assets/spotlight/* .index.html.new $spot && mv -f .index.html.new index.html"

for f in "" "$css" "$js" "$spot"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bisonboost.com/groovemakers-preview/$f")
  echo "$code /groovemakers-preview/$f"
  [ "$code" = 200 ] || { echo "verify failed"; exit 1; }
done
echo "Deployed $css $js (index backup: ~/groovemakers-preview-backups/$ts)"
