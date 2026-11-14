import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Notifier } from '../../services/notifier';
import { AttemptResult, Exercise } from '../../models/models';

@Component({
  imports: [RouterLink],
  selector: 'app-exercises',
  styleUrl: './exercises.css',
  templateUrl: './exercises.html',
})
export class Exercises {
  private readonly api = inject(Api);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  // Le niveau vient de l'adresse : /exercises?level=2
  protected readonly levelId = Number(this.route.snapshot.queryParamMap.get('level'));

  protected readonly exercises = signal<Exercise[]>([]);
  protected readonly index = signal(0);                 // question en cours
  protected readonly selected = signal<number | null>(null);   // option cochée
  protected readonly result = signal<AttemptResult | null>(null); // réponse du serveur
  protected readonly score = signal(0);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly finished = signal(false);

  protected readonly current = computed(() => this.exercises()[this.index()]);
  protected readonly percent = computed(() =>
    this.exercises().length === 0 ? 0 : Math.round((this.index() / this.exercises().length) * 100)
  );
  protected readonly letters = ['A', 'B', 'C', 'D', 'E', 'F'];

  constructor() {
    // Sans numéro de niveau valide, cette page n'a pas de sens : retour à la roadmap
    if (!Number.isInteger(this.levelId) || this.levelId < 1) {
      this.router.navigateByUrl('/roadmap');
      return;
    }
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.finished.set(false);
    this.index.set(0);
    this.score.set(0);
    this.resetQuestion();

    this.api.getExercises(this.levelId).subscribe({
      next: (list) => {
        this.exercises.set(list);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? 'Impossible de charger les exercices.');
        this.loading.set(false);
      },
    });
  }

  // On ne peut plus changer sa réponse une fois validée
  protected select(i: number): void {
    if (this.result() === null) this.selected.set(i);
  }

  protected validate(): void {
    const choice = this.selected();
    const exercise = this.current();
    if (choice === null || !exercise || this.submitting()) return;

    this.submitting.set(true);
    this.api.submitAttempt(exercise.id, choice).subscribe({
      next: (res) => {
        this.result.set(res);
        if (res.correct) this.score.update((s) => s + 1);
        this.submitting.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.notifier.show(err.error?.message ?? 'Erreur lors de l\'envoi de la réponse.', 'error');
        this.submitting.set(false);
      },
    });
  }

  protected next(): void {
    if (this.index() + 1 >= this.exercises().length) {
      this.finished.set(true);
      this.notifier.show(`Niveau terminé : ${this.score()} / ${this.exercises().length}`, 'success');
      return;
    }
    this.index.update((i) => i + 1);
    this.resetQuestion();
  }

  private resetQuestion(): void {
    this.selected.set(null);
    this.result.set(null);
  }

  // Classe CSS d'une option selon l'état de la question (pour colorer la bonne/mauvaise réponse)
  protected optionClass(i: number): string {
    const r = this.result();
    if (r) {
      if (i === r.correctIndex) return 'correct';
      if (i === this.selected()) return 'wrong';
      return '';
    }
    return i === this.selected() ? 'selected' : '';
  }
}
