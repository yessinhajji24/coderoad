// GET /api/levels : la roadmap de l'utilisateur connecté (niveaux + progression + statut)
const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { getLevelsProgress } = require('../services/progress');

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    res.json(await getLevelsProgress(req.userId));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

module.exports = router;
