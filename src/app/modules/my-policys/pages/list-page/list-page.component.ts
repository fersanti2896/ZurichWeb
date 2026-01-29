import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngxs/store';

import { PolicyDTO } from '../../../interfaces/policy.interface';
import { AuthState } from '../../../../shared/state/auth.state';
import { MyPolicysService } from '../../services/my-policys.service';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-my-policys-list-page',
  standalone: false,
  templateUrl: './list-page.component.html',
})
export class ListPageComponent {
  public displayedColumns: string[] = [
    'policyId',
    'policyName',
    'statusName',
    'startDate',
    'endDate',
    'insuredAmount',
    'actions',
  ];

  public dataSource = new MatTableDataSource<PolicyDTO>();
  public isLoading = false;
  public canRequestCancel = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private policyService: MyPolicysService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private store: Store
  ) { }

  ngOnInit(): void {
    const perms = this.store.selectSnapshot(AuthState.permissions) ?? [];
    this.canRequestCancel = perms.includes('policies.self.cancel');

    this.loadMyPolicys();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMyPolicys(): void {
    this.isLoading = true;

    this.policyService.myPolicys().subscribe({
      next: (res) => {
        this.dataSource.data = res?.result ?? [];
        this.isLoading = false;
        this.dataSource.paginator?.firstPage();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'No se pudieron cargar tus pólizas.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }

  openCancelRequestDialog(p: PolicyDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Solicitar cancelación',
        message: `¿Deseas solicitar la cancelación de la póliza #${p.policyId}?`,
        confirmText: 'Solicitar',
        cancelText: 'Cancelar',
      }
    });

    dialogRef.afterClosed().subscribe((ok: boolean) => {
      if (ok === true) this.requestCancel(p.policyId);
    });
  }

  private requestCancel(policyId: number): void {
    this.isLoading = true;

    this.policyService.requestCancelPolicy(policyId).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.error) {
          this.snackBar.open(res.error.message ?? 'No se pudo solicitar la cancelación.', 'Cerrar', { duration: 3500 });
          return;
        }

        this.snackBar.open(res?.result?.msg ?? 'Solicitud enviada correctamente.', 'Cerrar', { duration: 3000 });
        this.loadMyPolicys();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'No se pudo solicitar la cancelación.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }
}
