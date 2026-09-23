import { Component, Input, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppIconComponent } from '../app-icon/app-icon';

@Component({
  selector: 'app-password-input',
  standalone: true,
  imports: [ReactiveFormsModule, AppIconComponent],
  template: `
    <div class="field">
      <label class="field__label" [for]="id">Mot de passe</label>
      <div class="field__control" [class.field__control--invalid]="showError()">
        <div class="field__wrapper">
          <input
            [id]="id"
            [type]="showPassword() ? 'text' : 'password'"
            [placeholder]="placeholder"
            [autocomplete]="autocomplete"
            [formControl]="control"
            class="field__input"
            [attr.aria-invalid]="showError()"
            [attr.aria-describedby]="errorId"
          />
          <button
            type="button"
            class="field__toggle"
            (click)="togglePassword()"
            [attr.aria-label]="showPassword() ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
          >
            <app-icon [name]="showPassword() ? 'eye-off' : 'eye'" [size]="20" />
          </button>
        </div>
      </div>
      @if (showError()) {
        <p class="field__error" [id]="errorId" role="alert">
          {{ getErrorMessage() }}
        </p>
      }
    </div>
  `,
  styles: `
    .field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      text-align: left;
    }
    .field__label {
      font-size: var(--text-sm);
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: 0.125rem;
    }
    .field__control {
      border: 1px solid var(--color-border);
      border-radius: 14px;
      background: var(--color-white);
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .field__control:focus-within {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 3px var(--color-primary-soft);
    }
    .field__control--invalid {
      border-color: var(--color-red);
    }
    .field__wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-right: 0.5rem;
    }
    .field__input {
      flex: 1;
      min-width: 0;
      height: 52px;
      padding: 0 1rem;
      border: 0;
      border-radius: inherit;
      background: transparent;
      color: var(--color-text);
      outline: none;
    }
    .field__toggle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      background: transparent;
      color: var(--color-text-secondary);
      padding: 0.25rem;
      border-radius: 0.375rem;
    }
    .field__toggle:hover {
      color: var(--color-primary);
    }
    .field__error {
      font-size: var(--text-xs);
      font-style: italic;
      color: var(--color-red);
      margin-top: 0.375rem;
    }
  `,
})
export class PasswordInputComponent {
  @Input() control = new FormControl<string>('');
  @Input() placeholder = 'Votre mot de passe';
  @Input() autocomplete = 'current-password';
  @Input() id = `password-input-${Math.random().toString(36).slice(2, 9)}`;
  @Input() requiredMessage = 'Veuillez renseigner votre mot de passe.';
  @Input() minLengthMessage = 'Le mot de passe doit contenir au moins 6 caractères.';

  protected readonly showPassword = signal(false);

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected get errorId(): string {
    return `${this.id}-error`;
  }

  protected showError(): boolean {
    return this.control.invalid && (this.control.touched || this.control.dirty);
  }

  protected getErrorMessage(): string {
    if (this.control.hasError('required')) {
      return this.requiredMessage;
    }
    if (this.control.hasError('minlength')) {
      return this.minLengthMessage;
    }
    return '';
  }
}