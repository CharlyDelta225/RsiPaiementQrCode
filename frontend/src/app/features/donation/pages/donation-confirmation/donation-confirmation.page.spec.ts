import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { DonationReceipt } from '../../../../core/models/contribution.model';
import { InstallPromptService } from '../../../../core/services/install-prompt.service';
import { DonationFlowService } from '../../services/donation-flow.service';
import { DonationConfirmationPage } from './donation-confirmation.page';

@Component({ selector: 'app-don-home-stub', template: '<p>accueil don</p>' })
class DonHomeStubComponent {}

@Component({ selector: 'app-don-type-stub', template: '<p>choix du don</p>' })
class DonTypeStubComponent {}

const RECEIPT: DonationReceipt = {
  contributionId: 7,
  reference: 'CONT-20260925-0007',
  amount: 5000,
  currencyCode: 'XOF',
  status: 'PAID',
  offeringTypeLabel: 'Don',
  paymentProvider: 'MOOV_MONEY',
  paymentSimulated: true,
  blessingText: 'Que chacun donne comme il l’a décidé en son cœur.',
  blessingRef: '2 Corinthiens 9:7',
  paidAt: '2026-09-25T10:15:30',
  receiptNumber: 'REC-20260925-0007',
};

describe('DonationConfirmationPage', () => {
  let flow: DonationFlowService;
  let router: Router;
  let canPrompt: ReturnType<typeof signal<boolean>>;
  let prompt: jasmine.Spy;
  let dismiss: jasmine.Spy;

  beforeEach(() => {
    canPrompt = signal(false);
    prompt = jasmine.createSpy('prompt').and.resolveTo('accepted' as const);
    dismiss = jasmine.createSpy('dismiss');
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'don', component: DonHomeStubComponent },
          { path: 'don/type', component: DonTypeStubComponent },
          { path: 'don/confirmation', component: DonationConfirmationPage },
        ]),
        {
          provide: InstallPromptService,
          useValue: {
            canPrompt,
            prompt,
            dismiss,
            watch: () => undefined,
          },
        },
      ],
    });
    flow = TestBed.inject(DonationFlowService);
    router = TestBed.inject(Router);
  });

  it('redirige vers /don quand aucun reçu n’est en mémoire (rechargement)', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/don/confirmation');
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(router.url).toBe('/don');
    expect(harness.routeNativeElement?.textContent).toContain('accueil don');
  });

  it('affiche bénédiction et reçu puis réinitialise pour un nouveau don', async () => {
    flow.receipt.set(RECEIPT);
    const harness = await RouterTestingHarness.create('/don/confirmation');
    const element = harness.routeNativeElement as HTMLElement;

    expect(element.textContent).toContain('Merci pour votre don');
    expect(element.textContent).toContain('CONT-20260925-0007');
    expect(element.textContent).toContain('REC-20260925-0007');
    expect(element.textContent).toContain('Moov Money');
    expect(element.textContent).toContain('Don');
    expect(element.querySelector('app-bible-verse-card')).not.toBeNull();
    expect(element.querySelector('app-bible-verse-card')?.textContent).toContain(
      '2 Corinthiens 9:7',
    );

    (element.querySelector('.don-flow__footer button.btn') as HTMLButtonElement).click();
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(flow.receipt()).toBeNull();
    expect(router.url).toBe('/don/type');
  });

  it('ne propose pas l’installation quand le navigateur ne l’a pas demandé', async () => {
    flow.receipt.set(RECEIPT);
    canPrompt.set(false);

    const harness = await RouterTestingHarness.create('/don/confirmation');

    expect(harness.routeNativeElement?.querySelector('.don-install')).toBeNull();
  });

  it('propose l’installation après le don et déclenche le dialogue natif au clic', async () => {
    flow.receipt.set(RECEIPT);
    canPrompt.set(true);

    const harness = await RouterTestingHarness.create('/don/confirmation');
    const element = harness.routeNativeElement as HTMLElement;
    const banner = element.querySelector('.don-install') as HTMLElement;

    expect(banner).not.toBeNull();
    expect(banner.textContent).toContain('Installer l’application');
    expect(prompt).not.toHaveBeenCalled();

    (banner.querySelector('button.btn') as HTMLButtonElement).click();
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(dismiss).not.toHaveBeenCalled();
  });

  it('retient le refus « Plus tard » pour les dons suivants', async () => {
    flow.receipt.set(RECEIPT);
    canPrompt.set(true);

    const harness = await RouterTestingHarness.create('/don/confirmation');
    const element = harness.routeNativeElement as HTMLElement;
    const later = element.querySelector('.don-install__later') as HTMLButtonElement;

    expect(later).not.toBeNull();
    later.click();
    await new Promise<void>((resolve) => setTimeout(resolve));

    expect(dismiss).toHaveBeenCalledTimes(1);
    expect(prompt).not.toHaveBeenCalled();
  });
});
