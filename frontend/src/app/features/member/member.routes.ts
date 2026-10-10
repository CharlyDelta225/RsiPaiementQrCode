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
        loadComponent: () =>
          import('../donation/pages/donation-type/donation-type.page').then(
            (m) => m.DonationTypePage,
          ),
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import('../donation/pages/donation-confirmation/donation-confirmation.page').then(
            (m) => m.DonationConfirmationPage,
          ),
      },
    ],
  },
  {
    path: '',
    component: MemberLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'contributions',
        loadComponent: () =>
          import('./pages/history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'contributions/:id',
        loadComponent: () =>
          import('./pages/contribution-detail/contribution-detail.page').then(
            (m) => m.ContributionDetailPage,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'settings/profile',
        loadComponent: () =>
          import('./pages/profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: 'settings/password',
        loadComponent: () =>
          import('./pages/password/password.page').then((m) => m.PasswordPage),
      },
      { path: 'profile', redirectTo: 'settings/profile', pathMatch: 'full' },
    ],
  },
];
