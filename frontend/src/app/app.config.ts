import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { PreloadAllModules, TitleStrategy, provideRouter, withPreloading } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';

import { routes } from './app.routes';
import { PageTitleStrategy } from './core/config/page-title.strategy';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { AuthService } from './core/services/auth.service';
import { DeviceLockService } from './core/services/device-lock.service';
import { InstallPromptService } from './core/services/install-prompt.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    { provide: TitleStrategy, useClass: PageTitleStrategy },
    provideHttpClient(withInterceptors([authInterceptor])),
    // App installée avec code secret : la session précédente est fermée à chaque ouverture.
    provideAppInitializer(() => inject(DeviceLockService).lockOnLaunch()),
    provideAppInitializer(() => inject(AuthService).hydrate()),
    provideAppInitializer(() => inject(DeviceLockService).watchBackground()),
    // Capture l'evenement d'installation le plus tot possible ; l'affichage reste
    // reserve a l'ecran /don/confirmation.
    provideAppInitializer(() => inject(InstallPromptService).watch()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:10000',
    }),
  ],
};