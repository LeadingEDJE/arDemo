import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CubeDemoComponent } from './cube-demo/cube-demo.component';
import { FlowerDemoComponent } from './flower-demo/flower-demo.component';
import { HomeComponent } from './home/home.component';
import { LineDemoComponent } from './line-demo/line-demo.component';
import { PlaneDemoComponent } from './plane-demo/plane-demo.component';
import { WebPlaygroundComponent } from './web-playground/web-playground.component';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'cube-demo', component: CubeDemoComponent },
  { path: 'flower-demo', component: FlowerDemoComponent },
  { path: 'line-demo', component: LineDemoComponent },
  { path: 'plane-demo', component: PlaneDemoComponent },
  { path: 'web-playground', component: WebPlaygroundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
