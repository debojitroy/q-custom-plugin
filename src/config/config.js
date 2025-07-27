/**
 * Configuration management for Amazon Q Business Custom Plugin
 */

const logger = require('../utils/logger');

class Config {
    constructor() {
        this.config = {
            // AWS Configuration
            aws: {
                region: process.env.AWS_REGION || 'us-east-1',
                qBusinessApplicationId: process.env.Q_BUSINESS_APPLICATION_ID,
                dataSourceId: process.env.Q_BUSINESS_DATA_SOURCE_ID,
                indexId: process.env.Q_BUSINESS_INDEX_ID
            },
            
            // Data Source Configuration
            dataSource: {
                type: process.env.DATA_SOURCE_TYPE || 'api',
                baseUrl: process.env.DATA_SOURCE_BASE_URL,
                apiKey: process.env.DATA_SOURCE_API_KEY,
                username: process.env.DATA_SOURCE_USERNAME,
                password: process.env.DATA_SOURCE_PASSWORD,
                batchSize: parseInt(process.env.BATCH_SIZE) || 100,
                syncInterval: parseInt(process.env.SYNC_INTERVAL) || 3600000 // 1 hour in ms
            },
            
            // Plugin Configuration
            plugin: {
                name: process.env.PLUGIN_NAME || 'custom-plugin',
                version: process.env.PLUGIN_VERSION || '1.0.0',
                logLevel: process.env.LOG_LEVEL || 'info',
                maxRetries: parseInt(process.env.MAX_RETRIES) || 3,
                retryDelay: parseInt(process.env.RETRY_DELAY) || 1000
            }
        };
    }
    
    /**
     * Validate required configuration
     */
    validate() {
        const required = [
            'aws.qBusinessApplicationId',
            'aws.dataSourceId',
            'dataSource.baseUrl'
        ];
        
        const missing = [];
        
        for (const key of required) {
            const value = this.get(key);
            if (!value) {
                missing.push(key);
            }
        }
        
        if (missing.length > 0) {
            logger.error('Missing required configuration:', missing);
            return false;
        }
        
        return true;
    }
    
    /**
     * Get configuration value by dot notation path
     */
    get(path) {
        return path.split('.').reduce((obj, key) => obj?.[key], this.config);
    }
    
    /**
     * Set configuration value by dot notation path
     */
    set(path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((obj, key) => {
            if (!obj[key]) obj[key] = {};
            return obj[key];
        }, this.config);
        
        target[lastKey] = value;
    }
    
    /**
     * Get all configuration
     */
    getAll() {
        return { ...this.config };
    }
}

module.exports = new Config();
