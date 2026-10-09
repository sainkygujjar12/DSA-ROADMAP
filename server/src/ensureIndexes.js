require('dotenv').config({ quiet: true });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const models = ['User', 'Progress', 'Question', 'Topic', 'Company', 'Sheet'].map(name => require(`./models/${name}`));

async function main() {
  try {
    await connectDB();
    for (const model of models) {
      // Add declared indexes only; never drop existing indexes or seed data.
      await model.createIndexes();
      console.log(`${model.modelName} indexes ready`);
    }
  } finally { await mongoose.disconnect(); }
}
main().catch(error => {
  console.error(`Index setup failed (${error.name}); inspect database connectivity and duplicate keys.`);
  process.exitCode = 1;
});
