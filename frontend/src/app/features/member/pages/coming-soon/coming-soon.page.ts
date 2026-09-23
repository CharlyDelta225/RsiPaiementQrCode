import { Component, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink, AppIconComponent],
  templateUrl: './coming-soon.page.html',
  styleUrl: './coming-soon.page.scss',
})
export class ComingSoonPage {
  protected readonly headline = computed(() => {
    const segment = this.router.url.split('/').pop() ?? '';
    switch (segment) {
      case 'contribution':
        return 'Nouvelle contribution';
      case 'contributions':
        return 'Mes contributions';
      case 'profile':
        return 'Mon profil';
      default:
        return 'Bientôt disponible';
    }
  });

  constructor(private readonly router: Router) {}
}