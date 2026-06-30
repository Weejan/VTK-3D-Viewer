"use client";

import dynamic from "next/dynamic";

// VTK.js is browser-only (WebGL), so load the viewer with SSR disabled.
const Viewer = dynamic(() => import("@/components/viewer/Viewer"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#8a8a8a",
        fontSize: 14,
      }}
    >
      Loading viewer…
    </div>
  ),
});

export default function Page() {
  return <Viewer />;
}
