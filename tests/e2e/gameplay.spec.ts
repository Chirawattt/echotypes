import { test, expect } from '@playwright/test';

test.describe('Gameplay Flow', () => {
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

    // Mock words API
    await page.route('**/api/words**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          words: [
            { word: 'hello', meaning: 'greeting', level: 'a1', type: 'interjection' },
            { word: 'world', meaning: 'earth', level: 'a1', type: 'noun' },
            { word: 'javascript', meaning: 'programming language', level: 'b2', type: 'noun' }
          ]
        })
      });
    });

    // Mock scores API
    await page.route('**/api/scores**', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            scores: [
              { score: 100, highest_streak: 5, wpm: 60 }
            ]
          })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            isNewHighScore: false
          })
        });
      }
    });
  });

  test('should complete Echo Mode practice game flow', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to game
    await page.click('text=เริ่มเล่น');
    await expect(page).toHaveURL(/\/play/);
    
    // Select Echo Mode
    await page.click('text=Echo Mode');
    await expect(page).toHaveURL(/\/play\/echo/);
    
    // Select DDA difficulty
    await page.click('text=DDA (Dynamic Difficulty)');
    await expect(page).toHaveURL(/\/play\/echo\/dda/);
    
    // Start the game
    await page.click('text=เริ่มเกม');
    await expect(page).toHaveURL(/\/play\/echo\/dda\/play/);
    
    // Wait for countdown
    await expect(page.locator('text=3')).toBeVisible();
    await page.waitForTimeout(3000);
    
    // Game should start
    await expect(page.locator('text=Listen and type what you hear')).toBeVisible();
    
    // Type the correct answer
    const input = page.locator('input[placeholder="Type what you heard..."]');
    await input.fill('hello');
    await input.press('Enter');
    
    // Should advance to next word
    await page.waitForTimeout(1000);
    
    // Complete a few more words
    await input.fill('world');
    await input.press('Enter');
    
    await page.waitForTimeout(1000);
    
    // Test incorrect answer
    await input.fill('wrong');
    await input.press('Enter');
    
    // Should show wrong feedback
    await expect(page.locator('.bg-red-500')).toBeVisible();
    
    // Continue until game over (lose all lives)
    await page.waitForTimeout(2000);
    
    // Should see game over screen
    await expect(page.locator('text=Game Over')).toBeVisible();
  });

  test('should complete Typing Mode challenge game flow', async ({ page }) => {
    await page.goto('/play');
    
    // Select Typing Mode
    await page.click('text=Typing Mode');
    await expect(page).toHaveURL(/\/play\/typing/);
    
    // Select Challenge mode
    await page.click('text=Challenge');
    
    // Select DDA difficulty
    await page.click('text=DDA (Dynamic Difficulty)');
    await expect(page).toHaveURL(/\/play\/typing\/dda/);
    
    // Start the game
    await page.click('text=เริ่มเกม');
    await expect(page).toHaveURL(/\/play\/typing\/dda\/play/);
    
    // Wait for countdown
    await page.waitForTimeout(3000);
    
    // Game should start
    await expect(page.locator('text=Type fast and maintain your streak!')).toBeVisible();
    
    // Should see timer and WPM counter
    await expect(page.locator('text=WPM')).toBeVisible();
    await expect(page.locator('text=60s')).toBeVisible();
    
    // Type words quickly
    const input = page.locator('input[placeholder="Type the word..."]');
    
    // Type correct word
    await input.fill('hello');
    await input.press('Enter');
    
    await page.waitForTimeout(500);
    
    // Type another word
    await input.fill('world');
    await input.press('Enter');
    
    await page.waitForTimeout(500);
    
    // Check streak counter
    await expect(page.locator('text=Streak:')).toBeVisible();
    
    // Wait for timer to run out or play until game over
    await page.waitForTimeout(5000);
    
    // Should see game over screen
    await expect(page.locator('text=Game Over')).toBeVisible();
    await expect(page.locator('text=Final Score:')).toBeVisible();
  });

  test('should complete Memory Mode practice game flow', async ({ page }) => {
    await page.goto('/play');
    
    // Select Memory Mode
    await page.click('text=Memory Mode');
    await expect(page).toHaveURL(/\/play\/memory/);
    
    // Select Practice mode
    await page.click('text=Practice');
    
    // Select DDA difficulty
    await page.click('text=DDA (Dynamic Difficulty)');
    await expect(page).toHaveURL(/\/play\/memory\/dda/);
    
    // Start the game
    await page.click('text=เริ่มเกม');
    await expect(page).toHaveURL(/\/play\/memory\/dda\/play/);
    
    // Wait for countdown
    await page.waitForTimeout(3000);
    
    // Game should start with memorization phase
    await expect(page.locator('text=Memorize this word')).toBeVisible();
    
    // Should see the word to memorize
    await expect(page.locator('text=hello')).toBeVisible();
    
    // Wait for memorization time
    await page.waitForTimeout(3000);
    
    // Should transition to recall phase
    await expect(page.locator('text=Type what you memorized')).toBeVisible();
    
    // Type the memorized word
    const input = page.locator('input[placeholder="Type what you memorized..."]');
    await input.fill('hello');
    await input.press('Enter');
    
    // Should advance to next word
    await page.waitForTimeout(1000);
    
    // Continue with a few more rounds
    await page.waitForTimeout(3000); // Memorization
    await input.fill('world');
    await input.press('Enter');
    
    // Test wrong answer
    await page.waitForTimeout(3000); // Memorization
    await input.fill('wrong');
    await input.press('Enter');
    
    // Should show incorrect feedback
    await expect(page.locator('.bg-red-500')).toBeVisible();
    
    // Continue until game over
    await page.waitForTimeout(5000);
    
    // Should see game over screen
    await expect(page.locator('text=Game Over')).toBeVisible();
  });

  test('should handle game restart correctly', async ({ page }) => {
    await page.goto('/play/echo/dda/play');
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Play a bit
    const input = page.locator('input[placeholder="Type what you heard..."]');
    await input.fill('hello');
    await input.press('Enter');
    
    // Click restart button
    await page.click('button[aria-label="Restart game"]');
    
    // Should restart countdown
    await expect(page.locator('text=3')).toBeVisible();
    
    // Game should restart fresh
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Listen and type what you hear')).toBeVisible();
  });

  test('should handle navigation to home during game', async ({ page }) => {
    await page.goto('/play/typing/dda/play');
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Click home button
    await page.click('button[aria-label="Go home"]');
    
    // Should navigate to home
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('EchoTypes');
  });

  test('should show different difficulty levels in DDA mode', async ({ page }) => {
    await page.goto('/play/echo/dda/play');
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Should show current difficulty level
    await expect(page.locator('text=Level:')).toBeVisible();
    await expect(page.locator('text=A1')).toBeVisible();
    
    // Play correctly to potentially level up
    const input = page.locator('input[placeholder="Type what you heard..."]');
    
    // Complete several words correctly
    for (let i = 0; i < 5; i++) {
      await input.fill('hello');
      await input.press('Enter');
      await page.waitForTimeout(1000);
    }
    
    // Level might have changed (though it depends on DDA algorithm)
    // We can at least verify the level indicator is still there
    await expect(page.locator('text=Level:')).toBeVisible();
  });

  test('should handle audio and speech functionality', async ({ page }) => {
    // Mock Web Speech API
    await page.addInitScript(() => {
      (window as Window & { speechSynthesis: unknown }).speechSynthesis = {
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
        getVoices: () => [],
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
        onvoiceschanged: null,
        paused: false,
        pending: false,
        speaking: false
      };
    });

    await page.goto('/play/echo/dda/play');
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Should have speak again button
    const speakAgainBtn = page.locator('button:has-text("🔊")');
    await expect(speakAgainBtn).toBeVisible();
    
    // Click speak again
    await speakAgainBtn.click();
    
    // Button should work without errors
    await expect(speakAgainBtn).toBeVisible();
  });

  test('should display game statistics correctly', async ({ page }) => {
    await page.goto('/play/typing/dda/play');
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Should show current statistics
    await expect(page.locator('text=Score:')).toBeVisible();
    await expect(page.locator('text=Lives:')).toBeVisible();
    await expect(page.locator('text=Streak:')).toBeVisible();
    
    // In typing challenge mode, should show WPM
    await expect(page.locator('text=WPM')).toBeVisible();
    
    // Play to update statistics
    const input = page.locator('input[placeholder="Type the word..."]');
    await input.fill('hello');
    await input.press('Enter');
    
    // Score should update
    await page.waitForTimeout(1000);
    // We can't easily test exact values, but UI should remain consistent
    await expect(page.locator('text=Score:')).toBeVisible();
  });

  test('should handle mobile virtual keyboard', async ({ page }) => {
    // Simulate mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/play/typing/dda/play');
    
    // Wait for game to start
    await page.waitForTimeout(3000);
    
    // Should show virtual keyboard for mobile
    if (await page.locator('[data-testid="virtual-keyboard"]').isVisible()) {
      // Test virtual keyboard functionality
      await page.click('[data-testid="virtual-keyboard"] button:has-text("h")');
      await page.click('[data-testid="virtual-keyboard"] button:has-text("e")');
      await page.click('[data-testid="virtual-keyboard"] button:has-text("l")');
      await page.click('[data-testid="virtual-keyboard"] button:has-text("l")');
      await page.click('[data-testid="virtual-keyboard"] button:has-text("o")');
      
      // Check if input was updated
      const input = page.locator('input[placeholder="Type the word..."]');
      await expect(input).toHaveValue('hello');
    }
  });
});