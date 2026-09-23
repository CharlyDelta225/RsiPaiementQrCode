import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <div class="logo" [class.logo--light]="light">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="16" cy="16" r="16" fill="#1677E8" />
        <path
          d="M16 6L10 9V13L16 16L22 13V9L16 6Z"
          fill="white"
        />
        <path
          d="M10 21V25H13V21H19V25H22V21L16 17.5L10 21Z"
          fill="white"
        />
      </svg>
      <div class="logo__text" [class.logo__text--light]="light">
        <span class="logo__name">Mon Église</span>
        <span class="logo__tagline">Ensemble pour l'œuvre de Dieu</span>
      </div>
    </div>
  `,
  styles: [
    `
      .logo {
        display: inline-flex;
        align-items: center;
        gap: 0.625rem;
      }
      .logo__text {
        display: flex;
        flex-direction: column;
        line-height: 1.15;
      }
      .logo__name {
        font-size: 1.125rem;
        font-weight: 800;
        color: var(--color-text, #102a43);
      }
      .logo__tagline {
        font-size: 0.6875rem;
        color: var(--color-text-secondary, #627d98);
      }
      .logo--light .logo__name {
        color: #ffffff;
      }
      .logo--light .logo__tagline {
        color: rgba(255, 255, 255, 0.75);
      }
    `,
  ],
})
export class AppLogoComponent {
  @Input() light = false;
}