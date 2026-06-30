"use client";

import { useModelViewer } from "@/hooks/useModelViewer";
import { SUPPORTED_EXTENSIONS } from "@/lib/viewer";
import { Gallery } from "./Gallery";
import { Sidebar } from "./Sidebar";
import { DropOverlay } from "./ui";

const ACCEPT = SUPPORTED_EXTENSIONS.map((e) => `.${e}`).join(",");

export default function Viewer() {
  const c = useModelViewer();

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      <Sidebar controller={c} />

      <main
        style={{ position: "relative", flex: 1, minWidth: 0 }}
        onDragOver={(e) => {
          e.preventDefault();
          c.setDragging(true);
        }}
        onDragLeave={() => c.setDragging(false)}
        onDrop={c.onDrop}
      >
        <div
          ref={c.containerRef}
          style={{ position: "absolute", inset: 0, outline: "none" }}
        />

        {!c.hasModel && (
          <Gallery busy={c.busy} status={c.status} onPick={c.loadDemo} />
        )}
        {c.dragging && <DropOverlay />}

        <input
          ref={c.fileInputRef}
          type="file"
          accept={ACCEPT}
          onChange={c.onInputChange}
          style={{ display: "none" }}
        />
      </main>
    </div>
  );
}
