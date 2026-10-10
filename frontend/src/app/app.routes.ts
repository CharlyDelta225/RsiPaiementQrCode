import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },
  {
    path: 'welcome',
    title: 'Bienvenue',
    loadComponent: () =>
      import('./features/auth/pages/welcome/welcome.page').then((m) => m.WelcomePage),
  },
  {
    path: 'login',
    title: 'Connexion',
    loadComponent: () =>
      import('./features/auth/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    title: 'Créer un compte',
    loadComponent: () =>
      import('./features/auth/pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'don',
    children: [
      {
        path: '',
        title: 'Scannez pour donner',
        loadComponent: () =>
          import('./features/donation/pages/donation-welcome/donation-welcome.page').then(
            (m) => m.DonationWelcomePage,
          ),
      },
      {
        path: 'type',
        title: 'Faire un don',
        loadComponent: () =>
          import('./features/donation/pages/donation-type/donation-type.page').then(
            (m) => m.DonationTypePage,
          ),
      },
      {
        path: 'confirmation',
        title: 'Merci pour votre don',
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
  {
    path: 'confidentialite',
    title: 'Politique de confidentialité',
    loadComponent: () =>
      import('./features/legal/pages/privacy/privacy.page').then((m) => m.PrivacyPage),
  },
  {
    path: 'conditions',
    title: 'Conditions d’utilisation',
    loadComponent: () =>
      import('./features/legal/pages/terms/terms.page').then((m) => m.TermsPage),
  },
  {
    path: '**',
    title: 'Page introuvable',
    loadComponent: () =>
      import('./features/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];