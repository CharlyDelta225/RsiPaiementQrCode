import { Component } from '@angular/core';

@Component({
  selector: 'app-bible-verse-card',
  standalone: true,
  template: `
    <div class="verse">
      <div class="verse__bg" aria-hidden="true"></div>
      <div class="verse__overlay" aria-hidden="true"></div>
      <p class="verse__text">
        « Que chacun donne comme il l'a décidé en son cœur, sans regret et sans
        contrainte. »
      </p>
      <p class="verse__ref">2 Corinthiens 9:7</p>
    </div>
  `,
  styles: `
    .verse {
      position: relative;
      border-radius: 16px;
      height: 132px;
      overflow: hidden;
      color: #fff;
      box-shadow: var(--shadow-card);
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      padding: 1rem 1.125rem;
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
        rgba(11, 36, 64, 0.25) 0%,
        rgba(11, 36, 64, 0.7) 100%
      );
    }
    .verse__text {
      position: relative;
      z-index: 1;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.45;
      margin: 0 0 0.25rem;
    }
    .verse__ref {
      position: relative;
      z-index: 1;
      font-size: 0.8125rem;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
    }
  `,
})
export class BibleVerseCardComponent {}