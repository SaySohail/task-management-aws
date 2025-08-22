// server/index.js
const path = require('path');
const dotenv = require('dotenv');

// Load .env only for local/dev; on EB we use Environment Properties
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: path.join(__dirname, '.env') });
} else {
  dotenv.config(); // harmless no-op if no file exists
}

const { MONGODB_URI, PORT = 8081, CORS_ORIGIN } = process.env;

// Fail fast if DB URI is missing (prevents endless restarts)
if (!MONGODB_URI) {
  console.error(
    '❌ MONGODB_URI is not set.\n' +
    '   • Local dev: create server/.env with MONGODB_URI=...\n' +
    '   • Elastic Beanstalk: Configuration → Software → Environment properties → add MONGODB_URI'
  );
  process.exit(1);
}

const express = require('express');
const cors = require('cors');

// Connect DB (expects process.env.MONGODB_URI inside ./models/db)
require('./models/db');

const app = express();

// Trust proxy (good for health checks / correct IPs on EB/ALB)
app.set('trust proxy', 1);

// Middleware
app.use(express.json()); // replaces body-parser.json()
app.use(
  cors(
    CORS_ORIGIN
      ? { origin: CORS_ORIGIN.split(',').map(s => s.trim()), credentials: true }
      : {} // default: reflect request origin or allow all (adjust if needed)
  )
);

// Routes (API first so they don't get caught by static fallback)
app.use('/auth', require('./routes/AuthRouter'));
app.use('/api', require('./routes/TaskRouter'));

// Health endpoints for EB
app.get('/ping', (_req, res) => res.send('Pong'));
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// --- Static frontend (Next.js export output copied to server/public) ---
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir, { maxAge: '1h' })); // serves assets

// SPA fallback: serve index.html for any non-API route
app.get('*', (req, res) => {
  // If you exported a custom 404.html and prefer that, switch to it here.
  res.sendFile(path.join(publicDir, 'index.html'), err => {
    if (err) {
      console.error('Failed to send index.html:', err);
      res.status(500).send('Internal Server Error');
    }
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

// Graceful shutdown (useful on EB during instance rotations)
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully…');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
