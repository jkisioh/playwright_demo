/// <reference types="node" />
import { test, expect, type Page, type Locator } from '@playwright/test';

const BASE_URL = (process.env.BASE_URL ?? 'https://science-of-africa.akvotest.org/').replace(/\/$/, '');
const LOGIN_URL = `${BASE_URL}/login`;
const PROFILE_URL = `${BASE_URL}/profile`;
const USERNAME = process.env.USERNAME ?? '';
const PASSWORD = process.env.PASSWORD ?? '';

const SHORT_BIO =
  'Akvo is an Associate Professor of Environmental Science leading the Sustainable Ecosystems Lab. Research focuses on climate change adaptation and coastal management, with publications in Nature Climate Change. Holds a PhD in Ecology.';

// Labels are plain <div> elements with no <label> association.
// Climb from the matched text up to the nearest ancestor div that actually
// contains a form control (input/textarea/select), then return that control.
// This avoids the "one level up" assumption that fails when the text lives
// inside a nested span and the input is a cousin, not a sibling.
function fieldByLabel(page: Page, labelText: string | RegExp): Locator {
  return page
    .getByText(labelText, { exact: true })
    .first()
    .locator('xpath=ancestor::div[.//input or .//textarea or .//select][1]')
    .locator('input, textarea, select')
    .first();
}


test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(USERNAME);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]', { hasText: 'Login' }).click();
    await page.waitForURL(url => url.pathname !== '/login', { timeout: 15000 });
  });

  test('updates profile details and saves', async ({ page }) => {
    await page.goto(PROFILE_URL);
    await page.waitForLoadState('networkidle');

    // Page starts in read-only view — click Edit to enable the form fields.
    await page.getByRole('button', { name: 'Edit' }).click();

    // waitForLoadState('networkidle') is unreliable here; wait for an actual
    // input to appear before interacting with the form.
    await page.locator('input').first().waitFor({ state: 'visible', timeout: 10000 });

    // Full name
    await fieldByLabel(page, 'Full name').fill('Akvo Test');

    // Bio — label text in the snapshot is "Bio (Optional)"
    await fieldByLabel(page, 'Bio (Optional)').fill(SHORT_BIO);

    await page.getByRole('button', { name: /save/i }).click();

    // Verify save succeeded — app shows a toast (role="alert") and returns to
    // read-only mode (Edit button reappears).
    await expect(page.getByRole('alert').first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible({ timeout: 10000 });
  });
});
