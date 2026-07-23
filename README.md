# Starlink Mission Control — 3D Explainer

Static, browser-based Starlink 3D explainer (Thai + English UI).

- **Guide mode** — 9-step interactive brief (Dishy → LEO → gateway → ISL)
- **Simulation mode** — 24-hour orbit model of the working constellation

Open [index.html](./index.html) over HTTP (not `file://`).

## Local

```bash
python -m http.server 8000
# → http://localhost:8000/index.html
```

No build step. Three.js, pbf, and geobuf load from CDNs.

## Deploy

Static hosting (Vercel, Netlify, GitHub Pages). Root is the site root; `vercel.json` sets clean URLs and asset caching.

## Docs

- `docs/starlink-specs-2026.md` — sourced technical reference
- `AGENTS.md` / `CLAUDE.md` — project conventions for agents
