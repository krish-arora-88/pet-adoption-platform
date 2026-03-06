const { test, expect } = require('../fixtures');

test.describe('Adoptions Tab', () => {
    test.beforeEach(async ({ apiHelpers }) => {
        await apiHelpers.clearAll();
        await apiHelpers.seedSpecies('Dog');
        await apiHelpers.seedPet(6001, 'Adopted1', 3, 'Lab', 'M', 'Dog');
        await apiHelpers.seedPet(6002, 'Adopted2', 5, 'Pug', 'F', 'Dog');
        await apiHelpers.seedAdoptionCenter(200, 'Test Center', '789 Elm St', 30);
        const client = await apiHelpers.seedClient('John', 'Smith', '111 Pine St', '5559999');
        await apiHelpers.seedAdoption(6001, '20240315', client.clientID, 200);
    });

    test('should display adoption table on page load', async ({ page }) => {
        await page.goto('/pages/adoptions.html');

        const rows = page.locator('#adoption_table tbody tr');
        await expect(rows).toHaveCount(1, { timeout: 10000 });
    });

    test('should register a new adoption', async ({ authedPage: page, apiHelpers }) => {
        const client = await apiHelpers.seedClient('New', 'Adopter', '222 Oak St', '5558888');

        await page.goto('/pages/adoptions.html');
        await expect(page.locator('#adoption_table tbody tr')).toHaveCount(1, { timeout: 10000 });

        await page.fill('#petMicrochipID', '6002');
        await page.fill('#adoptionDate', '20240401');
        await page.fill('#clientID', String(client.clientID));
        await page.fill('#centerLicenseNumber', '200');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/insert-new-adoption')),
            page.click('#new_adoption button[type="submit"]'),
        ]);

        await expect(page.locator('#new_adoption_message')).toContainText('successfully');
    });
});

test.describe('Client Accounts Tab', () => {
    test.beforeEach(async ({ apiHelpers }) => {
        await apiHelpers.clearAll();
    });

    test('should create a new client and show clientID', async ({ authedPage: page }) => {
        await page.goto('/pages/adoptions.html');
        await page.click('.tab-btn[data-tab="tab-clients"]');

        await page.fill('#ClientFirstName', 'Jane');
        await page.fill('#ClientLastName', 'Doe');
        await page.fill('#ClientAddress', '123 Main St');
        await page.fill('#ClientContact', '5551234');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/insert-new-client')),
            page.click('#sign_up button[type="submit"]'),
        ]);

        await expect(page.locator('#sign_up_status')).toContainText('Account added', { timeout: 5000 });
        await expect(page.locator('#sign_up_status')).toContainText('ClientID');
    });

    test('should display client table', async ({ authedPage: page, apiHelpers }) => {
        await apiHelpers.seedClient('Existing', 'Client', '456 Elm St', '5554444');

        await page.goto('/pages/adoptions.html');
        await page.click('.tab-btn[data-tab="tab-clients"]');

        const rows = page.locator('#client_table tbody tr');
        await expect(rows).toHaveCount(1, { timeout: 10000 });
    });

    test('should update an existing client', async ({ authedPage: page, apiHelpers }) => {
        const result = await apiHelpers.seedClient('Old', 'Name', '789 Pine St', '5553333');

        await page.goto('/pages/adoptions.html');
        await page.click('.tab-btn[data-tab="tab-clients"]');
        await expect(page.locator('#client_table tbody tr')).toHaveCount(1, { timeout: 10000 });

        await page.fill('#ClientNumber', String(result.clientID));
        await page.fill('#ClientFirstName_update', 'Updated');
        await page.fill('#ClientLastName_update', 'Name');
        await page.fill('#ClientAddress_update', '789 Pine St');
        await page.fill('#ClientContact_update', '5553333');

        await Promise.all([
            page.waitForResponse((r) => r.url().includes('/update-client')),
            page.click('#client_update button[type="submit"]'),
        ]);

        await expect(page.locator('#update_status')).toContainText('updated successfully');
    });
});
