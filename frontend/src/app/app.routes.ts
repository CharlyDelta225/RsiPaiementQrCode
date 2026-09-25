import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/auth/pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'don',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/donation/pages/donation-welcome/donation-welcome.page').then(
            (m) => m.DonationWelcomePage,
          ),
      },
      {
        path: 'type',
        loadComponent: () =>
          import('./features/donation/pages/donation-type/donation-type.page').then(
            (m) => m.DonationTypePage,
          ),
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import(
            './features/donation/pages/donation-confirmation/donation-confirmation.page'
          ).then((m) => m.DonationConfirmationPage),
      },
    ],
  },
  {
    path: 'member',
    loadChildren: () =>
      import('./features/member/member.routes').then((m) => m.memberRoutes),
  },
  { path: '**', redirectTo: 'welcome' },
];