import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CubeDemoComponent } from './cube-demo/cube-demo.component';
import { HomeComponent } from './home/home.component';
import {FlowerDemoComponent} from "./flower-demo/flower-demo.component";
import {LineDemoComponent} from "./line-demo/line-demo.component";
import { PlaneDemoComponent } from './plane-demo/plane-demo.component';
import { WebPlaygroundComponent } from './web-playground/web-playground.component';
import { ArCanvasComponent } from './ar-canvas/ar-canvas.component';

@NgModule({
  declarations: [
    AppComponent,
    CubeDemoComponent,
    FlowerDemoComponent,
    LineDemoComponent,
    HomeComponent,
    PlaneDemoComponent,
    WebPlaygroundComponent,
    ArCanvasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
