import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MemberService } from '../../../../core/services/member.service';
import { Contribution } from '../../../../core/models/contribution.model';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { AppInstallBannerComponent } from '../../../../shared/components/app-install-banner/app-install-banner';
import { BalanceCardComponent } from '../../../../shared/components/balance-card/balance-card';
import { BibleVerseCardComponent } from '../../../../shared/components/bible-verse-card/bible-verse-card';
import { ContributionItemComponent } from '../../../../shared/components/contribution-item/contribution-item';
import { NotificationButtonComponent } from '../../../../shared/components/notification-button/notification-button';
import { QuickActionComponent } from '../../../../shared/components/quick-action/quick-action';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    AppIconComponent,
    AppInstallBannerComponent,
    BalanceCardComponent,
    BibleVerseCardComponent,
    ContributionItemComponent,
    NotificationButtonComponent,
    QuickActionComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
})
export class DashboardPage {
  private readonly authService = inject(AuthService);
  private readonly memberService = inject(MemberService);

  protected readonly user = this.authService.currentUser;
  protected readonly yearTotal = signal(0);
  protected readonly currentYear = new Date().getFullYear();
  protected readonly contributions = signal<Contribution[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.memberService.getDashboardData().subscribe({
      next: (data) => {
        this.contributions.set(data.recentContributions);
        this.yearTotal.set(data.yearTotal);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected getFirstName(): string {
    const user = this.user();
    return user?.firstName || user?.fullName.split(' ')[0] || '';
  }
}