import {Component} from '@angular/core';
import {BoxGeometry, Mesh, MeshBasicMaterial} from "three";
import {ARContext} from "../ar-canvas/ar-canvas.component";

@Component({
  selector: 'app-cube-demo',
  templateUrl: './cube-demo.component.html',
  styleUrls: ['./cube-demo.component.scss']
})
export class CubeDemoComponent {

  public async onARLoaded(context: ARContext) {
    // The cube will have a different color on each side.
    const materials = [
      new MeshBasicMaterial({color: 0xff0000}),
      new MeshBasicMaterial({color: 0x0000ff}),
      new MeshBasicMaterial({color: 0x00ff00}),
      new MeshBasicMaterial({color: 0xff00ff}),
      new MeshBasicMaterial({color: 0x00ffff}),
      new MeshBasicMaterial({color: 0xffff00})
    ];
    // Create the cube and add it to the demo scene.
    const cube = new Mesh(new BoxGeometry(0.2, 0.2, 0.2), materials);
    cube.position.set(0, 0, -1);
    context.scene.add(cube);
  }

}
