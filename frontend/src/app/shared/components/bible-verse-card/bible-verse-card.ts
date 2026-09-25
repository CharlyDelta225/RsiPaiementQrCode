import { Component, input } from '@angular/core';

@Component({
  selector: 'app-bible-verse-card',
  standalone: true,
  template: `
    <div class="verse">
      <div class="verse__bg" aria-hidden="true"></div>
      <div class="verse__overlay" aria-hidden="true"></div>
      <p class="verse__text">«&nbsp;{{ text() }}&nbsp;»</p>
      <p class="verse__ref">{{ reference() }}</p>
    </div>
  `,
  styles: `
    .verse {
      position: relative;
      border-radius: 16px;
      min-height: 132px;
      overflow: hidden;
      color: var(--color-papier);
      box-shadow: 0 8px 24px var(--color-bordeaux-deep-15);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1.125rem 1.25rem;
      border: 1px solid var(--color-or-35);
    }
    .verse__bg {
      position: absolute;
      inset: 0;
      background: url('/images/church-bg.png') center / cover no-repeat;
    }
    .verse__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        180deg,
        var(--color-bordeaux-30) 0%,
        var(--color-bordeaux-deep-88) 100%
      );
    }
    .verse__text {
      position: relative;
      z-index: 1;
      font-family: var(--font-serif, 'Cormorant Garamond', Georgia, serif);
      font-style: italic;
      font-size: 1.3125rem;
      font-weight: 500;
      line-height: 1.3;
      letter-spacing: 0.005em;
      margin: 0 0 0.625rem;
      text-wrap: balance;
    }
    .verse__ref {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--color-or-clair);
      margin: 0;
      padding-top: 0.5rem;
      border-top: 1px solid var(--color-or-40);
    }
  `,
})
export class BibleVerseCardComponent {
  readonly text = input('Que chacun donne comme il l’a décidé en son cœur, sans regret et sans contrainte.');
  readonly reference = input('2 Corinthiens 9:7');
}