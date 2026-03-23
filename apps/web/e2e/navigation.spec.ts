import { test, expect } from '@playwright/test';

test.describe('Cross-Page Navigation', () => {
  test('should navigate from home to contact page', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Next.js Amplify');

    // Navigate to contact page
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact Us');
  });

  test('should navigate back from contact to home via back link', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact Us');

    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Next.js Amplify');
  });
});
