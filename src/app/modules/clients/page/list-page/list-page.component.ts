import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';

import { ClientsService } from '../../services/clients.service';
import { ClientDTO, GetClientsRequest } from '../../../interfaces/client.interface';
import { ConfirmationDialogComponent } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-list-page',
  standalone: false,
  templateUrl: './list-page.component.html'
})
export class ListPageComponent {
  public displayedColumns: string[] = [
    'clientId',
    'fullName',
    'identificationNumber',
    'email',
    'phoneNumber',
    'status',
    'actions',
  ];

  public dataSource = new MatTableDataSource<ClientDTO>();
  public isLoading = false;

  public filterForm!: FormGroup;

  public filters: GetClientsRequest = { name: null, email: null, identificationNumber: null };

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientsService: ClientsService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      name: [null],
      email: [null],
      identificationNumber: [null],
    });

    this.loadClients();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClients(): void {
    this.isLoading = true;

    this.clientsService.allClients(this.filters).subscribe({
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
      name: raw.name?.trim() || null,
      email: raw.email?.trim()?.toLowerCase() || null,
      identificationNumber: raw.identificationNumber?.trim() || null,
    };

    this.loadClients();
  }

  clearFilters(): void {
    this.filterForm.reset({
      name: null,
      email: null,
      identificationNumber: null,
    });

    this.filters = { name: null, email: null, identificationNumber: null };
    this.loadClients();
  }

  goNew(): void {
    this.router.navigate(['/dashboard/clients/list/new']);
  }

  editClient(client: ClientDTO): void {
    this.router.navigate(['/dashboard/clients/list/upd'], { state: { client } });
  }

  openDeleteDialog(client: ClientDTO): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '420px',
      data: {
        title: 'Eliminar cliente',
        message: `¿Seguro que deseas eliminar al cliente "${client.fullName}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    dialogRef.afterClosed().subscribe((ok: boolean) => {
      if (ok === true) {
        this.deleteClient(client.clientId);
      }
    });
  }

  private deleteClient(clientId: number): void {
    this.isLoading = true;

    this.clientsService.deleteClient(clientId).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.error) {
          this.snackBar.open(res.error.message ?? 'No se pudo eliminar el cliente.', 'Cerrar', { duration: 3500 });
          return;
        }

        const msg = res?.result?.msg ?? 'Cliente eliminado correctamente.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });

        this.loadClients();
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'No se pudo eliminar el cliente.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }
}
