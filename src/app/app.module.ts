import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CubeDemoComponent } from './cube-demo/cube-demo.component';
import { HomeComponent } from './home/home.component';
import {FlowerDemoComponent} from "./flower-demo/flower-demo.component";

@NgModule({
  declarations: [
    AppComponent,
    CubeDemoComponent,
    FlowerDemoComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
