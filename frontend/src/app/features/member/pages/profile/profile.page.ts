import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { roleLabel, userInitials } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { AuthInputComponent } from '../../../../shared/components/auth-input/auth-input';
import { PrimaryButtonComponent } from '../../../../shared/components/primary-button/primary-button';

const PHONE_PATTERN = /^[+0-9 ]{8,20}$/;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AppIconComponent,
    AuthInputComponent,
    PrimaryButtonComponent,
  ],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage {
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.currentUser;
  protected readonly initials = computed(() => {
    const user = this.user();
    return user ? userInitials(user) : '';
  });
  protected readonly roleLabel = computed(() => {
    const user = this.user();
    return user ? roleLabel(user) : '';
  });

  protected readonly profileForm = new FormGroup({
    firstName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    lastName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    phone: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(PHONE_PATTERN)],
    }),
  });
  protected readonly profileSaving = signal(false);
  protected readonly profileMessage = signal<string | null>(null);
  protected readonly profileError = signal<string | null>(null);

  constructor() {
    this.resetProfileForm();
  }

  protected saveProfile(): void {
    this.profileMessage.set(null);
    this.profileError.set(null);
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.profileSaving.set(true);
    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.profileSaving.set(false);
        this.resetProfileForm();
        this.profileMessage.set('Vos informations ont été mises à jour.');
      },
      error: (error: Error) => {
        this.profileSaving.set(false);
        this.profileError.set(error.message);
      },
    });
  }

  private resetProfileForm(): void {
    const user = this.user();
    this.profileForm.reset({
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      phone: user?.phone ?? '',
    });
  }
}
