const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const source = require('../src/data/companyRepository.json');
const aliases = require('../src/data/leetcodeSlugAliases.json');
const topics = new Set(require('../src/data/topics').map(topic => topic.slug));
const directory = path.join(__dirname, '../src/data/questions');
const catalog = fs.readdirSync(directory).filter(file => file.endsWith('.js'))
  .flatMap(file => require(path.join(directory, file))).filter(Boolean);
const bySlug = new Map(catalog.map(question => [question.slug, question]));

test('every source question has a canonical catalog entry', () => {
  assert.equal(bySlug.size, catalog.length, 'duplicate question slug');
  const covered = new Set();
  for (const company of source.companies) {
    for (const sourceSlug of company.slugs) {
      const slug = aliases[sourceSlug] || sourceSlug;
      assert.ok(bySlug.has(slug), `${company.name}: ${sourceSlug}`);
      covered.add(slug);
    }
  }
  assert.equal(covered.size, 1133);
});

test('remaining questions use valid topics, metadata, and source company relationships', () => {
  const remaining = require('../src/data/questions/companyRepositoryRemaining');
  const premium = new Set(require('../src/data/repositoryPremiumSlugs.json'));
  for (const question of remaining) {
    assert.ok(topics.has(question.topic));
    assert.ok(['Easy', 'Medium', 'Hard'].includes(question.difficulty));
    assert.ok(Number.isInteger(question.leetcodeNumber));
    assert.equal(question.leetcodeUrl, `https://leetcode.com/problems/${question.slug}/`);
    assert.equal(question.isPremium, premium.has(question.slug));
    const expected = source.companies.filter(company => company.slugs.some(slug =>
      (aliases[slug] || slug) === question.slug
    )).map(company => company.name);
    assert.deepEqual(question.companies, expected);
    assert.ok(expected.length > 0);
  }
});
