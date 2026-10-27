#!/bin/bash
# Deploy to bisonboost.com/groovemakers-preview/ on the Namecheap cPanel host (ssh alias: otaku).
# CSS/JS are published under content-hashed names because the Supersonic CDN in front of
# www can keep serving stale copies of an unchanged URL (even with a ?v= query).
set -euo pipefail
# Fresh connections: a wedged shared ControlMaster socket can hang every scp.
SSHO="-o ControlPath=none -o ConnectTimeout=30 -o ServerAliveInterval=10 -o ServerAliveCountMax=3"
cd "$(dirname "$0")"
REMOTE=/home/striurym/bisonboost.com/groovemakers-preview
SSH_TARGET=${GROOVE_SSH_TARGET:-otaku}
DIST=$(mktemp -d)
trap 'rm -rf "$DIST"' EXIT

css=style.$(shasum -a 256 style.css | cut -c1-8).css
js=app.$(shasum -a 256 app.js | cut -c1-8).js
cp style.css "$DIST/$css"
cp app.js "$DIST/$js"
aura=white-aura.$(shasum -a 256 white-aura.css | cut -c1-8).css
tuner=tuner-3d.$(shasum -a 256 tuner-3d.js | cut -c1-8).js
cp white-aura.css "$DIST/$aura"
cp tuner-3d.js "$DIST/$tuner"
spot=spotlight.$(shasum -a 256 spotlight.html | cut -c1-8).html
cp spotlight.html "$DIST/$spot"
sed -E "s#href=\"white-aura.css\"#href=\"$aura\"#; s#src=\"tuner-3d.js\"#src=\"$tuner\"#; s#src=\"spotlight[^\"]*\.html\"#src=\"$spot\"#; s#href=\"style[^\"]*\.css[^\"]*\"#href=\"$css\"#; s#src=\"app[^\"]*\.js[^\"]*\"#src=\"$js\"#" index.html > "$DIST/index.html"
grep -q "$css" "$DIST/index.html" && grep -q "$js" "$DIST/index.html"

ts=$(date +%Y%m%d-%H%M%S)
ssh $SSHO "$SSH_TARGET" "cd $REMOTE && mkdir -p ~/groovemakers-preview-backups/$ts && cp -p index.html ~/groovemakers-preview-backups/$ts/ && mkdir -p assets/spotlight assets/loader-cosmic assets/acrylic discovery-build"
scp $SSHO -q assets/*.webp "$SSH_TARGET":$REMOTE/assets/
scp $SSHO -q assets/spotlight/* "$SSH_TARGET":$REMOTE/assets/spotlight/
scp $SSHO -q assets/loader-cosmic/* "$SSH_TARGET":$REMOTE/assets/loader-cosmic/
scp $SSHO -q -r assets/acrylic/. "$SSH_TARGET":$REMOTE/assets/acrylic/
scp $SSHO -q -r discovery-build/. "$SSH_TARGET":$REMOTE/discovery-build/
scp $SSHO -q "$DIST/$aura" "$DIST/$tuner" "$SSH_TARGET":$REMOTE/
scp $SSHO -q "$DIST/$css" "$DIST/$js" "$SSH_TARGET":$REMOTE/
scp $SSHO -q "$DIST/index.html" "$SSH_TARGET":$REMOTE/.index.html.new
scp $SSHO -q "$DIST/$spot" "$SSH_TARGET":$REMOTE/
ssh $SSHO "$SSH_TARGET" "cd $REMOTE && chmod 755 assets/spotlight assets/loader-cosmic && chmod 644 assets/loader-cosmic/* $css $js assets/*.webp assets/spotlight/* .index.html.new $spot && mv -f .index.html.new index.html"

for f in "" "$css" "$js" "$aura" "$tuner" "$spot" "discovery-build/index.html"; do
  code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.bisonboost.com/groovemakers-preview/$f")
  echo "$code /groovemakers-preview/$f"
  [ "$code" = 200 ] || { echo "verify failed"; exit 1; }
done
echo "Deployed $css $js (index backup: ~/groovemakers-preview-backups/$ts)"
