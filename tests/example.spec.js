const { test, expect } = require('@playwright/test');

async function login(page) {
  await page.goto('/');
  await page.getByLabel('Email address').fill('shopper@test.local');
  await page.getByLabel('Password').fill('Automation123!');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByTestId('brief-page')).toBeVisible();
}

test('shopper can add an item and continue to checkout', async ({ page }) => {
  await login(page);
  await page.locator('[data-nav="shop"]').click();
  await page.locator('[data-product-id="p-1002"][data-cy="add-to-basket"]').click();
  await expect(page.locator('[data-region="basket"]')).toContainText('Auralite Noise Cancelling Pods');
  await page.getByRole('button', { name: 'Continue to checkout' }).click();
  await expect(page.getByTestId('checkout-page')).toBeVisible();
  await expect(page.getByLabel('Checkout basket summary')).toContainText('Auralite Noise Cancelling Pods');
  await expect(page.getByTestId('checkout-grand-total')).toContainText('£');
});

test('orders page exposes an enterprise-style grid surface', async ({ page }) => {
  await login(page);
  await page.locator('[data-nav="orders"]').click();
  await expect(page.getByRole('grid', { name: 'Order history grid' })).toBeVisible();
  await expect(page.getByRole('columnheader', { name: /Order ID/ })).toBeVisible();
});
