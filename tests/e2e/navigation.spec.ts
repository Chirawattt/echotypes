import { test, expect } from '@playwright/test';

test.describe('Navigation and UI Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'test-user-id',
            name: 'Test User',
            email: 'test@example.com'
          }
        })
      });
    });

    await page.route('**/api/auth/register', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ registered: true })
      });
    });

    // Mock API responses
    await page.route('**/api/scores**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          scores: [
            { score: 150, highest_streak: 8, wpm: 65, game_mode: 'typing', game_style: 'challenge' },
            { score: 200, highest_streak: 12, game_mode: 'echo', game_style: 'practice' }
          ]
        })
      });
    });

    await page.route('**/api/leaderboard**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          leaderboard: [
            { name: 'Test User', score: 2500, game_mode: 'typing', rank: 1 },
            { name: 'User 2', score: 2000, game_mode: 'echo', rank: 2 },
            { name: 'User 3', score: 1800, game_mode: 'memory', rank: 3 }
          ]
        })
      });
    });

    await page.route('**/api/profile**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            name: 'Test User',
            email: 'test@example.com',
            created_at: '2024-01-01T00:00:00Z'
          },
          stats: {
            totalGames: 25,
            totalWordsCorrect: 150,
            totalWordsIncorrect: 20,
            overallAccuracy: 88.2,
            bestStreak: 15
          }
        })
      });
    });
  });

  test('should navigate through main pages correctly', async ({ page }) => {
    await page.goto('/');
    
    // Should be on home page
    await expect(page.locator('h1')).toContainText('EchoTypes');
    await expect(page.locator('text=เกมฝึกคำศัพท์ภาษาอังกฤษ')).toBeVisible();
    
    // Navigate to game selection
    await page.click('text=เริ่มเล่น');
    await expect(page).toHaveURL(/\/play/);
    await expect(page.locator('h1')).toContainText('Choose Your Game Mode');
    
    // Should see all game modes
    await expect(page.locator('text=Echo Mode')).toBeVisible();
    await expect(page.locator('text=Memory Mode')).toBeVisible();
    await expect(page.locator('text=Typing Mode')).toBeVisible();
    
    // Go back to home
    await page.click('button[aria-label="Go home"]');
    await expect(page).toHaveURL('/');
  });

  test('should navigate to profile page', async ({ page }) => {
    await page.goto('/');
    
    // Click profile button
    await page.click('text=โปรไฟล์');
    await expect(page).toHaveURL(/\/profile/);
    
    // Should show profile information
    await expect(page.locator('h1')).toContainText('Profile');
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
    
    // Should show statistics
    await expect(page.locator('text=Total Games')).toBeVisible();
    await expect(page.locator('text=25')).toBeVisible();
    await expect(page.locator('text=Words Correct')).toBeVisible();
    await expect(page.locator('text=150')).toBeVisible();
    await expect(page.locator('text=Best Streak')).toBeVisible();
    await expect(page.locator('text=15')).toBeVisible();
    
    // Should show accuracy percentage
    await expect(page.locator('text=88.2%')).toBeVisible();
  });

  test('should navigate to leaderboard page', async ({ page }) => {
    await page.goto('/');
    
    // Click leaderboard button
    await page.click('text=อันดับ');
    await expect(page).toHaveURL(/\/leaderboard/);
    
    // Should show leaderboard
    await expect(page.locator('h1')).toContainText('Leaderboard');
    
    // Should show leaderboard entries
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=User 2')).toBeVisible();
    await expect(page.locator('text=User 3')).toBeVisible();
    
    // Should show scores
    await expect(page.locator('text=2500')).toBeVisible();
    await expect(page.locator('text=2000')).toBeVisible();
    await expect(page.locator('text=1800')).toBeVisible();
    
    // Should show rank numbers
    await expect(page.locator('text=#1')).toBeVisible();
    await expect(page.locator('text=#2')).toBeVisible();
    await expect(page.locator('text=#3')).toBeVisible();
  });

  test('should navigate through game mode selection', async ({ page }) => {
    await page.goto('/play');
    
    // Select Echo Mode
    await page.click('text=Echo Mode');
    await expect(page).toHaveURL(/\/play\/echo/);
    
    // Should show mode description and options
    await expect(page.locator('text=Listen and type what you hear')).toBeVisible();
    await expect(page.locator('text=Practice')).toBeVisible();
    await expect(page.locator('text=Challenge')).toBeVisible();
    
    // Go back to mode selection
    await page.click('button[aria-label="Back"]');
    await expect(page).toHaveURL(/\/play/);
    
    // Select Typing Mode
    await page.click('text=Typing Mode');
    await expect(page).toHaveURL(/\/play\/typing/);
    
    // Should show typing mode description
    await expect(page.locator('text=Type words as fast as you can')).toBeVisible();
    
    // Go back again
    await page.click('button[aria-label="Back"]');
    await expect(page).toHaveURL(/\/play/);
    
    // Select Memory Mode
    await page.click('text=Memory Mode');
    await expect(page).toHaveURL(/\/play\/memory/);
    
    // Should show memory mode description
    await expect(page.locator('text=Memorize and recall words')).toBeVisible();
  });

  test('should navigate through difficulty selection', async ({ page }) => {
    await page.goto('/play/echo');
    
    // Select Practice mode first
    await page.click('text=Practice');
    
    // Should show difficulty options
    await expect(page.locator('text=DDA (Dynamic Difficulty)')).toBeVisible();
    
    // Select DDA difficulty
    await page.click('text=DDA (Dynamic Difficulty)');
    await expect(page).toHaveURL(/\/play\/echo\/dda/);
    
    // Should show pre-game information
    await expect(page.locator('text=Echo Mode')).toBeVisible();
    await expect(page.locator('text=Practice Style')).toBeVisible();
    await expect(page.locator('text=เริ่มเกม')).toBeVisible();
    
    // Go back to difficulty selection
    await page.click('button[aria-label="Back"]');
    await expect(page).toHaveURL(/\/play\/echo/);
  });

  test('should handle responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    
    // Should show mobile-optimized layout
    await expect(page.locator('h1')).toContainText('EchoTypes');
    
    // Navigation should work on mobile
    await page.click('text=เริ่มเล่น');
    await expect(page).toHaveURL(/\/play/);
    
    // Game mode cards should be responsive
    await expect(page.locator('text=Echo Mode')).toBeVisible();
    await expect(page.locator('text=Memory Mode')).toBeVisible();
    await expect(page.locator('text=Typing Mode')).toBeVisible();
    
    // Should handle mobile touch interactions
    await page.tap('text=Echo Mode');
    await expect(page).toHaveURL(/\/play\/echo/);
  });

  test('should show proper loading states', async ({ page }) => {
    // Mock slow API responses
    await page.route('**/api/scores**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, scores: [] })
      });
    });

    await page.goto('/profile');
    
    // Should show loading state
    await expect(page.locator('text=Loading...')).toBeVisible();
    
    // Should eventually load content
    await expect(page.locator('h1')).toContainText('Profile');
  });

  test('should handle navigation errors gracefully', async ({ page }) => {
    // Mock API error
    await page.route('**/api/profile**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/profile');
    
    // Should show error message or fallback content
    // The exact error handling depends on implementation
    await expect(page.locator('h1')).toContainText('Profile');
  });

  test('should maintain header navigation across pages', async ({ page }) => {
    await page.goto('/');
    
    // Header should be visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=EchoTypes')).toBeVisible();
    
    // Navigate to different pages and check header persistence
    await page.click('text=โปรไฟล์');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('text=EchoTypes')).toBeVisible();
    
    await page.click('text=EchoTypes'); // Click logo to go home
    await expect(page).toHaveURL('/');
    
    await page.click('text=อันดับ');
    await expect(page.locator('header')).toBeVisible();
    
    await page.click('text=เริ่มเล่น');
    await expect(page.locator('header')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    
    // Navigate through several pages
    await page.click('text=เริ่มเล่น');
    await page.click('text=Echo Mode');
    await page.click('text=Practice');
    
    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/\/play\/echo/);
    
    await page.goBack();
    await expect(page).toHaveURL(/\/play/);
    
    await page.goBack();
    await expect(page).toHaveURL('/');
    
    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/\/play/);
    
    await page.goForward();
    await expect(page).toHaveURL(/\/play\/echo/);
  });

  test('should handle deep linking correctly', async ({ page }) => {
    // Navigate directly to a deep URL
    await page.goto('/play/typing/dda');
    
    // Should load the correct page
    await expect(page.locator('text=Typing Mode')).toBeVisible();
    await expect(page.locator('text=DDA (Dynamic Difficulty)')).toBeVisible();
    await expect(page.locator('text=เริ่มเกม')).toBeVisible();
    
    // Navigation should still work from deep link
    await page.click('button[aria-label="Back"]');
    await expect(page).toHaveURL(/\/play\/typing/);
    
    // Direct navigation to game
    await page.goto('/play/echo/dda/play');
    
    // Should start loading the game
    await expect(page.locator('text=Loading...')).toBeVisible();
  });
});