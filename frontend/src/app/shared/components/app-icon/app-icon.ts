import { Component, Input } from '@angular/core';
import { ICON_PATHS, IconName } from './icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="currentColor"
      [attr.aria-label]="label"
      [attr.role]="label ? 'img' : null"
      [attr.aria-hidden]="label ? null : 'true'"
      focusable="false"
    >
      <path [attr.d]="path" />
    </svg>
  `,
  styles: [
    `
      :host {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        line-height: 0;
      }
      svg {
        display: block;
      }
    `,
  ],
})
export class AppIconComponent {
  @Input() name!: IconName;
  @Input() size: number = 24;
  @Input() label?: string;

  get path(): string {
    return ICON_PATHS[this.name] ?? '';
  }
}