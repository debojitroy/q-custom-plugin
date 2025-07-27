/**
 * Jest setup file for tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.AWS_REGION = 'us-east-1';
process.env.Q_BUSINESS_APPLICATION_ID = 'test-app-id';
process.env.Q_BUSINESS_INDEX_ID = 'test-index-id';
process.env.PLUGIN_NAME = 'test-plugin';

// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};
