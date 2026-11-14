import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth-interceptor';

// La configuration globale de l'application : ce qu'on "active" pour tout le site.
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),                                   // la navigation
    provideHttpClient(withInterceptors([authInterceptor])),  // les appels HTTP + notre intercepteur
  ],
};
