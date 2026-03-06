const playwright = require('@playwright/test');
const base = playwright.test;
const expect = playwright.expect;

const BASE = `http://localhost:${process.env.TEST_PORT || 50100}`;

async function registerViaAPI(email, password, role = 'user') {
    const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
    });
    const data = await res.json();
    if (data.success) return data.token;

    // Already registered — login instead
    const loginRes = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();
    return loginData.token;
}

function authHeaders(token) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
    };
}

const test = base.extend({
    // Browser page with regular user JWT in localStorage
    authedPage: async ({ browser }, use) => {
        const token = await registerViaAPI('e2e-user@test.com', 'password123', 'user');
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`${BASE}/pages/login.html`);
        await page.evaluate((t) => localStorage.setItem('token', t), token);
        await use(page);
        await context.close();
    },

    // Browser page with admin JWT in localStorage
    adminPage: async ({ browser }, use) => {
        const token = await registerViaAPI('e2e-admin@test.com', 'password123', 'admin');
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto(`${BASE}/pages/login.html`);
        await page.evaluate((t) => localStorage.setItem('token', t), token);
        await use(page);
        await context.close();
    },

    // API helpers for seeding and clearing data
    apiHelpers: async ({}, use) => {
        const adminToken = await registerViaAPI('e2e-seed-admin@test.com', 'password123', 'admin');
        const userToken = await registerViaAPI('e2e-seed-user@test.com', 'password123', 'user');

        const helpers = {
            adminToken,
            userToken,

            async post(url, body, token = userToken) {
                const res = await fetch(`${BASE}${url}`, {
                    method: 'POST',
                    headers: authHeaders(token),
                    body: JSON.stringify(body),
                });
                return res.json();
            },

            async get(url) {
                const res = await fetch(`${BASE}${url}`);
                return res.json();
            },

            async seedSpecies(name, housing = '100', grooming = 'Weekly', diet = 'Mixed') {
                return helpers.post('/insert-new-species', {
                    speciesName: name,
                    housingSpace: housing,
                    groomingRoutine: grooming,
                    dietType: diet,
                });
            },

            async seedPet(id, name, age, breed, gender, speciesName) {
                return helpers.post('/insert-new-pet', {
                    MicrochipID: id,
                    Name: name,
                    Age: age,
                    Breed: breed,
                    Gender: gender,
                    SpeciesName: speciesName,
                });
            },

            async seedClient(first, last, address, contact) {
                return helpers.post('/insert-new-client', {
                    FirstName: first,
                    LastName: last,
                    ClientAddress: address,
                    ClientContact: contact,
                });
            },

            async seedAdoptionCenter(license, name, address, capacity) {
                return helpers.post('/insert-new-adoption-center', {
                    CenterLicenseNumber: license,
                    CenterName: name,
                    Address: address,
                    AnimalCapacity: capacity,
                });
            },

            async seedAdoption(petId, date, clientId, centerLicense) {
                return helpers.post('/insert-new-adoption', {
                    PetMicrochipID: petId,
                    AdoptionDate: date,
                    ClientID: clientId,
                    CenterLicenseNumber: centerLicense,
                });
            },

            async clearAll() {
                const endpoints = [
                    '/initiateNewPet',
                    '/initiateNewClient',
                    '/initiateNewAdoptionCenter',
                    '/initiateNewAdoption',
                    '/initiateNewVet',
                    '/initiateNewSpecies',
                    '/initiateNewInsurancePolicy',
                    '/initiateNewMedicalRecord',
                ];
                for (const ep of endpoints) {
                    await fetch(`${BASE}${ep}`, {
                        method: 'POST',
                        headers: authHeaders(adminToken),
                    });
                }
            },
        };

        await use(helpers);
    },
});

module.exports = { test, expect };
