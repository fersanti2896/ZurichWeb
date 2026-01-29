import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { HomeRedirectComponent } from './pages/home-redirect/home-redirect.component';
import { PermissionGuard } from '../shared/guards/permission.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent,
    children: [

      // 👇 entrada al dashboard → redirección dinámica por permisos
      {
        path: '',
        component: HomeRedirectComponent,
      },

      // ===== ADMINISTRACIÓN =====
      {
        path: 'users',
        canActivate: [PermissionGuard],
        data: { permission: 'users.manage' },
        loadChildren: () =>
          import('../modules/users/users.module').then(m => m.UsersModule),
      },
      {
        path: 'clients',
        canActivate: [PermissionGuard],
        data: { permission: 'clients.manage' },
        loadChildren: () =>
          import('../modules/clients/clients.module').then(m => m.ClientsModule),
      },
      {
        path: 'policies',
        canActivate: [PermissionGuard],
        data: { permission: 'policies.manage' },
        loadChildren: () =>
          import('../modules/policys/policys.module').then(m => m.PolicysModule),
      },

      // ===== CLIENTE =====
      {
        path: 'my-policies',
        canActivate: [PermissionGuard],
        data: { permission: 'policies.self.view' },
        loadChildren: () =>
          import('../modules/my-policys/my-policys.module').then(m => m.MyPolicysModule),
      },
      {
        path: 'profile',
        canActivate: [PermissionGuard],
        data: { permission: 'profile.self.edit' },
        loadChildren: () =>
          import('../modules/profile/profile.module').then(m => m.ProfileModule),
      },

      // fallback
      { path: '**', component: HomeRedirectComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardRoutingModule {}
