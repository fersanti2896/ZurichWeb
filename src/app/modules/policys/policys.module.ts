import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PolicysRoutingModule } from './policys-routing.module';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { CreatePageComponent } from './pages/create-page/create-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ListPageComponent,
    CreatePageComponent
  ],
  imports: [
    CommonModule,
    PolicysRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class PolicysModule { }
