import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main title', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Next.js Amplify');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Starter Kit');
  });

  test('should display 3 feature cards', async ({ page }) => {
    const cards = page.locator('h2');
    await expect(cards).toHaveCount(3);
    await expect(cards.nth(0)).toContainText('Turborepo');
    await expect(cards.nth(1)).toContainText('AWS CDK');
    await expect(cards.nth(2)).toContainText('Amplify');
  });

  test('should have external documentation links', async ({ page }) => {
    const nextjsLink = page.getByRole('link', { name: 'Next.js Docs' });
    await expect(nextjsLink).toBeVisible();
    await expect(nextjsLink).toHaveAttribute('href', 'https://nextjs.org/docs');
    await expect(nextjsLink).toHaveAttribute('target', '_blank');

    const amplifyLink = page.getByRole('link', { name: 'Amplify Docs' });
    await expect(amplifyLink).toBeVisible();
    await expect(amplifyLink).toHaveAttribute('href', 'https://docs.amplify.aws/');
    await expect(amplifyLink).toHaveAttribute('target', '_blank');
  });

  test('should have correct page metadata', async ({ page }) => {
    await expect(page).toHaveTitle('Next.js Amplify Starter Kit');
    const metaDescription = page.locator('meta[name="description"]');
    await expect(metaDescription).toHaveAttribute(
      'content',
      'A modern monorepo starter kit with Next.js, AWS Amplify, and CDK'
    );
  });
});
