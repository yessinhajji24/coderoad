import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Une garde de route décide si on a le droit d'ouvrir une page.
// Si l'utilisateur n'est pas connecté, on le renvoie vers /login
// en mémorisant la page demandée (returnUrl) pour y revenir après la connexion.
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isLoggedIn()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
