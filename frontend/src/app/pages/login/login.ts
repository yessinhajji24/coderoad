import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Notifier } from '../../services/notifier';

type Mode = 'login' | 'register';

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notifier = inject(Notifier);

  // La même page sert à se connecter et à créer un compte
  protected readonly mode = signal<Mode>(
    this.route.snapshot.queryParamMap.get('mode') === 'register' ? 'register' : 'login'
  );
  protected readonly loading = signal(false);
  protected readonly serverError = signal('');

  // Formulaire réactif : on décrit les champs et leurs règles de validation en TypeScript
  protected readonly form = this.fb.group({
    username: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  constructor() {
    this.applyModeValidators();
  }

  protected setMode(mode: Mode): void {
    this.mode.set(mode);
    this.serverError.set('');
    this.applyModeValidators();
  }

  // Le nom d'utilisateur n'est obligatoire que pour l'inscription
  private applyModeValidators(): void {
    const username = this.form.controls.username;
    if (this.mode() === 'register') {
      username.setValidators([Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
    } else {
      username.clearValidators();
    }
    username.updateValueAndValidity();
  }

  protected submit(): void {
    this.form.markAllAsTouched(); // affiche les erreurs de tous les champs
    if (this.form.invalid || this.loading()) return;

    const { username, email, password } = this.form.getRawValue();
    const request$ =
      this.mode() === 'login'
        ? this.auth.login(email, password)
        : this.auth.register(username, email, password);

    this.loading.set(true);
    this.serverError.set('');

    request$.subscribe({
      next: (res) => {
        this.notifier.show(`Bienvenue, ${res.user.username} !`, 'success');
        this.router.navigateByUrl(this.safeReturnUrl());
      },
      error: (err: HttpErrorResponse) => {
        this.serverError.set(err.error?.message ?? 'Impossible de contacter le serveur.');
        this.loading.set(false);
      },
    });
  }

  // On revient à la page demandée avant la connexion, mais seulement si c'est une adresse interne
  private safeReturnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/') && !url.startsWith('//') ? url : '/roadmap';
  }
}
