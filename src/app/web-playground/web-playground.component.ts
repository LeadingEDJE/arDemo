import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import {
  BoxGeometry,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  RepeatWrapping,
  Scene,
  TextureLoader,
  Vector3,
  WebGLRenderer
} from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import TextSprite from "@seregpie/three.text-sprite";

@Component({
  selector: 'app-web-playground',
  templateUrl: './web-playground.component.html',
  styleUrls: ['./web-playground.component.scss']
})
export class WebPlaygroundComponent implements OnInit, OnDestroy {

  @ViewChild('ARCanvas', {static: true})
  private canvasRef?: ElementRef;
  private canvas!: HTMLCanvasElement;

  public running = false;

  private renderer!: WebGLRenderer;
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private cube!: Mesh<BoxGeometry>;

  private plane!: Mesh;

  private controls!: OrbitControls;

  private _time: DOMHighResTimeStamp = 0;

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
    this.canvas.width = window.innerWidth - 50;
    this.canvas.height = window.innerHeight - 120;
    const webGL = this.canvas.getContext("webgl");
    if (!webGL) throw new Error("Unable to load WebGL rendering context");

    this.scene = new Scene();
    const textureLoader = new TextureLoader();

    // Plane
    const PLANE_SIZE = 4;
    const gridTexture = textureLoader.load("/assets/textures/texture_1m x 1m.png",);
    gridTexture.wrapS = RepeatWrapping;
    gridTexture.wrapT = RepeatWrapping;
    gridTexture.repeat.set(PLANE_SIZE, PLANE_SIZE);
    const gridMaterial = new MeshBasicMaterial();
    gridMaterial.map = gridTexture;
    gridMaterial.needsUpdate = true;
    gridMaterial.side = DoubleSide;
    gridMaterial.transparent = true;
    const geometry = new PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const plane = new Mesh(geometry, gridMaterial);
    plane.position.set(0, 0, 0);
    plane.lookAt(new Vector3(0, 5, 0));
    this.plane = plane;
    this.scene.add(plane);

    // The cube will have a different color on each side.
    const cubeMaterial = [
      new MeshBasicMaterial({color: 0xff0000}),
      new MeshBasicMaterial({color: 0x0000ff}),
      new MeshBasicMaterial({color: 0x00ff00}),
      new MeshBasicMaterial({color: 0xff00ff}),
      new MeshBasicMaterial({color: 0x00ffff}),
      new MeshBasicMaterial({color: 0xffff00})
    ];

    // Create the cube and add it to the demo scene.
    const CUBE_SIZE = 0.25;
    this.cube = new Mesh(new BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE), cubeMaterial);
    this.cube.position.set(-1, CUBE_SIZE / 2, -1);
    this.scene.add(this.cube);

    // Draw Text
    let sprite = new TextSprite({
      text: 'Hello World!',
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: 0.1,
      color: 'white',
      strokeColor: 'black',
      strokeWidth: 0.05
    });
    sprite.position.set(1, 0.1, -1);
    sprite.renderOrder = 5;
    this.scene.add(sprite);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    this.renderer = new WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: webGL
    });
    this.renderer.autoClear = false;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera = new PerspectiveCamera();
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.position.set(1, 1, 1);
    this.camera.lookAt(plane.position);
    this.camera.updateProjectionMatrix();
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.running = true;
    window.requestAnimationFrame((delta) => this.onAnimationFrame(delta));
  }

  onFileChanged(event: any) {
    const file = event.target.files[0]
    const userImageURL = URL.createObjectURL( file );
    const loader = new TextureLoader();
    loader.setCrossOrigin("");
    const texture = loader.load(userImageURL);
    const gridMaterial = new MeshBasicMaterial();

    gridMaterial.map = texture;
    gridMaterial.needsUpdate = true;
    gridMaterial.side = DoubleSide;
    gridMaterial.transparent = true;

    this.plane.material = gridMaterial;
  }

  public ngOnDestroy() {
    this.running = false;
  }

  private onAnimationFrame(time: DOMHighResTimeStamp): void {
    if (this.running) {
      window.requestAnimationFrame((t) => this.onAnimationFrame(t));
    }
    const delta = (time - this._time) / 1000;
    this._time = time;
    this.cube.rotateY(Math.PI * delta);
    this.controls.update(delta);
    // Render the scene with WebGLRenderer.
    this.renderer.render(this.scene, this.camera);
  }
}
