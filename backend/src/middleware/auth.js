// Middleware d'authentification.
// Un middleware est une fonction qui s'exécute AVANT la route : ici, elle vérifie
// que la requête contient un jeton JWT valide dans l'en-tête  Authorization: Bearer <jeton>
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Connexion requise.' });
  }

  try {
    // Si le jeton est faux ou expiré, jwt.verify lance une erreur
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id; // on garde l'identifiant pour les routes suivantes
    next();
  } catch {
    return res.status(401).json({ message: 'Session expirée, reconnectez-vous.' });
  }
}

module.exports = { requireAuth };
