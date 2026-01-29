import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../shared/state/auth.state';

@Component({
  selector: 'dashboard-home-redirect',
  template: ``,
  standalone: false
})
export class HomeRedirectComponent implements OnInit {

  constructor(
    private store: Store,
    private router: Router
  ) { }

  ngOnInit(): void {
    const permissions: string[] =
      this.store.selectSnapshot(AuthState.permissions) ?? [];

    if (permissions.includes('policies.manage')) {
      this.router.navigate(['/dashboard/policies']);
      return;
    }

    if (permissions.includes('clients.manage')) {
      this.router.navigate(['/dashboard/clients']);
      return;
    }

    if (permissions.includes('users.manage')) {
      this.router.navigate(['/dashboard/users']);
      return;
    }

    if (permissions.includes('policies.self.view')) {
      this.router.navigate(['/dashboard/my-policies']);
      return;
    }

    if (permissions.includes('profile.self.edit')) {
      this.router.navigate(['/dashboard/profile']);
      return;
    }

    this.router.navigate(['/auth/login']);
  }
}
