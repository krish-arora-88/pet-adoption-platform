const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Veterinarian Endpoints', () => {
    let userToken, adminToken;

    async function registerAndGetToken(email, role) {
        const res = await request(app).post('/auth/register').send({ email, password: 'password123', role });
        return res.body.token;
    }

    beforeEach(async () => {
        userToken = await registerAndGetToken('vetuser@test.com', 'user');
        adminToken = await registerAndGetToken('vetadmin@test.com', 'admin');
    });

    const validVet = {
        VetLicenseNumber: 5001,
        Name: 'Dr. Smith',
        ClinicName: 'Happy Paws Clinic',
        ContactNumber: '555-9999',
        EmailAddress: 'drsmith@clinic.com'
    };

    // ---- GET /vet-table ----
    describe('GET /vet-table', () => {
        it('should return empty data array without auth', async () => {
            const res = await request(app).get('/vet-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });

        it('should return vets after insertion', async () => {
            await request(app).post('/insert-new-vet').set('Authorization', `Bearer ${userToken}`).send(validVet);
            const res = await request(app).get('/vet-table');
            expect(res.status).to.equal(200);
            expect(res.body.data).to.have.lengthOf(1);
        });
    });

    // ---- POST /insert-new-vet ----
    describe('POST /insert-new-vet', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/insert-new-vet').send(validVet);
            expect(res.status).to.equal(401);
        });

        it('should return 400 with missing required fields', async () => {
            const res = await request(app).post('/insert-new-vet').set('Authorization', `Bearer ${userToken}`).send({ ClinicName: 'Some Clinic' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should insert a vet with valid body and auth', async () => {
            const res = await request(app).post('/insert-new-vet').set('Authorization', `Bearer ${userToken}`).send(validVet);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });

        it('should accept empty string for EmailAddress', async () => {
            const res = await request(app).post('/insert-new-vet').set('Authorization', `Bearer ${userToken}`).send({ ...validVet, EmailAddress: '' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /update-vet ----
    describe('POST /update-vet', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/update-vet').send({ VetLicenseNumber: 5001, Name: 'Dr. Jones' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without VetLicenseNumber', async () => {
            const res = await request(app).post('/update-vet').set('Authorization', `Bearer ${userToken}`).send({ Name: 'Dr. Jones' });
            expect(res.status).to.equal(400);
        });

        it('should update an existing vet', async () => {
            await request(app).post('/insert-new-vet').set('Authorization', `Bearer ${userToken}`).send(validVet);
            const res = await request(app).post('/update-vet').set('Authorization', `Bearer ${userToken}`).send({ VetLicenseNumber: 5001, Name: 'Dr. Jones', ClinicName: 'New Clinic', ContactNumber: '555-0000', EmailAddress: 'jones@vet.com' });
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });

    // ---- POST /view-pet-medical ----
    describe('POST /view-pet-medical', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/view-pet-medical').send({ PetMicrochipID: 1001 });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without PetMicrochipID', async () => {
            const res = await request(app).post('/view-pet-medical').set('Authorization', `Bearer ${userToken}`).send({});
            expect(res.status).to.equal(400);
        });

        it('should return data for valid PetMicrochipID', async () => {
            const res = await request(app).post('/view-pet-medical').set('Authorization', `Bearer ${userToken}`).send({ PetMicrochipID: 9999 });
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });
    });

    // ---- POST /vet-table-project ----
    describe('POST /vet-table-project', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/vet-table-project').send({ selectors: 'Name,ClinicName' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 without selectors', async () => {
            const res = await request(app).post('/vet-table-project').set('Authorization', `Bearer ${userToken}`).send({});
            expect(res.status).to.equal(400);
        });

        it('should return projected data', async () => {
            await request(app).post('/insert-new-vet').set('Authorization', `Bearer ${userToken}`).send(validVet);
            const res = await request(app).post('/vet-table-project').set('Authorization', `Bearer ${userToken}`).send({ selectors: 'Name,ClinicName' });
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array');
        });
    });

    // ---- POST /initiateNewVet (admin-only) ----
    describe('POST /initiateNewVet', () => {
        it('should return 401 without auth', async () => {
            const res = await request(app).post('/initiateNewVet');
            expect(res.status).to.equal(401);
        });

        it('should return 403 for regular user', async () => {
            const res = await request(app).post('/initiateNewVet').set('Authorization', `Bearer ${userToken}`);
            expect(res.status).to.equal(403);
        });

        it('should succeed for admin', async () => {
            const res = await request(app).post('/initiateNewVet').set('Authorization', `Bearer ${adminToken}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });
    });
});
