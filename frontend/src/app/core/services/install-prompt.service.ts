import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';

/** Une seule proposition d'installation par appareil : ce choix est memorise. */
const DISMISSED_KEY = 'moneglise_install_prompt_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private readonly document = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly storage = this.isBrowser ? this.document.defaultView?.localStorage ?? null : null;

  private readonly deferredPrompt = signal<BeforeInstallPromptEvent | null>(null);
  private readonly promptUsed = signal(false);
  private readonly appInstalled = signal(false);
  private readonly dismissed = signal(readDismissed(this.storage));

  /** Le dialogue natif peut etre propose : evenement recu, jamais utilise, pas encore decline. */
  readonly canPrompt = computed(
    () => this.deferredPrompt() !== null && !this.promptUsed() && !this.dismissed() && !this.appInstalled(),
  );

  private listening = false;

  /**
   * Ecoute `beforeinstallprompt` / `appinstalled`. L'ecouteur est enregistre au premier
   * appel, typiquement au bootstrap de l'application : l'evenement doit etre capture tot,
   * mais rien n'est propose. Seule la page de confirmation d'un don affiche la proposition.
   */
  watch(): void {
    if (!this.isBrowser || this.listening) {
      return;
    }
    const view = this.document.defaultView;
    if (!view) {
      return;
    }
    this.listening = true;
    view.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.deferredPrompt.set(event as BeforeInstallPromptEvent);
    });
    view.addEventListener('appinstalled', () => {
      this.appInstalled.set(true);
      this.deferredPrompt.set(null);
    });
  }

  /** Affiche le dialogue natif. Une seule tentative : le refus est memorise definitivement. */
  async prompt(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
    const deferred = this.deferredPrompt();
    if (!deferred || !this.canPrompt()) {
      return 'unavailable';
    }
    this.promptUsed.set(true);
    try {
      await deferred.prompt();
    } catch {
      this.rememberDismissed();
      return 'dismissed';
    }
    const choice = await deferred.userChoice;
    this.deferredPrompt.set(null);
    if (choice.outcome === 'accepted') {
      return 'accepted';
    }
    this.rememberDismissed();
    return 'dismissed';
  }

  /** Le donateur a ferme le bandeau sans repondre : plus jamais de proposition sur cet appareil. */
  dismiss(): void {
    this.rememberDismissed();
  }

  private rememberDismissed(): void {
    this.dismissed.set(true);
    try {
      this.storage?.setItem(DISMISSED_KEY, '1');
    } catch {
      /* mode prive / quota : on garde la decision en memoire pour la session */
    }
  }
}

function readDismissed(storage: Storage | null): boolean {
  try {
    return storage?.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}
