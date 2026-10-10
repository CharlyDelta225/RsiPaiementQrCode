import { isDevMode } from '@angular/core';

/** Clé de test : en développement uniquement, simule l'app installée dans un navigateur. */
export const FORCE_STANDALONE_KEY = 'rsi_force_standalone';

/** Vrai quand l'application est ouverte depuis l'écran d'accueil (PWA installée). */
export function isStandaloneApp(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (iosStandalone || window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  if (isDevMode()) {
    try {
      return window.localStorage.getItem(FORCE_STANDALONE_KEY) === '1';
    } catch {
      return false;
    }
  }
  return false;
}
