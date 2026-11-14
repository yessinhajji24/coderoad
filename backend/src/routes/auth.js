// Routes d'inscription et de connexion : POST /api/auth/register et POST /api/auth/login
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Fabrique un jeton JWT valable 7 jours, qui contient l'identifiant de l'utilisateur
function createToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// On ne renvoie JAMAIS le hash du mot de passe au navigateur
function publicUser(user) {
  return { id: user.id, username: user.username, email: user.email };
}

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body || {};

  // 1) Validation côté serveur (ne jamais faire confiance au navigateur)
  if (typeof username !== 'string' || username.trim().length < 3 || username.trim().length > 30) {
    return res.status(400).json({ message: 'Le nom d\'utilisateur doit contenir entre 3 et 30 caractères.' });
  }
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Adresse e-mail invalide.' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 6 caractères.' });
  }

  try {
    // 2) On stocke un HASH du mot de passe, jamais le mot de passe lui-même
    const passwordHash = await bcrypt.hash(password, 10);

    // 3) Requête préparée : les "?" empêchent les injections SQL
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = { id: result.insertId, username: username.trim(), email: email.trim().toLowerCase() };
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (err) {
    // ER_DUP_ENTRY = la contrainte UNIQUE (username ou email) est violée
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Ce nom d\'utilisateur ou cet e-mail est déjà utilisé.' });
    }
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ message: 'E-mail et mot de passe requis.' });
  }

  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    const user = rows[0];

    // Même message dans les deux cas : on ne révèle pas si l'e-mail existe
    const ok = user && (await bcrypt.compare(password, user.password_hash));
    if (!ok) {
      return res.status(401).json({ message: 'E-mail ou mot de passe incorrect.' });
    }

    res.json({ token: createToken(user), user: publicUser(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

module.exports = router;
