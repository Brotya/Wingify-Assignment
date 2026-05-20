// ============================================================================
// TEST FILE: full-flow.spec.ts
// PURPOSE : End-to-end flow combining all pages
// ============================================================================

import { test, expect } from '@playwright/test';

test('🔄 Full user flow: Home → My Dreams → Verify Diary + Total', async ({ page, context }) => {
  // STEP 1: Load home page
  await page.goto('/');
  await page.waitForTimeout(3500); // Wait for loader
  
  // STEP 2: Verify home content
  await expect(page.getByText('Dream Portal')).toBeVisible();
  
  // STEP 3: Click "My Dreams" and capture new tabs
  const newPagesPromise = Promise.all([
    context.waitForEvent('page'),
    context.waitForEvent('page'),
  ]);
  
  await page.getByRole('button', { name: /MY DREAMS/i })
            .or(page.getByRole('link', { name: /MY DREAMS/i }))
            .click();
  
  const newPages = await newPagesPromise;
  await Promise.all(newPages.map(p => p.waitForLoadState('domcontentloaded')));
  
  // STEP 4: Identify which tab is diary and which is total
  let diaryPage, totalPage;
  for (const p of newPages) {
    if (p.url().includes('dreams-diary')) diaryPage = p;
    else if (p.url().includes('dreams-total')) totalPage = p;
  }
  
  // STEP 5: Verify diary page has 10 entries
  if (diaryPage) {
    await diaryPage.waitForSelector('table tbody tr');
    const rowCount = await diaryPage.locator('table tbody tr').count();
    expect(rowCount).toBe(10);
  }
  
  // STEP 6: Verify total page stats
  if (totalPage) {
    await totalPage.waitForLoadState('domcontentloaded');
    const bodyText = await totalPage.locator('body').innerText();
    expect(bodyText).toContain('6');  // Good dreams
    expect(bodyText).toContain('4');  // Bad dreams
    expect(bodyText).toContain('10'); // Total
    expect(bodyText).toContain('2');  // Recurring
  }
  
  // Cleanup
  await Promise.all(newPages.map(p => p.close()));
});