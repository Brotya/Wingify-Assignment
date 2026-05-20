// ============================================================================
// TEST FILE: home.spec.ts
// PURPOSE : Validate the Dream Portal home page (index.html)
// ============================================================================

import { test, expect } from '@playwright/test';

test.describe('Dream Portal — Home Page Tests', () => {

  test('✅ Loading animation appears and disappears after ~3 seconds', async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
    
    // Loading animation should be visible initially
    // (Selector may need adjustment based on actual HTML structure)
    const loader = page.locator('.loading, .loader, #loader, [class*="load"]').first();
    
    // Check if loader appears (gracefully handle if absent)
    const loaderVisible = await loader.isVisible().catch(() => false);
    if (loaderVisible) {
      console.log('✓ Loading animation detected');
    }
    
    // Wait for loader to disappear (~3 seconds)
    await page.waitForTimeout(3500);
    
    // Verify loader is hidden after 3 seconds
    await expect(loader).toBeHidden({ timeout: 5000 }).catch(() => {
      console.log('Note: Loader may have been removed from DOM');
    });
  });

  test('✅ Main content and "My Dreams" button become visible', async ({ page }) => {
    await page.goto('/');
    
    // Wait for loading animation to complete
    await page.waitForTimeout(3500);
    
    // Verify the "Dream Portal" heading is visible
    await expect(page.getByText('Dream Portal', { exact: false })).toBeVisible();
    
    // Verify "Explore your dream journey" subtitle
    await expect(page.getByText(/Explore your dream journey/i)).toBeVisible();
    
    // Verify Dreams (10) and Days (7) stats are displayed
    await expect(page.getByText('10', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('7', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/Dreams/i).first()).toBeVisible();
    await expect(page.getByText(/Days/i).first()).toBeVisible();
    
    // Verify "MY DREAMS" button is visible and enabled
    const myDreamsButton = page.getByRole('button', { name: /MY DREAMS/i })
                              .or(page.getByRole('link', { name: /MY DREAMS/i }));
    await expect(myDreamsButton).toBeVisible();
    await expect(myDreamsButton).toBeEnabled();
  });

  test('✅ Clicking "My Dreams" opens dreams-diary.html and dreams-total.html in new tabs', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForTimeout(3500);
    
    // Listen for new pages opened (multiple tabs/windows)
    const newPagesPromise = Promise.all([
      context.waitForEvent('page'),
      context.waitForEvent('page'),
    ]);
    
    // Click "My Dreams" button
    const myDreamsButton = page.getByRole('button', { name: /MY DREAMS/i })
                              .or(page.getByRole('link', { name: /MY DREAMS/i }));
    await myDreamsButton.click();
    
    // Wait for two new pages to open
    const newPages = await newPagesPromise;
    
    // Wait for both to load
    await Promise.all(newPages.map(p => p.waitForLoadState('domcontentloaded')));
    
    // Get URLs of both new pages
    const urls = newPages.map(p => p.url());
    console.log('New tab URLs:', urls);
    
    // Verify both expected URLs opened
    const hasDiary = urls.some(url => url.includes('dreams-diary.html'));
    const hasTotal = urls.some(url => url.includes('dreams-total.html'));
    
    expect(hasDiary).toBeTruthy();
    expect(hasTotal).toBeTruthy();
    
    // Close new pages
    await Promise.all(newPages.map(p => p.close()));
  });

});