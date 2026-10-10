import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContributionStatus, DonationReceipt } from '../../../../core/models/contribution.model';
import { ContributionService } from '../../../../core/services/contribution.service';
import { formatFcfa } from '../../../../core/utils/format';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { BibleVerseCardComponent } from '../../../../shared/components/bible-verse-card/bible-verse-card';
import { providerLabel } from '../../../donation/models/donation.model';

const DATE_FORMATTER = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' });

const STATUS_LABELS: Record<ContributionStatus, string> = {
  PAID: 'Payé',
  PENDING: 'En attente',
  FAILED: 'Échec',
  CANCELLED: 'Annulé',
};

@Component({
  selector: 'app-contribution-detail',
  standalone: true,
  imports: [RouterLink, AppIconComponent, BibleVerseCardComponent],
  templateUrl: './contribution-detail.page.html',
  styleUrl: './contribution-detail.page.scss',
})
export class ContributionDetailPage {
  private readonly contributionService = inject(ContributionService);
  private readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  protected readonly state = signal<'loading' | 'ready' | 'error'>('loading');
  protected readonly errorMessage = signal<string | null>(null);
  private readonly receipt = signal<DonationReceipt | null>(null);

  protected readonly details = computed(() => {
    const receipt = this.receipt();
    if (!receipt) {
      return null;
    }
    return {
      status: receipt.status,
      statusLabel: STATUS_LABELS[receipt.status],
      amountLabel: formatFcfa(receipt.amount),
      typeLabel: receipt.offeringTypeLabel,
      providerLabel: providerLabel(receipt.paymentProvider),
      dateLabel: receipt.paidAt ? DATE_FORMATTER.format(new Date(receipt.paidAt)) : '—',
      reference: receipt.reference,
      receiptNumber: receipt.receiptNumber,
      simulated: receipt.paymentSimulated,
      blessing: receipt.blessingText
        ? { text: receipt.blessingText, reference: receipt.blessingRef ?? '' }
        : null,
    };
  });

  constructor() {
    this.load();
  }

  protected load(): void {
    if (!Number.isInteger(this.id) || this.id <= 0) {
      this.errorMessage.set('Contribution introuvable.');
      this.state.set('error');
      return;
    }
    this.state.set('loading');
    this.contributionService.getMyContributionDetail(this.id).subscribe({
      next: (receipt) => {
        this.receipt.set(receipt);
        this.state.set('ready');
      },
      error: (error: Error) => {
        this.errorMessage.set(error.message);
        this.state.set('error');
      },
    });
  }
}
