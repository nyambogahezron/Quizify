#!/usr/bin/env bun

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface DeployConfig {
	environment: string;
	services: string[];
	skipBuild: boolean;
	skipTests: boolean;
	tag?: string;
	rollback?: string;
}

class DeploymentManager {
	private environments = ['staging', 'production'];
	private services = ['server', 'web', 'admin'];

	async deploy(config: DeployConfig): Promise<void> {
		const { environment, services, skipBuild, skipTests, tag } = config;

		console.log(`🚀 Deploying to ${environment}...`);

		try {
			// Pre-deployment checks
			await this.preDeploymentChecks(config);

			// Run tests unless skipped
			if (!skipTests) {
				await this.runTests();
			}

			// Build applications unless skipped
			if (!skipBuild) {
				await this.buildApplications(services);
			}

			// Deploy based on environment
			if (environment === 'staging') {
				await this.deployToStaging(services, tag);
			} else if (environment === 'production') {
				await this.deployToProduction(services, tag);
			}

			// Post-deployment verification
			await this.postDeploymentVerification(environment, services);

			console.log(`✅ Deployment to ${environment} completed successfully`);
		} catch (error) {
			console.error(`❌ Deployment failed: ${error.message}`);
			process.exit(1);
		}
	}

	private async preDeploymentChecks(config: DeployConfig): Promise<void> {
		console.log('🔍 Running pre-deployment checks...');

		// Check if environment is valid
		if (!this.environments.includes(config.environment)) {
			throw new Error(`Invalid environment: ${config.environment}`);
		}

		// Check if services are valid
		for (const service of config.services) {
			if (!this.services.includes(service)) {
				throw new Error(`Invalid service: ${service}`);
			}
		}

		// Check git status
		try {
			const gitStatus = execSync('git status --porcelain', {
				encoding: 'utf-8',
			});
			if (gitStatus.trim() && config.environment === 'production') {
				throw new Error(
					'Working directory is not clean. Commit or stash changes before deploying to production.'
				);
			}
		} catch (error) {
			console.warn('⚠️  Could not check git status');
		}

		// Check if required environment files exist
		const envFile = `.env.${config.environment}`;
		if (!existsSync(envFile) && config.environment === 'production') {
			console.warn(`⚠️  Environment file ${envFile} not found`);
		}

		console.log('✅ Pre-deployment checks passed');
	}

	private async runTests(): Promise<void> {
		console.log('🧪 Running tests...');

		try {
			execSync('turbo run test', { stdio: 'inherit' });
			console.log('✅ All tests passed');
		} catch (error) {
			throw new Error('Tests failed. Deployment aborted.');
		}
	}

	private async buildApplications(services: string[]): Promise<void> {
		console.log('🔨 Building applications...');

		try {
			if (services.length > 0) {
				// Build specific services
				for (const service of services) {
					console.log(`📦 Building ${service}...`);
					execSync(`turbo run build --filter=${service}`, { stdio: 'inherit' });
				}
			} else {
				// Build all
				execSync('turbo run build', { stdio: 'inherit' });
			}
			console.log('✅ Build completed');
		} catch (error) {
			throw new Error('Build failed. Deployment aborted.');
		}
	}

	private async deployToStaging(
		services: string[],
		tag?: string
	): Promise<void> {
		console.log('🎭 Deploying to staging...');

		// Create deployment tag
		const deployTag =
			tag ||
			`staging-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`;

		try {
			// Tag the current commit
			execSync(`git tag ${deployTag}`, { stdio: 'inherit' });
			execSync(`git push origin ${deployTag}`, { stdio: 'inherit' });

			// Deploy using Docker Compose for staging
			execSync('docker-compose -f docker-compose.staging.yml down', {
				stdio: 'inherit',
			});
			execSync('docker-compose -f docker-compose.staging.yml build', {
				stdio: 'inherit',
			});
			execSync('docker-compose -f docker-compose.staging.yml up -d', {
				stdio: 'inherit',
			});

			console.log(`✅ Staging deployment completed with tag: ${deployTag}`);
		} catch (error) {
			throw new Error(`Staging deployment failed: ${error.message}`);
		}
	}

	private async deployToProduction(
		services: string[],
		tag?: string
	): Promise<void> {
		console.log('🏭 Deploying to production...');

		// Confirm production deployment
		console.log('⚠️  This will deploy to PRODUCTION. Are you sure? (y/N)');

		// In a real implementation, you'd want to add interactive confirmation
		// For now, we'll assume confirmation via environment variable
		if (process.env.CONFIRM_PRODUCTION !== 'yes') {
			throw new Error(
				'Production deployment not confirmed. Set CONFIRM_PRODUCTION=yes to proceed.'
			);
		}

		const deployTag =
			tag ||
			`production-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}`;

		try {
			// Create production tag
			execSync(`git tag ${deployTag}`, { stdio: 'inherit' });
			execSync(`git push origin ${deployTag}`, { stdio: 'inherit' });

			// Deploy to production (this would typically involve cloud providers)
			// Example for different deployment strategies:

			// Option 1: Docker-based deployment
			this.deployWithDocker(services, deployTag);

			// Option 2: Cloud platform deployment (uncomment as needed)
			// this.deployToVercel(services);
			// this.deployToAWS(services, deployTag);
			// this.deployToGCP(services, deployTag);

			console.log(`✅ Production deployment completed with tag: ${deployTag}`);
		} catch (error) {
			throw new Error(`Production deployment failed: ${error.message}`);
		}
	}

	private deployWithDocker(services: string[], tag: string): void {
		console.log('🐳 Deploying with Docker...');

		// Build and push images
		for (const service of services) {
			const imageName = `quizify-${service}:${tag}`;
			execSync(`docker build -t ${imageName} -f apps/${service}/Dockerfile .`, {
				stdio: 'inherit',
			});
			// Push to registry (replace with your registry)
			// execSync(`docker push ${imageName}`, { stdio: 'inherit' });
		}

		// Deploy with production compose file
		execSync('docker-compose -f docker-compose.production.yml down', {
			stdio: 'inherit',
		});
		execSync('docker-compose -f docker-compose.production.yml up -d', {
			stdio: 'inherit',
		});
	}

	private deployToVercel(services: string[]): void {
		console.log('▲ Deploying to Vercel...');

		for (const service of services) {
			if (['web', 'admin'].includes(service)) {
				execSync(`cd apps/${service} && vercel --prod`, { stdio: 'inherit' });
			}
		}
	}

	private async postDeploymentVerification(
		environment: string,
		services: string[]
	): Promise<void> {
		console.log('🔍 Running post-deployment verification...');

		const baseUrls = {
			staging: {
				server: 'https://api-staging.quizify.com',
				web: 'https://staging.quizify.com',
				admin: 'https://admin-staging.quizify.com',
			},
			production: {
				server: 'https://api.quizify.com',
				web: 'https://quizify.com',
				admin: 'https://admin.quizify.com',
			},
		};

		const urls = baseUrls[environment as keyof typeof baseUrls];

		for (const service of services) {
			const url = urls[service as keyof typeof urls];
			if (url) {
				try {
					console.log(`🌐 Checking ${service} at ${url}...`);

					// Health check (you might want to implement proper health endpoints)
					const healthUrl = service === 'server' ? `${url}/health` : url;
					execSync(`curl -f ${healthUrl} > /dev/null 2>&1`, {
						stdio: 'inherit',
					});

					console.log(`✅ ${service} is responding`);
				} catch (error) {
					console.warn(`⚠️  ${service} health check failed`);
				}
			}
		}

		console.log('✅ Post-deployment verification completed');
	}

	async rollback(config: {
		environment: string;
		tag?: string;
		services: string[];
	}): Promise<void> {
		const { environment, tag, services } = config;

		console.log(`⏪ Rolling back ${environment}...`);

		try {
			if (tag) {
				// Rollback to specific tag
				console.log(`🏷️  Rolling back to tag: ${tag}`);
				execSync(`git checkout ${tag}`, { stdio: 'inherit' });
			} else {
				// Rollback to previous deployment
				console.log('📚 Rolling back to previous deployment...');
				const previousTag = execSync('git describe --tags --abbrev=0 HEAD~1', {
					encoding: 'utf-8',
				}).trim();
				execSync(`git checkout ${previousTag}`, { stdio: 'inherit' });
			}

			// Rebuild and redeploy
			await this.buildApplications(services);

			if (environment === 'staging') {
				await this.deployToStaging(services);
			} else {
				await this.deployToProduction(services);
			}

			console.log('✅ Rollback completed');
		} catch (error) {
			console.error(`❌ Rollback failed: ${error.message}`);
			process.exit(1);
		}
	}

	async createDeploymentConfigs(): Promise<void> {
		console.log('📝 Creating deployment configuration files...');

		// Staging docker-compose
		const stagingCompose = `version: '3.8'

services:
  db:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${DB_USER}
      MONGO_INITDB_ROOT_PASSWORD: \${DB_PASSWORD}
      MONGO_INITDB_DATABASE: quizify_staging
    volumes:
      - mongo_staging_data:/data/db
    networks:
      - quizify-staging

  server:
    image: quizify-server:staging
    environment:
      NODE_ENV: staging
      DB_HOST: db
      DB_NAME: quizify_staging
    ports:
      - "5001:5000"
    depends_on:
      - db
    networks:
      - quizify-staging

  web:
    image: quizify-web:staging
    environment:
      NODE_ENV: staging
      VITE_API_URL: https://api-staging.quizify.com
    ports:
      - "3001:3000"
    depends_on:
      - server
    networks:
      - quizify-staging

volumes:
  mongo_staging_data:

networks:
  quizify-staging:
    driver: bridge
`;

		// Production docker-compose
		const productionCompose = `version: '3.8'

services:
  db:
    image: mongo:7
    environment:
      MONGO_INITDB_ROOT_USERNAME: \${DB_USER}
      MONGO_INITDB_ROOT_PASSWORD: \${DB_PASSWORD}
      MONGO_INITDB_DATABASE: quizify
    volumes:
      - mongo_prod_data:/data/db
    networks:
      - quizify-prod
    restart: unless-stopped

  server:
    image: quizify-server:production
    environment:
      NODE_ENV: production
      DB_HOST: db
      DB_NAME: quizify
    ports:
      - "5000:5000"
    depends_on:
      - db
    networks:
      - quizify-prod
    restart: unless-stopped

  web:
    image: quizify-web:production
    environment:
      NODE_ENV: production
      VITE_API_URL: https://api.quizify.com
    ports:
      - "3000:3000"
    depends_on:
      - server
    networks:
      - quizify-prod
    restart: unless-stopped

volumes:
  mongo_prod_data:

networks:
  quizify-prod:
    driver: bridge
`;

		writeFileSync('docker-compose.staging.yml', stagingCompose);
		writeFileSync('docker-compose.production.yml', productionCompose);

		console.log('✅ Deployment configuration files created');
	}
}

async function main() {
	const args = process.argv.slice(2);
	const command = args[0];

	if (!command || args.includes('--help') || args.includes('-h')) {
		console.log(`
🚀 Deployment Manager for Quizify

Usage: bun run scripts/deploy.ts <command> [options]

Commands:
  deploy              Deploy to environment
  rollback            Rollback deployment
  init                Create deployment configuration files

Options:
  --env <env>         Target environment (staging|production)
  --services <svcs>   Services to deploy (comma-separated)
  --skip-build        Skip build step
  --skip-tests        Skip test step
  --tag <tag>         Deployment tag
  --rollback-to <tag> Rollback to specific tag

Examples:
  bun run scripts/deploy.ts deploy --env staging
  bun run scripts/deploy.ts deploy --env production --services server,web
  bun run scripts/deploy.ts rollback --env staging --rollback-to staging-2024-01-15
  bun run scripts/deploy.ts init
`);
		return;
	}

	const deploymentManager = new DeploymentManager();

	// Parse options
	const envIndex = args.indexOf('--env');
	const environment = envIndex !== -1 ? args[envIndex + 1] : 'staging';

	const servicesIndex = args.indexOf('--services');
	const services =
		servicesIndex !== -1 ? args[servicesIndex + 1]?.split(',') || [] : [];

	const tagIndex = args.indexOf('--tag');
	const tag = tagIndex !== -1 ? args[tagIndex + 1] : undefined;

	const rollbackToIndex = args.indexOf('--rollback-to');
	const rollbackTo =
		rollbackToIndex !== -1 ? args[rollbackToIndex + 1] : undefined;

	const skipBuild = args.includes('--skip-build');
	const skipTests = args.includes('--skip-tests');

	try {
		switch (command) {
			case 'deploy':
				await deploymentManager.deploy({
					environment,
					services,
					skipBuild,
					skipTests,
					tag,
				});
				break;
			case 'rollback':
				await deploymentManager.rollback({
					environment,
					tag: rollbackTo,
					services,
				});
				break;
			case 'init':
				await deploymentManager.createDeploymentConfigs();
				break;
			default:
				console.error(`❌ Unknown command: ${command}`);
				process.exit(1);
		}
	} catch (error) {
		console.error(`❌ Error: ${error.message}`);
		process.exit(1);
	}
}

main();
