import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topics = require('../../server/src/data/topics.js').map((topic, i) => ({
  ...topic, _id: `topic-${i}`, totalQuestions: 40, solvedQuestions: 8, progress: 20,
}));
const user = { _id: 'fixture-user', name: 'Workspace Learner', email: 'learner@example.com', role: 'user', authProvider: 'local' };
const dashboard = { user, stats: { totalQuestions: 840, totalSolved: 8, easySolved: 5, mediumSolved: 3, hardSolved: 0, streak: 2, bestStreak: 4, overallProgress: 1 }, activity: [] };
const sheetFixtures = require('../../server/src/data/curatedSheets').sheets.map(source => ({
  sheet: { ...source, entries: undefined, totalQuestions: source.entries.length, sectionCount: new Set(source.entries.map(entry => entry.section)).size },
  questions: source.entries.map(entry => ({ ...entry, _id: entry.questionSlug, slug: entry.questionSlug, entryKey: `${source.slug}:${entry.order}`, sourceOrder: entry.order, solved: false, bookmarked: false, companies: [], tags: [] })),
}));

async function prepare(page, authenticated = true) {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ user, authenticated }) => {
    if (!localStorage.getItem('dsa-roadmap-theme')) localStorage.setItem('dsa-roadmap-theme', 'dark');
    if (authenticated) {
      localStorage.setItem('token', 'isolated-browser-fixture');
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, { user, authenticated });
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    let data;
    if (path === '/api/auth/me') data = user;
    else if (path === '/api/dashboard') data = dashboard;
    else if (path === '/api/topics') data = topics;
    else if (path === '/api/sheets') data = sheetFixtures.map(fixture => fixture.sheet);
    else if (path.startsWith('/api/sheets/')) data = sheetFixtures.find(fixture => path.endsWith(fixture.sheet.slug));
    else if (path === '/api/progress') data = { solvedQuestions: [], bookmarkedQuestions: [], notes: [] };
    else if (path === '/api/stats') data = { totalQuestions: 840, totalCompanies: 103, totalTopics: topics.length, totalSheets: 5 };
    else if (path.startsWith('/api/topics/')) data = { topic: topics.find(topic => path.endsWith(topic.slug)), questions: [] };
    else return route.fulfill({ status: 404, json: { success: false, message: `Unexpected test request: ${path}` } });
    await route.fulfill({ json: { success: true, data } });
  });
  return errors;
}

test('account name opens profile and settings survives a direct reload', async ({ page }) => {
  const errors = await prepare(page);
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: 'A little progress, every day.' })).toBeVisible();
  await page.getByLabel('Account navigation').click();
  await page.getByRole('link', { name: 'View Workspace Learner profile' }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Workspace Learner', exact: true })).toBeVisible();
  await page.getByLabel('Account navigation').click();
  await page.getByRole('navigation', { name: 'Account', exact: true }).getByRole('link', { name: 'Settings', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Make it yours.' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('dashboard topic cards use vector icons and remain usable on mobile', async ({ page }) => {
  const errors = await prepare(page);
  await page.goto('/dashboard');
  await expect(page.locator('.dashboard-course-card')).toHaveCount(6);
  await expect(page.locator('.dashboard-course-card .topic-icon svg')).toHaveCount(6);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.dashboard-course-card').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: 'Roadmap' }).click();
  await expect(page).toHaveURL(/\/roadmap$/);
  expect(errors).toEqual([]);
});

test('settings motion preference persists and progress can be exported', async ({ page }) => {
  const errors = await prepare(page);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Daylight' }).click();
  await page.getByRole('switch', { name: 'Reduced motion' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('switch', { name: 'Reduced motion' })).toHaveAttribute('aria-checked', 'true');
  const downloaded = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export', exact: true }).click();
  expect((await downloaded).suggestedFilename()).toBe('dsa-roadmap-progress.json');
  expect(errors).toEqual([]);
});

test('guests are redirected from account pages to login', async ({ page }) => {
  const errors = await prepare(page, false);
  for (const path of ['/profile', '/settings', '/dashboard']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Log in to your roadmap' })).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('roadmap connectors meet their cards without crossing other cards', async ({ page }) => {
  const errors = await prepare(page);
  await page.goto('/roadmap');
  await expect(page.locator('.learning-node')).toHaveCount(16);
  await expect(page.locator('.learning-connector-base')).toHaveCount(15);
  for (const width of [1440, 900]) {
    await page.setViewportSize({ width, height: 1000 });
    await expect.poll(async () => page.evaluate(() => {
      const svg = document.querySelector('.learning-connectors');
      const map = document.querySelector('.learning-map').getBoundingClientRect();
      return Math.abs(svg.viewBox.baseVal.width - map.width);
    })).toBeLessThan(1);
    const problems = await page.evaluate(() => {
      const svg = document.querySelector('.learning-connectors');
      const svgBox = svg.getBoundingClientRect();
      const cards = [...document.querySelectorAll('.learning-node')].map(node => node.getBoundingClientRect());
      const problems = [];
      for (const path of svg.querySelectorAll('.learning-connector-base')) {
        const length = path.getTotalLength();
        const start = path.getPointAtLength(0);
        const end = path.getPointAtLength(length);
        const anchored = (point, edge) => cards.some(card => Math.abs(point.x + svgBox.left - (card.left + card.width / 2)) < 2 && Math.abs(point.y + svgBox.top - card[edge]) < 2);
        if (!anchored(start, 'bottom') || !anchored(end, 'top')) problems.push('detached endpoint');
        for (let step = 1; step < 30; step++) {
          const point = path.getPointAtLength(length * step / 30);
          const x = point.x + svgBox.left, y = point.y + svgBox.top;
          if (cards.some(card => x > card.left + 2 && x < card.right - 2 && y > card.top + 2 && y < card.bottom - 2)) problems.push('line crosses card');
        }
      }
      return problems;
    });
    expect(problems).toEqual([]);
  }
  await page.locator('.learning-node').last().focus();
  await expect(page.locator('.learning-connectors .is-active').first()).toBeVisible();
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.learning-connector-flow').first()).toHaveCSS('animation-name', 'none');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator('.learning-connectors')).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const destinations = await page.locator('.learning-node, .learning-more a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  expect(new Set(destinations).size).toBe(topics.length);
  expect(errors).toEqual([]);
});

for (const fixture of sheetFixtures) test(`${fixture.sheet.name}: full list, last page, section filtering and mobile`, async ({ page }) => {
  const errors = await prepare(page, false);
  await page.goto(`/sheets/${fixture.sheet.slug}`);
  await expect(page.getByRole('heading', { name: fixture.sheet.name, exact: true })).toBeVisible();
  await expect(page.locator('.sheet-detail-count strong')).toHaveText(String(fixture.questions.length));
  await expect(page.locator('.sheet-question-row')).toHaveCount(40);
  const totalPages = Math.ceil(fixture.questions.length / 40);
  for (let number = 2; number <= totalPages; number++) {
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText(`Page ${number} of ${totalPages}`);
  }
  await expect(page.getByRole('link', { name: fixture.questions.at(-1).title, exact: true })).toBeVisible();
  await expect(page.locator('.sheet-question-row')).toHaveCount(fixture.questions.length % 40 || 40);
  const lastSection = fixture.questions.at(-1).section;
  await page.getByLabel('Section', { exact: true }).selectOption(lastSection);
  await expect(page.locator('.sheet-question-row')).toHaveCount(fixture.questions.filter(question => question.section === lastSection).length);
  await page.getByLabel('Section', { exact: true }).selectOption('All');
  await page.getByRole('searchbox', { name: 'Search questions' }).fill(fixture.questions.at(-1).title);
  await expect(page.locator('.sheet-question-row').first()).toContainText(fixture.questions.at(-1).title);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.sheet-source-note summary').click();
  await expect(page.getByRole('link', { name: 'Original sheet' })).toHaveAttribute('href', fixture.sheet.sourceUrl);
  expect(errors).toEqual([]);
});
