import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-auth-input',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="field">
      <label class="field__label" [for]="id">{{ label }}</label>
      <div class="field__control" [class.field__control--invalid]="showError()">
        @if (prefix) {
          <span class="field__prefix" aria-hidden="true">{{ prefix }}</span>
        }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [autocomplete]="autocomplete"
          [attr.inputmode]="inputmode"
          [formControl]="control"
          class="field__input"
          [attr.aria-invalid]="showError()"
          [attr.aria-describedby]="errorId"
        />
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
      display: flex;
      align-items: center;
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
    .field__prefix {
      padding-left: 1rem;
      font-size: var(--text-base);
      color: var(--color-text-secondary);
      white-space: nowrap;
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
    .field__error {
      font-size: var(--text-xs);
      font-style: italic;
      color: var(--color-red);
      margin-top: 0.375rem;
    }
  `,
})
export class AuthInputComponent {
  @Input() control = new FormControl<string>('', { nonNullable: true });
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() autocomplete = '';
  @Input() inputmode = '';
  @Input() prefix = '';
  @Input() id = `auth-input-${Math.random().toString(36).slice(2, 9)}`;
  @Input() requiredMessage = 'Veuillez renseigner ce champ.';
  @Input() emailMessage = 'Adresse email invalide.';

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
    if (this.control.hasError('email')) {
      return this.emailMessage;
    }
    if (this.control.hasError('pattern')) {
      return 'Numéro de téléphone invalide.';
    }
    if (this.control.hasError('minlength')) {
      const required = this.control.errors?.['minlength']?.requiredLength;
      return `Minimum ${required} caractères.`;
    }
    return '';
  }
}