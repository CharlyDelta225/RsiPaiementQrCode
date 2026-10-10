import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { PasswordInputComponent } from '../../../../shared/components/password-input/password-input';
import { PrimaryButtonComponent } from '../../../../shared/components/primary-button/primary-button';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppIconComponent, PasswordInputComponent, PrimaryButtonComponent],
  templateUrl: './password.page.html',
  styleUrl: './password.page.scss',
})
export class PasswordPage {
  private readonly authService = inject(AuthService);

  protected readonly form = new FormGroup(
    {
      currentPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: passwordsMatch },
  );
  protected readonly saving = signal(false);
  protected readonly message = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected save(): void {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.form.getRawValue();
    this.saving.set(true);
    this.authService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.saving.set(false);
        this.form.reset();
        this.message.set('Votre mot de passe a été modifié.');
      },
      error: (error: Error) => {
        this.saving.set(false);
        this.error.set(error.message);
      },
    });
  }
}
