# REPROG — Past is Just a Program (Tome 1)

Jeu 3D à la première personne (navigateur, three.js r128) adapté du roman de GipsyDang3r.
Prologue, 11 chapitres et épilogue jouables, dialogues à choix, mini-jeux, illustrations plein écran.

## Jouer
Ouvrir `dist/REPROG.html` dans un navigateur récent (Chrome/Edge/Firefox). Connexion internet requise (three.js via cdnjs, polices Google).

Commandes : ZQSD/WASD, Maj (courir), souris (regarder), E ou clic (interagir), Espace (dialogue), 1-4 (choix), G (lunettes), Échap (pause).

## Structure
| Chemin | Rôle |
|---|---|
| `src/engine.js` | Moteur : rendu, déplacements, dialogues, caméra, son |
| `src/builders.js` | Primitives 3D, personnages (modèles simples, panneaux, maillages) |
| `src/levels_a.js`, `levels_b.js`, `levels_c.js` | Niveaux et scénario (prologue → épilogue) |
| `src/main.js` | Menu, chapitres, sauvegarde |
| `src/art.js`, `ills.js`, `tex.js`, `*3d.js` | Assets embarqués en base64 (portraits, illustrations, textures, maillages Miyako/Issana/Odori) |
| `art3d/` | Scripts de reconstruction 3D depuis les fiches de modélisation (Python : rembg, trimesh, scikit-image) |
| `test/` | Tests Playwright (captures, bot de partie complète) |
| `docs/` | Scénario source (Tome 1) |

## Build
`./build.sh` assemble `dist/game.html` (le fichier est copié en `dist/REPROG.html` pour la publication).
Tests : `npm i playwright-core three@0.128.0`, puis `node test/bot.js 0 800` (joue tout le jeu).

## Suite prévue
Version Unity (URP/HDRP) : données de dialogue en JSON, shaders cel-shading, systèmes C#.
