import { test, expect } from '@playwright/test';

test('player can complete the Leitian vertical-slice loop', async ({ page }) => {
  await page.goto('/?test=1');
  await page.getByRole('button', { name: 'New Game' }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('World seed').fill('HX-E2E-0001');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByLabel('Character name').fill('Lin Wei');
  await page.getByRole('button', { name: 'Next' }).click();
  await page.getByRole('button', { name: 'Begin' }).click();

  await expect(page.getByText('Northern Suburbs')).toBeVisible();
  await page.getByRole('button', { name: 'Debug: Loot Starter Store' }).click();
  await page.getByRole('button', { name: 'Debug: Recruit Survivor' }).click();
  await page.getByRole('button', { name: 'Debug: Claim Apartment' }).click();
  await page.getByRole('button', { name: 'Shelter' }).click();
  await page.getByRole('button', { name: 'Assign Guard' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Debug: Enter Van' }).click();
  await page.getByRole('button', { name: 'Travel: Railway District' }).click();
  await page.getByRole('button', { name: 'Debug: Open Trader' }).click();
  await page.getByRole('button', { name: 'Buy Water' }).click();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Debug: Advance Event Time' }).click();
  await expect(page.getByText(/horde/i)).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByText('Saved')).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByText('Railway District')).toBeVisible();
});
