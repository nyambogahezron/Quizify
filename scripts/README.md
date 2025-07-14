# Quizify Automation Scripts

This directory contains automation scripts to streamline development, deployment, and maintenance tasks for the Quizify project.

## Available Scripts

### 1. Package Generator (`create-package/`)

Create new packages in the monorepo with proper structure and configuration.

```bash
# Create a React component package
bun run create-package ui-components --react --description "Shared UI components"

# Create a utility package
bun run create-package date-utils --utility --deps "date-fns"
```

### 2. Database Management (`database/`)

Manage database operations including backup, restore, and seeding.

```bash
# Backup database
bun run db backup

# Restore from backup
bun run db restore ./backups/db-backup-2024-01-15T10-30-00-000Z

# Seed database with initial data
bun run db seed

# Reset database (drop + seed)
bun run db reset
```

### 3. Docker Management (`docker/`)

Streamline Docker operations for development and deployment.

```bash
# Start all services
bun run docker start --rebuild

# Start specific services
bun run docker start server db --env production

# View logs
bun run docker logs web --follow

# Open shell in service
bun run docker shell server

# Cleanup Docker resources
bun run docker cleanup
```

### 4. Test Runner (`test/`)

Comprehensive testing automation across all apps and packages.

```bash
# Run all tests with coverage
bun run test run --coverage

# Run tests for specific apps in watch mode
bun run test run --apps server,web --watch

# Generate test reports
bun run test reports

# Setup test configuration
bun run test setup
```

### 5. Deployment Manager (`deploy/`)

Automate deployments to different environments.

```bash
# Deploy to staging
bun run deploy deploy --env staging

# Deploy specific services to production
bun run deploy deploy --env production --services server,web

# Rollback deployment
bun run deploy rollback --env staging --rollback-to staging-2024-01-15

# Create deployment configs
bun run deploy init
```

### 6. Maintenance Manager (`maintenance/`)

Automated maintenance tasks for system health and performance.

```bash
# Clean build artifacts and temporary files
bun run maintenance cleanup --clean-modules --clean-docker

# Run comprehensive health checks
bun run maintenance health --check-services

# Create full backup
bun run maintenance backup --backup-database --backup-uploads

# Update dependencies and tools
bun run maintenance update

# Security audit
bun run maintenance security

# Performance analysis
bun run maintenance performance

# Schedule automated cleanup (runs every Sunday at 2 AM)
bun run maintenance cleanup --schedule "0 2 * * 0"
```

### 7. Environment Manager (`environment/`)

Manage environment configurations across different deployment stages.

```bash
# Setup development environment
bun run env setup development

# Switch to staging environment
bun run env switch staging

# Validate production environment
bun run env validate production
```

## Script Features

### 🔧 Comprehensive Automation

- **Database Operations**: Backup, restore, seed, and reset operations
- **Docker Management**: Container lifecycle, logs, and cleanup
- **Testing**: Cross-platform test execution with coverage
- **Deployment**: Multi-environment deployment with rollback
- **Maintenance**: System health, updates, and performance monitoring
- **Environment**: Configuration management for different stages

### 🚀 Developer Experience

- **Interactive CLI**: Help commands and clear usage instructions
- **Error Handling**: Robust error handling with informative messages
- **Progress Indicators**: Visual feedback for long-running operations
- **Flexible Options**: Extensive customization through command-line flags

### 📊 Monitoring & Reporting

- **Health Reports**: Comprehensive system health analysis
- **Performance Reports**: Bundle size analysis and optimization suggestions
- **Security Reports**: Vulnerability scanning and security recommendations
- **Test Reports**: Coverage reports and test result summaries

### 🔄 CI/CD Integration

- **Automated Testing**: Pre-deployment test execution
- **Build Verification**: Automated build checks before deployment
- **Environment Validation**: Configuration validation across environments
- **Rollback Capabilities**: Quick rollback to previous stable versions

## Integration with Turbo

All scripts are designed to work seamlessly with Turborepo:

- Use `turbo run` for parallel execution across workspaces
- Respect workspace boundaries and dependencies
- Leverage Turbo's caching for improved performance
- Support filtered execution for specific apps/packages

## Scheduling Automation

Many scripts support scheduling through cron jobs:

```bash
# Schedule daily backups
bun run maintenance backup --schedule "0 1 * * *"

# Schedule weekly cleanup
bun run maintenance cleanup --schedule "0 2 * * 0"

# Schedule security audits
bun run maintenance security --schedule "0 3 * * 1"
```

## Best Practices

1. **Environment Separation**: Always validate environment configurations before deployment
2. **Backup Strategy**: Regular automated backups with retention policies
3. **Testing**: Run comprehensive tests before any deployment
4. **Monitoring**: Regular health checks and performance analysis
5. **Security**: Automated security audits and vulnerability scanning
6. **Documentation**: Keep environment configurations documented and version controlled

## Contributing

When adding new scripts:

1. Follow the established pattern of using TypeScript
2. Include comprehensive help documentation
3. Add error handling and validation
4. Update this README with usage examples
5. Add the script to the main package.json scripts section

## Troubleshooting

Common issues and solutions:

- **Permission Errors**: Ensure scripts have execute permissions (`chmod +x`)
- **Docker Issues**: Verify Docker is running and accessible
- **Database Connectivity**: Check MongoDB connection and credentials
- **Environment Variables**: Validate all required env vars are set
- **Path Issues**: Use absolute paths when referencing files/directories
