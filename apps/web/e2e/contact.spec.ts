import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('should load the contact form', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact Us');
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/subject/i)).toBeVisible();
    await expect(page.getByLabel(/message/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Send Message' })).toBeVisible();
  });

  test('should allow filling in form fields', async ({ page }) => {
    await page.getByLabel(/name/i).fill('Test User');
    await expect(page.getByLabel(/name/i)).toHaveValue('Test User');

    await page.getByLabel(/email/i).fill('test@example.com');
    await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com');

    await page.getByLabel(/subject/i).fill('Test Subject');
    await expect(page.getByLabel(/subject/i)).toHaveValue('Test Subject');

    await page.getByLabel(/message/i).fill('Hello, this is a test message.');
    await expect(page.getByLabel(/message/i)).toHaveValue('Hello, this is a test message.');
  });

  test('should display the demo badge', async ({ page }) => {
    await expect(page.getByText('Demo page - Can be removed in production')).toBeVisible();
  });

  test('should have a back link to home', async ({ page }) => {
    const backLink = page.getByRole('link', { name: /back to home/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute('href', '/');
  });
});
