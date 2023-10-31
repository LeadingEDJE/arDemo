import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {ArViewComponent} from "./ar-view/ar-view.component";

const routes: Routes = [
  {path: "", redirectTo: "ar-view", pathMatch: "full"},
  {path: "ar-view", component: ArViewComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
