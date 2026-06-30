import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orbit — 3D mesh viewer",
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
