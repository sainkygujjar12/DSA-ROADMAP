const Progress = require('../models/Progress');
const { setTimeout: delay } = require('node:timers/promises');

async function ensureProgress(userId) {
  try {
    await Progress.updateOne({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true });
  } catch (error) {
    // Another first request may have created this user's unique document.
    if (error.code !== 11000) throw error;
  }
}

async function mutateProgress(userId, mutate) {
  await ensureProgress(userId);
  for (let attempt = 0; attempt < 5; attempt++) {
    const progress = await Progress.findOne({ user: userId });
    if (!progress) throw new Error('Progress no longer exists');
    // All changes to counters, question sets, notes and activity are committed
    // together with a version check. A conflict recomputes from fresh state.
    mutate(progress);
    try {
      await progress.save();
      return progress;
    } catch (error) {
      if (error.name !== 'VersionError') throw error;
      if (attempt === 4) {
        const conflict = new Error('Progress changed in another tab. Please try again.');
        conflict.statusCode = 409;
        throw conflict;
      }
      await delay(10 * (attempt + 1));
    }
  }
}

module.exports = { ensureProgress, mutateProgress };
