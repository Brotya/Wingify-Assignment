// ============================================================================
// TEST FILE: dreams-diary.spec.ts
// PURPOSE : Validate the dreams diary table (dreams-diary.html)
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Dream Portal — Dreams Diary Table Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate directly to dreams diary page
    await page.goto('/dreams-diary.html');
    
    // Wait for table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
  });

  test('✅ Exactly 10 dream entries exist in the table', async ({ page }) => {
    // Count rows in the table body
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    console.log(`Number of dream entries found: ${rowCount}`);
    
    // Assert exactly 10 entries
    expect(rowCount).toBe(10);
  });

  test('✅ Dream types are only "Good" or "Bad"', async ({ page }) => {
    // Get all cells in the "Dream Type" column (3rd column)
    const dreamTypeCells = page.locator('table tbody tr td:nth-child(3)');
    const count = await dreamTypeCells.count();
    
    const validTypes = ['Good', 'Bad'];
    const invalidTypes: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const text = (await dreamTypeCells.nth(i).innerText()).trim();
      if (!validTypes.includes(text)) {
        invalidTypes.push(`Row ${i + 1}: "${text}"`);
      }
    }
    
    // Report any invalid types
    if (invalidTypes.length > 0) {
      console.error('❌ Invalid dream types found:', invalidTypes);
    }
    
    expect(invalidTypes.length).toBe(0);
  });

  test('✅ Each row has all 3 columns filled (Dream Name, Days Ago, Dream Type)', async ({ page }) => {
    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    
    const emptyFields: string[] = [];
    
    for (let i = 0; i < rowCount; i++) {
      const cells = rows.nth(i).locator('td');
      const cellCount = await cells.count();
      
      // Verify each row has at least 3 columns
      expect(cellCount).toBeGreaterThanOrEqual(3);
      
      // Check that all 3 columns have non-empty values
      const dreamName = (await cells.nth(0).innerText()).trim();
      const daysAgo = (await cells.nth(1).innerText()).trim();
      const dreamType = (await cells.nth(2).innerText()).trim();
      
      if (!dreamName) emptyFields.push(`Row ${i + 1}: Dream Name`);
      if (!daysAgo)   emptyFields.push(`Row ${i + 1}: Days Ago`);
      if (!dreamType) emptyFields.push(`Row ${i + 1}: Dream Type`);
    }
    
    if (emptyFields.length > 0) {
      console.error('❌ Empty fields found:', emptyFields);
    }
    
    expect(emptyFields.length).toBe(0);
  });

  test('✅ Verify expected dream entries are present', async ({ page }) => {
    // Verify specific dream names from the assignment screenshot
    const expectedDreams = [
      'Flying over mountains',
      'Lost in maze',
      'Winning lottery',
      'Being late to exam',
      'Swimming with dolphins',
      'Time travel adventure',
      'Monster chase'
    ];
    
    for (const dreamName of expectedDreams) {
      const dream = page.getByText(dreamName, { exact: false }).first();
      await expect(dream).toBeVisible();
    }
  });

});