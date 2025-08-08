import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock external auth providers to avoid real OAuth
    await page.route('**/api/auth/**', (route) => {
      if (route.request().url().includes('signin')) {
        route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: `
            <html>
              <body>
                <form id="signin-form">
                  <input type="email" name="email" placeholder="Email" />
                  <input type="password" name="password" placeholder="Password" />
                  <button type="submit">Sign In</button>
                </form>
              </body>
            </html>
          `
        });
      } else if (route.request().url().includes('session')) {
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
      } else {
        route.continue();
      }
    });
  });

  test('should redirect unauthenticated user to signin page', async ({ page }) => {
    await page.goto('/');
    
    // Should be redirected to signin page
    await expect(page).toHaveURL(/\/auth\/signin/);
    
    // Check signin page elements
    await expect(page.locator('h1')).toContainText('Sign In');
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    await expect(page.locator('text=Continue with GitHub')).toBeVisible();
  });

  test('should display signup page correctly', async ({ page }) => {
    await page.goto('/auth/signup');
    
    await expect(page.locator('h1')).toContainText('Sign Up');
    await expect(page.locator('text=Join EchoTypes')).toBeVisible();
    await expect(page.locator('text=Continue with Google')).toBeVisible();
    await expect(page.locator('text=Continue with GitHub')).toBeVisible();
    
    // Check if "Already have an account?" link is present
    await expect(page.locator('text=Already have an account?')).toBeVisible();
    await expect(page.locator('text=Sign in here')).toBeVisible();
  });

  test('should navigate between signin and signup pages', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Go to signup page
    await page.click('text=Create one here');
    await expect(page).toHaveURL(/\/auth\/signup/);
    
    // Go back to signin page
    await page.click('text=Sign in here');
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Mock auth error
    await page.route('**/api/auth/signin/**', (route) => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' })
      });
    });

    await page.goto('/auth/signin');
    
    // Try to sign in (this would normally trigger OAuth)
    await page.click('text=Continue with Google');
    
    // Should be redirected to error page
    await expect(page).toHaveURL(/\/auth\/error/);
    await expect(page.locator('h1')).toContainText('Authentication Error');
  });

  test('should show loading state during authentication', async ({ page }) => {
    await page.goto('/auth/signin');
    
    // Mock slow auth response
    await page.route('**/api/auth/signin/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/' })
      });
    });

    await page.click('text=Continue with Google');
    
    // Should show loading state
    await expect(page.locator('text=Loading...')).toBeVisible();
  });

  test('should complete authentication flow and redirect to home', async ({ page }) => {
    // Mock successful auth
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

    await page.goto('/auth/signin');
    
    // Simulate successful authentication by directly going to home
    await page.goto('/?loginTimestamp=' + Date.now());
    
    // Should see home page with user welcome
    await expect(page.locator('h1')).toContainText('EchoTypes');
    await expect(page.locator('text=Welcome back, Test User')).toBeVisible();
    
    // Should see main action buttons
    await expect(page.locator('text=เริ่มเล่น')).toBeVisible();
    await expect(page.locator('text=โปรไฟล์')).toBeVisible();
    await expect(page.locator('text=อันดับ')).toBeVisible();
  });

  test('should handle user registration flow', async ({ page }) => {
    // Mock unregistered user
    await page.route('**/api/auth/register', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ registered: false })
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true })
        });
      }
    });

    await page.route('**/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 'new-user-id',
            name: 'New User',
            email: 'new@example.com'
          }
        })
      });
    });

    await page.goto('/');
    
    // Should be redirected to signup page for registration
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('should display welcome toast for new login', async ({ page }) => {
    // Mock authenticated user
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

    // Visit home with fresh login timestamp
    const loginTimestamp = Date.now();
    await page.goto(`/?loginTimestamp=${loginTimestamp}`);
    
    // Should show welcome back toast
    await expect(page.locator('text=Welcome back!')).toBeVisible();
    await expect(page.locator('text=Test User')).toBeVisible();
    
    // Toast should disappear after timeout
    await page.waitForTimeout(3000);
    await expect(page.locator('text=Welcome back!')).not.toBeVisible();
  });

  test('should handle logout correctly', async ({ page }) => {
    // Mock authenticated state first
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

    await page.goto('/');
    
    // Go to profile page where logout button should be
    await page.click('text=โปรไฟล์');
    await expect(page).toHaveURL(/\/profile/);
    
    // Mock signout response
    await page.route('**/api/auth/signout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/auth/signin' })
      });
    });

    // Click logout button (if available)
    if (await page.locator('text=Logout').isVisible()) {
      await page.click('text=Logout');
      
      // Should be redirected to signin page
      await expect(page).toHaveURL(/\/auth\/signin/);
    }
  });
});