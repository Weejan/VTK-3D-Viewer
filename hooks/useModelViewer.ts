"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type * as React from "react";
import {
  VTK3DModelViewer,
  type LightKey,
  type ModelStats,
  type Representation,
  type Theme,
} from "@/lib/viewer";
import type { Demo } from "@/components/viewer/demos";

export interface ViewerController {
  containerRef: React.RefObject<HTMLDivElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  hasModel: boolean;
  name: string;
  status: string;
  busy: boolean;
  dragging: boolean;
  rep: Representation;
  spinning: boolean;
  theme: Theme;
  stats: ModelStats | null;
  color: string;
  light: LightKey;
  openFilePicker: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  setDragging: (value: boolean) => void;
  loadDemo: (demo: Demo) => void;
  goHome: () => void;
  setRepresentation: (rep: Representation) => void;
  toggleSpin: () => void;
  takeScreenshot: () => void;
  toggleTheme: () => void;
  resetView: () => void;
  setColor: (key: string, rgb: [number, number, number] | null) => void;
  setLight: (key: LightKey) => void;
}

// Owns the viewer lifecycle and all UI state; components just call its actions.
export function useModelViewer(): ViewerController {
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const viewerRef = useRef<VTK3DModelViewer | null>(null);
  const loadIdRef = useRef(0);

  const [hasModel, setHasModel] = useState(false);
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [rep, setRep] = useState<Representation>("surface");
  const [spinning, setSpinning] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [color, setColorKey] = useState("original");
  const [light, setLightKey] = useState<LightKey>("headlight");

  useEffect(() => {
    if (!containerRef.current) return;
    const viewer = new VTK3DModelViewer(containerRef.current);
    viewerRef.current = viewer;
    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", theme === "light");
    viewerRef.current?.setTheme(theme);
  }, [theme]);

  const loadFile = useCallback(async (file: File | Blob, label?: string) => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    // tag the load so a slow one can't overwrite a newer one (or a torn-down viewer)
    const loadId = ++loadIdRef.current;
    const isStale = () =>
      loadIdRef.current !== loadId || viewerRef.current !== viewer;
    const fname = label ?? (file as File).name ?? "model";
    setBusy(true);
    setStatus(`Loading ${fname}…`);
    try {
      await viewer.load(file, fname);
      if (isStale()) return;
      viewer.setRepresentation("surface");
      setRep("surface");
      setSpinning(false);
      setStats(viewer.getStats());
      setColorKey("original");
      setName(fname);
      setHasModel(true);
      setStatus("");
    } catch (err) {
      if (isStale()) return;
      console.error(err);
      setStatus(
        err instanceof Error ? err.message : "Failed to load that file."
      );
    } finally {
      if (!isStale()) setBusy(false);
    }
  }, []);

  const loadDemo = useCallback(
    async (demo: Demo) => {
      setBusy(true);
      setStatus(`Loading ${demo.name}…`);
      try {
        const res = await fetch(`/models/${demo.file}`);
        if (!res.ok) throw new Error(`Could not fetch ${demo.file}`);
        await loadFile(await res.blob(), demo.file);
      } catch (err) {
        console.error(err);
        setStatus("Could not load that model.");
        setBusy(false);
      }
    },
    [loadFile]
  );

  const openFilePicker = useCallback(() => fileInputRef.current?.click(), []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) loadFile(file);
      e.target.value = "";
    },
    [loadFile]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) loadFile(file);
    },
    [loadFile]
  );

  const goHome = useCallback(() => {
    viewerRef.current?.clear();
    setHasModel(false);
    setSpinning(false);
    setStats(null);
    setName("");
    setStatus("");
  }, []);

  const setRepresentation = useCallback((next: Representation) => {
    setRep(next);
    viewerRef.current?.setRepresentation(next);
  }, []);

  const toggleSpin = useCallback(() => {
    setSpinning(viewerRef.current?.toggleSpin() ?? false);
  }, []);

  const takeScreenshot = useCallback(async () => {
    const url = await viewerRef.current?.screenshot();
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name.replace(/\.[^.]+$/, "") || "model"}.png`;
    a.click();
  }, [name]);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    []
  );

  const resetView = useCallback(() => viewerRef.current?.resetCamera(), []);

  const setColor = useCallback(
    (key: string, rgb: [number, number, number] | null) => {
      setColorKey(key);
      viewerRef.current?.setModelColor(rgb);
    },
    [],
  );

  const setLight = useCallback((key: LightKey) => {
    setLightKey(key);
    viewerRef.current?.setLight(key);
  }, []);

  return {
    containerRef,
    fileInputRef,
    hasModel,
    name,
    status,
    busy,
    dragging,
    rep,
    spinning,
    theme,
    stats,
    color,
    light,
    openFilePicker,
    onInputChange,
    onDrop,
    setDragging,
    loadDemo,
    goHome,
    setRepresentation,
    toggleSpin,
    takeScreenshot,
    toggleTheme,
    resetView,
    setColor,
    setLight,
  };
}
