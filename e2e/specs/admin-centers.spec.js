const { test, expect } = require('../fixtures');

test.describe('Admin — Adoption Centers Tab', () => {
    test.beforeEach(async ({ apiHelpers }) => {
        await apiHelpers.clearAll();
    });

    test('should display adoption center table on page load', async ({ page, apiHelpers }) => {
        await apiHelpers.seedAdoptionCenter(300, 'Center A', '100 First Ave', 40);
        await apiHelpers.seedAdoptionCenter(301, 'Center B', '200 Second Ave', 60);

        await page.goto('/pages/admin.html');

        const rows = page.locator('#adoption_center_table tbody tr');
        await expect(rows).toHaveCount(2, { timeout: 10000 });
    });

    test('should add a new adoption center', async ({ authedPage: page }) => {
        await page.goto('/pages/admin.html');

        await page.fill('#centerLicenseNumber', '500');
        await page.fill('#centerName', 'New Center');
        await page.fill('#address', '999 Test Blvd');
        await page.fill('#animalCapacity', '75');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/insert-new-adoption-center')),
            page.click('#new_adoption_center button[type="submit"]'),
        ]);

        await expect(page.locator('#new_adoption_center_message')).toContainText('successfully');
        await expect(page.locator('#adoption_center_table tbody tr')).toHaveCount(1, { timeout: 5000 });
    });

    test('should update an existing adoption center', async ({ authedPage: page, apiHelpers }) => {
        await apiHelpers.seedAdoptionCenter(501, 'Old Name', '123 Old St', 50);

        await page.goto('/pages/admin.html');
        await expect(page.locator('#adoption_center_table tbody tr')).toHaveCount(1, { timeout: 10000 });

        await page.fill('#centerLicenseNumber_update', '501');
        await page.fill('#centerName_update', 'Updated Name');
        await page.fill('#address_update', '456 New St');
        await page.fill('#animalCapacity_update', '100');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/update-adoption-center')),
            page.click('#adoption_center_update button[type="submit"]'),
        ]);

        await expect(page.locator('#adoption_update_status')).toContainText('successfully');
    });

    test('should redirect to login when submitting without auth', async ({ page }) => {
        await page.goto('/pages/admin.html');

        await page.fill('#centerLicenseNumber', '999');
        await page.fill('#centerName', 'Unauthed');
        await page.fill('#address', '000 Nowhere');
        await page.fill('#animalCapacity', '10');

        await Promise.all([
            page.waitForURL('**/login.html', { timeout: 10000 }),
            page.click('#new_adoption_center button[type="submit"]'),
        ]);
    });
});
