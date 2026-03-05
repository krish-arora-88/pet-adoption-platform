const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Pet Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('petuser@test.com', 'user');
        adminToken = await registerAndGetToken('petadmin@test.com', 'admin');
    });

    const validPet = {
        MicrochipID: 1001,
        Name: 'Buddy',
        Age: 3,
        Breed: 'Labrador',
        Gender: 'Male',
        SpeciesName: 'Dog'
    };

    // ---- GET /pet-table ----
    describe('GET /pet-table', () => {
        it('should return empty data array without auth', async () => {
            const res = await request(app).get('/pet-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });

        it('should return pets after insertion', async () => {
            await request(app).post('/insert-new-pet').set('Authorization', `Bearer ${userToken}`).send(validPet);
            const res = await request(app).get('/pet-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });

        it('should filter by species query param', async () => {
            await request(app).post('/insert-new-pet').set('Authorization', `Bearer ${userToken}`).send(validPet);
            await request(app).post('/insert-new-pet').set('Authorization', `Bearer ${userToken}`).send({ ...validPet, MicrochipID: 1002, SpeciesName: 'Cat', Breed: 'Siamese' });
            const res = await request(app).get('/pet-table?species=Dog');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });
    });

    // ---- GET /get-pet-stats ----
    describe('GET /get-pet-stats', () => {
        it('should return pet stats without auth', async () => {
            const res = await request(app).get('/get-pet-stats');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });
    });

    // ---- GET /species-age-stats ----
    describe('GET /species-age-stats', () => {
        it('should return species age stats without auth', async () => {
            const res = await request(app).get('/species-age-stats');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });
    });

    // ---- POST /insert-new-pet ----
    describe('POST /insert-new-pet', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-pet').send(validPet);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing required fields', async () => {
            const res = await request(app).post('/insert-new-pet').set('Authorization', `Bearer ${userToken}`).send({ Name: 'Buddy' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert a pet with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-pet').set('Authorization', `Bearer ${userToken}`).send(validPet);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should accept string MicrochipID via coercion', async () => {
            const res = await request(app).post('/insert-new-pet').set('Authorization', `Bearer ${userToken}`).send({ ...validPet, MicrochipID: '2002' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewPet (admin-only) ----
    describe('POST /initiateNewPet', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewPet');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewPet').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewPet').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
