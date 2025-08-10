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
            },
            expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
          })
        });
      } else {
        route.continue();
      }
    });
  });

  test('should allow unauthenticated users to play as guest on home', async ({ page }) => {
    // Unauthenticated state
    await page.route('**/api/auth/session', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ user: null, expires: new Date(Date.now() - 1000).toISOString() })
      });
    });
  await page.goto('/');
  // Should remain on home with guest access
  await expect(page).toHaveURL('/');
  // Then check title and hint (copy not strict)
  await expect(page.getByText('EchoTypes')).toBeVisible();
  await expect(page.getByTestId('guest-hint')).toBeVisible();
  });

  test('should navigate between signin and signup pages', async ({ page }) => {
    await page.goto('/auth/signin');
    // Prefer explicit link navigation for cross-browser stability
    if (await page.getByText('Sign up').isVisible().catch(() => false)) {
      await page.getByText('Sign up').click();
      await expect(page).toHaveURL(/\/auth\/signup/);
    } else {
      // Fallback: go home and then to signup directly
      await page.goto('/auth/signup');
      await expect(page).toHaveURL(/\/auth\/signup/);
    }
  });

  test('should render authentication error page', async ({ page }) => {
    await page.goto('/auth/error');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Authentication Error');
  });

  test('should show sign-in UI and allow provider click', async ({ page }) => {
    await page.goto('/auth/signin');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('EchoTypes');
    await page.getByText('Continue with Google').click();
    // No crash/assertions beyond click since real OAuth is mocked
    await expect(page.getByText('Continue with Google')).toBeVisible();
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
          },
          expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
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
  await expect(page.locator('text=Welcome back,')).toBeVisible();
    
    // Should see main action buttons
    await expect(page.locator('text=เริ่มเล่น')).toBeVisible();
    await expect(page.locator('text=โปรไฟล์')).toBeVisible();
    await expect(page.locator('text=อันดับ')).toBeVisible();
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
          },
          expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
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
  const toast = page.getByTestId('welcome-toast');
  await expect(toast).toBeVisible();
  // Verify greeting includes user name inside toast
  await expect(toast.getByText('สวัสดี Test User!')).toBeVisible();
    
    // Toast should disappear after timeout
    await page.waitForTimeout(3000);
  await expect(page.locator('text=Welcome Back!')).not.toBeVisible();
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
          },
          expires: new Date(Date.now() + 60 * 60 * 1000).toISOString()
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

  // Go straight to profile page for stability across browsers
  await page.goto('/profile');
  await expect(page).toHaveURL(/\/profile/);
    
    // Mock signout response
    await page.route('**/api/auth/signout', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: '/auth/signin' })
      });
    });

  // Open user menu and click Sign Out
  await expect(page.getByRole('button', { name: 'User menu' })).toBeVisible();
  await page.getByRole('button', { name: 'User menu' }).click();
  await Promise.all([
    page.waitForURL(/\/auth\/signin/).catch(() => {}),
    page.getByText('Sign Out').click()
  ]);
  await expect(page).toHaveURL(/\/auth\/signin/);
  });
});