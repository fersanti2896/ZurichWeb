import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing.module';
import { ListPageComponent } from './page/list-page/list-page.component';
import { CreatePageComponent } from './page/create-page/create-page.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListPageComponent,
    CreatePageComponent
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule, 
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ClientsModule { }
