import { TestBed } from '@angular/core/testing';
import { InstallPromptService } from './install-prompt.service';

describe('InstallPromptService', () => {
  let service: InstallPromptService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(InstallPromptService);
    service.watch();
  });

  it('ne propose rien tant que le navigateur n’a pas émis beforeinstallprompt', async () => {
    expect(service.canPrompt()).toBeFalse();
    await expectAsync(service.prompt()).toBeResolvedTo('unavailable');
  });

  it('capture l’événement, empêche le mini-infobar natif et devient proposable', () => {
    const { event } = fireInstallPromptEvent('accepted');

    expect(event.defaultPrevented).toBeTrue();
    expect(service.canPrompt()).toBeTrue();
  });

  it('déclenche le dialogue natif une seule fois après acceptation', async () => {
    const { prompt } = fireInstallPromptEvent('accepted');

    await expectAsync(service.prompt()).toBeResolvedTo('accepted');

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(service.canPrompt()).toBeFalse();
    await expectAsync(service.prompt()).toBeResolvedTo('unavailable');
  });

  it('mémorise le refus pour ne plus proposer sur les dons suivants', async () => {
    fireInstallPromptEvent('dismissed');

    await expectAsync(service.prompt()).toBeResolvedTo('dismissed');

    expect(service.canPrompt()).toBeFalse();
    expect(localStorage.getItem('moneglise_install_prompt_dismissed')).toBe('1');

    // Session suivante : un nouvel événement ne réactive pas la proposition.
    TestBed.resetTestingModule();
    const next = TestBed.inject(InstallPromptService);
    next.watch();
    fireInstallPromptEvent('accepted');

    expect(next.canPrompt()).toBeFalse();
  });

  it('mémorise aussi la fermeture via le bouton « Plus tard »', () => {
    fireInstallPromptEvent('accepted');
    expect(service.canPrompt()).toBeTrue();

    service.dismiss();

    expect(service.canPrompt()).toBeFalse();
    expect(localStorage.getItem('moneglise_install_prompt_dismissed')).toBe('1');
  });

  it('cesse de proposer une fois l’application installée', () => {
    fireInstallPromptEvent('accepted');
    expect(service.canPrompt()).toBeTrue();

    window.dispatchEvent(new Event('appinstalled'));

    expect(service.canPrompt()).toBeFalse();
  });

  function fireInstallPromptEvent(outcome: 'accepted' | 'dismissed'): {
    event: Event;
    prompt: jasmine.Spy;
  } {
    const prompt = jasmine.createSpy('prompt').and.resolveTo();
    const event = new Event('beforeinstallprompt', { cancelable: true });
    Object.assign(event, { prompt, userChoice: Promise.resolve({ outcome, platform: 'web' }) });
    window.dispatchEvent(event);
    return { event, prompt };
  }
});
