import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  imports: [RouterLink],
  selector: 'app-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  protected readonly auth = inject(Auth);

  // Les 3 fonctionnalités indispensables du cahier des charges (Objectif 1)
  protected readonly features = [
    {
      title: 'Une roadmap par niveaux',
      text: 'Cinq niveaux, des bases à la programmation dynamique. Un niveau se débloque quand le précédent est maîtrisé.',
    },
    {
      title: 'Des animations pas à pas',
      text: 'Regardez un algorithme s\'exécuter étape par étape, avec le pseudo-code qui s\'illumine en même temps.',
    },
    {
      title: 'Des exercices corrigés',
      text: 'Entraînez-vous avec des QCM : la correction est immédiate, et chaque réponse est expliquée.',
    },
  ];
}
