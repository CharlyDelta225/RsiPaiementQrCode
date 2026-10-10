import { Component, HostListener, input, output, signal } from '@angular/core';
import { AppIconComponent } from '../app-icon/app-icon';

const PIN_LENGTH = 4;

/**
 * Saisie d'un code à 4 chiffres : points de progression + pavé numérique.
 * Émet `completed` au 4e chiffre. Le parent appelle `reset()` / `fail()`.
 */
@Component({
  selector: 'app-pin-pad',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <div class="pin" [class.pin--shake]="shaking()">
      <div
        class="pin__dots"
        role="img"
        [attr.aria-label]="digits().length + ' chiffre(s) saisi(s) sur 4'"
      >
        @for (i of slots; track i) {
          <span class="pin__dot" [class.pin__dot--filled]="i < digits().length"></span>
        }
      </div>

      <div class="pin__pad" role="group" aria-label="Clavier numérique">
        @for (key of keys; track key) {
          <button type="button" class="pin__key" [disabled]="disabled()" (click)="press(key)">
            {{ key }}
          </button>
        }
        <span class="pin__spacer" aria-hidden="true"></span>
        <button type="button" class="pin__key" [disabled]="disabled()" (click)="press('0')">0</button>
        <button
          type="button"
          class="pin__key pin__key--erase"
          aria-label="Effacer le dernier chiffre"
          [disabled]="disabled() || digits().length === 0"
          (click)="erase()"
        >
          <app-icon name="arrow-back" [size]="22" />
        </button>
      </div>
    </div>
  `,
  styles: `
    .pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2rem;
    }
    .pin__dots {
      display: flex;
      gap: 1.25rem;
    }
    .pin__dot {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid var(--color-or);
      transition: background 0.15s, transform 0.15s;
    }
    .pin__dot--filled {
      background: var(--color-or);
      transform: scale(1.1);
    }
    .pin__pad {
      display: grid;
      grid-template-columns: repeat(3, 72px);
      gap: 1rem 1.5rem;
    }
    .pin__key {
      width: 72px;
      height: 72px;
      border: 0;
      border-radius: 50%;
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--color-papier);
      background: var(--color-blanc-12);
      transition: background 0.15s, transform 0.08s;
      -webkit-tap-highlight-color: transparent;
    }
    .pin__key:active:not(:disabled) {
      background: var(--color-blanc-30);
      transform: scale(0.94);
    }
    .pin__key:disabled {
      opacity: 0.4;
    }
    .pin__key:focus-visible {
      outline: 3px solid var(--color-or-60);
      outline-offset: 2px;
    }
    .pin__key--erase {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: transparent;
    }
    .pin--shake {
      animation: pin-shake 0.4s;
    }
    @keyframes pin-shake {
      20%, 60% { transform: translateX(-10px); }
      40%, 80% { transform: translateX(10px); }
    }
    @media (prefers-reduced-motion: reduce) {
      .pin--shake { animation: none; }
      .pin__key, .pin__dot { transition: none; }
    }
  `,
})
export class PinPadComponent {
  readonly disabled = input(false);
  readonly completed = output<string>();

  protected readonly slots = Array.from({ length: PIN_LENGTH }, (_, i) => i);
  protected readonly keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  protected readonly digits = signal('');
  protected readonly shaking = signal(false);

  /** Saisie au clavier physique (ordinateur, clavier Bluetooth). */
  @HostListener('document:keydown', ['$event'])
  protected onKey(event: KeyboardEvent): void {
    if (this.disabled()) {
      return;
    }
    if (/^[0-9]$/.test(event.key)) {
      this.press(event.key);
    } else if (event.key === 'Backspace') {
      this.erase();
    }
  }

  protected press(key: string): void {
    if (this.digits().length >= PIN_LENGTH) {
      return;
    }
    const next = this.digits() + key;
    this.digits.set(next);
    if (next.length === PIN_LENGTH) {
      this.completed.emit(next);
    }
  }

  protected erase(): void {
    this.digits.update((value) => value.slice(0, -1));
  }

  reset(): void {
    this.digits.set('');
  }

  /** Code refusé : vibration + effacement. */
  fail(): void {
    this.shaking.set(true);
    if ('vibrate' in navigator) {
      navigator.vibrate?.(150);
    }
    setTimeout(() => {
      this.shaking.set(false);
      this.reset();
    }, 400);
  }
}
