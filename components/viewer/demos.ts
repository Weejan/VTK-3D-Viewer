export interface Demo {
  file: string;
  name: string;
  blurb: string;
}

export const DEMOS: Demo[] = [
  { file: "sofia.ply", name: "SOFIA Aircraft", blurb: "NASA flying observatory" },
  { file: "sls.stl", name: "SLS Rocket", blurb: "NASA Space Launch System" },
  { file: "snowman.ply", name: "Snowman", blurb: "Stacked spheres, hat, coal" },
];
