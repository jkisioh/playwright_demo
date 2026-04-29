import { test, expect } from '@playwright/test';

const BASE_URL = (process.env.BASE_URL ?? 'https://science-of-africa.akvotest.org/').replace(/\/$/, '');
const LOGIN_URL = `${BASE_URL}/login`;
const COMMUNITY_URL = `${BASE_URL}/community`;
const USERNAME = process.env.USERNAME ?? '';
const PASSWORD = process.env.PASSWORD ?? '';

const CARD = 'div.flex.items-start.justify-between.gap-3';

test.describe('Community', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.waitForLoadState('networkidle');
    await page.locator('input[type="email"]').fill(USERNAME);
    await page.locator('input[type="password"]').fill(PASSWORD);
    await page.locator('button[type="submit"]', { hasText: 'Login' }).click();
    await page.waitForURL(url => url.pathname !== '/login');
  });

  test('joins a community and reports its name and subscriber count', async ({ page }) => {
    await page.goto(COMMUNITY_URL);
    await page.waitForLoadState('networkidle');

    // If all communities are already joined, unjoin the first one so the test
    // can always observe the full Join flow.
    const hasUnjoined = await page.locator(CARD)
      .filter({ has: page.getByRole('button', { name: 'Join', exact: true }) })
      .count();

    if (hasUnjoined === 0) {
      const firstJoinedCard = page.locator(CARD)
        .filter({ has: page.getByRole('button', { name: 'Joined', exact: true }) })
        .first();
      // Read name before clicking — the filter breaks once the button text changes.
      const nameToUnjoin = await firstJoinedCard.locator('h3').innerText();
      await firstJoinedCard.getByRole('button', { name: 'Joined', exact: true }).click();
      // Re-locate by name so the locator stays valid after Joined → Join.
      await expect(
        page.locator(CARD)
          .filter({ has: page.locator('h3', { hasText: nameToUnjoin }) })
          .getByRole('button', { name: 'Join', exact: true })
      ).toBeVisible();
    }

    // Read name and subscriber count from the first un-joined card.
    const card = page.locator(CARD)
      .filter({ has: page.getByRole('button', { name: 'Join', exact: true }) })
      .first();

    const communityName = await card.locator('h3').innerText();
    const subscribersBefore = parseInt(
      (await card.locator('p').innerText()).match(/\d+/)?.[0] ?? '0',
      10
    );

    // Click Join. After the click the card's filter condition changes (Join → Joined),
    // so we re-locate by community name to keep assertions stable.
    await card.getByRole('button', { name: 'Join', exact: true }).click();

    const cardByName = page.locator(CARD).filter({ has: page.locator('h3', { hasText: communityName }) });

    await expect(cardByName.getByRole('button', { name: 'Joined', exact: true })).toBeVisible();

    const subscribersAfter = parseInt(
      (await cardByName.locator('p').innerText()).match(/\d+/)?.[0] ?? '0',
      10
    );

    console.log(`Joined community : "${communityName}"`);
    console.log(`Subscriber count : ${subscribersBefore} → ${subscribersAfter}`);

    expect(subscribersAfter).toBe(subscribersBefore + 1);
  });
});
