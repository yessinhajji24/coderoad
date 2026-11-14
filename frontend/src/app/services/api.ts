import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AttemptResult, Exercise, Level, Profile } from '../models/models';

// Toutes les requêtes vers l'API (hors connexion) passent par ce service.
// Les composants n'écrivent donc jamais d'URL : ils appellent simplement une méthode.
// Le jeton JWT est ajouté automatiquement par l'intercepteur.
@Service()
export class Api {
  private readonly http = inject(HttpClient);

  getLevels(): Observable<Level[]> {
    return this.http.get<Level[]>('/api/levels');
  }

  getExercises(levelId: number): Observable<Exercise[]> {
    return this.http.get<Exercise[]>('/api/exercises', { params: { level: levelId } });
  }

  submitAttempt(exerciseId: number, choice: number): Observable<AttemptResult> {
    return this.http.post<AttemptResult>('/api/attempts', { exerciseId, choice });
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>('/api/me');
  }
}
