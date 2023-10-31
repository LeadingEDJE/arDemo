import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CubeDemoComponent} from "./cube-demo/cube-demo.component";
import { FlowerDemoComponent } from './flower-demo/flower-demo.component';

const routes: Routes = [
  {path: "", redirectTo: "cube-demo", pathMatch: "full"},
  {path: "cube-demo", component: CubeDemoComponent},
  {path: "flower-demo", component: FlowerDemoComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
