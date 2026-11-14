// Test rapide de l'algorithme du visualiseur (sans navigateur).
// Lancer :  node --experimental-strip-types test-sort.mjs
import { selectionSortSteps } from './src/app/pages/visualizer/selection-sort.ts';

let erreurs = 0;
for (let essai = 0; essai < 2000; essai++) {
  // un tableau aléatoire de 2 à 12 nombres entre 1 et 99
  const n = 2 + Math.floor(Math.random() * 11);
  const tableau = Array.from({ length: n }, () => 1 + Math.floor(Math.random() * 99));

  const etapes = selectionSortSteps(tableau);
  const attendu = [...tableau].sort((a, b) => a - b);   // la "vraie" réponse, calculée par JavaScript
  const derniere = etapes[etapes.length - 1];

  // 1) à la fin, le tableau doit être trié
  if (JSON.stringify(derniere.array) !== JSON.stringify(attendu)) erreurs++;

  // 2) à chaque étape, la partie marquée "triée" doit déjà contenir les plus petits éléments, dans l'ordre
  for (const etape of etapes) {
    const debut = etape.array.slice(0, etape.sorted);
    if (JSON.stringify(debut) !== JSON.stringify(attendu.slice(0, etape.sorted))) { erreurs++; break; }
  }
}
console.log(erreurs === 0 ? 'OK : 2000 tableaux triés correctement' : `ÉCHEC : ${erreurs} erreur(s)`);
process.exit(erreurs === 0 ? 0 : 1);
