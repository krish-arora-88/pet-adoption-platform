const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Adoption Center Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('centeruser@test.com', 'user');
        adminToken = await registerAndGetToken('centeradmin@test.com', 'admin');
    });

    const validCenter = {
        CenterLicenseNumber: 7001,
        CenterName: 'Sunshine Shelter',
        Address: '100 Shelter Rd',
        AnimalCapacity: 50
    };

    // ---- GET /adoption-center-table ----
    describe('GET /adoption-center-table', () => {
        it('should return empty data array without auth', async () => {
            const res = await request(app).get('/adoption-center-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });

        it('should return centers after insertion', async () => {
            await request(app).post('/insert-new-adoption-center').set('Authorization', `Bearer ${userToken}`).send(validCenter);
            const res = await request(app).get('/adoption-center-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });
    });

    // ---- POST /insert-new-adoption-center ----
    describe('POST /insert-new-adoption-center', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-adoption-center').send(validCenter);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing CenterLicenseNumber', async () => {
            const res = await request(app).post('/insert-new-adoption-center').set('Authorization', `Bearer ${userToken}`).send({ CenterName: 'Bad Center' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert a center with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-adoption-center').set('Authorization', `Bearer ${userToken}`).send(validCenter);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should coerce string CenterLicenseNumber to number', async () => {
            const res = await request(app).post('/insert-new-adoption-center').set('Authorization', `Bearer ${userToken}`).send({ ...validCenter, CenterLicenseNumber: '7002' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /update-adoption-center ----
    describe('POST /update-adoption-center', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/update-adoption-center').send({ CenterLicenseNumber: 7001, CenterName: 'Updated' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without CenterLicenseNumber', async () => {
            const res = await request(app).post('/update-adoption-center').set('Authorization', `Bearer ${userToken}`).send({ CenterName: 'Updated' });
            expect(res.status).to.equal(400);
        });

        it('should update an existing center', async () => {
            await request(app).post('/insert-new-adoption-center').set('Authorization', `Bearer ${userToken}`).send(validCenter);
            const res = await request(app).post('/update-adoption-center').set('Authorization', `Bearer ${userToken}`).send({ CenterLicenseNumber: 7001, CenterName: 'Updated Shelter', Address: '200 New Rd', AnimalCapacity: 75 });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewAdoptionCenter (admin-only) ----
    describe('POST /initiateNewAdoptionCenter', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewAdoptionCenter');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewAdoptionCenter').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewAdoptionCenter').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
