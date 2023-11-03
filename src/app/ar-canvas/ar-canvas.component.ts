import {Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import * as THREE from "three";
import {Camera, Scene, WebGLRenderer} from "three";

@Component({
  selector: 'app-ar-canvas',
  templateUrl: './ar-canvas.component.html',
  styleUrls: ['./ar-canvas.component.scss']
})
export class ArCanvasComponent implements OnInit {

  @Input() pageTitle: string = "AR Canvas";
  @Input() xrMode: XRSessionMode = "immersive-ar";
  @Input() xrRequiredFeatures: string[] = [];

  @Output() $onActivateXR = new EventEmitter<void>();
  @Output() $onARLoaded = new EventEmitter<ARContext>();
  @Output() $onARFrame = new EventEmitter<ARFrameEvent>();

  @ViewChild('ARCanvas', {static: true})
  private _canvasRef?: ElementRef;
  private _canvas!: HTMLCanvasElement;

  private _context!: ARContext;
  private _time: number = 0;

  constructor(private router: Router) {
  }

  public ngOnInit() {
    if (this._canvasRef) {
      this._canvas = this._canvasRef.nativeElement as HTMLCanvasElement
    } else {
      throw new Error("Failed to find child canvas element.")
    }
  }

  async navigate(target: string): Promise<boolean> {
    return this.router.navigate([target]);
  }

  /**
   * When the user presses the Activate XR button...
   */
  public async activateXR() {
    this.$onActivateXR.emit();
    const webGLContext = this._canvas.getContext("webgl", {xrCompatible: true});
    if (!webGLContext) throw new Error("Unable to load WebGL rendering context");

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this._canvas,
      context: webGLContext
    });
    renderer.autoClear = false;

    // Initialize a WebXR session using "immersive-ar".
    if (!window.navigator.xr) throw new Error("Unable to find XR system");
    const sessionRequest = window.navigator.xr.requestSession(
      this.xrMode, {requiredFeatures: this.xrRequiredFeatures}
    );
    if (!sessionRequest) throw new Error("Could not request immersive-ar session!")
    const session = await sessionRequest;

    await session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, webGLContext)
    });

    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');

    // The API directly updates the camera matrices.
    // Disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;

    // Create context
    this._context = {
      webGL: webGLContext,
      renderer: renderer,
      session: session,
      scene: new Scene(),
      camera: camera,
      space: referenceSpace
    };
    this.$onARLoaded.emit(this._context);
    // Create a render loop that allows us to draw on the AR view.
    session.requestAnimationFrame((t, f) => this.onXRFrame(t, f));
  }

  /**
   * Is called every frame in order to redraw the scene...
   */
  private onXRFrame(time: number, frame: XRFrame): void {
    const {
      session,
      webGL,
      renderer,
      space,
      camera,
      scene
    } = this._context;
    // Queue up the next draw request.
    session.requestAnimationFrame((t, f) => this.onXRFrame(t, f));

    // Bind the graphics framebuffer to the baseLayer's framebuffer
    if (!session.renderState.baseLayer) throw new Error("Unable to find base layer")
    webGL.bindFramebuffer(webGL.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)

    // Retrieve the pose of the device.
    // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
    const pose = frame.getViewerPose(space);
    if (pose) {
      // In mobile AR, we only have one view.
      const view = pose.views[0];

      const viewport = session.renderState.baseLayer.getViewport(view);
      if (!viewport) throw new Error("Unable to find viewport")
      renderer.setSize(viewport.width, viewport.height)

      // Use the view's transform matrix and projection matrix to configure the THREE.camera.
      camera.matrix.fromArray(view.transform.matrix)
      camera.projectionMatrix.fromArray(view.projectionMatrix);
      camera.updateMatrixWorld(true);
      const delta = (time - this._time) / 1000;
      this._time = time;
      this.$onARFrame.emit({
        delta, time, frame, view
      });
      // Render the scene with THREE.WebGLRenderer.
      renderer.render(scene, camera);
    }
  }

}

/**
 * Represents data to be sent to other components every frame.
 */
export interface ARFrameEvent {
  delta: number,
  time: number,
  frame: XRFrame,
  view: XRView,
}

/**
 * Represents the core context that is required for AR content.
 */
export interface ARContext {
  webGL: WebGLRenderingContext;
  renderer: WebGLRenderer;
  session: XRSession;
  scene: Scene;
  camera: Camera;
  space: XRReferenceSpace;
}
