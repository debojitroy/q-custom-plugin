/**
 * Data Source Connector for Amazon Q Business Custom Plugin
 * Template for connecting to external data sources
 */

const axios = require('axios');
const logger = require('../utils/logger');

class DataSourceConnector {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.get('dataSource.baseUrl');
        this.apiKey = config.get('dataSource.apiKey');
        this.username = config.get('dataSource.username');
        this.password = config.get('dataSource.password');
        
        // Configure axios instance
        this.client = axios.create({
            baseURL: this.baseUrl,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': `q-custom-plugin/${config.get('plugin.version')}`
            }
        });
        
        // Add authentication interceptor
        this.setupAuthentication();
    }
    
    /**
     * Setup authentication for API requests
     */
    setupAuthentication() {
        if (this.apiKey) {
            // API Key authentication
            this.client.defaults.headers.common['Authorization'] = `Bearer ${this.apiKey}`;
        } else if (this.username && this.password) {
            // Basic authentication
            const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
            this.client.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
        }
        
        // Add request interceptor for logging
        this.client.interceptors.request.use(
            (config) => {
                logger.debug(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
                return config;
            },
            (error) => {
                logger.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );
        
        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => {
                logger.debug(`Response received: ${response.status} ${response.statusText}`);
                return response;
            },
            (error) => {
                logger.error('API request failed:', {
                    url: error.config?.url,
                    method: error.config?.method,
                    status: error.response?.status,
                    statusText: error.response?.statusText,
                    message: error.message
                });
                return Promise.reject(error);
            }
        );
    }
    
    /**
     * Fetch all documents from the data source
     */
    async fetchAll() {
        try {
            logger.info('Fetching all documents from data source...');
            
            const documents = [];
            let page = 1;
            let hasMore = true;
            
            while (hasMore) {
                logger.debug(`Fetching page ${page}...`);
                
                const pageData = await this.fetchPage(page);
                
                if (pageData.documents && pageData.documents.length > 0) {
                    documents.push(...pageData.documents);
                    page++;
                    hasMore = pageData.hasMore || false;
                } else {
                    hasMore = false;
                }
                
                // Add delay between requests to be respectful to the API
                await this.delay(100);
            }
            
            logger.info(`Fetched ${documents.length} documents from data source`);
            return documents;
            
        } catch (error) {
            logger.error('Failed to fetch documents from data source:', error);
            throw error;
        }
    }
    
    /**
     * Fetch a single page of documents
     * Override this method based on your data source API
     */
    async fetchPage(page) {
        try {
            // Example implementation - modify based on your API
            const response = await this.client.get('/documents', {
                params: {
                    page: page,
                    limit: this.config.get('dataSource.batchSize') || 100
                }
            });
            
            return {
                documents: response.data.documents || response.data.items || response.data,
                hasMore: response.data.hasMore || response.data.has_more || false,
                totalCount: response.data.totalCount || response.data.total || 0
            };
            
        } catch (error) {
            logger.error(`Failed to fetch page ${page}:`, error);
            throw error;
        }
    }
    
    /**
     * Fetch a single document by ID
     */
    async fetchById(id) {
        try {
            logger.debug(`Fetching document by ID: ${id}`);
            
            const response = await this.client.get(`/documents/${id}`);
            return response.data;
            
        } catch (error) {
            logger.error(`Failed to fetch document ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Test connection to the data source
     */
    async testConnection() {
        try {
            logger.info('Testing connection to data source...');
            
            // Example health check - modify based on your API
            const response = await this.client.get('/health');
            
            if (response.status === 200) {
                logger.info('Connection test successful');
                return true;
            } else {
                logger.warn(`Connection test returned status: ${response.status}`);
                return false;
            }
            
        } catch (error) {
            logger.error('Connection test failed:', error);
            return false;
        }
    }
    
    /**
     * Get incremental changes since last sync
     * Override this method if your data source supports incremental sync
     */
    async fetchIncremental(lastSyncTime) {
        try {
            logger.info(`Fetching incremental changes since: ${lastSyncTime}`);
            
            const response = await this.client.get('/documents/changes', {
                params: {
                    since: lastSyncTime,
                    limit: this.config.get('dataSource.batchSize') || 100
                }
            });
            
            return response.data.documents || response.data.items || response.data;
            
        } catch (error) {
            logger.error('Failed to fetch incremental changes:', error);
            throw error;
        }
    }
    
    /**
     * Utility method for delays
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = DataSourceConnector;
