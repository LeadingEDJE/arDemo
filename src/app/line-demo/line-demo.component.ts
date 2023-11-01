import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {Router} from "@angular/router";

@Component({
  selector: 'app-line-demo',
  templateUrl: './line-demo.component.html',
  styleUrls: ['./line-demo.component.scss']
})
export class LineDemoComponent implements OnInit {

  @ViewChild('ARCanvas', {static: true})
  private canvasRef?: ElementRef;
  private canvas!: HTMLCanvasElement;

  constructor(private router: Router) {
  }

  async navigate(target: string): Promise<boolean> {
    return this.router.navigate([target]);
  }

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

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);
    scene.add(directionalLight);

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

    const sessionRequest = window.navigator.xr.requestSession("immersive-ar", {requiredFeatures: ['hit-test']});

    if (!sessionRequest) throw new Error("Could not request immersive-ar session!")

    const session = await sessionRequest;

    session.updateRenderState({
      baseLayer: new XRWebGLLayer(session, gl)
    });

    // A 'local' reference space has a native origin that is located
    // near the viewer's position at the time the session was created.
    const referenceSpace = await session.requestReferenceSpace('local');


    const loader = new GLTFLoader();
    let reticle: THREE.Object3D<THREE.Object3DEventMap>;
    loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", function(gltf) {
      reticle = gltf.scene;
      reticle.visible = false;
      scene.add(reticle);
    })

    const scenePoints: THREE.Object3D<THREE.Object3DEventMap>[] = [];
    session.addEventListener("select", (event) => {
      if (reticle) {
        const clone = reticle.clone();
        clone.position.copy(reticle.position);
        scenePoints.push(clone);
        scene.add(clone);

        if (scenePoints.length > 1) {
          //create a blue LineBasicMaterial
          const material = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );

          const points = [];
          points.push( scenePoints[scenePoints.length - 1].position );
          points.push( scenePoints[scenePoints.length - 2].position );

          const geometry = new THREE.BufferGeometry().setFromPoints( points );

          const line = new THREE.Line( geometry, material );
          scene.add( line );
        }
      }
    });

    // Create another XRReferenceSpace that has the viewer as the origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.

    const hts = session.requestHitTestSource!({ space: viewerSpace });
    const hitTestSource = await hts;

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

        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0 && reticle) {
          const hitPose = hitTestResults[0].getPose(referenceSpace);
          reticle.visible = true;
          reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
          reticle.updateMatrixWorld(true);
        }

        // Render the scene with THREE.WebGLRenderer.
        renderer.render(scene, camera)
      }
    }
    session.requestAnimationFrame(onXRFrame);
  }

}
