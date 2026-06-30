import type { ReactNode } from "react";

export function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        style={{
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          color: "var(--muted)",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 8,
        fontSize: 13,
      }}
    >
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span
        title={value}
        style={{
          fontFamily: "ui-monospace, monospace",
          textAlign: "right",
          wordBreak: "break-word",
          minWidth: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function DropOverlay() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 12,
        border: "1.5px dashed #6b7280",
        borderRadius: 12,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--fg)",
        background: "rgba(0,0,0,0.45)",
        pointerEvents: "none",
        fontSize: 14,
        zIndex: 2,
      }}
    >
      Drop to load
    </div>
  );
}
