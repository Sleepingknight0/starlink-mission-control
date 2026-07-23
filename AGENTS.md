# Repository Guidelines

## Project Structure & Module Organization

This repository is a static, browser-based Starlink 3D explainer. `index.html` is the primary experience and contains its HTML, CSS, and JavaScript in one file. `starlink-3d-v1 (1).html` is an alternate/earlier standalone version; do not assume edits to one are reflected in the other.

Runtime media lives under `assets/`:

- `assets/*.jpg` contains Earth textures and the star field.
- `assets/gen/` contains generated scene artwork.
- `assets/real/` contains reference photography.
- `assets/video/` contains short MP4 sequences.

Keep asset paths relative (for example, `assets/video/orbit.mp4`) so local serving and static hosting behave consistently. Treat `.playwright-cli/` as generated browser-test output, not source.

## Build, Test, and Development Commands

No build step or package installation is required. From the repository root, run:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/index.html`. Serving over HTTP is preferred to opening the file directly because browser media and asset-loading behavior can differ under `file://`.

For a quick syntax/markup review, use browser developer tools and confirm that the console and network panel contain no errors or missing assets.

## Coding Style & Naming Conventions

Use two-space indentation in embedded CSS and JavaScript, matching the current files. Prefer `const` unless reassignment is required, camelCase for JavaScript identifiers, and kebab-case for CSS classes. Keep element IDs descriptive and unique. Add new colors and repeated values as CSS custom properties in `:root`.

Preserve Thai UTF-8 text and responsive behavior. Optimize new media before committing; large images and videos directly affect startup time.

## Testing Guidelines

There is no automated test suite yet. Manually verify desktop and narrow mobile layouts, boot/loading completion, scene dragging, navigation controls, media playback, lightbox behavior, and reduced-motion handling. Test both HTML variants when shared assets change.

## Commit & Pull Request Guidelines

Git history is not included in this checkout. Use short, imperative commit subjects, optionally prefixed by area, such as `ui: improve mobile mission controls`. Pull requests should explain the user-visible change, list manual test steps, identify changed media, and include screenshots or a short recording for visual changes. Never commit credentials or unrelated generated browser artifacts.
