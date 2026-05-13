import { test, expect, Page } from '@playwright/test';

const BASE_URL = (process.env.BASE_URL ?? 'https://science-of-africa.akvotest.org/').replace(/\/$/, '');
const LOGIN_URL = `${BASE_URL}/login`;
const COMMUNITY_URL = `${BASE_URL}/community/community-of-educators`;
const USERNAME = process.env.USERNAME ?? '';
const PASSWORD = process.env.PASSWORD ?? '';

const dialog = (page: Page) => page.locator('[role="dialog"]').first();

test.describe('Collaboration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(USERNAME);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]', { hasText: 'Login' }).click();
    await page.waitForURL(url => url.pathname !== '/login');
  });

  test('creates a collaboration call with July 2026 dates and invites a collaborator', async ({ page }) => {
    const callTitle = `Test Call ${Date.now()}`;

    await page.goto(COMMUNITY_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Collaboration calls' }).click();

    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(dialog(page)).toBeVisible();

    // ── Step 1: Topic picker ──────────────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('What topic will your collaboration be dedicated to?');
    await dialog(page).locator('[data-slot="badge"]').first().click();
    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 2: Create Collaboration Space ────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Create Collaboration Space');
    await expect(dialog(page).getByRole('combobox').first()).toContainText('Community of Educators');

    await dialog(page).locator('input[placeholder="Enter a descriptive title"]').fill(callTitle);

    await dialog(page)
      .getByPlaceholder('Describe the purpose and goals of this collaboration...')
      .fill(callTitle);

    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 3: Select a due date (July 2026) ─────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Select a due date');

    // Default view is May/June 2026. Advance once to show June/July 2026.
    await dialog(page).getByRole('button', { name: 'Go to the Next Month' }).click();

    // Pick first and last enabled days of the right-hand month (July 2026).
    const rightMonth = dialog(page).locator('.rdp-month').last();
    const enabledDays = rightMonth.locator('td button:not([disabled])');
    await enabledDays.first().click();
    await enabledDays.last().click();

    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 4: Assign a mentor (none) ────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Assign a mentor');
    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 5: Collaboration kind (Public is pre-selected) ───────────────────
    await expect(dialog(page).locator('h2')).toContainText('What kind of collaboration is this?');
    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 6: Invite users ──────────────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Invite users and collaborators');
    await dialog(page).locator('input[type="email"]').first().fill('jonah+1@akvo.org');
    await dialog(page).getByRole('button', { name: 'Send invites' }).click();

    // ── Step 7: Success — navigate to the call page ───────────────────────────
    await expect(dialog(page).getByText('Collaboration Created!')).toBeVisible({ timeout: 10_000 });
    await expect(dialog(page)).toContainText(callTitle);

    await dialog(page).getByRole('button', { name: 'Access page' }).click();
    await page.waitForURL(url => url.pathname.includes('/calls/'));
    await expect(page).toHaveURL(/\/calls\//);

    // ── Post a message on the call page ──────────────────────────────────────
    const message = 'happy to join and start collavorating';
    await page.getByRole('textbox').fill(message);
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.getByText(message)).toBeVisible({ timeout: 10_000 });
  });
});
