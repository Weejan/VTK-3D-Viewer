/** Public type surface for the viewer module. */

export const SUPPORTED_EXTENSIONS = ["stl", "ply", "obj", "vtk", "vtp"] as const;
export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export type Representation = "surface" | "wireframe" | "points";
export type Theme = "dark" | "light";

export interface ModelStats {
  /** Number of vertices. */
  points: number;
  /** Number of polygonal faces. */
  cells: number;
  /** Bounding-box extent on each axis: [x, y, z]. */
  size: [number, number, number];
}
