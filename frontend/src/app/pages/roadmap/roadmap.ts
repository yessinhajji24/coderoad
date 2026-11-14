import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Level } from '../../models/models';

@Component({
  imports: [RouterLink],
  selector: 'app-roadmap',
  styleUrl: './roadmap.css',
  templateUrl: './roadmap.html',
})
export class Roadmap {
  private readonly api = inject(Api);

  protected readonly levels = signal<Level[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  // Progression globale : exercices réussis / exercices au total
  protected readonly percent = computed(() => {
    const total = this.levels().reduce((sum, l) => sum + l.total, 0);
    const solved = this.levels().reduce((sum, l) => sum + l.solved, 0);
    return total === 0 ? 0 : Math.round((solved / total) * 100);
  });

  // Le niveau à proposer en priorité : le premier niveau "available"
  protected readonly current = computed(() => this.levels().find((l) => l.status === 'available'));

  constructor() {
    // Dès que la page se crée, on demande les niveaux à l'API
    this.api.getLevels().subscribe({
      next: (levels) => {
        this.levels.set(levels);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger la roadmap. Vérifiez que l\'API est lancée.');
        this.loading.set(false);
      },
    });
  }

  protected statusLabel(level: Level): string {
    return { done: 'Terminé', available: 'Disponible', locked: 'Verrouillé' }[level.status];
  }
}
