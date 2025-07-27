/**
 * Plugin Manager for Amazon Q Business Custom Plugin
 * Handles data synchronization between external data source and Amazon Q Business
 */

const { QBusinessClient, BatchPutDocumentCommand } = require('@aws-sdk/client-qbusiness');
const logger = require('../utils/logger');
const DataSourceConnector = require('./dataSourceConnector');

class PluginManager {
    constructor(config) {
        this.config = config;
        this.qBusinessClient = new QBusinessClient({
            region: config.get('aws.region')
        });
        this.dataSourceConnector = new DataSourceConnector(config);
    }
    
    /**
     * Main synchronization method
     */
    async sync() {
        try {
            logger.info('Starting data synchronization...');
            
            // Fetch data from external source
            const documents = await this.fetchDocuments();
            
            if (documents.length === 0) {
                logger.info('No documents to sync');
                return;
            }
            
            logger.info(`Found ${documents.length} documents to sync`);
            
            // Process documents in batches
            await this.processBatches(documents);
            
            logger.info('Data synchronization completed successfully');
            
        } catch (error) {
            logger.error('Synchronization failed:', error);
            throw error;
        }
    }
    
    /**
     * Fetch documents from external data source
     */
    async fetchDocuments() {
        try {
            logger.info('Fetching documents from data source...');
            
            const documents = await this.dataSourceConnector.fetchAll();
            
            // Transform documents to Amazon Q Business format
            return documents.map(doc => this.transformDocument(doc));
            
        } catch (error) {
            logger.error('Failed to fetch documents:', error);
            throw error;
        }
    }
    
    /**
     * Transform document to Amazon Q Business format
     */
    transformDocument(document) {
        return {
            id: document.id || this.generateDocumentId(document),
            title: document.title || document.name || 'Untitled',
            content: {
                blob: Buffer.from(document.content || document.body || '', 'utf-8')
            },
            contentType: 'PLAIN_TEXT',
            attributes: {
                _source_uri: document.url || document.source || '',
                _created_at: document.createdAt || new Date().toISOString(),
                _updated_at: document.updatedAt || new Date().toISOString(),
                ...this.extractCustomAttributes(document)
            }
        };
    }
    
    /**
     * Extract custom attributes from document
     */
    extractCustomAttributes(document) {
        const customAttributes = {};
        
        // Add any custom fields from your data source
        if (document.author) customAttributes.author = document.author;
        if (document.category) customAttributes.category = document.category;
        if (document.tags) customAttributes.tags = document.tags;
        
        return customAttributes;
    }
    
    /**
     * Generate unique document ID
     */
    generateDocumentId(document) {
        const source = this.config.get('plugin.name');
        const timestamp = Date.now();
        const hash = require('crypto')
            .createHash('md5')
            .update(JSON.stringify(document))
            .digest('hex')
            .substring(0, 8);
        
        return `${source}-${timestamp}-${hash}`;
    }
    
    /**
     * Process documents in batches
     */
    async processBatches(documents) {
        const batchSize = this.config.get('dataSource.batchSize');
        const batches = this.createBatches(documents, batchSize);
        
        logger.info(`Processing ${batches.length} batches of ${batchSize} documents each`);
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            logger.info(`Processing batch ${i + 1}/${batches.length}`);
            
            try {
                await this.uploadBatch(batch);
                logger.info(`Batch ${i + 1} uploaded successfully`);
                
                // Add delay between batches to avoid rate limiting
                if (i < batches.length - 1) {
                    await this.delay(1000);
                }
                
            } catch (error) {
                logger.error(`Failed to upload batch ${i + 1}:`, error);
                
                // Implement retry logic
                await this.retryBatch(batch, i + 1);
            }
        }
    }
    
    /**
     * Create batches from documents array
     */
    createBatches(documents, batchSize) {
        const batches = [];
        for (let i = 0; i < documents.length; i += batchSize) {
            batches.push(documents.slice(i, i + batchSize));
        }
        return batches;
    }
    
    /**
     * Upload a batch of documents to Amazon Q Business
     */
    async uploadBatch(documents) {
        const command = new BatchPutDocumentCommand({
            applicationId: this.config.get('aws.qBusinessApplicationId'),
            indexId: this.config.get('aws.indexId'),
            documents: documents
        });
        
        const response = await this.qBusinessClient.send(command);
        
        if (response.failedDocuments && response.failedDocuments.length > 0) {
            logger.warn(`${response.failedDocuments.length} documents failed to upload:`, 
                response.failedDocuments);
        }
        
        return response;
    }
    
    /**
     * Retry failed batch with exponential backoff
     */
    async retryBatch(batch, batchNumber) {
        const maxRetries = this.config.get('plugin.maxRetries');
        const baseDelay = this.config.get('plugin.retryDelay');
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                logger.info(`Retrying batch ${batchNumber}, attempt ${attempt}/${maxRetries}`);
                
                await this.delay(baseDelay * Math.pow(2, attempt - 1));
                await this.uploadBatch(batch);
                
                logger.info(`Batch ${batchNumber} uploaded successfully on retry ${attempt}`);
                return;
                
            } catch (error) {
                logger.error(`Retry ${attempt} failed for batch ${batchNumber}:`, error);
                
                if (attempt === maxRetries) {
                    logger.error(`All retries exhausted for batch ${batchNumber}`);
                    throw error;
                }
            }
        }
    }
    
    /**
     * Utility method for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = PluginManager;
