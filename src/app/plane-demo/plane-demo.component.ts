import {Component} from '@angular/core';
import {
  BufferGeometry,
  CircleGeometry,
  DirectionalLight,
  DoubleSide,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneGeometry,
  Scene,
  TextureLoader,
  Vector3
} from "three";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {ARContext, ARFrameEvent} from "../ar-canvas/ar-canvas.component";
import TextSprite from '@seregpie/three.text-sprite';
import Resources from "../models/resources";

@Component({
  selector: 'app-plane-demo',
  templateUrl: './plane-demo.component.html',
  styleUrls: ['./plane-demo.component.scss']
})
export class PlaneDemoComponent {

  public xrRequiredFeatures = ["hit-test"];

  private scene!: Scene;
  private reticle!: Object3D;
  private hitTestSource?: XRHitTestSource;
  private space!: XRReferenceSpace;
  private scenePoints: Object3D[] = [];
  private planeMaterial!: MeshBasicMaterial;
  private debug = false;

  public listOfDistances: Array<number> = [];

  public onARLoaded = async (context: ARContext): Promise<void> => {
    const {session} = context;
    this.scene = context.scene;
    this.space = context.space;
    const directionalLight = new DirectionalLight(0xffffff, 0.3);
    directionalLight.position.set(10, 15, 10);
    this.scene.add(directionalLight);

    const gltfLoader = new GLTFLoader();

    gltfLoader.load(Resources.RETICLE_GLTF, (gltf) => {
      this.reticle = gltf.scene;
      this.reticle.visible = false;
      this.scene.add(this.reticle);
    });

    const textureLoader = new TextureLoader();
    this.planeMaterial = new MeshBasicMaterial();
    textureLoader.load(Resources.FENCE_PNG, (texture) => {
      // The texture has loaded, so assign it to your material object. In the
      // next render cycle, this material update will be shown on the plane
      // geometry
      this.planeMaterial.map = texture;
      this.planeMaterial.needsUpdate = true;
      this.planeMaterial.side = DoubleSide;
      this.planeMaterial.transparent = true;
    });
    session.addEventListener("select", () => this.placePoint());

    // Create another XRReferenceSpace that has the viewer as the origin.
    const viewerSpace = await session.requestReferenceSpace('viewer');
    // Perform hit testing using the viewer as origin.
    this.hitTestSource = await session.requestHitTestSource!({space: viewerSpace});
  }

  private placePoint(): void {
    if (this.reticle) {
      const geometry = new CircleGeometry(0.01, 32);
      const material = new MeshBasicMaterial({color: 0x0000ff});
      const circle = new Mesh(geometry, material);
      circle.position.copy(this.reticle.position);
      // This is to snap the position to a close position
      this.scenePoints.forEach(point => {
        const distance = point.position.distanceTo(this.reticle.position);
        if (distance < 0.2 && distance <= point.position.distanceTo(circle.position)) {
          circle.position.copy(point.position);
        }
      });
      this.scenePoints.push(circle);
      this.scene.add(circle);

      if (this.debug) {
        const material2 = new LineBasicMaterial({color: 0x0000ff, linewidth: 5});

        const points1: Vector3[] = [];
        let start1 = this.reticle.position.clone();
        let end1 = this.reticle.position.clone();
        end1.setY(end1.y + 5);
        points1.push(start1);
        points1.push(end1);

        const geometry1 = new BufferGeometry().setFromPoints(points1);

        const line = new Line(geometry1, material2);
        this.scene.add(line);
      }

      if (this.scenePoints.length > 1) {
        const points: Vector3[] = [];
        let start = this.scenePoints[this.scenePoints.length - 1].position;
        let end = this.scenePoints[this.scenePoints.length - 2].position
        points.push(start);
        points.push(end);

        if (this.debug) {
          const material2 = new LineBasicMaterial({color: 0x0000ff, linewidth: 5});
          const geometry = new BufferGeometry().setFromPoints(points);

          const line = new Line(geometry, material2);
          this.scene.add(line);
        }

        let height = 1; // arbitrary
        let width = start.distanceTo(end);
        // const material1 = new THREE.MeshBasicMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
        const planeGeometry = new PlaneGeometry(width, height);
        const plane = new Mesh(planeGeometry, this.planeMaterial);
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
        this.scene.add(sprite);

        this.listOfDistances.push(distance);

        this.scene.add(plane);
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
