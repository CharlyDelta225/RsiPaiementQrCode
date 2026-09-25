import { Component, OnInit, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { formatFcfa } from '../../../../core/utils/format';
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

  ngOnInit(): void {
    if (!this.flow.receipt()) {
      this.router.navigate(['/don'], { replaceUrl: true });
    }
  }

  protected startNewDonation(): void {
    this.flow.reset();
    this.router.navigate(['/don/type']);
  }
}
