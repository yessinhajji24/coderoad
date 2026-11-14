// GET  /api/exercises?level=2 : les questions d'un niveau (SANS la bonne réponse)
// POST /api/attempts          : envoie une réponse, le serveur la corrige
const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getLevelsProgress } = require('../services/progress');

const router = express.Router();

// MySQL renvoie la colonne JSON déjà convertie, MariaDB la renvoie en texte :
// cette petite fonction gère les deux cas.
function parseOptions(value) {
  return typeof value === 'string' ? JSON.parse(value) : value;
}

// Vérifie qu'un niveau est ouvert pour cet utilisateur
async function isLevelUnlocked(userId, levelId) {
  const levels = await getLevelsProgress(userId);
  const level = levels.find((l) => l.id === levelId);
  return level ? level.status !== 'locked' : false;
}

router.get('/exercises', requireAuth, async (req, res) => {
  const levelId = Number(req.query.level);
  if (!Number.isInteger(levelId) || levelId < 1) {
    return res.status(400).json({ message: 'Paramètre « level » invalide.' });
  }

  try {
    if (!(await isLevelUnlocked(req.userId, levelId))) {
      return res.status(403).json({ message: 'Ce niveau est verrouillé : terminez le précédent.' });
    }

    const [rows] = await pool.query(
      'SELECT id, level_id, question, options FROM exercises WHERE level_id = ? ORDER BY id',
      [levelId]
    );

    // Important : on n'envoie ni correct_index ni explanation, sinon on pourrait tricher
    res.json(rows.map((r) => ({
      id: r.id,
      levelId: r.level_id,
      question: r.question,
      options: parseOptions(r.options),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

router.post('/attempts', requireAuth, async (req, res) => {
  const { exerciseId, choice } = req.body || {};
  if (!Number.isInteger(exerciseId) || !Number.isInteger(choice)) {
    return res.status(400).json({ message: 'exerciseId et choice doivent être des entiers.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM exercises WHERE id = ?', [exerciseId]);
    const exercise = rows[0];
    if (!exercise) return res.status(404).json({ message: 'Exercice introuvable.' });

    if (!(await isLevelUnlocked(req.userId, exercise.level_id))) {
      return res.status(403).json({ message: 'Ce niveau est verrouillé.' });
    }

    const options = parseOptions(exercise.options);
    if (choice < 0 || choice >= options.length) {
      return res.status(400).json({ message: 'Choix invalide.' });
    }

    // La correction se fait côté serveur
    const correct = choice === exercise.correct_index;
    await pool.query(
      'INSERT INTO attempts (user_id, exercise_id, chosen_index, is_correct) VALUES (?, ?, ?, ?)',
      [req.userId, exerciseId, choice, correct]
    );

    res.json({ correct, correctIndex: exercise.correct_index, explanation: exercise.explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

module.exports = router;
