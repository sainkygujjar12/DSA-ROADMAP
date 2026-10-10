const test = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
if (!process.env.TEST_MONGO_URI) throw new Error('TEST_MONGO_URI must point to a test database');
const Topic = require('../src/models/Topic');
const Question = require('../src/models/Question');
const Company = require('../src/models/Company');
const Sheet = require('../src/models/Sheet');
const Progress = require('../src/models/Progress');
const { catalogCache } = require('../src/utils/catalogCache');
const { getAllTopics } = require('../src/controllers/topic.controller');
const { getCompanies } = require('../src/services/company.service');
const { getSheets } = require('../src/services/sheet.service');
const { getProgressSummary } = require('../src/services/progress.service');
const ids = Object.fromEntries(['topic', 'question', 'company', 'sheet', 'userA', 'userB'].map(key => [key, new mongoose.Types.ObjectId()]));
const slug = `catalog-test-${ids.topic}`;

test.before(async () => {
  await mongoose.connect(process.env.TEST_MONGO_URI, { serverSelectionTimeoutMS: 10000 });
  await Topic.create({ _id: ids.topic, name: slug, slug, order: 999 });
  await Company.create({ _id: ids.company, name: slug, slug });
  await Question.create({ _id: ids.question, title: slug, slug, topic: ids.topic, difficulty: 'Easy', companies: [ids.company], resourceUrl: 'https://example.com/question' });
  await Sheet.create({ _id: ids.sheet, name: slug, slug, entries: [1, 2].map(order => ({ order, title: `Entry ${order}`, section: 'Arrays', resourceUrl: 'https://example.com/question', question: ids.question })) });
  await Progress.create({ user: ids.userA, solvedQuestions: [ids.question], notes: [{ question: ids.question, content: 'Private note' }] });
});
test.after(async () => {
  catalogCache.clear();
  try {
    if (mongoose.connection.readyState === 1) await Promise.all([
      Topic.deleteOne({ _id: ids.topic }), Question.deleteOne({ _id: ids.question }),
      Company.deleteOne({ _id: ids.company }), Sheet.deleteOne({ _id: ids.sheet }),
      Progress.deleteMany({ user: { $in: [ids.userA, ids.userB] } }),
    ]);
  } finally { await mongoose.disconnect(); }
});

async function topicFor(userId) {
  let body;
  await getAllTopics({ user: userId ? { id: userId } : undefined }, {
    status(code) { assert.equal(code, 200); return this; }, json(value) { body = value; },
  });
  return body.data.find(topic => String(topic._id) === String(ids.topic));
}

test('shared catalog caching never caches user progress', async () => {
  const summary = await getProgressSummary(ids.userA);
  assert.equal(String(summary.solvedQuestions[0]), String(ids.question));
  assert.equal(summary.solvedQuestions[0].title, undefined);
  assert.equal(summary.notes[0].content, 'Private note');
  assert.deepEqual((await getProgressSummary(ids.userB)).notes, []);
  assert.equal((await topicFor(ids.userA)).solvedQuestions, 1);
  assert.equal((await topicFor(ids.userB)).solvedQuestions, 0);
  assert.equal((await topicFor()).solvedQuestions, 0);
  await Progress.updateOne({ user: ids.userA }, { $set: { solvedQuestions: [] } });
  assert.equal((await topicFor(ids.userA)).solvedQuestions, 0);
  assert.equal((await topicFor()).totalQuestions, 1);
});

test('lean catalog summaries retain company counts and sheet sections', async () => {
  const company = (await getCompanies()).find(row => String(row._id) === String(ids.company));
  assert.equal(company.totalQuestions, 1);
  const sheet = (await getSheets()).find(row => String(row._id) === String(ids.sheet));
  assert.equal(sheet.totalQuestions, 2);
  assert.equal(sheet.sectionCount, 1);
  assert.equal(sheet.entries, undefined);
});
