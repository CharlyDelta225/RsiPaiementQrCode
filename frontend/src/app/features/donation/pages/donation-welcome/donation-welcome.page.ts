import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../../../core/config/api.config';
import { ChurchLogoComponent } from '../../../../shared/components/church-logo/church-logo';

type QrState = 'loading' | 'ready' | 'error';

@Component({
  selector: 'app-donation-welcome',
  standalone: true,
  imports: [RouterLink, ChurchLogoComponent],
  templateUrl: './donation-welcome.page.html',
  styleUrl: './donation-welcome.page.scss',
})
export class DonationWelcomePage {
  readonly qrUrl = `${API_BASE_URL}/qr/church`;
  readonly qrState = signal<QrState>('loading');

  onQrLoaded(): void {
    this.qrState.set('ready');
  }

  onQrError(): void {
    this.qrState.set('error');
  }
}
