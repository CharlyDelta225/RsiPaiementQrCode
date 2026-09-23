import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';
import { ChurchLogoComponent } from '../../shared/components/church-logo/church-logo';
import { MemberBottomNavComponent } from '../../shared/components/member-bottom-nav/member-bottom-nav';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppIconComponent, ChurchLogoComponent, MemberBottomNavComponent],
  template: `
    <div class="member-layout">
      <aside class="member-sidebar">
        <div class="member-sidebar__head">
          <app-church-logo [size]="38" />
          <span class="member-sidebar__name">Mon Église</span>
        </div>

        <nav class="member-sidebar__nav" aria-label="Navigation principale">
          <a
            class="member-sidebar__link"
            routerLink="/member/dashboard"
            routerLinkActive="member-sidebar__link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <app-icon name="home" [size]="20" />
            <span>Accueil</span>
          </a>
          <a
            class="member-sidebar__link"
            routerLink="/member/contributions"
            routerLinkActive="member-sidebar__link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <app-icon name="history" [size]="20" />
            <span>Historique</span>
          </a>
          <a
            class="member-sidebar__link"
            routerLink="/member/profile"
            routerLinkActive="member-sidebar__link--active"
            [routerLinkActiveOptions]="{ exact: true }"
          >
            <app-icon name="person" [size]="20" />
            <span>Profil</span>
          </a>
        </nav>

        <button class="member-sidebar__logout" type="button" (click)="logout()">
          <app-icon name="logout" [size]="20" />
          <span>Se déconnecter</span>
        </button>
      </aside>

      <main class="member-layout__main">
        <router-outlet />
      </main>

      <app-member-bottom-nav />
    </div>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
    }
    .member-layout {
      min-height: 100dvh;
    }
    .member-sidebar {
      display: none;
    }
    .member-layout__main {
      min-width: 0;
    }

    @media (min-width: 768px) {
      .member-layout {
        display: flex;
        background: var(--color-bg);
      }
      .member-sidebar {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        position: sticky;
        top: 0;
        height: 100dvh;
        width: 248px;
        flex-shrink: 0;
        background: var(--color-white);
        border-right: 1px solid #e5edf5;
        padding: 1.5rem 1rem;
      }
      .member-sidebar__head {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        padding: 0 0.5rem;
      }
      .member-sidebar__name {
        font-size: 1.0625rem;
        font-weight: 800;
        color: var(--color-dark-blue);
      }
      .member-sidebar__nav {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        flex: 1;
      }
      .member-sidebar__link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
        border-radius: 12px;
        color: var(--color-text-secondary);
        font-weight: 600;
        font-size: var(--text-sm);
        text-decoration: none;
        transition: background 0.2s, color 0.2s;
      }
      .member-sidebar__link:hover {
        background: var(--color-primary-soft);
        color: var(--color-primary);
      }
      .member-sidebar__link--active {
        background: var(--color-primary-soft);
        color: var(--color-primary);
      }
      .member-sidebar__logout {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.625rem 0.75rem;
        border: 0;
        border-radius: 12px;
        background: transparent;
        color: var(--color-red);
        font-weight: 600;
        font-size: var(--text-sm);
        transition: background 0.2s;
      }
      .member-sidebar__logout:hover {
        background: var(--color-red-soft);
      }
      .member-layout__main {
        flex: 1;
        min-width: 0;
      }
      app-member-bottom-nav {
        display: none;
      }
    }
  `,
})
export class MemberLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.authService.logout();
    this.router.navigate(['/welcome']);
  }
}