import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../shared/shared.module';
import { EditProfileComponent } from './components/edit-profile/edit-profile.component';


@NgModule({
  declarations: [
    ProfilePageComponent,
    EditProfileComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    ReactiveFormsModule,
    SharedModule
  ]
})
export class ProfileModule { }
