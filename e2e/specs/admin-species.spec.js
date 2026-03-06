const { test, expect } = require('../fixtures');

test.describe('Admin — Species Tab', () => {
    test.beforeEach(async ({ apiHelpers }) => {
        await apiHelpers.clearAll();
    });

    test('should display species table on page load', async ({ page, apiHelpers }) => {
        await apiHelpers.seedSpecies('Dog', '200', 'Daily', 'Meat');
        await apiHelpers.seedSpecies('Cat', '100', 'Weekly', 'Mixed');

        await page.goto('/pages/admin.html');
        await page.click('.tab-btn[data-tab="tab-species"]');

        const rows = page.locator('#speciesTableBody tr');
        await expect(rows).toHaveCount(2, { timeout: 10000 });
    });

    test('should add a new species', async ({ authedPage: page }) => {
        await page.goto('/pages/admin.html');
        await page.click('.tab-btn[data-tab="tab-species"]');

        await page.fill('#speciesName', 'Hamster');
        await page.fill('#housingSpace', '50');
        await page.fill('#groomingRoutine', 'Monthly');
        await page.fill('#dietType', 'Seeds');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/insert-new-species')),
            page.click('#speciesForm button[type="submit"]'),
        ]);

        await expect(page.locator('#species_form_message')).toContainText('added successfully');
        await expect(page.locator('#speciesTableBody tr')).toHaveCount(1, { timeout: 5000 });
    });

    test('should run aggregation query for species with min pet count', async ({ authedPage: page, apiHelpers }) => {
        await apiHelpers.seedSpecies('Dog');
        await apiHelpers.seedSpecies('Cat');
        await apiHelpers.seedPet(7001, 'A', 2, 'Lab', 'M', 'Dog');
        await apiHelpers.seedPet(7002, 'B', 3, 'Pug', 'F', 'Dog');
        await apiHelpers.seedPet(7003, 'C', 4, 'Beagle', 'M', 'Dog');
        await apiHelpers.seedPet(7004, 'D', 1, 'Siamese', 'F', 'Cat');

        await page.goto('/pages/admin.html');
        await page.click('.tab-btn[data-tab="tab-species"]');

        await page.fill('#minPetCount', '2');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/query-species')),
            page.click('#querySpecies'),
        ]);

        const rows = page.locator('#aggregationResultTableBody tr');
        await expect(rows).toHaveCount(1, { timeout: 5000 });
        await expect(rows.first().locator('td').first()).toContainText('Dog');
        await expect(rows.first().locator('td').nth(1)).toContainText('3');
    });

    test('should redirect to login when adding species without auth', async ({ page }) => {
        await page.goto('/pages/admin.html');
        await page.click('.tab-btn[data-tab="tab-species"]');

        await page.fill('#speciesName', 'Unauthed');
        await page.fill('#housingSpace', '10');
        await page.fill('#groomingRoutine', 'None');
        await page.fill('#dietType', 'Any');

        await Promise.all([
            page.waitForURL('**/login.html', { timeout: 10000 }),
            page.click('#speciesForm button[type="submit"]'),
        ]);
    });
});
