// Logique "métier" : calcul de la progression d'un utilisateur.
// Elle est utilisée par plusieurs routes, donc on la met à part.
const pool = require('../db');

// Renvoie les 5 niveaux avec : total d'exercices, exercices réussis, et un statut.
//   done      = tous les exercices du niveau sont réussis
//   available = niveau 1, ou niveau dont le précédent est terminé
//   locked    = le niveau précédent n'est pas encore terminé
async function getLevelsProgress(userId) {
  const [rows] = await pool.query(
    `SELECT l.id, l.position, l.title, l.description,
            COUNT(DISTINCT e.id) AS total,
            COUNT(DISTINCT CASE WHEN a.is_correct = 1 THEN e.id END) AS solved
       FROM levels l
       LEFT JOIN exercises e ON e.level_id = l.id
       LEFT JOIN attempts a  ON a.exercise_id = e.id AND a.user_id = ?
      GROUP BY l.id, l.position, l.title, l.description
      ORDER BY l.position`,
    [userId]
  );

  let previousDone = true; // le niveau 1 est toujours ouvert
  return rows.map((r) => {
    const total = Number(r.total);
    const solved = Number(r.solved);
    const done = total > 0 && solved >= total;
    let status = 'locked';
    if (done) status = 'done';
    else if (previousDone) status = 'available';
    previousDone = done;
    return { id: r.id, position: r.position, title: r.title, description: r.description, total, solved, status };
  });
}

module.exports = { getLevelsProgress };
