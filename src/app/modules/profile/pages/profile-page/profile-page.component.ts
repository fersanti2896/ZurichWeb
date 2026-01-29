import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../../services/profile.service';
import { ClientDTO } from '../../../interfaces/client.interface';
import { ClientsService } from '../../../clients/services/clients.service';
import { MatDialog } from '@angular/material/dialog';
import { EditProfileComponent } from '../../components/edit-profile/edit-profile.component';

@Component({
  selector: 'app-profile-page',
  standalone: false,
  templateUrl: './profile-page.component.html'
})
export class ProfilePageComponent implements OnInit {

  public isLoading = false;
  public client: ClientDTO | null = null;
  public displayColony: string | null = null;
  public displayMunicipality: string | null = null;
  public displayState: string | null = null;

  constructor(
    private profileService: ProfileService,
    private clientsService: ClientsService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;

    this.profileService.getMyClientProfile().subscribe({
      next: (res) => {
        this.client = res.result ?? null;

        if (!this.client) {
          this.isLoading = false;
          return;
        }

        this.resolveAddressNamesByCP(this.client);

      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openEditAddressModal(): void {
    if (!this.client) return;

    const ref = this.dialog.open(EditProfileComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { client: this.client }
    });

    ref.afterClosed().subscribe((updated: boolean) => {
      if (updated) {
        this.loadProfile();
      }
    });
  }


  private resolveAddressNamesByCP(client: ClientDTO): void {
    if (!client.cve_CodigoPostal || client.cve_CodigoPostal.length < 5) {
      this.isLoading = false;
      return;
    }

    this.clientsService.getCP({ postalCode: client.cve_CodigoPostal }).subscribe({
      next: (cpRes) => {
        const result: any = cpRes?.result;

        if (result) {
          this.displayState = result.d_estado ?? null;
          this.displayMunicipality = result.d_mnpio ?? null;

          const neighborhoods = result.neighborhoods ?? [];
          const colonyObj = neighborhoods.find((n: any) =>
            (n.id_asenta_cpcons ?? '').toString() === (client.cve_Colonia ?? '').toString()
          );

          this.displayColony = colonyObj?.d_asenta ?? null;
        }

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
