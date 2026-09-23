import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ChurchLogoComponent } from '../../../../shared/components/church-logo/church-logo';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [RouterLink, ChurchLogoComponent],
  templateUrl: './welcome.page.html',
  styleUrl: './welcome.page.scss',
})
export class WelcomePage {}