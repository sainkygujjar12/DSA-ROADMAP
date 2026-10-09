const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
// Never implicitly use the app's .env or seed/delete existing catalog data.
if (!process.env.TEST_MONGO_URI) throw new Error('TEST_MONGO_URI must point to a test database');
const Progress = require('../src/models/Progress');
const Question = require('../src/models/Question');
require('../src/models/Topic');
require('../src/models/Company');
require('../src/models/Sheet');
const service = require('../src/services/progress.service');
const userId = new mongoose.Types.ObjectId();
const questionIds = Array.from({ length: 4 }, () => new mongoose.Types.ObjectId());

test.before(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  await Progress.createIndexes();
  await Question.insertMany(questionIds.map((id, index) => ({ _id: id, title: `Concurrency fixture ${index}`, slug: `test-${id}`, difficulty: 'Easy', topic: new mongoose.Types.ObjectId(), resourceUrl: 'https://example.com/test' })));
});
test.after(async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Progress.deleteMany({ user: userId });
      await Question.deleteMany({ _id: { $in: questionIds } });
    }
  } finally { await mongoose.disconnect(); }
});

test('simultaneous first solves preserve all IDs, counters and activity', async () => {
  await Promise.all(questionIds.map(id => service.toggleSolvedQuestion(String(userId), String(id))));
  const progress = await Progress.findOne({ user: userId });
  assert.equal(await Progress.countDocuments({ user: userId }), 1);
  assert.equal(progress.solvedQuestions.length, 4);
  assert.equal(new Set(progress.solvedQuestions.map(String)).size, 4);
  assert.equal(progress.easySolved, 4);
  assert.equal(progress.activity.reduce((sum, entry) => sum + entry.count, 0), 4);
  assert.equal(progress.streak, 1);
});
test('parallel bookmark, note, last-visit and unsolve changes do not overwrite each other', async () => {
  const uid = String(userId), qid = String(questionIds[0]);
  await Promise.all([
    service.toggleBookmark(uid, qid), service.saveNotes(uid, qid, 'Keep this note'),
    service.updateLastVisitedQuestion(uid, qid), service.toggleSolvedQuestion(uid, qid),
  ]);
  const progress = await Progress.findOne({ user: userId });
  assert.equal(progress.solvedQuestions.length, 3);
  assert.equal(progress.easySolved, 3);
  assert.deepEqual(progress.bookmarkedQuestions.map(String), [qid]);
  assert.equal(progress.notes[0].content, 'Keep this note');
  assert.equal(String(progress.lastVisitedQuestion), qid);
});
test('stale saves are rejected rather than losing a more recent change', async () => {
  const first = await Progress.findOne({ user: userId });
  const stale = await Progress.findOne({ user: userId });
  first.notes[0].content = 'Newer note';
  await first.save();
  stale.notes[0].content = 'Stale note';
  await assert.rejects(stale.save(), { name: 'VersionError' });
  assert.equal((await Progress.findOne({ user: userId })).notes[0].content, 'Newer note');
});
