import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, startWith } from 'rxjs';

import { PolicyService } from '../../services/policy.service';
import { ClientsService } from '../../../clients/services/clients.service';

import { CreatePolicyRequest, PolicyTypesDTO } from '../../../interfaces/policy.interface';
import { ClientDTO, GetClientsRequest } from '../../../interfaces/client.interface';

@Component({
  selector: 'app-create-policy-page',
  standalone: false,
  templateUrl: './create-page.component.html'
})
export class CreatePageComponent implements OnInit {
  public clientControl = new FormControl<ClientDTO | null>(null);
  public clients: ClientDTO[] = [];
  public filteredClients!: Observable<ClientDTO[]>;
  public isLoading = false;
  public policyForm!: FormGroup;
  public policyTypes: PolicyTypesDTO[] = [];

  constructor(
    private fb: FormBuilder,
    private policyService: PolicyService,
    private clientsService: ClientsService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.policyForm = this.fb.group({
      clientId: [null, [Validators.required]],
      policyTypeId: [null, [Validators.required]],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      insuredAmount: [null, [Validators.required, Validators.min(0.01)]],
    });

    this.loadPolicyTypes();
    this.loadClients();
  }

  goBack(): void {
    this.router.navigate(['/dashboard/policies/list']);
  }

  private loadClients(): void {
    const filters: GetClientsRequest = { name: null, email: null, identificationNumber: null };

    this.clientsService.allClients(filters).subscribe({
      next: (res) => {
        this.clients = res?.result ?? [];

        this.filteredClients = this.clientControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const search = typeof value === 'string'
              ? value.toLowerCase()
              : (value?.fullName ?? '').toLowerCase();

            return this.clients.filter(c =>
              (c.fullName ?? '').toLowerCase().includes(search)
            );
          })
        );
      },
      error: () => {
        this.clients = [];
        this.snackBar.open('No se pudieron cargar los clientes.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  displayFnClient = (c: ClientDTO): string => c?.fullName ?? '';

  onClientSelected(client: ClientDTO): void {
    this.policyForm.get('clientId')?.setValue(client?.clientId);
  }

  private loadPolicyTypes(): void {
    this.policyService.getPolicyTypes().subscribe({
      next: (res) => {
        this.policyTypes = res?.result ?? [];
      },
      error: () => {
        this.policyTypes = [];
        this.snackBar.open('No se pudieron cargar los tipos de póliza.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private toIsoDateOnly(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  }

  onSubmit(): void {
    if (this.policyForm.invalid) {
      this.policyForm.markAllAsTouched();
      return;
    }

    const v = this.policyForm.value;

    if (v.startDate && v.endDate && new Date(v.endDate) < new Date(v.startDate)) {
      this.snackBar.open('La fecha fin no puede ser menor que la fecha inicio.', 'Cerrar', { duration: 3000 });
      return;
    }

    const request: CreatePolicyRequest = {
      clientId: Number(v.clientId),
      policyTypeId: Number(v.policyTypeId),
      startDate: this.toIsoDateOnly(v.startDate),
      endDate: this.toIsoDateOnly(v.endDate),
      insuredAmount: Number(v.insuredAmount),
    };

    this.isLoading = true;

    this.policyService.createPolicy(request).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.error) {
          this.snackBar.open(res.error.message ?? 'Error al crear la póliza.', 'Cerrar', { duration: 3500 });
          return;
        }

        this.snackBar.open(res?.result?.msg ?? 'Póliza creada correctamente.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard/policies/list']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'Error al crear la póliza.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }
}
