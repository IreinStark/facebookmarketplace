import { test, expect } from '@playwright/test'

test('unauthenticated user visiting protected page is redirected to login', async ({ page }) => {
  await page.goto('/messages')
  await expect(page.getByText(/Checking authentication/i)).toBeVisible({ timeout: 15000 })
  await expect(page).toHaveURL(/\/auth\/login/, { timeout: 20000 })
})

test('auth pages accessible without redirect', async ({ page }) => {
  await page.goto('/auth/login')
  await expect(page).toHaveURL(/\/auth\/login/)
})


