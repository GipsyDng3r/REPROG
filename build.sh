#!/bin/bash
set -e
cd "$(dirname "$0")"
mkdir -p dist
{
  cat src/template.html
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
  echo '<script>'
  cat src/ills.js src/tex.js src/art.js src/miyako3d.js src/aira3d.js src/issana3d.js src/odori3d.js src/engine.js src/builders.js src/levels_a.js src/levels_b.js src/levels_c.js src/main.js
  echo "toMenu();"
  echo '</script>'
} > dist/game.html
for f in src/engine.js src/builders.js src/levels_*.js src/main.js; do node --check $f || echo "SYNTAX FAIL $f"; done
wc -c dist/game.html
