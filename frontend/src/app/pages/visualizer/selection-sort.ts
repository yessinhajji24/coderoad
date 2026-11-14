// Le cœur du visualiseur : on exécute le tri par sélection UNE FOIS, en notant
// chaque étape dans un tableau. L'animation ne fait ensuite que se déplacer dans ce tableau
// (avancer, reculer, pause). C'est ce qui rend les boutons « précédent » et « début » faciles.

export interface SortStep {
  array: number[];   // l'état du tableau à cette étape
  i: number;         // indice du tour en cours (-1 : aucun)
  j: number;         // indice de l'élément comparé (-1 : aucun)
  min: number;       // indice du minimum courant (-1 : aucun)
  sorted: number;    // nombre de cases déjà triées au début du tableau
  line: number;      // ligne du pseudo-code à surligner (-1 : aucune)
  message: string;   // explication affichée à l'utilisateur
}

export interface CodeLine {
  indent: number;
  text: string;
}

// Les numéros de ligne (0 à 5) correspondent au champ "line" de chaque étape
export const PSEUDO_CODE: CodeLine[] = [
  { indent: 0, text: 'pour i de 0 à n-2 :' },
  { indent: 1, text: 'min = i' },
  { indent: 1, text: 'pour j de i+1 à n-1 :' },
  { indent: 2, text: 'si T[j] < T[min] :' },
  { indent: 3, text: 'min = j' },
  { indent: 1, text: 'échanger T[i] et T[min]' },
];

export function selectionSortSteps(input: number[]): SortStep[] {
  const a = [...input]; // on travaille sur une copie : le tableau d'origine n'est pas modifié
  const n = a.length;
  const steps: SortStep[] = [];

  // Enregistre une étape en y copiant l'état actuel du tableau
  const push = (step: Omit<SortStep, 'array'>) => steps.push({ ...step, array: [...a] });

  push({ i: -1, j: -1, min: -1, sorted: 0, line: -1, message: 'Tableau de départ. Lancez la lecture ou avancez étape par étape.' });

  for (let i = 0; i < n - 1; i++) {
    let min = i;
    push({ i, j: -1, min, sorted: i, line: 1,
      message: `Tour ${i + 1} : on suppose que le minimum est T[${i}] = ${a[min]}.` });

    for (let j = i + 1; j < n; j++) {
      push({ i, j, min, sorted: i, line: 3,
        message: `On compare T[${j}] = ${a[j]} avec le minimum actuel T[${min}] = ${a[min]}.` });

      if (a[j] < a[min]) {
        min = j;
        push({ i, j, min, sorted: i, line: 4,
          message: `${a[j]} est plus petit : le nouveau minimum est T[${j}] = ${a[j]}.` });
      }
    }

    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      push({ i, j: -1, min: -1, sorted: i + 1, line: 5,
        message: `On échange T[${i}] et T[${min}] : ${a[i]} est maintenant à sa place définitive.` });
    } else {
      push({ i, j: -1, min: -1, sorted: i + 1, line: 5,
        message: `Le minimum est déjà en T[${i}] : aucun échange nécessaire, ${a[i]} est à sa place.` });
    }
  }

  push({ i: -1, j: -1, min: -1, sorted: n, line: -1, message: 'Le tableau est trié !' });
  return steps;
}
