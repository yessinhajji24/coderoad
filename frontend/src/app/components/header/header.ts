import { Component, effect, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../services/auth';

type Theme = 'dark' | 'light';

function initialTheme(): Theme {
  try {
    return localStorage.getItem('coderoad_theme') === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  protected readonly auth = inject(Auth);
  protected readonly theme = signal<Theme>(initialTheme());

  constructor() {
    // Un "effect" se relance chaque fois que le signal qu'il lit change :
    // ici, à chaque changement de thème on met à jour la page et on mémorise le choix.
    effect(() => {
      const theme = this.theme();
      document.documentElement.setAttribute('data-theme', theme);
      try {
        localStorage.setItem('coderoad_theme', theme);
      } catch {
        /* ignoré */
      }
    });
  }

  protected toggleTheme(): void {
    this.theme.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  protected logout(): void {
    this.auth.logout('/');
  }
}
