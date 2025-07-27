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
- **IAM Permissions**: Proper IAM roles and policies (see setup below)
- **Data Source**: API credentials for your external data source

## 🔐 IAM Setup and Permissions

### Required AWS Services Access

This plugin requires access to the following AWS services:
- **Amazon Q Business**: For document indexing and search
- **Amazon S3**: For temporary document storage (if needed)
- **AWS CloudWatch**: For logging and monitoring
- **AWS STS**: For role assumption (if using cross-account access)

### 1. Create IAM Policy for Amazon Q Business

Create a custom IAM policy with the following permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "QBusinessDataSourceAccess",
            "Effect": "Allow",
            "Action": [
                "qbusiness:BatchPutDocument",
                "qbusiness:BatchDeleteDocument",
                "qbusiness:GetDataSource",
                "qbusiness:UpdateDataSource",
                "qbusiness:StartDataSourceSyncJob",
                "qbusiness:StopDataSourceSyncJob",
                "qbusiness:GetDataSourceSyncJob",
                "qbusiness:ListDataSourceSyncJobs"
            ],
            "Resource": [
                "arn:aws:qbusiness:*:*:application/*/index/*/data-source/*"
            ]
        },
        {
            "Sid": "QBusinessApplicationAccess",
            "Effect": "Allow",
            "Action": [
                "qbusiness:GetApplication",
                "qbusiness:GetIndex",
                "qbusiness:ListIndices"
            ],
            "Resource": [
                "arn:aws:qbusiness:*:*:application/*",
                "arn:aws:qbusiness:*:*:application/*/index/*"
            ]
        },
        {
            "Sid": "S3Access",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-plugin-bucket/*",
                "arn:aws:s3:::your-plugin-bucket"
            ]
        },
        {
            "Sid": "CloudWatchLogs",
            "Effect": "Allow",
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Resource": [
                "arn:aws:logs:*:*:log-group:/aws/lambda/q-custom-plugin*"
            ]
        }
    ]
}
```

### 2. Create IAM Role for the Plugin

#### Option A: For EC2/Local Development

1. **Create the IAM role:**
   ```bash
   aws iam create-role \
     --role-name QBusinessPluginRole \
     --assume-role-policy-document '{
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": {
             "Service": "ec2.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
         }
       ]
     }'
   ```

2. **Attach the policy to the role:**
   ```bash
   aws iam attach-role-policy \
     --role-name QBusinessPluginRole \
     --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/QBusinessPluginPolicy
   ```

3. **Create instance profile (for EC2):**
   ```bash
   aws iam create-instance-profile --instance-profile-name QBusinessPluginProfile
   aws iam add-role-to-instance-profile \
     --instance-profile-name QBusinessPluginProfile \
     --role-name QBusinessPluginRole
   ```

#### Option B: For AWS Lambda Deployment

1. **Create Lambda execution role:**
   ```bash
   aws iam create-role \
     --role-name QBusinessPluginLambdaRole \
     --assume-role-policy-document '{
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Principal": {
             "Service": "lambda.amazonaws.com"
           },
           "Action": "sts:AssumeRole"
         }
       ]
     }'
   ```

2. **Attach AWS managed Lambda execution policy:**
   ```bash
   aws iam attach-role-policy \
     --role-name QBusinessPluginLambdaRole \
     --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
   ```

3. **Attach your custom Q Business policy:**
   ```bash
   aws iam attach-role-policy \
     --role-name QBusinessPluginLambdaRole \
     --policy-arn arn:aws:iam::YOUR_ACCOUNT_ID:policy/QBusinessPluginPolicy
   ```

### 3. Configure AWS Credentials

#### Method 1: AWS CLI Configuration
```bash
aws configure
# Enter your Access Key ID, Secret Access Key, Region, and Output format
```

#### Method 2: Environment Variables
```bash
export AWS_ACCESS_KEY_ID=your-access-key-id
export AWS_SECRET_ACCESS_KEY=your-secret-access-key
export AWS_DEFAULT_REGION=us-east-1
```

#### Method 3: IAM Role (Recommended for Production)
```bash
# Assume the role
aws sts assume-role \
  --role-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/QBusinessPluginRole \
  --role-session-name QBusinessPluginSession
```

### 4. Amazon Q Business Application Setup

1. **Create Q Business Application:**
   ```bash
   aws qbusiness create-application \
     --display-name "Custom Plugin Application" \
     --description "Application for custom data source plugin"
   ```

2. **Create Index:**
   ```bash
   aws qbusiness create-index \
     --application-id YOUR_APPLICATION_ID \
     --display-name "Custom Data Index" \
     --description "Index for custom data source"
   ```

3. **Create Data Source:**
   ```bash
   aws qbusiness create-data-source \
     --application-id YOUR_APPLICATION_ID \
     --index-id YOUR_INDEX_ID \
     --display-name "Custom API Data Source" \
     --type CUSTOM \
     --configuration '{
       "connectionConfiguration": {
         "repositoryEndpointMetadata": {
           "BucketName": "your-plugin-bucket"
         }
       }
     }'
   ```

### 5. Minimum Required Permissions Summary

For the plugin to function, ensure your IAM user/role has these minimum permissions:

| Service | Actions | Resources |
|---------|---------|-----------|
| **Amazon Q Business** | `BatchPutDocument`, `BatchDeleteDocument`, `GetDataSource` | Application, Index, Data Source ARNs |
| **Amazon S3** | `GetObject`, `PutObject`, `ListBucket` | Plugin bucket ARN |
| **CloudWatch Logs** | `CreateLogGroup`, `PutLogEvents` | Log group ARNs |

### 6. Security Best Practices

1. **Principle of Least Privilege**: Only grant the minimum permissions required
2. **Resource-Specific ARNs**: Use specific resource ARNs instead of wildcards
3. **Temporary Credentials**: Use STS assume-role for temporary access
4. **Credential Rotation**: Regularly rotate access keys
5. **Environment Separation**: Use different roles for dev/staging/production

### 7. Troubleshooting IAM Issues

#### Common Permission Errors:

1. **Access Denied for BatchPutDocument:**
   ```
   Error: User is not authorized to perform: qbusiness:BatchPutDocument
   ```
   **Solution**: Ensure the IAM policy includes `qbusiness:BatchPutDocument` action

2. **Invalid Application ID:**
   ```
   Error: Application not found
   ```
   **Solution**: Verify the application ID in your `.env` file and ensure the role has access

3. **S3 Access Denied:**
   ```
   Error: Access Denied when accessing S3 bucket
   ```
   **Solution**: Check S3 bucket policy and ensure the IAM role has the required S3 permissions

#### Debug IAM Permissions:
```bash
# Test your current permissions
aws sts get-caller-identity

# Simulate policy evaluation
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::YOUR_ACCOUNT_ID:role/QBusinessPluginRole \
  --action-names qbusiness:BatchPutDocument \
  --resource-arns arn:aws:qbusiness:us-east-1:YOUR_ACCOUNT_ID:application/YOUR_APP_ID
```

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
AWS_PROFILE=default                    # Optional: AWS CLI profile name
AWS_ROLE_ARN=arn:aws:iam::123456789012:role/QBusinessPluginRole  # Optional: Role to assume

# Amazon Q Business Configuration
Q_BUSINESS_APPLICATION_ID=your-application-id
Q_BUSINESS_DATA_SOURCE_ID=your-data-source-id
Q_BUSINESS_INDEX_ID=your-index-id

# Data Source Configuration
DATA_SOURCE_TYPE=api
DATA_SOURCE_BASE_URL=https://api.example.com
DATA_SOURCE_API_KEY=your-api-key
DATA_SOURCE_USERNAME=your-username      # Optional: for basic auth
DATA_SOURCE_PASSWORD=your-password      # Optional: for basic auth

# Plugin Configuration
PLUGIN_NAME=custom-plugin
LOG_LEVEL=info
BATCH_SIZE=100
MAX_RETRIES=3
RETRY_DELAY=1000

# Optional S3 Configuration (for large documents)
S3_BUCKET_NAME=your-plugin-bucket
S3_PREFIX=documents/

# Security Configuration
ENCRYPT_CREDENTIALS=true               # Optional: encrypt stored credentials
```

### Configuration Validation

The plugin will validate your configuration on startup. Ensure all required fields are set:

**Required:**
- `Q_BUSINESS_APPLICATION_ID`
- `Q_BUSINESS_DATA_SOURCE_ID`
- `DATA_SOURCE_BASE_URL`

**Optional but Recommended:**
- `AWS_ROLE_ARN` (for production deployments)
- `S3_BUCKET_NAME` (for large document handling)

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

#### 1. AWS Credentials and Permissions
**Issue**: `AccessDenied` or `UnauthorizedOperation` errors
```
Error: User: arn:aws:iam::123456789012:user/username is not authorized to perform: qbusiness:BatchPutDocument
```
**Solutions**:
- Verify IAM policy includes required permissions (see IAM Setup section)
- Check if you're using the correct AWS region
- Ensure AWS credentials are properly configured
- Test permissions with AWS CLI: `aws sts get-caller-identity`

#### 2. Amazon Q Business Application Issues
**Issue**: `Application not found` or `Index not found`
```
Error: The specified application does not exist
```
**Solutions**:
- Verify application ID in `.env` file
- Ensure the application exists in the correct AWS region
- Check if your IAM role has access to the application
- Use AWS CLI to list applications: `aws qbusiness list-applications`

#### 3. Data Source Connection Issues
**Issue**: External API authentication failures
```
Error: 401 Unauthorized when connecting to data source
```
**Solutions**:
- Verify API credentials in `.env` file
- Check if API key has required permissions
- Test API connection independently
- Review API rate limits and quotas

#### 4. S3 Access Issues
**Issue**: S3 bucket access denied
```
Error: Access Denied when uploading to S3
```
**Solutions**:
- Verify S3 bucket exists and is accessible
- Check IAM policy includes S3 permissions
- Ensure bucket policy allows your IAM role
- Test S3 access: `aws s3 ls s3://your-plugin-bucket`

#### 5. Network and Connectivity
**Issue**: Timeout or connection errors
**Solutions**:
- Check VPC and security group settings
- Verify internet connectivity for external APIs
- Review firewall rules
- Test network connectivity to AWS services

### Debug Mode

Enable comprehensive debugging:

```env
LOG_LEVEL=debug
NODE_ENV=development
```

### Validation Commands

Test your setup with these commands:

```bash
# Test AWS credentials
aws sts get-caller-identity

# Test Q Business access
aws qbusiness get-application --application-id YOUR_APP_ID

# Test S3 access (if using S3)
aws s3 ls s3://your-plugin-bucket

# Test external API connection
curl -H "Authorization: Bearer YOUR_API_KEY" https://api.example.com/health
```

### Log Analysis

Check application logs for detailed error information:

```bash
# View recent logs
tail -f logs/combined.log

# Search for errors
grep -i error logs/combined.log

# View specific time range
grep "2024-01-01" logs/combined.log
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
