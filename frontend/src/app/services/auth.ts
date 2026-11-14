import { Service, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User } from '../models/models';

const TOKEN_KEY = 'coderoad_token';
const USER_KEY = 'coderoad_user';

// localStorage peut être indisponible (navigation privée, par exemple) :
// on entoure donc chaque accès d'un try/catch pour que le site ne plante jamais.
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* on ignore : la session ne sera simplement pas mémorisée */
  }
}
function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* on ignore */
  }
}
function parseUser(json: string | null): User | null {
  try {
    return json ? (JSON.parse(json) as User) : null;
  } catch {
    return null;
  }
}

// Ce service garde l'état de connexion : "qui est connecté ?"
// Il est partagé par toute l'application (une seule instance).
@Service()
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Un "signal" est une valeur observable : quand elle change,
  // tous les endroits qui la lisent se mettent à jour automatiquement.
  readonly token = signal<string | null>(readStorage(TOKEN_KEY));
  readonly user = signal<User | null>(parseUser(readStorage(USER_KEY)));

  // Un "computed" est une valeur calculée à partir d'autres signaux
  readonly isLoggedIn = computed(() => this.token() !== null);

  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/register', { username, email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(tap((res) => this.saveSession(res)));
  }

  logout(redirectTo = '/'): void {
    this.token.set(null);
    this.user.set(null);
    removeStorage(TOKEN_KEY);
    removeStorage(USER_KEY);
    this.router.navigateByUrl(redirectTo);
  }

  private saveSession(res: AuthResponse): void {
    this.token.set(res.token);
    this.user.set(res.user);
    writeStorage(TOKEN_KEY, res.token);
    writeStorage(USER_KEY, JSON.stringify(res.user));
  }
}
