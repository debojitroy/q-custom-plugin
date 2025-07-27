# Amazon Q Business Custom Plugin

A Node.js-based custom plugin for Amazon Q Business that enables seamless integration with external data sources for intelligent search and retrieval.

## Overview

This plugin provides a robust, modular architecture for connecting Amazon Q Business to external APIs and data sources. It handles authentication, data extraction, transformation, and synchronization with built-in error handling and retry logic.

## 🚀 Features

- **AWS SDK Integration**: Native integration with Amazon Q Business using AWS SDK v3
- **Modular Architecture**: Clean separation of concerns with dedicated modules for connectors, configuration, and utilities
- **Batch Processing**: Efficient document upload with configurable batch sizes
- **Error Handling**: Comprehensive error handling with exponential backoff retry logic
- **Logging**: Structured logging with Winston for debugging and monitoring
- **Testing**: Complete test suite with Jest and code coverage reporting
- **Code Quality**: ESLint configuration for consistent code style
- **Environment Configuration**: Flexible configuration management with environment variables

## 📁 Project Structure

```
q-custom-plugin/
├── src/
│   ├── config/
│   │   └── config.js              # Configuration management
│   ├── connectors/
│   │   ├── pluginManager.js       # Main synchronization logic
│   │   └── dataSourceConnector.js # External API connector template
│   ├── utils/
│   │   └── logger.js              # Winston logging configuration
│   └── index.js                   # Main entry point
├── tests/
│   ├── pluginManager.test.js      # Unit tests
│   └── setup.js                   # Test configuration
├── coverage/                      # Test coverage reports
├── logs/                          # Application logs
├── package.json                   # Dependencies and scripts
├── .env.example                   # Environment variables template
├── .eslintrc.js                   # ESLint configuration
├── jest.config.js                 # Jest test configuration
└── README.md                      # This file
```

## 🛠️ Prerequisites

- **Node.js**: Version 16.0.0 or higher
- **AWS Account**: With Amazon Q Business access
- **AWS CLI**: Configured with appropriate credentials
- **Data Source**: API credentials for your external data source

## 📦 Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:debojitroy/q-custom-plugin.git
   cd q-custom-plugin
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

## ⚙️ Configuration

Update the `.env` file with your specific configuration:

```env
# AWS Configuration
AWS_REGION=us-east-1
Q_BUSINESS_APPLICATION_ID=your-application-id
Q_BUSINESS_DATA_SOURCE_ID=your-data-source-id
Q_BUSINESS_INDEX_ID=your-index-id

# Data Source Configuration
DATA_SOURCE_TYPE=api
DATA_SOURCE_BASE_URL=https://api.example.com
DATA_SOURCE_API_KEY=your-api-key

# Plugin Configuration
PLUGIN_NAME=custom-plugin
LOG_LEVEL=info
BATCH_SIZE=100
MAX_RETRIES=3
```

## 🚀 Usage

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Run Tests
```bash
npm test
```

### Code Quality Check
```bash
npm run lint
```

## 🔧 Customization

### Adding a New Data Source

1. **Modify the DataSourceConnector** (`src/connectors/dataSourceConnector.js`):
   - Update authentication methods
   - Implement data fetching logic
   - Add data transformation rules

2. **Update Configuration** (`.env`):
   - Add data source specific environment variables
   - Configure authentication parameters

3. **Add Tests**:
   - Create test files in the `tests/` directory
   - Test your connector logic

### Example: Custom API Integration

```javascript
// In src/connectors/dataSourceConnector.js
async fetchPage(page) {
    const response = await this.client.get('/your-api-endpoint', {
        params: {
            page: page,
            limit: this.config.get('dataSource.batchSize'),
            // Add your specific parameters
        }
    });
    
    return {
        documents: response.data.items,
        hasMore: response.data.hasNextPage,
        totalCount: response.data.total
    };
}
```

## 📊 Monitoring and Logging

The plugin includes comprehensive logging:

- **Console Logs**: Development-friendly colored output
- **File Logs**: Structured JSON logs in the `logs/` directory
- **Error Tracking**: Separate error log file for debugging
- **Log Rotation**: Automatic log file rotation (5MB max, 5 files)

## 🧪 Testing

The project includes a comprehensive test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

Current test coverage: ~31% (expandable as you add more tests)

## 🔄 Development Workflow

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and test:**
   ```bash
   npm test
   npm run lint
   ```

3. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature-name
   ```

4. **Create a pull request** on GitHub

## 🚨 Troubleshooting

### Common Issues

1. **AWS Credentials**: Ensure your AWS credentials are properly configured
2. **Permissions**: Verify IAM permissions for Amazon Q Business operations
3. **API Limits**: Check if your data source has rate limiting
4. **Network**: Ensure connectivity to both AWS and your data source

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
```

## 📚 API Reference

### PluginManager

Main class for handling synchronization:

- `sync()`: Start the synchronization process
- `transformDocument(doc)`: Transform external document to Q Business format
- `processBatches(documents)`: Handle batch processing with retry logic

### DataSourceConnector

Template for external data source integration:

- `fetchAll()`: Retrieve all documents from data source
- `fetchPage(page)`: Fetch a single page of documents
- `testConnection()`: Verify connectivity to data source

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass (`npm test`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [Issues](https://github.com/debojitroy/q-custom-plugin/issues) page
2. Create a new issue with detailed information
3. Review the troubleshooting section above

## 🔗 Related Resources

- [Amazon Q Business Documentation](https://docs.aws.amazon.com/amazonq/latest/business-use-dg/)
- [AWS SDK for JavaScript v3](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
