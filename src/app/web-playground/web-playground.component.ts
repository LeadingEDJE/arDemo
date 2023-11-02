import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import * as THREE from "three";
import {BoxGeometry, Mesh, PerspectiveCamera, Scene, Vector3, WebGLRenderer} from "three";

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
    this.canvas.width = window.innerWidth - 100;
    this.canvas.height = window.innerHeight - 100;
    const webGL = this.canvas.getContext("webgl");
    if (!webGL) throw new Error("Unable to load WebGL rendering context");

    this.scene = new THREE.Scene();
    const textureLoader = new THREE.TextureLoader();

    // Plane
    const PLANE_SIZE = 4;
    const gridTexture = textureLoader.load("/assets/textures/texture_1m x 1m.png",);
    gridTexture.wrapS = THREE.RepeatWrapping;
    gridTexture.wrapT = THREE.RepeatWrapping;
    gridTexture.repeat.set(PLANE_SIZE, PLANE_SIZE);
    const gridMaterial = new THREE.MeshBasicMaterial();
    gridMaterial.map = gridTexture;
    gridMaterial.needsUpdate = true;
    gridMaterial.side = THREE.DoubleSide;
    gridMaterial.transparent = true;
    const geometry = new THREE.PlaneGeometry(PLANE_SIZE, PLANE_SIZE);
    const plane = new THREE.Mesh(geometry, gridMaterial);
    plane.position.set(0, 0, 0);
    plane.lookAt(new Vector3(0, 5, 0));
    this.scene.add(plane);

    // The cube will have a different color on each side.
    const cubeMaterial = [
      new THREE.MeshBasicMaterial({color: 0xff0000}),
      new THREE.MeshBasicMaterial({color: 0x0000ff}),
      new THREE.MeshBasicMaterial({color: 0x00ff00}),
      new THREE.MeshBasicMaterial({color: 0xff00ff}),
      new THREE.MeshBasicMaterial({color: 0x00ffff}),
      new THREE.MeshBasicMaterial({color: 0xffff00})
    ];

    // Create the cube and add it to the demo scene.
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), cubeMaterial);
    this.cube.position.set(0, 0.25, -1);
    this.scene.add(this.cube);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: webGL
    });
    this.renderer.autoClear = false;
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.camera = new THREE.PerspectiveCamera();
    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera.position.set(1, 1, 1);
    this.camera.lookAt(plane.position);
    this.camera.updateProjectionMatrix();
    this.running = true;
    window.requestAnimationFrame((delta) => this.onAnimationFrame(delta));
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
    // Render the scene with THREE.WebGLRenderer.
    this.renderer.render(this.scene, this.camera);
  }
}
