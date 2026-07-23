# Starlink Mission Control — Design System

Immersive **SpaceX-style constellation explainer** — 3D globe + telemetry HUD + guided 9-step brief.
Thai UI copy, English data labels. Single file, no build step.

## Style
| Token | Choice |
|--------|--------|
| Style | Dark mission-control over pure black |
| Brand | SpaceX black + white type; chrome carries no hue |
| Density | Progressive disclosure — 29 hide rules stage content down to 375px |
| Motion | 150–360ms, `--ease` cubic-bezier(.22,1,.36,1), `prefers-reduced-motion` respected |

## Colors — TWO palettes, do not mix them

This is the rule most easily got wrong. The HUD chrome is **monochrome**; only the 3D
scene and the coverage-map legend carry hue.

### 1. UI chrome — greyscale only (`:root` in index.html)
```
--bg        #000000     --text      #FFFFFF
--muted     #B0B0B0     --dim       #8A8A8A
--surface   rgba(0,0,0,.88)         --glass  rgba(255,255,255,.04)
--edge      rgba(255,255,255,.14)   --edge-soft rgba(255,255,255,.08)
```
Legacy accent names are aliased to greys so old class names keep working —
`--cyan` and `--go` are `#FFFFFF`, `--amber` `#E8E8E8`, `--laser` `#F5F5F5`, `--geo` `#9A9A9A`.
**Never reintroduce a hue into panel/HUD chrome.** If you need emphasis, use weight,
size, or the `.c` / `.r` / `.a` / `.g` classes — which resolve to greys by design.

### 2. 3D scene + map legend — chromatic, and load-bearing
Hue here encodes meaning and is documented in the on-screen legend, so it must stay.
```
Ku user link   uplink #8CE6FF · downlink #0A84D8
Ka gateway     uplink #FFD08A · downlink #E07B16
Laser ISL      #00E676        Beacon / lens  #00E676
Coverage: available #76EFB8 (outline only) · pending #F59E0B · waitlist #A78BFA · restricted #FF6B6B
Orbital shells: 43° #72D8FF · 53° #D9F4FF · 70° #C2B3FF · 97.3° #FFB36C · D2C #76EFB8 / #FFE17A
```
Every coverage state pairs its hue with a **distinct diagonal hatch pattern**, so the map
stays readable without colour. Keep that pairing when adding states.

Contrast is verified empirically, not assumed — an in-page audit walks every text node,
composites the real alpha stack, and checks WCAG AA. Current state: **0 failures** at
2082px and 390px. Re-run it after any colour change.

Caveat the audit cannot catch: text sitting over the **WebGL canvas** reads as
transparent-over-black to any DOM-based checker. `#brand` therefore carries an explicit
`text-shadow` scrim at every breakpoint — do not strip it.

## Typography
| Role | Font |
|------|------|
| Display | Space Grotesk |
| UI body | Inter + IBM Plex Sans Thai |
| Data / labels | IBM Plex Mono (`tabular-nums`) |
| Step panel body | ≥14px |
| Thai in controls | ≥12px — tone marks and vowel signs need the vertical room |

Mono HUD labels run 9–11px by deliberate choice. That is below the usual 12px floor and
is accepted only because they are short Latin/numeric strings that pass contrast. Do not
extend it to Thai or to running prose.

## Spacing & touch
- 4/8px rhythm
- Interactive targets ≥44×44 — verified in-page, not eyeballed
- Mode switch: `min-height:38px` + 3px container padding = 44
- Safe-area insets on nav, panel, and mission bar

## Components added since v1
- `.sx-mark` — official SpaceX wordmark (`assets/spacex-logo.svg`, Wikimedia geometry).
  Sizes via `height`; `width:auto` keeps the ~8.1:1 aspect. White monochrome for dark HUD.
- `Pulse{count, lane, gap}` — packet streams. `lane` offsets traffic perpendicular to the
  path so uplink and downlink occupy separate lanes; a single-particle, zero-lane pulse
  reads as one-way traffic and is the bug this replaced.
- `makeSatModel()` — box bus with twin solar wings on ±X. `+Y` is anti-nadir; callers align
  it to the position vector so the phased-array face at `-Y` always looks at Earth.
- `animateSatModel(m,t,seed,serving)` — beacon breathing, laser-lens blink, thruster plume,
  wing flex. `seed` de-syncs clustered models. No-ops under reduced motion.

## Anti-patterns
- ❌ Hue in panel/HUD chrome
- ❌ Emoji as structural icons
- ❌ `user-scalable=no`
- ❌ Colour as the only status channel — pair with hatch, text, or SR state
- ❌ Stripping `#brand` text-shadow (globe shows through)
- ❌ Hardcoding a spec figure in two places — see `docs/facts-registry-design.md`

## A11y checklist
- [x] Skip link → mission brief
- [x] `:focus-visible` rings on every control
- [x] `aria-live` step announcements
- [x] Dialogs: `aria-modal`, focus returned
- [x] Media alt / aria-labels
- [x] Keyboard: ← → P H A T S M F Esc, 1 / 2 for modes
- [x] Reduced motion — CSS block + `reduced` flag in JS

## Stack
Single-file HTML + Three.js r128 — no build step.
