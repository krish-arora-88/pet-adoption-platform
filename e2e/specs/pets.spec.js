const { test, expect } = require('../fixtures');

test.describe('Pet Table & Filtering', () => {
    test.beforeEach(async ({ apiHelpers }) => {
        await apiHelpers.clearAll();
        await apiHelpers.seedSpecies('Dog');
        await apiHelpers.seedSpecies('Cat');
        await apiHelpers.seedPet(3001, 'Buddy', 3, 'Labrador', 'M', 'Dog');
        await apiHelpers.seedPet(3002, 'Luna', 7, 'Persian', 'F', 'Cat');
        await apiHelpers.seedPet(3003, 'Rex', 1, 'Shepherd', 'M', 'Dog');
    });

    test('should load and display pets in table', async ({ page }) => {
        await page.goto('/pages/pets.html');

        const rows = page.locator('#pet_table tbody tr');
        await expect(rows).toHaveCount(3, { timeout: 10000 });
        await expect(rows.first().locator('td').nth(1)).toContainText('Buddy');
    });

    test('should filter by species', async ({ page }) => {
        await page.goto('/pages/pets.html');
        await expect(page.locator('#pet_table tbody tr')).toHaveCount(3, { timeout: 10000 });

        // Species filter fires on change event
        await page.selectOption('#speciesFilter', 'Dog');

        const rows = page.locator('#pet_table tbody tr');
        await expect(rows).toHaveCount(2, { timeout: 10000 });
    });

    test('should filter by age range', async ({ page }) => {
        await page.goto('/pages/pets.html');
        await expect(page.locator('#pet_table tbody tr')).toHaveCount(3, { timeout: 10000 });

        await page.fill('#ageMinFilter', '2');
        await page.fill('#ageMaxFilter', '5');
        await page.click('#applyFilters');

        const rows = page.locator('#pet_table tbody tr');
        await expect(rows).toHaveCount(1, { timeout: 10000 });
        await expect(rows.first().locator('td').nth(1)).toContainText('Buddy');
    });

    test('should reset filters', async ({ page }) => {
        await page.goto('/pages/pets.html');
        await expect(page.locator('#pet_table tbody tr')).toHaveCount(3, { timeout: 10000 });

        await page.selectOption('#speciesFilter', 'Dog');
        await expect(page.locator('#pet_table tbody tr')).toHaveCount(2, { timeout: 10000 });

        await page.click('#resetFilters');
        await expect(page.locator('#pet_table tbody tr')).toHaveCount(3, { timeout: 10000 });
    });
});

test.describe('Pet Registration', () => {
    test.beforeEach(async ({ apiHelpers }) => {
        await apiHelpers.clearAll();
        await apiHelpers.seedSpecies('Dog');
    });

    test('should register a new pet when authenticated', async ({ authedPage: page }) => {
        await page.goto('/pages/pets.html');

        // Open the expandable panel
        await page.click('.expandable-trigger');
        await page.waitForSelector('#new_pet', { state: 'visible' });

        // Wait for species dropdown to populate
        await page.waitForFunction(() =>
            document.getElementById('speciesSelect') &&
            document.getElementById('speciesSelect').options.length > 1
        , { timeout: 10000 });

        await page.fill('#MicrochipID', '5001');
        await page.fill('#petName', 'TestDog');
        await page.fill('#petAge', '4');
        await page.fill('#breed', 'Beagle');
        await page.selectOption('#gender', 'M');
        await page.selectOption('#speciesSelect', 'Dog');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/insert-new-pet')),
            page.click('#new_pet button[type="submit"]'),
        ]);

        await expect(page.locator('#new_pet_message')).toContainText('successfully');
    });

    test('should redirect to login when submitting without auth', async ({ page }) => {
        await page.goto('/pages/pets.html');

        await page.click('.expandable-trigger');
        await page.waitForSelector('#new_pet', { state: 'visible' });

        // Wait for species dropdown to populate (beforeEach seeds 'Dog')
        await page.waitForFunction(() =>
            document.getElementById('speciesSelect') &&
            document.getElementById('speciesSelect').options.length > 1
        , { timeout: 10000 });

        await page.fill('#MicrochipID', '5002');
        await page.fill('#petName', 'NoAuth');
        await page.fill('#petAge', '2');
        await page.fill('#breed', 'Lab');
        await page.selectOption('#gender', 'M');
        await page.selectOption('#speciesSelect', 'Dog');

        await Promise.all([
            page.waitForURL('**/login.html', { timeout: 10000 }),
            page.click('#new_pet button[type="submit"]'),
        ]);
    });
});

test.describe('Pet Statistics', () => {
    test('should display pet stats', async ({ apiHelpers, page }) => {
        await apiHelpers.clearAll();
        await apiHelpers.seedSpecies('Dog');
        await apiHelpers.seedSpecies('Cat');
        await apiHelpers.seedPet(4001, 'A', 2, 'Lab', 'M', 'Dog');
        await apiHelpers.seedPet(4002, 'B', 4, 'Pug', 'F', 'Dog');
        await apiHelpers.seedPet(4003, 'C', 3, 'Siamese', 'F', 'Cat');

        await page.goto('/pages/pets.html');
        await expect(page.locator('#pet_table tbody tr')).toHaveCount(3, { timeout: 10000 });

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/get-pet-stats')),
            page.click('#viewPetStats'),
        ]);

        const rows = page.locator('#petStatsTable tbody tr');
        const count = await rows.count();
        expect(count).toBeGreaterThanOrEqual(1);
    });
});
