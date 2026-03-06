const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: './specs',
    timeout: 30000,
    retries: 0,
    workers: 1,
    use: {
        baseURL: `http://localhost:${process.env.TEST_PORT || 50100}`,
        headless: true,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
    },
    globalSetup: require.resolve('./global-setup'),
    globalTeardown: require.resolve('./global-teardown'),
});
