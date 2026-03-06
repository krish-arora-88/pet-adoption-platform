const { test, expect } = require('../fixtures');

test.describe('Registration Flow', () => {
    test('should register a new user and redirect to home', async ({ page }) => {
        await page.goto('/pages/register.html');

        const uniqueEmail = `reg-${Date.now()}@test.com`;
        await page.fill('#registerEmail', uniqueEmail);
        await page.fill('#registerPassword', 'password123');
        await page.fill('#registerConfirmPassword', 'password123');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/auth/register')),
            page.click('#registerForm button[type="submit"]'),
        ]);

        await expect(page.locator('#registerMessage')).toContainText('Registration successful');
        await page.waitForURL('**/', { timeout: 5000 });

        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeTruthy();
    });

    test('should show error for password mismatch', async ({ page }) => {
        await page.goto('/pages/register.html');

        await page.fill('#registerEmail', 'mismatch@test.com');
        await page.fill('#registerPassword', 'password123');
        await page.fill('#registerConfirmPassword', 'differentpassword');
        await page.click('#registerForm button[type="submit"]');

        await expect(page.locator('#registerMessage')).toContainText('Passwords do not match');
    });

    test('should show error for duplicate email', async ({ page, apiHelpers }) => {
        // Register via API first
        const email = `dup-${Date.now()}@test.com`;
        await fetch(`http://localhost:${process.env.TEST_PORT || 50100}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' }),
        });

        await page.goto('/pages/register.html');
        await page.fill('#registerEmail', email);
        await page.fill('#registerPassword', 'password123');
        await page.fill('#registerConfirmPassword', 'password123');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/auth/register')),
            page.click('#registerForm button[type="submit"]'),
        ]);

        await expect(page.locator('#registerMessage')).toContainText('already registered');
    });
});

test.describe('Login Flow', () => {
    test('should login with valid credentials and redirect to home', async ({ page }) => {
        const email = `login-${Date.now()}@test.com`;
        await fetch(`http://localhost:${process.env.TEST_PORT || 50100}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password: 'password123' }),
        });

        await page.goto('/pages/login.html');
        await page.fill('#loginEmail', email);
        await page.fill('#loginPassword', 'password123');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/auth/login')),
            page.click('#loginForm button[type="submit"]'),
        ]);

        await expect(page.locator('#loginMessage')).toContainText('Login successful');
        await page.waitForURL('**/', { timeout: 5000 });

        const token = await page.evaluate(() => localStorage.getItem('token'));
        expect(token).toBeTruthy();
    });

    test('should show error for invalid credentials', async ({ page }) => {
        await page.goto('/pages/login.html');
        await page.fill('#loginEmail', 'nonexistent@test.com');
        await page.fill('#loginPassword', 'wrongpassword');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/auth/login')),
            page.click('#loginForm button[type="submit"]'),
        ]);

        await expect(page.locator('#loginMessage')).toHaveText(/Invalid|failed/i);
    });
});
