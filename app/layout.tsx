import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VTK 3D Viewer",
  description:
    "A tiny browser viewer for 3D prints, scans, and generative geometry. STL, PLY, OBJ, VTK, VTP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
