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

  test('creates a collaboration call from the Community of Educators page', async ({ page }) => {
    // Navigate to the community detail page and open the Collaboration calls tab
    await page.goto(COMMUNITY_URL);
    await page.waitForLoadState('networkidle');
    await page.getByRole('tab', { name: 'Collaboration calls' }).click();

    // Open the Create modal
    await page.getByRole('button', { name: 'Create', exact: true }).click();
    await expect(dialog(page)).toBeVisible();

    // ── Step 1: topic picker ──────────────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('What topic will your collaboration be dedicated to?');
    const firstBadge = dialog(page).locator('[data-slot="badge"]').first();
    await expect(firstBadge).toBeVisible();
    await firstBadge.click();
    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 2: Create Collaboration Space ────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Create Collaboration Space');

    // Community is pre-selected as "Community of Educators" — leave it.
    await expect(dialog(page).getByRole('combobox').first()).toContainText('Community of Educators');

    // Title (second input; first belongs to the hidden combobox search)
    await dialog(page).locator('input[placeholder="Enter a descriptive title"]').fill('Call for papers');

    // Description (rich-text area)
    await dialog(page).locator('textarea').fill('Call for papers');

    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 3: Select a due date ─────────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Select a due date');

    // The calendar renders two months side-by-side (rdp-month).
    // Always pick the first and last enabled days of the right-hand (later) month
    // so the selection is always a valid future range regardless of when tests run.
    const rightMonth = dialog(page).locator('.rdp-month').last();
    const enabledDays = rightMonth.locator('td button:not([disabled])');
    await enabledDays.first().click();
    await enabledDays.last().click();

    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 4: Assign a mentor ───────────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Assign a mentor');

    // The logged-in user (Jonah Kisioh) is pre-assigned — just advance.
    await dialog(page).getByRole('button', { name: 'Next', exact: true }).click();

    // ── Step 5: Invite users ──────────────────────────────────────────────────
    await expect(dialog(page).locator('h2')).toContainText('Invite users and collaborators');
    await dialog(page).getByRole('button', { name: 'Skip' }).click();

    // ── Step 6: Success ───────────────────────────────────────────────────────
    await expect(dialog(page).getByText('Collaboration Created!')).toBeVisible({ timeout: 10000 });
    await expect(dialog(page)).toContainText('Call for papers');
  });
});
