import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Router} from "@angular/router";
import * as THREE from "three";
import {BoxGeometry, Mesh, PerspectiveCamera, Scene, WebGLRenderer} from "three";

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
    const parent = this.canvas.parentElement;
    const webGL = this.canvas.getContext("webgl");
    if (!webGL) throw new Error("Unable to load WebGL rendering context");

    this.scene = new THREE.Scene();

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
    this.cube = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), materials);
    this.cube.position.set(0.2, 0.2, -1);
    this.scene.add(this.cube);

    // Set up the WebGLRenderer, which handles rendering to the session's base layer.
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      preserveDrawingBuffer: true,
      canvas: this.canvas,
      context: webGL
    });
    this.renderer.autoClear = false;
    this.renderer.setSize(this.canvas.width, this.canvas.height);
    this.camera = new THREE.PerspectiveCamera();
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
