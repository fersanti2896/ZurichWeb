import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ClientDTO, UpdateMyProfileRequest } from '../../../interfaces/client.interface';
import { ClientsService } from '../../../clients/services/clients.service';
import { ProfileService } from '../../services/profile.service';
import { ValidatorsService } from '../../../../shared/services/validators.service';

@Component({
  selector: 'app-edit-profile',
  standalone: false,
  templateUrl: './edit-profile.component.html',
  styles: ``
})
export class EditProfileComponent {
  public colonies: Array<{ id_asenta_cpcons: string; d_asenta: string }> = [];
  public displayMunicipality: string | null = null;
  public displayState: string | null = null;
  public form!: FormGroup;
  public isLoading = false;

  constructor(
    private dialogRef: MatDialogRef<EditProfileComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { client: ClientDTO },

    private fb: FormBuilder,
    private clientsService: ClientsService,
    private profileService: ProfileService,
    private validatorsService: ValidatorsService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    const c = this.data.client;

    this.form = this.fb.group({
      phone: [c.phoneNumber ?? '', [Validators.required, Validators.pattern(this.validatorsService.phonePatter)]],
      cve_CodigoPostal: [c.cve_CodigoPostal ?? '', [Validators.required, Validators.pattern(this.validatorsService.zipCodePatter)]],
      cve_Estado: [c.cve_Estado ?? '', [Validators.required]],
      cve_Municipio: [c.cve_Municipio ?? '', [Validators.required]],
      cve_Colonia: [c.cve_Colonia ?? '', [Validators.required]],

      street: [c.street ?? '', [Validators.required]],
      extNbr: [c.extNbr ?? '', [Validators.required]],
      innerNbr: [c.innerNbr ?? ''],
    });

    const cp = (c.cve_CodigoPostal ?? '').toString();
    if (cp.length === 5) {
      this.loadCpData(cp, c.cve_Colonia);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onZipCodeInput(): void {
    const cp = (this.form.get('cve_CodigoPostal')?.value ?? '').toString().trim();
    if (cp.length === 5) {
      this.loadCpData(cp, null);
    } else {
      this.displayState = null;
      this.displayMunicipality = null;
      this.colonies = [];
      this.form.patchValue({
        cve_Estado: '',
        cve_Municipio: '',
        cve_Colonia: ''
      }, { emitEvent: false });
    }
  }

  private loadCpData(cp: string, coloniaToSelect: string | null): void {
    this.isLoading = true;

    this.clientsService.getCP({ postalCode: cp }).subscribe({
      next: (res) => {
        const result: any = res?.result;
        if (!result) {
          this.isLoading = false;
          this.snackBar.open('No se encontró información para el Código Postal.', 'Cerrar', { duration: 3000 });
          return;
        }

        this.displayState = result.d_estado ?? null;
        this.displayMunicipality = result.d_mnpio ?? null;

        this.form.patchValue({
          cve_Estado: result.c_estado ?? '',
          cve_Municipio: result.c_mnpio ?? '',
        }, { emitEvent: false });

        // Colonias
        this.colonies = (result.neighborhoods ?? []).map((n: any) => ({
          id_asenta_cpcons: (n.id_asenta_cpcons ?? '').toString(),
          d_asenta: (n.d_asenta ?? '').toString(),
        }));

        // colonia default
        const wanted = (coloniaToSelect ?? this.form.get('cve_Colonia')?.value ?? '').toString();
        const exists = this.colonies.some(x => x.id_asenta_cpcons === wanted);

        this.form.patchValue({
          cve_Colonia: exists ? wanted : (this.colonies[0]?.id_asenta_cpcons ?? '')
        }, { emitEvent: false });

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error al consultar el Código Postal.', 'Cerrar', { duration: 3000 });
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.value;

    const request: UpdateMyProfileRequest = {
      phone: (v.phone ?? '').toString().trim(),
      cve_CodigoPostal: (v.cve_CodigoPostal ?? '').toString().trim(),
      cve_Estado: (v.cve_Estado ?? '').toString().trim(),
      cve_Municipio: (v.cve_Municipio ?? '').toString().trim(),
      cve_Colonia: (v.cve_Colonia ?? '').toString().trim(),
      street: (v.street ?? '').toString().trim(),
      extNbr: (v.extNbr ?? '').toString().trim(),
      innerNbr: (v.innerNbr ?? '').toString().trim() || null,
    };

    this.isLoading = true;

    this.profileService.updateMyProfile(request).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res?.error) {
          this.snackBar.open(res.error.message ?? 'No se pudo actualizar la información.', 'Cerrar', { duration: 3500 });
          return;
        }

        this.snackBar.open(res?.result?.msg ?? 'Información actualizada correctamente.', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.isLoading = false;
        const msg = err?.error?.error?.message ?? 'No se pudo actualizar la información.';
        this.snackBar.open(msg, 'Cerrar', { duration: 3500 });
      }
    });
  }

  invalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }
}
