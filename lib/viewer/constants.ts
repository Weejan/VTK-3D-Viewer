import type { LightKey, Representation, Theme } from "./types";

export const BACKGROUNDS: Record<Theme, [number, number, number]> = {
  dark: [0.04, 0.04, 0.04],
  light: [0.96, 0.96, 0.97],
};

// grey used for models that carry no color of their own
export const DEFAULT_MODEL_COLOR: Record<Theme, number> = {
  dark: 0.9,
  light: 0.4,
};

// 0 = points, 1 = wireframe, 2 = surface
export const REPRESENTATION_CODE: Record<Representation, number> = {
  points: 0,
  wireframe: 1,
  surface: 2,
};

export const POINT_SIZE = 3;
export const SPIN_DEGREES_PER_FRAME = 0.35;

// position each preset light shines from (it aims at the origin)
export const LIGHT_DIRECTIONS: Record<
  Exclude<LightKey, "headlight">,
  [number, number, number]
> = {
  top: [0, 1, 0.15],
  front: [0, 0.2, 1],
  left: [-1, 0.25, 0.4],
  right: [1, 0.25, 0.4],
  back: [0, 0.2, -1],
};

export const MATERIAL = {
  ambient: 0.18,
  diffuse: 0.8,
  specular: 0.25,
  specularPower: 40,
} as const;

export const AXES = {
  viewportSize: 0.12,
  minPixel: 60,
  maxPixel: 120,
} as const;
