import { Component } from '@angular/core';
import { AppIconComponent } from '../app-icon/app-icon';

@Component({
  selector: 'app-notification-button',
  standalone: true,
  imports: [AppIconComponent],
  template: `
    <button class="notif" type="button" aria-label="Notifications">
      <app-icon name="bell" [size]="22" />
    </button>
  `,
  styles: `
    .notif {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 0;
      background: var(--color-blanc-18);
      color: var(--color-papier);
      transition: background 0.2s;
      position: relative;
    }
    .notif::after {
      content: '';
      position: absolute;
      top: 10px;
      right: 10px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--color-alerte);
      border: 2px solid var(--color-papier);
    }
    .notif:hover {
      background: var(--color-blanc-30);
    }
  `,
})
export class NotificationButtonComponent {}