import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Temple } from '../../../../core/models/temple.model';
import { AuthService } from '../../../../core/services/auth.service';
import { TempleService } from '../../../../core/services/temple.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';

interface ErrorMessages {
  nomComplet: Record<string, string>;
  telephone: Record<string, string>;
  email: Record<string, string>;
  templeId: Record<string, string>;
  motDePasse: Record<string, string>;
  confirmerMotDePasse: Record<string, string>;
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
  private readonly templeService = inject(TempleService);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup(
    {
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
      templeId: new FormControl<number | null>(null, {
        validators: [Validators.required],
      }),
      motDePasse: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8), Validators.maxLength(72)],
      }),
      confirmerMotDePasse: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      acceptConditions: new FormControl<boolean>(false, {
        nonNullable: true,
        validators: [Validators.requiredTrue],
      }),
    },
    { validators: passwordsMatch('motDePasse', 'confirmerMotDePasse') },
  );

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
    templeId: {
      required: 'Veuillez sélectionner votre temple.',
    },
    motDePasse: {
      required: 'Veuillez renseigner votre mot de passe.',
      minlength: 'Le mot de passe doit contenir au moins 8 caractères.',
      maxlength: 'Le mot de passe ne peut pas dépasser 72 caractères.',
    },
    confirmerMotDePasse: {
      required: 'Veuillez confirmer votre mot de passe.',
    },
    acceptConditions: {
      required: 'Vous devez accepter les conditions d’utilisation.',
    },
  };

  protected readonly temples = signal<Temple[]>([]);
  protected readonly templesLoading = signal(true);
  protected readonly templesError = signal<string | null>(null);

  protected readonly showPassword = signal(false);
  protected readonly showConfirmPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  constructor() {
    this.templeService
      .getTemples()
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: (temples) => {
          this.temples.set(temples);
          this.templesLoading.set(false);
        },
        error: (err: Error) => {
          this.templesError.set(err.message);
          this.templesLoading.set(false);
        },
      });
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected toggleConfirmPassword(): void {
    this.showConfirmPassword.update((v) => !v);
  }

  protected get passwordsMismatch(): boolean {
    return this.form.hasError('passwordsMismatch') && (this.form.touched || this.form.dirty);
  }

  protected onBack(): void {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/welcome']);
    }
  }

  protected getFieldError(field: keyof ErrorMessages): string | null {
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

    const { nomComplet, telephone, email, templeId, motDePasse } = this.form.getRawValue();
    if (templeId === null) {
      this.loading.set(false);
      return;
    }

    this.authService
      .register({
        fullName: nomComplet,
        phone: telephone,
        email,
        password: motDePasse,
        templeId,
      })
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

function passwordsMatch(passwordKey: string, confirmKey: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordKey)?.value as string | undefined;
    const confirm = group.get(confirmKey)?.value as string | undefined;
    if (!password || !confirm) {
      return null;
    }
    return password === confirm ? null : { passwordsMismatch: true };
  };
}
