const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Adoption Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('adoptuser@test.com', 'user');
        adminToken = await registerAndGetToken('adoptadmin@test.com', 'admin');
    });

    const validAdoption = {
        PetMicrochipID: 3001,
        AdoptionDate: '2024-06-15',
        ClientID: 1,
        CenterLicenseNumber: 7001
    };

    // ---- GET /adoption-table ----
    describe('GET /adoption-table', () => {
        it('should return empty data array without auth', async () => {
            const res = await request(app).get('/adoption-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });

        it('should return adoptions after insertion', async () => {
            await request(app).post('/insert-new-adoption').set('Authorization', `Bearer ${userToken}`).send(validAdoption);
            const res = await request(app).get('/adoption-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });
    });

    // ---- GET /query-species ----
    describe('GET /query-species', () => {
        it('should return species data without auth', async () => {
            const res = await request(app).get('/query-species');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });

        it('should accept minCount query param', async () => {
            const res = await request(app).get('/query-species?minCount=1');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });
    });

    // ---- POST /insert-new-adoption ----
    describe('POST /insert-new-adoption', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-adoption').send(validAdoption);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing PetMicrochipID', async () => {
            const res = await request(app).post('/insert-new-adoption').set('Authorization', `Bearer ${userToken}`).send({ AdoptionDate: '2024-06-15' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert adoption with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-adoption').set('Authorization', `Bearer ${userToken}`).send(validAdoption);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should coerce string PetMicrochipID', async () => {
            const res = await request(app).post('/insert-new-adoption').set('Authorization', `Bearer ${userToken}`).send({ ...validAdoption, PetMicrochipID: '3002' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /update-adoption ----
    describe('POST /update-adoption', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/update-adoption').send({ PetMicrochipID: 3001, AdoptionDate: '2024-07-01' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without PetMicrochipID', async () => {
            const res = await request(app).post('/update-adoption').set('Authorization', `Bearer ${userToken}`).send({ AdoptionDate: '2024-07-01' });
            expect(res.status).to.equal(400);
        });

        it('should update an existing adoption', async () => {
            await request(app).post('/insert-new-adoption').set('Authorization', `Bearer ${userToken}`).send(validAdoption);
            const res = await request(app).post('/update-adoption').set('Authorization', `Bearer ${userToken}`).send({ PetMicrochipID: 3001, AdoptionDate: '2024-07-01', ClientID: 2, CenterLicenseNumber: 7002 });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewAdoption (admin-only) ----
    describe('POST /initiateNewAdoption', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewAdoption');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewAdoption').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewAdoption').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
