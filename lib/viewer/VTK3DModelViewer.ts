import "@kitware/vtk.js/Rendering/Profiles/Geometry";

import type vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import vtkPolyDataNormals from "@kitware/vtk.js/Filters/Core/PolyDataNormals";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkOrientationMarkerWidget from "@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget";
import { Corners } from "@kitware/vtk.js/Interaction/Widgets/OrientationMarkerWidget/Constants";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkAxesActor from "@kitware/vtk.js/Rendering/Core/AxesActor";
import vtkLight from "@kitware/vtk.js/Rendering/Core/Light";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkRenderer from "@kitware/vtk.js/Rendering/Core/Renderer";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";

import {
  AXES,
  BACKGROUNDS,
  DEFAULT_MODEL_COLOR,
  MATERIAL,
  POINT_SIZE,
  REPRESENTATION_CODE,
  SPIN_DEGREES_PER_FRAME,
} from "./constants";
import { parseModel } from "./readers";
import type { ModelStats, Representation, Theme } from "./types";

// Framework-agnostic VTK.js pipeline. The React layer only calls these methods.
export class VTK3DModelViewer {
  private readonly container: HTMLDivElement;
  private renderWindow: vtkRenderWindow | null = null;
  private renderer: vtkRenderer | null = null;
  private openGLRenderWindow: vtkOpenGLRenderWindow | null = null;
  private interactor: vtkRenderWindowInteractor | null = null;
  private orientationWidget: vtkOrientationMarkerWidget | null = null;
  private axesActor: vtkAxesActor | null = null;
  private currentActor: vtkActor | null = null;
  private currentMapper: vtkMapper | null = null;
  private currentPolyData: vtkPolyData | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafHandle: number | null = null;
  private spinHandle: number | null = null;
  private representation: Representation = "surface";
  private theme: Theme = "dark";
  private modelColor: [number, number, number] | null = null;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.initialize();
  }

  private initialize(): void {
    if (this.renderWindow) return;

    // clear a canvas left behind by a previous mount (React StrictMode)
    this.container.replaceChildren();

    this.renderWindow = vtkRenderWindow.newInstance();
    this.renderer = vtkRenderer.newInstance();
    this.openGLRenderWindow = vtkOpenGLRenderWindow.newInstance();

    this.renderWindow.addRenderer(this.renderer);
    this.renderWindow.addView(this.openGLRenderWindow);
    this.openGLRenderWindow.setContainer(this.container);
    this.syncSize();

    this.interactor = vtkRenderWindowInteractor.newInstance();
    this.interactor.setView(this.openGLRenderWindow);
    this.interactor.initialize();
    this.interactor.bindEvents(this.container);
    this.interactor.setInteractorStyle(
      vtkInteractorStyleTrackballCamera.newInstance(),
    );

    // Headlight — always follows the camera for predictable, pleasant shading
    const headlight = vtkLight.newInstance();
    headlight.setLightTypeToHeadLight();
    headlight.setIntensity(1.0);
    this.renderer.addLight(headlight);

    this.renderer.setBackground(...BACKGROUNDS[this.theme]);

    this.setupOrientationGizmo();

    this.resizeObserver = new ResizeObserver(() => {
      this.syncSize();
      this.requestRender();
    });
    this.resizeObserver.observe(this.container);
  }

  private setupOrientationGizmo(): void {
    if (!this.interactor) return;
    this.axesActor = vtkAxesActor.newInstance();
    this.orientationWidget = vtkOrientationMarkerWidget.newInstance({
      actor: this.axesActor,
      interactor: this.interactor,
    });
    this.orientationWidget.setEnabled(true);
    this.orientationWidget.setViewportCorner(Corners.BOTTOM_RIGHT);
    this.orientationWidget.setViewportSize(AXES.viewportSize);
    this.orientationWidget.setMinPixelSize(AXES.minPixel);
    this.orientationWidget.setMaxPixelSize(AXES.maxPixel);
  }

  private syncSize(): void {
    if (!this.openGLRenderWindow) return;
    const { width, height } = this.container.getBoundingClientRect();
    const w = Math.max(1, Math.floor(width));
    const h = Math.max(1, Math.floor(height));
    const dpr = window.devicePixelRatio || 1;

    // dpr-scaled buffer for sharpness; CSS size pins the canvas to the container
    this.openGLRenderWindow.setSize(Math.floor(w * dpr), Math.floor(h * dpr));
    const canvas = this.container.querySelector("canvas");
    if (canvas) {
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      canvas.style.display = "block";
    }
  }

  // batch render calls into one animation frame
  private requestRender(): void {
    if (this.rafHandle !== null) return;
    this.rafHandle = requestAnimationFrame(() => {
      this.rafHandle = null;
      this.renderWindow?.render();
    });
  }

  async load(file: File | Blob, filename?: string): Promise<void> {
    const name = filename ?? (file as File).name ?? "";
    this.renderModel(await parseModel(file, name));
  }

  private renderModel(input: vtkPolyData): void {
    if (!this.renderer || !this.renderWindow) return;

    this.stopSpin();
    this.disposeCurrentModel();
    this.modelColor = null;

    const polyData = this.withNormals(input);
    this.currentPolyData = polyData;

    this.currentMapper = vtkMapper.newInstance();
    this.currentMapper.setInputData(polyData);

    this.currentActor = vtkActor.newInstance();
    this.currentActor.setMapper(this.currentMapper);

    this.applyColors(polyData);
    this.applyMaterial();

    this.renderer.addActor(this.currentActor);
    this.setRepresentation(this.representation);
    this.renderer.resetCamera();
    this.requestRender();
  }

  // most files ship without normals; compute them for smooth shading
  private withNormals(input: vtkPolyData): vtkPolyData {
    if (input.getPointData().getNormals()) return input;
    const filter = vtkPolyDataNormals.newInstance({
      computePointNormals: true,
      autoOrientNormals: input.getNumberOfPoints() < 200000, // skip on big meshes
    });
    filter.setInputData(input);
    filter.update();
    const output = filter.getOutputData();
    filter.delete();
    return output;
  }

  private applyColors(polyData: vtkPolyData): void {
    if (!this.currentMapper || !this.currentActor) return;
    const prop = this.currentActor.getProperty();
    const pointColors = polyData.getPointData().getScalars();
    const cellColors = polyData.getCellData().getScalars();

    if (pointColors) {
      this.currentMapper.setScalarVisibility(true);
      this.currentMapper.setColorByArrayName(pointColors.getName() ?? "");
      this.currentMapper.setScalarModeToUsePointFieldData();
      prop.setColor(1, 1, 1);
    } else if (cellColors) {
      this.currentMapper.setScalarVisibility(true);
      this.currentMapper.setColorByArrayName(cellColors.getName() ?? "");
      this.currentMapper.setScalarModeToUseCellFieldData();
      prop.setColor(1, 1, 1);
    } else {
      this.currentMapper.setScalarVisibility(false);
      const c = DEFAULT_MODEL_COLOR[this.theme];
      prop.setColor(c, c, c);
    }
  }

  private applyMaterial(): void {
    const prop = this.currentActor?.getProperty();
    if (!prop) return;
    prop.setAmbient(MATERIAL.ambient);
    prop.setDiffuse(MATERIAL.diffuse);
    prop.setSpecular(MATERIAL.specular);
    prop.setSpecularPower(MATERIAL.specularPower);
  }

  private disposeCurrentModel(): void {
    if (this.currentActor && this.renderer) {
      this.renderer.removeActor(this.currentActor);
      this.currentActor.delete();
      this.currentActor = null;
    }
    this.currentMapper?.delete();
    this.currentMapper = null;
    this.currentPolyData = null;
  }

  clear(): void {
    this.stopSpin();
    this.disposeCurrentModel();
    this.requestRender();
  }

  resetCamera(): void {
    this.renderer?.resetCamera();
    this.requestRender();
  }

  setRepresentation(mode: Representation): void {
    this.representation = mode;
    const prop = this.currentActor?.getProperty();
    if (!prop) return;
    prop.setRepresentation(REPRESENTATION_CODE[mode]);
    if (mode === "points") prop.setPointSize(POINT_SIZE);
    this.requestRender();
  }

  setTheme(theme: Theme): void {
    this.theme = theme;
    this.renderer?.setBackground(...BACKGROUNDS[theme]);
    // re-tint only models that have no color and no user override
    if (
      this.currentActor &&
      !this.modelColor &&
      !this.currentMapper?.getScalarVisibility()
    ) {
      const c = DEFAULT_MODEL_COLOR[theme];
      this.currentActor.getProperty().setColor(c, c, c);
    }
    this.requestRender();
  }

  // null restores the file's own colors
  setModelColor(color: [number, number, number] | null): void {
    this.modelColor = color;
    if (!this.currentActor || !this.currentMapper) return;
    if (color) {
      this.currentMapper.setScalarVisibility(false);
      this.currentActor.getProperty().setColor(...color);
    } else if (this.currentPolyData) {
      this.applyColors(this.currentPolyData);
    }
    this.requestRender();
  }

  // returns the new spinning state
  toggleSpin(): boolean {
    if (this.spinHandle !== null) {
      this.stopSpin();
      return false;
    }
    this.startSpin();
    return true;
  }

  private startSpin(): void {
    const step = () => {
      const cam = this.renderer?.getActiveCamera();
      if (cam) {
        cam.azimuth(SPIN_DEGREES_PER_FRAME);
        this.renderer?.resetCameraClippingRange();
        this.renderWindow?.render();
      }
      this.spinHandle = requestAnimationFrame(step);
    };
    this.spinHandle = requestAnimationFrame(step);
  }

  private stopSpin(): void {
    if (this.spinHandle !== null) {
      cancelAnimationFrame(this.spinHandle);
      this.spinHandle = null;
    }
  }

  async screenshot(): Promise<string> {
    if (!this.openGLRenderWindow || !this.renderWindow) return "";
    const capture = this.openGLRenderWindow.captureNextImage("image/png");
    this.renderWindow.render();
    return (await capture) ?? "";
  }

  getStats(): ModelStats | null {
    const pd = this.currentPolyData;
    if (!pd) return null;
    const b = pd.getBounds();
    return {
      points: pd.getNumberOfPoints(),
      cells: pd.getPolys().getNumberOfCells(),
      size: [b[1] - b[0], b[3] - b[2], b[5] - b[4]],
    };
  }

  destroy(): void {
    this.stopSpin();
    if (this.rafHandle !== null) {
      cancelAnimationFrame(this.rafHandle);
      this.rafHandle = null;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.disposeCurrentModel();

    this.orientationWidget?.setEnabled(false);
    this.orientationWidget?.delete();
    this.orientationWidget = null;
    this.axesActor?.delete();
    this.axesActor = null;

    this.interactor?.unbindEvents();
    this.interactor?.delete();
    this.interactor = null;

    if (this.openGLRenderWindow) {
      this.openGLRenderWindow.setContainer(null as unknown as HTMLDivElement);
      this.openGLRenderWindow.delete();
      this.openGLRenderWindow = null;
    }
    this.renderer?.delete();
    this.renderer = null;
    this.renderWindow?.delete();
    this.renderWindow = null;

    this.container.innerHTML = "";
  }
}