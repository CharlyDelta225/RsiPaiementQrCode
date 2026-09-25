import { Component, input, output } from '@angular/core';

export type ButtonVariant = 'primary' | 'light' | 'outline';

@Component({
  selector: 'app-primary-button',
  standalone: true,
  template: `
    <button
      class="btn btn--{{ variant() }}"
      [type]="type()"
      [disabled]="disabled() || loading()"
      (click)="onClick()"
    >
      @if (loading()) {
        <span class="btn__spinner" aria-hidden="true"></span>
      } @else {
        <ng-content />
      }
    </button>
  `,
  styles: `
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      height: 52px;
      padding: 0 1.5rem;
      border-radius: 26px;
      font-weight: 700;
      font-size: var(--text-base);
      line-height: 1.2;
      border: 2px solid transparent;
      transition: background 0.2s, color 0.2s, opacity 0.2s, border-color 0.2s,
        box-shadow 0.2s, transform 0.05s;
    }

    .btn:active:not(:disabled) {
      transform: translateY(1px);
    }

    .btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    .btn--primary {
      background: linear-gradient(
        180deg,
        var(--color-bordeaux-light) 0%,
        var(--color-bordeaux-deep) 100%
      );
      color: var(--color-papier);
      box-shadow: 0 4px 12px var(--color-bordeaux-deep-25);
    }
    .btn--primary:hover:not(:disabled) {
      background: linear-gradient(
        180deg,
        var(--color-bordeaux) 0%,
        var(--color-bordeaux-deep) 100%
      );
    }

    .btn--light {
      background: var(--color-papier);
      color: var(--color-bordeaux-deep);
      box-shadow: 0 2px 8px var(--color-bordeaux-deep-12);
    }
    .btn--light:hover:not(:disabled) {
      background: var(--color-creme);
    }

    .btn--outline {
      background: transparent;
      color: var(--color-bordeaux);
      border-color: var(--color-or);
    }
    .btn--outline:hover:not(:disabled) {
      border-color: var(--color-bordeaux);
      background: var(--color-creme);
    }

    .btn--primary:focus-visible,
    .btn--light:focus-visible,
    .btn--outline:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
    }

    .btn__spinner {
      width: 1.1rem;
      height: 1.1rem;
      border: 2.5px solid var(--color-blanc-40);
      border-top-color: var(--color-papier);
      border-radius: 50%;
      animation: btn-spin 0.7s linear infinite;
    }

    @keyframes btn-spin {
      to { transform: rotate(360deg); }
    }

    @media (prefers-reduced-motion: reduce) {
      .btn__spinner { animation-duration: 1.5s; }
    }
  `,
})
export class PrimaryButtonComponent {
  readonly type = input<'button' | 'submit'>('button');
  readonly variant = input<ButtonVariant>('primary');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly clicked = output<void>();

  onClick(): void {
    if (!this.disabled() && !this.loading()) {
      this.clicked.emit();
    }
  }
}