# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A static, browser-based Starlink 3D explainer ("Starlink Mission Control") with Thai-language UI. The entire experience — HTML, CSS, and JavaScript — lives in the single file `index.html` (~4,400 lines). There is no build step, bundler, or framework; Three.js r128, pbf, and geobuf are loaded from CDNs.

`starlink-3d-v1 (1).html` is an earlier standalone version kept for reference. Edits to one file are NOT reflected in the other; test both variants when shared assets change.

`docs/starlink-specs-2026.md` is the sourced Thai-language spec reference behind the UI copy (constellation, RF/OFDM, user terminal, ground segment, measured performance, Thailand regulatory status). Every figure there carries a provenance tag — **[ทางการ]** official, **[รีเวิร์สเอนจิเนียร์]** reverse-engineered, **[วัดจริง]** measured, **[ประมาณการ]** estimated. Check any user-facing number against it before changing one, prefer the better-sourced tag, and keep the "as of" date next to fast-moving values (satellite counts, pricing, Thai licensing).

## Commands

```bash
# Serve locally (required — assets/data fetches and media fail under file://)
python -m http.server 8000
# then open http://localhost:8000/index.html

# Refresh the snapshotted Starlink availability + Natural Earth data in assets/data/
node scripts/snapshot-starlink-map.mjs
```

There is no lint or automated test suite. The only npm dependency is Playwright, used for screenshot-based visual verification (artifacts land in `.playwright-cli/` and `output/playwright/` — both are generated output, never source).

Manual verification checklist: desktop and narrow-mobile layouts, boot/loading completes, scene dragging, mode switching, media playback, lightbox, keyboard shortcuts, and `prefers-reduced-motion` handling.

## Architecture of index.html

The file is organized as: CSS (`<style>` block, ~lines 15–775) → HTML markup (~776–1050) → one large `<script>` block (~1053 to end) containing all logic.

**Two explicit experience modes**, toggled via `setMode('tutorial' | 'simulation')` (keyboard `1`/`2`, tab buttons `#tutorialModeBtn`/`#simulationModeBtn`):

- **Tutorial** — a guided 9-step brief driven by the `STEPS` array and `applyStep(i)`. Each step configures camera, visible scene layers, and panel copy. Auto-advance timer, prev/next buttons, and dot navigation all funnel through `applyStep`.
- **Simulation** — a 24-hour orbit model (`#simPanel`, timeline slider `#simTimeline`) rendering the full constellation, coverage map, and ground-network links. Simulation data is lazily built via `ensureSimulationData()`.

**Scene/data pipeline:** at boot, the script fetches four local files from `assets/data/` (`availability.json`, `availability-cells.pb`, `ne_50m_admin_0_countries.geojson`, `starlink-map-metadata.json` — URLs defined near line 1564) and paints a country-level coverage texture onto the globe (`buildCoverageTexture`). These snapshots are produced by `scripts/snapshot-starlink-map.mjs`, which validates each download before writing.

**Other key subsystems:** `QUALITY` tiers with `applyQualityTier` (device-dependent detail), procedural textures (`makeSolarTex`/`makeDishyTex`/`makeMetalTex`), orbit math helpers (`latLon`, `satPos`, `orbitPeriodSeconds` — Earth radius constant `R = 100` scene units), hero satellites vs. deployment train vs. full fleet (separate update paths: `updateHeroes`, `updateDeploymentTrain`, `updateFullFleet`), laser/mesh/service link updaters, and the `MEDIA` dock + lightbox. 3D scene labels are sprites created by `makeLabel` and laid out each frame by `layoutLabels`, which clamps them to a readable on-screen pixel size, fades ones occluded by the globe (`segmentClearsEarth`), and nudges them clear of each other and the HUD panels via `sprite.center` offsets.

## Conventions

- Two-space indentation in embedded CSS and JS; `const` unless reassignment is needed; camelCase JS identifiers; kebab-case CSS classes; descriptive unique element IDs.
- New colors and repeated values go in `:root` as CSS custom properties. Semantic color tokens, typography, spacing rules, and the a11y checklist are documented in `design-system/MASTER.md` — follow it for any UI change (e.g., never use color alone for status; keep ≥44px touch targets; respect reduced motion).
- Preserve Thai UTF-8 text exactly; UI copy is Thai with English data labels.
- Keep asset paths relative (`assets/video/orbit.mp4`) so local serving and static hosting both work.
- Optimize new media before adding it — image/video size directly affects startup time.
- Accessibility is load-bearing: aria-live step announcements, focus management in dialogs, skip link, and keyboard shortcuts (`← → P H A T S M F Esc`, `1`/`2` for modes) must keep working after edits.

See `AGENTS.md` for commit/PR conventions (short imperative subjects, optionally area-prefixed, e.g. `ui: improve mobile mission controls`).
