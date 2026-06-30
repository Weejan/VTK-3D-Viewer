import type { LightKey, ModelStats, Representation } from "@/lib/viewer";
import type { ViewerController } from "@/hooks/useModelViewer";
import { Section, Stat } from "./ui";

const REPS: Representation[] = ["surface", "wireframe", "points"];
const REP_LABEL: Record<Representation, string> = {
  surface: "Surface",
  wireframe: "Wire",
  points: "Points",
};

const LIGHTS: { key: LightKey; label: string }[] = [
  { key: "headlight", label: "Camera" },
  { key: "top", label: "Top" },
  { key: "front", label: "Front" },
  { key: "left", label: "Left" },
  { key: "right", label: "Right" },
  { key: "back", label: "Back" },
];

type Swatch = { key: string; label: string; rgb: [number, number, number] | null; css: string };
const COLORS: Swatch[] = [
  { key: "original", label: "Original", rgb: null, css: "conic-gradient(red, orange, yellow, lime, cyan, blue, magenta, red)" },
  { key: "white", label: "White", rgb: [0.9, 0.9, 0.9], css: "#e6e6e6" },
  { key: "slate", label: "Slate", rgb: [0.5, 0.55, 0.6], css: "#808d99" },
  { key: "red", label: "Red", rgb: [0.85, 0.2, 0.2], css: "#d93333" },
  { key: "orange", label: "Orange", rgb: [0.95, 0.55, 0.15], css: "#f28c26" },
  { key: "green", label: "Green", rgb: [0.3, 0.7, 0.35], css: "#4cb359" },
  { key: "blue", label: "Blue", rgb: [0.25, 0.5, 0.9], css: "#4080e6" },
  { key: "purple", label: "Purple", rgb: [0.6, 0.35, 0.8], css: "#9959cc" },
];

const formatSize = (s: ModelStats["size"]) =>
  s.map((v) => v.toFixed(1)).join(" × ");

export function Sidebar({ controller }: { controller: ViewerController }) {
  const c = controller;
  return (
    <aside
      style={{
        width: 248,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
        overflowY: "auto",
      }}
    >
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 0.3 }}>
          Orbit
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
          Drop a mesh. Look around.
        </div>
      </div>

      <button className="primary" onClick={c.openFilePicker}>
        Open file
      </button>

      {c.hasModel && (
        <>
          <button onClick={c.goHome}>← Back to gallery</button>

          <Section label="Display">
            <div style={{ display: "flex", gap: 6 }}>
              {REPS.map((r) => (
                <button
                  key={r}
                  className={c.rep === r ? "active" : ""}
                  onClick={() => c.setRepresentation(r)}
                  style={{ flex: 1, padding: "6px 4px", fontSize: 13 }}
                >
                  {REP_LABEL[r]}
                </button>
              ))}
            </div>
          </Section>

          <Section label="Color">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {COLORS.map((s) => (
                <button
                  key={s.key}
                  title={s.label}
                  onClick={() => c.setColor(s.key, s.rgb)}
                  style={{
                    width: 24,
                    height: 24,
                    padding: 0,
                    borderRadius: "50%",
                    background: s.css,
                    cursor: "pointer",
                    border:
                      c.color === s.key
                        ? "2px solid var(--fg)"
                        : "1px solid var(--border)",
                    outline:
                      c.color === s.key ? "2px solid var(--bg)" : "none",
                    outlineOffset: -3,
                  }}
                />
              ))}
            </div>
          </Section>

          <Section label="Light">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 6,
              }}
            >
              {LIGHTS.map((l) => (
                <button
                  key={l.key}
                  className={c.light === l.key ? "active" : ""}
                  onClick={() => c.setLight(l.key)}
                  style={{ padding: "6px 4px", fontSize: 12 }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Section>

          <Section label="View">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 6,
              }}
            >
              <button
                className={c.spinning ? "active" : ""}
                onClick={c.toggleSpin}
              >
                {c.spinning ? "Stop spin" : "Auto-spin"}
              </button>
              <button onClick={c.resetView}>Reset view</button>
              <button onClick={c.takeScreenshot}>Screenshot</button>
              <button onClick={c.toggleTheme}>
                {c.theme === "dark" ? "Light" : "Dark"}
              </button>
            </div>
          </Section>

          {c.stats && (
            <Section label="Model">
              <Stat label="File" value={c.name} />
              <Stat label="Size" value={formatSize(c.stats.size)} />
            </Section>
          )}
        </>
      )}

      {!c.hasModel && (
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
          Pick a demo on the right, or open your own file. Drag &amp; drop works
          too.
        </div>
      )}

      <div
        style={{
          marginTop: "auto",
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          fontSize: 11,
          color: "var(--muted)",
          lineHeight: 1.6,
        }}
      >
        Rotate · drag
        <br />
        Pan · shift + drag
        <br />
        Zoom · scroll
      </div>
    </aside>
  );
}
