import { Component, input, output } from '@angular/core';
import { OfferingType } from '../../../../core/models/offering-type.model';

@Component({
  selector: 'app-type-card',
  standalone: true,
  template: `
    <button
      type="button"
      class="type-card"
      [class.type-card--selected]="selected()"
      [attr.aria-pressed]="selected()"
      (click)="picked.emit(type().id)"
    >
      <span class="type-card__head">
        <span class="type-card__label">{{ type().label }}</span>
        <span class="type-card__check" aria-hidden="true"></span>
      </span>
      @if (type().description) {
        <span class="type-card__description">{{ type().description }}</span>
      }
      @if (type().blessingText) {
        <span class="type-card__blessing">
          «&nbsp;{{ type().blessingText }}&nbsp;»
          @if (type().blessingRef; as ref) {
            <span class="type-card__ref">{{ ref }}</span>
          }
        </span>
      }
    </button>
  `,
  styles: `
    :host {
      display: block;
    }

    .type-card {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
      width: 100%;
      padding: 0.875rem 1rem;
      text-align: left;
      font: inherit;
      color: var(--color-encre);
      background: var(--color-papier);
      border: 1px solid var(--color-bordure);
      border-radius: var(--radius-md);
      transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
    }

    .type-card:hover {
      border-color: var(--color-or-45);
    }

    .type-card--selected {
      background: var(--color-or-soft);
      border-color: var(--color-or);
      box-shadow: 0 4px 14px var(--color-bordeaux-deep-12);
    }

    .type-card__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }

    .type-card__label {
      font-size: var(--text-base);
      font-weight: 700;
      color: var(--color-bordeaux);
    }

    .type-card__check {
      position: relative;
      flex-shrink: 0;
      width: 22px;
      height: 22px;
      border: 2px solid var(--color-bordure);
      border-radius: 50%;
    }

    .type-card--selected .type-card__check {
      background: var(--color-bordeaux);
      border-color: var(--color-bordeaux);
    }

    .type-card--selected .type-card__check::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 7px;
      width: 5px;
      height: 10px;
      border: solid var(--color-papier);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .type-card__description {
      font-size: var(--text-sm);
      color: var(--color-encre-doux);
    }

    .type-card__blessing {
      font-size: var(--text-xs);
      font-style: italic;
      color: var(--color-encre-doux);
    }

    .type-card__ref {
      display: inline-block;
      margin-left: 0.25rem;
      font-style: normal;
      font-weight: 600;
      color: var(--color-or);
    }
  `,
})
export class TypeCardComponent {
  readonly type = input.required<OfferingType>();
  readonly selected = input(false);
  readonly picked = output<number>();
}
