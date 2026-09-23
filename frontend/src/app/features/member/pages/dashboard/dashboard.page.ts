import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { MemberService } from '../../../../core/services/member.service';
import { Contribution } from '../../../../core/models/contribution.model';
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
  protected readonly balance = this.memberService.balance;
  protected readonly contributions = signal<Contribution[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.memberService.getDashboardData().subscribe({
      next: (data) => this.contributions.set(data.recentContributions),
      complete: () => this.loading.set(false),
    });
  }

  protected getFirstName(): string {
    const user = this.user();
    return user ? user.fullName.split(' ')[0] : 'Jean';
  }
}