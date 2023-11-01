import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {CubeDemoComponent} from "./cube-demo/cube-demo.component";
import { FlowerDemoComponent } from './flower-demo/flower-demo.component';
import {HomeComponent} from "./home/home.component";

const routes: Routes = [
  {path: "", redirectTo: "home", pathMatch: "full"},
  {path: "home", component: HomeComponent},
  {path: "cube-demo", component: CubeDemoComponent},
  {path: "flower-demo", component: FlowerDemoComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
