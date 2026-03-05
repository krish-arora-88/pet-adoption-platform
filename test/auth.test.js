const request = require('supertest');
const app = require('../server');

let expect;
before(async () => {
    const chai = await import('chai');
    expect = chai.expect;
});

describe('Auth Endpoints', () => {
    // ---- helpers ----
    const validUser = { email: 'auth@test.com', password: 'password123' };
    const adminUser = { email: 'admin@test.com', password: 'password123', role: 'admin' };

    async function registerUser(data) {
        return request(app).post('/auth/register').send(data);
    }

    // ---- POST /auth/register ----
    describe('POST /auth/register', () => {
        it('should register a new user and return token', async () => {
            const res = await registerUser(validUser);
            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.token).to.be.a('string');
            expect(res.body.user.email).to.equal(validUser.email);
            expect(res.body.user.role).to.equal('user');
        });

        it('should register an admin user when role=admin', async () => {
            const res = await registerUser(adminUser);
            expect(res.status).to.equal(201);
            expect(res.body.user.role).to.equal('admin');
        });

        it('should return 409 for duplicate email', async () => {
            await registerUser(validUser);
            const res = await registerUser(validUser);
            expect(res.status).to.equal(409);
            expect(res.body.success).to.be.false;
        });

        it('should return 400 for missing email', async () => {
            const res = await registerUser({ password: 'password123' });
            expect(res.status).to.equal(400);
            expect(res.body.success).to.be.false;
            expect(res.body.errors).to.be.an('array');
        });

        it('should return 400 for invalid email format', async () => {
            const res = await registerUser({ email: 'notanemail', password: 'password123' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });

        it('should return 400 for short password', async () => {
            const res = await registerUser({ email: 'short@test.com', password: '12' });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });
    });

    // ---- POST /auth/login ----
    describe('POST /auth/login', () => {
        beforeEach(async () => {
            await registerUser(validUser);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app).post('/auth/login').send(validUser);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.token).to.be.a('string');
        });

        it('should return 401 for wrong password', async () => {
            const res = await request(app).post('/auth/login').send({ email: validUser.email, password: 'wrongpass' });
            expect(res.status).to.equal(401);
            expect(res.body.success).to.be.false;
        });

        it('should return 401 for non-existent user', async () => {
            const res = await request(app).post('/auth/login').send({ email: 'noone@test.com', password: 'password123' });
            expect(res.status).to.equal(401);
        });

        it('should return 400 for missing password', async () => {
            const res = await request(app).post('/auth/login').send({ email: validUser.email });
            expect(res.status).to.equal(400);
            expect(res.body.errors).to.be.an('array');
        });
    });

    // ---- GET /auth/me ----
    describe('GET /auth/me', () => {
        it('should return current user when authenticated', async () => {
            const reg = await registerUser(validUser);
            const token = reg.body.token;
            const res = await request(app).get('/auth/me').set('Authorization', `Bearer ${token}`);
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.user.email).to.equal(validUser.email);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/auth/me');
            expect(res.status).to.equal(401);
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app).get('/auth/me').set('Authorization', 'Bearer invalid.token.here');
            expect(res.status).to.equal(401);
        });
    });
});
