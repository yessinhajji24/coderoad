import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Level, Profile as ProfileData } from '../../models/models';

@Component({
  imports: [DatePipe, RouterLink],
  selector: 'app-profile',
  styleUrl: './profile.css',
  templateUrl: './profile.html',
})
export class Profile {
  private readonly api = inject(Api);

  protected readonly profile = signal<ProfileData | null>(null);
  protected readonly error = signal('');

  constructor() {
    this.api.getProfile().subscribe({
      next: (p) => this.profile.set(p),
      error: () => this.error.set('Impossible de charger le profil.'),
    });
  }

  protected percent(level: Level): number {
    return level.total === 0 ? 0 : Math.round((level.solved / level.total) * 100);
  }
}
