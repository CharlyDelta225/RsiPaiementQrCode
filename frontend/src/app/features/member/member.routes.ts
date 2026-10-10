import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { MemberLayoutComponent } from './member-layout';

export const memberRoutes: Routes = [
  // Parcours de contribution en plein écran (sans sidebar ni bottom-nav), comme le don public.
  {
    path: 'contribution',
    canActivate: [authGuard],
    data: { donationMode: 'member' },
    children: [
      {
        path: '',
        title: 'Faire une contribution',
        loadComponent: () =>
          import('../donation/pages/donation-type/donation-type.page').then(
            (m) => m.DonationTypePage,
          ),
      },
      {
        path: 'confirmation',
        title: 'Merci pour votre contribution',
        loadComponent: () =>
          import('../donation/pages/donation-confirmation/donation-confirmation.page').then(
            (m) => m.DonationConfirmationPage,
          ),
      },
    ],
  },
  // Changement du code secret (app installée), plein écran.
  {
    path: 'settings/code',
    title: 'Code secret',
    canActivate: [authGuard],
    data: { pinMode: 'change' },
    loadComponent: () =>
      import('../lock/pages/pin-setup/pin-setup.page').then((m) => m.PinSetupPage),
  },
  {
    path: '',
    component: MemberLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        title: 'Accueil',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'contributions',
        title: 'Mon historique',
        loadComponent: () =>
          import('./pages/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'contributions/:id',
        title: 'Détail du reçu',
        loadComponent: () =>
          import('./pages/contribution-detail/contribution-detail.page').then(
            (m) => m.ContributionDetailPage,
          ),
      },
      {
        path: 'settings',
        title: 'Réglages',
        loadComponent: () =>
          import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'settings/profile',
        title: 'Informations personnelles',
        loadComponent: () =>
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'settings/password',
        title: 'Mot de passe',
        loadComponent: () =>
          import('./pages/password/password.page').then((m) => m.PasswordPage),
      },
      { path: 'profile', redirectTo: 'settings/profile', pathMatch: 'full' },
    ],
  },
];
