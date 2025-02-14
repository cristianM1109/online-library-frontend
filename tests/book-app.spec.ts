import { test, expect } from '@playwright/test';

test('Homepage loads, navigates to books, and reaches page 2', async ({ page }) => {

  await page.goto('http://localhost:3000');

  await expect(page).toHaveTitle(/Library/);

  const exploreButton = page.locator('text=Explore Books');
  await expect(exploreButton).toBeVisible();
  await exploreButton.click();

  await expect(page.locator('text=Open Library')).toBeVisible();

  const nextButton = page.locator('text=Next');
  await expect(nextButton).toBeVisible();
  await nextButton.click();

  await expect(page.locator('text=Page 2 of')).toBeVisible();
});
