import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { roleLabel, userInitials } from '../../../../core/models/user.model';
import { AuthService } from '../../../../core/services/auth.service';
import { InstallPromptService } from '../../../../core/services/install-prompt.service';
import { AppIconComponent } from '../../../../shared/components/app-icon/app-icon';
import { LogoutDialogComponent } from '../../../../shared/components/logout-dialog/logout-dialog';

/**
 * Écran « Réglages » façon application mobile : carte profil, rubriques en liste,
 * déconnexion tout en bas.
 */
@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterLink, AppIconComponent, LogoutDialogComponent],
  templateUrl: './settings.page.html',
  styleUrl: './settings.page.scss',
})
export class SettingsPage {
  private readonly authService = inject(AuthService);
  private readonly install = inject(InstallPromptService);

  protected readonly account = computed(() => {
    const user = this.authService.currentUser();
    if (!user) {
      return null;
    }
    return {
      initials: userInitials(user),
      name: user.fullName,
      phone: user.phone,
      email: user.email,
      role: roleLabel(user),
      temple: user.templeName,
    };
  });
  protected readonly canInstall = this.install.canInstallOnDemand;

  protected async installApp(): Promise<void> {
    await this.install.prompt(true);
  }
}
