#!/usr/bin/env node

/**
 * Amazon Q Business Custom Plugin
 * Main entry point for the custom connector
 */

require('dotenv').config();
const logger = require('./utils/logger');
const config = require('./config/config');
const PluginManager = require('./connectors/pluginManager');

async function main() {
    try {
        logger.info('Starting Amazon Q Business Custom Plugin...');
        
        // Validate configuration
        if (!config.validate()) {
            logger.error('Configuration validation failed');
            process.exit(1);
        }
        
        // Initialize plugin manager
        const pluginManager = new PluginManager(config);
        
        // Start the synchronization process
        await pluginManager.sync();
        
        logger.info('Plugin execution completed successfully');
        
    } catch (error) {
        logger.error('Plugin execution failed:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('Received SIGINT, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});

// Run the main function
if (require.main === module) {
    main();
}

module.exports = { main };
