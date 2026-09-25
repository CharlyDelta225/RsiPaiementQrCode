import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AppIconComponent } from '../app-icon/app-icon';
import { IconName } from '../app-icon/icons';

export type QuickActionTone = 'primary' | 'success' | 'info';

@Component({
  selector: 'app-quick-action',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  template: `
    <a class="action" [routerLink]="route()">
      <span class="action__icon" [class]="'action__icon--' + tone()">
        <app-icon [name]="icon()" [size]="22" />
      </span>
      <span class="action__label">{{ label() }}</span>
    </a>
  `,
  styles: `
    .action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: var(--color-text);
      min-width: 0;
    }
    .action__icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .action:hover .action__icon {
      transform: translateY(-2px);
      box-shadow: var(--shadow-soft);
    }
    .action__icon--primary {
      background: var(--color-bordeaux);
      color: var(--color-papier);
      box-shadow: 0 4px 12px var(--color-bordeaux-30);
    }
    .action__icon--success {
      background: var(--color-success-soft);
      color: var(--color-success);
    }
    .action__icon--info {
      background: var(--color-primary-soft);
      color: var(--color-primary);
    }
    .action__label {
      font-size: 0.6875rem;
      font-weight: 600;
      text-align: center;
      line-height: 1.25;
    }
  `,
})
export class QuickActionComponent {
  readonly icon = input<IconName>('check');
  readonly label = input('');
  readonly route = input('/member/contribution');
  readonly tone = input<QuickActionTone>('primary');
}