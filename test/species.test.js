const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Species Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('specuser@test.com', 'user');
        adminToken = await registerAndGetToken('specadmin@test.com', 'admin');
    });

    const validSpecies = {
        speciesName: 'Dog',
        housingSpace: 'Large yard',
        groomingRoutine: 'Weekly brushing',
        dietType: 'Omnivore'
    };

    // ---- GET /species-list ----
    describe('GET /species-list', () => {
        it('should return empty array without auth', async () => {
            const res = await request(app).get('/species-list');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return species after insertion', async () => {
            await request(app).post('/insert-new-species').set('Authorization', `Bearer ${userToken}`).send(validSpecies);
            const res = await request(app).get('/species-list');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].SpeciesName).to.equal('Dog');
        });
    });

    // ---- POST /insert-new-species ----
    describe('POST /insert-new-species', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-species').send(validSpecies);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing speciesName', async () => {
            const res = await request(app).post('/insert-new-species').set('Authorization', `Bearer ${userToken}`).send({ housingSpace: 'Small cage' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert species with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-species').set('Authorization', `Bearer ${userToken}`).send(validSpecies);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /update-species ----
    describe('POST /update-species', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/update-species').send({ speciesName: 'Dog', dietType: 'Carnivore' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without speciesName', async () => {
            const res = await request(app).post('/update-species').set('Authorization', `Bearer ${userToken}`).send({ dietType: 'Carnivore' });
            expect(res.status).to.equal(400);
        });

        it('should update an existing species', async () => {
            await request(app).post('/insert-new-species').set('Authorization', `Bearer ${userToken}`).send(validSpecies);
            const res = await request(app).post('/update-species').set('Authorization', `Bearer ${userToken}`).send({ speciesName: 'Dog', housingSpace: 'Medium yard', groomingRoutine: 'Daily brushing', dietType: 'Carnivore' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /delete-species ----
    describe('POST /delete-species', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/delete-species').send({ speciesName: 'Dog' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without speciesName', async () => {
            const res = await request(app).post('/delete-species').set('Authorization', `Bearer ${userToken}`).send({});
            expect(res.status).to.equal(400);
        });

        it('should delete an existing species', async () => {
            await request(app).post('/insert-new-species').set('Authorization', `Bearer ${userToken}`).send(validSpecies);
            const res = await request(app).post('/delete-species').set('Authorization', `Bearer ${userToken}`).send({ speciesName: 'Dog' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewSpecies (admin-only) ----
    describe('POST /initiateNewSpecies', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewSpecies');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewSpecies').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewSpecies').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /clearSpeciesTable (admin-only) ----
    describe('POST /clearSpeciesTable', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/clearSpeciesTable');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/clearSpeciesTable').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            await request(app).post('/insert-new-species').set('Authorization', `Bearer ${userToken}`).send(validSpecies);
            const res = await request(app).post('/clearSpeciesTable').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
