import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { PSEUDO_CODE, selectionSortSteps } from './selection-sort';

type BarState = 'sorted' | 'compared' | 'min' | 'idle';

const BAR_WIDTH = 40;
const BAR_GAP = 12;
const CHART_HEIGHT = 190; // hauteur maximale d'une barre (en unités du dessin SVG)

@Component({
  selector: 'app-visualizer',
  styleUrl: './visualizer.css',
  templateUrl: './visualizer.html',
})
export class Visualizer {
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pseudoCode = PSEUDO_CODE;

  // ----- État de l'animation (tous des signaux) -----
  protected readonly values = signal<number[]>([7, 3, 9, 5, 2, 8, 4, 6]);
  protected readonly index = signal(0);        // numéro de l'étape affichée
  protected readonly playing = signal(false);
  protected readonly speed = signal(700);      // durée d'une étape en millisecondes
  protected readonly inputError = signal('');

  // ----- Valeurs calculées automatiquement -----
  // Dès que "values" change, les étapes sont recalculées
  protected readonly steps = computed(() => selectionSortSteps(this.values()));
  protected readonly last = computed(() => this.steps().length - 1);
  protected readonly step = computed(() => this.steps()[this.index()]);
  protected readonly chartWidth = computed(() => this.values().length * (BAR_WIDTH + BAR_GAP));

  // Une "barre" par case du tableau, avec sa position, sa hauteur et son état (donc sa couleur)
  protected readonly bars = computed(() => {
    const s = this.step();
    const maxValue = Math.max(...s.array, 1);
    return s.array.map((value, k) => {
      let state: BarState = 'idle';
      if (k < s.sorted) state = 'sorted';
      else if (k === s.j) state = 'compared';
      else if (k === s.min) state = 'min';
      const height = (value / maxValue) * CHART_HEIGHT;
      return { k, value, state, x: k * (BAR_WIDTH + BAR_GAP), y: CHART_HEIGHT - height + 22, height };
    });
  });

  protected readonly barWidth = BAR_WIDTH;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Quand on quitte la page, on arrête le minuteur (sinon il tournerait pour rien)
    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  // ----- Boutons du lecteur -----
  protected next(): void {
    if (this.index() < this.last()) this.index.update((i) => i + 1);
    else this.pause();
  }

  protected prev(): void {
    this.pause();
    if (this.index() > 0) this.index.update((i) => i - 1);
  }

  protected first(): void {
    this.pause();
    this.index.set(0);
  }

  protected end(): void {
    this.pause();
    this.index.set(this.last());
  }

  protected toggle(): void {
    if (this.playing()) {
      this.pause();
      return;
    }
    if (this.index() >= this.last()) this.index.set(0); // on rejoue depuis le début
    this.playing.set(true);
    this.startTimer();
  }

  private pause(): void {
    this.playing.set(false);
    this.stopTimer();
  }

  // ----- Vitesse -----
  protected onSpeed(event: Event): void {
    // Le curseur va de 200 (lent) à 1500 ; on l'inverse pour que "plus à droite = plus rapide"
    const slider = Number((event.target as HTMLInputElement).value);
    this.speed.set(1700 - slider);
    if (this.playing()) this.startTimer(); // on redémarre le minuteur avec la nouvelle vitesse
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => this.next(), this.speed());
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // ----- Choisir son propre tableau -----
  protected random(): void {
    const arr = Array.from({ length: 8 }, () => 1 + Math.floor(Math.random() * 9));
    this.setValues(arr);
  }

  protected apply(text: string): void {
    // "7, 3 9;5" -> [7, 3, 9, 5]
    const parts = text.split(/[\s,;]+/).filter((p) => p !== '');
    const numbers = parts.map(Number);

    if (numbers.length < 2 || numbers.length > 12) {
      this.inputError.set('Entrez entre 2 et 12 nombres.');
      return;
    }
    if (numbers.some((n) => !Number.isInteger(n) || n < 1 || n > 99)) {
      this.inputError.set('Utilisez uniquement des nombres entiers entre 1 et 99.');
      return;
    }
    this.setValues(numbers);
  }

  private setValues(arr: number[]): void {
    this.pause();
    this.inputError.set('');
    this.values.set(arr);
    this.index.set(0);
  }
}
