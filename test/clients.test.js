const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Client Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('clientuser@test.com', 'user');
        adminToken = await registerAndGetToken('clientadmin@test.com', 'admin');
    });

    const validClient = {
        FirstName: 'John',
        LastName: 'Doe',
        ClientAddress: '123 Main St',
        ClientContact: '555-1234'
    };

    // ---- GET /client-table ----
    describe('GET /client-table', () => {
        it('should return empty data array without auth', async () => {
            const res = await request(app).get('/client-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });

        it('should return clients after insertion', async () => {
            await request(app).post('/insert-new-client').set('Authorization', `Bearer ${userToken}`).send(validClient);
            const res = await request(app).get('/client-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });
    });

    // ---- POST /insert-new-client ----
    describe('POST /insert-new-client', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-client').send(validClient);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing required fields', async () => {
            const res = await request(app).post('/insert-new-client').set('Authorization', `Bearer ${userToken}`).send({ LastName: 'Doe' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert a client and return clientID', async () => {
            const res = await request(app).post('/insert-new-client').set('Authorization', `Bearer ${userToken}`).send(validClient);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.clientID).to.be.a('number');
        });

        it('should auto-increment clientID for successive inserts', async () => {
            const res1 = await request(app).post('/insert-new-client').set('Authorization', `Bearer ${userToken}`).send(validClient);
            const res2 = await request(app).post('/insert-new-client').set('Authorization', `Bearer ${userToken}`).send({ ...validClient, FirstName: 'Jane' });
            expect(res2.body.clientID).to.be.greaterThan(res1.body.clientID);
        });
    });

    // ---- POST /update-client ----
    describe('POST /update-client', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/update-client').send({ clientId: 1, FirstName: 'Updated' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing clientId', async () => {
            const res = await request(app).post('/update-client').set('Authorization', `Bearer ${userToken}`).send({ FirstName: 'Updated' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should update an existing client', async () => {
            const insertRes = await request(app).post('/insert-new-client').set('Authorization', `Bearer ${userToken}`).send(validClient);
            const clientId = insertRes.body.clientID;
            const res = await request(app).post('/update-client').set('Authorization', `Bearer ${userToken}`).send({ clientId, FirstName: 'Updated', LastName: 'Name', ClientAddress: '456 Elm St' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewClient (admin-only) ----
    describe('POST /initiateNewClient', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewClient');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewClient').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewClient').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
