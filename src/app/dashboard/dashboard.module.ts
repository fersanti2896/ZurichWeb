import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { HomeRedirectComponent } from './pages/home-redirect/home-redirect.component';


@NgModule({
  declarations: [
    HomeRedirectComponent
  ],
  imports: [
    CommonModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
