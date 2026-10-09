require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const fs = require('node:fs');
const path = require('node:path');
const validateEnvironment = require('./config/environment');
const connectDB = require('./config/db');
async function start() {
  validateEnvironment();
  if (process.env.NODE_ENV === 'production' && !fs.existsSync(path.resolve(__dirname, '../../client/dist/index.html'))) {
    throw new Error('Build the frontend before starting production');
  }
  await connectDB();
  const app = require('./app');
  const port = Number(process.env.PORT) || 8000;
  const server = app.listen(port, '0.0.0.0', error => {
    if (!error) console.log(`API listening on port ${port}`);
  });
  server.on('error', error => { console.error(`Server failed (${error.code || error.name})`); process.exitCode = 1; mongoose.disconnect(); });
  const shutdown = () => {
    server.close(async () => { await mongoose.disconnect(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}
start().catch(error => { console.error(`Startup failed (${error.name}): check database connectivity and required environment settings.`); process.exitCode = 1; });
