const { test, expect } = require('../fixtures');

test.describe('Home Page', () => {
    test('should display stat ribbon with correct counts', async ({ authedPage: page, apiHelpers }) => {
        await apiHelpers.clearAll();
        await apiHelpers.seedSpecies('Dog');
        await apiHelpers.seedPet(1001, 'Buddy', 3, 'Labrador', 'M', 'Dog');
        await apiHelpers.seedPet(1002, 'Max', 5, 'Poodle', 'M', 'Dog');
        await apiHelpers.seedAdoptionCenter(100, 'BC Paws', '123 Main St', 50);
        const client = await apiHelpers.seedClient('Jane', 'Doe', '456 Oak St', '5551234');
        await apiHelpers.seedAdoption(1001, '20240101', client.clientID, 100);

        await page.goto('/');

        await expect(page.locator('#statPets')).toHaveText('2', { timeout: 10000 });
        await expect(page.locator('#statAdoptions')).toHaveText('1');
        await expect(page.locator('#statCenters')).toHaveText('1');
    });

    test('should display featured pet cards', async ({ authedPage: page, apiHelpers }) => {
        await apiHelpers.clearAll();
        await apiHelpers.seedSpecies('Cat');
        await apiHelpers.seedPet(2001, 'Whiskers', 2, 'Siamese', 'F', 'Cat');
        await apiHelpers.seedPet(2002, 'Luna', 4, 'Persian', 'F', 'Cat');

        await page.goto('/');

        const cards = page.locator('#featuredPets .pet-card');
        await expect(cards).toHaveCount(2, { timeout: 10000 });
    });

    test('should show login link when unauthenticated', async ({ page }) => {
        await page.goto('/');
        await expect(page.locator('#sidebarLoginLink')).toBeVisible();
    });

    test('should show user email when authenticated', async ({ authedPage: page }) => {
        await page.goto('/');
        await expect(page.locator('#authStatus')).toContainText('e2e-user@test.com', { timeout: 10000 });
        await expect(page.locator('#sidebarLogoutLink')).toBeVisible();
    });
});
