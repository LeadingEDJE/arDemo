import {Component} from '@angular/core';
import {DirectionalLight, Object3D, Scene} from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {ARContext, ARFrameEvent} from "../ar-canvas/ar-canvas.component";

@Component({
  selector: 'app-flower-demo',
  templateUrl: './flower-demo.component.html',
  styleUrls: ['./flower-demo.component.scss']
})
export class FlowerDemoComponent {

  public xrRequiredFeatures = ["hit-test"];

  private scene!: Scene;
  private reticle!: Object3D;
  private flower !: Object3D;
  private hitTestSource?: XRHitTestSource;
  private space!: XRReferenceSpace;

  public async onARLoaded(context: ARContext) {
    let {session} = context;
    this.scene = context.scene;
    this.space = context.space;

    const directionalLight = new DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);
    this.scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/reticle/reticle.gltf", (gltf) => {
      this.reticle = gltf.scene;
      this.reticle.visible = false;
      this.scene.add(this.reticle);
    });

    loader.load("https://immersive-web.github.io/webxr-samples/media/gltf/sunflower/sunflower.gltf", (gltf) => {
      this.flower = gltf.scene;
      session.addEventListener("select", () => this.placeFlower());
    });

    // Perform hit testing using the viewer as origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    this.hitTestSource = await session.requestHitTestSource!({space: viewerSpace});
  }

  private placeFlower(): void {
    const clone = this.flower.clone();
    clone.position.copy(this.reticle.position);
    this.scene.add(clone);
  }

  public onARFrame(event: ARFrameEvent) {
    if (!this.hitTestSource) throw Error("Unable to find hit test source");
    let {frame} = event;
    const hitTestResults = frame.getHitTestResults(this.hitTestSource);
    if (hitTestResults.length > 0 && this.reticle) {
      const hitPose = hitTestResults[0].getPose(this.space);
      if (hitPose) {
        this.reticle.visible = true;
        this.reticle.position.set(hitPose.transform.position.x, hitPose.transform.position.y, hitPose.transform.position.z)
        this.reticle.updateMatrixWorld(true);
      }
    }
  }
}
