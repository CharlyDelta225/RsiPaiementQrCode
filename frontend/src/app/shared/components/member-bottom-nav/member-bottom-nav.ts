import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AppIconComponent } from '../app-icon/app-icon';

@Component({
  selector: 'app-member-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, AppIconComponent],
  template: `
    <nav class="nav" aria-label="Navigation principale">
      <a
        class="nav__item"
        routerLink="/member/dashboard"
        routerLinkActive="nav__item--active"
        [routerLinkActiveOptions]="{ exact: true }"
        aria-label="Accueil"
      >
        <app-icon name="home" [size]="22" />
        <span>Accueil</span>
      </a>
      <a
        class="nav__item"
        routerLink="/member/contributions"
        routerLinkActive="nav__item--active"
        [routerLinkActiveOptions]="{ exact: true }"
        aria-label="Historique"
      >
        <app-icon name="history" [size]="22" />
        <span>Historique</span>
      </a>
      <a
        class="nav__item"
        routerLink="/member/profile"
        routerLinkActive="nav__item--active"
        [routerLinkActiveOptions]="{ exact: true }"
        aria-label="Profil"
      >
        <app-icon name="person" [size]="22" />
        <span>Profil</span>
      </a>
    </nav>
  `,
  styles: `
    .nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 430px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      background: var(--color-white);
      border-top: 1px solid #e5edf5;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
      padding: 0.5rem 0.5rem calc(0.5rem + env(safe-area-inset-bottom));
      z-index: 20;
    }
    @media (min-width: 768px) {
      .nav {
        max-width: none;
        left: 0;
        right: 0;
        transform: none;
      }
    }
    .nav__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.125rem;
      font-size: var(--text-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      text-decoration: none;
      padding: 0.375rem 0.25rem;
      border: 0;
      background: transparent;
      transition: color 0.2s;
    }
    .nav__item--active {
      color: var(--color-primary);
    }
    .nav__item:hover {
      color: var(--color-primary);
    }
  `,
})
export class MemberBottomNavComponent {}