export interface Demo {
  file: string;
  name: string;
  blurb: string;
}

export const DEMOS: Demo[] = [
  { file: "mug.ply", name: "Coffee Mug", blurb: "Revolved cup + torus handle" },
  { file: "wine-glass.ply", name: "Wine Glass", blurb: "Surface of revolution" },
  { file: "rocket.ply", name: "Rocket", blurb: "Body, nose cone, fins" },
  { file: "snowman.ply", name: "Snowman", blurb: "Stacked spheres, hat, coal" },
  { file: "dumbbell.ply", name: "Dumbbell", blurb: "Bar with end weights" },
  { file: "mushroom.ply", name: "Mushroom", blurb: "Cap, stem, spots" },
];
