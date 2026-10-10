import { Component, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { LegalLinksComponent } from '../../../../shared/components/legal-links/legal-links';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink, AppIconComponent, LegalLinksComponent],
  templateUrl: './terms.page.html',
  styleUrl: '../_legal-page.scss',
})
export class TermsPage {
  private readonly location = inject(Location);
  private readonly router = inject(Router);

  protected back(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/welcome']);
    }
  }
}
