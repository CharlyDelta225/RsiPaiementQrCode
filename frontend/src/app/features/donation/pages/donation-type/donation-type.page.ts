import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { formatFcfa } from '../../../../core/utils/format';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { PrimaryButtonComponent } from '../../../../shared/components/primary-button/primary-button';
import { PublicPaymentProvider } from '../../../../core/models/payment-provider.model';
import { TypeCardComponent } from '../../components/type-card/type-card';
import {
  PAYMENT_PROVIDERS,
  QUICK_AMOUNTS,
  providerLabel,
} from '../../models/donation.model';
import { DonationFlowService } from '../../services/donation-flow.service';

type StepLabel = 'Type d’offrande' | 'Montant' | 'Mode de paiement';

@Component({
  selector: 'app-donation-type',
  standalone: true,
  imports: [AppIconComponent, PrimaryButtonComponent, TypeCardComponent],
  templateUrl: './donation-type.page.html',
  styleUrl: './donation-type.page.scss',
})
export class DonationTypePage implements OnInit {
  private readonly flow = inject(DonationFlowService);
  private readonly router = inject(Router);

  protected readonly totalSteps = 3;
  protected readonly step = this.flow.step;
  protected readonly stepLabel = computed<StepLabel>(() => {
    switch (this.flow.step()) {
      case 1:
        return 'Type d’offrande';
      case 2:
        return 'Montant';
      case 3:
        return 'Mode de paiement';
    }
  });
  protected readonly progress = this.flow.progress;
  protected readonly canContinue = this.flow.canContinue;
  protected readonly recapVisible = this.flow.recapVisible;
  protected readonly submitting = this.flow.submitting;
  protected readonly errorMessage = this.flow.errorMessage;

  protected readonly offeringTypes = this.flow.offeringTypes;
  protected readonly offeringTypesState = this.flow.offeringTypesState;
  protected readonly selectedOfferingTypeId = this.flow.offeringTypeId;

  protected readonly amountInput = this.flow.amountInput;
  protected readonly quickAmounts = QUICK_AMOUNTS;
  protected readonly amountPreview = computed(() => {
    const amount = this.flow.amount();
    if (amount === null || amount <= 0) {
      return null;
    }
    return Number.isInteger(amount)
      ? formatFcfa(amount)
      : `${amount.toLocaleString('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })} FCFA`;
  });

  protected readonly providers = PAYMENT_PROVIDERS;
  protected readonly selectedProvider = this.flow.paymentProvider;
  protected readonly recap = computed(() => {
    const payload = this.flow.payload();
    const offeringType = this.flow.selectedOfferingType();
    if (!payload || !offeringType) {
      return null;
    }
    return {
      typeLabel: offeringType.label,
      amountLabel: formatFcfa(payload.amount),
      providerLabel: providerLabel(payload.paymentProvider),
    };
  });

  protected readonly actionLabel = computed(() => {
    if (this.flow.submitting()) {
      return 'Traitement en cours…';
    }
    if (this.flow.recapVisible()) {
      return 'Confirmer le don';
    }
    return this.flow.step() === 3 ? 'Voir le récapitulatif' : 'Continuer';
  });

  protected readonly formatFcfa = formatFcfa;

  ngOnInit(): void {
    this.flow.loadOfferingTypes();
  }

  protected selectType(id: number): void {
    this.flow.selectOfferingType(id);
  }

  protected onAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.flow.setAmountInput(input.value);
    if (input.value !== this.flow.amountInput()) {
      input.value = this.flow.amountInput();
    }
  }

  protected selectQuickAmount(amount: number): void {
    this.flow.setAmountInput(String(amount));
  }

  protected isQuickAmountActive(amount: number): boolean {
    return this.flow.amount() === amount;
  }

  protected selectProvider(id: PublicPaymentProvider): void {
    this.flow.selectPaymentProvider(id);
  }

  protected reloadOfferingTypes(): void {
    this.flow.loadOfferingTypes(true);
  }

  protected continue(): void {
    if (this.flow.submitting()) {
      return;
    }
    if (this.flow.recapVisible()) {
      this.confirmDonation();
      return;
    }
    if (this.flow.step() === 3) {
      this.flow.showRecap();
      return;
    }
    this.flow.next();
  }

  protected editChoices(): void {
    if (this.flow.submitting()) {
      return;
    }
    this.flow.hideRecap();
  }

  protected back(): void {
    if (this.flow.submitting()) {
      return;
    }
    if (this.flow.step() === 1) {
      this.router.navigate(['/don']);
      return;
    }
    this.flow.previous();
  }

  private confirmDonation(): void {
    this.flow.submit().subscribe({
      next: () => this.router.navigate(['/don/confirmation']),
      error: () => undefined,
    });
  }
}
