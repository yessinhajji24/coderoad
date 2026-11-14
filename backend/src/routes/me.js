// GET /api/me : le profil de l'utilisateur connecté, avec ses statistiques
const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { getLevelsProgress } = require('../services/progress');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.userId]);
    const user = users[0];
    if (!user) return res.status(404).json({ message: 'Utilisateur introuvable.' });

    // Statistiques globales calculées en SQL
    const [stats] = await pool.query(
      `SELECT COUNT(*) AS attempts,
              COALESCE(SUM(is_correct), 0) AS correct,
              COUNT(DISTINCT CASE WHEN is_correct = 1 THEN exercise_id END) AS solved
         FROM attempts WHERE user_id = ?`,
      [req.userId]
    );
    const attempts = Number(stats[0].attempts);
    const correct = Number(stats[0].correct);
    const solved = Number(stats[0].solved);

    const levels = await getLevelsProgress(req.userId);
    const doneLevels = levels.filter((l) => l.status === 'done').length;

    // Les badges sont déduits des statistiques (pas besoin de table supplémentaire)
    const badges = [
      { id: 'first', label: 'Premier pas', description: 'Réussir un premier exercice', earned: solved >= 1 },
      { id: 'five', label: 'En route', description: 'Réussir 5 exercices', earned: solved >= 5 },
      { id: 'level1', label: 'Bases acquises', description: 'Terminer le niveau 1', earned: levels[0]?.status === 'done' },
      { id: 'half', label: 'À mi-chemin', description: 'Terminer 3 niveaux', earned: doneLevels >= 3 },
      { id: 'all', label: 'Maître de la route', description: 'Terminer les 5 niveaux', earned: doneLevels >= 5 },
    ];

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.created_at,
      attempts,
      correct,
      solved,
      successRate: attempts > 0 ? Math.round((correct / attempts) * 100) : 0,
      points: solved * 10,
      levels,
      badges,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

module.exports = router;
