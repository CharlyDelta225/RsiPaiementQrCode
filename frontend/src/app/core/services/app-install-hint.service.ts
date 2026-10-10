import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isStandaloneApp } from '../utils/display-mode';

/** Contexte de l'utilisateur, qui détermine le contenu du message d'installation. */
export type InstallContext = 'desktop' | 'ios' | 'mobile';

const ARMED_KEY = 'moneglise_install_hint_armed';
const NEVER_KEY = 'moneglise_install_hint_never';
const BANNER_HIDDEN_KEY = 'moneglise_install_banner_hidden';

/**
 * Invitation « installez l'application sur votre écran d'accueil » (jamais dans l'application
 * déjà installée) :
 * - fenêtre proposée une fois après chaque connexion sur le web ;
 * - carte permanente sur le tableau de bord, masquable pour la session.
 */
@Injectable({ providedIn: 'root' })
export class AppInstallHintService {
  private readonly view = isPlatformBrowser(inject(PLATFORM_ID))
    ? (inject(DOCUMENT).defaultView ?? null)
    : null;

  /** Carte du tableau de bord visible (web, non installé, ni masquée ni refusée). */
  readonly bannerVisible = signal(
    !this.isStandalone() &&
      this.read(this.view?.localStorage, NEVER_KEY) !== '1' &&
      this.read(this.view?.sessionStorage, BANNER_HIDDEN_KEY) !== '1',
  );

  /** À appeler juste après une connexion/inscription réussie. */
  armAfterLogin(): void {
    this.write(this.view?.sessionStorage, ARMED_KEY, '1');
  }

  /** Vrai une seule fois par connexion, si le message a lieu d'être affiché. */
  consume(): boolean {
    const armed = this.read(this.view?.sessionStorage, ARMED_KEY) === '1';
    this.remove(this.view?.sessionStorage, ARMED_KEY);
    return armed && !this.isStandalone() && this.read(this.view?.localStorage, NEVER_KEY) !== '1';
  }

  /** « Ne plus me le proposer » : mémorisé sur cet appareil (fenêtre et carte). */
  neverAgain(): void {
    this.write(this.view?.localStorage, NEVER_KEY, '1');
    this.bannerVisible.set(false);
  }

  /** Croix de la carte : masquée jusqu'à la prochaine visite. */
  hideBannerForSession(): void {
    this.write(this.view?.sessionStorage, BANNER_HIDDEN_KEY, '1');
    this.bannerVisible.set(false);
  }

  context(): InstallContext {
    const view = this.view;
    if (!view) {
      return 'desktop';
    }
    const ua = view.navigator.userAgent;
    // iPadOS se présente comme un Mac : on le reconnaît à l'écran tactile.
    const isIos = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && view.navigator.maxTouchPoints > 1);
    if (isIos) {
      return 'ios';
    }
    const isMobile =
      /Android|Mobi/i.test(ua) || view.matchMedia('(pointer: coarse) and (max-width: 767px)').matches;
    return isMobile ? 'mobile' : 'desktop';
  }

  /** L'application tourne déjà en mode installé (écran d'accueil). */
  private isStandalone(): boolean {
    return this.view === null || isStandaloneApp();
  }

  // Stockage parfois indisponible (navigation privée, stockage bloqué) : on ignore l'erreur.
  private read(storage: Storage | undefined, key: string): string | null {
    try {
      return storage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }

  private write(storage: Storage | undefined, key: string, value: string): void {
    try {
      storage?.setItem(key, value);
    } catch {
      // ignoré
    }
  }

  private remove(storage: Storage | undefined, key: string): void {
    try {
      storage?.removeItem(key);
    } catch {
      // ignoré
    }
  }
}
