import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { AuthState } from '../../../shared/state/auth.state';
import { ClearAuth } from '../../../shared/state/auth.actions';

type SidebarChild = { label: string; icon: string; url: string; permissions: string[] };
type SidebarGroup = { label: string; icon: string; expanded: boolean; permissions: string[]; children: SidebarChild[] };

@Component({
  selector: 'dashboard-layout-page',
  standalone: false,
  templateUrl: './layout-page.component.html',
})
export class LayoutPageComponent implements OnInit {
  public isSidebarOpen = false;
  public isUserMenuOpen = false;
  public user: any;
  public sidebarItems: SidebarGroup[] = [];
  public perms: string[] = [];

  @ViewChild('userMenuContainer') userMenuRef!: ElementRef;

  constructor(private store: Store, private router: Router) { }

  ngOnInit(): void {
    this.perms = this.store.selectSnapshot(AuthState.permissions) ?? [];
    this.user = this.store.selectSnapshot(AuthState.user);
    this.buildSidebar();
    this.redirectToFirstAllowedIfNeeded();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.userMenuRef?.nativeElement.contains(event.target);
    if (!clickedInside && this.isUserMenuOpen) this.closeUserMenu();
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
  }

  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  toggleGroup(selectedGroup: SidebarGroup): void {
    this.sidebarItems.forEach((g) => (g.expanded = g === selectedGroup ? !g.expanded : false));
  }

  logout(): void {
    localStorage.removeItem('refresh_token');
    sessionStorage.removeItem('refresh_token');
    this.store.dispatch(new ClearAuth());
    this.router.navigate(['/auth/login']);
  }

  private hasAny(required: string[]): boolean {
    return required.some((p) => this.perms.includes(p));
  }

  private buildSidebar(): void {
    const fullSidebar: SidebarGroup[] = [
      {
        label: 'Administración',
        icon: 'admin_panel_settings',
        expanded: false,
        permissions: ['users.manage', 'clients.manage', 'policies.manage'],
        children: [
          { label: 'Usuarios', icon: 'supervisor_account', url: '/dashboard/users', permissions: ['users.manage'] },
          { label: 'Clientes', icon: 'groups', url: '/dashboard/clients', permissions: ['clients.manage'] },
          { label: 'Pólizas', icon: 'description', url: '/dashboard/policys', permissions: ['policies.manage'] },
        ],
      },
      {
        label: 'Gestión',
        icon: 'manage_accounts',
        expanded: false,
        permissions: ['policies.self.view', 'profile.self.edit'],
        children: [
          { label: 'Mis pólizas', icon: 'folder_shared', url: '/dashboard/my-policys', permissions: ['policies.self.view'] },
          { label: 'Mi cuenta', icon: 'account_circle', url: '/dashboard/profile', permissions: ['profile.self.edit'] },
        ],
      },
    ];

    this.sidebarItems = fullSidebar
      .filter((group) => this.hasAny(group.permissions))
      .map((group) => ({
        ...group,
        expanded: false,
        children: group.children.filter((child) => this.hasAny(child.permissions)),
      }));
  }

  private redirectToFirstAllowedIfNeeded(): void {
    const current = this.router.url;

    if (current === '/dashboard' || current === '/dashboard/') {
      const first = this.sidebarItems?.[0]?.children?.[0];
      if (first) this.router.navigate([first.url]);
    }
  }
}
