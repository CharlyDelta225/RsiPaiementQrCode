import { Component, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';

interface ErrorMessages {
  nomComplet: Record<string, string>;
  telephone: Record<string, string>;
  email: Record<string, string>;
  motDePasse: Record<string, string>;
  acceptConditions: Record<string, string>;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, AppIconComponent],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss',
})
export class RegisterPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup({
    nomComplet: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    telephone: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^\+?[0-9\s]{8,16}$/)],
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    motDePasse: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
    acceptConditions: new FormControl<boolean>(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  private readonly messages: ErrorMessages = {
    nomComplet: {
      required: 'Veuillez renseigner votre nom complet.',
      minlength: 'Le nom doit contenir au moins 2 caractères.',
    },
    telephone: {
      required: 'Veuillez renseigner votre numéro de téléphone.',
      pattern: 'Numéro de téléphone invalide.',
    },
    email: {
      required: 'Veuillez renseigner votre email.',
      email: 'Adresse email invalide.',
    },
    motDePasse: {
      required: 'Veuillez renseigner votre mot de passe.',
      minlength: 'Le mot de passe doit contenir au moins 6 caractères.',
    },
    acceptConditions: {
      required: 'Vous devez accepter les conditions d’utilisation.',
    },
  };

  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected onBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/welcome']);
    }
  }

  protected getFieldError(
    field: keyof ErrorMessages,
  ): string | null {
    const control = this.form.controls[field];
    if (!control.invalid || !(control.touched || control.dirty)) {
      return null;
    }
    for (const key of Object.keys(this.messages[field])) {
      if (control.hasError(key)) {
        return this.messages[field][key];
      }
    }
    return null;
  }

  protected onSubmit(): void {
    if (this.form.invalid || this.loading()) {
      return;
    }
    this.loading.set(true);
    this.errorMessage.set(null);

    const { nomComplet, telephone, email } = this.form.getRawValue();

    this.authService
      .register({ fullName: nomComplet, phone: telephone, email })
      .subscribe({
        next: () => {
          this.router.navigate(['/member/dashboard']);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message);
          this.loading.set(false);
        },
        complete: () => this.loading.set(false),
      });
  }
}