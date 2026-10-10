const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { sheets, planQuestions, validateSheets, canonicalResource } = require('../src/data/curatedSheets');
const Question = require('../src/models/Question');
const directory = path.join(__dirname, '../src/data/questions');
const catalog = fs.readdirSync(directory).filter(file => file.endsWith('.js')).flatMap(file => require(path.join(directory, file)));

test('both complete source editions include every section, row and final entry', () => {
  const [babbar, striver] = validateSheets();
  assert.equal(babbar.entries.length, 448);
  assert.equal(striver.entries.length, 191);
  assert.deepEqual([...new Set(babbar.entries.map(row => row.section))].map(section => babbar.entries.filter(row => row.section === section).length), [36, 10, 43, 36, 36, 35, 22, 35, 19, 38, 18, 44, 6, 60, 10]);
  assert.equal(new Set(striver.entries.map(row => row.section)).size, 27);
  assert.equal(babbar.entries.at(-1).title, 'Power Set');
  assert.equal(striver.entries.at(-1).title, 'Maximum XOR with an Element from Array');
  for (const sheet of sheets) assert.deepEqual(sheet.entries.map(row => row.order), Array.from({ length: sheet.expectedCount }, (_, i) => i + 1));
  const incomplete = { ...babbar, entries: babbar.entries.slice(0, 30) };
  assert.throws(() => validateSheets([incomplete]), /Incomplete/);
});

test('import planner reuses catalog identities and is idempotent without changing existing metadata', () => {
  const snapshot = JSON.stringify(catalog);
  const first = planQuestions(catalog);
  assert.ok(first.newQuestions.length > 0);
  assert.equal(JSON.stringify(catalog), snapshot);
  const second = planQuestions([...catalog, ...first.newQuestions]);
  assert.equal(second.newQuestions.length, 0);
  assert.deepEqual(second.sheets.map(sheet => sheet.entries.map(row => row.questionSlug)), first.sheets.map(sheet => sheet.entries.map(row => row.questionSlug)));
  const stock = first.sheets[1].entries.find(row => row.resourceUrl.includes('/best-time-to-buy-and-sell-stock/'));
  assert.equal(stock.questionSlug, 'best-time-to-buy-and-sell-stock');
  assert.equal(canonicalResource('https://practice.geeksforgeeks.org/problems/test/1'), canonicalResource('https://www.geeksforgeeks.org/problems/test/0/'));
});

test('all newly imported questions validate and concept variants retain independent progress', async () => {
  const plan = planQuestions(catalog);
  for (const question of plan.newQuestions) {
    await new Question({ ...question, topic: '507f1f77bcf86cd799439011' }).validate();
  }
  const striver = plan.sheets[1];
  assert.notEqual(striver.entries.find(row => row.order === 155).questionSlug, striver.entries.find(row => row.order === 156).questionSlug, 'BFS and DFS approaches remain separate study entries');
});

test('sheet API preserves source order, repeated rows and shared question progress', async () => {
  const metadata = { slug: 'example-sheet', entries: [
    { order: 2, title: 'Second approach', section: 'Arrays', question: 'q1', resourceUrl: 'https://example.com/2' },
    { order: 1, title: 'First approach', section: 'Arrays', question: 'q1', resourceUrl: 'https://example.com/1' },
    { order: 3, title: 'Another problem', section: 'Trees', question: 'q2', resourceUrl: 'https://example.com/3' },
  ] };
  const chain = { populate() { return this; }, sort() { return this; }, async lean() { return [{ _id: 'q2', title: 'A' }, { _id: 'q1', title: 'Z' }]; } };
  const exports = {};
  const mocks = {
    '../utils/catalogCache': require('../src/utils/catalogCache'),
    '../models/Sheet': { findOne: () => ({ lean: async () => metadata }) },
    '../models/Question': { find: () => chain },
    './progress.service': {
      getUserQuestionFlags: async () => ({ solvedSet: new Set(['q1']), bookmarkedSet: new Set(['q2']) }),
      attachUserFlags: (questions, solved, bookmarks) => questions.map(question => ({ ...question, solved: solved.has(question._id), bookmarked: bookmarks.has(question._id) })),
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/services/sheet.service.js'), 'utf8'), { exports, require: name => mocks[name] });
  const response = await exports.getSheetBySlug('example-sheet', 'user');
  assert.equal(response.sheet.totalQuestions, 3);
  assert.deepEqual(Array.from(response.questions, row => row.title), ['First approach', 'Second approach', 'Another problem']);
  assert.deepEqual(Array.from(response.questions, row => row.solved), [true, true, false]);
  assert.equal(new Set(response.questions.map(row => row.entryKey)).size, 3);
});

test('topic totals include unrated imported questions', async () => {
  const result = { exports: {} };
  const chain = { populate() { return this; }, sort() { return this; }, skip() { return this; }, async limit() { return []; } };
  const mocks = {
    '../utils/queryValidation': require('../src/utils/queryValidation'),
    '../utils/catalogCache': require('../src/utils/catalogCache'),
    '../models/Topic': { findOne: async () => ({ _id: 'topic', slug: 'arrays' }) },
    '../models/Question': { find: () => chain, countDocuments: async () => 13, aggregate: async () => [{ _id: 'Easy', total: 10 }, { _id: 'Unrated', total: 3 }] },
    '../models/Progress': {},
    '../services/progress.service': { getUserQuestionFlags: async () => ({ solvedSet: new Set(), bookmarkedSet: new Set() }), attachUserFlags: questions => questions },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers/topic.controller.js'), 'utf8'), { module: result, require: name => mocks[name], console });
  let status, response;
  const res = { status(code) { status = code; return this; }, json(value) { response = value; } };
  await result.exports.getSingleTopic({ params: { slug: 'arrays' }, query: {} }, res);
  assert.equal(status, 200);
  assert.equal(response.data.stats.total, 13);
  assert.equal(response.data.stats.unrated.total, 3);
});
