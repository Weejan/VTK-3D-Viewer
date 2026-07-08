# VTK 3D Viewer — How This App Works (Beginner Guide)

Zero assumptions. This explains what the project is, the tools it uses, how the
pieces fit, and what every file does. Read top to bottom.

---

## 1. What is this app?

VTK 3D Viewer is a **3D model viewer that runs in a web browser**. You give it a 3D
file (a mesh of a mug, a scan, a 3D-print model…) and it draws it on screen so
you can rotate, zoom, change its color, spin it, screenshot it, etc.

It supports five common 3D file types: **STL, PLY, OBJ, VTK, VTP**.

---

## 2. The tools (plain English)

- **Browser + WebGL** — Modern browsers can draw hardware-accelerated 3D
  graphics through a built-in system called _WebGL_. Everything you see is
  WebGL painting pixels.
- **VTK.js** — A big visualization library. Talking to raw WebGL is painful, so
  VTK.js gives us ready-made tools: "load this mesh", "put a light here", "let
  the mouse orbit the camera". It does the hard 3D math.
- **React** — A library for building user interfaces out of reusable
  "components" (the sidebar, the gallery cards, etc.). React keeps the screen in
  sync with the data ("state").
- **Next.js** — A framework built on React. It handles bundling, the dev
  server, routing, and serving files. We use it mostly as the wrapper that runs
  our React app.
- **TypeScript** — JavaScript with type labels. It catches mistakes before you
  run the code (e.g. passing text where a number is expected).

You don't need to master any of these to follow the rest.

---

## 3. Run it

```bash
npm install      # download dependencies (one time)
npm run dev      # start the dev server
```

Open http://localhost:3000. Other commands:

```bash
npm run build      # production build (also type-checks + lints)
npm run lint       # check code style
npm run typecheck  # check types only
```

---

## 4. The big picture

Think of it in layers, top (what you click) to bottom (what draws pixels):

```
 Browser page
      │
   app/page.tsx            ← the route; loads the viewer in the browser only
      │
 components/viewer/Viewer.tsx   ← lays out sidebar + canvas
      │            │
 Sidebar.tsx   Gallery.tsx      ← buttons, swatches, demo cards (just UI)
      │
 hooks/useModelViewer.ts   ← the "brain": holds state + button actions
      │
 lib/viewer/VTK3DModelViewer.ts   ← the engine: talks to VTK.js
      │
   VTK.js  →  WebGL  →  pixels on the <canvas>
```

Golden rule of the codebase: **only the engine touches VTK.js.** React just
flips switches by calling engine methods. This keeps the 3D code in one place.

---

## 5. What each file does

### App shell

- **`app/layout.tsx`** — The outer HTML wrapper (sets the page title, loads
  global styles). Every page lives inside it.
- **`app/globals.css`** — Colors and base styling, including the light/dark
  theme variables (`--bg`, `--fg`, …).
- **`app/page.tsx`** — The home route. It loads the viewer with
  "ssr: false", meaning _don't render this on the server_ — VTK.js needs a real
  browser (WebGL), which servers don't have.

### UI (React components)

- **`components/viewer/Viewer.tsx`** — The composition root. Draws the sidebar
  on the left and the canvas/gallery on the right. Wires drag-and-drop.
- **`components/viewer/Sidebar.tsx`** — All the controls: Open, Back, render
  mode, color swatches, spin/reset/screenshot/theme, and the model info.
- **`components/viewer/Gallery.tsx`** — The start screen grid of demo models.
- **`components/viewer/ui.tsx`** — Tiny reusable bits (`Section`, `Stat`,
  `DropOverlay`).
- **`components/viewer/demos.ts`** — The list of built-in demo models.

### The brain (React hook)

- **`hooks/useModelViewer.ts`** — Creates the engine when the page mounts,
  destroys it on leave, and holds all UI **state** (is a model loaded? which
  color? spinning?). Every button calls an action here, which then calls the
  engine. This is where React and the 3D engine meet.

### The engine (no React)

- **`lib/viewer/VTK3DModelViewer.ts`** — The heart. A plain class that sets up
  the VTK.js render pipeline and exposes simple methods: `load`, `clear`,
  `setRepresentation`, `toggleSpin`, `screenshot`, `setModelColor`, `setTheme`,
  `getStats`, `destroy`.
- **`lib/viewer/readers.ts`** — Turns a file into a mesh. One parser per format,
  each loaded _lazily_ (only downloaded when you actually open that type).
- **`lib/viewer/types.ts`** — Shared type definitions.
- **`lib/viewer/constants.ts`** — Tunable values (background colors, material,
  spin speed, point size).
- **`lib/viewer/index.ts`** — A single tidy entry point that re-exports the above
  so other files can `import { ... } from "@/lib/viewer"`.

### Models + config

- **`public/models/*.ply`** — The demo meshes (served as static files).
- **`scripts/generate-models.py`** — Python that builds those demo meshes from
  primitives (spheres, cylinders, cones…). Run it to regenerate them.
- **`vtk-js.d.ts`** — A small shim telling TypeScript that some VTK.js
  sub-modules exist even though they ship without type files.
- **config files** — `package.json` (dependencies + scripts), `tsconfig.json`
  (TypeScript settings), `next.config.mjs` (Next settings),
  `.eslintrc.json` / `.prettierrc.json` (code style).

---

## 6. What happens when you load a model (step by step)

1. You click a gallery card (or Open, or drag a file in).
2. The hook's `loadFile` runs: it sets a "Loading…" status and calls
   `engine.load(file, name)`.
3. The engine asks `readers.ts` to parse the file → it returns a **mesh**
   (called _polydata_ in VTK terms: a bag of points + the triangles joining
   them).
4. The engine computes **normals** (directions each surface faces) so lighting
   looks smooth, then builds the VTK objects (see next section) and points the
   camera at the model.
5. The hook reads back stats (size) and flips `hasModel = true`, so React hides
   the gallery and shows the canvas.

---

## 7. Core 3D concepts (just enough)

- **Mesh / polydata** — A 3D shape stored as **vertices** (points in space) and
  **faces** (triangles connecting those points). A sphere is just lots of tiny
  triangles.
- **Mapper** — Converts the mesh data into something drawable.
- **Actor** — The thing actually placed in the scene. It has a **property**
  (color, shininess, surface vs wireframe).
- **Renderer** — The scene: holds actors + lights + a camera.
- **Render window** — The bridge to the `<canvas>`; calling `render()` paints a
  frame.
- **Camera** — Your viewpoint. Orbiting/zooming = moving the camera.
- **Normals** — Each face's "which way am I facing" arrow; lighting uses them.
  Most files don't include them, so the engine computes them.

Pipeline in one line: **mesh → mapper → actor → renderer → render window →
canvas.**

---

## 8. How each feature works

- **Render modes (Surface / Wire / Points)** — One actor property:
  `setRepresentation(2 | 1 | 0)`. Same mesh, drawn differently. Instant.
- **Color swatches** — `setModelColor([r,g,b])` turns off the mesh's own colors
  and paints the actor one color. "Original" passes `null` to restore the file's
  colors.
- **Auto-spin** — There's no built-in spin; the engine nudges the **camera** a
  fraction of a degree every animation frame (≈60×/sec) and re-renders.
- **Reset view** — `camera.resetCamera()` re-frames the model.
- **Screenshot** — Asks the render window to capture the next frame as a PNG
  image, then the browser downloads it.
- **Light / dark theme** — Swaps CSS variables for the UI and the renderer's
  background color.
- **Model info (size)** — Read from the mesh's bounding box (its width × height
  × depth).
- **Gallery + Back** — When no model is loaded, the gallery overlays the canvas.
  "Back" clears the model and shows the gallery again.
- **Drag & drop / Open** — Both end up calling the same `loadFile`.

---

## 9. Cleanup (why it won't leak)

3D contexts and event listeners must be released or the browser slows down. When
you leave the page (or React re-mounts in dev), the hook calls `engine.destroy()`,
which cancels animation loops, disconnects observers, unbinds mouse events, and
deletes every VTK object. Loading a new model also disposes the previous one
first.

---

## 10. How to extend it

**Add a demo model:** drop a `.ply`/`.stl`/… in `public/models/`, then add a
line to `components/viewer/demos.ts`.

**Add a color:** add one entry to the `COLORS` array in
`components/viewer/Sidebar.tsx`.

**Change spin speed / colors / material:** edit `lib/viewer/constants.ts`.

**Add a whole feature (e.g. a clipping plane):**

1. Add a method to the engine (`lib/viewer/VTK3DModelViewer.ts`).
2. Expose an action + state in the hook (`hooks/useModelViewer.ts`).
3. Add a button in `Sidebar.tsx` that calls it.

That three-step pattern — engine → hook → button — is how every existing feature
is built.

---

## 11. Glossary

- **Component** — A reusable piece of UI (a function returning what to show).
- **State** — Data that can change and re-renders the UI (e.g. `spinning`).
- **Hook** — A React function (name starts with `use`) that holds state/logic.
- **Props** — Inputs passed into a component.
- **SSR** — Server-Side Rendering. We turn it _off_ for the viewer because
  WebGL needs a browser.
- **Bundle** — The packaged JavaScript the browser downloads.
- **Lazy import** — Load code only when needed, to keep the first download small.
