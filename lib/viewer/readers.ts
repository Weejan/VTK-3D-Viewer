import type vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import { SUPPORTED_EXTENSIONS, type SupportedExtension } from "./types";

// Readers are imported lazily so each one only enters the bundle when used.
type Parser = (file: File | Blob) => Promise<vtkPolyData>;

const PARSERS: Record<SupportedExtension, Parser> = {
  stl: async (file) => {
    const { default: vtkSTLReader } = await import(
      "@kitware/vtk.js/IO/Geometry/STLReader"
    );
    const reader = vtkSTLReader.newInstance();
    reader.parseAsArrayBuffer(await file.arrayBuffer());
    return reader.getOutputData();
  },
  ply: async (file) => {
    const { default: vtkPLYReader } = await import(
      "@kitware/vtk.js/IO/Geometry/PLYReader"
    );
    const reader = vtkPLYReader.newInstance();
    reader.parseAsArrayBuffer(await file.arrayBuffer());
    return reader.getOutputData();
  },
  obj: async (file) => {
    const { default: vtkOBJReader } = await import(
      "@kitware/vtk.js/IO/Misc/OBJReader"
    );
    const reader = vtkOBJReader.newInstance();
    reader.parseAsText(await file.text());
    return reader.getOutputData();
  },
  vtk: async (file) => {
    const { default: vtkPolyDataReader } = await import(
      "@kitware/vtk.js/IO/Legacy/PolyDataReader"
    );
    const reader = vtkPolyDataReader.newInstance();
    reader.parseAsText(await file.text());
    return reader.getOutputData();
  },
  vtp: async (file) => {
    const { default: vtkXMLPolyDataReader } = await import(
      "@kitware/vtk.js/IO/XML/XMLPolyDataReader"
    );
    const reader = vtkXMLPolyDataReader.newInstance();
    reader.parseAsArrayBuffer(await file.arrayBuffer());
    return reader.getOutputData();
  },
};

export function extensionOf(filename: string): SupportedExtension | null {
  const ext = filename.split(".").pop()?.toLowerCase();
  return ext && (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)
    ? (ext as SupportedExtension)
    : null;
}

export async function parseModel(
  file: File | Blob,
  filename: string,
): Promise<vtkPolyData> {
  const ext = extensionOf(filename);
  if (!ext) {
    const got = filename.split(".").pop() ?? "unknown";
    throw new Error(`Unsupported file format: ${got}`);
  }
  return PARSERS[ext](file);
}
