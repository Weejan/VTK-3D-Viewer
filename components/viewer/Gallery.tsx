import { SUPPORTED_EXTENSIONS } from "@/lib/viewer";
import { DEMOS, type Demo } from "./demos";

export function Gallery({
  busy,
  status,
  onPick,
}: {
  busy: boolean;
  status: string;
  onPick: (demo: Demo) => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ maxWidth: 760, width: "100%", padding: "44px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: "0 0 4px" }}>
          Pick a model
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 14, margin: "0 0 24px" }}>
          Built-in demos below — all procedurally generated. Formats:{" "}
          {SUPPORTED_EXTENSIONS.join(", ").toUpperCase()}.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))",
            gap: 14,
          }}
        >
          {DEMOS.map((demo) => (
            <button
              key={demo.file}
              onClick={() => onPick(demo)}
              disabled={busy}
              style={{
                textAlign: "left",
                padding: 16,
                borderRadius: 12,
                background: "var(--panel)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                minHeight: 96,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600 }}>{demo.name}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>
                {demo.blurb}
              </span>
              <span
                style={{
                  marginTop: "auto",
                  fontSize: 11,
                  color: "var(--muted)",
                  fontFamily: "ui-monospace, monospace",
                }}
              >
                .{demo.file.split(".").pop()?.toUpperCase()}
              </span>
            </button>
          ))}
        </div>

        {status && (
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 18 }}>
            {status}
          </p>
        )}
      </div>
    </div>
  );
}
