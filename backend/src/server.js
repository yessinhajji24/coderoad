// Point d'entrée de l'API : on branche les middlewares et les routes, puis on écoute le port.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET manquant : copiez .env.example vers .env et complétez-le.');
  process.exit(1);
}

const app = express();

app.use(cors());          // autorise le frontend (autre port) à appeler l'API
app.use(express.json());  // permet de lire le corps JSON des requêtes

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/levels', require('./routes/levels'));
app.use('/api/me', require('./routes/me'));
app.use('/api', require('./routes/exercises')); // /api/exercises et /api/attempts

// Route inconnue
app.use((req, res) => res.status(404).json({ message: 'Route introuvable.' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API CodeRoad : http://localhost:${port}`));
