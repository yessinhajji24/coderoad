import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Auth } from '../services/auth';
import { Notifier } from '../services/notifier';

// Un intercepteur "s'accroche" à CHAQUE requête HTTP de l'application.
// Ici il fait deux choses :
//   1) il ajoute le jeton JWT dans l'en-tête Authorization ;
//   2) si le serveur répond 401 (jeton expiré), il déconnecte l'utilisateur.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);
  const notifier = inject(Notifier);
  const token = auth.token();

  const isApiCall = req.url.startsWith('/api');
  const request =
    token && isApiCall
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRoute = req.url.startsWith('/api/auth');
      if (err.status === 401 && token && !isAuthRoute) {
        notifier.show('Votre session a expiré, reconnectez-vous.', 'error');
        auth.logout('/login');
      }
      return throwError(() => err);
    })
  );
};
