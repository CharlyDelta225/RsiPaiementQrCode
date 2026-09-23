import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { MemberLayoutComponent } from './member-layout';

export const memberRoutes: Routes = [
  {
    path: '',
    component: MemberLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'contribution',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
      },
      {
        path: 'contributions',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
      },
      {
        path: 'profile',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./pages/coming-soon/coming-soon.page').then((m) => m.ComingSoonPage),
      },
    ],
  },
];