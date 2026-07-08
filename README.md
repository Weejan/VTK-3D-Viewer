# VTK 3D Viewer

A tiny browser viewer for **3D prints, scans, and generative geometry**. Drop a
mesh, look around. Built with [VTK.js](https://kitware.github.io/vtk.js/) and
Next.js — minimalist, dark or light.

## Features

- Loads **STL, PLY, OBJ, VTK, VTP**
- Start screen is a **gallery** of built-in demo models — click to load
- **Back** button returns to the gallery anytime
- Render modes: **surface / wireframe / points**
- **Auto-spin**, **reset view**, and **PNG screenshot** export
- **Live mesh stats**: vertex count, face count, bounding-box size
- Orientation **axes gizmo** in the corner
- **Light / dark** theme toggle
- Open your own file or drag & drop
- Embedded vertex/cell colors honored; smooth normals computed automatically
- Retina-correct rendering, render calls batched per animation frame

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Controls

| Action | Input        |
| ------ | ------------ |
| Rotate | drag         |
| Pan    | shift + drag |
| Zoom   | scroll       |

## Demo models

Add your own demo: drop a file in `public/models/` and add a line to
`components/viewer/demos.ts`.

## Project structure

```
app/                       Next.js App Router (layout, page, styles)
components/viewer/         UI, split into focused pieces
  Viewer.tsx               composition root
  Sidebar.tsx              controls panel
  Gallery.tsx              demo picker
  ui.tsx                   presentational primitives
  demos.ts                 demo model list
hooks/useModelViewer.ts    viewer lifecycle + state + actions
lib/viewer/                framework-agnostic engine
  VTK3DModelViewer.ts      VTK.js render pipeline (class)
  readers.ts               lazy per-format file parsers
  constants.ts             tunables (color, material, spin speed)
  types.ts                 shared types
  index.ts                 public barrel
public/models/             demo models
scripts/                   model generator
```

## Code quality

```bash
npm run lint         # ESLint (next/core-web-vitals + prettier)
npm run format       # Prettier write
npm run typecheck    # tsc --noEmit
```

Run `npm run format` once after install to normalize formatting.

## Learning the codebase

New to this? Read [`docs/OVERVIEW.md`](docs/OVERVIEW.md) — a zero-knowledge
walkthrough of the whole app.
