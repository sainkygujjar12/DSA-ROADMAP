const mongoose = require('mongoose');
// One reusable pool per process. Bound queues/timeouts so a cluster outage
// cannot accumulate indefinitely buffered requests in the API process.
mongoose.set('bufferCommands', false);
mongoose.set('maxTimeMS', 10000);
module.exports = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: Number(process.env.MONGO_MAX_POOL_SIZE || 20),
    minPoolSize: 0,
    maxIdleTimeMS: 60000,
    waitQueueTimeoutMS: 5000,
    serverSelectionTimeoutMS: 10000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 20000,
    retryWrites: true,
    w: 'majority',
    autoIndex: process.env.NODE_ENV !== 'production',
  });
  console.log('MongoDB connected');
};
