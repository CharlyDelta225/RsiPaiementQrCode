import { Component, afterNextRender, computed, inject, viewChild } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AppIconComponent } from '../../shared/components/app-icon/app-icon';
import { ChurchLogoComponent } from '../../shared/components/church-logo/church-logo';
import { AppInstallDialogComponent } from '../../shared/components/app-install-dialog/app-install-dialog';
import { LogoutDialogComponent } from '../../shared/components/logout-dialog/logout-dialog';
import { MemberBottomNavComponent } from '../../shared/components/member-bottom-nav/member-bottom-nav';
import { roleLabel, userInitials } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-member-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    AppIconComponent,
    AppInstallDialogComponent,
    ChurchLogoComponent,
    LogoutDialogComponent,
    MemberBottomNavComponent,
  ],
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
            routerLink="/member/settings"
            routerLinkActive="member-sidebar__link--active"
          >
            <app-icon name="settings" [size]="20" />
            <span>Réglages</span>
          </a>
        </nav>

        @if (account(); as me) {
          <button
            class="member-sidebar__account"
            type="button"
            aria-haspopup="dialog"
            [attr.aria-label]="'Connecté en tant que ' + me.name + ' — se déconnecter'"
            [title]="me.details"
            (click)="logoutDialog.open()"
          >
            <span class="member-sidebar__avatar" aria-hidden="true">{{ me.initials }}</span>
            <span class="member-sidebar__who">
              <span class="member-sidebar__who-name">{{ me.name }}</span>
              <span class="member-sidebar__who-role">{{ me.profile }}</span>
            </span>
            <app-icon name="logout" [size]="18" />
          </button>
        }
      </aside>

      <app-logout-dialog #logoutDialog />
      <app-install-dialog />

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
        border-right: 1px solid var(--color-bordure);
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
        color: var(--color-bordeaux-deep);
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
      .member-sidebar__account {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.625rem;
        border: 1px solid var(--color-bordure);
        border-radius: 14px;
        background: var(--color-creme);
        text-align: left;
        transition: background 0.2s, border-color 0.2s;
      }
      .member-sidebar__account:hover {
        border-color: var(--color-or-45);
        background: var(--color-or-soft);
      }
      .member-sidebar__account:focus-visible {
        outline: 3px solid var(--color-or-60);
        outline-offset: 2px;
      }
      .member-sidebar__account > app-icon {
        flex-shrink: 0;
        color: var(--color-text-secondary);
      }
      .member-sidebar__account:hover > app-icon {
        color: var(--color-red);
      }
      .member-sidebar__avatar {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        font-size: var(--text-sm);
        font-weight: 800;
        color: var(--color-papier);
        background: var(--color-bordeaux);
        box-shadow: 0 0 0 2px var(--color-papier), 0 0 0 4px var(--color-or);
      }
      .member-sidebar__who {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .member-sidebar__who-name {
        font-size: var(--text-sm);
        font-weight: 700;
        color: var(--color-bordeaux-deep);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .member-sidebar__who-role {
        font-size: var(--text-xs);
        color: var(--color-text-secondary);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
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
  private readonly installDialog = viewChild.required(AppInstallDialogComponent);

  constructor() {
    // Juste après la connexion : inviter à installer l'application sur mobile.
    afterNextRender(() => this.installDialog().openIfDue());
  }

  /** Carte « connecté en tant que » en bas de la sidebar : initiales, nom, profil. */
  protected readonly account = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return null;
    }
    const role = roleLabel(user);
    return {
      initials: userInitials(user),
      name: user.fullName,
      profile: role,
      details: [user.fullName, role, user.templeName].filter(Boolean).join(' · '),
    };
  });
}