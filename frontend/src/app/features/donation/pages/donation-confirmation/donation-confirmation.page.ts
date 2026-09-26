import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { formatFcfa } from '../../../../core/utils/format';
import { InstallPromptService } from '../../../../core/services/install-prompt.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { BibleVerseCardComponent } from '../../../../shared/components/bible-verse-card/bible-verse-card';
import { PrimaryButtonComponent } from '../../../../shared/components/primary-button/primary-button';
import { providerLabel } from '../../models/donation.model';
import { DonationFlowService } from '../../services/donation-flow.service';

const RECEIPT_DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

@Component({
  selector: 'app-donation-confirmation',
  standalone: true,
  imports: [AppIconComponent, BibleVerseCardComponent, PrimaryButtonComponent],
  templateUrl: './donation-confirmation.page.html',
  styleUrl: './donation-confirmation.page.scss',
})
export class DonationConfirmationPage implements OnInit {
  private readonly flow = inject(DonationFlowService);
  private readonly router = inject(Router);
  private readonly install = inject(InstallPromptService);

  protected readonly details = computed(() => {
    const receipt = this.flow.receipt();
    if (!receipt) {
      return null;
    }
    return {
      reference: receipt.reference,
      typeLabel: receipt.offeringTypeLabel,
      amountLabel: formatFcfa(receipt.amount),
      providerLabel: providerLabel(receipt.paymentProvider),
      dateLabel: receipt.paidAt
        ? RECEIPT_DATE_FORMATTER.format(new Date(receipt.paidAt))
        : '—',
      receiptNumber: receipt.receiptNumber,
    };
  });
  protected readonly blessing = computed(() => {
    const receipt = this.flow.receipt();
    if (!receipt?.blessingText) {
      return null;
    }
    return { text: receipt.blessingText, reference: receipt.blessingRef ?? '' };
  });
  protected readonly simulated = computed(() => this.flow.receipt()?.paymentSimulated ?? false);
  /** Proposition d'installation : uniquement ici, jamais sur l'ecran QR ni au premier chargement. */
  protected readonly canInstall = computed(() => this.install.canPrompt());

  ngOnInit(): void {
    if (!this.flow.receipt()) {
      this.router.navigate(['/don'], { replaceUrl: true });
    }
  }

  protected async installApp(): Promise<void> {
    await this.install.prompt();
  }

  protected dismissInstall(): void {
    this.install.dismiss();
  }

  protected startNewDonation(): void {
    this.flow.reset();
    this.router.navigate(['/don/type']);
  }
}
