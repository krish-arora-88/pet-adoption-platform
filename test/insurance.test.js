const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Insurance Policy Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('insuser@test.com', 'user');
        adminToken = await registerAndGetToken('insadmin@test.com', 'admin');
    });

    const validPolicy = {
        InsurancePolicyNumber: 9001,
        PolicyLevel: 'Gold',
        CoverageAmount: 5000,
        InsuranceStartDate: '2024/01/01',
        InsuranceExpiration: '2025/01/01'
    };

    // ---- GET /insurance-policies ----
    describe('GET /insurance-policies', () => {
        it('should return empty array without auth', async () => {
            const res = await request(app).get('/insurance-policies');
            expect(res.status).to.equal(200);
            expect(res.body).to.be.an('array');
        });

        it('should return policies after insertion', async () => {
            await request(app).post('/insert-new-insurance-policy').set('Authorization', `Bearer ${userToken}`).send(validPolicy);
            const res = await request(app).get('/insurance-policies');
            expect(res.status).to.equal(200);
            expect(res.body).to.have.lengthOf(1);
            expect(res.body[0].InsurancePolicyNumber).to.equal(9001);
        });
    });

    // ---- POST /insert-new-insurance-policy ----
    describe('POST /insert-new-insurance-policy', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-insurance-policy').send(validPolicy);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing InsurancePolicyNumber', async () => {
            const res = await request(app).post('/insert-new-insurance-policy').set('Authorization', `Bearer ${userToken}`).send({ PolicyLevel: 'Gold' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should return 400 with missing CoverageAmount', async () => {
            const res = await request(app).post('/insert-new-insurance-policy').set('Authorization', `Bearer ${userToken}`).send({ InsurancePolicyNumber: 9001, PolicyLevel: 'Gold' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert policy with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-insurance-policy').set('Authorization', `Bearer ${userToken}`).send(validPolicy);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should coerce string InsurancePolicyNumber', async () => {
            const res = await request(app).post('/insert-new-insurance-policy').set('Authorization', `Bearer ${userToken}`).send({ ...validPolicy, InsurancePolicyNumber: '9002', CoverageAmount: '3000' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /initiateNewInsurancePolicy (admin-only) ----
    describe('POST /initiateNewInsurancePolicy', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewInsurancePolicy');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewInsurancePolicy').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewInsurancePolicy').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
