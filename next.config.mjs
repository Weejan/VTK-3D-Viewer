/** @type {import('next').NextConfig} */
const nextConfig = {
  // VTK.js ships ESM that Next needs to transpile.
  transpilePackages: ["@kitware/vtk.js"],
};

export default nextConfig;
