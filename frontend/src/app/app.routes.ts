import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Roadmap } from './pages/roadmap/roadmap';
import { Visualizer } from './pages/visualizer/visualizer';
import { Exercises } from './pages/exercises/exercises';
import { Profile } from './pages/profile/profile';

// Chaque route associe une adresse (path) à une page (component).
// canActivate: [authGuard] = page réservée aux utilisateurs connectés.
export const routes: Routes = [
  { path: '', component: Home, title: 'CodeRoad - Accueil' },
  { path: 'login', component: Login, title: 'CodeRoad - Connexion' },
  { path: 'roadmap', component: Roadmap, canActivate: [authGuard], title: 'CodeRoad - Roadmap' },
  { path: 'visualizer', component: Visualizer, title: 'CodeRoad - Visualiseur' },
  { path: 'exercises', component: Exercises, canActivate: [authGuard], title: 'CodeRoad - Exercices' },
  { path: 'profile', component: Profile, canActivate: [authGuard], title: 'CodeRoad - Profil' },
  { path: '**', redirectTo: '' }, // toute adresse inconnue renvoie à l'accueil
];
