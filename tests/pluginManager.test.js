/**
 * Tests for Plugin Manager
 */

const PluginManager = require('../src/connectors/pluginManager');
const config = require('../src/config/config');

// Mock AWS SDK
jest.mock('@aws-sdk/client-qbusiness');

describe('PluginManager', () => {
    let pluginManager;
    
    beforeEach(() => {
        // Set up test configuration
        config.set('aws.region', 'us-east-1');
        config.set('aws.qBusinessApplicationId', 'test-app-id');
        config.set('aws.indexId', 'test-index-id');
        config.set('dataSource.batchSize', 10);
        config.set('plugin.maxRetries', 2);
        config.set('plugin.retryDelay', 100);
        
        pluginManager = new PluginManager(config);
    });
    
    describe('transformDocument', () => {
        test('should transform document to Amazon Q Business format', () => {
            const inputDoc = {
                id: 'test-123',
                title: 'Test Document',
                content: 'This is test content',
                url: 'https://example.com/doc/123',
                createdAt: '2024-01-01T00:00:00Z',
                author: 'Test Author'
            };
            
            const result = pluginManager.transformDocument(inputDoc);
            
            expect(result).toHaveProperty('id', 'test-123');
            expect(result).toHaveProperty('title', 'Test Document');
            expect(result).toHaveProperty('content');
            expect(result.content.blob).toBeInstanceOf(Buffer);
            expect(result).toHaveProperty('contentType', 'PLAIN_TEXT');
            expect(result.attributes).toHaveProperty('_source_uri', 'https://example.com/doc/123');
            expect(result.attributes).toHaveProperty('author', 'Test Author');
        });
        
        test('should generate ID when not provided', () => {
            const inputDoc = {
                title: 'Test Document',
                content: 'This is test content'
            };
            
            const result = pluginManager.transformDocument(inputDoc);
            
            expect(result.id).toBeDefined();
            expect(result.id).toMatch(/^test-plugin-\d+-[a-f0-9]{8}$/);
        });
    });
    
    describe('createBatches', () => {
        test('should create correct number of batches', () => {
            const documents = Array.from({ length: 25 }, (_, i) => ({ id: i }));
            const batches = pluginManager.createBatches(documents, 10);
            
            expect(batches).toHaveLength(3);
            expect(batches[0]).toHaveLength(10);
            expect(batches[1]).toHaveLength(10);
            expect(batches[2]).toHaveLength(5);
        });
    });
    
    describe('generateDocumentId', () => {
        test('should generate unique IDs', () => {
            const doc1 = { title: 'Doc 1', content: 'Content 1' };
            const doc2 = { title: 'Doc 2', content: 'Content 2' };
            
            const id1 = pluginManager.generateDocumentId(doc1);
            const id2 = pluginManager.generateDocumentId(doc2);
            
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^test-plugin-\d+-[a-f0-9]{8}$/);
            expect(id2).toMatch(/^test-plugin-\d+-[a-f0-9]{8}$/);
        });
    });
});
