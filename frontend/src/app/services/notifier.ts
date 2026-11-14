import { Service, signal } from '@angular/core';

export interface ToastMessage {
  text: string;
  type: 'success' | 'error' | 'info';
}

// Petit service de notifications : n'importe quel composant peut appeler
// notifier.show('Bravo !', 'success') et le composant <app-toast> l'affiche.
@Service()
export class Notifier {
  readonly message = signal<ToastMessage | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(text: string, type: ToastMessage['type'] = 'info'): void {
    if (this.timer) clearTimeout(this.timer);
    this.message.set({ text, type });
    // le message disparaît tout seul après 3,5 secondes
    this.timer = setTimeout(() => this.message.set(null), 3500);
  }
}
