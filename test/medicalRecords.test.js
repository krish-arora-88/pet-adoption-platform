const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Medical Record Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('meduser@test.com', 'user');
        adminToken = await registerAndGetToken('medadmin@test.com', 'admin');
    });

    const validRecord = {
        PetMicrochipID: 1001,
        RecordID: 1,
        InsurancePolicyNumber: 9001,
        VaccinationStatus: 'Up to date',
        HealthCondition: 'Healthy',
        VetNotes: 'Annual checkup complete'
    };

    // ---- GET /medical-records ----
    describe('GET /medical-records', () => {
        it('should return empty array without auth', async () => {
            const res = await request(app).get('/medical-records');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return records after insertion', async () => {
            await request(app).post('/insert-new-medical-record').set('Authorization', `Bearer ${userToken}`).send(validRecord);
            const res = await request(app).get('/medical-records');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].PETMICROCHIPID).to.equal(1001);
        });
    });

    // ---- POST /insert-new-medical-record ----
    describe('POST /insert-new-medical-record', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-medical-record').send(validRecord);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing PetMicrochipID', async () => {
            const res = await request(app).post('/insert-new-medical-record').set('Authorization', `Bearer ${userToken}`).send({ RecordID: 1 });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should return 400 with missing RecordID', async () => {
            const res = await request(app).post('/insert-new-medical-record').set('Authorization', `Bearer ${userToken}`).send({ PetMicrochipID: 1001 });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert record with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-medical-record').set('Authorization', `Bearer ${userToken}`).send(validRecord);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should coerce string PetMicrochipID and RecordID', async () => {
            const res = await request(app).post('/insert-new-medical-record').set('Authorization', `Bearer ${userToken}`).send({ ...validRecord, PetMicrochipID: '1002', RecordID: '2' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should accept record without optional fields', async () => {
            const res = await request(app).post('/insert-new-medical-record').set('Authorization', `Bearer ${userToken}`).send({ PetMicrochipID: 1003, RecordID: 3 });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewMedicalRecord (admin-only) ----
    describe('POST /initiateNewMedicalRecord', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewMedicalRecord');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewMedicalRecord').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewMedicalRecord').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
