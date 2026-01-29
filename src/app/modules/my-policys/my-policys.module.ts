import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPolicysRoutingModule } from './my-policys-routing.module';
import { ListPageComponent } from './pages/list-page/list-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';


@NgModule({
  declarations: [
    ListPageComponent
  ],
  imports: [
    CommonModule,
    MyPolicysRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class MyPolicysModule { }
