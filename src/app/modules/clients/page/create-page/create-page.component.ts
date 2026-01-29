import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map, Observable, startWith } from 'rxjs';

import { ClientsService } from '../../services/clients.service';
import { ValidatorsService } from '../../../../shared/services/validators.service';

import { CreateClientRequest, UpdateClientRequest } from '../../../interfaces/client.interface';
import { CPRequest, Municipality, States, Town, TownRequest } from '../../../interfaces/catalogs.interface';

@Component({
  selector: 'app-create-page',
  standalone: false,
  templateUrl: './create-page.component.html'
})
export class CreatePageComponent implements OnInit {
  public isLoading = false;
  public clientForm!: FormGroup;

  public states: States[] = [];
  public municipalitys: Municipality[] = [];
  public towns: Town[] = [];

  public stateControl = new FormControl<States | null>(null);
  public filteredStates!: Observable<States[]>;

  public municipalityControl = new FormControl<Municipality | null>(null);
  public filteredMunicipality!: Observable<Municipality[]>;

  public coloniaControl = new FormControl<Town | null>(null);
  public filteredColonia!: Observable<Town[]>;

  public isEditMode = false;
  private editClient: any = null;

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private validatorsService: ValidatorsService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      mLastName: [''],

      email: ['', [Validators.required, Validators.email, Validators.pattern(this.validatorsService.emailPattern)]],
      password: [''],

      phone: ['', [Validators.required, Validators.pattern(this.validatorsService.phonePatter)]],

      cve_CodigoPostal: ['', [Validators.required, Validators.pattern(this.validatorsService.zipCodePatter)]],
      cve_Estado: ['', [Validators.required]],
      cve_Municipio: ['', [Validators.required]],
      cve_Colonia: ['', [Validators.required]],

      street: ['', [Validators.required]],
      extNbr: ['', [Validators.required]],
      innerNbr: [''],
    });

    const client = history.state['client'];
    if (client) {
      this.isEditMode = true;
      this.editClient = client;
    }

    if (!this.isEditMode) {
      this.clientForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.clientForm.get('password')?.updateValueAndValidity();
    }

    this.loadStates(() => {
      if (this.isEditMode && this.editClient) {
        this.patchClientForm(this.editClient);
      }
    });
  }

  isValidField = (field: string) => this.validatorsService.isValidField(this.clientForm, field);

  goBack(): void {
    this.router.navigate(['/dashboard/clients/list']);
  }

  private loadStates(after?: () => void): void {
    this.clientsService.getStates().subscribe({
      next: (res) => {
        this.states = res.result ?? [];

        this.filteredStates = this.stateControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const search = typeof value === 'string'
              ? value.toLowerCase()
              : (value?.d_estado ?? '').toLowerCase();

            return this.states.filter(s => (s.d_estado ?? '').toLowerCase().includes(search));
          })
        );

        after?.();
      },
      error: () => this.snackBar.open('No se pudieron cargar los estados.', 'Cerrar', { duration: 3000 })
    });
  }

  displayFn = (state: States): string => state?.d_estado ?? '';

  onStateSelected(state: States): void {
    this.clientForm.get('cve_Estado')?.setValue(state?.c_estado);
    this.stateControl.setValue(state);

    this.clientForm.get('cve_Municipio')?.reset();
    this.clientForm.get('cve_Colonia')?.reset();
    this.municipalityControl.reset();
    this.coloniaControl.reset();
    this.towns = [];
    this.municipalitys = [];

    if (state?.c_estado) this.loadMunicipality(state.c_estado);
  }

  private loadMunicipality(stateCode: string): void {
    this.isLoading = true;

    this.clientsService.getMunicipalityByState({ c_estado: stateCode }).subscribe({
      next: (res) => {
        this.municipalitys = res.result ?? [];

        this.filteredMunicipality = this.municipalityControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const search = typeof value === 'string'
              ? value.toLowerCase()
              : (value?.d_mnpio ?? '').toLowerCase();

            return this.municipalitys.filter(m => (m.d_mnpio ?? '').toLowerCase().includes(search));
          })
        );

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar los municipios.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  displayFnMun = (m: Municipality): string => m?.d_mnpio ?? '';

  onMunicipalitySelected(municipality: Municipality): void {
    this.clientForm.get('cve_Municipio')?.setValue(municipality?.c_mnpio);
    this.municipalityControl.setValue(municipality);

    this.clientForm.get('cve_Colonia')?.reset();
    this.coloniaControl.reset();
    this.towns = [];

    const stateCode = this.clientForm.get('cve_Estado')?.value;
    if (stateCode && municipality?.c_mnpio) this.loadTowns(stateCode, municipality.c_mnpio);
  }

  private loadTowns(stateCode: string, municipalityCode: string): void {
    const data: TownRequest = { c_estado: stateCode, c_mnpio: municipalityCode };
    this.isLoading = true;

    this.clientsService.getTownByStateAndMunicipality(data).subscribe({
      next: (res) => {
        this.towns = res.result ?? [];

        this.filteredColonia = this.coloniaControl.valueChanges.pipe(
          startWith(''),
          map(value => {
            const search = typeof value === 'string'
              ? value.toLowerCase()
              : (value?.d_asenta ?? '').toLowerCase();

            return this.towns.filter(t => (t.d_asenta ?? '').toLowerCase().includes(search));
          })
        );

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('No se pudieron cargar las colonias.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  displayFnCol = (t: Town): string => t?.d_asenta ?? '';

  onColoniaSelected(colonia: Town): void {
    this.clientForm.get('cve_Colonia')?.setValue(colonia?.id_asenta_cpcons);
    this.coloniaControl.setValue(colonia);
  }

  onZipCodeInput(): void {
    const zipCode = this.clientForm.get('cve_CodigoPostal')?.value;
    if (zipCode && zipCode.length === 5) this.getCP(zipCode);
  }

  private getCP(zipCode: string): void {
    const data: CPRequest = { postalCode: zipCode };

    this.isLoading = true;

    this.clientsService.getCP(data).subscribe({
      next: (res) => {
        const result = res?.result;
        if (!result) {
          this.isLoading = false;
          this.snackBar.open('No se encontró información para el Código Postal.', 'Cerrar', { duration: 3000 });
          return;
        }

        const estadoObj = this.states.find(s => s.c_estado === result.c_estado);
        if (estadoObj) {
          this.stateControl.setValue(estadoObj, { emitEvent: false });
          this.clientForm.get('cve_Estado')?.setValue(estadoObj.c_estado, { emitEvent: false });
        }

        this.clientsService.getMunicipalityByState({ c_estado: result.c_estado }).subscribe({
          next: (munRes) => {
            this.municipalitys = munRes.result ?? [];

            this.filteredMunicipality = this.municipalityControl.valueChanges.pipe(
              startWith(''),
              map(value => {
                const search = typeof value === 'string'
                  ? value.toLowerCase()
                  : (value?.d_mnpio ?? '').toLowerCase();
                return this.municipalitys.filter(m => (m.d_mnpio ?? '').toLowerCase().includes(search));
              })
            );

            const municipioObj = this.municipalitys.find(m => m.c_mnpio === result.c_mnpio);
            if (municipioObj) {
              this.municipalityControl.setValue(municipioObj, { emitEvent: false });
              this.clientForm.get('cve_Municipio')?.setValue(municipioObj.c_mnpio, { emitEvent: false });
            }

            const townReq: TownRequest = { c_estado: result.c_estado, c_mnpio: result.c_mnpio };
            this.clientsService.getTownByStateAndMunicipality(townReq).subscribe({
              next: (townRes) => {
                this.towns = townRes.result ?? [];

                this.filteredColonia = this.coloniaControl.valueChanges.pipe(
                  startWith(''),
                  map(value => {
                    const search = typeof value === 'string'
                      ? value.toLowerCase()
                      : (value?.d_asenta ?? '').toLowerCase();
                    return this.towns.filter(t => (t.d_asenta ?? '').toLowerCase().includes(search));
                  })
                );

                const firstTown = result.neighborhoods?.[0];
                if (firstTown) {
                  this.clientForm.get('cve_Colonia')?.setValue(firstTown.id_asenta_cpcons, { emitEvent: false });

                  const coloniaObj = this.towns.find(t => t.id_asenta_cpcons === firstTown.id_asenta_cpcons);
                  if (coloniaObj) this.coloniaControl.setValue(coloniaObj, { emitEvent: false });
                }

                this.isLoading = false;
              },
              error: () => {
                this.isLoading = false;
                this.snackBar.open('Error al cargar colonias.', 'Cerrar', { duration: 3000 });
              }
            });
          },
          error: () => {
            this.isLoading = false;
            this.snackBar.open('Error al cargar municipios.', 'Cerrar', { duration: 3000 });
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Ocurrió un error al buscar el código postal.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  private parseFullName(fullName: string): { firstName: string; lastName: string; mLastName: string } {
    const clean = (fullName ?? '').trim().replace(/\s+/g, ' ');
    if (!clean) return { firstName: '', lastName: '', mLastName: '' };

    const parts = clean.split(' ');
    if (parts.length === 1) return { firstName: parts[0], lastName: '', mLastName: '' };
    if (parts.length === 2) return { firstName: parts[0], lastName: parts[1], mLastName: '' };

    const mLastName = parts.pop()!;
    const lastName = parts.pop()!;
    const firstName = parts.join(' ');
    return { firstName, lastName, mLastName };
  }

  private async patchClientForm(client: any): Promise<void> {
    const nameParts = (!client?.firstName && !client?.lastName && client?.fullName)
      ? this.parseFullName(client.fullName)
      : {
          firstName: client?.firstName ?? '',
          lastName: client?.lastName ?? '',
          mLastName: client?.mLastName ?? ''
        };

    this.clientForm.patchValue({
      firstName: nameParts.firstName,
      lastName: nameParts.lastName,
      mLastName: nameParts.mLastName,

      email: client?.email ?? '',
      phone: client?.phone ?? client?.phoneNumber ?? '',

      cve_CodigoPostal: client?.cve_CodigoPostal ?? client?.cve_CodigoPostal ?? '',
      cve_Estado: client?.cve_Estado ?? '',
      cve_Municipio: client?.cve_Municipio ?? '',
      cve_Colonia: client?.cve_Colonia ?? '',

      street: client?.street ?? '',
      extNbr: client?.extNbr ?? '',
      innerNbr: client?.innerNbr ?? '',
    });

    // Estado
    const cveEstado = client?.cve_Estado ?? null;
    if (!cveEstado) return;

    const estadoObj = this.states.find(s => s.c_estado === cveEstado);
    if (estadoObj) this.stateControl.setValue(estadoObj, { emitEvent: false });

    // Municipios
    await new Promise<void>((resolve) => {
      this.clientsService.getMunicipalityByState({ c_estado: cveEstado }).subscribe({
        next: (res) => {
          this.municipalitys = res.result ?? [];

          this.filteredMunicipality = this.municipalityControl.valueChanges.pipe(
            startWith(''),
            map(value => {
              const search = typeof value === 'string'
                ? value.toLowerCase()
                : (value?.d_mnpio ?? '').toLowerCase();
              return this.municipalitys.filter(m => (m.d_mnpio ?? '').toLowerCase().includes(search));
            })
          );

          const cveMunicipio = client?.cve_Municipio ?? null;
          const municipioObj = this.municipalitys.find(m => m.c_mnpio === cveMunicipio);
          if (municipioObj) this.municipalityControl.setValue(municipioObj, { emitEvent: false });

          resolve();
        },
        error: () => resolve(),
      });
    });

    // Colonias
    const cveMunicipio = client?.cve_Municipio ?? null;
    if (!cveMunicipio) return;

    await new Promise<void>((resolve) => {
      const req: TownRequest = { c_estado: cveEstado, c_mnpio: cveMunicipio };
      this.clientsService.getTownByStateAndMunicipality(req).subscribe({
        next: (res) => {
          this.towns = res.result ?? [];

          this.filteredColonia = this.coloniaControl.valueChanges.pipe(
            startWith(''),
            map(value => {
              const search = typeof value === 'string'
                ? value.toLowerCase()
                : (value?.d_asenta ?? '').toLowerCase();
              return this.towns.filter(t => (t.d_asenta ?? '').toLowerCase().includes(search));
            })
          );

          const cveColonia = client?.cve_Colonia ?? null;
          const coloniaObj = this.towns.find(t => t.id_asenta_cpcons === cveColonia);
          if (coloniaObj) this.coloniaControl.setValue(coloniaObj, { emitEvent: false });

          resolve();
        },
        error: () => resolve(),
      });
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const v = this.clientForm.value;

    if (!this.isEditMode) {
      const request: CreateClientRequest = {
        firstName: (v.firstName ?? '').trim(),
        lastName: (v.lastName ?? '').trim(),
        mLastName: (v.mLastName ?? '').trim() || null,
        email: (v.email ?? '').trim().toLowerCase(),
        password: v.password,
        phone: (v.phone ?? '').trim(),
        cve_CodigoPostal: (v.cve_CodigoPostal ?? '').trim(),
        cve_Estado: v.cve_Estado,
        cve_Municipio: v.cve_Municipio,
        cve_Colonia: v.cve_Colonia,
        street: (v.street ?? '').trim(),
        extNbr: (v.extNbr ?? '').trim(),
        innerNbr: (v.innerNbr ?? '').trim() || null,
      };

      this.isLoading = true;

      this.clientsService.createClient(request).subscribe({
        next: (res) => {
          this.isLoading = false;
          if (res?.error) {
            this.snackBar.open(res.error.message ?? 'Error al crear cliente.', 'Cerrar', { duration: 3000 });
            return;
          }
          this.snackBar.open('Cliente creado correctamente.', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard/clients/list']);
        },
        error: (err) => {
          this.isLoading = false;
          const msg = err?.error?.error?.message ?? 'Error al crear cliente.';
          this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
        }
      });

      return;
    }

    // UPDATE
    const updateRequest: UpdateClientRequest = {
      clientId: this.editClient?.clientId,
      firstName: (v.firstName ?? '').trim(),
      lastName: (v.lastName ?? '').trim(),
      mLastName: (v.mLastName ?? '').trim() || null,
      password: (v.password ?? '').toString().trim() ? (v.password ?? '').toString().trim() : null,

      phone: (v.phone ?? '').trim(),
      cve_CodigoPostal: (v.cve_CodigoPostal ?? '').trim(),
      cve_Estado: v.cve_Estado,
      cve_Municipio: v.cve_Municipio,
      cve_Colonia: v.cve_Colonia,
      street: (v.street ?? '').trim(),
      extNbr: (v.extNbr ?? '').trim(),
      innerNbr: (v.innerNbr ?? '').trim() || null,
    };

    if (!updateRequest.clientId || updateRequest.clientId <= 0) {
      this.snackBar.open('ClientId inválido para actualizar.', 'Cerrar', { duration: 3000 });
      return;
    }

    this.isLoading = true;

    this.clientsService.updateClient(updateRequest).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.error) {
          this.snackBar.open(res.error.message ?? 'Error al actualizar cliente.', 'Cerrar', { duration: 3000 });
          return;
        }
        this.snackBar.open('Cliente actualizado correctamente.', 'Cerrar', { duration: 3000 });
        this.router.navigate(['/dashboard/clients/list']);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'Error al actualizar cliente.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3000 });
      }
    });
  }
}
