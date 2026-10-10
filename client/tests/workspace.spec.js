import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const topics = require('../../server/src/data/topics.js').map((topic, i) => ({
  ...topic, _id: `topic-${i}`, totalQuestions: 40, solvedQuestions: 8, progress: 20,
}));
const user = { _id: 'fixture-user', name: 'Workspace Learner', email: 'learner@example.com', role: 'user', authProvider: 'local' };
const dashboard = { user, stats: { totalQuestions: 840, totalSolved: 8, easySolved: 5, mediumSolved: 3, hardSolved: 0, streak: 2, bestStreak: 4, overallProgress: 1 }, activity: [] };
const sheetFixtures = require('../../server/src/data/curatedSheets').sheets.map(source => ({
  sheet: { ...source, _id: source.slug, entries: undefined, totalQuestions: source.entries.length, sectionCount: new Set(source.entries.map(entry => entry.section)).size },
  questions: source.entries.map(entry => ({ ...entry, _id: entry.questionSlug, slug: entry.questionSlug, entryKey: `${source.slug}:${entry.order}`, sourceOrder: entry.order, solved: false, bookmarked: false, companies: [], tags: [] })),
}));

const company = { _id: 'company-google', name: 'Google', slug: 'google', totalQuestions: 70 };
const practiceQuestions = Array.from({ length: 70 }, (_, i) => ({
  _id: `question-${i + 1}`, slug: `practice-${i + 1}`, title: `Practice question ${i + 1}`,
  difficulty: ['Easy', 'Medium', 'Hard'][i % 3], topic: topics[0], companies: [company], tags: ['Two pointers'],
  description: 'Find an efficient solution and explain the time complexity.', solved: false,
}));

test('public landing page does not request Google authentication scripts', async ({ page }) => {
  await prepare(page, false);
  const googleRequests = [];
  page.on('request', request => {
    if (request.url().startsWith('https://accounts.google.com/')) googleRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator('.hero-path-card').first()).toBeVisible();
  await expect(page.locator('.hero-sheet-card').first()).toBeAttached();
  expect(googleRequests).toEqual([]);
  await expect(page.locator('footer')).toContainText('Made by Sainky Gurjar');
  await expect(page.getByRole('navigation', { name: 'Creator profiles' }).getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/sainkygujjar12');
  await expect(page.getByRole('navigation', { name: 'Creator profiles' }).getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/sainky-gurjar-4290b1367/');
});

test('company lists render one page and retain it when returning from a question', async ({ page }) => {
  await prepare(page);
  await page.goto('/companies/google');
  await expect(page.locator('.question-table-row')).toHaveCount(40);
  await page.getByRole('navigation', { name: 'Pagination' }).getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('.question-table-row')).toHaveCount(30);
  await expect(page).toHaveURL(/page=2/);
  await page.getByRole('link', { name: 'Practice question 41', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Practice question 41', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to questions' }).click();
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('Page 2 of 2');
  await expect(page.locator('.question-table-row')).toHaveCount(30);
  await page.getByRole('searchbox').fill('Practice question 1');
  await expect(page.locator('.question-table-row')).toHaveCount(11);
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue('Practice question 1');
});

test('question appears with lightweight progress before a slow history write finishes', async ({ page }) => {
  const errors = await prepare(page);
  let releaseHistory;
  const historyGate = new Promise(resolve => { releaseHistory = resolve; });
  let historyStarted = false;
  await page.route('**/api/progress/last-visited/**', async route => {
    historyStarted = true;
    await historyGate;
    await route.fulfill({ status: 503, json: { success: false, message: 'Temporarily unavailable' } });
  });
  await page.route('**/api/progress?summary=true', route => route.fulfill({ json: {
    success: true, data: { solvedQuestions: ['question-1'], bookmarkedQuestions: ['question-1'], notes: [{ question: 'question-1', content: 'My approach' }] },
  } }));
  try {
    await page.goto('/questions/practice-1');
    await expect(page.getByRole('heading', { name: 'Practice question 1', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Solved', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bookmarked', exact: true })).toBeVisible();
    await expect(page.getByRole('textbox')).toHaveValue('My approach');
    await expect.poll(() => historyStarted).toBe(true);
    const failedWrite = page.waitForResponse(response => response.url().includes('/last-visited/'));
    releaseHistory();
    await failedWrite;
    await expect(page.getByRole('heading', { name: 'Practice question 1', exact: true })).toBeVisible();
    expect(errors).toEqual([]);
  } finally { releaseHistory(); }
});

async function prepare(page, authenticated = true, role = 'user') {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(({ user, authenticated }) => {
    if (!localStorage.getItem('dsa-roadmap-theme')) localStorage.setItem('dsa-roadmap-theme', 'dark');
    if (authenticated) {
      localStorage.setItem('token', 'isolated-browser-fixture');
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, { user: { ...user, role }, authenticated });
  await page.route('**/api/**', async route => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let data;
    if (path === '/api/auth/me') data = { ...user, role };
    else if (path === '/api/dashboard') data = dashboard;
    else if (path === '/api/topics') data = topics;
    else if (path === '/api/sheets') data = sheetFixtures.map(fixture => fixture.sheet);
    else if (path.startsWith('/api/sheets/')) data = sheetFixtures.find(fixture => path.endsWith(fixture.sheet.slug));
    else if (path === '/api/progress') data = { solvedQuestions: [], bookmarkedQuestions: practiceQuestions.slice(0, 3), notes: [{ _id: 'note-1', question: practiceQuestions[0], content: 'Try two pointers.' }] };
    else if (path === '/api/stats') data = { totalQuestions: 840, totalCompanies: 103, totalTopics: topics.length, totalSheets: 5 };
    else if (path.startsWith('/api/topics/')) {
      const filtered = practiceQuestions.filter(question => (!url.searchParams.get('search') || question.title.toLowerCase().includes(url.searchParams.get('search').toLowerCase())) && (!url.searchParams.get('difficulty') || url.searchParams.get('difficulty') === 'All' || question.difficulty === url.searchParams.get('difficulty')));
      const number = Number(url.searchParams.get('page') || 1);
      data = { topic: topics.find(topic => path.endsWith(topic.slug)), questions: filtered.slice((number - 1) * 10, number * 10), pagination: { pages: Math.ceil(filtered.length / 10), total: filtered.length } };
    }
    else if (path === '/api/companies') data = [company];
    else if (path.startsWith('/api/companies/')) data = { company, questions: practiceQuestions };
    else if (path.startsWith('/api/progress/last-visited/')) data = {};
    else if (path === '/api/questions') data = practiceQuestions;
    else if (path.startsWith('/api/questions/')) data = practiceQuestions.find(question => path.endsWith(question.slug)) || sheetFixtures.flatMap(fixture => fixture.questions).find(question => path.endsWith(question.slug));
    else if (path === '/api/admin/dashboard') data = { stats: { totalQuestions: 70, totalUsers: 1 }, recentQuestions: practiceQuestions.slice(0, 3) };
    else if (path === '/api/users') data = [user];
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


test('topic page six survives question Back, browser Back and reload', async ({ page }) => {
  const errors = await prepare(page);
  await page.goto(`/roadmap/${topics[0].slug}?page=6&pattern=Two+pointers`);
  const listURL = page.url();
  const question = page.getByRole('link', { name: 'Practice question 58', exact: true });
  await expect(question).toBeVisible();
  await question.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  await question.click();
  await expect(page.getByRole('heading', { name: 'Practice question 58' })).toBeVisible();
  await page.getByRole('link', { name: 'Back to questions' }).click();
  await expect(page).toHaveURL(listURL);
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('Page 6 of 7');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await question.click();
  await expect(page.getByRole('heading', { name: 'Practice question 58' })).toBeVisible();
  await page.goBack();
  await expect(question).toBeVisible();
  await page.reload();
  await expect(question).toBeVisible();
  await expect(page.getByLabel('Pattern', { exact: true })).toHaveValue('Two pointers');
  await page.getByRole('searchbox').fill('Practice question 1');
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('Page 1 of 2');
  await expect(page.locator('.question-list-title').first()).toHaveText('Practice question 1');
  const searchURL = page.url();
  await page.locator('.question-list-title').first().click();
  await expect(page.locator('.question-title-row h1')).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(searchURL);
  await expect(page.getByRole('searchbox')).toHaveValue('Practice question 1');
  expect(errors).toEqual([]);
});

test('sheet question returns to its section, page and scroll position', async ({ page }) => {
  const errors = await prepare(page);
  const fixture = sheetFixtures[0];
  await page.goto(`/sheets/${fixture.sheet.slug}?page=6`);
  const title = fixture.questions[225].title;
  const question = page.getByRole('link', { name: title, exact: true }).first();
  await question.scrollIntoViewIfNeeded();
  const position = await page.evaluate(() => scrollY);
  await question.click();
  await expect(page.locator('.question-title-row h1')).toHaveText(title);
  await page.getByRole('link', { name: 'Back to questions' }).click();
  await expect(page.getByRole('navigation', { name: 'Pagination' })).toContainText('Page 6');
  await expect.poll(() => page.evaluate(() => scrollY)).toBeCloseTo(position, 0);
  await page.getByLabel('Section', { exact: true }).selectOption(fixture.questions[0].section);
  await expect(page).not.toHaveURL(/page=6/);
  await page.locator('.sheet-question-copy a').first().click();
  await expect(page.locator('.question-title-row h1')).toBeVisible();
  await page.goBack();
  await expect(page.getByLabel('Section', { exact: true })).toHaveValue(fixture.questions[0].section);
  expect(errors).toEqual([]);
});

for (const path of ['/companies/google?difficulty=Medium', '/bookmarks?difficulty=Medium', '/notes']) {
  test(`question returns to originating list: ${path}`, async ({ page }) => {
    const errors = await prepare(page);
    await page.goto(path);
    const url = page.url();
    await page.locator('a[href^="/questions/"]').first().click();
    await expect(page.locator('.question-title-row h1')).toBeVisible();
    await page.getByRole('link', { name: 'Back to questions' }).click();
    await expect(page).toHaveURL(url);
    if (path.includes('difficulty')) await expect(page.getByLabel('Difficulty', { exact: true })).toHaveValue('Medium');
    expect(errors).toEqual([]);
  });
}

// Measure rendered text against its composed background, including translucent cards.
async function contrastIssues(page) {
  return page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const rgb = value => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = value;
      context.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
      return [r, g, b, a / 255];
    };
    const blend = (front, back) => {
      const alpha = front[3] ?? 1;
      return front.slice(0, 3).map((value, i) => value * alpha + back[i] * (1 - alpha));
    };
    const luminance = color => color.reduce((sum, value, i) => {
      const channel = value / 255;
      return sum + (channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4) * [.2126, .7152, .0722][i];
    }, 0);
    return [...document.querySelectorAll('body *')].flatMap(element => {
      if (!(element instanceof HTMLElement) || ![...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim())) return [];
      if (!element.getClientRects().length || element.closest('button:disabled, [aria-hidden="true"]')) return [];
      const style = getComputedStyle(element);
      const ancestors = [];
      for (let parent = element; parent; parent = parent.parentElement) ancestors.unshift(getComputedStyle(parent));
      if (ancestors.some(style => Number(style.opacity) < .95 || style.visibility === 'hidden' || style.backgroundImage !== 'none')) return [];
      const background = ancestors.reduce((back, style) => blend(rgb(style.backgroundColor), back), [255, 255, 255]);
      const foreground = blend(rgb(style.color), background);
      const a = luminance(foreground), b = luminance(background);
      const ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
      const large = parseFloat(style.fontSize) >= 24 || (parseFloat(style.fontSize) >= 18.66 && Number(style.fontWeight) >= 700);
      if (ratio >= (large ? 3 : 4.5)) return [];
      return [{ text: element.textContent.trim().slice(0, 65), class: element.className, parent: element.parentElement.className, ratio: Math.round(ratio * 100) / 100, color: style.color, background }];
    });
  });
}

for (const group of ['public', 'account', 'admin']) test(`light theme route review: ${group}`, async ({ page }, testInfo) => {
  test.setTimeout(60_000);
  const errors = await prepare(page, group !== 'public', group === 'admin' ? 'admin' : 'user');
  await page.addInitScript(() => {
    localStorage.setItem('dsa-roadmap-theme', 'light');
    sessionStorage.setItem('resetEmail', 'learner@example.com');
    sessionStorage.setItem('resetToken', 'isolated-browser-fixture');
  });
  const paths = group === 'public'
    ? ['/', '/login', '/register', '/forgot-password', '/verify-reset-otp', '/reset-password', '/missing-page']
    : group === 'admin' ? ['/admin', '/admin/questions', '/admin/topics', '/admin/companies', '/admin/sheets', '/admin/users', '/admin/bulk-import']
    : ['/dashboard', '/roadmap', `/roadmap/${topics[0].slug}`, '/companies', '/companies/google', '/sheets', `/sheets/${sheetFixtures[0].sheet.slug}`, '/questions/practice-1', '/bookmarks', '/notes', '/profile', '/settings'];
  const report = {};
  for (const path of paths) {
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.locator('.ui-loader, .route-loading')).toHaveCount(0);
    await page.waitForTimeout(350); // Let entrance motion settle before measuring contrast.
    report[path] = await contrastIssues(page);
    if (path === `/roadmap/${topics[0].slug}`) {
      await expect(page.locator('.question-list-title').first()).toHaveCSS('color', 'rgb(32, 36, 49)');
      await page.screenshot({ path: testInfo.outputPath('light-questions.png'), fullPage: true });
    }
    if (path === '/' || path === '/admin') await page.screenshot({ path: testInfo.outputPath(`light-${group}.png`), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    report[`${path}:mobileOverflow`] = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  await testInfo.attach('contrast-audit', { body: JSON.stringify(report, null, 2), contentType: 'application/json' });
  for (const [path, result] of Object.entries(report)) expect(result, path).toEqual(path.endsWith(':mobileOverflow') ? false : []);
  expect(errors).toEqual([]);
});

for (const theme of ['light', 'dark']) test(`Aceternity preview tabs support keyboard navigation and real data: ${theme}`, async ({ page }, testInfo) => {
  const errors = await prepare(page);
  await page.addInitScript(theme => localStorage.setItem('dsa-roadmap-theme', theme), theme);
  await page.goto('/');
  await expect(page.locator('.hero-path-card').first()).toContainText('8 of 40 solved');
  const topicsTab = page.getByRole('tab', { name: 'By topic' });
  const sheetsTab = page.getByRole('tab', { name: 'By sheet' });
  await topicsTab.focus();
  await page.keyboard.press('ArrowRight');
  await expect(sheetsTab).toBeFocused();
  await expect(sheetsTab).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.locator('.hero-sheet-card').first()).toContainText(String(sheetFixtures[0].questions.length));
  expect(await contrastIssues(page)).toEqual([]);
  await page.keyboard.press('Home');
  await expect(topicsTab).toBeFocused();
  await expect(page.locator('.hero-sheet-list')).toBeHidden();
  await page.keyboard.press('End');
  await expect(sheetsTab).toBeFocused();
  await expect(page.locator('.bento-card')).toHaveCount(4);
  await page.screenshot({ path: testInfo.outputPath(`landing-${theme}.png`), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath(`landing-mobile-${theme}.png`), fullPage: true });
  await page.locator('.hero-sheet-card').first().click();
  await expect(page).toHaveURL(`/sheets/${sheetFixtures[0].sheet.slug}`);
  await expect(page.locator('.sheet-question-row')).toHaveCount(40);
  expect(errors).toEqual([]);
});

test('card effects preserve focus, navigation and reduced motion', async ({ page }, testInfo) => {
  const errors = await prepare(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/dashboard');
  const card = page.locator('.dashboard-course-card').first();
  await card.focus();
  await expect(page.locator('.hover-grid-highlight')).toHaveCount(1);
  await expect(card).toBeFocused();
  await expect(card).toHaveCSS('animation-name', 'none');
  await page.screenshot({ path: testInfo.outputPath('dashboard-dark.png'), fullPage: true });
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/roadmap\//);
  await page.goto('/settings');
  await page.getByRole('button', { name: 'Daylight' }).click();
  await page.getByRole('switch', { name: 'Reduced motion' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.locator('.theme-selection-frame')).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/sheets');
  const sheet = page.locator('.sheet-card-footer a').first();
  await sheet.focus();
  await expect(page.locator('.hover-grid-highlight')).toHaveCount(1);
  await expect(page.locator('.sheet-library-card').first()).toHaveCSS('animation-name', 'none');
  await expect(sheet).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.sheet-question-row')).toHaveCount(40);
  expect(errors).toEqual([]);
});
