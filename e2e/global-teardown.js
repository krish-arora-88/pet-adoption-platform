module.exports = async function globalTeardown() {
    if (globalThis.__HTTP_SERVER__) {
        await new Promise((resolve) => globalThis.__HTTP_SERVER__.close(resolve));
    }
    if (globalThis.__MONGOOSE__) {
        await globalThis.__MONGOOSE__.connection.dropDatabase();
        await globalThis.__MONGOOSE__.connection.close();
    }
    if (globalThis.__MONGO_SERVER__) {
        await globalThis.__MONGO_SERVER__.stop();
    }
};
