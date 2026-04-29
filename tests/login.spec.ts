import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.BASE_URL ?? 'https://science-of-africa.akvotest.org/').replace(/\/$/, '');
const LOGIN_URL = `${BASE_URL}/login`;
const USERNAME = process.env.USERNAME ?? '';
const PASSWORD = process.env.PASSWORD ?? '';

test.describe('Login', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const loginButton = page.locator('button[type="submit"]', { hasText: 'Login' });

    await expect(emailInput).toBeVisible();
    await emailInput.fill(USERNAME);
    await passwordInput.fill(PASSWORD);
    await loginButton.click();

    await expect(page).not.toHaveURL(/\/login/i);
  });
});
