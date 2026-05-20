// ============================================================================
// TEST FILE: dreams-total.spec.ts
// PURPOSE : Validate the dreams summary page (dreams-total.html)
// ============================================================================

import { test, expect, Page } from '@playwright/test';

// ============================================================================
// HELPER FUNCTION: Extract numeric value next to a label
// ============================================================================
async function getStatValue(page: Page, label: string): Promise<number> {
  // Try multiple strategies to find the value near the label
  const parent = page.locator(`*:has-text("${label}")`).first();
  const text = await parent.innerText();
  
  // Extract first number found in the text
  const match = text.match(/\d+/);
  return match ? parseInt(match[0]) : -1;
}

// ============================================================================
// HELPER FUNCTION: Calculate recurring dreams from diary page
// ============================================================================
async function calculateRecurringFromDiary(page: Page): Promise<{ recurring: string[], count: number }> {
  await page.goto('/dreams-diary.html');
  await page.waitForSelector('table tbody tr');
  
  const dreamNames = await page.locator('table tbody tr td:nth-child(1)').allInnerTexts();
  const cleanedNames = dreamNames.map(n => n.trim());
  
  // Count frequency
  const frequency: Record<string, number> = {};
  cleanedNames.forEach(name => {
    frequency[name] = (frequency[name] || 0) + 1;
  });
  
  // Recurring = appears more than once
  const recurring = Object.entries(frequency)
    .filter(([_, count]) => count > 1)
    .map(([name]) => name);
  
  return { recurring, count: recurring.length };
}

// ============================================================================
// TEST SUITE
// ============================================================================
test.describe('Dream Portal — Dreams Total Summary Tests', () => {

  test('✅ Good Dreams count = 6', async ({ page }) => {
    await page.goto('/dreams-total.html');
    await page.waitForLoadState('domcontentloaded');
    
    const goodCount = await getStatValue(page, 'Good');
    console.log(`Good Dreams: ${goodCount}`);
    
    expect(goodCount).toBe(6);
  });

  test('✅ Bad Dreams count = 4', async ({ page }) => {
    await page.goto('/dreams-total.html');
    await page.waitForLoadState('domcontentloaded');
    
    const badCount = await getStatValue(page, 'Bad');
    console.log(`Bad Dreams: ${badCount}`);
    
    expect(badCount).toBe(4);
  });

  test('✅ Total Dreams count = 10', async ({ page }) => {
    await page.goto('/dreams-total.html');
    await page.waitForLoadState('domcontentloaded');
    
    const totalCount = await getStatValue(page, 'Total');
    console.log(`Total Dreams: ${totalCount}`);
    
    expect(totalCount).toBe(10);
  });

  test('✅ Recurring Dreams count = 2', async ({ page }) => {
    await page.goto('/dreams-total.html');
    await page.waitForLoadState('domcontentloaded');
    
    const recurringCount = await getStatValue(page, 'Recurring');
    console.log(`Recurring Dreams (from page): ${recurringCount}`);
    
    expect(recurringCount).toBe(2);
  });

  test('✅ Recurring dreams logic matches diary data ("Flying over mountains" + "Lost in maze")', async ({ page }) => {
    // First, calculate recurring dreams from the actual diary data
    const { recurring, count } = await calculateRecurringFromDiary(page);
    
    console.log(`Recurring dreams identified: ${recurring.join(', ')}`);
    console.log(`Recurring count from diary: ${count}`);
    
    // Verify the specific recurring dreams expected
    expect(recurring).toContain('Flying over mountains');
    expect(recurring).toContain('Lost in maze');
    expect(count).toBe(2);
  });

  test('✅ Good + Bad dreams sum equals Total dreams', async ({ page }) => {
    await page.goto('/dreams-total.html');
    await page.waitForLoadState('domcontentloaded');
    
    const good  = await getStatValue(page, 'Good');
    const bad   = await getStatValue(page, 'Bad');
    const total = await getStatValue(page, 'Total');
    
    expect(good + bad).toBe(total);
  });

});