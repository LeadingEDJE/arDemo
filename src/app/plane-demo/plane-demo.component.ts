import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import * as THREE from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {Vector3} from "three";
import {distance} from "three/examples/jsm/nodes/shadernode/ShaderNodeBaseElements";
import TextSprite from '@seregpie/three.text-sprite';

@Component({
  selector: 'app-plane-demo',
  templateUrl: './plane-demo.component.html',
  styleUrls: ['./plane-demo.component.scss']
})
export class PlaneDemoComponent implements OnInit {

  @ViewChild('ARCanvas', {static: true})
  private canvasRef?: ElementRef;
  private canvas!: HTMLCanvasElement;
  private debug = false;

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
    loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", function (gltf) {
      reticle = gltf.scene;
      reticle.visible = false;
      scene.add(reticle);
    })

    const planeMaterial = new THREE.MeshBasicMaterial();
    const fenceLink = 'https://png.pngtree.com/png-vector/20220805/ourmid/pngtree-picket-fence-ancient-architecture-arrowhead-png-image_5750495.png';
    const fenceLoader = new THREE.TextureLoader();
    fenceLoader.load(fenceLink,
      function ( texture ) {

        // The texture has loaded, so assign it to your material object. In the
        // next render cycle, this material update will be shown on the plane
        // geometry
        planeMaterial.map = texture;
        planeMaterial.needsUpdate = true;
        planeMaterial.side = THREE.DoubleSide;
        planeMaterial.transparent = true;
      });

    const scenePoints: THREE.Object3D<THREE.Object3DEventMap>[] = [];
    session.addEventListener("select", (event) => {
      if (reticle) {
        const geometry = new THREE.CircleGeometry( 0.01, 32 ); 
        const material = new THREE.MeshBasicMaterial( { color: 0x0000ff } ); 
        const circle = new THREE.Mesh( geometry, material );
        circle.position.copy(reticle.position);
        // This is to snap the position to a close position
        scenePoints.forEach(point => {
          const distance = point.position.distanceTo(reticle.position);
          if (distance < 0.2 && distance <= point.position.distanceTo(circle.position)) {
            circle.position.copy(point.position);
          }
        });
        scenePoints.push(circle);
        scene.add(circle);

        if (this.debug) {
          const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );

          const points1: Vector3[] = [];
          let start1 = reticle.position.clone();
          let end1 = reticle.position.clone();
          end1.setY(end1.y + 5);
          points1.push(start1);
          points1.push(end1);

          const geometry1 = new THREE.BufferGeometry().setFromPoints( points1 );

          const line = new THREE.Line( geometry1, material2 );
          scene.add( line );
        }

        if (scenePoints.length > 1) {
          const points: Vector3[] = [];
          let start = scenePoints[scenePoints.length - 1].position;
          let end = scenePoints[scenePoints.length - 2].position
          points.push(start);
          points.push(end);

          if (this.debug) {
            const material2 = new THREE.LineBasicMaterial( { color: 0x0000ff, linewidth: 5 } );
            const geometry = new THREE.BufferGeometry().setFromPoints( points );

            const line = new THREE.Line( geometry, material2 );
            scene.add( line );
          }

          let height = 1; // arbitrary
          let width = start.distanceTo(end);
          // const material1 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
          const planeGeometry = new THREE.PlaneGeometry(width, height);
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          const pos = (end.clone().sub(start)).divideScalar(2).add(start);
          plane.position.set(pos.x, pos.y, pos.z);

          plane.lookAt(start);
          plane.rotateY(Math.PI / 2);

          plane.position.setY(plane.position.y + .2);

          // Draw Text
          // distance in cm
          let distance = Math.round(start.distanceTo(end) * 100);

          let sprite = new TextSprite({
            text: distance + ' cm',
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontSize: 0.1,
            color: 'white',
            strokeColor: 'black',
            strokeWidth: 0.05
          });
          sprite.position.set(pos.x, pos.y + .75, pos.z);
          sprite.renderOrder = 5;
          scene.add(sprite);

          scene.add(plane);
        }
      }
    });

    // Create another XRReferenceSpace that has the viewer as the origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.

    const hts = session.requestHitTestSource!({space: viewerSpace});
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
