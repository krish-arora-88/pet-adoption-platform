const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

module.exports = async function globalSetup() {
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    const testPort = process.env.TEST_PORT || 50100;

    // Set env vars BEFORE requiring the app — dotenv won't override existing vars
    process.env.MONGODB_URI = mongoUri;
    process.env.JWT_SECRET = 'e2e-test-secret-key';
    process.env.PORT = String(testPort);

    await mongoose.connect(mongoUri);

    // server.js exports app without calling listen() (require.main guard)
    const app = require('../server');

    const server = await new Promise((resolve) => {
        const s = app.listen(testPort, () => {
            console.log(`E2E test server running on port ${testPort}`);
            resolve(s);
        });
    });

    // Stash for teardown
    globalThis.__MONGO_SERVER__ = mongoServer;
    globalThis.__HTTP_SERVER__ = server;
    globalThis.__MONGOOSE__ = mongoose;
};
