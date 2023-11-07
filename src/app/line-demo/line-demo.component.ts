import {Component} from '@angular/core';
import {BufferGeometry, DirectionalLight, Line, LineBasicMaterial, Object3D, Scene} from "three";
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {ARContext, ARFrameEvent} from "../ar-canvas/ar-canvas.component";
import Resources from "../models/resources";

@Component({
  selector: 'app-line-demo',
  templateUrl: './line-demo.component.html',
  styleUrls: ['./line-demo.component.scss']
})
export class LineDemoComponent {

  public xrRequiredFeatures = ["hit-test"];

  private scene!: Scene;
  private reticle!: Object3D;
  private hitTestSource?: XRHitTestSource;
  private space!: XRReferenceSpace;
  private scenePoints: Object3D[] = [];

  public onARLoaded = async (context: ARContext): Promise<void> => {
    this.scene = context.scene;
    this.space = context.space;
    const {session} = context;

    const directionalLight = new DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);
    this.scene.add(directionalLight);

    const loader = new GLTFLoader();
    loader.load(Resources.reticle.gltf, (gltf) => {
      this.reticle = gltf.scene;
      this.reticle.visible = false;
      this.scene.add(this.reticle);
    });

    session.addEventListener("select", () => this.placePoint());

    // Create another XRReferenceSpace that has the viewer as the origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    const hts = session.requestHitTestSource!({space: viewerSpace});
    this.hitTestSource = await hts;
  }

  private placePoint(): void {
    if (this.reticle) {
      const clone = this.reticle.clone();
      clone.position.copy(this.reticle.position);
      this.scenePoints.push(clone);
      this.scene.add(clone);

      if (this.scenePoints.length > 1) {
        //create a blue LineBasicMaterial
        const material = new LineBasicMaterial({color: 0x0000ff, linewidth: 5});

        const points = [];
        points.push(this.scenePoints[this.scenePoints.length - 1].position);
        points.push(this.scenePoints[this.scenePoints.length - 2].position);

        const geometry = new BufferGeometry().setFromPoints(points);

        const line = new Line(geometry, material);
        this.scene.add(line);
      }
    }
  }

  public onARFrame = async (event: ARFrameEvent): Promise<void> => {
    if (!this.hitTestSource) throw Error("Unable to find hit test source");
    const hitTestResults = event.frame.getHitTestResults(this.hitTestSource);
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
