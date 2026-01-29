import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { ValidatorsService } from '../../../shared/services/validators.service';
import { LoginRequest } from '../../interfaces/auth.interface';

@Component({
  selector: 'auth-login-page',
  standalone: false,
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  public loginForm!: FormGroup;
  public showTooltip: boolean = false;
  public isLoading: boolean = false;
  public hidePassword: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private validatorsService: ValidatorsService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: [ '', [ Validators.required, Validators.email, Validators.pattern(this.validatorsService.emailPattern) ] ],
      password: [ '', [ Validators.required ] ],
    });
  }

  isValidField = ( field: string ) => {
    return this.validatorsService.isValidField( this.loginForm, field );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();

      return;
    }

    const { email, password } = this.loginForm.value;

    const loginRequest: LoginRequest = {
      email,
      password
    }

    this.isLoading = true;

    this.authService.login( loginRequest ).subscribe({
      next: (response) => {
        if(response.result) {
          localStorage.setItem('refresh_token', response.result.refreshToken);
          
          this.router.navigate(['/dashboard']);

          console.log(response)

          setTimeout(() => {
            this.isLoading = false;
          }, 300);
        }
        
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Usuario o Contraseña incorrectos.', 'Cerrar', { duration: 3000 });
        this.loginForm.reset();
      }
    });
  }

  toggleTooltip(): void {
    this.showTooltip = !this.showTooltip;
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }
}
