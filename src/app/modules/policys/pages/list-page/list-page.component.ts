import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { GetPolicysRequest, PolicyDTO, PolicyStatusesDTO, PolicyTypesDTO } from '../../../interfaces/policy.interface';
import { PolicyService } from '../../services/policy.service';
import { Router } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-policys-list-page',
  standalone: false,
  templateUrl: './list-page.component.html',
})
export class ListPageComponent {
  public displayedColumns: string[] = [
    'policyId',
    'fullName',
    'policyName',
    'statusName',
    'startDate',
    'endDate',
    'insuredAmount',
    'actions',
  ];

  public dataSource = new MatTableDataSource<PolicyDTO>();
  public isLoading = false;

  public filterForm!: FormGroup;
  public policyTypes: PolicyTypesDTO[] = [];
  public policyStatuses: PolicyStatusesDTO[] = [];

  public filters: GetPolicysRequest = {
    startDate: null,
    endDate: null,
    policyTypeId: null,
    policyStatusId: null,
  };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private policysService: PolicyService,
    private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      startDate: [null],
      endDate: [null],
      policyTypeId: [null],
      policyStatusId: [null],
    });

    this.loadCatalogs();
    this.loadPolicys();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  goNew(): void {
    this.router.navigate(['/dashboard/policies/list/new']);
  }

  private toIsoDateOnly(d: Date | null): string | null {
    if (!d) return null;
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  }

  private loadCatalogs(): void {
    this.policysService.getPolicyTypes().subscribe({
      next: (res) => (this.policyTypes = res?.result ?? []),
      error: () => (this.policyTypes = []),
    });

    this.policysService.getPolicyStatus().subscribe({
      next: (res) => (this.policyStatuses = res?.result ?? []),
      error: () => (this.policyStatuses = []),
    });
  }

  loadPolicys(): void {
    this.isLoading = true;

    this.policysService.allPolicys(this.filters).subscribe({
      next: (res) => {
        this.dataSource.data = res?.result ?? [];
        this.isLoading = false;
        this.dataSource.paginator?.firstPage();
      },
      error: () => (this.isLoading = false),
    });
  }

  applyFilters(): void {
    const raw = this.filterForm.value;

    this.filters = {
      startDate: this.toIsoDateOnly(raw.startDate),
      endDate: this.toIsoDateOnly(raw.endDate),
      policyTypeId: raw.policyTypeId ?? null,
      policyStatusId: raw.policyStatusId ?? null,
    };

    this.loadPolicys();
  }

  clearFilters(): void {
    this.filterForm.reset({
      startDate: null,
      endDate: null,
      policyTypeId: null,
      policyStatusId: null,
    });

    this.filters = { startDate: null, endDate: null, policyTypeId: null, policyStatusId: null };
    this.loadPolicys();
  }

  viewPolicy(p: PolicyDTO): void {
    console.log('TODO: ver póliza', p);
  }

  openApproveCancelDialog(policy: PolicyDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Aprobar cancelación',
        message: `¿Deseas aprobar la cancelación de la póliza #${policy.policyId} del cliente "${policy.fullName}"?`,
        confirmText: 'Aprobar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((ok: boolean) => {
      if (ok === true) {
        this.approveCancelPolicy(policy.policyId);
      }
    });
  }

  private approveCancelPolicy(policyId: number): void {
    this.isLoading = true;

    this.policysService.approveCancelPolicy({ policyId }).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.error) {
          this.snackBar.open(res.error.message ?? 'No se pudo aprobar la cancelación.', 'Cerrar', { duration: 3500 });
          return;
        }

        this.snackBar.open(res?.result?.msg ?? 'Cancelación aprobada correctamente.', 'Cerrar', { duration: 3000 });
        this.loadPolicys();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'No se pudo aprobar la cancelación.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }

}
