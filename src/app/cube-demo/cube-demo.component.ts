import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";

@Component({
  selector: 'app-cube-demo',
  templateUrl: './cube-demo.component.html',
  styleUrls: ['./cube-demo.component.scss']
})
export class CubeDemoComponent implements OnInit {

  @ViewChild('ARCanvas', {static: true})
  private canvasRef?: ElementRef;
  private canvas!: HTMLCanvasElement;

  public ngOnInit() {
    if (this.canvasRef) {
      this.canvas = this.canvasRef.nativeElement as HTMLCanvasElement
    } else {
      throw new Error("AR Canvas is Required!")
    }
  }

  public async activateXR() {
    const gl = this.canvas.getContext("webgl", {xrCompatible: true});

    if (!gl) throw new Error("Unable to load WebGL rendering context");

    // To be continued in upcoming steps.
    const scene = new THREE.Scene();

    // The cube will have a different color on each side.
    const materials = [
      new THREE.MeshBasicMaterial({color: 0xff0000}),
      new THREE.MeshBasicMaterial({color: 0x0000ff}),
      new THREE.MeshBasicMaterial({color: 0x00ff00}),
      new THREE.MeshBasicMaterial({color: 0xff00ff}),
      new THREE.MeshBasicMaterial({color: 0x00ffff}),
      new THREE.MeshBasicMaterial({color: 0xffff00})
    ];

    // Create the cube and add it to the demo scene.
    const cube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), materials);
    cube.position.set(0, 0, -1);
    scene.add(cube);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: gl
    });
    renderer.autoClear = false;

    // The API directly updates the camera matrices.
    // Disable matrix auto updates so three.js doesn't attempt
    // to handle the matrices independently.
    const camera = new THREE.PerspectiveCamera();
    camera.matrixAutoUpdate = false;

    // Initialize a WebXR session using "immersive-ar".
    if (!window.navigator.xr) throw new Error("Unable to find XR system");

    const sessionRequest = window.navigator.xr.requestSession("immersive-ar");

    if (!sessionRequest) throw new Error("Could not request immersive-ar session!")

    const session = await sessionRequest;

    session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, gl)
    });

    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');

    // Create a render loop that allows us to draw on the AR view.
    const onXRFrame = (time: any, frame: any) => {
      // Queue up the next draw request.
      session.requestAnimationFrame(onXRFrame);

      // Bind the graphics framebuffer to the baseLayer's framebuffer
      if (!session.renderState.baseLayer) throw new Error("Unable to find base layer")
      gl.bindFramebuffer(gl.FRAMEBUFFER, session.renderState.baseLayer.framebuffer)

      // Retrieve the pose of the device.
      // XRFrame.getViewerPose can return null while the session attempts to establish tracking.
      const pose = frame.getViewerPose(referenceSpace);
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

        // Render the scene with THREE.WebGLRenderer.
        renderer.render(scene, camera)
      }
    }
    session.requestAnimationFrame(onXRFrame);
  }

}
